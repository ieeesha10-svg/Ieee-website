/**
 * Shared crew helpers.
 *
 * These live in one place because two different callers need the same answers
 * and must not disagree: the dashboard writes crew documents, and the public
 * season/crew endpoints read them back. The homepage decides who gets a
 * full-width card from `isCounselorPosition`, and the profile pages decide which
 * social icons to draw from `shapeMember`. If the rule for either lived in a
 * Mongoose virtual it would silently vanish on every `.lean()` read, which is
 * how the public pages read, and the homepage would quietly lose its counselor.
 */

/** The social fields a member can have, in the order the dashboard shows them. */
const SOCIAL_KEYS = ["linkedin", "facebook", "collabratec", "email", "website"];

/**
 * The sections a crew member can belong to, in display order.
 *
 * Counselor is first on purpose: it is the senior advisory role, and on both the
 * home page and /crew it reads as the person the committee answers to rather than
 * as a peer of the Excom.
 *
 * Kept here rather than in the controller so the write path (which validates
 * against it), the season payload (which groups by it) and the docs all read the
 * same list. Adding a section is one edit in this file plus the schema enum.
 */
const SECTIONS = ["counselor", "excom", "board"];

/**
 * Split a flat member list into one array per section.
 *
 * Every section is always present as a key, empty if nobody is in it, so the
 * public payload has a stable shape: the crew page can render its sections
 * unconditionally instead of guarding each one for undefined.
 */
const groupBySection = (members) => {
  const grouped = Object.fromEntries(SECTIONS.map((s) => [s, []]));
  for (const member of members) {
    // An unrecognised section would otherwise be dropped silently, which is how a
    // member ends up invisible on the site with no error anywhere.
    const bucket = grouped[member.section];
    if (bucket) bucket.push(shapeMember(member));
  }
  return grouped;
};

/**
 * The counselor is the one role the public pages give a full-width card, so it is
 * split out of the card grid. Since the Counselor section is now explicit, this
 * only has to cover a legacy member who was filed under the Excom with
 * "Counselor" as their position before the section existed; `groupBySection`
 * cannot rely on it, because that is exactly the member a section-less read would
 * misfile.
 */
const isCounselorPosition = (position) => /counsel/i.test(position || "");

const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const blankToUndefined = (value) => {
  const trimmed = (value ?? "").toString().trim();
  return trimmed === "" ? undefined : trimmed;
};

/**
 * Normalise and validate the socials a member was submitted with.
 *
 * Throws an `AppError` naming the offending field rather than silently dropping
 * it: a typo'd LinkedIn URL that quietly disappears looks like the feature is
 * broken, and the admin has no way to tell a bad paste from a missing one.
 * `email` is stored as a bare address so the public pages can build a mailto:
 * without every caller having to remember to strip the scheme.
 *
 * @throws {import('../middleware/errorsMiddleware').AppError} 400 on a bad value
 * @returns {Record<string, string>} only the fields that were filled in
 */
const sanitizeSocials = (input, AppError) => {
  const socials = {};

  for (const key of SOCIAL_KEYS) {
    const value = blankToUndefined(input?.[key]);
    if (value === undefined) continue;

    if (key === "email") {
      const address = value.replace(/^mailto:/i, "").trim();
      if (!isEmail(address)) {
        throw new AppError(`"${address}" is not a valid email address`, 400);
      }
      socials.email = address.toLowerCase();
      continue;
    }

    if (key === "website" || key === "collabratec" || key === "linkedin" || key === "facebook") {
      // Bare domains are what people actually paste, so add the scheme rather
      // than rejecting them; `linkedin.com/in/x` is the common case.
      const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
      if (!isHttpUrl(candidate)) {
        throw new AppError(`"${value}" is not a valid ${key} URL`, 400);
      }
      socials[key] = candidate;
    }
  }

  return socials;
};

/**
 * The public shape of a crew member.
 *
 * An explicit list rather than spreading the document, so a field added to the
 * model later is not published to the website by accident. This endpoint is
 * unauthenticated, so what it exposes is a decision, not a default.
 */
const shapeMember = (member) => ({
  _id: member._id,
  name: member.name || "",
  position: member.position || "",
  image: member.image || "",
  bio: member.bio || "",
  section: member.section || "excom",
  order: member.order ?? 0,
  // Also true for a member filed under the Counselor section, so a caller that
  // only wants "who gets the big card" does not have to check both.
  isCounselor:
    member.section === "counselor" || isCounselorPosition(member.position),
  socials: SOCIAL_KEYS.reduce((acc, key) => {
    acc[key] = member.socials?.[key] || "";
    return acc;
  }, {}),
});

module.exports = {
  SOCIAL_KEYS,
  SECTIONS,
  isCounselorPosition,
  isHttpUrl,
  isEmail,
  sanitizeSocials,
  shapeMember,
  groupBySection,
};
