/* 演示步骤。每一步：
   layout   手机数量（0、1、2），舞台按它切换
   overview 首页讲解：一拍框一项，内容在 data.js 的 homeGuide
   cap      手机上方的标题，不写就显示同学的角色
   cta      手动时的下一步提示：who 哪台手机（L、R、side），sel 选择器，label 短标签，pos 标签位置（left、in，不写在上方）
            turn 轮到这台手机发消息才显示，done 消息都发完才显示，unless 这个元素存在时不显示
            affects 是因果预告：悬停这个按钮时，哪些区域亮起描边，note 是小字
   link     说明联动：悬停说明栏的规则时，手机里哪些元素亮起
   sideW    单台手机时说明栏的宽度
   outro    播完后的探索页：到这里算演示结束，解锁方案，不计入倒计时
   basis    说明栏下面的简短依据：t 是文字，links 是 research.js 里 SOURCES 的键名
   solo     layout 为 1 时用哪台（L 发单同学，R 接单同学）
   side     说明文字；w 是说明栏里的组件（见 screens.js 的 WIDGETS）
   beats    这一步里的小状态。send 是这一拍由哪台手机发送输入框里的内容，和手动点发送走同一个函数；fx 是装饰动画。L、R 是两台手机当前显示的界面 [界面名, 参数]，没写就沿用上一拍
            ms 是自动演示时停留的毫秒数；pass 表示这一拍是过程动画，手动时也会自己走完；focus 是手机宽度下优先显示哪台 */
window.STEPS = [
  {
    id: 'overview', name: '首页', layout: 1, solo: 'L', overview: true, sideW: 560, cap: '首页',
    side: { eyebrow: '首页', title: '这些是大学生需要的功能', w: ['homeGuide'] },
    beats: [
      { L: ['home'], ms: 1500 },
      { ms: 1500 },
      { ms: 1500 },
      { ms: 1500 },
      { ms: 1500 }
    ]
  },
  {
    id: 'register', name: '实名', layout: 1, solo: 'L',
    link: [{ who: 'L', sel: '.card', note: '只有本校实名才能进' }],
    side: { eyebrow: '注册和实名', title: '只有本校学生能进来', rule: '必须是学生，并完成实名认证', note: '出了事能找到人，这是后面所有责任规则的前提。原型只模拟这一步，不收真实证件。' },
    beats: [
      { L: ['reg', { st: 0 }], ms: 1500, cta: [{ who: 'L', sel: '.mp-btn', label: '点这里提交认证' }] },
      { L: ['reg', { st: 1 }], ms: 1200, pass: true, cta: null },
      { L: ['reg', { st: 2 }], ms: 1500, cta: [{ who: 'L', sel: '.mp-btn', label: '点这里进入首页' }] }
    ]
  },
  {
    id: 'home', name: '发单入口', layout: 1, solo: 'L', sideW: 520,
    link: [{ who: 'L', sel: '.svc-pick', note: '完整流程' }],
    cta: [{ who: 'L', sel: '.svc-pick', label: '点这里发单' }],
    side: { eyebrow: '主页', title: '六类服务，先把代取做透', rule: '只有代取快递走完整流程', note: '其他入口可以点进去看，到发单表单为止。代占座改成代排队，代考、代打卡在发单时拦截。', w: ['services'] },
    beats: [{ L: ['home', { pick: 1 }], ms: 2800 }]
  },
  {
    id: 'post', name: '发单', layout: 1, solo: 'L', sideW: 600,
    side: { eyebrow: '亮点三 · AI 打码', title: '传一张截图，出一份清单', rule: '先打码，再进大厅', note: '现在大家发单常附截图，里面有取件码、住址、商品。靠用户自觉不写隐私不可靠。', w: ['masks', { on: 1, still: 1 }] },
    beats: [
      { L: ['post', { st: 'entry' }], ms: 1100, cta: [{ who: 'L', sel: '.entry-main', label: '点这里上传截图', pos: 'in' }], link: [{ who: 'L', sel: '.entry-main' }] },
      { L: ['post', { st: 'scan' }], ms: 3000, w: ['masks', { on: 1 }], pass: true, cta: null, link: [{ who: 'L', sel: '.shot', note: '打码后才进大厅' }] },
      { L: ['post', { st: 'list' }], ms: 2600, w: ['masks', { on: 1, still: 1 }], rule: '解析和打码，都由本人确认', cta: [{ who: 'L', sel: '.mp-btn', label: '点这里选规格' }], link: [{ who: 'L', sel: '.list', note: '由本人确认' }] }
    ]
  },
  {
    id: 'share', name: '代取卡', layout: 1, solo: 'L', sideW: 570,
    link: [{ who: 'L', sel: '.sharecard', note: '抢到批才看到' }],
    side: { eyebrow: '可选入口 · 官方代取卡', title: '菜鸟“找人代取”的卡，也能交给平台', rule: '抢到批的同学才看到这张卡', note: '本人实测：分享卡是单件的，显示驿站、货架码、运单号、手机尾号，官方已隐藏商品信息。点开之后还能看到什么，还没确认。', w: ['share'], basis: [{ t: '官方代取设计给亲友，没写能否授权给陌生同学', links: ['cainiaoStore'] }] },
    beats: [
      { L: ['share', { st: 0 }], ms: 1700, cta: [{ who: 'L', sel: '.mp-btn', label: '点这里加入本次代取' }] },
      { L: ['post', { st: 'list', card: 1 }], ms: 1500, rule: '商品被隐藏，所以规格由发单人自己选', cta: [{ who: 'L', sel: '.mp-btn', label: '点这里选规格' }], link: [{ who: 'L', sel: '.pr .spec-p', note: '自己选' }] }
    ]
  },
  {
    id: 'price', name: '定价', layout: 1, solo: 'L', sideW: 520,
    link: [{ who: 'L', sel: '.ins', note: '自愿，不默认勾选' }],
    cta: [{ who: 'L', sel: '.pay-btn', label: '点这里发布' }],
    side: { eyebrow: '规格定价和保险', title: '保险是自愿的，想买就买', rule: '第三方承保，金额放小，不买也能发布', note: '手机、电脑必须当面交接，证件不接。保险计划和第三方保险公司合作。', foot: '价格、保费和险种都是假设。实际由持牌保险机构承保和收费。' },
    beats: [
      { L: ['price'], ms: 2000 },
      { order: { insured: 1 }, rule: '这位同学主动勾选了保险，合计多 ¥1', ms: 2400 }
    ]
  },
  {
    id: 'hall', name: '进大厅', layout: 2,
    link: [{ who: 'R', sel: '.bc-p', note: '只露脱敏信息' }],
    side: { eyebrow: '发布后进入大厅', title: '左边发出，右边收到', rule: '大厅只露脱敏信息', note: '平台把同站同区的件打包成一批。', w: ['fields'], basis: [{ t: '一个产品在公开卡片上显示楼栋楼层；自动打码，我们看的产品里没看到', links: [] }] },
    beats: [
      { L: ['price'], R: ['hall', { fresh: 0 }], ms: 900, cta: [{ who: 'L', sel: '.pay-btn', label: '点这里发布', affects: [{ who: 'R', sel: '.grow.pad8', note: '批次卡会飞到这里' }] }] },
      { L: ['myorder', { st: 'wait' }], R: ['hall', { fresh: 1 }], ms: 2600, fx: 'fly', focus: 'R', pass: true, cta: null },
      { R: ['hall', { fresh: 2 }], w: ['hallFocus'], rule: '重点：隐私先盖住，才进大厅', note: '', basis: null, ms: 3200, fx: 'zoomcard', focus: 'R', cta: [{ who: 'R', sel: '.bc-f .pill', label: '点这里抢这批', pos: 'left', affects: [{ who: 'L', sel: '.stat-head', note: '抢到后这里会变' }] }] }
    ]
  },
  {
    id: 'compare', name: '对比', layout: 0,
    cta: [{ who: 'side', sel: '.cmp-next' }],
    side: { eyebrow: '亮点二 · 抢一批', w: ['compare'], basis: [{ t: '单价低，收入靠一趟能带几件（我们的推断）；有运营者试过学生抢单后放弃，我们用信用和批次来应对', links: ['tide2026', 'zhihuOperator'] }] },
    beats: [{ ms: 5800 }]
  },
  {
    id: 'grab', name: '抢批', layout: 2,
    link: [{ who: 'R', sel: '.check-row', note: '信用够才能抢' }],
    side: { eyebrow: '抢批', title: '信用决定能抢多大', rule: '信用 82，够抢 5 件这批', note: '演示里点一下就抢到。真实产品会用短窗口加权，防止手速和外挂。', w: ['dock'] },
    beats: [
      { L: ['myorder', { st: 'wait' }], R: ['hall', { sheet: 1 }], ms: 1900, focus: 'R', cta: [{ who: 'R', sel: '.sheet-box .mp-btn', label: '点这里确认抢批', affects: [{ who: 'L', sel: '.stat-head', note: '这里会变成已被接单' }] }] },
      { L: ['myorder', { st: 'taken' }], R: ['grabbed'], ms: 2700, focus: 'L', rule: '右边抢到，左边同时显示已被接单', cta: [{ who: 'R', sel: '.mp-btn', label: '点这里看取件清单' }], link: [{ who: 'L', sel: '.stat-head', note: '已被接单' }, { who: 'R', sel: '.g-head' }] }
    ]
  },
  {
    id: 'pick', name: '清单', layout: 1, solo: 'R', sideW: 520,
    link: [{ who: 'R', sel: '.pk-code' }],
    side: { eyebrow: '取件清单', title: '取件码，抢到后才显示', rule: '谁抢到，谁才看得到，也留痕', note: '现场一件件核销，取齐后拍照。这张照片是后面判断责任的证据。', basis: [{ t: '有回答说报姓名和尾号就能领，这两项盒子上就看得到', links: ['zhihuTail'] }] },
    beats: [
      { R: ['pick', { n: 0 }], ms: 1700, cta: [{ who: 'R', sel: '.mp-btn', label: '点这里拍照留证' }] },
      { R: ['pick', { n: 5, photo: 1 }], ms: 2300, cta: [{ who: 'R', sel: '.mp-btn', label: '点这里开始配送' }] }
    ]
  },
  {
    id: 'timeline', name: '时间线', layout: 2,
    link: [{ who: 'L', sel: '.tl' }, { who: 'R', sel: '.tl' }],
    cta: [{ who: 'R', sel: '.mp-btn', label: '点这里推进', affects: [{ who: 'L', sel: '.tl', note: '这边同步更新' }] }],
    side: { eyebrow: '订单时间线', title: '每一段都留记录', rule: '接单、到站、取件、配送、交付', note: '用节点时间线代替实时地图。出了事，这条线就是证据。', w: ['dock'], basis: [{ t: '报道里常见的抱怨：显示送达却找不到，电话打不通', links: ['gmw2025'] }] },
    beats: [
      { L: ['order', { me: 'L', stage: 1 }], R: ['order', { me: 'R', stage: 1 }], ms: 1300 },
      { L: ['order', { me: 'L', stage: 2 }], R: ['order', { me: 'R', stage: 2 }], ms: 1300 },
      { L: ['order', { me: 'L', stage: 3 }], R: ['order', { me: 'R', stage: 3 }], ms: 1400 }
    ]
  },
  {
    id: 'chat', name: '聊天', layout: 2,
    link: [{ who: 'L', sel: '.ic', note: '投保提示' }, { who: 'R', sel: '.ic' }],
    cta: [
      { who: 'L', sel: '[data-chat-send]', label: '点发送', turn: true, affects: [{ who: 'R', sel: '.chat', note: '这边马上收到' }] },
      { who: 'R', sel: '[data-chat-send]', label: '点发送', turn: true, affects: [{ who: 'L', sel: '.chat', note: '这边马上收到' }] },
      { who: 'R', sel: '.chat-sys a', label: '接着看交付', pos: 'left', done: true }
    ],
    side: { eyebrow: '实时聊天', title: '左边发，右边马上收到', rule: '贵重件的对话里，自动出现投保提示', note: '两台手机都能打字，默认文字已填好，点发送就能看到另一端收到。', w: ['dock'] },
    beats: [
      { L: ['chat', { me: 'L' }], R: ['chat', { me: 'R' }], send: 'L', ms: 1100 },
      { send: 'R', ms: 2300, focus: 'R' },
      { send: 'R', ms: 900, focus: 'R' },
      { send: 'L', ms: 900, focus: 'L' },
      { send: 'R', ms: 1000, focus: 'R' }
    ]
  },
  {
    id: 'deliver', name: '交付', layout: 2,
    link: [{ who: 'L', sel: '.hand', note: '当面确认' }, { who: 'R', sel: '.hand-in' }],
    side: { eyebrow: '交付和确认', title: '两端状态同时变化', rule: '当面确认后，责任才结束', note: '手机当面交接；其他件也按确认结束。确认后才结算。', w: ['dock'], basis: [{ t: '有代拿的同学自述不少人忘记给钱，要逐个追，所以先付、确认后结算', links: ['zhihuUnpaid'] }] },
    beats: [
      { L: ['deliver', { me: 'L', st: 0 }], R: ['deliver', { me: 'R', st: 0 }], ms: 1900, focus: 'L', cta: [{ who: 'L', sel: '.mp-btn', label: '点这里确认收到', affects: [{ who: 'R', sel: '.stat-head', note: '这边同时变化' }] }] },
      { L: ['deliver', { me: 'L', st: 1 }], R: ['deliver', { me: 'R', st: 1 }], ms: 2100, focus: 'R', toast: ['L', '已确认收到'], link: [{ who: 'L', sel: '.g-head' }, { who: 'R', sel: '.g-head' }], cta: [{ who: 'R', sel: '.mp-btn', label: '点这里看结算' }] }
    ]
  },
  {
    id: 'settle', name: '结算', layout: 1, solo: 'R', sideW: 520,
    link: [{ who: 'R', sel: '.cap', note: '能抢更大的批' }],
    cta: [{ who: 'R', sel: '.more-link', label: '点这里看丢了怎么办' }],
    side: { eyebrow: '结算和信用', title: '信用有实际用途', rule: '履约一次，就能抢更大的批', note: '信用不是摆设。它决定你能抢多大的批，也决定能不能接贵重件。', w: ['tiers'] },
    beats: [{ R: ['settle'], ms: 4000 }]
  },
  {
    id: 'claim', name: '丢件', layout: 2,
    link: [{ who: 'L', sel: '.card' }, { who: 'R', sel: '.card', note: '判断依据' }],
    side: { eyebrow: '亮点一 · 代取闭环', title: '丢件了，有明确答案', w: ['chain', { n: 0 }], basis: [{ t: '同学代拿放楼下丢了，协商赔一半，以后不再找代拿', links: ['zhihuDispute'] }] },
    beats: [
      { L: ['claimL', { st: 0 }], R: ['claimR', { st: 0 }], ms: 1500, focus: 'L', cta: [{ who: 'L', sel: '.mp-btn', label: '点这里提交申报', affects: [{ who: 'R', sel: '.stat-warn', note: '这边也进入争议' }, { who: 'side', sel: '.chain', note: '从这里开始判断' }] }] },
      { w: ['chain', { n: 1 }], ms: 1700, pass: true, cta: null },
      { w: ['chain', { n: 2 }], ms: 1700, pass: true },
      { w: ['chain', { n: 3 }], ms: 1700, pass: true },
      { w: ['chain', { n: 4 }], ms: 1700, pass: true },
      { L: ['claimL', { st: 1 }], R: ['claimR', { st: 1 }], w: ['chain', { n: 5 }], basis: null, ms: 3200, focus: 'L', cta: [{ who: 'L', sel: '.mp-btn', label: '点这里看圈子' }] }
    ]
  },
  {
    id: 'circle', name: '圈子', layout: 1, solo: 'L', sideW: 520,
    link: [{ who: 'L', sel: '.notice-s' }, { who: 'L', sel: '.rep' }],
    side: { eyebrow: '圈子', title: '扩大交流，兼作表白墙', rule: '发现违规交易，就删帖封号', note: '校内交流带来传播，也带来风险。代考、代打卡这类帖子可以从这里举报。', foot: '在主页点“圈子”也能进来。', basis: [{ t: '我们看的一个产品，圈子里有疑似兼职引流', links: [] }] },
    beats: [
      { L: ['circle'], ms: 1700, cta: [{ who: 'L', sel: '.post .rep', label: '点这里试试举报', unless: '.sheet-box' }, { who: 'L', sel: '.sheet-box .mp-btn', label: '点这里提交' }] },
      { L: ['circle', { sheet: 1 }], ms: 1500, cta: [{ who: 'L', sel: '.sheet-box .mp-btn', label: '点这里提交' }] },
      { L: ['circle', {}], ms: 900, toast: ['L', '已提交举报'], cta: null }
    ]
  },
  {
    id: 'explore', name: '自己试', layout: 1, solo: 'L', outro: true, sideW: 520, cap: '首页',
    side: { eyebrow: '演示结束', title: '现在自己点点看', note: '手机里的按钮都能点，默认值都填好了。这几个入口值得试：', w: ['explore'] },
    cta: [{ who: 'side', sel: '.ex-plan' }],
    beats: [{ L: ['home'], ms: 0 }]
  }
];
