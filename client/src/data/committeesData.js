import prIcon from '../assets/icons/committees/pr.webp';
import hrIcon from '../assets/icons/committees/hr-desk.webp';
import logisticsIcon from '../assets/icons/committees/logistics.webp';
import marketingIcon from '../assets/icons/committees/marketing.webp';
import paletteIcon from '../assets/icons/committees/palette.webp';
import developerIcon from '../assets/icons/committees/developer.webp';
import bookshelfIcon from '../assets/icons/committees/bookshelf.webp';
import webIcon from '../assets/icons/committees/world-wide-web.webp';
import pesIcon from '../assets/icons/committees/pes.webp';

export const committees = [
  {
    id: "public-relations",
    icon: prIcon,
    label: "Public Relations",
    title: "Public Relations & FundRaising",
    subtitle: "Communications & partnerships",
    points: [
      "Responsible for external communications, speakers, and VIPs.",
      "Securing sponsorships and financial resources.",
      "Building relationships with local and tech communities.",
    ],
    recruitmentOpen: false,
  },
  {
    id: "human-resources",
    icon: hrIcon,
    label: "Human Resources",
    title: "Human Resources",
    subtitle: "People & culture",
    points: [
      "Managing member onboarding and team integration processes.",
      "Organizing internal training, workshops, and skill development.",
      "Maintaining a healthy, inclusive, and collaborative branch culture.",
    ],
    recruitmentOpen: false,
  },
  {
    id: "logistics",
    icon: logisticsIcon,
    label: "Logistics",
    title: "Logistics",
    subtitle: "Operations & coordination",
    points: [
      "Coordinating venues, schedules, and event resources.",
      "Managing equipment inventory and material procurement.",
      "Ensuring smooth operational flow for all branch activities.",
    ],
    recruitmentOpen: false,
  },
  {
    id: "marketing",
    icon: marketingIcon,
    label: "Marketing",
    title: "Marketing",
    subtitle: "Brand & outreach",
    points: [
      "Planning and executing promotional campaigns for branch events.",
      "Analyzing outreach metrics to optimize engagement strategies.",
      "Collaborating with Branding & Media to align messaging.",
    ],
    recruitmentOpen: false,
  },
  {
    id: "branding-media",
    icon: paletteIcon,
    label: "Branding & Media",
    title: "Branding & Media",
    subtitle: "Design & prototyping",
    points: [
      "Defining and maintaining the branch's visual identity standards.",
      "Producing photography, videography, and graphic assets.",
      "Managing media coverage and archiving branch milestones.",
    ],
    recruitmentOpen: false,
  },
  {
    id: "pes",
    icon: pesIcon,
    label: "PES",
    title: "Power & Energy Society",
    subtitle: "IEEE Power & Energy Society",
    points: [
      "Specialized in electrical power engineering (IEEE Power & Energy Society).",
      "Launched in 2019-2020 as one of the branch's earliest chapters.",
      "Organizing industry visits and hands-on sessions on solar energy and high-voltage power systems.",
    ],
    recruitmentOpen: false,
  },
  {
    id: "technical",
    icon: developerIcon,
    label: "Technical",
    title: "Technical",
    subtitle: "Software & engineering",
    points: [
      "Organizing technical workshops, hackathons, and coding challenges.",
      "Mentoring volunteers on software, hardware, and engineering skills.",
      "Facilitating industry-relevant projects and IEEE technical programs.",
    ],
    recruitmentOpen: false,
  },
  {
    id: "non-technical",
    icon: bookshelfIcon,
    label: "Non-Technical",
    title: "Non-Technical",
    subtitle: "Soft skills & growth",
    points: [
      "Hosting soft-skill sessions, leadership talks, and personal growth events.",
      "Curating cultural, social, and recreational activities for volunteers.",
      "Bridging the gap between engineering and interpersonal development.",
    ],
    recruitmentOpen: false,
  },
  {
    id: "website",
    icon: webIcon,
    label: "Website",
    title: "Website",
    subtitle: "Frontend & backend",
    points: [
      "Designing and developing the official IEEE Student Branch website.",
      "Maintaining platform uptime, performance, and content accuracy.",
      "Implementing new features and integrations to enhance the digital presence.",
    ],
    recruitmentOpen: false,
  },
];
