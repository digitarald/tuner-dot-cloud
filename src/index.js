import Signal from './signal.js';
import {noteFromPitch} from './note.js';
import presets from './presets.js';
import Simple from './simple.js';
import './index.css';

if (navigator.serviceWorker) {
  const location = window.location;
  if (/^http:.*github\.io/.test(location.href)) {
    location.replace(location.href.replace(/^http/, 'https'));
  }
  navigator.serviceWorker.register('./offline-worker.js')
    .then(() => {
      console.log('Offlined! Continue to tune offline anytime …');
    }).catch((err) => {
      console.error('Offlining failed', err);
    });
}

const bufferSize = 4096;
const fftSize = 2048;

const renderer = new Simple();
const preset = presets.get('piano');
const signal = new Signal({
  bufferSize,
  fftSize,
  range: preset.pitchRange
});
signal.connect();

signal.on('didSkip', () => {
  renderer.set('detected', false);
});
signal.on('didDetect', ({pitch}) => {
  const note = noteFromPitch(pitch);
  renderer.set('detected', true);
  renderer.set('last', Date.now());
  renderer.set('pitch', pitch);
  renderer.set('note', note);
  renderer.set('cents', note.centsOffFromPitch(pitch));
});

renderer.start();
