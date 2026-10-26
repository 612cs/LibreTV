'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/client-api';
import { useAppStore } from '@/lib/store';
import type { DoubanItem } from '@/lib/types';
import { NetflixRow } from './netflix-row';
import { DoubanCard } from './video-card';
import { cn } from '@/lib/utils';

interface RecommendSectionProps {
  onPick: (title: string) => void;
  categoryFilter?: 'all' | 'movie' | 'tv' | 'anime';
  onHeroItemsLoaded?: (items: DoubanItem[]) => void;
}

const MOVIE_TAGS = ['热门', '最新', '经典', '豆瓣高分', '冷门佳片', '华语', '欧美', '动作', '科幻', '动画'];
const TV_TAGS = ['热门', '国产剧', '日本动画', '美剧', '韩剧', '日剧', '港剧', '综艺', '纪录片'];

export function RecommendSection({
  onPick,
  categoryFilter = 'all',
  onHeroItemsLoaded,
}: RecommendSectionProps) {
  const doubanEnabled = useAppStore((s) => s.doubanEnabled);

  // 1. 全网热播榜
  const hotQuery = useQuery({
    queryKey: ['douban', 'movie', '热门'],
    queryFn: ({ signal }) => api.douban('movie', '热门', 0, 20, signal),
    enabled: doubanEnabled,
  });

  // 2. 豆瓣高分神作
  const topRatedQuery = useQuery({
    queryKey: ['douban', 'movie', '豆瓣高分'],
    queryFn: ({ signal }) => api.douban('movie', '豆瓣高分', 0, 20, signal),
    enabled: doubanEnabled,
  });

  // 3. 热门日漫新番
  const animeQuery = useQuery({
    queryKey: ['douban', 'tv', '日本动画'],
    queryFn: ({ signal }) => api.douban('tv', '日本动画', 0, 20, signal),
    enabled: doubanEnabled,
  });

  // 4. 热播华语剧集与国漫
  const dramaQuery = useQuery({
    queryKey: ['douban', 'tv', '国产剧'],
    queryFn: ({ signal }) => api.douban('tv', '国产剧', 0, 20, signal),
    enabled: doubanEnabled,
  });

  // 5. 热门美剧与欧美大片
  const westQuery = useQuery({
    queryKey: ['douban', 'tv', '美剧'],
    queryFn: ({ signal }) => api.douban('tv', '美剧', 0, 20, signal),
    enabled: doubanEnabled,
  });

  // 通知上层 Hero 填充数据
  const hotItems = hotQuery.data?.items ?? [];
  if (hotItems.length > 0 && onHeroItemsLoaded) {
    onHeroItemsLoaded(hotItems);
  }

  if (!doubanEnabled) return null;

  // 如果用户从顶部导航点击了单独分类（如"电影"、"剧集"、"动漫"）
  if (categoryFilter !== 'all') {
    return (
      <FilteredCategoryView
        category={categoryFilter}
        onPick={onPick}
      />
    );
  }

  // 默认模式：Netflix 经典横向滑动内容行
  return (
    <div className="space-y-4 pt-4 sm:pt-6">
      {/* 行 1：今日全网热搜 Top 10（带巨型空心数字排行） */}
      <NetflixRow
        title="今日热播 Top 10"
        subtitle="全网热度最高、多源秒播"
        badge="Top 10"
        items={hotQuery.data?.items?.slice(0, 10) ?? []}
        onPick={onPick}
        showRankingNumber
      />

      {/* 行 2：热门日漫新番（日漫专线） */}
      <NetflixRow
        title="热门日漫新番与剧场版"
        subtitle="魔都动漫专线收录 · 同步更新"
        badge="ANIME"
        items={animeQuery.data?.items ?? []}
        onPick={onPick}
      />

      {/* 行 3：热血华语剧集与国漫年番 */}
      <NetflixRow
        title="华语热播剧集 & 国漫"
        subtitle="量子/暴风多源极速更新"
        badge="DRAMA"
        items={dramaQuery.data?.items ?? []}
        onPick={onPick}
      />

      {/* 行 4：豆瓣 8.5+ 封神口碑 */}
      <NetflixRow
        title="豆瓣高分必看经典"
        subtitle="影迷公认口碑佳作 · 1080P 超清"
        badge="TOP RATED"
        items={topRatedQuery.data?.items ?? []}
        onPick={onPick}
      />

      {/* 行 5：热门欧美剧集 */}
      <NetflixRow
        title="全球热门剧集"
        subtitle="高分美剧、英剧精选"
        badge="GLOBAL"
        items={westQuery.data?.items ?? []}
        onPick={onPick}
      />
    </div>
  );
}

/** 单一分类深度浏览视图（当用户点击顶部菜单的 电影/剧集/动漫 时） */
function FilteredCategoryView({
  category,
  onPick,
}: {
  category: 'movie' | 'tv' | 'anime';
  onPick: (title: string) => void;
}) {
  const type = category === 'movie' ? 'movie' : 'tv';
  const defaultTag = category === 'anime' ? '日本动画' : '热门';
  const [tag, setTag] = useState(defaultTag);

  const tags = category === 'anime'
    ? ['日本动画', '动画', '新番']
    : category === 'movie'
    ? MOVIE_TAGS
    : TV_TAGS;

  const query = useQuery({
    queryKey: ['douban', type, tag],
    queryFn: ({ signal }) => api.douban(type, tag, 0, 48, signal),
  });

  const items = query.data?.items ?? [];

  return (
    <div className="px-4 sm:px-8 pt-6">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setTag(t)}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer',
              t === tag
                ? 'bg-white text-black font-bold shadow-lg scale-105'
                : 'bg-white/10 text-neutral-300 hover:text-white hover:bg-white/20'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {query.isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 animate-pulse">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-white/5 rounded-md" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
          {items.map((item) => (
            <DoubanCard key={item.id} item={item} onClick={() => onPick(item.title)} />
          ))}
        </div>
      )}
    </div>
  );
}
