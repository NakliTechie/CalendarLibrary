/**
 * tests/arithmetic.js — every calendar whose conversion is purely
 * arithmetic (no astronomy primitives needed).
 */

import { eq, deepEq, assert } from "./_harness.js";
import * as gregorian from "../gregorian.js";
import * as julian from "../julian.js";
import * as coptic from "../coptic.js";
import * as ethiopian from "../ethiopian.js";
import * as egyptian from "../egyptian.js";
import * as islamicArithmetic from "../islamic-arithmetic.js";
import * as frenchRepublican from "../french-republican.js";
import * as byzantine from "../byzantine.js";
import * as kaliYuga from "../kali-yuga.js";
import * as discordian from "../discordian.js";
import * as maya from "../maya.js";
import * as japanese from "../japanese.js";
import * as hebrew from "../hebrew.js";
import * as buddhist from "../buddhist.js";
import * as solarHijri from "../solar-hijri.js";
import * as hinduShaka from "../hindu-shaka.js";
import * as babylonian from "../babylonian.js";
import * as nanakshahi from "../nanakshahi.js";
import * as myanmar from "../myanmar.js";

// ---- Coptic -------------------------------------------------------------

eq(coptic.toRd({ year: 1741, month: 1, day: 1 }),
   gregorian.toRd({ year: 2024, month: 9, day: 11 }),
   "Coptic 1741-01-01 = Greg 2024-09-11");
deepEq(coptic.fromRd(gregorian.toRd({ year: 2024, month: 9, day: 11 })),
   { year: 1741, month: 1, day: 1 },
   "Greg 2024-09-11 -> Coptic 1741-01-01");
eq(coptic.toRd({ year: 1, month: 1, day: 1 }), 103605, "Coptic epoch RD = 103605");
eq(coptic.isLeapYear(3), true, "Coptic year 3 leap");
eq(coptic.isLeapYear(1739), true, "Coptic year 1739 leap (mod 4 = 3)");
eq(coptic.daysInMonth(3, 13), 6, "Coptic leap year month 13 has 6 days");
eq(coptic.daysInMonth(2, 13), 5, "Coptic non-leap month 13 has 5 days");
for (const rd of [1, 100000, 500000, 730120, 103605, 200000, 900000]) {
  const c = coptic.fromRd(rd);
  eq(coptic.toRd(c), rd, `Coptic roundtrip RD ${rd}`);
}

// ---- Ethiopian ----------------------------------------------------------

eq(ethiopian.toRd({ year: 2017, month: 1, day: 1 }),
   gregorian.toRd({ year: 2024, month: 9, day: 11 }),
   "Ethiopian 2017-01-01 = Greg 2024-09-11");
for (const rd of [700000, 730120, 750000]) {
  const c = coptic.fromRd(rd);
  const e = ethiopian.fromRd(rd);
  eq(e.year, c.year + 276, `Ethiopian year = Coptic year + 276 at RD ${rd}`);
  eq(e.month, c.month, `Ethiopian month == Coptic month at RD ${rd}`);
  eq(e.day, c.day,   `Ethiopian day   == Coptic day   at RD ${rd}`);
}

// ---- Egyptian (Sothic) --------------------------------------------------

eq(egyptian.toRd({ year: 1, month: 1, day: 1 }), -272787,
   "Egyptian epoch RD = -272787");
eq(egyptian.toRd({ year: 2, month: 1, day: 1 })
   - egyptian.toRd({ year: 1, month: 1, day: 1 }), 365,
   "Egyptian year length 365 (no leap)");
for (const rd of [-272787, 0, 700000, -100000]) {
  deepEq(egyptian.toRd(egyptian.fromRd(rd)), rd,
         `Egyptian roundtrip preserves RD ${rd}`);
}
eq(egyptian.daysInMonth(1, 13), 5, "Egyptian month 13 has 5 days");

// ---- Islamic arithmetic (tabular) ---------------------------------------

eq(islamicArithmetic.toRd({ year: 1, month: 1, day: 1 }), 227015,
   "Islamic epoch RD = 227015");
deepEq(islamicArithmetic.fromRd(gregorian.toRd({ year: 2024, month: 1, day: 1 })),
   { year: 1445, month: 6, day: 19 },
   "Greg 2024-01-01 -> Islamic 1445-06-19");
let leapCount = 0;
for (let y = 1; y <= 30; y++) if (islamicArithmetic.isLeapYear(y)) leapCount++;
eq(leapCount, 11, "Islamic: 11 leap years per 30-year cycle");
for (const y of [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29]) {
  eq(islamicArithmetic.isLeapYear(y), true, `Islamic year ${y} is leap`);
}
for (const y of [1, 3, 4, 6, 8, 9, 11, 12, 14, 15, 17, 19, 20, 22, 23, 25, 27, 28, 30]) {
  eq(islamicArithmetic.isLeapYear(y), false, `Islamic year ${y} is not leap`);
}
eq(islamicArithmetic.daysInMonth(1, 12), 29, "Islamic non-leap Dhu'l-Hijja = 29");
eq(islamicArithmetic.daysInMonth(2, 12), 30, "Islamic leap Dhu'l-Hijja = 30");

// ---- French Republican (arithmetic) -------------------------------------

eq(frenchRepublican.toRd({ year: 1, month: 1, day: 1 }),
   gregorian.toRd({ year: 1792, month: 9, day: 22 }),
   "French Rep an I 1 Vendémiaire = Greg 1792-09-22");
eq(frenchRepublican.toRd({ year: 3, month: 1, day: 1 }),
   gregorian.toRd({ year: 1794, month: 9, day: 22 }),
   "French Rep an III 1 Vendémiaire = Greg 1794-09-22 (arithmetic)");
eq(frenchRepublican.isLeapYear(3), true, "French Rep an III is leap (arith)");
eq(frenchRepublican.isLeapYear(4), false, "French Rep an IV is not leap");
eq(frenchRepublican.isLeapYear(99), false, "French Rep year 99 not leap (century drop)");
eq(frenchRepublican.isLeapYear(399), true, "French Rep year 399 leap (400 rule)");
for (const rd of [gregorian.toRd({ year: 1792, month: 9, day: 22 }),
                  gregorian.toRd({ year: 1800, month: 6, day: 15 }),
                  gregorian.toRd({ year: 1799, month: 11, day: 9 })]) {
  const f = frenchRepublican.fromRd(rd);
  eq(frenchRepublican.toRd(f), rd, `French Rep roundtrip RD ${rd}`);
}

// ---- Byzantine ----------------------------------------------------------

deepEq(byzantine.fromRd(gregorian.toRd({ year: 2024, month: 1, day: 1 })),
   { year: 7532, month: 12, day: 19 },
   "Greg 2024-01-01 -> Byzantine 7532 (Julian 12-19)");
{
  const d = byzantine.fromRd(gregorian.toRd({ year: 2024, month: 9, day: 15 }));
  eq(d.year, 7533, "Greg 2024-09-15 -> Byzantine year 7533");
}

// ---- Kali Yuga ----------------------------------------------------------

deepEq(kaliYuga.fromRd(gregorian.toRd({ year: 2024, month: 1, day: 1 })),
   { year: 5125 }, "Greg 2024-01-01 -> KY 5125");
deepEq(kaliYuga.fromRd(gregorian.toRd({ year: 2024, month: 3, day: 2 })),
   { year: 5126 }, "Greg 2024-03-02 -> KY 5126");
deepEq(kaliYuga.fromRd(gregorian.toRd({ year: 2024, month: 3, day: 1 })),
   { year: 5125 }, "Greg 2024-03-01 -> KY 5125");

// ---- Discordian ---------------------------------------------------------

deepEq(discordian.fromRd(gregorian.toRd({ year: 2024, month: 1, day: 1 })),
   { year: 3190, season: 1, day: 1 }, "Greg 2024-01-01 -> Chaos 1, 3190 YOLD");
deepEq(discordian.fromRd(gregorian.toRd({ year: 2024, month: 2, day: 29 })),
   { year: 3190, stTibsDay: true }, "Greg 2024-02-29 -> St. Tib's Day");
deepEq(discordian.fromRd(gregorian.toRd({ year: 2024, month: 3, day: 1 })),
   { year: 3190, season: 1, day: 60 }, "Greg 2024-03-01 -> Chaos 60, 3190 YOLD");
deepEq(discordian.fromRd(gregorian.toRd({ year: 2024, month: 12, day: 31 })),
   { year: 3190, season: 5, day: 73 }, "Greg 2024-12-31 -> The Aftermath 73");
deepEq(discordian.fromRd(gregorian.toRd({ year: 2023, month: 12, day: 31 })),
   { year: 3189, season: 5, day: 73 }, "Greg 2023-12-31 -> The Aftermath 73, 3189");
for (const rd of [gregorian.toRd({ year: 2024, month: 6, day: 15 }),
                  gregorian.toRd({ year: 2023, month: 1, day: 1 }),
                  gregorian.toRd({ year: 2025, month: 11, day: 30 })]) {
  const d = discordian.fromRd(rd);
  eq(discordian.toRd(d), rd, `Discordian roundtrip RD ${rd}`);
}

// ---- Maya (Long Count, Haab, Tzolk'in) ----------------------------------

eq(maya.EPOCH, -1137142, "Maya epoch RD = -1137142 (GMT correlation 584283)");
deepEq(maya.longCount.fromRd(maya.EPOCH),
   { baktun: 0, katun: 0, tun: 0, uinal: 0, kin: 0 },
   "Maya epoch -> 0.0.0.0.0");
eq(maya.longCount.toRd({ baktun: 13, katun: 0, tun: 0, uinal: 0, kin: 0 }),
   gregorian.toRd({ year: 2012, month: 12, day: 21 }),
   "Maya 13.0.0.0.0 = Greg 2012-12-21");
for (const rd of [0, 500000, 738886, -1137142, -500000]) {
  const lc = maya.longCount.fromRd(rd);
  eq(maya.longCount.toRd(lc), rd, `Maya LongCount roundtrip RD ${rd}`);
}
deepEq(maya.haab.fromRd(maya.EPOCH), { month: 18, day: 8 },
   "Maya epoch Haab = 8 Kumk'u");
{
  const tz = maya.tzolkin.fromRd(maya.EPOCH);
  eq(tz.number, 4, "Maya epoch Tzolk'in number = 4");
  eq(tz.nameIndex, 20, "Maya epoch Tzolk'in name = Ajaw (20)");
  eq(tz.name, "Ajaw", "Maya epoch Tzolk'in day name = Ajaw");
}

// ---- Japanese nengō -----------------------------------------------------

deepEq(
  japanese.fromRd(gregorian.toRd({ year: 2024, month: 4, day: 18 })),
  { era: "reiwa", eraNameJa: "令和", eraNameRomaji: "Reiwa",
    year: 6, month: 4, day: 18 },
  "Greg 2024-04-18 -> Reiwa 6-04-18",
);
deepEq(
  japanese.fromRd(gregorian.toRd({ year: 2019, month: 5, day: 1 })),
  { era: "reiwa", eraNameJa: "令和", eraNameRomaji: "Reiwa",
    year: 1, month: 5, day: 1 },
  "Greg 2019-05-01 -> Reiwa 1-05-01 (era start)",
);
{
  const lastHeisei = japanese.fromRd(gregorian.toRd({ year: 2019, month: 4, day: 30 }));
  eq(lastHeisei.era, "heisei", "Greg 2019-04-30 is in Heisei era");
  eq(lastHeisei.year, 31,       "Greg 2019-04-30 is Heisei 31");
}
{
  const meijiStart = japanese.fromRd(gregorian.toRd({ year: 1868, month: 10, day: 23 }));
  eq(meijiStart.era, "meiji", "Greg 1868-10-23 is Meiji era");
  eq(meijiStart.year, 1,       "Greg 1868-10-23 is Meiji 1");
}
// Pre-Meiji: 1867-01-01 is in Keiō (慶応, started 1865-05-01), year 3
{
  const keio = japanese.fromRd(gregorian.toRd({ year: 1867, month: 1, day: 1 }));
  eq(keio.era, "keio", "Greg 1867-01-01 is in Keiō era");
  eq(keio.year, 3,      "Greg 1867-01-01 is Keiō 3");
}
// Before Taika (645 CE) returns null
eq(japanese.fromRd(gregorian.toRd({ year: 644, month: 1, day: 1 })), null,
   "Greg 644-01-01 has no nengō (null, before Taika)");
// Pre-Meiji roundtrip: Genpei era (Juei 寿永, 1182)
for (const rd of [gregorian.toRd({ year: 2024, month: 1, day: 1 }),
                  gregorian.toRd({ year: 1989, month: 1, day: 8 }),
                  gregorian.toRd({ year: 1926, month: 12, day: 25 }),
                  gregorian.toRd({ year: 1182, month: 6, day: 1 })]) {
  const j = japanese.fromRd(rd);
  eq(japanese.toRd(j), rd, `Japanese roundtrip RD ${rd}`);
}

// ---- Hebrew -------------------------------------------------------------

eq(hebrew.toRd({ year: 5785, month: 7, day: 1 }),
   gregorian.toRd({ year: 2024, month: 10, day: 3 }),
   "Hebrew 5785-07-01 (1 Tishri) = Greg 2024-10-03");
eq(hebrew.EPOCH, -1373427, "Hebrew epoch RD = -1373427");
eq(hebrew.toRd({ year: 1, month: 7, day: 1 }), hebrew.newYear(1),
   "Hebrew 1-07-01 = newYear(1)");
for (const y of [3, 6, 8, 11, 14, 17, 19]) {
  eq(hebrew.isLeapYear(y), true, `Hebrew year ${y} is leap`);
}
for (const y of [1, 2, 4, 5, 7, 9, 10, 12, 13, 15, 16, 18]) {
  eq(hebrew.isLeapYear(y), false, `Hebrew year ${y} is not leap`);
}
for (const y of [5780, 5781, 5782, 5783, 5784, 5785, 5786]) {
  const len = hebrew.daysInYear(y);
  assert([353, 354, 355, 383, 384, 385].includes(len),
         `Hebrew year ${y} length ${len} is valid`);
}
for (const rd of [
  gregorian.toRd({ year: 2024, month: 10, day: 3 }),
  gregorian.toRd({ year: 2000, month: 1, day: 1 }),
  gregorian.toRd({ year: 1500, month: 6, day: 15 }),
  gregorian.toRd({ year: 500, month: 12, day: 25 }),
]) {
  const h = hebrew.fromRd(rd);
  eq(hebrew.toRd(h), rd, `Hebrew roundtrip RD ${rd}`);
}

// ---- Buddhist (Thai solar) ----------------------------------------------

deepEq(buddhist.fromRd(gregorian.toRd({ year: 2024, month: 1, day: 1 })),
   { year: 2567, month: 1, day: 1 }, "Greg 2024-01-01 -> BE 2567-01-01");
deepEq(buddhist.fromRd(gregorian.toRd({ year: 2026, month: 4, day: 18 })),
   { year: 2569, month: 4, day: 18 }, "Greg 2026-04-18 -> BE 2569-04-18");
for (const rd of [730120, 738886, 500000]) {
  const b = buddhist.fromRd(rd);
  eq(buddhist.toRd(b), rd, `Buddhist roundtrip RD ${rd}`);
}

// ---- Solar Hijri (arithmetic) -------------------------------------------

eq(solarHijri.toRd({ year: 1, month: 1, day: 1 }),
   julian.toRd({ year: 622, month: 3, day: 19 }),
   "SH 1-01-01 = Julian 622-03-19");
eq(solarHijri.toRd({ year: 1403, month: 1, day: 1 }),
   gregorian.toRd({ year: 2024, month: 3, day: 20 }),
   "SH 1403-01-01 (Nowruz) = Greg 2024-03-20");
{
  let shLeaps = 0;
  for (let y = 475; y < 475 + 2820; y++) if (solarHijri.isLeapYear(y)) shLeaps++;
  eq(shLeaps, 683, "SH arithmetic: 683 leap years per 2820-year cycle");
}
// Arithmetic variant diverges from astronomical at edge cases (e.g. 1403).
// Minimum sanity: year length is always 365 or 366.
for (const y of [1399, 1400, 1401, 1402, 1403, 1404, 1405]) {
  const len = solarHijri.daysInYear(y);
  assert(len === 365 || len === 366, `SH ${y} days ${len} is 365 or 366`);
}
for (const rd of [730120, 738886, 227000, 600000]) {
  const s = solarHijri.fromRd(rd);
  eq(solarHijri.toRd(s), rd, `SH roundtrip RD ${rd}`);
}

// ---- Shaka (Indian National) --------------------------------------------

deepEq(hinduShaka.fromRd(gregorian.toRd({ year: 2024, month: 3, day: 21 })),
   { year: 1946, month: 1, day: 1 },
   "Greg 2024-03-21 = Shaka 1946 Chaitra 1 (Greg leap year)");
deepEq(hinduShaka.fromRd(gregorian.toRd({ year: 2025, month: 3, day: 22 })),
   { year: 1947, month: 1, day: 1 },
   "Greg 2025-03-22 = Shaka 1947 Chaitra 1 (common Greg year)");
eq(hinduShaka.daysInMonth(1946, 1), 31, "Shaka 1946 Chaitra has 31 days (leap)");
eq(hinduShaka.daysInMonth(1947, 1), 30, "Shaka 1947 Chaitra has 30 days");
for (const gd of [{year:2024,month:4,day:18}, {year:2000,month:3,day:21},
                  {year:1957,month:3,day:22}, {year:2025,month:3,day:21}]) {
  const rd = gregorian.toRd(gd);
  const sd = hinduShaka.fromRd(rd);
  eq(hinduShaka.toRd(sd), rd, `Shaka roundtrip Greg ${gd.year}-${gd.month}-${gd.day}`);
}

// ---- Babylonian (Seleucid-era arithmetic) -------------------------------

eq(babylonian.toRd({ year: 1, month: 1, day: 1 }),
   julian.toRd({ year: -310, month: 4, day: 3 }),
   "Babylonian epoch = Julian -310-04-03");
{
  let leaps = 0;
  for (let y = 1; y <= 19; y++) if (babylonian.isLeapYear(y)) leaps++;
  eq(leaps, 7, "Babylonian: 7 leap years per 19-year Metonic cycle");
}
for (const rd of [0, 100000, 227015, 500000]) {
  const b = babylonian.fromRd(rd);
  eq(babylonian.toRd(b), rd, `Babylonian roundtrip RD ${rd}`);
}

// ---- Nanakshahi ---------------------------------------------------------

// Epoch: 1 Chet NS 1 = Greg 1469-03-14 (birth year of Guru Nanak Dev Ji).
eq(nanakshahi.toRd({ year: 1, month: 1, day: 1 }),
   gregorian.toRd({ year: 1469, month: 3, day: 14 }),
   "NS 1-01-01 (1 Chet) = Greg 1469-03-14");

// Sikh New Year 2024: 1 Chet NS 556 = Greg 2024-03-14.
deepEq(nanakshahi.fromRd(gregorian.toRd({ year: 2024, month: 3, day: 14 })),
   { year: 556, month: 1, day: 1 },
   "Greg 2024-03-14 = NS 556 Chet 1");

// Vaisakhi 2024: 1 Vaisakh NS 556 = Greg 2024-04-14.
deepEq(nanakshahi.fromRd(gregorian.toRd({ year: 2024, month: 4, day: 14 })),
   { year: 556, month: 2, day: 1 },
   "Greg 2024-04-14 = NS 556 Vaisakh 1 (Vaisakhi)");

// Dates in months 11–12 (cross Gregorian year boundary).
deepEq(nanakshahi.fromRd(gregorian.toRd({ year: 2025, month: 1, day: 13 })),
   { year: 556, month: 11, day: 1 },
   "Greg 2025-01-13 = NS 556 Magh 1");
deepEq(nanakshahi.fromRd(gregorian.toRd({ year: 2025, month: 2, day: 12 })),
   { year: 556, month: 12, day: 1 },
   "Greg 2025-02-12 = NS 556 Phagun 1");

// Leap year: NS 555 (Phagun falls in Gregorian 2024, a leap year) → Phagun has 31 days.
eq(nanakshahi.isLeapYear(555), true,  "NS 555 is leap (Greg 2024 is Gregorian leap)");
eq(nanakshahi.isLeapYear(556), false, "NS 556 is not leap");
eq(nanakshahi.daysInMonth(555, 12), 31, "NS 555 Phagun has 31 days");
eq(nanakshahi.daysInMonth(556, 12), 30, "NS 556 Phagun has 30 days");

// Roundtrip.
for (const gd of [
  { year: 2024, month: 3,  day: 14 },
  { year: 2024, month: 4,  day: 14 },
  { year: 2024, month: 12, day: 31 },
  { year: 2025, month: 3,  day: 13 },
  { year: 1469, month: 3,  day: 14 },
]) {
  const rd = gregorian.toRd(gd);
  const n = nanakshahi.fromRd(rd);
  eq(nanakshahi.toRd(n), rd,
     `Nanakshahi roundtrip Greg ${gd.year}-${gd.month}-${gd.day}`);
}

// ---- Myanmar ----------------------------------------------------------------

// ME 1386 Tagu 1 = April 9, 2024 (verified against yan9a/mmcal).
deepEq(myanmar.fromRd(gregorian.toRd({ year: 2024, month: 4, day: 9 })),
  { year: 1386, month: 1, day: 1, intercalary: false, yearType: 0 },
  "Greg 2024-04-09 = ME 1386 Tagu 1");

// Kason (month 2): May 8, 2024 = Kason 1 in ME 1386.
{
  const d = myanmar.fromRd(gregorian.toRd({ year: 2024, month: 5, day: 8 }));
  eq(d.year, 1386, "Greg 2024-05-08 is still ME 1386");
  eq(d.month, 2,   "Greg 2024-05-08 is Kason");
  eq(d.intercalary, false, "Greg 2024-05-08 is not intercalary");
}

// format() smoke test.
eq(myanmar.format({ year: 1386, month: 1, day: 1 }), "ME 1386 Tagu 1",
  "format ME 1386 Tagu 1");
eq(myanmar.format({ year: 1386, month: 4, day: 5, intercalary: true }), "ME 1386 First Waso 5",
  "format ME 1386 First Waso 5");

// Roundtrip: toRd(fromRd(rd)) === rd for a range of dates.
for (const gd of [
  { year: 2024, month: 4,  day: 9  },
  { year: 2024, month: 6,  day: 15 },
  { year: 2025, month: 1,  day: 1  },
  { year: 2026, month: 4,  day: 18 },
  { year: 1900, month: 6,  day: 1  },
  { year: 1700, month: 3,  day: 15 },
]) {
  const rd = gregorian.toRd(gd);
  const m = myanmar.fromRd(rd);
  eq(myanmar.toRd(m), rd,
     `Myanmar roundtrip Greg ${gd.year}-${gd.month}-${gd.day}`);
}
