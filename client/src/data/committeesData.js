import prIcon from '../assets/icons/committees/pr.png';
import hrIcon from '../assets/icons/committees/hr-desk.png';
import logisticsIcon from '../assets/icons/committees/logistics.png';
import marketingIcon from '../assets/icons/committees/marketing.png';
import paletteIcon from '../assets/icons/committees/palette.png';
import developerIcon from '../assets/icons/committees/developer.png';
import bookshelfIcon from '../assets/icons/committees/bookshelf.png';
import webIcon from '../assets/icons/committees/world-wide-web.png';

export const committees = [
  {
    id: "public-relations",
    icon: prIcon,
    label: "Public Relations",
    title: "Public Relations & FundRaising",
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
    points: [
      "Managing member onboarding and engagement.",
      "Organizing internal team-building activities.",
      "Handling member records and performance tracking.",
    ],
    recruitmentOpen: true,
  },
  {
    id: "logistics",
    icon: logisticsIcon,
    label: "Logistics",
    title: "Logistics",
    points: [
      "Coordinating venues, equipment, and event setup.",
      "Managing transportation and supply chains for events.",
      "Ensuring smooth on-ground execution of activities.",
    ],
    recruitmentOpen: false,
  },
  {
    id: "marketing",
    icon: marketingIcon,
    label: "Marketing",
    title: "Marketing",
    points: [
      "Running social media campaigns and content calendars.",
      "Designing promotional strategies for events.",
      "Tracking engagement metrics across platforms.",
    ],
    recruitmentOpen: true,
  },
  {
    id: "branding-media",
    icon: paletteIcon,
    label: "Branding & Media",
    title: "Branding & Media",
    points: [
      "Creating visual identity and design assets.",
      "Producing photography and video content.",
      "Maintaining brand consistency across channels.",
    ],
    recruitmentOpen: false,
  },
  {
    id: "technical",
    icon: developerIcon,
    label: "Technical",
    title: "Technical",
    points: [
      "Organizing workshops, hackathons, and tech talks.",
      "Building and maintaining technical projects.",
      "Mentoring members on hands-on skills.",
    ],
    recruitmentOpen: true,
  },
  {
    id: "non-technical",
    icon: bookshelfIcon,
    label: "Non-Technical",
    title: "Non-Technical",
    points: [
      "Planning soft-skills and career-development sessions.",
      "Organizing networking and social events.",
      "Coordinating with industry guests and alumni.",
    ],
    recruitmentOpen: false,
  },
  {
    id: "website",
    icon: webIcon,
    label: "Website",
    title: "Website",
    points: [
      "Developing and maintaining the branch's website.",
      "Implementing new features and fixing bugs.",
      "Keeping content up to date across pages.",
    ],
    recruitmentOpen: true,
  },
];
