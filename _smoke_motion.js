/* motion.js 冒烟测试 v2.1（临时，验证完可删）
 * 覆盖：18 泡渲染/结构/热度 + v2.1 五处修复断言
 *（①卡片根过滤 ②幽灵淡出×2 ④fab飞右上角 ⑤banner初始active）
 * rAF 垫片为可 flush 队列（原垫片由结构·Claude 2026-08-28 补入，此处升级为确定性版本） */
const fs = require('fs');
const path = require('path');

/* ---------- mock DOM ---------- */
function mkClassList() { const s = new Set(); return { s, add: (...c) => c.forEach(x => s.add(x)), remove: (...c) => c.forEach(x => s.delete(x)), toggle: c => s.has(c) ? s.delete(c) : s.add(c), contains: c => s.has(c) }; }
function mkEl(tag, rect) {
  const n = {
    tagName: (tag || 'div').toUpperCase(), children: [], style: {}, attributes: {},
    parentNode: null, firstElementChild: null, id: '', _vis: true, _rect: rect || null,
    get className() { return [...n._cl.s].join(' '); },
    set className(v) { n._cl.s = new Set(String(v).split(/\s+/).filter(Boolean)); n.attributes['class'] = String(v); },
    get classList() { return n._cl; },
    setAttribute(k, v) { n.attributes[k] = String(v); }, getAttribute(k) { return n.attributes[k]; },
    removeAttribute(k) { delete n.attributes[k]; },
    appendChild(c) { c.parentNode = n; n.children.push(c); if (!n.firstElementChild) n.firstElementChild = c; return c; },
    removeChild(c) { n.children = n.children.filter(x => x !== c); c.parentNode = null; return c; },
    remove() { if (n.parentNode) n.parentNode.removeChild(n); },
    contains(x) { let p = x; while (p) { if (p === n) return true; p = p.parentNode; } return false; },
    addEventListener() { }, removeEventListener() { },
    getBoundingClientRect() { return n._rect || { left: 0, top: 0, width: 360, height: 480 }; },
    closest() { return null; }, get offsetParent() { return n._vis ? {} : null; },
    get textContent() { return n._t || ''; }, set textContent(v) { n._t = v; },
    clientWidth: 360, clientHeight: 480,
    cloneNode(deep) {
      const c = mkEl(n.tagName.toLowerCase());
      c.id = n.id; c.attributes = Object.assign({}, n.attributes); c.style = Object.assign({}, n.style);
      c._cl.s = new Set(n._cl.s); c._vis = n._vis; c._rect = n._rect;
      if (deep) n.children.forEach(k => c.appendChild(k.cloneNode(true)));
      return c;
    },
    querySelector(sel) {
      for (const part of sel.split(',')) { const r = []; walk(n, part.trim(), r); if (r.length) return r[0]; }
      return null;
    },
    querySelectorAll(sel) {
      const out = [];
      for (const part of sel.split(',')) walk(n, part.trim(), out);
      return out;
    }
  };
  n._cl = mkClassList();
  return n;
}
function matchEl(c, sel) {
  if (sel.startsWith('.')) return c._cl.s.has(sel.slice(1));
  if (sel.startsWith('#')) return c.id === sel.slice(1);
  const m = sel.match(/^\[([^\]=~^$*]+)(?:\*?="(.*)")?\]$/);
  if (m) { const v = c.attributes[m[1]]; if (m[2] === undefined) return v !== undefined; return String(v).includes(m[2]); }
  return c.tagName === sel.toUpperCase();
}
function walk(root, sel, out) {
  root.children.forEach(c => { if (matchEl(c, sel)) out.push(c); walk(c, sel, out); });
}

const docRoot = mkEl('root', { left: 0, top: 0, width: 390, height: 844 });
const body = mkEl('body');
docRoot.appendChild(body);
const listeners = {};
const document = {
  readyState: 'complete', documentElement: mkEl('html'), body,
  createElement: mkEl,
  createDocumentFragment() { const f = mkEl('frag'); f.appendChild = c => { c.parentNode = f; f.children.push(c); return c; }; return f; },
  addEventListener(t, f) { (listeners[t] = listeners[t] || []).push(f); },
  removeEventListener() { },
  dispatchEvent(ev) { (listeners[ev.type] || []).forEach(f => f(ev)); return true; },
  querySelector(sel) { for (const part of sel.split(',')) { const r = []; walk(docRoot, part.trim(), r); if (r.length) return r[0]; } return null; },
  querySelectorAll(sel) { const r = []; for (const part of sel.split(',')) walk(docRoot, part.trim(), r); return r; },
  getElementById(id) {
    this._byId = this._byId || {};
    if (!this._byId[id]) {
      const r = []; walk(docRoot, '#' + id, r);
      if (r.length) this._byId[id] = r[0];
      else if (id === 'nf-bubble-stage' || id === 'nf-leaderboard') { const e = mkEl('div'); e.id = id; this._byId[id] = e; }
      else return null;
    }
    return this._byId[id];
  }
};

/* ---------- mock gsap / 平台（rAF 垫片升级版：可 flush，确定性断言） ---------- */
const tweens = [];
const gsap = {
  set(t, v) { const cl = Object.assign({}, v); delete cl.clearProps; (Array.isArray(t) ? t : [t]).forEach(x => { if (x) Object.assign(x.style, cl); }); },
  to(t, v) { tweens.push({ t, v }); return { kill() { }, isActive() { return false; } }; },
  fromTo(t, a, v) { return gsap.to(t, v); },
  killTweensOf() { },
  timeline() { const h = { to() { return h; }, fromTo() { return h; }, add() { return h; }, kill() { }, pause() { }, resume() { } }; return h; },
  delayedCall() { return { kill() { } }; },
  ticker: { add() { }, remove() { } }
};
const CustomEvent = function (type, opt) { this.type = type; this.detail = (opt || {}).detail; };
function MutationObserver() { return { observe() { }, disconnect() { } }; }
const rafQ = [];
const requestAnimationFrame = f => rafQ.push(f);
const cancelAnimationFrame = () => { };
const flushRaf = () => { const q = rafQ.splice(0); q.forEach(f => f()); };

/* ---------- mock 数据 & DOM 树 ---------- */
const src = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf8');
const NF_DATA = eval('(' + src.match(/window\.NF_DATA\s*=\s*([\s\S]*)/)[1].replace(/;\s*$/, '') + ')');
if (!NF_DATA.topics || NF_DATA.topics.length !== 18) throw new Error('topics 提取失败');

const shell = mkEl('div', { left: 0, top: 0, width: 390, height: 844 }); shell.className = 'nf-phone';
const pageFollow = mkEl('div'); pageFollow.className = 'nf-page'; pageFollow.setAttribute('data-page', 'follow');
for (let i = 0; i < 2; i++) {
  const card = mkEl('div'); card.className = 'nf-card';
  const cbody = mkEl('div'); cbody.className = 'nf-card-body';  // 嵌套子元素：应被①的根过滤剔除
  card.appendChild(cbody); pageFollow.appendChild(card);
}
const pageFeatured = mkEl('div'); pageFeatured.className = 'nf-page'; pageFeatured.setAttribute('data-page', 'featured');
pageFeatured._vis = false;
const featCard = mkEl('div'); featCard.className = 'nf-col-card'; pageFeatured.appendChild(featCard);

const bannerRoot = mkEl('div'); bannerRoot.id = 'nf-banner';
const track = mkEl('div'); track.className = 'nf-banner-track';
for (let i = 0; i < 3; i++) { const s = mkEl('div'); s.className = 'nf-banner-slide'; track.appendChild(s); }
bannerRoot.appendChild(track);
const pips = mkEl('div'); pips.className = 'banner-pips';
const dots = [];
for (let i = 0; i < 3; i++) { const d = mkEl('span'); d.className = 'banner-dot' + (i === 1 ? ' active' : ''); pips.appendChild(d); dots.push(d); }
bannerRoot.appendChild(pips);

const fab = mkEl('div', { left: 310, top: 684, width: 64, height: 64 }); fab.id = 'nf-fab'; fab.className = 'nf-fab';
const profile = mkEl('div'); profile.className = 'nf-profile'; profile.setAttribute('data-nf-profile', '');

body.appendChild(shell); shell.appendChild(pageFollow); shell.appendChild(pageFeatured);
shell.appendChild(bannerRoot); shell.appendChild(fab); shell.appendChild(profile);

const window = {
  gsap, NF_DATA,
  NF_FEEDS: { featured: { banner: { active: 1 } } }   // 修复⑤依赖：初始激活第 2 个指示点
};
global.window = window; global.document = document; global.CustomEvent = CustomEvent;
global.MutationObserver = MutationObserver; global.requestAnimationFrame = requestAnimationFrame;
global.cancelAnimationFrame = cancelAnimationFrame;
global.getComputedStyle = () => ({ getPropertyValue: () => '' });

eval(fs.readFileSync(path.join(__dirname, '..', 'motion.js'), 'utf8'));

/* ---------- 断言工具 ---------- */
let passed = 0;
function ok(cond, msg) { if (!cond) throw new Error('FAIL: ' + msg); passed++; }
const fire = (t, d) => document.dispatchEvent(new CustomEvent(t, { detail: d }));
const tweenOn = (target, pred) => { for (let i = tweens.length - 1; i >= 0; i--) if (tweens[i].t === target && (!pred || pred(tweens[i].v))) return tweens[i]; return null; };

/* ---------- v1 回归：泡泡 ---------- */
fire('nf:view-change', { to: 'bubbles' });            // 建泡
const stage = document.getElementById('nf-bubble-stage');
const frag = stage.children[0];
ok(frag.children.length === 18, '应渲染 18 个泡泡');
const t01 = frag.children.find(c => c.getAttribute('data-topic-id') === 't01');
const core01 = t01.children.find(c => c._cl.s.has('nf-b-core'));
ok(core01.children[1].textContent === '489.2万', 'fmtHeat 应为 489.2万，实际 ' + core01.children[1].textContent);
ok(t01.children.some(c => c._cl.s.has('nf-b-glow')), 'rank1 泡应有辉光层');
fire('nf:filter-change', { sector: 'hk' });

/* ---------- ② transitionOut：follow 可见 → 真身淡出 ---------- */
fire('nf:tab-change', { to: 'featured' });
flushRaf();
const outT = tweenOn(pageFollow, v => v.x === -12 && v.opacity === 0);
ok(!!outT, '② 旧页可见时应走真身淡出（x:-12, opacity:0）');

/* ---------- ⑤ banner 初始 active = NF_FEEDS.banner.active ---------- */
ok(dots[1].classList.contains('active') && !dots[0].classList.contains('active'),
  '⑤ banner 初始 active 应保持第 2 个点（active=1），不许被重置为 0');

/* ---------- ② 幽灵路径：featured 已隐藏 → body 出现幽灵克隆 ---------- */
fire('nf:tab-change', { to: 'discover' });            // featured _vis=false
flushRaf();
const ghost1 = body.children.find(c => c._cl.s.has('nf-page') && c !== pageFollow && c !== pageFeatured);
ok(!!ghost1, '② 旧页 display 已切走时应出现幽灵克隆节点淡出');

/* ---------- ① 根过滤：等 450ms 默认 follow stagger；④③ 等 fab 定时发现（setTimeout 0ms 档） ---------- */
setTimeout(() => {
  const stag = tweens.filter(t => Array.isArray(t.t));
  const followStag = stag.find(t => t.t.length === 2 && t.t.every(x => x._cl && x._cl.s.has('nf-card')));
  ok(!!followStag, '① follow 页 stagger 应只含 2 个卡片根节点（嵌套 .nf-card-body 被剔除）');
  const bodyIn = stag.some(t => Array.isArray(t.t) && t.t.some(x => x._cl.s.has('nf-card-body')));
  ok(!bodyIn, '① 嵌套子元素 .nf-card-body 不应进入 stagger 目标');

  /* ---------- ④ fab 飞右上角（fab 已被重试定时器发现） ---------- */
  fire('nf:open-profile', {});
  flushRaf();
  const fly = tweenOn(fab, v => v.scale === 0.25);
  ok(!!fly, '④ open-profile 应触发 fab 飞行 tween');
  ok(fly.v.x === -12 && fly.v.y === -656, '④ fab 应飞向右上角 (dx=-12, dy=-656)，实际 ' + fly.v.x + ',' + fly.v.y);

  /* ---------- ③ profile 关闭：display 已移除 → 幽灵克隆补收起 ---------- */
  profile._vis = false;
  fire('nf:close-profile', {});
  const ghost2 = body.children.find(c => c._cl.s.has('nf-profile'));
  ok(!!ghost2, '③ profile display 已移除时应出现幽灵克隆收起动画');

  /* 收尾：其余链路不抛错 */
  fire('nf:open-topic', { id: 't01' }); fire('nf:close-topic', {});
  fire('nf:view-change', { to: 'list' }); fire('nf:filter-change', { sector: 'all' });
  fire('nf:tab-change', { to: 'news' }); fire('nf:tab-change', { to: 'hot' }); flushRaf();
  fire('nf:tab-change', { to: 'follow' }); flushRaf();

  console.log('SMOKE_OK passed=' + passed + ' tween_calls=' + tweens.length);
  process.exit(0);
}, 500);
