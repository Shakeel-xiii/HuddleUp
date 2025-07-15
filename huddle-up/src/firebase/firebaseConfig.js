import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBa_f4I421RKqatJd2F2lF8CVPneZzc7io",
  authDomain: "huddleup-533e3.firebaseapp.com",
  projectId: "huddleup-533e3",
  storageBucket: "huddleup-533e3.firebasestorage.app",
  messagingSenderId: "636114580489",
  appId: "1:636114580489:android:622638c1b539fe492cb4d8",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export { db, firebaseApp };
