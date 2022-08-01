import React from "react";

const chordFiles = [
  "http://localhost:8080/Guitar_Standard_11th-9_1.json",
  "http://localhost:8080/Guitar_Standard_6th-7_0.json",
  "http://localhost:8080/Guitar_Standard_6th-7_1.json",
  "http://localhost:8080/Guitar_Standard_6th-7_2.json",
];

export async function getServerSideProps() {
  const chords = await Promise.all(
    chordFiles.map((url) => fetch(url).then((res) => res.json()))
  );
  return {
    props: {
      chords: chords.flat(),
    },
  };
}

const Chord = ({ chord }: { chord: { notes: number[] } }) => {
  return <div>{JSON.stringify(chord.notes)}</div>;
};

export default function Home({
  chords,
}: {
  chords: {
    notes: number[];
  }[];
}) {
  return (
    <div>
      {chords.map((chord, i) => (
        <Chord chord={chord} key={i} />
      ))}
    </div>
  );
}
