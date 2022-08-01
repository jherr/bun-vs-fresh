export const IONIAN_SCALE = [2, 2, 1, 2, 2, 2, 1];
export const SCALE_NOTES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const createCircleOfFiths = () => {
  const scales: number[][] = [];
  for (let root = 0; root <= 12; root++) {
    let fnote = root;
    scales[root] = [fnote];
    for (let item = 0; item <= 14; item++) {
      fnote += IONIAN_SCALE[item % 7];
      scales[root].push(fnote % 12);
    }
  }
  return scales;
};

export const CircleOfFifths = createCircleOfFiths();

export const getNoteByName = (name: string): number =>
  SCALE_NOTES.findIndex((note) => note === name.toUpperCase());
export const getNoteFromMIDI = (midi: number) => midi % 12;

export interface Scale {
  name: string;
  intervals: number[];
}

export const createScale = (name: string, intervals: number[]): Scale => ({
  name,
  intervals,
});

export const SCALES = [
  createScale("Ionian (major)", [2, 2, 1, 2, 2, 2, 1]),
  createScale("Dorian", [2, 1, 2, 2, 2, 1, 2]),
  createScale("Phrygian", [1, 2, 2, 2, 1, 2, 2]),
  createScale("Lydian", [2, 2, 2, 1, 2, 2, 1]),
  createScale("Mixolydian", [2, 2, 1, 2, 2, 1, 2]),
  createScale("Aeolian", [2, 1, 2, 2, 1, 2, 2]),
  createScale("Locrian", [1, 2, 2, 1, 2, 2, 2]),
  createScale("Chromatic", [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]),
  createScale("Adolfos Scale", [1, 2, 2, 1, 1, 2, 2]),
  createScale("Diminished", [2, 1, 2, 1, 2, 1, 2, 1]),
  createScale("Enigmatic", [1, 3, 2, 2, 2, 1, 1]),
  createScale("Harmonic Minor", [2, 1, 2, 2, 1, 3, 1]),
  createScale("Hungarian Minor", [2, 1, 3, 1, 1, 3, 1]),
  createScale("Melodic Minor", [2, 1, 2, 2, 2, 2, 1]),
  createScale("Neapolitan", [1, 2, 2, 2, 2, 2, 1]),
  createScale("Neapolitan Minor", [1, 2, 2, 2, 1, 3, 1]),
  createScale("Pentatonic", [2, 2, 3, 2, 3]),
  createScale("Pentatonic Minor", [3, 2, 2, 3, 2]),
  createScale("Ten Tone", [1, 2, 1, 1, 1, 1, 2, 1, 1]),
  createScale("Whole Tone", [2, 2, 2, 2, 2, 2]),
];

export const AUGMENTS: { [key: string]: number } = {
  "#": 1,
  "##": 2,
  b: -1,
  bb: -2,
  "": 0,
};

export interface Tone {
  root: number;
  augment: number;
}

export const createTone = (root: number, augment: number): Tone => ({
  root,
  augment,
});

export const parseTone = (text: string): Tone | null => {
  const found = text.match(/^(\d+)(.*)$/);
  return found
    ? createTone(parseInt(found[1]), AUGMENTS[found?.[2]] ?? 0)
    : null;
};

export interface ChordSpelling {
  tones: Tone[];
  name: string;
  shortName?: string;
}

export const createChordSpelling = (
  name: string,
  shortName?: string,
  toneString?: string
) => ({
  name,
  shortName,
  tones: (toneString ?? "").split(",").map((t) => parseTone(t)) as Tone[],
});

export const circleOfFithsNote = (root: number, tone: Tone): number => {
  const fnote = CircleOfFifths[root][tone.root - 1] + tone.augment;
  return (fnote + 12) % 12;
};

export const chordNotes = (spelling: ChordSpelling, root: number): number[] =>
  spelling.tones.map((t) => circleOfFithsNote(root, t));

export const spellingInversions = (
  spelling: ChordSpelling,
  root: number
): { [note: number]: number } => {
  const map: { [note: number]: number } = {};
  chordNotes(spelling, root).forEach((n, inv) => {
    map[n] = inv + 1;
  });
  return map;
};

export const CHORDS = [
  createChordSpelling("Maj.", ",maj", "1,3,5"),
  createChordSpelling("11th", "11", "1,3,5,7b,9,11"),
  createChordSpelling("11th-9", undefined, "1,3,5,7b,9b,11"),
  createChordSpelling("13th", "13", "1,3,5,7b,9,11,13"),
  createChordSpelling("13th no 5th", undefined, "1,3,7b,9,11,13"),
  createChordSpelling("6th", "6", "1,3,5,6"),
  createChordSpelling("6th-7", undefined, "1,3,5,6,7b"),
  createChordSpelling("6th-7 Sus.", undefined, "1,4,5,6,7b"),
  createChordSpelling("7th", "7", "1,3,5,7b"),
  createChordSpelling("7th-9+5", undefined, "1,3,5#,7b,9b"),
  createChordSpelling("7th+11", "7+11", "1,3,5,7b,9,11#"),
  createChordSpelling("7th+5", "7+5", "1,3,5#,7b"),
  createChordSpelling("7th+9", "7+9", "1,3,5,7b,9#"),
  createChordSpelling("7th+9+5", undefined, "1,3,5#,7b,9#"),
  createChordSpelling("7th+9-5", undefined, "1,3,5b,7b,9#"),
  createChordSpelling("7th-5", "7-5", "1,3,5b,7b"),
  createChordSpelling("7th-9", "7-9", "1,3,5,7b,9b"),
  createChordSpelling("7th-9-5", undefined, "1,3,5b,7b,9b"),
  createChordSpelling("7th Sus. 4", "7sus4", "1,4,5,7b"),
  createChordSpelling("7th-11", undefined, "1,3,5,7b,11"),
  createChordSpelling("9th", "9", "1,3,5,7b,9"),
  createChordSpelling("9th+5", "9+5", "1,3,5#,7b,9"),
  createChordSpelling("9th-5", "9-5", "1,3,5b,7b,9"),
  createChordSpelling("Add +11", undefined, "1,3,5,11#"),
  createChordSpelling("Add 9", "add9", "1,3,5,9"),
  createChordSpelling("Aug.", "aug", "1,3,5#"),
  createChordSpelling("Dim.", "dim", "1,3b,5b"),
  createChordSpelling("Dim. 7th", "dim7,7dim", "1,3b,5b,7bb"),
  createChordSpelling("Maj. 6 add 9", undefined, "1,3,5,6,9"),
  createChordSpelling("Maj. 7th", "maj7,7maj", "1,3,5,7"),
  createChordSpelling("Maj. 7th+11", undefined, "1,3,5,7,11#"),
  createChordSpelling("Maj. 7th+5", undefined, "1,3,5#,7"),
  createChordSpelling("Maj. 7th-5", undefined, "1,3,5b,7"),
  createChordSpelling("Maj. 9th", "maj9,9maj", "1,3,5,7,9"),
  createChordSpelling("Maj. 9th+11", undefined, "1,3,5,7,9,11#"),
  createChordSpelling("Maj.-Min. 7th", undefined, "1,3b,5,7"),
  createChordSpelling("Min.", "m,min", "1,3b,5"),
  createChordSpelling("Min. 11th", "maj11", "1,3b,5,7b,9,11"),
  createChordSpelling("Min. 6th", "maj6", "1,3b,5,6"),
  createChordSpelling("Min. 6th Add 9", undefined, "1,3b,5,6,9"),
  createChordSpelling("Min. 6th-7", undefined, "1,3b,5,6,7b"),
  createChordSpelling("Min. 6th-7-11", undefined, "1,3b,5,6,7b,11"),
  createChordSpelling("Min. 7th", "maj7", "1,3b,5,7b"),
  createChordSpelling("Min. 7th-5", undefined, "1,3b,5b,7b"),
  createChordSpelling("Min. 7th-9", undefined, "1,3b,5,7b,9b"),
  createChordSpelling("Min. 7th-11", undefined, "1,3b,5,7b,11"),
  createChordSpelling("Min. 9th", "maj9", "1,3b,5,7b,9"),
  createChordSpelling("Min. 9th-5", undefined, "1,3b,5b,7b,9"),
  createChordSpelling("Min. Add 9", "min+9", "1,3b,5,9"),
  createChordSpelling("Min.-Maj. 9th", undefined, "1,3b,5,7,9"),
  createChordSpelling("Sus. 4", "sus4", "1,4,5"),
];

export const getChordByName = (name: string): ChordSpelling | undefined =>
  CHORDS.find((c) => c.name === name);

export const getChordByShortName = (name: string): ChordSpelling | undefined =>
  CHORDS.filter(({ shortName }) => shortName).find((spelling) =>
    spelling.shortName?.split(",").includes(name)
  );

export const parseShortName = (
  shortName: string
): {
  root: number;
  chord: ChordSpelling;
} | null => {
  const found = shortName.match(/([A-Z](?:[b#])?)(.*?)$/i);
  if (!found) {
    return null;
  }
  let root = 0;
  if (found[1].search(/[A-Z]b/i)) {
    const rootFound = found[1].match(/([A-Z])/)?.[1];
    if (!rootFound) {
      return null;
    }
    root = (getNoteByName(rootFound[1]) + 11) % 12;
  } else {
    root = getNoteByName(found[1]);
  }
  return {
    root,
    chord: getChordByShortName(shortName) as ChordSpelling,
  };
};
