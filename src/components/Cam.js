import React, { useEffect, useState, useRef, useCallback } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
// import {loadGraphModel} from '@tensorflow/tfjs-converter';

// import * as posenet from '@tensorflow-models/posenet';
import Webcam from "react-webcam";

// import * as cvstfjs from '@microsoft/customvision-tfjs';

import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

function Cam() {
  let item1 = localStorage.getItem("quizInfo");
  item1 = JSON.parse(item1);
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
        .doc(item1.quizUUID)
        .collection("Defaulters")
        .doc(currentUser.email)
        .set({
          Name: currentUser.displayName,
          Email: currentUser.email,
        });
      await db
        .collection("quizInfo")
        .doc(item1.quizUUID)
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
  }, [imgSrc, currentUser, item1]);

  async function loadModel() {
    try {
      const model = await cocoSsd.load();
      setModel(model);
      console.log("setloadedModel");
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
        const predictions = await model.detect(document.getElementById("img"));

        // var cnvs = document.getElementById("myCanvas");

        // // cnvs.style.position = "absolute";

        // var ctx = cnvs.getContext("2d");
        // ctx.clearRect(
        //   0,
        //   0,
        //   webcamRef.current.video.videoWidth,
        //   webcamRef.current.video.videoHeight
        // );
        // setVideoHeight(webcamRef.current.video.videoHeight);
        // setVideoWidth(webcamRef.current.video.videoWidth);
        var dict = {};
        dict["person"] = 0;
        dict["cell phone"] = 0;
        if (predictions.length > 0) {
          // setPredictionData(predictions);

          for (let n = 0; n < predictions.length; n++) {
            // Check scores

            if (predictions[n].score > 0.5) {
              dict[predictions[n].class] += 1;
              if (
                predictions[n].class !== "person" &&
                predictions[n].class !== "cell phone"
              ) {
                continue;
              }
              // console.log(count, predictions[n].class);

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

              // let bboxLeft = predictions[n].bbox[0];
              // let bboxTop = predictions[n].bbox[1];
              // let bboxWidth = predictions[n].bbox[2];
              // let bboxHeight = predictions[n].bbox[3] - bboxTop;

              // ctx.beginPath();
              // ctx.font = "28px Arial";
              // ctx.fillStyle = "red";

              // ctx.fillText(
              //   predictions[n].class +
              //     ": " +
              //     Math.round(parseFloat(predictions[n].score) * 100) +
              //     "%",
              //   bboxLeft,
              //   bboxTop
              // );

              // ctx.rect(bboxLeft, bboxTop, bboxWidth, bboxHeight);
              // ctx.strokeStyle = "#FF0000";

              // ctx.lineWidth = 3;
              // ctx.stroke();
            }
          }
        }
        if (dict["person"] === 0) setPerson(false);
        else setPerson(true);
        if (violations <= 5) setTimeout(predictionFunction, 200);
        else {
          alert("you have been caught");
        }
      }
    },
    [capture, model]
  );

  useEffect(() => {
    tf.ready().then(() => {
      loadModel();
    });
  }, []);

  useEffect(() => {
    if (start) setTimeout(play, 5000);
  }, [start]);

  // useEffect(() => {
  //   //prevent initial triggering
  //   if (mounted.current) {
  //     play();
  //   } else {
  //     mounted.current = true;
  //   }
  // }, [start]);

  const videoConstraints = {
    height: 170,
    width: 250,
    maxWidth: "100vw",
    facingMode: "environment",
  };

  return (
    <div>
      {/* <button onClick={play}>Start</button> */}
      {/* <div style={{ position: "absolute", top: "400px", zIndex: "9999" }}>
        <canvas
          id="myCanvas"
          width={videoWidth}
          height={videoHeight}
          style={{ backgroundColor: "transparent" }}
        />
      </div> */}
      <div className=" ">
        <Webcam
          audio={false}
          id="img"
          ref={webcamRef}
          // width={640}
          screenshotQuality={1}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
        />
        <div>
          {person ? (
            <div className=" m-0 bg-success  px-4 ">Person Detected</div>
          ) : (
            <div className=" m-0 bg-danger  px-4 ">Not Detected</div>
          )}
        </div>
      </div>
      {/* <button onClick={play}>Start</button>
      <div style={{ position: "absolute", top: "400px", zIndex: "9999" }}>
        <Webcam
          audio={false}
          id="img"
          ref={webcamRef}
          // width={640}
          screenshotQuality={1}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
        />
        <canvas
          id="myCanvas"
          width={videoWidth}
          height={videoHeight}
          style={{ backgroundColor: "transparent" }}
        />
      </div>
      <div>{imgSrc && <img src={imgSrc} alt="N.F." />}</div> */}
    </div>
  );
}

export default Cam;
