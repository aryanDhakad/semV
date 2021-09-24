import React, { useRef, useState, useCallback, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import Webcam from "react-webcam";

export default function Cam() {
  const webcamRef = useRef(null);
  const [show, setShow] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }
  }, [webcamRef, setImgSrc]);

  useEffect(() => {
    let interval = setInterval(capture, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [capture]);

  return (
    <div>
      <Button variant="primary" onClick={handleShow}>
        Allow WebCam Access
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title> Please Allow WebCam Access</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Webcam
            height={500}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={500}
          />
          {imgSrc && <img src={imgSrc} alt="N.F." />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={capture}>
            Take Screen Shot
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
