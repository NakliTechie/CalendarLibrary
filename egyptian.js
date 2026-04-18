/**
 * egyptian.js — ancient Egyptian / Nabonassar "Sothic" calendar.
 *
 * 365 days exactly, no leap year: 12 months of 30 days + 5 epagomenal
 * days at year-end. Because it drifts against the seasons by ~1 day
 * every 4 years, a full cycle ("Sothic cycle") is ~1460 years.
 *
 * Epoch used here is the Nabonassar Era: 26 February 747 BCE (Julian),
 * the reference adopted by Ptolemy for his astronomical tables and the
 * conventional start of "Egyptian Year 1" in calendrical tables. This
 * is the same calendar whose drifting front ring appears on the
 * Antikythera Mechanism.
 *
 * Ported from:
 *   E. M. Reingold and N. Dershowitz,
 *   "Calendrical Calculations: The Ultimate Edition" (4th ed., 2018),
 *   §1.11.
 *
 * Original algorithms (c) Reingold & Dershowitz. See NOTICE.
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { quotient, mod, jdFromRd, rdFromJd } from "./julian-day.js";
import { toRd as julianToRd } from "./julian.js";

/** RD of Egyptian 0001-01-01 (Thoth 1 of Nabonassar Era). */
export const EPOCH = julianToRd({ year: -746, month: 2, day: 26 });

export const ID = "egyptian";
export const DISPLAY_NAME = "Egyptian (Sothic)";

/** Month names (Greek transliteration; Coptic names also widely used). */
export const MONTH_NAMES = [
  null,
  "Thoth", "Phaophi", "Athyr", "Choiak", "Tybi", "Mechir",
  "Phamenoth", "Pharmuthi", "Pachon", "Payni", "Epiphi", "Mesori",
  "epagomenal",
];

/** Never leap. */
export const isLeapYear = () => false;

export const daysInMonth = (_year, month) => {
  if (month < 1 || month > 13) return 0;
  return month === 13 ? 5 : 30;
};

export const daysInYear = () => 365;

export const validate = ({ year, month, day }) => {
  if (!Number.isInteger(year))  return { valid: false, reason: "year must be an integer" };
  if (!Number.isInteger(month)) return { valid: false, reason: "month must be an integer" };
  if (!Number.isInteger(day))   return { valid: false, reason: "day must be an integer" };
  if (month < 1 || month > 13)  return { valid: false, reason: `month ${month} out of range 1..13` };
  const max = daysInMonth(year, month);
  if (day < 1 || day > max)     return { valid: false, reason: `day ${day} out of range 1..${max} for Egyptian month ${month}` };
  return { valid: true };
};

/** RD from Egyptian date. R-D §1.11 `fixed-from-egyptian`. */
export const toRd = ({ year, month, day }) =>
  EPOCH + 365 * (year - 1) + 30 * (month - 1) + day - 1;

/** Egyptian date from RD. R-D §1.11 `egyptian-from-fixed`. */
export const fromRd = rd => {
  const days = rd - EPOCH;
  const year = 1 + quotient(days, 365);
  const month = 1 + quotient(mod(days, 365), 30);
  const day = days - 365 * (year - 1) - 30 * (month - 1) + 1;
  return { year, month, day };
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
