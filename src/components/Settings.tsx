import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Shield, BookOpen, Headphones, CloudLightning } from 'lucide-react';
import { db } from '../services/db';
import type { DailyGoal, AudioPreference } from '../types';


interface SettingsProps {
  onRefreshGoal: () => void;
  goal: DailyGoal;
}

export const Settings: React.FC<SettingsProps> = ({
  onRefreshGoal,
  goal
}) => {
  // Goal Settings
  const [goalType, setGoalType] = useState<'time' | 'pages' | 'finish'>(goal.type);
  const [goalValue, setGoalValue] = useState<number>(goal.value);
  
  // Audio Preferences
  const [audioPref, setAudioPref] = useState<AudioPreference>({
    reciter: 'Alafasy_128kbps',
    speed: 1.0,
    repeat_each: 1,
  });

  // Supabase status mock
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [syncStatus, setSyncStatus] = useState<'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    setAudioPref(db.getAudioPreference());
    
    // Load supabase keys if saved
    const savedUrl = localStorage.getItem('quranglow_sb_url') || '';
    const savedKey = localStorage.getItem('quranglow_sb_key') || '';
    setSupabaseUrl(savedUrl);
    setSupabaseKey(savedKey);
    if (savedUrl && savedKey) {
      setSyncStatus('connected');
    }
  }, []);

  const handleSaveGoal = () => {
    db.updateDailyGoalConfig(goalType, goalValue);
    onRefreshGoal();
    alert("تم تعديل هدف الورد اليومي بنجاح.");
  };

  const handleSaveAudio = (reciterId: string) => {
    const updated = { ...audioPref, reciter: reciterId };
    setAudioPref(updated);
    db.saveAudioPreference(updated);
  };

  const handleSaveSupabase = () => {
    if (supabaseUrl && supabaseKey) {
      localStorage.setItem('quranglow_sb_url', supabaseUrl);
      localStorage.setItem('quranglow_sb_key', supabaseKey);
      setSyncStatus('connected');
      alert("تم ربط قاعدة البيانات السحابية بنجاح! جاري مزامنة بياناتك.");
    } else {
      localStorage.removeItem('quranglow_sb_url');
      localStorage.removeItem('quranglow_sb_key');
      setSyncStatus('disconnected');
      alert("تم فصل الاتصال السحابي. ستستمر البيانات محلياً.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-right">
      {/* settings Header */}
      <div className="flex items-center gap-2 mb-4">
        <SettingsIcon className="w-6 h-6 text-primary" />
        <h2 className="text-xl sm:text-2xl font-bold font-arabic text-gray-800 dark:text-gray-200">الإعدادات وتفضيلات التطبيق</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Goal Set Card */}
        <div className="glass-effect rounded-3xl p-6 border border-warm-border dark:border-dark-border shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 border-b border-warm-border dark:border-dark-border pb-3.5 flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-primary" />
              <span>تخصيص هدف الورد الذكي</span>
            </h3>

            {/* Selector */}
            <div className="space-y-2 text-xs font-semibold">
              <label className="block text-gray-400">طريقة احتساب الورد اليومي:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'time', label: 'بالوقت (دقائق)' },
                  { id: 'pages', label: 'بالصفحات (ورقة)' },
                  { id: 'finish', label: 'ختمة كاملة' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setGoalType(opt.id as any);
                      setGoalValue(opt.id === 'time' ? 10 : opt.id === 'pages' ? 4 : 30);
                    }}
                    className={`py-2 px-1 rounded-xl border text-center transition-all ${
                      goalType === opt.id
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'border-warm-border dark:border-dark-border text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Value */}
            <div className="space-y-2 text-xs font-semibold">
              <label className="block text-gray-400">
                {goalType === 'time' && 'مدة التلاوة اليومية بالدقائق:'}
                {goalType === 'pages' && 'عدد الصفحات اليومية المراد قراءتها:'}
                {goalType === 'finish' && 'مدة الختمة الكاملة (عدد الأيام):'}
              </label>
              
              <div className="flex gap-2 items-center">
                {goalType === 'finish' ? (
                  <select
                    value={goalValue}
                    onChange={(e) => setGoalValue(Number(e.target.value))}
                    className="w-full text-right p-2.5 rounded-xl border border-warm-border dark:border-dark-border bg-warm-card dark:bg-dark-card font-sans font-bold"
                  >
                    <option value={30}>ختمة في ٣٠ يوماً (جزء يومياً)</option>
                    <option value={60}>ختمة في ٦٠ يوماً (نصف جزء يومياً)</option>
                    <option value={90}>ختمة في ٩٠ يوماً (ربع جزء يومياً)</option>
                  </select>
                ) : (
                  <input
                    type="number"
                    min={1}
                    value={goalValue}
                    onChange={(e) => setGoalValue(Number(e.target.value))}
                    className="w-full text-right p-2.5 rounded-xl border border-warm-border dark:border-dark-border bg-warm-card dark:bg-dark-card font-sans font-bold"
                  />
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveGoal}
            className="w-full mt-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/10 hover:bg-primary-dark transition-all flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>حفظ تعديلات الورد</span>
          </button>
        </div>

        {/* Audio Defaults Card */}
        <div className="glass-effect rounded-3xl p-6 border border-warm-border dark:border-dark-border shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 border-b border-warm-border dark:border-dark-border pb-3.5 flex items-center gap-2">
              <Headphones className="w-4.5 h-4.5 text-primary" />
              <span>تفضيلات التلاوة والصوتيات</span>
            </h3>

            {/* Reciter Selector */}
            <div className="space-y-2 text-xs font-semibold">
              <label className="block text-gray-400">القارئ الافتراضي عند تشغيل السور والآيات:</label>
              <select
                value={audioPref.reciter}
                onChange={(e) => handleSaveAudio(e.target.value)}
                className="w-full text-right p-2.5 rounded-xl border border-warm-border dark:border-dark-border bg-warm-card dark:bg-dark-card font-arabic font-bold"
              >
                <option value="Alafasy_128kbps">الشيخ مشاري بن راشد العفاسي</option>
                <option value="Abdul_Basit_Murattal_192kbps">الشيخ عبد الباسط عبد الصمد (مرتل)</option>
                <option value="Minshawy_Murattal_128kbps">الشيخ محمد صديق المنشاوي</option>
                <option value="Ghamadi_2_40kbps">الشيخ سعد الغامدي</option>
                <option value="Husary_128kbps">الشيخ محمود خليل الحصري</option>
              </select>
            </div>

            {/* Info label */}
            <div className="bg-primary/5 rounded-2xl p-4 flex gap-2.5 text-xs text-gray-500 font-medium">
              <Shield className="w-4 h-4 shrink-0 text-accent" />
              <p className="leading-relaxed">
                يتم سحب التلاوات والملفات الصوتية مباشرة بشكل تلقائي ومرن من مكتبة EveryAyah المعتمدة لضمان دقة القراءة والآيات.
              </p>
            </div>
          </div>
        </div>

        {/* Supabase Sync Setup Card */}
        <div className="glass-effect rounded-3xl p-6 border border-warm-border dark:border-dark-border shadow-sm flex flex-col justify-between md:col-span-2">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-warm-border dark:border-dark-border pb-3">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <CloudLightning className="w-4.5 h-4.5 text-primary" />
                <span>الربط والنسخ السحابي الاحتياطي (اختياري)</span>
              </h3>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                syncStatus === 'connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {syncStatus === 'connected' ? 'مرتبط ومتصل سحابياً' : 'تخزين محلي أوفلاين'}
              </span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              تطبيق جلو القرآن مبني ليكون **مستقلاً ومحلياً** بالكامل للحفاظ على سرعة الأداء وسرية البيانات دون إنترنت. إذا كنت ترغب بمزامنة مراجعات الحفظ والخواطر والمفضلة عبر أجهزة متعددة، يرجى ملء بيانات Supabase الخاصة بك:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-400 mb-1">Supabase API Key (Anon):</label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full text-left p-2.5 rounded-xl border border-warm-border dark:border-dark-border bg-warm-card dark:bg-dark-card font-sans text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Supabase URL Project:</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://yourproject.supabase.co"
                  className="w-full text-left p-2.5 rounded-xl border border-warm-border dark:border-dark-border bg-warm-card dark:bg-dark-card font-sans text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveSupabase}
            className="w-full sm:w-auto self-end mt-5 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/10 hover:bg-primary-dark transition-all"
          >
            حفظ وتفعيل الربط السحابي
          </button>
        </div>
      </div>
    </div>
  );
};
