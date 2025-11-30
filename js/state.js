// /js/state.js
const THEME_KEY   = "fm_theme";
const FAV_KEY     = "fm_favs";
const NOTES_KEY   = "fm_notes";
const HISTORY_KEY = "fm_history";

const defaultState = {
  theme: "dark",
  favorites: [],
  notes: {},      // { "시편 23:1": "오늘 느낀 점..." }
  timer: 300,
  history: []     // [{ ref, ts }]
};

let state = {
  ...defaultState,
  theme: localStorage.getItem(THEME_KEY) || defaultState.theme,
  favorites: JSON.parse(localStorage.getItem(FAV_KEY)   || "[]"),
  notes:     JSON.parse(localStorage.getItem(NOTES_KEY) || "{}"),
  history:   JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]")
};

function persist() {
  localStorage.setItem(THEME_KEY, state.theme);
  localStorage.setItem(FAV_KEY,   JSON.stringify(state.favorites));
  localStorage.setItem(NOTES_KEY, JSON.stringify(state.notes));
  localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
}

export function getState() {
  return state;
}

// ----- 테마 -----
export function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  persist();
}

export function toggleTheme() {
  setTheme(state.theme === "dark" ? "light" : "dark");
}

// ----- 노트 -----
export function setNote(ref, text) {
  state.notes[ref] = text;
  persist();
}

export function getNote(ref) {
  return state.notes[ref] || "";
}

// ----- 즐겨찾기 -----
export function addFavorite(ref) {
  if (!state.favorites.includes(ref)) {
    state.favorites.push(ref);
    persist();
  }
}

export function removeFavorite(ref) {
  state.favorites = state.favorites.filter(r => r !== ref);
  persist();
}

export function isFavorite(ref) {
  return state.favorites.includes(ref);
}

export function getFavorites() {
  return state.favorites.slice();
}

// ----- 히스토리 -----
export function logHistory(ref) {
  if (!ref) return;
  const now = new Date().toISOString();
  state.history.push({ ref, ts: now });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
}

export function getHistory() {
  return state.history.slice();
}

export function resetAll() {
  state = { ...defaultState };
  persist();
}
