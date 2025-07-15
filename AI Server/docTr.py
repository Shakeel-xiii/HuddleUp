from doctr.models import ocr_predictor
from flask import Flask, request, jsonify
import base64
# image = cv2.imread("CCPR.jpg")
# rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
# results = pytesseract.image_to_osd(rgb, output_type=Output.DICT)
# model = ocr_predictor(pretrained=True,
#     det_arch="fast_base",
#     reco_arch="parseq",
#     assume_straight_pages=False,
#     detect_orientation=True,
#     disable_crop_orientation=True,
#     disable_page_orientation=True,
#     straighten_pages=False)

from doctr.io import DocumentFile
from doctr.utils.geometry import rotate_image

# result = model(single_img_doc)

# json_export = result.export()
# print(f"Detected orientation: {results["orientation"]} degrees")
# doc = [rotate_image(image, results["orientation"], expand=False)]
predictor = ocr_predictor(
    pretrained=True,
    det_arch="db_mobilenet_v3_large",
    reco_arch="crnn_mobilenet_v3_small",
    assume_straight_pages=False,
    disable_crop_orientation=False,
    disable_page_orientation=False,
    straighten_pages=True,
    detect_orientation=True,
)  # .cuda().half() uncomment this line if we run on GPU


def process_image(image_data):
    image_bytes = base64.b64decode(image_data)
    doc = DocumentFile.from_images(image_bytes)
    result = predictor(doc)
    return_data = ""
    for page in result.pages:
            for block in page.blocks:
                for line in reversed(block.lines):
                    for word in reversed(line.words):
                        if word.confidence > 0.7:
                            return_data += word.value + " "
    return return_data
    
    
# Example usage
app = Flask(__name__)

@app.route('/v3/verification/cpr', methods=['POST'])
def receive_data():
    if request.is_json:
        data = request.get_json()
        if 'base64' not in data or not data['base64']:
            return jsonify({"error": "No base64 image data provided"}), 400
        try:
            result = process_image(data['base64'])
        except Exception as e:
            print(e)
            return jsonify({"error": "Make Sure Base64 is Correct!"}), 500
        return jsonify({"text":result}), 200
    else:
        raw_data = request.data.decode('utf-8')
        return jsonify({"received_raw": raw_data}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8018)