import { Hero } from "../sections/Hero.jsx";
import { Rules } from "../sections/Rules.jsx";
import { Shelf } from "../sections/Shelf.jsx";
import { Banks } from "../sections/Banks.jsx";
import { Price } from "../sections/Price.jsx";
import { RoturBand } from "../sections/RoturBand.jsx";

export function Home() {
  return (
    <>
      <Hero />
      <Rules />
      <Shelf />
      <Banks />
      <Price />
      <RoturBand />
    </>
  );
}
