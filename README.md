# HuddleUp

HuddleUp is an Android-first community app for discovering and organizing sports and outdoor events in Bahrain. Members can create public or friends-only events, manage participation, connect with friends, and build a profile around their favorite activities. An OCR service supports CPR-document verification during registration.

## What it includes

- Event discovery, details, capacity, and participation
- Event creation with sport, location, date, age, gender, privacy, and image fields
- User profiles, friend requests, and activity preferences
- Firebase Authentication, Cloud Firestore, and Cloud Storage integration
- A Flask + docTR OCR endpoint for CPR image text extraction

## Architecture

```text
huddle-up/                 Expo / React Native mobile application
  src/firebase/             Firebase initialization and Firestore operations
  src/screens/              Screens and navigation
  src/storage/usage.js      Image upload helpers backed by Firebase Storage
  storage.rules             Firebase Storage access rules
AI Server/                  Flask OCR service
  docTr.py                  API and lazy-loaded docTR model
  test_docTr.py             OCR API tests
```

The mobile app reads and writes Firebase data directly; the OCR service is a separate HTTP service. Configure and deploy Firebase security rules before using real accounts or personal data.

## Run the mobile app

Requirements: Node.js 20.10+ and npm. Use Node.js 22.7+ for the built-in Node test runner. The app uses native Firebase modules and should be run with an Android development build; Expo Go does not include those native modules.

```sh
cd huddle-up
npm install
npm run android
```

Alternatively, start Metro for an already-installed development build:

```sh
npm start
```

Configure the Firebase project in `huddle-up/src/firebase/firebaseConfig.js` and provide its matching `google-services.json` at `huddle-up/src/firebase/google-services.json`. The Firebase web API key in the client config is not a server secret; authorization must come from correctly configured Firebase Authentication, Firestore, and Storage rules.

Deploy `huddle-up/storage.rules` to Firebase Storage before using image features. CPR uploads are stored without a public download URL; the owner and an account whose Firestore `Role` is `admin` can read them. Existing CPR images previously uploaded to the old object-storage service need to be migrated or removed separately.

The registration screen currently calls the existing OCR endpoint at `https://assets.almasood.org/v3/verification/cpr`. Change that URL in `RegisterScreen.js` when deploying the OCR service elsewhere.

## Run the OCR service

Python 3.10+ is recommended. PyTorch/docTR can download large dependencies and pretrained model weights on first startup/request.

```sh
cd "AI Server"
python -m venv .venv
```

Activate the virtual environment (`.venv\Scripts\activate` on Windows or `source .venv/bin/activate` on macOS/Linux), then:

```sh
python -m pip install -r requirements.txt
python docTr.py
```

The service listens on port `8018`. It accepts a JSON request containing a base64-encoded image:

```json
{
  "base64": "<base64-encoded-image>"
}
```

The response shape is `{"text":"..."}`. Invalid content types, malformed JSON/base64, and oversized requests receive client errors; OCR failures return a generic server error. The model loads on the first valid OCR request rather than when the Flask module is imported.

For production, serve the Flask app with a production WSGI server (the included Docker image uses Gunicorn) and terminate TLS at a trusted reverse proxy. Restrict access to the OCR endpoint, set suitable request/time limits, and avoid logging or retaining CPR images or extracted personal information.

Build and run the included container from the repository root:

```sh
docker build -t huddleup-ocr -f "AI Server/dockerfile" "AI Server"
docker run --rm -p 8018:8018 huddleup-ocr
```

## Tests

Run the mobile form-helper tests:

```sh
cd huddle-up
npm test
```

Run the OCR API tests without loading the OCR model:

```sh
cd "AI Server"
python -m unittest discover -s . -p "test_*.py"
```

The mobile tests cover name, password, WhatsApp-link, and name-formatting helpers. The OCR tests cover request validation, base64 decoding, successful response shape, processor failures, and oversized requests. They use Flask's test client and a fake OCR processor, so model weights are not needed to run them.

## Before showcasing publicly

- **Rotate the object-storage credentials that were previously embedded in the mobile client.** The current source no longer uses direct object-storage credentials; image uploads now use Firebase Storage. Removing a credential from the latest source does not remove it from Git history.
- Review Firestore rules and Firebase Storage rules against the app's authorization model, then deploy them. Do not rely on client-side role checks as authorization.
- Keep CPR documents private, migrate/delete legacy publicly addressable copies, and obtain consent before processing identity documents.
- Replace the development OCR URL with your own secured deployment, and configure monitoring, rate limits, and resource limits.
- Remove any real user data, account credentials, or personally identifying images from demo assets and screenshots.

## Current limitations and next improvements

- The interface is Android-first; iOS behavior and accessibility need device-level verification.
- Firestore event participation updates should be moved into transactions or trusted server logic to prevent capacity/count races under concurrent requests.
- Add automated mobile component/flow tests and Firebase Emulator tests for Firestore and Storage rules.
- Consider pagination and batched participant/profile reads as event and user counts grow.

See [`huddle-up/README.md`](huddle-up/README.md) for the application-specific notes.
