import React, { useState, useEffect } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import { db } from "../firebase";

export default function TeacherDash() {
  const { currentUser, logout, quizInfo, setQuizInfo } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizzesNow, setQuizzesNow] = useState([]);
  const [quizzesDone, setQuizzesDone] = useState([]);
  const history = useHistory();

  useEffect(() => {
    setLoading(true);
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
  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="container p-3 w-50 text-center">
      <h2>Teacher Dashboard</h2>
      <Link
        to="/create-quiz-form"
        className="btn btn-primary w-75 mx-auto my-3"
      >
        Create Quiz
      </Link>
      <>
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
                  >
                    {item.quizName}
                  </Button>
                );
              })}
            </Card.Body>
          </div>
        </Card>

        {/* <Card>
          <Card.Header  >
            Take Quiz
          </Card.Header>

          <div >
            <Card.Body>
              {quizzesNow.map((item) => {
                // console.log(item);
                return (
                  <Button
                    key={item.quizName}
                    type="submit"
                    className="btn btn-primary m-3"
                    onClick={() => handleSubmit("Take", item.quizUUID)}
                  >
                    {item.quizName}
                  </Button>
                );
              })}
            </Card.Body>
          </div>
        </Card> */}
        <Card>
          <Card.Header>Profile</Card.Header>
          <div>
            <Card.Body>
              <h2 className="text-center mb-4">Profile</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <strong>Email:</strong> {currentUser.email}
              <Link
                to="/update-profile"
                className="btn btn-primary w-75 mx-auto mt-3"
              >
                Update Profile
              </Link>
            </Card.Body>
          </div>
        </Card>
      </>

      <div className="w-75 mx-auto text-center mt-2">
        <Button variant="link" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </div>
  );
}
