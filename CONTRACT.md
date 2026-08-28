# NeuralFin 原型契约 v2 — 全 App 壳复刻（6 Tab + 个人主页）

目录：`D:\1\DL德林\paopao\neuralfin-prototype\`
目标：把现有「热搜原型」升级为**复刻 NeuralFin 真 App 外观**的完整原型：6 个顶部 Tab（关注/精选/发现/**热搜**/播客/资讯）+ 个人主页覆盖层 + 悬浮泡泡助手。像素级对齐用户提供的 6 张真实截图。纯静态、双击 `index.html` 运行。

## 铁律（v1 全部继承）
1. 兼容 `file://`：禁 ES module，普通 `<script>`；GSAP CDN（gsap+Flip）在 motion.js 之前。
2. 图片一律用 `window.NF_ASSETS.<key>`（assets.js 已内嵌 base64，**Lead 写好，只读**）。禁止外链图片。
3. 只改自己名下文件。中文注释在 .ps1 里会引发编码事故，**PowerShell 脚本内禁用中文**。
4. 深色主题 + 薄荷绿主色，全中文文案（资讯页有英文新闻标题属正常）。

## 文件所有权（v2）
| 文件 | 负责人 | 说明 |
|---|---|---|
| `assets.js` | Lead ✅ | `window.NF_ASSETS`：19 个真实素材 key（见下） |
| `data.js` | Lead ✅ | `window.NF_DATA`：热搜 18 话题+帖子（v1 不变，只读） |
| `feeds.js` | **结构·Claude**（Codex 初版，其下线后移交） | 各 Tab 页面的卡片 mock 数据（引用 NF_ASSETS 的 key） |
| `index.html` | **结构·Claude**（Codex 初版，其下线后移交；审核曾例外授权修复） | 全部结构+样式+内联主脚本 |
| `motion.js` | **动效·GSAP** | 保留泡泡图，新增全局动效（v2.1） |
| `CONTRACT.md` | Lead | 本契约 |

## NF_ASSETS key 清单（19 个）
`logo_n`(金色N圆logo) · `bubble_sprite`(悬浮绿泡泡助手) · 关注页: `cover_anker`(新股速评演播室-安克创新00668) · 精选页: `banner_nbti`(金融NBTI活动banner) `col_daguo`(大国博弈专栏封面) `avatar_daguo`(大国博弈头像) `col_aiglasses`(AI眼镜专栏封面) · 发现页: `cover_shein`(希音) `cover_sanhuan`(三环集团) `cover_mecamand`(梅卡曼德) `cover_zuckerberg`(扎克伯格-德古拉博士) `avatar_dgla`(德古拉博士头像) · 播客页: `podcast_hero`(百年人物录大图) `pod_qian`(钱学森传方图) `pod_mangge`(芒格传方图) `pod_micang`(米仓天下方图) · 主页: `avatar_trends`(NeuralFin Trends金色N头像) `post_meta`(Meta新闻封面) `post_mps`(MPS新闻封面)

## 布局规格（390×844 手机壳，@0.4235 由截图 921px 显示宽换算）
- 状态栏：高 30px，左「10:48」+ 静音图标，右 信号/无线/绿色电池「90」。深色底。
- 顶部导航（高 ~52px）：左 `logo_n` 圆形 36px（点击→打开个人主页覆盖层）；中间 6 个 Tab：关注 精选 发现 **热搜** 播客 资讯，激活项白字 + 底部薄荷绿圆角短横条(~24×3px)，非激活灰字(#8a9088) 15px；右 36px 深灰圆(🔍)。
- 底部导航：胶囊形深灰浮条(圆角全圆，底部悬浮 8px，左右留 10px)：首页(激活白字+房子图标) 行情 | 中央 56px 薄荷绿圆(+) | 自选 交易。图标用内联 SVG 线性风格。
- 悬浮泡泡助手：`bubble_sprite` 64px 圆形，右下角(右16/底96)，所有 Tab 可见，点击有弹性动效（motion.js）。
- 字体栈：`-apple-system,'PingFang SC','Microsoft YaHei',sans-serif`。
- 双列瀑布流卡：列宽 ~186px、列间距 8px、页边距 6px；封面圆角 12px；卡片底色 `--card` 圆角 14px。

## 六个 Tab 页面规格
1. **关注**（截图 24eb）：双列瀑布流视频卡。卡=封面(`cover_anker` 等，高约 240px，右上角 ▶ 小标) + 标题两行(15px 白) + 作者行(20px 圆头像+「新股速评」灰字 + 右侧 ♡ 数字)。未加载封面的卡用 `#101214` 占位+居中 ▶。数据放 feeds.js。
2. **精选**（08ee）：顶部 banner 轮播（`banner_nbti`，圆角 16，高 ~185px，底部右下「开始测试 →」薄荷绿胶囊钮，底部中央 3 个指示点，第 2 个宽椭圆白=激活）→「专栏」标题(20px) → 专栏大卡×2：封面(`col_daguo`/`col_aiglasses` 高 ~210px，右上角 `@大国博弈`/`@神经白噪音` 白字带阴影) + 底部行「标题…共16个内容」(14px, 标题白/计数灰) + 作者行(28px `avatar_daguo` 头像+名+右侧「+ 关注」薄荷绿描边胶囊钮)。
3. **发现**（8f31）：顶部 chips 横滚（全部=深灰胶囊选中，数字资产/投资机会/每日准则/市场洞察=灰字）→ 双列瀑布流（同关注，用 `cover_shein`/`cover_sanhuan`/`cover_mecamand`/`cover_zuckerberg`，标题如「8.27新股速评-希音（0625.HK）」，作者「新股速评」/「德古拉博士」，赞 62/929/…）。chips 点击只做选中态切换即可。
4. **热搜**（本原型已有功能，迁移+换肤）：沿用 v1 契约的 `.nf-seg`(榜单/泡泡切换)、`.nf-chip` 板块筛选、`#nf-leaderboard`、`#nf-bubble-stage`、`#nf-topic-detail` 及全部 `nf:*` 事件。视觉与其他页统一。热搜为第 4 个 Tab（关注/精选/发现/热搜/播客/资讯）。
5. **播客**（450f）：hero 大卡（`podcast_hero` 圆角 16，高 ~290px，底部渐变叠两行标题：主标「百年人物录…」+ 副行灰字「传奇人物只有光鲜的结果吗？让我们直击他们的人…共 4 集」）→ 「精选单集」标题（左侧 3px 薄荷绿竖条）→ 单集行卡×4（左侧 56px 方图(`pod_qian`/`pod_mangge`/`pod_micang`/`pod_qian`) + 标题 15px + 元信息行「昨天 · 👂 0 · 🕐 8分钟」灰字 + 右侧 36px 薄荷绿圆(▶)）。
6. **资讯**（a97b）：子 chips（7*24=白字+绿色下划线选中 / 要闻 / 自选股 / 机构观点 / 新…）→ 日期行（方框「28」+「今天」）→ 时间线列表：每条 = 左侧小圆点(4px 灰) + 内容（`00:27` 蓝色时间(#4f9cf9) + 正文 15px 白，行高 1.6）。用 feeds.js 里的真实新闻内容（SK海力士/新思科技/日本环球影城/富时罗素/Gemini 等）。
7. **个人主页覆盖层**（f7ced，点击左上 logo 打开，返回箭头关闭）：灰蓝渐变头图区(高 ~380px) + `avatar_trends` 80px 圆 + 「NeuralFin Trends」22px + 「Official NeuralFin Account」灰字 → 统计行「11 关注 / 9825 粉丝 / 18.1万 获赞与收藏」+「编辑资料」描边胶囊 → 蓝青渐变积分条(「✦ 170 积分」+「做任务 赚积分 ›」) → 子 Tab(帖子=激活/赞过/收藏/浏览 + 🔍) → 「管理专栏」钮 + 「全部」→ 双列帖子流（`post_meta`/`post_mps` 封面 + 英文标题两行 + N头像「NeuralFin Trends」+ ♡ 191/156）。

## 事件契约（在 v1 基础上新增）
| 事件 | detail | 说明 |
|---|---|---|
| `nf:tab-change` | `{to:'follow'|'featured'|'discover'|'hot'|'podcast'|'news'}` | 顶部 Tab 切换时派发（motion.js 做过渡） |
| `nf:open-profile` / `nf:close-profile` | `{}` | 主页覆盖层开/关 |
| v1 全部保留 | | `nf:view-change`/`nf:filter-change`/`nf:open-topic`/`nf:close-topic`（热搜页内，行为不变） |

`window.NF_APP` 继续暴露 `{ openTopic, renderLeaderboard, renderDetail }`，可增补不删减。

## motion.js 升级要求（动效·GSAP）
1. **保留**：泡泡图全部物理/呼吸/筛选/详情过渡逻辑（DOM id 不变，理论上零改动即可用；若 index.html 重构后 stage 尺寸/显隐方式变化，做最小适配）。
2. Tab 切换过渡：监听 `nf:tab-change`，旧页淡出(-12px 位移)新页淡入，时长 ~0.28s，iOS 手感（power2.out）；首次进入某 Tab 时该页卡片 stagger 入场（瀑布流每列错开）。
3. 悬浮泡泡助手：待机 y 浮动 ±4px（3s 循环）+ 偶发轻转；点击弹性 squash&stretch；`nf:open-profile` 时缩小飞向右上角渐隐，关闭时反向。
4. 精选 banner：自动轮播（5s，位移+指示点联动），拖拽可选做。
5. 播客播放钮：点击波纹+旋转一次性动效。
6. 性能：全部 transform/opacity；离开的 Tab 停掉其 ticker/动画。

## 完成标准
双击 index.html：默认「关注」Tab → 六个 Tab 全部可切、内容对齐截图 → 热搜页榜单↔泡泡、话题详情全通 → 点 logo 开主页 → 悬浮泡泡在所有页可见。控制台零报错。
