// /js/verses.js
const FALLBACK_VERSES = [
  { ref: "시편 23:1", text: "여호와는 나의 목자시니 내게 부족함이 없으리로다" },
  { ref: "이사야 41:10", text: "두려워하지 말라 내가 너와 함께 함이라" },
  { ref: "빌립보서 4:13", text: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라" }
];

let verses = FALLBACK_VERSES.slice();

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
    console.warn("failed to load verses, using fallback", e);
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
    return text.includes(q) || ref.includes(q);
  });
}

export function findByRef(ref) {
  return verses.find(v => v.ref === ref);
}
