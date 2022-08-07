import React from "react";
import "./Hints.styles.scss";

export default function Hints(props) {
  const { song, delay } = props;
  return (
    <div className="hints">
      <div className="hints--song">
        Current selected song is: <em>{song.name} </em>
      </div>
      {delay ? (
        <div className="hints--delay">
          Your average delay is: <b>{delay}</b>
        </div>
      ) : null}
      <div className="hints--instructions">
        Guide: Press [x] to start, [n] to restart, [,] and [.] to choose song
      </div>
    </div>
  );
}
