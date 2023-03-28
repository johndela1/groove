import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Game from "./components/Game";
import Visualizer from "./components/Visualizer";
import "./App.css";

const Nav = () => (
  <nav>
    <ul>
      <li>
        <Link to="/">Game</Link>
      </li>
      <li>
        <Link to="/visualizer">Visualizer</Link>
      </li>
    </ul>
  </nav>
);

export default function App() {
  return (
    <Router>
      <Nav />
      <Routes>
        <Route
          path="/"
          element={
            <div className="App">
              <Game />
            </div>
          }
        />
        <Route
          path="/visualizer"
          element={
            <div className="App">
              <Visualizer />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
