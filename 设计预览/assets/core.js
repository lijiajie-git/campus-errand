/* 骨架公用逻辑：两台手机、状态推进、飞卡、自适应缩放。
   业务内容全部是占位，不代表最终设计。 */
(function () {
  var SVG_SIGNAL = '<svg width="66" height="14" viewBox="0 0 66 14" fill="currentColor"><rect x="0" y="9" width="3" height="4" rx=".8"/><rect x="5" y="6" width="3" height="7" rx=".8"/><rect x="10" y="3" width="3" height="10" rx=".8"/><rect x="15" y="0" width="3" height="13" rx=".8"/><rect x="30" y="1" width="30" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".45"/><rect x="32" y="3" width="24" height="8" rx="2"/><rect x="61" y="5" width="2" height="4" rx="1" opacity=".5"/></svg>';
  var CAPSULE = '<div class="mp-capsule"><i><svg width="20" height="6" viewBox="0 0 20 6" fill="#111"><circle cx="3" cy="3" r="2"/><circle cx="10" cy="3" r="2.6"/><circle cx="17" cy="3" r="2"/></svg></i><i><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#111" stroke-width="1.5"><circle cx="9" cy="9" r="7"/><circle cx="9" cy="9" r="2" fill="#111" stroke="none"/></svg></i></div>';

  var ICONS = {
    hall: '<path d="M4 11 13 4l9 7v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M10 22v-7h6v7"/>',
    list: '<rect x="5" y="4" width="16" height="18" rx="2"/><path d="M9 10h8M9 15h8"/>',
    me: '<circle cx="13" cy="9" r="4.5"/><path d="M4.5 22c1-4.5 4.4-6.5 8.5-6.5s7.5 2 8.5 6.5"/>'
  };
  function tabbar(active, items) {
    return '<div class="weui-tabbar">' + items.map(function (it, i) {
      var on = i === active;
      return '<div class="weui-tabbar__item' + (on ? ' weui-bar__item_on' : '') + '"><svg class="weui-tabbar__icon" viewBox="0 0 26 26" fill="none" stroke="' + (on ? '#07c160' : '#555') + '" stroke-width="1.6" stroke-linejoin="round">' + ICONS[it[0]] + '</svg><p class="weui-tabbar__label" style="color:' + (on ? '#07c160' : 'rgba(0,0,0,.6)') + '">' + it[1] + '</p></div>';
    }).join('') + '</div>';
  }
  var TABS_A = [['hall', '发布'], ['list', '我的任务'], ['me', '我的']];
  var TABS_B = [['hall', '任务大厅'], ['list', '我接的'], ['me', '信用']];

  var NEW_CARD = '<div class="task-card" data-newcard><div class="task-card__top"><div class="task-card__title">代取快递</div><div class="task-card__fee">¥ 示例</div></div><div class="task-card__route">南门驿站 → 宿舍楼（示例地点）</div><div class="task-card__tags"><span class="tag">已认证同学</span><span class="tag tag_gray">取件码接单后可见</span></div></div>';

  function card(title, route, tag) {
    return '<div class="task-card"><div class="task-card__top"><div class="task-card__title">' + title + '</div><div class="task-card__fee">¥ 示例</div></div><div class="task-card__route">' + route + '</div><div class="task-card__tags"><span class="tag tag_gray">' + tag + '</span></div></div>';
  }
  var OTHERS = card('代买文具', '校内超市 → 图书馆（示例地点）', '占位任务') + card('代占座', '图书馆（限时规则待定）', '有限制的任务');

  function steps(active) {
    var names = ['发布任务', '等待接单', '跑腿中', '确认完成'];
    return '<div class="weui-steps weui-steps_vertical" style="margin-top:12px;background:#fff;border-radius:10px;padding:16px">' + names.map(function (n, i) {
      return '<div class="weui-steps__item' + (i < active ? ' weui-steps__item_success' : '') + '"><div class="weui-steps__item__inner"><div class="weui-steps__icon"></div><div class="weui-steps__item__title" style="' + (i === active ? 'font-weight:600' : '') + '">' + n + '</div></div></div>';
    }).join('') + '</div>';
  }

  var SENDER = [
    // 0 填单
    '<div class="mp-view"><div class="mp-pad" style="padding-bottom:0">' + NEW_CARD + '</div><div class="weui-cells" style="margin:12px 0 0"><div class="weui-cell"><div class="weui-cell__bd">任务类型</div><div class="weui-cell__ft">代取快递</div></div><div class="weui-cell"><div class="weui-cell__bd">取件码</div><div class="weui-cell__ft mp-lock">接单后才给对方看</div></div><div class="weui-cell"><div class="weui-cell__bd">费用</div><div class="weui-cell__ft">先托管，确认后放款</div></div></div><div class="mp-grow"></div><div class="mp-foot" style="padding-bottom:12px"><a class="weui-btn weui-btn_primary" data-act="publish" style="width:100%;box-sizing:border-box">发布任务</a></div>' + tabbar(0, TABS_A) + '</div>',
    // 1 等待
    '<div class="mp-view"><div class="mp-pad mp-grow"><div class="mp-status-head"><h3>等待接单</h3><p>已发到校内任务大厅</p></div>' + steps(1) + '</div>' + tabbar(1, TABS_A) + '</div>',
    // 2 同上，右边在确认
    '<div class="mp-view"><div class="mp-pad mp-grow"><div class="mp-status-head"><h3>等待接单</h3><p>已发到校内任务大厅</p></div>' + steps(1) + '</div>' + tabbar(1, TABS_A) + '</div>',
    // 3 跑腿中
    '<div class="mp-view"><div class="mp-pad mp-grow"><div class="mp-status-head"><h3>同学正在跑腿</h3><p>取件码已给到接单人</p></div>' + steps(2) + '</div><div class="mp-foot" style="padding-bottom:12px"><a class="weui-btn weui-btn_primary" data-act="confirm" style="width:100%;box-sizing:border-box">确认收到</a></div>' + tabbar(1, TABS_A) + '</div>',
    // 4 完成
    '<div class="mp-view"><div class="mp-pad mp-grow"><div class="mp-status-head"><h3>已完成</h3><p>费用已放款，等你评价</p></div>' + steps(4) + '</div>' + tabbar(1, TABS_A) + '</div>'
  ];

  var HALF = '<div class="weui-mask" style="position:absolute;opacity:1;visibility:visible;z-index:400"></div><div class="weui-half-screen-dialog" style="visibility:visible;opacity:1;transform:none;padding-bottom:36px"><div class="weui-half-screen-dialog__hd"><div class="weui-half-screen-dialog__hd__main"><strong class="weui-half-screen-dialog__title">确认接单</strong></div></div><div class="weui-half-screen-dialog__bd" style="padding:8px 0 16px">' + NEW_CARD.replace(' data-newcard', '').replace('class="task-card"', 'class="task-card" style="width:100%;background:#f7f7f7"') + '<p style="margin-top:12px;font-size:14px;color:rgba(0,0,0,.55)">你的信用等级可接这类任务（规则占位）</p></div><div class="weui-half-screen-dialog__ft" style="padding:0"><a class="weui-btn weui-btn_primary" data-act="accept" style="width:100%;box-sizing:border-box">确认接单</a></div></div>';

  var RUNNER = [
    '<div class="mp-view"><div class="mp-list mp-grow"><div class="mp-section">校内任务</div>' + OTHERS + '</div>' + tabbar(0, TABS_B) + '</div>',
    '<div class="mp-view"><div class="mp-list mp-grow"><div class="mp-section">校内任务</div><div data-landing>' + NEW_CARD.replace('task-card"', 'task-card task-card_new"') + '</div>' + OTHERS + '</div>' + tabbar(0, TABS_B) + '</div>',
    '<div class="mp-view"><div class="mp-list mp-grow"><div class="mp-section">校内任务</div><div>' + NEW_CARD + '</div>' + OTHERS + '</div>' + tabbar(0, TABS_B) + '</div>',
    '<div class="mp-view"><div class="mp-pad mp-grow"><div class="mp-status-head"><h3>去取件</h3><p>南门驿站（示例地点）</p></div><div class="weui-cells" style="border-radius:10px;overflow:hidden;margin-top:12px"><div class="weui-cell"><div class="weui-cell__bd">取件码</div><div class="weui-cell__ft mp-code">示例码</div></div><div class="weui-cell"><div class="weui-cell__bd">留凭证</div><div class="weui-cell__ft mp-lock">拍照上传（占位）</div></div></div></div>' + tabbar(1, TABS_B) + '</div>',
    '<div class="mp-view"><div class="mp-pad mp-grow"><div class="mp-status-head"><h3>信用已更新</h3><p>完成任务 → 信用提升 → 解锁更多任务（规则占位）</p></div></div>' + tabbar(2, TABS_B) + '</div>'
  ];

  var NAV_S = ['发布任务', '我的任务', '我的任务', '我的任务', '我的任务'];
  var NAV_R = ['任务大厅', '任务大厅', '任务大厅', '任务详情', '我的信用'];

  var STEPS = [
    { name: '发布前', who: '发单端', rule: '禁发规则：代考、代签到不能发', note: '占位说明：同学填任务，取件码先不公开。' },
    { name: '发布', who: '发单端 → 平台 → 接单端', rule: '校验通过，费用托管（模拟）', note: '占位说明：任务经过平台校验，才进入大厅。' },
    { name: '接单', who: '接单端', rule: '查信用分，决定接单上限和可接类型', note: '占位说明：信用不是摆设，它决定你能接什么。' },
    { name: '履约', who: '接单端 → 发单端', rule: '接单后才解锁取件码', note: '占位说明：隐私信息分层可见，并留下凭证。' },
    { name: '完成', who: '双方', rule: '确认后放款，互评，信用更新', note: '占位说明：完成任务，信用提升，解锁更多任务。' }
  ];

  function phoneHTML(role) {
    return '<div class="phone-slot" data-slot="' + role + '"><div class="phone-scale"><div class="device device-iphone-14-pro"><div class="device-frame"><div class="device-screen"><div class="mp" data-mp="' + role + '"><div class="mp-status"><span>9:41</span>' + SVG_SIGNAL + '</div><div class="mp-nav"><span data-navtitle></span>' + CAPSULE + '</div><div class="mp-body" data-body></div><div class="mp-home"></div></div></div></div><div class="device-stripe"></div><div class="device-header"></div><div class="device-sensors"></div><div class="device-btns"></div><div class="device-power"></div></div></div></div>';
  }

  var EASE = 'cubic-bezier(.22,.8,.2,1)';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function Demo(opts) {
    this.opts = opts;
    this.step = 0;
    this.auto = false;
    this.timer = null;
    this.busy = false;
    this.soloRole = 'sender';
    this.mount();
  }

  Demo.prototype.mount = function () {
    var self = this, o = this.opts;
    o.sender.innerHTML = phoneHTML('sender');
    o.runner.innerHTML = phoneHTML('runner');
    this.mpS = o.sender.querySelector('[data-mp]');
    this.mpR = o.runner.querySelector('[data-mp]');
    this.layer = document.createElement('div');
    this.layer.id = 'fly-layer';
    document.body.appendChild(this.layer);
    this.render(0, false);

    document.addEventListener('click', function (e) {
      var act = e.target.closest && e.target.closest('[data-act]');
      if (act) { e.preventDefault(); self.takeOver(); self.go(self.step + 1); return; }
      var goBtn = e.target.closest && e.target.closest('[data-go]');
      if (goBtn) { self.takeOver(); self.go(+goBtn.getAttribute('data-go'), goBtn.hasAttribute('data-instant')); return; }
      var ctl = e.target.closest && e.target.closest('[data-ctl]');
      if (ctl) {
        var k = ctl.getAttribute('data-ctl');
        if (k === 'next') { self.takeOver(); self.go(self.step + 1); }
        if (k === 'replay') { self.replay(); }
        if (k === 'toggle') { self.auto ? self.takeOver() : self.play(); }
        return;
      }
      var solo = e.target.closest && e.target.closest('[data-solo]');
      if (solo) self.setSolo(solo.getAttribute('data-solo'));
    });
    window.addEventListener('resize', function () { self.fit(); });
    this.fit();
  };

  Demo.prototype.fit = function () {
    var vw = window.innerWidth, o = this.opts;
    // 布局变化时飞行中的卡片坐标已失效，直接落地
    if (this.layer) this.layer.getAnimations({ subtree: true }).forEach(function (a) { a.finish(); });
    var isSolo = vw < (o.soloBelow || 900);
    document.documentElement.classList.toggle('solo', isSolo);
    var s;
    if (isSolo) {
      s = Math.min(1, (vw - 8) / 428);
      if (o.soloMaxH) s = Math.min(s, o.soloMaxH(window.innerHeight) / 800);
      this.setSolo(this.soloRole);
    } else {
      o.sender.querySelector('.phone-slot').hidden = false;
      o.runner.querySelector('.phone-slot').hidden = false;
      var f = o.available ? o.available(vw, window.innerHeight) : { w: vw, h: window.innerHeight };
      s = Math.min(1, f.h / 800, f.w / 428);
      s = Math.max(o.minScale || .6, s);
    }
    (o.scaleRoot || document.documentElement).style.setProperty('--s', s.toFixed(4));
    this.s = s;
    if (o.onFit) o.onFit(s, isSolo);
  };

  Demo.prototype.isSolo = function () { return document.documentElement.classList.contains('solo'); };

  Demo.prototype.setSolo = function (role) {
    this.soloRole = role;
    if (!this.isSolo()) return;
    this.opts.sender.querySelector('.phone-slot').hidden = role !== 'sender';
    this.opts.runner.querySelector('.phone-slot').hidden = role !== 'runner';
    document.querySelectorAll('[data-solo]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-solo') === role); });
  };

  Demo.prototype.render = function (n, animate) {
    var self = this;
    [[this.mpS, SENDER, NAV_S], [this.mpR, RUNNER, NAV_R]].forEach(function (t) {
      var body = t[0].querySelector('[data-body]');
      var title = t[0].querySelector('[data-navtitle]');
      if (body.getAttribute('data-html') === String(t[1][n]) ) return;
      var old = body.firstElementChild;
      body.setAttribute('data-html', String(t[1][n]));
      title.textContent = t[2][n];
      var tmp = document.createElement('div');
      tmp.innerHTML = t[1][n];
      var next = tmp.firstElementChild;
      next.style.background = '#ededed';
      body.appendChild(next);
      if (old) {
        if (animate && !reduced) {
          next.animate([{ transform: 'translateX(28px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: EASE });
          old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }).finished.then(function () { old.remove(); }, function () { old.remove(); });
        } else { old.remove(); }
      }
    });
    this.sheet(n === 2, animate);
    self.step = n;
    if (this.opts.onStep) this.opts.onStep(n, STEPS[n]);
  };

  /* 飞卡：从左手机飞到右手机，途中在中间的“平台”停一下。
     坐标都用 getBoundingClientRect，已是缩放后的值，不用再换算。 */
  Demo.prototype.fly = function (a, toEl, viaEl) {
    var s = this.s;
    var holder = document.createElement('div');
    holder.innerHTML = NEW_CARD;
    var el = holder.firstElementChild;
    el.style.boxShadow = '0 18px 48px rgba(0,0,0,.35)';
    this.layer.appendChild(el);
    var b = toEl.getBoundingClientRect();
    var t = function (x, y, k, r) { return 'translate(' + x + 'px,' + y + 'px) rotate(' + (r || 0) + 'deg) scale(' + k + ')'; };
    var w = a.width, h = a.height;
    var v = viaEl ? viaEl.getBoundingClientRect() : { left: (a.left + b.left) / 2, top: Math.min(a.top, b.top) - 40, width: w, height: h };
    var vx = v.left + v.width / 2 - w / 2;
    var vy = v.top + v.height / 2 - h / 2;
    return el.animate([
      { transform: t(a.left, a.top, s, 0), offset: 0, easing: EASE },
      { transform: t(vx, vy, s * 1.04, -1.2), offset: .42 },
      { transform: t(vx, vy, s * 1.04, -1.2), offset: .62, easing: 'cubic-bezier(.5,0,.15,1)' },
      { transform: t(b.left, b.top, s, 0), offset: 1 }
    ], { duration: this.opts.flyMs || 1300, fill: 'forwards' }).finished.then(function () { el.remove(); });
  };

  Demo.prototype.go = function (n, instant) {
    var self = this;
    if (this.busy || n < 0 || n >= STEPS.length) return Promise.resolve();

    if (n === 1 && this.step === 0 && !instant && !reduced) {
      var from = this.mpS.querySelector('[data-newcard]');
      this.busy = true;
      if (this.isSolo()) {
        // 手机宽度：单屏切换。卡片从右边滑出，切到接单端后从左边滑入
        return from.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(120%)', opacity: .2 }], { duration: 380, easing: EASE, fill: 'forwards' }).finished.then(function () {
          self.render(1, false);
          self.setSolo('runner');
          self.busy = false;
          return self.mpR.querySelector('[data-landing]').firstElementChild.animate([{ transform: 'translateX(-120%)' }, { transform: 'none' }], { duration: 420, easing: EASE }).finished;
        });
      }
      var rect = from.getBoundingClientRect();
      self.render(1, false);
      var land = self.mpR.querySelector('[data-landing]').firstElementChild;
      land.style.visibility = 'hidden';
      if (self.opts.onFlyStart) self.opts.onFlyStart();
      return self.fly(rect, land, self.opts.via && self.opts.via()).then(function () {
        land.style.visibility = '';
        land.animate([{ boxShadow: '0 0 0 5px #07c160 inset' }, { boxShadow: '0 0 0 2px #07c160 inset' }], { duration: 500 });
        if (self.opts.onFlyEnd) self.opts.onFlyEnd();
        self.busy = false;
      });
    }

    if (this.isSolo()) this.setSolo(n === 2 ? 'runner' : 'sender');
    this.render(n, !instant);
    if (n === 4 && !reduced) this.toast();
    return Promise.resolve();
  };

  Demo.prototype.sheet = function (open, animate) {
    var cur = this.mpR.querySelector('.mp-sheet');
    if (!open) { if (cur) cur.remove(); return; }
    if (cur) return;
    var el = document.createElement('div');
    el.className = 'mp-sheet';
    el.innerHTML = HALF;
    this.mpR.appendChild(el);
    if (animate && !reduced) {
      el.querySelector('.weui-mask').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260 });
      el.querySelector('.weui-half-screen-dialog').animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 340, easing: EASE });
    }
  };

  Demo.prototype.toast = function () {
    var el = document.createElement('div');
    el.className = 'mp-toast';
    el.innerHTML = '<i class="weui-icon-success-no-circle"></i>已确认';
    this.mpS.appendChild(el);
    el.animate([{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 1, offset: .85 }, { opacity: 0 }], { duration: 1400, fill: 'forwards' }).finished.then(function () { el.remove(); });
  };

  Demo.prototype.play = function () {
    var self = this;
    this.auto = true;
    if (this.opts.onMode) this.opts.onMode('auto');
    var tick = function () {
      if (!self.auto) return;
      if (self.step >= STEPS.length - 1) { self.auto = false; if (self.opts.onMode) self.opts.onMode('done'); return; }
      self.go(self.step + 1).then(function () { self.timer = setTimeout(tick, self.opts.stepMs || 3200); });
    };
    this.timer = setTimeout(tick, self.opts.firstMs || 1600);
  };
  Demo.prototype.takeOver = function () {
    if (this.timer) clearTimeout(this.timer);
    this.auto = false;
    if (this.opts.onMode) this.opts.onMode('manual');
  };
  Demo.prototype.replay = function () {
    if (this.timer) clearTimeout(this.timer);
    this.auto = false;
    this.busy = false;
    this.render(0, false);
    this.play();
  };
  window.PreviewCore = { Demo: Demo, STEPS: STEPS };
})();
