import React, { useState, useCallback, useRef } from "react";
import XLSX from "xlsx";
import 'bootstrap/dist/css/bootstrap.css';
import { Link } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { v4 as uuid4 } from 'uuid';
import { store } from "../firebase";

function CreateQuizForm() {
    const [quizInfo, setQuizInfo] = useState({
        quizUUID: "",
        quizName: "",
        instructorName: "",
        instructorEmail: "",
        quizInstructions: "",
        quizDate: "",
        quizTime: "",
        quizWeightage: "",
        quizTaEmailList: [],
        quizStudentEmailList: [],
    });
    
    let taEmailList = [];
    let studentEmailList = [];
    const taEmailListRef = useRef([]);
    const studentEmailListRef = useRef([]);
    // const quizInstructionsRef = useRef("");
    const [isReading, setIsReading] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        // if quiz name already exists, set error

        setQuizInfo((prev) => {
            return {
                ...prev,
                [name]: value,
            };
        });
    }
    const handleFileChange = useCallback(e => {
        // Reading data from excel file
        const file = e.target.files[0];
        
        var reader = new FileReader();
        reader.onload = function(e) {
          var data = new Uint8Array(e.target.result);
          var workbook = XLSX.read(data, { type: "array" });
          var firstSheet = workbook.SheetNames[0];
          setIsReading(false);
          const elements = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
        
          // Converting json to array
          var jsArray = JSON.parse(JSON.stringify(elements));

          if(file.name === "ta-list.xlsx" || file.name === "ta-list.xls"){
              taEmailList.length = 0;
            for(let i=0; i<jsArray.length; i++){
                taEmailList.push(jsArray[i].Email);
            }
          }
          else if(file.name === "student-list.xlsx" || file.name === "student-list.xls"){
              studentEmailList.length = 0;
            for(let i=0; i<jsArray.length; i++){
                studentEmailList.push(jsArray[i].Email);
            }
          }

          taEmailListRef.current = taEmailList;
          studentEmailListRef.current = studentEmailList;
        };

        setIsReading(true);
        reader.readAsArrayBuffer(file);
      }, []);
    
    // Submitting values 
    async function handleSubmit(e) {
        e.preventDefault();
        
        // generating uuid
        const tempUUID = uuid4();
    
        // final quiz information
        await store.collection("quizInfo").add({
            quizUUID: tempUUID,
            quizName: quizInfo.quizName,
            instructorName: quizInfo.instructorName,
            instructorEmail: quizInfo.instructorEmail,
            quizInstructions: quizInfo.quizInstructions,
            // quizInstructions: quizInstructionsRef.current,
            quizDate: quizInfo.quizDate,
            quizTime: quizInfo.quizTime,
            quizWeightage: quizInfo.quizWeightage,
            quizTaEmailList: taEmailListRef.current,
            quizStudentEmailList: studentEmailListRef.current,
        });

        setQuizInfo({
            quizUUID: "",
            quizName: "",
            instructorName: "",
            instructorEmail: "",
            quizInstructions: "",
            quizDate: "",
            quizTime: "",
            quizWeightage: "",
            quizTaEmailList: [],
            quizStudentEmailList: [],
        });
        // console.log(JSON.stringify(finalQuizInfo, null, 4));
    }
    return (
        <div style={{ display: 'block', width: 700, padding: 30 }}>
            <h2>Enter Quiz Information</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="exampleForm.ControlInput1">
                    <Form.Label>Quiz Name:</Form.Label>
                    <Form.Control 
                        type="text"
                        name="quizName"
                        value={quizInfo.quizName}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="exampleForm.ControlInput1">
                    <Form.Label>Instructor Name:</Form.Label>
                    <Form.Control 
                        type="text"
                        name="instructorName"
                        value={quizInfo.instructorName}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="exampleForm.ControlInput1">
                    <Form.Label>Instructor Email:</Form.Label>
                    <Form.Control 
                        type="email"
                        name="instructorEmail"
                        value={quizInfo.instructorEmail}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="exampleForm.ControlInput1">
                    <Form.Label>Quiz Date:</Form.Label>
                    <Form.Control 
                        type="text"
                        name="quizDate"
                        value={quizInfo.quizDate}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="exampleForm.ControlInput1">
                    <Form.Label>Quiz Time:</Form.Label>
                    <Form.Control 
                        type="text"
                        name="quizTime"
                        value={quizInfo.quizTime}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="exampleForm.ControlInput1">
                    <Form.Label>Quiz Weightage:</Form.Label>
                    <Form.Control 
                        type="text"
                        name="quizWeightage"
                        value={quizInfo.quizWeightage}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Quiz Instructions:</Form.Label>
                    <Form.Control 
                        as="textarea"
                        rows={3}
                        name="quizInstructions"
                        value={quizInfo.quizInstructions}
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
                
                <Button variant="primary" type="submit">
                    Save Quiz Information
                </Button>
            </Form>
        </div>
    );
}

export default CreateQuizForm;