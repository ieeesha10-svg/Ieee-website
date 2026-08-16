import React from "react";
import { Link } from "react-router-dom";
import { EMAIL_ADDRESS, SOCIAL_MEDIA } from "../../data/socialMedia";

const QUICK_LINKS = [
  { label: "About", to: "/about" },
  { label: "Events", to: "/events" },
  { label: "Our Crew", to: "/crew" },
  { label: "Dev Team", to: "/dev-team" },
  { label: "Committees", to: "/committees" },
  { label: "Contact", to: "/contact" },
];

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
          <h2 className="font-lakes font-bold text-[#1A1A1A] dark:text-[#F2F2F2] text-[16px] lg:text-[18px] transition-colors duration-300">
            Quick Links
          </h2>
          <ul className="grid grid-cols-2 items-center lg:items-start gap-x-6 gap-y-3">
            {QUICK_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="font-lakes text-[#4A5565] dark:text-[#9CA3AF] text-[14px] hover:text-[#0077CC] dark:hover:text-[#33B5FF] transition-colors duration-300"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Resources */}
        {/* <div className="flex flex-col items-center lg:items-start gap-4">
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
        </div>*/}

        {/* 4. Connect With Us */}
        <div className="flex flex-col items-center lg:items-start gap-4">
          <h2 className="font-lakes font-bold text-[#1A1A1A] dark:text-[#F2F2F2] text-[16px] lg:text-[18px] transition-colors duration-300">
            Connect With Us
          </h2>

          {/* Social Icons */}
          <div className="flex flex-row items-center gap-4">
            {SOCIAL_MEDIA.slice(0, 3).map(({ Icon, href, title }) => (
              <a
                key={title}
                href={href}
                className="hover:scale-110 transition-transform duration-300"
                aria-label={title}
              >
                <Icon
                  size={25}
                  className="text-primary-dark dark:text-primary-light lg:w-[40px] lg:h-[40px]"
                />
              </a>
            ))}
          </div>

          <a
            href={`mailto:${EMAIL_ADDRESS}`}
            className="font-lakes text-[#4A5565] dark:text-[#9CA3AF] text-[14px] hover:text-[#0077CC] dark:hover:text-[#33B5FF] transition-colors duration-300 mt-1"
          >
            {EMAIL_ADDRESS}
          </a>
        </div>
      </div>

      {/* Copyright Line */}
      <div className="max-w-7xl mx-auto mt-12 lg:mt-16 pt-6 lg:pt-8 border-t-[0.5px] border-[#4A5565]/50 dark:border-[#9CA3AF]/50 flex flex-col items-center justify-center gap-3 transition-colors duration-300">
        <p className="font-lakes text-[#4A5565] dark:text-[#9CA3AF] text-[10px] lg:text-[14px] text-center leading-[1.6] px-4">
          © 2026 IEEE Student Branch. All rights reserved. Advancing Technology
          for Humanity.
				</p>
        <p
          dir="rtl"
          className="font-lakes text-[#4A5565] dark:text-[#9CA3AF] text-sm lg:text-lg text-center leading-[1.6]"
        >
					لِلَّهِ رَبِّ الْعَالَمِينَ
				</p>
      </div>
    </footer>
  );
}
