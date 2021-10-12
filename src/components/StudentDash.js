import React, { useState, useEffect } from "react";
import { Button, Alert, Badge } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { db } from "../firebase";

export default function StudentDash() {
  const { currentUser, logout, setQuizInfo, setExpireTime } = useAuth();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizzesNow, setQuizzesNow] = useState([]);
  const [quizzesDone, setQuizzesDone] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const history = useHistory();

  async function handleLogout() {
    setError("");

    try {
      await logout();
      history.push("/");
    } catch {
      setError("Failed to log out");
    }
  }

  useEffect(() => {
    setLoading(true);

    let time = new Date();
    db.collection("quizInfo")
      .get()
      .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          let time2ed = new Date(doc.data().quizTimeEnd);

          if (time2ed.getTime() < time.getTime() && doc.data().quizLetReview) {
            setQuizzesDone((prev) => {
              // console.log(doc.data());
              return [...prev, doc.data()];
            });
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
                // else if (doc.data().quizLetReview) {
                //   setQuizzesDone((prev) => {
                //     // console.log(doc.data());
                //     return [...prev, doc.data()];
                //   });
                // }
              });
          }
        });
      })
      .catch((err) => {
        setError(err);
      });

    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    if (currentUser) {
      db.collection("Student")
        .doc(currentUser.email)
        .collection("Notifs")
        .get()
        .then((snap) => {
          let data = snap.docs.map((item) => {
            return { id: item.id, ...item.data() };
          });

          setNotifs([...data]);
        });
    }

    setLoading(false);
  }, [currentUser]);

  function handleSubmit(type, item, start, end) {
    start = new Date(start);
    end = new Date(end);
    let now = new Date();
    if (start.getTime() > now.getTime()) {
      setError("Test Not Started");
    } else if (type === "review") {
      setQuizInfo(item);
      history.push("/review-test");
    } else if (type === "take") {
      setQuizInfo(item);
      setExpireTime(end);

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
            <table className=" table">
              <thead className="thead-dark">
                <tr>
                  <th> Name. </th>
                  <th> Faculty </th>
                  <th> Date </th>
                  <th> .... </th>
                </tr>
              </thead>
              <tbody>
                {notifs.map((item, index) => {
                  return (
                    <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      <td>{item.faculty}</td>
                      <td>{item.content}</td>
                      <td>
                        {item.isRead ? (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              setNotifs((prev) => {
                                return prev.filter((item, id) => {
                                  return id !== index;
                                });
                              });
                              db.collection("Student")
                                .doc(currentUser.email)
                                .collection("Notifs")
                                .doc(item.id)
                                .delete();
                            }}
                          >
                            X
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm mx-1"
                            onClick={() => {
                              setNotifs((prev) => {
                                return prev.map((item, id) => {
                                  if (id === index) {
                                    item.isRead = true;
                                    return item;
                                  } else return item;
                                });
                              });

                              db.collection("Student")
                                .doc(currentUser.email)
                                .collection("Notifs")
                                .doc(item.id)
                                .update({
                                  isRead: !item.isRead,
                                });
                            }}
                          >
                            Mark As Read
                          </button>
                        )}{" "}
                      </td>
                    </tr>
                  );
                })}
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
                    <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      <td>{item.quizName}</td>
                      <td>{showTime(item.quizTimeStart)}</td>
                      <td>{showTime(item.quizTimeEnd)}</td>
                      <td>
                        <Button
                          key={index}
                          type="submit"
                          className="btn btn-primary m-3"
                          onClick={() =>
                            handleSubmit(
                              "take",
                              item,
                              item.quizTimeStart,
                              item.quizTimeEnd
                            )
                          }
                        >
                          Start
                        </Button>
                      </td>
                    </tr>
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
                    <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      <td>{item.quizName}</td>
                      <td>{showTime(item.quizTimeStart)}</td>
                      <td>{showTime(item.quizTimeEnd)}</td>
                      <td>
                        <Button
                          key={index}
                          type="submit"
                          className="btn btn-primary m-3"
                          onClick={() =>
                            handleSubmit(
                              "review",
                              item,
                              item.quizTimeStart,
                              item.quizTimeEnd
                            )
                          }
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
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
