import Signal from './signal.js';
import {noteFromPitch} from './note.js';
import presets from './presets.js';
import Simple from './simple.js';
import './index.css';

const bufferSize = 8192;
const fftSize = 4096;

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
signal.on('didDetect', ({pitch}) => {
  if (preset.pitchRange[0] > pitch || preset.pitchRange[1] < pitch) {
    return;
  }
  const note = noteFromPitch(pitch);
  renderer.set('detected', true);
  renderer.set('last', Date.now());
  renderer.set('pitch', pitch);
  renderer.set('note', note);
  renderer.set('cents', note.centsOffFromPitch(pitch));
});

renderer.on('didUpdate', () => {
  signal.detect();
});

renderer.start();
