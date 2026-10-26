'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/client-api';
import { useAppStore } from '@/lib/store';
import { NetflixRow } from './netflix-row';
import { DoubanCard } from './video-card';
import { cn } from '@/lib/utils';

interface RecommendSectionProps {
  onPick: (title: string) => void;
  categoryFilter?: 'all' | 'movie' | 'tv' | 'anime';
}

const MOVIE_SUB_TAGS = ['全部', '热门', '豆瓣高分', '华语', '欧美', '科幻', '动作', '悬疑', '喜剧', '经典', '冷门佳片'];
const TV_SUB_TAGS = ['全部', '热门', '国产剧', '美剧', '韩剧', '日剧', '古装', '悬疑', '综艺', '纪录片'];
const ANIME_SUB_TAGS = ['全部', '日本动画', '国产动画', '热血', '恋爱', '科幻', '治愈', '剧场版'];

export function RecommendSection({
  onPick,
  categoryFilter = 'all',
}: RecommendSectionProps) {
  const doubanEnabled = useAppStore((s) => s.doubanEnabled);

  if (!doubanEnabled) return null;

  if (categoryFilter === 'movie') {
    return <MovieCategoryView onPick={onPick} />;
  }

  if (categoryFilter === 'tv') {
    return <TvCategoryView onPick={onPick} />;
  }

  if (categoryFilter === 'anime') {
    return <AnimeCategoryView onPick={onPick} />;
  }

  // 默认首页全部流媒体推荐行
  return <AllHomeRows onPick={onPick} />;
}

/** 1. 首页：全网综合热门横向跑马灯行 */
function AllHomeRows({ onPick }: { onPick: (title: string) => void }) {
  const hotQuery = useQuery({
    queryKey: ['douban', 'movie', '热门'],
    queryFn: ({ signal }) => api.douban('movie', '热门', 0, 20, signal),
  });

  const animeQuery = useQuery({
    queryKey: ['douban', 'tv', '日本动画'],
    queryFn: ({ signal }) => api.douban('tv', '日本动画', 0, 20, signal),
  });

  const dramaQuery = useQuery({
    queryKey: ['douban', 'tv', '国产剧'],
    queryFn: ({ signal }) => api.douban('tv', '国产剧', 0, 20, signal),
  });

  const topRatedQuery = useQuery({
    queryKey: ['douban', 'movie', '豆瓣高分'],
    queryFn: ({ signal }) => api.douban('movie', '豆瓣高分', 0, 20, signal),
  });

  const westQuery = useQuery({
    queryKey: ['douban', 'tv', '美剧'],
    queryFn: ({ signal }) => api.douban('tv', '美剧', 0, 20, signal),
  });

  return (
    <div className="space-y-4 pt-2">
      <NetflixRow
        title="今日热播 Top 10"
        subtitle="全网热度最高、多源秒播"
        badge="Top 10"
        items={hotQuery.data?.items?.slice(0, 10) ?? []}
        onPick={onPick}
        showRankingNumber
      />

      <NetflixRow
        title="热门日漫新番与剧场版"
        subtitle="魔都动漫专线收录 · 同步更新"
        badge="ANIME"
        items={animeQuery.data?.items ?? []}
        onPick={onPick}
      />

      <NetflixRow
        title="华语热播剧集 & 国漫"
        subtitle="量子/暴风多源极速更新"
        badge="DRAMA"
        items={dramaQuery.data?.items ?? []}
        onPick={onPick}
      />

      <NetflixRow
        title="豆瓣高分必看经典"
        subtitle="影迷公认口碑佳作 · 1080P 超清"
        badge="TOP RATED"
        items={topRatedQuery.data?.items ?? []}
        onPick={onPick}
      />

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

/** 2. 电影 Tab：电影专属多行与子分类沉浸式视图 */
function MovieCategoryView({ onPick }: { onPick: (title: string) => void }) {
  const [selectedTag, setSelectedTag] = useState('全部');

  const hotMovieQuery = useQuery({
    queryKey: ['douban', 'movie', '热门'],
    queryFn: ({ signal }) => api.douban('movie', '热门', 0, 20, signal),
  });

  const topMovieQuery = useQuery({
    queryKey: ['douban', 'movie', '豆瓣高分'],
    queryFn: ({ signal }) => api.douban('movie', '豆瓣高分', 0, 20, signal),
  });

  const chineseMovieQuery = useQuery({
    queryKey: ['douban', 'movie', '华语'],
    queryFn: ({ signal }) => api.douban('movie', '华语', 0, 20, signal),
  });

  const scifiMovieQuery = useQuery({
    queryKey: ['douban', 'movie', '科幻'],
    queryFn: ({ signal }) => api.douban('movie', '科幻', 0, 20, signal),
  });

  // 单独分类过滤查询
  const filterQuery = useQuery({
    queryKey: ['douban', 'movie', selectedTag],
    queryFn: ({ signal }) => api.douban('movie', selectedTag, 0, 48, signal),
    enabled: selectedTag !== '全部',
  });

  return (
    <div className="space-y-6 pt-2">
      {/* 顶部优雅子分类筛选栏：对齐栅格，带精致微光 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 border-b border-white/10">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
            电影分类
          </span>
          {MOVIE_SUB_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer',
                selectedTag === tag
                  ? 'bg-white text-black font-bold shadow-md scale-105'
                  : 'bg-white/10 text-neutral-300 hover:text-white hover:bg-white/20'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 如果选中了特定子分类（非"全部"），以美观网格展现该分类全部影片 */}
      {selectedTag !== '全部' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>{selectedTag} 电影精选</span>
            <span className="text-xs text-neutral-400 font-normal">（共收录热门佳作）</span>
          </h2>
          {filterQuery.isLoading ? (
            <GridSkeleton />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
              {(filterQuery.data?.items ?? []).map((item) => (
                <DoubanCard key={item.id} item={item} onClick={() => onPick(item.title)} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 默认“全部”模式：呈现多条精彩电影横向滑动行 */
        <div className="space-y-4">
          <NetflixRow
            title="今日电影热映榜 Top 10"
            subtitle="院线与全网热映高分佳作"
            badge="Top 10"
            items={hotMovieQuery.data?.items?.slice(0, 10) ?? []}
            onPick={onPick}
            showRankingNumber
          />

          <NetflixRow
            title="豆瓣高分封神电影"
            subtitle="影迷公认口碑佳作 · 4K 超清"
            badge="8.5+ 封神"
            items={topMovieQuery.data?.items ?? []}
            onPick={onPick}
          />

          <NetflixRow
            title="华语精选与口碑大片"
            subtitle="年度票房榜与热播佳片"
            badge="华语"
            items={chineseMovieQuery.data?.items ?? []}
            onPick={onPick}
          />

          <NetflixRow
            title="硬核科幻与欧美大片"
            subtitle="特效震撼 · 视听盛宴"
            badge="科幻动作"
            items={scifiMovieQuery.data?.items ?? []}
            onPick={onPick}
          />
        </div>
      )}
    </div>
  );
}

/** 3. 剧集 Tab：剧集专属多行与子分类视图 */
function TvCategoryView({ onPick }: { onPick: (title: string) => void }) {
  const [selectedTag, setSelectedTag] = useState('全部');

  const hotTvQuery = useQuery({
    queryKey: ['douban', 'tv', '热门'],
    queryFn: ({ signal }) => api.douban('tv', '热门', 0, 20, signal),
  });

  const chineseDramaQuery = useQuery({
    queryKey: ['douban', 'tv', '国产剧'],
    queryFn: ({ signal }) => api.douban('tv', '国产剧', 0, 20, signal),
  });

  const usTvQuery = useQuery({
    queryKey: ['douban', 'tv', '美剧'],
    queryFn: ({ signal }) => api.douban('tv', '美剧', 0, 20, signal),
  });

  const koreaTvQuery = useQuery({
    queryKey: ['douban', 'tv', '韩剧'],
    queryFn: ({ signal }) => api.douban('tv', '韩剧', 0, 20, signal),
  });

  const filterQuery = useQuery({
    queryKey: ['douban', 'tv', selectedTag],
    queryFn: ({ signal }) => api.douban('tv', selectedTag, 0, 48, signal),
    enabled: selectedTag !== '全部',
  });

  return (
    <div className="space-y-6 pt-2">
      {/* 顶部优雅子分类筛选栏 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 border-b border-white/10">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
            剧集分类
          </span>
          {TV_SUB_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer',
                selectedTag === tag
                  ? 'bg-white text-black font-bold shadow-md scale-105'
                  : 'bg-white/10 text-neutral-300 hover:text-white hover:bg-white/20'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {selectedTag !== '全部' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>{selectedTag} 精选剧集</span>
            <span className="text-xs text-neutral-400 font-normal">（全网同步更新）</span>
          </h2>
          {filterQuery.isLoading ? (
            <GridSkeleton />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
              {(filterQuery.data?.items ?? []).map((item) => (
                <DoubanCard key={item.id} item={item} onClick={() => onPick(item.title)} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <NetflixRow
            title="今日剧集热播榜 Top 10"
            subtitle="追剧不停 · 全网同步更新"
            badge="Top 10"
            items={hotTvQuery.data?.items?.slice(0, 10) ?? []}
            onPick={onPick}
            showRankingNumber
          />

          <NetflixRow
            title="华语爆款年代与古装大剧"
            subtitle="现象级收视狂潮 · 官方高画质"
            badge="国产热剧"
            items={chineseDramaQuery.data?.items ?? []}
            onPick={onPick}
          />

          <NetflixRow
            title="高分美剧与全球剧集"
            subtitle="顶级神作 · 紧凑烧脑"
            badge="美剧精选"
            items={usTvQuery.data?.items ?? []}
            onPick={onPick}
          />

          <NetflixRow
            title="热门韩剧与浪漫日剧"
            subtitle="心动罗曼史 · 治愈温情"
            badge="韩剧日剧"
            items={koreaTvQuery.data?.items ?? []}
            onPick={onPick}
          />
        </div>
      )}
    </div>
  );
}

/** 4. 动漫 Tab：动漫专属多行与子分类视图 */
function AnimeCategoryView({ onPick }: { onPick: (title: string) => void }) {
  const [selectedTag, setSelectedTag] = useState('全部');

  const animeHotQuery = useQuery({
    queryKey: ['douban', 'tv', '日本动画'],
    queryFn: ({ signal }) => api.douban('tv', '日本动画', 0, 20, signal),
  });

  const animeMovieQuery = useQuery({
    queryKey: ['douban', 'movie', '动画'],
    queryFn: ({ signal }) => api.douban('movie', '动画', 0, 20, signal),
  });

  const filterTagParam = selectedTag === '全部' ? '日本动画' : selectedTag;
  const filterQuery = useQuery({
    queryKey: ['douban', 'tv', filterTagParam],
    queryFn: ({ signal }) => api.douban('tv', filterTagParam, 0, 48, signal),
    enabled: selectedTag !== '全部',
  });

  return (
    <div className="space-y-6 pt-2">
      {/* 顶部优雅子分类筛选栏 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 border-b border-white/10">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
            动漫分类
          </span>
          {ANIME_SUB_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer',
                selectedTag === tag
                  ? 'bg-white text-black font-bold shadow-md scale-105'
                  : 'bg-white/10 text-neutral-300 hover:text-white hover:bg-white/20'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {selectedTag !== '全部' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>{selectedTag} 精选番剧</span>
            <span className="text-xs text-neutral-400 font-normal">（魔都专线首发更新）</span>
          </h2>
          {filterQuery.isLoading ? (
            <GridSkeleton />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
              {(filterQuery.data?.items ?? []).map((item) => (
                <DoubanCard key={item.id} item={item} onClick={() => onPick(item.title)} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <NetflixRow
            title="热门日漫新番 Top 10"
            subtitle="魔都动漫专线收录 · 飞碟社/MAPPA 同步更"
            badge="Top 10"
            items={animeHotQuery.data?.items?.slice(0, 10) ?? []}
            onPick={onPick}
            showRankingNumber
          />

          <NetflixRow
            title="封神动画电影与剧场版"
            subtitle="宫崎骏 / 新海诚 / 鬼灭剧场版精选"
            badge="剧场版"
            items={animeMovieQuery.data?.items ?? []}
            onPick={onPick}
          />
        </div>
      )}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 animate-pulse">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className="aspect-[2/3] bg-white/5 rounded-md" />
      ))}
    </div>
  );
}
