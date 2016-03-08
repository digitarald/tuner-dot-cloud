/* eslint-env worker */
import {YIN} from './pitchfinder-js/pitchfinder.js';

let detector = null;

self.addEventListener('message', ({data}) => {
  switch (data.type) {
    case 'init':
      delete data.type;
      detector = YIN(data);
      return;

    case 'detect':
      const channelData = data.channelData;
      const pitch = detector(new Float32Array(channelData)).freq;
      postMessage({
        pitch,
        channelData: channelData
      }, [channelData]);
  }
});
