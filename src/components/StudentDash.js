import React, { useState, useEffect } from "react";
import { Card, Button, Alert, Badge } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import { db } from "../firebase";

export default function StudentDash() {
  const { currentUser, logout, setQuizInfo, setExpireTime } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizzesNow, setQuizzesNow] = useState([]);
  const [quizzesDone, setQuizzesDone] = useState([]);
  const [notifs, setNotifs] = useState([]);
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

    setLoading(false);
  }, [currentUser.email]);

  function handleSubmit(type, item, start, end) {
    start = new Date(start);
    end = new Date(end);
    let now = new Date();

    if (start.getTime() > now.getTime()) {
      setError("Test Not Started");
    } else if (now.getTime() > end.getTime()) {
      setQuizInfo(item);
      history.push("/review-test");
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
    <div className="container p-3  text-center">
      <div className="row text-left">
        <div className="col-6">
          <strong>Email:</strong> {currentUser.email}
          <br />
          <strong>Name:</strong> {currentUser.displayName}
        </div>
        <div className="col-6">
          <Link to="/update-profile" className="btn btn-primary mx-1">
            Update Profile
          </Link>

          <Button variant="outline-danger" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </div>

      <p> {error && <Alert variant="danger">{error}</Alert>}</p>
      <div className="row">
        <div className="col-6">
          <table className=" table">
            <thead className="thead-dark">
              <tr>
                <th> Name. </th>
                <th> Subject </th>
                <th> Date </th>
                <th> .... </th>
              </tr>
            </thead>
            <tbody>
              {notifs.map((item, index) => {
                return (
                  <tr key={index}>
                    <tr scope="row">{index + 1}</tr>
                    <td>{item.facult}</td>
                    <td>{item.content}</td>
                    <td>
                      <Badge variant={item.isRead ? "success" : "danger"}>
                        {" "}
                        {item.isRead ? (
                          <span>Read</span>
                        ) : (
                          <span>Not Read</span>
                        )}{" "}
                      </Badge>
                    </td>
                    <td>
                      {" "}
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
                    </td>
                    <td>
                      {!item.isRead && (
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
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="col-6">
          <h3>Upcoming Quiz</h3>
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
                  <tr>
                    <th scope="row">{index + 1}</th>
                    <td>{item.quizName}</td>
                    <td>{item.quizTimeStart}</td>
                    <td>{item.quizTimeEnd}</td>
                    <td>
                      <Button
                        key={index}
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
                        Start
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <h3>Past Quiz</h3>
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
                  <tr>
                    <th scope="row">{index + 1}</th>
                    <td>{item.quizName}</td>
                    <td>
                      {new Date(item.quizTimeStart).toLocaleDateString("en-US")}
                    </td>
                    <td>
                      {new Date(item.quizTimeEnd).toLocaleDateString("en-US")}
                    </td>
                    <td>
                      <Button
                        key={index}
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
                        Start
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
