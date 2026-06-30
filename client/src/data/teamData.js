
import mohamedImg from "../assets/images/dev-team/mohamed-alaa.jpeg";
// import farahImg from "../assets/images/dev-team/farah.jpeg";
// import ahmedImg from "../assets/images/dev-team/ahmed-el-mallah.jpeg";
import abdallahImg from "../assets/images/dev-team/abdallah-aziz.jpeg";
// import hossamImg from "../assets/images/dev-team/hossam.jpeg";
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
    title: "UI/UX Design Track",
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
        name: "Farah",
        role: "UI/UX Design",
        dept: "IEEE SHA",
        image: null,
        links: {
          linkedin: "#",
          portfolio: "#",
        },
      },
    ],
  },
  {
    id: "track-02",
    number: "02",
    title: "Frontend Development Track",
    members: [
      {
        id: 3,
        number: "03",
        name: "Ahmed El-Mallah",
        role: "Frontend Engineer",
        dept: "IEEE SHA",
        image: null,
        links: {
          linkedin: "#",
          github: "https://github.com/AhmedWaheedElmallah29",
          portfolio: "#",
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
    id: "track-03",
    number: "03",
    title: "Backend Development Track",
    members: [
      {
        id: 5,
        number: "05",
        name: "Hossam",
        role: "Backend Engineer",
        dept: "IEEE SHA",
        image: null,
        links: {
          linkedin: "#",
          github: "https://github.com/0xcapt4in",
          portfolio: "#",
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
          linkedin: "#",
          github: "https://github.com/madiha179",
          portfolio: "#",
        },
      },
    ],
  },
];
