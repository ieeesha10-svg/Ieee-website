import React from "react";
import Hero from "../sections/home/HeroHome";
import Chapters from "../sections/home/Chapters";
import FlagshipEvents from "../sections/home/FlagshipEvents";
import Chairpersons from "../sections/home/Chairpersons";
import JoinUs from "../sections/home/JoinUs";
import MembershipBenefits from "../sections/home/MembershipBenefits";
import MissionVisionSection from "../sections/home/MissionVisionSection";

function Home() {
  return (
    <div className="*:px-4 md:*:px-8">
			<Hero />
      <MissionVisionSection />
      <MembershipBenefits />
      <FlagshipEvents />
      <Chapters />
      <Chairpersons />
      <JoinUs />
    </div>
  );
}

export default Home;
