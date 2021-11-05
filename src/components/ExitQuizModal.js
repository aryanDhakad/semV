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
}) {
  return (
    <Modal
      show={show}
      onHide={() => setShow(!show)}
      backdrop="static"
      keyboard={false}
      animation={false}
    >
      <Modal.Header closeButton>
        <Modal.Title> End Test</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are You Sure You Want To End The Test?
        <p>Attempted : {attempt.atm}</p>
        <p>Marked For Review: {attempt.mrk}</p>
        <p>Not Attempted : {questionList.length - attempt.atm}</p>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={async () => {
            // await db
            //   .collection("Student")
            //   .doc(currentUser.email)
            //   .collection("Attempt")
            //   .doc(quizInfo.quizUUID)
            //   .set({
            //     Info: quizInfo,
            //     questions: questionList,
            //   });
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
