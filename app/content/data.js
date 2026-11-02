/* 共用内容：明早改文字、价格、示例改这里，不用动结构。
   所有价格、限额、险种、时间都是假设，页面上已标出；所有姓名、地址、取件码都是虚构示例。 */
window.CONTENT = {
  name: '顺手帮',
  nameNote: '暂定名',
  /* 第一屏的一句话，本人还会再改 */
  oneLine: '外卖有人兜底，快递代取丢了没人管，平台把这个责任接过来。',
  sample: '示例，信息已替换',

  /* ———— 总：审题 ————
     题面里 [[键|文字]] 是落笔的地方；插入符没有文字，写成 [[键|]]。
     marks 按落笔顺序：pen 是笔法（circle 红圈是痛点，strike 删除线是边界，caret 插入符是题目没写、我们补上的）；
     note 是批注；grow 是这一笔让右边长出哪一行。 */
  brief: {
    paperTitle: '校园跑腿互助平台',
    paper: [
      '背景：大学校园内常有[[a|代取快递]]、代买物品、[[s|代占座]]等跑腿需求，但缺乏一个可信的校内互助平台。',
      '任务：使用 AI Coding 工具，设计一个「校园跑腿互助平台」，让[[i|]]学生可以[[c|发布任务]]、[[b|接单跑腿]]、积累信用。',
      '建议：可结合你了解到的用户痛点或需求，自由设计产品。不必追求技术细节，优先呈现产品结构和功能设计即可。'
    ],
    marks: [
      { k: 'a', pen: 'circle', note: '丢失追责问题', grow: 'p0' },
      { k: 'b', pen: 'circle', note: '单价太低', grow: 'p1' },
      { k: 'c', pen: 'circle', note: '广场发单，有隐私隐患', grow: 'p2' },
      { k: 'i', pen: 'caret', note: '本校实名', grow: 's0' },
      { k: 's', pen: 'strike', note: '代排队', grow: 's1' }
    ],
    margin: '题目没写但一定会来：代考、代打卡，不做',
    marginGrow: 's2',
    skip: '跳过审题',
    painTitle: '痛点 → 解法',
    pains: [
      { id: 'p0', pain: '丢失追责问题', name: '代取闭环', how: '实名、分段留证、平台先赔', go: 'claim' },
      { id: 'p1', pain: '单价太低', name: '抢一批', how: '同站同区打包，少跑很多趟', go: 'compare' },
      { id: 'p2', pain: '有隐私隐患', name: 'AI 打码', how: '解析成清单，大厅只露脱敏信息', go: 'post' }
    ],
    scopeTitle: 'Scope',
    scope: [
      { id: 's0', k: '做', t: '快递代取全流程、丢件索赔、保险、聊天、圈子' },
      { id: 's1', k: '不做', t: '代考、代打卡、代占座' },
      { id: 's2', k: '只写方案', t: '外卖派单、代搬运等拓展场景' }
    ],
    researchLine: '调研：约 16:36 开始，16:51 写完第一轮 4 份，22:40 前后累计 8 份',
    researchLink: '看依据和链接',
    ctaAuto: '按顺序看演示',
    ctaAutoNote: '自动走完，不到 1 分 30 秒',
    ctaFree: '自己点着看'
  },

  /* ———— 人物和地点（虚构） ———— */
  who: {
    L: { name: '小林', role: '发单同学' },
    R: { name: '小周', role: '接单同学' }
  },
  station: '北园菜鸟驿站',
  area: '北区 3 号楼一带',
  room: '北区 3 号楼 A101',

  /* ———— 首页讲解：演示第一步，框一个说一个 ————
     boxes 是手机里框哪些元素；heavy 是重点；enter 是点进去去哪（step 是某一步，screen 是这台手机切到某界面） */
  homeGuide: {
    eyebrow: '首页',
    title: '这些是大学生需要的功能',
    tags: { common: '常见功能', focus: '校园重点', new: '我们新增' },
    items: [
      { name: '跑腿、代取快递', tag: 'common', text: '常规操作，大家都熟。', boxes: ['.svc:nth-child(1)', '.svc:nth-child(4)'] },
      { name: '代排队', tag: 'focus', heavy: true, text: '真人到场，到点交接，代替代占座。', boxes: ['.svc:nth-child(5)'] },
      { name: '代办事、校园手续代办', tag: 'focus', heavy: true, text: '比如同学在外实习，学校有手续没办也不用担心，可以找人代办。', small: '只走学校认可的委托流程。', boxes: ['.svc:nth-child(6)'] },
      { name: '圈子', tag: 'common', text: '加了论坛，大家可以发帖交流。', boxes: ['.weui-tabbar__item:nth-child(3)'], enter: { step: 'circle' }, enterLabel: '进去看看' },
      { name: '我的', tag: 'new', text: '加了信用分。', boxes: ['.weui-tabbar__item:nth-child(4)'], enter: { screen: 'me' }, enterLabel: '进去看看' }
    ]
  },

  /* ———— 服务宫格 ———— */
  services: [
    { k: 'parcel', t: '代取快递', full: true },
    { k: 'move', t: '代搬运', hint: '行李、教材，按量出价' },
    { k: 'send', t: '代送东西', hint: '校内点到点' },
    { k: 'run', t: '代跑腿', hint: '代买、代拿' },
    { k: 'queue', t: '代排队 / 代办事', hint: '真人到场、到点交接，不放东西占位' },
    { k: 'paper', t: '校园手续代办', hint: '盖章、交材料；本人证件不代持' }
  ],

  /* ———— 发单 ———— */
  screenshotRows: 7,
  parcels: [
    { id: 1, owner: '小林', room: '3 号楼 A101', name: '圆领长袖 T 恤', co: '韵达', spec: '小', code: '2-4-6001' },
    { id: 2, owner: '小林', room: '3 号楼 A101', name: '连帽卫衣', co: '韵达', spec: '中', code: '4-1-6002' },
    { id: 3, owner: '小林', room: '3 号楼 A101', name: '二手手机', co: '中通', spec: '贵重', code: '12345', precious: true, card: true },
    { id: 4, owner: '小吴', room: '3 号楼 B204', name: '美妆用品', co: '申通', spec: '迷你', code: '9-2-7011' },
    { id: 5, owner: '小陈', room: '3 号楼 C310', name: '长袖上衣', co: '中通', spec: '小', code: '7-1-7012' }
  ],
  specs: [
    { k: '迷你', d: '信封、小盒', fee: 2 },
    { k: '小', d: '书本大小', fee: 2 },
    { k: '中', d: '鞋盒大小', fee: 3 },
    { k: '大', d: '要两手搬', fee: 5 }
  ],
  precious: { k: '贵重档', d: '手机、电脑，必须当面交接', fee: 4 },
  insurance: { fee: 1, limit: '¥500', name: '校园小件货损险', tag: '第三方承保 · 自愿', off: '想买就买，不买也能发布', on: '已选，出事走保险理赔', note: '金额和限额都是假设，实际由持牌保险机构承保和收费' },
  priceNote: '价格、保费和险种都是假设。',
  orderDefault: { specs: { '小': 1, '中': 1 }, precious: 1, insured: 0 },

  /* 官方代取卡：字段依据本人实测的分享卡，内容是虚构示例 */
  shareCard: {
    from: '小林的包裹',
    station: '校内北园店',
    shelf: '货架码 C-12-306',
    waybill: '中通 7800 0000 0000 00',
    tail: '手机尾号 ****',
    hidden: '官方已隐藏商品信息'
  },

  /* ———— 批次 ———— */
  batch: { id: '批 #0317', items: 5, people: 3, fee: 13, base: 3, per: 2, need: 80, feeNote: '底价 ¥3 + 每件 ¥2（假设）' },
  otherBatches: [
    { id: '批 #0316', from: '东门驿站', to: '南区 7 号楼一带', items: 3, people: 2, fee: 9, need: 60 },
    { id: '批 #0319', from: '北园驿站', to: '北区 5 号楼一带', items: 8, people: 5, fee: 19, need: 85 }
  ],
  publicFields: ['驿站', '楼栋区域', '件数和规格', '酬金'],
  privateFields: ['取件码', '门牌', '手机号', '商品'],
  focusOthers: '别人看到的',
  focusAfter: '抢到后才能看到的',

  /* ———— 对比 ———— */
  compare: {
    title: '同样 5 件，一件一跑是 5 趟，抢一批是 1 趟',
    axisMin: 75,
    one: { name: '一件一跑', trips: 5, minutes: 75, pay: 13, hour: 10 },
    batch: { name: '抢一批', trips: 1, minutes: 25, pay: 13, hour: 31 },
    saved: '省下 4 趟、50 分钟',
    note: '数字都是假设：单趟往返约 15 分钟；一批取齐加分送约 25 分钟；酬金按规格价合计。',
    plain: '同一驿站、同一区域的件，本来就可以一起带。酬金不变，接单人更划算，发单人也不用加价。'
  },

  /* ———— 信用 ———— */
  credit: { before: 82, after: 85, capBefore: 6, capAfter: 8 },
  creditTiers: [
    { need: 60, cap: '3 件以内' },
    { need: 80, cap: '6 件以内，可接贵重件' },
    { need: 85, cap: '8 件以内' }
  ],

  /* ———— 时间线（示例时间） ———— */
  timeline: [
    { k: '接单', t: '13:52', d: '小周抢到本批' },
    { k: '到站', t: '14:01', d: '到北园驿站' },
    { k: '取件', t: '14:06', d: '5 件取齐，拍照留证' },
    { k: '配送', t: '14:09', d: '前往北区 3 号楼' },
    { k: '交付', t: '14:18', d: '当面确认，手机当面交接' }
  ],

  /* ———— 聊天（L 是小林，R 是小周） ———— */
  chat: [
    { from: 'L', t: '你好，这批里的手机麻烦当面给我～' },
    { from: 'R', t: '收到。我到驿站了，先取。' },
    { card: 'insure' },
    { from: 'R', t: '5 件取齐了，照片已经传了。' },
    { from: 'L', t: '好的，我 10 分钟后在楼下。' },
    { from: 'R', t: '到 3 号楼了，马上到。' }
  ],
  insureCardNo: { title: '这批含贵重件，没有买保险', body: '保险是自愿的。手机仍要当面交接，出事按平台限额赔（假设）。', foot: '保险实际由持牌保险机构承保和收费' },
  chatFallback: { L: '好的，谢谢～', R: '好的，马上到。' },
  insureCard: { title: '这批含贵重件，小林买了保险', body: '第三方承保，保费 ¥1，最高赔 ¥500（都是假设）。手机当面交接，出事走保险理赔。', foot: '实际由持牌保险机构承保和收费' },

  /* ———— 丢件索赔 ———— */
  claim: {
    tag: '演示动画，展示判断顺序，不是模型在实时运行',
    chain: [
      { k: '查取件记录和证据', d: '14:06 五件都有出库记录，小周上传了取件照片', ok: '取件记录齐全' },
      { k: '看驿站方信息', d: '驿站确认五件已被小周取走，站内没有遗留', ok: '问题不在驿站' },
      { k: '看照片', d: '取件照片里能看到卫衣，交付时没有当面确认记录', ok: '丢在取件之后、交付之前' },
      { k: '综合判断', d: '责任落在取件到交付这一段', ok: '接单同学负责' }
    ],
    cases: {
      normal: { tab: '普通件：连帽卫衣', verdict: '限额内平台先赔', lines: ['平台先赔 ¥89 给小林（限额 ¥200，假设）', '再向小周追偿，小周信用扣分', '赔钱前人工确认一次'], short: '平台先赔 ¥89' },
      precious: { tab: '贵重件：买了保险', verdict: '买了保险，走保险理赔', lines: ['走保险公司理赔，最高 ¥500（假设）', '平台提供取件记录和照片', '没买保险的，按平台限额赔（假设）', '实际由持牌保险机构承保和收费'], short: '走保险理赔' }
    }
  },

  /* ———— 圈子 ———— */
  circle: {
    tabs: ['全部', '表白墙', '校园问答', '失物招领'],
    notice: '代考、代打卡等内容禁止发布，发现即删帖封号',
    posts: [
      { tab: '表白墙', who: '匿名同学', c: '#7fb8a4', time: '10 分钟前', text: '谢谢昨天帮我带快递的同学，下雨天还送到楼下。今天的奶茶我请！', likes: 28, cm: 6 },
      { tab: '校园问答', who: '小吴', c: '#8fa6d6', time: '1 小时前', text: '截图发出去会不会被别人看到取件码？', likes: 12, cm: 4, reply: '官方：截图会自动打码，取件码只有抢到批的同学能看到。' },
      { tab: '失物招领', who: '小陈', c: '#d6a98f', time: '2 小时前', text: '北园驿站门口捡到一张校园卡，已交给驿站，失主可以去问。', likes: 5, cm: 1 },
      { tab: '表白墙', who: '匿名同学', c: '#c79fc4', time: '昨天', text: '想对图书馆三楼靠窗的同学说：下次可以一起自习吗？', likes: 41, cm: 9 }
    ],
    reportReasons: ['代考、代打卡等违规交易', '广告或兼职引流', '人身攻击', '泄露他人隐私']
  }
};
