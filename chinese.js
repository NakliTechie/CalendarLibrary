/**
 * chinese.js — Chinese lunisolar calendar (Purple Mountain Observatory rules).
 *
 * Rules:
 *   - Months start on the day containing the astronomical new moon
 *     at Beijing.
 *   - Each of the 12 major solar terms (zhōngqì), at solar longitudes
 *     330°, 0°, 30°, … 300° (每月一氣), defines a nominal month:
 *         330° -> M1 (Yǔshuǐ)   150° -> M7 (Chǔshǔ)
 *         0°   -> M2 (Chūnfēn) 180° -> M8 (Qiūfēn)
 *         30°  -> M3 (Gǔyǔ)    210° -> M9 (Shuāngjiàng)
 *         60°  -> M4 (Xiǎomǎn) 240° -> M10 (Xiǎoxuě)
 *         90°  -> M5 (Xiàzhì)  270° -> M11 (Dōngzhì, winter solstice)
 *         120° -> M6 (Dàshǔ)   300° -> M12 (Dàhán)
 *   - A lunar month is labelled by the zhōngqì it contains. If a
 *     month contains no zhōngqì it is a leap month, sharing the
 *     preceding month's label.
 *   - Chinese New Year = the new moon that starts the month containing
 *     the 330° zhōngqì (Yǔshuǐ).
 *   - Year number is counted from the legendary reign of Huangdi
 *     (2637 BCE Gregorian proleptic). The sexagenary cycle position
 *     is also surfaced in fromRd() output.
 *
 * This is the zhōngqì-based convention used by Purple Mountain
 * Observatory for the official Chinese calendar. It handles edge
 * cases (solstice-coinciding-new-moon, e.g. 2022-23) that break the
 * simpler leap-count rule from R-D §19.
 *
 * Historical zone shift: before 1929, Beijing local mean solar time
 * (UT + 116.4°/360 ≈ UT + 7h45m40s) was used. From 1929 onwards,
 * UTC+8 (China Standard Time). R-D §19.4.
 *
 * Adapted from:
 *   E. M. Reingold and N. Dershowitz,
 *   "Calendrical Calculations: The Ultimate Edition" (4th ed., 2018),
 *   chapter 19, with month labelling changed to the zhōngqì rule.
 *
 * Original algorithms (c) Reingold & Dershowitz. See NOTICE.
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { mod, amod, jdFromRd, rdFromJd } from "./julian-day.js";
import * as gregorian from "./gregorian.js";
import {
  newMoonBefore, newMoonAtOrAfter, solarLongitudeAfter, mod360,
  universalFromStandard,
} from "./astronomy.js";

/** RD of 15 Feb 2637 BCE Gregorian (astro year -2636) = Chinese epoch. */
export const EPOCH = gregorian.toRd({ year: -2636, month: 2, day: 15 });

export const ID = "chinese";
export const DISPLAY_NAME = "Chinese";

export const STEM_NAMES = [
  "Jiǎ", "Yǐ", "Bǐng", "Dīng", "Wù",
  "Jǐ", "Gēng", "Xīn", "Rén", "Guǐ",
];

export const BRANCH_NAMES = [
  "Zǐ (Rat)", "Chǒu (Ox)", "Yín (Tiger)", "Mǎo (Rabbit)",
  "Chén (Dragon)", "Sì (Snake)", "Wǔ (Horse)", "Wèi (Goat)",
  "Shēn (Monkey)", "Yǒu (Rooster)", "Xū (Dog)", "Hài (Pig)",
];

/** Beijing-local-time offset from UT, fraction of a day. */
function chineseZone(tee) {
  const year = gregorian.fromRd(Math.floor(tee)).year;
  return year < 1929 ? 1397 / 4320 : 1 / 3;
}
const toChinaStd = tee => tee + chineseZone(tee);
const fromChinaStd = tee => tee - chineseZone(tee);

/** New moon day (Beijing) on or before the given Beijing day. */
function chineseNewMoonOnOrBefore(rd) {
  const moon = newMoonBefore(fromChinaStd(rd + 1));
  return Math.floor(toChinaStd(moon));
}
/** New moon day (Beijing) on or after the given Beijing day. */
function chineseNewMoonOnOrAfter(rd) {
  const moon = newMoonAtOrAfter(fromChinaStd(rd));
  return Math.floor(toChinaStd(moon));
}

/**
 * Zhōngqì → month-number table. The index in ZHONGQI_LONGITUDES is
 * the month label (1..12) minus 1.
 */
const ZHONGQI_LONGITUDES = [330, 0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300];

/**
 * Return the month label (1..12) of the lunar month starting at
 * `newMoonDay` (a Beijing day), or 0 if the month contains no
 * zhōngqì (in which case it is a leap month).
 */
function monthLabelFor(newMoonDay) {
  const nextNm = chineseNewMoonOnOrAfter(newMoonDay + 1);
  for (let i = 0; i < 12; i++) {
    const lon = ZHONGQI_LONGITUDES[i];
    // Find the zhōngqì crossing at or after the month start (Beijing).
    const crossUt = solarLongitudeAfter(lon, fromChinaStd(newMoonDay));
    const crossDay = Math.floor(toChinaStd(crossUt));
    if (crossDay >= newMoonDay && crossDay < nextNm) {
      return i + 1;
    }
  }
  return 0;
}

/**
 * Chinese date from RD.
 * Returns { year, month, leap, day, sexagenaryYear, stem, branch }.
 */
export const fromRd = rd => {
  const m = chineseNewMoonOnOrBefore(rd + 1);
  const label = monthLabelFor(m);
  let month, leap;
  if (label === 0) {
    const prev = chineseNewMoonOnOrBefore(m - 1);
    month = monthLabelFor(prev);
    leap = true;
  } else {
    month = label;
    leap = false;
  }
  const day = rd - m + 1;

  // Year: the new-year cutover is CNY (M1 day 1). Walk back from this
  // month's start to find it. The year increments at CNY.
  const cny = findCnyOnOrBefore(m);
  // Approximate year number from Huangdi epoch: count average years.
  const year = Math.round((cny - EPOCH) / 365.2425) + 1;
  const sexagenary = amod(year, 60);
  return {
    year, month, leap, day,
    sexagenaryYear: sexagenary,
    stem: amod(sexagenary, 10),
    branch: amod(sexagenary, 12),
  };
};

/**
 * Walk back from `aroundMonthStart` to find the Chinese New Year
 * (M1 day 1) on or before it. Returns the Beijing day of CNY.
 */
function findCnyOnOrBefore(aroundMonthStart) {
  // Walk back at most 14 months to find an M1 (non-leap) month.
  let m = aroundMonthStart;
  for (let i = 0; i < 14; i++) {
    const label = monthLabelFor(m);
    if (label === 1) return m;  // M1 found (always non-leap since M1 contains 330° zhongqi)
    m = chineseNewMoonOnOrBefore(m - 1);
  }
  // Fallback shouldn't happen in practice.
  return m;
}

/**
 * RD from Chinese date. Walk forward from the year's CNY.
 */
export const toRd = ({ year, month, day, leap = false }) => {
  const cny = cnyOfYear(year);
  // Walk forward new moon by new moon, tracking the "effective" month label.
  // A leap month inherits its predecessor's label.
  let m = cny;
  let effective = 1;
  for (let i = 0; i < 14; i++) {
    const label = monthLabelFor(m);
    const isLeap = (label === 0);
    effective = isLeap ? effective : label;
    if (effective === month && isLeap === leap) return m + day - 1;
    m = chineseNewMoonOnOrAfter(m + 1);
  }
  throw new Error(`Chinese date ${year}-${month}${leap ? "L" : ""}-${day} not locatable`);
};

/** RD of Chinese New Year (M1 day 1) of the given Chinese year. */
function cnyOfYear(year) {
  // Pick a day guaranteed to be within the target year — roughly the
  // middle of the Gregorian year that contains the Chinese year start.
  // EPOCH + (year - 1) * 365.2425 ≈ mid-Feb of year's start; +150 days
  // lands safely past CNY (which is Jan 22..Feb 21) and inside the year.
  const midYear = EPOCH + Math.floor((year - 1) * 365.2425) + 150;
  let m = chineseNewMoonOnOrBefore(midYear);
  for (let i = 0; i < 14; i++) {
    if (monthLabelFor(m) === 1) return m;
    m = chineseNewMoonOnOrBefore(m - 1);
  }
  throw new Error(`Could not locate CNY for Chinese year ${year}`);
}

export const validate = ({ year, month, day, leap = false }) => {
  if (!Number.isInteger(year))  return { valid: false, reason: "year must be an integer" };
  if (!Number.isInteger(month)) return { valid: false, reason: "month must be an integer" };
  if (!Number.isInteger(day))   return { valid: false, reason: "day must be an integer" };
  if (month < 1 || month > 12)  return { valid: false, reason: `month ${month} out of range 1..12` };
  if (day < 1 || day > 30)      return { valid: false, reason: `day ${day} out of range 1..30` };
  return { valid: true };
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
