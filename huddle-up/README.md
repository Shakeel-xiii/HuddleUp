# HuddleUp mobile app

This folder contains the Android-first Expo and React Native app. It uses Firebase Authentication, Cloud Firestore, and Cloud Storage. Firebase's native modules require a development build, so Expo Go is not supported.

To run the app locally, install Node.js 20.10 or later, npm, Android Studio, and the Android SDK. Set up a Firebase project, update `src/firebase/firebaseConfig.js`, and place its `google-services.json` file in `src/firebase/`. Publish the rules in `storage.rules` to Firebase Storage so image uploads have the intended access controls.

From this folder, install the dependencies and build the Android app:

```sh
npm install
npm run android
```

When a development build is already installed, `npm start` starts Metro without rebuilding the app. Run `npm test` to check the mobile form helpers; that command uses Node's built-in test runner and needs Node.js 22.7 or later.

The CPR verification endpoint is configured in `src/screens/RegisterScreen.js`. The OCR service setup and its tests are described in the [repository README](../README.md).
