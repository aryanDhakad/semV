import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import ReactHtmlParser from "react-html-parser";
import Loader from "./Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function CreateQuiz() {
  let quizInfo = localStorage.getItem("quizInfo");
  quizInfo = JSON.parse(quizInfo);

  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState("question");
  const [editorStateQuestion, setEditorStateQ] = useState(
    EditorState.createEmpty()
  );
  const [editorStateOption, setEditorStateO] = useState(
    EditorState.createEmpty()
  );

  const [option, setOption] = useState({
    optionContent: "",
    optionIsCorrect: false,
    optionWeightage: 1,
    optionIsSelected: false,
  });

  const [question, setQuestion] = useState({
    questionNo: "",
    questionContent: "",
    questionOptions: [],
    questionIsAttempted: false,
    questionIsMarked: false,
  });

  const [error, setError] = useState(null);
  const [questionList, setQuestionList] = useState([]);

  const [optionId, setOptionId] = useState(-1);

  async function getData() {
    await db
      .collection("quizInfo/" + quizInfo.quizUUID + "/questions")
      .get()
      .then((snapshot) => {
        let document = snapshot.docs.map((doc) => doc.data());

        setQuestionList([...(document || [])]);
      });
  }

  useEffect(() => {
    setLoading(true);
    getData();
    setLoading(false);
  }, []);

  useEffect(() => {
    setQuestion((prev) => {
      return {
        ...prev,
        questionContent: draftToHtml(
          convertToRaw(editorStateQuestion.getCurrentContent())
        ),
      };
    });
  }, [editorStateQuestion]);

  useEffect(() => {
    setOption((prev) => {
      return {
        ...prev,
        optionContent: draftToHtml(
          convertToRaw(editorStateOption.getCurrentContent())
        ),
      };
    });
  }, [editorStateOption]);

  function convertToDraft(content, type) {
    const contentBlock = htmlToDraft(content);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      const editorState = EditorState.createWithContent(contentState);

      if (type === "question") setEditorStateQ(editorState);
      else if (type === "option") {
        setEditorStateO(editorState);
      }
    }
  }

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
      optionIsSelected: false,
    });
    setEditorStateO(EditorState.createEmpty());
  }

  async function addQuestion() {
    setLoading(true);
    if (
      question.questionOptions.length === 0 ||
      question.questionContent === ""
    ) {
      setError("Question Incomplete or Improper.");
      return;
    }
    await db
      .collection(`quizInfo/${quizInfo.quizUUID}/questions`)
      .doc(question.questionNo)
      .set(question);

    getData();

    setQuestion({
      questionNo: "",
      questionContent: "",
      questionOptions: [option, option, option],
      questionIsAttempted: false,
      questionIsMarked: false,
    });
    setOption({
      optionContent: "",
      optionIsCorrect: false,
      optionWeightage: 1,
      optionIsSelected: false,
    });
    setError("");
    setEditorStateQ(EditorState.createEmpty());
    setEditorStateO(EditorState.createEmpty());
    setLoading(false);
  }

  function updateOption(id) {
    setOptionId(id);
    setOption(question.questionOptions[id]);
    convertToDraft(question.questionOptions[id].optionContent, "option");
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
      optionIsSelected: false,
    });
    setEditorStateO(EditorState.createEmpty());
  }

  function updateQuestion(id) {
    setQuestion(questionList[id]);
    convertToDraft(questionList[id].questionContent, "question");
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
      return;
    }
    setLoading(true);
    await db
      .collection("quizInfo/" + quizInfo.quizUUID + "/questions")
      .doc(id)
      .delete();

    getData();
    setLoading(false);
  }

  function radioChange(e) {
    let { value } = e.target;

    setEdit(value);
  }

  function showTime(time) {
    let t = new Date(time);
    return t.toLocaleString("en-US");
  }

  if (loading) {
    return <Loader />;
  }
  return (
    <div className="p-2 ">
      <div className="row px-3 mx-3 my-5 fss d-flex justify-content-around align-items-center lft-border">
        <div className="  col-md-8 d-flex justify-content-around ">
          <ul className="list-group ml-4">
            <li className="list-group-item">{quizInfo.quizName}</li>
            <li className="list-group-item">{quizInfo.quizUUID}</li>
          </ul>
          <ul className="list-group ml-4">
            <li className="list-group-item">
              {showTime(quizInfo.quizTimeStart)}
            </li>
            <li className="list-group-item">
              {showTime(quizInfo.quizTimeEnd)}
            </li>
          </ul>
        </div>
        <div className="  col-md-4 ">
          <Link to="/create-quiz-form" className="mx-3">
            Edit Quiz Info
          </Link>

          <Link to="/teacherDash" className="mx-3">
            Exit
          </Link>
        </div>
      </div>

      <div className="row">
        <div className="col-md-5">
          {/* Question List */}
          <div
            className=" overflow-auto pl-3 pr-5"
            style={{ maxHeight: "140vh" }}
          >
            {questionList &&
              questionList.map((item, index) => {
                return (
                  <div key={index} className="my-5 lft-border ">
                    <div className="row">
                      <div className="col-md-4">
                        <h3>
                          <strong>{item.questionNo}</strong>
                        </h3>
                      </div>
                      <div className="col-md-8 d-flex justify-content-end">
                        <button
                          type="button"
                          className="btn btn-primary  mr-4 rounded px-3 py-1"
                          onClick={() => updateQuestion(index)}
                          data-bs-toggle="tooltip"
                          data-bs-placement="right"
                          title="Edit Question"
                        >
                          <FontAwesomeIcon icon={["fas", "edit"]} />
                        </button>

                        <button
                          type="button"
                          className="btn btn-danger  mr-4 rounded"
                          onClick={() => deleteQuestion(item.questionNo)}
                          data-bs-toggle="tooltip"
                          data-bs-placement="right"
                          title="Delete Question"
                        >
                          <FontAwesomeIcon icon={["fas", "trash"]} />
                        </button>
                      </div>
                    </div>
                    <h5>{ReactHtmlParser(item.questionContent)} </h5>

                    <table className="table table-striped  ">
                      <tbody>
                        {item.questionOptions &&
                          item.questionOptions.map((item, index) => {
                            return (
                              <tr key={index}>
                                <td className="col-md-10 p-0">
                                  {ReactHtmlParser(item.optionContent)}
                                </td>
                                <td className="col-md-1 p-0">
                                  {item.optionIsCorrect ? (
                                    <FontAwesomeIcon
                                      icon={["fas", "check-circle"]}
                                    />
                                  ) : (
                                    <FontAwesomeIcon
                                      icon={["fas", "times-circle"]}
                                    />
                                  )}
                                </td>
                                <td className="col-md-1 p-0">
                                  {item.optionWeightage}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="col-md-7">
          <div className="row mb-4 page ">
            <div className="col-md-5 form-label lft-border  ">
              <h5 className="d-inline ">Edit Question :</h5>

              <input
                type="radio"
                className="mx-5 px-3 "
                name="edit"
                value="question"
                checked={edit === "question"}
                onChange={() => {}}
                onClick={radioChange}
              />
            </div>

            <div className="col-md-5 offset-1 form-label lft-border  ">
              <h5 className="d-inline "> Edit Option :</h5>
              <input
                type="radio"
                className="mx-5 px-3 "
                name="edit"
                value="option"
                checked={edit === "option"}
                onChange={() => {}}
                onClick={radioChange}
              />{" "}
            </div>
          </div>

          <div className="row px-2 page">
            {edit === "question" ? (
              <div className="px-1 py-1">
                <div className="row">
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="questionNo"
                      className="form-control"
                      value={question.questionNo}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <button
                      className="btn btn-success w-100"
                      onClick={addQuestion}
                    >
                      Add/Update Question
                    </button>
                  </div>
                </div>
                <div className="px-5 mx-3 mt-3 pt-3 lft-border">
                  <Editor
                    editorState={editorStateQuestion}
                    toolbarClassName="toolbarClassName"
                    wrapperClassName="wrapperClassName"
                    editorClassName="editorClassName"
                    onEditorStateChange={setEditorStateQ}
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className=" px-4 py-3">
                  <div className="d-flex justify-content-between align-items-center ">
                    <div className=" px-3 lft-border">
                      <button
                        className="btn btn-primary"
                        onClick={addOption}
                        data-bs-toggle="tooltip"
                        data-bs-placement="right"
                        title="Add Option"
                      >
                        <div>
                          <FontAwesomeIcon icon={["fas", "plus"]} />
                        </div>
                      </button>
                    </div>
                    <div className=" px-3 lft-border">
                      <button
                        className="btn btn-primary "
                        onClick={updateOptionAndSubmit}
                        data-bs-toggle="tooltip"
                        data-bs-placement="right"
                        title="Edit Option"
                      >
                        <FontAwesomeIcon icon={["fas", "edit"]} />
                      </button>
                    </div>

                    <div className="text-center px-3 lft-border">
                      <h5 className="">IsCorrect</h5>
                      <input
                        type="checkbox"
                        className=""
                        name="optionIsCorrect"
                        checked={option.optionIsCorrect}
                        onChange={handleChange1}
                      />
                    </div>
                    <div className="text-center px-3 lft-border">
                      <label className="">
                        <h5>Weightage </h5>
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
                  <div className="px-5 mx-3 mt-3 pt-3 lft-border">
                    <Editor
                      editorState={editorStateOption}
                      toolbarClassName="toolbarClassName"
                      wrapperClassName="wrapperClassName"
                      editorClassName="editorClassName"
                      onEditorStateChange={setEditorStateO}
                    />
                  </div>
                </div>

                {/* Options of Editor */}
                <div className="my-5 ">
                  <div className="">
                    {question.questionOptions.map((item, index) => {
                      let prop1 = index === optionId ? "shadow-lg" : "";
                      let itemCurrent = index === optionId ? option : item;
                      return (
                        <div
                          key={index}
                          className={` my-2 ${prop1}  w-50 d-inline-block lft-border `}
                        >
                          <div
                            className="mb-4 align-items-center p-2 d-flex overflow-hidden"
                            style={{ maxHeight: "20vh" }}
                          >
                            <div>
                              {ReactHtmlParser(itemCurrent.optionContent)}
                            </div>
                          </div>

                          <div className="d-flex justify-content-around">
                            <div className="">
                              {itemCurrent.optionIsCorrect ? (
                                <FontAwesomeIcon
                                  icon={["fas", "check-circle"]}
                                  size="2x"
                                />
                              ) : (
                                <FontAwesomeIcon
                                  icon={["fas", "times-circle"]}
                                  size="2x"
                                />
                              )}
                            </div>
                            <div className="">
                              <h4>{itemCurrent.optionWeightage}</h4>
                            </div>
                            <div className="">
                              <button
                                className="btn btn-danger ml-3 rounded-pill"
                                onClick={() => deleteOption(index)}
                              >
                                <FontAwesomeIcon icon={["fas", "trash"]} />
                              </button>
                            </div>
                            <div className="">
                              <button
                                className="btn btn-primary ml-3 rounded-pill px-3 py-1"
                                onClick={() => updateOption(index)}
                              >
                                <i className="fa fa-edit "></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateQuiz;
