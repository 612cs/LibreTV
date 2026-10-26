'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from './theme';
import { requestShowDownloadManager } from './download-manager';
import { Icon } from './icon';
import { SearchHistoryDropdown, useSearchHistory } from './search-history';
import { cn } from '@/lib/utils';

const SourceManagerDrawer = dynamic(
  () => import('./source-manager').then((m) => m.SourceManagerDrawer),
  { ssr: false }
);
const HistoryPanel = dynamic(
  () => import('./history-panel').then((m) => m.HistoryPanel),
  { ssr: false }
);

/** Netflix 沉浸式流媒体顶栏：透明渐变跟随滚动、品牌红标、展开式搜索框 */
export function Header({
  showSearch = true,
  activeCategory = 'all',
  onNavCategory,
}: {
  showSearch?: boolean;
  activeCategory?: 'all' | 'movie' | 'tv' | 'anime';
  onNavCategory?: (category: 'all' | 'movie' | 'tv' | 'anime') => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  const searchHistory = useSearchHistory(query);

  // 监听滚动位置改变导航栏透明度
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const submitSearch = (text: string) => {
    const q = text.trim().slice(0, 100);
    if (!q) return;
    searchHistory.close();
    router.push(`/?s=${encodeURIComponent(q)}`, { scroll: false });
    searchHistory.record(q);
  };

  const pickHistory = (text: string) => {
    setQuery(text);
    submitSearch(text);
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-50 h-16 transition-all duration-300 flex items-center',
          isScrolled
            ? 'bg-[#141414]/95 backdrop-blur-md border-b border-white/10 shadow-2xl'
            : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent border-transparent'
        )}
      >
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-10 flex items-center gap-5 sm:gap-8">
          {/* Netflix 经典 Bebas Neue 电影级红色字标 */}
          <Link
            href="/"
            aria-label="LibreTV 首页"
            className="flex items-center gap-1.5 shrink-0 group py-1 select-none"
          >
            <span className="font-display text-3xl sm:text-[34px] leading-none tracking-[0.06em] text-[#e50914] drop-shadow-[0_2px_10px_rgba(229,9,20,0.45)] group-hover:brightness-110 transition-all">
              LIBRETV
            </span>
          </Link>

          {/* 桌面端导航主分类 */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => {
                if (pathname !== '/') router.push('/');
                onNavCategory?.('all');
              }}
              className={cn(
                'relative py-1 cursor-pointer transition-colors',
                pathname === '/' && activeCategory === 'all'
                  ? 'text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              )}
            >
              首页
              {pathname === '/' && activeCategory === 'all' && (
                <span className="absolute -bottom-1 inset-x-0 h-0.5 bg-[#e50914] rounded-full shadow-[0_0_8px_#e50914]" />
              )}
            </button>
            <button
              onClick={() => {
                if (pathname !== '/') router.push('/');
                onNavCategory?.('movie');
              }}
              className={cn(
                'relative py-1 cursor-pointer transition-colors',
                pathname === '/' && activeCategory === 'movie'
                  ? 'text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              )}
            >
              电影
              {pathname === '/' && activeCategory === 'movie' && (
                <span className="absolute -bottom-1 inset-x-0 h-0.5 bg-[#e50914] rounded-full shadow-[0_0_8px_#e50914]" />
              )}
            </button>
            <button
              onClick={() => {
                if (pathname !== '/') router.push('/');
                onNavCategory?.('tv');
              }}
              className={cn(
                'relative py-1 cursor-pointer transition-colors',
                pathname === '/' && activeCategory === 'tv'
                  ? 'text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              )}
            >
              剧集
              {pathname === '/' && activeCategory === 'tv' && (
                <span className="absolute -bottom-1 inset-x-0 h-0.5 bg-[#e50914] rounded-full shadow-[0_0_8px_#e50914]" />
              )}
            </button>
            <button
              onClick={() => {
                if (pathname !== '/') router.push('/');
                onNavCategory?.('anime');
              }}
              className={cn(
                'relative py-1 cursor-pointer transition-colors',
                pathname === '/' && activeCategory === 'anime'
                  ? 'text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              )}
            >
              动漫
              {pathname === '/' && activeCategory === 'anime' && (
                <span className="absolute -bottom-1 inset-x-0 h-0.5 bg-[#e50914] rounded-full shadow-[0_0_8px_#e50914]" />
              )}
            </button>
            <Link
              href="/live"
              className={cn(
                'relative py-1 flex items-center gap-1.5 transition-colors',
                pathname === '/live' ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
              )}
            >
              <span className="live-dot" />
              <span>电视直播</span>
              {pathname === '/live' && (
                <span className="absolute -bottom-1 inset-x-0 h-0.5 bg-[#e50914] rounded-full shadow-[0_0_8px_#e50914]" />
              )}
            </Link>
          </nav>

          <div className="flex-1" />

          {/* 右侧功能组：展开式搜索 + 快捷入口 */}
          <div className="flex items-center gap-2 sm:gap-3">
            {showSearch && (
              <form
                className="relative"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSearch(query);
                }}
              >
                <div
                  ref={searchHistory.containerRef}
                  className={cn(
                    'flex items-center rounded-full border transition-all duration-300',
                    searchExpanded || query
                      ? 'w-48 sm:w-64 bg-black/80 border-white/30 px-3'
                      : 'w-9 sm:w-10 bg-transparent border-transparent hover:border-white/20'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSearchExpanded(!searchExpanded)}
                    className="w-8 h-8 flex items-center justify-center text-neutral-300 hover:text-white shrink-0 cursor-pointer"
                    aria-label="展开搜索"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>

                  {(searchExpanded || query) && (
                    <input
                      className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-neutral-400 py-1.5 focus:outline-none"
                      placeholder="搜索影片、动漫、日剧..."
                      value={query}
                      maxLength={100}
                      autoFocus
                      onChange={(e) => {
                        setQuery(e.target.value);
                        searchHistory.resetActive();
                      }}
                      onFocus={searchHistory.onFocus}
                      onKeyDown={(e) => searchHistory.onKeyDown(e, pickHistory)}
                      role="combobox"
                      aria-expanded={searchHistory.visible}
                      aria-controls="header-search-history"
                      aria-autocomplete="list"
                    />
                  )}
                </div>

                {searchHistory.visible && (
                  <div className="absolute right-0 top-11 w-64 z-50">
                    <SearchHistoryDropdown
                      id="header-search-history"
                      matches={searchHistory.matches}
                      activeIndex={searchHistory.activeIndex}
                      onPick={pickHistory}
                      onRemove={searchHistory.remove}
                      onClearAll={searchHistory.clearAll}
                    />
                  </div>
                )}
              </form>
            )}

            <button
              onClick={() => setHistoryOpen(true)}
              className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="观看历史"
              title="观看历史"
            >
              <Icon name="clock" />
            </button>

            <button
              onClick={requestShowDownloadManager}
              className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="下载管理"
              title="下载管理"
            >
              <Icon name="download" />
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="源设置"
              title="影视源与画质设置"
            >
              <Icon name="gear" />
            </button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <SourceManagerDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <HistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}
