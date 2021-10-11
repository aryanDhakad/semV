import React, { useState, useEffect } from "react";

import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { db } from "../firebase";

function ReviewTest() {
  const { currentUser, quizInfo } = useAuth();

  const [loading, setLoading] = useState(false);

  const [questionList, setQuestionList] = useState([]);
  const [current, setCurrent] = useState(-1);

  useEffect(() => {
    setLoading(false);

    db.collection("Student")
      .doc(currentUser.email)
      .collection("Attempt")
      .doc(quizInfo.quizUUID)
      .get()
      .then((doc) => {
        if (doc.exists) {
          let data = doc.data();
          console.log(data.questions);

          setQuestionList([...(data.questions || [])]);
        }

        setLoading(false);
      });
  }, [currentUser.email, quizInfo.quizUUID]);

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
        <div className="fs-3 d-inline p-2 mx-2">
          Quiz ID : {quizInfo.quizUUID} , Name : {quizInfo.quizName}
          <br />
          <Link to="/studentDash">Exit to Dashboard</Link>
        </div>

        <div className="row ">
          {/* {Question Panel} */}
          <div className="col-8 py-2 ">
            <div
              style={{
                minHeight: "80vh",
                border: "3px solid black",
                position: "relative",
              }}
              className="p-1"
            >
              <h3
                className="py-3 "
                style={{ height: "30vh", position: "relative" }}
              >{`${current + 1}) ${questionList[current].questionContent}`}</h3>
              <div className="">
                {questionList[current].questionOptions &&
                  questionList[current].questionOptions.map((opt, indexOpt) => {
                    let st1 = "btn  my-1 p-2 w-100";
                    if (opt.optionIsCorrect) st1 += " btn-success";
                    else st1 += " btn-danger";
                    return (
                      <div key={indexOpt} className="w-50 my-2 ">
                        <button className={st1}>{opt.optionContent}</button>
                      </div>
                    );
                  })}
              </div>
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
          <div className="col-4 flex-wrap py-2">
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
    );
  } else {
    return <h1>No Question in Database</h1>;
  }
}

export default ReviewTest;
