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