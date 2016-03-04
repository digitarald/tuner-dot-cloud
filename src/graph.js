
// d3

var displayHeight = window.innerHeight;
var displayWidth = window.innerWidth;
var centerX = displayWidth / 2;
var centerY = displayHeight;
var radius = Math.max(displayWidth, displayHeight) * 0.8;

var x = d3.scale.linear()
	.domain([
		Math.floor(pitchToIndex(FILTER[0])),
		Math.ceil(pitchToIndex(FILTER[1]))
	])
	.clamp(true)
	// .range([0, displayWidth]);
	.range([Math.PI, Math.PI * 2]);
var y = d3.scale.linear()
	.domain([0, 256])
	// .range([displayHeight, 0]);
	.range([radius * 0.25, radius]);
var line = d3.svg.line()
	// .interpolate('step')
	.interpolate('basis-closed')
	.x(function(freq, idx) {
		// return x(idx);
		return centerX + Math.cos(x(idx)) * y(freq);
	})
	.y(function(freq, idx) {
		// return y(freq);
		return centerY + Math.sin(x(idx)) * y(freq);
	});
var svg = d3.select('main').append('svg')
	.attr('width', displayWidth)
	.attr('height', displayHeight);
var path = svg.append('path');

// Update UI

var $pitch = document.getElementById('pitch');
var $cents = document.getElementById('cents');
var $octave = document.getElementById('octave');
var $volume = document.getElementById('volume');
var $notes = document.getElementById('notes');

var notes = Note.list;
notes = notes.slice(0, 12).map(function(note) {
	var $element = document.createElement('li');
	$element.style.opacity = 0;
	var $whole = document.createElement('span');
	$whole.textContent = note.whole;
	$element.appendChild($whole);
	if (note.accidental) {
		var $accidental = document.createElement('small');
		$accidental.textContent = note.accidental;
		$element.appendChild($accidental);
	}
	// var $octave = document.createElement('small');
	// $octave.textContent = note.octave;
	// $element.appendChild($octave);
	$notes.appendChild($element);
	note.dom = $element;
	return note;
});

var noteSpring = new Spring(0);
var centSpring = new Spring(0);
var idleSpring = new Spring(0);
var pathSprings = Spring.fromValues(frequencyData, {
	tension: 75
});

var NOTELIST_CLAMP = 2.5; // 3.2;

var state = {
	isIdling: false
};

function tick(time) {
	raf(tick);

	// Spring.getValues(pathSprings, pathFrequencyData);

	// emitter.step(time);
	// for (var i = 0; i < FFT_RANGE[2]; i++) {
	// 	var px = i / FFT_RANGE[2] * displayWidth;
	// 	var force = pathFrequencyData[i + FFT_RANGE[0]] * 2;
	// 	var amount = Mathf.map(force, 0, 256, 0, 10) | 0;
	// 	var speed = Mathf.map(force, 0, 256, 0, 100);
	// 	for (var j = 0; j < amount; j++) {
	// 		emitter.spawn(
	// 			Mathf.variance(px, displayWidth / FFT_RANGE[2]),
	// 			Mathf.variance(displayHeight + 20 - speed / 4, speed / 2),
	// 			0,
	// 			-speed);
	// 	}
	// 	*
	// 	var freq = pathFrequencyData[i + FFT_RANGE[0]];
	// 	var px = centerX + Math.cos(x(i)) * y(Mathf.variance(freq / 4, freq / 2));
	// 	var py = centerY + Math.sin(x(i)) * y(Mathf.variance(freq / 4, freq / 2));
	// 	// var px = i / FFT_RANGE[2] * displayWidth;
	// 	var amount = Mathf.map(freq, 0, 256, 0, 10) | 0;
	// 	var speed = Mathf.map(freq, 0, 256, 0, 150);
	// 	for (var j = 0; j < amount; j++) {
	// 		emitter.spawn(
	// 			px,
	// 			py,
	// 			0,
	// 			-speed);
	// 	}

	// }

	if (!Spring.stepAll(time)) {
		return;
	}

	Spring.getValues(pathSprings, pathFrequencyData);

	// Spring.getValues(pathSprings, pathFrequencyData);
	pathFrequencyData[0] = 0;
	pathFrequencyData[pathFrequencyData.length - 1] = 0;
	path.attr('d', line(pathFrequencyData));

	var idleFactor = 1 - idleSpring.value * 0.7;

	$octave.textContent = baseOctave;

	var tweened = noteSpring.value;
	$pitch.textContent = Note.pitchFromIndex(baseOctave * 12 + tweened).toFixed(1) + ' Hz';

	$volume.textContent = Math.round(volumeAvg.average) + '±' + Math.round(volumeAvg.sd);
	// var found = Note.noteFromPitch(value);
	// var pointer = Note.centFromPitch(value);

	var cents = centSpring.value;
	$cents.textContent = cents.toFixed(1) + ' c';


	notes.forEach(function(note) {
		var diff = note.index - tweened;
		var direction = (diff > 0) ? 1 : -1;
		var factor = Math.min(Math.abs(diff), NOTELIST_CLAMP) / NOTELIST_CLAMP;
		if (factor == 1) {
			if (note.state.visible) {
				note.dom.style.display = 'none';
				note.state.visible = false;
			}
			return;
		} else if (!note.state.visible) {
			note.dom.style.display = 'block';
			note.state.visible = true;
		}

		// This should use spring animations
		if (baseNote == note) {
			if (!note.state.found) {
				note.state.found = true;
				note.dom.classList.add('found');
			}
		} else if (note.state.found) {
			// console.log('Unfound');
			note.state.found = false;
			note.dom.classList.remove('found');
		}
		// Perfect match
		if (baseNote == note && Math.abs(cents) <= 6) {
			if (!note.state.matched) {
				note.state.matched = true;
				note.dom.classList.add('matched');
			}
		} else if (note.state.matched) {
			note.state.matched = false;
			note.dom.classList.remove('matched');
		}

		var sin = Math.sin(factor * direction * Math.PI / 2);
		var cos = Math.cos(factor * direction * Math.PI / 2);
		var sin2 = Math.sin(factor * Math.PI / 2);

		var x = sin * 0.55 * displayWidth;
		// var z = -sin2 * displayWidth * 0.5;
		var scale = 1 - (sin2 * 0.5);
		var rotate = -sin2 * direction * 90;
		var opacity = cos * idleFactor;
		// note.dom.style.transform = 'translateX(' + x + 'px) rotateY(' + rotate + 'deg) scale(' + scale + ')';
		note.dom.style.transform = 'translateX(' + Mathf.roundCss(x) + 'px)';
		note.dom.style.opacity = opacity;
	});
}

function start() {
	raf(tick);
}

start();

var canvas = document.querySelector('#canvas');
canvas.width = displayWidth;
canvas.height = displayHeight;
var emitter = new ParticleEmitter(canvas);
emitter.velocityVariance = 5;
