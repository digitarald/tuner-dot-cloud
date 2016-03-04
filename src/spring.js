'use strict';

function Spring(value, options) {
	options = options || {};
	this.endValue = value || 0.0;
	this.value = value || 0.0;
	this.velocity = 0.0;
	this.tension = 50.0;
	this.damping = 0.85;
	this.active = true;
	for (var key in options) {
		if (this.hasOwnProperty(key)) {
			this[key] = options[key];
		}
	}
	// this.willStep = null;
	// this.didStep = null;
	this.ref = null;
	activeLength++;
	allSprings.push(this);
}

Spring.prototype = {
	setEndValue: function(value, reset) {
		if (this.endValue == value && this.value == value) {
			return;
		}
		this.endValue = value;
		if (reset) {
			this.velocity = 0;
			this.value = value;
		} else if (!this.active) {
			this.active = true;
			activeLength++;
		}
	}
};

var allSprings = [];
var activeLength = 0
var fdt = 1 / 60;
var epsilon = 0.01;
var tail = 0.0;
var past = 0.0;

Spring.stepAll = function(now) {
	now /= 1000;
	if (past == 0) {
		past = now;
		return true;
	}
	tail += Math.min(now - past, 0.5);
	past = now;
	var iterations = Math.floor(tail / fdt);
	tail -= iterations * fdt;
	if (iterations == 0 || activeLength == 0) {
		return false;
	}
	for (var i = 0, l = allSprings.length; i < l; i++) {
		var spring = allSprings[i];
		if (!spring.active) {
			continue;
		}
		for (var j = 0; j < iterations; j++) {
			var f = spring.tension * (spring.endValue - spring.value);
			spring.value += (spring.velocity + f * 0.5 * fdt) * fdt;
			spring.velocity = (spring.velocity +
				(f + spring.tension * (spring.endValue - spring.value)) * 0.5 * fdt) *
				spring.damping;
			if (Math.abs(spring.value - spring.endValue) < epsilon &&
				Math.abs(spring.velocity) < epsilon) {
				spring.active = false;
				activeLength--;
				break;
			}
		}
	}
	return true;
};

Spring.force = function() {

}

Spring.fromValues = function(values, options) {
	var springs = [];
	for (var i = 0, l = values.length; i < l; i++) {
		springs.push(new Spring(values[i], options));
	};
	return springs;
};

Spring.setEndValues = function(springs, values) {
	for (var i = 0, l = springs.length; i < l; i++) {
		springs[i].setEndValue(values[i]);
	};
};

Spring.getValues = function(springs, values) {
	for (var i = 0, l = springs.length; i < l; i++) {
		values[i] = springs[i].value;
	};
	return values;
};