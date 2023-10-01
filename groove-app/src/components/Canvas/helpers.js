const frequencies = {
  default: 600,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.26,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
  B5: 987.77,
  C6: 1046.5,
};

export const beep = (hz = "default", duration = 1) => {
  console.log("beep");
  const cx = new AudioContext();
  const o = cx.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(frequencies[hz], cx.currentTime);
  o.connect(cx.destination);
  o.start(cx.currentTime);
  // check this
  o.stop(cx.currentTime + 0.2 * duration);
};

export const deltas = (song, msPerBeat) => {
  let beatsSinceNote = 1;
  const dts = [];
  for (let b of song) {
    if (b === "0") {
      beatsSinceNote += 1;
    } else {
      dts.push(msPerBeat * beatsSinceNote);
      beatsSinceNote = 1;
    }
  }
  return dts;
};
