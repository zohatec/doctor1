'use strict';
/* ============================================================
   ডাটা সার্ভিস — ফর্মের ডাটা ফ্রি স্টোরেজে সেভ ও ফেচ করার একক জায়গা
   ------------------------------------------------------------
   মোড ১) Firebase Realtime Database (REST API) — ফ্রি
   মোড ২) Google Apps Script + Google Sheets — ফ্রি
   মোড ৩) ব্রাউজারের localStorage — ডেমো ফলব্যাক (সবসময় কাজ করে)

   URL সেট করা হয় js/config.js ফাইলে। বিস্তারিত নির্দেশনা
   config.js এর কমেন্টে দেওয়া আছে।
   ============================================================ */
const DataService = (function () {

  const APPT_KEY = 'drai_appointments_v1';
  const REV_KEY = 'drai_reviews_v1';

  function cfg() { return window.SITE_CONFIG || {}; }

  /* কোন ব্যাকএন্ড ব্যবহৃত হবে তা নির্ধারণ */
  function backend() {
    const c = cfg();
    if (c.firebaseDatabaseUrl) return 'firebase';
    if (c.googleAppsScriptUrl) return 'sheets';
    return 'local';
  }

  function base() { return String(cfg().firebaseDatabaseUrl || '').replace(/\/+$/, ''); }

  /* ---------- localStorage সহায়ক ---------- */
  function lsGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      const v = raw ? JSON.parse(raw) : null;
      return Array.isArray(v) ? v : fallback;
    } catch (e) { return fallback; }
  }
  function lsSet(key, arr) {
    try { localStorage.setItem(key, JSON.stringify(arr)); } catch (e) { /* স্টোরেজ পূর্ণ হলে চুপচাপ এগিয়ে যাই */ }
  }

  /* ---------- অ্যাপয়েন্টমেন্ট: পড়া (ডাটা ফেচিং) ---------- */
  async function getAppointments() {
    const b = backend();
    try {
      if (b === 'firebase') {
        const r = await fetch(base() + '/appointments.json', { cache: 'no-store' });
        if (!r.ok) throw new Error('http ' + r.status);
        const data = await r.json();
        return data ? Object.keys(data).map(function (k) { return Object.assign({ id: k }, data[k]); }) : [];
      }
      if (b === 'sheets') {
        const r = await fetch(cfg().googleAppsScriptUrl + '?action=list&type=appointments', { cache: 'no-store' });
        if (!r.ok) throw new Error('http ' + r.status);
        const data = await r.json();
        return Array.isArray(data) ? data : [];
      }
    } catch (e) {
      /* নেটওয়ার্ক ব্যর্থ হলে নিচের লোকাল ডাটা ব্যবহৃত হবে */
    }
    return lsGet(APPT_KEY, []);
  }

  /* ---------- অ্যাপয়েন্টমেন্ট: সেভ ---------- */
  async function saveAppointment(item) {
    const b = backend();
    if (b === 'firebase') {
      const r = await fetch(base() + '/appointments.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!r.ok) throw new Error('save failed');
      return { mode: b };
    }
    if (b === 'sheets') {
      await fetch(cfg().googleAppsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({ type: 'appointment' }, item))
      });
      return { mode: b };
    }
    const list = lsGet(APPT_KEY, []);
    list.push(item);
    lsSet(APPT_KEY, list);
    return { mode: 'local' };
  }

  /* ---------- রিভিউ: পড়া (ডাটা ফেচিং) ---------- */
  async function getReviews() {
    const b = backend();
    try {
      if (b === 'firebase') {
        const r = await fetch(base() + '/reviews.json', { cache: 'no-store' });
        if (!r.ok) throw new Error('http ' + r.status);
        const data = await r.json();
        return data ? Object.keys(data).map(function (k) { return Object.assign({ id: k }, data[k]); }) : [];
      }
      if (b === 'sheets') {
        const r = await fetch(cfg().googleAppsScriptUrl + '?action=list&type=reviews', { cache: 'no-store' });
        if (!r.ok) throw new Error('http ' + r.status);
        const data = await r.json();
        return Array.isArray(data) ? data : [];
      }
    } catch (e) { /* লোকালে ফলব্যাক */ }
    return lsGet(REV_KEY, []);
  }

  /* ---------- রিভিউ: সেভ ---------- */
  async function saveReview(item) {
    const b = backend();
    if (b === 'firebase') {
      const r = await fetch(base() + '/reviews.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!r.ok) throw new Error('save failed');
      return { mode: b };
    }
    if (b === 'sheets') {
      await fetch(cfg().googleAppsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({ type: 'review' }, item))
      });
      return { mode: b };
    }
    const list = lsGet(REV_KEY, []);
    list.push(item);
    lsSet(REV_KEY, list);
    return { mode: 'local' };
  }

  return {
    backend: backend,
    getAppointments: getAppointments,
    saveAppointment: saveAppointment,
    getReviews: getReviews,
    saveReview: saveReview
  };
})();
