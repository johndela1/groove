import React from "react";
// import {BrowserRouter as Router, Switch, Route, Link} from "react-router-dom";
import Canvas from "./Canvas";
import Hints from "./Hints";

export default function Game() {
  const songs = [
    { name: "default", notes: "1010 1010" },
    { name: "honkey tonk woman intro", notes: "11011010" },
    { name: "Greensleeves (begin)", notes: "10   10 00 10   10 01 10" },
    { name: "Greensleeves (second part)", notes: "10 00 00   10 01 10" }
  ];
  const [selectedSong, setSong] = React.useState(0);
  const [delay, setDelay] = React.useState(0);

  React.useEffect(() => {
    function keyDownHandler(e) {
      switch (e.key) {
        case ",":
          selectedSong === 0
            ? setSong(songs.length - 1)
            : setSong(selectedSong - 1);
          break;
        case ".":
          selectedSong === songs.length - 1
            ? setSong(0)
            : setSong(selectedSong + 1);
          break;
        default:
          break;
      }
    }
    window.addEventListener("keydown", keyDownHandler);
    return function cleanUpListner() {
      window.removeEventListener("keydown", keyDownHandler);
    };
  });

  return (
    <div className="Game">
      <Canvas
        songs={songs}
        selectedSong={selectedSong}
        delay={delay}
        setDelay={setDelay}
      />
      <Hints delay={delay} song={songs[selectedSong]} />
    </div>
  );
}
