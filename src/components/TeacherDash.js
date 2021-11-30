import React, { useState, useEffect } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { db } from "../firebase";
import Loader from "./Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function TeacherDash() {
  const { currentUser, logout } = useAuth();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [quizzesNow, setQuizzesNow] = useState([]);
  const [quizzesDone, setQuizzesDone] = useState([]);
  const [notif, setNotif] = useState({
    faculty: currentUser && currentUser.email,
    content: "",
    time: "",
    isRead: false,
  });
  const history = useHistory();

  useEffect(() => {
    async function getData() {
      setLoading(true);

      let time = new Date();
      await db
        .collection("quizInfo")
        .get()
        .then((snapshot) => {
          let Done = [];
          let Now = [];
          snapshot.docs.forEach((doc) => {
            let time2ed = new Date(doc.data().quizTimeEnd);

            if (time2ed.getTime() < time.getTime()) {
              Done.push(doc.data());
            } else {
              Now.push(doc.data());
            }
          });
          setQuizzesDone(Done);
          setQuizzesNow(Now);
        })
        .catch((err) => {
          setError(err.message);
        });
      setLoading(false);
    }
    const type = localStorage.getItem("type");
    if (type !== "Teacher") {
      alert("Access Denied");
      history.push("/login");
    } else {
      if (currentUser) getData();
    }
  }, [currentUser]);

  function handleSubmit(type, item) {
    if (type === "Edit") {
      localStorage.setItem("quizInfo", JSON.stringify(item));
      history.push("/create-quiz");
    } else if (type === "create") {
      localStorage.setItem(
        "quizInfo",
        JSON.stringify({
          quizUUID: "",
          quizName: "",
          instructorName: "",
          instructorEmail: "",
          quizInstructions: "",
          quizTimeStart: "",
          quizTimeEnd: "",
          quizLetReview: false,
          quizWeightage: "",
          quizTaEmailList: [],
          quizStudentEmailList: [],
        })
      );
      history.push("/create-quiz-form");
    } else {
      history.push("/");
    }
  }

  async function handleLogout() {
    setError("");

    try {
      await logout();
      history.push("/");
    } catch {
      setError("Failed to log out");
    }
  }

  async function sendNotif() {
    setLoading(true);
    await db
      .collection("Student")
      .get()
      .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          setNotif((prev) => {
            return {
              ...prev,
              faculty: currentUser && currentUser.email,
            };
          });
          db.collection("Student").doc(doc.id).collection("Notifs").add(notif);
        });
      });

    setNotif({
      faculty: currentUser && currentUser.email,
      content: "",
      time: "",
      isRead: false,
    });
    setLoading(false);
  }

  if (loading || !currentUser) {
    return <Loader />;
  }
  return (
    <div className=" p-3  text-center">
      <p> {error && <Alert variant="danger">{error}</Alert>}</p>
      <div className="row mb-2  ">
        <div className=" p-2 col-2 rgt-border">
          <Button variant="outline-danger" onClick={handleLogout}>
            <FontAwesomeIcon icon={["fas", "sign-out-alt"]} size="lg" />
          </Button>
        </div>
        <div className="  col-6 fss rgt-border " style={{ color: "#F1732B" }}>
          <strong>Teacher Dashboard</strong>
        </div>
        <div className=" p-1 pl-4 col-4 text-left">
          <strong>Email:</strong> {currentUser.email}
          <br />
          <strong>Name:</strong> {currentUser.displayName}
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-4 ">
          <button
            className="btn btn-primary my-3 btn-block py-3"
            onClick={() => handleSubmit("create", {})}
          >
            CREATE NEW QUIZ
          </button>

          <div className="lft-border">
            <h4>Notification Panel : </h4>
            <textarea
              row="15"
              col="20"
              className=" form-control my-3"
              type="text"
              name="content"
              value={notif.content}
              onChange={(e) => {
                const { name, value } = e.target;
                setNotif((prev) => {
                  return {
                    ...prev,
                    [name]: value,
                    time: new Date().toLocaleDateString("en-US"),
                  };
                });
              }}
            />
            <button
              disabled={loading}
              className="btn btn-primary rounded pill mx-3 "
              onClick={sendNotif}
            >
              ADD NOTIFICATION
            </button>
          </div>
        </div>
        <div className="col-8">
          <Card className="my-3 lft-border">
            <Card.Header>CURRENT/ONGOING QUIZZES</Card.Header>

            <div>
              <Card.Body>
                {quizzesNow.map((item) => {
                  // console.log(item);
                  return (
                    <button
                      key={item.quizName}
                      type="submit"
                      className="btn btn-primary m-3"
                      onClick={() => handleSubmit("Edit", item)}
                    >
                      {item.quizName}
                    </button>
                  );
                })}
              </Card.Body>
            </div>
          </Card>

          <Card className="my-3 lft-border">
            <Card.Header>PAST QUIZZES</Card.Header>

            <div>
              <Card.Body>
                {quizzesDone.map((item) => {
                  // console.log(item);
                  return (
                    <Button
                      key={item.quizName}
                      type="submit"
                      className="btn btn-dark m-3"
                      onClick={() => handleSubmit("Edit", item)}
                    >
                      {item.quizName}
                    </Button>
                  );
                })}
              </Card.Body>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
