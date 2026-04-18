/**
 * maya.js — Maya calendrical systems: Long Count, Haab, Tzolk'in.
 *
 * Three interlocking calendars used by the pre-Columbian Maya and
 * still used today in parts of highland Guatemala:
 *
 *   Long Count  5-tier day count (baktun.katun.tun.uinal.kin)
 *   Haab        365-day civil year (18 months of 20 + 5 Wayeb)
 *   Tzolk'in    260-day ritual count (13 numbers × 20 day-names)
 *
 * Uses the **GMT correlation constant 584283**, the scholarly
 * consensus. Alternate correlations (Thompson's 584285, Spinden's
 * 489384) exist but are minority positions; we note this in the
 * teaching layer.
 *
 * Ported from:
 *   E. M. Reingold and N. Dershowitz,
 *   "Calendrical Calculations: The Ultimate Edition" (4th ed., 2018),
 *   chapter 11.
 *
 * Original algorithms (c) Reingold & Dershowitz. See NOTICE.
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { mod, amod, quotient, jdFromRd, rdFromJd } from "./julian-day.js";

/** GMT correlation: JDN 584283 = Long Count 0.0.0.0.0 (noon-anchored). */
export const GMT_CORRELATION = 584283;

/** RD of Long Count 0.0.0.0.0 (start of the day that contains JD 584283). */
export const EPOCH = Math.floor(GMT_CORRELATION - 1721424.5); // -1137142

/** Haab epoch: 0 Pop of the Haab year in which day 0.0.0.0.0 falls.
 *  Day 0.0.0.0.0 was 8 Kumk'u (month 18, day 8), i.e. 348 days into
 *  the Haab year, so the preceding 0 Pop was 348 days earlier. */
export const HAAB_EPOCH = EPOCH - 348;

/** Tzolk'in epoch: position such that day 0.0.0.0.0 is "4 Ahau". */
export const TZOLKIN_EPOCH = EPOCH - 160;

// ---- Long Count ----------------------------------------------------------

export const longCount = {
  ID: "maya-long-count",
  DISPLAY_NAME: "Maya Long Count",
};

/** RD from a Long Count tuple. */
longCount.toRd = ({ baktun, katun, tun, uinal, kin }) =>
  EPOCH + baktun * 144000 + katun * 7200 + tun * 360 + uinal * 20 + kin;

/** Long Count tuple from RD. */
longCount.fromRd = rd => {
  const d = rd - EPOCH;
  const baktun = quotient(d, 144000); let r = mod(d, 144000);
  const katun  = quotient(r, 7200);   r = mod(r, 7200);
  const tun    = quotient(r, 360);    r = mod(r, 360);
  const uinal  = quotient(r, 20);     const kin = mod(r, 20);
  return { baktun, katun, tun, uinal, kin };
};

longCount.validate = ({ baktun, katun, tun, uinal, kin }) => {
  for (const [name, v, min, max] of [
    ["baktun", baktun, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    ["katun",  katun,  0, 19],
    ["tun",    tun,    0, 19],
    ["uinal",  uinal,  0, 17],
    ["kin",    kin,    0, 19],
  ]) {
    if (!Number.isInteger(v)) return { valid: false, reason: `${name} must be integer` };
    if (v < min || v > max)  return { valid: false, reason: `${name} out of range` };
  }
  return { valid: true };
};

longCount.toJd = date => jdFromRd(longCount.toRd(date));
longCount.fromJd = jd => longCount.fromRd(Math.floor(rdFromJd(jd) + 0.5));

/** Long Count stringified "baktun.katun.tun.uinal.kin". */
longCount.format = ({ baktun, katun, tun, uinal, kin }) =>
  `${baktun}.${katun}.${tun}.${uinal}.${kin}`;

// ---- Haab ----------------------------------------------------------------

export const haab = {
  ID: "maya-haab",
  DISPLAY_NAME: "Maya Haab",
};

haab.MONTH_NAMES = [
  "Pop", "Wo'", "Sip", "Sotz'", "Sek", "Xul",
  "Yaxk'in", "Mol", "Ch'en", "Yax", "Sak'", "Keh",
  "Mak", "K'ank'in", "Muwan'", "Pax", "K'ayab", "Kumk'u",
  "Wayeb",
];

/**
 * Haab day from RD. Returns { month: 1..19, day: 0..19 }.
 * Month 19 is Wayeb (the 5 unlucky days at year-end), with day 0..4.
 * Day 0 is the traditional "seating" day.
 */
haab.fromRd = rd => {
  const dayOfYear = mod(rd - HAAB_EPOCH, 365); // 0..364
  const month = quotient(dayOfYear, 20) + 1;    // 1..19
  const day = mod(dayOfYear, 20);               // 0..19 or 0..4 for Wayeb
  return { month, day };
};

/**
 * The Haab is cyclic: there is no unique RD for a given (month, day).
 * `toRd` therefore throws — use `nearestOnOrAfter` to find a specific
 * occurrence. `fromJd` is supported for lookup.
 */
haab.toRd = () => {
  throw new Error("maya-haab is cyclic; use haab.nearestOnOrAfter(rd, date) instead");
};
haab.fromJd = jd => haab.fromRd(Math.floor(rdFromJd(jd) + 0.5));

/** Haab is cyclic — no unique RD for a (month, day) pair. */
haab.nearestOnOrAfter = (rd, { month, day }) => {
  const target = (month - 1) * 20 + day;
  const current = mod(rd - HAAB_EPOCH, 365);
  return rd + mod(target - current, 365);
};

haab.validate = ({ month, day }) => {
  if (!Number.isInteger(month) || month < 1 || month > 19)
    return { valid: false, reason: "month must be 1..19" };
  if (!Number.isInteger(day))  return { valid: false, reason: "day must be integer" };
  if (month === 19) {
    if (day < 0 || day > 4) return { valid: false, reason: "Wayeb day must be 0..4" };
  } else {
    if (day < 0 || day > 19) return { valid: false, reason: "day must be 0..19" };
  }
  return { valid: true };
};

// ---- Tzolk'in ------------------------------------------------------------

export const tzolkin = {
  ID: "maya-tzolkin",
  DISPLAY_NAME: "Maya Tzolk'in",
};

tzolkin.DAY_NAMES = [
  "Imix", "Ik'", "Ak'bal", "K'an", "Chikchan", "Kimi", "Manik'",
  "Lamat", "Muluk", "Ok", "Chuwen", "Eb", "Ben",
  "Ix", "Men", "Kib", "Kaban", "Etz'nab", "Kawak", "Ajaw",
];

/**
 * Tzolk'in name + number from RD.
 *   number: 1..13
 *   name:   1..20 (Imix = 1, Ajaw = 20)
 */
tzolkin.fromRd = rd => {
  const offset = rd - TZOLKIN_EPOCH;
  const number = amod(offset, 13);
  const nameIndex = amod(offset, 20);
  return { number, nameIndex, name: tzolkin.DAY_NAMES[nameIndex - 1] };
};

/**
 * Since the Tzolk'in is a 260-day cycle, there is no unique RD for a
 * given (number, name) pair. `nearestOnOrAfter` returns the first
 * matching RD on or after the anchor.
 */
tzolkin.nearestOnOrAfter = (rd, { number, nameIndex }) => {
  // Find an offset in 0..259 matching both (amod 13 = number) and (amod 20 = name).
  // By CRT: there is exactly one such offset per 260-day cycle.
  // Naive search is fine for <=260 iterations.
  const current = rd - TZOLKIN_EPOCH;
  for (let i = 0; i < 260; i++) {
    const d = current + i;
    if (amod(d, 13) === number && amod(d, 20) === nameIndex) return rd + i;
  }
  return null;
};

tzolkin.validate = ({ number, nameIndex }) => {
  if (!Number.isInteger(number) || number < 1 || number > 13)
    return { valid: false, reason: "number must be 1..13" };
  if (!Number.isInteger(nameIndex) || nameIndex < 1 || nameIndex > 20)
    return { valid: false, reason: "name index must be 1..20" };
  return { valid: true };
};

/**
 * The Tzolk'in is cyclic: there is no unique RD for a given
 * (number, nameIndex). `toRd` throws — use `nearestOnOrAfter` to
 * locate a specific occurrence. `fromJd` is supported for lookup.
 */
tzolkin.toRd = () => {
  throw new Error("maya-tzolkin is cyclic; use tzolkin.nearestOnOrAfter(rd, date) instead");
};
tzolkin.fromJd = jd => tzolkin.fromRd(Math.floor(rdFromJd(jd) + 0.5));

/** Format a Tzolk'in day like "4 Ajaw". */
tzolkin.format = ({ number, name, nameIndex }) =>
  `${number} ${name || tzolkin.DAY_NAMES[nameIndex - 1]}`;

// ---- Calendar Round ------------------------------------------------------

/**
 * Full Calendar Round: the combination (Long Count OR RD) expressed
 * as Haab + Tzolk'in + (optionally) Long Count.
 */
export const calendarRound = rd => ({
  longCount: longCount.fromRd(rd),
  haab: haab.fromRd(rd),
  tzolkin: tzolkin.fromRd(rd),
});
