import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Badge from "../../components/Badge";
import { committees } from "../../data/committeesData";

function Chip({ title, subtitle, label, className }) {
  return (
    <div
      className={`bg-card/90 backdrop-blur rounded-xl px-5 py-2 flex items-center gap-2 shadow-lg ${className}`}
    >
      <span className="w-1 h-2 bg-primary shrink-0" />
      {label ? (
        <span className="text-xs text-foreground">{label}</span>
      ) : (
        <div className="text-xs">
          <span className="block font-bold text-foreground">{title}</span>
          <span className="block text-foreground/80">{subtitle}</span>
        </div>
      )}
    </div>
  );
}

export default function HeroSection() {
  const { user } = useAuth();
  return (
    <section className="py-16 md:py-24 about-page-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left Column */}
          <div className="flex flex-col items-center justify-center lg:items-start lg:justify-start text-center lg:text-left gap-6">
            <Badge text={"IEEE Student Branch · Shorouk"} />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-gotham font-bold text-foreground leading-tight">
              Engineering the Future, Together
            </h1>
            <p className="text-muted text-sm sm:text-base">
              We&apos;re a community of curious engineers, designers, and
              builders at the heart of campus — driving innovation through
              workshops, real-world projects, and a shared passion for
              technology.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 w-[80%] sm:w-auto">
              {!user && (
                <Link
                  to="/registration"
                  className="bg-primary-linear text-white font-semibold rounded-full px-6 py-3 flex items-center justify-center gap-2 w-full sm:w-auto transition-all duration-300 hover:opacity-85 hover:scale-[1.02]"
                >
                  Become a Member <ArrowRight size={18} />
                </Link>
              )}
              <Link
                to="/events"
                className="border border-border text-foreground rounded-full px-6 py-3 font-semibold text-center w-full sm:w-auto transition-all duration-300 hover:bg-card hover:border-primary/50"
              >
                Explore Events
              </Link>
            </div>
            <div className="flex gap-8 mt-2">
              <div>
                <span className="text-2xl md:text-3xl font-bold text-primary">
                  150+
                </span>
                <span className="block text-xs text-muted">Volunteers</span>
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-bold text-primary">
                  50+
                </span>
                <span className="block text-xs text-muted">Events Hosted</span>
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-bold text-primary">
                  {committees.length}
                </span>
                <span className="block text-xs text-muted">Committees</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="relative rounded-2xl">
            <img
              src="https://res.cloudinary.com/xcdyzvmc/image/upload/v1785588071/about-image.jpg_r4gq2q.jpg"
              alt="Person wearing VR headset working on robotics"
              className="mx-auto w-full object-cover rounded-2xl"
            />

            <Chip
              title="150+"
              subtitle="Volunteers"
              className="absolute top-4 -left-2 lg:-left-4"
            />
            <Chip
              label="AI Workshop"
              className="absolute bottom-4 -left-2 lg:-left-4"
            />
            <Chip
              label="Arduino Labs"
              className="absolute bottom-4 -right-2 lg:-right-4"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
