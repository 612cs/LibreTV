'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/header';
import { NetflixHero } from '@/components/netflix-hero';
import { RecommendSection } from '@/components/douban-section';
import { AggregatedCard, aggregateResults } from '@/components/video-card';

const DetailModal = dynamic(
  () => import('@/components/detail-modal').then((m) => m.DetailModal),
  { ssr: false }
);
import { useAppStore, resolveSource, isInDisabledSubscription, isSourceDisabled } from '@/lib/store';
import { api } from '@/lib/client-api';
import type { SearchResultItem, SourceSearchOutcome } from '@/lib/types';
import { formatDisableTtl, validateSourceUrl } from '@/lib/utils';
import { useToast } from '@/components/toast';
import { EmptyState } from '@/components/states';
import { SiteFooter } from '@/components/site-footer';

const RESULT_PAGE_SIZE = 60;

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const urlQuery = searchParams.get('s') || '';
  const tabParam = (searchParams.get('tab') || 'all') as 'all' | 'movie' | 'tv' | 'anime';

  const customAPIs = useAppStore((s) => s.customAPIs);
  const envSources = useAppStore((s) => s.envSources);
  const selectedKeys = useAppStore((s) => s.selectedKeys);
  const yellowFilter = useAppStore((s) => s.yellowFilter);
  const sourceHealth = useAppStore((s) => s.sourceHealth);
  const subscriptions = useAppStore((s) => s.subscriptions);

  const [detailItem, setDetailItem] = useState<SearchResultItem | null>(null);
  const [streamedOutcomes, setStreamedOutcomes] = useState<SourceSearchOutcome[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'movie' | 'tv' | 'anime'>(
    ['all', 'movie', 'tv', 'anime'].includes(tabParam) ? tabParam : 'all'
  );

  useEffect(() => {
    if (['all', 'movie', 'tv', 'anime'].includes(tabParam)) {
      setCategoryFilter(tabParam);
    }
  }, [tabParam]);

  const sourceName = (key: string) =>
    customAPIs.find((a) => a.key === key)?.name ??
    envSources.find((a) => a.key === key)?.name ??
    key;

  const selectedSources = useMemo(() => {
    const seen = new Set<string>();
    return selectedKeys
      .map((key) => resolveSource({ customAPIs, envSources }, key))
      .filter((s): s is NonNullable<typeof s> => {
        if (!s || !validateSourceUrl(s.url) || seen.has(s.key)) return false;
        seen.add(s.key);
        return true;
      })
      .filter((s) => !isSourceDisabled({ sourceHealth }, s.key))
      .filter((s) => !isInDisabledSubscription({ subscriptions }, s.key));
  }, [customAPIs, envSources, selectedKeys, sourceHealth, subscriptions]);

  const disabledSources = useMemo(
    () => selectedKeys.filter((key) => isSourceDisabled({ sourceHealth }, key)),
    [selectedKeys, sourceHealth]
  );

  const searchQuery = useQuery({
    queryKey: ['search', urlQuery, selectedKeys, yellowFilter],
    queryFn: ({ signal }) => {
      setStreamedOutcomes([]);
      return api.search(urlQuery.slice(0, 100), selectedSources, yellowFilter, {
        signal,
        onSource: (outcome) => {
          setStreamedOutcomes((prev) => [...prev, outcome]);
          for (const ev of useAppStore.getState().recordSourceHealth([outcome])) {
            toast(
              ev.permanent
                ? `「${sourceName(ev.key)}」多次失败，已停止参与搜索，可在设置中恢复`
                : `「${sourceName(ev.key)}」连续超时/失败，已停用 ${formatDisableTtl(ev.ttlMs ?? 0)}`,
              'warning'
            );
          }
        },
      });
    },
    enabled: Boolean(urlQuery) && selectedSources.length > 0,
    staleTime: 300_000,
  });

  const runSearch = (q: string) => {
    const query = q.trim().slice(0, 100);
    if (!query) {
      toast('请输入搜索内容', 'info');
      return;
    }
    if (selectedSources.length === 0) {
      toast('请先在设置中添加并勾选点播源', 'warning');
      return;
    }
    router.push(`/?s=${encodeURIComponent(query)}`, { scroll: false });
  };

  const isSearching = Boolean(urlQuery) && searchQuery.isFetching && !searchQuery.data;
  const streamedList = useMemo(
    () => streamedOutcomes.flatMap((o) => o.list),
    [streamedOutcomes]
  );
  const list = useMemo(
    () => searchQuery.data?.list ?? (isSearching ? streamedList : []),
    [searchQuery.data, isSearching, streamedList]
  );
  const failures =
    searchQuery.data?.failures ??
    streamedOutcomes
      .filter((o) => !o.ok)
      .map((o) => ({ sourceKey: o.sourceKey, error: o.error || '请求失败', timedOut: o.timedOut }));
  const groups = useMemo(() => aggregateResults(list), [list]);

  const [visibleCount, setVisibleCount] = useState(RESULT_PAGE_SIZE);
  const visibleGroups = useMemo(() => groups.slice(0, visibleCount), [groups, visibleCount]);
  useEffect(() => setVisibleCount(RESULT_PAGE_SIZE), [groups]);

  return (
    <div className="min-h-screen flex flex-col bg-[#141414] text-white">
      {/* Netflix 悬浮导航栏 */}
      <Header
        activeCategory={categoryFilter}
        onNavCategory={(cat) => {
          setCategoryFilter(cat);
          const nextUrl = cat === 'all' ? '/' : `/?tab=${cat}`;
          router.push(nextUrl, { scroll: false });
        }}
      />

      <main className="flex-1 w-full pb-16">
        {/* 未处于搜索状态时：沉浸式呈现 Netflix 首屏 4K 横屏大片与滑动行 */}
        {!urlQuery ? (
          <>
            {/* 首屏 4K 原生超清横屏 Hero 大片（不同分类具备专属 4K 壁纸） */}
            <NetflixHero
              category={categoryFilter}
              onPlay={(title) => runSearch(title)}
              onInfo={(title) => runSearch(title)}
            />

            {/* 内容行陈列区 */}
            <div className="-mt-8 relative z-20">
              <RecommendSection
                categoryFilter={categoryFilter}
                onPick={(title) => runSearch(title)}
              />
            </div>
          </>
        ) : (
          /* 搜索结果界面：顶栏避让 pt-24，以高密度流媒体卡片陈列 */
          <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-white/10 pb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                  <span className="text-[#e50914]">“{urlQuery}”</span>
                  <span>的搜索结果</span>
                </h1>
                <p className="text-xs text-neutral-400 mt-1">
                  {isSearching ? (
                    <span>正在检索各源（已响应 {streamedOutcomes.length}/{selectedSources.length} 个源）…</span>
                  ) : (
                    <span>
                      共聚合 {groups.length} 部影视 · {list.length} 条播放源
                      {failures.length > 0 && `（${failures.length} 个源超时或失败）`}
                    </span>
                  )}
                </p>
              </div>

              <button
                onClick={() => {
                  const backUrl = categoryFilter === 'all' ? '/' : `/?tab=${categoryFilter}`;
                  router.push(backUrl, { scroll: false });
                }}
                className="self-start sm:self-auto text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <span>返回浏览</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 失败与超时提示 */}
            {failures.length > 0 && (
              <div className="mb-4 text-xs bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 flex flex-wrap gap-x-3 gap-y-1">
                <span className="text-neutral-400">{isSearching ? '等待响应中：' : '部分源连接超时：'}</span>
                {failures.map((f) => (
                  <span key={f.sourceKey} className={f.timedOut ? 'text-amber-400' : 'text-neutral-500'}>
                    {f.timedOut ? '⏱' : '✗'} {sourceName(f.sourceKey)}
                    {f.timedOut ? ' 超时' : ''}
                  </span>
                ))}
              </div>
            )}

            {disabledSources.length > 0 && (
              <div className="mb-4 text-xs text-neutral-400 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5">
                {disabledSources.length} 个源因连续超时已暂停：{disabledSources.map((key) => sourceName(key)).join('、')}
              </div>
            )}

            {/* 结果卡片展示 */}
            {selectedSources.length === 0 ? (
              <NoSourceGuide hasSources={customAPIs.length > 0 || envSources.length > 0} />
            ) : list.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                  {visibleGroups.map((group) => (
                    <AggregatedCard
                      key={group.key}
                      group={group}
                      sources={selectedSources}
                      onOpen={(item) => setDetailItem(item)}
                    />
                  ))}
                </div>
                {groups.length > visibleCount && (
                  <div className="flex justify-center mt-8">
                    <button
                      className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm transition-all border border-white/10 cursor-pointer"
                      onClick={() => setVisibleCount((v) => v + RESULT_PAGE_SIZE)}
                    >
                      加载更多（剩余 {groups.length - visibleCount} 部）
                    </button>
                  </div>
                )}
              </>
            ) : isSearching ? (
              <ResultsSkeleton />
            ) : (
              <EmptyState
                icon="search"
                title="没有找到匹配的影视资源"
                description="请尝试缩短或更换片名关键词（如将“电锯人”换为“链锯人”）"
                className="!py-20"
              />
            )}
          </div>
        )}
      </main>

      <SiteFooter />
      <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-lg flex h-32 overflow-hidden animate-pulse">
          <div className="w-24 sm:w-28 shrink-0 bg-white/10" />
          <div className="flex-1 p-3 space-y-2.5">
            <div className="h-4 w-3/4 rounded bg-white/10" />
            <div className="h-3 w-1/2 rounded bg-white/10" />
            <div className="h-3 w-full rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NoSourceGuide({ hasSources = false }: { hasSources?: boolean }) {
  return (
    <div className="border border-dashed border-white/20 rounded-2xl p-12 text-center max-w-lg mx-auto bg-white/5">
      <h3 className="text-white font-bold text-base mb-2">{hasSources ? '尚未勾选点播源' : '先添加一个点播源'}</h3>
      <p className="text-sm text-neutral-400 leading-relaxed">
        {hasSources ? (
          <>点击右上角设置图标，勾选要参与搜索的点播源即可开启多源搜索。</>
        ) : (
          <>点击右上角设置添加点播源地址即可开始享受全网观影。</>
        )}
      </p>
    </div>
  );
}
