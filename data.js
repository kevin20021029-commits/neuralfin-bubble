/* ============================================================
 * NeuralFin 热搜原型 — 真实金融新闻话题数据
 * 数据来源（2026-08 检索）：新浪财经 / 证券时报 / 财联社 /
 * Yahoo Finance / CNBC / Reuters / Investing.com 综合整理
 * 热度值为原型演示用的模拟排名权重
 * ============================================================ */
window.NF_META = {
  updatedAt: '2026-08-28 09:45',
  source: '热度综合自新浪财经 · 证券时报 · Yahoo Finance · CNBC · Reuters'
};

/* 徽章: bo=爆 hot=热 new=new up=升 down=降
 * 板块: macro=宏观 us=美股 hk=港股 crypto=加密 com=商品 */
window.NF_DATA = {
  topics: [
    {
      id: 't01', rank: 1, sector: 'macro', badge: 'bo', heat: 4892341,
      title: '美联储宣布降息25个基点 年内第三次',
      brief: 'FOMC一致预期落地，点阵图暗示2026年仅再降一次，鲍威尔发布会强调依赖数据',
      posts: [
        { a: '德古拉博士', hue: 265, t: '28分钟前', type: 'video', title: '美联储降息25bp：这次是真的"鹰派降息"吗？', body: '点阵图比决议本身重要，2026只剩一次降息的暗示才是市场真正要消化的。', likes: 3287, cmts: 412, ticker: { code: 'SPX', name: '标普500', chg: '+0.82%' } },
        { a: '宏观老王', hue: 205, t: '1小时前', type: 'text', title: '降息后港股弹性大于A股，这是历史规律', body: '联系汇率下香港跟随降息，利率敏感的成长股最先受益，生物科技、科技硬件优先。', likes: 1562, cmts: 203 },
        { a: '玛丽姐聊美股', hue: 320, t: '2小时前', type: 'image', title: '一张图看懂本次FOMC：哪些资产受益', body: '降息落地≠流动性狂欢，美债发行压力和油价是两朵乌云。', likes: 2418, cmts: 305 }
      ]
    },
    {
      id: 't02', rank: 2, sector: 'us', badge: 'hot', heat: 4213877,
      title: '英伟达财报超预期 单日暴涨8.7%市值破5.5万亿',
      brief: 'Q2营收962亿美元环比+18%，单日市值增加约4415亿美元创纪录',
      posts: [
        { a: 'AI算力情报局', hue: 150, t: '40分钟前', type: 'video', title: '英伟达这份财报，直接把"AI交易动摇"论打碎了', body: '营收962亿美元，指引超预期，盘后一度涨近9%，单日市值增加4415亿美元。', likes: 5120, cmts: 733, ticker: { code: 'NVDA', name: '英伟达', chg: '+8.74%' } },
        { a: '玛丽姐聊美股', hue: 320, t: '1小时前', type: 'text', title: 'NVDA暴涨背后：标普涨幅的一半靠两只AI股', body: '集中度才是最大的风险，涨得越猛这个问题越尖锐。', likes: 2874, cmts: 388, ticker: { code: 'NVDA', name: '英伟达', chg: '+8.74%' } },
        { a: '量化小龙', hue: 30, t: '2小时前', type: 'text', title: '期权市场已定价财报后±9%波动，结果贴着上限走', body: '轧空+业绩双击，短线追高注意226-228美元一带的获利盘。', likes: 1980, cmts: 254 }
      ]
    },
    {
      id: 't03', rank: 3, sector: 'hk', badge: 'new', heat: 3884102,
      title: '港股打新狂热：翼菲科技超购14855倍创纪录',
      brief: '港股主板首只超万倍认购新股，年内超购千倍新股已达18只',
      posts: [
        { a: '港股打新日记', hue: 165, t: '35分钟前', type: 'video', title: '14855倍！港股"超购王"诞生，甲组乙组全挤爆', body: '公开发售认购倍数刷新港股纪录，冻资规模同比创历史新高。', likes: 4432, cmts: 596 },
        { a: '新股速评', hue: 175, t: '1小时前', type: 'text', title: '为什么港股打新突然这么赚钱？', body: '新股赚钱效应回归：超1000倍认购的新股18只，其中5只突破5000倍。', likes: 2211, cmts: 342 },
        { a: '量化小龙', hue: 30, t: '3小时前', type: 'text', title: '超购倍数≠首日涨幅，但中签率已经卷疯了', body: '一手中签率跌破1%，孖展利率跟着起飞。', likes: 1467, cmts: 198 }
      ]
    },
    {
      id: 't04', rank: 4, sector: 'us', badge: 'up', heat: 3506238,
      title: 'AI集中度警报：两只AI股撑起标普年内涨幅一半',
      brief: '美银指S&P 500年内约9.8%涨幅中近半来自两只AI相关个股',
      posts: [
        { a: '德古拉博士', hue: 265, t: '1小时前', type: 'text', title: '指数在涨，市场在窄：这不是牛市该有的样子', body: '广度指标持续背离，一旦AI叙事出现裂缝，指数会非常脆弱。', likes: 2764, cmts: 401 },
        { a: '玛丽姐聊美股', hue: 320, t: '4小时前', type: 'image', title: '美股"七雄"权重变化：集中度已达历史极值', body: '前两大成分股权重合计接近历史最高纪录。', likes: 1893, cmts: 227 }
      ]
    },
    {
      id: 't05', rank: 5, sector: 'us', badge: 'up', heat: 3215483,
      title: '科技巨头财报周：微软Meta苹果亚马逊登场',
      brief: '四家巨头同周放榜，AI资本开支指引成全场唯一焦点',
      posts: [
        { a: 'AI算力情报局', hue: 150, t: '2小时前', type: 'video', title: '财报周前瞻：市场只问一个问题——AI capex还加吗？', body: '微软与Meta的资本开支指引将决定整个AI基建链条的估值锚。', likes: 3345, cmts: 452, ticker: { code: 'MSFT', name: '微软', chg: '+1.12%' } },
        { a: '宏观老王', hue: 205, t: '5小时前', type: 'text', title: '巨头财报周遇上FOMC周，波动率想不涨都难', body: '仓位轻的才是赢家，别在结果公布前赌方向。', likes: 1732, cmts: 215 }
      ]
    },
    {
      id: 't06', rank: 6, sector: 'hk', badge: 'hot', heat: 3003922,
      title: 'SHEIN港股上市 逾25万人认购',
      brief: '招股价约48.56港元，认购人数超25万，首日表现成情绪风向标',
      posts: [
        { a: '新股速评', hue: 175, t: '1小时前', type: 'video', title: '8.27新股速评：希音（0625.HK）', body: '快时尚跨境龙头赴港第二上市，25万人认购背后，定价贵不贵？', likes: 3021, cmts: 428, ticker: { code: '0625.HK', name: '希音', chg: '+3.41%' } },
        { a: '港股打新日记', hue: 165, t: '2小时前', type: 'text', title: 'SHEIN暗盘表现复盘：一手账面赚多少？', body: '暗盘高开，乙组头锤热度不减，关注首日流通盘消化。', likes: 1654, cmts: 236 }
      ]
    },
    {
      id: 't07', rank: 7, sector: 'com', badge: 'up', heat: 2876441,
      title: '黄金逼近4600美元 机构上看5000',
      brief: '金价在4590美元附近震荡，通胀数据符合预期后小幅回吐，多家投行维持看多',
      posts: [
        { a: '黄金眼观察', hue: 45, t: '1小时前', type: 'text', title: '金价4590：回调就是上车的机会吗？', body: '央行购金+降息周期双轮驱动，投行目标价已上看5000美元。', likes: 2098, cmts: 287, ticker: { code: 'XAUUSD', name: '现货黄金', chg: '+1.05%' } },
        { a: '宏观老王', hue: 205, t: '6小时前', type: 'image', title: '黄金vs美债实际利率：这轮为什么脱钩了', body: '去美元化配置需求在定价，实际利率的解释力在下降。', likes: 1522, cmts: 190 }
      ]
    },
    {
      id: 't08', rank: 8, sector: 'crypto', badge: 'up', heat: 2544310,
      title: '比特币ETF资金回流 迎一年来最佳月份',
      brief: '现货比特币ETF有望创2025年10月以来最佳单月表现，IBIT规模达473亿美元',
      posts: [
        { a: '币圈航海家', hue: 25, t: '50分钟前', type: 'text', title: 'ETF资金转正：比特币的机构叙事又回来了', body: '此前八周净流出82亿美元，本月资金面全面翻多，IBIT一家独大到473亿。', likes: 2467, cmts: 379, ticker: { code: 'BTC', name: '比特币', chg: '+2.31%' } },
        { a: '量化小龙', hue: 30, t: '3小时前', type: 'text', title: '66000-78000区间震荡，关键看ETF申赎数据', body: '价格跟着资金流走，别猜顶底，跟流量。', likes: 1341, cmts: 176 }
      ]
    },
    {
      id: 't09', rank: 9, sector: 'us', badge: 'new', heat: 2301765,
      title: '小盘股悄然跑赢大型科技股 数年来首次',
      brief: '罗素2000相对纳指走出超额收益，资金轮动信号明确但策略师提示波动',
      posts: [
        { a: '玛丽姐聊美股', hue: 320, t: '2小时前', type: 'video', title: '小盘股的安静复兴：轮动还是陷阱？', body: '数年来首次跑赢大盘科技股，但若降息不及预期，弹性会反噬。', likes: 1876, cmts: 241, ticker: { code: 'IWM', name: '罗素2000ETF', chg: '+1.87%' } },
        { a: '宏观老王', hue: 205, t: '7小时前', type: 'text', title: '轮动的两个前提：降息兑现+盈利扩散', body: '目前只满足了第一个，第二个还在验证。', likes: 1123, cmts: 158 }
      ]
    },
    {
      id: 't10', rank: 10, sector: 'hk', badge: 'new', heat: 2187004,
      title: '梅卡曼德机器人招股 AI机器人第一股？',
      brief: '招股价95.30-101.70港元，AI+机器人赛道热度加持，孖展认购踊跃',
      posts: [
        { a: '新股速评', hue: 175, t: '3小时前', type: 'video', title: '8.27新股速评：梅卡曼德机器人（9615.HK）', body: '工业AI+机器人第一股，估值对标海外稀缺标的，打不打？', likes: 2311, cmts: 367, ticker: { code: '9615.HK', name: '梅卡曼德', chg: '待上市' } },
        { a: '港股打新日记', hue: 165, t: '4小时前', type: 'text', title: '梅卡曼德孖展首日即超购，乙组在抢筹码', body: '赛道稀缺性+AI叙事，机构参与度明显高于均值。', likes: 1298, cmts: 173 }
      ]
    },
    {
      id: 't11', rank: 11, sector: 'hk', badge: 'new', heat: 2066548,
      title: 'MiniMax赴港招股 AI大模型上市潮加速',
      brief: '国产大模型第一梯队登陆港股（0100.HK），AI应用估值锚受关注',
      posts: [
        { a: 'AI算力情报局', hue: 150, t: '2小时前', type: 'text', title: 'MiniMax上市：AI大模型的商业化成绩单首次公开晒分', body: '模型能力之外，市场更关心收入结构与推理成本曲线。', likes: 1987, cmts: 298, ticker: { code: '0100.HK', name: 'MINIMAX-W', chg: '待上市' } },
        { a: '德古拉博士', hue: 265, t: '8小时前', type: 'text', title: '从SHEIN到MiniMax：港股正在成为AI资产定价中心', body: 'IPO结构变了，科技与新消费占了主导。', likes: 1455, cmts: 221 }
      ]
    },
    {
      id: 't12', rank: 12, sector: 'macro', badge: 'up', heat: 1952336,
      title: '美联储重启短期美债购买 宽松信号再强化',
      brief: '纽约联储恢复短债购买操作，市场解读为储备管理式宽松',
      posts: [
        { a: '宏观老王', hue: 205, t: '5小时前', type: 'text', title: '买短债≠QE，但方向上的信号已经很明确', body: '储备充足性管理先行，真正的扩表讨论还在后面。', likes: 1654, cmts: 208 },
        { a: '量化小龙', hue: 30, t: '9小时前', type: 'text', title: '回购市场压力测试：短债购买是止痛药', body: '货币市场利率的粘性说明流动性分层已经出现。', likes: 987, cmts: 121 }
      ]
    },
    {
      id: 't13', rank: 13, sector: 'com', badge: 'down', heat: 1804992,
      title: '油价连跌两周 地缘溢价仍未散去',
      brief: '供应担忧缓解油价走低，但伊朗相关头条仍带来间歇性上冲',
      posts: [
        { a: '黄金眼观察', hue: 45, t: '4小时前', type: 'text', title: '油价两连跌：地缘溢价在滴漏', body: '基本面回归定价，但任何供应中断头条都能把波动率打起来。', likes: 1233, cmts: 154, ticker: { code: 'CL', name: 'WTI原油', chg: '-1.24%' } },
        { a: '宏观老王', hue: 205, t: '10小时前', type: 'text', title: '油价是美联储最不想看到的变量', body: '能源价格粘性会拖慢通胀回落，进而影响降息节奏。', likes: 1088, cmts: 139 }
      ]
    },
    {
      id: 't14', rank: 14, sector: 'hk', badge: 'up', heat: 1743208,
      title: 'A股公司赴港上市潮：绿联科技浙江荣泰递表',
      brief: '绿联科技（华泰国际保荐）、浙江荣泰（中信证券保荐）递交港股上市申请',
      posts: [
        { a: '新股速评', hue: 175, t: '6小时前', type: 'text', title: 'A+H上市清单又加两家：为什么优质A股都在去港股', body: '出海融资+国际化定价，A+H成为龙头标配。', likes: 1432, cmts: 187 },
        { a: '港股打新日记', hue: 165, t: '12小时前', type: 'text', title: '递表潮=未来半年打新日历，先收藏', body: '排队名单越排越长，打新资金要开始排班了。', likes: 976, cmts: 118 }
      ]
    },
    {
      id: 't15', rank: 15, sector: 'hk', badge: 'up', heat: 1655073,
      title: '中金：降息周期港股弹性大于A股 增配成长',
      brief: '利率敏感型成长股（生物科技、科技硬件）与高海外融资占比板块优先受益',
      posts: [
        { a: '德古拉博士', hue: 265, t: '7小时前', type: 'image', title: '一图看懂：为什么港股对降息更敏感', body: '联系汇率+外资定价权，流动性传导路径比A股短。', likes: 1345, cmts: 176 },
        { a: '宏观老王', hue: 205, t: '13小时前', type: 'text', title: '历史复盘：降息后6个月港股胜率仍在五成以上', body: '但收益会逐渐衰减，启动阶段弹性最肥。', likes: 1023, cmts: 130 }
      ]
    },
    {
      id: 't16', rank: 16, sector: 'us', badge: 'down', heat: 1577815,
      title: '纳指冲高回落 "AI交易动摇"争论升温',
      brief: '纳指收于26729点，周线小涨但盘中波动加剧，多空围绕AI叙事激烈交锋',
      posts: [
        { a: '玛丽姐聊美股', hue: 320, t: '3小时前', type: 'video', title: '"AI交易正在瓦解"？先看这三个证据', body: '集中度、capex回报周期、流动性的三角关系决定成败。', likes: 1678, cmts: 245, ticker: { code: 'QQQ', name: '纳指100ETF', chg: '-0.47%' } },
        { a: '量化小龙', hue: 30, t: '14小时前', type: 'text', title: '波动率曲线上翘：市场在为财报周买保险', body: 'VIX期限结构倒挂，短期对冲成本不便宜。', likes: 934, cmts: 112 }
      ]
    },
    {
      id: 't17', rank: 17, sector: 'macro', badge: 'up', heat: 1462390,
      title: '人民币走强 兑美元升破关键关口',
      brief: '降息落地叠加出口结汇需求，人民币汇率走强提振风险偏好',
      posts: [
        { a: '宏观老王', hue: 205, t: '8小时前', type: 'text', title: '人民币升值的三层驱动：利差、结汇、风险偏好', body: '美联储降息打开空间，出口商集中结汇放大波幅。', likes: 1287, cmts: 163, ticker: { code: 'USDCNH', name: '离岸人民币', chg: '-0.35%' } },
        { a: '德古拉博士', hue: 265, t: '15小时前', type: 'text', title: '强人民币利好哪些资产？北向偏好先行', body: '核心资产与港股成长的联动逻辑最顺。', likes: 912, cmts: 104 }
      ]
    },
    {
      id: 't18', rank: 18, sector: 'hk', badge: 'hot', heat: 1388446,
      title: '老铺黄金神话：上市两年最高涨约24倍',
      brief: 'IPO价40.5港元最高冲至1015港元，港股新股赚钱效应样本被反复研究',
      posts: [
        { a: '港股打新日记', hue: 165, t: '9小时前', type: 'image', title: '复盘老铺黄金：从40.5到1015港元的路线图', body: '基本面+稀缺性+流动性共振，港股打新史上的现象级案例。', likes: 1756, cmts: 289 },
        { a: '新股速评', hue: 175, t: '16小时前', type: 'text', title: '老铺黄金之后，谁最可能成为下一个"超购王"？', body: '看赛道稀缺性、定价克制度和基石质量。', likes: 1054, cmts: 141 }
      ]
    }
  ]
};
