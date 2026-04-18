/**
 * tests/core.js — Gregorian, Julian, ISO-8601 week date, JD/RD
 * conversions, and day-of-week.
 */

import { eq, deepEq, approx } from "./_harness.js";
import * as gregorian from "../gregorian.js";
import * as julian from "../julian.js";
import * as isoWeek from "../iso-week.js";
import { rdFromJd, jdFromRd, dayOfWeek, WEEKDAY_NAMES } from "../julian-day.js";

// Gregorian / RD / JD triples. JD is at midnight UT of the Gregorian date.
// Cross-verified against the USNO Astronomical Applications JD converter.
const GREG_RD_JD = [
  { label: "proleptic epoch",  greg: { year: 1,    month: 1,  day: 1  }, rd: 1,      jd: 1721425.5 },
  { label: "Gregorian reform", greg: { year: 1582, month: 10, day: 15 }, rd: 577736, jd: 2299160.5 },
  { label: "20th century",     greg: { year: 1900, month: 1,  day: 1  }, rd: 693596, jd: 2415020.5 },
  { label: "Unix epoch",       greg: { year: 1970, month: 1,  day: 1  }, rd: 719163, jd: 2440587.5 },
  { label: "Y2K",              greg: { year: 2000, month: 1,  day: 1  }, rd: 730120, jd: 2451544.5 },
  { label: "leap day 2024",    greg: { year: 2024, month: 2,  day: 29 }, rd: 738945, jd: 2460369.5 },
  { label: "astronomical year 0", greg: { year: 0,  month: 12, day: 31 }, rd: 0,     jd: 1721424.5 },
  { label: "1 BCE Jan 1",      greg: { year: 0,    month: 1,  day: 1  }, rd: -365,   jd: 1721059.5 },
];

// Gregorian <-> Julian pairs (astronomical year numbering, same RD).
const GREG_JULIAN = [
  { greg: { year: 2000, month: 1,  day: 1  }, julian: { year: 1999, month: 12, day: 19 } },
  { greg: { year: 1970, month: 1,  day: 1  }, julian: { year: 1969, month: 12, day: 19 } },
  { greg: { year: 1900, month: 1,  day: 1  }, julian: { year: 1899, month: 12, day: 20 } },
  { greg: { year: 1582, month: 10, day: 15 }, julian: { year: 1582, month: 10, day: 5  } },
  { greg: { year: 1582, month: 10, day: 14 }, julian: { year: 1582, month: 10, day: 4  } },
  { greg: { year: 0,    month: 12, day: 30 }, julian: { year: 1,    month: 1,  day: 1  } },
  // Julian was 2 days ahead of proleptic Gregorian in 1 AD.
  { greg: { year: 1,    month: 1,  day: 1  }, julian: { year: 1,    month: 1,  day: 3  } },
];

// ISO 8601 week-date conversions. Known cases.
const GREG_ISO = [
  { greg: { year: 2020, month: 1,  day: 6  }, iso: { year: 2020, week: 2,  day: 1 } },
  { greg: { year: 2020, month: 1,  day: 1  }, iso: { year: 2020, week: 1,  day: 3 } },
  { greg: { year: 2005, month: 1,  day: 1  }, iso: { year: 2004, week: 53, day: 6 } }, // 53-week
  { greg: { year: 2005, month: 1,  day: 2  }, iso: { year: 2004, week: 53, day: 7 } },
  { greg: { year: 2007, month: 12, day: 31 }, iso: { year: 2008, week: 1,  day: 1 } },
  { greg: { year: 2009, month: 1,  day: 1  }, iso: { year: 2009, week: 1,  day: 4 } },
];

// Day-of-week (0 = Sunday, 6 = Saturday).
const WEEKDAYS = [
  { greg: { year: 2000, month: 1,  day: 1  }, wday: 6 }, // Saturday
  { greg: { year: 1970, month: 1,  day: 1  }, wday: 4 }, // Thursday
  { greg: { year: 2024, month: 2,  day: 29 }, wday: 4 }, // Thursday
  { greg: { year: 1,    month: 1,  day: 1  }, wday: 1 }, // Monday (proleptic)
];

// ---- Gregorian ----------------------------------------------------------

for (const v of GREG_RD_JD) {
  eq(gregorian.toRd(v.greg), v.rd, `Greg toRd ${v.label}`);
}
for (const v of GREG_RD_JD) {
  deepEq(gregorian.fromRd(v.rd), v.greg, `Greg fromRd ${v.label}`);
  eq(gregorian.toRd(gregorian.fromRd(v.rd)), v.rd, `Greg roundtrip ${v.label}`);
}
for (const v of GREG_RD_JD) {
  approx(gregorian.toJd(v.greg), v.jd, 1e-9, `Greg toJd ${v.label}`);
  deepEq(gregorian.fromJd(v.jd), v.greg, `Greg fromJd ${v.label}`);
}

eq(gregorian.isLeapYear(2000), true,  "Greg 2000 leap (div 400)");
eq(gregorian.isLeapYear(1900), false, "Greg 1900 not leap (div 100 not 400)");
eq(gregorian.isLeapYear(2024), true,  "Greg 2024 leap");
eq(gregorian.isLeapYear(2023), false, "Greg 2023 not leap");
eq(gregorian.isLeapYear(0),    true,  "Greg astro year 0 leap (div 400)");

eq(gregorian.daysInMonth(2024, 2), 29, "Feb 2024 has 29 days");
eq(gregorian.daysInMonth(2023, 2), 28, "Feb 2023 has 28 days");
eq(gregorian.daysInMonth(2000, 2), 29, "Feb 2000 has 29 days (400)");
eq(gregorian.daysInMonth(1900, 2), 28, "Feb 1900 has 28 days (100 not 400)");

eq(gregorian.validate({ year: 2024, month: 2, day: 29 }).valid, true,  "validate Feb 29 2024 valid");
eq(gregorian.validate({ year: 2023, month: 2, day: 29 }).valid, false, "validate Feb 29 2023 invalid");
eq(gregorian.validate({ year: 2024, month: 13, day: 1 }).valid, false, "validate month 13 invalid");
eq(gregorian.validate({ year: 2024, month: 1, day: 0 }).valid, false, "validate day 0 invalid");

// ---- Julian -------------------------------------------------------------

for (const v of GREG_JULIAN) {
  const rdFromGreg = gregorian.toRd(v.greg);
  const rdFromJulian = julian.toRd(v.julian);
  eq(rdFromJulian, rdFromGreg, `Julian ↔ Greg same RD ${JSON.stringify(v)}`);
  deepEq(julian.fromRd(rdFromGreg), v.julian,
         `julian.fromRd(${rdFromGreg}) == ${JSON.stringify(v.julian)}`);
}
for (const v of GREG_JULIAN) {
  const rd = julian.toRd(v.julian);
  deepEq(julian.fromRd(rd), v.julian, `Julian roundtrip ${JSON.stringify(v.julian)}`);
}

eq(julian.isLeapYear(2000), true,  "Julian 2000 is leap");
eq(julian.isLeapYear(1900), true,  "Julian 1900 is leap (not Gregorian)");
eq(julian.isLeapYear(2100), true,  "Julian 2100 is leap (not Gregorian)");
eq(julian.isLeapYear(2001), false, "Julian 2001 not leap");
eq(julian.isLeapYear(0),    true,  "Julian astro year 0 is leap");
eq(julian.isLeapYear(-4),   true,  "Julian astro year -4 is leap");

// ---- ISO 8601 week ------------------------------------------------------

for (const v of GREG_ISO) {
  const rd = gregorian.toRd(v.greg);
  deepEq(isoWeek.fromRd(rd), v.iso, `ISO fromRd ${JSON.stringify(v.greg)}`);
  eq(isoWeek.toRd(v.iso), rd, `ISO toRd ${JSON.stringify(v.iso)}`);
}

// ---- Day of week --------------------------------------------------------

for (const v of WEEKDAYS) {
  const rd = gregorian.toRd(v.greg);
  eq(dayOfWeek(rd), v.wday,
     `weekday of ${JSON.stringify(v.greg)} = ${WEEKDAY_NAMES[v.wday]}`);
}

// ---- JD <-> RD sanity ---------------------------------------------------

eq(jdFromRd(730120), 2451544.5, "jdFromRd(730120) = 2451544.5 (Y2K midnight UT)");
eq(rdFromJd(2451544.5), 730120, "rdFromJd(2451544.5) = 730120 (Y2K midnight UT)");
