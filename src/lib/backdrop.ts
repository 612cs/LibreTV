import { getCache, setCache, fetchUpstream } from './fetch-utils';
import type { BackdropMeta } from './backdrop-constants';
import { PRESET_HERO_BACKDROPS } from './backdrop-constants';

export type { BackdropMeta };
export { PRESET_HERO_BACKDROPS };

const TMDB_API_KEY = 'ca5d667528ca51e527d9e4f7830d97d2';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/original';
const CACHE_TTL = 3600 * 1000 * 24; // 24小时缓存

/**
 * 智能获取影视的高清横屏壁纸（Backdrop）与官方剧情
 * 优先查本地预置 -> 次选查 TMDB API -> 失败时降级返回 null
 */
export async function fetchBackdropByTitle(
  title: string,
  category: 'all' | 'movie' | 'tv' | 'anime' = 'all'
): Promise<BackdropMeta | null> {
  const cleanTitle = title.replace(/[（(].*?[)）]/g, '').trim();
  const cacheKey = `backdrop:${cleanTitle}`;
  const cached = getCache<BackdropMeta>(cacheKey);
  if (cached) return cached;

  // 1. 匹配预置库
  const allPresets = [
    ...PRESET_HERO_BACKDROPS.all,
    ...PRESET_HERO_BACKDROPS.movie,
    ...PRESET_HERO_BACKDROPS.tv,
    ...PRESET_HERO_BACKDROPS.anime,
  ];
  const matched = allPresets.find(
    (p) => cleanTitle.includes(p.title) || p.title.includes(cleanTitle)
  );
  if (matched) {
    setCache(cacheKey, matched, CACHE_TTL);
    return matched;
  }

  // 2. 实时查询 TMDB API
  try {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      cleanTitle
    )}&language=zh-CN`;
    const res = await fetchUpstream(url, { timeoutMs: 4000 });
    if (res.ok) {
      const data = (await res.json()) as {
        results?: Array<{
          title?: string;
          name?: string;
          backdrop_path?: string;
          poster_path?: string;
          vote_average?: number;
          overview?: string;
        }>;
      };
      const first = data.results?.find((r) => r.backdrop_path);
      if (first && first.backdrop_path) {
        const meta: BackdropMeta = {
          title: first.title || first.name || cleanTitle,
          backdropUrl: `${TMDB_IMAGE_BASE}${first.backdrop_path}`,
          posterUrl: first.poster_path ? `${TMDB_IMAGE_BASE}${first.poster_path}` : undefined,
          rating: first.vote_average ? first.vote_average.toFixed(1) : undefined,
          overview: first.overview || undefined,
          category,
          tags: ['4K 原画', '杜比全景声', '多源秒播'],
        };
        setCache(cacheKey, meta, CACHE_TTL);
        return meta;
      }
    }
  } catch {
    // 忽略异常
  }

  return null;
}
