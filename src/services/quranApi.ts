import type { Chapter, Ayah } from '../types';

export const SURAH_START_PAGES: Record<number, number> = {
  1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177, 9: 187, 10: 208,
  11: 221, 12: 235, 13: 249, 14: 255, 15: 262, 16: 267, 17: 282, 18: 293, 19: 305, 20: 312,
  21: 322, 22: 332, 23: 342, 24: 350, 25: 359, 26: 367, 27: 377, 28: 385, 29: 396, 30: 404,
  31: 411, 32: 415, 33: 418, 34: 428, 35: 434, 36: 440, 37: 446, 38: 453, 39: 458, 40: 467,
  41: 477, 42: 483, 43: 489, 44: 496, 45: 499, 46: 502, 47: 511, 48: 515, 49: 518, 50: 520,
  51: 523, 52: 526, 53: 528, 54: 531, 55: 534, 56: 537, 57: 542, 58: 545, 59: 549, 60: 551,
  61: 553, 62: 554, 63: 556, 64: 558, 65: 560, 66: 562, 67: 564, 68: 568, 69: 570, 70: 572,
  71: 574, 72: 576, 73: 578, 74: 580, 75: 582, 76: 585, 77: 586, 78: 589, 79: 591, 80: 593,
  81: 595, 82: 596, 83: 598, 84: 600, 85: 601, 86: 602, 87: 603, 88: 604, 89: 605, 90: 605,
  91: 605, 92: 606, 93: 606, 94: 607, 95: 607, 96: 608, 97: 608, 98: 608, 99: 609, 100: 609,
  101: 610, 102: 610, 103: 611, 104: 611, 105: 612, 106: 612, 107: 612, 108: 613, 109: 613, 110: 613,
  111: 613, 112: 614, 113: 614, 114: 614
};


// Static metadata registry of all 114 Surahs for instant offline loads
export const SURAHS_METADATA: Chapter[] = [
  { id: 1, name_arabic: "الفاتحة", name_simple: "Al-Fatihah", verses_count: 7, revelation_place: "makkah", revelation_order: 5, bismillah_pre: false },
  { id: 2, name_arabic: "البقرة", name_simple: "Al-Baqarah", verses_count: 286, revelation_place: "madinah", revelation_order: 87, bismillah_pre: true },
  { id: 3, name_arabic: "آل عمران", name_simple: "Ali 'Imran", verses_count: 200, revelation_place: "madinah", revelation_order: 89, bismillah_pre: true },
  { id: 4, name_arabic: "النساء", name_simple: "An-Nisa", verses_count: 176, revelation_place: "madinah", revelation_order: 92, bismillah_pre: true },
  { id: 5, name_arabic: "المائدة", name_simple: "Al-Ma'idah", verses_count: 120, revelation_place: "madinah", revelation_order: 112, bismillah_pre: true },
  { id: 6, name_arabic: "الأنعام", name_simple: "Al-An'am", verses_count: 165, revelation_place: "makkah", revelation_order: 55, bismillah_pre: true },
  { id: 7, name_arabic: "الأعراف", name_simple: "Al-A'raf", verses_count: 206, revelation_place: "makkah", revelation_order: 39, bismillah_pre: true },
  { id: 8, name_arabic: "الأنفال", name_simple: "Al-Anfal", verses_count: 75, revelation_place: "madinah", revelation_order: 88, bismillah_pre: true },
  { id: 9, name_arabic: "التوبة", name_simple: "At-Tawbah", verses_count: 129, revelation_place: "madinah", revelation_order: 113, bismillah_pre: false },
  { id: 10, name_arabic: "يونس", name_simple: "Yunus", verses_count: 109, revelation_place: "makkah", revelation_order: 51, bismillah_pre: true },
  { id: 11, name_arabic: "هود", name_simple: "Hud", verses_count: 123, revelation_place: "makkah", revelation_order: 52, bismillah_pre: true },
  { id: 12, name_arabic: "يوسف", name_simple: "Yusuf", verses_count: 111, revelation_place: "makkah", revelation_order: 53, bismillah_pre: true },
  { id: 13, name_arabic: "الرعد", name_simple: "Ar-Ra'd", verses_count: 43, revelation_place: "madinah", revelation_order: 96, bismillah_pre: true },
  { id: 14, name_arabic: "إبراهيم", name_simple: "Ibrahim", verses_count: 52, revelation_place: "makkah", revelation_order: 72, bismillah_pre: true },
  { id: 15, name_arabic: "الحجر", name_simple: "Al-Hijr", verses_count: 99, revelation_place: "makkah", revelation_order: 54, bismillah_pre: true },
  { id: 16, name_arabic: "النحل", name_simple: "An-Nahl", verses_count: 128, revelation_place: "makkah", revelation_order: 70, bismillah_pre: true },
  { id: 17, name_arabic: "الإسراء", name_simple: "Al-Isra", verses_count: 111, revelation_place: "makkah", revelation_order: 50, bismillah_pre: true },
  { id: 18, name_arabic: "الكهف", name_simple: "Al-Kahf", verses_count: 110, revelation_place: "makkah", revelation_order: 69, bismillah_pre: true },
  { id: 19, name_arabic: "مريم", name_simple: "Maryam", verses_count: 98, revelation_place: "makkah", revelation_order: 44, bismillah_pre: true },
  { id: 20, name_arabic: "طه", name_simple: "Taha", verses_count: 135, revelation_place: "makkah", revelation_order: 45, bismillah_pre: true },
  { id: 21, name_arabic: "الأنبياء", name_simple: "Al-Anbiya", verses_count: 112, revelation_place: "makkah", revelation_order: 73, bismillah_pre: true },
  { id: 22, name_arabic: "الحج", name_simple: "Al-Hajj", verses_count: 78, revelation_place: "madinah", revelation_order: 103, bismillah_pre: true },
  { id: 23, name_arabic: "المؤمنون", name_simple: "Al-Mu'minun", verses_count: 118, revelation_place: "makkah", revelation_order: 74, bismillah_pre: true },
  { id: 24, name_arabic: "النور", name_simple: "An-Nur", verses_count: 64, revelation_place: "madinah", revelation_order: 102, bismillah_pre: true },
  { id: 25, name_arabic: "الفرقان", name_simple: "Al-Furqan", verses_count: 77, revelation_place: "makkah", revelation_order: 42, bismillah_pre: true },
  { id: 26, name_arabic: "الشعراء", name_simple: "Ash-Shu'ara", verses_count: 227, revelation_place: "makkah", revelation_order: 47, bismillah_pre: true },
  { id: 27, name_arabic: "النمل", name_simple: "An-Naml", verses_count: 93, revelation_place: "makkah", revelation_order: 48, bismillah_pre: true },
  { id: 28, name_arabic: "القصص", name_simple: "Al-Qasas", verses_count: 88, revelation_place: "makkah", revelation_order: 49, bismillah_pre: true },
  { id: 29, name_arabic: "العنكبوت", name_simple: "Al-'Ankabut", verses_count: 69, revelation_place: "makkah", revelation_order: 85, bismillah_pre: true },
  { id: 30, name_arabic: "الروم", name_simple: "Ar-Rum", verses_count: 60, revelation_place: "makkah", revelation_order: 84, bismillah_pre: true },
  { id: 31, name_arabic: "لقمان", name_simple: "Luqman", verses_count: 34, revelation_place: "makkah", revelation_order: 57, bismillah_pre: true },
  { id: 32, name_arabic: "السجدة", name_simple: "As-Sajdah", verses_count: 30, revelation_place: "makkah", revelation_order: 75, bismillah_pre: true },
  { id: 33, name_arabic: "الأحزاب", name_simple: "Al-Ahzab", verses_count: 73, revelation_place: "madinah", revelation_order: 90, bismillah_pre: true },
  { id: 34, name_arabic: "سبأ", name_simple: "Saba", verses_count: 54, revelation_place: "makkah", revelation_order: 58, bismillah_pre: true },
  { id: 35, name_arabic: "فاطر", name_simple: "Fatir", verses_count: 45, revelation_place: "makkah", revelation_order: 43, bismillah_pre: true },
  { id: 36, name_arabic: "يس", name_simple: "Ya-Sin", verses_count: 83, revelation_place: "makkah", revelation_order: 41, bismillah_pre: true },
  { id: 37, name_arabic: "الصافات", name_simple: "As-Saffat", verses_count: 182, revelation_place: "makkah", revelation_order: 56, bismillah_pre: true },
  { id: 38, name_arabic: "ص", name_simple: "Sad", verses_count: 88, revelation_place: "makkah", revelation_order: 38, bismillah_pre: true },
  { id: 39, name_arabic: "الزمر", name_simple: "Az-Zumar", verses_count: 75, revelation_place: "makkah", revelation_order: 59, bismillah_pre: true },
  { id: 40, name_arabic: "غافر", name_simple: "Ghafir", verses_count: 85, revelation_place: "makkah", revelation_order: 60, bismillah_pre: true },
  { id: 41, name_arabic: "فصلت", name_simple: "Fussilat", verses_count: 54, revelation_place: "makkah", revelation_order: 61, bismillah_pre: true },
  { id: 42, name_arabic: "الشورى", name_simple: "Ash-Shura", verses_count: 53, revelation_place: "makkah", revelation_order: 62, bismillah_pre: true },
  { id: 43, name_arabic: "الزخرف", name_simple: "Az-Zukhruf", verses_count: 89, revelation_place: "makkah", revelation_order: 63, bismillah_pre: true },
  { id: 44, name_arabic: "الدخان", name_simple: "Ad-Dukhan", verses_count: 59, revelation_place: "makkah", revelation_order: 64, bismillah_pre: true },
  { id: 45, name_arabic: "الجاثية", name_simple: "Al-Jathiyah", verses_count: 37, revelation_place: "makkah", revelation_order: 65, bismillah_pre: true },
  { id: 46, name_arabic: "الأحقاف", name_simple: "Al-Ahqaf", verses_count: 35, revelation_place: "makkah", revelation_order: 66, bismillah_pre: true },
  { id: 47, name_arabic: "محمد", name_simple: "Muhammad", verses_count: 38, revelation_place: "madinah", revelation_order: 95, bismillah_pre: true },
  { id: 48, name_arabic: "الفتح", name_simple: "Al-Fath", verses_count: 29, revelation_place: "madinah", revelation_order: 111, bismillah_pre: true },
  { id: 49, name_arabic: "الحجرات", name_simple: "Al-Hujurat", verses_count: 18, revelation_place: "madinah", revelation_order: 106, bismillah_pre: true },
  { id: 50, name_arabic: "ق", name_simple: "Qaf", verses_count: 45, revelation_place: "makkah", revelation_order: 34, bismillah_pre: true },
  { id: 51, name_arabic: "الذاريات", name_simple: "Adh-Dhariyat", verses_count: 60, revelation_place: "makkah", revelation_order: 67, bismillah_pre: true },
  { id: 52, name_arabic: "الطور", name_simple: "At-Tur", verses_count: 49, revelation_place: "makkah", revelation_order: 76, bismillah_pre: true },
  { id: 53, name_arabic: "النجم", name_simple: "An-Najm", verses_count: 62, revelation_place: "makkah", revelation_order: 23, bismillah_pre: true },
  { id: 54, name_arabic: "القدر", name_simple: "Al-Qadr", verses_count: 5, revelation_place: "makkah", revelation_order: 25, bismillah_pre: true },
  { id: 55, name_arabic: "الرحمن", name_simple: "Ar-Rahman", verses_count: 78, revelation_place: "madinah", revelation_order: 97, bismillah_pre: true },
  { id: 56, name_arabic: "الواقعة", name_simple: "Al-Waqi'ah", verses_count: 96, revelation_place: "makkah", revelation_order: 46, bismillah_pre: true },
  { id: 57, name_arabic: "الحديد", name_simple: "Al-Hadid", verses_count: 29, revelation_place: "madinah", revelation_order: 99, bismillah_pre: true },
  { id: 58, name_arabic: "المجادلة", name_simple: "Al-Mujadilah", verses_count: 22, revelation_place: "madinah", revelation_order: 105, bismillah_pre: true },
  { id: 59, name_arabic: "الحشر", name_simple: "Al-Hashr", verses_count: 24, revelation_place: "madinah", revelation_order: 101, bismillah_pre: true },
  { id: 60, name_arabic: "الممتحنة", name_simple: "Al-Mumtahanah", verses_count: 13, revelation_place: "madinah", revelation_order: 91, bismillah_pre: true },
  { id: 61, name_arabic: "الصف", name_simple: "As-Saff", verses_count: 14, revelation_place: "madinah", revelation_order: 109, bismillah_pre: true },
  { id: 62, name_arabic: "الجمعة", name_simple: "Al-Jumu'ah", verses_count: 11, revelation_place: "madinah", revelation_order: 110, bismillah_pre: true },
  { id: 63, name_arabic: "المنافقون", name_simple: "Al-Munafiqun", verses_count: 11, revelation_place: "madinah", revelation_order: 104, bismillah_pre: true },
  { id: 64, name_arabic: "التغابن", name_simple: "At-Taghabun", verses_count: 18, revelation_place: "madinah", revelation_order: 108, bismillah_pre: true },
  { id: 65, name_arabic: "الطلاق", name_simple: "At-Talaq", verses_count: 12, revelation_place: "madinah", revelation_order: 99, bismillah_pre: true },
  { id: 66, name_arabic: "التحريم", name_simple: "At-Tahrim", verses_count: 12, revelation_place: "madinah", revelation_order: 107, bismillah_pre: true },
  { id: 67, name_arabic: "الملك", name_simple: "Al-Mulk", verses_count: 30, revelation_place: "makkah", revelation_order: 77, bismillah_pre: true },
  { id: 68, name_arabic: "القلم", name_simple: "Al-Qalam", verses_count: 52, revelation_place: "makkah", revelation_order: 2, bismillah_pre: true },
  { id: 69, name_arabic: "الحاقة", name_simple: "Al-Haqqah", verses_count: 52, revelation_place: "makkah", revelation_order: 78, bismillah_pre: true },
  { id: 70, name_arabic: "المعارج", name_simple: "Al-Ma'arij", verses_count: 44, revelation_place: "makkah", revelation_order: 79, bismillah_pre: true },
  { id: 71, name_arabic: "نوح", name_simple: "Nuh", verses_count: 28, revelation_place: "makkah", revelation_order: 71, bismillah_pre: true },
  { id: 72, name_arabic: "الجن", name_simple: "Al-Jinn", verses_count: 28, revelation_place: "makkah", revelation_order: 40, bismillah_pre: true },
  { id: 73, name_arabic: "المزمل", name_simple: "Al-Muzzammil", verses_count: 20, revelation_place: "makkah", revelation_order: 3, bismillah_pre: true },
  { id: 74, name_arabic: "المدثر", name_simple: "Al-Muddaththir", verses_count: 56, revelation_place: "makkah", revelation_order: 4, bismillah_pre: true },
  { id: 75, name_arabic: "القيامة", name_simple: "Al-Qiyamah", verses_count: 40, revelation_place: "makkah", revelation_order: 31, bismillah_pre: true },
  { id: 76, name_arabic: "الإنسان", name_simple: "Al-Insan", verses_count: 31, revelation_place: "madinah", revelation_order: 98, bismillah_pre: true },
  { id: 77, name_arabic: "المرسلات", name_simple: "Al-Mursalat", verses_count: 50, revelation_place: "makkah", revelation_order: 33, bismillah_pre: true },
  { id: 78, name_arabic: "النبأ", name_simple: "An-Naba", verses_count: 40, revelation_place: "makkah", revelation_order: 80, bismillah_pre: true },
  { id: 79, name_arabic: "النازعات", name_simple: "An-Nazi'at", verses_count: 46, revelation_place: "makkah", revelation_order: 81, bismillah_pre: true },
  { id: 80, name_arabic: "عبس", name_simple: "'Abasa", verses_count: 42, revelation_place: "makkah", revelation_order: 24, bismillah_pre: true },
  { id: 81, name_arabic: "التكوير", name_simple: "At-Takwir", verses_count: 29, revelation_place: "makkah", revelation_order: 7, bismillah_pre: true },
  { id: 82, name_arabic: "الانفطار", name_simple: "Al-Infitar", verses_count: 19, revelation_place: "makkah", revelation_order: 82, bismillah_pre: true },
  { id: 83, name_arabic: "المطففين", name_simple: "Al-Mutaffifin", verses_count: 36, revelation_place: "makkah", revelation_order: 86, bismillah_pre: true },
  { id: 84, name_arabic: "الانشقاق", name_simple: "Al-Inshiqaq", verses_count: 25, revelation_place: "makkah", revelation_order: 83, bismillah_pre: true },
  { id: 85, name_arabic: "البروج", name_simple: "Al-Buruj", verses_count: 22, revelation_place: "makkah", revelation_order: 27, bismillah_pre: true },
  { id: 86, name_arabic: "الطارق", name_simple: "At-Tariq", verses_count: 17, revelation_place: "makkah", revelation_order: 36, bismillah_pre: true },
  { id: 87, name_arabic: "الأعلى", name_simple: "Al-A'la", verses_count: 19, revelation_place: "makkah", revelation_order: 8, bismillah_pre: true },
  { id: 88, name_arabic: "الغاشية", name_simple: "Al-Ghashiyah", verses_count: 26, revelation_place: "makkah", revelation_order: 68, bismillah_pre: true },
  { id: 89, name_arabic: "الفجر", name_simple: "Al-Fajr", verses_count: 30, revelation_place: "makkah", revelation_order: 10, bismillah_pre: true },
  { id: 90, name_arabic: "البلد", name_simple: "Al-Balad", verses_count: 20, revelation_place: "makkah", revelation_order: 35, bismillah_pre: true },
  { id: 91, name_arabic: "الشمس", name_simple: "Ash-Shams", verses_count: 15, revelation_place: "makkah", revelation_order: 26, bismillah_pre: true },
  { id: 92, name_arabic: "الليل", name_simple: "Al-Layl", verses_count: 21, revelation_place: "makkah", revelation_order: 9, bismillah_pre: true },
  { id: 93, name_arabic: "الضحى", name_simple: "Ad-Duha", verses_count: 11, revelation_place: "makkah", revelation_order: 11, bismillah_pre: true },
  { id: 94, name_arabic: "الشرح", name_simple: "Ash-Sharh", verses_count: 8, revelation_place: "makkah", revelation_order: 12, bismillah_pre: true },
  { id: 95, name_arabic: "التين", name_simple: "At-Tin", verses_count: 8, revelation_place: "makkah", revelation_order: 28, bismillah_pre: true },
  { id: 96, name_arabic: "العلق", name_simple: "Al-'Alaq", verses_count: 19, revelation_place: "makkah", revelation_order: 1, bismillah_pre: true },
  { id: 97, name_arabic: "القدر", name_simple: "Al-Qadr", verses_count: 5, revelation_place: "makkah", revelation_order: 25, bismillah_pre: true },
  { id: 98, name_arabic: "البينة", name_simple: "Al-Bayyinah", verses_count: 8, revelation_place: "madinah", revelation_order: 100, bismillah_pre: true },
  { id: 99, name_arabic: "الزلزلة", name_simple: "Az-Zalzalah", verses_count: 8, revelation_place: "madinah", revelation_order: 93, bismillah_pre: true },
  { id: 100, name_arabic: "العاديات", name_simple: "Al-'Adiyat", verses_count: 11, revelation_place: "makkah", revelation_order: 14, bismillah_pre: true },
  { id: 101, name_arabic: "القارعة", name_simple: "Al-Qari'ah", verses_count: 11, revelation_place: "makkah", revelation_order: 30, bismillah_pre: true },
  { id: 102, name_arabic: "التكاثر", name_simple: "At-Takathur", verses_count: 8, revelation_place: "makkah", revelation_order: 16, bismillah_pre: true },
  { id: 103, name_arabic: "العصر", name_simple: "Al-'Asr", verses_count: 3, revelation_place: "makkah", revelation_order: 13, bismillah_pre: true },
  { id: 104, name_arabic: "الهمزة", name_simple: "Al-Humazah", verses_count: 9, revelation_place: "makkah", revelation_order: 32, bismillah_pre: true },
  { id: 105, name_arabic: "الفيل", name_simple: "Al-Fil", verses_count: 5, revelation_place: "makkah", revelation_order: 19, bismillah_pre: true },
  { id: 106, name_arabic: "قريش", name_simple: "Quraysh", verses_count: 4, revelation_place: "makkah", revelation_order: 29, bismillah_pre: true },
  { id: 107, name_arabic: "الماعون", name_simple: "Al-Ma'un", verses_count: 7, revelation_place: "makkah", revelation_order: 17, bismillah_pre: true },
  { id: 108, name_arabic: "الكوثر", name_simple: "Al-Kawthar", verses_count: 3, revelation_place: "makkah", revelation_order: 15, bismillah_pre: true },
  { id: 109, name_arabic: "الكافرون", name_simple: "Al-Kafirun", verses_count: 6, revelation_place: "makkah", revelation_order: 18, bismillah_pre: true },
  { id: 110, name_arabic: "النصر", name_simple: "An-Nasr", verses_count: 3, revelation_place: "madinah", revelation_order: 114, bismillah_pre: true },
  { id: 111, name_arabic: "المسد", name_simple: "Al-Masad", verses_count: 5, revelation_place: "makkah", revelation_order: 6, bismillah_pre: true },
  { id: 112, name_arabic: "الإخلاص", name_simple: "Al-Ikhlas", verses_count: 4, revelation_place: "makkah", revelation_order: 22, bismillah_pre: true },
  { id: 113, name_arabic: "الفلق", name_simple: "Al-Falaq", verses_count: 5, revelation_place: "makkah", revelation_order: 20, bismillah_pre: true },
  { id: 114, name_arabic: "الناس", name_simple: "An-Nas", verses_count: 6, revelation_place: "makkah", revelation_order: 21, bismillah_pre: true },
];

// Offline fallback verses for key Surahs (Fatiha 1, Ikhlas 112, Falaq 113, Nas 114)
const OFFLINE_VERSES: Record<number, Ayah[]> = {
  1: [
    { id: 1, verse_number: 1, text_uthmani: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", text_translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.", tafsir: "البسملة: أبدأ قراءتي مستعينا بالله تبارك وتعالى متذكرا صفات رحمته الواسعة.", chapter_id: 1, juz_number: 1 },
    { id: 2, verse_number: 2, text_uthmani: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", text_translation: "[All] praise is [due] to Allah, Lord of the worlds -", tafsir: "كل الثناء والتعظيم لله سبحانه وحده، فهو الخالق والمالك والمربي لجميع خلقه.", chapter_id: 1, juz_number: 1 },
    { id: 3, verse_number: 3, text_uthmani: "الرَّحْمَٰنِ الرَّحِيمِ", text_translation: "The Entirely Merciful, the Especially Merciful,", tafsir: "ذو الرحمة الواسعة التي وسعت كل شيء، والرحمة الخاصة بالمؤمنين يوم القيامة.", chapter_id: 1, juz_number: 1 },
    { id: 4, verse_number: 4, text_uthmani: "مَالِكِ يَوْمِ الدِّينِ", text_translation: "Sovereign of the Day of Recompense.", tafsir: "الملك الحق الوحيد لجميع شؤون العباد والجزاء في يوم القيامة.", chapter_id: 1, juz_number: 1 },
    { id: 5, verse_number: 5, text_uthmani: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", text_translation: "It is You we worship and You we ask for help.", tafsir: "نخصك وحدك بالعبادة والطاعة، ونخصك بالاستعانة والتوكل في كل أمورنا.", chapter_id: 1, juz_number: 1 },
    { id: 6, verse_number: 6, text_uthmani: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", text_translation: "Guide us to the straight path -", tafsir: "أرشدنا ووفقنا وثبتنا على الطريق الواضح الموصل إلى جنتك ورضاك.", chapter_id: 1, juz_number: 1 },
    { id: 7, verse_number: 7, text_uthmani: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", text_translation: "The path of those upon whom You have bestowed favor, not of those who have earned [Your] anger or of those who are astray.", tafsir: "طريق الذين تفضلت عليهم بالهداية من الأنبياء والصالحين، لا طريق المعاندين والغافلين.", chapter_id: 1, juz_number: 1 },
  ],
  112: [
    { id: 1, verse_number: 1, text_uthmani: "قُلْ هُوَ اللَّهُ أَحَدٌ", text_translation: "Say, \"He is Allah, [who is] One,", tafsir: "قل يا محمد: ربي هو الإله الواحد المتفرد بالربوبية والألوهية لا شريك له.", chapter_id: 112, juz_number: 30 },
    { id: 2, verse_number: 2, text_uthmani: "اللَّهُ الصَّمَدُ", text_translation: "Allah, the Eternal Refuge.", tafsir: "هو السيد المقصود وحده لقضاء جميع الحوائج والرغائب للخلائق كلها.", chapter_id: 112, juz_number: 30 },
    { id: 3, verse_number: 3, text_uthmani: "لَمْ يَلِدْ وَلَمْ يُولَدْ", text_translation: "He neither begets nor is born,", tafsir: "ليس له ولد ولا والد، فهو سبحانه الغني عن كل أحد المستغني بوجوده.", chapter_id: 112, juz_number: 30 },
    { id: 4, verse_number: 4, text_uthmani: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", text_translation: "Nor is there to Him any equivalent.\"", tafsir: "ليس له مثيل أو نظير أو شبيه في أسمائه وصفاته وأفعاله تبارك وتعالى.", chapter_id: 112, juz_number: 30 }
  ],
  113: [
    { id: 1, verse_number: 1, text_uthmani: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", text_translation: "Say, \"I seek refuge in the Lord of daybreak", tafsir: "قل يا محمد: ألتجئ وأتحصن برب الصبح الضياء المنفلق عن ظلمة الليل.", chapter_id: 113, juz_number: 30 },
    { id: 2, verse_number: 2, text_uthmani: "مِن شَرِّ مَا خَلَقَ", text_translation: "From the evil of that which He created", tafsir: "من شرور جميع الخلائق والمحدثات الضارة التي خلقها الله.", chapter_id: 113, juz_number: 30 },
    { id: 3, verse_number: 3, text_uthmani: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", text_translation: "And from the evil of darkness when it settles", tafsir: "ومن شر الليل المظلم إذا حل وتغلغل في الوجود وما يحويه من شرور.", chapter_id: 113, juz_number: 30 },
    { id: 4, verse_number: 4, text_uthmani: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", text_translation: "And from the evil of the blowers in knots", tafsir: "ومن شرور السواحر اللاتي ينفثن ويرقين في العقد لإيذاء الناس بسحرهن.", chapter_id: 113, juz_number: 30 },
    { id: 5, verse_number: 5, text_uthmani: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", text_translation: "And from the evil of an envier when he envies.\"", tafsir: "ومن شر كل حاسد حاقد يتمنى زوال النعمة عن غيره إذا أظهر حسده.", chapter_id: 113, juz_number: 30 }
  ],
  114: [
    { id: 1, verse_number: 1, text_uthmani: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", text_translation: "Say, \"I seek refuge in the Lord of mankind,", tafsir: "قل يا محمد: ألتجئ وأتحصن برب الناس وخالقهم القادر وحده على حمايتهم.", chapter_id: 114, juz_number: 30 },
    { id: 2, verse_number: 2, text_uthmani: "مَلِكِ النَّاسِ", text_translation: "The Sovereign of mankind,", tafsir: "ملك الملوك المتصرف المطلق في شؤون جميع البشر والخلائق.", chapter_id: 114, juz_number: 30 },
    { id: 3, verse_number: 3, text_uthmani: "إِلَٰهِ النَّاسِ", text_translation: "The God of mankind,", tafsir: "معبودهم الحق والوحيد الذي لا معبود سواه ولا يستحق العبادة غيره.", chapter_id: 114, juz_number: 30 },
    { id: 4, verse_number: 4, text_uthmani: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", text_translation: "From the evil of the retreating whisperer -", tafsir: "من شرور شياطين الإنس والجن التي توسوس وتختفي وتنفر عند ذكر الله.", chapter_id: 114, juz_number: 30 },
    { id: 5, verse_number: 5, text_uthmani: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", text_translation: "Who whispers [evil] into the breasts of mankind -", tafsir: "الذي يبث الشر والشكوك والمخاوف والوساوس في نفوس وقلوب البشر.", chapter_id: 114, juz_number: 30 },
    { id: 6, verse_number: 6, text_uthmani: "مِنَ الْجِنَّةِ وَالنَّاسِ", text_translation: "From among the jinn and mankind.\"", tafsir: "سواء كان هذا الموسوس المضلل من شياطين الجن أو من أشرار بني آدم.", chapter_id: 114, juz_number: 30 }
  ]
};

// Base API endpoints for Quran.com
const API_BASE = 'https://api.quran.com/api/v4';

export const quranApi = {
  // Get all surahs list (metadata)
  getSurahList(): Chapter[] {
    return SURAHS_METADATA;
  },

  // Fetch Surah Verses with Arabic Uthmani text, translation (English default), and Arabic Tafsir
  async getSurahVerses(chapterId: number): Promise<Ayah[]> {
    // 1. If offline data exists and we are offline, or as a fast response:
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5 seconds timeout

      // Fetch Uthmani text
      const uthmaniRes = await fetch(`${API_BASE}/quran/verses/uthmani?chapter_number=${chapterId}`, { signal: controller.signal });
      const uthmaniData = await uthmaniRes.json();
      
      // Fetch English translation (ID 131: Clear Quran)
      const transRes = await fetch(`${API_BASE}/quran/translations/131?chapter_number=${chapterId}`, { signal: controller.signal });
      const transData = await transRes.json();

      // Fetch Tafsir (Muyassar ID 165 or similar - let's fetch translation resource 165 which is Arabic Tafsir Al-Muyassar)
      const tafsirRes = await fetch(`${API_BASE}/quran/translations/165?chapter_number=${chapterId}`, { signal: controller.signal });
      const tafsirData = await tafsirRes.json();

      clearTimeout(timeoutId);

      // Merge results
      const verses: Ayah[] = uthmaniData.verses.map((verse: any, idx: number) => {
        const transObj = transData.translations.find((t: any) => t.verse_id === verse.id);
        const tafsirObj = tafsirData.translations.find((t: any) => t.verse_id === verse.id);

        return {
          id: verse.id,
          verse_number: idx + 1,
          text_uthmani: verse.text_uthmani,
          text_translation: transObj ? transObj.text.replace(/<[^>]*>?/gm, '') : 'Translation unavailable',
          tafsir: tafsirObj ? tafsirObj.text.replace(/<[^>]*>?/gm, '') : 'التفسير الميسر غير متوفر حالياً',
          chapter_id: chapterId,
          juz_number: Math.ceil(chapterId / 4.5) // Approximate Juz if not in API response
        };
      });

      return verses;
    } catch (e) {
      console.warn("Could not fetch verses from Quran.com API, falling back to local database/cache.", e);
      // Fallback
      if (OFFLINE_VERSES[chapterId]) {
        return OFFLINE_VERSES[chapterId];
      }
      
      // Generic mock verses generation if not found in offline dict
      const chapterMeta = SURAHS_METADATA.find(c => c.id === chapterId);
      const count = chapterMeta ? chapterMeta.verses_count : 10;
      
      return Array.from({ length: count }, (_, i) => ({
        id: chapterId * 1000 + i + 1,
        verse_number: i + 1,
        text_uthmani: `آية كريمة رقم ${i + 1} من سورة ${chapterMeta?.name_arabic || chapterId} [نص تجريبي للتصفح دون إنترنت]`,
        text_translation: `Verse ${i + 1} of Surah ${chapterMeta?.name_simple || chapterId} [Offline preview mode]`,
        tafsir: `ملخص مساعد للتفسير: هذا النص يظهر كبديل غير متصل بالإنترنت. يرجى الاتصال بالإنترنت لتحميل التفسير الميسر المعتمد من سورة ${chapterMeta?.name_arabic}.`,
        chapter_id: chapterId,
        juz_number: Math.floor(chapterId / 4) + 1
      }));
    }
  },

  // Fetch Verses on a specific page with Arabic Uthmani text, translation, and Arabic Tafsir
  async getPageVerses(pageNumber: number): Promise<Ayah[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout

      // Fetch all required resources in parallel
      const [uthmaniRes, transRes, tafsirRes, wordsRes] = await Promise.all([
        fetch(`${API_BASE}/quran/verses/uthmani?page_number=${pageNumber}`, { signal: controller.signal }),
        fetch(`${API_BASE}/quran/translations/131?page_number=${pageNumber}`, { signal: controller.signal }),
        fetch(`${API_BASE}/quran/translations/165?page_number=${pageNumber}`, { signal: controller.signal }),
        fetch(`${API_BASE}/verses/by_page/${pageNumber}?words=true`, { signal: controller.signal })
      ]);

      const [uthmaniData, transData, tafsirData, wordsData] = await Promise.all([
        uthmaniRes.json(),
        transRes.json(),
        tafsirRes.json(),
        wordsRes.json()
      ]);

      clearTimeout(timeoutId);

      // Merge results
      const verses: Ayah[] = uthmaniData.verses.map((verse: any) => {
        const transObj = transData.translations.find((t: any) => t.verse_id === verse.id || t.verse_key === verse.verse_key);
        const tafsirObj = tafsirData.translations.find((t: any) => t.verse_id === verse.id || t.verse_key === verse.verse_key);
        
        // Find corresponding verse in wordsData to extract line numbers and end marker position
        const wordsVerse = wordsData.verses.find((v: any) => v.id === verse.id || v.verse_key === verse.verse_key);
        let lines: number[] = [];
        let endMarkerCoords: { x: number, y: number } | undefined = undefined;

        if (wordsVerse) {
          lines = [...new Set(wordsVerse.words.map((w: any) => w.line_number))].map(Number);
          
          // Find the end marker word
          const endWord = wordsVerse.words.find((w: any) => w.char_type_name === 'end');
          if (endWord) {
            const lineNum = Number(endWord.line_number);
            // Get all words on this line
            const lineWords: any[] = [];
            wordsData.verses.forEach((v: any) => {
              v.words.forEach((w: any) => {
                if (Number(w.line_number) === lineNum) {
                  lineWords.push(w);
                }
              });
            });

            // Find index of endWord in lineWords
            const idx = lineWords.findIndex((w: any) => w.id === endWord.id);
            if (idx !== -1 && lineWords.length > 0) {
              const xRatio = 1 - (idx + 0.5) / lineWords.length;
              
              // Scale to page margins adaptively
              let yMin = 8;
              let yMax = 92;
              let xMin = 10;
              let xMax = 90;

              if (pageNumber === 1) {
                yMin = 24;
                yMax = 76;
                xMin = 24;
                xMax = 76;
              } else if (pageNumber === 2) {
                yMin = 22;
                yMax = 90;
                xMin = 22;
                xMax = 78;
              }

              const y = yMin + ((lineNum - 0.5) / 15) * (yMax - yMin);
              const x = xMin + (xRatio * (xMax - xMin));
              endMarkerCoords = { x, y };
            }
          }
        }
        
        // Parse verse key "1:1" to get chapter_id and verse_number
        const [chapterId, verseNumber] = verse.verse_key.split(':').map(Number);

        return {
          id: verse.id,
          verse_number: verseNumber,
          text_uthmani: verse.text_uthmani,
          text_translation: transObj ? transObj.text.replace(/<[^>]*>?/gm, '') : 'Translation unavailable',
          tafsir: tafsirObj ? tafsirObj.text.replace(/<[^>]*>?/gm, '') : 'التفسير الميسر غير متوفر حالياً',
          chapter_id: chapterId,
          juz_number: Math.ceil(chapterId / 4.5),
          lines,
          endMarkerCoords
        };
      });

      return verses;
    } catch (e) {
      console.warn(`Could not fetch verses for page ${pageNumber} from Quran.com API, falling back to local database/cache.`, e);
      
      // Find surah by page
      let activeSurahId = 1;
      for (const [surahId, startPage] of Object.entries(SURAH_START_PAGES)) {
        if (pageNumber >= startPage) {
          activeSurahId = Number(surahId);
        } else {
          break;
        }
      }
      
      const chapterMeta = SURAHS_METADATA.find(c => c.id === activeSurahId);
      
      if (OFFLINE_VERSES[activeSurahId]) {
        return OFFLINE_VERSES[activeSurahId];
      }

      return Array.from({ length: 5 }, (_, i) => ({
        id: activeSurahId * 1000 + i + 1,
        verse_number: i + 1,
        text_uthmani: `آية كريمة رقم ${i + 1} من سورة ${chapterMeta?.name_arabic || activeSurahId} [نص تجريبي لصفحة ${pageNumber}]`,
        text_translation: `Verse ${i + 1} of Surah ${chapterMeta?.name_simple || activeSurahId} [Page ${pageNumber} Offline]`,
        tafsir: `ملخص مساعد للتفسير: هذا النص يظهر كبديل غير متصل بالإنترنت لصفحة ${pageNumber}. يرجى الاتصال بالإنترنت لتحميل التفسير الميسر المعتمد.`,
        chapter_id: activeSurahId,
        juz_number: Math.floor(activeSurahId / 4) + 1
      }));
    }
  },

  // Fetch specific Tafsir content dynamically by verse key
  async getAyahTafsir(tafsirId: number, chapterId: number, verseNumber: number): Promise<string> {
    try {
      const res = await fetch(`${API_BASE}/tafsirs/${tafsirId}/by_ayah/${chapterId}:${verseNumber}`);
      const data = await res.json();
      if (data.tafsir && data.tafsir.text) {
        // Remove HTML tags nicely
        return data.tafsir.text.replace(/<[^>]*>?/gm, '').trim();
      }
      return 'التفسير غير متوفر حالياً لهذه الآية.';
    } catch (e) {
      console.warn("Could not fetch tafsir dynamically from Quran.com", e);
      return 'تعذر تحميل التفسير. يرجى التأكد من الاتصال بالإنترنت.';
    }
  },

  // Audio stream URL helper (EveryAyah Alafasy)
  getAyahAudioUrl(chapterId: number, verseNumber: number, reciter = 'Alafasy_128kbps'): string {
    const ch = String(chapterId).padStart(3, '0');
    const vs = String(verseNumber).padStart(3, '0');
    return `https://everyayah.com/data/${reciter}/${ch}${vs}.mp3`;
  },

  // List available reciters
  getReciters() {
    return [
      { id: 'Alafasy_128kbps', name: 'مشاري العفاسي', name_english: 'Mishary Alafasy', url_key: 'Alafasy_128kbps' },
      { id: 'Abdul_Basit_Murattal_192kbps', name: 'عبد الباسط عبد الصمد (مرتل)', name_english: 'Abdul Basit (Murattal)', url_key: 'Abdul_Basit_Murattal_192kbps' },
      { id: 'Minshawy_Murattal_128kbps', name: 'المنشاوي (مرتل)', name_english: 'Al-Minshawi (Murattal)', url_key: 'Minshawy_Murattal_128kbps' },
      { id: 'Ghamadi_2_40kbps', name: 'سعد الغامدي', name_english: 'Saad Al-Ghamdi', url_key: 'Ghamadi_2_40kbps' },
      { id: 'Husary_128kbps', name: 'محمود خليل الحصري', name_english: 'Mahmoud Al-Husary', url_key: 'Husary_128kbps' }
    ];
  }
};
