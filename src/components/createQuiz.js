import React, { useState, useEffect } from "react";
import { db } from "../firebase";

function CreateQuiz() {
  const [question, setQuestion] = useState({
    questionNo: 0,
    questionContent: "",
    questionOptions: [],
  });

  const [option, setOption] = useState({
    optionContent: "",
    optionIsCorrect: false,
    optionWeightage: 1,
  });

  function handleChange(e) {
    const { name, value } = e.target;

    setQuestion((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  }
  function handleChange1(e) {
    let { name, value } = e.target;

    if (name === "optionIsCorrect") {
      if (e.target.checked) value = true;
      else value = false;
    }

    setOption((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  }

  function addOption() {
    setQuestion((prev) => {
      return {
        ...prev,
        questionOptions: [...prev.questionOptions, option],
      };
    });
    setOption({
      optionContent: "",
      optionIsCorrect: false,
      optionWeightage: 1,
    });
  }

  //   const [questionList, setQuestionList] = useState([]);

  return (
    <div className="">
      <div className="my-5 ">
        <label className="w-100">
          Unique ID for the quiz :
          <input type="text" id="quizID" className="form-control" />
        </label>
      </div>

      <div className="row px-5">
        <div className="col-5 px-5 py-3">
          <label className="">Sr. No.</label>
          <input
            type="text"
            name="questionNo"
            className="form-control"
            value={question.questionNo}
            onChange={handleChange}
          />
          <label>Prompt : </label>
          <textarea
            name="questionContent"
            className="form-control"
            row="10"
            col="60"
            value={question.questionContent}
            onChange={handleChange}
          ></textarea>
        </div>
        <div className="col-7 px-5 py-3">
          <button
            className="btn btn-primary btn-small my-2 w-100"
            onClick={addOption}
          >
            Add Option
          </button>
          <textarea
            name="optionContent"
            className="form-control"
            row="10"
            col="60"
            value={option.optionContent}
            onChange={handleChange1}
          ></textarea>
          <div className="row">
            <div className="col-4">
              <label className="">
                IsCorrect
                <input
                  type="checkbox"
                  className="form-control"
                  name="optionIsCorrect"
                  value={option.optionIsCorrect}
                  onChange={handleChange1}
                />
              </label>
            </div>
            <div className="col-8">
              <label className="">
                Weightage :
                <input
                  type="number"
                  className="form-control"
                  name="optionWeightage"
                  value={option.optionWeightage}
                  onChange={handleChange1}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h5>Sr. No. : {question.questionNo}</h5>
        <h5>Title : {question.questionContent}</h5>
        {question.questionOptions.map((item, index) => {
          return (
            <div key={index} className="row">
              <div className="col-10">
                <p>{item.optionContent}</p>
              </div>
              <div className="col-2">
                {item.optionIsCorrect ? <p>Correct</p> : <p>InCorrect</p>}
                <p>{item.optionWeightage}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CreateQuiz;
