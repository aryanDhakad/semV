import React from "react";
import { Button } from "react-bootstrap";

function QuizListItem({ index, item, showTime, handleSubmit, type }) {
  return (
    <tr key={index}>
      <th scope="row">{index + 1}</th>
      <td>{item.quizName}</td>
      <td>{showTime(item.quizTimeStart)}</td>
      <td>{showTime(item.quizTimeEnd)}</td>
      <td>
        <Button
          key={index}
          type="submit"
          className="btn btn-primary m-3"
          onClick={() =>
            handleSubmit(type, item, item.quizTimeStart, item.quizTimeEnd)
          }
        >
          Start
        </Button>
      </td>
    </tr>
  );
}

export default React.memo(QuizListItem);
