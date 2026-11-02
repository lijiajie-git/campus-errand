/* 演示步骤。每一步：
   layout   手机数量（0、1、2、4），舞台按它切换
   solo     layout 为 1 时用哪台（L 发单同学，R 接单同学）
   side     说明文字；w 是说明栏里的组件（见 screens.js 的 WIDGETS）
   beats    这一步里的小状态。send 是这一拍由哪台手机发送输入框里的内容，和手动点发送走同一个函数；fx 是装饰动画。L、R 是两台手机当前显示的界面 [界面名, 参数]，没写就沿用上一拍
            ms 是自动演示时停留的毫秒数；pass 表示这一拍是过程动画，手动时也会自己走完；focus 是手机宽度下优先显示哪台 */
window.STEPS = [
  {
    id: 'overview', name: '总览', layout: 4,
    side: { eyebrow: '功能总览', title: '一个小程序，四个入口', note: '点任意一台，进入对应功能。多台手机都是同一个小程序里的不同同学。' },
    four: [
      { cap: '首页 · 找服务', s: ['home'], go: 'home' },
      { cap: '订单 · 抢一批', s: ['hall'], go: 'hall' },
      { cap: '圈子 · 校内交流', s: ['circle'], go: 'circle' },
      { cap: '我的 · 信用和收入', s: ['me'], go: 'settle' }
    ],
    beats: [{ ms: 3800 }]
  },
  {
    id: 'register', name: '实名', layout: 1, solo: 'L',
    side: { eyebrow: '注册和实名', title: '只有本校学生能进来', rule: '必须是学生，并完成实名认证', note: '出了事能找到人，这是后面所有责任规则的前提。原型只模拟这一步，不收真实证件。' },
    beats: [
      { L: ['reg', { st: 0 }], ms: 1500 },
      { L: ['reg', { st: 1 }], ms: 1200, pass: true },
      { L: ['reg', { st: 2 }], ms: 1500 }
    ]
  },
  {
    id: 'home', name: '主页', layout: 1, solo: 'L',
    side: { eyebrow: '主页', title: '六类服务，先把代取做透', rule: '只有代取快递走完整流程', note: '其他入口可以点进去看，到发单表单为止。代占座改成代排队，代考、代打卡在发单时拦截。', w: ['services'] },
    beats: [{ L: ['home', { pick: 1 }], ms: 2800 }]
  },
  {
    id: 'post', name: '发单', layout: 1, solo: 'L',
    side: { eyebrow: '亮点三 · AI 解析和自动打码', title: '传一张截图，出一份清单', rule: '先打码，再进大厅', note: '现在大家发单常附截图，里面有取件码、住址、商品。靠用户自觉不写隐私不可靠。', w: ['masks', { on: 1, still: 1 }] },
    beats: [
      { L: ['post', { st: 'entry' }], ms: 1100 },
      { L: ['post', { st: 'scan' }], ms: 3000, w: ['masks', { on: 1 }], pass: true },
      { L: ['post', { st: 'list' }], ms: 2600, w: ['masks', { on: 1, still: 1 }], rule: '解析和打码，都由本人确认' }
    ]
  },
  {
    id: 'share', name: '代取卡', layout: 1, solo: 'L',
    side: { eyebrow: '可选入口 · 官方代取卡', title: '菜鸟“找人代取”的卡，也能交给平台', rule: '抢到批的同学才看到这张卡', note: '本人实测：分享卡是单件的，显示驿站、货架码、运单号、手机尾号，官方已隐藏商品信息。点开之后还能看到什么，还没确认。', w: ['share'] },
    beats: [
      { L: ['share', { st: 0 }], ms: 1700 },
      { L: ['post', { st: 'list', card: 1 }], ms: 1500, rule: '商品被隐藏，所以规格由发单人自己选' }
    ]
  },
  {
    id: 'price', name: '定价', layout: 1, solo: 'L',
    side: { eyebrow: '规格定价和保险', title: '贵重档默认勾选保险', rule: '下单时直接买，合计里看得见', note: '手机、电脑买保险并当面交接才可接，证件不接。保险计划和第三方保险公司合作。', foot: '价格、保费和险种都是假设。实际由持牌保险机构承保和收费。' },
    beats: [{ L: ['price'], ms: 4500 }]
  },
  {
    id: 'hall', name: '进大厅', layout: 2,
    side: { eyebrow: '发布后进入大厅', title: '左边发出，右边收到', rule: '大厅只露脱敏信息', note: '平台把同站同区的件打包成一批。', w: ['fields'] },
    beats: [
      { L: ['price'], R: ['hall', { fresh: 0 }], ms: 900 },
      { L: ['myorder', { st: 'wait' }], R: ['hall', { fresh: 1 }], ms: 2600, fx: 'fly', focus: 'R' },
      { R: ['hall', { fresh: 2 }], w: ['hallFocus'], rule: '重点：隐私先盖住，才进大厅', note: '', ms: 3600, fx: 'zoomcard', focus: 'R' }
    ]
  },
  {
    id: 'compare', name: '对比', layout: 0,
    side: { eyebrow: '亮点二 · 抢一批', w: ['compare'] },
    beats: [{ ms: 6500 }]
  },
  {
    id: 'grab', name: '抢批', layout: 2,
    side: { eyebrow: '抢批', title: '信用决定能抢多大', rule: '信用 82，够抢 5 件这批', note: '演示里点一下就抢到。真实产品会用短窗口加权，防止手速和外挂。', w: ['dock'] },
    beats: [
      { L: ['myorder', { st: 'wait' }], R: ['hall', { sheet: 1 }], ms: 1900, focus: 'R' },
      { L: ['myorder', { st: 'taken' }], R: ['grabbed'], ms: 2700, focus: 'L', rule: '右边抢到，左边同时显示已被接单' }
    ]
  },
  {
    id: 'pick', name: '清单', layout: 1, solo: 'R',
    side: { eyebrow: '取件清单', title: '取件码，抢到后才显示', rule: '谁抢到，谁才看得到，也留痕', note: '现场一件件核销，取齐后拍照。这张照片是后面判断责任的证据。' },
    beats: [
      { R: ['pick', { n: 0 }], ms: 1700 },
      { R: ['pick', { n: 5, photo: 1 }], ms: 2300 }
    ]
  },
  {
    id: 'timeline', name: '时间线', layout: 2,
    side: { eyebrow: '订单时间线', title: '每一段都留记录', rule: '接单、到站、取件、配送、交付', note: '用节点时间线代替实时地图。出了事，这条线就是证据。', w: ['dock'] },
    beats: [
      { L: ['order', { me: 'L', stage: 1 }], R: ['order', { me: 'R', stage: 1 }], ms: 1300 },
      { L: ['order', { me: 'L', stage: 2 }], R: ['order', { me: 'R', stage: 2 }], ms: 1300 },
      { L: ['order', { me: 'L', stage: 3 }], R: ['order', { me: 'R', stage: 3 }], ms: 1400 }
    ]
  },
  {
    id: 'chat', name: '聊天', layout: 2,
    side: { eyebrow: '实时聊天', title: '左边发，右边马上收到', rule: '贵重件的对话里，自动出现投保提示', note: '两台手机都能打字，默认文字已填好，点发送就能看到另一端收到。', w: ['dock'] },
    beats: [
      { L: ['chat', { me: 'L' }], R: ['chat', { me: 'R' }], send: 'L', ms: 1100 },
      { send: 'R', ms: 2700, focus: 'R' },
      { send: 'R', ms: 900, focus: 'R' },
      { send: 'L', ms: 900, focus: 'L' },
      { send: 'R', ms: 1000, focus: 'R' }
    ]
  },
  {
    id: 'deliver', name: '交付', layout: 2,
    side: { eyebrow: '交付和确认', title: '两端状态同时变化', rule: '当面确认后，责任才结束', note: '手机当面交接；其他件也按确认结束。确认后才结算。', w: ['dock'] },
    beats: [
      { L: ['deliver', { me: 'L', st: 0 }], R: ['deliver', { me: 'R', st: 0 }], ms: 1900, focus: 'L' },
      { L: ['deliver', { me: 'L', st: 1 }], R: ['deliver', { me: 'R', st: 1 }], ms: 2100, focus: 'R', toast: ['L', '已确认收到'] }
    ]
  },
  {
    id: 'settle', name: '结算', layout: 1, solo: 'R',
    side: { eyebrow: '结算和信用', title: '信用有实际用途', rule: '履约一次，就能抢更大的批', note: '信用不是摆设。它决定你能抢多大的批，也决定能不能接贵重件。', w: ['tiers'] },
    beats: [{ R: ['settle'], ms: 4200 }]
  },
  {
    id: 'claim', name: '丢件', layout: 2,
    side: { eyebrow: '亮点一 · 如果丢了', title: '丢件了，有明确答案', w: ['chain', { n: 0 }] },
    beats: [
      { L: ['claimL', { st: 0 }], R: ['claimR', { st: 0 }], ms: 1500, focus: 'L' },
      { w: ['chain', { n: 1 }], ms: 1700, pass: true },
      { w: ['chain', { n: 2 }], ms: 1700, pass: true },
      { w: ['chain', { n: 3 }], ms: 1700, pass: true },
      { w: ['chain', { n: 4 }], ms: 1700, pass: true },
      { L: ['claimL', { st: 1 }], R: ['claimR', { st: 1 }], w: ['chain', { n: 5 }], ms: 3400, focus: 'L' }
    ]
  },
  {
    id: 'circle', name: '圈子', layout: 1, solo: 'L',
    side: { eyebrow: '圈子', title: '扩大交流，兼作表白墙', rule: '发现违规交易，就删帖封号', note: '校内交流带来传播，也带来风险。代考、代打卡这类帖子可以从这里举报。', foot: '在主页点“圈子”也能进来。' },
    beats: [
      { L: ['circle'], ms: 1900 },
      { L: ['circle', { sheet: 1 }], ms: 1500 },
      { L: ['circle', {}], ms: 900, toast: ['L', '已提交举报'] }
    ]
  }
];
