/**
 * data/nengo.js — Pre-Meiji Japanese imperial era names (nengō), Taika through Keiō.
 *
 * Coverage: all 243 officially recognised eras from 645 CE through 1868-10-22
 * (the day before the Meiji era began). Includes both Southern Court (南朝) and
 * Northern Court (北朝) eras for the Nanboku-chō period (1331–1392).
 *
 * Start dates are in the **proleptic Gregorian** calendar (same convention as
 * Reingold & Dershowitz, "Calendrical Calculations" 4th ed.), suitable for direct
 * use with gregorian.toRd() in this library.
 *
 * Calendar conversion notes
 * ─────────────────────────
 * The primary source is the Japanese Wikipedia 元号一覧（日本）table, which renders
 * 西暦 (Western calendar) dates as **Julian** equivalents for all eras up to and
 * including the start of Tenshō (天正, Julian 1573-08-25), and as **Gregorian**
 * equivalents from Bunroku (文禄, 1593-01-10) onwards. This is the convention
 * documented in the table's own notes: "飛鳥時代から天正の始期までユリウス暦".
 *
 * All Julian source dates have been converted to proleptic Gregorian using the
 * fixed-date (R-D) formulas:
 *   fixedFromJulian(y,m,d)  = −1 + 365(y−1) + ⌊(y−1)/4⌋ + ⌊(367m−362)/12⌋ + correction + d
 *   fixedFromGregorian(y,m,d) = standard R-D formula
 * producing the offsets shown in the table below:
 *
 *   Before 300 CE   : Julian +2 days ahead of proleptic Gregorian
 *   300–500 CE      : +3 days
 *   500–700 CE (post-Mar-1, 500) : +4 days   (covers Taika through ~699)
 *   700–900 CE (post-Mar-1, 700) : +5 days   (covers Nara & Heian to ~899)
 *   900–1100 CE     : +6–7 days
 *   1100–1300 CE    : +7–8 days
 *   1300–1500 CE    : +8–9 days
 *   1500–1582       : +10–11 days
 *
 * The Gregorian reform took effect on Gregorian 1582-10-15 (= Julian 1582-10-04).
 * Eras that began between Julian 1582-10-04 and Gregorian 1593-01-10 are covered
 * by Tenshō (which started Julian 1573-08-25 → proleptic Gregorian 1573-09-05).
 *
 * Nanboku-chō period (1331–1392)
 * ────────────────────────────────
 * Two rival courts used overlapping era names simultaneously. Eras are annotated
 * with a `court` property: "S" = Southern Court (南朝, deemed legitimate by the
 * 1911 imperial edict), "N" = Northern Court (北朝). Eras outside this period and
 * the unified Kenmu era have no `court` property.
 *
 * ID conventions
 * ──────────────
 * Era names that appear more than once (because the same kanji/reading was reused
 * in different periods) are disambiguated with numeric suffixes: -1 for the
 * earlier occurrence, -2 for the later:
 *   eisho-1  / eisho-2   (永承 vs 永正)
 *   jogen-1  / jogen-2   (貞元 vs 承元)
 *   joo-1    / joo-2     (貞応 vs 承応)
 *   koji-1   / koji-2    (康治 vs 弘治)
 *   koan-1   / koan-2    (弘安 vs 康安)
 *   kowa-1   / kowa-2    (康和 vs 弘和)
 *   jowa     / jowa-2    (承和 vs 貞和)   [jowa = Heian; jowa-2 = Northern Court]
 *   showa-1              (正和, Kamakura — distinct from modern 昭和 Shōwa)
 *   tensho-1 / tensho-2  (天承 vs 天正)
 *   genko-1  / genko-2   (元亨 vs 元弘)
 *   enkyo-1  / enkyo-2   (延慶 vs 延享)
 *   enkyu                (延久, Heian — distinct from the Edo 延享 enkyo-2)
 *
 * Sources
 * ───────
 *   Primary  : Japanese Wikipedia 元号一覧（日本）— kanji, readings, Julian 西暦 dates.
 *              Individual era articles consulted for dates where the list article
 *              differed from the individual article (notably Taika, which the list
 *              gives as Jul 29, 645 Julian but the individual article confirms as
 *              Jul 17, 645 Julian, matching 大化元年6月19日).
 *   Secondary: homepages.cwi.nl/~aeb/go/misc/jdate.html — cross-check for all
 *              eras from Bunki (1501) through Keiō (1865).
 *              gengou.terra-support-life.com — Bunchū (1372) start date.
 *   Calendar : Reingold & Dershowitz, "Calendrical Calculations" 4th ed. — Julian
 *              and proleptic Gregorian fixed-date formulas.
 *
 * This data file (c) 2026 Chirag Patnaik, MIT License.
 */

// Each entry: { id, nameJa, nameRomaji, [court,] start: { year, month, day } }
// `start` is the proleptic Gregorian date on which the era was proclaimed.
// Entries are in strict chronological order by start date.
export const PRE_MEIJI_ERAS = [

  // ── ASUKA PERIOD (645–710) ─────────────────────────────────────────────────
  // Regular nengō practice was suspended after Hakuchi until Taihō (701).
  // Shuchō lasted only a few months before being abandoned.

  { id: "taika",        nameJa: "大化",   nameRomaji: "Taika",
    start: { year: 645, month: 7,  day: 21 } },
  { id: "hakuchi",      nameJa: "白雉",   nameRomaji: "Hakuchi",
    start: { year: 650, month: 3,  day: 26 } },
  { id: "sucho",        nameJa: "朱鳥",   nameRomaji: "Suchō",
    start: { year: 686, month: 8,  day: 18 } },

  // ── NARA PERIOD (710–794) ──────────────────────────────────────────────────
  // Tenpyō-kanpō and Tenpyō-shōhō both began in 749 (different months).

  { id: "taiho",        nameJa: "大宝",   nameRomaji: "Taihō",
    start: { year: 701, month: 5,  day:  8 } },
  { id: "keiun",        nameJa: "慶雲",   nameRomaji: "Keiun",
    start: { year: 704, month: 6,  day: 21 } },
  { id: "wado",         nameJa: "和銅",   nameRomaji: "Wadō",
    start: { year: 708, month: 2,  day: 12 } },
  { id: "reiki",        nameJa: "霊亀",   nameRomaji: "Reiki",
    start: { year: 715, month: 10, day:  8 } },
  { id: "yoro",         nameJa: "養老",   nameRomaji: "Yōrō",
    start: { year: 717, month: 12, day: 29 } },
  { id: "jinki",        nameJa: "神亀",   nameRomaji: "Jinki",
    start: { year: 724, month: 3,  day:  8 } },
  { id: "tenpyo",       nameJa: "天平",   nameRomaji: "Tenpyō",
    start: { year: 729, month: 9,  day:  7 } },
  { id: "tenpyo-kanpo", nameJa: "天平感宝", nameRomaji: "Tenpyō-kanpō",
    start: { year: 749, month: 5,  day:  9 } },
  { id: "tenpyo-shoho", nameJa: "天平勝宝", nameRomaji: "Tenpyō-shōhō",
    start: { year: 749, month: 8,  day: 24 } },
  { id: "tenpyo-hoji",  nameJa: "天平宝字", nameRomaji: "Tenpyō-hōji",
    start: { year: 757, month: 9,  day: 11 } },
  { id: "tenpyo-jingo", nameJa: "天平神護", nameRomaji: "Tenpyō-jingo",
    start: { year: 765, month: 2,  day:  6 } },
  { id: "jingo-keiun",  nameJa: "神護景雲", nameRomaji: "Jingo-keiun",
    start: { year: 767, month: 9,  day: 18 } },
  { id: "hoki",         nameJa: "宝亀",   nameRomaji: "Hōki",
    start: { year: 770, month: 10, day: 28 } },
  { id: "ten-o",        nameJa: "天応",   nameRomaji: "Ten'ō",
    start: { year: 781, month: 2,  day:  4 } },
  { id: "enryaku",      nameJa: "延暦",   nameRomaji: "Enryaku",
    start: { year: 782, month: 10, day:  5 } },

  // ── HEIAN PERIOD (794–1185) ────────────────────────────────────────────────

  { id: "daido",        nameJa: "大同",   nameRomaji: "Daidō",
    start: { year: 806, month: 6,  day: 13 } },
  { id: "konin",        nameJa: "弘仁",   nameRomaji: "Kōnin",
    start: { year: 810, month: 10, day: 25 } },
  { id: "tencho",       nameJa: "天長",   nameRomaji: "Tenchō",
    start: { year: 824, month: 2,  day: 13 } },
  { id: "jowa",         nameJa: "承和",   nameRomaji: "Jōwa",
    start: { year: 834, month: 2,  day: 19 } },
  { id: "kasho",        nameJa: "嘉祥",   nameRomaji: "Kashō",
    start: { year: 848, month: 7,  day: 21 } },
  { id: "ninju",        nameJa: "仁寿",   nameRomaji: "Ninju",
    start: { year: 851, month: 6,  day:  6 } },
  { id: "saiko",        nameJa: "斉衡",   nameRomaji: "Saikō",
    start: { year: 854, month: 12, day: 28 } },
  { id: "ten-an",       nameJa: "天安",   nameRomaji: "Ten'an",
    start: { year: 857, month: 3,  day: 25 } },
  { id: "jogan",        nameJa: "貞観",   nameRomaji: "Jōgan",
    start: { year: 859, month: 5,  day: 25 } },
  { id: "gangyo",       nameJa: "元慶",   nameRomaji: "Gangyō",
    start: { year: 877, month: 6,  day:  6 } },
  { id: "ninna",        nameJa: "仁和",   nameRomaji: "Ninna",
    start: { year: 885, month: 3,  day: 16 } },
  { id: "kanpyo",       nameJa: "寛平",   nameRomaji: "Kanpyō",
    start: { year: 889, month: 6,  day:  4 } },
  { id: "shotai",       nameJa: "昌泰",   nameRomaji: "Shōtai",
    start: { year: 898, month: 5,  day: 25 } },
  { id: "engi",         nameJa: "延喜",   nameRomaji: "Engi",
    start: { year: 901, month: 9,  day:  6 } },
  { id: "encho",        nameJa: "延長",   nameRomaji: "Enchō",
    start: { year: 923, month: 6,  day:  4 } },
  { id: "johei",        nameJa: "承平",   nameRomaji: "Jōhei",
    start: { year: 931, month: 5,  day: 22 } },
  { id: "tengyo",       nameJa: "天慶",   nameRomaji: "Tengyō",
    start: { year: 938, month: 6,  day: 28 } },
  { id: "tenryaku",     nameJa: "天暦",   nameRomaji: "Tenryaku",
    start: { year: 947, month: 5,  day: 21 } },
  { id: "tentoku",      nameJa: "天徳",   nameRomaji: "Tentoku",
    start: { year: 957, month: 11, day: 27 } },
  { id: "owa",          nameJa: "応和",   nameRomaji: "Ōwa",
    start: { year: 961, month: 3,  day: 11 } },
  { id: "koho",         nameJa: "康保",   nameRomaji: "Kōhō",
    start: { year: 964, month: 8,  day: 25 } },
  { id: "anna",         nameJa: "安和",   nameRomaji: "Anna",
    start: { year: 968, month: 9,  day: 14 } },
  { id: "tenroku",      nameJa: "天禄",   nameRomaji: "Tenroku",
    start: { year: 970, month: 5,  day:  9 } },
  { id: "ten-en",       nameJa: "天延",   nameRomaji: "Ten'en",
    start: { year: 974, month: 1,  day: 22 } },
  { id: "jogen-1",      nameJa: "貞元",   nameRomaji: "Jōgen",
    start: { year: 976, month: 8,  day: 17 } },
  { id: "tengen",       nameJa: "天元",   nameRomaji: "Tengen",
    start: { year: 979, month: 1,  day:  6 } },
  { id: "eikan",        nameJa: "永観",   nameRomaji: "Eikan",
    start: { year: 983, month: 6,  day:  4 } },
  { id: "kanna",        nameJa: "寛和",   nameRomaji: "Kanna",
    start: { year: 985, month: 5,  day: 25 } },
  { id: "eien",         nameJa: "永延",   nameRomaji: "Eien",
    start: { year: 987, month: 5,  day: 11 } },
  { id: "eiso",         nameJa: "永祚",   nameRomaji: "Eiso",
    start: { year: 989, month: 9,  day: 16 } },
  { id: "shoryaku",     nameJa: "正暦",   nameRomaji: "Shōryaku",
    start: { year: 990, month: 12, day:  2 } },
  { id: "chotoku",      nameJa: "長徳",   nameRomaji: "Chōtoku",
    start: { year: 995, month: 3,  day: 31 } },
  { id: "choho",        nameJa: "長保",   nameRomaji: "Chōhō",
    start: { year: 999, month: 2,  day:  7 } },
  { id: "kanko",        nameJa: "寛弘",   nameRomaji: "Kankō",
    start: { year: 1004, month: 8, day: 15 } },
  { id: "chowa",        nameJa: "長和",   nameRomaji: "Chōwa",
    start: { year: 1013, month: 2, day: 15 } },
  { id: "kannin",       nameJa: "寛仁",   nameRomaji: "Kannin",
    start: { year: 1017, month: 5, day: 28 } },
  { id: "jian",         nameJa: "治安",   nameRomaji: "Jian",
    start: { year: 1021, month: 3, day: 24 } },
  { id: "manju",        nameJa: "万寿",   nameRomaji: "Manju",
    start: { year: 1024, month: 8, day: 26 } },
  { id: "chogen",       nameJa: "長元",   nameRomaji: "Chōgen",
    start: { year: 1028, month: 8, day: 25 } },
  { id: "choryaku",     nameJa: "長暦",   nameRomaji: "Chōryaku",
    start: { year: 1037, month: 5, day: 16 } },
  { id: "chokyu",       nameJa: "長久",   nameRomaji: "Chōkyū",
    start: { year: 1040, month: 12, day: 23 } },
  { id: "kantoku",      nameJa: "寛徳",   nameRomaji: "Kantoku",
    start: { year: 1044, month: 12, day: 23 } },
  { id: "eisho-1",      nameJa: "永承",   nameRomaji: "Eishō",
    start: { year: 1046, month: 5, day: 29 } },
  { id: "tengi",        nameJa: "天喜",   nameRomaji: "Tengi",
    start: { year: 1053, month: 2, day:  9 } },
  { id: "kohei",        nameJa: "康平",   nameRomaji: "Kōhei",
    start: { year: 1058, month: 9, day: 26 } },
  { id: "jiryaku",      nameJa: "治暦",   nameRomaji: "Jiryaku",
    start: { year: 1065, month: 9, day: 11 } },
  { id: "enkyu",        nameJa: "延久",   nameRomaji: "Enkyū",
    start: { year: 1069, month: 5, day: 13 } },
  { id: "joho",         nameJa: "承保",   nameRomaji: "Jōhō",
    start: { year: 1074, month: 9, day: 23 } },
  { id: "joryaku",      nameJa: "承暦",   nameRomaji: "Jōryaku",
    start: { year: 1077, month: 12, day: 12 } },
  { id: "eiho",         nameJa: "永保",   nameRomaji: "Eihō",
    start: { year: 1081, month: 3, day: 29 } },
  { id: "otoku",        nameJa: "応徳",   nameRomaji: "Ōtoku",
    start: { year: 1084, month: 3, day: 22 } },
  { id: "kanji",        nameJa: "寛治",   nameRomaji: "Kanji",
    start: { year: 1087, month: 5, day: 18 } },
  { id: "kaho",         nameJa: "嘉保",   nameRomaji: "Kahō",
    start: { year: 1095, month: 1, day: 30 } },
  { id: "eicho",        nameJa: "永長",   nameRomaji: "Eichō",
    start: { year: 1097, month: 1, day: 10 } },
  { id: "jotoku",       nameJa: "承徳",   nameRomaji: "Jōtoku",
    start: { year: 1098, month: 1, day:  3 } },
  { id: "kowa-1",       nameJa: "康和",   nameRomaji: "Kōwa",
    start: { year: 1099, month: 9, day: 22 } },
  { id: "choji",        nameJa: "長治",   nameRomaji: "Chōji",
    start: { year: 1104, month: 3, day: 16 } },
  { id: "kajo",         nameJa: "嘉承",   nameRomaji: "Kajō",
    start: { year: 1106, month: 5, day: 21 } },
  { id: "tennin",       nameJa: "天仁",   nameRomaji: "Tennin",
    start: { year: 1108, month: 9, day: 17 } },
  { id: "ten-ei",       nameJa: "天永",   nameRomaji: "Ten'ei",
    start: { year: 1110, month: 8, day:  8 } },
  { id: "eikyu",        nameJa: "永久",   nameRomaji: "Eikyū",
    start: { year: 1113, month: 9, day:  2 } },
  { id: "gen-ei",       nameJa: "元永",   nameRomaji: "Gen'ei",
    start: { year: 1118, month: 5, day:  3 } },
  { id: "hoan",         nameJa: "保安",   nameRomaji: "Hōan",
    start: { year: 1120, month: 5, day: 17 } },
  { id: "tenji",        nameJa: "天治",   nameRomaji: "Tenji",
    start: { year: 1124, month: 5, day: 26 } },
  { id: "daiji",        nameJa: "大治",   nameRomaji: "Daiji",
    start: { year: 1126, month: 2, day: 23 } },
  { id: "tensho-1",     nameJa: "天承",   nameRomaji: "Tenshō",
    start: { year: 1131, month: 3, day:  8 } },
  { id: "chosho",       nameJa: "長承",   nameRomaji: "Chōshō",
    start: { year: 1132, month: 9, day: 29 } },
  { id: "hoen",         nameJa: "保延",   nameRomaji: "Hōen",
    start: { year: 1135, month: 6, day: 18 } },
  { id: "eiji",         nameJa: "永治",   nameRomaji: "Eiji",
    start: { year: 1141, month: 8, day: 21 } },
  { id: "koji-1",       nameJa: "康治",   nameRomaji: "Kōji",
    start: { year: 1142, month: 6, day:  2 } },
  { id: "ten-yo",       nameJa: "天養",   nameRomaji: "Ten'yō",
    start: { year: 1144, month: 4, day:  5 } },
  { id: "kyuan",        nameJa: "久安",   nameRomaji: "Kyūan",
    start: { year: 1145, month: 8, day: 20 } },
  { id: "ninpei",       nameJa: "仁平",   nameRomaji: "Ninpei",
    start: { year: 1151, month: 2, day: 22 } },
  { id: "kyuju",        nameJa: "久寿",   nameRomaji: "Kyūju",
    start: { year: 1154, month: 12, day: 12 } },
  { id: "hogen",        nameJa: "保元",   nameRomaji: "Hōgen",
    start: { year: 1156, month: 5, day: 26 } },
  { id: "heiji",        nameJa: "平治",   nameRomaji: "Heiji",
    start: { year: 1159, month: 5, day: 17 } },
  { id: "eiryaku",      nameJa: "永暦",   nameRomaji: "Eiryaku",
    start: { year: 1160, month: 2, day: 26 } },
  { id: "oho",          nameJa: "応保",   nameRomaji: "Ōhō",
    start: { year: 1161, month: 10, day:  2 } },
  { id: "chokan",       nameJa: "長寛",   nameRomaji: "Chōkan",
    start: { year: 1163, month: 5, day: 12 } },
  { id: "eiman",        nameJa: "永万",   nameRomaji: "Eiman",
    start: { year: 1165, month: 7, day: 22 } },
  { id: "nin-an",       nameJa: "仁安",   nameRomaji: "Nin'an",
    start: { year: 1166, month: 10, day:  1 } },
  { id: "kao",          nameJa: "嘉応",   nameRomaji: "Kaō",
    start: { year: 1169, month: 5, day: 14 } },
  { id: "joan",         nameJa: "承安",   nameRomaji: "Jōan",
    start: { year: 1171, month: 6, day:  4 } },
  { id: "angen",        nameJa: "安元",   nameRomaji: "Angen",
    start: { year: 1175, month: 8, day: 24 } },
  { id: "jisho",        nameJa: "治承",   nameRomaji: "Jishō",
    start: { year: 1177, month: 9, day:  6 } },
  { id: "yowa",         nameJa: "養和",   nameRomaji: "Yōwa",
    start: { year: 1181, month: 9, day:  2 } },
  { id: "juei",         nameJa: "寿永",   nameRomaji: "Juei",
    start: { year: 1182, month: 7, day:  7 } },
  { id: "genryaku",     nameJa: "元暦",   nameRomaji: "Genryaku",
    start: { year: 1184, month: 6, day:  4 } },

  // ── KAMAKURA PERIOD (1185–1333) ────────────────────────────────────────────
  // Ryakunin (暦仁) lasted only ~74 days before En'ō was proclaimed.
  // Gennin (元仁) lasted only ~5 months.

  { id: "bunji",        nameJa: "文治",   nameRomaji: "Bunji",
    start: { year: 1185, month: 9, day: 17 } },
  { id: "kenkyu",       nameJa: "建久",   nameRomaji: "Kenkyū",
    start: { year: 1190, month: 5, day: 24 } },
  { id: "shoji",        nameJa: "正治",   nameRomaji: "Shōji",
    start: { year: 1199, month: 5, day: 31 } },
  { id: "kennin",       nameJa: "建仁",   nameRomaji: "Kennin",
    start: { year: 1201, month: 3, day: 27 } },
  { id: "genkyu",       nameJa: "元久",   nameRomaji: "Genkyū",
    start: { year: 1204, month: 3, day: 31 } },
  { id: "ken-ei",       nameJa: "建永",   nameRomaji: "Ken'ei",
    start: { year: 1206, month: 6, day: 13 } },
  { id: "jogen-2",      nameJa: "承元",   nameRomaji: "Jōgen",
    start: { year: 1207, month: 11, day: 24 } },
  { id: "kenryaku",     nameJa: "建暦",   nameRomaji: "Kenryaku",
    start: { year: 1211, month: 5, day:  1 } },
  { id: "kenpo",        nameJa: "建保",   nameRomaji: "Kenpō",
    start: { year: 1214, month: 1, day: 26 } },
  { id: "jokyu",        nameJa: "承久",   nameRomaji: "Jōkyū",
    start: { year: 1219, month: 6, day:  4 } },
  { id: "joo-1",        nameJa: "貞応",   nameRomaji: "Jōō",
    start: { year: 1222, month: 6, day:  2 } },
  { id: "gennin",       nameJa: "元仁",   nameRomaji: "Gennin",
    start: { year: 1225, month: 1, day:  8 } },
  { id: "karoku",       nameJa: "嘉禄",   nameRomaji: "Karoku",
    start: { year: 1225, month: 6, day:  5 } },
  { id: "antei",        nameJa: "安貞",   nameRomaji: "Antei",
    start: { year: 1228, month: 1, day: 26 } },
  { id: "kangi",        nameJa: "寛喜",   nameRomaji: "Kangi",
    start: { year: 1229, month: 4, day:  8 } },
  { id: "joei",         nameJa: "貞永",   nameRomaji: "Jōei",
    start: { year: 1232, month: 5, day:  1 } },
  { id: "tenpuku",      nameJa: "天福",   nameRomaji: "Tenpuku",
    start: { year: 1233, month: 6, day:  2 } },
  { id: "bunryaku",     nameJa: "文暦",   nameRomaji: "Bunryaku",
    start: { year: 1234, month: 12, day:  5 } },
  { id: "katei",        nameJa: "嘉禎",   nameRomaji: "Katei",
    start: { year: 1235, month: 11, day:  9 } },
  // Ryakunin: very short — only ~74 days
  { id: "ryakunin",     nameJa: "暦仁",   nameRomaji: "Ryakunin",
    start: { year: 1239, month: 1, day:  7 } },
  { id: "en-o",         nameJa: "延応",   nameRomaji: "En'ō",
    start: { year: 1239, month: 3, day: 21 } },
  { id: "ninji",        nameJa: "仁治",   nameRomaji: "Ninji",
    start: { year: 1240, month: 8, day: 13 } },
  { id: "kangen",       nameJa: "寛元",   nameRomaji: "Kangen",
    start: { year: 1243, month: 3, day: 26 } },
  { id: "hoji",         nameJa: "宝治",   nameRomaji: "Hōji",
    start: { year: 1247, month: 4, day: 13 } },
  { id: "kencho",       nameJa: "建長",   nameRomaji: "Kenchō",
    start: { year: 1249, month: 5, day: 10 } },
  { id: "kogen",        nameJa: "康元",   nameRomaji: "Kōgen",
    start: { year: 1256, month: 11, day:  1 } },
  { id: "shoka",        nameJa: "正嘉",   nameRomaji: "Shōka",
    start: { year: 1257, month: 4, day:  8 } },
  { id: "shogen",       nameJa: "正元",   nameRomaji: "Shōgen",
    start: { year: 1259, month: 4, day: 28 } },
  { id: "bun-o",        nameJa: "文応",   nameRomaji: "Bun'ō",
    start: { year: 1260, month: 6, day:  1 } },
  { id: "kocho",        nameJa: "弘長",   nameRomaji: "Kōchō",
    start: { year: 1261, month: 3, day: 30 } },
  { id: "bun-ei",       nameJa: "文永",   nameRomaji: "Bun'ei",
    start: { year: 1264, month: 4, day:  4 } },
  { id: "kenji",        nameJa: "建治",   nameRomaji: "Kenji",
    start: { year: 1275, month: 5, day: 30 } },
  { id: "koan-1",       nameJa: "弘安",   nameRomaji: "Kōan",
    start: { year: 1278, month: 3, day: 31 } },
  { id: "shoo",         nameJa: "正応",   nameRomaji: "Shōō",
    start: { year: 1288, month: 6, day:  6 } },
  { id: "einin",        nameJa: "永仁",   nameRomaji: "Einin",
    start: { year: 1293, month: 9, day: 14 } },
  { id: "shoan",        nameJa: "正安",   nameRomaji: "Shōan",
    start: { year: 1299, month: 6, day:  2 } },
  { id: "kengen",       nameJa: "乾元",   nameRomaji: "Kengen",
    start: { year: 1302, month: 12, day: 19 } },
  { id: "kagen",        nameJa: "嘉元",   nameRomaji: "Kagen",
    start: { year: 1303, month: 9, day: 25 } },
  { id: "tokuji",       nameJa: "徳治",   nameRomaji: "Tokuji",
    start: { year: 1307, month: 1, day: 27 } },
  { id: "enkyo-1",      nameJa: "延慶",   nameRomaji: "Enkyō",
    start: { year: 1308, month: 12, day:  1 } },
  { id: "ocho",         nameJa: "応長",   nameRomaji: "Ōchō",
    start: { year: 1311, month: 5, day: 26 } },
  { id: "showa-1",      nameJa: "正和",   nameRomaji: "Shōwa",
    start: { year: 1312, month: 5, day:  6 } },
  { id: "bunpo",        nameJa: "文保",   nameRomaji: "Bunpō",
    start: { year: 1317, month: 3, day: 25 } },
  { id: "gen-o",        nameJa: "元応",   nameRomaji: "Gen'ō",
    start: { year: 1319, month: 5, day: 27 } },
  { id: "genko-1",      nameJa: "元亨",   nameRomaji: "Genkō",
    start: { year: 1321, month: 3, day: 31 } },
  { id: "shochu",       nameJa: "正中",   nameRomaji: "Shōchū",
    start: { year: 1325, month: 1, day:  3 } },
  { id: "karyaku",      nameJa: "嘉暦",   nameRomaji: "Karyaku",
    start: { year: 1326, month: 6, day:  6 } },
  { id: "gentoku",      nameJa: "元徳",   nameRomaji: "Gentoku",
    start: { year: 1329, month: 10, day:  1 } },

  // ── NANBOKU-CHŌ PERIOD (1331–1392) ────────────────────────────────────────
  // Southern Court (S) and Northern Court (N) eras are interleaved by start date.
  // The Japanese government recognised the Southern Court as the legitimate line
  // by imperial edict in 1911; Northern Court eras are nonetheless included here
  // for completeness and historical accuracy.
  // Kenmu (建武) was initially a unified era after the Kemmu Restoration; it is
  // listed without a court designation.

  { id: "genko-2",      nameJa: "元弘",   nameRomaji: "Genkō",   court: "S",
    start: { year: 1331, month: 9, day: 20 } },
  // Shōkyō: Northern Court counter-era, proclaimed by Kōgon-tennō's partisans.
  { id: "shokyo",       nameJa: "正慶",   nameRomaji: "Shōkyō",  court: "N",
    start: { year: 1332, month: 6, day:  1 } },
  // Kenmu: unified under Go-Daigo after the Kemmu Restoration; both courts used it.
  { id: "kenmu",        nameJa: "建武",   nameRomaji: "Kenmu",
    start: { year: 1334, month: 3, day: 14 } },
  // Engen: Go-Daigo proclaimed this after escaping to Yoshino (Southern Court).
  { id: "engen",        nameJa: "延元",   nameRomaji: "Engen",   court: "S",
    start: { year: 1336, month: 4, day: 20 } },
  // Ryakuō: Ashikaga Takauji's Northern Court adopted this after Kenmu ended.
  { id: "ryakuo",       nameJa: "暦応",   nameRomaji: "Ryakuō",  court: "N",
    start: { year: 1338, month: 10, day: 20 } },
  { id: "kokoku",       nameJa: "興国",   nameRomaji: "Kōkoku",  court: "S",
    start: { year: 1340, month: 6, day:  3 } },
  { id: "koei",         nameJa: "康永",   nameRomaji: "Kōei",    court: "N",
    start: { year: 1342, month: 6, day: 10 } },
  { id: "jowa-2",       nameJa: "貞和",   nameRomaji: "Jōwa",    court: "N",
    start: { year: 1345, month: 11, day: 24 } },
  { id: "shohei",       nameJa: "正平",   nameRomaji: "Shōhei",  court: "S",
    start: { year: 1347, month: 1, day: 29 } },
  { id: "kan-o",        nameJa: "観応",   nameRomaji: "Kan'ō",   court: "N",
    start: { year: 1350, month: 4, day: 13 } },
  { id: "bunna",        nameJa: "文和",   nameRomaji: "Bunna",   court: "N",
    start: { year: 1352, month: 11, day: 13 } },
  { id: "enbun",        nameJa: "延文",   nameRomaji: "Enbun",   court: "N",
    start: { year: 1356, month: 5, day:  8 } },
  { id: "koan-2",       nameJa: "康安",   nameRomaji: "Kōan",    court: "N",
    start: { year: 1361, month: 5, day: 13 } },
  { id: "joji",         nameJa: "貞治",   nameRomaji: "Jōji",    court: "N",
    start: { year: 1362, month: 10, day: 20 } },
  { id: "oan",          nameJa: "応安",   nameRomaji: "Ōan",     court: "N",
    start: { year: 1368, month: 3, day: 16 } },
  { id: "kentoku",      nameJa: "建徳",   nameRomaji: "Kentoku", court: "S",
    start: { year: 1370, month: 8, day: 25 } },
  { id: "bunchu",       nameJa: "文中",   nameRomaji: "Bunchū",  court: "S",
    // Exact day uncertain; earliest attested reference is 建徳3年4月 = Julian 1372-05.
    // Source: gengou.terra-support-life.com gives 1372-05-01 Julian → PG 1372-05-10.
    start: { year: 1372, month: 5, day: 10 } },
  { id: "eiwa",         nameJa: "永和",   nameRomaji: "Eiwa",    court: "N",
    start: { year: 1375, month: 4, day:  7 } },
  { id: "tenju",        nameJa: "天授",   nameRomaji: "Tenju",   court: "S",
    start: { year: 1375, month: 7, day:  5 } },
  { id: "koryaku",      nameJa: "康暦",   nameRomaji: "Kōryaku", court: "N",
    start: { year: 1379, month: 4, day: 18 } },
  { id: "kowa-2",       nameJa: "弘和",   nameRomaji: "Kōwa",    court: "S",
    start: { year: 1381, month: 3, day: 15 } },
  { id: "eitoku",       nameJa: "永徳",   nameRomaji: "Eitoku",  court: "N",
    start: { year: 1381, month: 3, day: 29 } },
  { id: "shitoku",      nameJa: "至徳",   nameRomaji: "Shitoku", court: "N",
    start: { year: 1384, month: 3, day: 28 } },
  { id: "genchu",       nameJa: "元中",   nameRomaji: "Genchū",  court: "S",
    start: { year: 1384, month: 5, day: 27 } },
  { id: "kakei",        nameJa: "嘉慶",   nameRomaji: "Kakei",   court: "N",
    start: { year: 1387, month: 10, day: 14 } },
  { id: "koo",          nameJa: "康応",   nameRomaji: "Kōō",     court: "N",
    start: { year: 1389, month: 3, day: 16 } },
  { id: "meitoku",      nameJa: "明徳",   nameRomaji: "Meitoku", court: "N",
    start: { year: 1390, month: 4, day: 21 } },
  // Genchū (Southern Court) ended Oct 5, 1392 when Go-Kameyama abdicated and
  // the courts were reunified. Ōei began on 1394-08-11 PG.

  // ── MUROMACHI PERIOD (1394–1573) ───────────────────────────────────────────

  { id: "oei",          nameJa: "応永",   nameRomaji: "Ōei",
    start: { year: 1394, month: 8, day: 11 } },
  { id: "shocho",       nameJa: "正長",   nameRomaji: "Shōchō",
    start: { year: 1428, month: 6, day: 20 } },
  { id: "eikyo",        nameJa: "永享",   nameRomaji: "Eikyō",
    start: { year: 1429, month: 10, day: 13 } },
  { id: "kakitsu",      nameJa: "嘉吉",   nameRomaji: "Kakitsu",
    start: { year: 1441, month: 3, day: 20 } },
  { id: "bun-an",       nameJa: "文安",   nameRomaji: "Bun'an",
    start: { year: 1444, month: 3, day:  4 } },
  { id: "hotoku",       nameJa: "宝徳",   nameRomaji: "Hōtoku",
    start: { year: 1449, month: 8, day: 26 } },
  { id: "kyotoku",      nameJa: "享徳",   nameRomaji: "Kyōtoku",
    start: { year: 1452, month: 8, day: 20 } },
  { id: "kosho",        nameJa: "康正",   nameRomaji: "Kōshō",
    start: { year: 1455, month: 9, day: 16 } },
  { id: "choroku",      nameJa: "長禄",   nameRomaji: "Chōroku",
    start: { year: 1457, month: 10, day: 26 } },
  { id: "kansho",       nameJa: "寛正",   nameRomaji: "Kanshō",
    start: { year: 1461, month: 2, day: 11 } },
  { id: "bunsho",       nameJa: "文正",   nameRomaji: "Bunshō",
    start: { year: 1466, month: 3, day: 24 } },
  { id: "onin",         nameJa: "応仁",   nameRomaji: "Ōnin",
    start: { year: 1467, month: 4, day: 19 } },
  { id: "bunmei",       nameJa: "文明",   nameRomaji: "Bunmei",
    start: { year: 1469, month: 6, day: 18 } },
  { id: "chokyo",       nameJa: "長享",   nameRomaji: "Chōkyō",
    start: { year: 1487, month: 8, day: 19 } },
  { id: "entoku",       nameJa: "延徳",   nameRomaji: "Entoku",
    start: { year: 1489, month: 9, day: 26 } },
  { id: "meio",         nameJa: "明応",   nameRomaji: "Meiō",
    start: { year: 1492, month: 8, day: 22 } },
  { id: "bunki",        nameJa: "文亀",   nameRomaji: "Bunki",
    start: { year: 1501, month: 3, day: 29 } },
  { id: "eisho-2",      nameJa: "永正",   nameRomaji: "Eishō",
    start: { year: 1504, month: 3, day: 27 } },
  { id: "daiei",        nameJa: "大永",   nameRomaji: "Daiei",
    start: { year: 1521, month: 10, day:  4 } },
  { id: "kyoroku",      nameJa: "享禄",   nameRomaji: "Kyōroku",
    start: { year: 1528, month: 9, day: 14 } },
  { id: "tenbun",       nameJa: "天文",   nameRomaji: "Tenbun",
    start: { year: 1532, month: 9, day:  9 } },
  { id: "koji-2",       nameJa: "弘治",   nameRomaji: "Kōji",
    start: { year: 1555, month: 11, day: 18 } },
  { id: "eiroku",       nameJa: "永禄",   nameRomaji: "Eiroku",
    start: { year: 1558, month: 3, day: 29 } },
  { id: "genki",        nameJa: "元亀",   nameRomaji: "Genki",
    start: { year: 1570, month: 6, day:  7 } },

  // ── AZUCHI-MOMOYAMA PERIOD (1573–1615) ────────────────────────────────────
  // Tenshō (天正): source date Julian 1573-08-25 → proleptic Gregorian 1573-09-05.
  // Bunroku and later: source dates are already Gregorian (post-1582 reform).

  { id: "tensho-2",     nameJa: "天正",   nameRomaji: "Tenshō",
    start: { year: 1573, month: 9, day:  5 } },
  { id: "bunroku",      nameJa: "文禄",   nameRomaji: "Bunroku",
    start: { year: 1593, month: 1, day: 10 } },
  { id: "keicho",       nameJa: "慶長",   nameRomaji: "Keichō",
    start: { year: 1596, month: 12, day: 16 } },

  // ── EDO PERIOD (1615–1868) ─────────────────────────────────────────────────
  // All dates are proleptic Gregorian (same as the source 西暦 column, which uses
  // the Gregorian calendar for all post-1582 dates).

  { id: "genna",        nameJa: "元和",   nameRomaji: "Genna",
    start: { year: 1615, month: 9, day:  5 } },
  { id: "kan-ei",       nameJa: "寛永",   nameRomaji: "Kan'ei",
    start: { year: 1624, month: 4, day: 17 } },
  { id: "shoho",        nameJa: "正保",   nameRomaji: "Shōhō",
    start: { year: 1645, month: 1, day: 13 } },
  { id: "keian",        nameJa: "慶安",   nameRomaji: "Keian",
    start: { year: 1648, month: 4, day:  7 } },
  { id: "joo-2",        nameJa: "承応",   nameRomaji: "Jōō",
    start: { year: 1652, month: 10, day: 20 } },
  { id: "meireki",      nameJa: "明暦",   nameRomaji: "Meireki",
    start: { year: 1655, month: 5, day: 18 } },
  { id: "manji",        nameJa: "万治",   nameRomaji: "Manji",
    start: { year: 1658, month: 8, day: 21 } },
  { id: "kanbun",       nameJa: "寛文",   nameRomaji: "Kanbun",
    start: { year: 1661, month: 5, day: 23 } },
  { id: "enpo",         nameJa: "延宝",   nameRomaji: "Enpō",
    start: { year: 1673, month: 10, day: 30 } },
  { id: "tenna",        nameJa: "天和",   nameRomaji: "Tenna",
    start: { year: 1681, month: 11, day:  9 } },
  { id: "jokyo",        nameJa: "貞享",   nameRomaji: "Jōkyō",
    start: { year: 1684, month: 4, day:  5 } },
  { id: "genroku",      nameJa: "元禄",   nameRomaji: "Genroku",
    start: { year: 1688, month: 10, day: 23 } },
  { id: "hoei",         nameJa: "宝永",   nameRomaji: "Hōei",
    start: { year: 1704, month: 4, day: 16 } },
  { id: "shotoku",      nameJa: "正徳",   nameRomaji: "Shōtoku",
    start: { year: 1711, month: 6, day: 11 } },
  { id: "kyoho",        nameJa: "享保",   nameRomaji: "Kyōhō",
    start: { year: 1716, month: 8, day:  9 } },
  { id: "genbun",       nameJa: "元文",   nameRomaji: "Genbun",
    start: { year: 1736, month: 6, day:  7 } },
  { id: "kanpo",        nameJa: "寛保",   nameRomaji: "Kanpō",
    start: { year: 1741, month: 4, day: 12 } },
  { id: "enkyo-2",      nameJa: "延享",   nameRomaji: "Enkyō",
    start: { year: 1744, month: 4, day:  3 } },
  { id: "kan-en",       nameJa: "寛延",   nameRomaji: "Kan'en",
    start: { year: 1748, month: 8, day:  5 } },
  { id: "horeki",       nameJa: "宝暦",   nameRomaji: "Hōreki",
    start: { year: 1751, month: 12, day: 14 } },
  { id: "meiwa",        nameJa: "明和",   nameRomaji: "Meiwa",
    start: { year: 1764, month: 6, day: 30 } },
  { id: "an-ei",        nameJa: "安永",   nameRomaji: "An'ei",
    start: { year: 1772, month: 12, day: 10 } },
  { id: "tenmei",       nameJa: "天明",   nameRomaji: "Tenmei",
    start: { year: 1781, month: 4, day: 25 } },
  { id: "kansei",       nameJa: "寛政",   nameRomaji: "Kansei",
    start: { year: 1789, month: 2, day: 19 } },
  { id: "kyowa",        nameJa: "享和",   nameRomaji: "Kyōwa",
    start: { year: 1801, month: 3, day: 19 } },
  { id: "bunka",        nameJa: "文化",   nameRomaji: "Bunka",
    start: { year: 1804, month: 3, day: 22 } },
  { id: "bunsei",       nameJa: "文政",   nameRomaji: "Bunsei",
    start: { year: 1818, month: 5, day: 26 } },
  { id: "tempo",        nameJa: "天保",   nameRomaji: "Tenpō",
    start: { year: 1831, month: 1, day: 23 } },
  { id: "koka",         nameJa: "弘化",   nameRomaji: "Kōka",
    start: { year: 1845, month: 1, day:  9 } },
  { id: "kaei",         nameJa: "嘉永",   nameRomaji: "Kaei",
    start: { year: 1848, month: 4, day:  1 } },
  { id: "ansei",        nameJa: "安政",   nameRomaji: "Ansei",
    start: { year: 1855, month: 1, day: 15 } },
  { id: "man-en",       nameJa: "万延",   nameRomaji: "Man'en",
    start: { year: 1860, month: 4, day:  8 } },
  { id: "bunkyu",       nameJa: "文久",   nameRomaji: "Bunkyū",
    start: { year: 1861, month: 3, day: 29 } },
  { id: "genji",        nameJa: "元治",   nameRomaji: "Genji",
    start: { year: 1864, month: 3, day: 27 } },
  { id: "keio",         nameJa: "慶応",   nameRomaji: "Keiō",
    start: { year: 1865, month: 5, day:  1 } },
  // Keiō ended 1868-10-22 (the day before Meiji began).
];
