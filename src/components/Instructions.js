import React, { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import Timer from "./Timer";
import { useHistory } from "react-router-dom";

var elem = document.documentElement;

function Instructions() {
  const type = localStorage.getItem("type");
  let quizInfo = localStorage.getItem("quizInfo");
  quizInfo = JSON.parse(quizInfo);
  let startAt = new Date();
  startAt = startAt.setSeconds(startAt.getSeconds() + 10);
  const webcamRef = useRef(null);
  const history = useHistory();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const goFullScreen = () => {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        /* Safari */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        /* IE11 */
        elem.msRequestFullscreen();
      }
    };

    if (type !== "Student") {
      alert("Access Denied");
      history.push("/login");
    } else {
      goFullScreen();
    }
  }, []);

  const videoConstraints = {
    height: 170,
    width: 250,
    maxWidth: "100vw",
    facingMode: "environment",
  };
  const onTimerExpire = useCallback(() => {
    setShow(true);
  }, []);

  if (type === "Student") {
    return (
      <div className="p-1">
        <div className="row my-3">
          <div className="col-8 rgt-border">
            <div className="display-4 ">
              This is a <strong>Proctored TEST</strong>{" "}
            </div>
          </div>
          <div className="col-4 px-4">
            <div>
              <p className="d-inline mr-3 fss text-center">
                You May begin in :{" "}
              </p>
              <Timer expiryTimestamp={startAt} onTimerExpire={onTimerExpire} />
            </div>
            {show && (
              <button
                className="btn btn-success btn-block my-1"
                onClick={() => history.push("/take-quiz")}
              >
                Start{" "}
              </button>
            )}
          </div>
        </div>

        <div className="row px-3 py-5">
          <div className="col-8 fss rgt-border text-center">
            <h4> Quiz Instructions</h4>
            <pre>{quizInfo.quizInstructions}</pre>
          </div>
          <div className="col-4">
            <h3>Please Allow the Camera Permission</h3>
            <Webcam
              audio={false}
              id="img"
              ref={webcamRef}
              // width={640}
              screenshotQuality={1}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
            />
            <ul className="list-group">
              <li className="list-group-item">Cras justo odio</li>
              <li className="list-group-item">Dapibus ac facilisis in</li>
              <li className="list-group-item">Morbi leo risus</li>
              <li className="list-group-item">Porta ac consectetur ac</li>
              <li className="list-group-item">Vestibulum at eros</li>
            </ul>
          </div>
        </div>
      </div>
    );
  } else {
    return <h3>Access Denied</h3>;
  }
}

export default Instructions;
