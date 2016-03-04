import EventEmitter from 'wolfy87-eventemitter';

export class Spring extends EventEmitter {
  velocity = 0.0;
  tension = 50.0;
  damping = 0.85;
  active = true;
  ref = null;

  constructor(value = 0.0, options = {}) {
    super();
    this.endValue = value;
    this.value = value;
    Object.assign(this, options);
    activeLength++;
    allSprings.push(this);
  }

  setEndValue(value, reset) {
    if (this.endValue === value && this.value === value) {
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

const allSprings = [];
let activeLength = 0;
const fdt = 1 / 60;
const epsilon = 0.01;
let tail = 0.0;
let past = 0.0;

export function tickSpring(now) {
  now /= 1000;
  if (past === 0) {
    past = now;
    return true;
  }
  tail += Math.min(now - past, 0.5);
  past = now;
  const iterations = Math.floor(tail / fdt);
  tail -= iterations * fdt;
  if (iterations === 0 || activeLength === 0) {
    return false;
  }
  for (let i = 0, l = allSprings.length; i < l; i++) {
    const spring = allSprings[i];
    if (!spring.active) {
      continue;
    }
    for (let j = 0; j < iterations; j++) {
      const f = spring.tension * (spring.endValue - spring.value);
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

export function createSprings(values, options) {
  const springs = [];
  for (let i = 0, l = values.length; i < l; i++) {
    springs.push(new Spring(values[i], options));
  };
  return springs;
};

export function setSprings(springs, values) {
  for (let i = 0, l = springs.length; i < l; i++) {
    springs[i].setEndValue(values[i]);
  };
};

export function forEachSpring(springs, callback) {
  for (let i = 0, l = springs.length; i < l; i++) {
    callback(springs[i].value, springs[i].ref);
  };
};
