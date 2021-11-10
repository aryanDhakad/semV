import React, { useState, useEffect } from "react";
import { useHistory, useLocation, Route, useParams } from "react-router-dom";
import { Card } from "react-bootstrap";
import { db } from "../firebase";
import "bootstrap/dist/css/bootstrap.css";
import { useAuth } from "../contexts/AuthContext";


export default function StartQuiz() {
    const history = useHistory();

    const { currentUser } = useAuth();
    var token, quizID, studentEmail, quizStartTime;
    const [loading, setLoading] = useState(false);

    // http://localhost:3000/startQuiz/?token=cb1a956c-3934-435a-8ab5-3ebd8dd0791b

    useEffect(() => {
        async function getData() {
            setLoading(true);
            
            token = window.location.search.split("=")[1];

            if(token === ""){
                alert("You are not authorized to acces this page")
                return;
            }
            var isToken=true;
            await db
                .collection("tokens")
                .doc(token)
                .get()
                .then((snapshot) => {
                    if(!snapshot.exists){
                        isToken = false;
                        alert("Invalid token");
                        history.push("/login");
                        return;
                    }
                    else{
                        console.log(snapshot.data());
                        studentEmail = snapshot.data().studentEmail;
                        quizID = snapshot.data().quizUUID;
                    }
                });
            
            if(!isToken){
                return;
            }
            await db
                .collection("quizInfo")
                .doc(quizID)
                .get()
                .then((snapshot) => {                    
                    quizStartTime = snapshot.data().quizTimeStart;
                });

            if(currentUser.email !== studentEmail){
                alert("You can only access this quiz with your own link");
                history.push("/login");
                return;
            }
            else{
                let time = new Date();
                let quizTime = new Date(quizStartTime);

                if(quizTime < time){
                    alert("The quiz was at " + quizTime + " and you missed it.");
                    history.push("/login");
                    return;
                }
                else if((quizTime > time) && ((quizTime.getTime() - time.getTime())/1000 > 300)){
                    let temp = (quizTime.getTime() - time.getTime())/1000;
                    console.log("time left: " + temp);
                    alert("Quiz hasn't started yet, come back at the specified time");
                    history.push("/login");
                    return;
                }
                else{
                    history.push("/studentDash");
                    return;
                }
            }
            setLoading(false);
        }
        if(currentUser === null){
            alert("You are not logged in, login and visit this link again");
            history.push("/login");
            return;
        }
        getData();
      }, []);

    return (
      <div className=" p-3  text-center">
        <div className="row mb-2">
          <div className="col-8">
            <Card className="my-3 lft-border">
              <Card.Header>Loading your quiz, please wait...</Card.Header>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  