import React from "react";

const achievementsData = [
  {
    id: 1,
    icon: "/icons/trophy.png",
    title: "Best Student Chapter 2025",
    description: "Outstanding technical activities and engagement",
  },
  {
    id: 2,
    icon: "/icons/star.png",
    title: "Innovation Excellence",
    description: "Groundbreaking projects and research",
  },
  {
    id: 3,
    icon: "/icons/solidarity.png",
    title: "Community Impact Award",
    description: "Making real difference in communities",
  },
];

export default function Achievements() {
  return (
    <section
      id="achievements"
      className="relative w-full py-16 lg:py-24 px-4 lg:px-6 transition-colors duration-300 overflow-hidden dark:bg-[#0F1420]"
    >
      <div
        className="absolute inset-0 z-0 dark:hidden"
        style={{
          background:
            "linear-gradient(135deg, #0077CC 0%, #007BD3 7.14%, #0080DA 14.29%, #0084E2 21.43%, #0089E9 28.57%, #008DF0 35.71%, #0091F8 42.86%, #0096FF 50%, #0B9BFF 57.14%, #149FFF 64.29%, #1CA3FF 71.43%, #22A8FF 78.57%, #28ACFF 85.71%, #2EB1FF 92.86%, #33B5FF 100%)",
        }}
      />

      <div
        className="absolute bottom-0 left-0 w-full h-43.25 z-0 opacity-100"
        style={{
          backgroundImage: 'url("/images/Pattern.png")',
          backgroundSize: "auto 100%",
          backgroundPosition: "bottom",
          backgroundRepeat: "repeat-x",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl lg:text-[72px] font-black uppercase text-center leading-tight">
          <span className="text-white dark:text-foreground transition-colors duration-300">
            ACHIEVEMENTS &{" "}
          </span>
          <span className="text-primary-light transition-colors duration-300">
            RECOGNITION
          </span>
        </h2>

        <div className="mt-3 lg:mt-4 rounded-full w-25 lg:w-32 h-1 lg:h-1.5 bg-white transition-colors duration-300" />

        <div className="mt-16 lg:mt-24 w-full flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-8">
          {achievementsData.map((item) => (
            <div
              key={item.id}
              className="w-full flex-1 lg:max-w-101.25 min-h-80.5 border border-white/20 bg-primary-light dark:bg-primary-dark rounded-3xl p-8 lg:p-10 flex flex-col items-center justify-start text-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-lg transform transition-transform hover:scale-105"
            >
              <div className="mb-6 flex items-center justify-center h-20">
                <img
                  src={item.icon}
                  alt={item.title}
                  className="max-h-full object-contain"
                />
              </div>

              <h3 className="text-white text-[24px] lg:text-[30px] font-lakes leading-7.5 lg:leading-9 font-light text-center mb-4">
                {item.title}
              </h3>

              <p className="text-white/90 text-[15px] lg:text-[16px] leading-6.5 font-lakes font-light">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
