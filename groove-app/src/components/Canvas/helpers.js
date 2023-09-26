export const beep = () => {
  console.log("beep");
  const hz = 200;
  const cx = new AudioContext();
  const o = cx.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(hz, cx.currentTime);
  o.connect(cx.destination);
  o.start(cx.currentTime);
  o.stop(cx.currentTime + 0.05);
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
