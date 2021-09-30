import React, { useRef, useState } from "react";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { store } from "../firebase";

function GetFirestore() {
    // const quizUUIDRef = useRef("");
    const [ quizUUIDTemp, setQuizUUID ] = useState("");

    function handleChange(e) {
        const { name, value } = e.target;
        setQuizUUID((prev) => {
            return {
              ...prev,
              [name]: value,
            };
          });
    }
    async function handleSubmit(e) {
        const { name, value } = e.target;
        e.preventDefault();

        const allData = await store.collection("quizInfo").get()
        .then((snapshot) => {
            snapshot.docs.forEach(doc => {
                let items = doc.data();

                items = JSON.stringify(items, null, 4);

                console.log(items);
            })
        });

        // console.log(allData);
    }
    return (
        <div style={{ display: 'block', width: 700, padding: 30 }}>
            <h2>Enter Quiz Information</h2>
            <Form onSubmit={handleSubmit}>
                <Button variant="primary" type="submit">
                    Get Quiz Info
                </Button>
            </Form>
        </div>
    );
}

export default GetFirestore;