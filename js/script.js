// Main site controls: theme, FX, language, and theme transition animation.

const queryOne = (selector) => document.querySelector(selector);
window.$ = queryOne;

const themeButton = queryOne("#themeBtn");
const languageSelect = queryOne("#langSelect");
const fxToggleButton = queryOne("#toggleFx");

const LANGUAGE_MAP = {
  zh: "zh-CN",
  ja: "ja",
  en: "en",
};

const uiState = {
  fxOn: true,
};

// Warm up the moon image to reduce decode stutter on first transition.
(function preloadMoonImage() {
  const moonImage = new Image();
  moonImage.decoding = "async";
  moonImage.src = "./image/moon.png";
})();

async function decodeImageIfPossible(imageElement) {
  try {
    if (imageElement && typeof imageElement.decode === "function") {
      await imageElement.decode();
    }
  } catch (_) {
    // Ignore decode failures. Some browsers may reject decode in edge cases.
  }
}

function applyThemeAssets(theme) {
  document.querySelectorAll("img[data-src-dark][data-src-light]").forEach((imageElement) => {
    const nextImageSource = theme === "dark" ? imageElement.dataset.srcDark : imageElement.dataset.srcLight;
    if (nextImageSource && imageElement.getAttribute("src") !== nextImageSource) {
      imageElement.setAttribute("src", nextImageSource);
    }
  });

  document.querySelectorAll("[data-bg-dark][data-bg-light]").forEach((element) => {
    const nextBackground = theme === "dark" ? element.dataset.bgDark : element.dataset.bgLight;
    if (nextBackground) {
      element.style.backgroundImage = `url('${nextBackground}')`;
    }
  });
}

function setThemeColorMeta(theme) {
  const themeColor = theme === "dark" ? "#0b1020" : "#dbe3ec";
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');

  if (!metaThemeColor) {
    metaThemeColor = document.createElement("meta");
    metaThemeColor.setAttribute("name", "theme-color");
    document.head.appendChild(metaThemeColor);
  }

  metaThemeColor.setAttribute("content", themeColor);
}

function getTheme() {
  return localStorage.getItem("theme") || "dark";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  applyThemeAssets(theme);
  setThemeColorMeta(theme);
}

function getLang() {
  return localStorage.getItem("lang") || "en";
}

function setLang(languageCode) {
  const normalizedLanguage = LANGUAGE_MAP[languageCode] ? languageCode : "en";
  document.documentElement.setAttribute("lang", LANGUAGE_MAP[normalizedLanguage]);
  localStorage.setItem("lang", normalizedLanguage);

  if (languageSelect && languageSelect.value !== normalizedLanguage) {
    languageSelect.value = normalizedLanguage;
  }

  if (typeof window.applyI18n === "function") {
    window.applyI18n(normalizedLanguage).catch((error) => {
      console.warn("[i18n] Failed to apply language on main page.", error);
    });
  }
}

function getFxEnabled() {
  return (localStorage.getItem("fx") || "on") === "on";
}

function setFxEnabled(enabled) {
  uiState.fxOn = enabled;
  document.body.classList.toggle("fx-off", !enabled);
  localStorage.setItem("fx", enabled ? "on" : "off");
}

function syncTransitionMoonStartFromPersistentMoon() {
  const rootElement = document.documentElement;
  const transitionOverlay = document.getElementById("themeTransition");
  const transitionMoon = transitionOverlay?.querySelector(".themeTransition__moon");
  const persistentMoon = document.querySelector(".bg-moon");

  rootElement.style.setProperty("--tt-start-dx", "0px");
  rootElement.style.setProperty("--tt-start-dy", "0px");
  rootElement.style.setProperty("--tt-end-dx", "0px");
  rootElement.style.setProperty("--tt-end-dy", "49vh");
  rootElement.style.setProperty("--tt-end-scale", "4.10");

  if (!transitionMoon || !persistentMoon) return;

  const startRect = persistentMoon.getBoundingClientRect();
  if (startRect.width <= 0 || startRect.height <= 0) return;

  const endRect = transitionMoon.getBoundingClientRect();
  const startCenterX = startRect.left + startRect.width / 2;
  const startCenterY = startRect.top + startRect.height / 2;
  const endCenterX = endRect.left + endRect.width / 2;
  const endCenterY = endRect.top + endRect.height / 2;
  const baseMoonWidth = transitionMoon.offsetWidth || endRect.width;
  if (baseMoonWidth <= 0) return;

  const endScale = startRect.width / baseMoonWidth;
  rootElement.style.setProperty("--tt-start-dx", `${startCenterX - endCenterX}px`);
  rootElement.style.setProperty("--tt-start-dy", `${startCenterY - endCenterY}px`);
  rootElement.style.setProperty("--tt-end-dx", `${startCenterX - endCenterX}px`);
  rootElement.style.setProperty("--tt-end-dy", `${startCenterY - endCenterY}px`);
  rootElement.style.setProperty("--tt-end-scale", `${endScale}`);
}

function measurePersistentMoonTargetRect() {
  const probeElement = document.createElement("div");
  const isMoonDocked = document.body.classList.contains("moon-docked");

  probeElement.setAttribute("aria-hidden", "true");
  probeElement.style.position = "fixed";
  probeElement.style.left = "50%";
  probeElement.style.width = "var(--moon-size)";
  probeElement.style.height = "var(--moon-size)";
  probeElement.style.visibility = "hidden";
  probeElement.style.pointerEvents = "none";
  probeElement.style.zIndex = "-1";
  probeElement.style.transformOrigin = "center";
  probeElement.style.transform = isMoonDocked
    ? "translate(-50%, -50%) scale(var(--moon-scale, 1))"
    : "translate3d(-50%, 0, 0) scale(var(--moon-scale, 1))";
  probeElement.style.top = isMoonDocked ? "var(--moon-docked-top)" : "var(--moon-home-top)";

  document.body.appendChild(probeElement);
  const measuredRect = probeElement.getBoundingClientRect();
  probeElement.remove();
  return measuredRect;
}

function syncLightToDarkTransitionTarget() {
  const rootElement = document.documentElement;
  const transitionOverlay = document.getElementById("themeTransition");
  const transitionMoon = transitionOverlay?.querySelector(".themeTransition__moon");

  rootElement.style.setProperty("--tt-l2d-end-dx", "0px");
  rootElement.style.setProperty("--tt-l2d-end-dy", "-35vh");
  rootElement.style.setProperty("--tt-l2d-end-scale", ".75");

  if (!transitionOverlay || !transitionMoon) return;

  const targetRect = measurePersistentMoonTargetRect();
  const overlayRect = transitionOverlay.getBoundingClientRect();
  const baseMoonWidth = transitionMoon.offsetWidth || transitionMoon.getBoundingClientRect().width;
  if (
    targetRect.width <= 0 ||
    targetRect.height <= 0 ||
    overlayRect.width <= 0 ||
    overlayRect.height <= 0 ||
    baseMoonWidth <= 0
  ) {
    return;
  }

  const overlayCenterX = overlayRect.left + overlayRect.width / 2;
  const overlayCenterY = overlayRect.top + overlayRect.height / 2;
  const targetCenterX = targetRect.left + targetRect.width / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;
  const endScale = targetRect.width / baseMoonWidth;

  rootElement.style.setProperty("--tt-l2d-end-dx", `${targetCenterX - overlayCenterX}px`);
  rootElement.style.setProperty("--tt-l2d-end-dy", `${targetCenterY - overlayCenterY}px`);
  rootElement.style.setProperty("--tt-l2d-end-scale", `${endScale}`);
}

function isThemeTransitionRunning() {
  return (
    document.body.classList.contains("theme-transitioning-to-dark") ||
    document.body.classList.contains("theme-transitioning-to-light")
  );
}

async function playLightToDarkTransition() {
  if (isThemeTransitionRunning()) return;

  const transitionOverlay = document.getElementById("themeTransition");
  const transitionMoon = transitionOverlay?.querySelector(".themeTransition__moon");
  if (!transitionOverlay || !transitionMoon) {
    setTheme("dark");
    return;
  }

  syncLightToDarkTransitionTarget();
  document.body.classList.add("theme-transitioning-to-dark");
  document.documentElement.classList.add("is-transitioning");

  await decodeImageIfPossible(transitionMoon);
  await new Promise(requestAnimationFrame);

  transitionOverlay.classList.remove("is-active");
  void transitionOverlay.offsetWidth;
  transitionOverlay.classList.add("is-active");

  window.setTimeout(() => setTheme("dark"), 880);

  const handleAnimationEnd = (event) => {
    if (event.target !== transitionMoon) return;

    transitionMoon.removeEventListener("animationend", handleAnimationEnd);
    transitionOverlay.classList.remove("is-active");
    document.body.classList.remove("theme-transitioning-to-dark");
    document.documentElement.classList.remove("is-transitioning");
    document.documentElement.style.removeProperty("--moon-scale");
    document.documentElement.style.removeProperty("--tt-l2d-end-dx");
    document.documentElement.style.removeProperty("--tt-l2d-end-dy");
    document.documentElement.style.removeProperty("--tt-l2d-end-scale");
  };

  transitionMoon.addEventListener("animationend", handleAnimationEnd);
}

async function playDarkToLightTransition() {
  if (isThemeTransitionRunning()) return;

  const transitionOverlay = document.getElementById("themeTransition");
  const transitionMoon = transitionOverlay?.querySelector(".themeTransition__moon");
  if (!transitionOverlay || !transitionMoon) {
    setTheme("light");
    return;
  }

  syncTransitionMoonStartFromPersistentMoon();
  document.body.classList.add("theme-transitioning-to-light");
  document.documentElement.classList.add("is-transitioning");

  await decodeImageIfPossible(transitionMoon);
  await new Promise(requestAnimationFrame);

  transitionOverlay.classList.remove("is-active");
  void transitionOverlay.offsetWidth;
  transitionOverlay.classList.add("is-active");

  window.setTimeout(() => setTheme("light"), 700);

  const transitionCleanupDelay = 1416;
  window.setTimeout(() => {
    transitionOverlay.classList.remove("is-active");
    document.body.classList.remove("theme-transitioning-to-light");
    document.documentElement.classList.remove("is-transitioning");
    document.documentElement.style.removeProperty("--moon-scale");
    document.documentElement.style.removeProperty("--tt-start-dx");
    document.documentElement.style.removeProperty("--tt-start-dy");
    document.documentElement.style.removeProperty("--tt-end-dx");
    document.documentElement.style.removeProperty("--tt-end-dy");
    document.documentElement.style.removeProperty("--tt-end-scale");
  }, transitionCleanupDelay);
}

function updateMoonPeekState() {
  const shouldDockMoon = window.scrollY > 100;
  document.body.classList.toggle("moon-docked", shouldDockMoon);
}

function handleThemeToggleClick() {
  const currentTheme = getTheme();
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  const areFxDisabled = !uiState.fxOn;

  if (areFxDisabled) {
    setTheme(nextTheme);
    return;
  }

  if (currentTheme === "light" && nextTheme === "dark") {
    playLightToDarkTransition();
  } else if (currentTheme === "dark" && nextTheme === "light") {
    playDarkToLightTransition();
  } else {
    setTheme(nextTheme);
  }
}

function initializeGlobalUiState() {
  setTheme(getTheme());
  setLang(getLang());
  setFxEnabled(getFxEnabled());
  updateMoonPeekState();

  themeButton?.addEventListener("click", handleThemeToggleClick);
  fxToggleButton?.addEventListener("click", () => setFxEnabled(!uiState.fxOn));
  languageSelect?.addEventListener("change", () => setLang(languageSelect.value));
  window.addEventListener("scroll", updateMoonPeekState, { passive: true });

  window.addEventListener("storage", (event) => {
    if (event.key === "theme" && event.newValue) setTheme(event.newValue);
    if (event.key === "fx" && event.newValue) setFxEnabled(event.newValue === "on");
    if (event.key === "lang" && event.newValue) setLang(event.newValue);
  });
}

initializeGlobalUiState();
