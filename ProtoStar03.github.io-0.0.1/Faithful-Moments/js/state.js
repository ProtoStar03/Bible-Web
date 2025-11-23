// /js/state.js
const THEME_KEY = "fm_theme";
const FAV_KEY = "fm_favs";
const NOTES_KEY = "fm_notes";
const LANG_KEY = "fm_lang";

const defaultState = {
  theme: "dark",
  favorites: [],
  notes: {},      // { "요한복음 3:16": "오늘 느낀 점..." }
  timer: 300
};

state.language = localStorage.getItem(LANG_KEY) || "kor";

let state = {
  ...defaultState,
  theme: localStorage.getItem(THEME_KEY) || "dark",
  favorites: JSON.parse(localStorage.getItem(FAV_KEY) || "[]"),
  notes: JSON.parse(localStorage.getItem(NOTES_KEY) || "{}"),
};

// 저장
function persist() {
  localStorage.setItem(THEME_KEY, state.theme);
  localStorage.setItem(FAV_KEY, JSON.stringify(state.favorites));
  localStorage.setItem(NOTES_KEY, JSON.stringify(state.notes));
}

export function getState() {
  return state;
}

export function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  persist();
}

export function toggleTheme() {
  setTheme(state.theme === "dark" ? "light" : "dark");
}

export function setNote(ref, text) {
  state.notes[ref] = text;
  persist();
}

export function getNote(ref) {
  return state.notes[ref] || "";
}

export function addFavorite(ref) {
  if (!state.favorites.includes(ref)) {
    state.favorites.push(ref);
    persist();
  }
}

export function removeFavorite(ref) {
  state.favorites = state.favorites.filter((r) => r !== ref);
  persist();
}

export function isFavorite(ref) {
  return state.favorites.includes(ref);
}

export function getFavorites() {
  return state.favorites.slice();
}

export function resetAll() {
  state = { ...defaultState };
  persist();
}

export function setLanguage(lang) {
  state.language = lang;
  localStorage.setItem(LANG_KEY, lang);
}

export function getLanguage() {
  return state.language;
}