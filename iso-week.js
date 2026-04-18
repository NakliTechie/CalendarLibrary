/**
 * iso-week.js — ISO 8601 week date (year, week, day-of-week).
 *
 * Weeks start on Monday. ISO week 1 of a year is the week containing
 * that year's first Thursday (equivalently the week containing Jan 4).
 * For a handful of days near year boundaries the ISO year therefore
 * differs from the Gregorian year.
 *
 * Ported from:
 *   E. M. Reingold and N. Dershowitz,
 *   "Calendrical Calculations: The Ultimate Edition" (4th ed., 2018),
 *   chapter 5.
 *
 * Original algorithms (c) Reingold & Dershowitz. See NOTICE.
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { amod, quotient, kdayBefore, SUNDAY, jdFromRd, rdFromJd } from "./julian-day.js";
import { toRd as gregorianToRd, yearFromRd as gregorianYearFromRd } from "./gregorian.js";

export const ID = "iso-week";
export const DISPLAY_NAME = "ISO 8601 Week Date";

/** ISO weekday: 1 = Monday, ..., 7 = Sunday. Matches ISO 8601. */
export const isLongYear = year => {
  // Year is a "long" ISO year (53 weeks) if Jan 1 is Thursday, or if
  // Dec 31 is Thursday (in a leap Gregorian year).
  const jan1 = gregorianToRd({ year, month: 1, day: 1 });
  const dec31 = gregorianToRd({ year, month: 12, day: 31 });
  // R-D §5.1: use the weekday of Dec 28 == Thursday test.
  return amod(jan1, 7) === 4 || amod(dec31, 7) === 4;
};

/**
 * RD from ISO week date. R-D §5.1 `fixed-from-iso`.
 */
export const toRd = ({ year, week, day }) => {
  // Anchor: the Sunday that closes ISO week `week` of `year`.
  // Equivalently: week-th Sunday on or after Dec 28 of (year - 1).
  const dec28 = gregorianToRd({ year: year - 1, month: 12, day: 28 });
  const firstSundayOnOrAfterDec28 = 7 + kdayBefore(dec28, SUNDAY);
  const weekEndSunday = 7 * (week - 1) + firstSundayOnOrAfterDec28;
  return weekEndSunday + day;
};

/**
 * ISO week date from RD. R-D §5.1 `iso-from-fixed`.
 */
export const fromRd = rd => {
  const approxYear = gregorianYearFromRd(rd - 3);
  const start = toRd({ year: approxYear + 1, week: 1, day: 1 });
  const year = rd >= start ? approxYear + 1 : approxYear;
  const jan1OfIso = toRd({ year, week: 1, day: 1 });
  const week = quotient(rd - jan1OfIso, 7) + 1;
  const day = amod(rd, 7);
  return { year, week, day };
};

export const validate = ({ year, week, day }) => {
  if (!Number.isInteger(year)) return { valid: false, reason: "year must be integer" };
  if (!Number.isInteger(week)) return { valid: false, reason: "week must be integer" };
  if (!Number.isInteger(day))  return { valid: false, reason: "day must be integer" };
  if (day < 1 || day > 7)      return { valid: false, reason: "day must be 1..7 (Mon..Sun)" };
  const maxWeek = isLongYear(year) ? 53 : 52;
  if (week < 1 || week > maxWeek) {
    return { valid: false, reason: `week out of range 1..${maxWeek} for ISO ${year}` };
  }
  return { valid: true };
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
