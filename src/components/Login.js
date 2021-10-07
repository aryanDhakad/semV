import React, { useRef, useState, useEffect } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import PopupSignIn from "./PopupSignIn";


export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState("Student");
  const history = useHistory();

  // useEffect(() => {
  //   let timerFunc = setInterval(() => {
  //     setTimer(Date.now());
  //   }, 1000);
  // }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);
    await login(emailRef.current.value, passwordRef.current.value)
      .then((cred) => {
        if (type === "Student") history.push("/studentDash");
        else if (type === "Teacher") history.push("/teacherDash");
        else history.push("/");
      })
      .catch((err) => {
        setError(`${err.message}`);
      });

    setLoading(false);
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <>
     
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Log In</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required />
            </Form.Group>
            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" ref={passwordRef} required />
            </Form.Group>
            <Form.Group>
              <Form.Label className="mx-4">
                Student
                <Form.Control
                  type="radio"
                  checked={type === "Student"}
                  onClick={() => setType("Student")}
                  onChange={() => console.log("Student Selected")}
                />
              </Form.Label>
              <Form.Label className="mx-4">
                Teacher
                <Form.Control
                  type="radio"
                  checked={type === "Teacher"}
                  onClick={() => setType("Teacher")}
                  onChange={() => console.log("Teacher Select")}
                />
              </Form.Label>
            </Form.Group>
            <Button disabled={loading} className="w-100" type="submit">
              Log In
            </Button>
          </Form>
          <div className="w-100 text-center mt-3">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Need an account? <Link to="/signup">Sign Up</Link>
      </div>
      <div className="m-3 p-1">
        <PopupSignIn />
      </div>
    </>
  );
}
