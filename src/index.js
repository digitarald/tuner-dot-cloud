// References to other files for webpack loaders
import './index.css';
import './manifest.json';

import Signal from './signal.js';
import presets from './presets.js';
import Simple from './simple.js';
import track from './track.js';

if (process.env.NODE_ENV === 'production') {
  if (navigator.serviceWorker) {
    track('send', 'event', 'Service Worker', 'register');
    navigator.serviceWorker.register('./sw.js')
      .then(() => {
        track('send', 'event', 'Service Worker', 'ready');
        console.log('Offlined! Continue to tune offline anytime …');
      }).catch((err) => {
        track('send', 'event', 'Service Worker', 'error');
        console.error('Offlining failed', err);
      });
  }
}

const bufferSize = 4096;
const fftSize = 2048;
let firstDetect = false;

const preset = presets.get('piano');
const signal = new Signal({
  bufferSize,
  fftSize,
  range: preset.pitchRange
});

signal.didActivate.then(() => {
  document.body.classList.add('is-prompting');
  document.body.classList.remove('is-suspended');
});

document.body.addEventListener('click', () => {
  signal.activate();
})

signal.didConnect.then(() => {
  track('send', 'event', 'getUserMedia', 'granted');
  document.body.classList.remove('is-prompting');
  document.body.classList.add('is-silent');
  console.log('Web Audio is on the air!');
}, (err) => {
  document.body.classList.remove('is-prompting');
  if (String(err).indexOf('not implemented') !== -1) {
    track('send', 'event', 'getUserMedia', 'not supported');
    document.body.classList.add('is-not-supported');
  }
  console.error('Web Audio setup failed!', err);
});
document.body.classList.remove('is-loading');

window.addEventListener('beforeinstallprompt', (event) => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    // Already installed, just a side effect of testing
    event.preventDefault();
    return;
  }
  track('send', 'event', 'Manifest', 'prompted');
  event.userChoice.then(({outcome}) => {
    track('send', 'event', 'Manifest', outcome);
  }, () => {
    track('send', 'event', 'Manifest', 'error');
  });
});

const renderer = new Simple(signal);

signal.on('didDetect', ({ pitch }) => {
  if (!firstDetect) {
    firstDetect = true;
    track('send', 'event', 'getUserMedia', 'detected');
    document.body.classList.remove('is-silent');
  }
});

renderer.start();


/* WIP
if (process.env.NODE_ENV === 'development') {
  signal.passthrough = true;
  signal.ready.then(() => {
    const script = document.createElement('script');
    script.onload = () => {
      const list = window.MIDI.Soundfont.violin;
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
        source.connect(signal.analyser);
        signal.source.disconnect();
      }
      setTimeout(playNext, 1000);
    };
    script.src = 'https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/master/FluidR3_GM/violin-mp3.js';
    document.body.appendChild(script);
  });
}
*/
