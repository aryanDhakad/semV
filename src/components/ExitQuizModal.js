import React from "react";
import { Modal, Button } from "react-bootstrap";

function ExitQuizModal({
  show,
  setShow,
  attempt,
  questionList,
  db,
  currentUser,
  quizInfo,
  history,
  setStopCam,
  closeScreen,
}) {
  return (
    <Modal
      show={show}
      onHide={() => setShow(!show)}
      backdrop="static"
      keyboard={false}
      animation={false}
      className="lft-border"
    >
      <Modal.Header closeButton>
        <Modal.Title> End Test</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are You Sure You Want To End The Test?
        <p>
          Attempted :{" "}
          <span className="badge bg-success rounded-pill px-3">
            {" "}
            {attempt.atm}
          </span>{" "}
        </p>
        <p>
          Marked For Review:{" "}
          <span className="badge bg-info rounded-pill px-3">
            {" "}
            {attempt.mrk}
          </span>{" "}
        </p>
        <p>
          Not Attempted :{" "}
          <span className="badge bg-danger rounded-pill px-3">
            {" "}
            {questionList.length - attempt.atm}
          </span>
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={async () => {
            await db
              .collection("Student")
              .doc(currentUser.email)
              .collection("Attempt")
              .doc(quizInfo.quizUUID)
              .set({
                questions: questionList,
                Score: attempt.sc,
              });
            closeScreen();
            history.push("/studentDash");
          }}
        >
          End Test
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ExitQuizModal;
