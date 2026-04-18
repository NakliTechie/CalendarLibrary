/**
 * hebrew.js — Hebrew calendar.
 *
 * A Metonic-cycle lunisolar calendar: 12 or 13 months (a leap year
 * inserts a second month of Adar), 353–355 days in common years,
 * 383–385 in leap years. Leap years follow a 19-year cycle (years
 * 3, 6, 8, 11, 14, 17, 19 are leap).
 *
 * The calendar has been governed since the codification by Hillel II
 * (359 CE) by fixed arithmetic rules — no astronomy is needed to
 * compute dates. Year starts civilly on 1 Tishri (month 7 in R-D's
 * religious-year numbering that begins with Nisan); year number
 * rolls over on Tishri 1.
 *
 * Day of week for 1 Tishri is adjusted by four postponement rules
 * (the "dehiyyot"):
 *   1. lo-ADU-rosh — Rosh Hashanah cannot fall on Sunday, Wednesday,
 *      or Friday. (Encoded in hebrewCalendarElapsedDays.)
 *   2. molad-zaken — if the molad of Tishri is at or after noon,
 *      postpone. (Encoded in the molad computation.)
 *   3. GaTaRaD — in a common year that would begin on a Tuesday
 *      with a late-enough molad, postpone two days.
 *   4. BeTuTaKPaT — in a common year following a leap year that
 *      would begin on a Monday with a late-enough molad, postpone
 *      one day.
 * Rules 3 and 4 are enforced in hebrewYearLengthCorrection.
 *
 * Ported from:
 *   E. M. Reingold and N. Dershowitz,
 *   "Calendrical Calculations: The Ultimate Edition" (4th ed., 2018),
 *   chapter 8.
 *
 * Original algorithms (c) Reingold & Dershowitz. See NOTICE.
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { mod, quotient, jdFromRd, rdFromJd } from "./julian-day.js";
import { toRd as julianToRd } from "./julian.js";

/** RD of 1 Tishri AM 1 = 7 October 3761 BCE Julian (astro year -3760). */
export const EPOCH = julianToRd({ year: -3760, month: 10, day: 7 });

export const ID = "hebrew";
export const DISPLAY_NAME = "Hebrew";

/**
 * Month numbering follows R-D (religious year starting at Nisan):
 *   1 Nisan, 2 Iyar, 3 Sivan, 4 Tammuz, 5 Av, 6 Elul,
 *   7 Tishri, 8 Heshvan, 9 Kislev, 10 Tevet, 11 Shevat,
 *   12 Adar (Adar I in a leap year), 13 Adar II.
 * Civilly the year begins on 1 Tishri (month 7); the year number
 * rolls over there.
 */
export const MONTH_NAMES = [
  null,
  "Nisan", "Iyar", "Sivan", "Tammuz", "Av", "Elul",
  "Tishri", "Heshvan", "Kislev", "Tevet", "Shevat", "Adar", "Adar II",
];

const TISHRI = 7;
const NISAN  = 1;

/** True if `year` is a Hebrew leap year (7 of 19). R-D §8.1. */
export const isLeapYear = year => mod(7 * year + 1, 19) < 7;

/** Number of months in a given Hebrew year. */
export const lastMonthOfYear = year => (isLeapYear(year) ? 13 : 12);

/**
 * Days in the given Hebrew month of the given year. Heshvan and
 * Kislev can be either 29 or 30, controlled by the year length.
 */
export const daysInMonth = (year, month) => {
  if (month === 2 || month === 4 || month === 6 || month === 10 || month === 13) return 29;
  if (month === 12 && !isLeapYear(year)) return 29;
  if (month === 8 && !longHeshvan(year)) return 29;
  if (month === 9 && shortKislev(year)) return 29;
  return 30;
};

/** Days since Hebrew epoch through end of year (y - 1). R-D §8.2. */
function hebrewCalendarElapsedDays(year) {
  const monthsElapsed = quotient(235 * year - 234, 19);
  const partsElapsed  = 12084 + 13753 * monthsElapsed;
  const day = 29 * monthsElapsed + quotient(partsElapsed, 25920);
  // lo-ADU-rosh dehiyyah encoded in the check (3*(d+1) mod 7 < 3).
  return mod(3 * (day + 1), 7) < 3 ? day + 1 : day;
}

/** GaTaRaD / BeTuTaKPaT corrections. R-D §8.2. */
function hebrewYearLengthCorrection(year) {
  const ny0 = hebrewCalendarElapsedDays(year - 1);
  const ny1 = hebrewCalendarElapsedDays(year);
  const ny2 = hebrewCalendarElapsedDays(year + 1);
  if (ny2 - ny1 === 356) return 2; // GaTaRaD
  if (ny1 - ny0 === 382) return 1; // BeTuTaKPaT
  return 0;
}

/** RD of 1 Tishri year. R-D §8.2 `hebrew-new-year`. */
export function newYear(year) {
  return EPOCH
    + hebrewCalendarElapsedDays(year)
    + hebrewYearLengthCorrection(year);
}

/** Days in a Hebrew year (353..355 common, 383..385 leap). */
export const daysInYear = year => newYear(year + 1) - newYear(year);

/** Heshvan is "long" (30 days) if the year is 355 or 385 days. */
export function longHeshvan(year) {
  const d = daysInYear(year);
  return d === 355 || d === 385;
}

/** Kislev is "short" (29 days) if the year is 353 or 383 days. */
export function shortKislev(year) {
  const d = daysInYear(year);
  return d === 353 || d === 383;
}

export const validate = ({ year, month, day }) => {
  if (!Number.isInteger(year))  return { valid: false, reason: "year must be an integer" };
  if (!Number.isInteger(month)) return { valid: false, reason: "month must be an integer" };
  if (!Number.isInteger(day))   return { valid: false, reason: "day must be an integer" };
  const lastMonth = lastMonthOfYear(year);
  if (month < 1 || month > lastMonth) {
    return { valid: false, reason: `month ${month} out of range 1..${lastMonth}` };
  }
  const max = daysInMonth(year, month);
  if (day < 1 || day > max) {
    return { valid: false, reason: `day ${day} out of range 1..${max} for Hebrew ${year}-${month}` };
  }
  return { valid: true };
};

/** Sum days in months [from..to] inclusive, for year `year`. */
function sumMonthDays(year, from, to) {
  let total = 0;
  for (let m = from; m <= to; m++) total += daysInMonth(year, m);
  return total;
}

/** RD from Hebrew date. R-D §8.3 `fixed-from-hebrew`. */
export const toRd = ({ year, month, day }) => {
  let monthDays;
  if (month < TISHRI) {
    // Month is in spring (Nisan..Elul): sum Tishri..last-of-year, then Nisan..month-1.
    monthDays = sumMonthDays(year, TISHRI, lastMonthOfYear(year))
              + sumMonthDays(year, NISAN, month - 1);
  } else {
    monthDays = sumMonthDays(year, TISHRI, month - 1);
  }
  return newYear(year) + day - 1 + monthDays;
};

/** Hebrew date from RD. R-D §8.3 `hebrew-from-fixed`. */
export const fromRd = rd => {
  // Rough year approximation: average Hebrew year length ≈ 365.2468 days.
  const approx = quotient(rd - EPOCH, 365.2468) + 1;
  let year = approx - 1;
  while (newYear(year + 1) <= rd) year++;
  // Determine which half of the year we're in.
  const firstOfNisan = toRd({ year, month: NISAN, day: 1 });
  const startMonth = rd < firstOfNisan ? TISHRI : NISAN;
  let month = startMonth;
  while (rd > toRd({ year, month, day: daysInMonth(year, month) })) month++;
  const day = rd - toRd({ year, month, day: 1 }) + 1;
  return { year, month, day };
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
