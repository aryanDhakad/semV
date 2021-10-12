import React, { useState, useEffect } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import { db } from "../firebase";

export default function TeacherDash() {
  const { currentUser, logout, setQuizInfo } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    setQuizInfo({});
    let time = new Date();
    db.collection("quizInfo")
      .get()
      .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          let time2ed = new Date(doc.data().quizTimeEnd);

          if (time2ed.getTime() < time.getTime()) {
            setQuizzesDone((prev) => {
              return [...prev, doc.data()];
            });
          } else {
            setQuizzesNow((prev) => {
              // console.log(doc.data());
              return [...prev, doc.data()];
            });
          }
        });
      })
      .catch((err) => {
        setError(err);
      });
    setLoading(false);
  }, []);
  function handleSubmit(type, item) {
    setQuizInfo(item);
    if (type === "Edit") {
      history.push("/create-quiz");
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
    return <h1>Loading...</h1>;
  }

  return (
    <div className="container p-3  text-center">
      <h2>Teacher Dashboard</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <div className="row text-left my-4 p-4">
        <div className="col-6">
          <strong>Email:</strong> {currentUser.email}
          <br />
          <strong>Name:</strong> {currentUser.displayName}
        </div>
        <div className="col-6">
          <Button variant="outline-danger" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </div>
      <div className="row">
        <div className="col-4">
          <label>NOTIFICATION :</label>
          <textarea
            row="7"
            col="20"
            className="form-control"
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
            className="btn btn-primary rounded-circle mx-3 "
            onClick={sendNotif}
          >
            +
          </button>

          <Link
            to="/create-quiz-form"
            className="btn btn-primary w-100 mx-auto my-3"
          >
            Create Quiz
          </Link>
        </div>
        <div className="col-8">
          <Card>
            <Card.Header>Edit Quiz</Card.Header>

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
          <Card>
            <Card.Header>Past Quiz</Card.Header>

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
