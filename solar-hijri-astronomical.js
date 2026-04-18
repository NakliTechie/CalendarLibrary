/**
 * solar-hijri-astronomical.js — Astronomical Solar Hijri (Iranian) calendar.
 *
 * The official civil calendar of Iran (Jalali / Shamsi calendar). The
 * year begins at Nowruz, defined as the vernal equinox (solar longitude
 * 0°) at the Tehran meridian. If the equinox falls before true noon at
 * Tehran (local standard time UTC+3:30), that day is Nowruz; if at or
 * after noon, the next day is Nowruz.
 *
 * Month lengths are identical to the arithmetic variant:
 *   Months 1–6  (Farvardin–Shahrivar): 31 days
 *   Months 7–11 (Mehr–Bahman):         30 days
 *   Month  12   (Esfand):              29 days, 30 in a leap year
 * A year is leap iff its next Nowruz is 366 days away.
 *
 * This variant diverges from the arithmetic 2820-year-cycle variant only
 * occasionally — most notably in 1403 AP (March 2024), where the equinox
 * falls after noon in Tehran, shifting Nowruz from March 20 (arithmetic)
 * to March 20 astronomical (actually both agree to March 20 for 1403,
 * but the two diverge in a handful of years near equinox time boundaries).
 *
 * Ported from:
 *   E. M. Reingold and N. Dershowitz,
 *   "Calendrical Calculations: The Ultimate Edition" (4th ed., 2018),
 *   §15.4 ("Astronomical Persian Calendar").
 *
 * Original algorithms (c) Reingold & Dershowitz. See NOTICE.
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { jdFromRd, rdFromJd } from "./julian-day.js";
import { toRd as julianToRd } from "./julian.js";
import * as gregorian from "./gregorian.js";
import { solarLongitudeAfter, standardFromUniversal, TEHRAN } from "./astronomy.js";

export { MONTH_NAMES } from "./solar-hijri.js";

/** RD of 1 Farvardin 1 AP = 19 March 622 CE Julian (same as arithmetic). */
export const EPOCH = julianToRd({ year: 622, month: 3, day: 19 });

export const ID = "solar-hijri-astronomical";
export const DISPLAY_NAME = "Solar Hijri (astronomical)";

/**
 * RD of Nowruz (1 Farvardin) for the given Solar Hijri year. Finds the
 * vernal equinox (solar longitude 0°) on or after mid-March of the
 * corresponding Gregorian year, then applies the Tehran noon rule:
 * if the equinox is before noon (standard), Nowruz is that day;
 * if at or after noon, Nowruz is the next day.
 */
function nawruz(year) {
  const gregYear = year + 621;
  const approx = gregorian.toRd({ year: gregYear, month: 3, day: 15 });
  const equinox = solarLongitudeAfter(0, approx);
  const localTee = standardFromUniversal(equinox, TEHRAN);
  const frac = localTee - Math.floor(localTee);
  return frac < 0.5 ? Math.floor(localTee) : Math.floor(localTee) + 1;
}

export const isLeapYear = year => nawruz(year + 1) - nawruz(year) === 366;

export const daysInMonth = (year, month) => {
  if (month < 1 || month > 12) return 0;
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isLeapYear(year) ? 30 : 29;
};

export const daysInYear = year => (isLeapYear(year) ? 366 : 365);

export const validate = ({ year, month, day }) => {
  if (!Number.isInteger(year))  return { valid: false, reason: "year must be an integer" };
  if (!Number.isInteger(month)) return { valid: false, reason: "month must be an integer" };
  if (!Number.isInteger(day))   return { valid: false, reason: "day must be an integer" };
  if (month < 1 || month > 12)  return { valid: false, reason: `month ${month} out of range 1..12` };
  const max = daysInMonth(year, month);
  if (day < 1 || day > max)
    return { valid: false, reason: `day ${day} out of range 1..${max} for SH astro ${year}-${month}` };
  return { valid: true };
};

/** RD from astronomical Solar Hijri date. */
export const toRd = ({ year, month, day }) => {
  const monthOffset = month <= 6 ? 31 * (month - 1) : 30 * (month - 1) + 6;
  return nawruz(year) + monthOffset + day - 1;
};

/** Solar Hijri astronomical date from RD. */
export const fromRd = rd => {
  let year = Math.floor((rd - EPOCH) / 365.25) + 1;
  while (nawruz(year + 1) <= rd) year++;
  while (nawruz(year) > rd) year--;
  const dayOfYear = rd - nawruz(year) + 1;
  const month = dayOfYear <= 186
    ? Math.ceil(dayOfYear / 31)
    : Math.ceil((dayOfYear - 6) / 30);
  const day = rd - toRd({ year, month, day: 1 }) + 1;
  return { year, month, day };
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
