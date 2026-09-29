/**
 * One-time migration into the season model.
 *
 * Two things have to happen before the season-aware pages can go live:
 *
 *   1. `seasons` needs a row. Without one there is no season to publish, the
 *      home page has nothing to read, and /crew has nothing to list.
 *   2. Existing `crews` documents predate `season` and `section`, and `season`
 *      is now `required`. Left alone they would fail validation on the next
 *      save and be invisible to every page, so they are filed under the
 *      starting season.
 *
 * The committee that the home page used to show is hardcoded in
 * `client/src/data/chairpersons.js`. That list is copied in here so publishing
 * the starting season reproduces exactly what the home page rendered before,
 * rather than emptying it on deploy. `client/docs/PAGES.md` still documents
 * chairpersons.js as the About page's source; this is the home page's.
 *
 * Safe to re-run: it is idempotent. Seeding skips a person whose name is already
 * in the season, and the legacy sweep only touches documents with no season.
 *
 * Usage:  node scripts/backfillSeasons.js          (from server/)
 *         node scripts/backfillSeasons.js --dry    (report without writing)
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env"), quiet: true });

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Season = require("../models/seasonModel");
const Crew = require("../models/crewModel");

const DRY = process.argv.includes("--dry");

const DEFAULT_SEASON_NAME =
  process.env.DEFAULT_SEASON_NAME?.trim() || "Current Season";

// The committee the home page showed before seasons existed, in display order.
// Positions are matched by /counsel/i on the home page, so the counselor's
// "Counselor" position is what earns them the full-width card.
const FOUNDING_EXCOM = [
  {
    name: "Dr. Mahmoud Abdelmohsen",
    position: "Counselor",
    image: "https://res.cloudinary.com/otvxv2ll/image/upload/v1790637897/dr-mahmoud.webp",
    socials: {
      linkedin: "https://www.linkedin.com/in/mahmoud-abdelmohsen-09874b123",
      facebook: "https://www.facebook.com/mahmoudabdelmohsenatteya",
    },
  },
  {
    name: "Alaa Mohamed",
    position: "Chairperson",
    image: "https://res.cloudinary.com/otvxv2ll/image/upload/v1790637897/alaa-mohamed.webp",
    socials: {
      linkedin: "https://www.linkedin.com/in/alaa-mohamed-ab78992a0",
      facebook: "https://www.facebook.com/share/1D1qrgd5wd/?mibextid=wwXIfr",
    },
  },
  {
    name: "Ali Elsayed",
    position: "Vice Chair",
    image: "https://res.cloudinary.com/otvxv2ll/image/upload/v1790637897/ali-elsayed.webp",
    socials: {
      linkedin: "https://www.linkedin.com/in/alli-elsayed",
      facebook: "https://www.facebook.com/profile.php?id=100005694163126",
      collabratec: "https://ieee-collabratec.ieee.org/app/p/AliElsayed1187445",
    },
  },
  {
    name: "Reem Hendawy",
    position: "Treasurer",
    image: "https://res.cloudinary.com/otvxv2ll/image/upload/v1790637897/reem-hendawy.webp",
    socials: {
      linkedin: "https://www.linkedin.com/in/reem-hendawy-786711274",
      facebook: "https://www.facebook.com/share/1EnYDmR41H/?mibextid=wwXIfr",
    },
  },
  {
    name: "Youssif Hany",
    position: "Secretary",
    image: "https://res.cloudinary.com/otvxv2ll/image/upload/v1790637897/youssif-hany.webp",
    socials: {
      linkedin: "https://www.linkedin.com/in/youssef-hany-y038",
      facebook: "https://www.facebook.com/Youusif.038?mibextid=ZbWKwL",
    },
  },
];

// The positions that belong to the Excom. Everything else a committee member is
// likely to be a Board member. Used only for the legacy sweep below, where the
// alternative is guessing the same thing by hand for every existing row.
const EXCOM_POSITION_HINTS =
  /chair|vice|secretary|treasurer|counsel|president|head of/i;

const log = (msg) => console.log(msg);

(async () => {
  await connectDB();

  if (DRY) log("\n-- dry run, nothing will be written --\n");

  // 1. The starting season, published on the home page.
  let season = await Season.findOne({ name: DEFAULT_SEASON_NAME });
  if (!season) {
    const count = await Season.countDocuments();
    if (DRY) {
      // A placeholder so the reporting below can still print a season name and
      // count. A dry run must not write, so this is not a document.
      season = { _id: null, name: DEFAULT_SEASON_NAME, isHome: true };
      log(`would create season "${DEFAULT_SEASON_NAME}" (isHome: true)`);
    } else {
      season = await Season.create({
        name: DEFAULT_SEASON_NAME,
        order: count,
        isHome: true,
      });
      log(`created season "${season.name}" (isHome: true)`);
    }
  } else {
    log(`season "${season.name}" already exists`);
    if (!season.isHome) {
      if (!DRY) {
        season.isHome = true;
        await season.save();
        await Season.updateMany(
          { _id: { $ne: season._id }, isHome: true },
          { $set: { isHome: false } }
        );
      }
      log(`  would publish it on the home page`);
    }
  }

  // 2. Legacy crew documents: no season, and no section to put them in.
  const orphans = await Crew.find({ $or: [{ season: { $exists: false } }, { season: null }] });
  log(`\nlegacy crew members with no season: ${orphans.length}`);
  for (const member of orphans) {
    const guessed = EXCOM_POSITION_HINTS.test(member.position || "")
      ? "excom"
      : "board";
    if (!DRY) {
      member.season = season._id;
      member.section = guessed;
      member.socials = member.socials || {};
      await member.save();
    }
    log(`  - ${member.name} (${member.position}) -> ${guessed}`);
  }
  if (orphans.length && !DRY) {
    log(`  check the guessed sections above; move anyone wrong in the dashboard.`);
  }

  // 3. The committee the home page used to render from chairpersons.js.
  // In a dry run against a season that does not exist yet there is nothing to
  // compare against, so everything reports as "would seed" - which is the point.
  const existingNames = new Set(
    (
      await Crew.find(
        season._id ? { season: season._id } : { season: { $exists: false } }
      )
        .select("name")
        .lean()
    ).map((m) => m.name.toLowerCase())
  );
  let seeded = 0;
  for (const [index, person] of FOUNDING_EXCOM.entries()) {
    if (existingNames.has(person.name.toLowerCase())) {
      log(`  - ${person.name} already in "${season.name}", left alone`);
      continue;
    }
    if (!DRY) {
      await Crew.create({
        name: person.name,
        position: person.position,
        image: person.image,
        section: "excom",
        season: season._id,
        // The counselor is drawn full width above the grid, so give them the
        // only negative order to keep them first even if someone later sorts.
        order: person.position === "Counselor" ? -1 : index,
        socials: person.socials,
      });
    }
    log(`  - ${DRY ? "would seed" : "seeded"} ${person.name} (${person.position}) into the Excom`);
    seeded++;
  }

  const total = season._id
    ? await Crew.countDocuments({ season: season._id })
    : seeded;
  log(`\n"${season.name}" now holds ${total} member${total === 1 ? "" : "s"}`);
  if (DRY) log("\ndry run complete, nothing written");

  await mongoose.disconnect();
})().catch(async (err) => {
  console.error("\nbackfill failed:", err.message);
  try {
    await mongoose.disconnect();
  } catch {
    /* already closed */
  }
  process.exit(1);
});
