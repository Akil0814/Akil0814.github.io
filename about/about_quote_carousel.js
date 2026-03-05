(function () {
  const QUOTES = [
    "これで全部よ",
    "私が持っているもの、全部",
    "……この星空",
    "私が持っているのは、これくらいのもの",
    "私があなたにあげられるのは、これくらいのもの",
    "これくらいで全部",
  ];

  const defaultConfig = {
    fadeInMs: 1200,
    holdMs: 3600,
    fadeOutMs: 1200,
    maxOpacity: 0.75,
  };

  const runtimeConfig = Object.assign({}, defaultConfig, window.aboutQuoteCarouselConfig || {});
  runtimeConfig.cycleMs = runtimeConfig.fadeInMs + runtimeConfig.holdMs + runtimeConfig.fadeOutMs;

  const layerElement = document.getElementById("quoteCarousel");
  const lineElement = document.getElementById("quoteCarouselText");
  if (!layerElement || !lineElement) return;

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const state = {
    quoteIndex: 0,
    running: false,
    manualEnabled: true,
    token: 0,
    timers: [],
  };

  function isDarkThemeActive() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  function isFxEnabled() {
    if (typeof uiState !== "undefined") return !!uiState.fxOn;
    return !document.body.classList.contains("fx-off");
  }

  function shouldEnableCarousel() {
    return state.manualEnabled && isDarkThemeActive() && isFxEnabled();
  }

  function clearTimers() {
    state.timers.forEach((timerId) => window.clearTimeout(timerId));
    state.timers = [];
  }

  function hideLayer() {
    layerElement.classList.add("is-hidden");
    lineElement.style.opacity = "0";
  }

  function showLayer() {
    layerElement.classList.remove("is-hidden");
  }

  function setQuote(index) {
    lineElement.textContent = QUOTES[index];
  }

  function stopCarousel() {
    state.running = false;
    state.token += 1;
    clearTimers();
    hideLayer();
  }

  function renderReducedMotionState() {
    showLayer();
    setQuote(0);
    lineElement.style.transitionDuration = "0ms";
    lineElement.style.opacity = String(runtimeConfig.maxOpacity);
  }

  function runCycle(resetToFirstQuote) {
    if (resetToFirstQuote) state.quoteIndex = 0;
    state.running = true;
    state.token += 1;
    const cycleToken = state.token;
    clearTimers();

    if (!shouldEnableCarousel()) {
      stopCarousel();
      return;
    }

    if (reducedMotionQuery.matches) {
      renderReducedMotionState();
      return;
    }

    showLayer();
    setQuote(state.quoteIndex);
    lineElement.style.transitionDuration = `${runtimeConfig.fadeInMs}ms`;
    lineElement.style.opacity = "0";

    requestAnimationFrame(() => {
      if (!state.running || cycleToken !== state.token) return;
      requestAnimationFrame(() => {
        if (!state.running || cycleToken !== state.token) return;
        lineElement.style.opacity = String(runtimeConfig.maxOpacity);
      });
    });

    const fadeOutTimer = window.setTimeout(() => {
      if (!state.running || cycleToken !== state.token) return;
      lineElement.style.transitionDuration = `${runtimeConfig.fadeOutMs}ms`;
      lineElement.style.opacity = "0";
    }, runtimeConfig.fadeInMs + runtimeConfig.holdMs);

    const nextTimer = window.setTimeout(() => {
      if (!state.running || cycleToken !== state.token) return;
      state.quoteIndex = (state.quoteIndex + 1) % QUOTES.length;
      runCycle(false);
    }, runtimeConfig.cycleMs);

    state.timers.push(fadeOutTimer, nextTimer);
  }

  function syncCarouselState(resetToFirstQuote) {
    if (!shouldEnableCarousel()) {
      stopCarousel();
      return;
    }

    if (reducedMotionQuery.matches) {
      state.running = true;
      state.token += 1;
      clearTimers();
      renderReducedMotionState();
      return;
    }

    if (!state.running || resetToFirstQuote) {
      runCycle(!!resetToFirstQuote);
    }
  }

  window.toggleQuoteCarousel = function toggleQuoteCarousel(on) {
    if (typeof on === "boolean") {
      state.manualEnabled = on;
    } else {
      state.manualEnabled = !state.manualEnabled;
    }

    if (!state.manualEnabled) {
      stopCarousel();
      return;
    }

    syncCarouselState(true);
  };

  function applyFixedTopPosition() {
    layerElement.style.position = "fixed";
    layerElement.style.left = "50%";
    layerElement.style.top = "calc(62px + clamp(12px, 3vh, 22px))";
    layerElement.style.bottom = "auto";
    layerElement.style.transform = "translateX(-50%)";
  }

  const themeObserver = new MutationObserver(() => {
    syncCarouselState(true);
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "class"],
  });

  const bodyObserver = new MutationObserver(() => {
    syncCarouselState(false);
  });
  bodyObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });

  const handleMotionPreferenceChange = () => {
    syncCarouselState(true);
  };

  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", handleMotionPreferenceChange);
  } else if (typeof reducedMotionQuery.addListener === "function") {
    reducedMotionQuery.addListener(handleMotionPreferenceChange);
  }

  applyFixedTopPosition();
  window.addEventListener("resize", applyFixedTopPosition, { passive: true });
  syncCarouselState(true);
})();
