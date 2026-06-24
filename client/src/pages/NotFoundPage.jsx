import React from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Calendar,
  Phone,
  Search,
  Users,
  Flag,
  Settings,
  Clock,
  Github,
  Crosshair,
} from "lucide-react";

import robotImage from "../assets/images/404-robot.png";

function ScatteredDecorators() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Top-left: clock icon */}
      <Clock
        size={20}
        className="absolute top-12 left-12 text-blue-100 opacity-60"
      />

      {/* Top-right: 2x2 grid of dots */}
      <div className="absolute top-16 right-20 grid grid-cols-2 gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-blue-200 opacity-60"
          />
        ))}
      </div>

      {/* Top-right slightly lower: Github icon */}
      <Github
        size={20}
        className="absolute top-24 right-10 text-blue-200 opacity-60"
      />

      {/* Middle-left: crosshair */}
      <Crosshair
        size={18}
        className="absolute top-1/3 left-16 text-blue-100 opacity-60"
      />

      {/* Middle-right: 3x3 grid of dots */}
      <div className="absolute top-1/2 right-16 grid grid-cols-3 gap-1">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-blue-200 opacity-60"
          />
        ))}
      </div>

      {/* Bottom-left: settings icon */}
      <Settings
        size={18}
        className="absolute bottom-24 left-14 text-blue-100 opacity-60"
      />

      {/* Decorative lines */}
      <div className="absolute top-28 left-20 w-16 h-px bg-primary/10" />
      <div className="absolute top-28 left-20 w-px h-12 bg-primary/10" />
      <div className="absolute top-36 left-24 w-8 h-px bg-primary/10" />
      <div className="absolute top-28 left-36 w-px h-8 bg-primary/10" />

      <div className="absolute top-40 right-24 w-20 h-px bg-primary/10" />
      <div className="absolute top-40 right-24 w-px h-16 bg-primary/10" />
      <div className="absolute top-44 right-28 w-12 h-px bg-primary/10" />
      <div className="absolute top-52 right-24 w-px h-8 bg-primary/10" />

      <div className="absolute bottom-36 left-28 w-24 h-px bg-primary/10" />
      <div className="absolute bottom-36 left-28 w-px h-14 bg-primary/10" />
      <div className="absolute bottom-40 left-36 w-10 h-px bg-primary/10" />
      <div className="absolute bottom-44 left-28 w-px h-6 bg-primary/10" />

      <div className="absolute bottom-44 right-28 w-14 h-px bg-primary/10" />
      <div className="absolute bottom-44 right-28 w-px h-10 bg-primary/10" />
      <div className="absolute bottom-40 right-32 w-8 h-px bg-primary/10" />
      <div className="absolute bottom-36 right-28 w-px h-6 bg-primary/10" />

      <div
        className="absolute top-1/4 left-1/5 w-24 h-px bg-primary/10"
        style={{ transform: "rotate(-25deg)" }}
      />
      <div
        className="absolute top-3/4 right-1/5 w-20 h-px bg-primary/10"
        style={{ transform: "rotate(20deg)" }}
      />
      <div
        className="absolute top-2/3 left-1/6 w-16 h-px bg-primary/10"
        style={{ transform: "rotate(-35deg)" }}
      />
      <div
        className="absolute top-1/5 right-1/6 w-16 h-px bg-primary/10"
        style={{ transform: "rotate(30deg)" }}
      />

      {/* Scattered cross marks */}
      <span className="absolute top-20 left-1/3 text-blue-200 opacity-60 text-lg font-thin">
        +
      </span>
      <span className="absolute top-1/2 left-1/4 text-blue-200 opacity-60 text-lg font-thin">
        ×
      </span>
      <span className="absolute bottom-32 right-1/4 text-blue-200 opacity-60 text-lg font-thin">
        +
      </span>
      <span className="absolute top-1/4 right-1/3 text-blue-200 opacity-60 text-lg font-thin">
        ×
      </span>
    </div>
  );
}

function SuggestionCards() {
  const cards = [
    {
      Icon: Search,
      title: "Search the Site",
      description:
        "Try searching for events, committees, or pages directly.",
    },
    {
      Icon: Users,
      title: "Visit Committees",
      description:
        "Check out our 8 active technical and creative committees.",
    },
    {
      Icon: Flag,
      title: "Report a Problem",
      description:
        "Found a broken link? Let our web team know and we'll fix it fast.",
    },
  ];

  return (
    <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-6xl w-full mx-auto">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white dark:bg-card rounded-xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary mb-4 shadow-lg shadow-primary/40">
            <card.Icon size={20} className="text-white" />
          </span>
          <h3 className="text-lg font-bold text-foreground mb-2">
            {card.title}
          </h3>
          <p className="text-sm text-muted">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
}

function FooterNote() {
  return (
    <p className="mt-12 text-xs text-muted text-center">
      Error Code:{" "}
      <span className="font-semibold text-primary">404</span>
      {" · "}IEEE Student Branch Web Systems{" · "}Still lost?{" "}
      <a
        href="mailto:ieee@university.edu.eg"
        className="text-primary hover:underline"
      >
        ieee@university.edu.eg
      </a>
    </p>
  );
}

function HeroBlock() {
  return (
    <div className="flex flex-col items-center gap-4 relative z-10 text-center">
      {/* 404 display */}
      <div className="flex items-center justify-center leading-none select-none">
        <span className="text-[120px] sm:text-[160px] md:text-[180px] text-foreground tracking-tighter">
          404
        </span>
      </div>

        <div className="relative mx-2 sm:mx-4">
          {/* Speech bubble */}
		      <img
		        src={robotImage}
		        alt="Cute blue robot indicating a 404 error"
		        className="w-auto"
					/>
          <div className="absolute -top-4 -right-4 md:-top-8 sm:-right-16 bg-card border border-border rounded-2xl rounded-bl-none shadow-md px-3 py-2 text-left min-w-[140px]">
            <p className="text-[11px] text-foreground font-medium leading-snug">
              Beep boop... I think I<br />broke something 🔌
            </p>
          </div>

          {/* Decorative elements around the robot */}
          <div className="absolute -left-4 top-1/4 w-3 h-3 rounded-full bg-primary" />
          <div className="absolute -right-3 top-3/4 w-2 h-2 rounded-full bg-primary" />

          <div className="absolute -left-3 bottom-1/4 w-4 h-4 border-2 border-primary rounded" />
          <div className="absolute -right-4 top-1/3 w-3.5 h-3.5 border-2 border-primary rounded" />

          <span className="absolute -left-2 top-1/2 text-primary font-bold text-lg leading-none select-none">X</span>
          <span className="absolute -right-2 top-1/2 text-primary font-bold text-lg leading-none select-none">X</span>
          <span className="absolute left-1/2 -bottom-2 text-primary font-bold text-lg leading-none select-none">X</span>
        </div>
      
      {/* Text block */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Oops! This Page Lost Connection.
        </h1>
        <p className="text-muted text-sm sm:text-base max-w-sm leading-relaxed">
          It looks like this page short-circuited before you arrived. Don't
          worry — our circuits are already rerouting you somewhere useful.
        </p>
      </div>

      {/* Loading bar */}
      <div className="flex flex-col items-center gap-1.5 mt-4">
        <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-primary-linear rounded-full animate-pulse" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-semibold">
          Reconnecting... Please stand by
        </p>
      </div>

      {/* Action buttons */}
      <div className="mt-6 relative z-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 bg-primary text-white font-semibold text-sm shadow-2xl px-5 py-2.5 rounded-full hover:bg-primary-dark hover:scale-[1.02] hover:shadow-primary/30 transition-all duration-300"
        >
          <Home size={15} /> Back to Home
        </Link>
        <Link
          to="/events"
          className="flex items-center gap-2 border border-border text-foreground font-medium text-sm px-5 py-2.5 rounded-full hover:scale-[1.02] hover:shadow-md transition-all duration-300"
        >
          <Calendar size={15} /> Explore Events
        </Link>
        <Link
          to="/contact"
          className="flex items-center gap-2 border border-border text-foreground font-medium text-sm px-5 py-2.5 rounded-full hover:scale-[1.02] hover:shadow-md transition-all duration-300"
        >
          <Phone size={15} /> Contact Us
        </Link>
      </div>
    </div>
  );
}

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-main flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden font-lakes">
      <ScatteredDecorators />
      <HeroBlock />
      <SuggestionCards />
      <FooterNote />
    </div>
  );
}
