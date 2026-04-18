/**
 * myanmar.js — Myanmar (Burmese) lunisolar calendar.
 *
 * The Myanmar calendar is a lunisolar system derived from the Surya Siddhanta
 * (Hindu astronomical tradition). Years are numbered from the Myanmar Era (ME)
 * epoch of 638 CE. A regular year has 12 lunar months (354 days); intercalary
 * years (watat) insert "First Waso" before the standard Waso month, making
 * 13 months (384–385 days).
 *
 * Year types:
 *   myt 0 = common (354 days)
 *   myt 1 = little watat (384 days, intercalary First Waso)
 *   myt 2 = big watat    (385 days, intercalary First Waso + extra Nayon day)
 *
 * Months (1–12):
 *   1 Tagu, 2 Kason, 3 Nayon, 4 Waso (+ 4i First Waso in watat years),
 *   5 Wagaung, 6 Tawthalin, 7 Thadingyut, 8 Tazaungmon, 9 Nadaw,
 *   10 Pyatho, 11 Tabodwe, 12 Tabaung.
 *
 * Public date shape: { year, month, day[, intercalary] }
 *   intercalary: true  → First Waso (always month: 4, watat years only)
 *   intercalary: false → regular month
 *
 * Algorithm:
 *   Makaranta / Thandeikta / post-Independence era constants from:
 *   Yan Naing Aung, "Myanmar Calendar JavaScript", MIT License.
 *   https://github.com/yan9a/mmcal
 *
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { jdFromRd, rdFromJd } from "./julian-day.js";

export const ID = "myanmar";
export const DISPLAY_NAME = "Myanmar";

// ── Month names ───────────────────────────────────────────────────────────

export const MONTH_NAMES = [
  null,
  "Tagu", "Kason", "Nayon", "Waso", "Wagaung",
  "Tawthalin", "Thadingyut", "Tazaungmon", "Nadaw",
  "Pyatho", "Tabodwe", "Tabaung",
];

// ── Surya-Siddhanta astronomical constants ────────────────────────────────

const SY = 1577917828 / 4320000;   // solar year: 365.2587565 days
const LM = 1577917828 / 53433336;  // lunar month: 29.53058795 days
const MO = 1954168.050623;          // Myanmar Era epoch (Julian Date, MMT)

// ── Era-specific calendar constants ──────────────────────────────────────
// EI: era identifier (used to select computation method)
// WO: full-moon day offset
// NM: number of months for excess-day calculation
// fme: full-moon-day exception adjustments [[year, delta], ...]
// wte: watat (intercalary) exception years (flip the watat flag)

const ERAS = [
  { minYear: 1312, EI: 3,   WO: -0.5,  NM:  8,
    fme: [[1377, 1]],
    wte: [1344, 1345] },
  { minYear: 1217, EI: 2,   WO: -1,    NM:  4,
    fme: [[1234, 1], [1261, -1]],
    wte: [1263, 1264] },
  { minYear: 1100, EI: 1.3, WO: -0.85, NM: -1,
    fme: [[1120, 1], [1126, -1], [1150, 1], [1172, -1], [1207, 1]],
    wte: [1201, 1202] },
  { minYear: 798,  EI: 1.2, WO: -1.1,  NM: -1,
    fme: [[813,-1],[849,-1],[851,-1],[854,-1],[927,-1],[933,-1],[936,-1],
          [938,-1],[949,-1],[952,-1],[963,-1],[968,-1],[1039,-1]],
    wte: [] },
  { minYear: 0,    EI: 1.1, WO: -1.1,  NM: -1,
    fme: [[205,1],[246,1],[471,1],[572,-1],[651,1],[653,2],[656,1],
          [672,1],[729,1],[767,-1]],
    wte: [] },
];

const eraConst = my => ERAS.find(e => my >= e.minYear);

// Sorted 2-column [[key,val]] binary search; returns val or 0.
const fmeSearch = (k, A) => {
  let l = 0, u = A.length - 1;
  while (u >= l) {
    const i = (l + u) >> 1;
    if (A[i][0] > k) u = i - 1; else if (A[i][0] < k) l = i + 1; else return A[i][1];
  }
  return 0;
};

// Sorted 1-column [key] binary search; returns 1 if found, 0 otherwise.
const wteSearch = (k, A) => {
  let l = 0, u = A.length - 1;
  while (u >= l) {
    const i = (l + u) >> 1;
    if (A[i] > k) u = i - 1; else if (A[i] < k) l = i + 1; else return 1;
  }
  return 0;
};

// ── cal_watat: intercalary-month check for Myanmar year my ───────────────
// Returns { fm: integer JDN of 2nd Waso full moon, watat: 0|1 }
const cal_watat = my => {
  const c = eraConst(my);
  const TA = (SY / 12 - LM) * (12 - c.NM);
  let ed = ((SY * (my + 3739)) % LM + LM) % LM;
  if (ed < TA) ed += LM;
  const wo = c.WO + fmeSearch(my, c.fme);
  const fm = Math.round(SY * my + MO - ed + 4.5 * LM + wo);
  let watat;
  if (c.EI >= 2) {
    const TW = LM - (SY / 12 - LM) * c.NM;
    watat = ed >= TW ? 1 : 0;
  } else {
    watat = (my * 7 + 2) % 19;
    if (watat < 0) watat += 19;
    watat = Math.floor(watat / 12);
  }
  watat ^= wteSearch(my, c.wte);
  return { fm, watat };
};

// ── cal_my: year structure ────────────────────────────────────────────────
// Returns { myt: 0|1|2, tg1: JDN of Tagu 1, fm: JDN of Waso FM, werr: 0|1 }
const cal_my = my => {
  let yd = 0, y1, nd, werr = 0, fm;
  const y2 = cal_watat(my);
  let myt = y2.watat;
  do { yd++; y1 = cal_watat(my - yd); } while (y1.watat === 0 && yd < 3);
  if (myt) {
    nd = (y2.fm - y1.fm) % 354;
    myt = Math.floor(nd / 31) + 1;
    fm = y2.fm;
    if (nd !== 30 && nd !== 31) werr = 1;
  } else {
    fm = y1.fm + 354 * yd;
  }
  const tg1 = y1.fm + 354 * yd - 102;
  return { myt, tg1, fm, werr };
};

// ── j2m: Julian Day Number → raw Myanmar date ────────────────────────────
// mm: 0=First Waso, 1–12=Tagu–Tabaung, 13=Late Tagu, 14=Late Kason
const j2m = jdn => {
  jdn = Math.round(jdn);
  let my = Math.floor((jdn - 0.5 - MO) / SY);
  let yo = cal_my(my);
  let dd = jdn - yo.tg1 + 1;
  if (dd < 1) { my--; yo = cal_my(my); dd = jdn - yo.tg1 + 1; }
  const b = Math.floor(yo.myt / 2), c = Math.floor(1 / (yo.myt + 1));
  const myl = 354 + (1 - c) * 30 + b;
  const mmt = Math.floor((dd - 1) / myl);
  dd -= mmt * myl;
  const a = Math.floor((dd + 423) / 512);
  let mm = Math.floor((dd - b * a + c * a * 30 + 29.26) / 29.544);
  const e = Math.floor((mm + 12) / 16), f = Math.floor((mm + 11) / 16);
  const md = dd - Math.floor(29.544 * mm - 29.26) - b * e + c * f * 30;
  mm += f * 3 - e * 4 + 12 * mmt;
  return { myt: yo.myt, my, mm, md };
};

// ── m2j: raw Myanmar date → Julian Day Number ────────────────────────────
const m2j = (my, mm, md) => {
  const yo = cal_my(my);
  const mmt = Math.floor(mm / 13);
  let mm_ = mm % 13 + mmt;
  const b = Math.floor(yo.myt / 2), c = 1 - Math.floor((yo.myt + 1) / 2);
  mm_ += 4 - Math.floor((mm_ + 15) / 16) * 4 + Math.floor((mm_ + 12) / 16);
  let dd = md + Math.floor(29.544 * mm_ - 29.26)
    - c * Math.floor((mm_ + 11) / 16) * 30
    + b * Math.floor((mm_ + 12) / 16);
  dd += mmt * (354 + (1 - c) * 30 + b);
  return dd + yo.tg1 - 1;
};

// ── RD ↔ JDN ──────────────────────────────────────────────────────────────
// Integer JDN (noon-based) for RD n (midnight-based): jdn = n + 1721425.
const JDN_OFFSET = 1721425;

// ── Public API ────────────────────────────────────────────────────────────

export const validate = ({ year, month, day, intercalary = false }) => {
  if (!Number.isInteger(year) || year < 0)
    return { valid: false, reason: "Myanmar year must be a non-negative integer" };
  if (!Number.isInteger(month) || month < 1 || month > 12)
    return { valid: false, reason: `month ${month} out of range 1..12` };
  if (!Number.isInteger(day) || day < 1)
    return { valid: false, reason: "day must be a positive integer" };
  const yo = cal_my(year);
  if (intercalary) {
    if (month !== 4) return { valid: false, reason: "intercalary=true is only valid for month 4 (Waso)" };
    if (yo.myt === 0) return { valid: false, reason: `Myanmar year ${year} is not a watat year` };
    if (day > 30)     return { valid: false, reason: "First Waso has at most 30 days" };
  } else {
    const mml = 30 - month % 2 + (month === 3 ? Math.floor(yo.myt / 2) : 0);
    if (day > mml) return { valid: false, reason: `day ${day} out of range for ${MONTH_NAMES[month]}` };
  }
  return { valid: true };
};

/** Convert { year, month, day, intercalary? } to RD. */
export const toRd = ({ year, month, day, intercalary = false }) => {
  const mm = (intercalary && month === 4) ? 0 : month;
  return m2j(year, mm, day) - JDN_OFFSET;
};

/** Convert RD to { year, month, day, intercalary, yearType }. */
export const fromRd = rd => {
  const { myt: mytRaw, my: myRaw, mm, md } = j2m(rd + JDN_OFFSET);
  let month, intercalary = false, year = myRaw, myt = mytRaw;
  if (mm === 0)       { month = 4; intercalary = true; }
  else if (mm <= 12)  { month = mm; }
  else                { year++; month = mm - 12; myt = cal_my(year).myt; }
  return { year, month, day: md, intercalary, yearType: myt };
};

export const toJd  = date => jdFromRd(toRd(date));
export const fromJd = jd  => fromRd(Math.floor(rdFromJd(jd) + 0.5));

/** Format a Myanmar date as "ME 1386 Tagu 1" or "ME 1385 First Waso 15". */
export const format = ({ year, month, day, intercalary = false }) => {
  const mname = intercalary ? "First Waso" : (MONTH_NAMES[month] ?? `Month ${month}`);
  return `ME ${year} ${mname} ${day}`;
};
