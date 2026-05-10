import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#F2F2F2] dark:bg-[#0A0E1A] py-12 lg:py-16 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col items-center lg:items-start gap-12 lg:gap-0 lg:flex-row lg:justify-between">
        {/* 1. Brand Section */}
        <div className="flex flex-col items-center lg:items-start gap-4 lg:gap-6 max-w-[284px] text-center lg:text-left">
          <img
            src="/icons/logo.svg"
            alt="IEEE Student Branch"
            className="h-[50px] lg:h-[72px] object-contain dark:brightness-1000"
          />
          <p className="font-lakes text-[#4A5565] dark:text-[#9CA3AF] text-[12px] lg:text-[14px] leading-[1.6] transition-colors duration-300">
            Advancing technology for humanity. Join us in our mission to
            innovate, collaborate, and inspire.
          </p>
        </div>

        {/* 2. Quick Links */}
        <div className="flex flex-col items-center lg:items-start gap-4">
          <h4 className="font-lakes font-bold text-[#1A1A1A] dark:text-[#F2F2F2] text-[16px] lg:text-[18px] transition-colors duration-300">
            Quick Links
          </h4>
          <ul className="flex flex-col items-center lg:items-start gap-3">
            {["About", "Chapters", "Events", "Membership"].map((link) => (
              <li key={link}>
                <a
                  href={`#${link.toLowerCase().replace(" ", "-")}`}
                  className="font-lakes text-[#4A5565] dark:text-[#9CA3AF] text-[14px] hover:text-[#0077CC] dark:hover:text-[#33B5FF] transition-colors duration-300"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Resources */}
        <div className="flex flex-col items-center lg:items-start gap-4">
          <h4 className="font-lakes font-bold text-[#1A1A1A] dark:text-[#F2F2F2] text-[16px] lg:text-[18px] transition-colors duration-300">
            Resources
          </h4>
          <ul className="flex flex-col items-center lg:items-start gap-3">
            {["Blog", "Newsletter", "Gallery", "Contact"].map((link) => (
              <li key={link}>
                <a
                  href={`#${link.toLowerCase()}`}
                  className="font-lakes text-[#4A5565] dark:text-[#9CA3AF] text-[14px] hover:text-[#0077CC] dark:hover:text-[#33B5FF] transition-colors duration-300"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Connect With Us */}
        <div className="flex flex-col items-center lg:items-start gap-4">
          <h4 className="font-lakes font-bold text-[#1A1A1A] dark:text-[#F2F2F2] text-[16px] lg:text-[18px] transition-colors duration-300">
            Connect With Us
          </h4>

          {/* Social Icons */}
          <div className="flex flex-row items-center gap-4">
            <a
              href="#"
              className="hover:scale-110 transition-transform duration-300"
            >
              <img
                src="/icons/facebook.svg"
                alt="Facebook"
                className="w-[32px] h-[32px] lg:w-[40px] lg:h-[40px]"
              />
            </a>
            <a
              href="#"
              className="hover:scale-110 transition-transform duration-300"
            >
              <img
                src="/icons/instagram.svg"
                alt="Instagram"
                className="w-[32px] h-[32px] lg:w-[40px] lg:h-[40px]"
              />
            </a>
            <a
              href="#"
              className="hover:scale-110 transition-transform duration-300"
            >
              <img
                src="/icons/x.svg"
                alt="X"
                className="w-[32px] h-[32px] lg:w-[40px] lg:h-[40px]"
              />
            </a>
          </div>

          <a
            href="mailto:info@ieeesb.org"
            className="font-lakes text-[#4A5565] dark:text-[#9CA3AF] text-[14px] hover:text-[#0077CC] dark:hover:text-[#33B5FF] transition-colors duration-300 mt-1"
          >
            info@ieeesb.org
          </a>
        </div>
      </div>

      {/* Copyright Line */}
      <div className="max-w-7xl mx-auto mt-12 lg:mt-16 pt-6 lg:pt-8 border-t-[0.5px] border-[#4A5565]/50 dark:border-[#9CA3AF]/50 flex justify-center transition-colors duration-300">
        <p className="font-lakes text-[#4A5565] dark:text-[#9CA3AF] text-[10px] lg:text-[14px] text-center leading-[1.6] px-4">
          © 2026 IEEE Student Branch. All rights reserved. Advancing Technology
          for Humanity.
        </p>
      </div>
    </footer>
  );
}
