/**
 * french-republican.js — French Revolutionary calendar (arithmetic).
 *
 * Adopted 22 September 1792 (Gregorian) = 1 Vendémiaire an I. Used as
 * France's civil calendar through 31 December 1805 (Gregorian), when
 * Napoleon restored the Gregorian calendar. 12 months of 30 days
 * each, followed by 5 or 6 "sansculottides" (complementary days)
 * appended to each year.
 *
 * Two variants exist:
 *   - Astronomical: leap year determined by the autumnal equinox at
 *     the Paris meridian. This is the variant used historically
 *     (1792–1805). Not implemented here; needs an ephemeris.
 *   - Arithmetic: Romme's 1795 proposal, never officially adopted,
 *     using a Gregorian-like 4/100/400/4000 rule but shifted so
 *     year 3 (1794–95) is leap. Implemented here.
 *
 * This port gives calendar dates under the arithmetic rule, which
 * agrees with the astronomical variant through at least the first
 * few decades and is what Mechanikon uses by default.
 *
 * Ported from:
 *   E. M. Reingold and N. Dershowitz,
 *   "Calendrical Calculations: The Ultimate Edition" (4th ed., 2018),
 *   chapter 16.
 *
 * Original algorithms (c) Reingold & Dershowitz. See NOTICE.
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { mod, quotient, jdFromRd, rdFromJd } from "./julian-day.js";
import { toRd as gregToRd } from "./gregorian.js";

/** RD of 1 Vendémiaire an I = 22 September 1792 Gregorian. */
export const EPOCH = gregToRd({ year: 1792, month: 9, day: 22 });

export const ID = "french-republican";
export const DISPLAY_NAME = "French Republican (arithmetic)";

export const MONTH_NAMES = [
  null,
  "Vendémiaire", "Brumaire", "Frimaire",
  "Nivôse", "Pluviôse", "Ventôse",
  "Germinal", "Floréal", "Prairial",
  "Messidor", "Thermidor", "Fructidor",
  "sansculottides",
];

/**
 * Leap year under Romme's arithmetic rule: year Y is leap iff the
 * Gregorian rule applied to (Y + 1) would make (Y + 1) leap. The
 * shift means year 3 is the first leap (since Gregorian year 4 is
 * leap) and the /100 / /400 / /4000 drops happen at years 99, 399,
 * 3999 respectively.
 */
export const isLeapYear = year => {
  const y = year + 1;
  return (mod(y, 4) === 0 && mod(y, 100) !== 0)
      || (mod(y, 400) === 0 && mod(y, 4000) !== 0);
};

export const daysInMonth = (year, month) => {
  if (month < 1 || month > 13) return 0;
  if (month === 13) return isLeapYear(year) ? 6 : 5;
  return 30;
};

export const daysInYear = year => (isLeapYear(year) ? 366 : 365);

export const validate = ({ year, month, day }) => {
  if (!Number.isInteger(year))  return { valid: false, reason: "year must be an integer" };
  if (!Number.isInteger(month)) return { valid: false, reason: "month must be an integer" };
  if (!Number.isInteger(day))   return { valid: false, reason: "day must be an integer" };
  if (month < 1 || month > 13)  return { valid: false, reason: `month ${month} out of range 1..13` };
  const max = daysInMonth(year, month);
  if (day < 1 || day > max)     return { valid: false, reason: `day ${day} out of range 1..${max} for French Rep ${year}-${month}` };
  return { valid: true };
};

/** RD from French Republican date. R-D §16.2 arithmetic `fixed-from-french-revolutionary`. */
export const toRd = ({ year, month, day }) => (
  EPOCH - 1
  + 365 * (year - 1)
  + quotient(year, 4)
  - quotient(year, 100)
  + quotient(year, 400)
  - quotient(year, 4000)
  + 30 * (month - 1)
  + day
);

/** French Republican date from RD. Approximate-then-correct. */
export const fromRd = rd => {
  let year = 1 + Math.floor((rd - EPOCH) / 365.2425);
  while (toRd({ year: year + 1, month: 1, day: 1 }) <= rd) year++;
  while (toRd({ year, month: 1, day: 1 }) > rd) year--;
  const priorDays = rd - toRd({ year, month: 1, day: 1 });
  const month = 1 + Math.floor(priorDays / 30);
  const day = priorDays - 30 * (month - 1) + 1;
  return { year, month, day };
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
