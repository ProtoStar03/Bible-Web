// /js/app.js
import { $, $all, debounce, todaySeed } from "./utils.js";
import {
  getState,
  toggleTheme,
  setNote,
  addFavorite,
  removeFavorite,
  isFavorite
} from "./state.js";
import {
  loadVerses,
  getAllVerses,
  searchVerses,
  findByRef
} from "./verses.js";
import {
  renderVerse,
  renderInfo,
  renderFavorites,
  renderTimer
} from "./ui.js";
import {
  shareVerse,
  downloadVerseImage
} from "./share.js";
import {
  exportUserData,
  importUserData
} from "./exportImport.js";

let currentResults = [];
let currentIndex  = 0;
let timerSec      = 300;
let timerId       = null;

async function init() {
  const st = getState();
  document.documentElement.setAttribute("data-theme", st.theme);
  $("#theme-toggle").textContent = st.theme === "dark" ? "🌙 다크" : "🌞 라이트";

  await loadVerses("/data/verses_sample.json");
  const verses = getAllVerses();

  const todayIndex = todaySeed(verses.length);
  currentResults = verses;
  currentIndex   = todayIndex;

  renderVerse(currentResults[currentIndex], currentIndex, currentResults.length);
  renderInfo(currentResults.length);
  renderFavorites();
  renderTimer(timerSec);

  bindEvents();
}

function bindEvents() {
  // 검색
  const searchInput = $("#search-input");
  searchInput.addEventListener(
    "input",
    debounce((e) => {
      const q = e.target.value;
      currentResults = searchVerses(q);
      currentIndex   = 0;
      renderVerse(currentResults[0], 0, currentResults.length);
      renderInfo(currentResults.length);
    }, 150)
  );

  // 오늘의 말씀
  $("#today-btn").addEventListener("click", () => {
    const verses = getAllVerses();
    const idx    = todaySeed(verses.length);
    currentResults = verses;
    currentIndex   = idx;
    renderVerse(currentResults[currentIndex], currentIndex, currentResults.length);
    renderInfo(currentResults.length);
  });

  // 랜덤
  $("#random-btn").addEventListener("click", () => {
    if (!currentResults.length) return;
    currentIndex = Math.floor(Math.random() * currentResults.length);
    renderVerse(currentResults[currentIndex], currentIndex, currentResults.length);
    renderInfo(currentResults.length);
  });

  // 바로가기
  $("#goto-btn").addEventListener("click", () => {
    const ref = $("#goto-input").value.trim();
    if (!ref) return;
    const verse = findByRef(ref);
    if (!verse) {
      alert("해당 구절을 찾을 수 없습니다.");
      return;
    }
    currentResults = getAllVerses();
    currentIndex   = currentResults.findIndex(v => v.ref === verse.ref);
    renderVerse(currentResults[currentIndex], currentIndex, currentResults.length);
    renderInfo(currentResults.length);
  });

  // 이전/다음
  $("#prev-btn").addEventListener("click", () => {
    if (!currentResults.length) return;
    currentIndex = (currentIndex - 1 + currentResults.length) % currentResults.length;
    renderVerse(currentResults[currentIndex], currentIndex, currentResults.length);
    renderInfo(currentResults.length);
  });

  $("#next-btn").addEventListener("click", () => {
    if (!currentResults.length) return;
    currentIndex = (currentIndex + 1) % currentResults.length;
    renderVerse(currentResults[currentIndex], currentIndex, currentResults.length);
    renderInfo(currentResults.length);
  });

  // 즐겨찾기 토글
  $("#fav-btn").addEventListener("click", () => {
    const verse = currentResults[currentIndex];
    if (!verse) return;
    if (isFavorite(verse.ref)) {
      removeFavorite(verse.ref);
    } else {
      addFavorite(verse.ref);
    }
    renderVerse(verse, currentIndex, currentResults.length);
    renderFavorites();
    renderInfo(currentResults.length);
  });

  // 노트 자동 저장
  $("#note-input").addEventListener("input", (e) => {
    const verse = currentResults[currentIndex];
    if (!verse) return;
    setNote(verse.ref, e.target.value);
  });

  // 공유 / 이미지 저장
  $("#share-btn").addEventListener("click", () => {
    const verse = currentResults[currentIndex];
    if (!verse) return;
    shareVerse(verse);
  });

  $("#download-btn").addEventListener("click", () => {
    const verse = currentResults[currentIndex];
    if (!verse) return;
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    downloadVerseImage(verse, isDark);
  });

  // 테마 토글
  $("#theme-toggle").addEventListener("click", () => {
    toggleTheme();
    const theme = getState().theme;
    $("#theme-toggle").textContent = theme === "dark" ? "🌙 다크" : "🌞 라이트";
  });

  // 묵상 모드
  $("#open-meditation").addEventListener("click", () => {
    $("#meditation-modal").classList.remove("hidden");
    startTimer(300);
  });
  $("#close-meditation").addEventListener("click", () => {
    $("#meditation-modal").classList.add("hidden");
    stopTimer();
  });
  $all(".timer-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const sec = Number(btn.dataset.t);
      startTimer(sec);
    });
  });

  // Export / Import
  $("#export-btn").addEventListener("click", () => {
    exportUserData();
  });
  $("#import-btn").addEventListener("click", () => {
    importUserData((json) => {
      const st = getState();
      if (Array.isArray(json.favorites)) {
        json.favorites.forEach(ref => addFavorite(ref));
      }
      if (json.notes && typeof json.notes === "object") {
        st.notes = { ...st.notes, ...json.notes };
        localStorage.setItem("fm_notes", JSON.stringify(st.notes));
      }
      renderFavorites();
      renderInfo(currentResults.length);
    });
  });

  // 즐겨찾기 패널에서 발생시키는 커스텀 이벤트
  window.addEventListener("fm:goto-ref", (e) => {
    const { ref } = e.detail;
    const verse = findByRef(ref);
    if (!verse) return;
    currentResults = getAllVerses();
    currentIndex   = currentResults.findIndex(v => v.ref === ref);
    renderVerse(currentResults[currentIndex], currentIndex, currentResults.length);
    renderInfo(currentResults.length);
  });

  window.addEventListener("fm:remove-fav", (e) => {
    const { ref } = e.detail;
    removeFavorite(ref);
    renderFavorites();
    renderInfo(currentResults.length);
    renderVerse(currentResults[currentIndex], currentIndex, currentResults.length);
  });
}

// 타이머
function startTimer(sec) {
  stopTimer();
  timerSec = sec;
  renderTimer(timerSec);
  if (sec === 0) return;
  timerId = setInterval(() => {
    timerSec--;
    renderTimer(timerSec);
    if (timerSec <= 0) {
      stopTimer();
    }
  }, 1000);
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

init();
