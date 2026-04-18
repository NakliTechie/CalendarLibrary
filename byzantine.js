/**
 * byzantine.js — Byzantine calendar (Anno Mundi, "year of the world").
 *
 * Used by the Eastern Roman Empire and the Eastern Orthodox Church
 * from the mid-10th century through 1700. Counts from a computed
 * creation of the world: 1 September 5509 BCE (Julian). Year starts
 * on 1 September ("indiction"); month and day structure follows the
 * Julian calendar.
 *
 * The creation epoch was fixed by Byzantine chronographers (most
 * prominently in the 7th-century synaxaria and consolidated by
 * later sources). Modern Orthodox liturgical use has largely
 * transitioned to Gregorian, but the Byzantine year is still cited
 * in some ecclesiastical contexts.
 *
 * Conversion rule:
 *   Byzantine year = Julian year + 5509, if Julian month >= 9
 *                  = Julian year + 5508, otherwise
 * Byzantine month/day == Julian month/day.
 *
 * Original algorithms (c) Reingold & Dershowitz (conceptual).
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { jdFromRd, rdFromJd } from "./julian-day.js";
import * as julian from "./julian.js";

/** RD of 1 September 5509 BCE Julian (Byzantine Anno Mundi 1). */
export const EPOCH = julian.toRd({ year: -5508, month: 9, day: 1 });

export const ID = "byzantine";
export const DISPLAY_NAME = "Byzantine";

/** Month names follow Julian conventions. */
export const MONTH_NAMES = julian.MONTH_NAMES;

export const isLeapYear = year => julian.isLeapYear(year - 5508);
export const daysInMonth = (year, month) => julian.daysInMonth(year - 5508, month);
export const daysInYear = year => (isLeapYear(year) ? 366 : 365);

export const validate = ({ year, month, day }) => {
  if (!Number.isInteger(year))  return { valid: false, reason: "year must be an integer" };
  if (!Number.isInteger(month)) return { valid: false, reason: "month must be an integer" };
  if (!Number.isInteger(day))   return { valid: false, reason: "day must be an integer" };
  if (month < 1 || month > 12)  return { valid: false, reason: `month ${month} out of range 1..12` };
  const julianYear = month >= 9 ? year - 5509 : year - 5508;
  return julian.validate({ year: julianYear, month, day });
};

/** RD from Byzantine date. */
export const toRd = ({ year, month, day }) => {
  const julianYear = month >= 9 ? year - 5509 : year - 5508;
  return julian.toRd({ year: julianYear, month, day });
};

/** Byzantine date from RD. */
export const fromRd = rd => {
  const { year: jy, month, day } = julian.fromRd(rd);
  const year = month >= 9 ? jy + 5509 : jy + 5508;
  return { year, month, day };
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
