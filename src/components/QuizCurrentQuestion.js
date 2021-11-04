import React from "react";
import ReactHtmlParser from "react-html-parser";

function QuizCurrentQuestion({
  current,
  questionList,
  handleClick,
  MarkForReview,
  prevQue,
  nextQue,
}) {
  return (
    <div>
      <div
        style={{
          minHeight: "80vh",
          border: "3px solid black",
          position: "relative",
        }}
        className="p-1"
      >
        <h4 className="py-3 " style={{ height: "45vh", position: "relative" }}>
          {current + 1}{" "}
          <div> {ReactHtmlParser(questionList[current].questionContent)} </div>{" "}
        </h4>
        <div className="">
          {questionList[current].questionOptions &&
            questionList[current].questionOptions.map((opt, indexOpt) => {
              let st1 = "btn btn-primary btn-block py-3";
              if (opt.optionIsSelected) st1 += " bg-dark";
              else st1 += " bg-primary";
              return (
                <div key={indexOpt} className="w-50 my-2 d-inline-block px-3 ">
                  <button
                    className={st1}
                    onClick={() => handleClick(current, indexOpt)}
                  >
                    <div> {ReactHtmlParser(opt.optionContent)} </div>
                  </button>
                </div>
              );
            })}
        </div>
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <button className="btn btn-primary  my-1 w-25 p-2 " onClick={prevQue}>
          Before
        </button>
        <button className="btn btn-primary my-1  w-25 p-2 " onClick={nextQue}>
          Next
        </button>
        <button
          className="btn btn-primary  my-1 w-25 p-2 "
          onClick={() => MarkForReview(current)}
        >
          Mark For Review
        </button>
      </div>
    </div>
  );
}

export default QuizCurrentQuestion;
