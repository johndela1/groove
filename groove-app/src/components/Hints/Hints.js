import React from "react";
import "./Hints.styles.scss";

export default function Hints(props) {
  const { song, delay } = props;
  return (
    <div className="hints">
      <div className="hints--song">
        Your song of choice is: <em>{song} </em>
      </div>
      {delay ? (
        <div className="hints--delay">
          Your average delay is: <b>{delay}</b>
        </div>
      ) : null}
      <div className="hints--instructions">
        Guide: Press [,] and [.] to choose song
      </div>
    </div>
  );
}
