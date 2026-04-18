/**
 * tests/convert.js — cross-calendar conversion via the unified
 * convert() API, exercising the fromRd → toRd path through the
 * RD intermediate.
 */

import { deepEq } from "./_harness.js";
import * as calendrica from "../index.js";

// Core conversions
deepEq(
  calendrica.convert("gregorian", "julian", { year: 2000, month: 1, day: 1 }),
  { year: 1999, month: 12, day: 19 },
  "convert Greg 2000-01-01 -> Julian 1999-12-19",
);
deepEq(
  calendrica.convert("julian", "gregorian", { year: 1582, month: 10, day: 5 }),
  { year: 1582, month: 10, day: 15 },
  "convert Julian 1582-10-05 -> Greg 1582-10-15",
);
deepEq(
  calendrica.convert("gregorian", "iso-week", { year: 2005, month: 1, day: 1 }),
  { year: 2004, week: 53, day: 6 },
  "convert Greg 2005-01-01 -> ISO 2004-W53-6",
);

// Coptic / Ethiopian
deepEq(
  calendrica.convert("gregorian", "coptic", { year: 2024, month: 9, day: 11 }),
  { year: 1741, month: 1, day: 1 },
  "convert Greg 2024-09-11 -> Coptic 1741-01-01",
);
deepEq(
  calendrica.convert("gregorian", "ethiopian", { year: 2024, month: 9, day: 11 }),
  { year: 2017, month: 1, day: 1 },
  "convert Greg 2024-09-11 -> Ethiopian 2017-01-01",
);

// Islamic arithmetic
deepEq(
  calendrica.convert("gregorian", "islamic-arithmetic", { year: 2024, month: 1, day: 1 }),
  { year: 1445, month: 6, day: 19 },
  "convert Greg 2024-01-01 -> Islamic 1445-06-19",
);
