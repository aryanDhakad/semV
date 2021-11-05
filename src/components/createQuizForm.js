import React, { useState, useCallback, useRef, useEffect } from "react";
import XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.css";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { indexToLoc } from "@tensorflow/tfjs-core/dist/util_base";
import * as emailjs from 'emailjs-com';

function CreateQuizForm() {
  let item = JSON.parse(localStorage.getItem("quizInfo"));
  const [info, setInfo] = useState(item);

  const [questionList, setQuestionList] = useState([]);
  const { currentUser } = useAuth();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    getData();
  }, []);

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
          let isMultiCorrect = jsArray[i].isMultiCorrect;

          let questionOptionArr = questionOption.split(",");
          let optionContentArr = optionContent.split(",,");
          let optionWeightageArr = optionWeightage.split(",");
          let optionIsCorrectArr = optionIsCorrect.split(",");

          let allOptions = [];
          for (var x = 0; x < questionOptionArr.length; x++) {
            allOptions.push({
              optionContent: optionContentArr[x],
              optionIsCorrect: optionIsCorrectArr[x] === "True" ? true : false,
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
  }, []);

  // Sending emails
  // Allowing access for emailjs
  (function () {
    emailjs.init('user_a1Gz7NxOzg08tk9jMMEmL');
  })();

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
    for(var i=0; i<tempUUID.length; i++){
      finalID += tempUUID[i];
      finalID += "_";
    }
    finalID += makeId(5);
    info.quizUUID = info.quizUUID ? info.quizUUID : finalID;
        
    if (questionList.length === 0) {
      setError("No questions provided!");
      return;
    }

    // final quiz information
    await db
      .collection("quizInfo")
      .doc(info.quizUUID)
      .set(Object.assign({}, info))
      .then(() => {
        localStorage.setItem("quizInfo", JSON.stringify(info));
        console.log("Created quiz");
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
    if(n == 0){
      alert("No Emails Provided!");
    }
    else{
      for(var i=0; i<n; i++){
        var contactParam = {
          to_email: studentEmailList[i],
          quizUUID: info.quizUUID,
          quiz_start: info.quizTimeStart,
          quiz_end: info.quizTimeEnd,
          instructor_name: info.instructorName,
          instructor_email: info.instructorEmail,
          quiz_weightage: info.quizWeightage,
        };
        // console.log("sending email to " + userEmail);
        emailjs.send('service_quizzy', 'template_iszrcak', contactParam, 'user_a1Gz7NxOzg08tk9jMMEmL').then(function (res) {})
      }
    }

    history.push("/create-quiz");
    setLoading(false);
  }

  async function deleteQuiz() {
    await db.collection("quizInfo").doc(info.quizUUID).delete();

    await db
      .collection("Student")
      .get()
      .then((snapshot) => {
        snapshot.docs.forEach(async (doc) => {
          await db
            .doc("Student/" + doc.id + "/Attempt/" + info.quizUUID)
            .delete();
        });
      });
    localStorage.setItem("quizUUID", "");
    history.push("/teacherDash");
  }

  if (loading) {
    return <h1>Loading ....</h1>;
  }

  return (
    <div>
      <div style={{ display: "block", width: 700, padding: 30 }}>
        <h2>Enter Quiz Information</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="exampleForm.ControlInput1">
            <Form.Label>Quiz Name:</Form.Label>
            <Form.Control
              type="text"
              name="quizName"
              value={info.quizName}
              onChange={handleChange}
            />
          </Form.Group>
          {/* <Form.Group controlId="exampleForm.ControlInput1">
          <Form.Label>Instructor Name:</Form.Label>
          <Form.Control
            type="text"
            name="instructorName"
            value={info.instructorName}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group controlId="exampleForm.ControlInput1">
          <Form.Label>Instructor Email:</Form.Label>
          <Form.Control
            type="email"
            name="instructorEmail"
            value={info.instructorEmail}
            onChange={handleChange}
          />
        </Form.Group> */}

          <Form.Group controlId="exampleForm.ControlInput1">
            <Form.Label>Quiz Time Start:</Form.Label>
            <Form.Control
              type="datetime-local"
              name="quizTimeStart"
              value={info.quizTimeStart}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="exampleForm.ControlInput1">
            <Form.Label>Quiz Time End:</Form.Label>
            <Form.Control
              type="datetime-local"
              name="quizTimeEnd"
              value={info.quizTimeEnd}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="exampleForm.ControlInput1">
            <Form.Label>
              Let Review Test :
              <Form.Control
                type="checkbox"
                name="quizLetReview"
                checked={info.quizLetReview}
                onChange={() => {}}
                onClick={() =>
                  setInfo((prev) => {
                    return {
                      ...prev,
                      quizLetReview: !prev.quizLetReview,
                    };
                  })
                }
              />
            </Form.Label>
          </Form.Group>
          <Form.Group controlId="exampleForm.ControlInput1">
            <Form.Label>Quiz Weightage:</Form.Label>
            <Form.Control
              type="text"
              name="quizWeightage"
              value={info.quizWeightage}
              onChange={handleChange}
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
            />
          </Form.Group>
          <Form.Group controlId="formFile">
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
            />
          </Form.Group>
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
              name="taList"
              onChange={handleFileChange}
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
              onChange={handleFileChange}
            />
          </Form.Group>

          {error && <Alert variant="danger">{error}</Alert>}

          <Button variant="primary" type="submit">
            Save Quiz Information
          </Button>
        </Form>
      </div>
      {info.quizUUID !== "" && (
        <button className="btn btn-danger mx-3" onClick={deleteQuiz}>
          Delete Quiz
        </button>
      )}
    </div>
  );
}

export default CreateQuizForm;
