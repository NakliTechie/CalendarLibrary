/**
 * hindu-vikram.js — Vikram Samvat (Hindu lunisolar, amanta).
 *
 * A lunisolar calendar used across North and Central India, Nepal,
 * and by Indian diaspora communities. Year numbering runs from the
 * legendary Vikramaditya epoch of 57 BCE. This module implements
 * the **amanta** (new-moon-to-new-moon) variant — common in
 * Maharashtra, Gujarat, Karnataka, and used by most modern Indian
 * calendar software. The North Indian **purnimanta** variant
 * (full-moon-to-full-moon, month labels shifted by one) is not yet
 * supported here.
 *
 * Rules:
 *   - A lunar month runs from new moon to new moon at Ujjain local
 *     time (≈ UTC+5:30, IST).
 *   - Month name = the sidereal zodiac sign of the Sun at the
 *     starting new moon:
 *         Pisces (Meena) → Chaitra (1) — new year
 *         Aries         → Vaisakha (2)
 *         Taurus        → Jyaishtha (3)   … etc.
 *   - If two consecutive new moons fall with the Sun in the same
 *     sidereal sign, the first is **adhika** (leap / intercalary)
 *     and the second is **nija** (regular).
 *   - Year rolls over at Chaitra Shukla Pratipada (new moon starting
 *     Chaitra, non-leap). Vikram Samvat year = Gregorian year + 57
 *     for most of the year after that new moon.
 *
 * Sidereal longitude is computed from tropical solar longitude
 * minus the Lahiri ayanamsha (the precession offset that the
 * Government of India adopted for civil calendar work in 1955).
 *
 * Ported and adapted from:
 *   E. M. Reingold and N. Dershowitz,
 *   "Calendrical Calculations: The Ultimate Edition" (4th ed., 2018),
 *   chapter 20.
 *
 * Original algorithms (c) Reingold & Dershowitz. See NOTICE.
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { mod, amod, jdFromRd, rdFromJd } from "./julian-day.js";
import * as gregorian from "./gregorian.js";
import {
  solarLongitude, newMoonBefore, newMoonAtOrAfter, mod360,
} from "./astronomy.js";

export const ID = "hindu-vikram";
export const DISPLAY_NAME = "Vikram Samvat";

/** Year offset: VS year = Gregorian year + 57 (after Chaitra start). */
export const YEAR_OFFSET = 57;

/** Ujjain, the classical reference meridian for Indian astronomy. */
const UJJAIN_ZONE = 5 / 24 + 30 / 1440; // UTC+5:30

/**
 * Hindu civil day-boundary convention: days run from sunrise to sunrise,
 * not midnight to midnight. A new lunar month starts on the first
 * calendar day whose Ujjain SUNRISE falls after the astronomical
 * new moon. Sunrise at Ujjain ≈ 06:00 IST = 00:30 UT year-round
 * (varies ±30 min seasonally — that variation is smaller than a
 * single tithi, so the approximation is good at day precision).
 */
const UJJAIN_SUNRISE_UT = 0.5 / 24; // 00:30 UT ≈ 06:00 IST

/**
 * Lahiri ayanamsha (adopted as India's civil reference by the Saha
 * committee and the Government of India in 1955). Approximated as a
 * linear function of Gregorian year. The true rate is ~50.2875"/yr
 * with a tiny curvature; linear is accurate to better than 0.1° across
 * the historical period, enough for day-level calendar computations.
 */
export function ayanamsha(tee) {
  const year = gregorian.fromRd(Math.floor(tee)).year;
  // Lahiri ayanamsha at 1900 = 22°27'37" = 22.461°; rate ≈ 50.3"/yr.
  return 22.461 + (year - 1900) * (50.3 / 3600);
}

/** Sidereal solar longitude at a UT moment, in [0, 360). */
export function siderealSolarLongitude(tee) {
  return mod360(solarLongitude(tee) - ayanamsha(tee));
}

/** Sidereal zodiac sign (0..11, 0 = Aries/Meṣa, 11 = Pisces/Meena). */
function siderealSign(longitude) {
  return Math.floor(mod360(longitude) / 30);
}

/** Sidereal-sign → lunar-month number (Chaitra = 1). */
function signToMonth(sign) {
  // Pisces (sign 11) = Chaitra (month 1)
  // Aries (0)        = Vaisakha (2)
  // ...
  // Aquarius (10)    = Phalguna (12)
  return amod(sign + 2, 12);
}

export const MONTH_NAMES = [
  null,
  "Chaitra", "Vaisakha", "Jyaishtha", "Ashadha",
  "Shravana", "Bhadrapada", "Ashvina", "Kartika",
  "Margashirsha", "Pausha", "Magha", "Phalguna",
];

// ---- New moons with Hindu sunrise-boundary rule --------------------------

const fromUjjain = tee => tee - UJJAIN_ZONE;

/**
 * The calendar day on which the next Ujjain sunrise follows a given
 * UT moment. Day D begins at its sunrise (≈ D + 0.5/24 UT), so the
 * first day whose sunrise is at or after `tee` is ceil(tee - 0.5/24).
 * This is the "day 1" of a new lunar month whose astronomical new
 * moon occurred at `tee`.
 */
const lunarMonthStartDay = tee => Math.ceil(tee - UJJAIN_SUNRISE_UT);

function newMoonOnOrBeforeUjjain(rd) {
  // Latest new moon whose next Ujjain sunrise is on or before day `rd`.
  // Equivalent: latest new moon at UT < rd + UJJAIN_SUNRISE_UT.
  const moon = newMoonBefore(rd + UJJAIN_SUNRISE_UT);
  return lunarMonthStartDay(moon);
}

function newMoonOnOrAfterUjjain(rd) {
  // Earliest new moon whose next sunrise is on or after day `rd`.
  // Equivalent: earliest new moon at UT >= rd - 1 + UJJAIN_SUNRISE_UT.
  const moon = newMoonAtOrAfter(rd - 1 + UJJAIN_SUNRISE_UT);
  return lunarMonthStartDay(moon);
}

/**
 * Lunar-month number (1..12) for the month starting at the given
 * Ujjain new-moon day. Derived from the sidereal sign of the Sun
 * at the new-moon moment.
 */
function monthLabelFor(newMoonDay) {
  // Solar longitude at (roughly) the new-moon moment: we use noon of
  // the day BEFORE this lunar-month-start day, which sits near the
  // astronomical new moon (always within ±1 day). Zodiac sign
  // boundaries are 30° apart and the Sun moves ≈1°/day, so this
  // approximation is safely inside the ±30-day width of a sign.
  const tee = (newMoonDay - 1) + 0.5 - UJJAIN_ZONE;
  const sign = siderealSign(siderealSolarLongitude(tee));
  return signToMonth(sign);
}

/**
 * Is the lunar month starting at `newMoonDay` a leap (adhika / extra)
 * month? A month is leap iff the next new moon falls in the same
 * sidereal sign (so two consecutive months share the same name, the
 * first being adhika and the second nija).
 */
function isLeapMonthStartingAt(newMoonDay) {
  const next = newMoonOnOrAfterUjjain(newMoonDay + 1);
  return monthLabelFor(newMoonDay) === monthLabelFor(next);
}

/** RD of Chaitra 1 (first non-leap Chaitra) on or before a given RD. */
function chaitraOnOrBefore(rd) {
  let m = newMoonOnOrBeforeUjjain(rd + 1);
  for (let i = 0; i < 14; i++) {
    if (monthLabelFor(m) === 1 && !isLeapMonthStartingAt(m)) return m;
    m = newMoonOnOrBeforeUjjain(m - 1);
  }
  return m;
}

/**
 * VS date from RD.
 * Returns { year, month, leap, day }.
 */
export const fromRd = rd => {
  const m = newMoonOnOrBeforeUjjain(rd + 1);
  const month = monthLabelFor(m);
  const leap = isLeapMonthStartingAt(m);
  const day = rd - m + 1;
  const chaitra = chaitraOnOrBefore(rd);
  const gregYearAtChaitra = gregorian.fromRd(chaitra).year;
  const year = gregYearAtChaitra + YEAR_OFFSET;
  return { year, month, leap, day };
};

/** RD from VS date. Walks forward from the target year's Chaitra 1. */
export const toRd = ({ year, month, day, leap = false }) => {
  const gregYear = year - YEAR_OFFSET;
  // Chaitra always falls between mid-March and mid-April; pick April 1
  // of that Gregorian year as a search anchor.
  const anchor = gregorian.toRd({ year: gregYear, month: 4, day: 1 });
  const chaitra = chaitraOnOrBefore(anchor + 30);
  // Walk forward new-moon by new-moon; a leap month keeps the same
  // label as the following non-leap month, so the user's (month, leap)
  // combination uniquely identifies one lunation.
  let m = chaitra;
  for (let i = 0; i < 14; i++) {
    const label = monthLabelFor(m);
    const isLeap = isLeapMonthStartingAt(m);
    if (label === month && isLeap === leap) return m + day - 1;
    m = newMoonOnOrAfterUjjain(m + 1);
  }
  throw new Error(`VS ${year}-${month}${leap ? "L" : ""}-${day} not locatable`);
};

export const validate = ({ year, month, day, leap = false }) => {
  if (!Number.isInteger(year))  return { valid: false, reason: "year must be integer" };
  if (!Number.isInteger(month)) return { valid: false, reason: "month must be integer" };
  if (!Number.isInteger(day))   return { valid: false, reason: "day must be integer" };
  if (month < 1 || month > 12)  return { valid: false, reason: `month ${month} out of range 1..12` };
  if (day < 1 || day > 30)      return { valid: false, reason: `day ${day} out of range 1..30` };
  return { valid: true };
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
