import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const app = firebase.initializeApp({
  apiKey: "AIzaSyDs6tyOFInCjMaDWuSrtZeLiyZe7nTNyZ4",
  authDomain: "semv-3ba00.firebaseapp.com",
  databaseURL: "https://semv-3ba00-default-rtdb.firebaseio.com",
  projectId: "semv-3ba00",
  storageBucket: "semv-3ba00.appspot.com",
  messagingSenderId: "764651983056",
  appId: "1:764651983056:web:5a1010393f29e17e788ed5",
  measurementId: "G-SXX6Z94MN0",
});

export const auth = app.auth();

export const db = app.firestore();
export default app;
