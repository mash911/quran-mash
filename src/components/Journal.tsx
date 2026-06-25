import React, { useState, useEffect } from 'react';
import { BookOpenCheck, Search, Tag, Calendar, Lock, Unlock, Trash2 } from 'lucide-react';
import { db } from '../services/db';
import { quranApi } from '../services/quranApi';
import type { Reflection, Chapter } from '../types';


export const Journal: React.FC = () => {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // New reflection form state
  const [chapterId, setChapterId] = useState(1);
  const [verseNum, setVerseNum] = useState(1);
  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(true);

  const availableTags = ['صبر', 'رحمة', 'توبة', 'رزق', 'دعاء', 'طمأنينة', 'شكر'];

  useEffect(() => {
    setChapters(quranApi.getSurahList());
    refreshReflections();
  }, []);

  const refreshReflections = () => {
    setReflections(db.getReflections());
  };

  const handleAddReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    db.addReflection(chapterId, verseNum, text, tags, isPrivate);
    refreshReflections();

    // Reset Form
    setText('');
    setTags([]);
    setIsPrivate(true);
    alert("تم حفظ خاطرتك الإيمانية بنجاح.");
  };

  const handleDelete = (id: string) => {
    if (confirm("هل تريد بالتأكيد حذف هذه الخاطرة القرآنية؟")) {
      db.deleteReflection(id);
      refreshReflections();
    }
  };

  const toggleTag = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Filter reflections
  const filteredReflections = reflections.filter((r) => {
    const chapterMeta = chapters.find((c) => c.id === r.chapter_id);
    const surahName = chapterMeta ? chapterMeta.name_arabic : '';
    
    const matchesSearch = 
      r.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surahName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.verse_number.toString() === searchQuery;

    const matchesTag = selectedTag ? r.tags.includes(selectedTag) : true;

    return matchesSearch && matchesTag;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {/* Add Reflection Form */}
      <div className="glass-effect rounded-3xl p-6 border border-warm-border dark:border-dark-border shadow-sm flex flex-col justify-between h-fit">
        <form onSubmit={handleAddReflection} className="space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 border-b border-warm-border dark:border-dark-border pb-3 flex items-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-primary" />
            <span>كتابة خاطرة أو تدبر</span>
          </h3>

          {/* Surah / Verse picker */}
          <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
            <div>
              <label className="block text-gray-400 mb-1">الآية:</label>
              <input
                type="number"
                min={1}
                value={verseNum}
                onChange={(e) => setVerseNum(Number(e.target.value))}
                className="w-full text-center p-2.5 rounded-xl border border-warm-border dark:border-dark-border bg-warm-card dark:bg-dark-card font-sans font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">السورة:</label>
              <select
                value={chapterId}
                onChange={(e) => setChapterId(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-warm-border dark:border-dark-border bg-warm-card dark:bg-dark-card font-arabic font-bold text-center"
              >
                {chapters.map(c => (
                  <option key={c.id} value={c.id}>سورة {c.name_arabic}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Text Editor */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">تدبراتك حول الآية:</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="اكتب ما يلهمك الله به من تدبر، فهم، أو مشاعر عند قراءة الآية الكريمة..."
              className="w-full text-right p-3 rounded-xl border border-warm-border dark:border-dark-border bg-warm-card dark:bg-dark-card text-sm focus:border-primary focus:outline-none leading-relaxed"
              required
            />
          </div>

          {/* Tags selectors */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-400 block">تصنيفات ومواضيع:</span>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map(tag => {
                const isSelected = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-primary text-white'
                        : 'bg-warm-card dark:bg-dark-card border border-warm-border dark:border-dark-border text-gray-500'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between border-t border-warm-border dark:border-dark-border pt-3">
            <span className="text-xs font-semibold text-gray-400">الخصوصية:</span>
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-warm-border dark:border-dark-border text-xs font-semibold text-gray-500"
            >
              {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isPrivate ? 'خاطرة خاصة' : 'عامة (للمشاركة)'}</span>
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/10 hover:bg-primary-dark transition-all"
          >
            حفظ الخاطرة
          </button>
        </form>
      </div>

      {/* reflections list */}
      <div className="md:col-span-2 space-y-4">
        {/* Search header panel */}
        <div className="glass-effect p-4 rounded-2xl border border-warm-border dark:border-dark-border flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="ابحث في خواطرك..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-right pl-3 pr-9 py-2 rounded-xl text-xs border border-warm-border dark:border-dark-border bg-warm-card dark:bg-dark-card focus:outline-none focus:border-primary"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          </div>

          {/* Tag filters list */}
          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                selectedTag === null ? 'bg-accent text-white' : 'bg-warm-border text-gray-500'
              }`}
            >
              الكل
            </button>
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                  selectedTag === tag ? 'bg-accent text-white' : 'bg-warm-border text-gray-500'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* journal list */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {filteredReflections.length === 0 ? (
            <div className="glass-effect p-8 rounded-3xl text-center border border-warm-border dark:border-dark-border text-gray-400 text-sm">
              لا توجد خواطر مطابقة حالياً. ابدأ بكتابة خاطرتك الأولى!
            </div>
          ) : (
            filteredReflections.map((ref) => {
              const surahMeta = chapters.find(c => c.id === ref.chapter_id);
              const dateStr = new Date(ref.created_at).toLocaleDateString('ar-EG');
              
              return (
                <div
                  key={ref.id}
                  className="glass-effect rounded-3xl p-5 border border-warm-border dark:border-dark-border shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="flex justify-between items-center border-b border-warm-border dark:border-dark-border pb-2.5 mb-3.5">
                    <div className="text-right">
                      <span className="font-bold text-primary dark:text-primary-light font-arabic text-sm">
                        سورة {surahMeta?.name_arabic} : آية {ref.verse_number}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateStr}</span>
                        <span>•</span>
                        {ref.is_private ? (
                          <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> خاصة</span>
                        ) : (
                          <span className="flex items-center gap-1"><Unlock className="w-3 h-3" /> عامة</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(ref.id)}
                      className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors"
                      title="حذف الخاطرة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-arabic whitespace-pre-line text-right">
                    {ref.text}
                  </p>

                  {/* tags display */}
                  {ref.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-4 flex-wrap justify-start">
                      {ref.tags.map(t => (
                        <span 
                          key={t}
                          className="bg-accent/10 border border-accent/20 text-accent px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          <span>{t}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
