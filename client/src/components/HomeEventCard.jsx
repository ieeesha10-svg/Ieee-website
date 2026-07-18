import React from "react";

export default function EventCard({ badge, title, image, description }) {
  return (
    <div className="w-full lg:max-w-[620px] flex flex-col">
      <div className="hover:scale-104 transition-transform relative h-[250px] md:h-[300px] lg:h-[384px] rounded-[16px] lg:rounded-[24px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        {image ? (
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-card-alt flex items-center justify-center">
            <span className="text-6xl lg:text-8xl font-black text-primary/20 select-none">
              {title?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-8 flex flex-col gap-2 lg:gap-3">
          <span className="self-start rounded-full py-1.5 px-3 lg:py-2 text-[12px] lg:text-[14px] backdrop-blur-sm bg-white/15 text-white">
            {badge}
          </span>

          <h3 className="uppercase font-black leading-tight text-white text-[24px] lg:text-[32px]">
            {title}
          </h3>

          <div className="rounded-full w-[60px] lg:w-[80px] h-[3px] lg:h-[4px] bg-white/80" />
        </div>
      </div>

      <p className="mt-4 lg:mt-6 font-lakes text-[14px] leading-[24px] lg:text-[20px] lg:leading-[40px] text-muted transition-colors duration-300">
        {description}
      </p>
    </div>
  );
}
