/* 方案、过程、Scope 三段的渲染，和顶栏高亮。内容在 content/plan.js、content/process.js。 */
window.PAGE_EXTRAS = function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  function table(head, rows, opt) {
    opt = opt || {};
    return '<div class="tb-wrap"><table class="tb"><thead><tr>' + head.map(function (h, i) { return '<th' + (opt.rule === i ? ' class="rule"' : '') + '>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return '<td' + (opt.rule === i ? ' class="rule"' : '') + '>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function plainList(rows) { return '<ul class="plain">' + rows.map(function (r) { return '<li><b>' + r[0] + '</b>' + r[1] + '</li>'; }).join('') + '</ul>'; }

  /* ———— 平台责任：两边并排，一眼看出两边都怕 ———— */
  function responsibilityHTML(R0) {
    if (!R0) return '';
    return '<div class="resp">' + R0.sides.map(function (s) {
      return '<div class="resp-side"><h4>' + s.who + '</h4>' + s.rows.map(function (r) {
        return '<div class="resp-row"><b>' + r.fear + '</b><p>' + r.how + '</p>' + (r.go ? '<a data-goto="' + r.go + '">' + R0.goLabel + '</a>' : '<span>' + R0.noDemo + '</span>') + '</div>';
      }).join('') + '</div>';
    }).join('') + '</div><dl class="resp-notes">' + R0.notes.map(function (n) { return '<div><dt>' + n.k + '</dt><dd>' + n.t + '</dd></div>'; }).join('') + '</dl>';
  }

  /* ———— 方案 ———— */
  var P = window.PLAN;
  if (P) {
    $('#plan').innerHTML = '<div class="wrap"><div class="sec-no">' + P.no + '</div><h2>' + P.title + '</h2><p class="lede">' + P.lede + '</p><h3>' + P.responsibilityTitle + '</h3>' + responsibilityHTML(P.responsibility) +
      '<h3>' + P.hlTitle + '</h3><p class="hl-lede">' + P.hlLede + '</p><div class="hls">' + P.highlights.map(function (h, i) {
        return '<div class="hlc"><i>亮点 ' + (i + 1) + '</i><h4>' + h.h + '</h4><p class="hlc-lead">' + h.lead + '</p><p>' + h.say + '</p><dl><dt>涉及哪些部分</dt><dd>' + h.parts + '</dd><dt>产品考量</dt><dd>' + h.why + '</dd><dt>怎么演示</dt><dd>' + h.demo + '</dd></dl><a data-goto="' + h.go + '">看演示</a></div>';
      }).join('') + '</div>' +
      '<h3>' + P.flowTitle + '</h3>' + table(['流程', '发单端', '平台规则', '接单端', ''], P.flow.map(function (r) { return [r[0], r[1], r[2], r[3], '<a data-goto="' + r[4] + '">看演示</a>']; }), { rule: 2 }) +
      '<div class="two"><div><h3>' + P.dutyTitle + '</h3>' + table(['情况', '谁负责', '怎么赔'], P.duty) + '<p class="plan-note">' + P.dutyNote + '</p></div>' +
      '<div><h3>' + P.bizTitle + '</h3>' + table(['收入', '怎么来', ''], P.biz.map(function (r) { return [r[0], r[1], '<span class="assume">' + r[2] + '</span>']; })) + '</div></div>' +
      '<div class="two"><div><h3>' + P.moreTitle + '</h3>' + plainList(P.more) + '</div><div><h3>' + P.metricTitle + '</h3>' + plainList(P.metrics) + '</div></div></div>';
  }

  /* ———— 调研依据 ———— */
  function researchHTML() {
    var R0 = window.RESEARCH;
    if (!R0) return '';
    return '<h3 id="research">' + R0.title + '</h3><p class="res-speed">' + R0.speed + '</p><ul class="plain res-limits">' + R0.limits.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul>' +
      '<div class="res-g">' + R0.groups.map(function (g) {
        return '<div><h4>' + g.h + '</h4><ul class="plain">' + g.points.map(function (p) {
          return '<li>' + p.t + (p.links.length ? '<div class="res-src">' + p.links.map(window.SRC_LINK).join('、') + '</div>' : '') + '</li>';
        }).join('') + '</ul></div>';
      }).join('') + '</div>';
  }

  /* ———— Scope ———— */
  var C = window.SCOPE;
  if (C) {
    $('#scope').innerHTML = '<div class="wrap"><div class="sec-no">' + C.no + '</div><h2>' + C.title + '</h2><p class="lede">' + C.lede + '</p>' +
      '<h3>' + C.screensTitle + '</h3>' + table(['界面', '内容', '来源'], C.screens) +
      researchHTML() + '<div class="two"><div><h3>' + C.notTitle + '</h3>' + plainList(C.not) + '</div><div><h3>' + C.assumeTitle + '</h3><ul class="plain">' + C.assume.map(function (a) { return '<li>' + a + '</li>'; }).join('') + '</ul></div></div>' +
      '<details><summary>' + C.phonesTitle + '</summary>' + table(['场景', '手机数', '为什么'], C.phones) + '</details></div>';
  }

  /* ———— 过程：断轴泳道 ———— */
  var R = window.PROCESS;
  if (R) {
    /* 断轴：每段按 weight 分宽度，段与段之间留一条“离开 x 小时”的折叠带；空档里的时间都压到折叠带 */
    var total = R.segments.reduce(function (s, g) { return s + g.weight; }, 0);
    var BREAK = 5;
    var usable = 100 - BREAK * (R.segments.length - 1);
    var starts = [], acc = 0;
    R.segments.forEach(function (g) { starts.push(acc); acc += g.weight / total * usable + BREAK; });
    var pctN = function (t) {
      for (var i = 0; i < R.segments.length; i++) {
        var g = R.segments[i], w = g.weight / total * usable;
        if (t < g.from) return starts[i] - (i ? BREAK / 2 : 0);
        if (t <= g.to) return starts[i] + (t - g.from) / (g.to - g.from) * w;
      }
      return 100;
    };
    var pct = function (t) { return pctN(t).toFixed(2) + '%'; };
    var laneIndex = function (id) { for (var i = 0; i < R.lanes.length; i++) if (R.lanes[i].id === id) return i; return 0; };
    var evById = function (id) { return R.events.filter(function (e) { return e.id === id; })[0]; };

    $('#how').innerHTML = '<div class="wrap"><div class="sec-no">' + R.no + '</div><h2>' + R.title + '</h2><p class="how-note">' + R.note + '</p>' +
      '<div class="principles" id="principles">' + R.principles.map(function (p, i) { return '<button data-p="' + i + '"><i>原则 ' + (i + 1) + '</i>' + p.name + '</button>'; }).join('') + '</div>' +
      '<div class="replay-row"><span>' + R.day + '</span><button id="replay-process">回放过程</button></div>' +
      '<div class="lanes" id="lanes"></div><div class="detail" id="detail"></div><ul class="mobile-list" id="mobile-list"></ul>' +
      '<div class="how-d">' + R.details.map(function (d) {
        return '<details><summary><b>' + d.h + '</b><span>' + d.one + '</span></summary><div class="inner">' + (d.list ? plainList(d.list) : '') + (d.table ? table(d.table.head, d.table.rows) : '') + (d.after ? '<p>' + d.after + '</p>' : '') + '</div></details>';
      }).join('') + '</div>' +
      '<div class="foot">' + R.footText + '<a href="' + R.footLink + '" target="_blank" rel="noopener">' + R.footLabel + '</a>' +
      '<div class="foot-links">调研和代码都在 GitHub：' + (R.materials || []).map(function (l) { return '<a href="' + l.url + '" target="_blank" rel="noopener">' + l.label + '</a>'; }).join('') + '</div></div></div>';

    var lanes = $('#lanes');
    var html = '<div class="lz-axis">' + R.segments.map(function (g, i) { return '<span class="lz-tick" style="left:' + starts[i].toFixed(2) + '%;transform:none">' + g.label + '</span>'; }).join('') + '</div>';
    var endT = R.segments[R.segments.length - 1].to;
    R.lanes.forEach(function (l) {
      var bars = R.bars.filter(function (b) { return b.lane === l.id; }).map(function (b) {
        var to = b.to == null ? endT : b.to;
        return '<span class="lz-bar' + (b.to == null ? ' is-open' : '') + (b.stopped ? ' is-stopped' : '') + '" style="left:' + pct(b.from) + ';width:calc(' + pct(to) + ' - ' + pct(b.from) + ')"></span>';
      }).join('');
      var dots = R.events.filter(function (e) { return e.lane === l.id; }).map(function (e) {
        return '<button class="lz-dot' + (e.key ? ' is-key' : '') + '" data-ev="' + e.id + '" style="left:' + pct(e.t) + '" aria-label="' + e.time + ' ' + e.title + '" title="' + e.time + ' ' + e.title + '"></button>';
      }).join('');
      html += '<div class="lz-row"><div class="lz-head"><b>' + l.name + '</b><small>' + l.sub + '</small></div><div class="lz-track">' + bars + dots + '</div></div>';
    });
    var links = '';
    R.events.forEach(function (e) {
      var from = laneIndex(e.lane);
      e.to.forEach(function (n) {
        var to = laneIndex(n), a = Math.min(from, to), b = Math.max(from, to);
        links += '<span class="lz-link" data-link="' + e.id + '" style="left:' + pct(e.t) + ';--a:' + a + ';--b:' + b + '"></span>';
      });
    });
    var breaks = R.segments.slice(1).map(function (g, i) { return '<span class="lz-break" style="left:' + (starts[i + 1] - BREAK / 2).toFixed(2) + '%;width:' + (BREAK - .6) + '%"><span>' + g.away + '</span></span>'; }).join('');
    html += '<div class="lz-links">' + breaks + links + '<div class="lz-playhead" hidden></div></div>';
    lanes.innerHTML = html;

    var show = function (e) {
      $('#detail').innerHTML = '<div><time>' + e.time + '</time><h4>' + e.title + '</h4></div><dl><dt>本人的判断 / 指令</dt><dd>' + e.ask + '</dd></dl><dl><dt>AI 做了什么</dt><dd>' + e.did + '</dd></dl><dl><dt>结果</dt><dd>' + e.res + '</dd><small>来源：' + e.src + '</small></dl>';
    };
    var pick = function (id) {
      $$('.lz-dot', lanes).forEach(function (d) { d.classList.toggle('is-on', d.dataset.ev === id); });
      $$('.lz-link', lanes).forEach(function (d) { d.classList.toggle('is-on', d.dataset.link === id); });
      var e = evById(id); if (e) show(e);
    };
    lanes.addEventListener('click', function (ev) {
      var d = ev.target.closest('[data-ev]');
      if (d) { stopReplay(); pick(d.dataset.ev); }
    });
    pick(R.defaultEvent);

    var pEl = $('#principles');
    pEl.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-p]');
      if (!b) return;
      var on = b.classList.contains('is-on');
      $$('button', pEl).forEach(function (c) { c.classList.remove('is-on'); });
      var ids = on ? null : R.principles[+b.dataset.p].events;
      if (!on) b.classList.add('is-on');
      $$('.lz-dot', lanes).forEach(function (d) { d.classList.toggle('is-dim', !!ids && ids.indexOf(d.dataset.ev) < 0); });
      if (ids) pick(ids[0]);
    });

    var replayT = null;
    function stopReplay() { clearTimeout(replayT); $('.lz-playhead', lanes).hidden = true; }
    $('#replay-process').addEventListener('click', function () {
      var order = R.events.slice().sort(function (a, b) { return a.t - b.t; }), i = 0, head = $('.lz-playhead', lanes);
      head.hidden = false;
      (function step() {
        if (i >= order.length) { replayT = setTimeout(stopReplay, 1200); return; }
        var e = order[i++];
        head.style.left = pct(e.t);
        pick(e.id);
        replayT = setTimeout(step, 1100);
      })();
    });

    var seg = 0;
    $('#mobile-list').innerHTML = R.events.slice().sort(function (a, b) { return a.t - b.t; }).map(function (e) {
      var away = '';
      while (seg + 1 < R.segments.length && e.t >= R.segments[seg + 1].from) { seg++; away += '<li class="away">' + R.segments[seg].away + '</li>'; }
      return away + '<li' + (e.key ? ' class="key"' : '') + '><time>' + e.time + '</time>' + e.title + '<small>' + e.ask + '</small></li>';
    }).join('');
  }

  /* ———— 顶栏高亮 ———— */
  var links = $$('.bar nav a');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('href') === '#' + e.target.id); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['brief', 'demo', 'plan', 'how', 'scope'].forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
};
