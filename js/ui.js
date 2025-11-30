// /js/ui.js
import { formatTime, $, $all } from "./utils.js";
import { getState, isFavorite, getNote, getFavorites } from "./state.js";

export function renderVerse(verse, index, total) {
  const refEl   = $("#verse-ref");
  const textEl  = $("#verse-text");
  const noteEl  = $("#note-input");
  const pagerEl = $("#pager-info");
  const favBtn  = $("#fav-btn");

  if (!verse) {
    refEl.textContent   = "—";
    textEl.textContent  = "구절이 없습니다.";
    noteEl.value        = "";
    pagerEl.textContent = "0 / 0";
    favBtn.textContent  = "☆ 즐겨찾기";
    $("#med-ref").textContent  = "";
    $("#med-text").textContent = "";
    return;
  }

  refEl.textContent   = verse.ref;
  textEl.textContent  = verse.text;
  noteEl.value        = getNote(verse.ref) || "";
  pagerEl.textContent = `${index + 1} / ${total}`;

  if (isFavorite(verse.ref)) {
    favBtn.textContent = "⭐ 즐겨찾기";
  } else {
    favBtn.textContent = "☆ 즐겨찾기";
  }

  $("#med-ref").textContent  = verse.ref;
  $("#med-text").textContent = verse.text;
}

export function renderInfo(resultCount) {
  const st = getState();
  $("#result-info").textContent =
    `검색 결과: ${resultCount}개 / 즐겨찾기: ${st.favorites.length}개`;
}

export function renderFavorites() {
  const list   = $("#fav-list");
  const emptyP = $("#fav-empty");
  const favs   = getFavorites();

  list.innerHTML = "";

  if (!favs.length) {
    emptyP.style.display = "block";
    return;
  }
  emptyP.style.display = "none";

  favs.forEach(ref => {
    const li  = document.createElement("li");
    const btn = document.createElement("button");
    const del = document.createElement("button");

    btn.textContent = ref;
    btn.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("fm:goto-ref", { detail: { ref } }));
    });

    del.textContent = "삭제";
    del.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("fm:remove-fav", { detail: { ref } }));
    });

    li.appendChild(btn);
    li.appendChild(del);
    list.appendChild(li);
  });
}

export function renderTimer(sec) {
  $("#timer-text").textContent = `남은 시간: ${formatTime(sec)}`;
}

// 🔹 새로 추가: 히스토리 패널 렌더링
export function renderHistory(stats) {
  const summaryEl = $("#history-summary");
  const listEl    = $("#history-top");

  if (!stats || stats.total === 0) {
    summaryEl.textContent = "아직 묵상 기록이 없어요. 오늘의 말씀 버튼을 눌러보세요.";
    listEl.innerHTML = "";
    return;
  }

  summaryEl.textContent =
    `전체 ${stats.total}회 묵상, 최근 7일 동안 ${stats.last7}회, 마지막 묵상일: ${stats.lastDateText}`;

  listEl.innerHTML = "";
  stats.topVerses.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.ref} – ${item.count}회`;
    listEl.appendChild(li);
  });
}
