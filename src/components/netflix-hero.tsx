'use client';

import { useEffect, useState, useRef } from 'react';
import type { BackdropMeta } from '@/lib/backdrop-constants';
import { PRESET_HERO_BACKDROPS } from '@/lib/backdrop-constants';
import { useAppStore } from '@/lib/store';
import { SmartImage } from './smart-image';
import { cn } from '@/lib/utils';

interface NetflixHeroProps {
  category?: 'all' | 'movie' | 'tv' | 'anime';
  onPlay: (title: string) => void;
  onInfo: (title: string) => void;
}

export function NetflixHero({
  category = 'all',
  onPlay,
  onInfo,
}: NetflixHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const imageProxyMode = useAppStore((s) => s.imageProxyMode);
  const customImageProxy = useAppStore((s) => s.customImageProxy);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 每次分类变化重置索引
  useEffect(() => {
    setCurrentIndex(0);
  }, [category]);

  const items: BackdropMeta[] = PRESET_HERO_BACKDROPS[category] || PRESET_HERO_BACKDROPS.all;
  const current = items[currentIndex] || items[0];

  // 每 8 秒平滑轮播下一部大片
  useEffect(() => {
    if (items.length <= 1 || isPaused) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items.length, isPaused]);

  if (!current) return null;

  return (
    <div
      className="relative w-full h-[62vh] min-h-[500px] max-h-[760px] overflow-hidden select-none -mt-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="热门焦点大片"
    >
      {/* 4K/1080P 超清横屏原生壁纸层 */}
      <div className="absolute inset-0 z-0 bg-[#141414]">
        <SmartImage
          key={current.backdropUrl}
          url={current.backdropUrl}
          mode={imageProxyMode}
          customProxy={customImageProxy}
          alt={current.title}
          className="w-full h-full object-cover object-[center_25%] filter brightness-[0.78] transition-all duration-1000 ease-out"
          loading="eager"
        />

        {/* 电影级多重阴影渐变体系 */}
        {/* 1. 左侧横向渐变遮罩：确保左侧白色大标题和剧情文字具有顶尖对比度 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/75 to-transparent w-full md:w-4/5 lg:w-3/5 pointer-events-none" />
        
        {/* 2. 顶部吸顶微暗过渡：衬托 Header 半透明毛玻璃 */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none" />
        
        {/* 3. 底部与内容区完全融合的大暗影渐变 */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#141414] via-[#141414]/90 to-transparent pointer-events-none" />
      </div>

      {/* Hero 前景大片信息区 */}
      <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-end px-4 sm:px-8 pb-14 sm:pb-20">
        <div className="max-w-2xl space-y-3 sm:space-y-4" key={current.title}>
          {/* Netflix 烈焰红角标与排位指示 */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-[#e50914] text-white font-black text-xs tracking-wider uppercase shadow-lg shadow-red-900/40">
              TOP 10
            </span>
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-300 drop-shadow">
              {category === 'anime'
                ? '全网动漫热搜榜'
                : category === 'movie'
                ? '全网电影热播榜'
                : category === 'tv'
                ? '全网剧集热播榜'
                : '今日全网热搜'} 第 {currentIndex + 1} 位
            </span>
          </div>

          {/* 影视大标题 */}
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
            title={current.title}
          >
            {current.title}
          </h1>

          {/* 影视元数据徽章 */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            {current.rating && (
              <span className="flex items-center gap-1 font-bold text-amber-400 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded border border-amber-500/30 shadow-md">
                ★ {current.rating} 分
              </span>
            )}
            <span className="px-2 py-0.5 rounded bg-white/15 backdrop-blur-md text-white font-medium border border-white/20 text-xs">
              4K 原生壁纸
            </span>
            <span className="px-2 py-0.5 rounded bg-white/15 backdrop-blur-md text-white font-medium border border-white/20 text-xs">
              杜比全景声
            </span>
            {current.tags?.map((t) => (
              <span
                key={t}
                className="hidden sm:inline-block px-2 py-0.5 rounded bg-black/40 text-neutral-300 border border-white/10 text-xs"
              >
                {t}
              </span>
            ))}
          </div>

          {/* 真实官方剧情简介 */}
          <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow max-w-xl text-justify">
            {current.overview}
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
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-7 sm:py-3 rounded-md bg-neutral-600/70 text-white font-semibold text-sm sm:text-base hover:bg-neutral-600/90 active:scale-95 transition-all backdrop-blur-md border border-white/10 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <span>更多信息</span>
            </button>
          </div>
        </div>
      </div>

      {/* 右下角横屏大片轮播指示器 */}
      {items.length > 1 && (
        <div className="absolute right-4 sm:right-8 bottom-12 z-20 flex items-center gap-1.5 sm:gap-2">
          {items.map((item, idx) => (
            <button
              key={item.title}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'h-1 rounded-full transition-all duration-300 cursor-pointer',
                idx === currentIndex
                  ? 'w-8 bg-[#e50914] shadow-md shadow-red-600/50'
                  : 'w-3 bg-white/30 hover:bg-white/60'
              )}
              aria-label={`切换到第 ${idx + 1} 张大片：${item.title}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
