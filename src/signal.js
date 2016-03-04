import 'md-gum-polyfill';
import EventEmitter from 'wolfy87-eventemitter';
// import Detector from './detector.js';
import DetectPitchWorker from 'worker!./detect-pitch.js';

const AudioContext = window.AudioContext || window.webkitAudioContext;

class Signal extends EventEmitter {
  input = null;
  source = null;
  volume = 0.0;
  pitch = 0.0;
  bufferSize = 8192;
  fftSize = 2048;
  threshold = 0.05;
  range = null;

  constructor(options = {}) {
    super();
    Object.assign(this, options);
    if (!this.context) {
      this.context = new AudioContext();
    }
    this.sampleRate = this.context.sampleRate;
    if (this.range) {
      this.range = [
        Math.floor(this.pitchToIndex(this.range[0])),
        Math.ceil(this.pitchToIndex(this.range[1]))
      ];
    } else {
      this.range = null;
    }

    this.domainData = new Float32Array(this.fftSize);
    this.frequencyData = new Uint8Array(this.fftSize);
    this.analyser = this.context.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.07;
    this.analyser.fftSize = this.fftSize;

    this.worker = new DetectPitchWorker();
    this.detecting = false;
    this.worker.onmessage = ({data}) => this.didDetect(data);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.disconnect();
      }
      this.connect();
    });
    this.connected = false;
    this.connect();
  }

  detect() {
    if (this.detecting) {
      return;
    }
    this.analyze();
    if (this.threshold > this.volume) {
      this.emit('didSkip');
      return;
    }
    this.detecting = true;
    this.analyser.getFloatTimeDomainData(this.domainData);
    const buffer = this.domainData.buffer;
    this.worker.postMessage({
      domainData: buffer
    }, [buffer]);
    this.domainData = null;
  }

  didDetect({pitch, domainData}) {
    this.domainData = new Float32Array(domainData);
    this.detecting = false;
    this.emit('didDetect', {pitch});
    this.detect();
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
    this.emit('didAnalyse', this);
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
        this.on('didConnect');
        this.detect();
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
    this.on('didDisconnect');
  }

  pitchToIndex(pitch) {
    const nyquist = this.sampleRate / 2;
    return pitch / nyquist * this.fftSize;
  }
}

export default Signal;
