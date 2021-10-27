import React, { useState, useEffect } from "react";
import { Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { db } from "../firebase";
import Notif from "./Notif";
import QuizListItem from "./QuizListItem";

function StudentDash() {
  const { currentUser, logout } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizzesNow, setQuizzesNow] = useState([]);
  const [quizzesDone, setQuizzesDone] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const history = useHistory();

  useEffect(() => {
    if (currentUser) getData();
  }, [currentUser]);

  async function handleLogout() {
    setError("");

    try {
      await logout();
      history.push("/");
    } catch {
      setError("Failed to log out");
    }
  }

  async function getData() {
    setLoading(true);

    let time = new Date();
    await db
      .collection("quizInfo")
      .get()
      .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          let time2ed = new Date(doc.data().quizTimeEnd);

          if (time2ed.getTime() < time.getTime()) {
            if (doc.data().quizLetReview) {
              setQuizzesDone((prev) => {
                // console.log(doc.data());
                return [...prev, doc.data()];
              });
            }
          } else {
            db.collection(`Student/${currentUser.email || "default"}/Attempt`)
              .doc(doc.id)
              .get()
              .then((doc1) => {
                if (!doc1.exists) {
                  setQuizzesNow((prev) => {
                    // console.log(doc.data());
                    return [...prev, doc.data()];
                  });
                }
              });
          }
        });
      })
      .catch((err) => {
        setError(err);
      });

    await db
      .collection("Student")
      .doc(currentUser.email)
      .collection("Notifs")
      .get()
      .then((snap) => {
        let data = snap.docs.map((item) => {
          return { id: item.id, ...item.data() };
        });

        setNotifs([...data]);
      });

    setLoading(false);
  }

  function handleSubmit(type, item, start, end) {
    start = new Date(start);
    end = new Date(end);
    let now = new Date();
    if (start.getTime() > now.getTime()) {
      setError("Test Not Started");
    } else if (type === "review") {
      localStorage.setItem("quizInfo", JSON.stringify(item));
      history.push("/review-test");
    } else if (type === "take") {
      localStorage.setItem("quizInfo", JSON.stringify(item));
      localStorage.setItem("endTime", end);
      history.push("/take-quiz");
    }
  }

  function showTime(time) {
    let t = new Date(time);
    return t.toLocaleString("en-US");
  }
  if (loading || !currentUser) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="container p-3  text-center">
      <div className="row text-left">
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

      <p> {error && <Alert variant="danger">{error}</Alert>}</p>

      <div className="row">
        <div className="col-6">
          {notifs.length ? (
            <table className=" table ">
              <tbody>
                <section style={{ maxHeight: "100vh", overflow: "scroll" }}>
                  {notifs.map((item, index) => {
                    return (
                      <Notif
                        key={index}
                        item={item}
                        index={index}
                        db={db}
                        currentUser={currentUser}
                        setNotifs={setNotifs}
                      />
                    );
                  })}
                </section>
              </tbody>
            </table>
          ) : (
            <h3 className="shadow-lg">Nothing to check Here..</h3>
          )}
        </div>

        <div className="col-6">
          <h3 className="shadow-lg">Upcoming Quiz</h3>
          {quizzesNow.length ? (
            <table className="table my-3">
              <thead className="thead-dark">
                <tr>
                  <td>Sr No.</td>
                  <td>Name </td>
                  <td>Starts At</td>
                  <td>Ends At</td>
                  <td>Faculty</td>
                  <td>....</td>
                </tr>
              </thead>
              <tbody>
                {quizzesNow.map((item, index) => {
                  // console.log(item);
                  return (
                    <QuizListItem
                      key={index}
                      index={index}
                      item={item}
                      handleSubmit={handleSubmit}
                      showTime={showTime}
                      type={"take"}
                    />
                  );
                })}
              </tbody>
            </table>
          ) : (
            <h3 className="shadow-lg">No Upcoming Quizzes..</h3>
          )}

          <h3 className="shadow-lg">Past Quiz</h3>
          {quizzesDone.length ? (
            <table className="table my-3">
              <thead className="thead-dark">
                <tr>
                  <td>Sr No.</td>
                  <td>Name </td>
                  <td>Starts At</td>
                  <td>Ends At</td>
                  <td>Faculty</td>
                  <td>....</td>
                </tr>
              </thead>
              <tbody>
                {quizzesDone.map((item, index) => {
                  // console.log(item);
                  return (
                    <QuizListItem
                      key={index}
                      index={index}
                      item={item}
                      handleSubmit={handleSubmit}
                      showTime={showTime}
                      type={"review"}
                    />
                  );
                })}
              </tbody>
            </table>
          ) : (
            <h3 className="shadow-lg">No Quizzes to see..</h3>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDash;
