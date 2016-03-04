import Signal from './signal.js';
import Detector from './detector.js';
import {noteFromPitch} from './note.js';
import presets from './presets.js';
import Render from './canvas.js';
import './index.css';

const bufferSize = 8192;
const fftSize = 2048;

const canvas = new Render(document.getElementById('canvas'));
const preset = presets.get('piano');
const signal = new Signal({
  bufferSize,
  fftSize,
  range: preset.pitchRange
});
signal.connect();
signal.on('volume', ({volume}) => {
  canvas.set('volume', volume);
});

const detector = new Detector(signal, {});
detector.on('result', (pitch, volume) => {
  if (preset.pitchRange[0] > pitch || preset.pitchRange[1] < pitch) {
    return;
  }
  canvas.set('last', Date.now());
  canvas.set('pitch', pitch);
  const note = noteFromPitch(pitch);
  canvas.set('note', note);
  canvas.set('cents', note.centsOffFromPitch(pitch));
});

canvas.update();
