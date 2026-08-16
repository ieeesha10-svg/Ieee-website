import React from "react";
import SectionHeader from "../../components/ui/SectionHeader";
import SectionBackground from '../../assets/backgrounds/tech-circuit-pattern.webp';
import FlashIcon from '../../assets/icons/committees/pes.webp';
import Button from "../../components/ui/Button";

export default function Chapters() {
  return (
    <section id="chapters" className="relative overflow-hidden py-20 bg-contain" style={{ backgroundImage: `url(${SectionBackground})`}}>
      <div className='absolute inset-0 bg-primary/97 dark:bg-main/98' />

      <div className="relative z-10">
        <div className="text-center">
          <SectionHeader title="Our" highlight="chapters" highlightColor="primary-light" variant="dark" />
          <p className="text-white text-base lg:text-2xl mt-4">Explore our diverse technical chapters, each focus on advancing specialized fields of technology.</p>
        </div>

        <div className="max-w-md mx-auto mt-20">
          <div className="group flex flex-col overflow-hidden border border-border rounded-3xl h-full transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
            <div className="pl-6 py-6 relative overflow-hidden transition-all duration-500 group-hover:brightness-110" style={{ background: 'linear-gradient(to right, #00C950, #00BC7D)' }}>
              <span className="absolute bottom-5 right-3 z-10 bg-yellow-400 text-gray-900 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
              <div className="absolute rounded-full w-32 h-32 bg-white/20 -right-14 -top-14" />
              <div className="bg-white/20 rounded-2xl p-3 w-fit transition-transform duration-500 group-hover:scale-110">
                <img src={FlashIcon} className="w-15 h-15 md:w-20 md:h-20" alt="Chapter's Icon" />
              </div>
              <h3 className="text-white font-semibold text-xl md:text-3xl mt-6 mb-10">PES</h3>
              <span className="text-white text-sm font-light">IEEE PES</span>
            </div>

            <div className="flex-1 bg-main dark:bg-[#1A1F2E] p-6 flex flex-col gap-6 transition-colors duration-500 group-hover:bg-[#f0f8ff] dark:group-hover:bg-[#222936]">
              <p className="text-muted group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-500">
                PES is the chapter inside the student branch which is specialized in electrical power engineering society. Launched in 2019-2020
              </p>

              <div className="flex justify-between items-center mt-auto">
                <div className="flex flex-col gap-1">
                  <span className="text-2xl text-primary">50+</span>
                  <span className="text-sm text-muted">Events</span>
                </div>
								<a href="https://www.facebook.com/IEEE.PES.SHA.SC" target="_blank">
									<Button variant="link" aria-label="Learn More">Learn More</Button>
								</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
