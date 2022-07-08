import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Card } from "react-bootstrap";
import { db } from "../firebase";
import "bootstrap/dist/css/bootstrap.css";
import { useAuth } from "../contexts/AuthContext";

localStorage.setItem("type", "Student");

export default function StartQuiz() {
  const history = useHistory();

  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(false);

  // http://localhost:3000/startQuiz/?token=cb1a956c-3934-435a-8ab5-3ebd8dd0791b

  useEffect(() => {
    async function getData() {
      var token, quizID, studentEmail, quizStartTime, quizEndTime;
      setLoading(true);

      token = window.location.search.split("=")[1];

      if (token === "") {
        alert("You are not authorized to acces this page");
        return;
      }

      var isToken = true;
      await db
        .collection("tokens")
        .doc(token)
        .get()
        .then((snapshot) => {
          if (!snapshot.exists) {
            isToken = false;
            alert("Invalid token");
            history.push("/login");
            return;
          } else {
            // console.log(snapshot.data());
            studentEmail = snapshot.data().studentEmail;
            quizID = snapshot.data().quizUUID;
          }
        });

      if (!isToken) {
        return;
      }
      await db
        .collection("quizInfo")
        .doc(quizID)
        .get()
        .then((snapshot) => {
          if (snapshot.exists) {
            quizStartTime = snapshot.data().quizTimeStart;
            quizEndTime = snapshot.data().quizTimeEnd;
          } else {
            alert("Expired Token");
            history.push("/login");
            return;
          }
        });

      if (currentUser.email !== studentEmail) {
        alert("You can only access this quiz with your own link!");
        history.push("/login");
        return;
      } else {
        setLoading(false);
        let time = new Date();
        let quizTimeStart = new Date(quizStartTime);
        let quizTimeEnd = new Date(quizEndTime);

        if (quizTimeEnd < time) {
          alert("The quiz lasted till " + quizEndTime + " and you missed it!");
          history.push("/login");
          return;
        } else if (
          quizTimeStart > time &&
          (quizTimeStart.getTime() - time.getTime()) / 1000 > 300
        ) {
          alert(
            "The quiz hasn't started yet, come back at the specified time!"
          );
          history.push("/login");
          return;
        } else {
          history.push("/studentDash");
          return;
        }
      }
    }
    if (currentUser === null) {
      alert("You are not logged in, login and visit this link again");
      history.push("/login");
      return;
    }

    if (currentUser) getData();
  }, [currentUser, history]);

  return (
    <div className=" p-3  text-center">
      <div hidden style={{ display: 'none' }}>{loading}</div>
      <div className="row mb-2">
        <div className="col-8">
          <Card className="my-3 lft-border">
            <Card.Header>Loading your quiz, please wait...</Card.Header>
          </Card>
        </div>
      </div>
    </div>
  );
}

