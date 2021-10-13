import React, { useRef, useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import Webcam from "react-webcam";
import { useAuth } from "../contexts/AuthContext";
import Timer from "./Timer";
import { Link, useHistory } from "react-router-dom";
import { db } from "../firebase";

function TakeQuiz() {
  const { quizInfo, expireTime, currentUser, setQuizInfo } = useAuth();

  const webcamRef = useRef(null);
  let history = useHistory();

  const [loading, setLoading] = useState(true);

  const [questionList, setQuestionList] = useState([]);
  const [current, setCurrent] = useState(-1);
  const [attempt, setAttempt] = useState({ atm: 0, mrk: 0 });
  const [show, setShow] = useState(false);

  useEffect(() => {
    setLoading(true);

    db.collection("quizInfo/" + quizInfo.quizUUID + "/questions")
      .get()
      .then((snapshot) => {
        let document = snapshot.docs.map((doc) => doc.data());

        setQuestionList([...(document || [])]);
      });
    setLoading(false);
  }, [quizInfo.quizUUID]);

  useEffect(() => {
    if (current === -1 && questionList.length) setCurrent(0);
  }, [questionList, current]);

  function MarkForReview(que) {
    let indQue = que;
    que = questionList[que];
    questionList[current].questionIsMarked =
      !questionList[current].questionIsMarked;
    setQuestionList((prev) => {
      return prev.map((item, index) => {
        if (index === indQue) return que;
        else return item;
      });
    });
  }

  function handleClick(que, opt) {
    let indQue = que;
    let indOpt = opt;
    que = questionList[que];
    opt = questionList[current].questionOptions[opt];
    // console.log(que, opt);
    opt.optionIsSelected = !opt.optionIsSelected;

    questionList[current].questionOptions = questionList[
      current
    ].questionOptions.map((item, index) => {
      if (index === indOpt) return opt;
      else return item;
    });

    if (
      questionList[current].questionOptions.some((item) => {
        return item.optionIsSelected;
      })
    ) {
      questionList[current].questionIsAttempted = true;
    } else {
      questionList[current].questionIsAttempted = false;
    }

    setQuestionList((prev) => {
      return prev.map((item, index) => {
        if (index === indQue) return que;
        else return item;
      });
    });
  }
  function nextQue() {
    if (current + 1 < questionList.length) setCurrent(current + 1);
  }
  function prevQue() {
    if (current - 1 >= 0) setCurrent(current - 1);
  }
  function EndTest() {
    let n = 0;
    let m = 0;
    questionList.forEach((item) => {
      if (item.questionIsAttempted) n += 1;
      if (item.questionIsMarked) m += 1;
    });
    setAttempt({ atm: n, mrk: m });
    setShow(!show);
  }

  if (loading) {
    return <h1>Loading ....</h1>;
  } else if (current >= 0) {
    return (
      <div>
        <Modal
          show={show}
          onHide={() => setShow(!show)}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title> End Test</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are You Sure You Want To End The Test?
            <p>Attempted : {attempt.atm}</p>
            <p>Marked For Review: {attempt.mrk}</p>
            <p>Not Attempted : {questionList.length - attempt.atm}</p>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={async () => {
                await db
                  .collection("Student")
                  .doc(currentUser.email)
                  .collection("Attempt")
                  .doc(quizInfo.quizUUID)
                  .set({
                    Info: quizInfo,
                    questions: questionList,
                  });

                history.push("/studentDash");
              }}
            >
              End Test
            </Button>
          </Modal.Footer>
        </Modal>

        <div className="fs-3 d-inline p-2 mx-2">
          Quiz ID : {quizInfo.quizUUID} , Name : {quizInfo.quizName},
          <Timer expiryTimestamp={expireTime} history={history} />
        </div>

        <button className="btn btn-danger d-inline mx-2" onClick={EndTest}>
          End Test
        </button>

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
                    let st1 = "btn btn-primary my-1 p-2 w-100";
                    if (opt.optionIsSelected) st1 += " bg-dark";
                    else st1 += " bg-primary";
                    return (
                      <div key={indexOpt} className="w-50 my-2 ">
                        <button
                          className={st1}
                          onClick={() => handleClick(current, indexOpt)}
                        >
                          {opt.optionContent}
                        </button>
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
              <button
                className="btn btn-primary mx-1 w-25 p-2 "
                onClick={() => MarkForReview(current)}
              >
                Mark For Review
              </button>
            </div>
          </div>
          <div className="col-4 flex-wrap py-2">
            <div style={{ minHeight: "70vh", border: "3px solid black" }}>
              {questionList.map((item, index) => {
                let st = "btn btn-primary m-2 p-3 rounded  ";

                if (
                  questionList[index].questionIsMarked &&
                  questionList[index].questionIsAttempted
                )
                  st += " bg-warning";
                else if (questionList[index].questionIsMarked) st += " bg-info";
                else if (questionList[index].questionIsAttempted)
                  st += " bg-success";
                else st += " bg-danger";
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
            <div className="float-right">
              {/* <Webcam
              height={150}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={180}
            /> */}
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <h1>No Question in Database</h1>;
  }
}

export default TakeQuiz;
