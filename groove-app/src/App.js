import React from "react";
import Canvas from "./components/Canvas";
import Hints from "./components/Hints";
import "./App.css";
import { Button, Space, Input, ConfigProvider } from "antd/lib";

const response = await fetch("http://localhost:8888/songs");
const res = await response.json();
const songs = res.res;

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("roomId");
  const [confirmName, setConfirmName] = React.useState("");
  const [name, setName] = React.useState("");
  const [selectedSong, setSong] = React.useState(0);
  const [delay, setDelay] = React.useState(0);

  const handleSubmit = (event) => {
    event.preventDefault();
    setConfirmName(name);
  };

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
      <section>
        <div className="air air1"></div>
        <div className="air air2"></div>
        {!confirmName && (
          <div className="form--name">
            <Space direction="vertical">
              <Space direction="horizontal">
                <Input
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <ConfigProvider
                  theme={{
                    token: {
                      colorPrimary: "#3C4B5A",
                    },
                  }}
                >
                  <Button type="primary" onClick={(e) => handleSubmit(e)}>
                    submit
                  </Button>
                </ConfigProvider>
              </Space>
            </Space>
          </div>
        )}
        {confirmName && (
          <>
            <Canvas
              songs={songs}
              selectedSong={selectedSong}
              delay={delay}
              setDelay={setDelay}
              roomId={roomId}
              name={name}
            />
            <Hints delay={delay} song={songs[selectedSong]} />
          </>
        )}
        <div className="air air3"></div>
        <div className="air air4"></div>
      </section>
    </div>
  );
}
