import React, { useRef, useState, useEffect } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
// import { db } from "../firebase";
import PopupSignIn from "./PopupSignIn";
import loginPage from "../images/loginPage.jpeg";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState("");
  const history = useHistory();

  function radioChange(e) {
    const { value } = e.target;
    setType(value);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    await login(emailRef.current.value, passwordRef.current.value)
      .then((cred) => {
        setLoading(false);
        localStorage.setItem("type", type);
        if (type === "Student") {
          history.push("/studentDash");
          // db.collection("Student")
          //   .doc(cred.user.email)
          //   .get()
          //   .then((doc) => {
          //     if (doc.exists) {
          //       history.push("/studentDash");
          //     } else {
          //       setError("User Not Found");
          //     }
          //   });
        } else if (type === "Teacher") {
          history.push("/teacherDash");
          // db.collection("Student")
          //   .doc(cred.user.email)
          //   .get()
          //   .then((doc) => {
          //     if (doc.exists) {
          //       history.push("/teacherDash");
          //     } else {
          //       setError("User Not Found");
          //     }
          //   });
        } else {
          history.push("/");
        }
      })
      .catch((err) => {
        console.log(err);
        setError(`${err.message}`);
        setLoading(false);
      });
  }

  return (
    <div style={{ color: "#F1732B" }}>
      <div className="text-center">
        <h3
          className="  display-3 mb-4 px-1  d-inline-block mx-auto mainLogo"
          style={{
            letterSpacing: "12px",
            fontWeight: "bold",
          }}
        >
          <FontAwesomeIcon icon={["fas", "atom"]} spin className="mr-4" />
          Quizzy
        </h3>
      </div>

      <div className="row">
        <div className="col-9 p-0">
          <img
            src={loginPage}
            alt="loginPage"
            style={{ height: "80%", width: "100%" }}
          />
        </div>
        <div className="col-3 p-0">
          <div className=" ">
            <Form onSubmit={handleSubmit}>
              <Card>
                <Card.Body>
                  <h2 className="text-center mb-4">Log In</h2>
                  {error && <Alert variant="danger">{error}</Alert>}

                  <Form.Group id="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" ref={emailRef} required />
                  </Form.Group>
                  <Form.Group id="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" ref={passwordRef} required />
                  </Form.Group>
                  <Form.Group className="d-flex justify-content-center">
                    <Form.Label className="mx-4">
                      Student
                      <Form.Control
                        type="radio"
                        name="type"
                        value="Student"
                        checked={type === "Student"}
                        onChange={radioChange}
                      />
                    </Form.Label>
                    <Form.Label className="mx-4">
                      Teacher
                      <Form.Control
                        type="radio"
                        name="type"
                        value="Teacher"
                        checked={type === "Teacher"}
                        onChange={radioChange}
                      />
                    </Form.Label>
                  </Form.Group>
                  {/* <Link to="/signup">Create Account</Link> */}
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between">
                  <div className="row w-100">
                    <div className="col-6 p-1">
                      <Button
                        disabled={loading}
                        className=" rounded btn-block "
                        type="submit"
                        style={{ backgroundColor: "#F1732B" }}
                      >
                        <FontAwesomeIcon icon={["fas", "sign-in-alt"]} />
                      </Button>
                    </div>
                    <div className="col-6 p-1">
                      <PopupSignIn
                        setError={setError}
                        loading={loading}
                        type={type}
                      />
                    </div>
                  </div>
                </Card.Footer>
              </Card>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
