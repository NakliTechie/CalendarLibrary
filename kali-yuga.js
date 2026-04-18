/**
 * kali-yuga.js — Hindu cosmological year count (Kali Yuga era).
 *
 * The Kali Yuga is the fourth and current age (yuga) in Hindu
 * cyclic cosmology. Classical Hindu astronomy places its start on
 * the astronomical moment of midnight of 17/18 February 3102 BCE
 * (Julian, Ujjain meridian); most references round this to Julian
 * 18 February 3102 BCE, which is what we use.
 *
 * This module provides the year count only — a Kali Yuga "year" is
 * essentially a Julian-year offset. Day / month structure at the
 * Hindu calendrical level is lunisolar and astronomical; see
 * hindu.js (Phase 2d) for those. Kali Yuga *year* = Julian year +
 * 3102, with the year changing on 18 February Julian.
 *
 * Current usage: mainly ceremonial / cosmological reference, not
 * civil date-keeping. Mechanikon includes it to illustrate the
 * scale of Hindu deep-time reckoning (Kali Yuga runs 432,000 years
 * and is itself part of a 4,320,000-year Mahā-yuga).
 *
 * Sources:
 *   - Surya Siddhanta (traditional)
 *   - Reingold & Dershowitz §20 (Hindu calendars context)
 *
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { jdFromRd, rdFromJd } from "./julian-day.js";
import * as julian from "./julian.js";

/** RD of 18 February 3102 BCE Julian = Kali Yuga year 1 day 1. */
export const EPOCH = julian.toRd({ year: -3101, month: 2, day: 18 });

export const ID = "kali-yuga";
export const DISPLAY_NAME = "Kali Yuga";

/**
 * Year transition: Julian 18 February. Before that date in the Julian
 * year, Kali Yuga year is one less than after.
 */
const YEAR_START_MONTH = 2;
const YEAR_START_DAY = 18;

/**
 * True if the Julian date (jy, jm, jd) is on or after 18 February.
 */
const onOrAfterTransition = (jm, jd) =>
  jm > YEAR_START_MONTH || (jm === YEAR_START_MONTH && jd >= YEAR_START_DAY);

export const validate = ({ year }) => {
  if (!Number.isInteger(year)) return { valid: false, reason: "year must be an integer" };
  if (year < 1) return { valid: false, reason: "Kali Yuga years begin at 1 (3102 BCE)" };
  return { valid: true };
};

/**
 * RD of the start of the given Kali Yuga year (18 February Julian).
 * KY year 1 begins 18 February -3101 Julian (astronomical), so
 * Julian year of KY year N's start = N - 3102.
 */
export const toRd = ({ year }) =>
  julian.toRd({ year: year - 3102, month: YEAR_START_MONTH, day: YEAR_START_DAY });

/**
 * Kali Yuga year from RD.
 */
export const fromRd = rd => {
  const { year: jy, month, day } = julian.fromRd(rd);
  const year = onOrAfterTransition(month, day) ? jy + 3102 : jy + 3101;
  return { year };
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
