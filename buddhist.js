/**
 * buddhist.js — Buddhist Era (Thai solar variant).
 *
 * The variant shipped here is the Thai solar Buddhist calendar used
 * for civil purposes in Thailand (and unofficially in several other
 * Theravada countries): Gregorian month and day, with a year offset
 * of +543 by the reckoning that the Buddha's parinirvana occurred
 * in 543 BCE (astronomical year -542).
 *
 * Theravada lunisolar variants (Sri Lankan, Cambodian, historic
 * Siamese) require the astronomy primitives in astronomy.js plus
 * regional rules for intercalation; those are out of scope for this
 * v1 module and would ship as, e.g., `buddhist-lunisolar.js`.
 *
 * Sources:
 *   - Thai Royal Decree 1912 (B.E. 2455) defining the Thai solar era.
 *   - Reingold & Dershowitz, Calendrical Calculations (4th ed.), §20
 *     (context on Theravada variants).
 *
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { jdFromRd, rdFromJd } from "./julian-day.js";
import * as gregorian from "./gregorian.js";

export const ID = "buddhist";
export const DISPLAY_NAME = "Buddhist (Thai solar)";

/** Year offset: BE year = Gregorian year + 543. */
export const YEAR_OFFSET = 543;

export const MONTH_NAMES = [
  null,
  "Makarakhom", "Kumphaphan", "Minakhom", "Mesayon",
  "Phruetsaphakhom", "Mithunayon", "Karakadakhom", "Singhakhom",
  "Kanyayon", "Tulakhom", "Phruetsachikayon", "Thanwakhom",
];

export const isLeapYear = year => gregorian.isLeapYear(year - YEAR_OFFSET);
export const daysInMonth = (year, month) =>
  gregorian.daysInMonth(year - YEAR_OFFSET, month);
export const daysInYear = year => gregorian.daysInYear(year - YEAR_OFFSET);

export const validate = ({ year, month, day }) => {
  if (!Number.isInteger(year))  return { valid: false, reason: "year must be an integer" };
  if (!Number.isInteger(month)) return { valid: false, reason: "month must be an integer" };
  if (!Number.isInteger(day))   return { valid: false, reason: "day must be an integer" };
  if (month < 1 || month > 12)  return { valid: false, reason: `month ${month} out of range 1..12` };
  const max = daysInMonth(year, month);
  if (day < 1 || day > max)     return { valid: false, reason: `day ${day} out of range 1..${max} for Buddhist ${year}-${month}` };
  return { valid: true };
};

export const toRd = ({ year, month, day }) =>
  gregorian.toRd({ year: year - YEAR_OFFSET, month, day });

export const fromRd = rd => {
  const { year, month, day } = gregorian.fromRd(rd);
  return { year: year + YEAR_OFFSET, month, day };
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
