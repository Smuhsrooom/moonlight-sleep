import React from 'react';
import { Moon } from 'lucide-react';
import { policyDocs } from '../data/policies';

export const Footer = ({ onOpenPolicy }) => {
  return (
    <footer className="w-full py-14 border-t border-white/[0.07] bg-[#030712] mt-auto relative z-10">
      <div className="max-w-[1180px] mx-auto px-4 md:px-8 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Moon className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm">달빛수면 (Moonlight Sleep)</span>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                Circadian & Sleep Science Technology
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400 font-medium">
            <button
              onClick={() => onOpenPolicy('privacy', policyDocs.privacy.title, policyDocs.privacy.content)}
              className="hover:text-amber-400 transition-colors"
            >
              개인정보처리방침
            </button>
            <button
              onClick={() => onOpenPolicy('terms', policyDocs.terms.title, policyDocs.terms.content)}
              className="hover:text-amber-400 transition-colors"
            >
              이용약관
            </button>
            <button
              onClick={() => onOpenPolicy('disclaimer', policyDocs.disclaimer.title, policyDocs.disclaimer.content)}
              className="hover:text-amber-400 transition-colors"
            >
              의료면책조항
            </button>
            <button
              onClick={() => onOpenPolicy('about', policyDocs.about.title, policyDocs.about.content)}
              className="hover:text-amber-400 transition-colors"
            >
              서비스 소개
            </button>
          </div>

          <div className="text-slate-500 font-mono text-[11px] text-center md:text-right">
            © 2026 Moonlight Sleep. All rights reserved.
          </div>
        </div>

        <div className="text-[11px] text-slate-500 leading-relaxed border-t border-white/[0.04] pt-6 text-center">
          본 서비스는 수면 위생 및 이완을 돕기 위한 웰니스 정보 도구이며, 의학적 진단이나 전문 치료를 대신하지 않습니다. 만성 불면증이나 수면무호흡증이 의심되는 경우 전문의와 상담하시기 바랍니다.
        </div>
      </div>
    </footer>
  );
};
