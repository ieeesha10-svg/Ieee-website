import React from "react";
import { SPONSORS } from "../../data/sponsors";

export default function Sponsors() {
  return (
    <div className="mt-12 lg:mt-24 w-full max-w-[394px] lg:max-w-none flex flex-col items-center bg-transparent lg:bg-black/5 dark:lg:bg-white/10 lg:border-[0.5px] border-transparent lg:border-black/10 dark:lg:border-white/20 rounded-[12px] lg:rounded-3xl py-8 lg:py-12 px-4 lg:px-8 transition-colors duration-300">
      <h3 className="text-[#1A1A1A] dark:text-[#F2F2F2] text-[18px] lg:text-[36px] font-lakes mb-8 lg:mb-12 text-center transition-colors duration-300">
        OUR PRESTIGIOUS SPONSORS
      </h3>
      <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="inline-flex animate-marquee hover:[animation-play-state:paused]">
          <div className="flex flex-shrink-0">
            {SPONSORS.map((s, i) => (
              <div key={i} className="mr-6 lg:mr-8 flex items-center justify-center bg-white dark:bg-[#1a1f2e] rounded-xl p-4 h-24 lg:h-28 w-[140px] lg:w-[180px]">
                <img src={s.src} alt={s.alt} title={s.alt} className="rounded-full max-h-full max-w-full object-contain" />
              </div>
            ))}
          </div>
          <div className="flex flex-shrink-0">
            {SPONSORS.map((s, i) => (
              <div key={`dup-${i}`} className="mr-6 lg:mr-8 flex items-center justify-center bg-white dark:bg-[#1a1f2e] rounded-xl p-4 h-24 lg:h-28 w-[140px] lg:w-[180px]">
                <img src={s.src} alt={s.alt} className="rounded-full max-h-full max-w-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
