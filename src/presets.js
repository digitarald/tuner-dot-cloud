import {byName} from './note.js';
import data from './presets-data.js';

class Preset {
  constructor(name, range) {
    this.name = name;
    this.notes = range;
    const low = byName.get(range[0]);
    const high = byName.get(range[1]);
    this.pitchRange = [
      (low.previous || low).pitch,
      (high.next || high).pitch
    ];
  }
}

const presets = new Map();
for (let name in data) {
  presets.set(name, new Preset(name, data[name]));
}
export default presets;
