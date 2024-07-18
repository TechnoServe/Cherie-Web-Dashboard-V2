// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore"
import { getAuth, GithubAuthProvider, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANSpbpwv3LzMxoQlGTFZJLVAlRyd8Gglg",
  authDomain: "cherie-323217.firebaseapp.com",
  databaseURL: "https://cherie-323217-default-rtdb.firebaseio.com",
  projectId: "cherie-323217",
  storageBucket: "cherie-323217.appspot.com",
  messagingSenderId: "610396315391",
  appId: "1:610396315391:web:c0d5817870d9806a4c76ca",
  measurementId: "G-QBVTN1NZ2N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app)
export const provider = new GoogleAuthProvider()