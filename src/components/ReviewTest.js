import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import ReactHtmlParser from "react-html-parser";

function ReviewTest() {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);

  const [questionList, setQuestionList] = useState([]);
  const [current, setCurrent] = useState(-1);

  let item1 = localStorage.getItem("quizInfo");
  item1 = JSON.parse(item1);

  useEffect(() => {
    async function getData() {
      setLoading(true);

      db.collection("Student")
        .doc(currentUser.email)
        .collection("Attempt")
        .doc(item1.quizUUID)
        .get()
        .then((doc) => {
          if (doc.exists) {
            let data = doc.data();
            // console.log(data.questions);
            setQuestionList([...(data.questions || [])]);
          }

          db.collection("Student")
            .doc(currentUser.email)
            .collection("Attempt")
            .doc(item1.quizUUID)
            .update({
              Info: item1,
            });
        })
        .catch((err) => {
          console.log(err);
        });
      setLoading(false);
      setCurrent(0);
    }
    getData();
  }, []);

  useEffect(() => {
    if (current === -1 && questionList.length) setCurrent(0);
  }, [questionList, current]);

  function nextQue() {
    if (current + 1 < questionList.length) setCurrent(current + 1);
  }
  function prevQue() {
    if (current - 1 >= 0) setCurrent(current - 1);
  }

  if (loading) {
    return <h1>Loading ....</h1>;
  } else if (current >= 0) {
    return (
      <div>
        <div className="row">
          <div className="col-8 p-2">
            <div className="row">
              <div className="col-4 lft-border">
                Name : {item1.quizName}
                <br />
                <Link to="/studentDash">Exit to Dashboard</Link>
              </div>
              <div className=" p-1 col-8 text-left lft-border">
                <strong>Email:</strong> {currentUser.email}
                <br />
                <strong>Name:</strong> {currentUser.displayName}
              </div>
            </div>

            <div className=" py-2 ">
              <div
                style={{
                  minHeight: "80vh",
                  border: "3px solid black",
                  position: "relative",
                }}
                className="p-1"
              >
                {questionList.length && (
                  <div>
                    <h3
                      className="py-3 "
                      style={{ height: "30vh", position: "relative" }}
                    >
                      {current + 1}{" "}
                      <div>
                        {ReactHtmlParser(questionList[current].questionContent)}
                      </div>
                    </h3>
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
                                      Correect
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

            <div className=" flex-wrap ">
              <div style={{ minHeight: "70vh", border: "3px solid black" }}>
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
