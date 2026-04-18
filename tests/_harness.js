/**
 * _harness.js — tiny assertion framework shared across test files.
 *
 * No external dependencies. Each `assert*` pushes onto the shared
 * `results` array so the aggregator in ../test.js can tally and
 * report at the end. Import order doesn't matter; every test file
 * just calls the helpers.
 */

export const results = [];

export const assert = (cond, msg, extra) => {
  results.push({ pass: !!cond, msg, extra });
};
export const eq = (actual, expected, msg) =>
  assert(actual === expected, msg, { actual, expected });
export const deepEq = (actual, expected, msg) =>
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    msg, { actual, expected },
  );
export const approx = (actual, expected, tol, msg) =>
  assert(
    Math.abs(actual - expected) <= tol,
    msg, { actual, expected, tol },
  );

export function summarise() {
  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass);
  return { total, passed, failed, header: `calendrica-js tests — ${passed}/${total} passed` };
}
