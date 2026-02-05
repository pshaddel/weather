import Image from "next/image";
import { Board } from "./board";

type HomeProps = {
  searchParams?: {
    latitude?: string;
    longitude?: string;
    lat?: string;
    lon?: string;
    city?: string;
  };
};

export default function Home({ searchParams }: HomeProps) {
  return (
    <Board searchParams={searchParams} />
  );
}
