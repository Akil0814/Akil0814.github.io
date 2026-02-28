// Footer year.
const yearElement = $("#year");
if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}

// One-time construction notice.
window.addEventListener("load", () => {
  const noticeStorageKey = "site_building_notice_shown";
  if (!localStorage.getItem(noticeStorageKey)) {
    alert("⚠️ 正在建设中 / currently under construction ⚠️");
    localStorage.setItem(noticeStorageKey, "1");
  }
});

// Called by inline onclick handlers in HTML.
async function copyEmail(element) {
  const textToCopy = element.dataset.copy || element.textContent.trim();

  try {
    await navigator.clipboard.writeText(textToCopy);
    showCopyToast(element, "Copied!");
  } catch (_) {
    // Clipboard fallback for older browsers or denied permission.
    const fallbackTextArea = document.createElement("textarea");
    fallbackTextArea.value = textToCopy;
    fallbackTextArea.setAttribute("readonly", "");
    fallbackTextArea.style.position = "fixed";
    fallbackTextArea.style.left = "-9999px";
    document.body.appendChild(fallbackTextArea);
    fallbackTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(fallbackTextArea);
    showCopyToast(element, "Copied!");
  }
}

function showCopyToast(element, message) {
  const previousTip = element.dataset.tip;
  element.dataset.tip = message;
  element.classList.add("is-copied");
  setTimeout(() => {
    element.dataset.tip = previousTip || "";
    element.classList.remove("is-copied");
  }, 1200);
}
