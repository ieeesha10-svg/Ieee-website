// The portraits are referenced from /public rather than imported as assets.
// The home page now reads the published season from the API instead of this
// file, so the images have to be reachable as plain URLs for the database to
// hold them; keeping this file on the same paths means the About page still
// renders the same people from the same images.
const portrait = (name) => `/images/chairpersons/season x/${name}.webp`;

export const COUNSELOR = {
  id: 0,
  name: "Dr. Mahmoud Abdelmohsen",
  role: "Counselor",
  image: portrait("dr-mahmoud"),
	socials: {
		linkedin: 'https://www.linkedin.com/in/mahmoud-abdelmohsen-09874b123',
		facebook: "https://www.facebook.com/mahmoudabdelmohsenatteya"
	},
};

export const MEMBERS = [
  {
    id: 0,
    name: "Alaa Mohamed",
    role: "Chairperson",
    image: portrait("alaa-mohamed"),
		socials: {
			linkedin: 'https://www.linkedin.com/in/alaa-mohamed-ab78992a0',
			facebook: 'https://www.facebook.com/share/1D1qrgd5wd/?mibextid=wwXIfr',
		},
  },
  {
    id: 1,
    name: "Ali Elsayed",
    role: "Vice Chair",
    image: portrait("ali-elsayed"),
    socials: {
      linkedin: "https://www.linkedin.com/in/alli-elsayed",
      facebook: "https://www.facebook.com/profile.php?id=100005694163126",
      collabratec: "https://ieee-collabratec.ieee.org/app/p/AliElsayed1187445",
    },
  },
  {
    id: 2,
    name: "Reem Hendawy",
    role: "Treasurer",
    image: portrait("reem-hendawy"),
		socials: {
			linkedin: "https://www.linkedin.com/in/reem-hendawy-786711274",
			facebook: "https://www.facebook.com/share/1EnYDmR41H/?mibextid=wwXIfr",
		},
  },
  {
    id: 3,
    name: "Youssif Hany",
    role: "Secretary",
    image: portrait("youssif-hany"),
		socials: {
			linkedin: "https://www.linkedin.com/in/youssef-hany-y038",
			facebook: "https://www.facebook.com/Youusif.038?mibextid=ZbWKwL"
		},
  },
];
