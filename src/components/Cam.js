import React, { useEffect, useState, useRef, useCallback } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
// import {loadGraphModel} from '@tensorflow/tfjs-converter';

// import * as posenet from '@tensorflow-models/posenet';
import Webcam from "react-webcam";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import * as cvstfjs from '@microsoft/customvision-tfjs';

import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

function Cam({ history, setDisp }) {
  let quizInfo = localStorage.getItem("quizInfo");
  quizInfo = JSON.parse(quizInfo);
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);

  const { currentUser } = useAuth();

  // const [videoWidth, setVideoWidth] = useState(960);
  // const [videoHeight, setVideoHeight] = useState(640);
  const [start, setStart] = useState(false);

  const [model, setModel] = useState();
  const [person, setPerson] = useState(false);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }
  }, [webcamRef, setImgSrc]);

  useEffect(() => {
    async function saveSS() {
      await db
        .collection("quizInfo")
        .doc(quizInfo.quizUUID)
        .collection("Defaulters")
        .doc(currentUser.email)
        .set({
          Name: currentUser.displayName,
          Email: currentUser.email,
        });
      await db
        .collection("quizInfo")
        .doc(quizInfo.quizUUID)
        .collection("Defaulters")
        .doc(currentUser.email)
        .collection("Images")
        .add({
          src: imgSrc,
        });
    }
    if (imgSrc) {
      saveSS();
    }
  }, [imgSrc, currentUser, quizInfo]);

  async function loadModel() {
    try {
      const model = await cocoSsd.load();
      setModel(model);

      setStart(true);
    } catch (err) {
      console.log(err);
      console.log("failed load model");
    }
  }

  const play = useCallback(
    async function () {
      let count = 0;
      let violations = 0;

      predictionFunction();

      async function predictionFunction() {
        try {
          const predictions = await model.detect(
            document.getElementById("img")
          );

          var dict = {};
          dict["person"] = 0;
          dict["cell phone"] = 0;
          if (predictions.length > 0) {
            // setPredictionData(predictions);

            for (let n = 0; n < predictions.length; n++) {
              // Check scores

              if (predictions[n].score > 0.5) {
                dict[predictions[n].class] += 1;
                // if (
                //   predictions[n].class !== "person" &&
                //   predictions[n].class !== "cell phone"
                // ) {
                //   continue;
                // }
                console.log(count, predictions[n].class);

                if (dict["person"] > 1 || dict["cell phone"] > 0) {
                  count += 1;

                  if (count > 15) {
                    console.log("Violation");
                    violations++;
                    capture();
                    count = 0;
                    // take_ss();
                  }
                }
              }
            }
          }
          if (dict["person"] === 0) setPerson(false);
          else setPerson(true);

          if (violations <= 5) setTimeout(predictionFunction, 500);
          else {
            alert("you have been caught");
            history.push("/");
          }
        } catch {
          // console.log("error");
        }
      }
    },
    [capture, model, history]
  );

  useEffect(() => {
    tf.ready().then(() => {
      loadModel();
    });
  }, []);

  useEffect(() => {
    if (start) setTimeout(play, 5000);
  }, [start]);

  useEffect(() => {
    if (!person) {
      setDisp("none");
    } else {
      setDisp("block");
    }
  }, [person]);

  // useEffect(() => {
  //   //prevent initial triggering
  //   if (mounted.current) {
  //     play();
  //   } else {
  //     mounted.current = true;
  //   }
  // }, [start]);

  const videoConstraints = {
    height: 160,
    width: 270,
    maxWidth: "100vw",
    facingMode: "environment",
  };

  return (
    <div>
      <div className="row ">
        <div className="col-9 ">
          <Webcam
            audio={false}
            id="img"
            ref={webcamRef}
            screenshotQuality={1}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
          />
        </div>
        <div className="col-3 ">
          {person ? (
            <div className=" ml-1 bg-success jic  ">
              <FontAwesomeIcon icon={["fas", "user-check"]} size="lg" />
            </div>
          ) : (
            <div className=" ml-1 bg-danger jic ">
              <FontAwesomeIcon icon={["fas", "user-alt-slash"]} size="lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cam;
