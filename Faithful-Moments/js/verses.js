// /js/verses.js
// 로컬 JSON을 기본으로 쓰고, 없으면 내장 샘플을 fallback

import { getLanguage } from "./state.js";

const FALLBACK_VERSES = [
  {
    ref: "요한복음 3:16",
    book: "요한복음",
    chapter: 3,
    verse: 16,
    text: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라"
  },
  {
    ref: "시편 23:1",
    book: "시편",
    chapter: 23,
    verse: 1,
    text: "여호와는 나의 목자시니 내게 부족함이 없으리로다"
  },
  {
    ref: "빌립보서 4:13",
    book: "빌립보서",
    chapter: 4,
    verse: 13,
    text: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라"
  }
];

let verses = FALLBACK_VERSES.slice();

export async function loadVerseByLanguage(refLike) {
  const lang = getLanguage();

  if (lang === "kor") {
    // 로컬에서 찾기
    const local = findByRef(refLike);
    if (local) return local;

    // 없으면 null
    return null;
  }

  if (lang === "eng") {
    // 영어 API에서 가져오기
    const online = await fetchOnlineVerse(refLike);
    return online;
  }
}

export async function loadVerses(url = "/data/verses_sample.json") {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("verses json not found, using fallback");
      return verses;
    }
    const json = await res.json();
    verses = Array.isArray(json) ? json : FALLBACK_VERSES.slice();
    return verses;
  } catch (e) {
    console.warn("failed to load verses, fallback", e);
    return verses;
  }
}

export function getAllVerses() {
  return verses;
}

export function searchVerses(query) {
  if (!query.trim()) return verses;
  const q = query.trim().toLowerCase();
  return verses.filter(v => {
    const text = (v.text || "").toLowerCase();
    const ref  = (v.ref  || "").toLowerCase();
    const book = (v.book || "").toLowerCase();
    return text.includes(q) || ref.includes(q) || book.includes(q);
  });
}

export function findByRef(ref) {
  return verses.find(v => v.ref === ref);
}

// 영어 API fallback (bible.com은 클라이언트 직접호출 X)
export async function fetchOnlineVerse(refLike) {
  try {
    const res = await fetch("https://bible-api.com/" + encodeURIComponent(refLike));
    if (!res.ok) return null;
    const data = await res.json();
    return {
      ref: data.reference,
      book: data.reference.split(" ")[0],
      chapter: 0,
      verse: 0,
      text: data.text.trim()
    };
  } catch (e) {
    return null;
  }
}
