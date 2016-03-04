/* eslint-env worker */
import detectPitch from 'detect-pitch';

self.addEventListener('message', ({data}) => {
  const {signalBuffer} = data;
  const period = detectPitch(new Float32Array(signalBuffer, 0.2));
  const pitch = (period) ? Math.round(44100.0 / period) : 0.0;
  self.postMessage({
    pitch: pitch,
    signalBuffer: signalBuffer
  }, [signalBuffer]);
});
