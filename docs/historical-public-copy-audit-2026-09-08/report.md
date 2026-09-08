# How to Fish 历史公开文案只读审查

前轮只逐句处理了 11 篇指南和相关入口，不能据此声称其余旧页也已逐句检查。本次补读了其余 25 篇公开指南、3 个旧分类入口及 6 个信息/错误页，共 34 个 HTML 页面；结合前轮明确覆盖的 17 页，现有 51 个静态 HTML 页都有覆盖记录。

25 篇旧指南中，11 篇有本次目标下的修改建议，14 篇未发现内部采编话术。加上 3 个分类和 4 个信息/错误页，共 18 页有 49 个句子/段落级建议，其中 About 的一处属于可选精简。该数字是文案问题清单，不代表 49 个严重错误或游戏事实已被证伪。

**这是只读审查，尚未实施修改。** 网站文件和 HEAD 保持不变；只新增此目录的内部报告、结构化清单和回读记录，没有构建、重复测试、线上访问、发布、提交 Git 或提交收录。

## 基线与证据范围

- 基线 HEAD：`9443db998642d1c366b7ce8231dbea62e6c0fb3f`。
- 工作副本：`C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp`。
- 审阅日期：2026-09-08。
- [逐句问题数据](findings.json)；[行号及现有 HTML 回读](readback.json)。
- 人工审阅对象是各页 title、description、answer、完整正文，以及分类 start、route、overview、patchNote、caution 和信息页可见文字；Privacy 的启用/停用两种文案均读过。
- 现有 `dist` 只用于确认文字会被输出；49 处原文均在对应已有 HTML 的正文或 description 中找到，51 条来源定位（含潜在项和附带一致性项）均与实际文件行号匹配。没有以关键词零命中作为逐篇审查依据。
- 下列公开 URL 是仓库对应路由，不代表本次确认生产站正在部署相同版本。没有重新核实游戏事实、来源新补丁、法律有效性或账号设置。
- 首页图片 alt、hreflang、schema/GEO 由总指挥独立技术核验，本报告不重复工具分数研究。

## 保留什么，清理什么

真实测试状态、来源作者/链接/日期、具体旧版本限制、联机归属未知、存档保护、功能提示和真实隐私披露继续保留。About 解释研究方法、Disclaimer 解释非官方身份、Terms 说明使用条件，符合这些页面本身的目的，不能因为出现 source、evidence 或 guarantee 就整体删除。

需要清理的是面向作者的写作命令、内部字段维护、关键词变体和近重复页面策略、工具/配置验收门槛，以及攻略正文反复复述已在顶部和来源区展示的采编过程。删除重复段落后如果篇幅不足，不应为了原字数门槛再填回同类话术；后续实施需靠已有的玩家可用事实整合，并保留既有校验。

## 25 篇旧指南逐篇覆盖

| 公开 URL | 文件 | 结果 | 阅读结论 |
|---|---|---|---|
| [/guides/beginner-guide/](https://howtofishgamehelp.com/guides/beginner-guide/) | [src/content/guides/guides/beginner-guide.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/guides/beginner-guide.md) | 有最小修改建议 | 正文及摘要逐句审阅；保留旧版路线与难度差异，删除重复测试声明和写作推导。 |
| [/guides/difficulty-settings/](https://howtofishgamehelp.com/guides/difficulty-settings/) | [src/content/guides/guides/difficulty-settings.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/guides/difficulty-settings.md) | 有最小修改建议 | 百分比、联机归属和成就影响未知应保留；多处转向对作者的指令。 |
| [/guides/unlock-next-island/](https://howtofishgamehelp.com/guides/unlock-next-island/) | [src/content/guides/guides/unlock-next-island.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/guides/unlock-next-island.md) | 未发现本类问题 | 交还掉落、钥匙、雷达、旧版捷径限制均直接服务玩家；未见内部采编话术。 |
| [/guides/what-to-do-after-pufferfish/](https://howtofishgamehelp.com/guides/what-to-do-after-pufferfish/) | [src/content/guides/guides/what-to-do-after-pufferfish.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/guides/what-to-do-after-pufferfish.md) | 有最小修改建议 | 掉落名称冲突有用，但表述成了本站如何避免断言。 |
| [/walkthrough/story-walkthrough/](https://howtofishgamehelp.com/walkthrough/story-walkthrough/) | [src/content/guides/walkthrough/story-walkthrough.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/walkthrough/story-walkthrough.md) | 有最小修改建议 | 路线/手交步骤清楚，但适用范围、FAQ 和证据边界重复作者取证说明。 |
| [/walkthrough/lighthouse-first-island/](https://howtofishgamehelp.com/walkthrough/lighthouse-first-island/) | [src/content/guides/walkthrough/lighthouse-first-island.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/walkthrough/lighthouse-first-island.md) | 未发现本类问题 | 装备来源差异用于解释购买选择，未转为写作/审核要求；其余均为玩家动作。 |
| [/islands/island-progression/](https://howtofishgamehelp.com/islands/island-progression/) | [src/content/guides/islands/island-progression.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/islands/island-progression.md) | 有最小修改建议 | 地形和任务名对照有用；“避免编造正式岛名”是作者说明。 |
| [/islands/island-two-leeches/](https://howtofishgamehelp.com/islands/island-two-leeches/) | [src/content/guides/islands/island-two-leeches.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/islands/island-two-leeches.md) | 有最小修改建议 | 步骤有用，只有“不要编造重生计时”把编辑约束写给玩家。 |
| [/islands/island-three-desert/](https://howtofishgamehelp.com/islands/island-three-desert/) | [src/content/guides/islands/island-three-desert.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/islands/island-three-desert.md) | 未发现本类问题 | 逐句覆盖抵达、双任务、濒危/Drip 区分、Boss 和难度提醒；均与玩家进度相关。 |
| [/islands/island-four-rocks/](https://howtofishgamehelp.com/islands/island-four-rocks/) | [src/content/guides/islands/island-four-rocks.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/islands/island-four-rocks.md) | 未发现本类问题 | Tuna 身体作为鸟饵及掩体步骤明确；来源归属服务于具体装备差异。 |
| [/islands/volcano-endgame/](https://howtofishgamehelp.com/islands/volcano-endgame/) | [src/content/guides/islands/volcano-endgame.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/islands/volcano-endgame.md) | 未发现本类问题 | 双鲸鱼准备、掉落手交、RHIB 与坏档保护均为实际操作。 |
| [/achievements/story-achievements/](https://howtofishgamehelp.com/achievements/story-achievements/) | [src/content/guides/achievements/story-achievements.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/achievements/story-achievements.md) | 未发现本类问题 | 官方成就条件及联机个人检查为必要完成提示；未见写作门槛或取证流程。 |
| [/bosses/boss-guide/](https://howtofishgamehelp.com/bosses/boss-guide/) | [src/content/guides/bosses/boss-guide.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/bosses/boss-guide.md) | 未发现本类问题 | 战斗顺序、社区别名和未公布公式帮助识别目标与难度；无直接采编指令。 |
| [/bosses/spider-crab/](https://howtofishgamehelp.com/bosses/spider-crab/) | [src/content/guides/bosses/spider-crab.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/bosses/spider-crab.md) | 未发现本类问题 | 冲锋闪避、输出窗口、逃跑压力和版本差异均为玩家相关内容。 |
| [/bosses/pufferfish/](https://howtofishgamehelp.com/bosses/pufferfish/) | [src/content/guides/bosses/pufferfish.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/bosses/pufferfish.md) | 有最小修改建议 | 战斗和手交步骤保留；多处用不写数值、不推导的作者自述代替玩家提示。 |
| [/bosses/terrorizing-bird/](https://howtofishgamehelp.com/bosses/terrorizing-bird/) | [src/content/guides/bosses/terrorizing-bird.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/bosses/terrorizing-bird.md) | 有最小修改建议 | 只有难度段“avoid invented health thresholds”是编辑口吻。 |
| [/items/early-upgrades/](https://howtofishgamehelp.com/items/early-upgrades/) | [src/content/guides/items/early-upgrades.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/items/early-upgrades.md) | 未发现本类问题 | 刀/指虎来源差异和不通用的排名用于购买选择，无工具取证或审核要求。 |
| [/items/lures-and-bait/](https://howtofishgamehelp.com/items/lures-and-bait/) | [src/content/guides/items/lures-and-bait.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/items/lures-and-bait.md) | 未发现本类问题 | 诱饵分类、任务触发和丢失后恢复规则未知均与玩家决策有关。 |
| [/items/money-fast/](https://howtofishgamehelp.com/items/money-fast/) | [src/content/guides/items/money-fast.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/items/money-fast.md) | 未发现本类问题 | 收入不确定、旧版卖出前持有规则、赌博风险均为玩家信息。 |
| [/items/weapon-progression/](https://howtofishgamehelp.com/items/weapon-progression/) | [src/content/guides/items/weapon-progression.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/items/weapon-progression.md) | 未发现本类问题 | 本轮目标下未见内部采编规则；装备价格未知及坏档保护保留。另记录与新版Piranha页的用词一致性线索。 |
| [/fixes/steam-relay-connection-failed/](https://howtofishgamehelp.com/fixes/steam-relay-connection-failed/) | [src/content/guides/fixes/steam-relay-connection-failed.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/fixes/steam-relay-connection-failed.md) | 有最小修改建议 | 诊断流程服务玩家；适用范围和证据段重复取证方法/本站停止范围。 |
| [/fixes/camera-invert-controls/](https://howtofishgamehelp.com/fixes/camera-invert-controls/) | [src/content/guides/fixes/camera-invert-controls.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/fixes/camera-invert-controls.md) | 未发现本类问题 | 轴向、瞄准保持、外部重映射和图标差异均是功能说明；应保留。 |
| [/fixes/leeches-not-spawning/](https://howtofishgamehelp.com/fixes/leeches-not-spawning/) | [src/content/guides/fixes/leeches-not-spawning.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/fixes/leeches-not-spawning.md) | 有最小修改建议 | description、段落末尾和故障项有对编辑者的计时/表述要求。 |
| [/fixes/multiplayer-black-screen/](https://howtofishgamehelp.com/fixes/multiplayer-black-screen/) | [src/content/guides/fixes/multiplayer-black-screen.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/fixes/multiplayer-black-screen.md) | 有最小修改建议 | 保留 hopefully 和黑屏/隐身区别；删“honest status/avoids claiming”作者口吻。 |
| [/fixes/private-lobby-invites/](https://howtofishgamehelp.com/fixes/private-lobby-invites/) | [src/content/guides/fixes/private-lobby-invites.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/fixes/private-lobby-invites.md) | 未发现本类问题 | 邀请、重启和红色指示均是玩家流程，无审核门槛或取证过程泄露。 |

“未发现本类问题”仅针对内部采编话术，不是新的游戏内实测、全事实认证或跨版本有效性保证。

## 分类和信息页覆盖

| 公开 URL | 文件 | 结果 | 阅读结论 |
|---|---|---|---|
| [/about/](https://howtofishgamehelp.com/about/) | [src/pages/about.astro](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/pages/about.astro) | 有最小修改建议 | 研究方法、非官方身份和来源日期解释属于 About 正常透明说明；仅 build date 内部字段承诺建议删减。 |
| [/contact/](https://howtofishgamehelp.com/contact/) | [src/pages/contact.astro](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/pages/contact.astro) | 有最小修改建议 | 保留公开联系用途和客服能力边界；删 Cloudflare 路由验收与测试邮件声明。 |
| [/disclaimer/](https://howtofishgamehelp.com/disclaimer/) | [src/pages/disclaimer.astro](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/pages/disclaimer.astro) | 未发现本类问题 | 非官方身份、来源日期不等于亲测、商标权利及客服边界与免责声明用途一致。 |
| [/terms/](https://howtofishgamehelp.com/terms/) | [src/pages/terms.astro](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/pages/terms.astro) | 未发现本类问题 | 使用范围、无保证、合理使用及知识产权为本页必要说明；不审查法律有效性。 |
| [/privacy/](https://howtofishgamehelp.com/privacy/) | [src/pages/privacy.astro](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/pages/privacy.astro) | 有最小修改建议 | 当前数据处理、浏览器搜索和服务商披露保留；未来同意控件上线门槛是内部计划。已读启用/停用两分支，不复验线上账号配置。 |
| [/404.html](https://howtofishgamehelp.com/404.html) | [src/pages/404.astro](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/pages/404.astro) | 有最小修改建议 | 故障提示不应向访客解释更强页面合并和证据门槛。实际静态输出为 /404.html。 |
| [/guides/](https://howtofishgamehelp.com/guides/) | [src/config/site.ts](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/config/site.ts) | 有最小修改建议 | 逐句读 start/route/overview/patchNote/caution 和分类描述；发现关键词变体、证据字段、薄内容写作解释。 |
| [/walkthrough/](https://howtofishgamehelp.com/walkthrough/) | [src/config/site.ts](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/config/site.ts) | 有最小修改建议 | 逐句读入口字段；重复实测声明与作者避免阈值说明需要清理。 |
| [/islands/](https://howtofishgamehelp.com/islands/) | [src/config/site.ts](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/config/site.ts) | 有最小修改建议 | 逐句读入口字段；任务/地形对照应留，避免编造名称、近重复页面等策略应删。 |

## 逐项问题与最小改法

以下每项均为实际源码和现有静态输出中存在的文字。原文摘取到足以定位问题的句子或从句；版本与证据身份按基线保留，替换建议尚未应用。

### [/guides/beginner-guide/](https://howtofishgamehelp.com/guides/beginner-guide/)

**HF-COPY-001 · 建议最小修改** — [src/content/guides/guides/beginner-guide.md:50](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/guides/beginner-guide.md:50)

> No first-hand playtest is claimed here.

不适合读者的原因：顶部已保留真实测试状态；正文重复作者声明，打断适用版本说明。

最小改法：删除此句；保留本段 1.0.5 路线、1.0.9 难度变化和顶部测试状态。

**HF-COPY-002 · 建议最小修改** — [src/content/guides/guides/beginner-guide.md:98](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/guides/beginner-guide.md:98)

> This guide therefore treats the quest order as unchanged while marking combat advice as patch-sensitive.

不适合读者的原因：讲解编辑如何标注，而非玩家如何处理版本差异。

最小改法：The lighthouse route still begins with the keeper’s request and trophy hand-in; combat pressure varies with the selected difficulty.

**HF-COPY-003 · 建议最小修改** — [src/content/guides/guides/beginner-guide.md:120](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/guides/beginner-guide.md:120)

> The Steam store supports the high-level progression loop. The independent walkthrough supplies the first-island sequence. The official 1.0.9 announcement supports only the difficulty statements. Source review is not the same as an in-game test, and any undocumented trigger behavior should be treated as uncertain.

不适合读者的原因：整段复述来源分工和取证方法，与来源区及状态卡重复；未指出额外具体未知条件。

最小改法：删除 Evidence boundaries 小节；将必要版本差异留在 Applies to，保留来源列表与顶部测试状态。

### [/guides/difficulty-settings/](https://howtofishgamehelp.com/guides/difficulty-settings/)

**HF-COPY-004 · 建议最小修改** — [src/content/guides/guides/difficulty-settings.md:41](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/guides/difficulty-settings.md:41)

> so this guide does not claim that those systems change.

不适合读者的原因：本句前半的功能未知有用，末尾变为本站写作声明。

最小改法：将整句末尾改为 “their effects on those systems remain unknown.”，保留已明确的健康/伤害百分比。

**HF-COPY-005 · 建议最小修改** — [src/content/guides/guides/difficulty-settings.md:45](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/guides/difficulty-settings.md:45)

> The Steam store supports the broader context that the game combines fishing, combat, quests, bosses, solo play, and online co-op. This page is based on those sources and has not independently compared the modes in-game.

不适合读者的原因：列来源分工并重复测试状态，没有帮助选择难度。

最小改法：删除这两句，保留本段版本、公告日期和数值出处。

**HF-COPY-006 · 建议最小修改** — [src/content/guides/guides/difficulty-settings.md:66](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/guides/difficulty-settings.md:66)

> A guide should therefore use the official percentages without inventing the numbers they modify.

不适合读者的原因：直接给攻略作者的数字写作规则。

最小改法：These percentages do not tell you a boss’s base health or the number of hits your weapon needs.

**HF-COPY-007 · 建议最小修改** — [src/content/guides/guides/difficulty-settings.md:80](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/guides/difficulty-settings.md:80)

> The modifiers also explain why this site avoids universal equipment thresholds. A weapon recommendation based on Normal cannot prove the same fight length on Easy or Hard. Route pages continue to emphasize quest items, movement, recovery, and hand-ins instead of fabricated damage targets.

不适合读者的原因：以网站避开什么、页面强调什么组织解释；实际有用信息是不同模式不能沿用击杀次数。

最小改法：Expect the same weapon to take a different amount of damage or more hits on Hard than on Easy. Keep your selected mode in mind when comparing an older fight guide.

**HF-COPY-008 · 建议最小修改** — [src/content/guides/guides/difficulty-settings.md:86](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/guides/difficulty-settings.md:86)

> If reliable later documentation appears, this page can be revised with a new source-review date.

不适合读者的原因：公开内部维护计划和字段更新流程。

最小改法：删除此句；前文具体未知事项继续保留。

**HF-COPY-009 · 建议最小修改** — [src/content/guides/guides/difficulty-settings.md:93](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/guides/difficulty-settings.md:93)

> Promising better loot or achievements on Hard without official evidence.

不适合读者的原因：Common mistakes 中的动作是作者作承诺，而非玩家操作。

最小改法：Choosing Hard only because you expect better loot or extra achievements.

**HF-COPY-010 · 建议最小修改** — [src/content/guides/guides/difficulty-settings.md:107](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/guides/difficulty-settings.md:107)

> That is an editorial testing suggestion, not a developer-confirmed rule. Do not claim that a joiner’s local selection overrides or inherits the host until an official source or reproducible evidence establishes it.

不适合读者的原因：编辑建议标签及“Do not claim”面向作者；联机设置归属未知应改成玩家事实。

最小改法：Which player’s setting controls a hosted session is unknown. Record the host’s setting and keep the party unchanged when comparing encounters.

**HF-COPY-011 · 建议最小修改** — [src/content/guides/guides/difficulty-settings.md:111](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/guides/difficulty-settings.md:111)

> This page deliberately preserves that boundary and will not translate missing documentation into invented mechanics.

不适合读者的原因：自述不编造内容的采编规则。

最小改法：删除此句，保留具体四项百分比变化及未知事项。

**HF-COPY-012 · 建议最小修改** — [src/content/guides/guides/difficulty-settings.md:137](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/guides/difficulty-settings.md:137)

> The official patch announcement is the authority for every numeric modifier on this page. The Steam store is used only for the game’s high-level solo, co-op, fishing, combat, and progression context. Last source review: August 25, 2026. Evidence reviewed through: patch 1.0.9. Testing status: source-based guide; not independently playtested.

不适合读者的原因：整段是来源使用说明和已在顶部/页尾显示的字段复述。

最小改法：删除该 Evidence boundaries 小节；保留数值表的官方链接及顶部真实日期/版本/测试状态。

### [/guides/what-to-do-after-pufferfish/](https://howtofishgamehelp.com/guides/what-to-do-after-pufferfish/)

**HF-COPY-013 · 建议最小修改** — [src/content/guides/guides/what-to-do-after-pufferfish.md:54](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/guides/what-to-do-after-pufferfish.md:54)

> Community sources vary between calling the item a fin or tail, so this page avoids making the label more certain than the evidence.

不适合读者的原因：名称冲突对玩家有用，但后半是编辑约束。

最小改法：Guides call the drop either a fin or a tail. Look for the distinct object left by Pufferfish and return it to the tourist.

### [/walkthrough/story-walkthrough/](https://howtofishgamehelp.com/walkthrough/story-walkthrough/)

**HF-COPY-014 · 建议最小修改** — [src/content/guides/walkthrough/story-walkthrough.md:50](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/walkthrough/story-walkthrough.md:50)

> The route is source-based and has not been independently playtested by this site. Named conditions that the official patch does not address remain dependent on the cited walkthrough evidence.

不适合读者的原因：顶部已有真实测试状态；此处继续讲来源依赖，不帮助走主线。

最小改法：删除这两句；保留前面的路线版本和难度变化。

**HF-COPY-015 · 建议最小修改** — [src/content/guides/walkthrough/story-walkthrough.md:81](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/walkthrough/story-walkthrough.md:81)

> Patch 1.0.9 difficulty changes mean an old combat-time estimate would not be dependable, so this walkthrough gives no damage or health thresholds.

不适合读者的原因：前半版本提醒有用，后半说明作者不提供什么。

最小改法：Fight length varies with your selected difficulty, so prepare healing rather than relying on an old kill-time estimate.

**HF-COPY-016 · 建议最小修改** — [src/content/guides/walkthrough/story-walkthrough.md:114](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/walkthrough/story-walkthrough.md:114)

> This page preserves its original 1.0.5 route label because that is the evidence range of the walkthrough sequence.

不适合读者的原因：说明内部保留字段的原因。

最小改法：The route below was described in 1.0.5 walkthroughs. 保留下一句 1.0.9 难度变化说明。

**HF-COPY-017 · 建议最小修改** — [src/content/guides/walkthrough/story-walkthrough.md:120](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/walkthrough/story-walkthrough.md:120)

> This guide does not claim that sequence-breaking records progression safely.

不适合读者的原因：回答能否跳岛时使用“本站不声称”，没有直接给玩家结论。

最小改法：Complete the current request and hand-in before following the next route; reaching an island early may leave its quest gate unfinished.

**HF-COPY-018 · 建议最小修改** — [src/content/guides/walkthrough/story-walkthrough.md:128](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/walkthrough/story-walkthrough.md:128)

> Quest changes are therefore not claimed.

不适合读者的原因：把具体未知写成发布声明。

最小改法：Whether difficulty changes quests is unknown.

**HF-COPY-019 · 建议最小修改** — [src/content/guides/walkthrough/story-walkthrough.md:136](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/walkthrough/story-walkthrough.md:136)

> The two independent walkthroughs agree on the five-location order and principal hand-ins. The official 1.0.9 announcement is used only for current difficulty and technical context. Source agreement reduces uncertainty but does not turn the route into first-hand testing.

不适合读者的原因：整段解释采编取证分工并重复实测状态。

最小改法：删除该 Evidence boundaries 小节；原出处和顶部真实测试状态保留。

### [/islands/island-progression/](https://howtofishgamehelp.com/islands/island-progression/)

**HF-COPY-020 · 建议最小修改** — [src/content/guides/islands/island-progression.md:58](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/islands/island-progression.md:58)

> This avoids inventing formal island names.

不适合读者的原因：地形命名的作者自证，对玩家无动作价值。

最小改法：删除此句；保留后续地形名与游戏内目标对照说明。

### [/islands/island-two-leeches/](https://howtofishgamehelp.com/islands/island-two-leeches/)

**HF-COPY-021 · 建议最小修改** — [src/content/guides/islands/island-two-leeches.md:59](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/islands/island-two-leeches.md:59)

> do not invent a respawn timer.

不适合读者的原因：玩家不会编写攻略计时；应直接说明计时未知。

最小改法：A reliable respawn timer is unknown.

### [/bosses/pufferfish/](https://howtofishgamehelp.com/bosses/pufferfish/)

**HF-COPY-022 · 建议最小修改** — [src/content/guides/bosses/pufferfish.md:50](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/bosses/pufferfish.md:50)

> The page retains version 1.0.5 as its route evidence label.

不适合读者的原因：说明内部版本标签的保留行为。

最小改法：The fight route was described in 1.0.5 guides.

**HF-COPY-023 · 建议最小修改** — [src/content/guides/bosses/pufferfish.md:50](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/bosses/pufferfish.md:50)

> This is a source-based guide, not an independently playtested boss report, and it does not claim exact health, damage, or timing values.

不适合读者的原因：重复顶部测试状态并列作者不声称的清单。

最小改法：删除此句；保留前文来源版本和难度会影响伤害/时长的具体限制。

**HF-COPY-024 · 建议最小修改** — [src/content/guides/bosses/pufferfish.md:71](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/bosses/pufferfish.md:71)

> This guide does not prescribe a minimum quantity because the sources do not establish a universal number and difficulty now changes incoming pressure.

不适合读者的原因：以作者不规定什么开头；有用的内容是补给需随难度和失误调整。

最小改法：Prepare cooked healing before using the Carrot; the amount you need depends on your selected difficulty and how often you take damage.

**HF-COPY-025 · 建议最小修改** — [src/content/guides/bosses/pufferfish.md:103](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/bosses/pufferfish.md:103)

> This page uses those numbers only because the developer published them. It does not infer Pufferfish’s base health, exact attacks, or a best difficulty.

不适合读者的原因：解释采编准入和不推导规则。

最小改法：Pufferfish’s base health and an exact number of hits are unknown; choose difficulty for the combat pressure you want.

**HF-COPY-026 · 建议最小修改** — [src/content/guides/bosses/pufferfish.md:113](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/bosses/pufferfish.md:113)

> It does not claim that other weapons cannot work.

不适合读者的原因：以本攻略的声明范围回答玩家武器选择。

最小改法：Other weapons may work, but keep enough space to leave the rolling lane and poison trail.

**HF-COPY-027 · 建议最小修改** — [src/content/guides/bosses/pufferfish.md:117](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/bosses/pufferfish.md:117)

> Inventing a threshold would be less useful than explaining the movement pattern.

不适合读者的原因：评价作者是否编造，不能帮助玩家完成战斗。

最小改法：删除此句；保留上一句基础数值未知与难度影响。

**HF-COPY-028 · 建议最小修改** — [src/content/guides/bosses/pufferfish.md:125](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/bosses/pufferfish.md:125)

> The Destructoid walkthrough supports the desert request and progression sequence. Nerdschalk supplies the focused roll, growth, and purple-trail description. The official patch supplies difficulty modifiers only. Where these sources do not establish a fact, this page leaves it unspecified.

不适合读者的原因：来源分工与留空规则整段重复来源区，没有额外具体未知。

最小改法：删除 Evidence boundaries 小节；来源列表、日期和顶部真实测试状态保留。

### [/bosses/terrorizing-bird/](https://howtofishgamehelp.com/bosses/terrorizing-bird/)

**HF-COPY-029 · 建议最小修改** — [src/content/guides/bosses/terrorizing-bird.md:73](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/bosses/terrorizing-bird.md:73)

> avoid invented health thresholds,

不适合读者的原因：“避免编造”是作者职责；玩家需要知道不能照搬旧战斗时长。

最小改法：删除该插入语；保留 Normal 旧版背景和难度指南链接。

### [/fixes/steam-relay-connection-failed/](https://howtofishgamehelp.com/fixes/steam-relay-connection-failed/)

**HF-COPY-030 · 建议最小修改** — [src/content/guides/fixes/steam-relay-connection-failed.md:45](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/fixes/steam-relay-connection-failed.md:45)

> This page combines those official sources with a conservative isolation workflow; it has not independently reproduced the indicator.

不适合读者的原因：重复顶部真实测试状态并说明作者组合材料的方法。

最小改法：删除此句；保留红色状态含义、公告版本和具体原因未知。

**HF-COPY-031 · 建议最小修改** — [src/content/guides/fixes/steam-relay-connection-failed.md:98](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/fixes/steam-relay-connection-failed.md:98)

> This guide intentionally stops at safe isolation and reporting.

不适合读者的原因：自述作者工作停止点，玩家需要实际下一步。

最小改法：If the same failure repeats, keep the result and send the version, roles, and timing to the developer.

**HF-COPY-032 · 建议最小修改** — [src/content/guides/fixes/steam-relay-connection-failed.md:120](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/fixes/steam-relay-connection-failed.md:120)

> The official 1.0.9 announcement supports the meaning of the red status and the request to report it. Valve’s documentation supports the general description of Steam Datagram Relay. The isolation workflow is editorial guidance designed to preserve security and produce a clearer report. Last source review: August 25, 2026. Testing status: source-based; not independently reproduced.

不适合读者的原因：整段是来源分工、editorial 标签和已显示的复核字段。

最小改法：删除 Evidence boundaries 小节；来源链接和顶部真实测试状态继续保留。

### [/fixes/leeches-not-spawning/](https://howtofishgamehelp.com/fixes/leeches-not-spawning/)

**HF-COPY-033 · 建议最小修改** — [src/content/guides/fixes/leeches-not-spawning.md:3](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/fixes/leeches-not-spawning.md:3)

> Diagnose a missing-leech block on the forest island without inventing a spawn timer, deleting a save, or confusing the ground pickups with fish.

不适合读者的原因：搜索摘要把“不要编造计时”的作者约束写给玩家。

最小改法：Check the forest quest, ground pickup prompts, and three-leech counter before reloading once or reporting missing pickups. Preserve your save.

**HF-COPY-034 · 建议最小修改** — [src/content/guides/fixes/leeches-not-spawning.md:50](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/fixes/leeches-not-spawning.md:50)

> That means the safest troubleshooting page must stay narrow too.

不适合读者的原因：直接讲排障文章必须如何写。

最小改法：删除此句；保留具体重生计时/可靠重置办法未知的信息。

**HF-COPY-035 · 建议最小修改** — [src/content/guides/fixes/leeches-not-spawning.md:58](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/fixes/leeches-not-spawning.md:58)

> that does not repair the affected save and should not be presented as a harmless fix.

不适合读者的原因：前半为玩家事实，后半是作者如何表述。

最小改法：a new run does not repair your original save. Keep the affected copy rather than overwriting it.

### [/fixes/multiplayer-black-screen/](https://howtofishgamehelp.com/fixes/multiplayer-black-screen/)

**HF-COPY-036 · 建议最小修改** — [src/content/guides/fixes/multiplayer-black-screen.md:58](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/fixes/multiplayer-black-screen.md:58)

> which means the honest status is “addressed, but not promised for every setup.”

不适合读者的原因：用编辑者评价“诚实状态”代替直接的修复限制；不应删除官方 hopefully。

最小改法：so some setups may still have the display problem after updating.

**HF-COPY-037 · 建议最小修改** — [src/content/guides/fixes/multiplayer-black-screen.md:80](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/fixes/multiplayer-black-screen.md:80)

> This distinction gives the developer a clearer report and avoids claiming that the newer patch directly fixed the older display issue.

不适合读者的原因：“避免声称”的作者说明；之前几句已经给出玩家可见的症状区别。

最小改法：Record whether the world is black or a player model is missing so the report identifies the failing symptom.

### [/about/](https://howtofishgamehelp.com/about/)

**HF-COPY-038 · 可选精简** — [src/pages/about.astro:16](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/pages/about.astro:16)

> , and a build date is never substituted for either one.

不适合读者的原因：About 的来源/实测日期说明应保留，但 build date 的内部更新约束可省去；这不是否定 About 说明研究方法本身。

最小改法：将本句收尾为 “A source-review date is not an in-game test date.”，其余透明说明不动。

### [/contact/](https://howtofishgamehelp.com/contact/)

**HF-COPY-039 · 建议最小修改** — [src/pages/contact.astro:11](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/pages/contact.astro:11)

> This address is published because the exact public Cloudflare Email Routing rule is configured. End-to-end receipt is a separate manual check; this page does not claim that a test message has been received.

不适合读者的原因：完整暴露配置前提和验收状态；访客只需要联系用途/公开地址，不需要知道上线审核或测试收件流程。

最小改法：删除整段；保留上方公开联系地址与来信应包含的信息。不得补写已收件或保证必达。

### [/privacy/](https://howtofishgamehelp.com/privacy/)

**HF-COPY-040 · 建议最小修改** — [src/pages/privacy.astro:47](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/pages/privacy.astro:47)

> A future consent-management section and footer settings link will be published only after a real Google-certified consent message is live and can reopen its choices.

不适合读者的原因：未来控件实施和发布门槛，不是当前个人数据处理事实；当前没有可更新同意的控件已在前文披露。

最小改法：删除第二句；保留第一句在数据处理方式实质变化时更新政策。现有 Cookie/Consent/搜索/广告披露不变。

### [/404.html](https://howtofishgamehelp.com/404.html)

**HF-COPY-041 · 建议最小修改** — [src/pages/404.astro:5](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/pages/404.astro:5)

> The page may have moved, been merged with a stronger guide, or failed the evidence gate.

不适合读者的原因：把内容合并评分和审核失败写成用户遇到404的解释；“stronger guide/evidence gate”是内部内容策略。

最小改法：The page may have moved, or the address may be incorrect. Search the guides or return home.

### [/guides/](https://howtofishgamehelp.com/guides/)

**HF-COPY-042 · 建议最小修改** — [src/config/site.ts:48](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/config/site.ts:48)

> Each card below states one main problem so the section remains a route, not a list of keyword variations.

不适合读者的原因：直接暴露按关键词变体控制内容的 SEO 策略。

最小改法：删除此句；保留按当前目标选择指南的前文。

**HF-COPY-043 · 建议最小修改** — [src/config/site.ts:49](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/config/site.ts:49)

> Older route pages retain their original evidence label even when their sources were reviewed against the newer patch.

不适合读者的原因：内部版本字段维护说明，不是玩家该如何选择难度。

最小改法：An older walkthrough’s fight length may differ from your selected difficulty.

**HF-COPY-044 · 建议最小修改** — [src/config/site.ts:51](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/config/site.ts:51)

> and keeps each guide useful as a direct answer rather than a thin recap of the same route.

不适合读者的原因：讨论攻略是否“薄”，是编辑质量目标。

最小改法：删该后半句，将前半收为 “This helps you focus on the gate that is blocking your current objective.”

### [/walkthrough/](https://howtofishgamehelp.com/walkthrough/)

**HF-COPY-045 · 建议最小修改** — [src/config/site.ts:64](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/config/site.ts:64)

> None of them should be read as evidence of an independent site playtest.

不适合读者的原因：分类导航末尾重复未实测声明；每个指南已有真实测试状态，读者在此需要选路。

最小改法：删除此句；保留前面的阅读顺序和适用问题。

**HF-COPY-046 · 建议最小修改** — [src/config/site.ts:66](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/config/site.ts:66)

> so this Hub avoids unsupported damage thresholds and keeps route evidence separate from balance.

不适合读者的原因：介绍 Hub 如何写、如何分类证据。

最小改法：将全句改为 “Fight length can differ by mode, so prepare for your selected difficulty while following the quest and hand-in sequence.”

### [/islands/](https://howtofishgamehelp.com/islands/)

**HF-COPY-047 · 建议最小修改** — [src/config/site.ts:74](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/config/site.ts:74)

> The guides avoid universal spawn timers and drop rates where the evidence does not establish them.

不适合读者的原因：泛称网站避免哪些数值，不对应当前岛屿的具体操作。

最小改法：删除此句；具体计时未知保留在对应缺少水蛭页面。

**HF-COPY-048 · 建议最小修改** — [src/config/site.ts:75](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/config/site.ts:75)

> This makes the route useful without pretending that an editorial name is an official map label.

不适合读者的原因：作者自证命名不冒充官方，读者需要的是地形与任务匹配。

最小改法：Match the terrain and active objective if your game uses a different location label.

**HF-COPY-049 · 建议最小修改** — [src/config/site.ts:77](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/config/site.ts:77)

> This order mirrors player decisions instead of creating near-duplicate pages for every wording of an island question.

不适合读者的原因：直接暴露防止按关键词近重复建页的 SEO/编辑规则。

最小改法：删除此句；保留按岛屿阅读的上一段。

## 未渲染的潜在项：不计为当前公开问题

[src/pages/[category]/index.astro:44](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/pages/[category]/index.astro:44)；适用路由为全部七个分类。

> No page in this section has cleared the publishing gate yet. We do not publish thin placeholders just to fill a category.

源码中的空分类分支仍有审核门槛/薄页面说明，但本地现有七分类均有文章，该分支没有渲染；不能计为当前公开页面泄露。

最小改法：将未来空状态改为 “No guides are available in this category yet. Browse another category or search the site.”；本次只登记潜在项。

## 附带一致性线索：与采编话术计数分开

[/items/weapon-progression/](https://howtofishgamehelp.com/items/weapon-progression/) — [src/content/guides/items/weapon-progression.md:71](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/items/weapon-progression.md:71)

> **You run dry on adds:** use melee on small piranhas and save firearm ammunition for the main target.

非采编话术问题：旧页仍用确定式要求对小鱼切近战，与已审阅的 Giant Piranha 页把近战作为有空间时的选项不完全一致。无需重做游戏研究即可提交给总指挥决定是否单独修正。

若总指挥决定处理，最小改法：If small piranhas block your route, clear them with an attack that lets you keep moving; try melee only when there is room to escape.

## 前轮覆盖的 17 页：本次不重复从零审阅

[前轮交接与检查](../content-update-2026-09-08-public-copy-rework.md)已经记录 11 篇正文、首页、4 个分类及搜索页的一句清理。总指挥已确认该范围的读者视角复核通过。此处仅承接覆盖记录。

| URL | 源文件 | 覆盖方式 |
|---|---|---|
| [/achievements/achievement-guide/](https://howtofishgamehelp.com/achievements/achievement-guide/) | [src/content/guides/achievements/achievement-guide.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/achievements/achievement-guide.md) | 前轮逐句修订与复核；详见前轮交接 |
| [/achievements/hardest-achievements/](https://howtofishgamehelp.com/achievements/hardest-achievements/) | [src/content/guides/achievements/hardest-achievements.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/achievements/hardest-achievements.md) | 前轮逐句修订与复核；详见前轮交接 |
| [/achievements/achievement-not-unlocking/](https://howtofishgamehelp.com/achievements/achievement-not-unlocking/) | [src/content/guides/achievements/achievement-not-unlocking.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/achievements/achievement-not-unlocking.md) | 前轮逐句修订与复核；详见前轮交接 |
| [/fixes/steam-cloud-pc-steam-deck-sync/](https://howtofishgamehelp.com/fixes/steam-cloud-pc-steam-deck-sync/) | [src/content/guides/fixes/steam-cloud-pc-steam-deck-sync.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/fixes/steam-cloud-pc-steam-deck-sync.md) | 前轮逐句修订与复核；详见前轮交接 |
| [/fixes/problems-and-fixes/](https://howtofishgamehelp.com/fixes/problems-and-fixes/) | [src/content/guides/fixes/problems-and-fixes.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/fixes/problems-and-fixes.md) | 前轮逐句修订与复核；详见前轮交接 |
| [/fixes/save-file-corrupted-or-weapon-crash/](https://howtofishgamehelp.com/fixes/save-file-corrupted-or-weapon-crash/) | [src/content/guides/fixes/save-file-corrupted-or-weapon-crash.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/fixes/save-file-corrupted-or-weapon-crash.md) | 前轮逐句修订与复核；详见前轮交接 |
| [/bosses/giant-piranha/](https://howtofishgamehelp.com/bosses/giant-piranha/) | [src/content/guides/bosses/giant-piranha.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/bosses/giant-piranha.md) | 前轮逐句修订与复核；详见前轮交接 |
| [/bosses/tuna/](https://howtofishgamehelp.com/bosses/tuna/) | [src/content/guides/bosses/tuna.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/bosses/tuna.md) | 前轮逐句修订与复核；详见前轮交接 |
| [/bosses/mutated-bowhead-whale/](https://howtofishgamehelp.com/bosses/mutated-bowhead-whale/) | [src/content/guides/bosses/mutated-bowhead-whale.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/bosses/mutated-bowhead-whale.md) | 前轮逐句修订与复核；详见前轮交接 |
| [/items/radar-guide/](https://howtofishgamehelp.com/items/radar-guide/) | [src/content/guides/items/radar-guide.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/items/radar-guide.md) | 前轮逐句修订与复核；详见前轮交接 |
| [/items/grilling-guide/](https://howtofishgamehelp.com/items/grilling-guide/) | [src/content/guides/items/grilling-guide.md](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/content/guides/items/grilling-guide.md) | 前轮逐句修订与复核；详见前轮交接 |
| [/bosses/](https://howtofishgamehelp.com/bosses/) | [src/config/site.ts](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/config/site.ts) | 前轮逐句修订与复核；详见前轮交接 |
| [/items/](https://howtofishgamehelp.com/items/) | [src/config/site.ts](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/config/site.ts) | 前轮逐句修订与复核；详见前轮交接 |
| [/achievements/](https://howtofishgamehelp.com/achievements/) | [src/config/site.ts](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/config/site.ts) | 前轮逐句修订与复核；详见前轮交接 |
| [/fixes/](https://howtofishgamehelp.com/fixes/) | [src/config/site.ts](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/config/site.ts) | 前轮逐句修订与复核；详见前轮交接 |
| [/](https://howtofishgamehelp.com/) | [src/pages/index.astro](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/pages/index.astro) | 前轮逐句修订与复核；详见前轮交接 |
| [/search/](https://howtofishgamehelp.com/search/) | [src/pages/search.astro](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/pages/search.astro) | 前轮逐句修订与复核；详见前轮交接 |

## 共享输出和非 HTML 输出

| 文件/输出 | 判断 |
|---|---|
| [src/layouts/GuideLayout.astro](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/layouts/GuideLayout.astro) | 沿用前轮共同来源区处理结果；本轮只确认顶部日期/版本/真实测试状态和来源列表仍存在，不重复审查原11篇正文。 |
| [src/layouts/BaseLayout.astro](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/layouts/BaseLayout.astro) | 只就可见文案确认跳过导航为正常无障碍功能；head/隐私脚本不属本轮SEO技术评分审查。 |
| [src/components/Footer.astro](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/components/Footer.astro) | 网站定位、非官方身份、信息页导航及版权为正常公共说明；evidence-labeled标签本身不是写作限制。 |
| [src/pages/[category]/index.astro](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/pages/[category]/index.astro) | 公共标题、分类、阅读导航正常；空分类内部文案列为未渲染潜在项，不计当前页面问题。 |
| [/rss.xml](https://howtofishgamehelp.com/rss.xml) / [src/pages/rss.xml.ts](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/pages/rss.xml.ts) | RSS 直接采用文章 title/description；缺水蛭页 description 的问题会进入其 RSS 摘要，不是独立新文章问题。 |
| [/robots.txt](https://howtofishgamehelp.com/robots.txt) / [src/pages/robots.txt.ts](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/pages/robots.txt.ts) | 搜索引擎指令输出，不是给玩家的正文。 |
| [/sitemap.xml](https://howtofishgamehelp.com/sitemap.xml) / [src/pages/sitemap.xml.ts](C:/Users/Admin/.codex/worktrees/9352/howtofishgamehelp/src/pages/sitemap.xml.ts) | URL和修改日期输出，不是玩家文案；未提交任何搜索服务。 |

## 下一步与未执行事项

本次建议先按已列出的句子作最小文案清理：优先处理 Contact、404、三个分类中的内部门槛/SEO策略，以及长攻略的写作命令。然后保留具体版本差异，删除重复来源过程。About 的单句删减可以独立选择，不应扩大为删除研究透明说明或隐私披露。

本轮没有修改网站、建立新页、替换框架、改变隐私处理、测试或发布。只有将来获准实施后，才需针对改动重新检查篇幅与内容、生成页/摘要/搜索输出及相关测试。潜在空分类分支和附带的旧装备建议应由总指挥分别决定，不能混进“当前公开泄露已修好”的结论。
