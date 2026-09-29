// The portraits are referenced from /public rather than imported as assets.
// The home page now reads the published season from the API instead of this
// file, so the images have to be reachable as plain URLs for the database to
// hold them; keeping this file on the same paths means the About page still
// renders the same people from the same images.

export const COUNSELOR = {
  id: 0,
  name: "Dr. Mahmoud Abdelmohsen",
  role: "Counselor",
  image: "https://res.cloudinary.com/otvxv2ll/image/upload/v1790637897/dr-mahmoud.webp",
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
    image: "https://res.cloudinary.com/otvxv2ll/image/upload/v1790637897/alaa-mohamed.webp",
		socials: {
			linkedin: 'https://www.linkedin.com/in/alaa-mohamed-ab78992a0',
			facebook: 'https://www.facebook.com/share/1D1qrgd5wd/?mibextid=wwXIfr',
		},
  },
  {
    id: 1,
    name: "Ali Elsayed",
    role: "Vice Chair",
    image: "https://res.cloudinary.com/otvxv2ll/image/upload/v1790637897/ali-elsayed.webp",
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
    image: "https://res.cloudinary.com/otvxv2ll/image/upload/v1790637897/reem-hendawy.webp",
		socials: {
			linkedin: "https://www.linkedin.com/in/reem-hendawy-786711274",
			facebook: "https://www.facebook.com/share/1EnYDmR41H/?mibextid=wwXIfr",
		},
  },
  {
    id: 3,
    name: "Youssif Hany",
    role: "Secretary",
    image: "https://res.cloudinary.com/otvxv2ll/image/upload/v1790637897/youssif-hany.webp",
		socials: {
			linkedin: "https://www.linkedin.com/in/youssef-hany-y038",
			facebook: "https://www.facebook.com/Youusif.038?mibextid=ZbWKwL"
		},
  },
];
