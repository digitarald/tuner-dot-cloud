import Signal from './signal.js';
import {noteFromPitch} from './note.js';
import presets from './presets.js';
import Simple from './simple.js';
import './index.css';

const bufferSize = 8192 / 4;
const fftSize = 4096 / 2;

const renderer = new Simple();
const preset = presets.get('piano');
const signal = new Signal({
  bufferSize,
  fftSize,
  range: preset.pitchRange
});
signal.connect();

signal.on('didAnalyse', ({volume}) => {
  renderer.set('volume', volume);
});
signal.on('didSkip', () => {
  renderer.set('detected', false);
});
let last = window.performance.now();
signal.on('didDetect', ({pitch}) => {
  console.log(window.performance.now() - last);
  last = window.performance.now();
  const note = noteFromPitch(pitch);
  renderer.set('detected', true);
  renderer.set('last', Date.now());
  renderer.set('pitch', pitch);
  renderer.set('note', note);
  renderer.set('cents', note.centsOffFromPitch(pitch));
});

renderer.start();
