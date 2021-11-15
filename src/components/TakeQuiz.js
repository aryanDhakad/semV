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

var elem = document.documentElement;

function TakeQuiz() {
  let quizInfo = localStorage.getItem("quizInfo");
  quizInfo = JSON.parse(quizInfo);
  let endTime = localStorage.getItem("endTime");
  endTime = new Date(endTime).getTime();

  const { currentUser } = useAuth();

  let history = useHistory();

  const [loading, setLoading] = useState(true);

  const [questionList, setQuestionList] = useState([]);
  const [current, setCurrent] = useState(0);
  const [attempt, setAttempt] = useState({ atm: 0, mrk: 0, sc: 0 });
  const [show, setShow] = useState(false);
  const [disp, setDisp] = useState("block");

  const getData = useCallback(async function () {
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
  }, []);

  const closeScreen = async () => {
    if (!document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      /* IE11 */
      document.msExitFullscreen();
    }
  };

  const goFullScreen = () => {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE11 */
      elem.msRequestFullscreen();
    }
  };

  // useEffect(() => {
  //   //disable mouse drag select start

  //   document.addEventListener("contextmenu", (event) => event.preventDefault());

  //   document.onselectstart = new Function("return false");

  //   function dMDown(e) {
  //     return false;
  //   }

  //   function dOClick() {
  //     return true;
  //   }

  //   document.onmousedown = dMDown;

  //   document.onclick = dOClick;

  //   // $("#document").attr("unselectable", "on");

  //   //disable mouse drag select end

  //   //disable right click - context menu

  //   document.oncontextmenu = new Function("return false");

  //   //disable CTRL+A/CTRL+C through key board start

  //   //use this function

  //   function disableSelectCopy(e) {
  //     // current pressed key

  //     var pressedKey = String.fromCharCode(e.keyCode).toLowerCase();

  //     if (
  //       e.ctrlKey &&
  //       (pressedKey == "c" ||
  //         pressedKey == "x" ||
  //         pressedKey == "v" ||
  //         pressedKey == "a")
  //     ) {
  //       return false;
  //     }
  //     // else if (
  //     //   e.ctrlKey &&
  //     //   e.shiftKey &&
  //     //   (pressedKey == "i" || pressedKey == "c")
  //     // ) {
  //     //   return false;
  //     // }
  //   }

  //   document.onkeydown = disableSelectCopy;
  // }, []);

  useEffect(() => {
    // goFullScreen();
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
    let score = 0;
    questionList.forEach((item) => {
      if (item.questionIsAttempted) n += 1;
      if (item.questionIsMarked) m += 1;
      item.questionOptions.forEach((opt) => {
        if (opt.optionIsSelected) score += opt.optionScore;
      });
    });
    setAttempt({ atm: n, mrk: m, sc: score });

    setShow(!show);
  }
  async function onTimerExpire() {
    let n = 0;
    let m = 0;
    let score = 0;
    questionList.forEach((item) => {
      if (item.questionIsAttempted) n += 1;
      if (item.questionIsMarked) m += 1;
      item.questionOptions.forEach((opt) => {
        if (opt.optionIsSelected) score += parseFloat(opt.optionScore);
      });
    });
    alert(
      `Time has ended. Total Attempted : ${n}.  Total Mark For Review : ${m}.`
    );

    // await db
    //   .collection("Student")
    //   .doc(currentUser.email)
    //   .collection("Attempt")
    //   .doc(quizInfo.quizUUID)
    //   .set({
    //     quizInfo: quizInfo,
    //     questions: questionList,
    //     score: attempt.sc,
    //   });
    closeScreen();
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
          quizInfo={quizInfo}
          history={history}
          closeScreen={closeScreen}
        />
        <div className="row lft-border mx-3">
          <div className="col-3 rgt-border">
            Name : {quizInfo.quizName}
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
            <div className=" py-2  lft-border" style={{ display: `${disp}` }}>
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

            <div
              className=" flex-wrap lft-border overflow-auto "
              style={{ display: `${disp}` }}
            >
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
              <Cam history={history} setDisp={setDisp} />
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
