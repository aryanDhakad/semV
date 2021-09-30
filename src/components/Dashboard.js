import React, { useState, useEffect } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import { store } from "../firebase";

export default function Dashboard() {
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

  function handleSubmit(e, id) {
    e.preventDefault();
    setQuizId(id);
    history.push("/take-quiz");
  }

  async function handleLogout() {
    setError("");

    try {
      await logout();
      history.push("/login");
    } catch {
      setError("Failed to log out");
    }
  }
  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="container p-3 w-50 text-center">
      <h3> {error}</h3>
      <Link
        to="/create-quiz-form"
        className="btn btn-primary w-75 mx-auto my-3"
      >
        Create Quiz
      </Link>
      {/* <Link to="/take-quiz" className="btn btn-primary w-75 mx-auto my-3">
        Take Quiz
      </Link> */}
      <form className="form" action="/take-quiz" method="get">
        {quizzes.map((item) => {
          // console.log(item);
          return (
            <button
              key={item.quizName}
              type="submit"
              className="btn btn-primary m-3"
              onClick={(e) => handleSubmit(e, item.quizUUID)}
            >
              {item.quizName}
            </button>
          );
        })}
      </form>
      {/* <Card>
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
      </Card> */}
      <div className="w-75 mx-auto text-center mt-2">
        <Button variant="link" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </div>
  );
}
