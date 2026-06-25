import type { Bookmark, ReadingProgress, MemorizationItem, DailyGoal, Reflection, AudioPreference } from '../types';


// Keys for local storage
const KEYS = {
  BOOKMARKS: 'quranglow_bookmarks',
  PROGRESS: 'quranglow_progress',
  MEMORIZATION: 'quranglow_memorization',
  GOALS: 'quranglow_goals',
  REFLECTIONS: 'quranglow_reflections',
  AUDIO_PREF: 'quranglow_audio_pref',
};

// Default structures
const DEFAULT_GOAL: DailyGoal = {
  type: 'time',
  value: 10, // 10 minutes
  progress_today: 0,
  streak: 0,
  last_active_date: new Date().toISOString().split('T')[0],
};

const DEFAULT_AUDIO_PREF: AudioPreference = {
  reciter: 'Alafasy_128kbps',
  speed: 1.0,
  repeat_each: 1,
};

export const db = {
  // --- Bookmarks ---
  getBookmarks(): Bookmark[] {
    const data = localStorage.getItem(KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : [];
  },

  addBookmark(chapterId: number, verseNumber: number): Bookmark[] {
    const bookmarks = this.getBookmarks();
    const exists = bookmarks.find(b => b.chapter_id === chapterId && b.verse_number === verseNumber);
    if (exists) return bookmarks;
    
    const newBookmark: Bookmark = {
      id: `${chapterId}_${verseNumber}`,
      chapter_id: chapterId,
      verse_number: verseNumber,
      created_at: new Date().toISOString(),
    };
    const updated = [...bookmarks, newBookmark];
    localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(updated));
    return updated;
  },

  removeBookmark(chapterId: number, verseNumber: number): Bookmark[] {
    const bookmarks = this.getBookmarks();
    const updated = bookmarks.filter(b => !(b.chapter_id === chapterId && b.verse_number === verseNumber));
    localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(updated));
    return updated;
  },

  isBookmarked(chapterId: number, verseNumber: number): boolean {
    const bookmarks = this.getBookmarks();
    return bookmarks.some(b => b.chapter_id === chapterId && b.verse_number === verseNumber);
  },

  // --- Reading Progress ---
  getProgress(): ReadingProgress | null {
    const data = localStorage.getItem(KEYS.PROGRESS);
    return data ? JSON.parse(data) : null;
  },

  saveProgress(chapterId: number, verseNumber: number): ReadingProgress {
    const progress: ReadingProgress = {
      chapter_id: chapterId,
      verse_number: verseNumber,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
    
    // Also trigger daily goals contribution (reading update)
    this.addWirdProgress(1); // Increment some pages/progress reading unit
    return progress;
  },

  // --- Memorization Items ---
  getMemorizationItems(): MemorizationItem[] {
    const data = localStorage.getItem(KEYS.MEMORIZATION);
    return data ? JSON.parse(data) : [];
  },

  saveMemorizationItem(chapterId: number, verseNumber: number, status: 'easy' | 'medium' | 'review', repeats = 1): MemorizationItem[] {
    const items = this.getMemorizationItems();
    const existingIndex = items.findIndex(item => item.chapter_id === chapterId && item.verse_number === verseNumber);
    
    // Simple spaced repetition scheduling (hours to next review)
    let reviewOffsetHours = 24; // Medium default
    if (status === 'easy') reviewOffsetHours = 72; // 3 days
    if (status === 'review') reviewOffsetHours = 4; // 4 hours

    const nextReviewDate = new Date();
    nextReviewDate.setHours(nextReviewDate.getHours() + reviewOffsetHours);

    const updatedItem: MemorizationItem = {
      id: `${chapterId}_${verseNumber}`,
      chapter_id: chapterId,
      verse_number: verseNumber,
      status,
      times_repeated: repeats,
      next_review: nextReviewDate.toISOString(),
      created_at: new Date().toISOString(),
    };

    if (existingIndex > -1) {
      items[existingIndex] = {
        ...items[existingIndex],
        ...updatedItem,
        times_repeated: items[existingIndex].times_repeated + repeats
      };
    } else {
      items.push(updatedItem);
    }

    localStorage.setItem(KEYS.MEMORIZATION, JSON.stringify(items));
    return items;
  },

  removeMemorizationItem(chapterId: number, verseNumber: number): MemorizationItem[] {
    const items = this.getMemorizationItems();
    const updated = items.filter(i => !(i.chapter_id === chapterId && i.verse_number === verseNumber));
    localStorage.setItem(KEYS.MEMORIZATION, JSON.stringify(updated));
    return updated;
  },

  // --- Reflections ---
  getReflections(): Reflection[] {
    const data = localStorage.getItem(KEYS.REFLECTIONS);
    return data ? JSON.parse(data) : [];
  },

  addReflection(chapterId: number, verseNumber: number, text: string, tags: string[], isPrivate = true): Reflection[] {
    const reflections = this.getReflections();
    const newReflection: Reflection = {
      id: Math.random().toString(36).substr(2, 9),
      chapter_id: chapterId,
      verse_number: verseNumber,
      text,
      tags,
      created_at: new Date().toISOString(),
      is_private: isPrivate,
    };
    const updated = [newReflection, ...reflections];
    localStorage.setItem(KEYS.REFLECTIONS, JSON.stringify(updated));
    return updated;
  },

  deleteReflection(id: string): Reflection[] {
    const reflections = this.getReflections();
    const updated = reflections.filter(r => r.id !== id);
    localStorage.setItem(KEYS.REFLECTIONS, JSON.stringify(updated));
    return updated;
  },

  // --- Daily Goal & Wird Tracker ---
  getDailyGoal(): DailyGoal {
    const data = localStorage.getItem(KEYS.GOALS);
    if (!data) return DEFAULT_GOAL;
    
    const goal: DailyGoal = JSON.parse(data);
    const today = new Date().toISOString().split('T')[0];

    // Reset daily progress if it's a new day
    if (goal.last_active_date !== today) {
      // Check streak: if yesterday was active, keep it. Otherwise break.
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (goal.last_active_date !== yesterdayStr && goal.progress_today < goal.value) {
        goal.streak = 0; // Streak broken
      } else if (goal.progress_today >= goal.value) {
        // Goal achieved yesterday, streak continues!
        // (Streak increments when goal is hit, not here)
      }
      goal.progress_today = 0;
      goal.last_active_date = today;
      localStorage.setItem(KEYS.GOALS, JSON.stringify(goal));
    }
    return goal;
  },

  updateDailyGoalConfig(type: 'time' | 'pages' | 'finish', value: number): DailyGoal {
    const goal = this.getDailyGoal();
    goal.type = type;
    goal.value = value;
    localStorage.setItem(KEYS.GOALS, JSON.stringify(goal));
    return goal;
  },

  addWirdProgress(amount: number): DailyGoal {
    const goal = this.getDailyGoal();
    const oldProgress = goal.progress_today;
    goal.progress_today = Math.min(goal.value, goal.progress_today + amount);
    
    // If goal met today for the first time
    if (goal.progress_today >= goal.value && oldProgress < goal.value) {
      goal.streak += 1;
    }
    
    goal.last_active_date = new Date().toISOString().split('T')[0];
    localStorage.setItem(KEYS.GOALS, JSON.stringify(goal));
    return goal;
  },

  // --- Audio Preferences ---
  getAudioPreference(): AudioPreference {
    const data = localStorage.getItem(KEYS.AUDIO_PREF);
    return data ? JSON.parse(data) : DEFAULT_AUDIO_PREF;
  },

  saveAudioPreference(pref: AudioPreference): void {
    localStorage.setItem(KEYS.AUDIO_PREF, JSON.stringify(pref));
  }
};
