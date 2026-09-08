# How to Fish：历史文案、署名与日期整改交接

本轮整改已在本地完成并通过验证，供总指挥复核后按既定顺序上线。未推送、合并主分支、部署或提交搜索引擎；Bing 诊断与提交仍由总指挥负责。

工作副本为 `C:\Users\Admin\.codex\worktrees\9352\howtofishgamehelp`，分支为 `codex/content-update-2026-09-08`。本轮基线是 `9443db998642d1c366b7ce8231dbea62e6c0fb3f`，保留前轮 `97d5d84` 的 1.0.12 内容更新与 `9443db9` 的公开文案返工。自身提交号在提交后单独回报，避免把未产生的哈希写入文件。

## 已完成项

- 历史审计 `HF-COPY-001` 至 `HF-COPY-049` 全部处理，逐条确认原句不再出现在源码和构建后的对应页面。包括 About 可选项，以及 Contact、Privacy、404、三类旧分类页和旧攻略中面向内部作者的说明。
- 未触发的空分类状态改成正常的浏览提示。当前七类均有攻略，因此这项为源码验证，不称为实际触发过的页面状态。
- 武器页的三处相关说明与 Piranha 页对齐：近战仅在有移动、逃离空间时作为选择，避免误读为必须切近战处理小鱼。
- 全站扫描另处理 Relay FAQ 的一句作者口吻，改为直接提醒玩家不要为未确诊的连接故障开放端口。
- 全部 36 篇攻略增加真实站点维护方 `How to Fish Game Help` 的可见署名、About 链接及 `Article.author`。About 明确站点维护关系，没有新增个人作者身份或履历。
- 攻略分别用 `<time datetime>` 显示页面修改日和来源复核日；来源列表也使用机器可读日期。显示日期固定按 UTC，防止构建环境时区使日期偏移。
- 首页使用符合索引入口用途的 `CollectionPage`，标明本次实际编辑日 2026-09-08；可见日期、结构化日期与首页 sitemap lastmod 一致，没有新增虚构首次发布日期。
- 实机检查发现岛屿进度表在 390px 屏幕撑宽正文。原因是手机单列网格默认最小宽度受表格影响；仅改为 `minmax(0, 1fr)`，保留原有表格内部滚动。修复后在 320、390、768px 均无页面横向溢出。

逐项结果见 [checklist.json](checklist.json)，原始证据及原句见 [历史审计](../historical-public-copy-audit-2026-09-08/report.md)。清单中的替换内容用于定位修改；完整上下文以最终源文件及预览为准。

## 来源与日期边界

本轮实际改写旧正文 12 篇：Beginner、Difficulty、After Pufferfish、Story Walkthrough、Island Progression、Island Two Leeches、Pufferfish、Terrorizing Bird、Steam Relay、Leeches Not Spawning、Multiplayer Black Screen、Weapon Progression。它们的 `updatedAt` 改为 2026-09-08。

逐篇与本轮基线比较了全部 36 篇的 `publishedAt`、`lastVerifiedAt`、`lastSourceReview`、`gameVersion`、`evidenceThroughVersion`、`firstHandTested` 及完整来源列表，均未改变。没有把改稿当作新的来源核实或游戏实测。仅共享版式变化的攻略保留原正文修改日。

前轮已核实的 11 篇 1.0.12 相关攻略正文保持原样，包括 Steam Cloud 原设备上传与冲突处理、Handyman 旧版社区方法、Piranha 社区意见差异、Tuna 小幅削弱、最终鲸鱼爆炸伤害的 “should” 限定，以及 Radar/Grilling 的适用范围。本轮没有新增游戏事实或升级这些证据的确定性。详见 [provenance.json](provenance.json)。

## GEO 审查决策

| 项目 | 处理 |
| --- | --- |
| 攻略缺少维护方署名与 author | 已补齐全部 36 篇，并能点击到 About |
| 修改日期与核实日期不够清楚 | 已分别显示、标记，保留真实来源日期 |
| 首页结构化信息 | 增加 CollectionPage 与真实修改日；保留已有 WebSite / Organization / VideoGame |
| 品牌图空 alt | 保留，品牌链接已有可读名称，图标为重复装饰内容 |
| 单语言 / hreflang | 保持英文单语言，没有虚构其他语言版本 |
| 官方外链 | 原有官方 1.0.12 公告链接保留并由检查覆盖 |
| sameAs、llms.txt、首页 Article / FAQ | 没有为检测分数添加缺乏实际依据的内容 |
| 内容字数 | 保留原有检查阈值；岛屿分类补充已有依据的 Spider Crab 掉落换船钥匙步骤，未补凑泛话 |

## 验证结果

- 生产构建成功；类型检查 57 个文件，0 错误、0 警告、0 提示。
- 内容验证：36 篇公开攻略，0 草稿，0 错误、0 警告；原有长文和分类页深度检查保持不变。
- 全套测试 65/65 通过，包括新增全攻略 author、可见署名、修改日 / 核实日对应关系，以及首页类型、日期和不虚构身份信号的检查。
- 51 个 HTML 页面、49 个可索引页面：标题和摘要无重复，canonical 无错误，站内链接检查通过，另外核对 323 个页内锚点。
- RSS 的 36 条摘要逐条匹配源码；sitemap URL 集合与可索引页面完全一致。文档导出已执行。
- 广告就绪检查通过；没有新增或改动广告配置。依赖审计为 0 漏洞；没有新增依赖。
- 真实浏览器检查覆盖 51 页 × 手机 / 桌面，共 102 次页面检查：无宽度溢出、重复 ID 或页面脚本错误。Pagefind 中取回全部 36 篇攻略内容，未检出已清理的内部话术。
- 实际搜索 Steam Cloud 得到 4 个结果，能够打开指南；维护方署名能够打开 About；手机菜单能够进入 Islands。进度表在三种宽度下能在表格内横向查看。

浏览器逐页记录见 [browser.json](browser.json)，交互记录见 [interactions.json](interactions.json)，其余验证摘要见 [verification.json](verification.json)。截图已经人工查看，包括 [手机署名与日期](difficulty-mobile.png)、[首页](home-desktop.png)、[公开联系页](contact-mobile.png)、[来源区](cloud-sources-mobile.png)、[搜索结果](search-mobile.png) 和 [表格横向查看](progression-table-mobile.png)。

## 预览与待上线范围

- 本地首页：<http://127.0.0.1:4327/>
- 日期区别示例：<http://127.0.0.1:4327/guides/difficulty-settings/>
- 既有补丁更新示例：<http://127.0.0.1:4327/fixes/steam-cloud-pc-steam-deck-sync/>
- 公开联系页：<http://127.0.0.1:4327/contact/>

[changed-urls.json](changed-urls.json) 列出相对远端生产基线 `2f3eaa9` 的累计待上线范围：49 个受影响 HTML URL，其中 47 个可索引，另有搜索页与 404；sitemap、RSS 单独列为生成资源。这不是已提交 Bing / IndexNow 的 URL 记录。

本地预览没有注入生产广告和分析配置，不能代替正式环境回读。后续由总指挥复核提交并安排生产发布，再核对公开 HTML、结构化信息、1.0.12 内容、搜索资源和发布工作流结果。当前提交不包含账号、DNS、认证、robots、IndexNow 或其他部署配置修改。
