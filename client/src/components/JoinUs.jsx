import React from "react";

export default function JoinUs() {
  return (
    <section
      id="join-us"
      className="relative w-full h-[450px] lg:h-[712px] bg-[#0F1C2D] flex flex-col items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'url("/images/cta-bg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-[313px] lg:max-w-[1024px] px-4">
        {/* Top Icon */}
        <div className="flex justify-center items-center w-[68px] h-[68px] lg:w-[136px] lg:h-[136px] mb-4 lg:mb-8">
          <img
            src="/icons/join.png"
            alt="Join IEEE"
            className="w-[60px] h-[60px] lg:w-[120px] lg:h-[120px] object-contain"
          />
        </div>

        {/* Text Section */}
        <div className="flex flex-col items-center gap-4 lg:gap-8 mb-6 lg:mb-12">
          <h2 className="font-lakes text-[#F2F2F2] text-[36px] lg:text-[72px] leading-[36px] lg:leading-[72px] text-center">
            READY TO JOIN US?
          </h2>
          <p className="font-lakes text-[#99A1AF] text-[12px] lg:text-[24px] leading-[20px] lg:leading-[40px] text-center w-full">
            Become part of a community that's shaping the future of technology.
            <br className="hidden lg:block" />
            Connect, learn, and innovate with fellow engineers and tech
            enthusiasts.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-row items-center justify-center gap-3 lg:gap-6">
          {/* Primary Button */}
          <button className="flex justify-center items-center w-[135px] h-[38px] lg:w-[269px] lg:h-[76px] bg-gradient-to-r from-[#0096FF] to-[#33B5FF] rounded-[4px] lg:rounded-[8px] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] hover:shadow-[0_0_25px_rgba(0,150,255,0.7)] hover:-translate-y-1 transition-all duration-300">
            <span className="font-lakes font-normal text-[#F2F2F2] text-[10px] lg:text-[20px] leading-[14px] lg:leading-[28px]">
              Become a Member
            </span>
          </button>

          {/* Secondary Outline Button */}
          <button className="flex justify-center items-center w-[100px] h-[38px] lg:w-[200px] lg:h-[76px] border border-[#F2F2F2] lg:border-2 rounded-[4px] lg:rounded-[8px] hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300">
            <span className="font-lakes font-normal text-[#F2F2F2] text-[10px] lg:text-[20px] leading-[14px] lg:leading-[28px]">
              Contact Us
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
