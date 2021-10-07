import React from "react";
import { auth } from "../firebase";
import Firebase from "firebase/app";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";

export default function PopupSignIn() {
  const history = useHistory();
  const { setCurrentUser } = useAuth();

  const handleGoogleLogin = (event) => {
    event.preventDefault();
    var provider = new Firebase.auth.GoogleAuthProvider();

    auth
      .signInWithPopup(provider)
      .then(function (result) {
        setCurrentUser(result);

        history.push("/studentDash");
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <div className="container">
      <div className="vertical-center text-center">
        <Button
          className="w-50 mt-3 mx-auto rounded-pill p-2"
          onClick={handleGoogleLogin}
        >
          Sign In with Google
        </Button>
      </div>
    </div>
  );
}
