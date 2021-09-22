import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";

const app = firebase.initializeApp({
  apiKey: "AIzaSyC8Bk_srQF6-cpdews7_OPhE9lIYmjMqvY",
  authDomain: "project5-e2264.firebaseapp.com",
  databaseURL: "https://project5-e2264-default-rtdb.firebaseio.com",
  projectId: "project5-e2264",
  storageBucket: "project5-e2264.appspot.com",
  messagingSenderId: "424059128465",
  appId: "1:424059128465:web:595fad9553ae37b3854d30",
  measurementId: "G-R5ERT7WVB0",
});

export const auth = app.auth();
export const db = app.database();
export const store = app.firestore();
export default app;
