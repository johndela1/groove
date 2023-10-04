import React from "react";
import { beep } from "./helpers";
import "./Canvas.styles.scss";
import { Button, message, Space, Table, ConfigProvider } from "antd/lib";

const bpm = 240;
const SECS_IN_MIN = 60;
const msPerBeat = (SECS_IN_MIN * 1000) / bpm;
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 300;
const ACCURACY_STANDARD = 60; // Acceptable accuracy

const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

const columns = [
  {
    title: "Ranking",
    dataIndex: "ranking",
    key: "ranking",
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Score",
    dataIndex: "score",
    key: "score",
  },
];
export default function Canvas({
  songs,
  selectedSong,
  delay,
  setDelay,
  roomId,
  name,
}) {
  const [isReady, setIsReady] = React.useState(false);
  const [isWaiting, setIsWaiting] = React.useState(false);
  const [isInGame, setIsInGame] = React.useState(false);
  const [scores, setScores] = React.useState({});
  const [countdown, setCountDown] = React.useState(0);
  const [ws, setWebSocket] = React.useState(null);
  const [newGame, setNewGame] = React.useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  let sOffset = 10;
  let uOffset = 10;
  const ref = React.useRef(null);
  let isFrist = true;
  let prev = null;
  let [uPrev, setUPrev] = React.useState(null);

  React.useEffect(() => {
    const websocket = new WebSocket(
      `ws://localhost:8888/chatsocket?roomId=${roomId}`
    );

    websocket.onopen = function (event) {
      websocket.send(
        JSON.stringify({
          type: "join",
          room_id: roomId,
          id: name,
        })
      );
    };

    websocket.onmessage = function (event) {
      let message = JSON.parse(event.data); // Parse the string into an object

      if (message.type == "ready") {
        setIsReady(true);
      }

      if (message.type == "decision") {
        info(message.name, message.chosen_by);
      }

      if (message.type == "count") {
        setIsInGame(true);
        setCountDown((prev) => prev + 1);
        setTimeout(() => {
          beep();
        }, msPerBeat);
        if (message.type == "count") {
          setUPrev(Date.now() + 1000);
        }
      }

      if (message.type == "snote") {
        setCountDown(5);
        setTimeout(() => {
          beep(message.pitch, message.duration);
        }, msPerBeat);
        let now = Date.now();
        if (!isFrist) {
          sOffset = sOffset + (now - prev) / 20;
        } else {
          isFrist = false;
        }
        drawPoint(sOffset, 10, "slategray");
        prev = now;
      }

      if (message.type == "end") {
        const data = Object.entries(message.scores).map(([name, score]) => ({
          name,
          score,
        }));
        data.sort((a, b) => a.score - b.score);
        data.map((d, index) => (d.ranking = index + 1));
        console.log(data);
        setScores(data);
      }
    };

    setWebSocket(websocket);

    return () => {
      websocket.close();
    };
  }, [newGame]);

  const info = (name, chosenBy) => {
    messageApi.info(`Currently playing ${name} chosen by ${chosenBy}`);
  };

  const drawPoint = (offset, vertical, color = "black") => {
    const canvas = ref.current;
    if (canvas) {
      const cx = canvas.getContext("2d");
      cx.fillStyle = color;
      cx.fillRect(
        offset > 1000 ? offset - 1000 * Math.floor(offset / 1000) : offset,
        offset > 1000 ? vertical + 100 * Math.floor(offset / 1000) : vertical,
        20,
        40
      );
    }
  };
  // after reset, close current socket, create a new socket and join and wait for next signal
  const reset = () => {
    ws.close();
    setWebSocket(null);
    setIsInGame(false);
    setIsWaiting(false);
    setNewGame((prev) => !prev);
    setUPrev(null);
    setScores({});
    setDelay(0);
    setCountDown(0);
    ref.current.getContext("2d").clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  const startGame = () => {
    setIsWaiting(true);
    ws.send(
      JSON.stringify({
        type: "start",
        room_id: roomId,
        song: songs[selectedSong],
      })
    );
  };

  React.useEffect(() => {
    function keyDownHandler(e) {
      switch (e.key) {
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
        room_id: roomId,
      })
    );
    let now = Date.now();
    uOffset = uOffset + (now - uPrev) / 20;
    drawPoint(uOffset, 50, "skyblue");
    uPrev = now;
  };

  return (
    <div>
      {contextHolder}
      {isInGame && countdown < 5 && (
        <div className="overlay">
          <div className="overlay--countdown">{countdown}</div>
        </div>
      )}
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
      <div className="operations">
        {isReady && !isInGame && (
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#3C4B5A",
              },
            }}
          >
            <Button
              type="primary"
              disabled={isWaiting}
              onClick={() => startGame()}
            >
              Ready
            </Button>
          </ConfigProvider>
        )}
        <Button onClick={() => reset()}>Reset</Button>
      </div>
      {scores[0] && (
        <Space size="small">
          <Table
            size="small"
            pagination={false}
            showHeader={true}
            columns={columns}
            dataSource={scores}
          />
        </Space>
      )}
    </div>
  );
}
