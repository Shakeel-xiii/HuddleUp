import base64
import unittest

from docTr import create_app, decode_image


class CprVerificationApiTests(unittest.TestCase):
    def setUp(self):
        self.processed_images = []

        def fake_processor(image_bytes):
            self.processed_images.append(image_bytes)
            return "recognized text"

        self.app = create_app(image_processor=fake_processor)
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

    def test_decodes_valid_base64_image(self):
        self.assertEqual(decode_image(base64.b64encode(b"image").decode()), b"image")

    def test_rejects_malformed_base64(self):
        with self.assertRaises(ValueError):
            decode_image("not base64!")

    def test_rejects_non_json_request(self):
        response = self.client.post(
            "/v3/verification/cpr",
            data="base64=abc",
            content_type="application/x-www-form-urlencoded",
        )

        self.assertEqual(response.status_code, 415)
        self.assertIn("application/json", response.get_json()["error"])

    def test_rejects_malformed_json(self):
        response = self.client.post(
            "/v3/verification/cpr",
            data="{",
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json(),
            {"error": "Request body must be a JSON object."},
        )

    def test_rejects_missing_or_invalid_image_data(self):
        for body in ({}, {"base64": ""}, {"base64": "not base64!"}):
            with self.subTest(body=body):
                response = self.client.post(
                    "/v3/verification/cpr",
                    json=body,
                )
                self.assertEqual(response.status_code, 400)

        self.assertEqual(self.processed_images, [])

    def test_returns_ocr_text_for_valid_image(self):
        response = self.client.post(
            "/v3/verification/cpr",
            json={"base64": base64.b64encode(b"image").decode()},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"text": "recognized text"})
        self.assertEqual(self.processed_images, [b"image"])

    def test_returns_json_error_when_processor_fails(self):
        def failing_processor(_image_bytes):
            raise RuntimeError("model unavailable")

        app = create_app(image_processor=failing_processor)
        app.config["TESTING"] = True
        with self.assertLogs(app.name, level="ERROR"):
            response = app.test_client().post(
                "/v3/verification/cpr",
                json={"base64": base64.b64encode(b"image").decode()},
            )

        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.get_json(), {"error": "Image processing failed."})

    def test_rejects_oversized_request(self):
        self.app.config["MAX_CONTENT_LENGTH"] = 64

        response = self.client.post(
            "/v3/verification/cpr",
            json={"base64": base64.b64encode(b"x" * 100).decode()},
        )

        self.assertEqual(response.status_code, 413)
        self.assertEqual(response.get_json(), {"error": "Request body is too large."})


if __name__ == "__main__":
    unittest.main()
