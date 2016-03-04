import EventEmitter from 'wolfy87-eventemitter';

export default class Canvas extends EventEmitter {
  constructor(element) {
    super();
    this.canvas = element;
    this.ctx = this.canvas.getContext('2d');
    this.updateBound = this.update.bind(this);
    this.state = new Map();
    window.addEventListener('resize', () => this.fit());
    this.fit();
  }

  set(key, value) {
    this.state.set(key, value);
    this.on(key, value);
  }

  update() {
    window.requestAnimationFrame(this.updateBound);
    const {ctx, center, display} = this;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, display[0], display[1]);
    ctx.restore();

    const volume = this.state.get('volume') || 0;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = '#fff';
    ctx.arc(
      center[0], center[1],
      center[1] * volume,
      0, Math.PI * 2
    );
    ctx.stroke();
    ctx.restore();

    const note = this.state.get('note');
    ctx.save();
    ctx.font = '48px serif';
    ctx.fillStyle = 'red';
    if (note) {
      ctx.fillText(note.notation, center[0], center[1]);
    } else {
      ctx.fillText('-', center[0], center[1]);
    }
    ctx.restore();
  }

  fit() {
    this.ctx.restore();
    this.display = [window.innerWidth, window.innerHeight];
    const {canvas, display} = this;
    this.center = [display[0] / 2, display[1] / 2];
    const ratio = window.devicePixelRatio || 1;
    const scale = `scale(${1 / ratio})`;
    canvas.style.transform = scale;
    canvas.width = display[0] * ratio;
    canvas.height = display[1] * ratio;
    this.ctx.scale(ratio, ratio);
    this.ctx.save();
  }
}
