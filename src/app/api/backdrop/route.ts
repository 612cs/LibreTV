import { NextResponse } from 'next/server';
import { guardRequest } from '@/lib/api-guard';
import { fetchBackdropByTitle, PRESET_HERO_BACKDROPS } from '@/lib/backdrop';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const guarded = guardRequest(req);
  if (guarded) return guarded;

  const url = new URL(req.url);
  const title = url.searchParams.get('title');
  const category = (url.searchParams.get('category') || 'all') as 'all' | 'movie' | 'tv' | 'anime';

  // 1. 如果请求具体的 title，返回该影视的 TMDB / 预置横屏壁纸
  if (title) {
    const meta = await fetchBackdropByTitle(title, category);
    return NextResponse.json({ meta });
  }

  // 2. 如果请求特定分类，直接返回该分类的预置 4K 横屏 Hero 列表
  const list = PRESET_HERO_BACKDROPS[category] || PRESET_HERO_BACKDROPS.all;
  return NextResponse.json({ items: list });
}
