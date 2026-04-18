/**
 * calendrica-js — unified entry point.
 *
 * A JavaScript port of the calendrical conversion algorithms from
 *   E. M. Reingold and N. Dershowitz,
 *   "Calendrical Calculations: The Ultimate Edition" (4th ed., 2018).
 *
 * Every calendar module exposes the same shape:
 *   toRd(date) -> integer RD
 *   fromRd(rd) -> date
 *   toJd(date), fromJd(jd)
 *   validate(date) -> { valid, reason? }
 * plus calendar-specific helpers (isLeapYear, daysInMonth, etc.).
 *
 * RD is the universal intermediate. JD = RD + 1721424.5.
 *
 * This port: (c) 2026 Chirag Patnaik, MIT License.
 * Original algorithms: (c) Reingold & Dershowitz. See NOTICE.
 */

import * as gregorianMod from "./gregorian.js";
import * as julianMod from "./julian.js";
import * as isoWeekMod from "./iso-week.js";
import * as copticMod from "./coptic.js";
import * as ethiopianMod from "./ethiopian.js";
import * as egyptianMod from "./egyptian.js";
import * as islamicArithmeticMod from "./islamic-arithmetic.js";
import * as frenchRepublicanMod from "./french-republican.js";
import * as frenchRepublicanAstroMod from "./french-republican-astronomical.js";
import * as byzantineMod from "./byzantine.js";
import * as kaliYugaMod from "./kali-yuga.js";
import * as discordianMod from "./discordian.js";
import * as mayaMod from "./maya.js";
import * as japaneseMod from "./japanese.js";
import * as hebrewMod from "./hebrew.js";
import * as buddhistMod from "./buddhist.js";
import * as solarHijriMod from "./solar-hijri.js";
import * as solarHijriAstroMod from "./solar-hijri-astronomical.js";
import * as chineseMod from "./chinese.js";
import * as hinduShakaMod from "./hindu-shaka.js";
import * as babylonianMod from "./babylonian.js";
import * as islamicUmmAlQuraMod from "./islamic-umm-al-qura.js";
import * as hinduVikramMod from "./hindu-vikram.js";
import * as nanakshahiMod from "./nanakshahi.js";
import * as hinduVikramPurnimantaMod from "./hindu-vikram-purnimanta.js";
import * as myanmarMod from "./myanmar.js";

export const gregorian = gregorianMod;
export const julian = julianMod;
export const isoWeek = isoWeekMod;
export const coptic = copticMod;
export const ethiopian = ethiopianMod;
export const egyptian = egyptianMod;
export const islamicArithmetic = islamicArithmeticMod;
export const frenchRepublican = frenchRepublicanMod;
export const frenchRepublicanAstronomical = frenchRepublicanAstroMod;
export const byzantine = byzantineMod;
export const kaliYuga = kaliYugaMod;
export const discordian = discordianMod;
export const maya = mayaMod;
export const japanese = japaneseMod;
export const hebrew = hebrewMod;
export const buddhist = buddhistMod;
export const solarHijri = solarHijriMod;
export const solarHijriAstronomical = solarHijriAstroMod;
export const chinese = chineseMod;
export const hinduShaka = hinduShakaMod;
export const babylonian = babylonianMod;
export const islamicUmmAlQura = islamicUmmAlQuraMod;
export const hinduVikram = hinduVikramMod;
export const hinduVikramPurnimanta = hinduVikramPurnimantaMod;
export const nanakshahi = nanakshahiMod;
export const myanmar = myanmarMod;

/**
 * Registry of calendars keyed by id. Each entry is a module with
 * toRd/fromRd methods. Maya is a compound calendar with three
 * sub-systems; only Long Count has a reversible toRd/fromRd, so
 * the registry registers that. Haab and Tzolk'in are accessible
 * via `maya.haab` and `maya.tzolkin` for cyclic lookups.
 */
export const calendars = Object.freeze({
  [gregorianMod.ID]: gregorianMod,
  [julianMod.ID]: julianMod,
  [isoWeekMod.ID]: isoWeekMod,
  [copticMod.ID]: copticMod,
  [ethiopianMod.ID]: ethiopianMod,
  [egyptianMod.ID]: egyptianMod,
  [islamicArithmeticMod.ID]: islamicArithmeticMod,
  [frenchRepublicanMod.ID]: frenchRepublicanMod,
  [frenchRepublicanAstroMod.ID]: frenchRepublicanAstroMod,
  [byzantineMod.ID]: byzantineMod,
  [kaliYugaMod.ID]: kaliYugaMod,
  [discordianMod.ID]: discordianMod,
  [mayaMod.longCount.ID]: mayaMod.longCount,
  [mayaMod.haab.ID]: mayaMod.haab,
  [mayaMod.tzolkin.ID]: mayaMod.tzolkin,
  [japaneseMod.ID]: japaneseMod,
  [hebrewMod.ID]: hebrewMod,
  [buddhistMod.ID]: buddhistMod,
  [solarHijriMod.ID]: solarHijriMod,
  [solarHijriAstroMod.ID]: solarHijriAstroMod,
  [chineseMod.ID]: chineseMod,
  [hinduShakaMod.ID]: hinduShakaMod,
  [babylonianMod.ID]: babylonianMod,
  [islamicUmmAlQuraMod.ID]: islamicUmmAlQuraMod,
  [hinduVikramMod.ID]: hinduVikramMod,
  [hinduVikramPurnimantaMod.ID]: hinduVikramPurnimantaMod,
  [nanakshahiMod.ID]: nanakshahiMod,
  [myanmarMod.ID]: myanmarMod,
});

/** Look up a calendar module by id, or throw. */
export const get = id => {
  const cal = calendars[id];
  if (!cal) throw new Error(`unknown calendar id: ${id}`);
  return cal;
};

export const toRd = (id, date) => get(id).toRd(date);
export const fromRd = (id, rd) => get(id).fromRd(rd);
export const toJd = (id, date) => get(id).toJd(date);
export const fromJd = (id, jd) => get(id).fromJd(jd);

/**
 * Convert a date from one calendar to another via the RD intermediate.
 *   convert("gregorian", "julian", { year: 2026, month: 4, day: 18 })
 */
export const convert = (fromId, toId, date) => fromRd(toId, toRd(fromId, date));

// Re-export low-level primitives for advanced users.
export {
  mod, quotient, amod,
  JD_EPOCH, rdFromJd, jdFromRd,
  dayOfWeek, isoWeekday, WEEKDAY_NAMES,
  SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY,
  kdayOnOrBefore, kdayOnOrAfter, kdayNearest, kdayBefore, kdayAfter,
  rdFromUtcDate,
} from "./julian-day.js";
