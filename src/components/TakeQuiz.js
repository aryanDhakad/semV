import React, { useRef, useState, useEffect } from "react";
import { db } from "../firebase";

function TakeQuiz() {
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

  if (loading) {
    return <h1>Loading ....</h1>;
  }

  return (
    <div>
      <h1>TAKE QUIZ PAGE</h1>
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
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger ml-3 rounded-pill"
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

export default TakeQuiz;
