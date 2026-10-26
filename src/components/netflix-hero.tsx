'use client';

import { useEffect, useState, useRef } from 'react';
import type { DoubanItem } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { SmartImage } from './smart-image';
import { cn } from '@/lib/utils';

interface NetflixHeroProps {
  items: DoubanItem[];
  onPlay: (title: string) => void;
  onInfo: (title: string) => void;
}

export function NetflixHero({ items, onPlay, onInfo }: NetflixHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const imageProxyMode = useAppStore((s) => s.imageProxyMode);
  const customImageProxy = useAppStore((s) => s.customImageProxy);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const heroItems = items.slice(0, 6);
  const current = heroItems[currentIndex] || heroItems[0];

  // 每 7 秒自动轮播下一部
  useEffect(() => {
    if (heroItems.length <= 1 || isPaused) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroItems.length);
    }, 7000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [heroItems.length, isPaused]);

  if (!current) return null;

  return (
    <div
      className="relative w-full h-[65vh] min-h-[480px] max-h-[720px] overflow-hidden select-none -mt-14"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="热门焦点大片"
    >
      {/* 巨幕背景海报层 */}
      <div className="absolute inset-0 z-0">
        <SmartImage
          key={current.id || current.title}
          url={current.cover}
          mode={imageProxyMode}
          customProxy={customImageProxy}
          alt={current.title}
          className="w-full h-full object-cover object-[center_20%] scale-105 filter brightness-[0.75] transition-all duration-1000 ease-out"
          loading="eager"
        />
        {/* 左侧向右的阴影遮罩：保护左侧标题与按钮文字可读性 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/95 via-[#141414]/60 to-transparent w-full lg:w-3/4 pointer-events-none" />
        {/* 顶部微暗遮罩：衬托半透明导航栏 */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />
        {/* 底部融合渐变：与下方内容区无缝连接 */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent pointer-events-none" />
      </div>

      {/* Hero 内容与行动区 */}
      <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-end px-4 sm:px-8 pb-14 sm:pb-20">
        <div className="max-w-2xl space-y-3 sm:space-y-4 animate-fade-in" key={current.title}>
          {/* 红色 Netflix 风格角标 */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-[#e50914] text-white font-black text-[11px] tracking-wider uppercase shadow-md">
              TOP 10
            </span>
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-300 drop-shadow">
              今日热度榜第 {currentIndex + 1} 位
            </span>
          </div>

          {/* 影视大标题 */}
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] line-clamp-2"
            title={current.title}
          >
            {current.title}
          </h1>

          {/* 影视元数据标签 */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm">
            {current.rating && (
              <span className="flex items-center gap-1 font-bold text-amber-400 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded border border-amber-500/30">
                ★ {current.rating} 分
              </span>
            )}
            <span className="px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-sm text-white font-medium border border-white/20 text-[11px]">
              1080P 超清
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-sm text-white font-medium border border-white/20 text-[11px]">
              杜比全景声
            </span>
            <span className="text-neutral-400 text-xs hidden sm:inline">多源秒播 · 极速解码</span>
          </div>

          {/* 推荐文案提示 */}
          <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow max-w-xl">
            全网高分好评作品，多条官方与高清专线同步收录。点击立即播放将自动检索全网最佳画质线路，为你开启影院级沉浸视听。
          </p>

          {/* Netflix 经典双操作按钮 */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onPlay(current.title)}
              className="group inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3 rounded-md bg-white text-black font-bold text-sm sm:text-base hover:bg-neutral-200 active:scale-95 transition-all shadow-xl hover:shadow-white/20 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>立即播放</span>
            </button>

            <button
              onClick={() => onInfo(current.title)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-7 sm:py-3 rounded-md bg-white/25 hover:bg-white/35 active:scale-95 text-white font-semibold text-sm sm:text-base backdrop-blur-md transition-all border border-white/20 cursor-pointer"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>更多信息</span>
            </button>
          </div>
        </div>

        {/* 右下角大片轮播指示器 */}
        {heroItems.length > 1 && (
          <div className="absolute right-4 sm:right-8 bottom-12 flex items-center gap-2 z-20">
            {heroItems.map((item, idx) => (
              <button
                key={item.id || idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  'h-1.5 transition-all duration-300 rounded-full cursor-pointer',
                  idx === currentIndex ? 'w-8 bg-[#e50914]' : 'w-2 bg-white/40 hover:bg-white/80'
                )}
                aria-label={`切换到影片 ${item.title}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
