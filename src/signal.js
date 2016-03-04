import 'md-gum-polyfill';
import EventEmitter from 'wolfy87-eventemitter';
import Detector from './detector.js';

const AudioContext = window.AudioContext || window.webkitAudioContext;

class Signal extends EventEmitter {
  input = null;
  source = null;
  volume = 0.0;
  pitch = 0.0;

  constructor({bufferSize = 8192, fftSize = 2048, threshold = 0.1, range, context} = {}) {
    super();
    this.bufferSize = bufferSize;
    this.fftSize = fftSize;
    this.threshold = threshold;
    this.context = context || new AudioContext();
    this.sampleRate = this.context.sampleRate;
    if (range) {
      this.range = [
        Math.floor(this.pitchToIndex(range[0])),
        Math.ceil(this.pitchToIndex(range[1]))
      ];
      console.log(this.range);
    } else {
      this.range = null;
    }

    this.frequencyData = new Uint8Array(this.fftSize);
    this.analyser = this.context.createAnalyser();
    this.analyser.smoothingTimeConstant = 0;
    this.analyser.fftSize = this.fftSize;

    this.worker = new window.Worker('./src/detect-pitch-worker.js');
    // this.script = this.context.createScriptProcessor(this.bufferSize, 1, 1);
    // this.script.onaudioprocess = (evt) => {
    //   this.process(evt.inputBuffer);
    // };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.disconnect();
      }
      this.connect();
    });
    this.connected = false;
    this.connect();
  }

  process(inputBuffer) {
    this.analyze();
    if (this.volume < this.threshold) {
      this.emit('skip', this);
      return;
    }
    this.channelData = inputBuffer.getChannelData(0);
    this.emit('input', this);
  }

  analyze() {
    this.analyser.getByteFrequencyData(this.frequencyData);
    let sum = 0.0;
    const [low, high] = this.range;
    const l = high - low;
    // get all the frequency amplitudes
    for (let i = low; i < high; i++) {
      sum += this.frequencyData[i];
    }
    this.volume = (sum / l) / 256;
    this.emit('volume', this);
  }

  connect() {
    if (this.connected) {
      return;
    }
    this.connected = true;
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const track = stream.getAudioTracks()[0];
        this.input = track;
        this.source = this.context.createMediaStreamSource(stream);
        this.source.connect(this.analyser);
        // this.analyser.connect(this.script);
      })
      .catch((err) => {
        this.connected = false;
        console.error(err);
      });
  }

  disconnect() {
    if (!this.connected) {
      return;
    }
    this.connected = false;
    this.input.stop();
    this.input = null;
    this.source.disconnect();
    this.source = null;
  }

  pitchToIndex(pitch) {
    const nyquist = this.sampleRate / 2;
    return pitch / nyquist * this.fftSize;
  }
}

export default Signal;
