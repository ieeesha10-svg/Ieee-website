import React from "react";
import Hero from "../sections/home/Hero";
import Chapters from "../sections/home/Chapters";
import About from "../sections/home/About";
import FlagshipEvents from "../sections/home/FlagshipEvents";
import Achievements from "../sections/home/Achievements";

function Home() {
  return (
    <>
      <Hero />
      <About />
      <Chapters />
      <FlagshipEvents />
      <Achievements />
    </>
  );
}

export default Home;
