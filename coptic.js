/**
 * coptic.js — Coptic calendar ("Era of Martyrs" / Anno Martyrum).
 *
 * 12 months of 30 days + a 13th month ("epagomenal") of 5 days (6 in
 * leap years). Year 1 begins on 29 Aug 284 CE Julian — the year
 * Diocletian became Roman emperor. Used by the Coptic Orthodox
 * Church and widely in Egypt for agriculture.
 *
 * Leap year: year mod 4 === 3 (so Coptic year 3 is the first leap,
 * which corresponds to Julian year 287, itself Julian-leap).
 *
 * Ported from:
 *   E. M. Reingold and N. Dershowitz,
 *   "Calendrical Calculations: The Ultimate Edition" (4th ed., 2018),
 *   §4.1.
 *
 * Original algorithms (c) Reingold & Dershowitz. See NOTICE.
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { mod, quotient, jdFromRd, rdFromJd } from "./julian-day.js";
import { toRd as julianToRd } from "./julian.js";

/** RD of Coptic 0001-01-01 = Julian 284-08-29. */
export const EPOCH = julianToRd({ year: 284, month: 8, day: 29 });

export const ID = "coptic";
export const DISPLAY_NAME = "Coptic";

/** Month names (Bohairic transliteration). Month 13 is epagomenal. */
export const MONTH_NAMES = [
  null,
  "Thout", "Paopi", "Hathor", "Koiak", "Tobi", "Meshir",
  "Paremhat", "Paremoude", "Pashons", "Paoni", "Epip", "Mesori",
  "Pi Kogi Enavot", // the epagomenal month
];

export const isLeapYear = year => mod(year, 4) === 3;

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
  if (day < 1 || day > max)     return { valid: false, reason: `day ${day} out of range 1..${max} for Coptic ${year}-${month}` };
  return { valid: true };
};

/** RD from Coptic date. R-D §4.1 `fixed-from-coptic`. */
export const toRd = ({ year, month, day }) => (
  EPOCH - 1
  + 365 * (year - 1)
  + quotient(year, 4)
  + 30 * (month - 1)
  + day
);

/** Coptic date from RD. R-D §4.1 `coptic-from-fixed`. */
export const fromRd = rd => {
  const year = quotient(4 * (rd - EPOCH) + 1463, 1461);
  const month = 1 + quotient(rd - toRd({ year, month: 1, day: 1 }), 30);
  const day = rd - toRd({ year, month, day: 1 }) + 1;
  return { year, month, day };
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
