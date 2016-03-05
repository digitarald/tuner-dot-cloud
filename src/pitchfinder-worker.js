/* eslint-env worker */
import PitchFinder from 'exports?PitchFinder!./pitchfinder-js/pitchfinder.js';

let detector = null;

self.addEventListener('message', ({data}) => {
  switch (data.type) {
    case 'init':
      delete data.type;
      detector = PitchFinder.YIN(data);
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
