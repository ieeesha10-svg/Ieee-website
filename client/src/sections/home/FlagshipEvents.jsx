import React from "react";
import EventCard from "../../components/EventCard";

const eventsData = [
  {
    id: 1,
    badge: "Annual Event",
    title: "IEEE DAY 2026",
    image: "/images/ieee-day.png",
    description:
      "Celebrating IEEE's founding with workshops, competitions, and networking opportunities bringing together students and professionals from across the region.",
  },
  {
    id: 2,
    badge: "Competition",
    title: "INNOVATE HACKATHON",
    image: "/images/hackathon.png",
    description:
      "A 48-hour innovation marathon where teams build groundbreaking solutions to real-world challenges with expert mentorship and exciting prizes.",
  },
];

export default function FlagshipEvents() {
  return (
    <section
      id="flagship-events"
      className="w-full py-12 lg:py-20 px-4 lg:px-6 bg-main transition-colors duration-300"
    >
      <div className="max-w-[1280px] mx-auto">
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
