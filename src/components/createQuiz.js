import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";

function CreateQuiz() {
  const quizID = useRef();

  const [loading, setLoading] = useState(false);

  const [option, setOption] = useState({
    optionContent: "",
    optionIsCorrect: false,
    optionWeightage: 1,
  });

  const [question, setQuestion] = useState({
    questionNo: "",
    questionContent: "",
    questionOptions: [option, option, option],
  });

  const [error, setError] = useState(null);
  const [questionList, setQuestionList] = useState([]);

  const [optionId, setOptionId] = useState(-1);

  useEffect(() => {
    setLoading(true);
    db.ref("quiz").on("value", (snapshot) => {
      // console.log(snapshot.val());
      setQuestionList([...Object.values(snapshot.val() || {})]);
      setLoading(false);
    });
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "questionNo") {
      db.ref("quiz")
        .child(value || "-1")
        .on("value", (snapshot) => {
          if (snapshot.val()) setError("Question Already Exists");
          else setError("");
        });
    }

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

  async function addQuestion() {
    if (
      question.questionOptions.length === 0 ||
      question.questionContent === ""
    ) {
      setError("Question Incomplete or Improper.");
      return;
    }
    await db.ref("quiz/" + question.questionNo).set(question);
    db.ref("quiz").on("value", (snapshot) => {
      // console.log(snapshot.val());
      setQuestionList([...Object.values(snapshot.val() || {})]);
    });
    setQuestion({
      questionNo: "",
      questionContent: "",
      questionOptions: [option, option, option],
    });
    setOption({
      optionContent: "",
      optionIsCorrect: false,
      optionWeightage: 1,
    });
    setError("");
  }

  function updateOption(id) {
    setOptionId(id);
    setOption(question.questionOptions[id]);
  }
  function updateOptionAndSubmit() {
    setQuestion((prev) => {
      return {
        ...prev,
        questionOptions: question.questionOptions.map((item, index) => {
          if (index !== optionId) {
            return item;
          } else {
            return option;
          }
        }),
      };
    });
    setOptionId(-1);
    setOption({
      optionContent: "",
      optionIsCorrect: false,
      optionWeightage: 1,
    });
  }

  function updateQuestion(id) {
    setQuestion(questionList[id]);
  }

  function deleteOption(id) {
    setQuestion((prev) => {
      return {
        ...prev,
        questionOptions: question.questionOptions.filter((item, index) => {
          return index !== id;
        }),
      };
    });
    setOptionId(-1);
  }

  async function deleteQuestion(id) {
    if (id === undefined || id === null || id === "") {
      console.log(id);
      return;
    }

    await db.ref("quiz").child(id).remove();
    db.ref("quiz").on("value", (snapshot) => {
      // console.log(snapshot.val());
      setQuestionList([...Object.values(snapshot.val() || {})]);
    });
  }

  if (loading) {
    return <h1>Loading ....</h1>;
  }
  return (
    <div className="py-5">
      {/* <div className="my-5 ">
        <label className="w-100">
          Unique ID for the quiz :
          <input
            type="text"
            id="quizID"
            className="form-control"
            ref={quizID}
          />
        </label>
      </div> */}
      <h3 className="text-danger text-center "> NOTE : {error}</h3>

      <div className="row px-5">
        <div className="col-7 px-1 py-1">
          <button className="btn btn-success w-100" onClick={addQuestion}>
            Add/Update Question
          </button>
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
            row="30"
            col="90"
            value={question.questionContent}
            onChange={handleChange}
          ></textarea>
        </div>
        <div className="col-5 px-5 py-3">
          <div className="row p-0">
            <div className="col-6 p-1">
              <button
                className="btn btn-primary  rounded-pill w-100"
                onClick={addOption}
              >
                Add Option
              </button>
            </div>
            <div className="col-6 p-1">
              <button
                className="btn btn-primary  rounded-pill w-100"
                onClick={updateOptionAndSubmit}
              >
                Update
              </button>
            </div>
          </div>

          <div className="row">
            <div className="col-4">
              <label className="">
                IsCorrect
                <input
                  type="checkbox"
                  className="form-control"
                  name="optionIsCorrect"
                  checked={option.optionIsCorrect}
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
          <textarea
            name="optionContent"
            className="form-control"
            row="10"
            col="60"
            value={option.optionContent}
            onChange={handleChange1}
          ></textarea>
        </div>
      </div>
      <div className="my-5 ">
        <div className="">
          {question.questionOptions.map((item, index) => {
            let prop1 = index === optionId ? "shadow-lg" : "";
            let itemCurrent = index === optionId ? option : item;
            return (
              <div key={index} className={`row my-2 ${prop1}`}>
                <div className="col-10">
                  <p>{itemCurrent.optionContent}</p>
                </div>
                <div className="col-2">
                  {itemCurrent.optionIsCorrect ? <p>CORRECT</p> : <p>WRONG</p>}
                  <p>{itemCurrent.optionWeightage}</p>
                </div>
                <button
                  className="btn btn-danger ml-3 rounded-pill"
                  onClick={() => deleteOption(index)}
                >
                  Delete Option
                </button>
                <button
                  className="btn btn-primary ml-3 rounded-pill px-3 py-1"
                  onClick={() => updateOption(index)}
                >
                  Select
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="d-flex flex-wrap">
        {questionList &&
          questionList.map((item, index) => {
            return (
              <div
                key={index}
                className="my-2 p-2 fs-1 w-50 d-flex flex-wrap align-items-center justify-content-center "
              >
                <h2>{`${item.questionNo}) ${item.questionContent}`}</h2>
                <table className="table table-striped table-dark ">
                  <tbody>
                    {item.questionOptions &&
                      item.questionOptions.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td className="col-10">
                              <p>{item.optionContent}</p>
                            </td>
                            <td className="col-2">
                              {item.optionIsCorrect ? (
                                <p>Correct</p>
                              ) : (
                                <p>InCorrect</p>
                              )}
                            </td>
                            <td>{item.optionWeightage}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                <div>
                  <button
                    type="button"
                    className="btn btn-primary ml-3 rounded-pill px-3 py-1"
                    onClick={() => updateQuestion(index)}
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger ml-3 rounded-pill"
                    onClick={() => deleteQuestion(item.questionNo)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default CreateQuiz;
