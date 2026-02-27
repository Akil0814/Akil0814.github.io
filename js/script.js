
// Pre-decode a transition image to avoid a decode hitch during the animation.
async function decodeImageIfPossible(imgEl) {
  try {
    if (imgEl && typeof imgEl.decode === "function") await imgEl.decode();
  } catch (_) {
    // ignore: decode can fail on some browsers or if the image isn't ready yet
  }
}

// =========================================================
  window.$ = (s) => document.querySelector(s);

  // ---------------------------------------------------------
  // 3) Theme / FX 控件节点
  // ---------------------------------------------------------
  const themeBtn = $("#themeBtn");
  const langSelect = $("#langSelect");

  // Warm up the moon image to avoid first-time decode jank
  (function preloadMoon(){
    const img = new Image();
    img.decoding = "async";
    img.src = "./image/moon.png";
  })();
  const toggleFx = $("#toggleFx");

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
  function setThemeColor(theme) {
    const color = theme === "dark" ? "#0b1020" : "#dbe3ec";
    let meta = document.querySelector('meta[name="theme-color"]');

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", color);
  }
  function setTheme(next) {
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    applyThemeAssets(next);
    setThemeColor(next);
  }
  function getTheme() {
    return localStorage.getItem("theme") || "dark";
  }

  const LANG_MAP = {
    zh: "zh-CN",
    ja: "ja",
    en: "en",
  };

  function setLang(next) {
    const normalized = LANG_MAP[next] ? next : "en";
    document.documentElement.setAttribute("lang", LANG_MAP[normalized]);
    localStorage.setItem("lang", normalized);
    if (langSelect && langSelect.value !== normalized) {
      langSelect.value = normalized;
    }
  }

  function getLang() {
    return localStorage.getItem("lang") || "en";
  }

  // 初始化主题
  setTheme(getTheme());
  setLang(getLang());

  // ---------------------------------------------------------
  // 3.1.c) Theme transition (Light <-> Dark)
  // ---------------------------------------------------------
  function syncTransitionMoonStartFromPersistentMoon() {
    const root = document.documentElement;
    const overlay = document.getElementById("themeTransition");
    const transitionMoon = overlay?.querySelector(".themeTransition__moon");
    const persistentMoon = document.querySelector(".bg-moon");

    // reset to default so measurement uses the canonical transition start
    root.style.setProperty("--tt-start-dx", "0px");
    root.style.setProperty("--tt-start-dy", "0px");
    root.style.setProperty("--tt-end-dx", "0px");
    root.style.setProperty("--tt-end-dy", "49vh");
    root.style.setProperty("--tt-end-scale", "4.10");

    if (!transitionMoon || !persistentMoon) return;

    const fromRect = persistentMoon.getBoundingClientRect();
    if (fromRect.width <= 0 || fromRect.height <= 0) return;

    const toRect = transitionMoon.getBoundingClientRect();
    const fromCenterX = fromRect.left + fromRect.width / 2;
    const fromCenterY = fromRect.top + fromRect.height / 2;
    const toCenterX = toRect.left + toRect.width / 2;
    const toCenterY = toRect.top + toRect.height / 2;
    // offsetWidth is based on layout size and is not affected by transform: scale(.12)
    const baseWidth = transitionMoon.offsetWidth || toRect.width;
    if (baseWidth <= 0) return;
    const targetScale = fromRect.width / baseWidth;

    root.style.setProperty("--tt-start-dx", `${fromCenterX - toCenterX}px`);
    root.style.setProperty("--tt-start-dy", `${fromCenterY - toCenterY}px`);
    root.style.setProperty("--tt-end-dx", `${fromCenterX - toCenterX}px`);
    root.style.setProperty("--tt-end-dy", `${fromCenterY - toCenterY}px`);
    root.style.setProperty("--tt-end-scale", `${targetScale}`);
  }

  function measurePersistentMoonTargetRect() {
    const probe = document.createElement("div");
    const docked = document.body.classList.contains("moon-docked");

    probe.setAttribute("aria-hidden", "true");
    probe.style.position = "fixed";
    probe.style.left = "50%";
    probe.style.width = "var(--moon-size)";
    probe.style.height = "var(--moon-size)";
    probe.style.visibility = "hidden";
    probe.style.pointerEvents = "none";
    probe.style.zIndex = "-1";
    probe.style.transformOrigin = "center";
    probe.style.transform = docked
      ? "translate(-50%, -50%) scale(var(--moon-scale, 1))"
      : "translate3d(-50%, 0, 0) scale(var(--moon-scale, 1))";
    probe.style.top = docked ? "var(--moon-docked-top)" : "var(--moon-home-top)";

    document.body.appendChild(probe);
    const rect = probe.getBoundingClientRect();
    probe.remove();
    return rect;
  }

  function syncLightToDarkTransitionTarget() {
    const root = document.documentElement;
    const overlay = document.getElementById("themeTransition");
    const transitionMoon = overlay?.querySelector(".themeTransition__moon");

    root.style.setProperty("--tt-l2d-end-dx", "0px");
    root.style.setProperty("--tt-l2d-end-dy", "-35vh");
    root.style.setProperty("--tt-l2d-end-scale", ".75");

    if (!transitionMoon) return;

    const targetRect = measurePersistentMoonTargetRect();
    const overlayRect = overlay.getBoundingClientRect();
    const baseWidth = transitionMoon.offsetWidth || transitionMoon.getBoundingClientRect().width;
    if (
      targetRect.width <= 0 ||
      targetRect.height <= 0 ||
      overlayRect.width <= 0 ||
      overlayRect.height <= 0 ||
      baseWidth <= 0
    ) return;

    // Use overlay's own layout center as the transform baseline to avoid subtle viewport/scrollbar drift.
    const viewportCenterX = overlayRect.left + overlayRect.width / 2;
    const viewportCenterY = overlayRect.top + overlayRect.height / 2;
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const endScale = targetRect.width / baseWidth;

    root.style.setProperty("--tt-l2d-end-dx", `${targetCenterX - viewportCenterX}px`);
    root.style.setProperty("--tt-l2d-end-dy", `${targetCenterY - viewportCenterY}px`);
    root.style.setProperty("--tt-l2d-end-scale", `${endScale}`);
  }

  async function playLightToDarkTransition(){
  // avoid stacking animations
  if (
    document.body.classList.contains("theme-transitioning-to-dark") ||
    document.body.classList.contains("theme-transitioning-to-light")
  ) return;

  const overlay = document.getElementById("themeTransition");
  if (!overlay) {
    setTheme("dark");
    return;
  }

  const moon = overlay.querySelector(".themeTransition__moon");
  if (!moon) {
    setTheme("dark");
    return;
  }

  syncLightToDarkTransitionTarget();
  document.body.classList.add("theme-transitioning-to-dark");

  // 可选：切换中禁用 smooth scroll（你原本只在 dark->light 做了）
  document.documentElement.classList.add("is-transitioning");

  // perf: ensure moon image is decoded before we start
  await decodeImageIfPossible(moon);
  await new Promise(requestAnimationFrame);

  // 关键：触发 CSS（图片版看的是 .themeTransition.is-active）
  overlay.classList.remove("is-active");
  void overlay.offsetWidth; // 强制 reflow，保证能重新触发动画
  overlay.classList.add("is-active");

  // switch theme while animation is in progress (sync with CSS)
  const switchAt = 880; // ms
  window.setTimeout(() => setTheme("dark"), switchAt);

  const onEnd = (e) => {
    if (e.target !== moon) return;
    moon.removeEventListener("animationend", onEnd);

    overlay.classList.remove("is-active");
    document.body.classList.remove("theme-transitioning-to-dark");
    document.documentElement.classList.remove("is-transitioning");
    document.documentElement.style.removeProperty("--moon-scale");
    document.documentElement.style.removeProperty("--tt-l2d-end-dx");
    document.documentElement.style.removeProperty("--tt-l2d-end-dy");
    document.documentElement.style.removeProperty("--tt-l2d-end-scale");
  };

  moon.addEventListener("animationend", onEnd);
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

  const moon = overlay.querySelector(".themeTransition__moon");
  if (!moon) {
    setTheme("light");
    return;
  }

  // read persistent moon position before we hide it for transition
  syncTransitionMoonStartFromPersistentMoon();
  document.body.classList.add("theme-transitioning-to-light");

  // perf: ensure moon image is decoded before we start the overlay animation
  document.documentElement.classList.add("is-transitioning");
  await decodeImageIfPossible(moon);
  await new Promise(requestAnimationFrame);

  // 关键：触发图片版动画
  overlay.classList.remove("is-active");
  void overlay.offsetWidth;
  overlay.classList.add("is-active");

  // switch theme near peak exposure (sync with CSS)
  const switchAt = 700; // ms
  window.setTimeout(() => setTheme("light"), switchAt);

  // Decoupled timing:
  // - moon can disappear early
  // - flash can keep running to restore brightness smoothly
  const flashDuration = 1400; // ms
  window.setTimeout(() => {
    overlay.classList.remove("is-active");
    document.body.classList.remove("theme-transitioning-to-light");
    document.documentElement.classList.remove("is-transitioning");
    document.documentElement.style.removeProperty("--moon-scale");
    document.documentElement.style.removeProperty("--tt-start-dx");
    document.documentElement.style.removeProperty("--tt-start-dy");
    document.documentElement.style.removeProperty("--tt-end-dx");
    document.documentElement.style.removeProperty("--tt-end-dy");
    document.documentElement.style.removeProperty("--tt-end-scale");
  }, flashDuration + 16);
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

  // 语言选择（仅全局状态同步，文案切换后续实现）
  langSelect?.addEventListener("change", () => {
    setLang(langSelect.value);
  });

  // 跨标签页同步全局偏好
  window.addEventListener("storage", (event) => {
    if (event.key === "theme" && event.newValue) setTheme(event.newValue);
    if (event.key === "fx" && event.newValue) setFx(event.newValue === "on");
    if (event.key === "lang" && event.newValue) setLang(event.newValue);
  });
