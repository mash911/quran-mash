export interface Chapter {
  id: number;
  name_arabic: string;
  name_simple: string;
  verses_count: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
}

export interface Ayah {
  id: number;
  verse_number: number;
  text_uthmani: string;
  text_translation?: string;
  tafsir?: string;
  chapter_id: number;
  juz_number: number;
  lines?: number[];
  endMarkerCoords?: { x: number; y: number };
}

export interface Bookmark {
  id: string;
  chapter_id: number;
  verse_number: number;
  created_at: string;
}

export interface ReadingProgress {
  chapter_id: number;
  verse_number: number;
  updated_at: string;
}

export interface MemorizationItem {
  id: string;
  chapter_id: number;
  verse_number: number;
  status: 'easy' | 'medium' | 'review'; // سهل - متوسط - يحتاج مراجعة
  times_repeated: number;
  next_review: string; // ISO date string for spaced repetition
  created_at: string;
}

export interface DailyGoal {
  type: 'time' | 'pages' | 'finish'; // بالوقت - بالصفحات - ختم
  value: number; // minutes, pages, or target days (30/60/90)
  progress_today: number; // completed today
  streak: number;
  last_active_date: string; // YYYY-MM-DD
}

export interface Reflection {
  id: string;
  chapter_id: number;
  verse_number: number;
  text: string;
  tags: string[]; // صبر، رحمة، توبة، رزق، دعاء
  created_at: string;
  is_private: boolean;
}

export interface AudioPreference {
  reciter: string;
  speed: number;
  repeat_each: number; // times to repeat ayah
}

export interface Reciter {
  id: string;
  name: string;
  name_english: string;
  url_key: string;
}
