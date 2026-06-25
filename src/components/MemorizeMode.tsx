import React, { useState, useEffect } from 'react';
import { Brain, Eye, EyeOff, Volume2, Calendar } from 'lucide-react';
import { quranApi } from '../services/quranApi';
import { db } from '../services/db';
import type { Chapter, Ayah, MemorizationItem } from '../types';

interface MemorizeModeProps {
  selectedSurahId: number;
  setSelectedSurahId: (id: number) => void;
}

export const MemorizeMode: React.FC<MemorizeModeProps> = ({
  selectedSurahId,
  setSelectedSurahId
}) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [verses, setVerses] = useState<Ayah[]>([]);


  // Memorization setup parameters
  const [startVerse, setStartVerse] = useState<number>(1);
  const [endVerse, setEndVerse] = useState<number>(5);
  const [currentVerseNum, setCurrentVerseNum] = useState<number>(1);
  const [isMasked, setIsMasked] = useState<boolean>(true);
  
  // Memorized Items (saved spaced repetition items)
  const [savedItems, setSavedItems] = useState<MemorizationItem[]>([]);
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Load static configurations
  useEffect(() => {
    setChapters(quranApi.getSurahList());
    refreshSavedItems();
  }, []);

  // Fetch verses when Surah changes
  useEffect(() => {
    const fetchVerses = async () => {
      try {
        const data = await quranApi.getSurahVerses(selectedSurahId);
        setVerses(data);
        
        // Reset range
        setStartVerse(1);
        setEndVerse(Math.min(5, data.length));
        setCurrentVerseNum(1);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVerses();
  }, [selectedSurahId]);

  const refreshSavedItems = () => {
    setSavedItems(db.getMemorizationItems());
  };

  const handleToggleMask = () => {
    setIsMasked(!isMasked);
  };

  // Play audio for current verse
  const playVerseAudio = () => {
    if (activeAudio) {
      activeAudio.pause();
    }

    if (isAudioPlaying) {
      setIsAudioPlaying(false);
      return;
    }

    const audioUrl = quranApi.getAyahAudioUrl(selectedSurahId, currentVerseNum);
    const audio = new Audio(audioUrl);
    
    audio.addEventListener('ended', () => {
      setIsAudioPlaying(false);
    });

    audio.play().then(() => {
      setIsAudioPlaying(true);
      setActiveAudio(audio);
    }).catch(e => {
      console.warn("Could not play audio", e);
    });
  };

  // Cleanup audio
  useEffect(() => {
    return () => {
      if (activeAudio) {
        activeAudio.pause();
      }
    };
  }, [activeAudio]);

  const handleGrade = (status: 'easy' | 'medium' | 'review') => {
    db.saveMemorizationItem(selectedSurahId, currentVerseNum, status, 1);
    refreshSavedItems();
    
    // Auto-advance to next verse in the range if possible
    if (currentVerseNum < endVerse) {
      setCurrentVerseNum(prev => prev + 1);
      setIsMasked(true); // Re-mask new verse
    } else {
      alert("الحمد لله! أكملت الحفظ والمراجعة للمجال المختار.");
    }
  };

  const handleDeleteItem = (chapterId: number, verseNum: number) => {
    if (confirm("هل تريد إزالة الآية من مراجعات الحفظ؟")) {
      db.removeMemorizationItem(chapterId, verseNum);
      refreshSavedItems();
    }
  };

  const activeSurahMeta = chapters.find(c => c.id === selectedSurahId);
  const activeAyahObj = verses.find(v => v.verse_number === currentVerseNum);

  // Filter items that need review today (date <= now)
  const itemsNeedingReview = savedItems.filter(item => {
    const nextDate = new Date(item.next_review);
    const now = new Date();
    return nextDate <= now;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {/* Playback & Memorization Card */}
      <div className="md:col-span-2 glass-effect rounded-3xl p-6 sm:p-8 border border-warm-border dark:border-dark-border flex flex-col justify-between shadow-sm min-h-[50vh]">
        
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-warm-border dark:border-dark-border pb-3">
            <span className="text-xs font-semibold bg-primary/10 text-primary dark:text-primary-light px-3 py-1 rounded-full flex items-center gap-1">
              <Brain className="w-3.5 h-3.5" />
              <span>حلقة التسميع الذاتي</span>
            </span>

            {activeSurahMeta && (
              <span className="text-xs text-gray-500 font-semibold font-arabic">
                سورة {activeSurahMeta.name_arabic}
              </span>
            )}
          </div>

          {/* Scope selection panel */}
          <div className="bg-warm-border/20 dark:bg-slate-800/40 p-4 rounded-2xl grid grid-cols-3 gap-3 items-center text-xs font-semibold">
            <div>
              <label className="block text-gray-400 mb-1">بداية الآية:</label>
              <input
                type="number"
                min={1}
                max={verses.length}
                value={startVerse}
                onChange={(e) => setStartVerse(Number(e.target.value))}
                className="w-full text-center p-2 rounded-lg border border-warm-border dark:border-dark-border bg-warm-card dark:bg-dark-card font-sans font-bold"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">نهاية الآية:</label>
              <input
                type="number"
                min={startVerse}
                max={verses.length}
                value={endVerse}
                onChange={(e) => setEndVerse(Number(e.target.value))}
                className="w-full text-center p-2 rounded-lg border border-warm-border dark:border-dark-border bg-warm-card dark:bg-dark-card font-sans font-bold"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">السورة:</label>
              <select
                value={selectedSurahId}
                onChange={(e) => setSelectedSurahId(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-warm-border dark:border-dark-border bg-warm-card dark:bg-dark-card font-arabic font-bold text-center"
              >
                {chapters.map(c => (
                  <option key={c.id} value={c.id}>سورة {c.name_arabic}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Flashcard Display Screen */}
          <div className="py-8 text-center space-y-4 relative flex flex-col justify-center items-center">
            {/* Range Tracker */}
            <div className="text-xs text-gray-400 font-sans font-semibold">
              الآية الحالية: {currentVerseNum} / من {startVerse} إلى {endVerse}
            </div>

            {/* Maskable text view */}
            <div className="min-h-32 flex items-center justify-center p-6 bg-warm-card dark:bg-dark-card border border-warm-border dark:border-dark-border rounded-2xl w-full relative overflow-hidden shadow-2xs">
              {activeAyahObj ? (
                <p 
                  className={`text-2xl font-bold font-quran leading-loose text-gray-800 dark:text-gray-100 transition-all select-none ${
                    isMasked ? 'blur-md opacity-20 pointer-events-none' : 'blur-none opacity-100'
                  }`}
                >
                  {activeAyahObj.text_uthmani}
                </p>
              ) : (
                <span className="text-gray-400">يرجى اختيار آية صحيحة...</span>
              )}

              {isMasked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/20 dark:bg-slate-900/10 backdrop-blur-2xs">
                  <span className="text-xs font-semibold bg-accent text-white px-3 py-1.5 rounded-full shadow-md">
                    الآية مخفية للتسميع الذاتي
                  </span>
                </div>
              )}
            </div>

            {/* Toggle Visibility */}
            <div className="flex gap-2">
              <button
                onClick={handleToggleMask}
                className="px-4 py-2 border border-warm-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors text-gray-600 dark:text-gray-300"
              >
                {isMasked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{isMasked ? 'إظهار نص الآية' : 'إخفاء نص الآية'}</span>
              </button>

              <button
                onClick={playVerseAudio}
                className={`px-4 py-2 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isAudioPlaying 
                    ? 'bg-primary text-white border-primary' 
                    : 'border-warm-border dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isAudioPlaying ? 'إيقاف الصوت' : 'تسميع صوتي'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Spaced Repetition Grading */}
        <div className="border-t border-warm-border dark:border-dark-border pt-4 mt-4 text-center space-y-3">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 block">
            كيف كان تسميعك التلقائي لهذه الآية؟
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleGrade('easy')}
              className="py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-500/10"
            >
              سهل (٣ أيام مراجعة)
            </button>
            <button
              onClick={() => handleGrade('medium')}
              className="py-2.5 bg-accent hover:bg-accent-light text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-accent/10"
            >
              متوسط (يوم مراجعة)
            </button>
            <button
              onClick={() => handleGrade('review')}
              className="py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-red-500/10"
            >
              صعب (يحتاج مراجعة فورية)
            </button>
          </div>
        </div>
      </div>

      {/* Review Queue Sidebar */}
      <div className="glass-effect rounded-3xl p-6 border border-warm-border dark:border-dark-border shadow-sm flex flex-col gap-4">
        <h3 className="font-bold text-gray-800 dark:text-gray-200 border-b border-warm-border dark:border-dark-border pb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span>جدول مراجعات الحفظ</span>
        </h3>

        {/* Info stats */}
        <div className="text-xs font-semibold text-gray-500 flex justify-between bg-primary/5 p-3 rounded-xl border border-primary/10">
          <span>المجموع: {savedItems.length} آية</span>
          <span className="text-accent">يحتاج مراجعة اليوم: {itemsNeedingReview.length}</span>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto max-h-[40vh] space-y-2">
          {savedItems.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-400">لا يوجد آيات في خطة الحفظ حالياً.</div>
          ) : (
            savedItems.map((item) => {
              const surahName = chapters.find(c => c.id === item.chapter_id)?.name_arabic;
              const dateStr = new Date(item.next_review).toLocaleDateString('ar-EG');
              
              return (
                <div 
                  key={item.id} 
                  className="p-3 bg-warm-card dark:bg-dark-card border border-warm-border dark:border-dark-border rounded-xl flex items-center justify-between text-xs font-medium"
                >
                  <div className="text-right">
                    <span className="font-bold text-gray-800 dark:text-gray-200 block font-arabic">
                      سورة {surahName} (الآية {item.verse_number})
                    </span>
                    <span className="text-[10px] text-gray-400 block font-sans">
                      المراجعة: {dateStr}
                    </span>
                  </div>

                  <div className="flex gap-1.5 items-center">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                      item.status === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                      item.status === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.status === 'easy' ? 'سهل' : item.status === 'medium' ? 'متوسط' : 'مراجعة'}
                    </span>
                    <button
                      onClick={() => handleDeleteItem(item.chapter_id, item.verse_number)}
                      className="text-gray-400 hover:text-red-500 font-bold p-1 text-[10px]"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
