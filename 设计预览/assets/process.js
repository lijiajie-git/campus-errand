/* “我是怎么做的”的数据和泳道。
   数据来源：项目 CLAUDE.md 的交互记录、git 提交时间（洛杉矶时间）。
   带“约”的是记录里就写了“约”的时间，同一分钟内的先后顺序靠位置示意。
   内容是记录摘要，不是逐字原文；选哪些上线由本人定。 */
(function () {
  var T0 = 16 * 60 + 28, T1 = 16 * 60 + 47;
  function m(h, mi) { return h * 60 + mi; }

  var LANES = [
    { id: 'me', name: '本人', sub: '判断和指令' },
    { id: 'main', name: '主窗口', sub: '方向和范围' },
    { id: 'sub', name: '子 agent × 3', sub: '被叫停' },
    { id: 'res', name: '前端资源窗口', sub: '资源和展示' },
    { id: 'ind', name: '行业调研窗口', sub: '做法、信用、痛点' }
  ];

  var BARS = [
    { lane: 'main', from: m(16, 29), to: null },
    { lane: 'sub', from: m(16, 36), to: m(16, 36.5), stopped: true },
    { lane: 'res', from: m(16, 36), to: m(16, 43) },
    { lane: 'res', from: m(16, 44), to: null },
    { lane: 'ind', from: m(16, 36.6), to: null }
  ];

  var EVENTS = [
    { id: 'e1', t: m(16, 29), time: '16:29', lane: 'main', to: [], title: '先上线占位页，固定公开链接',
      ask: '确认提交后可以迭代，选用 GitHub Pages。', did: '提议先占链接；新建公开仓库，发布占位页。', res: '首次提交，线上链接可打开。', src: 'git 提交 16:29；交互记录' },
    { id: 'e2', t: m(16, 30), time: '16:30', lane: 'me', to: ['main'], title: '要求边做边记录全过程',
      ask: '新建 CLAUDE.md，记录交互、判断、亮点、范围；之后按指令一步步做。', did: '写入文件并推送，停止继续开发。', res: '过程本身变成可交付的材料。', src: 'git 提交 16:30' },
    { id: 'e3', t: m(16, 36), time: '约 16:36', lane: 'me', to: ['main', 'res', 'sub'], title: '拆窗口，提出双手机联动',
      ask: '主窗口只讨论方向和范围；提出小程序双手机联动；单开窗口找前端资源。', did: '开前端资源窗口；调研先派给 3 个子 agent。', res: '前端资源窗口启动。', src: 'CLAUDE.md 交互记录' },
    { id: 'e4', t: m(16, 36.6), time: '约 16:36', lane: 'me', to: ['sub', 'ind'], title: '打断：调研也要单开窗口', key: true,
      ask: '发现调研派给了子 agent，立刻打断，要求新开窗口。', did: '停掉 3 个子 agent（未产出文件），改开行业调研窗口。', res: '两个调研窗口并行。', src: 'CLAUDE.md 交互记录' },
    { id: 'e5', t: m(16, 41), time: '16:41', lane: 'me', to: ['main'], title: '把“怎么做的”也做进作品',
      ask: '作品不只展示产品，也展示怎么最快把它做出来；先定前端骨架，内容后填。', did: '范围改成三部分，新增素材库。', res: '形成演示、方案、过程三段结构。', src: 'git 提交 16:41' },
    { id: 'e6', t: m(16, 43), time: '16:43', lane: 'res', to: ['main'], title: '前端资源第一轮交回',
      ask: '单开窗口找 GitHub 上的前端资源（约 16:36 的指令）。', did: '核实许可证、体积、大陆可达性，写出推荐组合。', res: '主窗口汇总入库。', src: 'git 提交 16:43' },
    { id: 'e7', t: m(16, 44), time: '约 16:44', lane: 'main', to: ['res'], title: '第二轮：研究怎么衔接和展示',
      ask: '前端调研完后，请同一窗口研究三段怎么配合、怎么有审美地展示（16:41 的指令）。', did: '进行中。', res: '进行中。', src: '主窗口转达；时间按前后记录推算' }
  ];

  var PRINCIPLES = [
    { name: '多窗口并行', events: ['e3', 'e4', 'e7'] },
    { name: '先调研', events: ['e3', 'e4', 'e6'] },
    { name: '确定 scope', events: ['e2', 'e5'] },
    { name: '列点子，确定点子', events: [] },
    { name: '再去做其他', events: [] }
  ];

  function pct(t) { return ((t - T0) / (T1 - T0) * 100).toFixed(2) + '%'; }
  function label(t) { var h = Math.floor(t / 60), mi = Math.round(t - h * 60); return h + ':' + (mi < 10 ? '0' : '') + mi; }

  /* 渲染泳道。样式交给各方向自己的 CSS。 */
  function renderLanes(root, onPick) {
    var ticks = '';
    for (var t = T0 + 2; t <= T1; t += 3) ticks += '<span class="lz-tick" style="left:' + pct(t) + '">' + label(t) + '</span>';
    var html = '<div class="lz-axis">' + ticks + '</div>';
    LANES.forEach(function (l, i) {
      var bars = BARS.filter(function (b) { return b.lane === l.id; }).map(function (b) {
        var to = b.to == null ? T1 : b.to;
        return '<span class="lz-bar' + (b.to == null ? ' is-open' : '') + (b.stopped ? ' is-stopped' : '') + '" style="left:' + pct(b.from) + ';width:calc(' + pct(to) + ' - ' + pct(b.from) + ')"></span>';
      }).join('');
      var dots = EVENTS.filter(function (e) { return e.lane === l.id; }).map(function (e) {
        return '<button class="lz-dot' + (e.key ? ' is-key' : '') + '" data-ev="' + e.id + '" style="left:' + pct(e.t) + '" aria-label="' + e.time + ' ' + e.title + '" title="' + e.time + ' ' + e.title + '"></button>';
      }).join('');
      html += '<div class="lz-row" data-lane="' + l.id + '"><div class="lz-head"><b>' + l.name + '</b><small>' + l.sub + '</small></div><div class="lz-track">' + bars + dots + '</div></div>';
    });
    // 跨泳道连线：指令从一条泳道落到另一条
    var links = '';
    EVENTS.forEach(function (e) {
      var from = laneIndex(e.lane);
      e.to.forEach(function (name) {
        var to = laneIndex(name);
        var a = Math.min(from, to), b = Math.max(from, to);
        links += '<span class="lz-link" data-link="' + e.id + '" style="left:' + pct(e.t) + ';--a:' + a + ';--b:' + b + '"></span>';
      });
    });
    html += '<div class="lz-links">' + links + '<div class="lz-playhead" hidden></div></div>';
    root.innerHTML = html;
    root.addEventListener('click', function (ev) {
      var d = ev.target.closest('[data-ev]');
      if (d) { pick(root, d.getAttribute('data-ev'), onPick); }
    });
    root.style.setProperty('--rows', LANES.length);
    return root;
  }
  function laneIndex(id) { for (var i = 0; i < LANES.length; i++) if (LANES[i].id === id) return i; return 0; }
  function eventById(id) { for (var i = 0; i < EVENTS.length; i++) if (EVENTS[i].id === id) return EVENTS[i]; }
  function pick(root, id, cb) {
    root.querySelectorAll('.lz-dot').forEach(function (d) { d.classList.toggle('is-on', d.getAttribute('data-ev') === id); });
    root.querySelectorAll('.lz-link').forEach(function (d) { d.classList.toggle('is-on', d.getAttribute('data-link') === id); });
    var e = eventById(id);
    if (cb && e) cb(e);
  }
  function highlight(root, ids) {
    root.querySelectorAll('.lz-dot').forEach(function (d) { d.classList.toggle('is-dim', ids && ids.indexOf(d.getAttribute('data-ev')) < 0); });
  }

  /* 回放：指针走过时间轴，依次选中事件 */
  function replay(root, onPick, done) {
    var head = root.querySelector('.lz-playhead');
    var order = EVENTS.slice().sort(function (a, b) { return a.t - b.t; });
    head.hidden = false;
    var i = 0;
    head.style.left = pct(order[0].t);
    var step = function () {
      if (i >= order.length) { if (done) done(); return; }
      var e = order[i++];
      head.style.left = pct(e.t);
      pick(root, e.id, onPick);
      replay._t = setTimeout(step, 1500);
    };
    clearTimeout(replay._t);
    step();
  }

  window.PreviewProcess = { LANES: LANES, EVENTS: EVENTS, PRINCIPLES: PRINCIPLES, renderLanes: renderLanes, pick: pick, highlight: highlight, replay: replay };
})();
