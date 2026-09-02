import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sliders, Wind, BookOpen } from 'lucide-react';
import { StarfieldCanvas } from './components/StarfieldCanvas';
import { Header } from './components/Header';
import { HeroMoonHub } from './components/HeroMoonHub';
import { SleepCalculator } from './components/SleepCalculator';
import { SoundscapeMixer } from './components/SoundscapeMixer';
import { BreathingSanctuary } from './components/BreathingSanctuary';
import { EditorialArticles } from './components/EditorialArticles';
import { AdSenseBanner } from './components/AdSenseBanner';
import { Footer } from './components/Footer';
import { ModalReader } from './components/ModalReader';
import { audioEngine } from './services/audioEngine';
import { sleepArticles } from './data/articles';
import { policyDocs } from './data/policies';

const INSTRUMENT_TABS = [
  { id: 'calculator', label: '수면 시계', icon: Moon },
  { id: 'sounds', label: '사운드 믹서', icon: Sliders },
  { id: 'breathing', label: '4-7-8 호흡', icon: Wind },
  { id: 'articles', label: '수면 노트', icon: BookOpen }
];

function getInitialStateFromUrl() {
  if (typeof window === 'undefined') return { tab: 'calculator', modal: null };
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab');
  const articleParam = params.get('article');
  const policyParam = params.get('policy');

  let tab = 'calculator';
  const validTabs = ['calculator', 'sounds', 'breathing', 'articles'];
  if (tabParam && validTabs.includes(tabParam)) {
    tab = tabParam;
  }

  let modal = null;
  if (articleParam) {
    tab = 'articles';
    const foundArticle = sleepArticles.find((a) => a.id === articleParam);
    if (foundArticle) {
      modal = {
        category: foundArticle.category,
        title: foundArticle.title,
        content: foundArticle.content
      };
    }
  } else if (policyParam) {
    const policy = policyDocs[policyParam];
    if (policy) {
      modal = {
        category: '정책 및 법적 고지',
        title: policy.title,
        content: policy.content
      };
    }
  }

  return { tab, modal };
}

export function App() {
  const [initial] = useState(getInitialStateFromUrl);
  const [activeTab, setActiveTab] = useState(initial.tab);
  const [activeSoundCount, setActiveSoundCount] = useState(0);
  const [timerText, setTimerText] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(Boolean(initial.modal));
  const [modalCategory, setModalCategory] = useState(initial.modal?.category || '');
  const [modalTitle, setModalTitle] = useState(initial.modal?.title || '');
  const [modalContent, setModalContent] = useState(initial.modal?.content || '');

  const handleOpenArticle = (article) => {
    setModalCategory(article.category);
    setModalTitle(article.title);
    setModalContent(article.content);
    setModalOpen(true);
  };

  const handleOpenPolicy = (key, title, content) => {
    setModalCategory('정책 및 법적 고지');
    setModalTitle(title);
    setModalContent(content);
    setModalOpen(true);
  };

  // Browser Navigation Listener (PopState)
  useEffect(() => {
    const handlePopState = () => {
      const state = getInitialStateFromUrl();
      setActiveTab(state.tab);
      if (state.modal) {
        setModalCategory(state.modal.category);
        setModalTitle(state.modal.title);
        setModalContent(state.modal.content);
        setModalOpen(true);
      } else {
        setModalOpen(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleStopAll = () => {
    audioEngine.stopAll();
    setActiveSoundCount(0);
    setTimerText(null);
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#030712] text-[#E2E8F0] selection:bg-[#F5C542]/20 selection:text-white">
      {/* 3D Starfield & Parallax Canvas */}
      <StarfieldCanvas />

      {/* Fixed Compact Header */}
      <Header
        onSelectTab={(tabId) => setActiveTab(tabId)}
        activeSoundCount={activeSoundCount}
        timerText={timerText}
        onStopAll={handleStopAll}
      />

      {/* Main Single-Instrument Stage Hub */}
      <main className="flex-grow flex flex-col items-center pt-24 pb-20 w-full max-w-[1180px] mx-auto px-4 md:px-8 space-y-8 relative z-10">
        {/* Luminous Ambient Moon Banner */}
        <HeroMoonHub />

        {/* Floating Tactile Instrument Tab Dock */}
        <div className="flex items-center justify-center w-full sticky top-20 z-40 py-1">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.025] backdrop-blur-md border border-white/[0.14] border-t-white/[0.28] shadow-[0_20px_45px_-10px_rgba(0,0,0,0.45),inset_0_1px_1px_0_rgba(255,255,255,0.22)]">
            {INSTRUMENT_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 sm:px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                    isActive ? 'text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeInstrumentTabIndicator"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 shadow-md shadow-amber-400/20"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Single Focused Instrument Stage */}
        <div className="w-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full"
            >
              {activeTab === 'calculator' && (
                <SleepCalculator />
              )}

              {activeTab === 'sounds' && (
                <SoundscapeMixer
                  onSoundStateChange={(count) => setActiveSoundCount(count)}
                  onTimerChange={(str) => setTimerText(str)}
                />
              )}

              {activeTab === 'breathing' && (
                <BreathingSanctuary />
              )}

              {activeTab === 'articles' && (
                <EditorialArticles onSelectArticle={handleOpenArticle} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Restrained Wellness Sponsorship Dock */}
        <div className="w-full pt-4">
          <AdSenseBanner type="leaderboard" label="편안한 밤을 위한 스폰서" />
        </div>
      </main>

      {/* Footer */}
      <Footer onOpenPolicy={handleOpenPolicy} />

      {/* Universal Modal Reader */}
      <ModalReader
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={modalCategory}
        title={modalTitle}
        content={modalContent}
      />
    </div>
  );
}

export default App;

