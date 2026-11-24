import base64
import binascii
from functools import lru_cache

from flask import Flask, jsonify, request


MAX_REQUEST_BYTES = 8 * 1024 * 1024


def decode_image(encoded_image):
    if not isinstance(encoded_image, str) or not encoded_image:
        raise ValueError("Image data must be a non-empty base64 string.")

    try:
        image_bytes = base64.b64decode(encoded_image, validate=True)
    except (binascii.Error, ValueError) as error:
        raise ValueError("Image data must be valid base64.") from error

    if not image_bytes:
        raise ValueError("Image data must not be empty.")

    return image_bytes


@lru_cache(maxsize=1)
def get_predictor():
    from doctr.models import ocr_predictor

    return ocr_predictor(
        pretrained=True,
        det_arch="db_mobilenet_v3_large",
        reco_arch="crnn_mobilenet_v3_small",
        assume_straight_pages=False,
        disable_crop_orientation=False,
        disable_page_orientation=False,
        straighten_pages=True,
        detect_orientation=True,
    )


def process_image(image_bytes):
    from doctr.io import DocumentFile

    result = get_predictor()(DocumentFile.from_images(image_bytes))
    words = []
    for page in result.pages:
        for block in page.blocks:
            for line in block.lines:
                words.extend(
                    word.value for word in line.words if word.confidence > 0.7
                )
    return " ".join(words)


def create_app(image_processor=None):
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = MAX_REQUEST_BYTES
    processor = image_processor or process_image

    @app.errorhandler(413)
    def request_too_large(_error):
        return jsonify({"error": "Request body is too large."}), 413

    @app.route("/v3/verification/cpr", methods=["POST"])
    def receive_data():
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json."}), 415

        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"error": "Request body must be a JSON object."}), 400

        try:
            image_bytes = decode_image(data.get("base64"))
        except ValueError as error:
            return jsonify({"error": str(error)}), 400

        try:
            return jsonify({"text": processor(image_bytes)}), 200
        except Exception:
            app.logger.exception("OCR processing failed")
            return jsonify({"error": "Image processing failed."}), 500

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8018)
