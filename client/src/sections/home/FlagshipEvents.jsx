import React from "react";
import EventCard from "../../components/EventCard";

const eventsData = [
  {
    id: 0,
    badge: "Flagship Program",
    title: "WORKSHOPS",
    image: "/images/ieee-day.png",
    description:
      "A season-long learning journey across Technical, Non-Technical, and PES tracks, blending hands-on projects with industry mentorship and a final competition showcasing participants' work.",
  },
  {
    id: 1,
    badge: "2-Day Event",
    title: "ELECTROVISION X",
    image: "/images/hackathon.png",
    description:
      "An immersive two-day experience in Electrical Power Engineering, pairing expert-led technical talks with hands-on training on KNX, PLC, lighting, and PV systems.",
  },
];

export default function FlagshipEvents() {
  return (
    <section
      id="flagship-events"
      className="w-full py-12 lg:py-20 px-4 lg:px-6 bg-main transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-12 lg:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-[72px] font-black uppercase text-center leading-tight">
            <span className="text-foreground transition-colors duration-300">
              FLAGSHIP{" "}
            </span>
            <span className="text-primary-dark">EVENTS</span>
          </h2>

          <div className="mt-3 lg:mt-4 rounded-full w-[100px] lg:w-[128px] h-[4px] lg:h-[6px] bg-linear-to-r from-primary-dark to-primary-light" />
        </div>

        <div className="flex flex-col lg:flex-row items-start justify-center gap-10 lg:gap-8">
          {eventsData.map((event) => (
            <EventCard
              key={event.id}
              badge={event.badge}
              title={event.title}
              image={event.image}
              description={event.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
