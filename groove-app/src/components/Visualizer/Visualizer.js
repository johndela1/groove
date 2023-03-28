import React, { useEffect, useMemo } from "react";

export default function Visualizer() {
  const ctx = useMemo(() => new AudioContext(), []);

  useEffect(() => {
    async function setupAudio() {
      await ctx.audioWorklet.addModule("./processor.js");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      const source = ctx.createMediaStreamSource(stream);

      const worklet = new AudioWorkletNode(ctx, "Processor");

      source.connect(worklet);
      worklet.connect(ctx.destination);
    }
    setupAudio();
  }, [ctx]);

  return (
    <div className="Visualizer">
      <h1>Check out console log</h1>
    </div>
  );
}
