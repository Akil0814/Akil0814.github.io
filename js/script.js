
// Pre-decode a transition image to avoid a decode hitch during the animation.
async function decodeImageIfPossible(imgEl) {
  try {
    if (imgEl && typeof imgEl.decode === "function") await imgEl.decode();
  } catch (_) {
    // ignore: decode can fail on some browsers or if the image isn't ready yet
  }
}
// =========================================================
// script.js
// 这份脚本只做“页面交互 + 轻量背景特效”三件事：
// =========================================================
  // ---------------------------------------------------------
  // Tiny helper: $()
  //  - document.querySelector 的快捷方式
  // ---------------------------------------------------------
  window.$ = (s) => document.querySelector(s);

  // ---------------------------------------------------------
  // 3) Theme / FX 控件节点
  // ---------------------------------------------------------
  const themeBtn = $("#themeBtn");

  // Warm up the moon image to avoid first-time decode jank
  (function preloadMoon(){
    const img = new Image();
    img.decoding = "async";
    img.src = "./image/moon.png";
  })();
  const toggleFx = $("#toggleFx");

  // ---------------------------------------------------------
  // 3.1) Theme control
  //  - 把主题写到 <html data-theme="...">
  //  - 用 localStorage 记住 "dark" 或 "light"
  // ---------------------------------------------------------

  // ---------------------------------------------------------
  // 3.1.a) Theme-aware assets (images / background images)
  //  - <img data-src-dark="..." data-src-light="...">
  //  - 任意元素 data-bg-dark / data-bg-light（会写到 style.backgroundImage）
  // ---------------------------------------------------------
  function applyThemeAssets(theme)
  {
    // swap <img>
    document.querySelectorAll("img[data-src-dark][data-src-light]").forEach((img) => {
      const next = theme === "dark" ? img.dataset.srcDark : img.dataset.srcLight;
      if (next && img.getAttribute("src") !== next) img.setAttribute("src", next);
    });

    // swap background-image
    document.querySelectorAll("[data-bg-dark][data-bg-light]").forEach((el) => {
      const next = theme === "dark" ? el.dataset.bgDark : el.dataset.bgLight;
      if (next) el.style.backgroundImage = `url('${next}')`;
    });
  }
  function setTheme(next) {
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    applyThemeAssets(next);
  }
  function getTheme() {
    return localStorage.getItem("theme") || "dark";
  }

  // 初始化主题
  setTheme(getTheme());

  // ---------------------------------------------------------
  // 3.1.c) Theme transition (Light <-> Dark)
  // ---------------------------------------------------------
   async function playLightToDarkTransition() {
    // avoid stacking animations
    if (
      document.body.classList.contains("theme-transitioning-to-dark") ||
      document.body.classList.contains("theme-transitioning-to-light")
    ) return;

    const overlay = document.getElementById("themeTransition");
    if (!overlay)
    {
      setTheme("dark");
      return;
    }

    document.body.classList.add("theme-transitioning-to-dark");

    // switch theme while screen is near-black (sync with CSS)
    const switchAt = 990; // ms
    window.setTimeout(() => setTheme("dark"), switchAt);

    const onEnd = (e) => {
      if (e.target !== overlay) return;
      overlay.removeEventListener("animationend", onEnd);
      document.body.classList.remove("theme-transitioning-to-dark");
      document.documentElement.style.removeProperty("--moon-scale");
    };
    overlay.addEventListener("animationend", onEnd);
  }

  async function playDarkToLightTransition() {
    if (
      document.body.classList.contains("theme-transitioning-to-dark") ||
      document.body.classList.contains("theme-transitioning-to-light")
    ) return;

    const overlay = document.getElementById("themeTransition");
    if (!overlay) {
      setTheme("light");
      return;
    }

    document.body.classList.add("theme-transitioning-to-light");

    
    // perf: ensure moon image is decoded before we start the overlay animation
    document.documentElement.classList.add("is-transitioning");
    const moonImg = overlay.querySelector(".themeTransition__moon");
    await decodeImageIfPossible(moonImg);
    await new Promise(requestAnimationFrame);
// switch theme near peak exposure (sync with CSS)
    const switchAt = 820; // ms
    window.setTimeout(() => setTheme("light"), switchAt);

    const onEnd = (e) => {
      if (e.target !== overlay)
          return;
      overlay.removeEventListener("animationend", onEnd);
      document.body.classList.remove("theme-transitioning-to-light");
      document.documentElement.classList.remove("is-transitioning");
      document.documentElement.style.removeProperty("--moon-scale");
    };
    overlay.addEventListener("animationend", onEnd);
  }

  // 点击切换主题
  themeBtn?.addEventListener("click", () => {
    const cur = getTheme();
    const next = cur === "dark" ? "light" : "dark";

    const isFx = !uiState?.fxOn; // 或者你自己的 fx 判断方式

    if (isFx) {
    setTheme(next);
    } else if (cur === "light" && next === "dark") {
      playLightToDarkTransition();
    } else if (cur === "dark" && next === "light") {
      playDarkToLightTransition();
    } else {
      setTheme(next);
  }

  });

// ---------------------------------------------------------
  // 3.2) FX control（背景特效开关）
  //  - 通过给 <body> 加/删 .fx-off 控制 CSS 特效显示
  //  - 用 localStorage 记住是否开启
  //  - 额外：把当前状态缓存到内存里，避免每帧读 localStorage
  // ---------------------------------------------------------
  const uiState = {
    fxOn: true,
  };

  function setFx(on) {
    uiState.fxOn = on;
    document.body.classList.toggle("fx-off", !on);
    localStorage.setItem("fx", on ? "on" : "off");
  }
  function getFx() {
    return (localStorage.getItem("fx") || "on") === "on";
  }

  // 初始化 FX
  setFx(getFx());
  // ---------------------------------------------------------
  // 3.3) Moon peek（贴顶月亮：顶部全显，滚动半显）
  //  - 通过给 <body> 加/删 .moon-docked 控制 CSS 裁切
  //  - 顶部（scrollY 很小）显示完整月亮；往下滚动就只露出一半
  // ---------------------------------------------------------
  function updateMoonPeek() {
    // 给一点点容忍区，避免滚动到 1px 就抖
    const docked = window.scrollY > 100;
    document.body.classList.toggle("moon-docked", docked);
  }

  // 首次更新 + 监听滚动
  updateMoonPeek();
  window.addEventListener("scroll", updateMoonPeek, { passive: true });

  // 点击切换 FX
  toggleFx?.addEventListener("click", () => {
    setFx(!uiState.fxOn);
  });

  




