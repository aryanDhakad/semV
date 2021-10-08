import React from "react";
import Signup from "./Signup";
import { Container } from "react-bootstrap";
import { AuthProvider } from "../contexts/AuthContext";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./Login";
import PrivateRoute from "./PrivateRoute";
import ForgotPassword from "./ForgotPassword";
import UpdateProfile from "./UpdateProfile";
import CreateQuiz from "./createQuiz";
import TakeQuiz from "./TakeQuiz";
import StudentDash from "./StudentDash";
import TeacherDash from "./TeacherDash";
import ReviewTest from "./ReviewTest";
import CreateQuizForm from "./createQuizForm";

function App() {
  return (
    // <Exp />
    <Container className="" style={{ minHeight: "100vh" }}>
      <div>
        <Router>
          <AuthProvider>
            <Switch>
              <Route exact path="/" component={Login} />
              <PrivateRoute path="/update-profile" component={UpdateProfile} />
              <Route path="/signup" component={Signup} />
              <Route path="/login" component={Login} />
              <Route path="/forgot-password" component={ForgotPassword} />
              <Route path="/create-quiz" component={CreateQuiz} />
              <Route path="/take-quiz" component={TakeQuiz} />
              <Route path="/studentDash" component={StudentDash} />
              <Route path="/teacherDash" component={TeacherDash} />
              <Route path="/create-quiz-form" component={CreateQuizForm} />
              <Route path="/review-test" component={ReviewTest} />
            </Switch>
          </AuthProvider>
        </Router>
      </div>
    </Container>
  );
}

export default App;
