/**
 * gregorian.js — proleptic Gregorian calendar.
 *
 * Ported from:
 *   E. M. Reingold and N. Dershowitz,
 *   "Calendrical Calculations: The Ultimate Edition" (4th ed., 2018),
 *   sections 2.4 and 2.5.
 *
 * Uses astronomical year numbering: year 0 = 1 BCE, year -1 = 2 BCE.
 * No year-zero skip. Users wanting BC/AD display must translate at
 * the presentation layer.
 *
 * Original algorithms (c) Reingold & Dershowitz. See NOTICE.
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { mod, quotient, jdFromRd, rdFromJd } from "./julian-day.js";

/** RD of the proleptic Gregorian epoch, 0001-01-01. */
export const EPOCH = 1;

export const ID = "gregorian";
export const DISPLAY_NAME = "Gregorian";

export const MONTH_NAMES = [
  null, // 1-indexed
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** True if `year` is a Gregorian leap year (proleptic). */
export const isLeapYear = year =>
  (mod(year, 4) === 0 && mod(year, 100) !== 0) || mod(year, 400) === 0;

/** Number of days in a given Gregorian month of a given year. */
export const daysInMonth = (year, month) => {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
};

/**
 * Number of days in the given Gregorian year (365 or 366).
 */
export const daysInYear = year => (isLeapYear(year) ? 366 : 365);

/**
 * Validate a Gregorian date tuple. Returns { valid, reason }.
 * Does not consult historical adoption dates (Julian / Gregorian cutover).
 */
export const validate = ({ year, month, day }) => {
  if (!Number.isInteger(year))  return { valid: false, reason: "year must be an integer" };
  if (!Number.isInteger(month)) return { valid: false, reason: "month must be an integer" };
  if (!Number.isInteger(day))   return { valid: false, reason: "day must be an integer" };
  if (month < 1 || month > 12)  return { valid: false, reason: `month ${month} out of range 1..12` };
  const max = daysInMonth(year, month);
  if (day < 1 || day > max)     return { valid: false, reason: `day ${day} out of range 1..${max} for ${year}-${month}` };
  return { valid: true };
};

/**
 * RD from Gregorian date. R-D §2.5 `fixed-from-gregorian`.
 */
export const toRd = ({ year, month, day }) => {
  const priorYears = year - 1;
  return (
    EPOCH - 1
    + 365 * priorYears
    + quotient(priorYears, 4)
    - quotient(priorYears, 100)
    + quotient(priorYears, 400)
    + quotient(367 * month - 362, 12)
    + (month <= 2 ? 0 : isLeapYear(year) ? -1 : -2)
    + day
  );
};

/**
 * Gregorian year from RD. R-D §2.5 `gregorian-year-from-fixed`.
 */
export const yearFromRd = rd => {
  const d0 = rd - EPOCH;
  const n400 = quotient(d0, 146097);
  const d1 = mod(d0, 146097);
  const n100 = quotient(d1, 36524);
  const d2 = mod(d1, 36524);
  const n4 = quotient(d2, 1461);
  const d3 = mod(d2, 1461);
  const n1 = quotient(d3, 365);
  const year = 400 * n400 + 100 * n100 + 4 * n4 + n1;
  return (n100 === 4 || n1 === 4) ? year : year + 1;
};

/**
 * Gregorian date from RD. R-D §2.5 `gregorian-from-fixed`.
 */
export const fromRd = rd => {
  const year = yearFromRd(rd);
  const priorDays = rd - toRd({ year, month: 1, day: 1 });
  const march1 = toRd({ year, month: 3, day: 1 });
  const correction = rd < march1 ? 0 : isLeapYear(year) ? 1 : 2;
  const month = quotient(12 * (priorDays + correction) + 373, 367);
  const day = rd - toRd({ year, month, day: 1 }) + 1;
  return { year, month, day };
};

// Convenience wrappers in Julian Day units.
export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));

/**
 * Day of the year (ordinal, 1..365/366). R-D §2.5 `day-number`.
 */
export const dayOfYear = ({ year, month, day }) =>
  toRd({ year, month, day }) - toRd({ year: year - 1, month: 12, day: 31 });

/** Remaining days in the year (0..364/365). R-D §2.5. */
export const daysRemainingInYear = date =>
  toRd({ year: date.year, month: 12, day: 31 }) - toRd(date);
