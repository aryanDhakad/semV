import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { useAuth } from "../contexts/AuthContext";
import Timer from "../components/TakeQuizComponent/Timer";
import { Link, useHistory } from "react-router-dom";
import { db } from "../firebase";
import Cam from "../components/TakeQuizComponent/webcam";
import ExitQuizModal from "../components/TakeQuizComponent/ExitQuizModal";
import QuizCurrentQuestion from "../components/TakeQuizComponent/QuizCurrentQuestion";
import QuestionPanel from "../components/TakeQuizComponent/QuestionPanel";

function TakeQuiz() {
  const { currentUser } = useAuth();

  const webcamRef = useRef(null);
  let history = useHistory();

  const [loading, setLoading] = useState(true);
  const [quizInfo, setQuizInfo] = useState({ quizUUID: "default" });
  const [expireTime, setExpireTime] = useState("");

  const [questionList, setQuestionList] = useState([]);
  const [current, setCurrent] = useState(0);
  const [attempt, setAttempt] = useState({ atm: 0, mrk: 0 });
  const [show, setShow] = useState(false);

  let item1 = localStorage.getItem("quizInfo");
  item1 = JSON.parse(item1);
  let endTime = localStorage.getItem("endTime");

  async function getData() {
    setLoading(true);

    // console.log(expireTime, quizInfo);

    await db
      .collection("quizInfo/" + quizInfo.quizUUID + "/questions")
      .get()
      .then((snapshot) => {
        let document = snapshot.docs.map((doc) => doc.data());
        // console.log(document);
        setQuestionList([...(document || [])]);
      });

    setLoading(false);
  }

  useEffect(() => {
    setQuizInfo(item1);
    setExpireTime(new Date(endTime));
  }, []);

  useEffect(() => {
    getData();
  }, [quizInfo, expireTime]);

  // useEffect(() => {
  //   // console.log("setCurrent", current, questionList.length);
  //   if (current === -1 && questionList.length) setCurrent(0);
  // }, [questionList]);

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
  } else if (questionList.length) {
    return (
      <div>
        <ExitQuizModal
          show={show}
          setShow={setShow}
          attempt={attempt}
          questionList={questionList}
          db={db}
          currentUser={currentUser}
          quizInfo={quizInfo}
          history={history}
        />

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
            <QuizCurrentQuestion
              current={current}
              questionList={questionList}
              handleClick={handleClick}
              MarkForReview={MarkForReview}
              prevQue={prevQue}
              nextQue={nextQue}
            />
          </div>
          <div className="col-4 flex-wrap py-2">
            <div style={{ minHeight: "70vh", border: "3px solid black" }}>
              {questionList.map((item, index) => {
                return (
                  <QuestionPanel
                    key={index}
                    questionList={questionList}
                    index={index}
                    setCurrent={setCurrent}
                  />
                );
              })}
            </div>
            <div className="float-right">
              <Cam />
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
