'use strict';
/* ============================================================
   মেইন স্ক্রিপ্ট — ডা. আরিফুল ইসলাম (রাজশাহী)
   ভাষা টগল, ডার্ক মোড, স্টিকি নেভ, রিভিল অ্যানিমেশন, কাউন্টার,
   অ্যাপয়েন্টমেন্ট/রিভিউ ফর্ম, সিরিয়াল তালিকা, FAQ, স্লাইডার,
   স্ক্রল-টু-টপ — সবকিছু এখানে।
   ============================================================ */

/* ---------- সহায়ক ---------- */
const $  = (sel, ctx) => (ctx || document).querySelector(sel);
const $$ = (sel, ctx) => Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

let LANG = localStorage.getItem('drai_lang') || 'bn';

const t = (key) => {
  const pack = I18N[LANG] || I18N.bn;
  return (key in pack) ? pack[key] : ((key in I18N.bn) ? I18N.bn[key] : key);
};
const loc = (s) => LANG === 'bn' ? String(s).replace(/[0-9]/g, (d) => BN_DIGITS[+d]) : String(s);
const isoToday = () => {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};
const cfg = () => window.SITE_CONFIG || {};

/* ---------- ভাষা প্রয়োগ (i18n) ---------- */
function applyI18n() {
  document.documentElement.lang = LANG;
  document.title = t('site.title');
  $$('[data-i18n]').forEach((el) => {
    let s = t(el.dataset.i18n);
    if (s.indexOf('{year}') > -1) s = s.replace('{year}', loc(String(new Date().getFullYear())));
    el.innerHTML = s;
  });
  $$('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  $$('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  $$('[data-i18n-alt]').forEach((el) => { el.alt = t(el.dataset.i18nAlt); });
  const lb = $('#langBtnText');
  if (lb) lb.textContent = LANG === 'bn' ? 'EN' : 'বাংলা';
  /* খোলা FAQ থাকলে উচ্চতা পুনর্গণনা */
  $$('.faq-item.open').forEach((it) => {
    const a = $('.faq-a', it);
    if (a) a.style.maxHeight = a.scrollHeight + 'px';
  });
  updateCountersFinal();
  renderSerials();
}

/* ---------- প্রিলোডার ---------- */
window.addEventListener('load', () => {
  setTimeout(() => { const p = $('#preloader'); if (p) p.classList.add('done'); }, 400);
});
setTimeout(() => { const p = $('#preloader'); if (p) p.classList.add('done'); }, 2600);

/* ---------- নেভবার ও মোবাইল মেনু ---------- */
const navbar = $('#navbar');
const burger = $('#burger');
function toggleMenu(open) {
  document.body.classList.toggle('menu-open', open);
  if (burger) burger.classList.toggle('open', open);
}
if (burger) burger.addEventListener('click', () => toggleMenu(!document.body.classList.contains('menu-open')));
const navBackdrop = $('#navBackdrop');
if (navBackdrop) navBackdrop.addEventListener('click', () => toggleMenu(false));
$$('.mobile-panel a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));

/* সেকশন-স্পাই: স্ক্রল অনুযায়ী মেনুর সক্রিয় লিংক */
const secSpy = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const id = '#' + e.target.id;
      $$('.nav-menu a, .mobile-panel a').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === id));
    }
  });
}, { rootMargin: '-42% 0px -52% 0px' });
['home', 'about', 'services', 'why', 'appointment', 'tips', 'reviews', 'faq', 'contact'].forEach((id) => {
  const el = document.getElementById(id);
  if (el) secSpy.observe(el);
});

/* ---------- স্ক্রলে রিভিল অ্যানিমেশন ---------- */
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
  });
}, { threshold: 0.14 });
$$('.rv, .rv-l, .rv-r, .rv-s').forEach((el) => {
  if (el.dataset.delay) el.style.transitionDelay = el.dataset.delay + 'ms';
  revealIO.observe(el);
});

/* ---------- সংখ্যা কাউন্টার ---------- */
function animateCount(el) {
  const target = +el.dataset.count || 0;
  const suf = el.dataset.suffix || '';
  const dur = 1800;
  const st = performance.now();
  const step = (now) => {
    const p = Math.min((now - st) / dur, 1);
    const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
    el.textContent = loc(v.toLocaleString('en-US')) + suf;
    if (p < 1) requestAnimationFrame(step);
    else { el.dataset.final = String(target); el.dataset.suf = suf; }
  };
  requestAnimationFrame(step);
}
function updateCountersFinal() {
  $$('.stat-num').forEach((el) => {
    if (el.dataset.final !== undefined) {
      el.textContent = loc((+el.dataset.final).toLocaleString('en-US')) + (el.dataset.suf || '');
    }
  });
}
const statsBox = $('.hero-stats');
if (statsBox) {
  const cIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { $$('.stat-num', statsBox).forEach(animateCount); cIO.disconnect(); }
    });
  }, { threshold: 0.4 });
  cIO.observe(statsBox);
}

/* ---------- চেম্বার খোলা/বন্ধ লাইভ স্টেটাস ---------- */
function chamberIsOpen() {
  const now = new Date();
  const openDays = [6, 0, 1, 2, 3, 4]; /* শনি–বৃহস্পতি */
  const h = now.getHours() + now.getMinutes() / 60;
  return openDays.includes(now.getDay()) && h >= 17 && h < 21;
}
function updateOpenChips() {
  const open = chamberIsOpen();
  $$('.open-chip').forEach((c) => {
    c.classList.toggle('off', !open);
    const sp = $('span', c);
    if (sp) sp.innerHTML = open ? t('hero.open') : t('hero.closed');
  });
}
setInterval(updateOpenChips, 60000);

/* ---------- টোস্ট বার্তা ---------- */
function toast(msg, ok) {
  const box = $('#toastBox');
  if (!box) return;
  const el = document.createElement('div');
  el.className = 'toast ' + (ok ? 'ok' : 'err');
  el.innerHTML = '<i class="fa-solid ' + (ok ? 'fa-circle-check' : 'fa-circle-exclamation') + '"></i><span>' + esc(msg) + '</span>';
  box.appendChild(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 4200);
}

/* ---------- সিরিয়াল তালিকা (ডাটা ফেচিং) ---------- */
function modeLabel() {
  const m = DataService.backend();
  return m === 'firebase' ? t('mode.firebase') : (m === 'sheets' ? t('mode.sheets') : t('mode.local'));
}
function slotLabel(v) {
  const opt = $('#fSlot option[value="' + v + '"]');
  return opt ? opt.textContent : v;
}
function maskName(n) {
  const parts = String(n || '').trim().split(/\s+/);
  if (!parts[0]) return '';
  return parts[0] + (parts[1] ? ' ' + parts[1].charAt(0) + '.' : '');
}
async function renderSerials() {
  const ul = $('#serialList');
  const chip = $('#modeChip');
  if (chip) chip.textContent = modeLabel();
  if (!ul) return;
  let list = [];
  try { list = await DataService.getAppointments(); } catch (e) { list = []; }
  const today = list.filter((a) => a && a.date === isoToday());
  if (!today.length) {
    ul.innerHTML = '<li class="empty">' + esc(t('book.empty')) + '</li>';
    return;
  }
  ul.innerHTML = today.map((a, i) =>
    '<li><span class="sl-no">' + esc(loc(a.serial || ('SR-' + String(i + 1).padStart(3, '0')))) + '</span>' +
    '<span class="sl-name">' + esc(maskName(a.name)) + '</span>' +
    '<span class="sl-time">' + esc(a.slot ? slotLabel(a.slot) : '') + '</span></li>'
  ).join('');
}

/* ---------- অ্যাপয়েন্টমেন্ট ফর্ম ---------- */
const apptForm = $('#apptForm');
if (apptForm) {
  const fDate = $('#fDate');
  if (fDate) fDate.min = isoToday();
  apptForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    ['eName', 'ePhone', 'eDate', 'eService'].forEach((id) => { const el = $('#' + id); if (el) el.textContent = ''; });
    const name = $('#fName').value.trim();
    const phone = $('#fPhone').value.replace(/[\s\-]/g, '');
    const age = $('#fAge').value;
    const gender = $('#fGender').value;
    const service = $('#fService').value;
    const date = $('#fDate').value;
    const slot = $('#fSlot').value;
    const msg = $('#fMsg').value.trim();
    let bad = false;
    if (name.length < 3) { $('#eName').textContent = t('book.err_name'); bad = true; }
    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(phone)) { $('#ePhone').textContent = t('book.err_phone'); bad = true; }
    if (!date || date < isoToday()) { $('#eDate').textContent = t('book.err_date'); bad = true; }
    if (!service) { $('#eService').textContent = t('book.err_service'); bad = true; }
    if (bad) return;
    const btn = $('#apptSubmit');
    btn.classList.add('loading'); btn.disabled = true;
    try {
      const list = await DataService.getAppointments();
      const todays = list.filter((a) => a && a.date === isoToday()).length;
      const max = cfg().maxSerialsPerDay || 30;
      if (todays >= max) throw new Error('full');
      const serial = 'SR-' + isoToday().replace(/-/g, '') + '-' + String(todays + 1).padStart(3, '0');
      const appt = { id: Date.now().toString(36), serial: serial, name: name, phone: phone, age: age, gender: gender, service: service, date: date, slot: slot, msg: msg, createdAt: new Date().toISOString() };
      await DataService.saveAppointment(appt);
      const box = $('#apptSuccess');
      if (box) {
        box.innerHTML = t('book.ok')
          .replace('{name}', esc(name))
          .replace('{serial}', '<b>' + esc(loc(serial)) + '</b>');
        box.hidden = false;
      }
      toast(t('book.toast'), true);
      apptForm.reset();
      if (fDate) fDate.min = isoToday();
      renderSerials();
    } catch (err) {
      toast(err && err.message === 'full' ? t('book.full') : t('book.err'), false);
    } finally {
      btn.classList.remove('loading'); btn.disabled = false;
    }
  });
}

/* ---------- রিভিউ স্লাইডার ও ফর্ম ---------- */
let reviews = [];
let revIdx = 0;
let revTimer = null;
function seeds() {
  return [1, 2, 3].map((i) => ({
    name: t('rev.r' + i + 'n'),
    area: t('rev.r' + i + 'a'),
    text: t('rev.r' + i + 'x'),
    stars: i === 3 ? 4 : 5
  }));
}
async function loadReviews() {
  let stored = [];
  try { stored = await DataService.getReviews(); } catch (e) { stored = []; }
  reviews = stored.concat(seeds());
  if (revIdx >= reviews.length) revIdx = 0;
  renderReviews();
}
function starHtml(n) {
  let h = '';
  for (let i = 1; i <= 5; i++) h += '<i class="fa-solid fa-star' + (i <= n ? '' : ' inactive') + '"></i>';
  return h;
}
function renderReviews() {
  const track = $('#revTrack');
  const dots = $('#revDots');
  if (!track || !reviews.length) return;
  track.innerHTML = reviews.map((r) =>
    '<article class="rev-slide">' +
      '<i class="fa-solid fa-quote-right rev-quote"></i>' +
      '<div class="rev-stars">' + starHtml(r.stars || 5) + '</div>' +
      '<p class="rev-text">' + esc(r.text || '') + '</p>' +
      '<div class="rev-who">' +
        '<img src="https://ui-avatars.com/api/?name=' + encodeURIComponent(r.name || 'P') + '&background=0d9488&color=fff&size=96&bold=true" alt="' + esc(r.name || '') + '">' +
        '<div><b>' + esc(r.name || '') + '</b><small>' + esc(r.area || '') + '</small></div>' +
      '</div>' +
    '</article>'
  ).join('');
  dots.innerHTML = reviews.map((_, i) =>
    '<button class="rdot' + (i === revIdx ? ' on' : '') + '" data-i="' + i + '" aria-label="review ' + (i + 1) + '"></button>'
  ).join('');
  $$('.rdot', dots).forEach((b) => b.addEventListener('click', () => { goRev(+b.dataset.i); restartRevTimer(); }));
  track.style.transform = 'translateX(-' + (revIdx * 100) + '%)';
}
function goRev(i) {
  if (!reviews.length) return;
  revIdx = (i + reviews.length) % reviews.length;
  const track = $('#revTrack');
  if (track) track.style.transform = 'translateX(-' + (revIdx * 100) + '%)';
  $$('.rdot').forEach((d, idx) => d.classList.toggle('on', idx === revIdx));
}
function restartRevTimer() {
  clearInterval(revTimer);
  revTimer = setInterval(() => goRev(revIdx + 1), cfg().carouselAutoMs || 6000);
}
const revWrap = $('.rev-wrap');
if (revWrap) {
  revWrap.addEventListener('mouseenter', () => clearInterval(revTimer));
  revWrap.addEventListener('mouseleave', restartRevTimer);
}
const revPrev = $('#revPrev');
if (revPrev) revPrev.addEventListener('click', () => { goRev(revIdx - 1); restartRevTimer(); });
const revNext = $('#revNext');
if (revNext) revNext.addEventListener('click', () => { goRev(revIdx + 1); restartRevTimer(); });

const revForm = $('#revForm');
if (revForm) {
  revForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = $('#rErr');
    if (errEl) errEl.textContent = '';
    const name = $('#rName').value.trim();
    const text = $('#rMsg').value.trim();
    const stars = +($('#rStar').value || 5);
    if (name.length < 2 || text.length < 4) {
      if (errEl) errEl.textContent = t('rev.err');
      return;
    }
    const btn = $('#revSubmit');
    if (btn) { btn.classList.add('loading'); btn.disabled = true; }
    try {
      await DataService.saveReview({ id: Date.now().toString(36), name: name, text: text, stars: stars, createdAt: new Date().toISOString() });
      toast(t('rev.ok'), true);
      revForm.reset();
      revIdx = 0;
      await loadReviews();
    } catch (err) {
      toast(t('rev.err2'), false);
    } finally {
      if (btn) { btn.classList.remove('loading'); btn.disabled = false; }
    }
  });
}

/* ---------- FAQ অ্যাকর্ডিয়ন ---------- */
$$('.faq-item').forEach((item) => {
  const q = $('.faq-q', item);
  const a = $('.faq-a', item);
  if (!q || !a) return;
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    $$('.faq-item.open').forEach((o) => {
      o.classList.remove('open');
      const oa = $('.faq-a', o);
      if (oa) oa.style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add('open');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

/* ---------- স্ক্রল ইফেক্ট: নেভবার + স্ক্রল-টু-টপ (হিরোর পরে) ---------- */
const toTop = $('#toTop');
const waBtn = $('#waBtn');
const ringFg = $('#toTopRing');
const RING_C = 2 * Math.PI * 20;
if (ringFg) ringFg.style.strokeDasharray = String(RING_C);
function onScroll() {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 30);
  const hero = $('#home');
  const show = !!(hero && window.scrollY > hero.offsetHeight * 0.55);
  if (toTop) toTop.classList.toggle('visible', show);
  if (waBtn) waBtn.classList.toggle('visible', show);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (ringFg) ringFg.style.strokeDashoffset = String(RING_C * (1 - (max > 0 ? window.scrollY / max : 0)));
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ---------- ভাষা ও থিম টগল ---------- */
const langBtn = $('#langBtn');
if (langBtn) langBtn.addEventListener('click', () => {
  LANG = LANG === 'bn' ? 'en' : 'bn';
  localStorage.setItem('drai_lang', LANG);
  applyI18n();
  loadReviews();
  updateOpenChips();
});
if (localStorage.getItem('drai_theme') === 'dark') document.documentElement.classList.add('dark');
const darkBtn = $('#darkBtn');
if (darkBtn) darkBtn.addEventListener('click', () => {
  const on = document.documentElement.classList.toggle('dark');
  localStorage.setItem('drai_theme', on ? 'dark' : 'light');
});

/* ---------- ইনিশিয়ালাইজেশন ---------- */
(function init() {
  const wa = 'https://wa.me/' + (cfg().whatsappNumber || '8801712345678');
  if (waBtn) waBtn.href = wa;
  const waFoot = $('#waFoot');
  if (waFoot) waFoot.href = wa;
  applyI18n();
  loadReviews();
  restartRevTimer();
  updateOpenChips();
})();
