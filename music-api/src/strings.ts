import {
  getNoteFromMIDI,
  SCALE_NOTES,
  ChordSpelling,
  chordNotes,
  spellingInversions,
} from "./theory";
import { Shape, createShape, compareWithKnownShapes } from "./shapes";

const GUITAR_BASE_NOTE = 40;
const BASS_BAS_NOTE = 28;
const STANDARD_FRET_COUNT = 22;

export interface StringedInstrumentLocation {
  string: number;
  fret: number;
}

export const createLocation = (
  string: number,
  fret: number
): StringedInstrumentLocation => ({
  string,
  fret,
});

export interface Tuning {
  name: string;
  intervals: number[];
}
export const createTuning = (name: string, intervals: number[]) => ({
  name,
  intervals,
});

export const TUNINGS = [
  createTuning("Guitar Standard", [0, 5, 5, 5, 4, 5]),
  createTuning("D Modal", [-2, 7, 5, 5, 2, 5]),
  createTuning("Dropped D", [-2, 7, 5, 5, 4, 5]),
  createTuning("Dropped D & A", [-2, 7, 5, 5, 2, 7]),
  createTuning("Dropped semi-tone", [-1, 5, 5, 5, 4, 5]),
  createTuning("Dropped whole-tone", [-2, 5, 5, 5, 4, 5]),
  createTuning("G Modal", [-2, 5, 7, 5, 5, 2]),
  createTuning("Open C", [-4, 7, 5, 7, 5, 4]),
  createTuning("Open C II", [0, 3, 5, 4, 8, 7]),
  createTuning("Open D", [-2, 7, 5, 4, 3, 5]),
  createTuning("Open D Minor", [-2, 7, 5, 3, 4, 5]),
  createTuning("Open E", [0, 7, 5, 4, 3, 5]),
  createTuning("Open E Minor", [0, 7, 5, 3, 4, 5]),
  createTuning("Open Eb", [-1, 5, 5, 5, 4, 5]),
  createTuning("Open G", [-2, 5, 7, 5, 4, 3]),
  createTuning("Bass Standard", [0, 5, 5, 5]),
];

export const getTuningByName = (n: string): Tuning =>
  TUNINGS.find(({ name }) => name === n) ?? TUNINGS[0];
export const getTuningsByStringCount = (count: number): Tuning[] =>
  TUNINGS.filter(({ intervals }) => intervals.length === count);

export interface StringedInstrument {
  tuningName: string;
  tuning: number[];
  midiTuning: number[];
  startNote: number;
  numFrets: number;
}

export const createInstrument = (
  startNote: number,
  numFrets: number,
  tuning: Tuning
): StringedInstrument => {
  const midiTuning: number[] = [];
  const tuningNotes: number[] = [];

  let midiNoteValue = startNote;
  tuning.intervals.forEach((ti) => {
    midiNoteValue += ti;
    midiTuning.push(midiNoteValue);
    tuningNotes.push(getNoteFromMIDI(midiNoteValue));
  });
  return {
    startNote,
    numFrets,
    tuningName: tuning.name,
    midiTuning,
    tuning: tuningNotes,
  };
};

export const bass = createInstrument(
  BASS_BAS_NOTE,
  STANDARD_FRET_COUNT,
  getTuningByName("Bass Standard")
);

export const guitar = createInstrument(
  GUITAR_BASE_NOTE,
  STANDARD_FRET_COUNT,
  getTuningByName("Guitar Standard")
);

export const instrumentFindNotes = (
  instrument: StringedInstrument,
  note: number
): StringedInstrumentLocation[] => {
  const locations: StringedInstrumentLocation[] = [];
  instrument.midiTuning.forEach((startNote, string) => {
    let fret = note - (startNote % 12);
    while (fret < instrument.numFrets) {
      if (fret >= 0) {
        locations.push(createLocation(string, fret));
      }
      fret += 12;
    }
  });
  return locations;
};

export const instrumentNumStrings = (instrument: StringedInstrument): number =>
  instrument.tuning.length;

export const instrumentTopNotes = (instrument: StringedInstrument): number[] =>
  instrument.midiTuning;

export const instrumentTopNames = (instrument: StringedInstrument): string[] =>
  instrumentTopNotes(instrument).map((n) => SCALE_NOTES[n % 12]);

export const instrumentNoteAt = (
  instrument: StringedInstrument,
  string: number,
  fret: number
): number => {
  return fret !== -1 ? instrument.midiTuning[string] + fret : -1;
};

export interface StringedChord {
  inversion: number;
  playability: number;
  extras: number;
  capo: number;
  instrument: StringedInstrument;
  notes: number[];
}

export const createStringedChord = (
  instrument: StringedInstrument,
  notes: number[] = []
) => {
  const chord: StringedChord = {
    instrument,
    inversion: -1,
    playability: -1,
    extras: 0,
    capo: 0,
    notes,
  };
  if (chord.notes.length === 0) {
    chord.notes = chord.instrument.midiTuning.map(() => -1);
  }
  calculatePlayability(chord);
  return chord;
};

const chordToShape = (chord: StringedChord): Shape => {
  return createShape(chord.notes);
};

const calculatePlayability = (chord: StringedChord) => {
  const info = compareWithKnownShapes(chordToShape(chord));
  chord.playability = info.min;
  chord.extras = info.extras;
};

const chordContains = (a: StringedChord, b: StringedChord): boolean => {
  let contains = true;
  a.notes.forEach((n, string) => {
    if (n === -1) {
      if (b.notes[string] !== -1) {
        contains = false;
      }
    } else if (b.notes[string] !== -1) {
      if (b.notes[string] !== n) {
        contains = false;
      }
    }
  });
  return contains;
};

const chordMaxFret = (chord: StringedChord): number => {
  return Math.max(...chord.notes);
};

const chordMinFret = (chord: StringedChord): number => {
  return Math.min(...chord.notes.filter((n) => n > -1));
};

const chordCount = (chord: StringedChord): number => {
  return chord.notes.filter((n) => n !== -1).length;
};

const chordMidiNotes = (chord: StringedChord): number[] => {
  return chord.notes.map((note, string) =>
    instrumentNoteAt(chord.instrument, string, note)
  );
};

const chordLowestNote = (chord: StringedChord): number => {
  return Math.min(...chordMidiNotes(chord).filter((n) => n !== -1)) % 12;
};

const chordSetNote = (
  chord: StringedChord,
  string: number,
  fret: number
): void => {
  chord.notes[string] = fret;
  calculatePlayability(chord);
};

const chordHasNote = (chord: StringedChord, string: number): boolean => {
  return chord.notes[string] !== -1;
};

const chordLocationString = (chord: StringedChord): string => {
  return chordMidiNotes(chord).join(" ");
};

interface ChordList {
  instrument: StringedInstrument;
  chord: ChordSpelling;
  root: number;
  chords: StringedChord[];
}

export interface ChordFinderOptions {
  distance: number;
  doubling: boolean;
}

export const chordFinder = (
  instrument: StringedInstrument,
  spelling: ChordSpelling,
  root: number,
  options: ChordFinderOptions
): ChordList => {
  const createChordList = (): StringedChord[] => [];
  const notes = chordNotes(spelling, root);
  const distance = options?.distance || 4;

  const addChords = (
    chords: StringedChord[],
    doubling: boolean = false
  ): StringedChord[] => {
    let newChords = createChordList();
    chords.forEach((chord) => newChords.push(chord));
    notes.forEach((note) => {
      if (newChords.length === 0) {
        instrumentFindNotes(instrument, note).forEach((location) => {
          const chord = createStringedChord(instrument);
          chordSetNote(chord, location.string, location.fret);
          newChords.push(chord);
        });
      } else {
        let addedChords = createChordList();
        newChords.forEach((chord) => {
          if (doubling) {
            addedChords.push(chord);
          }
          instrumentFindNotes(instrument, note).forEach((location) => {
            if (!chordHasNote(chord, location.string)) {
              const newChord = createStringedChord(instrument, [
                ...chord.notes,
              ]);
              chordSetNote(newChord, location.string, location.fret);
              if (chordMaxFret(newChord) - chordMinFret(newChord) <= distance) {
                addedChords.push(newChord);
              }
            }
          });
        });
        newChords = addedChords;
      }
    });
    return newChords;
  };

  let chords = createChordList();
  chords = addChords(chords);

  if (options?.doubling) {
    chords = addChords(chords, true);
    chords = addChords(chords, true);
  }

  const duplicates: { [key: string]: boolean } = {};
  const newChords = createChordList();
  chords.forEach((chord) => {
    const key = chordLocationString(chord);
    if (!duplicates[key]) {
      newChords.push(chord);
    }
    duplicates[key] = true;
  });
  chords = newChords;

  chords.sort((a, b) =>
    chordCount(a) < chordCount(b) ? 1 : chordCount(a) === chordCount(b) ? 0 : -1
  );

  const superChords = createChordList();
  chords.forEach((chord) => {
    let found = false;
    superChords.forEach((superChord) => {
      if (chordContains(superChord, chord)) {
        found = true;
      }
    });
    if (!found) {
      superChords.push(chord);
    }
  });
  chords = superChords;

  chords.sort((a, b) => {
    let diff =
      a.playability < b.playability
        ? -1
        : a.playability === b.playability
        ? 0
        : 1;
    if (diff === 0) {
      diff =
        chordMinFret(a) < chordMinFret(b)
          ? -1
          : chordMinFret(a) === chordMinFret(b)
          ? 0
          : 1;
    }
    return diff;
  });

  const inversionMap = spellingInversions(spelling, root);
  chords.forEach((chord) => {
    chord.inversion = inversionMap[chordLowestNote(chord)];
  });

  return {
    instrument,
    chord: spelling,
    root,
    chords,
  };
};
