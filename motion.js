/* ============================================================
 * NeuralFin 原型 — motion.js（动效·GSAP）v2 全 App 壳
 * 职责（见 CONTRACT.md v2「motion.js 升级要求」）：
 *   —— v1 热搜（全部保留）——
 *   1. 泡泡图渲染（#nf-bubble-stage，半径=f(heat)，色=sector）
 *   2. gsap.ticker 漂移物理：边界反弹 + 泡间轻推
 *   3. 呼吸脉动（按热度分级，前 3 名辉光更强）
 *   4. 榜单↔泡泡切换过渡 + 板块筛选过渡 + 详情页开合过渡
 *   5. 榜单入场 stagger（MutationObserver 兜底）
 *   —— v2 全局 ——
 *   6. nf:tab-change 页面过渡（0.28s iOS 手感）+ 各页首次进入卡片 stagger
 *   7. 悬浮泡泡助手：待机浮动/偶发轻转、点击弹性、主页开合飞入飞出
 *   8. 精选 banner 自动轮播（5s）+ 指示点联动（仅精选 Tab 激活时跑）
 *   9. 播客播放钮波纹 + 图标旋转一次性动效
 *   10. 生命周期：离开热搜页停泡泡 ticker、离开精选页停轮播
 * 依赖：GSAP 3.13 CDN（index.html 先行加载）、data.js、assets.js（素材由 index.html 渲染）
 * 约束：file:// 可跑、全部 transform/opacity、本文件为唯一产出。
 *      v2 DOM 由 Codex 并行重写中，所有新模块均做「找不到元素即 no-op」兜底。
 * ============================================================ */
(function () {
  'use strict';

  if (typeof window.gsap === 'undefined') {
    console.warn('[nf-motion] GSAP 未加载（检查 CDN），动效不启用');
    return;
  }
  var NF_RAW = window.NF_DATA || {};   // 兼容 {topics:[]} 与直接数组两种形态
  var DATA = (Array.isArray(NF_RAW) ? NF_RAW : NF_RAW.topics) || [];
  if (!DATA.length) { console.warn('[nf-motion] window.NF_DATA.topics 为空'); return; }

  var DOC = document;
  var SECTOR_HEX = { macro: '#4f9cf9', us: '#a06bff', hk: '#3ecf8e', crypto: '#f7931a', com: '#f5c451' };
  var R_MIN = 32, R_MAX = 75;        // 半径范围（直径 64~150）
  var R_HARD_MIN = 22;               // 整体缩放后的半径下限
  var AREA_CAP = 0.55;               // 泡泡总面积 / stage 面积 上限
  var SPEED_MIN = 20, SPEED_MAX = 40;// 漂移速度 px/s
  var FALLBACK_W = 340, FALLBACK_H = 470;

  var stage = null, lb = null;
  var bubbles = [];                  // {el,core,glow,data,r,x,y,vx,vy,norm,visible,breath,glowTween}
  var byEl = new Map();
  var stageW = 0, stageH = 0, lastW = 0, lastH = 0;
  var built = false, physicsOn = false;
  var currentSector = 'all';
  var currentView = 'list';
  var hotSuspended = false;          // v2：热搜 Tab 被切走时物理挂起标记
  var bootTries = 0;

  /* ---------- 工具 ---------- */
  function cssVar(name, fb) {
    var v = '';
    try { v = getComputedStyle(DOC.documentElement).getPropertyValue(name).trim(); } catch (e) {}
    return v || fb;
  }
  function sectorColor(s) { return cssVar('--sec-' + s, SECTOR_HEX[s] || '#3ecf8e'); }
  function fmtHeat(h) {
    var w = h / 10000;
    return (w >= 1000 ? String(Math.round(w)) : w.toFixed(1)) + '万';
  }
  function fire(type, detail) {
    DOC.dispatchEvent(new CustomEvent(type, { detail: detail }));
  }
  function measure() {
    var r = stage.getBoundingClientRect();
    if (r.width > 10 && r.height > 10) { stageW = r.width; stageH = r.height; }
    if (!stageW) { stageW = FALLBACK_W; stageH = FALLBACK_H; }
  }
  function el(tag, cls, css, text) {
    var n = DOC.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    if (css) for (var k in css) n.style[k] = css[k];
    return n;
  }
  /* 按 id/类名候选列表找元素（v2 DOM 未定时兜底） */
  function findEl(cands) {
    for (var i = 0; i < cands.length; i++) {
      var n = DOC.querySelector(cands[i]);
      if (n) return n;
    }
    return null;
  }

  /* ============================================================
   * v1 热搜：泡泡渲染
   * ============================================================ */
  function buildBubbles() {
    if (built) return;
    built = true;
    measure();

    var hMin = Infinity, hMax = -Infinity, i, t;
    for (i = 0; i < DATA.length; i++) {
      hMin = Math.min(hMin, DATA[i].heat);
      hMax = Math.max(hMax, DATA[i].heat);
    }
    var sMin = Math.sqrt(hMin), sMax = Math.sqrt(hMax) || 1;
    var normOf = function (h) { return (Math.sqrt(h) - sMin) / (sMax - sMin || 1); };
    var radiusOf = function (h) { return R_MIN + (R_MAX - R_MIN) * normOf(h); };

    // 面积自适应：太挤整体缩
    var area = 0;
    for (i = 0; i < DATA.length; i++) { var rr = radiusOf(DATA[i].heat); area += Math.PI * rr * rr; }
    var fit = Math.min(1, Math.sqrt(AREA_CAP * stageW * stageH / area));

    // 先建 DOM
    var frag = DOC.createDocumentFragment();
    for (i = 0; i < DATA.length; i++) {
      t = DATA[i];
      var r = Math.max(R_HARD_MIN, radiusOf(t.heat) * fit);
      var norm = normOf(t.heat);
      var color = sectorColor(t.sector);
      var d = r * 2;

      var bEl = el('div', 'nf-bubble nf-b', {
        position: 'absolute', left: '0', top: '0',
        width: d + 'px', height: d + 'px',
        willChange: 'transform', cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent', userSelect: 'none'
      });
      bEl.setAttribute('data-topic-id', t.id);

      var glow = null;
      if (t.rank <= 3) {
        glow = el('div', 'nf-b-glow', {
          position: 'absolute', left: '-8%', top: '-8%', width: '116%', height: '116%',
          borderRadius: '50%', opacity: '0.4', willChange: 'transform,opacity',
          boxShadow: '0 0 26px 8px ' + color, transformOrigin: '50% 50%'
        });
        bEl.appendChild(glow);
      }

      var fs = r >= 58 ? 13 : (r >= 44 ? 12 : 11);
      var core = el('div', 'nf-b-core', {
        position: 'absolute', left: '0', top: '0', width: '100%', height: '100%',
        borderRadius: '50%', willChange: 'transform', transformOrigin: '50% 50%',
        background: 'radial-gradient(circle at 32% 26%, rgba(255,255,255,.30), rgba(255,255,255,0) 46%),' + color,
        border: '1px solid rgba(255,255,255,.20)',
        boxShadow: 'inset -6px -10px 18px rgba(0,0,0,.30)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', padding: '10%'
      });
      var title = el('div', 'nf-b-title', {
        maxWidth: '92%', color: '#fff', fontWeight: '600', lineHeight: '1.22',
        fontSize: fs + 'px', textAlign: 'center', textShadow: '0 1px 3px rgba(0,0,0,.45)',
        display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: '2', overflow: 'hidden'
      }, t.title.length > 12 ? t.title.slice(0, 12) + '…' : t.title);
      var heat = el('div', 'nf-b-heat', {
        marginTop: '3px', color: 'rgba(255,255,255,.88)', fontSize: (fs - 2) + 'px',
        textShadow: '0 1px 2px rgba(0,0,0,.4)', whiteSpace: 'nowrap'
      }, fmtHeat(t.heat));
      core.appendChild(title); core.appendChild(heat);
      bEl.appendChild(core);
      frag.appendChild(bEl);

      var b = { el: bEl, core: core, glow: glow, data: t, r: r, norm: norm,
        x: 0, y: 0, vx: 0, vy: 0, visible: true, breath: null, glowTween: null };
      bubbles.push(b); byEl.set(bEl, b);
    }
    stage.appendChild(frag);

    placeAll();
    stage.addEventListener('click', onStageClick, false);
  }

  /* ---------- 初始布局：随机投放 + 碰撞退火 ---------- */
  function placeAll() {
    var order = bubbles.slice().sort(function (a, b) { return b.r - a.r; });
    var placed = [], i, j, a;
    for (i = 0; i < order.length; i++) {
      a = order[i];
      var best = null, bestScore = -Infinity;
      for (var k = 0; k < 160; k++) {
        var x = a.r + Math.random() * Math.max(1, stageW - a.r * 2);
        var y = a.r + Math.random() * Math.max(1, stageH - a.r * 2);
        var minGap = Infinity;
        for (j = 0; j < placed.length; j++) {
          var p = placed[j];
          var dx = x - p.x, dy = y - p.y;
          minGap = Math.min(minGap, Math.sqrt(dx * dx + dy * dy) - p.r);
        }
        var score = minGap - a.r;
        if (score >= 3) { best = { x: x, y: y }; break; }
        if (score > bestScore) { bestScore = score; best = { x: x, y: y }; }
      }
      a.x = best.x; a.y = best.y;
      placed.push(a);
    }
    for (i = 0; i < 120; i++) { resolveOverlaps(0.3, 0); clampAll(); }

    for (i = 0; i < bubbles.length; i++) {
      a = bubbles[i];
      var sp = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
      var ang = Math.random() * Math.PI * 2;
      a.vx = Math.cos(ang) * sp; a.vy = Math.sin(ang) * sp;
      gsap.set(a.el, { x: a.x - a.r, y: a.y - a.r });
    }
    lastW = stageW; lastH = stageH;
  }

  /* ---------- 物理 ---------- */
  function resolveOverlaps(pushK, velK) {
    for (var i = 0; i < bubbles.length; i++) {
      for (var j = i + 1; j < bubbles.length; j++) {
        var a = bubbles[i], c = bubbles[j];
        var dx = c.x - a.x, dy = c.y - a.y;
        var minD = a.r + c.r - 2;
        var d2 = dx * dx + dy * dy;
        if (d2 >= minD * minD) continue;
        var d = Math.sqrt(d2) || 0.01;
        var nx = dx / d, ny = dy / d;
        var push = (minD - d) * 0.5 * pushK;
        a.x -= nx * push; a.y -= ny * push;
        c.x += nx * push; c.y += ny * push;
        if (velK) {
          var rvn = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
          if (rvn < 0) {  // 正在靠近才交换动量（阻尼）
            var imp = rvn * velK;
            a.vx += nx * imp; a.vy += ny * imp;
            c.vx -= nx * imp; c.vy -= ny * imp;
          }
        }
      }
    }
  }
  function clampAll() {
    for (var i = 0; i < bubbles.length; i++) {
      var b = bubbles[i];
      if (b.x < b.r)            { b.x = b.r;            b.vx = Math.abs(b.vx); }
      else if (b.x > stageW - b.r) { b.x = stageW - b.r; b.vx = -Math.abs(b.vx); }
      if (b.y < b.r)            { b.y = b.r;            b.vy = Math.abs(b.vy); }
      else if (b.y > stageH - b.r) { b.y = stageH - b.r; b.vy = -Math.abs(b.vy); }
      var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy) || 1;
      if (sp > 70 || sp < 10) {   // 速度钳制，防轻推累积失控
        var k = Math.max(10, Math.min(70, sp)) / sp;
        b.vx *= k; b.vy *= k;
      }
    }
  }
  function tick(time, deltaTime) {
    var dt = Math.min(deltaTime || 16.7, 50) / 1000;
    var i, b;
    for (i = 0; i < bubbles.length; i++) {
      b = bubbles[i];
      b.x += b.vx * dt; b.y += b.vy * dt;
    }
    resolveOverlaps(0.14, 0.42);
    clampAll();
    for (i = 0; i < bubbles.length; i++) {
      b = bubbles[i];
      gsap.set(b.el, { x: b.x - b.r, y: b.y - b.r });
    }
  }
  function startPhysics() { if (!physicsOn) { physicsOn = true; gsap.ticker.add(tick); } }
  function stopPhysics() { if (physicsOn) { physicsOn = false; gsap.ticker.remove(tick); } }

  /* ---------- 呼吸脉动（前 3 名更强更快 + 辉光呼吸） ---------- */
  function startBreath(b) {
    if (b.breath || !b.visible) return;
    var amp, dur;
    if (b.data.rank <= 3) { amp = 0.05 - b.data.rank * 0.005; }
    else { amp = 0.022 + b.norm * 0.008; }
    dur = 2.6 - b.norm * 0.9 - (b.data.rank <= 3 ? 0.25 : 0);
    b.breath = gsap.fromTo(b.core, { scale: 1 },
      { scale: 1 + amp, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    if (b.glow) {
      b.glowTween = gsap.fromTo(b.glow, { opacity: 0.4, scale: 1 },
        { opacity: 0.95, scale: 1.06, duration: 1.4 + b.data.rank * 0.25,
          yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }
  }
  function stopBreath(b) {
    if (b.breath) { b.breath.kill(); b.breath = null; gsap.set(b.core, { scale: 1 }); }
    if (b.glowTween) { b.glowTween.kill(); b.glowTween = null; }
  }
  function breathAll(on) {
    for (var i = 0; i < bubbles.length; i++) on ? startBreath(bubbles[i]) : stopBreath(bubbles[i]);
  }

  /* ---------- 点击：弹跳反馈 + 派发 nf:open-topic ---------- */
  function onStageClick(e) {
    var node = e.target;
    while (node && node !== stage && !byEl.has(node)) node = node.parentNode;
    var b = node && byEl.get(node);
    if (!b || !b.visible) return;
    if (b.breath) b.breath.pause();
    gsap.timeline({ onComplete: function () { if (b.breath) b.breath.resume(); } })
      .to(b.core, { scale: 1.12, duration: 0.1, ease: 'power2.out' })
      .to(b.core, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' });
    fire('nf:open-topic', { id: b.data.id });
  }

  /* ---------- 视图切换（热搜页内） ---------- */
  function whenStageVisible(cb, tries) {
    var r = stage.getBoundingClientRect();
    if ((r.width > 10 && r.height > 10) || tries > 40) { cb(); return; }
    setTimeout(function () { whenStageVisible(cb, (tries || 0) + 1); }, 30);
  }
  function enterBubbles() {
    gsap.killTweensOf(stage);
    whenStageVisible(function () {
      buildBubbles();
      measure();
      if (Math.abs(stageW - lastW) > 8 || Math.abs(stageH - lastH) > 8) relayout();
      applyFilter(currentSector, true);   // 兑现进入泡泡图前点击的板块筛选
      gsap.set(stage, { opacity: 1, scale: 1 });
      startPhysics();
      breathAll(true);
      var vis = [], i;
      for (i = 0; i < bubbles.length; i++) {
        if (bubbles[i].visible) vis.push(bubbles[i].el);
        else gsap.set(bubbles[i].el, { opacity: 0 });
      }
      gsap.fromTo(vis, { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.7)',
          stagger: { each: 0.03, from: 'random' }, overwrite: 'auto' });
    }, 0);
  }
  function leaveBubbles() {
    stopPhysics();
    breathAll(false);
    gsap.to(stage, { opacity: 0, scale: 0.96, duration: 0.22, ease: 'power2.in',
      onComplete: function () { gsap.set(stage, { scale: 1 }); } });
  }
  function relayout() {
    var sx = stageW / (lastW || stageW), sy = stageH / (lastH || stageH);
    for (var i = 0; i < bubbles.length; i++) {
      var b = bubbles[i];
      b.x *= sx; b.y *= sy;
      var rr = Math.max(R_HARD_MIN, b.r * (sx + sy) / 2);
      var sc = rr / b.r;
      b.r = rr;
      b.el.style.width = rr * 2 + 'px';
      b.el.style.height = rr * 2 + 'px';
      if (sc !== 1) gsap.set(b.core, { scale: sc }); // 字号不重排，整体近似缩放
    }
    for (i = 0; i < 60; i++) { resolveOverlaps(0.3, 0); clampAll(); }
    lastW = stageW; lastH = stageH;
  }

  /* ---------- 板块筛选 ---------- */
  function applyFilter(sector, instant) {
    currentSector = sector;
    if (!built) return;
    for (var i = 0; i < bubbles.length; i++) {
      var b = bubbles[i];
      var show = sector === 'all' || b.data.sector === sector;
      b.visible = show;
      b.el.style.pointerEvents = show ? 'auto' : 'none';
      if (instant) { gsap.set(b.el, { opacity: show ? 1 : 0 }); if (show) startBreath(b); }
      else gsap.to(b.el, { opacity: show ? 1 : 0, scale: show ? 1 : 0.6,
        duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
    }
  }

  /* ---------- 榜单入场 stagger ---------- */
  var lbAnim = null;
  function animateLeaderboard() {
    if (!lb) return;
    var items = lb.querySelectorAll('.nf-rank-item');
    if (!items.length) return;
    if (lbAnim) lbAnim.kill();
    lbAnim = gsap.fromTo(items, { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.38, ease: 'power2.out', stagger: 0.035, overwrite: true });
  }

  /* ---------- 热搜详情页开合过渡 ---------- */
  function detailEl() { return DOC.getElementById('nf-topic-detail'); }
  function detailOpen() {
    var d = detailEl(); if (!d) return;
    gsap.fromTo(d, { opacity: 0, y: 28, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.34, ease: 'power3.out', overwrite: true });
  }
  function detailClose() {
    var d = detailEl(); if (!d) return;
    gsap.to(d, { opacity: 0, y: 18, scale: 0.97, duration: 0.2, ease: 'power2.in', overwrite: true });
  }

  /* ============================================================
   * v2 全局动效
   * ============================================================ */

  /* ---------- Tab 页面发现与首次进入 stagger ---------- */
  var enteredTabs = {};              // 各 Tab 是否已做过首次入场
  var prevTab = 'follow';            // 完成标准：默认「关注」

  function pageEl(key) {
    return findEl([
      '[data-page="' + key + '"]', '[data-nf-page="' + key + '"]',
      '#nf-page-' + key, '#page-' + key, '.nf-page-' + key
    ]);
  }
  function pageVisible(n) { return !!(n && n.offsetParent !== null); }

  function staggerCards(page) {
    if (!page) return;
    var nodes = Array.prototype.slice.call(page.querySelectorAll(
      '.nf-card,.nf-item,.nf-rank-item,.nf-col-card,.nf-pod-row,.nf-post-card,.nf-news-item,.nf-video-card,[class*="card"]'));
    nodes = nodes.filter(function (n, i) { return nodes.indexOf(n) === i; });  // 多选择器命中同一元素去重
    // 只保留卡片根节点：剔除嵌套在其他候选卡内的子元素（.card-body/.card-title 等）
    var roots = nodes.filter(function (n) {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i] !== n && nodes[i].contains(n)) return false;
      }
      return true;
    });
    if (roots.length < 2) return;
    // 按列再按行排序 → 瀑布流每列错开
    roots.sort(function (a, b) {
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      return (ra.left - rb.left) || (ra.top - rb.top);
    });
    gsap.fromTo(roots, { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out',
        stagger: 0.035, overwrite: true, clearProps: 'opacity,transform' });
  }

  /* ---------- 幽灵节点淡出（旧页/覆盖层 display 已被切走时仍可见） ----------
   * 克隆节点贴回原位做淡出，真身交还 Codex 管理，动画完自删。失败返回 false 走原路。 */
  function ghostOut(node, rect, dx) {
    try {
      if (!node || !rect || !rect.width || !DOC.body) return false;
      var g = node.cloneNode(true);
      if (g.removeAttribute) {
        g.removeAttribute('id');
        var all = g.querySelectorAll('[id]');
        for (var i = 0; i < all.length; i++) all[i].removeAttribute('id');
      }
      gsap.set(g, { position: 'fixed', left: rect.left + 'px', top: rect.top + 'px',
        width: rect.width + 'px', height: rect.height + 'px', margin: '0',
        overflow: 'hidden', zIndex: 40, pointerEvents: 'none', opacity: 1, x: 0, y: 0 });
      DOC.body.appendChild(g);
      gsap.to(g, { opacity: 0, x: dx, duration: 0.28, ease: 'power2.out',
        onComplete: function () { if (g.parentNode) g.parentNode.removeChild(g); } });
      return true;
    } catch (e) { return false; }
  }

  /* ---------- nf:tab-change 页面过渡（0.28s iOS 手感，同步淡出 + rAF 入场） ---------- */
  function transitionOut(fromKey, toKey) {
    var newP = pageEl(toKey);
    var oldP = fromKey ? pageEl(fromKey) : null;
    if (!oldP || oldP === newP) return;
    if (pageVisible(oldP)) {           // emit 时旧页还挂着：直接淡出
      gsap.killTweensOf(oldP);
      gsap.to(oldP, { opacity: 0, x: -12, duration: 0.28, ease: 'power2.out',
        onComplete: function () { gsap.set(oldP, { clearProps: 'opacity,transform' }); } });
    } else {                           // Codex 已切走 display：幽灵节点补一个可见淡出
      var rect = newP ? newP.getBoundingClientRect() : null;
      if (!rect || !rect.width) { try { rect = oldP.getBoundingClientRect(); } catch (e) {} }
      ghostOut(oldP, rect, -12);
    }
  }
  function transitionIn(toKey) {
    var newP = pageEl(toKey);
    if (!newP) return;
    var first = !enteredTabs[toKey];
    enteredTabs[toKey] = true;
    if (first) {
      staggerCards(newP);              // 首次进入：只做卡片 stagger，不做整页淡入（避免双重淡入）
    } else {
      gsap.killTweensOf(newP);
      gsap.set(newP, { clearProps: 'transform' });   // 清上次滑出残留
      gsap.fromTo(newP, { opacity: 0, x: 16 },
        { opacity: 1, x: 0, duration: 0.28, ease: 'power2.out', overwrite: true,
          onComplete: function () { gsap.set(newP, { clearProps: 'opacity,transform' }); } });
    }
  }

  /* ---------- Tab 生命周期：热搜物理挂起 / 精选轮播门控 ---------- */
  function gateHot(tabKey) {
    if (tabKey !== 'hot') {
      if (physicsOn) { hotSuspended = true; stopPhysics(); breathAll(false); }
    } else if (hotSuspended) {
      hotSuspended = false;
      if (built && currentView === 'bubbles') { startPhysics(); breathAll(true); }
    }
  }

  /* ---------- 悬浮泡泡助手 ---------- */
  var fab = null, fabIdle = null, fabWiggleTimer = null, fabFlying = false, fabTries = 0;

  function findFab() {
    if (fab) return fab;
    fab = findEl(['#nf-fab', '.nf-fab', '#nf-fab-assistant', '.nf-fab-assistant',
      '#nf-bubble-assistant', '.nf-bubble-assistant', '[data-nf-fab]', '[class*="fab"]']);
    if (!fab) return null;
    attachFab();
    return fab;
  }
  function attachFab() {
    startFabIdle();
    fabWiggleLoop();
    fab.addEventListener('click', function () {
      // 弹性 squash & stretch（只覆盖 scaleX/scaleY，不打断 y 浮动）
      gsap.fromTo(fab, { scaleX: 1.18, scaleY: 0.82 },
        { scaleX: 1, scaleY: 1, duration: 0.55, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
    }, false);
  }
  function startFabIdle() {
    if (!fab || fabIdle || fabFlying) return;
    fabIdle = gsap.fromTo(fab, { y: 0 },
      { y: -4, duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }
  function stopFabIdle() {
    if (fabIdle) { fabIdle.kill(); fabIdle = null; gsap.set(fab, { y: 0 }); }
  }
  function fabWiggleLoop() {
    fabWiggleTimer = gsap.delayedCall(3.5 + Math.random() * 3.5, function () {
      if (fab && !fabFlying) {
        gsap.timeline().to(fab, { rotation: 7, duration: 0.18, ease: 'sine.inOut' })
                       .to(fab, { rotation: 0, duration: 0.26, ease: 'sine.inOut' });
      }
      fabWiggleLoop();
    });
  }
  function fabFlyToCorner() {        // nf:open-profile：缩小飞向右上角渐隐（契约：右上角）
    if (!fab) return;
    fabFlying = true;
    stopFabIdle();
    if (fabWiggleTimer) fabWiggleTimer.kill();
    gsap.killTweensOf(fab);
    var shell = fab.closest('.nf-phone') || fab.parentElement;
    var fr = fab.getBoundingClientRect();
    var sr = shell ? shell.getBoundingClientRect() : { left: 0, top: 0, width: 390 };
    // 目标中心 = 壳右上角（右边距 28 / 距顶 28）
    var cx = (fr.left - sr.left) + fr.width / 2;
    var cy = (fr.top - sr.top) + fr.height / 2;
    var tx = sr.width - 28 - fr.width / 2;
    var ty = 28 + fr.height / 2;
    gsap.to(fab, { x: tx - cx, y: ty - cy, scale: 0.25, opacity: 0, duration: 0.38, ease: 'power2.in' });
  }
  function fabFlyBack() {            // nf:close-profile：反向飞回
    if (!fab) return;
    gsap.killTweensOf(fab);
    gsap.to(fab, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.5)',
      onComplete: function () {
        fabFlying = false;
        gsap.set(fab, { clearProps: 'opacity' });
        startFabIdle();
        fabWiggleLoop();
      } });
  }

  /* ---------- 个人主页覆盖层（轻过渡，开合主体逻辑归 Codex） ---------- */
  var profileRect = null;              // open 时快照，供 close 时幽灵淡出定位
  function profileEl() {
    return findEl(['#nf-profile', '.nf-profile', '#nf-profile-overlay', '[data-nf-profile]']);
  }
  function profileOpen() {
    var p = profileEl(); if (!p) return;
    try { profileRect = p.getBoundingClientRect(); } catch (e) {}
    gsap.fromTo(p, { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out', overwrite: true });
  }
  function profileClose() {
    var p = profileEl(); if (!p) return;
    if (pageVisible(p)) {              // 关闭动画可见路径
      gsap.to(p, { opacity: 0, y: 14, scale: 0.985, duration: 0.22, ease: 'power2.in', overwrite: true });
    } else {                           // Codex 已移除 display：幽灵节点补一个可见收起
      ghostOut(p, profileRect || (pageEl('follow') || p).getBoundingClientRect(), 0);
    }
  }

  /* ---------- 精选 banner 自动轮播（仅精选 Tab 激活时跑） ---------- */
  var banner = null, bannerTimer = null;

  function discoverBanner() {
    if (banner) return banner;
    var root = findEl(['#nf-banner', '.nf-banner', '[data-nf-banner]', '[class*="banner"]']);
    if (!root) return null;
    var track = root.querySelector('.nf-banner-track, [class*="track"]') || root.firstElementChild;
    if (!track) return null;
    var count = track.children.length;
    if (count < 2 || count > 6) return null;   // 结构不像轮播就放弃，避免乱动
    // 初始页对齐 feeds.js 的激活指示点（不覆盖 Codex 的 active:1 初始态）
    var fb = window.NF_FEEDS && window.NF_FEEDS.featured && window.NF_FEEDS.featured.banner;
    var idx = fb && typeof fb.active === 'number' ? fb.active % count : 0;
    banner = { root: root, track: track, count: count, idx: idx,
      dots: root.querySelectorAll('.banner-dot') };
    return banner;
  }
  function bannerDots(idx) {
    if (!banner || !banner.dots || !banner.dots.length) return;
    for (var i = 0; i < banner.dots.length; i++) {
      var d = banner.dots[i];
      if (i === idx) { d.classList.add('active', 'nf-active'); d.style.opacity = ''; }
      else { d.classList.remove('active', 'nf-active'); }
    }
  }
  function bannerStep() {
    if (!banner) return;
    banner.idx = (banner.idx + 1) % banner.count;
    var w = banner.root.clientWidth || 358;
    gsap.to(banner.track, { x: -w * banner.idx, duration: 0.5, ease: 'power2.inOut' });
    bannerDots(banner.idx);
  }
  function bannerTick() {
    bannerStep();
    bannerTimer = gsap.delayedCall(5, bannerTick);
  }
  function startBanner() {
    if (!discoverBanner()) return;
    if (bannerTimer) return;
    bannerDots(banner.idx);            // 初始指示点 = feeds 的 active（不改到 0）
    bannerTimer = gsap.delayedCall(5, bannerTick);
  }
  function stopBanner() {
    if (bannerTimer) { bannerTimer.kill(); bannerTimer = null; }
  }
  function gateBanner(tabKey) {
    if (tabKey === 'featured') startBanner();
    else stopBanner();
  }

  /* ---------- 播客播放钮：波纹 + 图标旋转一次性 ---------- */
  var PLAY_SEL = '.nf-pod-play, .nf-play-btn, [data-nf-play], .nf-play';
  function onPlayClick(e) {
    var btn = e.target && e.target.closest ? e.target.closest(PLAY_SEL) : null;
    if (!btn) return;
    var pos = '';
    try { pos = getComputedStyle(btn).position; } catch (err) {}
    if (pos === 'static' || pos === '') btn.style.position = 'relative';
    var r = el('span', 'nf-ripple', {
      position: 'absolute', left: '50%', top: '50%', width: '12px', height: '12px',
      margin: '-6px 0 0 -6px', borderRadius: '50%',
      border: '2px solid ' + cssVar('--accent', '#3ecf8e'),
      pointerEvents: 'none', opacity: '0.8'
    });
    btn.appendChild(r);
    gsap.to(r, { scale: 4.2, opacity: 0, duration: 0.55, ease: 'power1.out',
      onComplete: function () { if (r.parentNode) r.parentNode.removeChild(r); } });
    var icon = btn.querySelector('svg,img,span,i') || btn.firstElementChild;
    if (icon) gsap.fromTo(icon, { rotation: 0 },
      { rotation: 360, duration: 0.5, ease: 'power1.inOut', overwrite: 'auto' });
    gsap.fromTo(btn, { scale: 0.88 },
      { scale: 1, duration: 0.45, ease: 'back.out(2)', overwrite: 'auto' });
  }

  /* ---------- v2 事件绑定 ---------- */
  function bindV2() {
    DOC.addEventListener('nf:tab-change', function (e) {
      var to = (e.detail && e.detail.to) || 'follow';
      gateHot(to);
      gateBanner(to);
      transitionOut(prevTab, to);      // 同步：旧页此刻的显隐状态才可信
      requestAnimationFrame(function () { transitionIn(to); }); // 入场等 display 切完
      prevTab = to;
    });
    DOC.addEventListener('nf:open-profile', function () {
      fabFlyToCorner();
      requestAnimationFrame(profileOpen);
    });
    DOC.addEventListener('nf:close-profile', function () {
      fabFlyBack();
      profileClose();
    });
    DOC.addEventListener('click', onPlayClick, false);

    // 悬浮助手是 Codex 并行渲染的：多次尝试发现，tab 切换时也补试
    var fabRetry = [0, 300, 800, 1500, 2500, 4000];
    for (var i = 0; i < fabRetry.length; i++) setTimeout(findFab, fabRetry[i]);

    // 默认「关注」页首屏卡片入场
    setTimeout(function () {
      var p = pageEl('follow');
      if (p && pageVisible(p) && !enteredTabs.follow) { enteredTabs.follow = true; staggerCards(p); }
    }, 450);
  }

  /* ---------- 启动 ---------- */
  function bootV1() {                  // 热搜页（依赖 stage 存在，找不到则轮询等待）
    stage = DOC.getElementById('nf-bubble-stage');
    if (!stage) { if (++bootTries < 50) setTimeout(bootV1, 200); return; }
    lb = DOC.getElementById('nf-leaderboard');

    DOC.addEventListener('nf:view-change', function (e) {
      var to = e.detail && e.detail.to;
      currentView = to || 'list';
      if (to === 'bubbles') { if (!hotSuspended) enterBubbles(); }
      else if (to === 'list') leaveBubbles();
    });
    DOC.addEventListener('nf:filter-change', function (e) {
      applyFilter((e.detail && e.detail.sector) || 'all', false);
    });
    DOC.addEventListener('nf:open-topic', detailOpen);
    DOC.addEventListener('nf:close-topic', detailClose);

    if (lb) {
      var mo = new MutationObserver(function () { animateLeaderboard(); });
      mo.observe(lb, { childList: true });
    }
    animateLeaderboard();               // 首屏榜单已在 DOM 的情况
    setTimeout(animateLeaderboard, 350); // Codex 晚一拍渲染的情况
  }

  function boot() {
    bindV2();                          // v2 全局动效不依赖 stage，先绑
    bootV1();
  }

  if (DOC.readyState === 'loading') DOC.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
