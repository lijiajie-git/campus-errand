/* 引擎：审题动画、舞台布局、步骤状态、自动演示。内容都在 content/ 里。
   状态 = (第几步, 第几拍)，界面是状态算出来的；动画只是装饰，失败不影响状态。 */
(function () {
  var D = window.CONTENT, STEPS = window.STEPS, SCREENS = window.SCREENS, WIDGETS = window.WIDGETS;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SOLO_W = 900, PW = 428, PH = 800, CAP = 22;

  var S = { step: 0, beat: 0, auto: false, timer: null, free: {}, claimCase: 'normal', started: false, soloWho: 'L', lastLayout: null };

  /* ———— 手机外框 ———— */
  var SIGNAL = '<svg width="66" height="14" viewBox="0 0 66 14" fill="currentColor"><rect x="0" y="9" width="3" height="4" rx=".8"/><rect x="5" y="6" width="3" height="7" rx=".8"/><rect x="10" y="3" width="3" height="10" rx=".8"/><rect x="15" y="0" width="3" height="13" rx=".8"/><rect x="30" y="1" width="30" height="12" rx="3.500" fill="none" stroke="currentColor" opacity=".45"/><rect x="32" y="3" width="24" height="8" rx="2"/><rect x="61" y="5" width="2" height="4" rx="1" opacity=".5"/></svg>';
  var CAPSULE = '<div class="mp-capsule"><i><svg width="20" height="6" viewBox="0 0 20 6" fill="#111"><circle cx="3" cy="3" r="2"/><circle cx="10" cy="3" r="2.600"/><circle cx="17" cy="3" r="2"/></svg></i><i><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#111" stroke-width="1.500"><circle cx="9" cy="9" r="7"/><circle cx="9" cy="9" r="2" fill="#111" stroke="none"/></svg></i></div>';
  var TABS = [['home', '首页', 'home'], ['order', '订单', 'hall'], ['circle', '圈子', 'circle'], ['me', '我的', 'me']];
  function tabbar(active) {
    return '<div class="weui-tabbar">' + TABS.map(function (t, i) {
      var on = i === active, c = on ? '#07c160' : '#555';
      return '<div class="weui-tabbar__item' + (on ? ' weui-bar__item_on' : '') + '" data-nav="' + t[2] + '|{}"><span class="weui-tabbar__icon" style="color:' + c + ';display:flex;justify-content:center">' + window.MP_ICON(t[0], 26, 1.6) + '</span><p class="weui-tabbar__label" style="color:' + (on ? '#07c160' : 'rgba(0,0,0,.6)') + '">' + t[1] + '</p></div>';
    }).join('') + '</div>';
  }
  function phoneHTML(id) {
    return '<div class="ph off" data-ph="' + id + '"><div class="ph-cap"></div><div class="ph-frame"><div class="device device-iphone-14-pro"><div class="device-frame"><div class="device-screen"><div class="mp"><div class="mp-status"><span>9:41</span>' + SIGNAL + '</div><div class="mp-nav"><a class="nav-back" hidden data-back>' + window.MP_ICON('back', 22, 2) + '</a><span data-title></span>' + CAPSULE + '</div><div class="mp-body" data-body></div><div data-tab></div><div class="mp-home"></div></div></div></div><div class="device-stripe"></div><div class="device-header"></div><div class="device-sensors"></div><div class="device-btns"></div><div class="device-power"></div></div></div><a class="ph-over" hidden><span>点进去看</span></a></div>';
  }

  var IDS = ['L', 'R', 'C', 'D'], ph = {}, stageMain, sideEl, phonesEl;

  /* ———— 从第一拍累积到当前拍 ———— */
  function beatState(stepIdx, beatIdx) {
    var st = STEPS[stepIdx], out = { L: null, R: null, w: st.side.w, rule: st.side.rule, note: st.side.note };
    for (var i = 0; i <= beatIdx; i++) {
      var b = st.beats[i];
      if (b.L) out.L = b.L;
      if (b.R) out.R = b.R;
      if (b.w) out.w = b.w;
      if (b.rule) out.rule = b.rule;
      if (b.note) out.note = b.note;
    }
    return out;
  }

  /* ———— 布局 ———— */
  function layoutPhones(animate) {
    var st = STEPS[S.step], solo = innerWidth < SOLO_W;
    document.documentElement.classList.toggle('solo', solo);
    stageMain.classList.toggle('is-four', st.layout === 4);
    var used = st.layout === 4 ? IDS : st.layout === 2 ? ['L', 'R'] : st.layout === 1 ? [st.solo || 'L'] : [];
    if (!animate) stageMain.classList.add('no-anim');

    if (solo) {
      phonesEl.classList.toggle('phones-four', st.layout === 4);
      var four = st.layout === 4;
      var vw = document.documentElement.clientWidth;
      var k = four ? Math.min(.62, (vw - 64) / 390) : vw / 390;
      var who = st.layout === 2 ? S.soloWho : st.solo;
      IDS.forEach(function (id) {
        var on = four ? true : (st.layout === 0 ? false : id === who);
        ph[id].classList.toggle('off', !on);
        ph[id].style.setProperty('--k', k.toFixed(4));
        ph[id].style.setProperty('--pw', (390 * k) + 'px');
        ph[id].style.setProperty('--ph', (762 * k) + 'px');
        ph[id].style.transform = '';
      });
      sideEl.removeAttribute('style');
      $('.solo-switch').hidden = st.layout !== 2;
      $$('.solo-switch button').forEach(function (b) { b.classList.toggle('is-on', b.dataset.solo === who); });
    } else {
      IDS.forEach(function (id) { $('.ph-frame', ph[id]).style.transform = ''; });
      var W = stageMain.clientWidth, H = stageMain.clientHeight, pad = 32, gap = 16, m = 8;
      var pos = {}, side = {};
      if (st.layout === 4) {
        var top = 78;
        var k4 = Math.min(1, (W - 2 * pad - 3 * gap) / (4 * PW), (H - top - CAP - m) / PH);
        var x0 = (W - (4 * PW * k4 + 3 * gap)) / 2;
        IDS.forEach(function (id, i) { pos[id] = { x: x0 + i * (PW * k4 + gap), y: top + CAP, k: k4 }; });
        side = { left: Math.max(pad, x0), top: 10, width: W - 2 * Math.max(pad, x0), height: top - 12 };
      } else if (st.layout === 2) {
        var minSide = 300, k2 = Math.min(1, (H - CAP - m * 2) / PH, (W - 2 * pad - minSide - 2 * gap) / (2 * PW));
        var pw = PW * k2, sw = Math.min(W - 2 * pad - 2 * pw - 2 * gap, 560);
        var gx = (W - (2 * pw + sw + 2 * gap)) / 2, y = (H - PH * k2 + CAP) / 2;
        pos.L = { x: gx, y: y, k: k2 }; pos.R = { x: gx + pw + sw + 2 * gap, y: y, k: k2 };
        side = { left: gx + pw + gap, top: 0, width: sw, height: H };
      } else if (st.layout === 1) {
        var k1 = Math.min(1, (H - CAP - m * 2) / PH), p1 = PW * k1;
        var s1 = Math.min(W - 2 * pad - p1 - 56, 640);
        var gx1 = (W - (p1 + s1 + 56)) / 2, y1 = (H - PH * k1 + CAP) / 2;
        pos[st.solo || 'L'] = { x: gx1, y: y1, k: k1 };
        side = { left: gx1 + p1 + 56, top: 0, width: s1, height: H };
      } else {
        var s0 = Math.min(W - 2 * pad - 32, 1200);
        side = { left: (W - s0) / 2, top: 0, width: s0, height: H };
      }
      IDS.forEach(function (id) {
        var p = pos[id], on = used.indexOf(id) >= 0;
        ph[id].classList.toggle('off', !on);
        if (p) {
          ph[id].style.transform = 'translate(' + p.x + 'px,' + p.y + 'px) scale(' + p.k + ')';
          ph[id].style.setProperty('--k', p.k.toFixed(4));
        }
      });
      Object.keys(side).forEach(function (k) { sideEl.style[k] = side[k] + 'px'; });
    }
    if (!animate) { void stageMain.offsetWidth; stageMain.classList.remove('no-anim'); }
  }

  /* ———— 渲染一台手机 ———— */
  function renderPhone(id, spec) {
    var el = ph[id], use = S.free[id] || spec;
    if (!use) return;
    var name = use[0], args = use[1] || {};
    var key = name + JSON.stringify(args) + S.claimCase;
    if (el.dataset.key === key) return;
    var slide = el.dataset.name !== name;
    var out;
    try { out = SCREENS[name](args, { who: id }); } catch (e) { console.error(e); return; }
    el.dataset.key = key; el.dataset.name = name;
    $('[data-title]', el).textContent = out.title || '';
    $('[data-back]', el).hidden = !out.back;
    $('[data-tab]', el).innerHTML = out.tab == null ? '' : tabbar(out.tab);
    var body = $('[data-body]', el);
    body.innerHTML = out.html;
    var view = body.firstElementChild;
    if (slide && !reduced && view) view.classList.add('view-in');
    var bottom = $('[data-bottom]', el);
    if (bottom) bottom.scrollTop = bottom.scrollHeight;
    countUp(el);
  }

  function countUp(root) {
    if (reduced) return;
    $$('[data-count]', root).forEach(function (n) {
      var p = n.dataset.count.split(':'), a = +p[0], b = +p[1], f = +p[2] || 0, t0 = null;
      n.textContent = a.toFixed(f);
      var tick = function (t) {
        if (t0 == null) t0 = t;
        var r = Math.min(1, (t - t0) / 1100);
        n.textContent = (a + (b - a) * r * (2 - r)).toFixed(f);
        if (r < 1) requestAnimationFrame(tick);
      };
      setTimeout(function () { requestAnimationFrame(tick); }, 300);
      setTimeout(function () { n.textContent = b.toFixed(f); }, 1800);
    });
  }

  /* ———— 说明栏 ———— */
  function renderSide(fresh, bs) {
    var st = STEPS[S.step], s = st.side;
    var w = bs.w ? WIDGETS[bs.w[0]](bs.w[1] || {}) : '';
    var html = '<div class="eyebrow">' + s.eyebrow + '</div>' +
      (s.title ? '<h2>' + s.title + '</h2>' : '') +
      (bs.rule ? '<div class="st-rule">' + bs.rule + '</div>' : '') +
      (bs.note ? '<div class="st-note">' + bs.note + '</div>' : '') + w +
      (s.foot ? '<div class="st-foot">' + s.foot + '</div>' : '');
    if (sideEl.dataset.html === html) return;
    sideEl.dataset.html = html;
    sideEl.innerHTML = html;
    sideEl.classList.toggle('side-four', st.layout === 4);
    if (fresh && !reduced) { sideEl.classList.remove('side-fade'); void sideEl.offsetWidth; sideEl.classList.add('side-fade'); }
  }

  function renderRail() {
    $$('.rail-steps button').forEach(function (b, i) {
      b.classList.toggle('is-on', i === S.step);
      b.classList.toggle('is-past', i < S.step);
    });
    if (innerWidth < SOLO_W) {
      var on = $('.rail-steps .is-on'), box = $('.rail-steps');
      if (on && box) box.scrollLeft = on.offsetLeft - box.clientWidth / 2 + on.clientWidth / 2;
    }
  }
  function setMode(m) {
    var el = $('#mode');
    el.dataset.mode = m;
    el.textContent = m === 'auto' ? '自动演示中' : m === 'manual' ? '手动操作中' : '演示结束';
    $('#auto-btn').textContent = m === 'auto' ? '暂停' : '继续自动';
  }

  /* ———— 进入某个状态 ———— */
  function apply(prevStep) {
    var st = STEPS[S.step], b = st.beats[S.beat], bs = beatState(S.step, S.beat);
    var layoutChanged = S.lastLayout !== st.layout + '|' + (st.solo || '');
    var freshStep = prevStep !== S.step;
    S.lastLayout = st.layout + '|' + (st.solo || '');
    if (b.focus) S.soloWho = b.focus;
    else if (freshStep && st.layout === 2 && !b.focus) S.soloWho = 'L';

    renderSide(freshStep, bs);
    if (st.layout === 4) {
      st.four.forEach(function (f, i) {
        var id = IDS[i];
        renderPhone(id, f.s);
        var cap = $('.ph-cap', ph[id]);
        cap.innerHTML = '<b>' + f.cap + '</b>';
        var ov = $('.ph-over', ph[id]);
        ov.hidden = false; ov.dataset.goto = f.go;
      });
    } else {
      IDS.forEach(function (id) {
        $('.ph-over', ph[id]).hidden = true;
        var who = D.who[id];
        if (who) $('.ph-cap', ph[id]).innerHTML = '<b>' + who.role + ' · ' + who.name + '</b>';
      });
      if (st.layout > 0) { renderPhone('L', bs.L); renderPhone('R', bs.R); }
    }
    layoutPhones(true);
    renderRail();
    if (b.toast) setTimeout(function () { toast(b.toast[0], b.toast[1]); }, 120);
    if (b.fx === 'fly') { try { fly(layoutChanged ? 480 : 40); } catch (e) { console.error(e); } }
  }

  function goTo(step, beat) {
    var prev = S.step;
    S.free = {};
    S.step = step; S.beat = beat || 0;
    apply(prev);
    if (S.auto) schedule(); else armPass();
  }
  /* 过程动画（核验中、解析中、思维链）手动时也自己走完，不用点 */
  function armPass() {
    clearTimeout(S.passT);
    var b = STEPS[S.step].beats[S.beat];
    if (b.pass && !S.auto) S.passT = setTimeout(function () { if (!S.auto) advance(); }, b.ms || 1500);
  }
  function idxOf(id) { for (var i = 0; i < STEPS.length; i++) if (STEPS[i].id === id) return i; return 0; }

  function advance() {
    var st = STEPS[S.step];
    if (S.beat + 1 < st.beats.length) { goTo(S.step, S.beat + 1); return true; }
    if (S.step + 1 < STEPS.length) { goTo(S.step + 1, 0); return true; }
    return false;
  }

  /* ———— 自动演示：一碰就交给人 ———— */
  function schedule() {
    clearTimeout(S.timer);
    var st = STEPS[S.step], b = st.beats[S.beat];
    var extra = S.beat === 0 && st.layout !== 0 ? 300 : 0;
    S.timer = setTimeout(tick, (b.ms || 2500) + extra);
  }
  function stageInView() {
    var r = $('#demo').getBoundingClientRect();
    return r.top < innerHeight * .6 && r.bottom > innerHeight * .4;
  }
  function tick() {
    if (!S.auto) return;
    if (!stageInView()) { S.timer = setTimeout(tick, 500); return; }
    if (S.step === STEPS.length - 1 && S.beat === STEPS[S.step].beats.length - 1) { S.auto = false; setMode('done'); return; }
    advance();
  }
  function play() { clearTimeout(S.passT); S.auto = true; S.started = true; setMode('auto'); schedule(); }
  function takeOver() {
    S.started = true;
    if (S.timer) clearTimeout(S.timer);
    S.auto = false; setMode('manual');
    armPass();
  }
  function replay() {
    S.free = {}; S.claimCase = 'normal';
    S.lastLayout = null;
    S.step = 0; S.beat = 0;
    apply(-1);
    play();
  }

  /* ———— 飞卡 ———— */
  function fly(delay) {
    if (reduced || innerWidth < SOLO_W) return;
    setTimeout(function () {
      var dock = $('.dock', sideEl);
      var src = $('[data-fly-src]', ph.L), dst = $('[data-fly-dst]', ph.R);
      var layer = $('#fly-layer');
      if (!dst) return;
      var tmp = document.createElement('div');
      tmp.innerHTML = dst.outerHTML;
      var el = tmp.firstElementChild;
      el.classList.remove('land');
      layer.appendChild(el);
      var b = dst.getBoundingClientRect();
      var k = b.width / 366;
      var a = src ? src.getBoundingClientRect() : ph.L.getBoundingClientRect();
      var ax = a.left + a.width - b.width, ay = Math.max(40, a.top - b.height * .6);
      var v = dock ? dock.getBoundingClientRect() : b;
      var vx = v.left + v.width / 2 - b.width / 2, vy = v.top + v.height / 2 - b.height / 2;
      var tr = function (x, y, s, r) { return 'translate(' + x + 'px,' + y + 'px) rotate(' + (r || 0) + 'deg) scale(' + s + ')'; };
      if (dock) dock.classList.add('is-live');
      var clean = function () { el.remove(); if (dock) dock.classList.remove('is-live'); };
      var an = el.animate([
        { transform: tr(ax, ay, k * .92, 0), opacity: .6, offset: 0, easing: 'cubic-bezier(.22,.8,.2,1)' },
        { transform: tr(vx, vy, k * 1.02, -1.2), opacity: 1, offset: .42 },
        { transform: tr(vx, vy, k * 1.02, -1.2), offset: .62, easing: 'cubic-bezier(.5,0,.15,1)' },
        { transform: tr(b.left, b.top, k, 0), offset: 1 }
      ], { duration: 1300, fill: 'forwards' });
      an.finished.then(clean, clean);
      setTimeout(clean, 2000);
    }, delay);
  }

  function toast(id, text) {
    if (!ph[id]) return;
    var mp = $('.mp', ph[id]), el = document.createElement('div');
    el.className = 'mp-toast';
    el.innerHTML = '<i class="weui-icon-success-no-circle"></i>' + text;
    mp.appendChild(el);
    setTimeout(function () { el.remove(); }, 1500);
  }

  /* ———— 点击 ———— */
  function bindStage() {
    var demo = $('#demo');
    demo.addEventListener('pointerdown', function (e) {
      if (e.target.closest('[data-ctl="auto"],[data-ctl="replay"]')) return;
      if (S.auto) takeOver();
    });
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target;
      if (!t) return;
      var n;
      if ((n = t.closest('[data-case]'))) { S.claimCase = n.dataset.case; apply(S.step); return; }
      if ((n = t.closest('[data-nav]'))) {
        var phone = n.closest('[data-ph]');
        if (!phone) return;
        var p = n.dataset.nav.split('|'), id = phone.dataset.ph;
        takeOver();
        if (STEPS[S.step].layout === 4) { goTo(idxOf(p[0] === 'me' ? 'settle' : p[0] === 'hall' ? 'hall' : p[0] === 'circle' ? 'circle' : 'home')); return; }
        S.free[id] = [p[0], JSON.parse(p[1] || '{}')];
        renderPhone(id, null);
        if (n.hasAttribute('data-next')) toast(id, '已提交举报');
        return;
      }
      if ((n = t.closest('[data-goto]'))) {
        takeOver();
        goTo(idxOf(n.dataset.goto));
        if (!n.closest('#demo')) $('#demo').scrollIntoView();
        return;
      }
      if ((n = t.closest('[data-next]')) && n.closest('[data-ph]')) { takeOver(); advance(); return; }
      if ((n = t.closest('[data-back]'))) {
        var ph2 = n.closest('[data-ph]').dataset.ph;
        takeOver();
        if (S.free[ph2]) { delete S.free[ph2]; apply(S.step); }
        else if (S.beat > 0) goTo(S.step, S.beat - 1);
        else if (S.step > 0) goTo(S.step - 1);
        return;
      }
      if ((n = t.closest('[data-step]'))) { takeOver(); goTo(+n.dataset.step); return; }
      if ((n = t.closest('[data-solo]'))) { takeOver(); S.soloWho = n.dataset.solo; layoutPhones(false); return; }
      if ((n = t.closest('[data-ctl]'))) {
        var k = n.dataset.ctl;
        if (k === 'next') { takeOver(); advance(); }
        if (k === 'prev') { takeOver(); if (S.beat > 0) goTo(S.step, S.beat - 1); else if (S.step > 0) goTo(S.step - 1); }
        if (k === 'replay') replay();
        if (k === 'auto') { if (S.auto) takeOver(); else if (S.step === STEPS.length - 1 && S.beat === STEPS[S.step].beats.length - 1) replay(); else play(); }
      }
    });
    document.addEventListener('keydown', function (e) {
      if (!stageInView()) return;
      if (e.key === 'ArrowRight') { takeOver(); advance(); }
      if (e.key === 'ArrowLeft') { takeOver(); if (S.step > 0) goTo(S.step - 1); }
    });
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { layoutPhones(false); drawBriefMarks(true); }, 80);
    });
  }

  /* ———— 审题 ———— */
  var briefTimers = [];
  function renderBrief() {
    var B = D.brief;
    var paras = B.paper.map(function (p) {
      return '<p>' + p.replace(/\[\[(\w+)\|(.+?)\]\]/g, '<em data-k="$1">$2</em>') + '</p>';
    }).join('');
    var notes = Object.keys(B.notes).map(function (k) { return '<div class="pn" data-n="' + k + '">' + B.notes[k] + '</div>'; }).join('');
    var margin = B.margin.replace(/，不做/, '，<u>不做</u>');
    var hl = B.highlights.map(function (h, i) { return '<button class="hl" data-goto="' + h.go + '"><i>' + (i + 1) + '</i><div><b>' + h.h + '</b><span>' + h.p + '</span></div></button>'; }).join('');
    $('#brief').innerHTML = '<div class="paper"><button class="paper-skip" id="skip">' + B.skip + '</button><div class="paper-g"><div class="paper-text"><h3>' + B.paperTitle + '</h3>' + paras + '<div class="paper-margin">' + margin + '</div></div><div class="paper-notes">' + notes + '</div></div><svg class="paper-svg"></svg></div>' +
      '<div class="sum"><div class="eyebrow">' + B.eyebrow + '</div><h1>' + D.oneLine + '</h1><h4>' + B.highlightsTitle + '</h4>' + hl + '<div class="parts"><h4>' + B.partsTitle + '</h4><p>' + B.parts.join(' · ') + '</p></div><div class="cta"><button class="cta-1" id="cta-auto">' + B.ctaAuto + '</button><button class="cta-2" id="cta-free">' + B.ctaFree + '</button><small>' + B.ctaAutoNote + '</small></div></div>';
    $('#skip').addEventListener('click', function () { finishBrief(); });
    $('#cta-auto').addEventListener('click', function () {
      finishBrief();
      S.free = {}; S.step = 0; S.beat = 0; S.lastLayout = null;
      apply(-1); play();
      $('#demo').scrollIntoView();
    });
    $('#cta-free').addEventListener('click', function () {
      finishBrief(); takeOver();
      goTo(0);
      $('#demo').scrollIntoView();
    });
  }
  /* 手画的圈：两段贝塞尔，首尾略微错开 */
  function scribble(x, y, w, h, seed) {
    var rx = w / 2 + 6, ry = h / 2 + 3, cx = x + w / 2, cy = y + h / 2, j = (seed % 3 - 1) * 1.2;
    return 'M' + (cx - rx * .75) + ' ' + (cy - ry * .85 + j) +
      'C' + (cx - rx * .1) + ' ' + (cy - ry * 1.35) + ' ' + (cx + rx * 1.05) + ' ' + (cy - ry * 1.15 + j) + ' ' + (cx + rx * 1.02) + ' ' + cy +
      'C' + (cx + rx * 1) + ' ' + (cy + ry * 1.2) + ' ' + (cx - rx * .7) + ' ' + (cy + ry * 1.3 - j) + ' ' + (cx - rx * 1.02) + ' ' + (cy + ry * .1) +
      'C' + (cx - rx * 1.1) + ' ' + (cy - ry * .6) + ' ' + (cx - rx * .55) + ' ' + (cy - ry * 1.05) + ' ' + (cx - rx * .1) + ' ' + (cy - ry * 1.12);
  }
  function drawBriefMarks(instant) {
    var paper = $('.paper'), svg = $('.paper-svg');
    if (!paper) return;
    var pr = paper.getBoundingClientRect(), notesBox = $('.paper-notes').getBoundingClientRect();
    /* 旋转角很小，坐标误差可以忽略 */
    var B = D.brief, y = 0, paths = '';
    var items = $$('em[data-k]', paper).map(function (em) { return { k: em.dataset.k, r: em.getClientRects()[0] || em.getBoundingClientRect(), em: em }; }).sort(function (a, b) { return a.r.top - b.r.top; });
    items.forEach(function (it, i) {
      var note = $('[data-n="' + it.k + '"]', paper);
      var h = note.offsetHeight || 22;
      var want = it.r.top + it.r.height / 2 - notesBox.top - h / 2;
      var top = Math.max(want, y);
      note.style.top = top + 'px';
      y = top + h + 6;
      var nx = notesBox.left - pr.left + (innerWidth < SOLO_W ? 10 : 20), ny = top + notesBox.top - pr.top + h / 2;
      var ex = it.r.right - pr.left + 6, ey = it.r.top - pr.top + it.r.height / 2;
      paths += '<path pathLength="1" class="off" data-c="' + it.k + '" d="' + scribble(it.r.left - pr.left, it.r.top - pr.top, it.r.width, it.r.height, i) + '"/>' +
        '<path pathLength="1" class="off" data-l="' + it.k + '" d="M' + ex + ' ' + ey + 'Q' + (ex + nx) / 2 + ' ' + (ey + ny) / 2 + ' ' + nx + ' ' + ny + '" style="stroke-width:1;opacity:.55"/>';
    });
    svg.innerHTML = paths;
    if (instant || S.briefDone) showAllMarks();
  }
  function showAllMarks() {
    $$('.paper-svg path').forEach(function (p) { p.style.transition = 'none'; p.classList.remove('off'); });
    $$('.pn').forEach(function (n) { n.classList.remove('off'); });
    var m = $('.paper-margin'); if (m) m.classList.remove('off');
  }
  function finishBrief() {
    S.briefDone = true;
    briefTimers.forEach(clearTimeout);
    showAllMarks();
    var skip = $('#skip'); if (skip) skip.classList.add('done');
  }
  function playBrief() {
    if (reduced) { finishBrief(); return; }
    $$('.pn').forEach(function (n) { n.classList.add('off'); });
    $('.paper-margin').classList.add('off');
    var order = D.brief.order, gap = 1050, t = 500;
    order.forEach(function (k, i) {
      briefTimers.push(setTimeout(function () {
        var c = $('[data-c="' + k + '"]'), l = $('[data-l="' + k + '"]'), n = $('[data-n="' + k + '"]');
        if (c) c.classList.remove('off');
        briefTimers.push(setTimeout(function () { if (l) l.classList.remove('off'); if (n) n.classList.remove('off'); }, 380));
      }, t + i * gap));
    });
    briefTimers.push(setTimeout(function () { $('.paper-margin').classList.remove('off'); }, t + order.length * gap + 200));
    briefTimers.push(setTimeout(finishBrief, t + order.length * gap + 1300));
  }

  /* ———— 启动 ———— */
  function init() {
    window.APP = { claimCase: function () { return S.claimCase; } };
    renderBrief();
    stageMain = $('#st-main'); sideEl = $('#st-side'); phonesEl = $('#phones');
    phonesEl.innerHTML = IDS.map(phoneHTML).join('');
    IDS.forEach(function (id) { ph[id] = $('[data-ph="' + id + '"]', phonesEl); });
    $('#rail-steps').innerHTML = STEPS.map(function (s, i) { return '<button data-step="' + i + '" title="' + s.side.eyebrow + '">' + s.name + '</button>'; }).join('');
    document.documentElement.classList.toggle('solo', innerWidth < SOLO_W);
    bindStage();

    if (window.PAGE_EXTRAS) window.PAGE_EXTRAS();

    var q = new URLSearchParams(location.search);
    apply(-1);
    drawBriefMarks(false);
    /* 字体或图片晚到时重新量一次 */
    window.addEventListener('load', function () { drawBriefMarks(false); layoutPhones(false); });

    if (q.get('step')) {
      S.briefDone = true; showAllMarks();
      var b = q.get('beat');
      S.step = idxOf(q.get('step'));
      S.beat = b === 'last' ? STEPS[S.step].beats.length - 1 : +(b || 0);
      S.lastLayout = null;
      apply(-1); takeOver();
      $('#demo').scrollIntoView({ behavior: 'instant' });
      return;
    }
    playBrief();

    /* 演示区进入视野时自动开始（只一次） */
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !S.started) { S.started = true; finishBrief(); play(); }
      });
    }, { threshold: .6 });
    io.observe($('#demo'));
    setMode('manual');
    $('#mode').textContent = '等待开始';
    $('#auto-btn').textContent = '自动播放';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
