import React, { useState } from 'react';
import { Search as SearchIcon, Compass, ArrowLeft, Loader2, Info } from 'lucide-react';
import { SURAHS_METADATA } from '../services/quranApi';

interface SearchProps {
  setSelectedSurahId: (id: number) => void;
  setSelectedVerseNumber: (num: number) => void;
  setActiveTab: (tab: string) => void;
}

interface SearchResult {
  verse_key: string; // e.g. "1:5"
  verse_number: number;
  chapter_id: number;
  text: string;
  highlighted?: string;
  surah_name: string;
}

// Canonical starting verse boundaries for each of the 30 Juzs
const JUZ_STARTS = [
  { juz: 1, surah: 1, verse: 1 },
  { juz: 2, surah: 2, verse: 142 },
  { juz: 3, surah: 2, verse: 253 },
  { juz: 4, surah: 3, verse: 93 },
  { juz: 5, surah: 4, verse: 24 },
  { juz: 6, surah: 4, verse: 148 },
  { juz: 7, surah: 5, verse: 82 },
  { juz: 8, surah: 6, verse: 111 },
  { juz: 9, surah: 7, verse: 88 },
  { juz: 10, surah: 8, verse: 41 },
  { juz: 11, surah: 9, verse: 93 },
  { juz: 12, surah: 11, verse: 6 },
  { juz: 13, surah: 12, verse: 53 },
  { juz: 14, surah: 15, verse: 1 },
  { juz: 15, surah: 17, verse: 1 },
  { juz: 16, surah: 18, verse: 75 },
  { juz: 17, surah: 21, verse: 1 },
  { juz: 18, surah: 23, verse: 1 },
  { juz: 19, surah: 25, verse: 21 },
  { juz: 20, surah: 27, verse: 56 },
  { juz: 21, surah: 29, verse: 46 },
  { juz: 22, surah: 33, verse: 31 },
  { juz: 23, surah: 36, verse: 28 },
  { juz: 24, surah: 39, verse: 32 },
  { juz: 25, surah: 41, verse: 47 },
  { juz: 26, surah: 46, verse: 1 },
  { juz: 27, surah: 51, verse: 31 },
  { juz: 28, surah: 58, verse: 1 },
  { juz: 29, surah: 67, verse: 1 },
  { juz: 30, surah: 78, verse: 1 },
];

const getJuzNumber = (surah: number, verse: number): number => {
  for (let i = JUZ_STARTS.length - 1; i >= 0; i--) {
    const start = JUZ_STARTS[i];
    if (surah > start.surah || (surah === start.surah && verse >= start.verse)) {
      return start.juz;
    }
  }
  return 1;
};

// Check if a result falls within the selected search scope
const matchesScope = (res: SearchResult, scopeType: string, customJuz: number, customSurah: number): boolean => {
  if (scopeType === 'all') return true;
  if (scopeType === 'custom_surah') {
    return res.chapter_id === customSurah;
  }
  
  const juzNum = getJuzNumber(res.chapter_id, res.verse_number);
  
  if (scopeType === 'custom_juz') {
    return juzNum === customJuz;
  }
  if (scopeType === 'first_half') {
    return juzNum >= 1 && juzNum <= 15;
  }
  if (scopeType === 'second_half') {
    return juzNum >= 16 && juzNum <= 30;
  }
  if (scopeType === 'first_ten') {
    return juzNum >= 1 && juzNum <= 10;
  }
  if (scopeType === 'middle_ten') {
    return juzNum >= 11 && juzNum <= 20;
  }
  if (scopeType === 'last_ten') {
    return juzNum >= 21 && juzNum <= 30;
  }
  
  return true;
};

export const Search: React.FC<SearchProps> = ({
  setSelectedSurahId,
  setSelectedVerseNumber,
  setActiveTab
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search scope states
  const [scopeType, setScopeType] = useState<string>('all');
  const [customJuz, setCustomJuz] = useState<number>(1);
  const [customSurah, setCustomSurah] = useState<number>(1);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const executeSearch = async (searchQuery: string, startPage: number, append: boolean) => {
    setLoading(true);
    setError(null);

    let currentApiPage = startPage;
    let accumulatedResults: SearchResult[] = append ? [...results] : [];
    let hasMorePages = true;
    let apiTotalPages = 1;

    try {
      // Loop to fetch pages from the API until we have enough matching results (e.g., 20) or run out of pages
      const targetMinMatches = 20;
      let matchedCountThisBatch = 0;
      let loopIteration = 0;

      while (hasMorePages && matchedCountThisBatch < targetMinMatches && loopIteration < 5) {
        loopIteration++;
        const url = `https://api.quran.com/api/v4/search?q=${encodeURIComponent(searchQuery)}&size=100&page=${currentApiPage}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("API error");
        
        const data = await res.json();
        
        if (data.search && data.search.results && data.search.results.length > 0) {
          apiTotalPages = data.search.total_pages || 1;
          
          const mappedResults: SearchResult[] = data.search.results.map((r: any) => {
            const [chIdStr, vsNumStr] = r.verse_key.split(':');
            const chId = Number(chIdStr);
            const vsNum = Number(vsNumStr);
            
            const surahMeta = SURAHS_METADATA.find(c => c.id === chId);
            return {
              verse_key: r.verse_key,
              chapter_id: chId,
              verse_number: vsNum,
              text: r.text,
              highlighted: r.highlighted,
              surah_name: surahMeta ? surahMeta.name_arabic : `سورة ${chId}`
            };
          });

          // Filter results based on scope
          const filtered = mappedResults.filter(r => matchesScope(r, scopeType, customJuz, customSurah));
          accumulatedResults = [...accumulatedResults, ...filtered];
          matchedCountThisBatch += filtered.length;

          if (currentApiPage >= apiTotalPages) {
            hasMorePages = false;
          } else {
            currentApiPage++;
          }
        } else {
          hasMorePages = false;
        }
      }

      setResults(accumulatedResults);
      setTotalResults(accumulatedResults.length);
      setTotalPages(hasMorePages ? currentApiPage : currentApiPage - 1);
      setCurrentPage(currentApiPage - 1);

      if (accumulatedResults.length === 0) {
        setError("لم يتم العثور على أي نتائج تطابق الكلمة المبحوث عنها ضمن النطاق المحدد.");
      }
    } catch (err) {
      console.warn("Searching online failed, fallback to local indexing...", err);
      // Fallback: Local matching on chapter names (only on initial search, not append)
      if (!append) {
        const localResults: SearchResult[] = [];
        SURAHS_METADATA.forEach(ch => {
          if (ch.name_arabic.includes(searchQuery) || ch.name_simple.toLowerCase().includes(searchQuery.toLowerCase())) {
            const tempResult: SearchResult = {
              verse_key: `${ch.id}:1`,
              chapter_id: ch.id,
              verse_number: 1,
              text: `اسم السورة: سورة ${ch.name_arabic} - اضغط لفتح السورة وبدء القراءة.`,
              surah_name: ch.name_arabic
            };
            if (matchesScope(tempResult, scopeType, customJuz, customSurah)) {
              localResults.push(tempResult);
            }
          }
        });
        setResults(localResults);
        setTotalResults(localResults.length);
        setTotalPages(1);
        setCurrentPage(1);
        if (localResults.length === 0) {
          setError("تعذر الاتصال بخدمة البحث، ولم يتم العثور على نتائج مطابقة محلياً ضمن النطاق المحدد.");
        }
      } else {
        setError("تعذر تحميل المزيد من النتائج بسبب مشكلة في الاتصال بالإنترنت.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    executeSearch(query, 1, false);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      executeSearch(query, currentPage + 1, true);
    }
  };

  const handleResultClick = (chapterId: number, verseNumber: number) => {
    setSelectedSurahId(chapterId);
    setSelectedVerseNumber(verseNumber);
    setActiveTab('quran');
  };

  // Arabic diacritic-aware highlighting function
  const highlightArabicText = (originalText: string, searchQuery: string) => {
    if (!searchQuery || !searchQuery.trim()) {
      return <span>{originalText}</span>;
    }

    const diacriticsRegex = /[\u064b-\u065f\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed]/;

    const normalizeChar = (char: string) => {
      if (char === '\u0640') return ''; // strip tatweel
      const c = char.replace(diacriticsRegex, '');
      if (!c) return '';
      if (/[أإآاٱ]/.test(c)) return ''; // strip all forms of Alif to match different spellings
      if (c === 'ة') return 'ه';
      if (c === 'ى' || c === 'ي' || c === 'ئ') return 'ي';
      if (c === 'ؤ') return 'و';
      return c;
    };

    const normalizeArabic = (str: string) => {
      let result = '';
      for (let i = 0; i < str.length; i++) {
        result += normalizeChar(str[i]);
      }
      return result;
    };

    const queryWords = searchQuery.trim().split(/\s+/).map(w => normalizeArabic(w)).filter(Boolean);
    if (queryWords.length === 0) {
      return <span>{originalText}</span>;
    }

    const originalIndices: number[] = [];
    let normalizedText = '';

    for (let i = 0; i < originalText.length; i++) {
      const char = originalText[i];
      if (diacriticsRegex.test(char)) continue;

      const norm = normalizeChar(char);
      if (norm !== '') {
        for (let j = 0; j < norm.length; j++) {
          normalizedText += norm[j];
          originalIndices.push(i);
        }
      }
    }

    const matches: { start: number; end: number }[] = [];
    queryWords.forEach(word => {
      let pos = normalizedText.indexOf(word);
      while (pos !== -1) {
        let origStart = originalIndices[pos];
        const lastCharIndex = pos + word.length - 1;
        let origEnd = originalIndices[lastCharIndex] + 1;

        // Extend origStart backward to include leading alifs or diacritics
        while (origStart > 0 && (/[أإآاٱ]/.test(originalText[origStart - 1]) || diacriticsRegex.test(originalText[origStart - 1]) || originalText[origStart - 1] === '\u0640')) {
          origStart--;
        }

        // Include any following diacritics or tatweel
        while (origEnd < originalText.length && (diacriticsRegex.test(originalText[origEnd]) || originalText[origEnd] === '\u0640')) {
          origEnd++;
        }

        matches.push({ start: origStart, end: origEnd });
        pos = normalizedText.indexOf(word, pos + 1);
      }
    });

    if (matches.length === 0) {
      return <span>{originalText}</span>;
    }

    // Sort matches and merge overlapping ones
    matches.sort((a, b) => a.start - b.start);
    const mergedMatches: { start: number; end: number }[] = [];
    let currentMatch = matches[0];

    for (let i = 1; i < matches.length; i++) {
      const nextMatch = matches[i];
      if (nextMatch.start < currentMatch.end) {
        currentMatch.end = Math.max(currentMatch.end, nextMatch.end);
      } else {
        mergedMatches.push(currentMatch);
        currentMatch = nextMatch;
      }
    }
    mergedMatches.push(currentMatch);

    // Split text and render React elements
    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    mergedMatches.forEach((match, idx) => {
      if (match.start > lastIndex) {
        result.push(<span key={`text-${idx}`}>{originalText.substring(lastIndex, match.start)}</span>);
      }
      result.push(
        <mark
          key={`highlight-${idx}`}
          className="bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold rounded px-1 border-b border-amber-300 dark:border-amber-700/50"
        >
          {originalText.substring(match.start, match.end)}
        </mark>
      );
      lastIndex = match.end;
    });

    if (lastIndex < originalText.length) {
      result.push(<span key="text-end">{originalText.substring(lastIndex)}</span>);
    }

    return <>{result}</>;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Search Header Form */}
      <div className="glass-effect rounded-3xl p-6 sm:p-8 border border-warm-border dark:border-dark-border shadow-sm">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-gray-800 dark:text-gray-200 font-arabic">البحث القرآني المتقدم</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن كلمة، آية، أو سورة (مثال: رحمة، صبر، الملك)..."
                className="w-full text-right pl-3 pr-10 py-3.5 rounded-2xl text-sm border border-warm-border dark:border-dark-border bg-warm-card dark:bg-dark-card focus:outline-none focus:border-primary font-arabic"
                required
              />
              <SearchIcon className="w-5 h-5 text-gray-400 absolute right-3.5 top-4" />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-primary text-white font-bold rounded-2xl text-sm hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/10 shrink-0"
            >
              {loading && results.length === 0 ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري البحث...</span>
                </>
              ) : (
                <span>ابحث الآن</span>
              )}
            </button>
          </div>

          {/* Scope selection controls row */}
          <div className="pt-3 border-t border-warm-border/60 dark:border-dark-border/60 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-bold text-gray-500 font-arabic select-none">نطاق البحث:</span>
            
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <select
                value={scopeType}
                onChange={(e) => setScopeType(e.target.value)}
                className="text-right p-2.5 rounded-xl border border-warm-border dark:border-dark-border bg-warm-card dark:bg-dark-card focus:border-primary focus:outline-none font-arabic font-semibold select-none cursor-pointer"
              >
                <option value="all">كامل القرآن الكريم</option>
                <option value="first_half">النصف الأول من القرآن (الأجزاء 1-15)</option>
                <option value="second_half">النصف الثاني من القرآن (الأجزاء 16-30)</option>
                <option value="first_ten">الأجزاء العشرة الأولى (1-10)</option>
                <option value="middle_ten">الأجزاء العشرة الوسطى (11-20)</option>
                <option value="last_ten">الأجزاء العشرة الأخيرة (21-30)</option>
                <option value="custom_juz">جزء مخصص...</option>
                <option value="custom_surah">سورة مخصصة...</option>
              </select>

              {scopeType === 'custom_juz' && (
                <div className="flex items-center gap-1.5 animate-fadeIn">
                  <span className="text-gray-400 font-arabic">اختر الجزء:</span>
                  <select
                    value={customJuz}
                    onChange={(e) => setCustomJuz(Number(e.target.value))}
                    className="text-center p-2.5 rounded-xl border border-warm-border dark:border-dark-border bg-warm-card dark:bg-dark-card focus:border-primary focus:outline-none font-semibold select-none cursor-pointer"
                  >
                    {Array.from({ length: 30 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>الجزء {i + 1}</option>
                    ))}
                  </select>
                </div>
              )}

              {scopeType === 'custom_surah' && (
                <div className="flex items-center gap-1.5 animate-fadeIn">
                  <span className="text-gray-400 font-arabic">اختر السورة:</span>
                  <select
                    value={customSurah}
                    onChange={(e) => setCustomSurah(Number(e.target.value))}
                    className="text-right p-2.5 rounded-xl border border-warm-border dark:border-dark-border bg-warm-card dark:bg-dark-card focus:border-primary focus:outline-none font-arabic font-semibold select-none cursor-pointer"
                  >
                    {SURAHS_METADATA.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        سورة {ch.name_arabic}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Search results display */}
      <div className="space-y-4">
        {totalResults > 0 && (
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 block px-2 font-arabic">
            تم العثور على {totalResults} نتيجة بحث عن "{query}"
            {scopeType !== 'all' && (
              <span>
                {' '}ضمن نطاق (
                {scopeType === 'first_half' && 'النصف الأول من القرآن'}
                {scopeType === 'second_half' && 'النصف الثاني من القرآن'}
                {scopeType === 'first_ten' && 'الأجزاء العشرة الأولى'}
                {scopeType === 'middle_ten' && 'الأجزاء العشرة الوسطى'}
                {scopeType === 'last_ten' && 'الأجزاء العشرة الأخيرة'}
                {scopeType === 'custom_juz' && `الجزء ${customJuz}`}
                {scopeType === 'custom_surah' && `سورة ${SURAHS_METADATA.find(c => c.id === customSurah)?.name_arabic}`}
                )
              </span>
            )}:
          </span>
        )}

        {error && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-2xl p-4 flex items-start gap-2.5 text-xs font-semibold">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {results.length === 0 && !loading && !error && (
            <div className="glass-effect p-12 rounded-3xl text-center border border-warm-border dark:border-dark-border text-gray-400 text-sm">
              اكتب كلمة أو جملة واضغط على زر البحث لاستخراج الآيات المتعلقة بها.
            </div>
          )}

          {results.map((res, index) => (
            <div
              key={index}
              onClick={() => handleResultClick(res.chapter_id, res.verse_number)}
              className="glass-effect rounded-3xl p-5 border border-warm-border dark:border-dark-border shadow-xs hover:border-primary/40 cursor-pointer interactive-hover flex flex-col justify-between"
            >
              <div className="flex justify-between items-center border-b border-warm-border dark:border-dark-border pb-2.5 mb-3.5">
                <span className="font-bold text-primary dark:text-primary-light font-arabic text-sm">
                  سورة {res.surah_name} ({res.verse_key})
                </span>
                
                <span className="text-[10px] font-bold text-accent bg-accent/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>فتح الآية</span>
                  <ArrowLeft className="w-3 h-3" />
                </span>
              </div>

              <p className="text-base font-quran text-gray-800 dark:text-gray-100 leading-loose text-right select-none">
                {highlightArabicText(res.text, query)}
              </p>
            </div>
          ))}

          {/* Load More Button */}
          {currentPage < totalPages && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-light font-bold rounded-2xl text-xs border border-primary/20 hover:border-primary/40 transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري التحميل...</span>
                  </>
                ) : (
                  <span>تحميل المزيد من النتائج</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
