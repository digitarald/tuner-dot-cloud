import EventEmitter from 'wolfy87-eventemitter';

export default class Detector extends EventEmitter {
  constructor(signal, {threshold = 0.1}) {
    super();
    this.signal = signal;
    this.worker = new window.Worker('./src/pitchfinder-js-worker.js');
    this.worker.postMessage({
      type: 'init',
      bufferSize: signal.bufferSize,
      sampleRate: signal.sampleRate
    });
    this.worker.onmessage = ({data}) => this.onResult(data);
    signal.on('input', (signal) => this.onInput(signal));
  }

  onInput({channelData, volume}) {
    if (this.working) {
      return;
    }
    this.working = true;
    this.volume = volume;
    this.worker.postMessage({
      type: 'detect',
      channelData: channelData.buffer
    }, [channelData.buffer]);
  }

  onResult({pitch}) {
    this.working = false;
    this.emit('result', pitch, this.volume);
  }
}
