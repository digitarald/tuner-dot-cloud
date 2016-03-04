/* eslint-env worker */
import detectPitch from 'detect-pitch';

self.addEventListener('message', ({data}) => {
  const {domainData} = data;
  const period = detectPitch(new Float32Array(domainData, 0.2));
  const pitch = (period) ? Math.round(44100.0 / period) : 0.0;
  self.postMessage({
    pitch: pitch,
    domainData: domainData
  }, [domainData]);
});
