import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Timer from "./Timer";
import { useHistory } from "react-router-dom";
import { db } from "../firebase";
import Cam from "./Cam";
import ExitQuizModal from "./ExitQuizModal";
import QuizCurrentQuestion from "./QuizCurrentQuestion";
import QuestionPanel from "./QuestionPanel";
import Loader from "./Loader";

function TakeQuiz() {
  let item1 = localStorage.getItem("quizInfo");
  item1 = JSON.parse(item1);
  let endTime = localStorage.getItem("endTime");
  endTime = new Date(endTime).getTime();

  const { currentUser } = useAuth();

  let history = useHistory();

  const [loading, setLoading] = useState(true);

  const [questionList, setQuestionList] = useState([]);
  const [current, setCurrent] = useState(0);
  const [attempt, setAttempt] = useState({ atm: 0, mrk: 0 });
  const [show, setShow] = useState(false);

  const getData = useCallback(
    async function () {
      setLoading(true);

      // console.log(expireTime, quizInfo);

      await db
        .collection("quizInfo/" + item1.quizUUID + "/questions")
        .get()
        .then((snapshot) => {
          let document = snapshot.docs.map((doc) => doc.data());
          // console.log(document);
          setQuestionList([...(document || [])]);
        });

      setLoading(false);
    },
    [item1.quizUUID]
  );

  useEffect(() => {
    getData();
  }, [getData]);

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
  function onTimerExpire() {
    let n = 0;
    let m = 0;
    questionList.forEach((item) => {
      if (item.questionIsAttempted) n += 1;
      if (item.questionIsMarked) m += 1;
    });
    alert(
      `Time has ended. Total Attempted : ${n}.  Total Mark For Review : ${m}.`
    );
    history.push("/");
  }

  if (loading) {
    return <Loader />;
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
          quizInfo={item1}
          history={history}
        />
        <div className="row lft-border mx-3">
          <div className="col-3 rgt-border">
            Name : {item1.quizName}
            <br />
            <Link to="/studentDash">Exit to Dashboard</Link>
          </div>
          <div className=" py-1 col-3 text-left rgt-border">
            <strong>Email:</strong> {currentUser.email}
            <br />
            <strong>Name:</strong> {currentUser.displayName}
          </div>
          <div className="col-3 p-0 rgt-border jic">
            <Timer
              expiryTimestamp={endTime}
              history={history}
              onTimerExpire={onTimerExpire}
            />
          </div>
          <div className="col-3 jic">
            <button className="btn btn-danger p-3 my-2" onClick={EndTest}>
              End Test
            </button>
          </div>
        </div>
        <div className="row ">
          <div className="col-8 py-2">
            <div className=" py-2  lft-border">
              <QuizCurrentQuestion
                current={current}
                questionList={questionList}
                handleClick={handleClick}
                MarkForReview={MarkForReview}
                prevQue={prevQue}
                nextQue={nextQue}
              />
            </div>
          </div>
          <div
            className="col-4 py-2"
            style={{ position: "relative", height: "100vh" }}
          >
            {/* {Question Panel} */}

            <div className=" flex-wrap lft-border overflow-auto ">
              <div style={{ height: "60vh" }}>
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
            </div>
            <div
              className="lft-border "
              style={{ position: "absolute", bottom: "10px", height: "30vh" }}
            >
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
