import EventEmitter from 'wolfy87-eventemitter';
import Canvas from './canvas.js';
import {Spring, tickSpring} from './spring.js';

export default class Simple extends EventEmitter {
  graph = new Canvas('rgb(30, 68, 136)');
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

  set(key, value) {
    const previous = this[key];
    this[key] = value;
    this.emit(key, value, previous);
  }

  start() {
    this.update(window.performance.now());
  }

  update(now) {
    window.requestAnimationFrame(this.updateBound);
    this.volumeSpring.setEndValue(this.volume);
    this.centsSpring.setEndValue(this.cents);
    this.detectedSpring.setEndValue(this.detected ? 1 : 0, this.detected);
    tickSpring(now);

    const {ctx, size} = this.graph;
    const center = [size[0] / 2, size[1] / 2];
    this.graph.clear();
    // const volume = this.volumeSpring.value;
    // if (volume > 0.01) {
    //   ctx.save();
    //   ctx.beginPath();
    //   ctx.fillStyle = '#fff';
    //   ctx.arc(
    //     size[0] / 2, size[1] / 2,
    //     size[1] / 2 * volume,
    //     0, Math.PI * 2
    //   );
    //   ctx.fill();
    //   ctx.restore();
    // }

    const cents = this.centsSpring.value / 50;
    const alpha = this.detectedSpring.value * 0.7 + 0.3;
    const width = 100 - (cents) * 90;
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
  }
}
