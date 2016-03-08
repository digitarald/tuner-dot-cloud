import 'md-gum-polyfill';
import EventEmitter from 'wolfy87-eventemitter';
// import Detector from './detector.js';
import PitchfinderWorker from './pitchfinder-worker.js';

const AudioContext = window.AudioContext || window.webkitAudioContext;

class Signal extends EventEmitter {
  input = null;
  source = null;
  peak = 0.0;
  pitch = 0.0;
  bufferSize = 2048;
  threshold = 0.05;
  range = null;
  detecting = false;
  started = false;
  passthrough = false;
  peak = 0.0;
  ready = new Promise((resolve, reject) => {
    this.resolveReady = resolve;
    this.rejectReady = reject;
  });

  constructor(options = {}) {
    super();
    Object.assign(this, options);
    if (!this.context) {
      this.context = new AudioContext();
    }
    this.sampleRate = this.context.sampleRate;

    this.channelData = new Float32Array(this.bufferSize);
    this.script = this.context.createScriptProcessor(this.bufferSize, 1, 1);
    this.script.onaudioprocess = (evt) => {
      this.detect(evt);
    };
    this.script.connect(this.context.destination);

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
        this.stop();
      }
      this.start();
    });
    this.start();
  }

  detect({inputBuffer, outputBuffer}) {
    if (this.detecting) {
      return;
    }
    this.detecting = true;
    const {passthrough, channelData} = this;
    const source = inputBuffer.getChannelData(0);
    const output = passthrough ? outputBuffer.getChannelData(0) : null;
    const peak = Math.max.apply(Math, source);
    for (let i = 0; i < this.bufferSize; i++) {
      // Copy data and amplify with max input
      channelData[i] = source[i] / peak;
      if (passthrough) {
        output[i] = source[i];
      }
    }
    this.peak = peak;
    // console.time('post');
    this.worker.postMessage({
      type: 'detect',
      channelData: channelData.buffer
    }, [channelData.buffer]);
  }

  didDetect({pitch, channelData}) {
    // console.timeEnd('post');
    this.detecting = false;
    // Prevents "An ArrayBuffer is neutered and could not be cloned."
    this.channelData = new Float32Array(channelData);
    if (this.range[0] > pitch || this.range[1] < pitch) {
      this.emit('didSkip');
      return;
    }
    this.emit('didDetect', {pitch});
  }

  start() {
    if (this.started) {
      return Promise.resolve();
    }
    this.started = true;
    if (this.input && !this.input.enabled) {
      return Promise.resolve();
    }
    return navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const track = stream.getAudioTracks()[0];
        this.input = track;
        this.input.addEventListener('ended', () => this.end(true));
        this.source = this.context.createMediaStreamSource(stream);
        this.source.connect(this.script);
        this.emit('source', this.source);
        this.resolveReady();
      })
      .catch((err) => {
        this.started = false;
        console.log(err);
        this.rejectReady(err.message);
      });
  }

  stop(ended = false) {
    if (!this.started) {
      return;
    }
    this.started = false;
    if (ended) {
      this.input = null;
      this.source.disconnect();
      this.source = null;
    }
    this.on('didDisconnect');
  }
}

export default Signal;
