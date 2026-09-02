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

const CANONICAL_DOMAIN = 'https://www.moonlightsleep.xyz';

const TAB_SEO_META = {
  calculator: {
    title: '달빛수면 (Moonlight Sleep) - 90분 수면 주기 계산기 & 취침 알람',
    description: '실시간 달의 위상과 90분 울트라디안 수면 주기 계산기로 가장 개운한 기상·취침 시각을 찾아드립니다.',
    path: '/calculator'
  },
  sounds: {
    title: '사운드 믹서 (Web Audio 실시간 합성) - 달빛수면',
    description: '창밖 빗소리, 잔잔한 파도, 숲속 밤바람, 모닥불, 브라운/핑크 노이즈 및 432Hz 델타파를 실시간으로 믹싱하세요.',
    path: '/sounds'
  },
  breathing: {
    title: '4-7-8 유기적 호흡 가이드 & 싱잉볼 - 달빛수면',
    description: '앤드루 와일 박사의 4-7-8 자율신경 이완 호흡법과 432Hz 티베트 싱잉볼 배음으로 1분 안에 심신을 안정시키세요.',
    path: '/breathing'
  },
  articles: {
    title: '수면 과학 전문 노트 & 라이브러리 - 달빛수면',
    description: '하버드·스탠퍼드 수면 의학 논문 기반 90분 수면 주기, 바이노럴 비트, 수면 위생 10계명 칼럼을 확인하세요.',
    path: '/articles'
  }
};

function updateSeoMeta({ title, description, path }) {
  if (typeof document === 'undefined') return;
  const canonicalUrl = `${CANONICAL_DOMAIN}${path}`;

  document.title = title;

  // Meta Description
  let descTag = document.querySelector('meta[name="description"]');
  if (!descTag) {
    descTag = document.createElement('meta');
    descTag.setAttribute('name', 'description');
    document.head.appendChild(descTag);
  }
  descTag.setAttribute('content', description);

  // Link Canonical
  let canonicalTag = document.querySelector('link[rel="canonical"]');
  if (!canonicalTag) {
    canonicalTag = document.createElement('link');
    canonicalTag.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalTag);
  }
  canonicalTag.setAttribute('href', canonicalUrl);

  // Open Graph Dynamic Tags
  const ogTags = [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: canonicalUrl }
  ];
  ogTags.forEach(({ property, content }) => {
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', property);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  });
}

function parseCurrentUrl() {
  if (typeof window === 'undefined') {
    return { tab: 'calculator', modal: null, seo: TAB_SEO_META.calculator };
  }

  const pathname = window.location.pathname.replace(/\/$/, '') || '/';
  const params = new URLSearchParams(window.location.search);

  // 1. Articles Clean Path: /articles/:id (or fallback ?article=:id)
  const articleMatch = pathname.match(/^\/articles\/([a-zA-Z0-9_-]+)$/);
  const articleQuery = params.get('article');
  const targetArticleId = (articleMatch && articleMatch[1]) || articleQuery;

  if (targetArticleId) {
    const foundArticle = sleepArticles.find((a) => a.id === targetArticleId);
    if (foundArticle) {
      return {
        tab: 'articles',
        modal: {
          category: foundArticle.category,
          title: foundArticle.title,
          content: foundArticle.content
        },
        seo: {
          title: `${foundArticle.title} - 달빛수면`,
          description: foundArticle.summary,
          path: `/articles/${foundArticle.id}`
        }
      };
    }
  }

  // 2. Policies Clean Path: /privacy, /terms, /disclaimer, /about, /contact (or fallback ?policy=:key)
  const policyKeyMatch = pathname.replace(/^\//, '');
  const policyQuery = params.get('policy');
  const targetPolicyKey = policyDocs[policyKeyMatch] ? policyKeyMatch : (policyDocs[policyQuery] ? policyQuery : null);

  if (targetPolicyKey) {
    const doc = policyDocs[targetPolicyKey];
    return {
      tab: 'calculator',
      modal: {
        category: '정책 및 법적 고지',
        title: doc.title,
        content: doc.content
      },
      seo: {
        title: `${doc.title} - 달빛수면`,
        description: '달빛수면 프로젝트 소개, 이용약관, 개인정보처리방침 및 의학 면책조항 안내.',
        path: `/${targetPolicyKey}`
      }
    };
  }

  // 3. Tab Clean Paths: /calculator, /sounds, /breathing, /articles (or fallback ?tab=:id)
  let targetTab = 'calculator';
  const cleanTab = pathname.replace(/^\//, '');
  const queryTab = params.get('tab');

  if (TAB_SEO_META[cleanTab]) {
    targetTab = cleanTab;
  } else if (TAB_SEO_META[queryTab]) {
    targetTab = queryTab;
  }

  return {
    tab: targetTab,
    modal: null,
    seo: TAB_SEO_META[targetTab]
  };
}

const INSTRUMENT_TABS = [
  { id: 'calculator', label: '수면 시계', icon: Moon },
  { id: 'sounds', label: '사운드 믹서', icon: Sliders },
  { id: 'breathing', label: '4-7-8 호흡', icon: Wind },
  { id: 'articles', label: '수면 노트', icon: BookOpen }
];

export function App() {
  const [initial] = useState(parseCurrentUrl);
  const [activeTab, setActiveTab] = useState(initial.tab);
  const [activeSoundCount, setActiveSoundCount] = useState(0);
  const [timerText, setTimerText] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(Boolean(initial.modal));
  const [modalCategory, setModalCategory] = useState(initial.modal?.category || '');
  const [modalTitle, setModalTitle] = useState(initial.modal?.title || '');
  const [modalContent, setModalContent] = useState(initial.modal?.content || '');

  // Dynamic SEO Synchronization
  useEffect(() => {
    updateSeoMeta(initial.seo);

    const handlePopState = () => {
      const state = parseCurrentUrl();
      setActiveTab(state.tab);
      if (state.modal) {
        setModalCategory(state.modal.category);
        setModalTitle(state.modal.title);
        setModalContent(state.modal.content);
        setModalOpen(true);
      } else {
        setModalOpen(false);
      }
      updateSeoMeta(state.seo);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [initial.seo]);

  const handleSelectTab = (tabId, updateHistory = true) => {
    setActiveTab(tabId);
    setModalOpen(false);
    const seo = TAB_SEO_META[tabId] || TAB_SEO_META.calculator;
    updateSeoMeta(seo);
    if (updateHistory && typeof window !== 'undefined') {
      window.history.pushState(null, '', seo.path);
    }
  };

  const handleOpenArticle = (article, updateHistory = true) => {
    setModalCategory(article.category);
    setModalTitle(article.title);
    setModalContent(article.content);
    setModalOpen(true);
    const seo = {
      title: `${article.title} - 달빛수면`,
      description: article.summary,
      path: `/articles/${article.id}`
    };
    updateSeoMeta(seo);
    if (updateHistory && typeof window !== 'undefined') {
      window.history.pushState(null, '', seo.path);
    }
  };

  const handleOpenPolicy = (key, title, content, updateHistory = true) => {
    setModalCategory('정책 및 법적 고지');
    setModalTitle(title);
    setModalContent(content);
    setModalOpen(true);
    const seo = {
      title: `${title} - 달빛수면`,
      description: '달빛수면 프로젝트 소개, 이용약관, 개인정보처리방침 및 의학 면책조항 안내.',
      path: `/${key}`
    };
    updateSeoMeta(seo);
    if (updateHistory && typeof window !== 'undefined') {
      window.history.pushState(null, '', seo.path);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    const seo = TAB_SEO_META[activeTab] || TAB_SEO_META.calculator;
    updateSeoMeta(seo);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', seo.path);
    }
  };

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
        onSelectTab={(tabId) => handleSelectTab(tabId)}
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
                  onClick={() => handleSelectTab(tab.id)}
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
        onClose={handleCloseModal}
        category={modalCategory}
        title={modalTitle}
        content={modalContent}
      />
    </div>
  );
}

export default App;
