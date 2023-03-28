let DECAY = 200;
class Processor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.decay=DECAY;
        this.t0 = Date.now();
    }
    process (inputs, outputs, parameters) {
        if (this.decay > 0) {
            this.decay -= 1;
            return true;
        }
        let amplitude = inputs[0][0].reduce((x,y)=>Math.abs(x)+Math.abs(y));
        //let amplitude = Math.max(...inputs[0][0].map((x)=>Math.abs(x)))
        if (amplitude > .6) {
            var t1 = Date.now()
            console.log(amplitude, (60/(t1-this.t0))*1000);
            this.t0 = t1
            this.decay = DECAY
        }
        return true;
    }
}

registerProcessor("Processor", Processor);

