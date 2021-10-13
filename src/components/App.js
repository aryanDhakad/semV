import React from "react";
import Signup from "./Signup";
import { Container } from "react-bootstrap";
import { AuthProvider } from "../contexts/AuthContext";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./Login";
import CreateQuiz from "./createQuiz";
import TakeQuiz from "./TakeQuiz";
import StudentDash from "./StudentDash";
import TeacherDash from "./TeacherDash";
import ReviewTest from "./ReviewTest";
import CreateQuizForm from "./createQuizForm";
function App() {
  return (
    <Container className="" style={{ minHeight: "100vh" }}>
      <div>
        <Router>
          <AuthProvider>
            <Switch>
              <Route exact path="/" component={Login} />
              <Route path="/signup" component={Signup} />
              <Route path="/login" component={Login} />
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
