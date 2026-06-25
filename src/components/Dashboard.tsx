import React, { useEffect, useState } from 'react';
import { BookOpen, ArrowLeft, Play, Bookmark, Quote } from 'lucide-react';
import type { DailyGoal, ReadingProgress, Ayah, Chapter } from '../types';
import { db } from '../services/db';
import { quranApi } from '../services/quranApi';


interface DashboardProps {
  setActiveTab: (tab: string) => void;
  setSelectedSurahId: (id: number) => void;
  setSelectedVerseNumber: (num: number) => void;
  setAudioAutoPlay: (play: boolean) => void;
  goal: DailyGoal;
  progress: ReadingProgress | null;
  onRefreshGoal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  setActiveTab,
  setSelectedSurahId,
  setSelectedVerseNumber,
  setAudioAutoPlay,
  goal,
  progress,
  onRefreshGoal
}) => {
  const [greeting, setGreeting] = useState('السلام عليكم');
  const [dailyAyah, setDailyAyah] = useState<Ayah | null>(null);
  const [dailyAyahSurah, setDailyAyahSurah] = useState<Chapter | null>(null);
  const [loadingAyah, setLoadingAyah] = useState(true);

  // Time-based greeting helper
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting('السلام عليكم ورحمة الله وبركاته، صباح الخير والبركة ☀️');
    } else if (hours < 17) {
      setGreeting('السلام عليكم ورحمة الله وبركاته، طاب يومكم بذكر الله 🌤️');
    } else {
      setGreeting('السلام عليكم ورحمة الله وبركاته، مساء الطمأنينة والهدوء 🌙');
    }
  }, []);

  // Fetch daily ayah
  useEffect(() => {
    const getDailyAyah = async () => {
      try {
        setLoadingAyah(true);
        // Randomize surah (from short ones 112, 113, 114, 1 or general)
        // Let's use Al-Fatihah (1) or Al-Ikhlas (112) or Al-Nas (114) for reliable offline access, or API
        const surahId = 1; // Al-Fatihah
        const verses = await quranApi.getSurahVerses(surahId);
        
        // Pick verse 5 ("إياك نعبد وإياك نستعين") or similar
        const verseIdx = Math.min(verses.length - 1, 4); // index 4 is verse 5
        setDailyAyah(verses[verseIdx]);
        
        const chapters = quranApi.getSurahList();
        const ch = chapters.find(c => c.id === surahId);
        if (ch) setDailyAyahSurah(ch);
      } catch (err) {
        console.error("Error loading daily ayah", err);
      } finally {
        setLoadingAyah(false);
      }
    };
    getDailyAyah();
  }, []);

  // Wird progress percentage
  const goalPercentage = Math.round((goal.progress_today / goal.value) * 100);

  // Continue reading action
  const handleContinueReading = () => {
    if (progress) {
      setSelectedSurahId(progress.chapter_id);
      setSelectedVerseNumber(progress.verse_number);
      setActiveTab('quran');
    } else {
      // Default to Al-Fatihah
      setSelectedSurahId(1);
      setSelectedVerseNumber(1);
      setActiveTab('quran');
    }
  };

  const handleQuickRead = (surahId: number) => {
    setSelectedSurahId(surahId);
    setSelectedVerseNumber(1);
    setActiveTab('quran');
  };

  const handleListenDailyAyah = () => {
    if (dailyAyah) {
      setSelectedSurahId(dailyAyah.chapter_id);
      setSelectedVerseNumber(dailyAyah.verse_number);
      setAudioAutoPlay(true);
      setActiveTab('listen');
    }
  };

  const currentProgressSurahName = progress 
    ? quranApi.getSurahList().find(c => c.id === progress.chapter_id)?.name_arabic 
    : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Dynamic Greetings Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-primary via-primary-dark to-dark-card text-white p-6 sm:p-8 shadow-xl border border-white/5">
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary-light/10 rounded-full blur-3xl translate-x-16 translate-y-16"></div>
        
        <div className="relative z-10 space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold font-arabic">{greeting}</h2>
          <p className="text-white/80 text-sm max-w-lg leading-relaxed">
            مرحباً بك في جلو القرآن، رفيقك اليومي في تلاوة كتاب الله وتدبره وحفظ آياته.
          </p>
          
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={handleContinueReading}
              className="px-5 py-2.5 bg-accent hover:bg-accent-light text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-accent/20 interactive-hover"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>متابعة القراءة</span>
              {currentProgressSurahName && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md font-arabic font-normal">
                  سورة {currentProgressSurahName} ({progress?.verse_number})
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Wird Tracker & Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wird Card (Progress Circle) */}
        <div className="md:col-span-2 glass-effect rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm border border-warm-border dark:border-dark-border">
          {/* Circular Progress Gauge */}
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="52"
                strokeWidth="10"
                stroke="currentColor"
                className="text-gray-100 dark:text-slate-800"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="52"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={2 * Math.PI * 52 * (1 - Math.min(100, goalPercentage) / 100)}
                strokeLinecap="round"
                stroke="currentColor"
                className="text-primary dark:text-primary-light transition-all duration-500"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold font-sans text-primary dark:text-primary-light">{goalPercentage}%</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">نسبة الإنجاز</span>
            </div>
          </div>

          <div className="text-center sm:text-right space-y-2 flex-1">
            <div className="inline-block bg-primary/10 text-primary dark:text-primary-light px-3 py-1 rounded-full text-xs font-semibold">
              الورد اليومي الذكي
            </div>
            <h3 className="text-lg font-bold">حافظ على وردك القرآني اليوم</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {goal.type === 'time' && `هدفك اليوم هو القراءة لمدة ${goal.value} دقائق. أنجزت منها ${goal.progress_today} دقائق حتى الآن.`}
              {goal.type === 'pages' && `هدفك اليوم هو قراءة ${goal.value} صفحة. أنجزت منها ${goal.progress_today} صفحة.`}
              {goal.type === 'finish' && `هدفك هو ختم القرآن في غضون ${goal.value} يوماً.`}
            </p>

            <div className="pt-2 flex justify-center sm:justify-start gap-2">
              <button 
                onClick={() => {
                  db.addWirdProgress(1);
                  onRefreshGoal();
                }}
                className="px-4 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-light rounded-lg text-xs font-semibold transition-colors"
              >
                + إضافة دقيقة/صفحة
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className="px-4 py-1.5 border border-warm-border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold transition-colors text-gray-500"
              >
                تعديل الهدف
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-effect rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-warm-border dark:border-dark-border">
            <span className="text-gray-400 dark:text-gray-500 text-xs font-semibold mb-1">السرعة الحالية</span>
            <span className="text-3xl font-bold text-accent font-sans">{goal.streak}</span>
            <span className="text-xs font-medium text-gray-500 mt-1">أيام متتالية</span>
          </div>

          <div className="glass-effect rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-warm-border dark:border-dark-border">
            <span className="text-gray-400 dark:text-gray-500 text-xs font-semibold mb-1">الآيات المحفوظة</span>
            <span className="text-3xl font-bold text-primary dark:text-primary-light font-sans">
              {db.getMemorizationItems().length}
            </span>
            <span className="text-xs font-medium text-gray-500 mt-1">آية للحفظ</span>
          </div>
        </div>
      </div>

      {/* Daily Ayah Card */}
      <div className="glass-effect rounded-3xl p-6 sm:p-8 shadow-sm border border-warm-border dark:border-dark-border relative overflow-hidden">
        <Quote className="absolute top-4 right-4 w-12 h-12 text-primary/5 dark:text-primary-light/5 pointer-events-none transform flip-horizontal" />
        
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-warm-border dark:border-dark-border pb-3">
            <h3 className="font-bold font-arabic text-primary dark:text-primary-light flex items-center gap-2">
              <Quote className="w-4 h-4 text-accent fill-accent" />
              <span>آية اليوم</span>
            </h3>
            {dailyAyahSurah && (
              <span className="text-xs font-semibold bg-primary/5 dark:bg-primary-light/5 px-3 py-1 rounded-full text-gray-500 dark:text-gray-400">
                سورة {dailyAyahSurah.name_arabic} : آية {dailyAyah?.verse_number}
              </span>
            )}
          </div>

          {loadingAyah ? (
            <div className="py-6 text-center text-sm text-gray-400">جاري تحميل آية اليوم...</div>
          ) : dailyAyah ? (
            <div className="space-y-4 text-center sm:text-right">
              <p className="text-2xl font-bold font-quran leading-loose text-gray-800 dark:text-gray-100 py-3 select-none">
                {dailyAyah.text_uthmani}
              </p>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                {dailyAyah.text_translation}
              </p>

              <div className="bg-primary/5 dark:bg-slate-800/50 rounded-2xl p-4 text-right">
                <span className="text-xs font-bold text-accent block mb-1">التفسير الميسر المساعد:</span>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-arabic">
                  {dailyAyah.tafsir}
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={handleListenDailyAyah}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-primary-dark transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-white shrink-0" />
                  <span>استماع</span>
                </button>
                <button
                  onClick={() => {
                    db.addBookmark(dailyAyah.chapter_id, dailyAyah.verse_number);
                    alert("تمت الإضافة للمفضلة");
                  }}
                  className="px-4 py-2 border border-warm-border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors text-gray-600 dark:text-gray-300"
                >
                  <Bookmark className="w-3.5 h-3.5 shrink-0" />
                  <span>حفظ الآية</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Quick Navigation / Suggested Readings */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg font-arabic text-gray-800 dark:text-gray-200">سور مقترحة لليوم</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { id: 1, name: "الفاتحة", details: "مكية • 7 آيات" },
            { id: 18, name: "الكهف", details: "مكية • 110 آية" },
            { id: 36, name: "يس", details: "مكية • 83 آية" },
            { id: 67, name: "الملك", details: "مكية • 30 آية" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleQuickRead(item.id)}
              className="glass-effect p-4 rounded-2xl text-right border border-warm-border dark:border-dark-border interactive-hover flex flex-col justify-between h-24"
            >
              <span className="font-bold text-gray-800 dark:text-gray-200 font-arabic text-base">سورة {item.name}</span>
              <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 w-full">
                <span>{item.details}</span>
                <ArrowLeft className="w-3.5 h-3.5 text-primary" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
