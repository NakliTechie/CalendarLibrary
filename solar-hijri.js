/**
 * solar-hijri.js — Arithmetic Solar Hijri (Iranian / Afghan) calendar.
 *
 * Two Solar Hijri variants exist:
 *   (1) Astronomical — leap year determined by the vernal equinox
 *       at the Tehran meridian (52.5° E). Needs ephemeris; deferred
 *       to Phase 2c-astro.
 *   (2) Arithmetic — a 2820-year cycle with 683 leap years
 *       distributed via Khayyām-attributed rules. Agrees with the
 *       astronomical variant for the overwhelming majority of
 *       modern dates; diverges only occasionally around equinox.
 *
 * This module ships (2). The astronomical variant, when it lands,
 * will live in `solar-hijri-astronomical.js` and differ only in the
 * leap-year predicate.
 *
 * Epoch: 19 March 622 CE Julian = 1 Farvardin 1 AP.
 *
 * Month lengths: months 1–6 (Farvardin–Shahrivar) have 31 days,
 * months 7–11 (Mehr–Bahman) have 30 days, month 12 (Esfand) has
 * 29 days, 30 in a leap year.
 *
 * Ported from:
 *   E. M. Reingold and N. Dershowitz,
 *   "Calendrical Calculations: The Ultimate Edition" (4th ed., 2018),
 *   §15.2 ("Arithmetic Persian Calendar").
 *
 * Original algorithms (c) Reingold & Dershowitz. See NOTICE.
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { mod, quotient, jdFromRd, rdFromJd } from "./julian-day.js";
import { toRd as julianToRd } from "./julian.js";

/** RD of 1 Farvardin 1 AP = 19 March 622 CE Julian. */
export const EPOCH = julianToRd({ year: 622, month: 3, day: 19 });

export const ID = "solar-hijri";
export const DISPLAY_NAME = "Solar Hijri";

export const MONTH_NAMES = [
  null,
  "Farvardin", "Ordibehesht", "Khordad",
  "Tir", "Mordad", "Shahrivar",
  "Mehr", "Aban", "Azar",
  "Dey", "Bahman", "Esfand",
];

/**
 * Map an SH year in R-D's "historical" convention (no year zero) to
 * a value inside the 474..3293 2820-year cycle window.
 */
const cycleYear = year => {
  const y = year > 0 ? year - 474 : year - 473;
  return 474 + mod(y, 2820);
};

/** Number of days from the 475-AP reference epoch to the start of `year`. */
const cycleDays = year => {
  const y = year > 0 ? year - 474 : year - 473;
  return 1029983 * quotient(y, 2820);
};

/** 2820-year-cycle leap-year rule (R-D §15.2). */
export const isLeapYear = year => {
  const c = cycleYear(year);
  return mod((c + 38) * 682, 2816) < 682;
};

export const daysInMonth = (year, month) => {
  if (month < 1 || month > 12) return 0;
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isLeapYear(year) ? 30 : 29; // Esfand
};

export const daysInYear = year => (isLeapYear(year) ? 366 : 365);

export const validate = ({ year, month, day }) => {
  if (!Number.isInteger(year))  return { valid: false, reason: "year must be an integer" };
  if (!Number.isInteger(month)) return { valid: false, reason: "month must be an integer" };
  if (!Number.isInteger(day))   return { valid: false, reason: "day must be an integer" };
  if (month < 1 || month > 12)  return { valid: false, reason: `month ${month} out of range 1..12` };
  const max = daysInMonth(year, month);
  if (day < 1 || day > max)     return { valid: false, reason: `day ${day} out of range 1..${max} for SH ${year}-${month}` };
  return { valid: true };
};

/** RD from arithmetic Solar Hijri date. R-D §15.2 `fixed-from-arithmetic-persian`. */
export const toRd = ({ year, month, day }) => {
  const c = cycleYear(year);
  const monthOffset = month <= 7
    ? 31 * (month - 1)
    : 30 * (month - 1) + 6;
  return (
    EPOCH - 1
    + cycleDays(year)
    + 365 * (c - 1)
    + quotient(682 * c - 110, 2816)
    + monthOffset
    + day
  );
};

/** Solar Hijri date from RD. R-D §15.2 `arithmetic-persian-from-fixed`. */
export const fromRd = rd => {
  const d0 = rd - toRd({ year: 475, month: 1, day: 1 });
  const n2820 = quotient(d0, 1029983);
  const d1 = mod(d0, 1029983);
  const cycleY = d1 === 1029982
    ? 2820
    : quotient(2816 * d1 + 1031337, 1028522);
  const yearRaw = 2820 * n2820 + cycleY + 474;
  const year = yearRaw > 0 ? yearRaw : yearRaw - 1;
  const start = toRd({ year, month: 1, day: 1 });
  const dayOfYear = rd - start + 1;
  const month = dayOfYear <= 186
    ? Math.ceil(dayOfYear / 31)
    : Math.ceil((dayOfYear - 6) / 30);
  const day = rd - toRd({ year, month, day: 1 }) + 1;
  return { year, month, day };
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
