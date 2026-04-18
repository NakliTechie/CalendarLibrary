/**
 * hindu-vikram-purnimanta.js — Vikram Samvat (purnimanta variant).
 *
 * The North Indian convention: months run from full moon (Purnima) to
 * full moon rather than new moon to new moon (amanta). This shifts the
 * dark fortnight (Krishna Paksha) of each month to the beginning.
 *
 * Relationship to amanta:
 *   - The bright fortnight (Shukla Paksha) of amanta month M is also
 *     the bright fortnight of purnimanta month M.
 *   - The dark fortnight (Krishna Paksha) of amanta month M belongs to
 *     purnimanta month M+1 (it falls after that month's Purnima).
 *   So a day in what amanta calls "Phalguna dark fortnight" is in
 *   purnimanta "Chaitra dark fortnight" — hence the traditional
 *   description as "month labels shifted by one" for the waning half.
 *
 * Implementation:
 *   fromRd: find the most recent Purnima (full moon at or before rd),
 *   then find the new moon that follows it within this purnimanta month;
 *   that new moon's amanta month label and year determine the purnimanta
 *   month and VS year.
 *
 *   toRd: find the amanta new moon start for the given (year, month),
 *   then back up to the preceding Purnima to get the purnimanta month
 *   start, then add (day - 1).
 *
 * The Ujjain-sunrise day-boundary convention from the amanta module
 * applies here too: the Purnima-start day is the first calendar day
 * whose Ujjain sunrise falls after the astronomical full moon.
 *
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { jdFromRd, rdFromJd } from "./julian-day.js";
import {
  newMoonAtOrAfter, fullMoonBefore, fullMoonAtOrAfter,
} from "./astronomy.js";
import * as hinduVikram from "./hindu-vikram.js";

export const ID = "hindu-vikram-purnimanta";
export const DISPLAY_NAME = "Vikram Samvat (purnimanta)";
export const YEAR_OFFSET = hinduVikram.YEAR_OFFSET;

export const MONTH_NAMES = hinduVikram.MONTH_NAMES;

// Ujjain sunrise convention (matches hindu-vikram.js).
const UJJAIN_SUNRISE_UT = 0.5 / 24; // 00:30 UT ≈ 06:00 IST

/** Calendar day on which a lunar event's following Ujjain sunrise falls. */
const lunarDayStart = tee => Math.ceil(tee - UJJAIN_SUNRISE_UT);

/**
 * Latest full moon whose following Ujjain sunrise is on or before `rd`.
 * Returns the integer calendar day of the purnimanta month start.
 */
const fullMoonOnOrBeforeUjjain = rd => {
  const fm = fullMoonBefore(rd + UJJAIN_SUNRISE_UT);
  return lunarDayStart(fm);
};

/**
 * Earliest full moon whose following Ujjain sunrise is on or after `rd`.
 */
const fullMoonAtOrAfterUjjain = rd => {
  const fm = fullMoonAtOrAfter(rd - 1 + UJJAIN_SUNRISE_UT);
  return lunarDayStart(fm);
};

/**
 * Earliest new moon whose following Ujjain sunrise is on or after `rd`.
 */
const newMoonAtOrAfterUjjain = rd => {
  const moon = newMoonAtOrAfter(rd - 1 + UJJAIN_SUNRISE_UT);
  return lunarDayStart(moon);
};

/**
 * Purnimanta date from RD.
 * Returns { year, month, leap, day }.
 * The month name and VS year are derived from the amanta date of the
 * new moon (Amavasya) that falls within this purnimanta month.
 */
export const fromRd = rd => {
  const purnimaStart = fullMoonOnOrBeforeUjjain(rd);
  const amantaNew = newMoonAtOrAfterUjjain(purnimaStart + 1);
  const { year, month, leap } = hinduVikram.fromRd(amantaNew);
  return { year, month, leap, day: rd - purnimaStart + 1 };
};

/**
 * RD from purnimanta date. The amanta new moon start for (year, month)
 * gives the Amavasya; the preceding full moon is the purnimanta month
 * start; (day - 1) is added to reach the requested day.
 */
export const toRd = ({ year, month, day, leap = false }) => {
  const amantaStart = hinduVikram.toRd({ year, month, day: 1, leap });
  const purnimaStart = fullMoonOnOrBeforeUjjain(amantaStart);
  return purnimaStart + day - 1;
};

/** Number of calendar days in the given purnimanta month. */
export const daysInMonth = (year, month, leap = false) => {
  const amantaStart = hinduVikram.toRd({ year, month, day: 1, leap });
  const purnimaStart = fullMoonOnOrBeforeUjjain(amantaStart);
  return fullMoonAtOrAfterUjjain(purnimaStart + 1) - purnimaStart;
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
