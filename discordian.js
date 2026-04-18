/**
 * discordian.js — Discordian calendar, from the Principia Discordia (1963).
 *
 * A satirical calendar; included in Mechanikon as a pedagogical
 * reminder that calendar design is culturally constructed. 5 seasons
 * of 73 days (365 total), a 5-day week, year numbering from 1166 BCE
 * (Year of Our Lady of Discord, "YOLD"). In Gregorian leap years, a
 * "St. Tib's Day" is inserted between Chaos 59 and Chaos 60; it is
 * outside the regular day/season/week sequence.
 *
 * Conversion rule:
 *   Discordian year = Gregorian year + 1166.
 *   Year begins 1 January (Gregorian).
 *
 * Sources:
 *   - Principia Discordia (Kerry Thornley & Greg Hill, 1963–1970).
 *   - Robert Anton Wilson & Robert Shea, Illuminatus! trilogy.
 *
 * This port (c) 2026 Chirag Patnaik, MIT License.
 */

import { jdFromRd, rdFromJd, quotient, mod } from "./julian-day.js";
import * as gregorian from "./gregorian.js";

export const ID = "discordian";
export const DISPLAY_NAME = "Discordian";

export const SEASON_NAMES = [
  null,
  "Chaos", "Discord", "Confusion", "Bureaucracy", "The Aftermath",
];

export const WEEKDAY_NAMES = [
  null,
  "Sweetmorn", "Boomtime", "Pungenday", "Prickle-Prickle", "Setting Orange",
];

/** Offset between Gregorian and Discordian year numbers. */
export const YEAR_OFFSET = 1166;

/**
 * True iff the Discordian year includes St. Tib's Day (equivalently,
 * the underlying Gregorian year is a leap year).
 */
export const hasStTibsDay = year => gregorian.isLeapYear(year - YEAR_OFFSET);

/**
 * Validate a Discordian date. Two shapes:
 *   { year, stTibsDay: true }              — St. Tib's Day
 *   { year, season: 1..5, day: 1..73 }     — a regular day
 */
export const validate = date => {
  if (!Number.isInteger(date.year)) return { valid: false, reason: "year must be an integer" };
  if (date.stTibsDay) {
    if (!hasStTibsDay(date.year)) {
      return { valid: false, reason: `Discordian year ${date.year} has no St. Tib's Day` };
    }
    return { valid: true };
  }
  if (!Number.isInteger(date.season) || date.season < 1 || date.season > 5) {
    return { valid: false, reason: "season must be 1..5" };
  }
  if (!Number.isInteger(date.day) || date.day < 1 || date.day > 73) {
    return { valid: false, reason: "day must be 1..73" };
  }
  return { valid: true };
};

/**
 * RD from Discordian date.
 */
export const toRd = date => {
  const gregYear = date.year - YEAR_OFFSET;
  if (date.stTibsDay) {
    // St. Tib's Day is 29 February Gregorian.
    return gregorian.toRd({ year: gregYear, month: 2, day: 29 });
  }
  // Day-of-year within the 365-day Discordian cycle.
  const doyDiscordian = (date.season - 1) * 73 + date.day;
  // In Gregorian leap years, St. Tib's Day (day 60 Gregorian) sits
  // between Chaos 59 (Greg day 59) and Chaos 60 (Greg day 61), so any
  // Discordian day strictly after Chaos 59 maps to doy_greg + 1.
  const doyGreg = (gregorian.isLeapYear(gregYear) && doyDiscordian > 59)
    ? doyDiscordian + 1
    : doyDiscordian;
  return gregorian.toRd({ year: gregYear, month: 1, day: 1 }) + doyGreg - 1;
};

/**
 * Discordian date from RD.
 */
export const fromRd = rd => {
  const { year: gregYear, month, day } = gregorian.fromRd(rd);
  const jan1 = gregorian.toRd({ year: gregYear, month: 1, day: 1 });
  const doyGreg = rd - jan1 + 1;   // 1-based day of Gregorian year
  const year = gregYear + YEAR_OFFSET;
  const leap = gregorian.isLeapYear(gregYear);
  if (leap && doyGreg === 60) {
    return { year, stTibsDay: true };
  }
  const doyDisc = (leap && doyGreg > 60) ? doyGreg - 1 : doyGreg;
  const season = quotient(doyDisc - 1, 73) + 1;
  const dayOfSeason = mod(doyDisc - 1, 73) + 1;
  return { year, season, day: dayOfSeason };
};

/**
 * 5-day-week weekday (1..5). St. Tib's Day has no weekday and returns null.
 */
export const weekday = date => {
  if (date.stTibsDay) return null;
  const doyDisc = (date.season - 1) * 73 + date.day;
  return mod(doyDisc - 1, 5) + 1;
};

export const toJd = date => jdFromRd(toRd(date));
export const fromJd = jd => fromRd(Math.floor(rdFromJd(jd) + 0.5));
