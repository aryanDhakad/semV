import React, { useState } from "react";
import { useTimer } from "react-timer-hook";

export default function Timer({ expiryTimestamp, history }) {
  const { seconds, minutes, hours, isRunning } = useTimer({
    expiryTimestamp,
    onExpire: () => {
      alert("Time Has Ended");
      history.push("/");
    },
  });

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "30px" }}>
        <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
      </div>
    </div>
  );
}
