/**
 * ethiopian.js — Ethiopian calendar (Ge'ez: ዓ.ም. Amata Mihret).
 *
 * Shares structure with the Coptic calendar — 12 months of 30 days
 * plus a 13th ("Pagume") of 5 or 6 — but uses a different epoch,
 * 29 Aug 8 CE Julian, giving a 7–8 year offset from Gregorian years.
 * Used as the civil and liturgical calendar in Ethiopia and by the
 * Ethiopian Orthodox Tewahedo Church.
 *
 * Leap year: year mod 4 === 3, as in Coptic.
 *
 * Ported from:
 *   E. M. Reingold and N. Dershowitz,
 *   "Calendrical Calculations: The Ultimate Edition" (4th ed., 2018),
 *   §4.2.
 *
 * Original algorithms (c) Reingold & Dershowitz. See NOTICE.
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { mod, quotient, jdFromRd, rdFromJd } from "./julian-day.js";
import { toRd as julianToRd } from "./julian.js";
import * as coptic from "./coptic.js";

/** RD of Ethiopian 0001-01-01 = Julian 0008-08-29. */
export const EPOCH = julianToRd({ year: 8, month: 8, day: 29 });

export const ID = "ethiopian";
export const DISPLAY_NAME = "Ethiopian";

/** Ge'ez month names (transliterated). */
export const MONTH_NAMES = [
  null,
  "Mäskäräm", "Ṭəqəmt", "Ḫədar", "Taḫśaś", "Ṭərr", "Yäkatit",
  "Mägabit", "Miyazya", "Gənbot", "Säne", "Ḥamle", "Nähase",
  "Ṗagume",
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
  if (day < 1 || day > max)     return { valid: false, reason: `day ${day} out of range 1..${max} for Ethiopian ${year}-${month}` };
  return { valid: true };
};

/**
 * RD from Ethiopian date. R-D §4.2 `fixed-from-ethiopic`.
 * Reuses Coptic's toRd with an epoch translation.
 */
export const toRd = ({ year, month, day }) =>
  EPOCH + coptic.toRd({ year, month, day }) - coptic.EPOCH;

/** Ethiopian date from RD. R-D §4.2. */
export const fromRd = rd =>
  coptic.fromRd(rd + coptic.EPOCH - EPOCH);

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
