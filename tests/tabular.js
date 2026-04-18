/**
 * tests/tabular.js — data-lookup calendars.
 *   Islamic Umm al-Qura (Saudi table).
 */

import { eq, deepEq } from "./_harness.js";
import * as gregorian from "../gregorian.js";
import * as islamicArithmetic from "../islamic-arithmetic.js";
import * as ummAlQura from "../islamic-umm-al-qura.js";

// Known: 14 March 1937 Gregorian = 1 Muharram 1356 AH (Saudi adoption day).
deepEq(ummAlQura.fromRd(gregorian.toRd({ year: 1937, month: 3, day: 14 })),
   { year: 1356, month: 1, day: 1 },
   "Greg 1937-03-14 = UQ 1356-01-01 (Saudi adoption day)");

// 1 Muharram 1446 = 7 July 2024 per Saudi announcement.
deepEq(ummAlQura.fromRd(gregorian.toRd({ year: 2024, month: 7, day: 7 })),
   { year: 1446, month: 1, day: 1 },
   "Greg 2024-07-07 = UQ 1446-01-01");

// Before AH 1356, UQ falls back to arithmetic Hijri.
{
  const rd = gregorian.toRd({ year: 1900, month: 1, day: 1 });
  const uq = ummAlQura.fromRd(rd);
  const arith = islamicArithmetic.fromRd(rd);
  deepEq(uq, arith, "UQ before 1356 AH falls back to arithmetic Hijri");
}

// Roundtrip inside and outside the table.
for (const rd of [gregorian.toRd({ year: 2024, month: 4, day: 18 }),
                  gregorian.toRd({ year: 1950, month: 6, day: 15 }),
                  gregorian.toRd({ year: 1800, month: 1, day: 1 }),   // pre-table
                  gregorian.toRd({ year: 2100, month: 1, day: 1 })]) { // post-table
  const d = ummAlQura.fromRd(rd);
  eq(ummAlQura.toRd(d), rd, `UQ roundtrip RD ${rd}`);
}
