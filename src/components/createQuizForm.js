import React, { useState, useCallback, useEffect } from "react";
import XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.css";
import { Form, Button, Alert } from "react-bootstrap";

import { useHistory, Link } from "react-router-dom";

import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import * as emailjs from "emailjs-com";
import Loader from "./Loader";

import { v4 as uuid } from "uuid";


function CreateQuizForm() {
  let item = JSON.parse(localStorage.getItem("quizInfo"));
  const [info, setInfo] = useState(item);

  const [questionList, setQuestionList] = useState([]);
  const { currentUser } = useAuth();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getData() {
      setLoading(true);

      setInfo((prev) => {
        return {
          ...prev,
          instructorName: currentUser.displayName,
          instructorEmail: currentUser.email,
        };
      });

      // console.log(
      //   taEmailListRef.current.files,
      //   studentEmailListRef.current.files
      // );

      if (info.quizUUID !== "") {
        await db
          .collection("quizInfo")
          .doc(info.quizUUID)
          .collection("questions")
          .get()
          .then((snapshot) => {
            let data = snapshot.docs.map((doc) => doc.data());
            setQuestionList([...data]);
          });
      }
      setLoading(false);
    }

    const type = localStorage.getItem("type");
    if (type !== "Teacher") {
      alert("Access Denied");
      history.push("/login");
    } else {
      getData();
    }
  }, [currentUser.displayName, currentUser.email, history, info.quizUUID]);

  function handleChange(e) {
    const { name, value } = e.target;
    // if quiz name already exists, set error

    setInfo((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  }
  const handleFileChange = useCallback((e) => {
    try {
      // Reading data from excel file
      const file = e.target.files[0];

      var reader = new FileReader();
      reader.onload = function (e) {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: "array" });
        var firstSheet = workbook.SheetNames[0];

        const elements = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);

        // Converting json to array
        var jsArray = JSON.parse(JSON.stringify(elements));

        if (file.name === "ta-list.xlsx" || file.name === "ta-list.xls") {
          let taEmailList = [];
          for (let i = 0; i < jsArray.length; i++) {
            taEmailList.push(jsArray[i].Email);
          }

          setInfo((prev) => {
            return {
              ...prev,
              quizTaEmailList: taEmailList,
            };
          });
        } else if (
          file.name === "student-list.xlsx" ||
          file.name === "student-list.xls"
        ) {
          let studentEmailList = [];
          for (let i = 0; i < jsArray.length; i++) {
            studentEmailList.push(jsArray[i].Email);
          }

          setInfo((prev) => {
            return {
              ...prev,
              quizStudentEmailList: studentEmailList,
            };
          });
        } else {
          let arr = [];
          for (let i = 0; i < jsArray.length; i++) {
            let questionTemp = {};
            let questionNo = jsArray[i].questionNo.toString();
            let questionContent = jsArray[i].questionContent;
            let questionOption = jsArray[i].questionOption;
            let optionContent = jsArray[i].optionContent;
            let optionIsCorrect = jsArray[i].optionIsCorrect;
            let optionWeightage = jsArray[i].optionWeightage.toString();

            let questionOptionArr = questionOption.split(",");
            let optionContentArr = optionContent.split(",,");
            let optionWeightageArr = optionWeightage.split(",");
            let optionIsCorrectArr = optionIsCorrect.split(",");

            let allOptions = [];
            for (var x = 0; x < questionOptionArr.length; x++) {
              allOptions.push({
                optionContent: optionContentArr[x],
                optionIsCorrect:
                  optionIsCorrectArr[x] === "True" ? true : false,
                optionWeightage: optionWeightageArr[x],
                optionIsSelected: false,
              });
            }
            questionTemp = {
              questionNo: questionNo,
              questionContent: questionContent,
              questionOptions: allOptions,
              questionIsAttempted: false,
              questionIsMarked: false,
            };
            arr.push(questionTemp);
          }

          setQuestionList(arr);
        }
      };

      if (file) reader.readAsArrayBuffer(file);
    } catch (e) {
      console.log(e);
    }
  }, []);

  // Making random string for uuid
  function makeId(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  // Submitting values
  async function handleSubmit(e) {
    setLoading(true);
    e.preventDefault();

    // generating uuid
    var tempUUID = info.quizName.split(" ");

    var finalID = "";
    for (var i = 0; i < tempUUID.length; i++) {
      finalID += tempUUID[i];
      finalID += "_";
    }
    finalID += makeId(5);
    info.quizUUID = info.quizUUID ? info.quizUUID : finalID;
    // console.log("tempUUID: " + tempUUID);

    // if(info.quizName === "" || info.quizTimeStart === "" || info.quizTimeEnd === "" ||){
    //   setError("Fill All detais");
    //   setLoading(false);
    //   return;
    // }

    if (info.quizStudentEmailList.length === 0) {
      setError("No Student Email Listprovided!");
      setLoading(false);
      return;
    }

    // final quiz information

    await db
      .collection("quizInfo")
      .doc(info.quizUUID)
      .set(Object.assign({}, info))
      .then(() => {
        localStorage.setItem("quizInfo", JSON.stringify(info));
        // console.log("Created quiz");
      });

    for (var y = 0; y < questionList.length; y++) {
      await db
        .collection(`quizInfo/${info.quizUUID}/questions`)
        .doc(questionList[y].questionNo.toString())
        .set(questionList[y]);
    }

    // sending emails to students
    var studentEmailList = info.quizStudentEmailList;
    var n = studentEmailList.length;
    if (n === 0) {
      alert("No Emails Provided!");
    } else {
      for (var j = 0; j < n; j++) {

        // store token in db
        var token = uuid();

        var tokenInfo = {
          token: token,
          quizUUID: info.quizUUID,
          studentEmail: studentEmailList[j],
        };

        console.log(tokenInfo);
        await db
          .collection("tokens")
          .doc(token)
          .set(tokenInfo)
          .then(() => {
            console.log("created token");
          });

        var contactParam = {
          to_email: studentEmailList[j],
          quizUUID: info.quizUUID,
          quiz_start: info.quizTimeStart,
          quiz_end: info.quizTimeEnd,
          instructor_name: info.instructorName,
          instructor_email: info.instructorEmail,
          quiz_weightage: info.quizWeightage,
          token: token,
        };
        // console.log("sending email to " + userEmail);
        emailjs
          .send(
            "service_quizzy",
            "template_iszrcak",
            contactParam,
            "user_a1Gz7NxOzg08tk9jMMEmL"
          )
          .then(function (res) { });
      }
    }

    setLoading(false);

    history.push("/create-quiz");
  }

  if (loading || !currentUser) {
    return <Loader />;
  }

  return (
    <div className="justify-content-center ">
      <div className="mx-auto mb-3 createForm" style={{ width: "60%" }}>
        <h2>Enter Quiz Information</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="exampleForm.ControlInput1">
            <Form.Label>Quiz Name:</Form.Label>
            <Form.Control
              type="text"
              name="quizName"
              value={info.quizName}
              onChange={handleChange}
              required



            />
          </Form.Group>

          <Form.Group controlId="exampleForm.ControlInput1">
            <Form.Label>Quiz Time Start:</Form.Label>
            <Form.Control
              type="datetime-local"
              name="quizTimeStart"
              value={info.quizTimeStart}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="exampleForm.ControlInput1">
            <Form.Label>Quiz Time End:</Form.Label>
            <Form.Control
              type="datetime-local"
              name="quizTimeEnd"
              value={info.quizTimeEnd}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="exampleForm.ControlInput1" className="page">
            <Form.Label>Let students review test after it ends :</Form.Label>
            <input
              type="checkbox"
              className=" mx-4"
              name="quizLetReview"
              checked={info.quizLetReview}
              onChange={() => { }}
              onClick={() =>
                setInfo((prev) => {
                  return {
                    ...prev,
                    quizLetReview: !prev.quizLetReview,
                  };
                })
              }
            />
          </Form.Group>
          <Form.Group controlId="exampleForm.ControlInput1">
            <Form.Label>Quiz Total Points :</Form.Label>
            <Form.Control
              type="text"
              name="quizWeightage"
              value={info.quizWeightage}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="exampleForm.ControlTextarea1">
            <Form.Label>Quiz Instructions:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="quizInstructions"
              value={info.quizInstructions}
              // defaultValue="Enter instructions here..."
              onChange={handleChange}
              required
            />
          </Form.Group>
          {/* <Form.Group controlId="formFile">
            <Form.Label>
              TA List (.xls and .xlsx):
              {info.quizTaEmailList.length ? (
                <span className="badge badge-pill badge-success">
                  File Uploaded
                </span>
              ) : (
                <span className="badge badge-pill badge-danger">
                  File Missing
                </span>
              )}
            </Form.Label>
            <Form.Control
              type="file"
              name="taList"
              onChange={handleFileChange}
           required
              />
          </Form.Group> */}

          <a
            className="badge badge-info badge-pill p-2 m-2"
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.google.com/document/d/1HLln3DDiDUr0q4Bs0brsxgEJVRPVr9QlYTzrUefeYTI/edit?usp=sharing"
          >
            Quizzy Documentation
          </a>

          <Form.Group controlId="formFile">
            <Form.Label>
              Student List (.xls and .xlsx):
              {info.quizStudentEmailList.length ? (
                <span className="badge badge-pill badge-success">
                  File Uploaded
                </span>
              ) : (
                <span className="badge badge-pill badge-danger">
                  File Missing
                </span>
              )}
            </Form.Label>
            <Form.Control
              type="file"
              name="studentList"
              accept=".xls,.xlsx"
              data-bs-toggle="tooltip"
              data-bs-placement="right"
              title="Format :  student-list.(xls/xlsx)"
              onChange={handleFileChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formFile">
            <Form.Label>
              Question List (.xls and .xlsx):
              {questionList.length ? (
                <span className="badge badge-pill badge-success">
                  File Uploaded
                </span>
              ) : (
                <span className="badge badge-pill badge-danger">
                  File Missing
                </span>
              )}
            </Form.Label>
            <Form.Control
              type="file"
              name="questionList"
              accept=".xls,.xlsx"
              data-bs-toggle="tooltip"
              data-bs-placement="right"
              title="Format :  quiz_questions.(xls/xlsx)"
              onChange={handleFileChange}
              required
            />
          </Form.Group>

          {error && <Alert variant="danger">{error}</Alert>}

          <Button variant="primary" type="submit">
            Save Quiz Information
          </Button>
          <Link to="/create-quiz" className="mx-3">
            Go To Editing{" "}
          </Link>
        </Form>
      </div>
    </div>
  );
}

export default CreateQuizForm;
