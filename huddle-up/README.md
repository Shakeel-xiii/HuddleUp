# HuddleUp mobile app

This directory contains the Expo / React Native Android-first application. It uses Firebase Authentication, Cloud Firestore, and Cloud Storage; a separate Flask service provides CPR image OCR.

## Requirements

- Node.js 20 or newer
- npm
- Android Studio and an Android SDK for a local development build
- A Firebase project configured for the app

React Native Firebase requires native modules, so use a development build rather than Expo Go.

## Setup

1. Configure the Firebase project in `src/firebase/firebaseConfig.js`.
2. Add the matching `google-services.json` at `src/firebase/google-services.json`.
3. Deploy `storage.rules` to Firebase Storage.
4. Install dependencies and run the Android app:

```sh
npm install
npm run android
```

For an existing development build, start the Metro server with `npm start`.

The app's image uploads use Firebase Storage. CPR images are stored as private object paths and fetched only by the owner or an administrator. Review and deploy the Storage rules before using personal data. See the [repository README](../README.md) for OCR service setup, tests, security notes, and known limitations.
