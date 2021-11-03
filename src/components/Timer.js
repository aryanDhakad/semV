import React from "react";
import { useTimer } from "react-timer-hook";

export default function Timer({ expiryTimestamp, history }) {
  const { seconds, minutes, hours } = useTimer({
    expiryTimestamp,
    onExpire: () => {
      alert("Time Has Ended");
      history.push("/");
    },
  });

  return (
    <div className="d-flex justify-content-center align-items-center">
      <div style={{ fontSize: "30px" }} className="bg-danger rounded px-2">
        <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
      </div>
    </div>
  );
}
