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
          style={{ backgroundColor: "#F1732B" }}
          className="btn btn-warning text-white m-3"
          onClick={() =>
            handleSubmit(type, item, item.quizTimeStart, item.quizTimeEnd)
          }
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Button>
      </td>
    </tr>
  );
}

export default QuizListItem;
