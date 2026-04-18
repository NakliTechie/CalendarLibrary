/**
 * nanakshahi.js — Nanakshahi calendar.
 *
 * The Sikh solar calendar adopted by the Shiromani Gurdwara Parbandhak
 * Committee (SGPC) and Sri Akal Takht Sahib in 2003 CE (NS year 535).
 * Counts years from the birth of Guru Nanak Dev Ji in 1469 CE.
 *
 * Structure:
 *   Month 1  Chet      — 31 days  (14 March – 13 April)
 *   Month 2  Vaisakh   — 31 days  (14 April – 14 May)
 *   Month 3  Jeth      — 31 days  (15 May   – 14 June)
 *   Month 4  Harh      — 31 days  (15 June  – 15 July)
 *   Month 5  Sawan     — 31 days  (16 July  – 15 August)
 *   Month 6  Bhadon    — 30 days  (16 Aug   – 14 September)
 *   Month 7  Assu      — 30 days  (15 Sept  – 14 October)
 *   Month 8  Katik     — 30 days  (15 Oct   – 13 November)
 *   Month 9  Maghar    — 30 days  (14 Nov   – 13 December)
 *   Month 10 Poh       — 30 days  (14 Dec   – 12 January)
 *   Month 11 Magh      — 30 days  (13 Jan   – 11 February)
 *   Month 12 Phagun    — 30 days  (12 Feb   – 13 March, non-leap)
 *                        31 days  (12 Feb   – 13 March, leap year)
 *
 * Chet 1 of NS year N always falls on 14 March of Gregorian year
 * (N + 1468). Months 1–5 have fixed lengths of 31 days; months 6–11
 * have 30 days; month 12 (Phagun) gains a day in leap years, where a
 * leap year is one in which the corresponding Gregorian year (N + 1469,
 * which contains Phagun) is a Gregorian leap year.
 *
 * Implementation note: the start dates for months 1–12 are fixed
 * relative to Chet 1 and encoded in MONTH_OFFSETS. Because the Gregorian
 * leap day (29 Feb) falls in Phagun, MONTH_OFFSETS never changes — only
 * the length of Phagun varies. No ephemeris is required.
 *
 * Reference:
 *   SGPC Nanakshahi Calendar specification (2003) and the clean-room
 *   algorithmic description in the nanakshahi-js project README
 *   (github.com/Sarabveer/nanakshahi-js, MPL-2.0). This port is an
 *   independent clean-room implementation; no source code was copied.
 *
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { jdFromRd, rdFromJd } from "./julian-day.js";
import * as gregorian from "./gregorian.js";

/** RD of 1 Chet NS 1 = 14 March 1469 CE Gregorian. */
export const EPOCH = gregorian.toRd({ year: 1469, month: 3, day: 14 });

export const ID = "nanakshahi";
export const DISPLAY_NAME = "Nanakshahi";

export const MONTH_NAMES = [
  null,
  "Chet", "Vaisakh", "Jeth", "Harh", "Sawan",
  "Bhadon", "Assu", "Katik", "Maghar", "Poh",
  "Magh", "Phagun",
];

/**
 * Cumulative day-offsets from Chet 1 to the first day of each month.
 * Index 0 = Chet (offset 0), index 11 = Phagun (offset 335).
 * These are fixed for all years; only Phagun's length varies with leap.
 */
const MONTH_OFFSETS = [0, 31, 62, 93, 124, 155, 185, 215, 245, 275, 305, 335];

/**
 * Nanakshahi year N is a leap year iff Gregorian year (N + 1469) is a
 * Gregorian leap year. Phagun (the last month) spans February of that
 * Gregorian year, so it gains one day when February has 29 days.
 */
export const isLeapYear = year => {
  const g = year + 1469;
  return (g % 4 === 0 && g % 100 !== 0) || g % 400 === 0;
};

export const daysInMonth = (year, month) => {
  if (month < 1 || month > 12) return 0;
  if (month <= 5)  return 31;
  if (month <= 11) return 30;
  return isLeapYear(year) ? 31 : 30;
};

export const daysInYear = year => (isLeapYear(year) ? 366 : 365);

export const validate = ({ year, month, day }) => {
  if (!Number.isInteger(year))  return { valid: false, reason: "year must be an integer" };
  if (!Number.isInteger(month)) return { valid: false, reason: "month must be an integer" };
  if (!Number.isInteger(day))   return { valid: false, reason: "day must be an integer" };
  if (month < 1 || month > 12)  return { valid: false, reason: `month ${month} out of range 1..12` };
  const max = daysInMonth(year, month);
  if (day < 1 || day > max)
    return { valid: false, reason: `day ${day} out of range 1..${max} for NS ${year}-${month}` };
  return { valid: true };
};

/** RD of Chet 1 of NS year `year` (always 14 March of Gregorian year + 1468). */
const chet1 = year => gregorian.toRd({ year: year + 1468, month: 3, day: 14 });

/** RD from Nanakshahi date. */
export const toRd = ({ year, month, day }) =>
  chet1(year) + MONTH_OFFSETS[month - 1] + day - 1;

/** Nanakshahi date from RD. */
export const fromRd = rd => {
  const { year: gYear } = gregorian.fromRd(rd);
  let year = gYear - 1468;
  // If rd is before Chet 1 of this Gregorian year, the NS year is one less.
  if (rd < chet1(year)) year--;
  const yearStart = chet1(year);
  const priorDays = rd - yearStart;
  let month = 12;
  for (let m = 1; m <= 11; m++) {
    if (priorDays < MONTH_OFFSETS[m]) { month = m; break; }
  }
  const day = priorDays - MONTH_OFFSETS[month - 1] + 1;
  return { year, month, day };
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
