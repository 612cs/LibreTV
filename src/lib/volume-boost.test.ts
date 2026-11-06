import { describe, expect, it, vi } from 'vitest';

/**
 * 音量放大（Web Audio 增益链）行为测试。
 *
 * vitest 跑在 node 环境，没有真实 AudioContext，这里用一份结构等价的假实现：
 * 记录「哪个节点连到哪个节点」，因为本模块唯一会伤害用户的地方就是接错线——
 * `createMediaElementSource` 之后元素的输出只走音频图，一旦拆链不接回去就是永久静音。
 *
 * 模块级状态（sharedCtx / attached / pending / 手势监听）会跨用例残留，
 * 所以每个用例都 resetModules() 后动态 import，拿一份干净实现。
 */

/** 归一化连线：去掉实例编号，只关心拓扑（mediaSource->gain 等） */
const norm = (edge: string) => edge.replace(/#\d+/g, '');

interface Harness {
  /** 当前生效的连线（已归一化） */
  edges: () => string[];
  rawEdges: () => string[];
  stats: { mediaSourceCalls: number; ctxCreations: number; added: string[]; removed: string[] };
  /** 关键参数读数：gain.value 与限幅器的 threshold/knee/ratio */
  nodes: () => { gain?: number; threshold?: number; knee?: number; ratio?: number };
  /** 当前 ctx 状态（running / suspended） */
  ctxState: () => string;
  /** 模拟系统挂起（切后台 / 来电 / interrupted）：置 suspended 并广播 statechange */
  suspendCtx: () => void;
  /** ctx 上 statechange 监听数（修复后应 ≤1，句柄全部 dispose 后为 0） */
  ctxListenerCount: () => number;
  /** document 上当前存活的手势监听总数 */
  gestureListenerCount: () => number;
  /** 模拟一次用户交互（默认 pointerdown） */
  fireGesture: (name?: string) => void;
}

type FakeNode = {
  __name: string;
  connect: (target: { __name: string }) => void;
  disconnect: () => void;
  gain?: { value: number };
  threshold?: { value: number };
  knee?: { value: number };
  ratio?: { value: number };
  attack?: { value: number };
  release?: { value: number };
};

function installFakeAudio(
  initialState: 'running' | 'suspended' = 'running',
  opts: { resumeNeedsGesture?: boolean } = {}
): Harness {
  const links = new Set<string>();
  const stats = { mediaSourceCalls: 0, ctxCreations: 0, added: [] as string[], removed: [] as string[] };
  let seq = 0;
  const created: Record<string, FakeNode> = {};

  const mk = (prefix: string, extra: Partial<FakeNode> = {}): FakeNode => {
    const name = `${prefix}#${seq++}`;
    const node: FakeNode = {
      __name: name,
      connect: (target: { __name: string }) => { links.add(`${name}->${target.__name}`); },
      disconnect: () => { for (const l of Array.from(links)) if (l.startsWith(`${name}->`)) links.delete(l); },
      ...extra,
    };
    created[prefix] = node;
    return node;
  };

  // destination 在建链前就存在，编号固定为 #0
  const destination = mk('destination');
  const seenElements = new WeakSet<object>();

  const instances: FakeAudioContext[] = [];

  class FakeAudioContext {
    state: string = initialState;
    destination = destination;
    statechangeListeners = new Set<() => void>();
    constructor() {
      stats.ctxCreations += 1;
      instances.push(this);
    }
    addEventListener = (_type: string, fn: () => void) => { this.statechangeListeners.add(fn); };
    removeEventListener = (_type: string, fn: () => void) => { this.statechangeListeners.delete(fn); };
    private fire() { for (const fn of Array.from(this.statechangeListeners)) fn(); }
    resume = async () => {
      // 自动播放策略：没有用户手势时 resume 被拒（NotAllowedError）
      if (opts.resumeNeedsGesture && !gestureSeen) throw new Error('NotAllowedError');
      if (this.state !== 'running') { this.state = 'running'; this.fire(); }
    };
    suspend = () => { if (this.state !== 'suspended') { this.state = 'suspended'; this.fire(); } };
    createMediaElementSource = (el: object) => {
      stats.mediaSourceCalls += 1;
      // 真实规范：同一元素只能调用一次，重复调用抛 InvalidStateError
      if (seenElements.has(el)) throw new Error('InvalidStateError');
      seenElements.add(el);
      return mk('mediaSource');
    };
    createGain = () => mk('gain', { gain: { value: 1 } });
    createDynamicsCompressor = () =>
      mk('compressor', {
        threshold: { value: -24 }, knee: { value: 30 }, ratio: { value: 12 },
        attack: { value: 0.003 }, release: { value: 0.25 },
      });
  }

  // document 存真实监听器（可触发/可计数），added/removed 继续记录日志
  const docListeners = new Map<string, Set<() => void>>();
  let gestureSeen = false;
  vi.stubGlobal('document', {
    addEventListener: (name: string, fn: () => void) => {
      stats.added.push(name);
      if (!docListeners.has(name)) docListeners.set(name, new Set());
      docListeners.get(name)!.add(fn);
    },
    removeEventListener: (name: string, fn: () => void) => {
      stats.removed.push(name);
      docListeners.get(name)?.delete(fn);
    },
  });
  vi.stubGlobal('window', {
    location: { href: 'http://localhost:8080/watch', origin: 'http://localhost:8080' },
    AudioContext: FakeAudioContext,
  });

  return {
    rawEdges: () => Array.from(links),
    edges: () => Array.from(links).map(norm),
    stats,
    nodes: () => ({
      gain: created.gain?.gain?.value,
      threshold: created.compressor?.threshold?.value,
      knee: created.compressor?.knee?.value,
      ratio: created.compressor?.ratio?.value,
    }),
    ctxState: () => instances.at(-1)?.state ?? 'none',
    suspendCtx: () => instances.at(-1)?.suspend(),
    ctxListenerCount: () => instances.at(-1)?.statechangeListeners.size ?? 0,
    gestureListenerCount: () =>
      Array.from(docListeners.values()).reduce((n, s) => n + s.size, 0),
    fireGesture: (name = 'pointerdown') => {
      gestureSeen = true;
      const fns = docListeners.get(name);
      if (fns) for (const fn of Array.from(fns)) fn();
    },
  };
}

/** 取一份干净的模块实现（模块级状态不跨用例） */
async function freshModule() {
  vi.resetModules();
  return await import('./volume-boost');
}

/** 造一个 video 元素替身：currentSrc 决定 CORS 安全性 */
const video = (currentSrc: string, crossOrigin = '') =>
  ({ currentSrc, src: currentSrc, crossOrigin }) as unknown as HTMLVideoElement;

const BOOSTED = ['mediaSource->gain', 'gain->compressor', 'compressor->destination'];

describe('isWebAudioSafeForVideo', () => {
  it('空 src 不安全', async () => {
    const mod = await freshModule();
    expect(mod.isWebAudioSafeForVideo(video(''))).toBe(false);
  });

  it('blob: / data: 源（hls.js MSE 产物）安全', async () => {
    installFakeAudio();
    const mod = await freshModule();
    expect(mod.isWebAudioSafeForVideo(video('blob:http://localhost:8080/abc'))).toBe(true);
    expect(mod.isWebAudioSafeForVideo(video('data:audio/wav;base64,AAAA'))).toBe(true);
  });

  it('同源直连与本站代理路径安全', async () => {
    installFakeAudio();
    const mod = await freshModule();
    expect(mod.isWebAudioSafeForVideo(video('http://localhost:8080/api/proxy?url=x'))).toBe(true);
    expect(mod.isWebAudioSafeForVideo(video('/api/live/stream?url=x'))).toBe(true);
  });

  it('跨域且未开 CORS 的直连流不安全（接入会被浏览器静音）', async () => {
    installFakeAudio();
    const mod = await freshModule();
    expect(mod.isWebAudioSafeForVideo(video('http://1.2.3.4/live.ts'))).toBe(false);
  });

  it('跨域但已设 crossOrigin=anonymous 安全（点播源）', async () => {
    installFakeAudio();
    const mod = await freshModule();
    expect(mod.isWebAudioSafeForVideo(video('https://cdn.example.com/a.m3u8', 'anonymous'))).toBe(true);
  });
});

describe('增益链接线', () => {
  it('接入后按 source → gain(1.8) → compressor(软限幅) → destination 接线', async () => {
    const h = installFakeAudio('running');
    const mod = await freshModule();
    const handle = mod.attachVolumeBoost(video('http://localhost:8080/api/proxy?url=x'));
    expect(handle).not.toBeNull();
    expect(h.edges().sort()).toEqual([...BOOSTED].sort());
    const nodes = h.nodes();
    expect(nodes.gain).toBe(mod.VOLUME_BOOST_GAIN);
    // 透明限幅：只在超过 0dBFS 时才压
    expect(nodes.threshold).toBe(0);
    expect(nodes.knee).toBe(0);
    expect(nodes.ratio).toBe(20);
  });

  it('setBoost(false) 走单位增益直通——关键回归：不能拆链留空，否则永久静音', async () => {
    const h = installFakeAudio('running');
    const mod = await freshModule();
    const handle = mod.attachVolumeBoost(video('blob:http://localhost:8080/x'))!;
    handle.setBoost(false);
    expect(h.edges()).toEqual(['mediaSource->destination']);
  });

  it('setBoost(false) 后再开回来，恢复增益 + 限幅链且不再直通', async () => {
    const h = installFakeAudio('running');
    const mod = await freshModule();
    const handle = mod.attachVolumeBoost(video('blob:http://localhost:8080/x'))!;
    handle.setBoost(false);
    handle.setBoost(true);
    expect(h.edges().sort()).toEqual([...BOOSTED].sort());
    expect(h.edges()).not.toContain('mediaSource->destination');
  });

  it('同一元素重复 attach 幂等：createMediaElementSource 只调一次、返回同一句柄', async () => {
    const h = installFakeAudio('running');
    const mod = await freshModule();
    const el = video('blob:http://localhost:8080/x');
    const first = mod.attachVolumeBoost(el);
    const second = mod.attachVolumeBoost(el);
    expect(second).toBe(first);
    expect(h.stats.mediaSourceCalls).toBe(1);
  });

  it('CORS 不安全时返回 null，且不创建 AudioContext（完全不碰音频链路）', async () => {
    const h = installFakeAudio('running');
    const mod = await freshModule();
    expect(mod.attachVolumeBoost(video('http://1.2.3.4/live.ts'))).toBeNull();
    expect(h.stats.ctxCreations).toBe(0);
    expect(h.stats.mediaSourceCalls).toBe(0);
  });

  it('dispose 断开全部节点（仅在播放器销毁时使用）', async () => {
    const h = installFakeAudio('running');
    const mod = await freshModule();
    mod.attachVolumeBoost(video('blob:http://localhost:8080/x'))!.dispose();
    expect(h.edges()).toEqual([]);
  });

  it('放大倍数是合理正增益', async () => {
    const mod = await freshModule();
    expect(mod.VOLUME_BOOST_GAIN).toBeGreaterThan(1);
    expect(mod.VOLUME_BOOST_GAIN).toBeLessThanOrEqual(3);
  });
});

describe('suspended 补挂与手势监听生命周期', () => {
  it('suspended 时不改道；resume 完成后自动补挂，并解绑手势监听', async () => {
    const h = installFakeAudio('suspended');
    const mod = await freshModule();
    const handle = mod.attachVolumeBoost(video('blob:http://localhost:8080/x'));
    expect(handle).not.toBeNull();
    // 未建链，避免 suspended 状态下改道造成无声
    expect(h.rawEdges()).toEqual([]);
    expect(h.stats.mediaSourceCalls).toBe(0);
    // 只有存在待补挂项时才绑手势
    expect(h.stats.added.sort()).toEqual(['keydown', 'pointerdown', 'touchstart']);

    await Promise.resolve();
    await Promise.resolve();

    expect(h.edges().sort()).toEqual([...BOOSTED].sort());
    expect(h.stats.removed.sort()).toEqual(['keydown', 'pointerdown', 'touchstart']);
  });

  it('running 状态下不绑任何 document 手势监听', async () => {
    const h = installFakeAudio('running');
    const mod = await freshModule();
    mod.attachVolumeBoost(video('blob:http://localhost:8080/x'));
    expect(h.stats.added).toEqual([]);
  });

  it('suspended 期间关掉放大：从待办撤掉，不建链也不留监听', async () => {
    const h = installFakeAudio('suspended');
    const mod = await freshModule();
    const handle = mod.attachVolumeBoost(video('blob:http://localhost:8080/x'))!;
    handle.setBoost(false);
    await Promise.resolve();
    await Promise.resolve();
    expect(h.rawEdges()).toEqual([]);
    expect(h.stats.mediaSourceCalls).toBe(0);
    expect(h.stats.removed.sort()).toEqual(['keydown', 'pointerdown', 'touchstart']);
  });
});

/** 排空微任务链（resume().then → flushPending → …） */
const tick = async () => {
  for (let i = 0; i < 4; i++) await Promise.resolve();
};

describe('运行中挂起后的恢复（切后台 / 来电 / interrupted）', () => {
  it('ctx 从 running 被系统挂起后自动尝试 resume，不重建媒体源、不留手势监听', async () => {
    const h = installFakeAudio('running');
    const mod = await freshModule();
    mod.attachVolumeBoost(video('blob:http://localhost:8080/x'));
    expect(h.ctxState()).toBe('running');

    h.suspendCtx(); // 系统挂起：输出已改道进图 → 此刻起无声
    await tick(); // 给可能存在的自动恢复路径机会

    expect(h.ctxState()).toBe('running'); // main 上红：没有任何路径调 resume
    // 恢复是把同一张图跑起来，不是拆链重建
    expect(h.stats.mediaSourceCalls).toBe(1);
    expect(h.edges().sort()).toEqual([...BOOSTED].sort());
    expect(h.gestureListenerCount()).toBe(0);
  });

  it('自动 resume 被自动播放策略拒绝时，下一次用户交互必须能救回（不许永久静音）', async () => {
    const h = installFakeAudio('running', { resumeNeedsGesture: true });
    const mod = await freshModule();
    const handle = mod.attachVolumeBoost(video('blob:http://localhost:8080/x'));
    expect(handle).not.toBeNull();

    h.suspendCtx();
    await tick();

    expect(h.ctxState()).toBe('suspended'); // 自动恢复被拒，符合预期
    expect(h.gestureListenerCount()).toBe(3); // 但手势兜底必须在（main 上红：0）

    h.fireGesture('pointerdown');
    await tick();

    expect(h.ctxState()).toBe('running'); // main 上也红：手势监听在建链后就解绑了
    expect(h.stats.mediaSourceCalls).toBe(1);
    expect(h.edges().sort()).toEqual([...BOOSTED].sort());
    expect(h.gestureListenerCount()).toBe(0);
  });

  it('挂起后开关「音量放大」本身就是一次交互，必须顺带救回（此前关掉再开也救不回）', async () => {
    const h = installFakeAudio('running', { resumeNeedsGesture: true });
    const mod = await freshModule();
    const handle = mod.attachVolumeBoost(video('blob:http://localhost:8080/x'))!;

    h.suspendCtx();
    await tick();

    h.fireGesture('pointerdown'); // 用户点了设置里的开关（capture 手势监听先于开关生效）
    handle.setBoost(false); // 随后开关状态翻转
    await tick();

    expect(h.ctxState()).toBe('running'); // main 上红：setBoost 只重接线，不 resume
    expect(h.edges()).toEqual(['mediaSource->destination']); // 单位增益直通
  });

  it('ctx 状态监听只在存活句柄期间存在，全部 dispose 后解绑', async () => {
    const h = installFakeAudio('running');
    const mod = await freshModule();
    const handle = mod.attachVolumeBoost(video('blob:http://localhost:8080/x'));
    expect(h.ctxListenerCount()).toBe(1); // main 上红：从不监听 statechange
    handle!.dispose();
    expect(h.ctxListenerCount()).toBe(0);
    expect(h.gestureListenerCount()).toBe(0);
  });

  it('挂起且无法自动恢复期间全部 dispose：手势与 statechange 监听全部撤销', async () => {
    const h = installFakeAudio('running', { resumeNeedsGesture: true });
    const mod = await freshModule();
    const handle = mod.attachVolumeBoost(video('blob:http://localhost:8080/x'))!;
    h.suspendCtx();
    await tick();
    expect(h.gestureListenerCount()).toBe(3); // 挂起未恢复：手势兜底保持
    handle.dispose();
    expect(h.gestureListenerCount()).toBe(0);
    expect(h.ctxListenerCount()).toBe(0);
    expect(h.stats.mediaSourceCalls).toBe(1); // dispose 不多建媒体源
  });
});
