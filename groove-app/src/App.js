import React from "react";
import Canvas from "./components/Canvas";
import Hints from "./components/Hints";
import "./App.css";

export default function App() {
  const songs = [
    { name: "default", beat: "1010 1010" },
    { name: "honkey tonk woman intro", beat: "11011010" },
    { name: "Greensleeves (begin)", beat: "10   10 00 10   10 01 10" },
    { name: "Greensleeves (second part)", beat: "10 00 00   10 01 10" }
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
    <div className="App">
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
