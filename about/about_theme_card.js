(function setupAboutThemeCardTransition() {
  const THEME_CARD_TOTAL_MS = 320;
  const THEME_CARD_TEXT_MS = 56;
  const THEME_SWITCH_MS = 104;

  const MAIN_TEXT_BY_THEME = {
    dark: "黒齣",
    light: "黒齣",
  };

  const CARD_LINES = {
    dark: [
    "誰も、見ないはず。",
    "それでも、読む？",
    "気づいた？",
    "まだ、見てる。",
    ],
    light: [
    "誰も、見ないはず。",
    "それでも、読む？",
    "気づいた？",
    "まだ、見てる。",
    ],
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const overlayState = {
    isPlaying: false,
    timers: [],
    overlayElement: null,
    titleElement: null,
    lineElements: [],
  };

  function clearOverlayTimers() {
    while (overlayState.timers.length > 0) {
      window.clearTimeout(overlayState.timers.pop());
    }
  }

  function buildOverlay() {
    if (overlayState.overlayElement) return overlayState.overlayElement;

    const overlayElement = document.createElement("div");
    overlayElement.className = "about-theme-card-overlay";
    overlayElement.setAttribute("aria-hidden", "true");

    const cardElement = document.createElement("div");
    cardElement.className = "about-theme-card";

    const slotClasses = [
      "about-theme-card__line about-theme-card__line--far-right",
      "about-theme-card__line about-theme-card__line--right",
      "about-theme-card__line about-theme-card__line--left",
    ];

    const lineElements = slotClasses.map((className) => {
      const lineElement = document.createElement("p");
      lineElement.className = className;
      cardElement.appendChild(lineElement);
      return lineElement;
    });

    const titleElement = document.createElement("p");
    titleElement.className = "about-theme-card__title";
    cardElement.insertBefore(titleElement, lineElements[2]);

    overlayElement.appendChild(cardElement);
    document.body.appendChild(overlayElement);

    overlayState.overlayElement = overlayElement;
    overlayState.titleElement = titleElement;
    overlayState.lineElements = lineElements;
    return overlayElement;
  }

  function hydrateCardContent(nextTheme) {
    const safeTheme = nextTheme === "light" ? "light" : "dark";
    const overlayElement = buildOverlay();
    const lines = CARD_LINES[safeTheme];

    overlayState.titleElement.textContent = MAIN_TEXT_BY_THEME[safeTheme];
    overlayState.lineElements.forEach((lineElement, index) => {
      lineElement.textContent = lines[index] || "";
    });

    return overlayElement;
  }

  function cleanupOverlay() {
    clearOverlayTimers();
    overlayState.overlayElement?.classList.remove("is-card-visible", "is-active");
    overlayState.isPlaying = false;
  }

  function shouldBypassTransition(fxEnabled) {
    return !fxEnabled || prefersReducedMotion.matches;
  }

  window.handleCustomThemeToggle = function handleCustomThemeToggle(context) {
    if (!document.body.classList.contains("about-page")) {
      return false;
    }

    if (!context || typeof context.setTheme !== "function") {
      return false;
    }

    if (overlayState.isPlaying) {
      return true;
    }

    if (shouldBypassTransition(context.fxEnabled)) {
      context.setTheme(context.nextTheme);
      return true;
    }

    const overlayElement = hydrateCardContent(context.nextTheme);
    overlayState.isPlaying = true;
    overlayElement.classList.remove("is-card-visible");
    overlayElement.classList.add("is-active");

    overlayState.timers.push(window.setTimeout(() => {
      overlayElement.classList.add("is-card-visible");
    }, THEME_CARD_TEXT_MS));

    overlayState.timers.push(window.setTimeout(() => {
      context.setTheme(context.nextTheme);
    }, THEME_SWITCH_MS));

    overlayState.timers.push(window.setTimeout(() => {
      cleanupOverlay();
    }, THEME_CARD_TOTAL_MS));

    return true;
  };

  prefersReducedMotion.addEventListener?.("change", () => {
    if (!prefersReducedMotion.matches || !overlayState.isPlaying) return;
    cleanupOverlay();
  });
})();
