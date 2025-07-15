import { firebaseApp } from "./firebaseConfig";
// import firebase from "firebase/app";
import * as auth from "firebase/auth";
export async function createUser(email, password) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(
      auth.getAuth(firebaseApp),
      email,
      password
    );
    const user = userCredential.user;
    console.log("User created:", user);
    return user.uid;
  } catch (error) {
    // console.error("Error creating user:", error);
    //  Create a regex test to chech whether the error includes "auth/email-already-in-use" or not
    if (error.code === "auth/email-already-in-use") {
      return "emailexist";
    }
    throw error;
  }
}
//  Create a function that signIn the user
export async function signIn(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(
      auth.getAuth(firebaseApp),
      email,
      password
    );
    const user = userCredential.user;
    console.log("User signed in:", user.uid);
    return user.uid;
  } catch (error) {
    return null;
  }
}
