import EventEmitter from 'wolfy87-eventemitter';
import Canvas from './canvas.js';
import {Spring, tickSpring, createSprings, setSpringEndValues, copySpringValues} from './spring.js';
import {noteFromPitch, byName} from './note.js';
import { scaleLinear } from 'd3-scale';
import { line, curveBasisClosed } from 'd3-shape';

const fullRange = [byName.get('A0').pitch, byName.get('A8').pitch];

export default class Simple extends EventEmitter {
  main = new Canvas();
  updateBound = this.update.bind(this);
  centsSpring = new Spring(0);
  volumeSpring = new Spring(0);
  detectedSpring = new Spring(0);

  last = 0;
  cents = 0;
  volume = 0;
  pitch = 0;
  note = null;
  detected = false;
  lastNote = false;

  constructor(signal) {
    super();
    this.signal = signal;
    this.range = this.signal.range;
    this.frequencyData = this.signal.frequencyData;
    this.frequencySprings = createSprings(this.frequencyData);
    this.attach();
  }

  attach() {
    this.signal.on('didSkip', () => {
      this.set('detected', false);
    });
    this.signal.on('didDetect', ({pitch}) => {
      const note = noteFromPitch(pitch);
      this.set('detected', true);
      this.set('last', Date.now());
      this.set('pitch', pitch);
      this.set('note', note);
      this.set('cents', note.centsOffFromPitch(pitch));
    });
  }

  set(key, value) {
    // const previous = this[key];
    this[key] = value;
    // this.emit(key, value, previous);
  }

  start() {
    this.update(window.performance.now());
  }

  update(now) {
    window.requestAnimationFrame(this.updateBound);
    this.signal.analyse();

    const noteChanged = (this.note && this.lastNote !== this.note.whole);
    this.volumeSpring.setEndValue(this.volume);
    this.centsSpring.setEndValue(this.cents, noteChanged);
    this.detectedSpring.setEndValue(this.detected ? 1 : 0, noteChanged);
    setSpringEndValues(this.frequencySprings, this.frequencyData);
    tickSpring(now);
    copySpringValues(this.frequencySprings, this.frequencyData);

    const {ctx, size} = this.main;
    const center = [size[0] / 2, size[1] / 2];
    const offAngle = Math.PI / 2;
    this.main.clear();

    const radius = Math.min(center[0], center[1]);
    const x = scaleLinear()
      .domain([
        Math.floor(this.signal.pitchToIndex(fullRange[0])),
        Math.ceil(this.signal.pitchToIndex(fullRange[1]))
      ])
      .clamp(true)
      .range([0, Math.PI * 18]);
    const y = scaleLinear()
      .domain([0, 256])
      .clamp(true)
      .range([radius / 3, radius]);
    const lineX = line()
      .curve(curveBasisClosed)
      .x((freq, idx) => {
        // if (freq >= 255) {
        //   debugger;
        // }
        return center[0] + Math.cos(offAngle + x(idx)) * y(freq < 250 ? freq : 0);
      })
      .y((freq, idx) => {
        return center[1] + Math.sin(offAngle + x(idx)) * y(freq < 250 ? freq : 0);
      });
    const data = lineX(this.frequencyData);
    const p = new window.Path2D(data);
    ctx.save();
    ctx.moveTo(center[0], center[1]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0, 93, 165, 0.5)';
    ctx.stroke(p);
    ctx.fillStyle = 'rgba(0, 93, 165, 0.1)';
    ctx.fill(p);
    ctx.restore();

    const cents = this.centsSpring.value / 50;
    const alpha = this.detectedSpring.value * 0.7 + 0.3;
    const barWidth = center[0] * 0.38;
    const width = cents * barWidth;
    ctx.save();
    ctx.fillStyle = `rgba(111, 190, 74, ${alpha})`;
    ctx.fillRect(
      center[0] + (center[0] * cents) - width / 2, 0,
      width, size[1]
    );
    ctx.restore();

    const note = this.note;
    const fontMd = Math.round(center[1] * 0.61);
    const fontSm = Math.round(fontMd * 0.61);
    ctx.save();
    // ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    // ctx.fillRect(center[0] - fontMd / 4, center[1] - fontMd / 2, fontMd / 2, fontMd);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = `${fontMd}px sans-serif`;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    if (note) {
      ctx.fillText(note.whole, center[0], center[1]);
      ctx.textAlign = 'left';
      ctx.font = `${fontSm}px sans-serif`;
      ctx.textBaseline = 'top';
      ctx.fillText(note.octave, center[0] + fontSm * 0.38, center[1] - fontMd * 0.61);
      ctx.textBaseline = 'bottom';
      ctx.fillText(note.accidental, center[0] + fontSm * 0.38, center[1] + fontMd * 0.61);
    }
    ctx.restore();
    this.emit('didUpdate');
    if (this.note && this.detected) {
      this.lastNote = this.note.whole;
    }
  }
}
