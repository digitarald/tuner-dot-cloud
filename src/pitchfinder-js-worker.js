/* eslint-env worker */
/* global PitchFinder */
import './pitchfinder-js/fft.js';
import './pitchfinder-js/pitchfinder.js';

let detector = null;

self.addEventListener('message', (evt) => {
  switch (evt.data.type) {
    case 'init':
      delete evt.data.type;
      detector = PitchFinder.YIN(evt.data);
      return;

    case 'detect':
      const {freq} = detector(new Float32Array(evt.data.channelData));
      postMessage({
        pitch: freq
      });
  }
});
