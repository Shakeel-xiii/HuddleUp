# HuddleUp

HuddleUp helps people in Bahrain find others to join them for sports and outdoor activities. Users can discover events, organize their own, manage participation, and connect with friends. The Android-first mobile app uses Firebase for sign-in, event data, and image storage. A separate Flask service reads text from CPR images during registration.

## Run the mobile app

You will need Node.js 20.10 or later, npm, Android Studio, and an Android SDK. Because the app uses native Firebase modules, it needs an Android development build rather than Expo Go.

From the repository root, install the app dependencies and launch the Android build:

```sh
cd huddle-up
npm install
npm run android
```

If you already have a development build installed, run `npm start` in `huddle-up` to start Metro.

Before launching the app, configure your Firebase project in `huddle-up/src/firebase/firebaseConfig.js` and add its matching `google-services.json` to `huddle-up/src/firebase/`. The image features also need the rules in `huddle-up/storage.rules` to be published in Firebase Storage. CPR images are saved as private object paths and are retrieved only by their owner or an administrator.

## Run the OCR service

The OCR service is in `AI Server`. It uses Python, Flask, and docTR; installing the Python requirements and downloading the pretrained model can take some time. From the repository root, create a virtual environment and install the dependencies:

```sh
cd "AI Server"
python -m venv .venv
```

On Windows, activate it with `.venv\Scripts\activate`; on macOS or Linux, use `source .venv/bin/activate`. Then install the requirements and start the service:

```sh
python -m pip install -r requirements.txt
python docTr.py
```

The service listens on port `8018` and accepts a JSON request at `/v3/verification/cpr` with a `base64` field containing the image. A successful response contains the recognized text in a `text` field. The model loads when the first valid image is processed.

The registration screen currently sends verification requests to `https://assets.almasood.org/v3/verification/cpr`. If you deploy the OCR service elsewhere, update that URL in `huddle-up/src/screens/RegisterScreen.js`.

You can also build and run the included Docker image from the repository root:

```sh
docker build -t huddleup-ocr -f "AI Server/dockerfile" "AI Server"
docker run --rm -p 8018:8018 huddleup-ocr
```

## Run the tests

The mobile helper tests use Node's built-in test runner and need Node.js 22.7 or later:

```sh
cd huddle-up
npm test
```

The OCR API tests use Flask's test client and do not load the OCR model:

```sh
cd "AI Server"
python -m unittest discover -s . -p "test_*.py"
```

The mobile tests cover name, password, WhatsApp-link, and name-formatting helpers. The OCR tests cover request validation, base64 decoding, response contents, processing errors, and oversized requests.
