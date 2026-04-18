/**
 * hindu-shaka.js — Indian National Calendar (Shaka, solar variant).
 *
 * India's official civil calendar since 1957-03-22, used on government
 * documents, the Gazette of India, All India Radio date announcements,
 * and Indian Standard Time publications. A SOLAR calendar — NOT the
 * lunisolar Shaka used religiously in South India (for which see
 * PENDING.md; needs the Hindu astronomical port).
 *
 * Structure:
 *   - Year = Gregorian year − 78, with the year boundary at Chaitra 1
 *     (around March 22 in common years, March 21 in Gregorian leap
 *     years).
 *   - 12 fixed-length months:
 *       Chaitra      30 (or 31 in leap year)
 *       Vaisakha     31
 *       Jyeshtha     31
 *       Ashadha      31
 *       Shravana     31
 *       Bhadrapada   31
 *       Ashvin       30
 *       Kartika      30
 *       Agrahayana   30
 *       Pausha       30
 *       Magha        30
 *       Phalguna     30
 *   - Leap year rule: Shaka year Y is leap iff Gregorian year
 *     (Y + 78) is Gregorian-leap — i.e., Feb 29 of the Gregorian
 *     year that contains Chaitra 1 of Y is inside year Y − 1, and
 *     the leap day adds to Chaitra of year Y.
 *
 * Sources:
 *   - Gazette of India, 1957 — original notification.
 *   - L. P. Saxena's Positional Astronomy.
 *
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { jdFromRd, rdFromJd, quotient } from "./julian-day.js";
import * as gregorian from "./gregorian.js";

export const ID = "hindu-shaka";
export const DISPLAY_NAME = "Shaka (Indian National)";

/** Offset: Shaka year + 78 = Gregorian year (at Chaitra 1). */
export const YEAR_OFFSET = 78;

export const MONTH_NAMES = [
  null,
  "Chaitra",
  "Vaisakha",
  "Jyeshtha",
  "Ashadha",
  "Shravana",
  "Bhadrapada",
  "Ashvin",
  "Kartika",
  "Agrahayana",
  "Pausha",
  "Magha",
  "Phalguna",
];

/** RD of 1 Chaitra of Shaka year 1 = 22 March 79 CE Gregorian. */
export const EPOCH = gregorian.toRd({ year: 79, month: 3, day: 22 });

/** True iff Shaka year Y is leap (Gregorian (Y+78) is leap). */
export const isLeapYear = year => gregorian.isLeapYear(year + YEAR_OFFSET);

export const daysInMonth = (year, month) => {
  if (month < 1 || month > 12) return 0;
  if (month === 1) return isLeapYear(year) ? 31 : 30;
  if (month <= 6)  return 31;
  return 30;
};

export const daysInYear = year => (isLeapYear(year) ? 366 : 365);

export const validate = ({ year, month, day }) => {
  if (!Number.isInteger(year))  return { valid: false, reason: "year must be an integer" };
  if (!Number.isInteger(month)) return { valid: false, reason: "month must be an integer" };
  if (!Number.isInteger(day))   return { valid: false, reason: "day must be an integer" };
  if (month < 1 || month > 12)  return { valid: false, reason: `month ${month} out of range 1..12` };
  const max = daysInMonth(year, month);
  if (day < 1 || day > max)     return { valid: false, reason: `day ${day} out of range 1..${max} for Shaka ${year}-${month}` };
  return { valid: true };
};

/** Cumulative days up through the end of month m in a common year (m=0 means start). */
const CUM_DAYS_COMMON = [0, 30, 61, 92, 123, 154, 185, 215, 245, 275, 305, 335, 365];
const CUM_DAYS_LEAP   = [0, 31, 62, 93, 124, 155, 186, 216, 246, 276, 306, 336, 366];

/** RD of 1 Chaitra of Shaka year `year`. */
function chaitraStart(year) {
  const gregYear = year + YEAR_OFFSET;
  // Chaitra 1 = Mar 22 normally, Mar 21 if current Gregorian year is leap.
  const day = gregorian.isLeapYear(gregYear) ? 21 : 22;
  return gregorian.toRd({ year: gregYear, month: 3, day });
}

/** RD from Shaka date. */
export const toRd = ({ year, month, day }) => {
  const start = chaitraStart(year);
  const cum = isLeapYear(year) ? CUM_DAYS_LEAP : CUM_DAYS_COMMON;
  return start + cum[month - 1] + day - 1;
};

/** Shaka date from RD. */
export const fromRd = rd => {
  // Pick the Gregorian year of `rd`, try that year's Chaitra start,
  // then adjust if we're before Chaitra 1 (= prior Shaka year).
  const { year: gregYear } = gregorian.fromRd(rd);
  let shakaYear = gregYear - YEAR_OFFSET;
  let start = chaitraStart(shakaYear);
  if (rd < start) {
    shakaYear -= 1;
    start = chaitraStart(shakaYear);
  }
  const dayOfYear = rd - start + 1;  // 1..365 or 1..366
  const cum = isLeapYear(shakaYear) ? CUM_DAYS_LEAP : CUM_DAYS_COMMON;
  let month = 1;
  while (month < 12 && cum[month] < dayOfYear) month++;
  const day = dayOfYear - cum[month - 1];
  return { year: shakaYear, month, day };
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
