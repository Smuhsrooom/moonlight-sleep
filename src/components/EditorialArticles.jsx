import React from 'react';
import { ArrowUpRight, Clock, ChevronRight } from 'lucide-react';
import { sleepArticles } from '../data/articles';

export const EditorialArticles = ({ onSelectArticle }) => {
  const featuredArticle = sleepArticles[0];
  const sideArticles = sleepArticles.slice(1);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-xs font-semibold text-amber-300 block mb-1">
            수면 연구소 노트
          </span>
          <h2 className="text-2xl md:text-3xl text-white font-bold tracking-tight">
            더 깊은 잠을 위한 이야기
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-editorial-serif italic">
          Moonlight Sleep Journal
        </span>
      </div>

      {/* Asymmetric Editorial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Featured Lead Story (7 cols) */}
        {featuredArticle && (
          <div
            onClick={() => onSelectArticle(featuredArticle)}
            className="lg:col-span-7 celestial-panel celestial-panel-gold p-7 md:p-8 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-semibold text-amber-300">
                    {featuredArticle.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium ml-1">
                    · 전문 감수
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{featuredArticle.readTime}</span>
                </div>
              </div>

              <h3 className="text-xl md:text-2xl text-white font-bold mb-3 group-hover:text-amber-300 transition-colors leading-snug">
                {featuredArticle.title}
              </h3>

              <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-6">
                {featuredArticle.summary}
              </p>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-xs text-slate-400 font-editorial-serif italic">
                Editor's Pick
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectArticle(featuredArticle);
                }}
                className="text-amber-300 group-hover:text-white font-semibold text-xs md:text-sm flex items-center gap-1 transition-colors"
              >
                <span>노트 전문 읽기</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* Right: 3 Curated Short Notes (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {sideArticles.map((article) => {
            return (
              <div
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className="celestial-panel p-5 flex-1 flex flex-col justify-between group cursor-pointer hover:border-white/20 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-xs text-teal-300 font-medium">
                      {article.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      {article.readTime}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-2 group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h4>

                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-3">
                    {article.summary}
                  </p>
                </div>

                <div className="flex items-center justify-end text-xs text-slate-400 group-hover:text-amber-300 transition-colors font-medium">
                  <span className="mr-1">가이드 열기</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

