import React from "react";
import Canvas from "./components/Canvas";
import Hints from "./components/Hints";
import "./App.css";

const response = await fetch("http://localhost:8888/songs");
const res = await response.json();
const songs = res.res;

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("roomId");
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
    <div className="App">
      <Canvas
        songs={songs}
        selectedSong={selectedSong}
        delay={delay}
        setDelay={setDelay}
        roomId={roomId}
      />
      <Hints delay={delay} song={songs[selectedSong]} />
    </div>
  );
}
