import React, { useRef, useState, useEffect } from "react";
import { db } from "../firebase";

function TakeQuiz() {
  const quizID = useRef();

  const [loading, setLoading] = useState(false);

  const [option, setOption] = useState({
    optionContent: "",
    optionIsCorrect: false,
    optionWeightage: 1,
    optionIsSelected: false,
  });

  const [question, setQuestion] = useState({
    questionNo: "",
    questionContent: "",
    questionOptions: [option, option, option],
    questionIsAttempted: false,
    questionIsMarked: false,
  });

  const [error, setError] = useState(null);
  const [questionList, setQuestionList] = useState([]);
  const [current, setCurrent] = useState(-1);

  const [optionId, setOptionId] = useState(-1);

  useEffect(() => {
    setLoading(true);
    db.ref("quiz").on("value", (snapshot) => {
      // console.log(snapshot.val());
      setQuestionList([...Object.values(snapshot.val() || {})]);
      setLoading(false);
      setCurrent(0);
    });
  }, []);

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

  if (loading) {
    return <h1>Loading ....</h1>;
  } else if (current >= 0) {
    let st = "my-2 p-4 flex-wrap fs-1";

    if (
      questionList[current].questionIsMarked &&
      questionList[current].questionIsAttempted
    )
      st += " bg-warning";
    else if (questionList[current].questionIsMarked) st += " bg-info";
    else if (questionList[current].questionIsAttempted) st += " bg-success";
    else st += " bg-danger";

    return (
      <div className="row f-block ">
        {/* {Question Panel} */}
        <div className="col-8 p-3">
          <div>
            <h2 className={st}>{`${current + 1}) ${
              questionList[current].questionContent
            }`}</h2>
            {questionList[current].questionOptions &&
              questionList[current].questionOptions.map((opt, indexOpt) => {
                let st1 = "btn btn-primary w-50 my-1 p-2";
                if (opt.optionIsSelected) st1 += " bg-dark";
                else st1 += " bg-primary";
                return (
                  <div key={indexOpt}>
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
          <div className="">
            <button
              className="btn btn-primary mx-1 w-25 p-2 "
              onClick={nextQue}
            >
              Next
            </button>
            <button
              className="btn btn-primary mx-1 w-25 p-2 "
              onClick={prevQue}
            >
              Before
            </button>
            <button
              className="btn btn-primary mx-1 w-25 p-2 "
              onClick={() => MarkForReview(current)}
            >
              Mark For Review
            </button>
          </div>
        </div>
        <div className="col-4">
          <h2>Block will display</h2>
        </div>
      </div>
    );
  } else {
    return <h1>Nothing</h1>;
  }
}

export default TakeQuiz;
