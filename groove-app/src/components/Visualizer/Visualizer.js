import React, { useEffect } from "react";

export default function Visualizer() {
  const [data, setData] = React.useState([]);

  useEffect(() => {
    const ctx = new window.AudioContext();
    const analyser = ctx.createAnalyser();
    let t0 = Date.now();
    analyser.fftSize = 256;

    const audioData = new Uint8Array(analyser.frequencyBinCount);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
        requestAnimationFrame(process);
      })

    function process() {
      analyser.getByteTimeDomainData(audioData);
      const amplitude = Math.max(...audioData);
      // const amplitude = audioData.reduce((x,y)=>Math.abs(x) + Math.abs(y));
        if (amplitude > 150) {
          let t1 = Date.now()
          let dt = (60/(t1-t0))*1000;
          setData(data => [...data, {amplitude, dt}]);
          t0 = t1;
        }
      requestAnimationFrame(process);
    }

    return () => {
      ctx.close();
    };
  }, []);

  return (
    <div className="Visualizer">
      {data.map((d, i) => 
        <div key={i}>{d.amplitude} : {d.dt}</div>
      )}
    </div>
  );
}
