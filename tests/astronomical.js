/**
 * tests/astronomical.js — astronomy.js primitives and calendars that
 * depend on them (Chinese, Hindu Vikram Samvat, French Republican
 * astronomical, Solar Hijri astronomical, Vikram purnimanta, Nanakshahi).
 */

import { eq, deepEq, approx } from "./_harness.js";
import * as gregorian from "../gregorian.js";
import * as astronomy from "../astronomy.js";
import * as chinese from "../chinese.js";
import * as hinduVikram from "../hindu-vikram.js";
import * as frenchRepublicanAstro from "../french-republican-astronomical.js";
import * as solarHijriAstro from "../solar-hijri-astronomical.js";
import * as hinduVikramPurnimanta from "../hindu-vikram-purnimanta.js";

// ---- Astronomy primitives -----------------------------------------------

// Vernal equinox 2024 = 2024-03-20 03:06 UT. Solar longitude ≈ 0° (equivalently 360°).
{
  const rd = gregorian.toRd({ year: 2024, month: 3, day: 20 }) + 3/24 + 6/1440;
  approx(astronomy.solarLongitude(rd), 360, 0.01,
         "solar longitude at 2024-03-20 03:06 UT ≈ 0°");
}

// Winter solstice 2023, found via angular inverse.
{
  const ws = astronomy.solarLongitudeAfter(270,
    gregorian.toRd({ year: 2023, month: 12, day: 1 }));
  const day = gregorian.fromRd(Math.floor(ws));
  eq(day.year, 2023, "winter solstice 2023 year");
  eq(day.month, 12, "winter solstice 2023 month");
  eq(day.day, 22,   "winter solstice 2023 day");
}

// New moon on or after 2024-02-01 — published value 2024-02-09 22:59 UT.
{
  const ref = gregorian.toRd({ year: 2024, month: 2, day: 1 });
  const nm = astronomy.newMoonAtOrAfter(ref);
  const d = gregorian.fromRd(Math.floor(nm));
  eq(d.year, 2024, "new moon after 2024-02-01 year");
  eq(d.month, 2,   "new moon after 2024-02-01 month");
  eq(d.day, 9,     "new moon after 2024-02-01 day");
}

// ---- Chinese calendar ---------------------------------------------------

// Known Chinese New Years.
eq(chinese.fromRd(gregorian.toRd({ year: 2024, month: 2, day: 10 })).month, 1,
  "Greg 2024-02-10 is month 1 (CNY 2024)");
eq(chinese.fromRd(gregorian.toRd({ year: 2025, month: 1, day: 29 })).month, 1,
  "Greg 2025-01-29 is month 1 (CNY 2025)");
eq(chinese.fromRd(gregorian.toRd({ year: 2023, month: 1, day: 22 })).month, 1,
  "Greg 2023-01-22 is month 1 (CNY 2023 — leap-sui edge case)");

// Leap month 2 in Chinese year 4660 (Rabbit).
{
  const d = chinese.fromRd(gregorian.toRd({ year: 2023, month: 3, day: 22 }));
  eq(d.month, 2, "Greg 2023-03-22 is month 2");
  eq(d.leap, true, "  …and it's a leap month");
}

// Stem-branch at CNY 2024 = Jiǎ Chén (Wood Dragon).
{
  const d = chinese.fromRd(gregorian.toRd({ year: 2024, month: 2, day: 10 }));
  eq(chinese.STEM_NAMES[d.stem - 1], "Jiǎ",
     "CNY 2024 stem = Jiǎ (Wood)");
  eq(chinese.BRANCH_NAMES[d.branch - 1], "Chén (Dragon)",
     "CNY 2024 branch = Chén (Dragon)");
}

// Roundtrip (covers the leap-sui edge case).
for (const gd of [{ year: 2024, month: 4, day: 18 },
                  { year: 2023, month: 3, day: 22 },
                  { year: 2025, month: 1, day: 29 }]) {
  const rd = gregorian.toRd(gd);
  const cd = chinese.fromRd(rd);
  eq(chinese.toRd(cd), rd,
     `Chinese roundtrip Greg ${gd.year}-${gd.month}-${gd.day}`);
}

// ---- Vikram Samvat (Hindu lunisolar, amanta) ----------------------------

// Known Ugadi / Gudi Padwa dates (Chaitra Shukla Pratipada = VS new year).
for (const [greg, vsYear] of [
  [{ year: 2023, month: 3,  day: 22 }, 2080],
  [{ year: 2024, month: 4,  day: 9  }, 2081],
  [{ year: 2025, month: 3,  day: 30 }, 2082],
]) {
  const d = hinduVikram.fromRd(gregorian.toRd(greg));
  eq(d.month, 1, `Greg ${greg.year}-${greg.month}-${greg.day} is Chaitra 1 (Ugadi ${vsYear})`);
  eq(d.day,   1, `  ...day 1`);
  eq(d.leap,  false, `  ...non-leap (nija)`);
  eq(d.year,  vsYear, `  ...VS year ${vsYear}`);
}

// 2023 had an intercalary (adhika) Shravana — 2023-07-18 starts leap Shravana.
{
  const d = hinduVikram.fromRd(gregorian.toRd({ year: 2023, month: 7, day: 18 }));
  eq(d.month, 5, "Greg 2023-07-18 is Shravana");
  eq(d.leap, true, "  ...adhika (leap month)");
}

// Roundtrip.
for (const rd of [gregorian.toRd({ year: 2024, month: 4, day: 18 }),
                  gregorian.toRd({ year: 2023, month: 3, day: 22 }),
                  gregorian.toRd({ year: 2023, month: 7, day: 18 }),
                  gregorian.toRd({ year: 2025, month: 3, day: 30 })]) {
  const d = hinduVikram.fromRd(rd);
  eq(hinduVikram.toRd(d), rd, `VS roundtrip RD ${rd}`);
}

// ---- French Republican (astronomical) -----------------------------------

// Epoch: 1 Vendémiaire an I = Greg 1792-09-22 (autumnal equinox, same as arithmetic).
eq(frenchRepublicanAstro.toRd({ year: 1, month: 1, day: 1 }),
   gregorian.toRd({ year: 1792, month: 9, day: 22 }),
   "French Rep astro an I 1 Vendémiaire = Greg 1792-09-22");

// 18 Brumaire an VIII = Greg 1799-11-09 (Napoleon's coup d'état).
eq(frenchRepublicanAstro.toRd({ year: 8, month: 2, day: 18 }),
   gregorian.toRd({ year: 1799, month: 11, day: 9 }),
   "French Rep astro 18 Brumaire an VIII = Greg 1799-11-09");

// Roundtrip over the historical use period.
for (const gd of [
  { year: 1792, month: 9,  day: 22 },
  { year: 1799, month: 11, day: 9  },
  { year: 1804, month: 6,  day: 15 },
  { year: 1805, month: 12, day: 31 },
]) {
  const rd = gregorian.toRd(gd);
  const f = frenchRepublicanAstro.fromRd(rd);
  eq(frenchRepublicanAstro.toRd(f), rd,
     `French Rep astro roundtrip Greg ${gd.year}-${gd.month}-${gd.day}`);
}

// ---- Solar Hijri (astronomical) -----------------------------------------

// Nowruz 1403 AP = Greg 2024-03-20: equinox 03:07 UT → 06:37 Tehran (before noon).
eq(solarHijriAstro.toRd({ year: 1403, month: 1, day: 1 }),
   gregorian.toRd({ year: 2024, month: 3, day: 20 }),
   "SH astro Nowruz 1403 = Greg 2024-03-20");

// Nowruz 1402 AP = Greg 2023-03-21: equinox 21:24 UT → 00:54 Tehran next day (before noon).
eq(solarHijriAstro.toRd({ year: 1402, month: 1, day: 1 }),
   gregorian.toRd({ year: 2023, month: 3, day: 21 }),
   "SH astro Nowruz 1402 = Greg 2023-03-21");

// Year length sanity: must always be 365 or 366.
for (const y of [1399, 1400, 1401, 1402, 1403, 1404, 1405]) {
  const len = solarHijriAstro.daysInYear(y);
  eq(len === 365 || len === 366, true, `SH astro ${y} year length ${len} is 365 or 366`);
}

// Roundtrip.
for (const rd of [730120, 738886, 600000, 700000]) {
  const s = solarHijriAstro.fromRd(rd);
  eq(solarHijriAstro.toRd(s), rd, `SH astro roundtrip RD ${rd}`);
}

// ---- Vikram Samvat (purnimanta) -----------------------------------------

// Core distinction: a day in the Phalguna dark fortnight reads as
// Phalguna (12) in amanta but Chaitra (1) in purnimanta.
// Holi 2024 (Phalguna Purnima) = March 25 at 07:01 UT; March 26 is day 1
// of purnimanta Chaitra VS 2081 (first day after sunrise following the full moon).
{
  const rd = gregorian.toRd({ year: 2024, month: 3, day: 26 });
  const amanta = hinduVikram.fromRd(rd);
  eq(amanta.month, 12, "amanta: 2024-03-26 is Phalguna (month 12)");
  eq(amanta.year,  2080, "amanta: 2024-03-26 is VS 2080");
  const purnimanta = hinduVikramPurnimanta.fromRd(rd);
  eq(purnimanta.month, 1, "purnimanta: 2024-03-26 is Chaitra (month 1, dark fortnight)");
  eq(purnimanta.year, 2081, "purnimanta: 2024-03-26 is VS 2081");
}

// Ugadi 2081 (= amanta Chaitra 1 = purnimanta Chaitra day 15 approximately).
{
  const ugadi = gregorian.toRd({ year: 2024, month: 4, day: 9 });
  const p = hinduVikramPurnimanta.fromRd(ugadi);
  eq(p.month, 1,    "purnimanta: Ugadi 2081 (2024-04-09) is Chaitra");
  eq(p.year,  2081, "purnimanta: Ugadi 2081 year");
  eq(p.leap,  false, "purnimanta: Ugadi 2081 non-leap");
}

// Roundtrip.
for (const rd of [
  gregorian.toRd({ year: 2024, month: 3, day: 26 }),
  gregorian.toRd({ year: 2024, month: 4, day: 9  }),
  gregorian.toRd({ year: 2023, month: 3, day: 22 }),
  gregorian.toRd({ year: 2023, month: 7, day: 18 }),
]) {
  const d = hinduVikramPurnimanta.fromRd(rd);
  eq(hinduVikramPurnimanta.toRd(d), rd, `VS purnimanta roundtrip RD ${rd}`);
}
