import React from "react";
import Signup from "./Signup";
import { Container } from "react-bootstrap";
import { AuthProvider } from "../contexts/AuthContext";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Login from "./Login";
import PrivateRoute from "./PrivateRoute";
import ForgotPassword from "./ForgotPassword";
import UpdateProfile from "./UpdateProfile";
import CreateQuiz from "./createQuiz";
import TakeQuiz from "./TakeQuiz";

import CreateQuizForm from "./createQuizForm";
import GetFirestore from "./GetFirestore";

function App() {
  return (
    // <Exp />
    <Container
      className="align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div>
        <Router>
          <AuthProvider>
            <Switch>
              <PrivateRoute exact path="/" component={Dashboard} />
              <PrivateRoute path="/update-profile" component={UpdateProfile} />
              <Route path="/signup" component={Signup} />
              <Route path="/login" component={Login} />
              <Route path="/forgot-password" component={ForgotPassword} />
              <Route path="/create-quiz" component={CreateQuiz} />
              <Route path="/take-quiz" component={TakeQuiz} />
              <Route path="/create-quiz-form" component={CreateQuizForm} />
              <Route path="/get-firestore-data" component={GetFirestore} />
            </Switch>
          </AuthProvider>
        </Router>
      </div>
    </Container>
  );
}

export default App;
