import React from "react";
import Hero from "../sections/home/Hero";
import Chapters from "../sections/home/Chapters";
import About from "../sections/home/About";
import FlagshipEvents from "../sections/home/FlagshipEvents";
import Chairpersons from "../sections/home/Chairpersons";
import Achievements from "../sections/home/Achievements";
import JoinUs from "../components/JoinUs";
import MembershipBenefits from "../components/MembershipBenefits";

function Home() {
  return (
    <div className="*:px-4 md:*:px-8">
      <Hero />
      <About />
      <Chapters />
      <FlagshipEvents />
      <Achievements />
      <Chairpersons />
      <MembershipBenefits />
      <JoinUs />
    </div>
  );
}

export default Home;
