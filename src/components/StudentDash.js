import React, { useState, useEffect, useCallback } from "react";
import { Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { db } from "../firebase";
import Notif from "./Notif";
import QuizListItem from "./QuizListItem";
import Cam from "./Cam";
import Loader from "./Loader";

function StudentDash() {
  const { currentUser, logout } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [quizzesNow, setQuizzesNow] = useState([]);
  const [quizzesDone, setQuizzesDone] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const history = useHistory();

  const getData = useCallback(
    async function () {
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
              setQuizzesNow((prev) => {
                return [...prev, doc.data()];
              });
              // db.collection(`Student/${currentUser.email || "default"}/Attempt`)
              //   .doc(doc.id)
              //   .get()
              //   .then((doc1) => {
              //     if (!doc1.exists) {
              //       setQuizzesNow((prev) => {
              //         // console.log(doc.data());
              //         return [...prev, doc.data()];
              //       });
              //     }
              //   });
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
    },
    [currentUser]
  );

  useEffect(() => {
    if (currentUser) getData();
  }, [currentUser, getData]);

  async function handleLogout() {
    setError("");

    try {
      await logout();
      history.push("/");
    } catch {
      setError("Failed to log out");
    }
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
    return <Loader />;
  }

  return (
    <div className="p-3  text-center">
      <p> {error && <Alert variant="danger">{error}</Alert>}</p>
      <div className="row mb-5  ">
        <div className=" p-2 col-2 rgt-border">
          <Button variant="outline-danger" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
        <div className="  col-6 fss rgt-border ">
          <strong>STUDENT DASHBOARD</strong>
        </div>
        <div className=" p-1 pl-4 col-4 text-left">
          <strong>Email:</strong> {currentUser.email}
          <br />
          <strong>Name:</strong> {currentUser.displayName}
        </div>
      </div>

      <div className="row mb-2">
        <div className=" p-2 col-4 rgt-border ">
          {notifs.length ? (
            <table className=" table ">
              <tbody style={{ maxHeight: "100vh", overflow: "scroll" }}>
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
              </tbody>
            </table>
          ) : (
            <h3 className="">Nothing to check Here..</h3>
          )}
        </div>
        <div className=" p-2 col-8">
          <h3 className="">Upcoming Quiz</h3>
          <hr />
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
            <h3 className="">No Upcoming Quizzes..</h3>
          )}
          <h3 className="">Past Quizes</h3>
          <hr />
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
            <h3 className="">No Quizzes to see..</h3>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDash;
