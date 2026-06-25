import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Timer, ListMusic, Square } from 'lucide-react';
import { quranApi } from '../services/quranApi';
import { db } from '../services/db';
import type { Ayah, Chapter, Reciter } from '../types';

interface ListeningModeProps {
  selectedSurahId: number;
  setSelectedSurahId: (id: number) => void;
  selectedVerseNumber: number;
  setSelectedVerseNumber: (num: number) => void;
  audioAutoPlay: boolean;
  setAudioAutoPlay: (play: boolean) => void;
}

export const ListeningMode: React.FC<ListeningModeProps> = ({
  selectedSurahId,
  setSelectedSurahId,
  selectedVerseNumber,
  setSelectedVerseNumber,
  audioAutoPlay,
  setAudioAutoPlay
}) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [verses, setVerses] = useState<Ayah[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  
  const [activeReciter, setActiveReciter] = useState<string>('Alafasy_128kbps');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [repeatCount, setRepeatCount] = useState<number>(1);
  const [currentRepeatCycle, setCurrentRepeatCycle] = useState<number>(1);
  
  const [sleepTimer, setSleepTimer] = useState<number | null>(null); // in minutes
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // in seconds
  
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);

  const [isRangeEnabled, setIsRangeEnabled] = useState<boolean>(false);
  const [startVerse, setStartVerse] = useState<number>(1);
  const [endVerse, setEndVerse] = useState<number>(5);
  const [rangeRepeatCount, setRangeRepeatCount] = useState<number | 'infinite'>(1);
  const [currentRangeCycle, setCurrentRangeCycle] = useState<number>(1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sleepTimerRef = useRef<any>(null);

  // Load static registries
  useEffect(() => {
    setChapters(quranApi.getSurahList());
    setReciters(quranApi.getReciters());
    
    const pref = db.getAudioPreference();
    setActiveReciter(pref.reciter);
    setRepeatCount(pref.repeat_each);
  }, []);

  // Fetch verses when Surah changes
  useEffect(() => {
    const fetchVerses = async () => {
      try {
        const data = await quranApi.getSurahVerses(selectedSurahId);
        setVerses(data);
        
        // Match active verse index
        const idx = data.findIndex(v => v.verse_number === selectedVerseNumber);
        setCurrentVerseIndex(idx >= 0 ? idx : 0);

        // Reset range boundaries for the new Surah
        setStartVerse(1);
        setEndVerse(data.length || 7);
        setCurrentRangeCycle(1);
        setIsRangeEnabled(false);
      } catch (err) {
        console.error("Error loading verses for audio", err);
      }
    };
    fetchVerses();
  }, [selectedSurahId]);

  // Handle source changing / Auto Play
  useEffect(() => {
    if (verses.length > 0 && audioAutoPlay) {
      setIsPlaying(true);
      setAudioAutoPlay(false); // consume
    }
  }, [verses, audioAutoPlay]);

  // Keep volume synced
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Audio lifecycle
  useEffect(() => {
    if (verses.length === 0) return;

    const currentVerse = verses[currentVerseIndex];
    if (!currentVerse) return;

    // Load new audio source
    const audioUrl = quranApi.getAyahAudioUrl(selectedSurahId, currentVerse.verse_number, activeReciter);
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(audioUrl);
    audio.volume = volume;
    audioRef.current = audio;

    // Reset progress
    setCurrentTime(0);
    setDuration(0);

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };
    
    // Register audio events
    audio.addEventListener('ended', handleAudioEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    if (isPlaying) {
      audio.play().catch(e => {
        console.warn("Autoplay blocked or audio load error: ", e);
        setIsPlaying(false);
      });
    }

    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleAudioEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [selectedSurahId, currentVerseIndex, activeReciter]);

  // Play / Pause toggle
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Sleep Timer countdown
  useEffect(() => {
    if (timeLeft === null) return;
    
    if (timeLeft <= 0) {
      setIsPlaying(false);
      setTimeLeft(null);
      setSleepTimer(null);
      return;
    }

    sleepTimerRef.current = setTimeout(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, [timeLeft]);

  const handleAudioEnded = () => {
    // Check repeat verse configuration
    if (currentRepeatCycle < repeatCount) {
      setCurrentRepeatCycle(prev => prev + 1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    } else {
      // Move to next ayah
      setCurrentRepeatCycle(1);
      handleNext();
    }
  };
  const handleNext = () => {
    if (isRangeEnabled) {
      const currentVerseNum = verses[currentVerseIndex]?.verse_number;
      if (currentVerseNum >= endVerse) {
        // Range ended
        if (rangeRepeatCount === 'infinite' || currentRangeCycle < rangeRepeatCount) {
          if (rangeRepeatCount !== 'infinite') {
            setCurrentRangeCycle(prev => prev + 1);
          }
          const startIdx = verses.findIndex(v => v.verse_number === startVerse);
          if (startIdx >= 0) {
            setCurrentVerseIndex(startIdx);
            setSelectedVerseNumber(startVerse);
          }
        } else {
          setIsPlaying(false);
          setCurrentRangeCycle(1);
        }
      } else {
        // Move to next in range
        const nextIdx = currentVerseIndex + 1;
        if (nextIdx < verses.length && verses[nextIdx].verse_number <= endVerse) {
          setCurrentVerseIndex(nextIdx);
          setSelectedVerseNumber(verses[nextIdx].verse_number);
        } else {
          // Out of range or no next
          setIsPlaying(false);
        }
      }
    } else {
      if (currentVerseIndex < verses.length - 1) {
        const nextIdx = currentVerseIndex + 1;
        setCurrentVerseIndex(nextIdx);
        setSelectedVerseNumber(verses[nextIdx].verse_number);
      } else {
        // Next Surah
        if (selectedSurahId < 114) {
          setSelectedSurahId(selectedSurahId + 1);
          setSelectedVerseNumber(1);
        } else {
          setIsPlaying(false); // finished Quran
        }
      }
    }
  };

  const handlePrev = () => {
    if (isRangeEnabled) {
      const prevIdx = currentVerseIndex - 1;
      if (prevIdx >= 0 && verses[prevIdx].verse_number >= startVerse) {
        setCurrentVerseIndex(prevIdx);
        setSelectedVerseNumber(verses[prevIdx].verse_number);
      }
    } else {
      if (currentVerseIndex > 0) {
        const prevIdx = currentVerseIndex - 1;
        setCurrentVerseIndex(prevIdx);
        setSelectedVerseNumber(verses[prevIdx].verse_number);
      } else {
        // Prev Surah
        if (selectedSurahId > 1) {
          setSelectedSurahId(selectedSurahId - 1);
          setSelectedVerseNumber(1);
        }
      }
    }
  };

  const handleToggleRangePlay = () => {
    if (isRangeEnabled && isPlaying) {
      setIsPlaying(false);
      setIsRangeEnabled(false);
      setCurrentRangeCycle(1);
    } else {
      setIsRangeEnabled(true);
      setCurrentRangeCycle(1);
      const startIdx = verses.findIndex(v => v.verse_number === startVerse);
      if (startIdx >= 0) {
        setCurrentVerseIndex(startIdx);
        setSelectedVerseNumber(startVerse);
      }
      setIsPlaying(true);
    }
  };

  const handleStartVerseChange = (val: number) => {
    setStartVerse(val);
    if (endVerse < val) {
      setEndVerse(val);
    }
    setCurrentRangeCycle(1);
    if (isRangeEnabled) {
      const idx = verses.findIndex(v => v.verse_number === val);
      if (idx >= 0) {
        setCurrentVerseIndex(idx);
        setSelectedVerseNumber(val);
      }
    }
  };

  const handleEndVerseChange = (val: number) => {
    setEndVerse(val);
    if (startVerse > val) {
      setStartVerse(val);
      if (isRangeEnabled) {
        const idx = verses.findIndex(v => v.verse_number === val);
        if (idx >= 0) {
          setCurrentVerseIndex(idx);
          setSelectedVerseNumber(val);
        }
      }
    }
    setCurrentRangeCycle(1);
  };

  const handleSleepTimerSetup = (minutes: number | null) => {
    setSleepTimer(minutes);
    if (minutes === null) {
      setTimeLeft(null);
    } else {
      setTimeLeft(minutes * 60);
    }
  };

  const handleReciterChange = (reciterId: string) => {
    setActiveReciter(reciterId);
    // Save to user preferences
    const current = db.getAudioPreference();
    db.saveAudioPreference({ ...current, reciter: reciterId });
  };

  const handleRepeatChange = (count: number) => {
    setRepeatCount(count);
    const current = db.getAudioPreference();
    db.saveAudioPreference({ ...current, repeat_each: count });
  };

  const formatTimeLeft = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const activeSurahMeta = chapters.find(c => c.id === selectedSurahId);
  const activeAyah = verses[currentVerseIndex];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {/* Playback Console Card */}
      <div className="md:col-span-2 glass-effect rounded-3xl p-6 sm:p-8 border border-warm-border dark:border-dark-border flex flex-col justify-between shadow-sm relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold bg-accent/10 text-accent px-3 py-1 rounded-full flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" />
                <span>الاستماع والترتيل</span>
              </span>

              {isRangeEnabled && (
                <span className="text-[11px] font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1 font-arabic border border-primary/10">
                  نطاق: {startVerse} - {endVerse}
                  {rangeRepeatCount === 'infinite' ? ' (تكرار ♾️)' : ` (تكرار ${currentRangeCycle}/${rangeRepeatCount})`}
                </span>
              )}
            </div>

            {timeLeft !== null && (
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                مؤقت النوم: {formatTimeLeft(timeLeft)}
              </span>
            )}
          </div>

          {/* Active Surah/Verse visualizer */}
          <div className="text-center py-6 space-y-3">
            {activeSurahMeta && (
              <h2 className="text-2xl font-bold font-arabic text-primary dark:text-primary-light">
                سورة {activeSurahMeta.name_arabic}
              </h2>
            )}
            {activeAyah && (
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                الآية {activeAyah.verse_number} من {activeSurahMeta?.verses_count}
              </p>
            )}

            {/* Scrolling Verse Text */}
            <div className="min-h-24 flex items-center justify-center py-4 px-4 bg-primary/5 dark:bg-slate-800/40 rounded-2xl border border-primary/10">
              {activeAyah ? (
                <p className="text-xl font-bold font-quran text-gray-800 dark:text-gray-100 leading-relaxed max-w-lg select-none">
                  {activeAyah.text_uthmani}
                </p>
              ) : (
                <p className="text-sm text-gray-400">جاري تحميل الآية...</p>
              )}
            </div>
          </div>
        </div>

        {/* Audio Slider progress (seek bar) */}
        <div dir="ltr" className="py-2 flex items-center justify-center gap-3 w-full font-sans">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-bold select-none">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-primary focus:outline-none"
            style={{
              background: `linear-gradient(to right, #0d9488 ${duration ? (currentTime / duration) * 100 : 0}%, rgba(156, 163, 175, 0.25) 0%)`
            }}
          />
          <span className="text-xs text-slate-400 dark:text-slate-500 font-bold select-none">{formatTime(duration)}</span>
        </div>

        {/* Volume controls & active reciter info */}
        <div className="flex flex-row items-center justify-between mt-1 text-xs font-semibold px-1 py-1.5 border-t border-warm-border/60 dark:border-dark-border/60">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-arabic">مستوى الصوت:</span>
            <input
              type="range"
              min={0}
              max={1}
              step="0.02"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 sm:w-32 h-1 bg-gray-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-primary focus:outline-none"
              title="تعديل مستوى الصوت"
              dir="ltr"
              style={{
                background: `linear-gradient(to right, #0d9488 ${volume * 100}%, rgba(156, 163, 175, 0.25) 0%)`
              }}
            />
          </div>
          {activeAyah && (
            <span className="text-slate-400 dark:text-slate-500 font-arabic">
              القارئ الحالي: {reciters.find(r => r.url_key === activeReciter)?.name || activeReciter}
            </span>
          )}
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handlePrev}
              className="p-3 border border-warm-border dark:border-dark-border rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all text-gray-600 dark:text-gray-300"
              title="الآية السابقة"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-3xl bg-primary hover:bg-primary-dark text-white flex items-center justify-center shadow-lg shadow-primary/25 transition-all transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-white text-white" />
              ) : (
                <Play className="w-7 h-7 fill-white text-white translate-x-[1px]" />
              )}
            </button>

            <button
              onClick={handleNext}
              className="p-3 border border-warm-border dark:border-dark-border rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all text-gray-600 dark:text-gray-300"
              title="الآية التالية"
            >
              <SkipBack className="w-5 h-5" />
            </button>
          </div>

          {/* Repeat Ayah settings & sleep setup row */}
          <div className="flex flex-wrap items-center justify-between border-t border-warm-border dark:border-dark-border pt-4 text-xs font-semibold">
            {/* Repeat count */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500">تكرار الآية:</span>
              {[1, 3, 5, 10].map(cnt => (
                <button
                  key={cnt}
                  onClick={() => handleRepeatChange(cnt)}
                  className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center border transition-all ${
                    repeatCount === cnt
                      ? 'bg-primary border-primary text-white'
                      : 'border-warm-border dark:border-dark-border text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>

            {/* Sleep timer options */}
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <Timer className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">إيقاف بعد:</span>
              {[5, 15, 30, null].map((min) => (
                <button
                  key={min ?? 'off'}
                  onClick={() => handleSleepTimerSetup(min)}
                  className={`px-2 py-1 rounded-lg text-[10px] border transition-all ${
                    sleepTimer === min
                      ? 'bg-accent border-accent text-white'
                      : 'border-warm-border dark:border-dark-border text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {min ? `${min} د` : 'تعطيل'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Playlist & Reciters Selector Sidebar */}
      <div className="glass-effect rounded-3xl p-6 border border-warm-border dark:border-dark-border shadow-sm flex flex-col gap-5">
        <h3 className="font-bold text-gray-800 dark:text-gray-200 border-b border-warm-border dark:border-dark-border pb-3 flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-primary" />
          <span>إعدادات التلاوة</span>
        </h3>

        {/* Reciters List */}
        <div className="space-y-2 flex-1">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 block mb-1">القارئ المفضل:</span>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {reciters.map((r) => (
              <button
                key={r.id}
                onClick={() => handleReciterChange(r.url_key)}
                className={`w-full text-right p-3 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
                  activeReciter === r.url_key
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-warm-card dark:bg-dark-card border-warm-border dark:border-dark-border hover:border-primary/30'
                }`}
              >
                <span className="font-arabic">{r.name}</span>
                <span className="text-[10px] font-sans text-gray-400">{r.name_english}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Surahs Quick-skip selection */}
        <div className="space-y-2 pt-2 border-t border-warm-border dark:border-dark-border">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 block mb-1">تخطي سريع للسورة:</span>
          <div className="relative">
            <select
              value={selectedSurahId}
              onChange={(e) => {
                setSelectedSurahId(Number(e.target.value));
                setSelectedVerseNumber(1);
              }}
              className="w-full text-right p-2.5 rounded-xl border border-warm-border dark:border-dark-border text-xs bg-warm-card dark:bg-dark-card focus:border-primary focus:outline-none font-arabic font-semibold"
            >
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  سورة {ch.name_arabic} ({ch.verses_count} آية)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Playback Range Selector */}
        <div className="space-y-4 pt-3 border-t border-warm-border dark:border-dark-border">
          <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 font-arabic flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span>تكرار نطاق محدد من الآيات</span>
          </h4>

          <div className="space-y-3 bg-primary/5 dark:bg-slate-800/40 p-3 rounded-2xl border border-primary/10 transition-all duration-300">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <span className="text-gray-500 font-arabic">من الآية:</span>
                <select
                  value={startVerse}
                  onChange={(e) => handleStartVerseChange(Number(e.target.value))}
                  className="w-full text-center p-1.5 rounded-lg border border-warm-border dark:border-dark-border bg-white dark:bg-slate-900 focus:border-primary focus:outline-none font-bold"
                >
                  {verses.map((v) => (
                    <option key={`start-${v.id}`} value={v.verse_number}>
                      {v.verse_number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-gray-500 font-arabic">إلى الآية:</span>
                <select
                  value={endVerse}
                  onChange={(e) => handleEndVerseChange(Number(e.target.value))}
                  className="w-full text-center p-1.5 rounded-lg border border-warm-border dark:border-dark-border bg-white dark:bg-slate-900 focus:border-primary focus:outline-none font-bold"
                >
                  {verses.map((v) => (
                    <option key={`end-${v.id}`} value={v.verse_number}>
                      {v.verse_number}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Range loop repeats */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 block font-arabic">تكرار النطاق المحدد:</span>
              <div className="flex items-center gap-1.5 justify-between">
                {([1, 2, 3, 5, 'infinite'] as const).map((cnt) => (
                  <button
                    key={`range-repeat-${cnt}`}
                    onClick={() => {
                      setRangeRepeatCount(cnt);
                      setCurrentRangeCycle(1);
                    }}
                    className={`flex-1 h-7 rounded-lg text-xs flex items-center justify-center border transition-all ${
                      rangeRepeatCount === cnt
                        ? 'bg-primary border-primary text-white'
                        : 'border-warm-border dark:border-dark-border text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                    title={cnt === 'infinite' ? 'تكرار بلا نهاية' : `تكرار ${cnt} مرات`}
                  >
                    {cnt === 'infinite' ? '♾️' : cnt}
                  </button>
                ))}
              </div>
            </div>

            {/* Independent Action Button */}
            <button
              onClick={handleToggleRangePlay}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all duration-300 font-arabic text-white ${
                isRangeEnabled && isPlaying
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none'
                  : 'bg-primary hover:bg-primary-dark shadow-primary/20'
              }`}
            >
              {isRangeEnabled && isPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-white text-white" />
                  <span>إيقاف تشغيل النطاق</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                  <span>تشغيل النطاق المحدد</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
