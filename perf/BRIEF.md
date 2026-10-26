# 性能冲刺简报：LibreTV (Netflix 流媒体重构版)

## 你的职责

负责 LibreTV 网站打开和交互的速度：先测真实基线，再一步步按假设优化，每一步都用测量证明，赢下来的指标用棘轮锁住。主动提出改进，保持视觉、功能完整性，上线由用户批准放行。

## 核心操作与「能用」的定义

| 操作 | 页面 | 起点 | 终点（真的能用） | 判定表达式 |
|---|---|---|---|---|
| **首屏打开到能用** | `/` | 导航开始（带鉴权或未鉴权） | 首屏 Hero 大片渲染完成、播放按钮可交互，且首行至少 3 张影视卡片渲染出来 | `!!(document.querySelector('h1')?.innerText && document.querySelector('button') && document.querySelectorAll('.group.relative').length >= 3)` |
| **影视搜索响应** | `/?q=...` | 发起关键词检索 | 至少一个采集源返回聚合结果，播放卡片就绪 | `!!(document.querySelectorAll('.group.relative').length > 0 && !document.querySelector('.animate-spin'))` |

> **什么是假快**：骨架屏、Loading 转圈、占位黑盒都不算能用，必须真正拿到卡片数据、渲染出可点击的影视实体。

## 不能动的东西

- **视觉**：Netflix 沉浸暗黑流媒体质感（#141414 背景、#E50914 烈焰红品牌标）、Hero 4K 横屏巨幕、Top 10 大数字排行榜、横向滑动交互。
- **功能**：10 大采集站（魔都动漫日漫专线、量子、暴风、金鹰等）聚合搜索、密码保护拦截机制、ArtPlayer HLS 播放、分类过滤。
- **元数据与画质**：TMDB 4K 原生清晰壁纸、豆瓣真实评分、剧情简介。

## 目标

- **主指标**：首屏打开到能用（主口径 Fast 4G）p75 从基线压降 **≥ 50%**（目标 ≤ 1200ms）。
- **确定性指标**：
  1. 首屏 HTTP 请求数从 **109 个** 降至 **≤ 35 个**（降幅 68%）；
  2. 首屏关键 JS 传输体积从 **857 KB** 降至 **≤ 350 KB**（降幅 59%）；
  3. 客户端数据瀑布流：消除首屏 6 路并发豆瓣 API 往返请求，改为服务端直出或一次性聚合。
- **测量口径**：`Fast 4G` 档（往返 20ms，下行 4Mbps，上行 3Mbps，对所有请求生效，含本地服务）；每组 10 次，报 p50/p75/p95。

## 上线与回滚

- **批准人**：用户授权确认
- **部署方式**：GitHub `612cs/LibreTV` main 分支触发 Vercel Production Build
- **回滚办法**：`git revert <commit-id>` 或 Vercel CLI `vercel rollback`，可瞬间回滚到上一个 Deployment。
