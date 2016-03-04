self.importScripts('./pitchfinder-js/fft.js');
self.importScripts('./pitchfinder-js/pitchfinder.js');

let detector = null;

self.addEventListener('message', (evt) => {
	switch (evt.data.type) {
		case 'init':
			detector = PitchFinder.YIN({
				bufferSize: evt.data.bufferSize,
				sampleRate: evt.data.sampleRate,
				threshold: evt.data.threshold
			});
			return;

		case 'detect':
			const estimate = detector(new Float32Array(evt.data.channelData));
			postMessage({
				pitch: estimate.freq
			});
	}
});
