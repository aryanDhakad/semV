import React, { useRef, useState, useEffect } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import { db } from "../firebase";
export default function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const nameRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup, updateProfile, currentUser } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const [type, setType] = useState("");

  function radioChange(e) {
    const { value } = e.target;
    setType(value);
  }


  useEffect(() => {
    if (currentUser) {
      nameRef.current.value = currentUser.displayName;
      setType(localStorage.getItem("type"));
    }
  }, [currentUser]);


  async function handleUpdate(e) {
    // e.preventDefault();
    setError("");
    setLoading(true);
    const profile = {
      displayName: nameRef.current.value,
      email: emailRef.current.value,
      photoURL: "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"
    };
    try {
      await updateProfile(profile);
      setLoading(false);
      history.push("/studentDash");
    }
    catch (error) {
      setLoading(false);
      setError(error.message);
    }
    // await updateProfile(profile);
    // setLoading(false);
    // history.push("/studentDash");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (type === "") {
      setError("Please select a user type");
      return;
    }

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match");
    }
    setError("");
    setLoading(true);
    try{

      const cred = await signup(emailRef.current.value, passwordRef.current.value);
      setLoading(false);
      if (cred) {
        const profile = {
          displayName: nameRef.current.value,
          email: emailRef.current.value,
          photoURL: "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"
        };
        await db.collection("users").doc(cred.user.uid).set({
          userType: type,
          ...profile
        });
        try{
          await updateProfile(profile);
          setLoading(false);
          history.push("/");
        }catch(e){
          setError(e.message);

        }
        setLoading(false);
        
      }
    }catch(e){
      setLoading(false);
      setError(e.message);
    }
 
    // await signup(emailRef.current.value, passwordRef.current.value)
    //   .then((cred) => {
       
    //     updateProfile({ displayName: nameRef.current.value });
    //     localStorage.setItem("type", type);
    //     return cred;

    //   }).then((cred) => {
    //     console.log(cred,type);
    //     db.collection("users").doc(cred.user.uid).set({
    //       displayName: nameRef.current.value,
    //       email: emailRef.current.value,
    //       userType: type

    //     })
    //   })
    //   .then(() => {
    //     setLoading(false);
    //     history.push("/");
    //   })
    //   .catch((err) => {
    //     setError(`${err.message}`);
    //   });
      // setLoading(false);
    
  }

  return (
    <div>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Sign Up</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="name">
              <Form.Label>Name</Form.Label>
              <Form.Control type="name" ref={nameRef} required />
            </Form.Group>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required />
            </Form.Group>
            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" ref={passwordRef} required />
            </Form.Group>
            <Form.Group id="password-confirm">
              <Form.Label>Password Confirmation</Form.Label>
              <Form.Control type="password" ref={passwordConfirmRef} required />
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
            <div className="row">
              <div className="col-3">
                <Button disabled={loading} type="submit">
                  Sign Up
                </Button>

              </div>
              <div className="col-3">
                <Button variant="primary" onClick={() => handleUpdate()}>
                  Update Profile
                </Button>
              </div>

            </div>


          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Already have an account? <Link to="/login">Log In</Link>
      </div>
    </div>
  );
}
