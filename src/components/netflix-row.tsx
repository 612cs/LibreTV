'use client';

import { useRef, useState } from 'react';
import type { DoubanItem } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { SmartImage } from './smart-image';
import { cn } from '@/lib/utils';

interface NetflixRowProps {
  title: string;
  subtitle?: string;
  badge?: string;
  items: DoubanItem[];
  onPick: (title: string) => void;
  showRankingNumber?: boolean;
}

export function NetflixRow({
  title,
  subtitle,
  badge,
  items,
  onPick,
  showRankingNumber = false,
}: NetflixRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const imageProxyMode = useAppStore((s) => s.imageProxyMode);
  const customImageProxy = useAppStore((s) => s.customImageProxy);

  const scroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    const { clientWidth } = rowRef.current;
    const offset = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
    rowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative group/row mb-8 sm:mb-11 px-4 sm:px-10 select-none max-w-[1440px] mx-auto">
      {/* 栏目标题与探索提示 */}
      <div className="flex items-baseline justify-between mb-2.5">
        <div className="flex items-center gap-2.5 group/title cursor-pointer">
          <h2 className="text-base sm:text-xl font-bold text-[#e5e5e5] group-hover/title:text-white tracking-tight flex items-center gap-2 transition-colors">
            {badge && (
              <span className="px-1.5 py-0.5 rounded-[2px] bg-[#e50914] text-white font-display text-xs tracking-wider uppercase shadow">
                {badge}
              </span>
            )}
            <span>{title}</span>
          </h2>
          {subtitle && (
            <span className="hidden sm:inline text-xs text-neutral-400 font-medium">
              {subtitle}
            </span>
          )}
          <span className="text-[11px] font-semibold text-[#54b9c5] opacity-0 -translate-x-2 group-hover/row:opacity-100 group-hover/row:translate-x-0 transition-all duration-300 hidden md:inline-flex items-center gap-0.5">
            <span>点击海报直达播放</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>

      {/* 滑动卡片容器 */}
      <div className="relative">
        {/* 左滑动箭头 */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-3 bottom-9 z-30 w-10 sm:w-12 bg-black/65 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer rounded-r"
            aria-label="向左滚动"
          >
            <svg className="w-6 h-6 transform transition-transform hover:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* 右滑动箭头 */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-3 bottom-9 z-30 w-10 sm:w-12 bg-black/65 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer rounded-l"
            aria-label="向右滚动"
          >
            <svg className="w-6 h-6 transform transition-transform hover:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* 横向卡片列表 */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-3 px-1 scroll-smooth overscroll-x-contain"
        >
          {items.map((item, index) => {
            const matchPct = item.rating
              ? Math.min(99, Math.max(85, Math.round(parseFloat(item.rating) * 10 + 7)))
              : 95;

            return (
              <div
                key={item.id || `${item.title}-${index}`}
                className={cn(
                  'group/card relative flex-shrink-0 cursor-pointer netflix-card',
                  showRankingNumber ? 'w-[170px] sm:w-[215px]' : 'w-[138px] sm:w-[172px]'
                )}
                onClick={() => onPick(item.title)}
              >
                {/* Netflix 标志性 Bebas Neue 空心大数字排位 */}
                {showRankingNumber && (
                  <span
                    className="font-display absolute -left-1 -bottom-3 z-10 text-[92px] sm:text-[118px] leading-none text-[#141414] select-none pointer-events-none"
                    style={{
                      WebkitTextStroke: '3px #595959',
                      textShadow: '0 8px 20px rgba(0,0,0,0.95)',
                    }}
                  >
                    {index + 1}
                  </span>
                )}

                {/* 卡片主图 */}
                <div
                  className={cn(
                    'relative aspect-[2/3] rounded-[4px] overflow-hidden bg-[#1f1f1f] ring-1 ring-white/[0.08] shadow-xl',
                    showRankingNumber && 'ml-7 sm:ml-9'
                  )}
                >
                  <SmartImage
                    url={item.cover}
                    mode={imageProxyMode}
                    customProxy={customImageProxy}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                    loading={index < 4 ? 'eager' : 'lazy'}
                  />

                  {/* 左上角 Netflix N 品牌微标 */}
                  <span className="font-display absolute top-2 left-2 z-10 text-[#e50914] text-lg leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    N
                  </span>

                  {/* 右上角豆瓣高分角标 */}
                  {item.rating && (
                    <span className="absolute top-1.5 right-1.5 z-10 text-[10px] sm:text-[11px] font-bold text-amber-300 bg-black/75 backdrop-blur-sm px-1.5 py-0.5 rounded-[3px] border border-amber-400/20 shadow">
                      ★ {item.rating}
                    </span>
                  )}

                  {/* 底部常驻轻微暗角 */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                  {/* 悬停 Netflix 迷你控制坞（Hover Reveal） */}
                  <div className="absolute inset-0 flex flex-col justify-end p-2.5 opacity-0 group-hover/card:opacity-100 transition-all duration-200 bg-gradient-to-t from-black/95 via-black/45 to-black/10">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform transition-transform group-hover/card:scale-105">
                        <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-bold text-white drop-shadow">
                        立即播放
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="font-bold text-[#46d369]">{matchPct}% 匹配</span>
                      <span className="netflix-spec-badge !text-[9px] !px-1 !py-0">HD</span>
                    </div>
                  </div>
                </div>

                {/* 卡片片名 */}
                <div className={cn('pt-2 px-0.5', showRankingNumber && 'ml-7 sm:ml-9')}>
                  <h3
                    className="text-xs sm:text-[13px] font-semibold text-neutral-300 truncate group-hover/card:text-white transition-colors tracking-tight"
                    title={item.title}
                  >
                    {item.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
