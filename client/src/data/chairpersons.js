import drMohmoud from "../assets/images/chairpersons/dr-mahmoud.JPG";
import aliElsayed from "../assets/images/chairpersons/ali-elsayed.jpg";
import reemHendawy from "../assets/images/chairpersons/reem-hendawy.JPG";
import alaaMohamed from "../assets/images/chairpersons/alaa-mohamed.jpg";
// import youssifHany from "../assets/images/chairpersons/youssif-hany.jpg";

export const COUNSELOR = {
  id: 0,
  name: "Dr. Mahmoud Abdelmohsen",
  role: "Counselor",
  image: drMohmoud,
	socials: {
		linkedin: 'https://www.linkedin.com/in/mahmoud-abdelmohsen-09874b123',
		facebook: "https://www.facebook.com/mahmoudabdelmohsenatteya"
	},
};

export const MEMBERS = [
  {
    id: 0,
    name: "Ali Elsayed",
    role: "Vice Chair",
    image: aliElsayed,
    socials: {
      linkedin: "https://www.linkedin.com/in/alli-elsayed",
      whatsapp: "https://wa.me/+201500331132",
      collabratec: "https://ieee-collabratec.ieee.org/app/p/AliElsayed1187445",
    },
  },
  {
    id: 1,
    name: "Reem Hendawy",
    role: "Treasurer",
    image: reemHendawy,
		socials: {
			linkedin: "https://www.linkedin.com/in/reem-hendawy-786711274",
			facebook: "https://www.facebook.com/share/1EnYDmR41H/?mibextid=wwXIfr",
		},
  },
  {
    id: 2,
    name: "Youssif Hany",
    role: "Secretary",
    image: "/images/ieee-day.png",
    socials: { linkedin: null, email: null, website: null },
  },
  {
    id: 3,
    name: "Alaa Mohamed",
    role: "Chairperson",
    image: alaaMohamed,
		socials: {
			linkedin: 'https://www.linkedin.com/in/alaa-mohamed-ab78992a0',
			facebook: 'https://www.facebook.com/share/1D1qrgd5wd/?mibextid=wwXIfr',
		},
  },
];
