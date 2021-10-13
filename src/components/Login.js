import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import { db } from "../firebase";
import PopupSignIn from "./PopupSignIn";
import loginPage from "../images/loginPage.jpg";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState("Student");
  const history = useHistory();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);

      await login(emailRef.current.value, passwordRef.current.value)
        .then((cred) => {
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
          } else history.push("/");
        })
        .catch((err) => {
          console.log(err);
          setError(`${err.message}`);
        });
    } catch {
      setError("Failed");
    }

    setLoading(false);
  }

  return (
    <div>
      <div className="container-fluid p-4 rounded-pill display-4 shadow-lg my-2">
        Quizzy
      </div>
      <div
        className="shadow-lg rounded"
        style={{
          backgroundImage: `url(${loginPage})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          height: "100%",
          width: "100%",
        }}
      >
        <div className="w-25 ml-auto">
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
                <Link to="/signup">Create Account</Link>
              </Card.Body>
              <Card.Footer className="d-flex justify-content-between">
                <Button
                  disabled={loading}
                  className="p-3 rounded-pill"
                  type="submit"
                >
                  Log In
                </Button>
                <PopupSignIn setError={setError} loading={loading} />
              </Card.Footer>
            </Card>
          </Form>
        </div>
      </div>
    </div>
  );
}
