import React from "react";
import { auth } from "../firebase";
import Firebase from "firebase/app";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function PopupSignIn({ setError, loading }) {
  const history = useHistory();

  const handleGoogleLogin = (event) => {
    event.preventDefault();
    var provider = new Firebase.auth.GoogleAuthProvider();

    auth
      .signInWithPopup(provider)
      .then(function (result) {
        if (result.additionalUserInfo.profile.hd === "iiita.ac.in") {
          history.push("/studentDash");
        } else {
          setError("Use Instute ID");
        }
      })
      .catch((error) => {
        console.log(error);
        setError(error.message);
      });
  };
  return (
    <Button
      className="   rounded  btn-block "
      disabled={loading}
      style={{ backgroundColor: "#F1732B" }}
      onClick={handleGoogleLogin}
    >
      <FontAwesomeIcon icon={["fab", "google"]} />
    </Button>
  );
}
