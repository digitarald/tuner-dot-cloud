import Signal from './signal.js';
import {noteFromPitch} from './note.js';
import presets from './presets.js';
import Simple from './simple.js';
import './index.css';

if (process.env.NODE_ENV === 'production') {
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
}

const bufferSize = 4096;
const fftSize = 2048;
let firstDetect = false;

const renderer = new Simple();
const preset = presets.get('piano');
const signal = new Signal({
  bufferSize,
  fftSize,
  range: preset.pitchRange
});
signal.ready.then(() => {
  document.body.classList.remove('is-prompting');
  document.body.classList.add('is-silent');
  console.log('Web Audio is on the air!');
}, (err) => {
  document.body.classList.remove('is-prompting');
  if (err.message.contains('not implemented')) {
    document.body.classList.remove('is-not-supported');
  }
  console.error('Web Audio setup failed!', err);
});
document.body.classList.remove('is-loading');
document.body.classList.add('is-prompting');

if (process.env.NODE_ENV === 'development') {
  signal.passthrough = true;
  signal.ready.then(() => {
    const script = document.createElement('script');
    script.onload = () => {
      const list = window.MIDI.Soundfont.acoustic_guitar_steel;
      const srcs = [];
      for (let note in list) {
        srcs.push({
          label: note,
          src: list[note]
        });
      }
      function playNext() {
        const audio = new window.Audio();
        audio.autoplay = true;
        audio.onloadedmetadata = () => {
          setTimeout(playNext, Math.round(audio.duration * 800));
        };
        let source = signal.context.createMediaElementSource(audio);
        const idx = Math.floor(Math.random() * (srcs.length - 1));
        const note = srcs[idx];
        audio.src = note.src;
        source.connect(signal.script);
      }
      setTimeout(playNext, 1000);
    };
    script.src = 'https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/master/FluidR3_GM/acoustic_guitar_steel-mp3.js';
    document.body.appendChild(script);
  });
}

signal.on('didSkip', () => {
  renderer.set('detected', false);
});
signal.on('didDetect', ({pitch}) => {
  if (!firstDetect) {
    firstDetect = true;
    document.body.classList.remove('is-silent');
  }
  const note = noteFromPitch(pitch);
  renderer.set('detected', true);
  renderer.set('last', Date.now());
  renderer.set('pitch', pitch);
  renderer.set('note', note);
  renderer.set('cents', note.centsOffFromPitch(pitch));
});

renderer.start();
