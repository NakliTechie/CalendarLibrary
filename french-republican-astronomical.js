/**
 * french-republican-astronomical.js — French Revolutionary calendar (astronomical).
 *
 * The historically used variant (1792–1805): the new year (1 Vendémiaire)
 * falls on the day of the autumnal equinox at the Paris meridian, using
 * mean solar time (local apparent noon is replaced by mean noon at the
 * Paris Observatory, longitude 2°21′E). A year is leap whenever the
 * following new year is 366 days away (i.e. two consecutive autumnal
 * equinoxes are 366 days apart in Paris local mean time).
 *
 * This variant was used in practice throughout the calendar's active
 * life (1792–1805) and agrees with the arithmetic (Romme) variant for
 * virtually all dates in that period, but the two diverge eventually.
 *
 * Ported from:
 *   E. M. Reingold and N. Dershowitz,
 *   "Calendrical Calculations: The Ultimate Edition" (4th ed., 2018),
 *   §16.3 ("Astronomical French Revolutionary Calendar").
 *
 * Original algorithms (c) Reingold & Dershowitz. See NOTICE.
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { jdFromRd, rdFromJd } from "./julian-day.js";
import { toRd as gregToRd } from "./gregorian.js";
import { solarLongitudeAfter, localFromUniversal, PARIS } from "./astronomy.js";

/** RD of 1 Vendémiaire an I = 22 September 1792 (autumnal equinox). */
export const EPOCH = gregToRd({ year: 1792, month: 9, day: 22 });

export const ID = "french-republican-astronomical";
export const DISPLAY_NAME = "French Republican (astronomical)";

export const MONTH_NAMES = [
  null,
  "Vendémiaire", "Brumaire", "Frimaire",
  "Nivôse", "Pluviôse", "Ventôse",
  "Germinal", "Floréal", "Prairial",
  "Messidor", "Thermidor", "Fructidor",
  "sansculottides",
];

/**
 * RD of 1 Vendémiaire of French Republican year `year`. Finds the
 * autumnal equinox (solar longitude 180°) at or after September 17 of
 * the corresponding Gregorian year, then floors to the Paris mean-solar-
 * time day in which that moment falls.
 */
function frenchAstronomicalNewYear(year) {
  const gregYear = year + 1791;
  const approx = gregToRd({ year: gregYear, month: 9, day: 17 });
  const equinox = solarLongitudeAfter(180, approx);
  return Math.floor(localFromUniversal(equinox, PARIS));
}

export const isLeapYear = year =>
  frenchAstronomicalNewYear(year + 1) - frenchAstronomicalNewYear(year) === 366;

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
  if (day < 1 || day > max)
    return { valid: false, reason: `day ${day} out of range 1..${max} for French Rep astro ${year}-${month}` };
  return { valid: true };
};

/** RD from French Republican astronomical date. */
export const toRd = ({ year, month, day }) =>
  frenchAstronomicalNewYear(year) + 30 * (month - 1) + day - 1;

/** French Republican astronomical date from RD. */
export const fromRd = rd => {
  let year = 1 + Math.floor((rd - EPOCH) / 365.2425);
  while (frenchAstronomicalNewYear(year + 1) <= rd) year++;
  while (frenchAstronomicalNewYear(year) > rd) year--;
  const priorDays = rd - frenchAstronomicalNewYear(year);
  const month = 1 + Math.floor(priorDays / 30);
  const day = priorDays - 30 * (month - 1) + 1;
  return { year, month, day };
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
