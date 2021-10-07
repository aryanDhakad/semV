import React, { useState, useEffect } from "react";
import { Card, Button, Alert, div } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import { db } from "../firebase";

export default function StudentDash() {
  const { currentUser, logout, setQuizInfo, setExpireTime } = useAuth();
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

  function handleSubmit(type, item, start, end) {
    start = new Date(start);
    end = new Date(end);
    let now = new Date();

    if (start.getTime() > now.getTime()) {
      setError("Test Not Started");
    } else if (now.getTime() > end.getTime()) {
      setError("Test Has Ended");
    } else {
      setQuizInfo(item);
      setExpireTime(end);
      if (type === "Take") {
        history.push("/take-quiz");
      } else {
        history.push("/");
      }
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
      <h2>Student Dashboard</h2>
      <p> {error && <Alert variant="danger">{error}</Alert>}</p>
      <div>
        <Card>
          <Card.Header>Take Quiz</Card.Header>

          <div>
            <Card.Body>
              {quizzesNow.map((item) => {
                // console.log(item);
                return (
                  <Button
                    key={item.quizName}
                    type="submit"
                    className="btn btn-primary m-3"
                    onClick={() =>
                      handleSubmit(
                        "Take",
                        item,
                        item.quizTimeStart,
                        item.quizTimeEnd
                      )
                    }
                  >
                    {item.quizName}
                  </Button>
                );
              })}
            </Card.Body>
          </div>
        </Card>
        <Card>
          <Card.Header>Review Quiz</Card.Header>

          <div>
            <Card.Body>
              {quizzesDone.map((item) => {
                // console.log(item);
                return (
                  <Button
                    key={item.quizName}
                    type="submit"
                    className="btn btn-dark m-3"
                    onClick={() =>
                      handleSubmit(
                        "Take",
                        item,
                        item.quizTimeStart,
                        item.quizTimeEnd
                      )
                    }
                  >
                    {item.quizName}
                  </Button>
                );
              })}
            </Card.Body>
          </div>
        </Card>
        <Card>
          <Card.Header>Profile</Card.Header>
          <div>
            <Card.Body>
              <h2 className="text-center mb-4">Profile</h2>
              <strong>Email:</strong> {currentUser.email}
              <br />
              <strong>Name:</strong> {currentUser.displayName}
              <Link to="/update-profile" className="btn btn-primary ">
                Update Profile
              </Link>
            </Card.Body>
          </div>
        </Card>
      </div>

      <div className="w-75 mx-auto text-center mt-2">
        <Button variant="link" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </div>
  );
}
