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
    // 每次滑动视口宽度的 75%
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
    <div className="relative group/row mb-8 sm:mb-10 px-4 sm:px-8 select-none">
      {/* 栏目标题与信息 */}
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
            {badge && (
              <span className="px-1.5 py-0.5 rounded bg-[#e50914] text-white text-[10px] font-black tracking-wider uppercase">
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
        </div>
      </div>

      {/* 滑动卡片容器包裹 */}
      <div className="relative">
        {/* 左滑动箭头 */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer rounded-r-md"
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
            className="absolute right-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer rounded-l-md"
            aria-label="向右滚动"
          >
            <svg className="w-6 h-6 transform transition-transform hover:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* 实际横向卡片列表 */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-2.5 sm:gap-3.5 overflow-x-auto no-scrollbar py-3 px-1 scroll-smooth overscroll-x-contain"
        >
          {items.map((item, index) => (
            <div
              key={item.id || `${item.title}-${index}`}
              className={cn(
                'relative flex-shrink-0 cursor-pointer netflix-card',
                // 普通卡片宽 140px~180px，长宽比 2:3
                showRankingNumber ? 'w-[160px] sm:w-[200px]' : 'w-[130px] sm:w-[165px]'
              )}
              onClick={() => onPick(item.title)}
            >
              {/* 如果开启 TOP 10 大数字显示（Netflix 经典空心数字） */}
              {showRankingNumber && (
                <span
                  className="absolute -left-2 -bottom-2 z-10 text-6xl sm:text-7xl font-black text-black select-none pointer-events-none"
                  style={{
                    WebkitTextStroke: '2px #555',
                    textShadow: '0 4px 10px rgba(0,0,0,0.9)',
                  }}
                >
                  {index + 1}
                </span>
              )}

              {/* 卡片主图 */}
              <div
                className={cn(
                  'relative aspect-[2/3] rounded-md overflow-hidden bg-[#222] border border-white/10 shadow-lg',
                  showRankingNumber && 'ml-4 sm:ml-6'
                )}
              >
                <SmartImage
                  url={item.cover}
                  mode={imageProxyMode}
                  customProxy={customImageProxy}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading={index < 4 ? 'eager' : 'lazy'}
                />

                {/* 评分角标 */}
                {item.rating && (
                  <span className="absolute top-1.5 right-1.5 z-10 text-[10px] sm:text-xs font-bold text-amber-300 bg-black/75 backdrop-blur-sm px-1.5 py-0.5 rounded border border-amber-400/20 shadow">
                    ★ {item.rating}
                  </span>
                )}

                {/* 底部微弱渐变阴影 */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                {/* 悬停微型播放按钮 */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transform transition-transform hover:scale-110">
                    <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 卡片片名 */}
              <div className={cn('pt-2 px-1', showRankingNumber && 'ml-4 sm:ml-6')}>
                <h3
                  className="text-xs sm:text-sm font-medium text-neutral-200 truncate group-hover:text-white transition-colors"
                  title={item.title}
                >
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
