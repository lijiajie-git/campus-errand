/* 手机界面和说明栏组件。每个界面返回 { title, html, tab, back }。
   data-next：走下一步；data-goto：跳到某一步；data-nav="界面名|JSON参数"：只切这台手机。 */
(function () {
  var D = window.CONTENT;
  var IMG = '../素材-脱敏/';

  function svg(p, s, sw) { return '<svg width="' + (s || 24) + '" height="' + (s || 24) + '" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.7) + '" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; }
  /* 服务图标：黑线加一点绿，参考竞品的做法 */
  var G = '<circle cx="20" cy="9" r="3.4" fill="#07c160" stroke="none"/>';
  var ICON = {
    parcel: '<path d="M4 9.5 14 4l10 5.5v9L14 24 4 18.500z"/><path d="M4 9.5 14 15l10-5.500M14 15v9"/><path d="m18.800 16.500 3.200-1.800v3l-3.200 1.800z" fill="#07c160" stroke="none"/>',
    move: '<rect x="8" y="8" width="12" height="16" rx="2.400"/><path d="M11 8V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M11 13v6M17 13v6"/><circle cx="17" cy="19" r="1.800" fill="#07c160" stroke="none"/>',
    send: '<path d="M4 13.500 24 5l-5.500 19-5-8z"/><path d="m13.500 16 5-5"/><circle cx="21" cy="21" r="3" fill="#07c160" stroke="none"/>',
    run: '<circle cx="17.500" cy="5.500" r="2.400" fill="#07c160" stroke="none"/><path d="m8 13 5-3.500 4 2.500-3 5 4 3.500-1 4.500M13.500 17 11 21l-5 1M17 12l2 3h4M4 9h4M3 14h3"/>',
    queue: '<circle cx="8" cy="8" r="3"/><circle cx="20" cy="8" r="3" fill="#07c160" stroke="none"/><path d="M3 22c.5-4.500 2.500-7 5-7s4.500 2.500 5 7M15 22c.5-4.500 2.500-7 5-7s4.500 2.500 5 7"/>',
    paper: '<path d="M7 3.500h10l5 5V24a.5.5 0 0 1-.5.500h-14A.5.5 0 0 1 7 24z"/><path d="M17 3.500V9h5M11 14h7M11 18h4"/><circle cx="19" cy="20" r="2.600" fill="#07c160" stroke="none"/>',
    home: '<path d="M4 12.500 14 4l10 8.500V23a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M11 19h6"/>',
    order: '<rect x="6" y="5" width="16" height="19" rx="2.500"/><path d="M10.500 3.500h7v3h-7zM10 12h8M10 17h8"/>',
    circle: '<circle cx="14" cy="14" r="10"/><path d="m12 8.500-2 11M18 8.500l-2 11M8.500 11.500h11.500M8 16.500h11.500"/>',
    me: '<circle cx="14" cy="9.500" r="5"/><path d="M5 24c.8-5 4.500-7.500 9-7.500s8.200 2.500 9 7.500"/>',
    back: '<path d="m17 6-8 8 8 8"/>',
    shield: '<path d="M14 3.500 5 7v7c0 5.500 3.800 9 9 10.500 5.200-1.500 9-5 9-10.500V7z"/><path d="m10 14 3 3 5.500-6"/>',
    cam: '<path d="M4 9h5l2-3h6l2 3h5v14H4z"/><circle cx="14" cy="15" r="4"/>',
    up: '<path d="M14 18V5M8.500 10.500 14 5l5.500 5.500M5 23h18"/>',
    chat: '<path d="M5 6h18v13H12l-5 4v-4H5z"/>',
    flag: '<path d="M7 25V4M7 5h14l-3.500 4.500L21 14H7"/>',
    plus: '<path d="M14 5v18M5 14h18"/>',
    lock: '<rect x="6" y="12" width="16" height="12" rx="2"/><path d="M9.500 12V9a4.500 4.500 0 0 1 9 0v3"/>',
    clip: '<path d="M6 14a8 8 0 0 1 8-8h8M18 3l4 3-4 3M22 14a8 8 0 0 1-8 8H6M10 19l-4 3 4 3"/>',
    check: '<path d="m6 14.500 5.500 5.500L22 8.500"/>'
  };
  function ic(k, s, sw) { return svg(ICON[k], s, sw); }

  function esc(o) { return JSON.stringify(o).replace(/"/g, '&quot;'); }
  function nav(name, args) { return 'data-nav="' + name + '|' + esc(args || {}) + '"'; }
  function money(n) { return '¥' + Number(n).toFixed(2); }
  function btn(text, attr, cls) { return '<a class="weui-btn weui-btn_primary mp-btn ' + (cls || '') + '" ' + (attr || 'data-next') + '>' + text + '</a>'; }
  function mz(text, d) { return '<span class="mz"' + (d ? ' style="--d:' + d + 's"' : '') + '><span>' + text + '</span></span>'; }
  function htmlEsc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  /* 订单状态在引擎里，发单页改了规格和保险，这里读到的就是改后的 */
  function order() { return window.APP.order(); }
  function chatMsg(m, me, cls) {
    if (m.card) {
      var k = order().insured ? D.insureCard : D.insureCardNo;
      return '<div class="ic ' + (cls || '') + '"><div class="ic-h">' + ic('shield', 18) + '<b>' + k.title + '</b></div><p>' + k.body + '</p><small>' + k.foot + '</small></div>';
    }
    var mine = m.from === me;
    return '<div class="msg ' + (mine ? 'msg-me' : 'msg-you') + ' ' + (cls || '') + '"><span class="av" style="background:' + (m.from === 'L' ? '#7fb8a4' : '#8fa6d6') + '">' + (m.from === 'L' ? '林' : '周') + '</span><p>' + htmlEsc(m.t) + '</p></div>';
  }

  /* 截图加打码框：框的位置来自 素材-脱敏/打码框.json */
  function shot(file, opt) {
    opt = opt || {};
    var boxes = (window.MASKS[file] || []).map(function (m, i) {
      var delay = opt.still ? 0 : (opt.base || .35) + i * (opt.step || .05);
      return '<i class="mz-box" style="left:' + m.x * 100 + '%;top:' + m.y * 100 + '%;width:' + m.w * 100 + '%;height:' + m.h * 100 + '%;animation-delay:' + delay + 's"></i>';
    }).join('');
    return '<div class="shot' + (opt.cls ? ' ' + opt.cls : '') + '"><img src="' + IMG + file + '" alt="' + D.sample + '">' + (opt.masked ? boxes : '') + (opt.scan ? '<b class="shot-scan"></b>' : '') + '<span class="shot-tag">' + D.sample + '</span></div>';
  }

  function nodeList(stage) {
    return '<div class="tl">' + D.timeline.map(function (n, i) {
      var cls = i < stage ? 'done' : i === stage ? 'now' : '';
      return '<div class="tl-i ' + cls + (i === stage ? ' in' : '') + '"><i></i><div><b>' + n.k + '</b>' + (i <= stage ? '<time>' + n.t + '</time>' : '') + '<p>' + (i <= stage ? n.d : '等待中') + '</p>' + (i === 2 && i <= stage ? '<div class="proof"><span>' + '<u></u>'.repeat(5) + '</span>取件照片（示例）</div>' : '') + '</div></div>';
    }).join('') + '</div>';
  }

  function batchCard(opt) {
    opt = opt || {};
    var b = D.batch;
    return '<div class="bc' + (opt.cls ? ' ' + opt.cls : '') + '"' + (opt.attr || '') + '>' +
      '<div class="bc-h"><span class="bc-av">批</span><div class="bc-t"><b>' + b.id + ' · 代取快递</b><small>平台打包 · 刚刚</small></div><em class="st-wait">' + (opt.status || '待抢') + '</em></div>' +
      '<div class="bc-m"><b>本批 ' + b.items + ' 件</b><span>' + b.people + ' 位同学</span><strong>' + money(b.fee) + '</strong></div>' +
      '<div class="rt"><i class="qi">起</i>' + D.station + '</div><div class="rt"><i class="zh">终</i>' + D.area + '</div>' +
      '<div class="bc-p"><div class="bc-pt">' + ic('lock', 14) + '抢到后可见</div><div class="bc-pr"><label>取件码</label>' + mz('2-4-6001', opt.scan && .5) + '<label>门牌</label>' + mz('A101', opt.scan && 1) + '</div><div class="bc-pr"><label>手机号</label>' + mz('138****0000', opt.scan && 1.5) + '<label>商品</label>' + mz('连帽卫衣', opt.scan && 2) + '</div></div>' +
      '<div class="tags"><span class="tag">含 1 件贵重 · 当面交接 · ' + (order().insured ? '已投保' : '未投保') + '</span><span class="tag tag_gray">需信用 ≥ ' + b.need + '</span></div>' +
      (opt.foot === false ? '' : '<div class="bc-f"><small>' + b.feeNote + '</small><a class="pill" data-next data-free-goto="grab">抢这批</a></div>') + '</div>';
  }
  function miniBatch(b, unlocked) {
    var lock = b.need > D.credit.before && !unlocked;
    return '<div class="bc bc-min"><div class="bc-m"><b>' + b.id + ' · 本批 ' + b.items + ' 件</b><strong>' + money(b.fee) + '</strong></div><div class="bc-sub">' + b.from + ' → ' + b.to + '</div><div class="bc-f"><small>' + b.people + ' 位同学</small><a class="pill' + (lock ? ' pill-off' : '') + '" data-toast="' + (lock ? '信用够 ' + b.need + ' 才能抢' : '演示走批 #0317') + '">' + (lock ? '信用 ' + b.need + ' 解锁' : '抢这批') + '</a></div></div>';
  }

  var SCREENS = {
    /* ———— 注册和实名 ———— */
    reg: function (a) {
      var st = a.st || 0;
      if (st === 2) return { title: '实名认证', html: '<div class="mp-view pad center-v"><div class="big-ok in">' + ic('check', 44, 2.6) + '</div><h3 class="h-big">认证通过</h3><p class="dim">你现在可以发单和接单了</p><div class="card mt tl-left"><div class="kv"><span>学校</span><b>示例大学</b></div><div class="kv"><span>身份</span><b>在校学生 · 已实名</b></div><div class="kv"><span>初始信用</span><b>60</b></div></div><p class="hint">原型只模拟认证，不收真实证件</p><div class="grow"></div>' + btn('进入首页') + '</div>' };
      return { title: '实名认证', back: true, html: '<div class="mp-view pad"><div class="stepper"><i class="on">1</i><u></u><i' + (st ? ' class="on"' : '') + '>2</i><u></u><i>3</i></div><p class="dim sm center">本校学生才能使用，出事能找到人</p><div class="card mt0"><div class="f"><label>学校</label><span>示例大学</span></div><div class="f"><label>姓名</label><span>示例同学</span></div><div class="f"><label>学号</label><span>2027****01</span></div><div class="f f-up"><label>学生证</label><span class="fake-id"><u></u><u></u><u></u></span><em>示例图</em></div></div><div class="agree"><i class="wechecked">' + ic('check', 13, 3) + '</i>我是本校在校学生，同意平台规则</div><div class="grow"></div>' + (st === 1 ? '<div class="verify"><i class="spin"></i>正在核验学籍（模拟）</div>' : btn('提交认证')) + '</div>' };
    },

    /* ———— 主页 ———— */
    home: function (a) {
      var grid = D.services.map(function (s, i) {
        var attr = s.full ? 'data-goto="post"' : nav('form', { i: i });
        return '<a class="svc' + (a.pick && s.full ? ' svc-pick' : '') + '" ' + attr + '><span>' + ic(s.k, 36, 1.5) + '</span>' + s.t + '</a>';
      }).join('');
      return {
        title: D.name, tab: 0, html: '<div class="mp-view scroll pad0">' +
          '<div class="banner"><div><b>顺路带一下</b><p>收集了同学的需求，代取快递先做透</p></div><svg width="118" height="96" viewBox="0 0 118 96" fill="none"><path d="M30 34 70 16l36 18v42L70 94 30 76z" fill="#fff" stroke="#111" stroke-width="2.500" stroke-linejoin="round"/><path d="m30 34 40 20 36-20M70 54v40" stroke="#111" stroke-width="2.500" stroke-linejoin="round"/><path d="m48 25 38 19v14l-12 6V50L38 30z" fill="#07c160" stroke="#111" stroke-width="2" stroke-linejoin="round"/></svg></div>' +
          '<div class="notice">' + ic('shield', 18) + '丢了有人管：查记录、看驿站、看照片，再判责任</div>' +
          '<div class="grid">' + grid + '</div>' +
          '<div class="card home-batch" data-goto="hall"><div><b>北园驿站正在成批</b><p>本批 5 件，同区的同学一起带</p></div><span class="pill">去看看</span></div>' +
          '<div class="mp-safe"></div></div>'
      };
    },

    /* ———— 其他服务：到发单表单为止 ———— */
    form: function (a) {
      var s = D.services[a.i || 1];
      return { title: s.t, back: true, tab: 0, html: '<div class="mp-view scroll pad"><div class="card mt0"><div class="f"><label>起点</label><span>东区 2 号楼（示例）</span></div><div class="f"><label>终点</label><span>图书馆（示例）</span></div><div class="f"><label>时间</label><span>今天 18:00 前</span></div><div class="f"><label>说明</label><span>' + s.hint + '</span></div><div class="f"><label>出价</label><span><b>¥6</b> 最低 ¥5（假设）</span></div></div><div class="warn">代考、代打卡不能发布，发单时拦截</div><p class="hint">演示只做到发单表单。完整流程看代取快递。</p><div class="grow"></div><a class="weui-btn weui-btn_primary mp-btn" data-goto="post">去看代取快递的完整流程</a></div>' };
    },

    /* ———— 发单 ———— */
    post: function (a) {
      var st = a.st || 'entry';
      if (st === 'entry') return { title: '代取快递', back: true, html: '<div class="mp-view pad"><div class="entry entry-main" data-next><span>' + ic('up', 28) + '</span><div><b>上传截图或短信</b><p>AI 解析成清单，并自动打码</p></div></div><div class="entry" data-goto="share"><span>' + ic('clip', 26) + '</span><div><b>菜鸟“找人代取”</b><p>把分享卡交给平台，抢到批的同学才看到</p></div></div><div class="entry" ' + nav('post', { st: 'sms' }) + '><span>' + ic('chat', 26) + '</span><div><b>粘贴取件短信</b><p>短信和单件详情，也一样解析打码</p></div></div><div class="entry entry-off" data-toast="演示走截图这条路"><span>' + ic('paper', 26) + '</span><div><b>手动填写</b><p>驿站、规格、取件码</p></div></div><div class="warn">代考、代打卡不能发布，发单时拦截</div><div class="grow"></div><p class="hint">AI 部分是演示动画，不做当场解析</p></div>' };
      if (st === 'sms') return { title: '短信和单件', back: true, html: '<div class="mp-view pad"><div class="ai-ok">' + ic('check', 16, 2.6) + '同样解析并打码 <span class="tag">演示动画</span></div><div class="sms-pair">' + shot('取件短信.jpg', { masked: true, base: .3, step: .2 }) + shot('单件详情.jpg', { masked: true, base: .3, step: .2 }) + '</div><div class="note-card">取件码、住址、姓名手机号、商品都盖住了，运单号也不公开。</div><div class="grow"></div><a class="weui-btn weui-btn_primary mp-btn" ' + nav('post', { st: 'list' }) + '>看解析出的清单</a></div>' };
      if (st === 'scan') return { title: 'AI 解析中', html: '<div class="mp-view pad center-h"><div class="scan-wrap">' + shot('多件列表.jpg', { masked: true, scan: true, base: .8, step: .06 }) + '</div><div class="scan-txt"><span class="tag">演示动画</span><p>正在识别 ' + D.screenshotRows + ' 件包裹，自动打码取件码、商品和图片</p></div></div>' };
      var rows = D.parcels.filter(function (p) { return p.owner === '小林' && (a.card || !p.card); }).map(function (p) {
        return '<div class="pr' + (p.card ? ' in' : '') + '"><i class="wechecked">' + ic('check', 13, 3) + '</i><div><b>' + (p.card ? '官方代取卡 · 商品已隐藏' : p.name) + '</b><small>' + p.co + ' · 取件码 ' + mz(p.code) + '</small></div><em class="spec' + (p.precious ? ' spec-p' : '') + '">' + p.spec + '</em></div>';
      }).join('');
      return { title: '确认清单', back: true, html: '<div class="mp-view pad"><div class="ai-ok">' + ic('check', 16, 2.6) + '识别 ' + D.screenshotRows + ' 件，已打码 <span class="tag">演示动画</span></div><div class="card mt0 list"><div class="list-h">' + D.station + ' · 今天代取</div>' + rows + '<div class="pr pr-off">其余 5 件这次自己取</div></div>' + (a.card ? '' : '<a class="add-card" data-goto="share">' + ic('plus', 16, 2.2) + '添加菜鸟“找人代取”卡（可选）</a>') + '<div class="note-card">送到：' + D.room + '<br><small>门牌和手机号，抢到批的同学才能看到</small></div><div class="grow"></div>' + btn('确认，去选规格', 'data-goto="price"') + '</div>' };
    },

    share: function () {
      var c = D.shareCard;
      return { title: '找人代取', back: true, html: '<div class="mp-view pad"><p class="dim sm">把菜鸟的分享卡交给平台</p>' + SHARE_CARD(c) + '<div class="note-card">抢到批的同学才看到这张卡。<br><small>分享卡是单件的；点开后还能看到什么，还没确认。</small></div><div class="grow"></div>' + btn('加入本次代取') + '</div>' };
    },

    price: function () {
      var o = order();
      var spec = D.specs.map(function (s) {
        var on = !!o.specs[s.k];
        return '<div class="sp' + (on ? ' sp-on' : '') + '" role="button" tabindex="0" data-spec="' + s.k + '"><b>' + s.k + '件</b><p>¥' + s.fee + '</p><small>' + s.d + '</small>' + (on ? '<em>×1</em>' : '') + '</div>';
      }).join('');
      var p = D.precious, ins = D.insurance;
      var insBox = !o.precious ? '' : '<div class="ins' + (o.insured ? '' : ' ins-off') + '" role="button" tabindex="0" data-ins><div class="ins-h"><i class="' + (o.insured ? 'wechecked' : 'unchecked') + '">' + (o.insured ? ic('check', 13, 3) : '') + '</i><b>' + ins.name + '</b><span>+¥' + ins.fee + '</span></div><p>' + (o.insured ? '贵重档默认勾选 · 申报价值 ' + p.value + '（假设）' : '没买保险的贵重件，丢了只按平台限额赔（假设）') + '</p><small>' + ins.note + '</small></div>';
      var payBtn = o.count ? '<a class="pay-btn" data-next data-jump="hall:1" data-fly-src>发布到大厅</a>' : '<a class="pay-btn pay-off" data-toast="先选一个规格">请选择规格</a>';
      return { title: '代取快递', back: true, html: '<div class="mp-view"><div class="scroll grow pad"><div class="spgrid">' + spec + '</div><div class="sp sp-wide' + (o.precious ? ' sp-on' : '') + '" role="button" tabindex="0" data-prec><div><b>' + p.k + '</b><small>' + p.d + '</small></div><p>¥' + p.fee + '</p>' + (o.precious ? '<em>×1</em>' : '') + '</div>' + insBox + '<div class="card mt0 f-compact"><div class="f"><label>送到</label><span>' + D.room + '</span></div><div class="f"><label>备注</label><span class="f-ph">手机请当面交给我</span></div></div></div><div class="pay"><div><small>' + (o.insFee ? '合计（含保费 ¥' + o.insFee + '）' : '合计') + '</small><b data-total>' + money(o.total) + '</b></div>' + payBtn + '</div></div>' };
    },

    myorder: function (a) {
      var taken = a.st === 'taken', o = order();
      return { title: '我的订单', tab: 1, html: '<div class="mp-view pad"><div class="stat-head ' + (taken ? 'in' : '') + '"><h3>' + (taken ? '已被接单' : '等待接单') + '</h3><p>' + (taken ? '小周抢到了这批，门牌和取件码只给小周看' : '已和同区的件打包成批，大厅只露脱敏信息') + '</p></div><div class="card mt0"><div class="kv"><span>我的件</span><b>' + o.count + ' 件' + (o.precious ? '，含 1 件贵重' : '') + '</b></div><div class="kv"><span>所在批次</span><b>' + D.batch.id + '</b></div><div class="kv"><span>保险</span><b class="' + (o.insured ? 'g' : '') + '">' + (o.insured ? '已投保' : '未投保') + '</b></div><div class="kv"><span>已付</span><b>' + money(o.total) + '</b></div></div>' + (taken ? '<div class="card runner in"><span class="av" style="background:#8fa6d6">周</span><div><b>小周</b><p>本校实名 · 信用 82</p></div><a class="pill pill-line" data-goto="chat">聊天</a></div>' : '') + '<div class="note-card">' + (taken ? '费用先托管，你确认收到后才结算' : '费用先托管（模拟）。没人抢可以随时取消') + '</div></div>' };
    },

    /* ———— 大厅 ———— */
    hall: function (a) {
      var b = D.batch;
      var fresh = a.fresh !== 0;
      var sheet = a.sheet ? '<div class="sheet"><div class="sheet-mask"></div><div class="sheet-box"><div class="sheet-h"><b>确认抢这批</b></div><div class="check-row">' + ic('check', 16, 2.6) + '本校实名</div><div class="check-row">' + ic('check', 16, 2.6) + '信用 ' + D.credit.before + ' ≥ ' + b.need + '，可抢 ' + D.credit.capBefore + ' 件以内（门槛是假设）</div><div class="check-row">' + ic('check', 16, 2.6) + '贵重件' + (order().insured ? '已投保' : '未投保') + '，需当面交接</div><div class="sheet-sum"><span>本批 ' + b.items + ' 件</span><b>' + money(b.fee) + '</b></div>' + btn('确认抢批') + '</div></div>' : '';
      var main = fresh ? batchCard({ cls: a.fresh === 1 ? 'land' : a.fresh === 2 ? 'bc-focus' : '', attr: ' data-fly-dst', scan: a.fresh === 2 }) : '';
      return {
        title: '订单', tab: 1, html: '<div class="mp-view"><div class="seg"><span class="seg-on">全部订单</span><a ' + nav('myorder', { st: 'taken' }) + '>我的订单</a><a data-goto="pick">我帮助的</a></div><div class="subseg"><span class="on">待抢</span><span data-toast="演示只有待抢这一档">代取</span><span data-toast="演示只有待抢这一档">跑腿</span><span data-toast="演示只有待抢这一档">已完成</span></div><div class="scroll grow pad8">' + main + miniBatch(D.otherBatches[0]) + miniBatch(D.otherBatches[1], a.unlock) + '<div class="mp-safe"></div></div>' + sheet + '</div>'
      };
    },

    grabbed: function () {
      var b = D.batch;
      return { title: '抢到了', html: '<div class="mp-view pad"><div class="stat-head in g-head"><h3>抢到了 ' + b.id + '</h3><p>取件码和门牌已解锁，只有你能看到</p></div><div class="card mt0"><div class="kv"><span>路线</span><b>' + D.station + ' → 北区 3 号楼</b></div><div class="kv"><span>件数</span><b>5 件，3 位同学</b></div><div class="kv"><span>酬金</span><b>' + money(b.fee) + '</b></div><div class="kv"><span>结算</span><b>确认收到后到账</b></div></div><div class="note-card">这批里的手机要当面交接。<br><small>到站后在清单里一件件核销，取齐后拍照。</small></div><div class="grow"></div>' + btn('看取件清单', 'data-goto="pick"') + '</div>' };
    },

    /* ———— 取件清单 ———— */
    pick: function (a) {
      var n = a.n || 0;
      var rows = D.parcels.map(function (p, i) {
        var on = i < n;
        return '<div class="pk' + (on ? ' pk-on' : '') + '"><i class="pk-c">' + (on ? ic('check', 13, 3) : '') + '</i><div class="pk-b"><b class="pk-code unlock" style="animation-delay:' + i * .12 + 's">' + p.code + '</b><small>' + (p.card ? '官方代取卡' : p.name) + ' · ' + p.co + ' · ' + p.spec + '</small></div><em>' + p.owner + '<br>' + p.room.replace('3 号楼 ', '') + '</em></div>';
      }).join('');
      return { title: '取件清单', back: true, html: '<div class="mp-view"><div class="pk-top"><b>' + D.station + '</b><span>已核销 ' + n + ' / 5</span></div><div class="scroll grow pad8"><div class="card mt0 list">' + rows + '</div>' + (a.photo ? '<div class="proof proof-big in"><span>' + '<u></u>'.repeat(5) + '</span><div><b>取件照片已上传</b><small>5 件齐全 · 14:06（示例）</small></div></div>' : '<div class="note-card">取件码只有你看得到，查看和取件都留记录。</div>') + '</div><div class="pad8">' + btn(a.photo ? '开始配送' : '全部取齐，拍照留证') + '</div><div class="mp-safe s"></div></div>' };
    },

    /* ———— 订单时间线 ———— */
    order: function (a, c) {
      var me = a.me || c.who, stage = a.stage == null ? 2 : a.stage;
      return { title: '订单详情', back: true, html: '<div class="mp-view scroll pad"><div class="stat-head"><h3>' + (stage >= 4 ? '已交付' : stage === 3 ? '配送中' : stage === 2 ? '已取件' : '已到站') + '</h3><p>' + D.batch.id + ' · ' + (me === 'L' ? '你的 3 件在这批里' : '5 件 · 3 位同学') + '</p></div><div class="card mt0">' + nodeList(stage) + '</div><div class="ord-act"><a class="pill pill-line" data-goto="chat">' + ic('chat', 16) + '聊天</a>' + (me === 'L' ? '<a class="pill pill-line" data-goto="claim">申报丢件</a>' : '') + '</div>' + (me === 'R' ? '<div class="grow"></div>' + btn(['', '取齐了，已拍照', '开始配送', '和小林约交接'][stage] || '下一步') : '') + '</div>' };
    },

    /* ———— 聊天 ———— */
    chat: function (a, c) {
      var me = a.me || c.who, st = window.APP.chat();
      var other = me === 'L' ? D.who.R : D.who.L;
      var msgs = st.msgs.map(function (m) { return chatMsg(m, me); }).join('');
      return { title: other.name + ' · ' + D.batch.id, back: true, html: '<div class="mp-view"><div class="chat-sys">只用私聊，手机号不暴露<a data-goto="deliver">接着看交付 ›</a></div><div class="chat scroll grow" data-bottom>' + msgs + '</div><div class="chat-in"><input class="chat-input" data-chat-input type="text" enterkeyhint="send" autocomplete="off" aria-label="输入消息" value="' + htmlEsc(st.draft(me)) + '"><button class="pill" data-chat-send type="button">发送</button></div><div class="mp-safe s w"></div></div>' };
    },

    /* ———— 交付 ———— */
    deliver: function (a, c) {
      var me = a.me || c.who, st = a.st || 0;
      if (st === 1) return me === 'L'
        ? { title: '交付完成', html: '<div class="mp-view pad"><div class="stat-head in g-head"><h3>已确认收到</h3><p>费用结算给小周，责任到此结束</p></div><div class="card mt0">' + nodeList(4) + '</div><div class="rate"><b>给小周评价</b><div class="stars">★★★★★</div></div></div>' }
        : { title: '交付完成', html: '<div class="mp-view pad"><div class="stat-head in g-head"><h3>小林已确认</h3><p>酬金到账，信用更新</p></div><div class="card mt0">' + nodeList(4) + '</div><div class="grow"></div>' + btn('看结算和信用') + '</div>' };
      return me === 'L'
        ? { title: '交付', html: '<div class="mp-view pad"><div class="stat-head"><h3>小周到楼下了</h3><p>当面检查，再确认</p></div><div class="card mt0 center"><p class="dim sm">把交接码给小周</p><div class="hand">4 8 2 6</div><p class="dim sm">含 1 件贵重，请当面交接（示例）</p></div><div class="grow"></div>' + btn('确认收到') + '</div>' }
        : { title: '交付', html: '<div class="mp-view pad"><div class="stat-head"><h3>已到 3 号楼</h3><p>向小林要交接码</p></div><div class="card mt0"><div class="kv"><span>收件</span><b>小林 · A101</b></div><div class="kv"><span>交接</span><b>当面（含贵重件）</b></div><div class="kv"><span>交接码</span><b class="hand-in">4 8 2 6</b></div></div><div class="note-card">小吴和小陈的件按各自约定交付，流程相同。</div></div>' };
    },

    /* ———— 结算 ———— */
    settle: function () {
      var k = D.credit, b = D.batch;
      return { title: '结算和信用', tab: 3, html: '<div class="mp-view scroll pad"><div class="income"><small>本批到账（模拟）</small><b>+<span data-count="0:' + b.fee + ':2">' + b.fee.toFixed(2) + '</span></b><p>' + D.batch.id + ' · 5 件 · 1 趟</p></div><div class="card mt0 credit"><svg viewBox="0 0 120 120" width="112" height="112"><circle cx="60" cy="60" r="50" fill="none" stroke="#eef0f2" stroke-width="10"/><circle class="ring" cx="60" cy="60" r="50" fill="none" stroke="#07c160" stroke-width="10" stroke-linecap="round" pathLength="100" stroke-dasharray="' + k.after + ' 100" transform="rotate(-90 60 60)"/></svg><div class="credit-n"><b data-count="' + k.before + ':' + k.after + ':0">' + k.after + '</b><small>信用</small></div><div class="credit-d"><b>信用 +' + (k.after - k.before) + '</b><p>按时交付，当面确认</p><div class="cap">可抢上限 <s>' + k.capBefore + ' 件</s> → <b>' + k.capAfter + ' 件</b></div></div></div><div class="unlock-card in"><span>解锁</span><div><b>批 #0319 · 本批 8 件 · ¥19</b><p>信用够 85 了，下一批能抢更大的</p></div></div><div class="stats"><div><b>¥318</b><small>累计（示例）</small></div><div><b>27 批</b><small>已完成</small></div><div><b>0</b><small>丢件</small></div></div><a class="more-link" data-next>如果这批丢了怎么办 ›</a></div>' };
    },

    /* ———— 我的 ———— */
    me: function () {
      var k = D.credit;
      var rows = [['我发的单', 'data-goto="hall"'], ['我帮助的', 'data-goto="pick"'], ['丢件申报和投诉', 'data-goto="claim"'], ['投保记录', 'data-goto="price"'], ['客服和平台协议', 'data-toast="客服入口，演示不展开"']];
      return { title: '我的', tab: 3, html: '<div class="mp-view scroll"><div class="me-top"><span class="av av-lg" style="background:#8fa6d6">周</span><div><b>小周</b><p><span class="tag tag_w">本校实名</span></p></div></div><div class="me-credit" data-goto="settle"><div><small>信用</small><b>' + k.before + '</b></div><div><small>可抢上限</small><b>' + k.capBefore + ' 件</b></div><div><small>今日收入</small><b>¥26</b></div><div><small>累计</small><b>¥318</b></div></div><div class="pad8"><div class="card mt0 list">' + rows.map(function (r) { return '<a class="row" ' + r[1] + '>' + r[0] + '<i>›</i></a>'; }).join('') + '</div><p class="hint">信用和额度放在最上面：它决定你能抢多大。</p></div></div>' };
    },

    /* ———— 丢件索赔 ———— */
    claimL: function (a) {
      var st = a.st || 0, c = D.claim.cases[window.APP ? window.APP.claimCase() : 'normal'];
      if (st === 1) return { title: '索赔结果', tab: undefined, html: '<div class="mp-view pad"><div class="stat-head in g-head"><h3>' + c.verdict + '</h3><p>' + c.short + '，不用你自己去找人</p></div><div class="card mt0">' + c.lines.map(function (l) { return '<div class="line-ok">' + ic('check', 15, 2.6) + l + '</div>'; }).join('') + '</div><div class="note-card">这条记录会留在订单里。</div><div class="grow"></div>' + btn('再看看圈子') + '</div>' };
      return { title: '申报丢件', back: true, html: '<div class="mp-view pad"><div class="stat-warn"><h3>订单进入争议</h3><p>配送后没有等到交付确认</p></div><div class="card mt0"><div class="f"><label>丢失件</label><span>连帽卫衣 · 韵达</span></div><div class="f"><label>申报价值</label><span>¥89（示例）</span></div><div class="f"><label>凭证</label><span>订单时间线已自动带入</span></div></div><div class="note-card">平台来判断，你不用自己去找驿站和快递公司。</div><div class="grow"></div>' + btn('提交申报') + '</div>' };
    },
    claimR: function (a) {
      var st = a.st || 0, c = D.claim.cases[window.APP ? window.APP.claimCase() : 'normal'];
      if (st === 1) return { title: '争议结果', html: '<div class="mp-view pad"><div class="stat-warn"><h3>责任在取件到交付这一段</h3><p>' + (c === D.claim.cases.normal ? '平台先赔，再向你追偿' : '走保险理赔，你不用先垫付') + '</p></div><div class="card mt0"><div class="kv"><span>信用（假设）</span><b class="r">82 → 74</b></div><div class="kv"><span>可抢上限（假设）</span><b class="r">6 件 → 3 件</b></div><div class="kv"><span>申诉</span><b>人工确认前可补证据</b></div></div><div class="note-card">这就是实名的作用：能找到人，也能追偿。</div></div>' };
      return { title: '争议处理', html: '<div class="mp-view pad"><div class="stat-warn"><h3>小林申报丢失 1 件</h3><p>这批的酬金先冻结</p></div><div class="card mt0">' + nodeList(3) + '</div><div class="ord-act"><a class="pill pill-line" data-toast="已打开相册（模拟）">' + ic('cam', 16) + '补充证据</a></div></div>' };
    },

    /* ———— 圈子 ———— */
    circle: function (a) {
      var C = D.circle, cur = a.tab || 0;
      var posts = C.posts.filter(function (p) { return cur === 0 || p.tab === C.tabs[cur]; }).map(function (p) {
        return '<div class="post"><div class="post-h"><span class="av" style="background:' + p.c + '">' + p.who[p.who.length - 1] + '</span><div><b>' + p.who + '</b><small>' + p.time + ' · ' + p.tab + '</small></div><a class="rep" ' + nav('circle', { tab: cur, sheet: 1 }) + '>' + ic('flag', 15) + '举报</a></div><p>' + p.text + '</p>' + (p.reply ? '<div class="post-r">' + p.reply + '</div>' : '') + '<div class="post-f"><span>♡ ' + p.likes + '</span><span>' + p.cm + ' 条评论</span></div></div>';
      }).join('');
      var sheet = a.sheet ? '<div class="sheet"><div class="sheet-mask"></div><div class="sheet-box"><div class="sheet-h"><b>举报这条内容</b></div>' + C.reportReasons.map(function (r, i) { return '<div class="rr' + (i === 0 ? ' rr-on' : '') + '"><i></i>' + r + '</div>'; }).join('') + '<a class="weui-btn weui-btn_primary mp-btn" data-next ' + nav('circle', { tab: cur }) + '>提交举报</a></div></div>' : '';
      return { title: '圈子', tab: 2, html: '<div class="mp-view"><div class="seg seg-s">' + C.tabs.map(function (t, i) { return '<a class="' + (i === cur ? 'seg-on' : '') + '" ' + nav('circle', { tab: i }) + '>' + t + '</a>'; }).join('') + '</div><div class="scroll grow pad8"><div class="notice notice-s">' + C.notice + '</div>' + posts + '<div class="mp-safe"></div></div><span class="fab" data-toast="发帖入口，演示不展开">' + ic('send', 24) + '</span>' + sheet + '</div>' };
    }
  };

  function SHARE_CARD(c) {
    return '<div class="sharecard"><div class="sc-h"><span>菜</span><b>' + c.from + '</b><em>' + D.sample + '</em></div><div class="sc-b"><div><label>驿站</label>' + c.station + '</div><div><label>货架</label>' + c.shelf + '</div><div><label>运单</label>' + c.waybill + '</div><div><label>手机</label>' + c.tail + '</div><div class="sc-hide"><label>商品</label>' + c.hidden + '</div></div></div>';
  }

  /* ———— 说明栏组件 ———— */
  var WIDGETS = {
    hallFocus: function () {
      return '<div class="hf">' + batchCard({ foot: false, scan: true }) + '</div><div class="fields hf-two"><div><label>' + D.focusOthers + '</label>' + D.publicFields.join('、') + '</div><div class="f-amber"><label>' + D.focusAfter + '</label>' + D.privateFields.join('、') + '</div></div><span class="demo-tag">打码是演示动画</span>';
    },
    dock: function () { return '<div class="dock"><span class="dock-tag">平台</span></div>'; },
    services: function () {
      return '<ul class="mini-list">' + D.services.map(function (s) { return '<li><b>' + s.t + '</b>' + (s.full ? '完整流程' : s.hint) + '</li>'; }).join('') + '</ul>';
    },
    masks: function (a) {
      a = a || {};
      var counts = {};
      (window.MASKS['多件列表.jpg'] || []).forEach(function (m) { var k = m.label.replace(/（.*）/, ''); counts[k] = (counts[k] || 0) + 1; });
      var legend = Object.keys(counts).map(function (k) { return '<li><i></i>' + k + ' <b>' + counts[k] + ' 处</b></li>'; }).join('');
      return '<div class="pair"><figure>' + shot('多件列表.jpg', {}) + '<figcaption>打码前</figcaption></figure><figure>' + shot('多件列表.jpg', { masked: !!a.on, still: !!a.still, base: .8, step: .06 }) + '<figcaption>打码后</figcaption></figure><div class="pair-note"><ul class="legend">' + legend + '</ul><p>规则能做的不用 AI。<br>解析和打码由本人确认。</p><span class="demo-tag">演示动画</span></div></div>';
    },
    share: function () { return '<div class="w-share"><div>' + SHARE_CARD(D.shareCard) + '<p class="foot-note">用 HTML 画的示例卡</p></div><figure>' + shot('找人代取.jpg', { masked: true, base: .3, step: .2 }) + '<figcaption>入口：菜鸟“找人代取”</figcaption></figure></div>'; },
    fields: function () {
      return '<div class="dock"><span class="dock-tag">平台打包</span></div><div class="fields"><div><label>大厅公开</label>' + D.publicFields.join('、') + '</div><div class="f-amber"><label>抢到后才可见</label>' + D.privateFields.join('、') + '</div></div><span class="demo-tag">打码是演示动画</span>';
    },
    tiers: function () {
      return '<table class="tiers"><thead><tr><th>信用</th><th>能抢多大</th></tr></thead><tbody>' + D.creditTiers.map(function (t) { return '<tr class="' + (t.need === 85 ? 'is-on' : '') + '"><td>' + t.need + '</td><td>' + t.cap + '</td></tr>'; }).join('') + '</tbody></table><p class="foot-note">分值和门槛都是假设。</p>';
    },
    compare: function () {
      var C = D.compare, A = C.one, B = C.batch;
      var one = ''; for (var i = 0; i < A.trips; i++) one += '<i class="cb cb-g" style="left:' + i * 20 + '%;width:calc(20% - 3px);animation-delay:' + (.2 + i * .42) + 's"><u>第 ' + (i + 1) + ' 趟</u></i>';
      function row(k, a, b) { return '<tr><th>' + k + '</th><td>' + a + '</td><td class="hi">' + b + '</td></tr>'; }
      return '<div class="cmp"><div class="cmp-l"><h2>' + C.title + '</h2><div class="cmp-chart"><div class="cmp-row"><label>' + A.name + '</label><div class="cmp-t">' + one + '</div></div><div class="cmp-row"><label>' + B.name + '</label><div class="cmp-t"><i class="cb cb-a" style="left:0;width:33.33%;animation-delay:2.4s"><u>1 趟带 5 件</u></i><span class="cmp-save" style="left:33.33%;right:0">' + C.saved + '</span></div></div><div class="cmp-axis"><span style="left:0">0</span><span style="left:33.33%">25 分钟</span><span style="left:100%">75 分钟</span></div></div><p class="cmp-p">' + C.plain + '</p></div><table class="cmp-tb"><thead><tr><th></th><td>' + A.name + '</td><td class="hi">' + B.name + '</td></tr></thead><tbody>' + row('趟数', A.trips, B.trips) + row('用时', A.minutes + ' 分钟', B.minutes + ' 分钟') + row('酬金', '¥' + A.pay, '¥' + B.pay) + row('折合时薪', '¥' + A.hour, '¥' + B.hour) + '</tbody><tfoot><tr><td colspan="3">' + C.note + '<br><button class="cmp-next" data-ctl="next">接着看：抢这批 →</button></td></tr></tfoot></table></div>';
    },
    chain: function (a) {
      var n = (a && a.n) || 0, Cl = D.claim, cs = window.APP ? window.APP.claimCase() : 'normal';
      var nodes = Cl.chain.map(function (c, i) {
        var state = i < n - 1 ? 'done' : i === n - 1 ? 'now' : '';
        return '<li class="ch ' + state + '"><i>' + (i + 1) + '</i><div><b>' + c.k + '</b>' + (i < n ? '<p>' + c.d + '</p><em>' + c.ok + '</em>' : '') + '</div></li>';
      }).join('');
      var res = '';
      if (n >= 5) {
        var c = Cl.cases[cs];
        res = '<div class="duty in"><div class="duty-tabs">' + Object.keys(Cl.cases).map(function (k) { return '<button data-case="' + k + '" class="' + (k === cs ? 'on' : '') + '">' + Cl.cases[k].tab + '</button>'; }).join('') + '</div><b>' + c.verdict + '</b><p>' + c.lines.join('；') + '。</p></div>';
      }
      return '<ol class="chain">' + nodes + '</ol>' + res + '<span class="demo-tag">' + Cl.tag + '</span>';
    }
  };

  window.CHAT_MSG = chatMsg;
  window.SCREENS = SCREENS;
  window.WIDGETS = WIDGETS;
  window.MP_ICON = ic;
})();
