# How to Fish 1.0.12 内容更新交接

本轮已完成本地内容实施、来源复核、生产构建与浏览器检查；总指挥任务「检查两款游戏内容更新」已完成复核，未发现阻断问题。本批更新已本地提交。未 push、merge、部署、调用 IndexNow/GSC、修改账号、DNS、广告或认证。

## 工作副本与状态

- 工作副本：`C:\Users\Admin\.codex\worktrees\9352\howtofishgamehelp`
- 分支：`codex/content-update-2026-09-08`
- 基线 HEAD：`2f3eaa9edfcb4ff829d8fcc30e275777c161d309`
- 交付状态：已本地提交本轮内容、检查和可复用证据。最终完整提交号由 Git 确认：在本副本运行 `git log -1 --format=%H -- docs/content-update-2026-09-08-handoff.md`；交付当时也以 `git rev-parse HEAD` 交叉核对，并回报总指挥。文档不硬编码自身所属提交的哈希。
- 实际基线比核查时的 `eb3599c` 多了三个既有 IndexNow 工作流提交，均予保留，本轮没有修改该流程。开始时工作区干净；本副本未出现 `.analytics/`，未操作保存项目中的同名目录。
- 实际命令环境：PowerShell 7.6.5；依赖通过现有锁文件安装，未增加生产或开发依赖。

## 逐页旧 → 新

| 页面 | 旧问题 | 本次结果 |
|---|---|---|
| `/achievements/hardest-achievements/` | 整场最终战禁用武器；强制与 Bean 分开 | 撤销自行增加的限制；官方条件、旧版玩家枪削血后拳尾刀、本站未测 1.0.12 分开。停止其它伤害是尝试方法的预防建议，不是附加成就规则。补 FAQ、联机反例、指虎未知，以及带 1.0.11 标签的可选冲刺钓鱼短提示 |
| `/achievements/achievement-guide/` | 直答、正文、步骤、FAQ 把 Handyman 与 Bean 说成不兼容 | 所有位置同步修正；分开练习为可选建议。Steam 成就数量本次确实重读，仍为 28；原始发布日期保留 |
| `/achievements/achievement-not-unlocking/` | 历史 1.0.4 修复被写成所有人一定获得空手成就 | 保留历史修复，撤销当前联机全员归属承诺，补玩家相反报告及 Handyman 指引。这是交叉一致性复查发现的同范围修正 |
| `/fixes/steam-cloud-pc-steam-deck-sync/` | 无独立跨设备存档答案 | 新增独立英文页：原设备运行并正常退出一次上传，等同步完成后再换 PC/Steam Deck，检查实际进度；冲突或失败时先停下识别副本。没有未核实路径、覆盖唯一档或自动修复承诺 |
| `/fixes/problems-and-fixes/` | 当前证据停在 1.0.11；缺乏新故障分类 | 更新为 1.0.12；合入 Cloud、FishNet 入房覆盖 FPS 上限、首次买 Radio 卡顿、MetaVoice 4.3、物品速度限制和有日期的历史音频排查。补 Boss 与 Cloud 入口；压缩重复旧说明以保持原 800–1500 词约束 |
| `/fixes/save-file-corrupted-or-weapon-crash/` | Cloud 泛化；重点仅 1.0.11 | 补 1.0.12 上传与同步区别、双向链接、FAQ；明确同步不能自动重建坏档，崩溃档不应重复启动以强推上传。保留 1.0.11 检查和备份及未公布恢复流程的边界 |
| `/bosses/giant-piranha/` | 旧打法固定要求切近战清小鱼 | 仅确认 rebalanced，不写 nerfed 或数值。补玩家更新后更难、超时与不同打法反馈；绕行、霰弹枪、吃已击败的小鱼为有限经验。近战改为依局面的选项；保留任务链，要求记录难度和人数 |
| `/bosses/tuna/` | 仅到 1.0.10 | 补 1.0.12 slight nerf；保留 Professional Boss Lure、侧躲跳跃、保留鱼身触发鸟 Boss 的原有任务链，不杜撰新数值 |
| `/bosses/mutated-bowhead-whale/` | 缺尾部爆炸命中改动；末尾暗示专门全空手一场 | 补官方 should 限定的尾部爆炸伤害改动，说明旧录像可能不同；同步社区拳尾刀步骤、停止剩余伤害建议、联机与指虎未知 |
| `/items/radar-guide/` | 丢雷达没有具体搜寻线索 | 补森林岛商店柱子旁、标牌下地面可补购雷达的 8 月 24 日原帖回复；标明具体版本和当前价格未知、1.0.12 地点未在游戏中复核。未引用后续推广链接 |
| `/items/grilling-guide/` | 缺误烤设备后的处理 | 补 1.0.10 武器/工具入水清除烹煮状态；明确不等于恢复烧焦食物，保留已有 1.0.11 Drip Parrotfish 修复 |
| `/` | 当前版本为 1.0.11 | 共享版本配置改为 1.0.12；增加存档同步动作入口与三个 Boss 链接，保留既有平台状态、设计和搜索组件 |
| `/fixes/`、`/achievements/` | 分类说明分别落后或延续 Handyman 过度限制 | 更新故障分类补丁说明与 Cloud 快捷入口；成就分类同步可选练习和旧版拳尾刀边界 |
| `/bosses/`、`/items/` | 关联卡片和分类修改日期来自旧答案 | 既有模板自动反映本轮答案及真实修改日期；未重写布局或扩展选题 |

## 来源与版本限制

沿用本轮批准的核查范围，读取了 `D:/codex/website_work/analysis/dawnwalker-howtofish-content-audit-2026-09-08/` 下的 `report.md`、`source-ledger.json`、`steam-news-4001890.json`、`site-snapshot-manifest.json`。11 份 How to Fish 线上 HTML 快照已实际读取，并逐一核对 SHA256 与 manifest 一致；摘要见证据目录中的 `baseline-snapshot-review.json`。

本任务另行只读复核的原始来源：

- [官方 1.0.12 永久链接](https://steamcommunity.com/games/4001890/announcements/detail/698774889153168486)的内容由已保存的 Steam 官方 API 与本次实际读取的[官方公告汇总](https://steamcommunity.com/app/4001890/announcements/)交叉核实。发布时间为 2026-09-04 16:11:30 UTC，即新加坡 9 月 5 日 00:11:30；配置中的日期按 UTC 日历记录。未增加新鱼、新岛或内容上线日。
- [官方成就列表](https://steamcommunity.com/stats/4001890/achievements/)：2026-09-08 实际重读，28 条及 Handyman 简短条件。
- [Spatison 等人的指南](https://steamcommunity.com/sharedfiles/filedetails/?id=3788992156)、[Charlie Pork 指南](https://steamcommunity.com/sharedfiles/filedetails/?id=3788027308)：前者描述枪削血拳尾刀；后者原版 1.0.4，且评论反驳联机全员归属。未采用旧 Bean 跳岛、存档编辑或完整速通路线。
- [Piranha 原帖](https://steamcommunity.com/app/4001890/discussions/0/581681298840706905/)：9 月 4–5 日建议与失败反馈并存，无法作为受控平衡数值或必过证明。
- [Radar 原帖](https://steamcommunity.com/app/4001890/discussions/0/582806239606672418/)：采用 8 月 24 日非推广回复，地点当前未在游戏中复核。
- [音频原帖](https://steamcommunity.com/app/4001890/discussions/0/582806239606511453/)：8 月 22–25 日历史经验。输入/输出变更的报告者未检验组队麦克风；拔控制器为另一玩家自述。
- [冲刺钓鱼原文](https://steamcommunity.com/sharedfiles/filedetails/?id=3794248165)：网页工具读取失败后，普通公开 HTTP 读取成功，实际读到动作链和作者的 1.0.11 标签；未采纳速度排行、固定效率或安全脱战保证。
- [Steamworks Cloud 文档](https://partner.steamgames.com/doc/features/cloud)：实际复核游戏退出后上传、启动前下载、全局/单游戏 Cloud 设置。Steam Support Cloud FAQ 本次网页与普通 HTTP 仅返回外壳，因此新增页以可读的 Steamworks 原文作为平台依据；Support 链接仅为玩家排障入口，不冒称 FAQ 本次全文已核实。

`updatedAt` 是真实编辑日期；`lastVerifiedAt`、`lastSourceReview` 是本次实际来源复核日期；每条未重新核对的历史来源仍保留原 `accessedAt`。没有批量把旧 `gameVersion` 刷成 1.0.12。Radar 仍保留较早的补丁证据标签；Grilling 保留 1.0.11，补入的设备清洗规则属于 1.0.10。所有页面 `firstHandTested` 仍为 false。

## 检查结果

证据目录：`docs/content-update-2026-09-08-evidence/`。截图目录：`docs/qa-screenshots/content-update-2026-09-08/`。

| 检查 | 实际结果 |
|---|---|
| `npm run check` | 最终日志记录 44 个文件，0 errors / warnings / hints，Worker TypeScript 检查也成功 |
| `npm run validate` | 36 个公开指南、0 草稿、0 校验错误、0 警告；保留正文、来源、重复元信息与链接约束 |
| `npm run build` | 成功生成静态页面；Pagefind 成功索引 36 页。既有 Default UI 提示为兼容性信息，没有更换搜索组件 |
| `npm test` | 61/61 通过，含本轮边界回归检查；IndexNow 测试使用项目既有模拟，不是提交操作 |
| `npm run test:built` | 10/10 通过，包括内链、元信息、无私密配置和广告边界 |
| 额外生成物审查 | 51 个 HTML、49 个可索引 URL；sitemap 与可索引 HTML 集合完全一致；canonical 全部 apex；0 重复 title/description；331 个内部锚点无断链 |
| 摘要与结构 | 36 个页面直答与源文件一致；RSS 有 36 条，description 与源文件一致；生成的 JSON-LD 全部可解析；FAQ 使用正文，未编造 FAQ Schema |
| 真实浏览器 | 独立 Playwright 会话，1440×1000 桌面及 390×844 手机，对 14 个路径共 28 次检查：全部 HTTP 200、单一 H1、无横向溢出、无重复 HTML id、0 页面脚本异常 |
| 页面与操作 | 已查看首页、Fixes、Cloud 桌面/手机截图；实际搜索 Steam Cloud，4 条结果中新增答案列在首位，点击成功；手机菜单展开及进入 Fixes 成功 |
| 浏览器日志 | 0 errors / warnings。搜索出现一条 autofocus 已有焦点的 INFO，不影响查询及链接 |
| 差异检查 | `git diff --check` 成功；未修改部署、隐私分析、账号或依赖配置 |

首次完整测试发现故障总览和损坏档页超过原有 1500 词上限，已压缩重复说明后重跑通过；没有放宽篇幅上限、禁用检查或删除测试。原固定 35 篇数量与日期断言仅按已审核新增页和真实编辑范围更新。

提交收尾仅更新本交接状态并清理文本证据的行末空格、末尾空行；日志结果未变，原始日志仍保留在忽略的 `output/` 中。网站内容未再变化，依总指挥要求不重复全套验证，仅复核提交范围、敏感信息、文件大小、差异格式和工作区状态。

## 改动文件

- `src/config/gameRelease.ts`、`src/config/site.ts`、`src/pages/index.astro`
- `src/content/guides/achievements/achievement-guide.md`
- `src/content/guides/achievements/hardest-achievements.md`
- `src/content/guides/achievements/achievement-not-unlocking.md`
- `src/content/guides/bosses/giant-piranha.md`
- `src/content/guides/bosses/tuna.md`
- `src/content/guides/bosses/mutated-bowhead-whale.md`
- `src/content/guides/fixes/problems-and-fixes.md`
- `src/content/guides/fixes/save-file-corrupted-or-weapon-crash.md`
- 新增 `src/content/guides/fixes/steam-cloud-pc-steam-deck-sync.md`
- `src/content/guides/items/radar-guide.md`、`src/content/guides/items/grilling-guide.md`
- `scripts/validate-content.mjs`
- `tests/content-quality.test.mjs`、`tests/source-contract.test.mjs`、`tests/validate-script.test.mjs`
- `docs/content-map.csv`、`docs/evidence-ledger.csv`：由既有导出脚本同步
- 本文、`docs/content-update-2026-09-08-evidence/` 及 `docs/qa-screenshots/content-update-2026-09-08/` 中的本次证据

`output/` 中的临时验证脚本、原始只读获取文件和浏览器日志仍由既有忽略规则排除；不是生产代码或网站资源。

## 本地预览

当前静态预览地址为 `http://127.0.0.1:4327/`，新页为 `http://127.0.0.1:4327/fixes/steam-cloud-pc-steam-deck-sync/`。它是本机预览，不是预览部署。

如服务已停止，可在上述工作副本运行 `npm run build` 后运行 `npm run preview -- --host 127.0.0.1 --port 4327`。不要调用 `deploy`、`deploy:preview`、`deploy:temporary` 或 `indexnow:submit`；本轮未获发布或收录提交授权。

## 拟发布 URL 清单

以下仅供总指挥审核和后续单独发布准备，本轮未执行外部写入。

- https://howtofishgamehelp.com/
- https://howtofishgamehelp.com/fixes/
- https://howtofishgamehelp.com/achievements/
- https://howtofishgamehelp.com/bosses/
- https://howtofishgamehelp.com/items/
- https://howtofishgamehelp.com/achievements/achievement-guide/
- https://howtofishgamehelp.com/achievements/hardest-achievements/
- https://howtofishgamehelp.com/achievements/achievement-not-unlocking/
- https://howtofishgamehelp.com/fixes/steam-cloud-pc-steam-deck-sync/
- https://howtofishgamehelp.com/fixes/problems-and-fixes/
- https://howtofishgamehelp.com/fixes/save-file-corrupted-or-weapon-crash/
- https://howtofishgamehelp.com/bosses/giant-piranha/
- https://howtofishgamehelp.com/bosses/tuna/
- https://howtofishgamehelp.com/bosses/mutated-bowhead-whale/
- https://howtofishgamehelp.com/items/radar-guide/
- https://howtofishgamehelp.com/items/grilling-guide/

随构建更新的系统产物包括 `/sitemap.xml`、`/rss.xml` 和 Pagefind 索引；`/search/` 继续 noindex，不作为独立索引内容提交。

## 尚未验证和交回边界

- 未进行游戏内 1.0.12 实测：包括 Handyman 尾刀、联机各人归属、指虎、PC/Deck 双向真实存档同步、损坏档恢复、Boss 改动、音频与 FPS 故障修复。
- Piranha 的具体血量/伤害、不同人数与难度成功率，Radar 当前补购位置/价格，冲刺钓鱼在 1.0.12 的持续有效性与效率仍未知。
- 不提供完整 Bean 必过路线，未观看 B 站/YouTube 录像；没有采用关闭友伤即可避开炸药自伤的冲突说法。
- 构建和浏览器通过仅证明本站实现与展示可用，不等于玩法、SEO 收益、Google 收录或生产部署已经验证。
- 总指挥已完成只读内容与证据复核，并授权本次本地提交。如后续批准发布，再准备精确发布内容和回读，不能把本次本地提交授权扩大为上线或收录提交授权。
