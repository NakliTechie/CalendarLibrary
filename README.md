# @naklitechie/calendar-library

Convert dates across 28 calendar systems. Pure ES modules, zero dependencies.

```js
import { convert } from "@naklitechie/calendar-library";

convert("gregorian", "hebrew",  { year: 2026, month: 4, day: 18 }); // → { year: 5786, month: 8, day: 20 }
convert("gregorian", "myanmar", { year: 2026, month: 4, day: 18 }); // → { year: 1388, month: 2, day: 5, ... }
convert("gregorian", "chinese", { year: 2026, month: 4, day: 18 }); // → { cycle: 79, year: 3, month: 3, day: 21, ... }
```

## Install

```bash
npm install @naklitechie/calendar-library
```

Or import directly in a browser or Deno via a CDN:

```js
import { convert } from "https://esm.sh/@naklitechie/calendar-library";
```

## Calendars

| ID | Name | Family | Notes |
|----|------|--------|-------|
| `gregorian` | Gregorian | Solar | ISO proleptic |
| `julian` | Julian | Solar | Roman / Orthodox liturgical |
| `iso-week` | ISO Week | Solar | ISO 8601 week dates |
| `coptic` | Coptic | Solar | Ethiopian/Coptic Orthodox |
| `ethiopian` | Ethiopian (Ge'ez) | Solar | 13-month Ethiopic |
| `egyptian` | Egyptian (ancient) | Solar | 365-day wandering year |
| `byzantine` | Byzantine | Solar | Anno Mundi, epoch 5509 BCE |
| `french-republican` | French Republican | Solar | Arithmetic (equinox rule) |
| `french-republican-astronomical` | French Republican (astro) | Solar | True autumnal equinox at Paris |
| `discordian` | Discordian | Solar | YOLD epoch |
| `hebrew` | Hebrew | Lunisolar | Arithmetic Metonic + dehiyyot |
| `islamic-arithmetic` | Islamic (arithmetic) | Lunar | Tabular Hijri |
| `islamic-umm-al-qura` | Islamic Umm al-Qura | Lunar | Saudi official table through AH ~1500 |
| `solar-hijri` | Solar Hijri | Solar | Iranian 2820-year arithmetic |
| `solar-hijri-astronomical` | Solar Hijri (astro) | Solar | True vernal equinox at Tehran |
| `chinese` | Chinese | Lunisolar | Zhōngqì solar-term month labelling |
| `japanese` | Japanese (nengō) | Era-based | 243 eras from Taika 645 CE to Reiwa |
| `hindu-shaka` | Hindu Shaka | Solar | Indian National Calendar |
| `hindu-vikram` | Hindu Vikram Samvat | Lunisolar | Amānta (new-moon month boundary) |
| `hindu-vikram-purnimanta` | Hindu Vikram (pūrṇimānta) | Lunisolar | Full-moon month boundary |
| `nanakshahi` | Nanakshahi | Solar | Sikh calendar, epoch 1469 CE |
| `myanmar` | Myanmar | Lunisolar | Surya Siddhanta; watat intercalation |
| `babylonian` | Babylonian | Lunisolar | Seleucid era; Parker & Dubberstein intercalation |
| `kali-yuga` | Kali Yuga | Solar | Hindu astronomical epoch |
| `buddhist` | Buddhist (Thai solar) | Solar | Gregorian + 543 |
| `maya-long-count` | Maya Long Count | Mesoamerican | Vigesimal; correlation constant GMT |
| `maya-haab` | Maya Haab' | Mesoamerican | 365-day solar count |
| `maya-tzolkin` | Maya Tzolk'in | Mesoamerican | 260-day ritual count |

## API

Every calendar exposes the same interface:

```js
import * as hebrew from "@naklitechie/calendar-library/hebrew";

// Convert a date to Rata Die (universal integer day count)
hebrew.toRd({ year: 5786, month: 8, day: 20 })  // → integer RD

// Convert Rata Die back to a calendar date
hebrew.fromRd(738993)                             // → { year, month, day }

// Convert to/from Julian Day Number
hebrew.toJd(date)
hebrew.fromJd(jd)

// Validate a date
hebrew.validate({ year: 5786, month: 8, day: 20 }) // → { valid: true }
hebrew.validate({ year: 5786, month: 8, day: 99 }) // → { valid: false, reason: "..." }

// Format (where implemented)
hebrew.format({ year: 5786, month: 8, day: 20 })   // → "5786 Cheshvan 20"
```

### One-liner conversion via the index

```js
import { convert, toRd, fromRd } from "@naklitechie/calendar-library";

// Direct cross-calendar conversion
convert("gregorian", "chinese", { year: 2026, month: 4, day: 18 });

// Use RD as a universal intermediate
const rd = toRd("gregorian", { year: 2026, month: 4, day: 18 });
fromRd("hebrew", rd);
fromRd("myanmar", rd);
fromRd("islamic-arithmetic", rd);
```

### Myanmar-specific: intercalary years

```js
import * as myanmar from "@naklitechie/calendar-library/myanmar";

const d = myanmar.fromRd(rd);
// d.intercalary === true  → this is First Waso (only in watat years)
// d.yearType: 0=common, 1=little watat (384d), 2=big watat (385d)

myanmar.format({ year: 1388, month: 4, day: 1, intercalary: true });
// → "ME 1388 First Waso 1"
```

### Japanese: full nengō history

```js
import * as japanese from "@naklitechie/calendar-library/japanese";

japanese.fromRd(rd);
// → { era: "reiwa", eraNameJa: "令和", eraNameRomaji: "Reiwa", year: 8, month: 4, day: 18 }
// Returns null before Taika 645 CE.
// Nanboku-chō eras include a `court: "S"|"N"` property.
```

## RD — the universal intermediate

All calendars share **Rata Die** as a common integer day count. RD 1 = 1 January 1 CE (proleptic Gregorian). This makes any-to-any conversion a two-step operation with no loss of precision.

```
JD = RD + 1721424.5   (Julian Day, continuous)
```

## Sources and attribution

Algorithms are sourced from:
- Reingold & Dershowitz, *Calendrical Calculations: The Ultimate Edition* (4th ed., 2018) — most calendars
- Yan Naing Aung, [mmcal](https://github.com/yan9a/mmcal) (MIT) — Myanmar / Burmese calendar
- Parker & Dubberstein, *Babylonian Chronology* — Babylonian intercalation table
- dalwadani/hijri-converter (MIT) — Umm al-Qura table

See [NOTICE](./NOTICE) for full attributions.

## Used in

- [Mechanikon — Calendars of the World](https://mechanikon.naklitechie.com/calendars/) — an interactive explorer of all 28 calendar systems across three views: concentric rings, horizontal strips, and a lineage tree.

## License

MIT © Chirag Patnaik
