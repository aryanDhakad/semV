import React, { useState, useCallback, useRef, useEffect } from "react";
import XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.css";
import { useHistory } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
function CreateQuizForm() {
  const { setQuizInfo, quizInfo } = useAuth();
  const { currentUser } = useAuth();
  const history = useHistory();
  const [info, setInfo] = useState({
    quizUUID: "",
    quizName: "",
    instructorName: "",
    instructorEmail: "",
    quizInstructions: "",
    quizTimeStart: "",
    quizTimeEnd: "",
    quizLetReview: false,
    quizWeightage: "",
    quizTaEmailList: [],
    quizStudentEmailList: []
  });

  let taEmailList = [];
  let studentEmailList = [];

  let questionList = [];
  const questionListRef = useRef([]);

  const taEmailListRef = useRef([]);
  const studentEmailListRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setLoading(false);
      const elements = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);

      // Converting json to array
      var jsArray = JSON.parse(JSON.stringify(elements));

      if (file.name === "ta-list.xlsx" || file.name === "ta-list.xls") {
        taEmailList.length = 0;
        for (let i = 0; i < jsArray.length; i++) {
          taEmailList.push(jsArray[i].Email);
        }
        taEmailListRef.current = taEmailList;
      } else if (
        file.name === "student-list.xlsx" ||
        file.name === "student-list.xls"
      ) {
        studentEmailList.length = 0;
        for (let i = 0; i < jsArray.length; i++) {
          studentEmailList.push(jsArray[i].Email);
        }
        studentEmailListRef.current = studentEmailList;
      } else {
          questionList.length = 0;
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
            let optionContentArr = optionContent.split(",,")
            let optionWeightageArr = optionWeightage.split(",")
            let optionIsCorrectArr = optionIsCorrect.split(",")

            let allOptions = [];
            for(var x=0; x<questionOptionArr.length; x++){
              allOptions.push({
                optionContent: optionContentArr[x],
                optionIsCorrect: (optionIsCorrectArr[x]==="True") ? true : false,
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
            }
            questionList.push(questionTemp);
          }
          questionListRef.current = questionList;
        }
    };

    setLoading(true);
    reader.readAsArrayBuffer(file);
  }, []);

  // Making random string for uuid
  function makeId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  // Submitting values
  async function handleSubmit(e) {
    e.preventDefault();

    // generating uuid
    var tempUUID = info.quizName.split(" ")[0].concat(makeId(5))
    info.quizUUID = info.quizUUID ? info.quizUUID : tempUUID;
    // console.log("tempUUID: " + tempUUID);
    var quizQuestionList = questionListRef.current;
    console.log(quizQuestionList)

    if(quizQuestionList.length === 0){
      setError("No questions provided!");
      return;
    }
    
    info.quizStudentEmailList = studentEmailListRef.current;
    info.quizTaEmailList = taEmailListRef.current;
    info.instructorName = currentUser.displayName;
    info.instructorEmail = currentUser.email;
    // final quiz information
    await db
      .collection("quizInfo")
      .doc(info.quizUUID)
      .set(Object.assign({}, info))
      .then(() => {
        console.log("Created quiz");
        setQuizInfo(info);
      });

      for(var y=0; y<quizQuestionList.length; y++){
        await db
        .collection(`quizInfo/${info.quizUUID}/questions`)
        .doc((quizQuestionList[y].questionNo).toString())
        .set(quizQuestionList[y]);
      }
      history.push("/create-quiz");
  }

  return (
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
          <Form.Label>TA List (.xls and .xlsx):</Form.Label>
          <Form.Control
            type="file"
            name="taList"
            ref={taEmailListRef}
            onChange={handleFileChange}
          />
        </Form.Group>
        <Form.Group controlId="formFile">
          <Form.Label>Student List (.xls and .xlsx):</Form.Label>
          <Form.Control
            type="file"
            name="taList"
            ref={studentEmailListRef}
            onChange={handleFileChange}
          />
        </Form.Group>
        
        <Form.Group controlId="formFile">
          <Form.Label>Question List (.xls and .xlsx):</Form.Label>
          <Form.Control
            type="file"
            name="questionList"
            ref={questionListRef}
            onChange={handleFileChange}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Save Quiz Information
        </Button>
      </Form>
    </div>
  );
}

export default CreateQuizForm;
