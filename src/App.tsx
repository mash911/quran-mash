import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Reader } from './components/Reader';
import { ListeningMode } from './components/ListeningMode';
import { MemorizeMode } from './components/MemorizeMode';
import { Journal } from './components/Journal';
import { Search } from './components/Search';
import { Settings } from './components/Settings';
import { db } from './services/db';
import type { DailyGoal, ReadingProgress } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedSurahId, setSelectedSurahId] = useState<number>(1);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState<number>(1);
  const [audioAutoPlay, setAudioAutoPlay] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [goal, setGoal] = useState<DailyGoal>(db.getDailyGoal());
  const [progress] = useState<ReadingProgress | null>(db.getProgress());





  // Sync dark mode configuration on body and html elements
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    }
  }, [darkMode]);


  // Handle back/forward hash routing to make PWA feel native
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (['home', 'quran', 'listen', 'memorize', 'journal', 'search', 'settings'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial sync
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash route when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = `#/${tab}`;
  };

  const handleRefreshGoal = () => {
    setGoal(db.getDailyGoal());
  };


  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      darkMode={darkMode}
      toggleDarkMode={() => setDarkMode(!darkMode)}
      streak={goal.streak}
    >
      <div className="animate-fadeIn">
        {activeTab === 'home' && (
          <Dashboard
            setActiveTab={handleTabChange}
            setSelectedSurahId={setSelectedSurahId}
            setSelectedVerseNumber={setSelectedVerseNumber}
            setAudioAutoPlay={setAudioAutoPlay}
            goal={goal}
            progress={progress}
            onRefreshGoal={handleRefreshGoal}
          />
        )}
        {activeTab === 'quran' && (
          <Reader
            selectedSurahId={selectedSurahId}
            setSelectedSurahId={setSelectedSurahId}
            selectedVerseNumber={selectedVerseNumber}
            setSelectedVerseNumber={setSelectedVerseNumber}
            setActiveTab={handleTabChange}
            setAudioAutoPlay={setAudioAutoPlay}
            onRefreshBookmarks={() => {}}
          />
        )}
        {activeTab === 'listen' && (
          <ListeningMode
            selectedSurahId={selectedSurahId}
            setSelectedSurahId={setSelectedSurahId}
            selectedVerseNumber={selectedVerseNumber}
            setSelectedVerseNumber={setSelectedVerseNumber}
            audioAutoPlay={audioAutoPlay}
            setAudioAutoPlay={setAudioAutoPlay}
          />
        )}
        {activeTab === 'memorize' && (
          <MemorizeMode
            selectedSurahId={selectedSurahId}
            setSelectedSurahId={setSelectedSurahId}
          />
        )}
        {activeTab === 'journal' && <Journal />}
        {activeTab === 'search' && (
          <Search
            setSelectedSurahId={setSelectedSurahId}
            setSelectedVerseNumber={setSelectedVerseNumber}
            setActiveTab={handleTabChange}
          />
        )}
        {activeTab === 'settings' && (
          <Settings
            onRefreshGoal={handleRefreshGoal}
            goal={goal}
          />
        )}
      </div>
    </Layout>
  );
}

export default App;
