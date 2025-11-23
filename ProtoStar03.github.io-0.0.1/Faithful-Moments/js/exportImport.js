// /js/exportImport.js
import { getState } from "./state.js";

export function exportUserData() {
  const { favorites, notes } = getState();
  const blob = new Blob([JSON.stringify({ favorites, notes }, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "faithful-moments-data.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function importUserData(onLoaded) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      onLoaded(json);
      alert("데이터를 불러왔습니다 ✅");
    } catch (e) {
      alert("불러오기에 실패했습니다.");
    }
  };
  input.click();
}
