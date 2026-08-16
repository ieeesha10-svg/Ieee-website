import React from "react";
import { FiGithub, FiLinkedin, FiGlobe } from "react-icons/fi";
import { SiBehance } from "react-icons/si";
import { stats, tracks } from "../data/devTeamData";
import FooterAlt from "../components/layout/FooterAlt";

export default function DevTeam() {
  return (
    <div className="min-h-screen bg-main transition-colors px-6 py-16 md:py-20">
      <div className="flex flex-col justify-center items-center gap-5 md:gap-8 font-black text-center relative">
        <div className="absolute -top-11 md:-top-20 left-6.5 md:left-10 right-0 text-[110px] md:text-[180px] font-black text-muted/10 select-none pointer-events-none tracking-widest leading-none text-center">
          DEV
        </div>

        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-primary/40" />
          <span className="text-xs font-semibold tracking-[0.2em] text-[#0096FF] uppercase">
            IEEE Student Branch
          </span>
          <span className="h-px w-8 bg-primary/40" />
        </div>

				<div>
	     		<h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
	          THE BRAINS
	        </h1>
	        <h2 className="mt-3 text-4xl md:text-6xl font-extrabold tracking-tight text-transparent"
	          style={{ backgroundImage: "linear-gradient(to top left, #0096FF 35%, #000)", WebkitBackgroundClip: "text", backgroundClip: "text" }}>
	          BEHIND THE CODE
					</h2>
				</div>

        <div className="relative max-w-sm">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(0,150,255,0.08), transparent)" }} />
          <p className="relative text-sm text-muted leading-relaxed">
            Meet the elite IEEE Website development team who brought this platform to life.
          </p>
        </div>

        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-primary border border-primary/30 rounded-full px-4 py-1.5">
          First Launch Team · Created In 2026 · Season 10
        </span>

        <div className="flex items-center justify-center gap-8 md:gap-16">
          {stats.map((stat) => (
            <div key={stat.id} className="flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-bold text-primary">
                {stat.value}
              </span>
              <span className="text-[11px] uppercase tracking-wide text-muted mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-16 space-y-14 font-barlow">
        {tracks.map((track) => (
          <div key={track.id}>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs text-primary">
                {track.number}
							</span>
							<span className="w-px h-3 bg-primary/20" />
              <span className="text-xs tracking-[0.15em] uppercase text-foreground">
                {track.title}
              </span>
              <span className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(0,150,255,0.2), transparent)" }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {track.members.map((member) => (
                <div
                  key={member.id}
                  className="bg-card dark:bg-[#1A1F2E] border p-5 border-primary/10 rounded-sm overflow-hidden flex flex-col md:flex-row"
                  style={{ boxShadow: "0 1px 10px 0 rgba(0, 150, 255, 0.15)" }}
                >
                  <div className="bg-[#E4EAF8] dark:bg-[#0A0E1A] border border-primary/20 w-full md:w-44 aspect-square md:aspect-auto md:h-44 relative flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: member.image ? "" : "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(0,150,255,0.08) 19px, rgba(0,150,255,0.08) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(0,150,255,0.08) 19px, rgba(0,150,255,0.08) 20px)" }} />
                    <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-primary/60 z-10" />
                    <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-primary/60 z-10" />
                    <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-primary/60 z-10" />
                    <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-primary/60 z-10" />

                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="hover:scale-110 hover:brightness-110 transition duration-300 w-full h-full object-cover border border-primary/60"
                      />
                    ) : (
                      <div className="w-20 h-20 md:w-15 md:h-15 rounded-full border border-primary/30 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary/50" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 px-0 md:px-5 flex flex-col justify-between">
                    <div className="flex flex-col gap-1 mt-3 md:mt-0">
                      <span className="text-xs text-primary mb-1">
                        {member.number}
                      </span>
                      <h3 className="text-lg font-bold">
                        {member.name}
                      </h3>
                      <p className="md:text-xs font-semibold text-primary-dark dark:text-primary-light uppercase tracking-wide mt-1">
                        {member.role}
                      </p>
                      <p className="text-xs text-muted mt-1">{member.dept}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-4 text-muted/50 border-t border-primary/15 pt-2">
                      {member.links?.github && member.links.github && (
                        <a href={member.links.github} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                          <FiGithub className="w-4 h-4" />
                        </a>
                      )}
                      {member.links?.linkedin && member.links.linkedin && (
                        <a href={member.links.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                          <FiLinkedin className="w-4 h-4" />
                        </a>
                      )}
                      {member.links?.portfolio && member.links.portfolio && (
                        <a href={member.links.portfolio} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                          {member.links.portfolio.includes("behance") ? <SiBehance className="w-4 h-4" /> : <FiGlobe className="w-4 h-4" />}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <FooterAlt />
    </div>
  );
}
