'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/client-api';
// 播放器（artplayer + hls.js）按需加载：拆出独立 chunk，不占首屏 First Load JS
const PlayerShell = dynamic(() => import('@/components/player-shell').then((m) => m.PlayerShell), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <Spinner size="lg" />
    </div>
  ),
});
import { EmptyState, LoadingState, Spinner } from '@/components/states';
import { SkipMarkPanel } from '@/components/skip-mark-panel';
import { skipMarkKey, validateSegment, type SkipSegment } from '@/lib/skip-marks';
import type { PlayerSkipApi } from '@/components/player-shell';
import { useToast } from '@/components/toast';
import { enqueueDownload } from '@/components/download-manager';
import { Icon } from '@/components/icon';
import { useAuth } from '@/components/auth';
import {
  resolveSource,
  useAppStore,
  isSourceDisabled,
  isInDisabledSubscription,
} from '@/lib/store';
import { qualityKey, qualityLabel } from '@/lib/quality';
import type { SearchResultItem, SourceConfig } from '@/lib/types';
import {
  clearProgress,
  progressKeyOf,
  saveProgress,
  updateHistoryProgress,
  upsertHistory,
  db,
} from '@/lib/db';
import { cn, validateSourceUrl } from '@/lib/utils';

/** 热门影视高定简介兜底（当部分采集站未提供 vod_content 时确保简介依旧饱满） */
const CURATED_SYNOPSIS: Record<string, { desc: string; director?: string; actors?: string; year?: string; genre?: string }> = {
  '流浪地球2': {
    desc: '太阳即将毁灭，人类在地球表面建造出巨大的推进器，寻找新的家园。然而宇宙之路危机四伏，为了拯救地球，流浪地球时代的年轻人再次挺身而出，展开争分夺秒的生死之战。行星发动机、太空电梯与月球坠落危机交织出史诗级硬核科幻巨制。',
    director: '郭帆',
    actors: '吴京 / 刘德华 / 李雪健 / 沙溢 / 宁理',
    year: '2023',
    genre: '科幻 / 冒险 / 灾难',
  },
  '繁花': {
    desc: '二十世纪九十年代初的上海，煌煌大时代，人人争上游，阿宝也变成了宝总。成功过，失败过，在沪上弄潮儿女中留下一段传奇。有过金碧辉煌，有过细水长流，黄河路上的霓虹与外贸大楼的风云共同谱写出一曲上海往事。',
    director: '王家卫',
    actors: '胡歌 / 马伊琍 / 唐嫣 / 辛芷蕾 / 游本昌',
    year: '2023',
    genre: '剧情 / 爱情 / 时代传奇',
  },
  '周处除三害': {
    desc: '通缉犯陈桂林生命将尽，却发现自己在通缉榜上只排名第三，他决心查出前两名通缉犯的下落，并将他们一一除掉，以为自己能在人世间留下名字。一场横跨黑帮、邪教与自我救赎的极致暴力美学之旅就此展开。',
    director: '黄精甫',
    actors: '阮经天 / 袁富华 / 陈以文 / 王净 / 李李仁',
    year: '2023',
    genre: '动作 / 犯罪 / 悬疑',
  },
  '庆余年 第二季': {
    desc: '范闲率使团回归途中，二皇子以费介、范思辙以及滕家遗孤的安危来威胁范闲，逼他向自己俯首称臣，二人的矛盾就此激发。范闲所面对的抱月楼迷局，以及接踵而至的春闱危机，都是二皇子精心给范闲布下的陷阱。',
    director: '孙皓',
    actors: '张若昀 / 李沁 / 陈道明 / 吴刚 / 郭麒麟',
    year: '2024',
    genre: '古装 / 权谋 / 剧情',
  },
  '鬼灭之刃 柱训练篇': {
    desc: '为了迎接即将与鬼舞辻无惨展开的最终决战，鬼杀队最强剑士“柱”们开启了面向全体队士的严苛地狱特训。炭治郎、善逸与伊之助在各位柱的指导下突破极限，决战前夕的暗流在无限城悄然涌动。',
    director: '外崎春雄',
    actors: '花江夏树 / 鬼头明里 / 下野纮 / 松冈祯丞 / 樱井孝宏',
    year: '2024',
    genre: '热血 / 奇幻 / 日漫新番',
  },
  '葬送的芙莉莲': {
    desc: '身为精灵族的魔法使芙莉莲，与同伴勇者辛美尔、矮人战士艾泽、人类僧侣海塔历经十年冒险打倒魔王，为世界带来了和平。在勇者逝世后，拥有漫长生命的芙莉莲重新踏上旅途，去真正理解人类的心灵与曾经羁绊的温度。',
    director: '斋藤圭一郎',
    actors: '种崎敦美 / 市之濑加那 / 小林千晃 / 冈本信彦',
    year: '2023',
    genre: '奇幻 / 治愈 / 冒险',
  },
  '狂飙': {
    desc: '京海市一线刑警安欣，在与黑恶势力的斗争中，不断遭到保护伞的打击，始终无法将犯罪分子绳之以法。全国政法队伍教育整顿工作开展后，临江省派出指导组入驻京海，横跨二十年的黑白较量终于水落石出。',
    director: '徐纪周',
    actors: '张译 / 张颂文 / 李一桐 / 张志坚 / 吴刚 / 高叶',
    year: '2023',
    genre: '犯罪 / 刑侦 / 扫黑',
  },
  '漫长的季节': {
    desc: '小城桦林，出租车司机王响做梦也没想到，他还有机会遇到一个他此生最想遇到，又最怕遇到的人。是仇人还是故人？遇到了，就得有交代，给自己，也给儿子。跨越十八年的东北秋日悬疑挽歌。',
    director: '辛爽',
    actors: '范伟 / 秦昊 / 陈明昊 / 李庚希 / 刘奕铁',
    year: '2023',
    genre: '悬疑 / 家庭 / 犯罪',
  },
  '三体': {
    desc: '2007年，地球基础科学出现了异常的扰动，纳米科学家汪淼被警官史强带到联合作战中心，潜入名为“科学边界”的组织协助调查。随着紅岸基地尘封历史与《三体》游戏的揭开，距离地球四光年外的三体文明正悄然降临。',
    director: '杨磊',
    actors: '张鲁一 / 于和伟 / 陈瑾 / 王子文 / 林永健',
    year: '2023',
    genre: '硬科幻 / 悬疑 / 剧情',
  },
};

function cleanSynopsis(raw?: string): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&ldquo;|&rdquo;|&quot;/gi, '“')
    .replace(/&middot;/gi, '·')
    .replace(/&hellip;/gi, '…')
    .replace(/\s+/g, ' ')
    .trim();
}

interface SourceCandidate {
  source: SourceConfig;
  item: SearchResultItem;
  ms?: number;
}

/** 判断搜索结果是否为解说/预告片等次级条目，确保正片永远排在最前 */
function isSecondaryClip(name: string): boolean {
  return /解说|预告|花絮|片段|集锦|彩蛋|短视频/.test(name);
}

/** 计算与目标片名的匹配度得分（越高越优先选为默认播放源） */
function scoreMatch(itemName: string, targetTitle: string): number {
  const cleanItem = itemName.trim();
  const cleanTarget = targetTitle.trim();
  if (!cleanItem || !cleanTarget) return 0;
  let score = 0;
  if (cleanItem === cleanTarget) score += 100;
  else if (cleanItem.startsWith(cleanTarget)) score += 80;
  else if (cleanItem.includes(cleanTarget)) score += 60;
  else {
    const mainWord = cleanTarget.split(/\s+/)[0];
    if (mainWord && cleanItem.includes(mainWord)) score += 40;
  }
  if (isSecondaryClip(cleanItem)) score -= 70;
  return score;
}

export default function WatchPage() {
  return (
    <Suspense>
      <WatchContent />
    </Suspense>
  );
}

function WatchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const store = useAppStore();
  const { verified } = useAuth();
  const { toast } = useToast();

  const sourceKeyParam = searchParams.get('source') || '';
  const vodIdParam = searchParams.get('id') || '';
  const directUrl = searchParams.get('url') || '';
  const titleParam = searchParams.get('title') || searchParams.get('q') || '';
  const indexParam = parseInt(searchParams.get('index') || '0', 10) || 0;

  const [reversed, setReversed] = useState(false);
  const [skipPanelOpen, setSkipPanelOpen] = useState(false);
  const [sourceCandidates, setSourceCandidates] = useState<SourceCandidate[]>([]);
  const [searchingSources, setSearchingSources] = useState(false);
  const [autoResolved, setAutoResolved] = useState<{ sourceKey: string; vodId: string } | null>(null);

  const playerApiRef = useRef<PlayerSkipApi | null>(null);
  const playerFrameRef = useRef<HTMLDivElement | null>(null);
  const sourceSectionRef = useRef<HTMLDivElement | null>(null);
  const [sheetMaxHeight, setSheetMaxHeight] = useState<number | undefined>(undefined);

  // 当前实际生效的 sourceKey 与 vodId（支持 URL 直接传入，也支持仅传片名自动从最快源解析）
  const activeSourceKey = sourceKeyParam || autoResolved?.sourceKey || '';
  const activeVodId = vodIdParam || autoResolved?.vodId || '';

  const enabledSources = useMemo(() => {
    const seen = new Set<string>();
    return store.selectedKeys
      .map((key) =>
        resolveSource(
          { customAPIs: store.customAPIs, envSources: store.envSources },
          key
        )
      )
      .filter((s): s is SourceConfig => {
        if (!s || !validateSourceUrl(s.url) || seen.has(s.key)) return false;
        seen.add(s.key);
        return true;
      })
      .filter((s) => !isSourceDisabled({ sourceHealth: store.sourceHealth }, s.key))
      .filter((s) => !isInDisabledSubscription({ subscriptions: store.subscriptions }, s.key));
  }, [store.selectedKeys, store.customAPIs, store.envSources, store.sourceHealth, store.subscriptions]);

  const source = resolveSource(store, activeSourceKey, {
    url: searchParams.get('sourceUrl') || undefined,
    detail: searchParams.get('detail') || undefined,
  });

  // 详情查询
  const detailQuery = useQuery({
    queryKey: ['detail', activeSourceKey, activeVodId, source?.url],
    queryFn: ({ signal }) => api.detail(activeVodId, source!, signal),
    enabled: Boolean(source && activeVodId && verified),
    staleTime: 5 * 60_000,
  });

  const episodes = useMemo(() => detailQuery.data?.episodes ?? [], [detailQuery.data]);
  const videoTitle = titleParam || detailQuery.data?.videoInfo?.title || '未知视频';

  // —— 核心能力：进入播放页时自动并发检索全网播放源，填充底部【内联多源切换矩阵】 ——
  // 若用户从首页海报直接点进来（未带 source/id），第一个返回的正片源立即自动开播！
  useEffect(() => {
    if (!verified || !videoTitle || videoTitle === '未知视频' || enabledSources.length === 0) return;

    const controller = new AbortController();
    let cancelled = false;
    let pickedFirst = Boolean(sourceKeyParam && vodIdParam);

    setSearchingSources(true);
    setSourceCandidates([]);

    const runMultiSourceSearch = async (queryText: string) => {
      const collected: SourceCandidate[] = [];

      await api.search(queryText, enabledSources, store.yellowFilter, {
        signal: controller.signal,
        onSource: (outcome) => {
          if (cancelled || !outcome.ok || outcome.list.length === 0) return;
          const srcObj = enabledSources.find((s) => s.key === outcome.sourceKey);
          if (!srcObj) return;

          // 按匹配得分挑出该源最匹配的正片条目
          const sorted = [...outcome.list].sort(
            (a, b) => scoreMatch(b.name || '', videoTitle) - scoreMatch(a.name || '', videoTitle)
          );
          const best = sorted[0];
          if (!best || scoreMatch(best.name || '', queryText) <= -50) return;

          const candidate: SourceCandidate = {
            source: srcObj,
            item: best,
            ms: outcome.ms,
          };
          collected.push(candidate);

          setSourceCandidates((prev) => {
            const exists = prev.some((p) => p.source.key === srcObj.key);
            const next = exists ? prev : [...prev, candidate];
            return next.sort((a, b) => {
              const scoreDiff = scoreMatch(b.item.name, videoTitle) - scoreMatch(a.item.name, videoTitle);
              if (scoreDiff !== 0) return scoreDiff;
              return (a.ms ?? 9999) - (b.ms ?? 9999);
            });
          });

          // 如果是从首页直达（还没有选定源），第一个返回的正片源立刻自动开播！
          if (!pickedFirst && !isSecondaryClip(best.name || '')) {
            pickedFirst = true;
            setAutoResolved({ sourceKey: srcObj.key, vodId: String(best.vodId) });
          }
        },
      });

      return collected;
    };

    (async () => {
      try {
        let found = await runMultiSourceSearch(videoTitle);
        // 如果片名含副标题（如“鬼灭之刃 柱训练篇”或“间谍过家家 第二季”）且精准搜到的源太少，用主标题再补搜一轮
        if (!cancelled && found.length === 0 && videoTitle.includes(' ')) {
          const mainTitle = videoTitle.split(' ')[0].trim();
          if (mainTitle.length >= 2) {
            found = await runMultiSourceSearch(mainTitle);
          }
        }
        // 兜底：如果所有源都只有次级条目且尚未选中源，则选第一个可用条目
        if (!cancelled && !pickedFirst && found.length > 0) {
          pickedFirst = true;
          setAutoResolved({
            sourceKey: found[0].source.key,
            vodId: String(found[0].item.vodId),
          });
        }
      } catch {
        /* 忽略中止错误 */
      } finally {
        if (!cancelled) setSearchingSources(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified, videoTitle, enabledSources.length]);

  useEffect(() => {
    if (!skipPanelOpen) return;
    const measure = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        setSheetMaxHeight(undefined);
        return;
      }
      const box = playerFrameRef.current?.getBoundingClientRect();
      if (!box) {
        setSheetMaxHeight(undefined);
        return;
      }
      const viewport = window.visualViewport?.height ?? window.innerHeight;
      const room = viewport - box.bottom - 12;
      setSheetMaxHeight(Math.round(Math.max(160, Math.min(viewport * 0.6, room))));
    };
    measure();
    window.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('resize', measure);
    };
  }, [skipPanelOpen]);

  // 当前播放地址
  const currentUrl = useMemo(() => {
    if (episodes.length > 0) {
      const idx = Math.min(Math.max(indexParam, 0), episodes.length - 1);
      return episodes[idx] || directUrl;
    }
    return directUrl;
  }, [episodes, indexParam, directUrl]);

  const currentIndex = useMemo(() => {
    if (episodes.length > 0) return Math.min(Math.max(indexParam, 0), episodes.length - 1);
    return indexParam;
  }, [episodes, indexParam]);

  const skipMarkFallback = `${activeSourceKey}:${activeVodId || currentUrl}`;
  const markKey = useMemo(
    () => skipMarkKey(videoTitle, skipMarkFallback),
    [videoTitle, skipMarkFallback]
  );
  const skipMark = store.skipMarks[markKey];
  const markedCount = skipMark?.segments.length ?? 0;

  const [pendingStart, setPendingStart] = useState<number | null>(null);
  useEffect(() => setPendingStart(null), [activeSourceKey, activeVodId, currentIndex]);

  const goEpisode = useCallback(
    (index: number) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (activeSourceKey) sp.set('source', activeSourceKey);
      if (activeVodId) sp.set('id', activeVodId);
      if (videoTitle) sp.set('title', videoTitle);
      sp.set('index', String(index));
      if (episodes[index]) sp.set('url', episodes[index]);
      sp.delete('position');
      router.replace(`/watch?${sp.toString()}`, { scroll: false });
    },
    [router, searchParams, activeSourceKey, activeVodId, videoTitle, episodes]
  );

  /** 原地无缝切换播放源（绝不退出播放页，自动保留当前集数） */
  const switchSourceInline = useCallback(
    (cand: SourceCandidate) => {
      setAutoResolved({ sourceKey: cand.source.key, vodId: String(cand.item.vodId) });
      const sp = new URLSearchParams();
      sp.set('source', cand.source.key);
      sp.set('id', String(cand.item.vodId));
      sp.set('title', videoTitle);
      sp.set('index', String(currentIndex));
      router.replace(`/watch?${sp.toString()}`, { scroll: false });
      toast(`已无缝切换至「${cand.source.name}」`, 'success');
    },
    [router, videoTitle, currentIndex, toast]
  );

  // 进度恢复优先级：URL position 参数 > IndexedDB 记录
  const getRestorePosition = useCallback(async () => {
    const urlPos = parseInt(searchParams.get('position') || '0', 10) || 0;
    if (urlPos > 0) return urlPos;
    if (!activeVodId) return 0;
    const entry = await db.progress.get(progressKeyOf(activeSourceKey, activeVodId, currentIndex));
    return entry?.position ?? 0;
  }, [searchParams, activeSourceKey, activeVodId, currentIndex]);

  // 写入观看历史
  useEffect(() => {
    if (!verified || !activeSourceKey || !currentUrl) return;
    const timer = setTimeout(() => {
      upsertHistory({
        sourceKey: activeSourceKey,
        sourceUrl: source?.url,
        vodId: activeVodId || currentUrl,
        title: videoTitle,
        pic: detailQuery.data?.videoInfo?.cover,
        episodeIndex: currentIndex,
        totalEpisodes: episodes.length,
        playbackPosition: 0,
        duration: 0,
        timestamp: Date.now(),
      }).catch(() => {});
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified, activeSourceKey, activeVodId, currentIndex, videoTitle, currentUrl]);

  const handleProgress = useCallback(
    (position: number, duration: number) => {
      if (activeVodId) {
        saveProgress(activeSourceKey, activeVodId, currentIndex, position, duration).catch(() => {});
        updateHistoryProgress(activeSourceKey, activeVodId || currentUrl, position, duration).catch(() => {});
      }
    },
    [activeSourceKey, activeVodId, currentIndex, currentUrl]
  );

  const autoNextTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (autoNextTimer.current) clearTimeout(autoNextTimer.current);
  }, []);

  const handleEnded = useCallback(() => {
    if (activeVodId) clearProgress(activeSourceKey, activeVodId, currentIndex).catch(() => {});
    if (store.autoplayNext && currentIndex < episodes.length - 1) {
      autoNextTimer.current = setTimeout(() => goEpisode(currentIndex + 1), 800);
    }
  }, [store.autoplayNext, currentIndex, episodes.length, goEpisode, activeSourceKey, activeVodId]);

  const handleRecordSegment = useCallback(
    (segment: SkipSegment) => {
      const duration = playerApiRef.current?.getDuration() ?? 0;
      const existing = useAppStore.getState().skipMarks[markKey]?.segments ?? [];
      const error = validateSegment(segment, duration, existing);
      if (error) {
        toast(error, 'error');
        return;
      }
      useAppStore.getState().setSkipMark(markKey, [...existing, segment]);
      const label =
        segment.type === 'opening' ? '片头结束' : segment.type === 'ending' ? '片尾开始' : '中段片段';
      const hint =
        segment.type === 'middle'
          ? useAppStore.getState().autoSkipSegments
            ? '，命中时将自动跳过'
            : '，命中时显示跳过按钮'
          : '';
      toast(`已记录${label}${hint}`, 'success');
    },
    [markKey, toast]
  );

  // Alt+←/→ 集数切换快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        goEpisode(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < episodes.length - 1) {
        e.preventDefault();
        goEpisode(currentIndex + 1);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [currentIndex, episodes.length, goEpisode]);

  const orderedEpisodes = reversed
    ? [...episodes].map((_, i) => episodes.length - 1 - i)
    : episodes.map((_, i) => i);

  // 组装影视简介与演职员元数据（优先采集站真实数据，辅以精选片库兜底）
  const info = detailQuery.data?.videoInfo;
  const curated = CURATED_SYNOPSIS[videoTitle] || CURATED_SYNOPSIS[videoTitle.split(' ')[0]];
  const synopsisText =
    cleanSynopsis(info?.desc) ||
    curated?.desc ||
    `正在播放《${videoTitle}》。支持在上方播放源矩阵中一键无缝切换全网高清切片线路，享受零广告沉浸式流媒体观影体验。`;
  const directorText = info?.director?.trim() || curated?.director || '';
  const actorText = info?.actor?.trim() || curated?.actors || '';
  const yearText = info?.year?.trim() || curated?.year || '2024';
  const areaText = info?.area?.trim() || '';
  const typeText = info?.typeName?.trim() || curated?.genre || '精选影视';
  const remarksText = info?.remarks?.trim() || (episodes.length > 1 ? `全 ${episodes.length} 集` : 'HD 正片');

  // 实测画质徽章
  const currentQuality = activeSourceKey && activeVodId
    ? store.qualityMap[qualityKey(activeSourceKey, activeVodId)]
    : undefined;
  const qBadge = qualityLabel(currentQuality?.height);

  if (!verified) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <p className="text-neutral-500 text-sm">等待访问验证...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#141414] text-white">
      {/* 顶部 Netflix 影院级沉浸导航栏 */}
      <header className="sticky top-0 z-40 bg-[#141414]/90 backdrop-blur-md border-b border-white/[0.07]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 flex items-center gap-3">
          <BackButton />
          <HomeButton />

          <Link href="/" className="hidden sm:flex items-center gap-2 mr-2 select-none">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#e50914] text-white font-display text-base leading-none shadow-md shadow-[#e50914]/30">
              L
            </span>
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-sm sm:text-base font-bold text-white truncate tracking-tight">
                {videoTitle}
              </h1>
              {remarksText && (
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-neutral-300">
                  {remarksText}
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400 truncate mt-0.5 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#e50914] animate-pulse" />
              <span>{source?.name || (searchingSources ? '正在极速匹配最佳播放源…' : '未选择源')}</span>
              {episodes.length > 0 && <span>· 第 {currentIndex + 1} / {episodes.length} 集</span>}
              {sourceCandidates.length > 1 && (
                <span className="text-neutral-500 hidden sm:inline">
                  （已聚合 {sourceCandidates.length} 条可用线路，可在下方直接切换）
                </span>
              )}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.08] hover:bg-white/[0.15] text-xs font-medium text-neutral-200 transition-colors border border-white/[0.08] cursor-pointer"
              onClick={() => {
                if (!currentUrl) return;
                enqueueDownload({
                  url: currentUrl,
                  title: `${videoTitle}${episodes.length > 1 ? ` 第${currentIndex + 1}集` : ''}`,
                  format: 'MP4',
                });
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>下载本集</span>
            </button>
            <button
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#e50914]/15 hover:bg-[#e50914]/25 text-xs font-semibold text-[#ff4d57] transition-colors border border-[#e50914]/30 cursor-pointer"
              onClick={() => {
                sourceSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              <span>线路 ({sourceCandidates.length || 1})</span>
            </button>
          </div>
        </div>
      </header>

      {/* 主放映厅区域 */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* 左侧：巨幕播放器 + 内联多源无缝切换矩阵 + 影视详情简介档案 */}
          <div className="space-y-5 min-w-0">
            {/* 1. 影院环境背光播放器容器 */}
            <div
              ref={playerFrameRef}
              className="aspect-video bg-black rounded-xl overflow-hidden cinema-ambient relative"
            >
              {currentUrl ? (
                <PlayerShell
                  url={currentUrl}
                  title={videoTitle}
                  adFilter={store.adFilter}
                  autoplayNext={store.autoplayNext}
                  skipMark={skipMark}
                  autoSkipSegments={store.autoSkipSegments}
                  pendingStart={pendingStart}
                  onPendingStart={setPendingStart}
                  onPlayerApi={(api) => { playerApiRef.current = api; }}
                  onRecordSegment={handleRecordSegment}
                  episodeKey={`${activeSourceKey}:${activeVodId}:${currentIndex}`}
                  nextUrl={currentIndex + 1 < episodes.length ? episodes[currentIndex + 1] : undefined}
                  nextEpisodeKey={
                    currentIndex + 1 < episodes.length
                      ? `${activeSourceKey}:${activeVodId}:${currentIndex + 1}`
                      : undefined
                  }
                  getRestorePosition={getRestorePosition}
                  onTimeUpdate={handleProgress}
                  onPause={handleProgress}
                  onEnded={handleEnded}
                  hasPrevEpisode={currentIndex > 0}
                  hasNextEpisode={episodes.length > 0 && currentIndex < episodes.length - 1}
                  onPrevEpisode={() => goEpisode(currentIndex - 1)}
                  onNextEpisode={() => goEpisode(currentIndex + 1)}
                  onQuality={(height) => {
                    if (!activeSourceKey || !activeVodId) return;
                    useAppStore.getState().setQuality({
                      [qualityKey(activeSourceKey, activeVodId)]: {
                        height,
                        from: 'play',
                        timestamp: Date.now(),
                      },
                    });
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[#0a0a0a]">
                  {detailQuery.isLoading || searchingSources ? (
                    <>
                      <Spinner size="lg" />
                      <p className="text-xs text-neutral-400 animate-pulse">
                        正在为您自动连接最佳高清播放线路…
                      </p>
                    </>
                  ) : (
                    <p className="text-neutral-400 text-sm">
                      {detailQuery.isError
                        ? '当前线路加载失败，请在下方直接点击切换其他播放源'
                        : '无可用播放地址，请尝试切换下方其他播放源'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 2. 快捷播控工具条 */}
            <div className="flex flex-wrap items-center gap-2.5 bg-[#181818] border border-white/[0.07] rounded-xl px-4 py-3">
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
                disabled={currentIndex <= 0}
                onClick={() => goEpisode(currentIndex - 1)}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
                </svg>
                <span>上一集</span>
              </button>

              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
                disabled={episodes.length === 0 || currentIndex >= episodes.length - 1}
                onClick={() => goEpisode(currentIndex + 1)}
              >
                <span>下一集</span>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>

              <button
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border',
                  skipPanelOpen
                    ? 'bg-[#e50914] text-white border-[#e50914]'
                    : 'bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 border-transparent'
                )}
                aria-expanded={skipPanelOpen}
                aria-haspopup="dialog"
                onClick={() => setSkipPanelOpen((v) => !v)}
              >
                <span>跳过片头/片尾{markedCount > 0 ? ` (${markedCount})` : ''}</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 ml-2 text-[11px] text-neutral-500">
                <span>空格 播放/暂停</span>
                <span>·</span>
                <span>←/→ 快进退</span>
                <span>·</span>
                <span>F 全屏</span>
              </div>

              <label className="flex items-center gap-2 text-xs text-neutral-300 ml-auto cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 accent-[#e50914] rounded cursor-pointer"
                  checked={store.autoplayNext}
                  onChange={(e) => store.updateSettings({ autoplayNext: e.target.checked })}
                />
                <span>自动连播</span>
              </label>
            </div>

            <SkipMarkPanel
              open={skipPanelOpen}
              onClose={() => setSkipPanelOpen(false)}
              markKey={markKey}
              pendingStart={pendingStart}
              onPendingStart={setPendingStart}
              mobileMaxHeight={sheetMaxHeight}
              getPlayerClock={() => {
                const api = playerApiRef.current;
                if (!api) return null;
                return {
                  currentTime: api.getCurrentTime(),
                  duration: api.getDuration(),
                  seek: (s) => api.seek(s),
                  pause: () => api.pause(),
                  isPaused: () => api.isPaused(),
                };
              }}
            />

            {/* 3. 播放器正下方：内联多源无缝切换舱（告别退出重选！） */}
            <section
              ref={sourceSectionRef}
              className="bg-[#181818] border border-white/[0.08] rounded-xl p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="inline-block w-1 h-4 rounded-full bg-[#e50914]" />
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    播放线路切换
                  </h2>
                  <span className="text-xs text-neutral-400">
                    （点击任意线路原地秒切，无需退出当前页面）
                  </span>
                </div>
                {searchingSources && (
                  <span className="text-[11px] text-[#e50914] flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e50914] animate-ping" />
                    正在并发检索更多线路…
                  </span>
                )}
              </div>

              {sourceCandidates.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5">
                  {sourceCandidates.map((cand) => {
                    const isActive =
                      cand.source.key === activeSourceKey &&
                      String(cand.item.vodId) === String(activeVodId);
                    const candQ = store.qualityMap[qualityKey(cand.source.key, cand.item.vodId)];
                    const candQLabel = qualityLabel(candQ?.height);

                    return (
                      <button
                        key={`${cand.source.key}_${cand.item.vodId}`}
                        type="button"
                        onClick={() => switchSourceInline(cand)}
                        className={cn(
                          'group relative flex flex-col justify-between p-3 rounded-lg text-left transition-all cursor-pointer border',
                          isActive
                            ? 'bg-gradient-to-br from-[#e50914]/25 to-[#e50914]/5 border-[#e50914] shadow-lg shadow-[#e50914]/15'
                            : 'bg-[#222222]/80 hover:bg-[#2a2a2a] border-white/[0.07] hover:border-white/20'
                        )}
                      >
                        <div className="flex items-center justify-between gap-1.5 w-full">
                          <span
                            className={cn(
                              'text-xs sm:text-sm font-bold truncate',
                              isActive ? 'text-white' : 'text-neutral-200 group-hover:text-white'
                            )}
                          >
                            {cand.source.name}
                          </span>
                          {isActive ? (
                            <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#e50914] text-[10px] font-bold text-white">
                              播放中
                            </span>
                          ) : cand.ms ? (
                            <span
                              className={cn(
                                'shrink-0 text-[10px] font-mono',
                                cand.ms < 600 ? 'text-emerald-400' : 'text-amber-400'
                              )}
                            >
                              {cand.ms}ms
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center justify-between gap-1 mt-2 text-[11px] text-neutral-400">
                          <span className="truncate">{cand.item.remarks || 'HD 高清'}</span>
                          {candQLabel && (
                            <span className="shrink-0 px-1 rounded bg-white/10 text-[10px] font-semibold text-neutral-200">
                              {candQLabel}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : searchingSources ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 rounded-lg bg-white/[0.04] border border-white/[0.06] animate-pulse"
                    />
                  ))}
                </div>
              ) : source ? (
                <div className="flex items-center gap-3 text-xs text-neutral-400">
                  <span className="px-3 py-1.5 rounded-lg bg-[#e50914]/20 border border-[#e50914] text-white font-semibold">
                    {source.name}（当前线路）
                  </span>
                  <span>暂未检索到其他同名备用线路</span>
                </div>
              ) : (
                <p className="text-xs text-neutral-500">暂无可用线路</p>
              )}
            </section>

            {/* 4. Netflix 旗舰级影视详情与剧情简介面板（Synopsis & Cast） */}
            <section className="bg-[#181818] border border-white/[0.08] rounded-xl p-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6">
                {/* 左栏：N SERIES 标 + 匹配度与工业徽章 + 剧情简介 */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-[#e50914] text-xl leading-none tracking-wider">
                      N
                    </span>
                    <span className="text-[10px] font-bold tracking-[0.28em] text-neutral-400 uppercase">
                      {episodes.length > 1 ? 'SERIES · 剧集' : 'FILM · 电影'}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {videoTitle}
                  </h2>

                  {/* Netflix 标志性元数据认证行 */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    <span className="font-bold text-[#46d369]">98% 匹配</span>
                    <span className="text-neutral-300 font-medium">{yearText}</span>
                    <span className="netflix-spec-badge">16+</span>
                    <span className="netflix-spec-badge">{qBadge || '1080P HD'}</span>
                    <span className="netflix-spec-badge">5.1 环绕声</span>
                    <span className="netflix-spec-badge">CC</span>
                    {areaText && (
                      <span className="text-neutral-400">· {areaText}</span>
                    )}
                  </div>

                  {/* 剧情简介正文 */}
                  <p className="text-sm text-neutral-300 leading-relaxed pt-1">
                    {synopsisText}
                  </p>
                </div>

                {/* 右栏：导演 / 主演 / 类型 / 状态（Netflix 经典右侧演职员表） */}
                <div className="space-y-2.5 text-xs leading-relaxed border-t md:border-t-0 md:border-l border-white/[0.08] pt-4 md:pt-0 md:pl-6">
                  {directorText && (
                    <div>
                      <span className="text-neutral-500">导演：</span>
                      <span className="text-neutral-200 font-medium">{directorText}</span>
                    </div>
                  )}
                  {actorText && (
                    <div>
                      <span className="text-neutral-500">主演：</span>
                      <span className="text-neutral-200 font-medium line-clamp-3">{actorText}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-neutral-500">类型：</span>
                    <span className="text-neutral-200 font-medium">{typeText}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">规格：</span>
                    <span className="text-neutral-200 font-medium">{remarksText}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">当前源：</span>
                    <span className="text-[#46d369] font-medium">
                      {source?.name || '自动优选'}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 右侧：Netflix 剧集选集侧栏 */}
          <aside className="bg-[#181818] border border-white/[0.08] rounded-xl p-4 sm:p-5 h-fit lg:sticky lg:top-22">
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/[0.07]">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>选集播放</span>
                  {episodes.length > 0 && (
                    <span className="text-xs font-normal text-neutral-400">
                      ({currentIndex + 1}/{episodes.length})
                    </span>
                  )}
                </h2>
              </div>
              {episodes.length > 1 && (
                <button
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-xs text-neutral-300 transition-colors cursor-pointer"
                  onClick={() => setReversed((v) => !v)}
                  aria-label={reversed ? '切换为正序排列' : '切换为倒序排列'}
                >
                  <Icon
                    name="arrowDown"
                    className={cn('w-3.5 h-3.5 transition-transform', reversed && 'rotate-180')}
                  />
                  <span>{reversed ? '正序' : '倒序'}</span>
                </button>
              )}
            </div>

            {episodes.length === 0 ? (
              detailQuery.isLoading || searchingSources ? (
                <LoadingState />
              ) : (
                <EmptyState
                  variant="plain"
                  title={detailQuery.isError ? '获取剧集失败' : '暂无剧集信息'}
                />
              )
            ) : (
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2 max-h-[65vh] overflow-y-auto scrollbar-thin pr-1">
                {orderedEpisodes.map((realIndex) => (
                  <EpisodeButton
                    key={realIndex}
                    index={realIndex}
                    active={realIndex === currentIndex}
                    onClick={() => goEpisode(realIndex)}
                  />
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-neutral-500 leading-relaxed">
              若当前线路缓冲较慢或画质不佳，可在左侧播放器下方的「播放线路切换」中一键秒切至量子、暴风、极速或魔都专线。
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/** 集数按钮：Netflix 烈焰红高亮激活态 */
function EpisodeButton({
  index,
  active,
  onClick,
}: {
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  return (
    <button
      ref={ref}
      className={cn(
        'h-9 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center',
        active
          ? 'bg-[#e50914] text-white shadow-md shadow-[#e50914]/30 scale-[1.02]'
          : 'bg-[#242424] hover:bg-[#323232] text-neutral-300 hover:text-white border border-white/[0.05]'
      )}
      onClick={onClick}
    >
      {index + 1}
    </button>
  );
}

function BackButton() {
  const router = useRouter();
  return (
    <button
      className="p-2 -ml-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push('/');
      }}
      aria-label="返回"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}

function HomeButton() {
  return (
    <Link
      href="/"
      className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
      aria-label="回首页"
      title="回首页"
    >
      <Icon name="home" className="w-5 h-5" />
    </Link>
  );
}
