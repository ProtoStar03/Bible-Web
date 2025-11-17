// /js/app.js
import { $, $all, debounce, todaySeed } from "./utils.js";
import {
  getState,
  setTheme,
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
  findByRef,
  fetchOnlineVerse
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

// 이 앱에서만 쓰는 상태
let currentResults = [];  // 현재 검색 결과 배열
let currentIndex = 0;     // 결과 중 몇 번째를 보고 있는지
let timerId = null;       // 묵상 모드 타이머 id
let timerSec = 300;       // 기본 5분

async function init() {
  // 1) 테마 적용 (state에 저장돼 있던 걸 DOM에 반영)
  const st = getState();
  document.documentElement.setAttribute("data-theme", st.theme);

  // 2) 구절 로드 (로컬 JSON → 실패하면 fallback)
  await loadVerses("/data/verses.sample.json");
  const verses = getAllVerses();

  // 3) 오늘의 말씀 선택
  const todayIndex = todaySeed(verses.length);
  currentResults = verses;
  currentIndex = todayIndex;

  // 4) 초기 렌더
  renderVerse(currentResults[currentIndex], currentIndex, currentResults.length);
  renderInfo(currentResults.length);
  renderFavorites();
  renderTimer(timerSec);

  // 5) 이벤트 바인딩
  bindEvents();
}

function bindEvents() {
  // 검색
  const searchInput = $("#search-input");
  searchInput.addEventListener(
    "input",
    debounce((e) => {
      const q = e.target.value;
      const found = searchVerses(q);
      currentResults = found;
      currentIndex = 0;
      renderVerse(currentResults[0], 0, currentResults.length);
      renderInfo(currentResults.length);
    }, 150)
  );

  // 오늘의 말씀
  $("#today-btn").addEventListener("click", () => {
    const verses = getAllVerses();
    const idx = todaySeed(verses.length);
    currentResults = verses;
    currentIndex = idx;
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
  $("#goto-btn").addEventListener("click", async () => {
    const value = $("#goto-input").value.trim();
    if (!value) return;

    // 1) 로컬에서 찾기
    const local = findByRef(value);
    if (local) {
      currentResults = getAllVerses();
      currentIndex = currentResults.findIndex((v) => v.ref === local.ref);
      renderVerse(currentResults[currentIndex], currentIndex, currentResults.length);
      renderInfo(currentResults.length);
      return;
    }

    // 2) 없으면 온라인에서 영어라도 가져오기
    const online = await fetchOnlineVerse(value);
    if (online) {
      currentResults = [online];
      currentIndex = 0;
      renderVerse(online, 0, 1);
      renderInfo(1);
    } else {
      alert("로컬/온라인에서 해당 구절을 찾지 못했습니다.");
    }
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
    // 현재 카드와 즐겨찾기 패널 리렌더
    renderVerse(verse, currentIndex, currentResults.length);
    renderFavorites();
    renderInfo(currentResults.length);
  });

  // 노트 저장
  $("#note-input").addEventListener("input", (e) => {
    const verse = currentResults[currentIndex];
    if (!verse) return;
    setNote(verse.ref, e.target.value);
  });

  // 공유
  $("#share-btn").addEventListener("click", () => {
    const verse = currentResults[currentIndex];
    if (!verse) return;
    shareVerse(verse);
  });

  // 이미지 저장
  $("#download-btn").addEventListener("click", () => {
    const verse = currentResults[currentIndex];
    if (!verse) return;
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    downloadVerseImage(verse, isDark);
  });

  // 테마 토글
  $("#theme-toggle").addEventListener("click", () => {
    toggleTheme();
    // 버튼 문구는 여기서 바꿔도 됨
    const theme = getState().theme;
    $("#theme-toggle").textContent = theme === "dark" ? "🌙 다크" : "🌞 라이트";
  });

  // 묵상 모드 열기
  $("#open-meditation").addEventListener("click", () => {
    $("#meditation-modal").classList.remove("hidden");
    startTimer(300);
  });
  // 묵상 모드 닫기
  $("#close-meditation").addEventListener("click", () => {
    $("#meditation-modal").classList.add("hidden");
    stopTimer();
  });
  // 묵상 모드 내 타이머 버튼들
  $all(".timer-btn").forEach((btn) => {
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
      // 가져온 json을 state에 머지
      if (json.favorites && Array.isArray(json.favorites)) {
        json.favorites.forEach((ref) => addFavorite(ref));
      }
      if (json.notes && typeof json.notes === "object") {
        const st = getState();
        st.notes = { ...st.notes, ...json.notes };
        // state.js에서 직접 저장하는 함수가 없으니,
        // 간단히 localStorage 다시 저장해도 됨:
        localStorage.setItem("fm_notes", JSON.stringify(st.notes));
      }
      renderFavorites();
      renderInfo(currentResults.length);
    });
  });

  // ui.js에서 던져주는 커스텀 이벤트 받기
  window.addEventListener("fm:goto-ref", (e) => {
    const { ref } = e.detail;
    const v = findByRef(ref);
    if (!v) return;
    currentResults = getAllVerses();
    currentIndex = currentResults.findIndex((x) => x.ref === ref);
    renderVerse(currentResults[currentIndex], currentIndex, currentResults.length);
    renderInfo(currentResults.length);
  });

  window.addEventListener("fm:remove-fav", (e) => {
    const { ref } = e.detail;
    removeFavorite(ref);
    renderFavorites();
    renderInfo(currentResults.length);
    // 현재 카드가 방금 지운 즐겨찾기라면 버튼도 리렌더
    renderVerse(currentResults[currentIndex], currentIndex, currentResults.length);
  });
}

// 타이머 관련
function startTimer(sec) {
  stopTimer();
  timerSec = sec;
  renderTimer(timerSec);
  if (sec === 0) return; // 일시정지
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

// 진입
init();
