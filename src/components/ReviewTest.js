import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import { db } from "../firebase";
import ReactHtmlParser from "react-html-parser";
import Loader from "./Loader";

function ReviewTest() {
  const { currentUser } = useAuth();

  const history = useHistory();

  const [loading, setLoading] = useState(true);

  const [questionList, setQuestionList] = useState([]);
  const [current, setCurrent] = useState(-1);
  const [score, setScore] = useState(0);

  let quizInfo = localStorage.getItem("quizInfo");
  quizInfo = JSON.parse(quizInfo);

  useEffect(() => {
    async function getData() {
      setLoading(true);

      db.collection("Student")
        .doc(currentUser.email)
        .collection("Attempt")
        .doc(quizInfo.quizUUID)
        .get()
        .then((doc) => {
          if (doc.exists) {
            let data = doc.data();
            setScore(data.Score);
            // console.log(data.questions);
            setQuestionList([...(data.questions || [])]);
          }

          // db.collection("Student")
          //   .doc(currentUser.email)
          //   .collection("Attempt")
          //   .doc(quizInfo.quizUUID)
          //   .update({
          //     Info: quizInfo,
          //   });
        })
        .catch((err) => {
          console.log(err);
        });
      setLoading(false);
      setCurrent(0);
    }

    const type = localStorage.getItem("type");
    if (type !== "Student") {
      alert("Access Denied");
      history.push("/login");
    } else {
      getData();
    }
  }, [currentUser.email, history, quizInfo.quizUUID]);

  useEffect(() => {
    const type = localStorage.getItem("type");
    if (type === "Student") {
      if (current === -1 && questionList.length) setCurrent(0);
    }
  }, [questionList, current]);

  function nextQue() {
    if (current + 1 < questionList.length) setCurrent(current + 1);
  }
  function prevQue() {
    if (current - 1 >= 0) setCurrent(current - 1);
  }

  if (loading) {
    return <Loader />;
  } else if (current >= 0) {
    return (
      <div>
        {/* Header row */}
        <div className="row lft-border mx-3">
          <div className="col-3 rgt-border">
            <Link to="/studentDash">Exit to Dashboard</Link>
          </div>
          <div className="col-3 rgt-border ">
            Name : {quizInfo.quizName}
            <br />
            ID : {quizInfo.quizUUID}
          </div>
          <div className=" p-1 col-3 text-left rgt-border">
            <strong>Email:</strong> {currentUser.email}
            <br />
            <strong>Name:</strong> {currentUser.displayName}
          </div>
          <div className=" col-3 fss ">Score : {score}</div>
        </div>
        <div className="row">
          <div className="col-8 py-2 px-4">
            <div className=" lft-border  ">
              <div
                style={{
                  minHeight: "80vh",

                  position: "relative",
                }}
                className="p-1"
              >
                {questionList.length && (
                  <div>
                    <h5
                      className="py-3 "
                      style={{ height: "30vh", position: "relative" }}
                    >
                      {current + 1}{" "}
                      <div>
                        {ReactHtmlParser(questionList[current].questionContent)}
                      </div>
                    </h5>
                    <div className=" px-2">
                      {questionList[current].questionOptions &&
                        questionList[current].questionOptions.map(
                          (opt, indexOpt) => {
                            let st1 = "btn btn-primary my-1 p-2 w-75";

                            return (
                              <div key={indexOpt} className="w-75 my-2  ">
                                <button className={st1}>
                                  <div>
                                    {" "}
                                    {ReactHtmlParser(opt.optionContent)}{" "}
                                  </div>{" "}
                                </button>

                                {opt.optionIsSelected &&
                                  (opt.optionIsCorrect ? (
                                    <span className="badge mx-1 badge-pill badge-success">
                                      Correct
                                    </span>
                                  ) : (
                                    <span className="badge mx-1 badge-pill badge-danger">
                                      Wrong
                                    </span>
                                  ))}
                              </div>
                            );
                          }
                        )}
                    </div>
                  </div>
                )}
              </div>
              <div className="">
                <button
                  className="btn btn-primary m-1 w-25 p-2 "
                  onClick={prevQue}
                >
                  Before
                </button>
                <button
                  className="btn btn-primary mx-1 w-25 p-2 "
                  onClick={nextQue}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="col-4 p-2">
            {/* {Question Panel} */}

            <div className=" flex-wrap lft-border ">
              <div style={{ minHeight: "70vh" }}>
                {questionList.map((item, index) => {
                  let st = "btn  m-2 p-3 rounded  ";

                  if (item.questionIsAttempted) st += " btn-primary";
                  else st += " btn-dark";
                  return (
                    <button
                      className={st}
                      key={index}
                      onClick={() => setCurrent(index)}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <h1>No Question in Database</h1>;
  }
}

export default ReviewTest;
