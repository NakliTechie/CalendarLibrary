/**
 * babylonian.js — Seleucid-era Babylonian calendar (arithmetic Metonic).
 *
 * A dead lunisolar calendar. Used in the Neo-Babylonian and Seleucid
 * empires (late first millennium BCE through early first millennium CE).
 * Hebrew and Iranian calendars inherited its 19-year Metonic intercalation.
 *
 * This module ships a simplified arithmetic reconstruction — 19-year
 * Metonic cycle with intercalary Addaru II inserted in years 1, 4, 7,
 * 9, 12, 15, 18 of each cycle (the standard Neo-Babylonian pattern).
 * A faithful astronomical port, accounting for the observational basis
 * of later Seleucid-period Babylonian observers and the occasional
 * Ulūlu II intercalation, would require the full Hindu-style lunisolar
 * machinery and remains deferred.
 *
 * Year count follows the **Seleucid era**, the best-documented
 * numbering: Seleucid year 1 Nisānu 1 = 3 April 311 BCE Julian.
 *
 * Sources:
 *   - John P. Britton, "Treatments of Annual Phenomena in Cuneiform
 *     Sources", in Steele & Imhausen (eds), Under One Sky, 2002.
 *   - Otto Neugebauer, The Exact Sciences in Antiquity, 1969.
 *   - Parker & Dubberstein, Babylonian Chronology 626 B.C. — A.D. 75,
 *     Brown University Press, 1956 (the canonical Seleucid-era table).
 *
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { mod, quotient, jdFromRd, rdFromJd } from "./julian-day.js";
import { toRd as julianToRd } from "./julian.js";

/** RD of Seleucid 1 Nisānu 1 = 3 April 311 BCE Julian (astro year -310). */
export const EPOCH = julianToRd({ year: -310, month: 4, day: 3 });

export const ID = "babylonian";
export const DISPLAY_NAME = "Babylonian (Seleucid)";

/** Month names (transliterated Akkadian). Month 13 = intercalary Addaru II. */
export const MONTH_NAMES = [
  null,
  "Nisānu", "Ayyāru", "Simānu", "Du'ūzu",
  "Abu", "Ulūlu", "Tashrītu", "Araḫsamna",
  "Kislīmu", "Ṭebētu", "Šabāṭu", "Addaru",
  "Addaru II",
];

/**
 * Leap-year positions within each 19-year Metonic cycle (1-indexed):
 * years 1, 4, 7, 9, 12, 15, 18 receive an intercalary Addaru II.
 * Standard Neo-Babylonian pattern per Parker & Dubberstein.
 */
const LEAP_CYCLE_POSITIONS = [1, 4, 7, 9, 12, 15, 18];
const LEAP_INDEX_SET = new Set(LEAP_CYCLE_POSITIONS.map(p => p - 1));

export const isLeapYear = year => {
  const pos = mod(year - 1, 19);
  return LEAP_INDEX_SET.has(pos);
};

export const lastMonthOfYear = year => (isLeapYear(year) ? 13 : 12);

/**
 * Month lengths: alternating 30/29 starting with Nisānu = 30. Months
 * 1, 3, 5, 7, 9, 11 have 30 days; 2, 4, 6, 8, 10, 12 have 29 days.
 * Intercalary Addaru II (month 13 in leap years) has 30 days.
 */
export const daysInMonth = (year, month) => {
  if (month < 1 || month > lastMonthOfYear(year)) return 0;
  if (month === 13) return 30; // Addaru II in leap year
  return month % 2 === 1 ? 30 : 29;
};

export const daysInYear = year => (isLeapYear(year) ? 384 : 354);

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
    return { valid: false, reason: `day ${day} out of range 1..${max} for Babylonian ${year}-${month}` };
  }
  return { valid: true };
};

/** Days from start of year (Nisānu 1) to start of month. */
function daysBeforeMonth(year, month) {
  let total = 0;
  for (let m = 1; m < month; m++) total += daysInMonth(year, m);
  return total;
}

/**
 * Days from start of Seleucid era (year 1 Nisānu 1) to start of year.
 * Accumulates full-year lengths across Metonic cycles.
 */
function daysBeforeYear(year) {
  const completedCycles = quotient(year - 1, 19);
  const inCycle = mod(year - 1, 19);   // 0..18
  // Days per 19-year Metonic cycle:
  //   12 common years × 354 + 7 leap years × 384 = 4248 + 2688 = 6936? Check:
  //   Actually 12 × 354 = 4248, 7 × 384 = 2688, total 6936. ✓
  const cycleLength = 6936;
  let total = completedCycles * cycleLength;
  for (let i = 0; i < inCycle; i++) {
    total += LEAP_INDEX_SET.has(i) ? 384 : 354;
  }
  return total;
}

export const toRd = ({ year, month, day }) =>
  EPOCH + daysBeforeYear(year) + daysBeforeMonth(year, month) + day - 1;

export const fromRd = rd => {
  const days = rd - EPOCH;
  // Estimate year via average year length (~365.25 days).
  let year = 1 + Math.floor(days / 365.25);
  // Adjust up or down until daysBeforeYear(year) <= days < daysBeforeYear(year+1).
  while (daysBeforeYear(year + 1) <= days) year++;
  while (daysBeforeYear(year) > days) year--;
  const dayOfYear = days - daysBeforeYear(year) + 1; // 1..354/384
  let month = 1;
  let remaining = dayOfYear;
  while (month <= lastMonthOfYear(year) && remaining > daysInMonth(year, month)) {
    remaining -= daysInMonth(year, month);
    month++;
  }
  return { year, month, day: remaining };
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
