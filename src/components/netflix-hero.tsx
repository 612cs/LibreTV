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

  // 根据评分换算 Netflix 标志性绿色匹配度
  const matchScore = current.rating
    ? Math.min(99, Math.max(88, Math.round(parseFloat(current.rating) * 10 + 7)))
    : 97;

  return (
    <div
      className="relative w-full h-[68vh] min-h-[520px] max-h-[800px] overflow-hidden select-none -mt-16"
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
          className="w-full h-full object-cover object-[center_22%] filter brightness-[0.82] contrast-[1.04] transition-all duration-1000 ease-out"
          priority
        />

        {/* 电影级多重暗角与光影渐变体系 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 to-transparent w-full md:w-3/4 lg:w-3/5 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#141414] via-[#141414]/90 to-transparent pointer-events-none" />
      </div>

      {/* Hero 前景大片信息区 */}
      <div className="relative z-10 max-w-[1440px] mx-auto h-full flex flex-col justify-end px-4 sm:px-10 pb-16 sm:pb-22">
        <div className="max-w-2xl space-y-3.5" key={current.title}>
          {/* 1. 正版 Netflix N SERIES / FILM 顶部品牌认证标 */}
          <div className="flex items-center gap-2">
            <span className="font-display text-[#e50914] text-2xl sm:text-3xl leading-none drop-shadow-[0_2px_8px_rgba(229,9,20,0.6)]">
              N
            </span>
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.32em] text-neutral-300 uppercase">
              {category === 'movie'
                ? 'FILM · 院线巨制'
                : category === 'anime'
                ? 'ANIME · 番剧精选'
                : 'SERIES · 剧集精选'}
            </span>
          </div>

          {/* 2. 影视大标题 */}
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] drop-shadow-[0_6px_24px_rgba(0,0,0,0.95)]"
            title={current.title}
          >
            {current.title}
          </h1>

          {/* 3. Netflix 经典元数据微标行（绿色匹配度 + TOP 10 红章 + 4K ULTRA HD 边框标） */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm pt-0.5">
            <span className="font-bold text-[#46d369] tracking-tight">
              {matchScore}% 匹配
            </span>

            {current.rating && (
              <span className="font-bold text-amber-400">
                ★ {current.rating}
              </span>
            )}

            <span className="netflix-spec-badge">4K ULTRA HD</span>
            <span className="netflix-spec-badge">HDR</span>
            <span className="netflix-spec-badge">Dolby Atmos</span>

            <span className="inline-flex items-center gap-1.5 ml-1">
              <span className="inline-flex flex-col items-center justify-center w-5 h-5 rounded-[2px] bg-[#e50914] text-white font-display text-[9px] leading-[0.85] shadow">
                <span>TOP</span>
                <span>10</span>
              </span>
              <span className="text-xs font-bold text-white drop-shadow">
                {category === 'anime'
                  ? '番剧榜'
                  : category === 'movie'
                  ? '电影榜'
                  : category === 'tv'
                  ? '剧集榜'
                  : '今日热播'} No.{currentIndex + 1}
              </span>
            </span>
          </div>

          {/* 4. 真实官方剧情简介 */}
          <p className="text-xs sm:text-[15px] text-neutral-200/95 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] max-w-xl font-normal">
            {current.overview}
          </p>

          {/* 5. 类型标签 */}
          {current.tags && current.tags.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-neutral-300 font-medium">
              {current.tags.map((t, idx) => (
                <span key={t} className="flex items-center gap-2">
                  {idx > 0 && <span className="w-1 h-1 rounded-full bg-[#e50914]" />}
                  <span>{t}</span>
                </span>
              ))}
            </div>
          )}

          {/* 6. Netflix 经典双操作按钮（点击直接进入播放页） */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onPlay(current.title)}
              className="group inline-flex items-center justify-center gap-2.5 px-6 py-2.5 sm:px-8 sm:py-3 rounded-[4px] bg-white text-black font-bold text-sm sm:text-base hover:bg-white/85 active:scale-95 transition-all shadow-xl cursor-pointer"
            >
              <svg className="w-6 h-6 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>立即播放</span>
            </button>

            <button
              onClick={() => onInfo(current.title)}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 sm:px-7 sm:py-3 rounded-[4px] bg-[#6d6d6e]/70 text-white font-semibold text-sm sm:text-base hover:bg-[#6d6d6e]/50 active:scale-95 transition-all backdrop-blur-md cursor-pointer"
            >
              <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2.2}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <span>剧集详情与选源</span>
            </button>
          </div>
        </div>
      </div>

      {/* 右下角横屏大片轮播分页条（正版 Netflix 顶栏右侧扁平指示条风格） */}
      {items.length > 1 && (
        <div className="absolute right-4 sm:right-10 bottom-14 z-20 flex items-center gap-1.5">
          {items.map((item, idx) => (
            <button
              key={item.title}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'h-[3px] transition-all duration-300 cursor-pointer',
                idx === currentIndex
                  ? 'w-7 bg-[#e50914]'
                  : 'w-3.5 bg-white/35 hover:bg-white/65'
              )}
              aria-label={`切换到第 ${idx + 1} 张大片：${item.title}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
