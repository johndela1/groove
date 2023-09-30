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

export default function Canvas({ songs, selectedSong, delay, setDelay }) {
  const [isReady, setIsReady] = React.useState(false);
  const [isWaiting, setIsWaiting] = React.useState(false);
  const [isInGame, setIsInGame] = React.useState(false);
  const [scores, setScores] = React.useState({});
  const [ws, setWebSocket] = React.useState(null);
  const song = songs[selectedSong];
  const tss = [];
  let sOffset = 0;
  let uOffset = 0;
  const dts = deltas(song, msPerBeat);
  const ref = React.useRef(null);
  let isFrist = true;
  let prev = null;
  let [uPrev, setUPrev] = React.useState(null);

  React.useEffect(() => {
    const websocket = new WebSocket("ws://localhost:8888/chatsocket");

    websocket.onopen = function (event) {
      websocket.send(
        JSON.stringify({
          type: "join",
          id: uuidv4(),
        })
      );
    };

    websocket.onmessage = function (event) {
      let message = JSON.parse(event.data); // Parse the string into an object

      if (message.type == "ready") {
        setIsReady(true);
      }

      if (message.type == "count") {
        setIsInGame(true);
        setTimeout(() => {
          beep();
        }, msPerBeat);
        if (message.type == "count") {
          setUPrev(Date.now() + 1000);
        }
      }

      if (message.type == "snote") {
        setTimeout(() => {
          beep(message.pitch);
        }, msPerBeat);
        let now = Date.now();
        if (!isFrist) {
          sOffset = sOffset + (now - prev) / 20;
        } else {
          isFrist = false;
        }
        drawPoint(sOffset, 10);
        prev = now;
      }

      if (message.type == "end") {
        setScores(message.scores);
      }
    };

    setWebSocket(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const drawPoint = (offset, vertical) => {
    const canvas = ref.current;
    if (canvas) {
      const cx = canvas.getContext("2d");
      cx.fillRect(offset, vertical, 20, 40);
    }
  };

  const reset = () => {
    setDelay(0);
    ref.current.getContext("2d").clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  const startGame = () => {
    setIsWaiting(true);
    ws.send(
      JSON.stringify({
        type: "start",
        song: songs[selectedSong],
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
    let now = Date.now();
    uOffset = uOffset + (now - uPrev) / 20;
    drawPoint(uOffset, 50);
    uPrev = now;
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
