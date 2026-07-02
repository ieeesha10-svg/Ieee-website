
// import aliImg from "../assets/images/dev-team/mohamed-alaa.jpeg";
import mohamedImg from "../assets/images/dev-team/mohamed-alaa.jpeg";
import farahImg from "../assets/images/dev-team/farah-orabi.jpeg";
import ahmedImg from "../assets/images/dev-team/ahmed-elmalah.jpeg";
import abdallahImg from "../assets/images/dev-team/abdallah-aziz.jpeg";
import hossamImg from "../assets/images/dev-team/hossam-ghallab.jpeg";
// import madihaImg from "../assets/images/dev-team/madiha.jpeg";

export const stats = [
  { id: 1, value: "6", label: "Engineers" },
  { id: 2, value: "3", label: "Tracks" },
  { id: 3, value: "1", label: "Vision" },
];

export const tracks = [
  {
    id: "track-01",
    number: "01",
    title: "Head Of Website Team / Vice Head Of Technical Team",
    members: [
      {
        id: 0,
        number: "01",
        name: "Ali Ahmed",
        role: "Full Stack Developer",
        dept: "IEEE SHA",
        image: null,
        links: {
          // linkedin: "https://www.linkedin.com/in/mohamed-alaa-a498602b7",
          // portfolio: "https://www.behance.net/mohamedalaa8950",
        },
      },
    ],
  },
  {
    id: "track-02",
    number: "02",
    title: "UI/UX Designres Team",
    members: [
      {
        id: 1,
        number: "01",
        name: "Mohamed Alaa",
        role: "UI/UX Design",
        dept: "IEEE SHA",
        image: mohamedImg,
        links: {
          linkedin: "https://www.linkedin.com/in/mohamed-alaa-a498602b7",
          portfolio: "https://www.behance.net/mohamedalaa8950",
        },
      },
      {
        id: 2,
        number: "02",
        name: "Farah Orabi",
        role: "UI/UX Design",
        dept: "IEEE SHA",
        image: farahImg,
        links: {
          linkedin: "https://www.linkedin.com/in/farah-orabi-6b972a40a?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
        },
      },
    ],
  },
  {
    id: "track-03",
    number: "03",
    title: "Frontend Developers Team",
    members: [
      {
        id: 3,
        number: "03",
        name: "Ahmed El-Mallah",
        role: "Frontend Engineer",
        dept: "IEEE SHA",
        image: ahmedImg,
        links: {
          linkedin: "https://www.linkedin.com/in/ahmed-waheed-elmallah-19966a300/",
          github: "https://github.com/AhmedWaheedElmallah29",
          portfolio: "https://elmallah-portfolio.vercel.app",
        },
      },
      {
        id: 4,
        number: "04",
        name: "Abdallah Aziz",
        role: "Frontend Engineer",
        dept: "IEEE SHA",
        image: abdallahImg,
        links: {
          linkedin: "https://www.linkedin.com/in/abdallah-m-aziz",
          github: "https://github.com/abdullahMohamed13",
          portfolio: "https://abdallah-aziz.vercel.app",
        },
      },
    ],
  },
  {
    id: "track-04",
    number: "04",
    title: "Backend Developers Team",
    members: [
      {
        id: 5,
        number: "05",
        name: "Hossam Ghallab",
        role: "Backend Engineer",
        dept: "IEEE SHA",
        image: hossamImg,
        links: {
          linkedin: "https://www.linkedin.com/in/hossam-ghallab/",
          github: "https://github.com/0xcapt4in",
        },
      },
      {
        id: 6,
        number: "06",
        name: "Madiha",
        role: "Backend Engineer",
        dept: "IEEE SHA",
        image: null,
        links: {
          linkedin: "https://www.linkedin.com/in/madiha-elyazal-/",
          github: "https://github.com/madiha179",
          // portfolio: "",
        },
      },
    ],
  },
];
