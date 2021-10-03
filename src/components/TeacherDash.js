import React, { useState, useEffect } from "react";
import { Card, Button, Alert, Accordion } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import { store } from "../firebase";

export default function TeacherDash() {
  const { currentUser, logout, setQuizId } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const history = useHistory();

  useEffect(() => {
    setLoading(true);
    store
      .collection("quizInfo")
      .get()
      .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          setQuizzes((prev) => {
            // console.log(doc.data());
            return [...prev, doc.data()];
          });
        });
      })
      .catch((err) => {
        setError(err);
      });
    setLoading(false);
  }, []);

  function handleSubmit(type, id) {
    setQuizId(id);
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
      <Accordion defaultActiveKey="1">
        <Card>
          <Accordion.Toggle as={Card.Header} eventKey="0">
            Edit Quiz
          </Accordion.Toggle>

          <Accordion.Collapse eventKey="0">
            <Card.Body>
              {quizzes.map((item) => {
                // console.log(item);
                return (
                  <button
                    key={item.quizName}
                    type="submit"
                    className="btn btn-primary m-3"
                    onClick={() => handleSubmit("Edit", item.quizUUID)}
                  >
                    {item.quizName}
                  </button>
                );
              })}
            </Card.Body>
          </Accordion.Collapse>
        </Card>

        {/* <Card>
          <Accordion.Toggle as={Card.Header} eventKey="1">
            Take Quiz
          </Accordion.Toggle>

          <Accordion.Collapse eventKey="1">
            <Card.Body>
              {quizzes.map((item) => {
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
          </Accordion.Collapse>
        </Card> */}
        <Card>
          <Accordion.Toggle as={Card.Header} eventKey="1">
            Profile
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="1">
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
          </Accordion.Collapse>
        </Card>
      </Accordion>

      <div className="w-75 mx-auto text-center mt-2">
        <Button variant="link" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </div>
  );
}
