import React from "react";
import Hero from "../sections/home/Hero";
import Chapters from "../sections/home/Chapters";
import About from "../sections/home/About";
import FlagshipEvents from "../sections/home/FlagshipEvents";
import Chairpersons from "../sections/home/Chairpersons";
import Achievements from "../sections/home/Achievements";
import JoinUs from "../components/JoinUs";
import Footer from "../components/Footer";
import MyProfile from "./MyProfile";

function Home() {
  return (
    <>
      <Hero />
      <About />
      <Chapters />
      <FlagshipEvents />
      <Achievements />
      <Chairpersons />
      <JoinUs />
      <Footer />
    </>
  );
}

export default Home;
