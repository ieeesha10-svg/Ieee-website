import React from "react";

const links = [
  {
    name: "IEEE.org ↗",
    desc: "Explore IEEE's global initiatives and impact.",
    url: "https://www.ieee.org",
  },
  {
    name: "Membership & Benefits ↗",
    desc: "Join a community that fosters innovation and leadership.",
    url: "https://www.ieee.org/membership",
  },
  {
    name: "IEEE Xplore Digital Library ↗",
    desc: "Access cutting-edge research and publications.",
    url: "https://ieeexplore.ieee.org",
  },
  {
    name: "IEEE Standards ↗",
    desc: "Learn how IEEE sets global technological standards.",
    url: "https://standards.ieee.org",
  },
  {
    name: "IEEE Spectrum ↗",
    desc: "Stay updated with the latest tech trends, innovations, and expert analysis.",
    url: "https://spectrum.ieee.org",
  },
  {
    name: "IEEE Learning Network ↗",
    desc: "Access online courses, certifications & skill-building webinars.",
    url: "https://iln.ieee.org",
  },
];

const benefits = [
  {
    title: "IEEE Xplore Digital Library",
    desc: "Get free access to over 5 million technical papers, journals, and standards. Explore cutting-edge research and stay informed with the world's most comprehensive collection of electrical engineering and computer science literature.",
    img: "/images/benefits/xplore.png",
  },
  {
    title: "IEEE DataPort",
    desc: "Gain unlimited access to thousands of datasets and exclusive data management features. Perfect for researchers and engineers working with big data, machine learning, and advanced analytics projects.",
    img: "/images/benefits/dataport.png",
  },
  {
    title: "IEEE Spectrum Magazine",
    desc: "Stay updated with the latest technology trends, innovations, and expert analysis. IEEE Spectrum keeps over 500,000 members informed about major developments in technology, engineering, and science.",
    img: "/images/benefits/spectrum.png",
  },
  {
    title: "IEEE JobSite",
    desc: "Discover internships, graduate roles, and full-time job opportunities worldwide. Connect with top employers in technology and engineering sectors looking for talented professionals like you.",
    img: "/images/benefits/jobsite.png",
  },
  {
    title: "IEEE Volunteering",
    desc: "Make a global impact by connecting with volunteering opportunities across geographical boundaries. Join a community dedicated to advancing technology for humanity while building meaningful professional relationships.",
    img: "/images/benefits/volunteering.png",
  },
  {
    title: "IEEE Learning Network",
    desc: "Access online courses, professional certifications, and skill-building webinars designed to advance your career. Enhance your expertise with industry-recognized training programs and continuous learning opportunities.",
    img: "/images/benefits/learning.png",
  },
  {
    title: "IEEE Collabratec",
    desc: "Network with over 700,000 professionals, mentors, and collaborators worldwide. Build connections, share knowledge, and collaborate on projects within the largest global community of technology professionals.",
    img: "/images/benefits/collabratec.png",
  },
];

export default function MembershipBenefits() {
  return (
    <section className="relative w-full py-24 px-4 bg-gradient-to-b from-[#0077CC] via-[#0096FF] to-[#0077CC] dark:from-[#0F1420] dark:to-[#0F1420] transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-6">
          <h2 className="font-gotham font-bold text-3xl md:text-4xl lg:text-5xl text-white drop-shadow-md">
            <span className="text-primary-light">I</span>nstitute of{" "}
            <span className="text-primary-light">E</span>lectrical and{" "}
            <span className="text-primary-light">E</span>lectronics{" "}
            <span className="text-primary-light">E</span>ngineering
          </h2>
          <p className="max-w-3xl mx-auto font-lakes text-lg lg:text-xl text-[#F2F2F2] dark:text-[#9CA3AF]">
            The world's largest technical professional organization, uniting
            over 400,000 members globally to advance technology for humanity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="group p-6 bg-white dark:bg-[#1A1F2E] rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-transparent dark:border-gray-800"
            >
              <h3 className="font-lakes text-lg text-[#0077CC] dark:text-[#33B5FF] mb-2 font-semibold group-hover:underline">
                {link.name}
              </h3>
              <p className="font-lakes text-sm text-[#4A5565] dark:text-[#9CA3AF]">
                {link.desc}
              </p>
            </a>
          ))}
        </div>

        {/* الجزء الثاني: المزايا والتفاصيل */}
        <div className="text-center mb-16 space-y-6">
          <h2 className="font-gotham font-bold text-4xl lg:text-5xl text-white">
            <span className="text-primary-light">M</span>embership{" "}
            <span className="text-primary-light">B</span>enefits
          </h2>
          <p className="max-w-2xl mx-auto font-lakes text-lg lg:text-xl text-[#F2F2F2] dark:text-[#9CA3AF]">
            Unlock exclusive resources, connect with global professionals, and
            advance your career with IEEE membership.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 max-w-[1240px] mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="w-full sm:w-[290px] bg-white dark:bg-[#1A1F2E] rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl border border-transparent dark:border-gray-800 group"
            >
              <div className="h-36 flex items-center justify-center p-6 bg-white transition-transform duration-500 group-hover:scale-105">
                <img
                  src={benefit.img}
                  alt={benefit.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              {/* النصوص */}
              <div className="p-6 space-y-3 flex-1">
                <h3 className="font-lakes text-base font-bold text-[#1A1A1A] dark:text-white group-hover:text-[#0077CC] dark:group-hover:text-[#33B5FF] transition-colors">
                  {benefit.title}
                </h3>
                <p className="font-lakes text-xs leading-relaxed text-[#4A5565] dark:text-[#9CA3AF]">
                  {benefit.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
