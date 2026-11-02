/* 引擎：审题动画、舞台布局、步骤状态、自动演示。内容都在 content/ 里。
   状态 = (第几步, 第几拍)，界面是状态算出来的；动画只是装饰，失败不影响状态。 */
(function () {
  var D = window.CONTENT, STEPS = window.STEPS, SCREENS = window.SCREENS, WIDGETS = window.WIDGETS;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SOLO_W = 900, PW = 428, PH = 800, CAP = 22;

  /* 观看顺序：看完演示才解锁方案、过程和 Scope */
  var LOCK_KEY = 'campus-errand-unlocked';
  document.documentElement.classList.add('locked');
  function readUnlocked() { try { return localStorage.getItem(LOCK_KEY) === '1'; } catch (e) { return false; } }
  function writeUnlocked(v) { try { if (v) localStorage.setItem(LOCK_KEY, '1'); else localStorage.removeItem(LOCK_KEY); } catch (e) { /* 读写不了就按未解锁处理 */ } }

  var S = { step: 0, beat: 0, auto: false, timer: null, free: {}, claimCase: 'normal', started: false, soloWho: 'L', lastLayout: null, order: null };
  var CHAT = { msgs: [], sent: [], done: 0, manual: false };

  /* ———— 订单：规格和保险是真状态，合计算出来 ———— */
  function resetOrder() { S.order = JSON.parse(JSON.stringify(D.orderDefault)); }
  function orderInfo() {
    var o = S.order, fee = 0, count = 0;
    D.specs.forEach(function (s) { if (o.specs[s.k]) { fee += s.fee; count++; } });
    if (o.precious) { fee += D.precious.fee; count++; }
    var insured = !!o.insured, insFee = insured ? D.insurance.fee : 0;
    return { specs: o.specs, precious: !!o.precious, insured: insured, count: count, fee: fee, insFee: insFee, total: fee + insFee };
  }

  /* ———— 聊天：手动和自动演示都走 chatSend ———— */
  function chatDraft(me) {
    for (var i = 0; i < D.chat.length; i++) if (!CHAT.sent[i] && D.chat[i].from === me) return D.chat[i].t;
    return D.chatFallback[me];
  }
  function chatNext() {
    for (var i = 0; i < D.chat.length; i++) if (!CHAT.sent[i] && D.chat[i].from) return D.chat[i].from;
    return null;
  }
  function chatAppend(m, sender) {
    ['L', 'R'].forEach(function (id) {
      var box = $('[data-bottom]', ph[id]);
      if (!box) return;
      var cls = m.card ? 'in-late' : id === sender ? 'in' : 'in-late';
      box.insertAdjacentHTML('beforeend', window.CHAT_MSG(m, id, cls));
      box.scrollTop = box.scrollHeight;
    });
  }
  function chatSend(me) {
    var input = $('[data-chat-input]', ph[me]);
    var text = (input ? input.value : chatDraft(me)).trim();
    if (!text) return false;
    for (var i = 0; i < D.chat.length; i++) if (!CHAT.sent[i] && D.chat[i].from === me) { CHAT.sent[i] = true; break; }
    var m = { from: me, t: text };
    CHAT.msgs.push(m);
    chatAppend(m, me);
    if (input) { input.value = chatDraft(me); delete input.dataset.touched; }
    /* 投保提示卡：它前面的消息都发完了，就自动出现 */
    D.chat.forEach(function (c, i) {
      if (!c.card || CHAT.sent[i]) return;
      for (var j = 0; j < i; j++) if (!CHAT.sent[j]) return;
      CHAT.sent[i] = true;
      var card = { card: c.card };
      CHAT.msgs.push(card);
      chatAppend(card, null);
    });
    applyCues();
    return true;
  }
  function chatReset() {
    CHAT.msgs = []; CHAT.sent = []; CHAT.done = 0; CHAT.manual = false;
    ['L', 'R'].forEach(function (id) { if (ph[id] && ph[id].dataset.name === 'chat') delete ph[id].dataset.key; });
  }
  function chatSync() {
    var st = STEPS[S.step], sends = [];
    for (var i = 0; i <= S.beat; i++) if (st.beats[i].send) sends.push(st.beats[i].send);
    if (CHAT.manual) return;
    while (CHAT.done < sends.length) chatSend(sends[CHAT.done++]);
  }

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
    return '<div class="ph off" data-ph="' + id + '"><div class="ph-cap"></div><div class="ph-frame"><div class="device device-iphone-14-pro"><div class="device-frame"><div class="device-screen"><div class="mp"><div class="mp-status"><span>9:41</span>' + SIGNAL + '</div><div class="mp-nav"><a class="nav-back" hidden data-back>' + window.MP_ICON('back', 22, 2) + '</a><span data-title></span>' + CAPSULE + '</div><div class="mp-body" data-body></div><div data-tab></div><div class="mp-home"></div></div></div></div><div class="device-stripe"></div><div class="device-header"></div><div class="device-sensors"></div><div class="device-btns"></div><div class="device-power"></div></div></div></div>';
  }

  var IDS = ['L', 'R'], ph = {}, stageMain, sideEl, phonesEl;

  /* ———— 从第一拍累积到当前拍 ———— */
  function beatState(stepIdx, beatIdx) {
    var st = STEPS[stepIdx], out = { L: null, R: null, w: st.side.w, rule: st.side.rule, note: st.side.note, title: st.side.title, eyebrow: st.side.eyebrow, basis: st.side.basis, cta: st.cta, link: st.link };
    for (var i = 0; i <= beatIdx; i++) {
      var b = st.beats[i];
      if (b.L) out.L = b.L;
      if (b.R) out.R = b.R;
      if (b.w) out.w = b.w;
      if (b.title) out.title = b.title;
      if (b.eyebrow) out.eyebrow = b.eyebrow;
      if (b.basis !== undefined) out.basis = b.basis;
      if (b.cta !== undefined) out.cta = b.cta;
      if (b.link !== undefined) out.link = b.link;
      if (b.rule !== undefined) out.rule = b.rule;
      if (b.note !== undefined) out.note = b.note;
    }
    if (st.overview) {
      out.ovSel = S.overPick == null ? beatIdx : S.overPick;
      out.w = ['homeGuide', { sel: out.ovSel, shown: S.auto ? beatIdx + 1 : D.homeGuide.items.length }];
    }
    return out;
  }
  function gotoSpec(spec) {
    var g = spec.split(':');
    goTo(idxOf(g[0]), +g[1] || 0);
  }

  /* ———— 布局 ———— */
  function layoutPhones(animate) {
    var st = STEPS[S.step], solo = innerWidth < SOLO_W;
    document.documentElement.classList.toggle('solo', solo);
    var used = st.layout === 2 ? ['L', 'R'] : st.layout === 1 ? [st.solo || 'L'] : [];
    if (!animate) stageMain.classList.add('no-anim');

    if (solo) {
      var vw = document.documentElement.clientWidth;
      /* 手机放在最前面：缩到底部轨道之上能放下整屏，主按钮不被盖住 */
      var avail = innerHeight - $('.bar').offsetHeight - $('.rail').offsetHeight - (st.layout === 2 ? 46 : 0) - 8;
      var k = Math.min(vw / 390, Math.max(.72, avail / 762));
      var who = st.layout === 2 ? S.soloWho : st.solo;
      IDS.forEach(function (id) {
        var on = st.layout === 0 ? false : id === who;
        ph[id].classList.toggle('off', !on);
        ph[id].style.setProperty('--k', k.toFixed(4));
        ph[id].style.setProperty('--pw', (390 * k) + 'px');
        ph[id].style.setProperty('--ph', (762 * k) + 'px');
        ph[id].style.transform = '';
      });
      sideEl.removeAttribute('style');
      $('.solo-switch').hidden = st.layout !== 2;
      $$('.solo-switch button').forEach(function (b) { b.classList.toggle('is-on', b.dataset.solo === who); });
      $$('[data-bottom]', phonesEl).forEach(function (x) { x.scrollTop = x.scrollHeight; });
    } else {
      IDS.forEach(function (id) { $('.ph-frame', ph[id]).style.transform = ''; });
      var W = stageMain.clientWidth, H = stageMain.clientHeight, pad = 32, gap = 16, m = 8;
      var pos = {}, side = {};
      if (st.layout === 2) {
        var minSide = 300, k2 = Math.min(1, (H - CAP - m * 2) / PH, (W - 2 * pad - minSide - 2 * gap) / (2 * PW));
        var pw = PW * k2, sw = Math.min(W - 2 * pad - 2 * pw - 2 * gap, 560);
        var gx = (W - (2 * pw + sw + 2 * gap)) / 2, y = (H - PH * k2 + CAP) / 2;
        pos.L = { x: gx, y: y, k: k2 }; pos.R = { x: gx + pw + sw + 2 * gap, y: y, k: k2 };
        side = { left: gx + pw + gap, top: 0, width: sw, height: H };
      } else if (st.layout === 1) {
        var k1 = Math.min(1, (H - CAP - m * 2) / PH), p1 = PW * k1;
        var s1 = Math.min(W - 2 * pad - p1 - 56, st.sideW || 480);
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
    var key = name + JSON.stringify(args) + S.claimCase + JSON.stringify(S.order);
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
    applyCues();
  }

  /* ———— 预交互：下一步提示、因果预告、说明联动。只在 steps.js 里声明 ———— */
  function cueEls(o) {
    var root = o.who === 'side' ? sideEl : ph[o.who];
    if (!root || root.classList.contains('off')) return [];
    return $$(o.sel, root);
  }
  function applyCues() {
    if (!sideEl) return;
    $$('.cue', $('#demo')).forEach(function (el) { el.classList.remove('cue'); el.removeAttribute('data-cue'); el.removeAttribute('data-cue-pos'); });
    var offWho = null;
    if (S.auto) return;
    var atEnd = S.step === STEPS.length - 1 && S.beat === STEPS[S.step].beats.length - 1;
    if (atEnd && S.started) $('#end-btn').classList.add('cue');
    var nextChat = chatNext();
    (beatState(S.step, S.beat).cta || []).forEach(function (c) {
      if ((c.turn && nextChat !== c.who) || (c.done && nextChat)) return;
      if (c.unless && cueEls({ who: c.who, sel: c.unless }).length) return;
      var el = cueEls(c)[0];
      if (!el) { if (ph[c.who] && ph[c.who].classList.contains('off')) offWho = c.who; return; }
      el.classList.add('cue');
      if (c.label) el.setAttribute('data-cue', c.label);
      if (c.pos) el.setAttribute('data-cue-pos', c.pos);
    });
    /* 手机宽度只显示一台：该点的在另一台时，提示切换 */
    if (offWho && !$('.ph:not(.off) .cue', phonesEl) && innerWidth < SOLO_W) { var sw = $('.solo-switch [data-solo="' + offWho + '"]'); if (sw) sw.classList.add('cue'); }
  }
  function clearFx() {
    $$('.fx-target', $('#demo')).forEach(function (el) { el.classList.remove('fx-target'); el.removeAttribute('data-fx-note'); });
  }
  function showFx(list) {
    (list || []).forEach(function (o) {
      cueEls(o).forEach(function (el, i) {
        el.classList.add('fx-target');
        if (o.note && i === 0) el.setAttribute('data-fx-note', o.note);
      });
    });
  }
  function onHover(e) {
    clearFx();
    var t = e.target, bs = beatState(S.step, S.beat);
    if (t.closest('.st-rule, .chain')) { showFx(bs.link); return; }
    if (S.auto) return;
    (bs.cta || []).forEach(function (c) {
      if (c.affects && cueEls(c).some(function (el) { return el.contains(t); })) showFx(c.affects);
    });
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
    var html = '<div class="eyebrow">' + bs.eyebrow + '</div>' +
      (bs.title ? '<h2>' + bs.title + '</h2>' : '') +
      (bs.rule ? '<div class="st-rule' + (bs.link ? ' has-link' : '') + '">' + bs.rule + '</div>' : '') +
      (bs.note ? '<div class="st-note">' + bs.note + '</div>' : '') + w +
      (s.foot ? '<div class="st-foot">' + s.foot + '</div>' : '') +
      (bs.basis ? window.BASIS_HTML(bs.basis) : '');
    if (sideEl.dataset.html === html) return;
    sideEl.dataset.html = html;
    sideEl.innerHTML = html;
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
  function unlock(scroll, persist) {
    S.unlocked = true;
    if (persist !== false) writeUnlocked(true);
    document.documentElement.classList.remove('locked');
    $$('.bar nav a').forEach(function (a) {
      a.classList.remove('is-locked');
      a.removeAttribute('aria-disabled');
      a.removeAttribute('title');
      var ic = $('.nav-lock', a);
      if (ic) ic.remove();
    });
    if (scroll) $('#plan').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }
  function isLockedTarget(href) { return !S.unlocked && /^#(plan|how|scope|research)$/.test(href || ''); }
  function markNavLocked() {
    $$('.bar nav a').forEach(function (a) {
      if (!isLockedTarget(a.getAttribute('href'))) return;
      a.classList.add('is-locked');
      a.setAttribute('aria-disabled', 'true');
      a.setAttribute('title', '看完演示后解锁');
      a.insertAdjacentHTML('beforeend', '<span class="nav-lock">' + window.MP_ICON('lock', 12, 2) + '</span>');
    });
  }
  function lockHint() {
    var el = $('#lock-hint');
    el.textContent = '看完演示后解锁';
    el.hidden = false;
    clearTimeout(S.hintT);
    S.hintT = setTimeout(function () { el.hidden = true; }, 1800);
  }
  /* 结束：自动走完、手动走到最后再继续、点结束按钮。自动走完时，已解锁过就不再滚走 */
  function finishDemo(fromAuto) {
    clearTimeout(S.timer); clearTimeout(S.passT);
    S.auto = false;
    setMode('done');
    var first = !S.unlocked;
    unlock(!fromAuto || first);
  }
  function stepsRemainMs() {
    var ms = 0, st = STEPS[S.step];
    for (var j = S.beat + 1; j < st.beats.length; j++) ms += st.beats[j].ms || 2500;
    for (var i = S.step + 1; i < STEPS.length; i++) {
      STEPS[i].beats.forEach(function (b, k) { ms += (b.ms || 2500) + (k === 0 && STEPS[i].layout !== 0 ? 300 : 0); });
    }
    return ms;
  }
  function updateRemain() {
    var box = $('#remain'), mode = $('#mode-box').dataset.mode;
    if (!box) return;
    if (mode === 'done') { box.textContent = ''; return; }
    var cur = STEPS[S.step].beats[S.beat].ms || 2500;
    var left = S.auto ? Math.max(0, (S.beatEnd || 0) - Date.now()) : (S.started ? cur : cur + 300);
    var sec = Math.ceil((stepsRemainMs() + left) / 1000);
    box.textContent = ' · ' + (S.started ? '还剩 ' : '全程约 ') + Math.floor(sec / 60) + ':' + ('0' + sec % 60).slice(-2);
  }
  function setMode(m) {
    var el = $('#mode');
    $('#mode-box').dataset.mode = m;
    el.textContent = m === 'auto' ? '自动演示中' : m === 'manual' ? '手动操作中' : '演示结束';
    $('#auto-btn').textContent = m === 'auto' ? '暂停' : '继续自动';
    updateRemain();
    applyCues();
  }

  /* ———— 首页讲解：手机里加框，细线连到旁边的讲解 ———— */
  function markOverview(st, bs, layoutChanged) {
    $$('[data-ov]', phonesEl).forEach(function (el) { el.classList.remove('ov-box', 'on'); el.removeAttribute('data-ov'); el.removeAttribute('data-ovn'); });
    clearTimeout(S.ovT);
    if (!st.overview || S.free.L) { $('#ov-lines').innerHTML = ''; return; }
    var shown = bs.w[1].shown;
    D.homeGuide.items.slice(0, shown).forEach(function (it, i) {
      it.boxes.forEach(function (sel) {
        var el = $(sel, ph.L);
        if (!el) return;
        el.classList.add('ov-box');
        el.classList.toggle('on', i === bs.ovSel);
        el.dataset.ov = i;
        el.dataset.ovn = i + 1;
      });
    });
    drawOvLines();
    /* 手机换位的动画结束后再量一次 */
    S.ovT = setTimeout(drawOvLines, layoutChanged ? 520 : 60);
  }
  function drawOvLines() {
    var svg = $('#ov-lines'), st = STEPS[S.step];
    if (!svg) return;
    if (!st.overview || S.free.L || innerWidth < SOLO_W) { svg.innerHTML = ''; return; }
    var base = stageMain.getBoundingClientRect(), phone = ph.L.getBoundingClientRect(), html = '';
    var gutter = phone.right - base.left + 16;
    $$('[data-ov]', phonesEl).forEach(function (el) {
      var i = el.dataset.ov, box = el.getBoundingClientRect(), item = $('[data-ovi="' + i + '"] > i', sideEl);
      if (!item) return;
      var r = item.getBoundingClientRect();
      var x1 = box.right - base.left, y1 = box.top + box.height / 2 - base.top;
      var x2 = r.left - base.left - 4, y2 = r.top + r.height / 2 - base.top;
      var x = gutter + (+i) * 5;
      html += '<path class="' + (el.classList.contains('on') ? 'on' : '') + '" d="M' + x1 + ' ' + y1 + 'H' + x + 'V' + y2 + 'H' + x2 + '"/>';
    });
    svg.innerHTML = html;
  }

  /* ———— 进入某个状态 ———— */
  function apply(prevStep) {
    var st = STEPS[S.step], b = st.beats[S.beat], bs = beatState(S.step, S.beat);
    if (b.order && S.auto) Object.keys(b.order).forEach(function (k) { S.order[k] = b.order[k]; });
    var layoutChanged = S.lastLayout !== st.layout + '|' + (st.solo || '');
    var freshStep = prevStep !== S.step;
    S.lastLayout = st.layout + '|' + (st.solo || '');
    if (st.id === 'chat' && (freshStep || CHAT.done > st.beats.slice(0, S.beat + 1).filter(function (x) { return x.send; }).length)) chatReset();
    if (b.focus) S.soloWho = b.focus;
    else if (freshStep && st.layout === 2 && !b.focus) S.soloWho = 'L';

    renderSide(freshStep, bs);
    IDS.forEach(function (id) {
      var who = D.who[id];
      $('.ph-cap', ph[id]).innerHTML = '<b>' + (st.cap || who.role + ' · ' + who.name) + '</b>';
    });
    if (st.layout > 0) { renderPhone('L', bs.L); renderPhone('R', bs.R); }
    markOverview(st, bs, layoutChanged);
    layoutPhones(true);
    if (st.id === 'chat') chatSync();
    renderRail();
    $('[data-ctl="next"]').textContent = S.step === STEPS.length - 1 && S.beat === st.beats.length - 1 ? '看方案' : '下一步';
    clearFx();
    applyCues();
    if (b.toast) setTimeout(function () { toast(b.toast[0], b.toast[1]); }, 120);
    if (b.fx === 'fly') { try { fly(layoutChanged ? 480 : 40); } catch (e) { console.error(e); } }
    if (b.fx === 'zoomcard') { try { zoomCard(); } catch (e) { console.error(e); } }
  }

  function goTo(step, beat) {
    var prev = S.step;
    S.free = {}; S.overPick = null;
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
    /* 自己发过消息后，下一步直接去交付，不再替人发 */
    if (st.id === 'chat' && CHAT.manual && S.step + 1 < STEPS.length) { goTo(S.step + 1, 0); return true; }
    if (S.beat + 1 < st.beats.length) { goTo(S.step, S.beat + 1); return true; }
    if (S.step + 1 < STEPS.length) { goTo(S.step + 1, 0); return true; }
    return false;
  }
  function nextOrFinish() { if (!advance()) finishDemo(false); }

  /* ———— 自动演示：一碰就交给人 ———— */
  function schedule() {
    clearTimeout(S.timer);
    var st = STEPS[S.step], b = st.beats[S.beat];
    var extra = S.beat === 0 && st.layout !== 0 ? 300 : 0;
    S.beatEnd = Date.now() + (b.ms || 2500) + extra;
    S.timer = setTimeout(tick, (b.ms || 2500) + extra);
  }
  function stageInView() {
    var r = $('#demo').getBoundingClientRect();
    return r.top < innerHeight * .6 && r.bottom > innerHeight * .4;
  }
  function tick() {
    if (!S.auto) return;
    if (!stageInView()) { S.timer = setTimeout(tick, 500); return; }
    if (S.step === STEPS.length - 1 && S.beat === STEPS[S.step].beats.length - 1) { finishDemo(true); return; }
    advance();
  }
  function play() {
    clearTimeout(S.passT);
    S.auto = true; S.started = true; setMode('auto');
    if (STEPS[S.step].overview) apply(S.step);
    schedule();
  }
  function takeOver() {
    S.started = true;
    if (S.timer) clearTimeout(S.timer);
    var wasAuto = S.auto;
    S.auto = false; setMode('manual');
    armPass();
    if (wasAuto && STEPS[S.step].overview) apply(S.step);
  }
  function replay() {
    S.free = {}; S.claimCase = 'normal'; resetOrder();
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

  /* 大厅重点：手机里那张卡放大到说明栏，打码块依次扫过隐私字段 */
  function zoomCard() {
    if (reduced || innerWidth < SOLO_W) return;
    setTimeout(function () {
      var c = $('.hf .bc', sideEl), src = $('[data-fly-dst]', ph.R);
      if (!c || !src) return;
      var a = src.getBoundingClientRect(), b = c.getBoundingClientRect();
      c.animate([
        { transform: 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px) scale(' + a.width / b.width + ')', transformOrigin: '0 0', opacity: .5 },
        { transform: 'none', transformOrigin: '0 0', opacity: 1 }
      ], { duration: 460, easing: 'cubic-bezier(.22,.8,.2,1)' });
    }, 30);
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
    /* 只有点击才转手动；鼠标移动、滚动、触屏划动都不打断自动演示 */
    demo.addEventListener('click', function (e) {
      if (e.target.closest('[data-ctl="auto"],[data-ctl="replay"]')) return;
      if (S.auto) takeOver();
    });
    demo.addEventListener('mouseover', onHover);
    demo.addEventListener('mouseleave', clearFx);
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target;
      if (!t) return;
      var n;
      /* 解锁前：导航和“看依据”只提示，不跳走 */
      var anchor = t.closest('a[href^="#"]');
      if (anchor && isLockedTarget(anchor.getAttribute('href'))) { e.preventDefault(); lockHint(); return; }
      /* 首页讲解：点框或讲解互相高亮；圈子、我的可以进去 */
      if (STEPS[S.step].overview && !S.free.L && (n = t.closest('[data-ov-enter], [data-ov], [data-ovi]'))) {
        var ovi = +(n.dataset.ovEnter || n.dataset.ov || n.dataset.ovi || 0);
        var ovItem = D.homeGuide.items[ovi];
        takeOver();
        if (ovItem.enter && (n.hasAttribute('data-ov-enter') || n.hasAttribute('data-ov'))) {
          if (ovItem.enter.step) goTo(idxOf(ovItem.enter.step));
          else { S.free.L = [ovItem.enter.screen, {}]; apply(S.step); }
        } else { S.overPick = ovi; apply(S.step); }
        return;
      }
      if ((n = t.closest('[data-chat-send]'))) {
        takeOver(); CHAT.manual = true;
        chatSend(n.closest('[data-ph]').dataset.ph);
        return;
      }
      if ((n = t.closest('[data-spec],[data-prec],[data-ins]'))) {
        takeOver();
        var O = S.order;
        if (n.dataset.spec) O.specs[n.dataset.spec] = O.specs[n.dataset.spec] ? 0 : 1;
        else if (n.hasAttribute('data-prec')) O.precious = O.precious ? 0 : 1;
        else O.insured = O.insured ? 0 : 1;
        var who = n.closest('[data-ph]').dataset.ph;
        renderPhone(who, beatState(S.step, S.beat)[who]);
        return;
      }
      if ((n = t.closest('[data-toast]')) && n.closest('[data-ph]')) { takeOver(); toast(n.closest('[data-ph]').dataset.ph, n.dataset.toast); return; }
      if ((n = t.closest('[data-case]'))) { S.claimCase = n.dataset.case; apply(S.step); return; }
      if ((n = t.closest('[data-nav]'))) {
        var phone = n.closest('[data-ph]');
        if (!phone) return;
        var p = n.dataset.nav.split('|'), id = phone.dataset.ph;
        takeOver();
        /* 圈子这一步提交举报：走到最后一拍，提示也就结束了 */
        if (n.hasAttribute('data-next') && STEPS[S.step].id === 'circle') { goTo(S.step, STEPS[S.step].beats.length - 1); return; }
        /* 从“我的”点回首页：回到讲解状态 */
        if (STEPS[S.step].overview && p[0] === 'home') { delete S.free[id]; apply(S.step); return; }
        S.free[id] = [p[0], JSON.parse(p[1] || '{}')];
        renderPhone(id, null);
        if (n.hasAttribute('data-next')) toast(id, '已提交举报');
        return;
      }
      if ((n = t.closest('[data-goto]'))) {
        takeOver();
        gotoSpec(n.dataset.goto);
        if (!n.closest('#demo')) $('#demo').scrollIntoView();
        return;
      }
      if ((n = t.closest('[data-next]')) && n.closest('[data-ph]')) {
        takeOver();
        if (n.dataset.freeGoto && S.free[n.closest('[data-ph]').dataset.ph]) goTo(idxOf(n.dataset.freeGoto));
        else if (n.dataset.jump) goTo(idxOf(n.dataset.jump.split(':')[0]), +n.dataset.jump.split(':')[1]);
        else nextOrFinish();
        return;
      }
      if ((n = t.closest('[data-back]'))) {
        var ph2 = n.closest('[data-ph]').dataset.ph;
        takeOver();
        if (S.free[ph2]) { delete S.free[ph2]; apply(S.step); }
        else if (S.beat > 0) goTo(S.step, S.beat - 1);
        else if (S.step > 0) goTo(S.step - 1);
        return;
      }
      if ((n = t.closest('[data-step]'))) { takeOver(); goTo(+n.dataset.step); return; }
      if ((n = t.closest('[data-solo]'))) { takeOver(); S.soloWho = n.dataset.solo; layoutPhones(false); applyCues(); return; }
      if ((n = t.closest('[data-ctl]'))) {
        var k = n.dataset.ctl;
        if (k === 'next') { takeOver(); nextOrFinish(); }
        if (k === 'end') { takeOver(); finishDemo(false); }
        if (k === 'prev') { takeOver(); if (S.beat > 0) goTo(S.step, S.beat - 1); else if (S.step > 0) goTo(S.step - 1); }
        if (k === 'replay') replay();
        if (k === 'auto') { if (S.auto) takeOver(); else if (S.step === STEPS.length - 1 && S.beat === STEPS[S.step].beats.length - 1) replay(); else play(); }
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.target.matches && e.target.matches('[data-chat-input]')) {
        if (e.key === 'Enter') { e.preventDefault(); takeOver(); CHAT.manual = true; chatSend(e.target.closest('[data-ph]').dataset.ph); }
        return;
      }
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-spec],[data-prec],[data-ins]')) { e.preventDefault(); e.target.click(); return; }
      if (!stageInView()) return;
      if (e.key === 'ArrowRight') { takeOver(); nextOrFinish(); }
      if (e.key === 'ArrowLeft') { takeOver(); if (S.step > 0) goTo(S.step - 1); }
    });
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { layoutPhones(false); drawBriefMarks(true); drawOvLines(); }, 80);
    });
  }

  /* ———— 审题：三种笔法，每一笔让右边长出一行 ———— */
  var briefTimers = [];
  function renderBrief() {
    var B = D.brief;
    var paras = B.paper.map(function (p) {
      return '<p>' + p.replace(/\[\[(\w+)\|(.*?)\]\]/g, function (m, k, t) {
        var mark = B.marks.filter(function (x) { return x.k === k; })[0];
        return '<em class="pen-' + mark.pen + '" data-k="' + k + '">' + t + '</em>';
      }) + '</p>';
    }).join('');
    var notes = B.marks.map(function (m) { return '<div class="pn" data-n="' + m.k + '">' + m.note + '</div>'; }).join('');
    var margin = B.margin.replace(/，不做/, '，<u>不做</u>');
    var pains = B.pains.map(function (p) {
      return '<button class="sol" data-grow="' + p.id + '" data-goto="' + p.go + '"><span class="sol-p">' + p.pain + '</span><i>→</i><span class="sol-s"><b>' + p.name + '</b>' + p.how + '</span></button>';
    }).join('');
    var scope = B.scope.map(function (r) { return '<div class="scp" data-grow="' + r.id + '"><b>' + r.k + '</b><span>' + r.t + '</span></div>'; }).join('');
    $('#brief').innerHTML = '<div class="paper"><button class="paper-skip" id="skip">' + B.skip + '</button><div class="paper-g"><div class="paper-text"><h3>' + B.paperTitle + '</h3>' + paras + '<div class="paper-margin">' + margin + '</div></div><div class="paper-notes">' + notes + '</div></div><svg class="paper-svg"></svg></div>' +
      '<div class="sum"><h1>' + D.oneLine + '</h1><h4>' + B.painTitle + '</h4><div class="sols">' + pains + '</div><h4>' + B.scopeTitle + '</h4><div class="scps">' + scope + '</div><div class="cta"><button class="cta-1" id="cta-auto">' + B.ctaAuto + '</button><button class="cta-2" id="cta-free">' + B.ctaFree + '</button><small>' + B.ctaAutoNote + '</small></div><p class="res-line" data-grow="res">' + B.researchLine + ' <a href="#research">' + B.researchLink + '</a></p></div>';
    $('#skip').addEventListener('click', function () { finishBrief(); });
    $('#cta-auto').addEventListener('click', function () {
      finishBrief();
      S.free = {}; S.step = 0; S.beat = 0; S.lastLayout = null; resetOrder();
      play(); apply(-1);
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
    var rx = w / 2 + 3, ry = h / 2 + 3, cx = x + w / 2, cy = y + h / 2, j = (seed % 3 - 1) * 1.2;
    return 'M' + (cx - rx * .75) + ' ' + (cy - ry * .85 + j) +
      'C' + (cx - rx * .1) + ' ' + (cy - ry * 1.35) + ' ' + (cx + rx * 1.05) + ' ' + (cy - ry * 1.15 + j) + ' ' + (cx + rx * 1.02) + ' ' + cy +
      'C' + (cx + rx * 1) + ' ' + (cy + ry * 1.2) + ' ' + (cx - rx * .7) + ' ' + (cy + ry * 1.3 - j) + ' ' + (cx - rx * 1.02) + ' ' + (cy + ry * .1) +
      'C' + (cx - rx * 1.1) + ' ' + (cy - ry * .6) + ' ' + (cx - rx * .55) + ' ' + (cy - ry * 1.05) + ' ' + (cx - rx * .1) + ' ' + (cy - ry * 1.12);
  }
  function penPath(pen, x, y, w, h, seed) {
    if (pen === 'strike') { var m = y + h / 2 + 1; return 'M' + (x + 2) + ' ' + (m + 1) + 'Q' + (x + w / 2) + ' ' + (m - 2) + ' ' + (x + w - 2) + ' ' + (m + .5) + 'M' + (x + 3) + ' ' + (m + 3) + 'L' + (x + w - 4) + ' ' + (m + 2.500); }
    if (pen === 'caret') { var cx = x + w / 2, b = y + h + 1; return 'M' + (cx - 6) + ' ' + (b + 3) + 'L' + cx + ' ' + (b - 7) + 'L' + (cx + 6) + ' ' + (b + 3); }
    return scribble(x, y, w, h, seed);
  }
  function drawBriefMarks(instant) {
    var paper = $('.paper'), svg = $('.paper-svg');
    if (!paper) return;
    var pr = paper.getBoundingClientRect(), notesBox = $('.paper-notes').getBoundingClientRect();
    var y = 0, paths = '';
    var items = $$('em[data-k]', paper).map(function (em) { return { k: em.dataset.k, r: em.getClientRects()[0] || em.getBoundingClientRect() }; }).sort(function (a, b) { return Math.round(a.r.top / 6) - Math.round(b.r.top / 6) || b.r.left - a.r.left; });
    var penOf = {};
    D.brief.marks.forEach(function (m) { penOf[m.k] = m.pen; });
    items.forEach(function (it, i) {
      var note = $('[data-n="' + it.k + '"]', paper), h = note.offsetHeight || 22;
      var want = it.r.top + it.r.height / 2 - notesBox.top - h / 2;
      var top = Math.max(want, y);
      note.style.top = top + 'px';
      y = top + h + 6;
      var nx = notesBox.left - pr.left + (innerWidth < SOLO_W ? 10 : 20), ny = top + notesBox.top - pr.top + h / 2;
      /* 同一行右边还有别的笔迹时，引线从圈底出发，不穿过它 */
      var blocked = items.some(function (o) { return o !== it && Math.abs(o.r.top - it.r.top) < 6 && o.r.left > it.r.left; });
      var ex = blocked ? it.r.left - pr.left + it.r.width / 2 : it.r.right - pr.left + 4;
      var ey = blocked ? it.r.bottom - pr.top + 5 : it.r.top - pr.top + it.r.height / 2;
      var bend = (ex + nx) / 2 + ' ' + (Math.abs(ny - ey) < 2 ? ey : (ey + ny) / 2 - 8);
      paths += '<path pathLength="1" class="off" data-c="' + it.k + '" d="' + penPath(penOf[it.k], it.r.left - pr.left, it.r.top - pr.top, it.r.width, it.r.height, i) + '"/>' +
        '<path pathLength="1" class="off pen-lead" data-l="' + it.k + '" d="M' + ex + ' ' + ey + 'Q' + bend + ' ' + nx + ' ' + ny + '"/>';
    });
    svg.innerHTML = paths;
    if (instant || S.briefDone) showAllMarks();
  }
  function showAllMarks() {
    $$('.paper-svg path').forEach(function (p) { p.style.transition = 'none'; p.classList.remove('off'); });
    $$('.pn, [data-grow], .paper-margin').forEach(function (n) { n.classList.remove('off'); });
  }
  function finishBrief() {
    S.briefDone = true;
    briefTimers.forEach(clearTimeout);
    showAllMarks();
    var skip = $('#skip'); if (skip) skip.classList.add('done');
  }
  function grow(id) { var el = $('[data-grow="' + id + '"]'); if (el) el.classList.remove('off'); }
  function playBrief() {
    if (reduced) { finishBrief(); return; }
    $$('.pn, [data-grow], .paper-margin').forEach(function (n) { n.classList.add('off'); });
    var B = D.brief, gap = 1300, t = 400;
    B.marks.forEach(function (m, i) {
      briefTimers.push(setTimeout(function () {
        var c = $('[data-c="' + m.k + '"]'), l = $('[data-l="' + m.k + '"]'), n = $('[data-n="' + m.k + '"]');
        if (c) c.classList.remove('off');
        briefTimers.push(setTimeout(function () { if (l) l.classList.remove('off'); if (n) n.classList.remove('off'); grow(m.grow); }, 450));
      }, t + i * gap));
    });
    var end = t + B.marks.length * gap;
    briefTimers.push(setTimeout(function () { $('.paper-margin').classList.remove('off'); grow(B.marginGrow); }, end));
    briefTimers.push(setTimeout(function () { grow('res'); }, end + 1000));
    briefTimers.push(setTimeout(finishBrief, end + 1500));
  }

  /* ———— 启动 ———— */
  function init() {
    resetOrder();
    window.APP = {
      claimCase: function () { return S.claimCase; },
      order: orderInfo,
      chat: function () { return { msgs: CHAT.msgs, draft: chatDraft }; }
    };
    renderBrief();
    stageMain = $('#st-main'); sideEl = $('#st-side'); phonesEl = $('#phones');
    phonesEl.innerHTML = IDS.map(phoneHTML).join('');
    stageMain.insertAdjacentHTML('beforeend', '<svg id="ov-lines" aria-hidden="true"></svg>');
    IDS.forEach(function (id) { ph[id] = $('[data-ph="' + id + '"]', phonesEl); });
    $('#rail-steps').innerHTML = STEPS.map(function (s, i) { return '<button data-step="' + i + '" title="' + s.side.eyebrow + '">' + s.name + '</button>'; }).join('');
    document.documentElement.classList.toggle('solo', innerWidth < SOLO_W);
    bindStage();

    if (window.PAGE_EXTRAS) window.PAGE_EXTRAS();

    var q = new URLSearchParams(location.search);
    /* 调试：?unlock=1 直接解锁（不写入记录），?unlock=0 清掉记录 */
    if (q.get('unlock') === '0') writeUnlocked(false);
    markNavLocked();
    if (q.get('unlock') === '1') unlock(false, false);
    else if (readUnlocked()) unlock(false, false);
    setInterval(updateRemain, 500);
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
    updateRemain();
    $('#mode').textContent = '等待开始';
    $('#auto-btn').textContent = '自动播放';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
