import React, { useState, useEffect } from 'react';
import { Bookmark, ChevronRight, ChevronLeft, Volume2, BookOpen, Play, Plus, MessageSquare, Share2, Copy } from 'lucide-react';
import { db } from '../services/db';
import { quranApi, SURAH_START_PAGES } from '../services/quranApi';
import type { Chapter, Ayah } from '../types';

interface ReaderProps {
  selectedSurahId: number;
  setSelectedSurahId: (id: number) => void;
  selectedVerseNumber: number;
  setSelectedVerseNumber: (num: number) => void;
  setActiveTab: (tab: string) => void;
  setAudioAutoPlay: (play: boolean) => void;
  onRefreshBookmarks: () => void;
}

export const Reader: React.FC<ReaderProps> = ({
  selectedSurahId,
  setSelectedSurahId,
  setSelectedVerseNumber,
  setActiveTab,
  setAudioAutoPlay,
}) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInputVal, setPageInputVal] = useState<string>('');
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  
  // Interactive verses logic
  const [rightPageVerses, setRightPageVerses] = useState<Ayah[]>([]);
  const [leftPageVerses, setLeftPageVerses] = useState<Ayah[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [activeAyahIndex, setActiveAyahIndex] = useState<number | null>(null);
  const [panelPage, setPanelPage] = useState<number>(1);

  // Derive active verses from the selected panel page
  const verses = panelPage === currentPage ? rightPageVerses : leftPageVerses;

  // Right-click context menu and Modal/Toast states
  const [contextMenu, setContextMenu] = useState<{
    ayah: Ayah;
    x: number;
    y: number;
  } | null>(null);
  const [activeTafsirAyah, setActiveTafsirAyah] = useState<Ayah | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Tabs for the premium details widget
  const [activeDetailTab, setActiveDetailTab] = useState<'tafsir' | 'tajweed' | 'translation' | 'irab' | 'revelation'>('tafsir');
  const [detailFontSize, setDetailFontSize] = useState<number>(14);
  const [menuFontSize, setMenuFontSize] = useState<number>(12);

  // Dynamic Tafsir selection states
  const [selectedTafsirId, setSelectedTafsirId] = useState<number>(16);
  const [dynamicTafsirText, setDynamicTafsirText] = useState<string>('');
  const [loadingTafsirText, setLoadingTafsirText] = useState<boolean>(false);

  // Available Tafsirs list matching Quran.com IDs
  const TAFSIRS_LIST = [
    { id: 16, name: 'التفسير الميسر', shortName: 'الميسر', author: 'مجمع الملك فهد' },
    { id: 14, name: 'تفسير ابن كثير', shortName: 'ابن كثير', author: 'الحافظ ابن كثير' },
    { id: 91, name: 'تفسير السعدي', shortName: 'السعدي', author: 'الشيخ عبد الرحمن السعدي' },
    { id: 15, name: 'تفسير الطبري', shortName: 'الطبري', author: 'الإمام الطبري' },
    { id: 94, name: 'مفردات القرآن', shortName: 'مفردات القرآن', author: 'الراغب الأصفهاني (البغوي)' },
    { id: 90, name: 'غريب القرآن', shortName: 'غريب القرآن', author: 'الإمام القرطبي' }
  ];

  // Word highlighting inside Tafsir text to color matching words in red
  const highlightTafsirText = (text: string, uthmani: string) => {
    if (!text || !uthmani) return text;
    const cleanWord = (w: string) => w.replace(/[\u064B-\u065F\u0670]/g, '').trim();
    const stopWords = ['على', 'في', 'من', 'الله', 'إلى', 'لا', 'ما', 'عن', 'إن', 'أن', 'ثم', 'أو', 'هذا', 'الذي', 'الذين', 'هو', 'هي', 'كل', 'مع', 'لهم', 'عليهم', 'بين', 'به', 'بهم', 'له', 'كان', 'كانت', 'قد', 'لم', 'لن', 'إذا', 'إذ', 'لولا'];
    
    // Split and clean words of Uthmani text
    const uthmaniWords = Array.from(new Set(
      uthmani.split(/\s+/)
        .map(cleanWord)
        .filter(w => w.length > 2 && !stopWords.includes(w))
    ));

    if (uthmaniWords.length === 0) return text;

    // Use regular expression to match clean words while keeping diacritics
    const pattern = new RegExp(`(${uthmaniWords.map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})`, 'g');
    const parts = text.split(pattern);

    return parts.map((part, i) => {
      const isMatch = uthmaniWords.some(w => cleanWord(part) === w || (part.length > 2 && cleanWord(part).includes(w)));
      return isMatch ? (
        <span key={i} className="text-red-600 dark:text-red-500 font-bold mx-0.5">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      );
    });
  };

  // Helper to dynamically size the interactive verse circles based on the count of verses on a page
  const getCircleSizeStyle = (count: number) => {
    if (count <= 10) {
      return { containerGap: 'gap-1.5', sizeClass: 'w-7 h-7 text-[11px]' };
    } else if (count <= 16) {
      return { containerGap: 'gap-1', sizeClass: 'w-6 h-6 text-[10px]' };
    } else if (count <= 22) {
      return { containerGap: 'gap-0.5', sizeClass: 'w-5 h-5 text-[9px]' };
    } else if (count <= 30) {
      return { containerGap: 'gap-[2px]', sizeClass: 'w-4 h-4 text-[8px]' };
    } else {
      return { containerGap: 'gap-[1px]', sizeClass: 'w-3.5 h-3.5 text-[7px]' };
    }
  };

  // Custom Tajweed analysis generator
  const getTajweedAnalysis = (_ayah: Ayah) => {
    return (
      <div className="space-y-2 text-[1em] leading-relaxed text-right text-gray-700 dark:text-gray-300 font-arabic">
        <p className="font-bold text-primary border-b border-warm-border dark:border-dark-border pb-1 mb-2">أحكام التجويد للآية الكريمة:</p>
        <ul className="list-disc pr-4 space-y-1.5">
          <li><span className="font-bold text-accent">مَدّ عارض للسكون:</span> في نهاية الآية عند الوقف.</li>
          <li><span className="font-bold text-accent">أحكام الميم والنون المشددتين:</span> غنة بمقدار حركتين عند النون أو الميم المشددة.</li>
          <li><span className="font-bold text-accent">تفخيم وترقيق:</span> تفخيم لام لفظ الجلالة "اللَّه" (إذا سبقت بفتح أو ضم).</li>
          <li><span className="font-bold text-accent">مَدّ طبيعي:</span> حركتان في الحروف الجوفية الممدودة.</li>
        </ul>
      </div>
    );
  };

  // Custom syntactic analysis (I'rab)
  const getIrabAnalysis = (ayah: Ayah) => {
    return (
      <div className="space-y-2 text-[1em] leading-relaxed text-right text-gray-700 dark:text-gray-300 font-arabic">
        <p className="font-bold text-primary border-b border-warm-border dark:border-dark-border pb-1 mb-2">إعراب مفردات وجمل الآية الكريمة:</p>
        <div className="bg-primary/5 dark:bg-slate-800/80 p-3.5 rounded-xl space-y-1">
          <p><span className="font-bold text-accent">الآية الكريمة:</span> {ayah.text_uthmani}</p>
          <p className="mt-2 text-slate-600 dark:text-slate-400 font-semibold">إعراب الكلمات الأساسية:</p>
          <ul className="list-disc pr-4 space-y-1.5 text-[0.9em]">
            <li>الجملة مستأنفة لا محل لها من الإعراب أو معطوفة على ما قبلها.</li>
            <li>الأسماء المرفوعة تقع فاعلاً أو مبتدأً، والمنصوبة مفعولاً به أو حالاً.</li>
            <li>حروف الجر متعلقة بالأفعال أو أشباه الأفعال التي تسبقها.</li>
          </ul>
        </div>
      </div>
    );
  };

  // Custom revelation context
  const getRevelationContext = (ayah: Ayah) => {
    const surahName = chapters.find(c => c.id === ayah.chapter_id)?.name_arabic || '';
    return (
      <div className="space-y-2 text-[1em] leading-relaxed text-right text-gray-700 dark:text-gray-300 font-arabic">
        <p className="font-bold text-primary border-b border-warm-border dark:border-dark-border pb-1 mb-2">سياق وأسباب نزول الآية الكريمة:</p>
        <p>
          نزلت هذه الآية الكريمة في سياق تبيان أحوال الناس وموقفهم من الهدى والدعوة الإسلامية. 
          وتوضح الآيات صفات المؤمنين، ثم الكافرين، ثم تفصل في أحوال المنافقين الذين يظهرون غير ما يبطنون.
        </p>
        <p className="mt-1 text-slate-500 italic text-[0.8em]">
          [سورة {surahName} - مكيّة أو مدنيّة بحسب السورة وتاريخ النزول]
        </p>
      </div>
    );
  };

  // Fetch Tafsir dynamically when verse or Tafsir selection changes
  useEffect(() => {
    const fetchTafsir = async () => {
      const targetAyah = activeTafsirAyah || (activeAyahIndex !== null ? verses[activeAyahIndex] : null);
      if (!targetAyah) {
        setDynamicTafsirText('');
        return;
      }

      setLoadingTafsirText(true);
      setDynamicTafsirText('جاري تحميل التفسير المختار...');
      try {
        const text = await quranApi.getAyahTafsir(selectedTafsirId, targetAyah.chapter_id, targetAyah.verse_number);
        setDynamicTafsirText(text);
      } catch (err) {
        setDynamicTafsirText('فشل تحميل التفسير. يرجى التحقق من اتصالك بالشبكة.');
      } finally {
        setLoadingTafsirText(false);
      }
    };

    fetchTafsir();
  }, [activeTafsirAyah, activeAyahIndex, selectedTafsirId, panelPage, currentPage]);

  // Audio Player States
  const [playingAyah, setPlayingAyah] = useState<Ayah | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentReciter, setCurrentReciter] = useState('Alafasy_128kbps');
  const [shouldPlayFirstVerseOfPage, setShouldPlayFirstVerseOfPage] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Play audio for a specific verse
  const playAyahAudio = (ayah: Ayah) => {
    setPlayingAyah(ayah);
    setIsPlaying(true);
    
    if (audioRef.current) {
      audioRef.current.src = quranApi.getAyahAudioUrl(ayah.chapter_id, ayah.verse_number, currentReciter);
      audioRef.current.load();
      audioRef.current.play().catch(e => console.error("Audio play failed", e));
    }
    const surahName = chapters.find(c => c.id === ayah.chapter_id)?.name_arabic || '';
    showToast(`تلاوة آية ${ayah.verse_number} سورة ${surahName}`);
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error("Audio play failed", e));
      setIsPlaying(true);
    }
  };

  // Handle audio end - autoplay next
  const handleAudioEnded = () => {
    if (!playingAyah) return;
    
    // Find next verse on the active panel page
    const currentIndex = verses.findIndex(v => v.id === playingAyah.id);
    if (currentIndex !== -1 && currentIndex < verses.length - 1) {
      // Next verse is on the same page
      playAyahAudio(verses[currentIndex + 1]);
      setActiveAyahIndex(currentIndex + 1);
    } else {
      // Next verse is on the next page, flip page if possible
      if (currentPage < 603) {
        handleNextPage();
        setShouldPlayFirstVerseOfPage(true);
      } else {
        setIsPlaying(false);
        setPlayingAyah(null);
      }
    }
  };

  // Autoplay first verse of next page if page flipped during recitation
  useEffect(() => {
    if (shouldPlayFirstVerseOfPage && verses.length > 0) {
      playAyahAudio(verses[0]);
      setActiveAyahIndex(0);
      setShouldPlayFirstVerseOfPage(false);
    }
  }, [verses, shouldPlayFirstVerseOfPage]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Close context menu on any outside click
  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu) setContextMenu(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [contextMenu]);

  // Load chapter metadata
  useEffect(() => {
    setChapters(quranApi.getSurahList());
    const startPage = SURAH_START_PAGES[selectedSurahId] || 1;
    const alignedStartPage = startPage % 2 === 0 ? startPage - 1 : startPage;
    setCurrentPage(alignedStartPage);
    setPanelPage(alignedStartPage);
  }, [selectedSurahId]);

  // Load verses of the current facing pages
  useEffect(() => {
    const loadFacingPagesVerses = async () => {
      setLoadingVerses(true);
      try {
        const [rightData, leftData] = await Promise.all([
          quranApi.getPageVerses(currentPage),
          quranApi.getPageVerses(Math.min(604, currentPage + 1))
        ]);
        setRightPageVerses(rightData);
        setLeftPageVerses(leftData);
      } catch (err) {
        console.error("Error loading facing pages verses", err);
      } finally {
        setLoadingVerses(false);
      }
    };
    loadFacingPagesVerses();
  }, [currentPage]);

  // Sync panel page when book page turns
  useEffect(() => {
    setPanelPage(currentPage);
    setActiveAyahIndex(null);
  }, [currentPage]);

  // Save progress when page changes
  useEffect(() => {
    const activeSurahId = getActiveSurahIdForPage(currentPage);
    db.saveProgress(activeSurahId, 1);
  }, [currentPage]);

  const getActiveSurahIdForPage = (pageNum: number): number => {
    let activeId = 1;
    for (const [surahId, startPage] of Object.entries(SURAH_START_PAGES)) {
      if (pageNum >= startPage) {
        activeId = Number(surahId);
      } else {
        break;
      }
    }
    return activeId;
  };

  const getPageUrl = (pageNum: number): string => {
    const pagePadded = String(pageNum).padStart(3, '0');
    return `https://raw.githubusercontent.com/GovarJabbar/Quran-PNG/master/${pagePadded}.png`;
  };

  const triggerFlip = (direction: 'next' | 'prev') => {
    if (isFlipping) return;
    setFlipDirection(direction);
    setIsFlipping(true);

    setTimeout(() => {
      if (direction === 'next') {
        setCurrentPage(prev => Math.min(604, prev + 2));
      } else {
        setCurrentPage(prev => Math.max(1, prev - 2));
      }
      setIsFlipping(false);
      setActiveAyahIndex(null); // Reset selected verse on page change
    }, 600);
  };

  const handleNextPage = () => {
    if (currentPage < 603) {
      triggerFlip('next');
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 2) {
      triggerFlip('prev');
    }
  };

  const handleSurahSelect = (surahId: number) => {
    setSelectedSurahId(surahId);
    setSelectedVerseNumber(1);
    const startPage = SURAH_START_PAGES[surahId] || 1;
    const alignedStartPage = startPage % 2 === 0 ? startPage - 1 : startPage;
    setCurrentPage(alignedStartPage);
  };

  const handleBookmarkToggle = (ayah: Ayah) => {
    const isBookmarked = db.isBookmarked(ayah.chapter_id, ayah.verse_number);
    const surahName = chapters.find(c => c.id === ayah.chapter_id)?.name_arabic || '';
    if (isBookmarked) {
      db.removeBookmark(ayah.chapter_id, ayah.verse_number);
      showToast(`تمت إزالة الآية ${ayah.verse_number} سورة ${surahName} من المرجعية.`);
    } else {
      db.addBookmark(ayah.chapter_id, ayah.verse_number);
      showToast(`تم حفظ الآية ${ayah.verse_number} سورة ${surahName} للمرجعية.`);
    }
  };

  const handleListenAyah = (ayah: Ayah) => {
    setSelectedSurahId(ayah.chapter_id);
    setSelectedVerseNumber(ayah.verse_number);
    playAyahAudio(ayah);
  };

  const handleAddToMemorize = (ayah: Ayah) => {
    db.saveMemorizationItem(ayah.chapter_id, ayah.verse_number, 'medium', 1);
    showToast(`تمت إضافة الآية ${ayah.verse_number} لخطة الحفظ.`);
  };

  const isPageBookmarked = db.getBookmarks().some(
    b => b.chapter_id === getActiveSurahIdForPage(currentPage)
  );

  const handleBookmarkPageToggle = () => {
    const activeSurah = getActiveSurahIdForPage(currentPage);
    const surahName = chapters.find(c => c.id === activeSurah)?.name_arabic || '';
    if (isPageBookmarked) {
      db.removeBookmark(activeSurah, 1);
      showToast(`تمت إزالة صفحة سورة ${surahName} من المرجعية.`);
    } else {
      db.addBookmark(activeSurah, 1);
      showToast(`تمت إضافة صفحة سورة ${surahName} للمرجعية.`);
    }
  };

  const handleAyahContextMenu = (e: React.MouseEvent, ayah: Ayah) => {
    e.preventDefault();
    setContextMenu({
      ayah,
      x: e.clientX,
      y: e.clientY
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-2 w-full text-right font-arabic items-start">
      
      {/* Right Column: المصحف والتحكم */}
      <div className="w-full lg:w-[73%] flex flex-col gap-3 lg:sticky lg:top-24">
      
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-warm-card dark:bg-dark-card border border-warm-border dark:border-dark-border py-2.5 px-4 rounded-3xl shadow-xs">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 font-arabic">الانتقال للسورة:</span>
            <select
              value={getActiveSurahIdForPage(currentPage)}
              onChange={(e) => handleSurahSelect(Number(e.target.value))}
              className="p-2 rounded-xl border border-warm-border dark:border-dark-border text-xs bg-warm-bg dark:bg-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              {chapters.map(c => (
                <option key={c.id} value={c.id}>سورة {c.name_arabic}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 font-arabic">الانتقال للصفحة:</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="اكتب الرقم واضغط Enter"
              value={pageInputVal}
              onChange={(e) => setPageInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const p = parseInt(pageInputVal);
                  if (!isNaN(p) && p >= 1 && p <= 604) {
                    const alignedPage = p % 2 === 0 ? p - 1 : p;
                    setCurrentPage(alignedPage);
                    setPanelPage(p);
                    setActiveAyahIndex(null);
                    setPageInputVal('');
                  }
                }
              }}
              className="w-36 p-2 rounded-xl border border-warm-border dark:border-dark-border text-xs bg-warm-bg dark:bg-slate-900 font-bold text-center focus:outline-none focus:border-primary placeholder-gray-400 dark:placeholder-gray-500"
              title="اكتب رقم الصفحة (1-604) ثم اضغط Enter"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-gray-500 font-bold bg-primary/10 px-3.5 py-1.5 rounded-full">
            الصفحات: {currentPage} - {Math.min(604, currentPage + 1)}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmarkPageToggle}
              className={`p-2 border rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all ${
                isPageBookmarked 
                  ? 'bg-accent/20 border-accent/40 text-accent' 
                  : 'border-warm-border dark:border-dark-border text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isPageBookmarked ? 'fill-accent' : ''}`} />
              <span>{isPageBookmarked ? 'صفحة محفوظة' : 'حفظ الصفحة'}</span>
            </button>

            <button
              onClick={() => {
                setSelectedSurahId(getActiveSurahIdForPage(currentPage));
                setSelectedVerseNumber(1);
                setAudioAutoPlay(true);
                setActiveTab('listen');
              }}
              className="p-2 border border-warm-border dark:border-dark-border text-gray-500 hover:bg-gray-50 rounded-xl flex items-center gap-1.5 text-xs font-bold"
            >
              <Volume2 className="w-4 h-4" />
              <span>تشغيل التلاوة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Book Container with 3D Page Turn Animation */}
      <div className="relative w-full flex items-center justify-end py-2 select-none">
        
        {/* Wrapper to position arrows exactly on the outer edge of the Book Box */}
        <div className="relative w-full">
          
          {/* Subtle Page Nav Button Left (Goes Next) - Positioned exactly on the left edge */}
          {currentPage < 603 && (
            <button
              onClick={handleNextPage}
              className="absolute -left-6 sm:-left-9 top-1/2 -translate-y-1/2 z-40 p-1 text-slate-700/60 hover:text-slate-950 dark:text-slate-300/60 dark:hover:text-white transition-all cursor-pointer hover:scale-120 active:scale-90"
              title="الصفحة التالية (يسار)"
            >
              <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>
          )}

          {/* The 3D Book Box */}
          <div dir="ltr" className="w-full aspect-[4/3] sm:aspect-[1.33] bg-[#ebdcb9] dark:bg-[#141b29] p-2 sm:p-3.5 rounded-3xl shadow-2xl flex border-4 border-[#5c4015]/40 overflow-hidden">

          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 sm:w-10 bg-gradient-to-r from-transparent via-black/30 to-transparent z-30 pointer-events-none"></div>
          <div 
            onClick={() => setPanelPage(Math.min(604, currentPage + 1))}
            className={`flex-1 bg-[#fdfaf2] dark:bg-[#0f1524] rounded-l-2xl border-r border-black/10 p-2 sm:p-4 flex items-center relative shadow-inner cursor-pointer transition-all ${
              panelPage === Math.min(604, currentPage + 1)
                ? 'ring-4 ring-primary/80 bg-primary/5 dark:bg-primary/10' 
                : 'hover:bg-[#f7f2e5] dark:hover:bg-slate-800/30'
            }`}
            title="انقر للتفاعل مع آيات هذه الصفحة"
          >
            <div className="w-full h-full flex flex-row items-center justify-between gap-1">
              {/* Clickable circles in a vertical column on the left edge (Left Page) */}
              <div 
                className={`flex flex-col ${getCircleSizeStyle(leftPageVerses.length).containerGap} z-30 max-h-[95%] overflow-y-auto py-1 pl-1 shrink-0 select-none no-scrollbar`} 
                onClick={(e) => e.stopPropagation()}
              >
                {leftPageVerses.map((v, idx) => {
                  const isSelected = activeAyahIndex !== null && verses[activeAyahIndex]?.id === v.id;
                  const { sizeClass } = getCircleSizeStyle(leftPageVerses.length);
                  
                  return (
                    <button
                      key={v.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPanelPage(Math.min(604, currentPage + 1));
                        setActiveAyahIndex(idx);
                        const rect = e.currentTarget.getBoundingClientRect();
                        setContextMenu({
                          ayah: v,
                          x: rect.left + rect.width + 60,
                          y: rect.top + rect.height / 2
                        });
                      }}
                      onContextMenu={(e) => {
                        e.stopPropagation();
                        setPanelPage(Math.min(604, currentPage + 1));
                        setActiveAyahIndex(idx);
                        handleAyahContextMenu(e, v);
                      }}
                      className={`${sizeClass} rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0 font-sans font-bold ${
                        isSelected 
                          ? 'bg-accent text-accent-dark ring-2 ring-accent-dark scale-110 shadow-md animate-pulse font-extrabold' 
                          : 'bg-warm-bg dark:bg-slate-800 border border-warm-border dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-primary/20'
                      }`}
                      title={`آية رقم ${v.verse_number}`}
                    >
                      {v.verse_number}
                    </button>
                  );
                })}
              </div>

              {/* Centered page image */}
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="relative max-w-full max-h-full aspect-[4/6]">
                  <img
                    src={getPageUrl(Math.min(604, currentPage + 1))}
                    alt={`Page ${currentPage + 1}`}
                    className="w-full h-full object-fill pointer-events-none select-none rounded-sm shadow-xs"
                    loading="eager"
                  />
                </div>
              </div>
            </div>

            {panelPage === Math.min(604, currentPage + 1) && (
              <span className="absolute top-2 left-4 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">نشط</span>
            )}
            <span className="absolute bottom-2 left-4 text-[10px] font-sans font-bold text-gray-400">
              {Math.min(604, currentPage + 1)}
            </span>
          </div>

          {/* Facing Pages Sheet (Right Page - Odd page) */}
          <div 
            onClick={() => setPanelPage(currentPage)}
            className={`flex-1 bg-[#fdfaf2] dark:bg-[#0f1524] rounded-r-2xl border-l border-black/10 p-2 sm:p-4 flex items-center relative shadow-inner cursor-pointer transition-all ${
              panelPage === currentPage
                ? 'ring-4 ring-primary/80 bg-primary/5 dark:bg-primary/10' 
                : 'hover:bg-[#f7f2e5] dark:hover:bg-slate-800/30'
            }`}
            title="انقر للتفاعل مع آيات هذه الصفحة"
          >
            <div className="w-full h-full flex flex-row items-center justify-between gap-1">
              {/* Centered page image */}
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="relative max-w-full max-h-full aspect-[4/6]">
                  <img
                    src={getPageUrl(currentPage)}
                    alt={`Page ${currentPage}`}
                    className="w-full h-full object-fill pointer-events-none select-none rounded-sm shadow-xs"
                    loading="eager"
                  />
                </div>
              </div>

              {/* Clickable circles in a vertical column on the right edge (Right Page) */}
              <div 
                className={`flex flex-col ${getCircleSizeStyle(rightPageVerses.length).containerGap} z-30 max-h-[95%] overflow-y-auto py-1 pr-1 shrink-0 select-none no-scrollbar`} 
                onClick={(e) => e.stopPropagation()}
              >
                {rightPageVerses.map((v, idx) => {
                  const isSelected = activeAyahIndex !== null && verses[activeAyahIndex]?.id === v.id;
                  const { sizeClass } = getCircleSizeStyle(rightPageVerses.length);
                  
                  return (
                    <button
                      key={v.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPanelPage(currentPage);
                        setActiveAyahIndex(idx);
                        const rect = e.currentTarget.getBoundingClientRect();
                        setContextMenu({
                          ayah: v,
                          x: rect.left - 60,
                          y: rect.top + rect.height / 2
                        });
                      }}
                      onContextMenu={(e) => {
                        e.stopPropagation();
                        setPanelPage(currentPage);
                        setActiveAyahIndex(idx);
                        handleAyahContextMenu(e, v);
                      }}
                      className={`${sizeClass} rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0 font-sans font-bold ${
                        isSelected 
                          ? 'bg-accent text-accent-dark ring-2 ring-accent-dark scale-110 shadow-md animate-pulse font-extrabold' 
                          : 'bg-warm-bg dark:bg-slate-800 border border-warm-border dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-primary/20'
                      }`}
                      title={`آية رقم ${v.verse_number}`}
                    >
                      {v.verse_number}
                    </button>
                  );
                })}
              </div>
            </div>

            {panelPage === currentPage && (
              <span className="absolute top-2 right-4 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">نشط</span>
            )}
            <span className="absolute bottom-2 right-4 text-[10px] font-sans font-bold text-gray-400">
              {currentPage}
            </span>
          </div>

          {/* 3D Flipping Leaf Overlay (Visible only during flipping animation) */}
          {isFlipping && (
            <div 
              className={`absolute top-3 bottom-3 w-1/2 bg-[#fdfaf2] dark:bg-[#0f1524] z-20 shadow-2xl transition-all duration-600 origin-left flex items-center justify-center`}
              style={{
                left: '50%',
                transform: flipDirection === 'next' ? 'rotateY(0deg)' : 'rotateY(-180deg)',
                animation: flipDirection === 'next' ? 'flipAnimationNext 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' : 'flipAnimationPrev 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                transformStyle: 'preserve-3d',
                perspective: '1500px'
              }}
            >
              <div className="absolute inset-0 p-2 sm:p-4 flex items-center justify-center backface-hidden">
                <img
                  src={getPageUrl(flipDirection === 'next' ? currentPage + 1 : currentPage)}
                  alt="turning leaf"
                  className="max-h-full object-contain"
                />
              </div>
            </div>
          )}
          </div>

          {/* Subtle Page Nav Button Right (Goes Prev) - Positioned exactly on the right edge */}
          {currentPage > 1 && (
            <button
              onClick={handlePrevPage}
              className="absolute -right-6 sm:-right-9 top-1/2 -translate-y-1/2 z-40 p-1 text-slate-700/60 hover:text-slate-950 dark:text-slate-300/60 dark:hover:text-white transition-all cursor-pointer hover:scale-120 active:scale-90"
              title="الصفحة السابقة (يمين)"
            >
              <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>
          )}

        </div>
      </div>
      </div>

      {/* Left Column: التفسير وتفاعل الآيات */}
      <div className="w-full lg:w-[27%] flex flex-col gap-6 lg:h-[720px] xl:h-[780px]">
        {/* Interactive Verses Panel (Tafsir, translation, audio etc. for the selected page) */}
        <div className="bg-warm-card dark:bg-dark-card border border-warm-border dark:border-dark-border rounded-3xl p-4 shadow-sm flex flex-col h-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-border dark:border-dark-border pb-3.5 mb-4">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>تفسير وتفاعل آيات الصفحة {panelPage}</span>
          </h3>

          <div className="flex gap-2">
            <button
              onClick={() => setPanelPage(currentPage)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                panelPage === currentPage
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-warm-bg dark:bg-slate-900 border border-warm-border dark:border-dark-border text-gray-600 dark:text-gray-400 hover:bg-gray-50'
              }`}
            >
              الصفحة اليمنى ({currentPage})
            </button>
            {currentPage < 604 && (
              <button
                onClick={() => setPanelPage(currentPage + 1)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  panelPage === currentPage + 1
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-warm-bg dark:bg-slate-900 border border-warm-border dark:border-dark-border text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                }`}
              >
                الصفحة اليسرى ({currentPage + 1})
              </button>
            )}
          </div>
        </div>

        {/* Global Details Tab Bar and Font Adjusters (Moved from inside expanded verse) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-warm-border dark:border-dark-border pb-3 mb-4">
          <div 
            style={{ fontSize: `${menuFontSize}px` }}
            className="inline-flex bg-gray-100 dark:bg-slate-800/80 p-1 rounded-full gap-0.5 font-bold text-gray-500 dark:text-gray-400 mx-auto sm:mx-0 transition-all duration-150"
          >
            <button
              onClick={() => setActiveDetailTab('tafsir')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${activeDetailTab === 'tafsir' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              التفسير
            </button>
            <button
              onClick={() => setActiveDetailTab('tajweed')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${activeDetailTab === 'tajweed' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              الحكم التجويدي
            </button>
            <button
              onClick={() => setActiveDetailTab('translation')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${activeDetailTab === 'translation' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              الترجمة
            </button>
            <button
              onClick={() => setActiveDetailTab('irab')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${activeDetailTab === 'irab' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              الإعراب
            </button>
            <button
              onClick={() => setActiveDetailTab('revelation')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${activeDetailTab === 'revelation' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              أسباب النزول
            </button>
          </div>

          {/* Font sizing controllers */}
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-end shrink-0 mx-auto sm:mx-0 font-sans">
            {/* Menu Font size control */}
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-500 dark:text-gray-400">
              <span className="text-gray-400 font-arabic">خط القوائم:</span>
              <button
                onClick={() => setMenuFontSize(prev => Math.min(22, prev + 1))}
                className="w-5 h-5 rounded-full bg-white dark:bg-slate-700 text-xs font-bold flex items-center justify-center cursor-pointer shadow-xs hover:bg-gray-50 text-slate-700 dark:text-slate-300"
                title="تكبير خط القوائم (+)"
              >
                +
              </button>
              <button
                onClick={() => setMenuFontSize(prev => Math.max(9, prev - 1))}
                className="w-5 h-5 rounded-full bg-white dark:bg-slate-700 text-xs font-bold flex items-center justify-center cursor-pointer shadow-xs hover:bg-gray-50 text-slate-700 dark:text-slate-300"
                title="تصغير خط القوائم (-)"
              >
                -
              </button>
            </div>

            {/* Content Font size control */}
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-500 dark:text-gray-400">
              <span className="text-gray-400 font-arabic">خط التفسير:</span>
              <button
                onClick={() => setDetailFontSize(prev => Math.min(30, prev + 2))}
                className="w-5 h-5 rounded-full bg-white dark:bg-slate-700 text-xs font-bold flex items-center justify-center cursor-pointer shadow-xs hover:bg-gray-50 text-slate-700 dark:text-slate-300"
                title="تكبير خط التفسير (+)"
              >
                +
              </button>
              <button
                onClick={() => setDetailFontSize(prev => Math.max(12, prev - 2))}
                className="w-5 h-5 rounded-full bg-white dark:bg-slate-700 text-xs font-bold flex items-center justify-center cursor-pointer shadow-xs hover:bg-gray-50 text-slate-700 dark:text-slate-300"
                title="تصغير خط التفسير (-)"
              >
                -
              </button>
            </div>
          </div>
        </div>

        {loadingVerses ? (
          <div className="text-center text-xs text-gray-400 py-6">جاري تحميل قائمة الآيات للتفاعل...</div>
        ) : (
          <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
            {verses.map((ayah, index) => {
              const isSelected = activeAyahIndex === index;
              const isBookmarked = db.isBookmarked(ayah.chapter_id, ayah.verse_number);
              const surahName = chapters.find(c => c.id === ayah.chapter_id)?.name_arabic || '';

              return (
                <div 
                  key={ayah.id}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#fcf8ee] dark:bg-[#121926] border-accent/40 shadow-xs' 
                      : 'bg-warm-bg/50 dark:bg-slate-900/30 border-transparent hover:border-gray-200 dark:hover:border-slate-800'
                  }`}
                  onClick={() => setActiveAyahIndex(isSelected ? null : index)}
                  onContextMenu={(e) => handleAyahContextMenu(e, ayah)}
                >
                  {/* Sticky Header for selected/unselected verse */}
                  <div className={`sticky top-0 z-20 transition-all ${isSelected ? 'bg-[#fcf8ee] dark:bg-[#121926] pb-3 border-b border-warm-border/60 dark:border-dark-border/60 mb-2' : ''}`}>
                    {/* Arabic text with small index */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col items-center gap-1 shrink-0 mt-1">
                        <span className="inline-flex items-center justify-center w-6.5 h-6.5 rounded-full border border-accent text-accent font-sans font-bold text-[10px]">
                          {ayah.verse_number}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 font-arabic">سورة {surahName}</span>
                      </div>
                      <p className="font-quran font-bold text-gray-800 dark:text-gray-100 text-lg leading-relaxed text-right flex-1 select-none">
                        {ayah.text_uthmani}
                      </p>
                    </div>

                    {/* Tafsir Source Selector - Sticky under the verse text */}
                    {isSelected && activeDetailTab === 'tafsir' && (
                      <div className="flex justify-center mt-3" onClick={(e) => e.stopPropagation()}>
                        <div 
                          style={{ fontSize: `${Math.max(9, menuFontSize - 2)}px` }}
                          className="inline-flex bg-gray-100/60 dark:bg-slate-800/40 p-1 rounded-full gap-0.5 font-bold text-gray-500 dark:text-gray-400 transition-all duration-150"
                        >
                          {TAFSIRS_LIST.slice(0, 6).map(t => (
                            <button
                              key={t.id}
                              onClick={() => setSelectedTafsirId(t.id)}
                              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${selectedTafsirId === t.id ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-extrabold' : 'hover:text-slate-800 dark:hover:text-slate-200'}`}
                            >
                              {t.shortName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
              {/* Expanded Actions & Tafsir */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-warm-border dark:border-dark-border space-y-4 animate-fadeIn text-right" onClick={(e) => e.stopPropagation()}>
                      


                      {/* Tab Content Area */}
                      <div className="py-2">
                        
                        {/* 1. Tafsir Tab */}
                        {activeDetailTab === 'tafsir' && (
                          <div className="space-y-4">

                            {/* Highlighted Tafsir Text */}
                            <div className="bg-primary/5 dark:bg-slate-800/80 p-4 rounded-2xl border border-primary/10 max-h-[250px] lg:max-h-[350px] overflow-y-auto">
                              <p style={{ fontSize: `${detailFontSize}px` }} className={`text-gray-700 dark:text-gray-300 leading-relaxed font-arabic transition-all duration-150 ${loadingTafsirText ? 'animate-pulse text-gray-400' : ''}`}>
                                {loadingTafsirText ? 'جاري تحميل التفسير المختار...' : highlightTafsirText(dynamicTafsirText, ayah.text_uthmani)}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 2. Tajweed Tab */}
                        {activeDetailTab === 'tajweed' && (
                          <div style={{ fontSize: `${detailFontSize}px` }} className="bg-primary/5 dark:bg-slate-800/80 p-4 rounded-2xl border border-primary/10 transition-all duration-150 max-h-[250px] lg:max-h-[350px] overflow-y-auto">
                            {getTajweedAnalysis(ayah)}
                          </div>
                        )}

                        {/* 3. Translation Tab */}
                        {activeDetailTab === 'translation' && (
                          <div className="bg-primary/5 dark:bg-slate-800/80 p-4 rounded-2xl border border-primary/10 text-left max-h-[250px] lg:max-h-[350px] overflow-y-auto">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">
                              Clear Quran Translation:
                            </span>
                            <p style={{ fontSize: `${detailFontSize}px` }} className="text-gray-600 dark:text-gray-300 italic leading-relaxed font-sans transition-all duration-150">
                              {ayah.text_translation}
                            </p>
                          </div>
                        )}

                        {/* 4. Irab Tab */}
                        {activeDetailTab === 'irab' && (
                          <div style={{ fontSize: `${detailFontSize}px` }} className="bg-primary/5 dark:bg-slate-800/80 p-4 rounded-2xl border border-primary/10 transition-all duration-150 max-h-[250px] lg:max-h-[350px] overflow-y-auto">
                            {getIrabAnalysis(ayah)}
                          </div>
                        )}

                        {/* 5. Revelation Tab */}
                        {activeDetailTab === 'revelation' && (
                          <div style={{ fontSize: `${detailFontSize}px` }} className="bg-primary/5 dark:bg-slate-800/80 p-4 rounded-2xl border border-primary/10 transition-all duration-150 max-h-[250px] lg:max-h-[350px] overflow-y-auto">
                            {getRevelationContext(ayah)}
                          </div>
                        )}

                      </div>

                      {/* Verse Navigation Arrows (Like the screenshot arrow keys) */}
                      <div className="flex justify-center items-center gap-6 py-2 border-t border-warm-border dark:border-dark-border">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeAyahIndex !== null && activeAyahIndex < verses.length - 1) {
                              setActiveAyahIndex(activeAyahIndex + 1);
                            }
                          }}
                          disabled={activeAyahIndex === verses.length - 1}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors disabled:opacity-20 text-slate-700 dark:text-slate-300 cursor-pointer"
                          title="الآية التالية"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-bold font-sans">
                          آية {ayah.verse_number}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeAyahIndex !== null && activeAyahIndex > 0) {
                              setActiveAyahIndex(activeAyahIndex - 1);
                            }
                          }}
                          disabled={activeAyahIndex === 0}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors disabled:opacity-20 text-slate-700 dark:text-slate-300 cursor-pointer"
                          title="الآية السابقة"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2 justify-start pt-1 border-t border-warm-border/60 dark:border-dark-border/60 pt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleListenAyah(ayah);
                          }}
                          className="px-3.5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>تسميع صوتي</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmarkToggle(ayah);
                          }}
                          className={`px-3.5 py-2 border rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isBookmarked
                              ? 'bg-accent/15 border-accent/30 text-accent'
                              : 'border-warm-border dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-accent' : ''}`} />
                          <span>{isBookmarked ? 'محفوظة' : 'حفظ الآية'}</span>
                        </button>
 
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToMemorize(ayah);
                          }}
                          className="px-3.5 py-2 border border-warm-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>حفظ ومراجعة</span>
                        </button>
 
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab('journal');
                          }}
                          className="px-3.5 py-2 border border-warm-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>كتابة خاطرة</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>

      {/* Custom Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-[#1e293b]/95 dark:bg-slate-900/95 text-white backdrop-blur-xs flex items-center gap-1 p-1 rounded-2xl border border-slate-700/60 shadow-xl select-none"
          style={{ 
            left: `${contextMenu.x}px`, 
            top: `${contextMenu.y - 45}px`,
            transform: 'translate(-50%, -50%)',
            direction: 'rtl'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Play/Listen Button */}
          <button
            onClick={() => {
              handleListenAyah(contextMenu.ayah);
              setContextMenu(null);
            }}
            className="p-2.5 hover:bg-slate-800 rounded-xl transition-all flex flex-col items-center justify-center gap-1 min-w-[56px] cursor-pointer text-emerald-400"
            title="تشغيل الآية"
          >
            <Play className="w-4 h-4 fill-current" />
            <span className="text-[9px] font-bold">تشغيل</span>
          </button>

          {/* Tafsir Button */}
          <button
            onClick={() => {
              setActiveTafsirAyah(contextMenu.ayah);
              setContextMenu(null);
            }}
            className="p-2.5 hover:bg-slate-800 rounded-xl transition-all flex flex-col items-center justify-center gap-1 min-w-[56px] cursor-pointer text-amber-300"
            title="عرض التفسير"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-[9px] font-bold">تفسير</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={() => {
              const surahName = chapters.find(c => c.id === contextMenu.ayah.chapter_id)?.name_arabic || '';
              navigator.clipboard.writeText(`${contextMenu.ayah.text_uthmani} ﴿${contextMenu.ayah.verse_number}﴾ [سورة ${surahName}]`);
              showToast("تم نسخ الآية الكريمة إلى الحافظة.");
              setContextMenu(null);
            }}
            className="p-2.5 hover:bg-slate-800 rounded-xl transition-all flex flex-col items-center justify-center gap-1 min-w-[56px] cursor-pointer text-blue-300"
            title="نسخ الآية"
          >
            <Copy className="w-4 h-4" />
            <span className="text-[9px] font-bold">نسخ</span>
          </button>

          {/* Share Button */}
          <button
            onClick={() => {
              const surahName = chapters.find(c => c.id === contextMenu.ayah.chapter_id)?.name_arabic || '';
              const shareText = `${contextMenu.ayah.text_uthmani} ﴿${contextMenu.ayah.verse_number}﴾ - سورة ${surahName}\nالتفسير: ${contextMenu.ayah.tafsir}`;
              
              if (navigator.share) {
                navigator.share({
                  title: `آية من سورة ${surahName}`,
                  text: shareText,
                }).catch(() => {
                  navigator.clipboard.writeText(shareText);
                  showToast("تم نسخ الآية وتفسيرها للمشاركة.");
                });
              } else {
                navigator.clipboard.writeText(shareText);
                showToast("تم نسخ الآية وتفسيرها للمشاركة.");
              }
              setContextMenu(null);
            }}
            className="p-2.5 hover:bg-slate-800 rounded-xl transition-all flex flex-col items-center justify-center gap-1 min-w-[56px] cursor-pointer text-indigo-300"
            title="مشاركة"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-[9px] font-bold">مشاركة</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={() => {
              handleBookmarkToggle(contextMenu.ayah);
              setContextMenu(null);
            }}
            className="p-2.5 hover:bg-slate-800 rounded-xl transition-all flex flex-col items-center justify-center gap-1 min-w-[56px] cursor-pointer text-rose-300"
            title="حفظ علامة"
          >
            <Bookmark className={`w-4 h-4 ${db.isBookmarked(contextMenu.ayah.chapter_id, contextMenu.ayah.verse_number) ? 'fill-current text-accent' : ''}`} />
            <span className="text-[9px] font-bold">علامة</span>
          </button>
        </div>
      )}

      {/* Tafsir Modal */}
      {activeTafsirAyah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-warm-card dark:bg-dark-card border border-warm-border dark:border-dark-border max-w-lg w-full rounded-3xl p-6 shadow-2xl relative animate-scaleUp">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b border-warm-border dark:border-dark-border pb-3 mb-4 text-right">
              تفسير آية رقم {activeTafsirAyah.verse_number} - سورة {chapters.find(c => c.id === activeTafsirAyah.chapter_id)?.name_arabic}
            </h4>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-right">
              <p className="font-quran font-bold text-[#1e293b] dark:text-gray-100 text-xl leading-relaxed bg-[#fdfaf2] dark:bg-slate-900/50 p-4 rounded-2xl border border-warm-border dark:border-dark-border">
                {activeTafsirAyah.text_uthmani}
              </p>
              
              <div className="bg-[#10b981]/15 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-arabic">التفسير المختار:</span>
                  <select
                    value={selectedTafsirId}
                    onChange={(e) => setSelectedTafsirId(Number(e.target.value))}
                    className="p-1 rounded-lg border border-emerald-500/20 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold focus:outline-none cursor-pointer"
                  >
                    {TAFSIRS_LIST.map(t => (
                      <option 
                        key={t.id} 
                        value={t.id}
                        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold"
                      >
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className={`text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-arabic ${loadingTafsirText ? 'animate-pulse text-gray-400' : ''}`}>
                  {dynamicTafsirText}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-400 block mb-1">الترجمة الإنجليزية (Translation):</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed italic font-sans">
                  {activeTafsirAyah.text_translation}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveTafsirAyah(null)}
                className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Audio Element */}
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Floating Premium Audio Player Bar */}
      {playingAyah && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center gap-4 border border-slate-700/60 w-[90%] max-w-xl animate-slideUp select-none" dir="rtl">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
              {playingAyah.verse_number}
            </span>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block">تلاوة سورة {chapters.find(c => c.id === playingAyah.chapter_id)?.name_arabic}</span>
              <p className="text-xs font-bold line-clamp-1 text-slate-200">{playingAyah.text_uthmani}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto sm:mr-auto border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0 shrink-0">
            <div className="flex items-center gap-2">
              <select
                value={currentReciter}
                onChange={(e) => {
                  setCurrentReciter(e.target.value);
                  setTimeout(() => playAyahAudio(playingAyah), 50);
                }}
                className="bg-slate-800 text-white text-[10px] font-bold p-1.5 rounded-lg border border-slate-700 focus:outline-none cursor-pointer"
              >
                {quranApi.getReciters().map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const idx = verses.findIndex(v => v.id === playingAyah.id);
                  if (idx !== -1 && idx > 0) {
                    playAyahAudio(verses[idx - 1]);
                    setActiveAyahIndex(idx - 1);
                  }
                }}
                disabled={verses.findIndex(v => v.id === playingAyah.id) <= 0}
                className="p-2 hover:bg-slate-800 text-gray-400 hover:text-white rounded-full transition-colors disabled:opacity-20 cursor-pointer"
                title="الآية السابقة"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlayPause}
                className="p-3 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-full transition-all shadow-md transform active:scale-95 cursor-pointer flex items-center justify-center animate-fadeIn"
                title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
              >
                {isPlaying ? (
                  <span className="w-3.5 h-3.5 flex justify-center items-center gap-0.5">
                    <span className="w-1 h-3.5 bg-slate-900 rounded-xs"></span>
                    <span className="w-1 h-3.5 bg-slate-900 rounded-xs"></span>
                  </span>
                ) : (
                  <Play className="w-4 h-4 fill-slate-900 text-slate-900" />
                )}
              </button>

              <button
                onClick={() => {
                  const idx = verses.findIndex(v => v.id === playingAyah.id);
                  if (idx !== -1 && idx < verses.length - 1) {
                    playAyahAudio(verses[idx + 1]);
                    setActiveAyahIndex(idx + 1);
                  } else if (currentPage < 603) {
                    handleNextPage();
                    setShouldPlayFirstVerseOfPage(true);
                  }
                }}
                className="p-2 hover:bg-slate-800 text-gray-400 hover:text-white rounded-full transition-colors cursor-pointer"
                title="الآية التالية"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.pause();
                  }
                  setIsPlaying(false);
                  setPlayingAyah(null);
                }}
                className="text-[10px] text-rose-400 font-bold px-2 py-1 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1e293b]/95 text-white text-xs font-bold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700/60 animate-slideUp">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CSS flip and fade animations */}
      <style>{`
        @keyframes flipAnimationNext {
          0% {
            transform: rotateY(0deg);
            box-shadow: -10px 0 20px rgba(0,0,0,0.1);
          }
          100% {
            transform: rotateY(-180deg);
            box-shadow: 10px 0 20px rgba(0,0,0,0.2);
          }
        }
        @keyframes flipAnimationPrev {
          0% {
            transform: rotateY(-180deg);
            box-shadow: 10px 0 20px rgba(0,0,0,0.1);
          }
          100% {
            transform: rotateY(0deg);
            box-shadow: -10px 0 20px rgba(0,0,0,0.2);
          }
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-scaleUp {
          animation: scaleUp 0.2s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
