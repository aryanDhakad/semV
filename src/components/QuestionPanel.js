import React from "react";

function QuestionPanel({ questionList, index, setCurrent }) {
  let st = "btn btn-primary m-2 p-3 rounded  ";

  if (
    questionList[index].questionIsMarked &&
    questionList[index].questionIsAttempted
  )
    st += " bg-warning";
  else if (questionList[index].questionIsMarked) st += " bg-info";
  else if (questionList[index].questionIsAttempted) st += " bg-success";
  else st += " bg-danger";
  return (
    <button className={st} key={index} onClick={() => setCurrent(index)}>
      {index + 1}
    </button>
  );
}

export default QuestionPanel;
