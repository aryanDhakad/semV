import React from "react";
import Signup from "./components/Signup";
import { Container } from "react-bootstrap";
import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./components/Login";
import CreateQuiz from "./components/createQuiz";
import TakeQuiz from "./components/TakeQuiz";
import StudentDash from "./components/StudentDash";
import TeacherDash from "./components/TeacherDash";
import ReviewTest from "./components/ReviewTest";
import CreateQuizForm from "./components/createQuizForm";
import "./App.css";
function App() {
  return (
    <div className="p-2" style={{ minHeight: "100vh" }}>
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
    </div>
  );
}

export default App;
