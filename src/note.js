class Note {
  constructor(note, octave) {
    this.note = note;
    this.octave = octave;
    this.index = (octave * 12) + note + 1;
    this.pitch = pitchFromIndex(this.index);
    const notation = notations[note];
    this.notation = notation;
    this.whole = notation.charAt(0);
    this.accidental = notation.charAt(1) || '';
    const previous = byIndex.get(this.index - 1);
    if (previous) {
      this.previous = previous;
      previous.next = this;
    }
  }

  get base() {
    return byIndex.get(this.index % 12) || this;
  }

  toString() {
    return this.notation;
  }

  centsOffFromPitch(pitch) {
    return (1200 * Math.log(pitch / this.pitch) / Math.log(2));
  }
};

// http://en.wikipedia.org/wiki/Scientific_pitch_notation
const notations = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

export function centFromPitch(pitch) {
  return 12 * (Math.log(pitch / 440) / Math.log(2)) + 49;
};

export function indexFromPitch(pitch) {
  return Math.round(centFromPitch(pitch));
};

export function noteFromPitch(pitch) {
  return byIndex.get(indexFromPitch(pitch)) || null;
};

export function pitchFromIndex(index) {
  return 440 * Math.pow(2, (index - 49) / 12);
};

export const byIndex = new Map();
export const byName = new Map();
export const list = new Set();

for (let octave = 0; octave <= 8; octave++) {
  for (let t = 0; t < 12; t++) {
    const note = new Note(t, octave);
    byIndex.set(note.index, note);
    byName.set(note.notation + note.octave, note);
    list.add(note);
  }
}
