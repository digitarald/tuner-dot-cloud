import EventEmitter from 'wolfy87-eventemitter';

export default class Canvas extends EventEmitter {
  constructor(fill = null) {
    super();
    this.fill = fill;
    this.element = document.createElement('canvas');
    document.body.appendChild(this.element);
    this.ctx = this.element.getContext('2d');
    window.addEventListener('resize', () => this.fit());
    this.fit();
  }

  clear() {
    this.ctx.save();
    if (this.fill) {
      this.ctx.fillStyle = this.fill;
      this.ctx.fillRect(0, 0, this.size[0], this.size[1]);
    } else {
      this.ctx.clearRect(0, 0, this.size[0], this.size[1]);
    }
    this.ctx.restore();
  }

  fit() {
    this.ctx.restore();
    this.size = [window.innerWidth, window.innerHeight];
    const {element, size} = this;
    const ratio = window.devicePixelRatio || 1;
    const scale = `scale(${1 / ratio})`;
    element.style.transform = scale;
    element.width = size[0] * ratio;
    element.height = size[1] * ratio;
    this.ctx.scale(ratio, ratio);
    this.ctx.save();
  }
}
