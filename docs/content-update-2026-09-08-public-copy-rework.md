# How to Fish 公开文案返工交接

已将指定 11 篇指南及首页、四个相关分类页中的内部写作限制改为玩家能使用的结论和操作，清理摘要、FAQ、来源 notes 中的同类表述。保留版本、来源和必要的不确定性。另按总指挥补充要求，修改搜索页开头一句话。没有新增文章、URL、依赖或布局。

## 状态与范围

- 工作副本：`C:\Users\Admin\.codex\worktrees\9352\howtofishgamehelp`
- 分支：`codex/content-update-2026-09-08`
- 返工基线：`97d5d84cd4eeb59fa49a7c1e72b0da215a7d2336`
- 本次提交号由提交后 `git rev-parse HEAD` 回报总指挥；本文不硬编码自身提交哈希。
- 未 push、merge、部署或调用 IndexNow/GSC；未修改账号、DNS、广告、认证及分析目录。
- 文章仍为 36 篇，本次重写正文 11 篇。其他旧文章正文未作逐句重写。

共享 `GuideLayout.astro` 仅将来源区标题简化为 `Sources`，删除重复的自我说明，保留来源链接、类型和真实检查日期。该共同来源区影响全部 36 篇指南。顶部真实测试状态卡仍保留，每篇显示一次 `Source-based guide; not independently playtested`；没有新增条件分支或改布局。

## 可对照的修改示例

| 位置 | 修改前 | 修改后 |
|---|---|---|
| Cloud 上传检查 | “platform checks and editorial completion checks” | “After quitting, check the game's Cloud status in Steam. A closed game window does not mean the upload has finished.” |
| Cloud 冲突处理 | “This guide provides no unverified save path or manual file-replacement recipe.” | 删除写作限制；保留识别正确进度、保存可用副本、不确认时停止覆盖的实际步骤。 |
| 损坏存档适用范围 | “No save location, backup filename, repair utility, or recovery outcome is claimed without evidence.” | “Start here if the game crashes while loading a save or equipping a weapon.” 随后分流到工作正常但另一设备缺档的 Cloud 指南。 |
| Handyman | “Our earlier instruction to avoid every weapon hit added a restriction…” | “The condition does not say that the entire fight must use fists.” 随后给出旧版社区方法及 1.0.12 未确认状态。 |
| Grilling | “The source establishes the cooking-state cleanup…” | 直接说明误烤武器或工具可放入水中检查状态；保留这不能恢复烧焦食物的区别。 |
| Fixes 分类 | “it should not be described as a universal save repair” | “it does not rebuild save progression or inventory.” |
| 共享来源区 | “This page synthesizes the specific facts below. It does not claim first-hand testing…” | 删除重复声明，直接列出处；顶部真实测试状态继续显示。 |
| 首页 | “Latest verified updates” | “Latest guide updates”，与实际按编辑日期排序的卡片一致。 |
| 搜索页补充一句 | “A search term does not create a new indexable page…” | “Search for a boss, item, island, achievement, or the problem blocking your run. You can also browse the categories below.” |

## 逐页覆盖

| URL | 返工重点 |
|---|---|
| `/achievements/achievement-guide/` | 直答、分类计划、Handyman、FAQ 和联机建议；删除修订说明与 Evidence boundaries 段落。 |
| `/achievements/hardest-achievements/` | 删除旧稿历史；写清最后一拳的准备；保留旧版来源、联机冲突、指虎未知及 1.0.11 冲刺钓鱼限制。 |
| `/achievements/achievement-not-unlocking/` | 历史修复改为更新和重试动作；Handyman 未确认与个人成就检查保留。 |
| `/fixes/steam-cloud-pc-steam-deck-sync/` | 原设备运行退出、等待同步、检查目标进度、冲突保档；删除编辑检查和路径写作限制。 |
| `/fixes/save-file-corrupted-or-weapon-crash/` | 按加载、装备、缺少副本区分症状；保留备份保护、安装文件与存档区别；移除重复采编边界。 |
| `/fixes/problems-and-fixes/` | 按症状分流；保留语音和物品变化的期望语气、历史音频报告日期；删除内部证据分类说明。 |
| `/bosses/giant-piranha/` | 先给任务和战斗动作；仅称 rebalanced，保留超时、失败等相反反馈。 |
| `/bosses/tuna/` | 保留 Boss Lure、侧躲、保留鱼身；用简短文字交代 slight nerf，删除数值发布限制。 |
| `/bosses/mutated-bowhead-whale/` | 保留官方 should、双战准备、RHIB 结束；社区拳尾刀的当前版本未知单独说明。 |
| `/items/radar-guide/` | 直接给商店柱旁线索；保留旧日期、版本未注明及当前可购性和价格未知。 |
| `/items/grilling-guide/` | 直接给误烤设备入水动作；1.0.5 售价倍率保留旧版归属，1.0.11 Drip Parrotfish 修复不泛化。 |
| `/` | 卡片摘要同步、最新更新标题与空状态文案清理。 |
| `/bosses/` | 以召唤、战斗准备、收取和交还掉落物组织分类说明，补对应 1.0.12 简述。 |
| `/items/` | 以当前障碍、任务物品、雷达和烹饪动作组织说明，删除新建页面的编辑规则。 |
| `/achievements/` | 按玩家目标组织清理和挑战计划；保留 Handyman 旧版、联机及指虎未知。 |
| `/fixes/` | 改为症状分流与比较步骤；删除如何表述补丁/修复的编辑要求。 |
| `/search/` | 总指挥补充的一句搜索提示清理；搜索功能、noindex 和数据处理不变。 |

## 事实与来源保留

- 与返工基线逐文件比对，11 篇文章的标题、原始来源标题/链接/类型/检查日期，以及发布日期、编辑日期、来源复核日期、版本字段、`firstHandTested` 全部保留。来源 notes 只作表述清理。此次沿用同一天前一轮已复核材料，没有把改写冒充新的来源检查。
- Handyman：枪削血后拳尾刀仍为旧版玩家经验；1.0.12 是否有效、联机归属和指虎资格未知；与 Bean 分开练习仍为可选。
- Piranha：只确认重新平衡，成功与失败反馈并存。Tuna：官方称轻微削弱，未添加数值。
- 鲸鱼尾部爆炸保留 should；MetaVoice 4.3、物品速度限制保留减少部分问题的期望，不写成普遍修复。
- Steam Cloud 同步不自动修坏档；唯一存档保护和冲突时停止覆盖保留。
- Radar 补购为 8 月 24 日旧报告；冲刺钓鱼明确 1.0.11，当前效果未知。
- 没有游戏内实测或 PC/Steam Deck 真机存档传输验收；浏览器检查只验证网页和站内搜索。

## 验证结果

证据位于 [public-copy-cleanup](content-update-2026-09-08-evidence/public-copy-cleanup/)，截图位于 [本轮截图](qa-screenshots/content-update-2026-09-08/public-copy-cleanup/)。首轮证据保留为历史，不覆盖成新的结果。

| 检查 | 结果 |
|---|---|
| 类型检查 | 48 个文件，0 errors / warnings / hints；Worker TypeScript 通过。 |
| 内容校验 | 36 公开指南，0 草稿，0 错误/警告；未放宽字数、来源或其他要求。 |
| 生产构建 | 成功；Pagefind 索引 36 篇。保留现有 Default UI 兼容性提示，无搜索组件替换。 |
| 全部测试 | 63/63；增加公开文字与共享状态回归检查，原 Handyman 断言改为验证当前版本未知的玩家表述，未删除事实约束。 |
| 生成页面测试 | 11/11；包括分类字数、内链、共享状态及清理文案。搜索一句修改后重建并再次 11/11。 |
| 额外生成物检查 | 51 HTML、49 可索引 URL、36 RSS 条目；canonical 全为 apex，0 重复 title/description，328 个内部锚点无断链，sitemap 集合准确。 |
| 摘要一致性 | 全部 36 篇直答与源文件一致，RSS description 与源文件一致；JSON-LD 可解析。 |
| 浏览器 | 16 个路径 × 桌面 1440×1000、手机 390×844，共 32 次：HTTP 200、单 H1、无横向溢出和重复 id、0 页面脚本异常。 |
| Pagefind | 读取 11 篇实际索引结果，全部可找到，指定内部话术未残留。搜索页不新增索引文章。 |
| 实际操作 | Steam Cloud 查询返回 4 项，打开目标页成功；手机菜单进入 Fixes 成功。搜索一句修改后重做该操作链。 |
| 人工阅读与截图 | 逐段改写正文及 4 个相关分类页；检查 Cloud 手机首屏/来源区、Handyman 桌面正文和搜索手机结果。关键词扫描仅为补充，不代替读者视角判断。 |
| 字数 | 三篇长指南正文分别 1157、1415、1373 词；四个相关分类为 398–436 词；均在既有约束内。 |

最后的搜索修改只有一句静态文案，依总指挥要求复用了已完成的检查，重建后重跑相关生成测试、生成物一致性审查和搜索操作，没有重复不相关的整套浏览器遍历。原始检查日志和临时辅助文件位于被忽略的 `output/`，交付只保留可读证据与截图。
