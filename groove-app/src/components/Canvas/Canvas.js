import React from "react";
import { v4 as uuidv4 } from "uuid";
import { beep, deltas } from "./helpers";
import "./Canvas.styles.scss";

const bpm = 240;
const SECS_IN_MIN = 60;
const msPerBeat = (SECS_IN_MIN * 1000) / bpm;
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 300;
const ACCURACY_STANDARD = 60; // Acceptable accuracy

const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

// let clientId = sessionStorage.getItem("clientId");
let ws = new WebSocket(`ws://localhost:8888/chatsocket`);

ws.onopen = function (event) {
  ws.send(
    JSON.stringify({
      type: "join",
      id: uuidv4(),
    })
  );
};

export default function Canvas({ songs, selectedSong, delay, setDelay }) {
  const [isReady, setIsReady] = React.useState(false);
  const [isWaiting, setIsWaiting] = React.useState(false);
  const [isInGame, setIsInGame] = React.useState(false);
  const [scores, setScores] = React.useState({});
  const song = songs[selectedSong].notes.replace(/\s/g, "");
  const dts = deltas(song, msPerBeat);
  const ref = React.createRef();

  ws.onmessage = function (event) {
    let parsedData = JSON.parse(event.data); // Parse the string into an object

    if (parsedData.type == "ready") {
      setIsReady(true);
    }

    if (parsedData.type == "count") {
      setIsInGame(true);
      setTimeout(() => {
        beep();
      }, msPerBeat);
    }

    if (parsedData.type == "end") {
      setScores(parsedData.scores);
    }
    // sessionStorage.setItem("clientId", parsedData.clientId);
    // console.log(JSON.stringify(event.data));
  };

  let prev = null;
  let note_idx = 0;
  let errors = [];
  let is_first = true;

  const reset = () => {
    prev = null;
    note_idx = 0;
    errors = [];
    is_first = true;
    setDelay(0);
    ref.current.getContext("2d").clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  const startGame = () => {
    setIsWaiting(true);
    ws.send(
      JSON.stringify({
        type: "start",
      })
    );
  };

  React.useEffect(() => {
    function keyDownHandler(e) {
      switch (e.key) {
        case "n":
          reset();
          break;
        case " ":
          if (Object.keys(scores).length === 0) {
            note();
          }
          break;
        case "x":
          reset();
          start();
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

  const note = () => {
    ws.send(
      JSON.stringify({
        type: "note",
      })
    );
    if (is_first && ref.current) {
      setTimeout(() => {
        let avg = average(errors);
        setDelay(avg);
        if (avg) {
          avg > 0
            ? console.error("avg slow", avg)
            : console.error("avg fast", avg);
        }
        const cx = ref.current.getContext("2d");
        let offset = 0;
        let offsetUser = 0;
        for (let i in dts) {
          if (errors[i] > 0) console.error("slow", errors[i]);
          if (errors[i] < 0) console.error("fast", errors[i]);
          cx.fillRect(offset, 10, 20, 40);
          cx.fillRect(offsetUser, 50, 20, 40);
          offset += dts[i] / 2;
          offsetUser += (dts[i] + errors[i]) / 2;
        }
      }, msPerBeat * song.length);
      is_first = false;
    }
    let now = Date.now();
    if (!prev) {
      prev = now;
      return;
    }
    let result = now - prev - dts[note_idx++];
    errors.push(result);
    prev = now;
  };

  const start = () => {
    for (let b in song) {
      if (song[b] !== "0") {
        setTimeout(() => {
          beep();
        }, msPerBeat * b);
      }
    }
  };

  return (
    <div>
      <canvas
        ref={ref}
        id="myCanvas"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className={
          delay
            ? Math.abs(delay) < ACCURACY_STANDARD
              ? "accurate"
              : "inaccurate"
            : ""
        }
      >
        Your browser does not support the canvas element.
      </canvas>
      {isReady && !isInGame && (
        <button disabled={isWaiting} onClick={() => startGame()}>
          Ready
        </button>
      )}
      <button onClick={() => ws.close()}>close socket</button>
      {scores &&
        Object.keys(scores).map((key, index) => (
          <p key={index}>
            {" "}
            {key} has score: {scores[key]}
          </p>
        ))}
    </div>
  );
}
