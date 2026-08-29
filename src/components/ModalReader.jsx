import React, { useEffect, useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ModalReader = ({ isOpen, onClose, category, title, content }) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - clientHeight > 0) {
      setScrollProgress((scrollTop / (scrollHeight - clientHeight)) * 100);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="celestial-panel max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative"
        >
          {/* Top Reading Progress Bar */}
          <div
            className="absolute top-0 left-0 h-0.5 bg-amber-400 transition-all duration-150 z-20"
            style={{ width: `${scrollProgress}%` }}
          />

          {/* Modal Header */}
          <div className="p-6 md:p-7 border-b border-white/[0.08] flex justify-between items-start bg-[#060B18]/90">
            <div className="space-y-1.5 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-300 font-semibold tracking-tight">
                  {category || '수면 의학 가이드'}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-teal-300 bg-teal-400/10 px-2 py-0.5 rounded-full border border-teal-400/20">
                  <ShieldCheck className="w-3 h-3" />
                  <span>전문의 감수 완료</span>
                </span>
              </div>
              <h3 className="text-lg md:text-xl text-white font-bold tracking-tight leading-snug">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.08] transition-colors flex-shrink-0"
              title="닫기 (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div
            onScroll={handleScroll}
            className="p-6 md:p-8 overflow-y-auto text-sm md:text-base leading-relaxed space-y-4 text-slate-200 article-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Modal Footer */}
          <div className="p-4 px-6 border-t border-white/[0.08] flex justify-between items-center bg-[#060B18]/90">
            <span className="text-xs text-slate-400 font-editorial-serif italic">
              Moonlight Sleep Clinical Archive
            </span>
            <button
              onClick={onClose}
              className="bg-white/[0.08] hover:bg-white/[0.15] text-white px-5 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              닫기
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
