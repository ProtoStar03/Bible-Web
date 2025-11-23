// /js/share.js
export async function shareVerse(verse) {
  if (!verse) return;
  const content = `${verse.ref}\n\n${verse.text}\n\n— Faithful Moments`;
  if (navigator.share) {
    await navigator.share({
      title: verse.ref,
      text: content
    });
  } else {
    await navigator.clipboard.writeText(content);
    alert("클립보드에 복사했습니다 ✨");
  }
}

export function downloadVerseImage(verse, isDark = true) {
  if (!verse) return;
  const w = 1080, h = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, isDark ? "#0f172a" : "#e2e8f0");
  grad.addColorStop(1, isDark ? "#111827" : "#f8fafc");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = isDark ? "#e2e8f0" : "#0f172a";
  ctx.font = "bold 48px system-ui";
  ctx.fillText("Faithful Moments", 60, 90);

  ctx.font = "bold 40px system-ui";
  ctx.fillText(verse.ref, 60, 170);

  ctx.font = "32px system-ui";
  const maxWidth = w - 120;
  const words = verse.text.split(" ");
  let line = "";
  let y = 240;
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth) {
      ctx.fillText(line, 60, y);
      line = word;
      y += 46;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, 60, y);

  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = verse.ref.replace(/\s+/g, "_") + ".png";
  a.click();
}
