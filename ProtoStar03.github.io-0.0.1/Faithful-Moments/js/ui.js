// /js/ui.js
import { $, $all, formatTime } from "./utils.js";
import { getState, isFavorite, getNote, getFavorites } from "./state.js";

// 이 모듈은 "그리는 일"만 한다. 실제 데이터교체/이동은 app.js에서.
export function renderVerse(verse, index, total) {
  $("#verse-ref").textContent = verse ? verse.ref : "—";
  $("#verse-text").textContent = verse ? verse.text : "구절이 없습니다.";
  $("#note-input").value = verse ? getNote(verse.ref) : "";
  $("#pager-info").textContent = `${total ? index + 1 : 0} / ${total}`;

  // 즐겨찾기 버튼 상태
  if (verse && isFavorite(verse.ref)) {
    $("#fav-btn").textContent = "⭐ 즐겨찾기";
  } else {
    $("#fav-btn").textContent = "☆ 즐겨찾기";
  }

  // 묵상 모달 컨텐츠도 같이
  $("#med-ref").textContent = verse ? verse.ref : "";
  $("#med-text").textContent = verse ? verse.text : "";
}

export function renderInfo(resultCount) {
  const st = getState();
  $("#result-info").textContent = `검색 결과: ${resultCount}개 / 즐겨찾기: ${st.favorites.length}개`;
}

export function renderFavorites() {
  const list = $("#fav-list");
  const favs = getFavorites();
  list.innerHTML = "";
  if (favs.length === 0) {
    $("#fav-empty").style.display = "block";
    return;
  }
  $("#fav-empty").style.display = "none";
  favs.forEach(ref => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = ref;
    btn.addEventListener("click", () => {
      // 클릭 시 app.js에서 잡게 커스텀 이벤트를 보냄
      const ev = new CustomEvent("fm:goto-ref", { detail: { ref } });
      window.dispatchEvent(ev);
    });
    const del = document.createElement("button");
    del.textContent = "삭제";
    del.addEventListener("click", () => {
      const ev = new CustomEvent("fm:remove-fav", { detail: { ref } });
      window.dispatchEvent(ev);
    });
    li.appendChild(btn);
    li.appendChild(del);
    list.appendChild(li);
  });
}

export function renderTimer(sec) {
  $("#timer-text").textContent = `남은 시간: ${formatTime(sec)}`;
}
