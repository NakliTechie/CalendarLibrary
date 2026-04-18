/**
 * test.js — entry point for the calendrica-js test suite.
 *
 * Runnable in two environments:
 *   Node:    `cd lib/calendrica-js && node test.js`
 *   Browser: open test.html
 *
 * The suite is split across files under ./tests/ by topic:
 *   _harness.js       assertion helpers + shared results array
 *   core.js           Gregorian, Julian, ISO-8601 week, JD/RD, weekday
 *   arithmetic.js     every arithmetic calendar (15 of 22)
 *   astronomical.js   astronomy.js primitives + Chinese + Vikram Samvat
 *   tabular.js        Umm al-Qura lookup calendar
 *   convert.js        cross-calendar convert() API
 *
 * Adding a new test: drop it into the matching file (or a new one
 * under tests/) and import that file from here. The _harness assert
 * helpers push onto a shared results array; this file tallies and
 * reports.
 *
 * Test strategy:
 *   - Known (Gregorian, RD, JD) triples cross-verified against USNO.
 *   - Published conversion correspondences (e.g. CNY dates, Islamic
 *     1446, Saudi UQ 1356) verified against authoritative announcements.
 *   - Roundtrip: toRd(fromRd(rd)) === rd for every vector.
 *   - Boundary cases: astronomical year 0, negative proleptic years,
 *     Gregorian reform, leap days, ISO 53-week years, sui-edge-case
 *     lunar calendars, pre-table fallback for data calendars.
 */

import { results, summarise } from "./tests/_harness.js";

// Run every suite by importing. Each module has side effects:
// it pushes test results into the shared array.
import "./tests/core.js";
import "./tests/arithmetic.js";
import "./tests/astronomical.js";
import "./tests/tabular.js";
import "./tests/convert.js";

// ---- Reporting ----------------------------------------------------------

const { total, passed, failed, header } = summarise();

const isNode = typeof process !== "undefined" && process.versions && process.versions.node;

if (failed.length === 0) {
  if (isNode) {
    console.log(`\u2713 ${header}`);
  } else {
    console.log(`%c✓ ${header}`, "color: #6db86d; font-weight: 600;");
  }
} else {
  if (isNode) {
    console.error(`\u2717 ${header}`);
  } else {
    console.error(`%c✗ ${header}`, "color: #d96b5e; font-weight: 600;");
  }
  for (const f of failed) {
    const extra = f.extra
      ? `  expected ${JSON.stringify(f.extra.expected)}, got ${JSON.stringify(f.extra.actual)}`
      : "";
    console.error(`  - ${f.msg}${extra ? "\n" + extra : ""}`);
  }
}

// Exposed for test.html — consumed by the browser runner to render a card.
export const summary = { total, passed, failed, header };

if (isNode) {
  process.exit(failed.length === 0 ? 0 : 1);
}
