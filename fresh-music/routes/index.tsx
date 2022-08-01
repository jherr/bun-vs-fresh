/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";

const chordFiles = [
  "http://localhost:8080/Guitar_Standard_11th-9_1.json",
  "http://localhost:8080/Guitar_Standard_6th-7_0.json",
  "http://localhost:8080/Guitar_Standard_6th-7_1.json",
  "http://localhost:8080/Guitar_Standard_6th-7_2.json",
];

export const handler: Handlers<
  | {
      notes: number[];
    }[]
  | null
> = {
  async GET(_, ctx) {
    const chords = await Promise.all(
      chordFiles.map((url) => fetch(url).then((res) => res.json()))
    );
    return ctx.render(chords.flat());
  },
};

const Chord = ({ chord }: { chord: { notes: number[] } }) => {
  return <div>{JSON.stringify(chord.notes)}</div>;
};

export default function Home({
  data,
}: PageProps<
  | {
      notes: number[];
    }[]
  | null
>) {
  return (
    <div>
      {data.map((chord) => (
        <Chord chord={chord} />
      ))}
    </div>
  );
}
