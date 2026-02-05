
  // ---------------------------------------------------------
  // 1) Footer 年份自动填充
  // ---------------------------------------------------------
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  
  // ---------------------------------------------------------
  // 0) “建设中”弹窗（只弹一次）
  // - 之前你写在 HTML 里，这里挪到 JS，HTML 更干净
  // ---------------------------------------------------------
  
  window.addEventListener("load", () => {
    const key = "site_building_notice_shown";
    if (!localStorage.getItem(key))
    {
      alert("⚠️ 正在建设中/currently under construction ⚠️");
      localStorage.setItem(key, "1");
    }
  });

// ---------------------------------------------------------
//拷贝支持
async function copyEmail(el) {
  const text = el.dataset.copy || el.textContent.trim();

  try {
    await navigator.clipboard.writeText(text);
    toast(el, "Copied!");
  } catch (e) {
    // fallback for older browsers / denied permission
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    toast(el, "Copied!");
  }
}

function toast(el, msg) {
  const old = el.dataset.tip;
  el.dataset.tip = msg;
  el.classList.add("is-copied");
  setTimeout(() => {
    el.dataset.tip = old || "";
    el.classList.remove("is-copied");
  }, 1200);
}

//拷贝支持
// ---------------------------------------------------------
