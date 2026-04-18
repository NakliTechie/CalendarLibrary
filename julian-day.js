/**
 * julian-day.js — universal-intermediate day representation and
 * shared low-level math utilities used by every calendar module.
 *
 * We follow Reingold & Dershowitz (R-D) and use RD ("fixed date",
 * also called Rata Die) as the internal interchange: an integer for
 * date-only values, a real number for moments (fractional part =
 * UT time of day). RD 1 is the midnight that begins 0001-01-01 in
 * the proleptic Gregorian calendar.
 *
 * Julian Day (JD) is the more widely known astronomical day count
 * and is trivially related to RD by a constant. Public APIs on
 * every calendar expose both via {toRd,fromRd,toJd,fromJd}.
 *
 * Ported from:
 *   E. M. Reingold and N. Dershowitz,
 *   "Calendrical Calculations: The Ultimate Edition" (4th ed., 2018).
 *
 * Original algorithms (c) Reingold & Dershowitz. See NOTICE.
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

// ---- Shared math helpers --------------------------------------------------

/**
 * Floor-mod. Returns a value in [0, y) for y > 0, regardless of x's sign.
 * Matches R-D's `mod` and Common Lisp's `mod`.
 */
export const mod = (x, y) => x - y * Math.floor(x / y);

/**
 * Integer floor division. Matches R-D's `quotient` and Common Lisp's
 * `floor` (two-argument form).
 */
export const quotient = (x, y) => Math.floor(x / y);

/**
 * Adjusted mod, returning a value in {1, 2, ..., y} instead of [0, y).
 * Matches R-D's `amod`. Useful for 1-indexed cycles.
 */
export const amod = (x, y) => {
  const m = mod(x, y);
  return m === 0 ? y : m;
};

/**
 * Convenience: true iff x is an integer number (finite, not NaN, not
 * fractional). Used at API boundaries where callers must supply an
 * integer date.
 */
export const isInteger = Number.isInteger;

// ---- RD <-> JD -----------------------------------------------------------

/**
 * RD (fixed date) of JD 0. JD 0 is noon UT on 1 Jan 4713 BCE in the
 * proleptic Julian calendar, equivalently 24 Nov 4714 BCE proleptic
 * Gregorian. That moment is 1,721,424.5 days before the midnight that
 * begins 0001-01-01 Gregorian, so JD_EPOCH = -1721424.5 in RD terms.
 */
export const JD_EPOCH = -1721424.5;

/**
 * Convert a Julian Day (real-valued moment) to RD.
 * Sanity check: rdFromJd(2451544.5) === 730120, i.e. midnight UT
 * 2000-01-01 Gregorian (which matches USNO's published value).
 */
export const rdFromJd = jd => jd + JD_EPOCH;

/**
 * Convert an RD moment to Julian Day. Inverse of rdFromJd.
 */
export const jdFromRd = rd => rd - JD_EPOCH;

// ---- Day of week ----------------------------------------------------------

/**
 * R-D weekday numbering: 0 = Sunday, 1 = Monday, ..., 6 = Saturday.
 * Derived from the fact that RD 1 (Mon 1 Jan 0001 proleptic Gregorian)
 * falls on day 1.
 */
export const SUNDAY = 0;
export const MONDAY = 1;
export const TUESDAY = 2;
export const WEDNESDAY = 3;
export const THURSDAY = 4;
export const FRIDAY = 5;
export const SATURDAY = 6;

export const WEEKDAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
];

/**
 * Day of week for an RD (integer or moment). Returns 0..6 per R-D.
 */
export const dayOfWeek = rd => mod(Math.floor(rd), 7);

/**
 * ISO-8601 weekday numbering: 1 = Monday, ..., 7 = Sunday.
 */
export const isoWeekday = rd => {
  const d = dayOfWeek(rd);
  return d === 0 ? 7 : d;
};

// ---- Weekday arithmetic ---------------------------------------------------

/**
 * RD of the k-weekday on or before date. (R-D: kday-on-or-before.)
 * k: 0..6 (R-D weekday number). Handy primitive for calendars that
 * compute events like "last Sunday of March".
 */
export const kdayOnOrBefore = (rd, k) =>
  Math.floor(rd) - mod(Math.floor(rd) - k, 7);

export const kdayOnOrAfter    = (rd, k) => kdayOnOrBefore(rd + 6, k);
export const kdayNearest      = (rd, k) => kdayOnOrBefore(rd + 3, k);
export const kdayAfter        = (rd, k) => kdayOnOrBefore(rd + 7, k);
export const kdayBefore       = (rd, k) => kdayOnOrBefore(rd - 1, k);

// ---- Convenience: "now" as a JS Date, no timezone normalisation -----------

/**
 * RD of the start of the given UTC day (Date object). Useful for
 * grabbing the current RD from a browser. Time-of-day is discarded.
 *
 *   rdFromUtcDate(new Date()) -> today's RD at 00:00 UT
 */
export const rdFromUtcDate = date => {
  // Compute RD from (year, month, day) UTC. Use Gregorian (imported lazily
  // to avoid a circular dep at load time).
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  // Inline the Gregorian formula to avoid circular import.
  const prior = y - 1;
  return (
    365 * prior
    + quotient(prior, 4)
    - quotient(prior, 100)
    + quotient(prior, 400)
    + quotient(367 * m - 362, 12)
    + (m <= 2 ? 0 : isGregorianLeapYearInline(y) ? -1 : -2)
    + d
  );
};

// Inline leap-year check, kept private to avoid the circular import.
// Matches gregorian.js/isLeapYear.
const isGregorianLeapYearInline = y =>
  mod(y, 4) === 0 && mod(y, 100) !== 0 || mod(y, 400) === 0;
