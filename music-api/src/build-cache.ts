import { guitar, chordFinder, CHORDS } from "./index";
import fs from "fs";

const createCache = () => {
  for (const chord of CHORDS.slice(0, 10)) {
    for (let root = 0; root < 3; root++) {
      const name = [guitar.tuningName, chord.name, root]
        .join("_")
        .replace(/ /g, "_");
      const found = chordFinder(guitar, chord, root, {
        doubling: true,
        distance: 4,
      });
      console.log(`${name}: ${found.chords.length}`);
      fs.writeFileSync(`./cache/${name}.json`, JSON.stringify(found.chords));
    }
  }
};

createCache();
