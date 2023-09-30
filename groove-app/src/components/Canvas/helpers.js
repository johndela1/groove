const frequencies = {
  default: 600,
  G3: 196.0,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
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
  o.stop(cx.currentTime + 0.1 * duration);
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
