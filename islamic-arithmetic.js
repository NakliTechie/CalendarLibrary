/**
 * islamic-arithmetic.js — arithmetic (tabular) Islamic / Hijri calendar.
 *
 * A purely-arithmetic Islamic calendar. 12 months totalling 354 or 355
 * days; 11 leap years in every 30-year cycle at positions
 * 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29. This variant is the
 * mathematically-predictable "civil" form used for historical dates
 * and some legal calendars. It differs slightly from observational
 * Islamic calendars (e.g. Saudi Umm al-Qura, in umm-al-qura.js) which
 * depend on lunar sighting.
 *
 * Epoch: 1 Muharram AH 1 = Julian 16 July 622 CE (conventional civil
 * epoch; Islamic days begin at sunset, so the preceding sunset is the
 * actual start).
 *
 * Ported from:
 *   E. M. Reingold and N. Dershowitz,
 *   "Calendrical Calculations: The Ultimate Edition" (4th ed., 2018),
 *   chapter 7.
 *
 * Original algorithms (c) Reingold & Dershowitz. See NOTICE.
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { mod, quotient, jdFromRd, rdFromJd } from "./julian-day.js";
import { toRd as julianToRd } from "./julian.js";

/** RD of 1 Muharram AH 1 = 16 July 622 CE Julian. */
export const EPOCH = julianToRd({ year: 622, month: 7, day: 16 });

export const ID = "islamic-arithmetic";
export const DISPLAY_NAME = "Islamic (arithmetic)";

export const MONTH_NAMES = [
  null,
  "Muḥarram", "Ṣafar", "Rabīʿ al-Awwal", "Rabīʿ ath-Thānī",
  "Jumādā al-Ūlā", "Jumādā ath-Thāniyah", "Rajab", "Shaʿbān",
  "Ramaḍān", "Shawwāl", "Dhū al-Qaʿdah", "Dhū al-Ḥijjah",
];

/** R-D §7.1: 11-of-30 year leap pattern. */
export const isLeapYear = year => mod(14 + 11 * year, 30) < 11;

export const daysInMonth = (year, month) => {
  if (month < 1 || month > 12) return 0;
  if (month === 12) return isLeapYear(year) ? 30 : 29;
  return month % 2 === 1 ? 30 : 29; // odd months 30, even months 29
};

export const daysInYear = year => (isLeapYear(year) ? 355 : 354);

export const validate = ({ year, month, day }) => {
  if (!Number.isInteger(year))  return { valid: false, reason: "year must be an integer" };
  if (!Number.isInteger(month)) return { valid: false, reason: "month must be an integer" };
  if (!Number.isInteger(day))   return { valid: false, reason: "day must be an integer" };
  if (month < 1 || month > 12)  return { valid: false, reason: `month ${month} out of range 1..12` };
  const max = daysInMonth(year, month);
  if (day < 1 || day > max)     return { valid: false, reason: `day ${day} out of range 1..${max} for Islamic ${year}-${month}` };
  return { valid: true };
};

/** RD from Islamic date. R-D §7.1 `fixed-from-islamic`. */
export const toRd = ({ year, month, day }) => (
  EPOCH - 1
  + 354 * (year - 1)
  + quotient(3 + 11 * year, 30)
  + 29 * (month - 1)
  + quotient(month, 2)
  + day
);

/** Islamic date from RD. R-D §7.1 `islamic-from-fixed`. */
export const fromRd = rd => {
  const year = quotient(30 * (rd - EPOCH) + 10646, 10631);
  const priorDays = rd - toRd({ year, month: 1, day: 1 });
  const month = quotient(11 * priorDays + 330, 325);
  const day = rd - toRd({ year, month, day: 1 }) + 1;
  return { year, month, day };
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
