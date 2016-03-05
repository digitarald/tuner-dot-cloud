import 'md-gum-polyfill';
import EventEmitter from 'wolfy87-eventemitter';
// import Detector from './detector.js';
import PitchfinderWorker from 'worker!./pitchfinder-worker.js';

const AudioContext = window.AudioContext || window.webkitAudioContext;

class Signal extends EventEmitter {
  input = null;
  source = null;
  volume = 0.0;
  pitch = 0.0;
  bufferSize = 2048;
  threshold = 0.05;
  range = null;
  // indexRange = null;
  detecting = false;
  connected = false;

  constructor(options = {}) {
    super();
    Object.assign(this, options);
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    this.sampleRate = this.ctx.sampleRate;
    // if (this.range) {
    //   this.indexRange = [
    //     Math.floor(this.pitchToIndex(this.range[0])),
    //     Math.ceil(this.pitchToIndex(this.range[1]))
    //   ];
    // } else {
    //   this.range = null;
    // }

    this.channelData = new Float32Array(this.bufferSize);
    this.script = this.ctx.createScriptProcessor(this.bufferSize, 1, 1);
    this.script.onaudioprocess = (evt) => {
      this.detect(evt.inputBuffer);
    };
    this.script.connect(this.ctx.destination);

    this.worker = new PitchfinderWorker();
    this.worker.postMessage({
      type: 'init',
      bufferSize: this.bufferSize,
      sampleRate: this.sampleRate
    });
    this.worker.addEventListener('message', (evt) => {
      this.didDetect(evt.data);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.disconnect();
      }
      this.connect();
    });
    this.connect();
  }

  detect(inputBuffer) {
    if (this.detecting) {
      return;
    }
    this.detecting = true;
    const source = inputBuffer.getChannelData(0);
    for (let i = 0; i < this.bufferSize; i++) {
      this.channelData[i] = source[i];
    }
    this.worker.postMessage({
      type: 'detect',
      channelData: this.channelData.buffer
    }, [this.channelData.buffer]);
  }

  didDetect({pitch, channelData}) {
    this.detecting = false;
    // Prevents "An ArrayBuffer is neutered and could not be cloned."
    this.channelData = new Float32Array(channelData);
    if (this.range[0] > pitch || this.range[1] < pitch) {
      this.emit('didSkip');
      return;
    }
    this.emit('didDetect', {pitch});
  }

  // analyze() {
  //   this.analyser.getByteFrequencyData(this.frequencyData);
  //   let sum = 0.0;
  //   const [low, high] = this.range;
  //   const l = high - low;
  //   // get all the frequency amplitudes
  //   for (let i = low; i < high; i++) {
  //     sum += this.frequencyData[i];
  //   }
  //   this.volume = (sum / l) / 256;
  //   this.emit('didAnalyse', this);
  // }

  connect() {
    if (this.connected) {
      return;
    }
    this.connected = true;
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const track = stream.getAudioTracks()[0];
        this.input = track;
        this.source = this.ctx.createMediaStreamSource(stream);
        this.source.connect(this.script);
        this.emit('source', this.source);
      })
      .catch((err) => {
        this.connected = false;
        window.alert(err.message);
      });
  }

  disconnect() {
    if (!this.connected || !this.input) {
      return;
    }
    this.connected = false;
    this.input.stop();
    this.input = null;
    this.source.disconnect();
    this.source = null;
    this.on('didDisconnect');
  }

  // pitchToIndex(pitch) {
  //   const nyquist = this.sampleRate / 2;
  //   return pitch / nyquist * this.fftSize;
  // }
}

export default Signal;
