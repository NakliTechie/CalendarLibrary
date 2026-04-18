/**
 * julian.js — proleptic Julian calendar (Caesar / Augustan / Christian).
 *
 * Ported from:
 *   E. M. Reingold and N. Dershowitz,
 *   "Calendrical Calculations: The Ultimate Edition" (4th ed., 2018),
 *   chapter 3.
 *
 * Astronomical year numbering: year 0 = 1 BCE, year -1 = 2 BCE. This
 * differs from historical "BC/AD" usage where year 0 does not exist.
 * Presentation-layer code wanting "2 BC" display must translate.
 *
 * Original algorithms (c) Reingold & Dershowitz. See NOTICE.
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { mod, quotient, jdFromRd, rdFromJd } from "./julian-day.js";

/**
 * RD of the Julian epoch, Julian 0001-01-01. Equivalent to
 * proleptic Gregorian 0000-12-30 (i.e. RD -1).
 */
export const EPOCH = -1;

export const ID = "julian";
export const DISPLAY_NAME = "Julian";

export const MONTH_NAMES = [
  null,
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Julian leap-year test in astronomical year numbering: every year
 * divisible by 4 is leap, including year 0. This intentionally
 * differs from R-D's historical `julian-leap-year?` which uses
 * "mod(year, 4) = 3 if negative, 0 if positive" to account for the
 * BC/AD year-zero gap. We skip that gap; users convert to
 * historical notation at the display layer.
 */
export const isLeapYear = year => mod(year, 4) === 0;

export const daysInMonth = (year, month) => {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
};

export const daysInYear = year => (isLeapYear(year) ? 366 : 365);

export const validate = ({ year, month, day }) => {
  if (!Number.isInteger(year))  return { valid: false, reason: "year must be an integer" };
  if (!Number.isInteger(month)) return { valid: false, reason: "month must be an integer" };
  if (!Number.isInteger(day))   return { valid: false, reason: "day must be an integer" };
  if (month < 1 || month > 12)  return { valid: false, reason: `month ${month} out of range 1..12` };
  const max = daysInMonth(year, month);
  if (day < 1 || day > max)     return { valid: false, reason: `day ${day} out of range 1..${max} for Julian ${year}-${month}` };
  return { valid: true };
};

/**
 * RD from Julian date. R-D §3.1 `fixed-from-julian`, adapted for
 * astronomical year numbering (no year-zero skip).
 */
export const toRd = ({ year, month, day }) => {
  const priorYears = year - 1;
  return (
    EPOCH - 1
    + 365 * priorYears
    + quotient(priorYears, 4)
    + quotient(367 * month - 362, 12)
    + (month <= 2 ? 0 : isLeapYear(year) ? -1 : -2)
    + day
  );
};

/**
 * Julian date from RD. R-D §3.1 `julian-from-fixed`, adapted for
 * astronomical year numbering.
 */
export const fromRd = rd => {
  const approx = quotient(4 * (rd - EPOCH) + 1464, 1461);
  const year = approx;
  const priorDays = rd - toRd({ year, month: 1, day: 1 });
  const march1 = toRd({ year, month: 3, day: 1 });
  const correction = rd < march1 ? 0 : isLeapYear(year) ? 1 : 2;
  const month = quotient(12 * (priorDays + correction) + 373, 367);
  const day = rd - toRd({ year, month, day: 1 }) + 1;
  return { year, month, day };
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
