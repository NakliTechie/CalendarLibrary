/**
 * islamic-umm-al-qura.js — Saudi Arabia's official Islamic (Hijri) calendar.
 *
 * Unlike the arithmetic tabular Hijri (islamic-arithmetic.js), Umm al-Qura
 * is **observational**: each month starts on the day determined by Saudi
 * astronomical rules (lunar-sighting criteria at Mecca), tabulated and
 * published by the Institute of Astronomy at King Abdulaziz City for
 * Science and Technology (KACST). For Mechanikon we use a precomputed
 * lookup table covering AH 1356 Muharram 1 (14 March 1937 Gregorian) —
 * when Saudi Arabia first adopted UQ officially — through AH ~1500
 * Dhul-Hijja (late 2070s).
 *
 * Outside that range we fall back to the arithmetic Hijri calendar
 * (`islamic-arithmetic.js`); the caller's historical-mode UI surfaces
 * this as a flag.
 *
 * Data source:
 *   - https://github.com/dalwadani/hijri-converter (MIT, © 2018
 *     Dhaifallah Alwadani), itself derived from the published
 *     Umm al-Qura calendar at https://www.ummulqura.org.sa.
 *   See `data/umm-al-qura.js` for the full attribution.
 *
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { jdFromRd, rdFromJd } from "./julian-day.js";
import * as islamicArithmetic from "./islamic-arithmetic.js";
import {
  MONTH_STARTS_MJDN, TABLE_INDEX_OFFSET, MJDN_TO_RD_OFFSET,
} from "./data/umm-al-qura.js";

export const ID = "islamic-umm-al-qura";
export const DISPLAY_NAME = "Islamic (Umm al-Qura)";
export const MONTH_NAMES = islamicArithmetic.MONTH_NAMES;

/** First and last Hijri years covered by the lookup table. */
const FIRST_COVERED_YEAR = 1356;
const LAST_COVERED_YEAR =
  Math.floor((TABLE_INDEX_OFFSET + MONTH_STARTS_MJDN.length - 1) / 12) + 1 - 1;

/** RD of 1 Muharram AH `year`, from the lookup table. Null if out of range. */
function monthStartRd(year, month) {
  const idx = (year - 1) * 12 + (month - 1) - TABLE_INDEX_OFFSET;
  if (idx < 0 || idx >= MONTH_STARTS_MJDN.length) return null;
  return MONTH_STARTS_MJDN[idx] + MJDN_TO_RD_OFFSET;
}

/**
 * Is the year within the Umm al-Qura table? If false, callers fall
 * back to the arithmetic Hijri calendar and the UI flags the date.
 */
export const isInTable = year =>
  year >= FIRST_COVERED_YEAR && year <= LAST_COVERED_YEAR;

/**
 * Leap-year rule: Umm al-Qura doesn't have a simple algorithmic leap
 * rule — year length depends on which months are 29 vs 30 days per
 * the table. We derive it from table data.
 */
export const isLeapYear = year => daysInYear(year) === 355;

export const daysInMonth = (year, month) => {
  const start = monthStartRd(year, month);
  const nextStart = month < 12
    ? monthStartRd(year, month + 1)
    : monthStartRd(year + 1, 1);
  if (start === null || nextStart === null) {
    return islamicArithmetic.daysInMonth(year, month);
  }
  return nextStart - start;
};

export const daysInYear = year => {
  const start = monthStartRd(year, 1);
  const nextStart = monthStartRd(year + 1, 1);
  if (start === null || nextStart === null) {
    return islamicArithmetic.daysInYear(year);
  }
  return nextStart - start;
};

export const validate = ({ year, month, day }) => {
  if (!Number.isInteger(year))  return { valid: false, reason: "year must be an integer" };
  if (!Number.isInteger(month)) return { valid: false, reason: "month must be an integer" };
  if (!Number.isInteger(day))   return { valid: false, reason: "day must be an integer" };
  if (month < 1 || month > 12)  return { valid: false, reason: `month ${month} out of range 1..12` };
  const max = daysInMonth(year, month);
  if (day < 1 || day > max)     return { valid: false, reason: `day ${day} out of range 1..${max} for UQ ${year}-${month}` };
  return { valid: true };
};

/** RD from Umm al-Qura date; falls back to arithmetic Hijri outside the table. */
export const toRd = ({ year, month, day }) => {
  const start = monthStartRd(year, month);
  if (start === null) return islamicArithmetic.toRd({ year, month, day });
  return start + day - 1;
};

/** Umm al-Qura date from RD; falls back to arithmetic Hijri outside the table. */
export const fromRd = rd => {
  const firstRd = monthStartRd(FIRST_COVERED_YEAR, 1);
  const lastStartRd = MONTH_STARTS_MJDN[MONTH_STARTS_MJDN.length - 1]
                    + MJDN_TO_RD_OFFSET;
  if (rd < firstRd || rd > lastStartRd + 30) {
    return islamicArithmetic.fromRd(rd);
  }
  // Binary-search the month-starts array for the month containing rd.
  let lo = 0, hi = MONTH_STARTS_MJDN.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if ((MONTH_STARTS_MJDN[mid] + MJDN_TO_RD_OFFSET) <= rd) lo = mid;
    else hi = mid - 1;
  }
  const idx = lo;
  const start = MONTH_STARTS_MJDN[idx] + MJDN_TO_RD_OFFSET;
  const totalMonth = idx + TABLE_INDEX_OFFSET;
  const year = Math.floor(totalMonth / 12) + 1;
  const month = (totalMonth % 12) + 1;
  const day = rd - start + 1;
  return { year, month, day };
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
