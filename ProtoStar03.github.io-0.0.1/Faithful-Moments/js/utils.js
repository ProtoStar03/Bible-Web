// /js/utils.js
export function $(sel, parent = document) {
  return parent.querySelector(sel);
}

export function $all(sel, parent = document) {
  return Array.from(parent.querySelectorAll(sel));
}

// 간단 디바운스
export function debounce(fn, delay = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// mm:ss 포맷
export function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// 오늘 날짜 기반 시드
export function todaySeed(mod = 100) {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return seed % mod;
}
