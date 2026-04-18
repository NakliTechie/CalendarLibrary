/**
 * japanese.js — Japanese nengō (era) calendar overlay on Gregorian.
 *
 * Since Japan's adoption of the Gregorian calendar on 1 January 1873,
 * civil dates have combined an imperial-era name (nengō) with an era
 * year, preserving Gregorian month and day. Era transitions happen
 * on the accession of a new emperor. The era year resets to 1 at
 * every transition and then advances with the Gregorian year.
 *
 * Coverage: all officially recognised eras from Taika (645 CE) to the
 * present Reiwa era, including both Southern and Northern Court eras
 * of the Nanboku-chō period (1331–1392, annotated with `court`).
 *
 * Sources:
 *   - Imperial Household Agency (kunaicho.go.jp).
 *   - Japanese Cabinet Office era-name proclamations (Reiwa: 2019-04-01).
 *   - data/nengo.js for pre-Meiji era table and date sources.
 *
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { jdFromRd, rdFromJd } from "./julian-day.js";
import * as gregorian from "./gregorian.js";
import { PRE_MEIJI_ERAS } from "./data/nengo.js";

export const ID = "japanese";
export const DISPLAY_NAME = "Japanese (nengō)";

/** Five modern eras (Meiji → Reiwa), with startRd computed at load. */
export const ERAS = [
  {
    id: "meiji",  nameJa: "明治", nameRomaji: "Meiji",
    start: { year: 1868, month: 10, day: 23 },
  },
  {
    id: "taisho", nameJa: "大正", nameRomaji: "Taishō",
    start: { year: 1912, month: 7,  day: 30 },
  },
  {
    id: "showa",  nameJa: "昭和", nameRomaji: "Shōwa",
    start: { year: 1926, month: 12, day: 25 },
  },
  {
    id: "heisei", nameJa: "平成", nameRomaji: "Heisei",
    start: { year: 1989, month: 1,  day: 8  },
  },
  {
    id: "reiwa",  nameJa: "令和", nameRomaji: "Reiwa",
    start: { year: 2019, month: 5,  day: 1  },
  },
].map(era => ({ ...era, startRd: gregorian.toRd(era.start) }));

/** All eras in chronological order (Taika 645 CE → present). */
export const ALL_ERAS = [
  ...PRE_MEIJI_ERAS.map(era => ({ ...era, startRd: gregorian.toRd(era.start) })),
  ...ERAS,
];

const eraById = Object.fromEntries(ALL_ERAS.map(e => [e.id, e]));

/** Era in effect at a given RD; null before Taika (645 CE). */
const eraAtRd = rd => {
  let found = null;
  for (const era of ALL_ERAS) {
    if (rd >= era.startRd) found = era;
    else break;
  }
  return found;
};

export const validate = ({ era, year, month, day }) => {
  const e = eraById[era];
  if (!e) return { valid: false, reason: `unknown nengō era: ${era}` };
  if (!Number.isInteger(year) || year < 1) return { valid: false, reason: "era year must be >= 1" };
  const gregYear = e.start.year + year - 1;
  const g = gregorian.validate({ year: gregYear, month, day });
  if (!g.valid) return g;
  const rd = gregorian.toRd({ year: gregYear, month, day });
  if (rd < e.startRd) return { valid: false, reason: `date precedes era ${e.nameRomaji} start` };
  const idx = ALL_ERAS.indexOf(e);
  if (idx + 1 < ALL_ERAS.length && rd >= ALL_ERAS[idx + 1].startRd) {
    return { valid: false, reason: `date is after era ${e.nameRomaji} ended` };
  }
  return { valid: true };
};

/** RD from { era, year, month, day }. */
export const toRd = ({ era, year, month, day }) => {
  const e = eraById[era];
  if (!e) throw new Error(`unknown nengō era: ${era}`);
  const gregYear = e.start.year + year - 1;
  return gregorian.toRd({ year: gregYear, month, day });
};

/** { era, year, month, day[, court] } from RD, or null before Taika. */
export const fromRd = rd => {
  const e = eraAtRd(rd);
  if (!e) return null;
  const { year: gy, month, day } = gregorian.fromRd(rd);
  const year = gy - e.start.year + 1;
  const result = { era: e.id, eraNameJa: e.nameJa, eraNameRomaji: e.nameRomaji, year, month, day };
  if (e.court) result.court = e.court;
  return result;
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));

/** Format like "令和6年4月18日" or "Reiwa 6-4-18". */
export const format = ({ era, year, month, day }, { romaji = false } = {}) => {
  const e = eraById[era];
  if (!e) return null;
  if (romaji) return `${e.nameRomaji} ${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  return `${e.nameJa}${year}年${month}月${day}日`;
};
