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

  const defaultFactoryConfig = {
    layerSelector: "#quoteCarousel",
    lineSelector: "#quoteCarouselText",
    quotes: QUOTES,
    theme: "dark",
    fadeInMs: defaultConfig.fadeInMs,
    holdMs: defaultConfig.holdMs,
    fadeOutMs: defaultConfig.fadeOutMs,
    maxOpacity: defaultConfig.maxOpacity,
    fixedTop: true,
    fixedTopOffset: "calc(62px + clamp(12px, 3vh, 22px))",
    observeTheme: true,
    observeBodyClass: true,
    manualEnabled: true,
  };

  function resolveElement(target) {
    if (!target) return null;
    if (target && target.nodeType === 1) return target;
    if (typeof target === "string") return document.querySelector(target);
    return null;
  }

  function sanitizeDuration(value, fallbackValue) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : fallbackValue;
  }

  function isFxEnabled() {
    if (typeof uiState !== "undefined") return !!uiState.fxOn;
    return !document.body.classList.contains("fx-off");
  }

  function getTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }

  function createQuoteCarousel(userConfig) {
    const mergedConfig = Object.assign({}, defaultFactoryConfig, userConfig || {});
    const layerElement = resolveElement(mergedConfig.layerElement || mergedConfig.layerSelector);
    const lineElement = resolveElement(mergedConfig.lineElement || mergedConfig.lineSelector);
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const quoteList = Array.isArray(mergedConfig.quotes) ? mergedConfig.quotes.filter(Boolean) : [];
    const runtimeConfig = {
      fadeInMs: sanitizeDuration(mergedConfig.fadeInMs, defaultConfig.fadeInMs),
      holdMs: sanitizeDuration(mergedConfig.holdMs, defaultConfig.holdMs),
      fadeOutMs: sanitizeDuration(mergedConfig.fadeOutMs, defaultConfig.fadeOutMs),
      maxOpacity: Number.isFinite(Number(mergedConfig.maxOpacity))
        ? Number(mergedConfig.maxOpacity)
        : defaultConfig.maxOpacity,
    };
    runtimeConfig.cycleMs = runtimeConfig.fadeInMs + runtimeConfig.holdMs + runtimeConfig.fadeOutMs;

    if (!layerElement || !lineElement || !quoteList.length) return null;

    const state = {
      quoteIndex: 0,
      running: false,
      manualEnabled: mergedConfig.manualEnabled !== false,
      token: 0,
      timers: [],
    };

    let themeObserver = null;
    let bodyObserver = null;

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
      lineElement.textContent = quoteList[index];
    }

    function matchesThemeRule() {
      if (typeof mergedConfig.shouldEnable === "function") {
        return !!mergedConfig.shouldEnable({
          theme: getTheme(),
          fxEnabled: isFxEnabled(),
          layerElement,
          lineElement,
          state: Object.assign({}, state),
        });
      }

      if (mergedConfig.theme === "any") return true;
      return getTheme() === mergedConfig.theme;
    }

    function shouldEnableCarousel() {
      return state.manualEnabled && matchesThemeRule() && isFxEnabled();
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
        state.quoteIndex = (state.quoteIndex + 1) % quoteList.length;
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

    function applyFixedTopPosition() {
      if (mergedConfig.fixedTop === false) return;
      layerElement.style.position = "fixed";
      layerElement.style.left = "50%";
      layerElement.style.top = mergedConfig.fixedTopOffset;
      layerElement.style.bottom = "auto";
      layerElement.style.transform = "translateX(-50%)";
    }

    function handleMotionPreferenceChange() {
      syncCarouselState(true);
    }

    if (mergedConfig.observeTheme !== false) {
      themeObserver = new MutationObserver(() => {
        syncCarouselState(true);
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme", "class"],
      });
    }

    if (mergedConfig.observeBodyClass !== false) {
      bodyObserver = new MutationObserver(() => {
        syncCarouselState(false);
      });
      bodyObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    if (typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", handleMotionPreferenceChange);
    } else if (typeof reducedMotionQuery.addListener === "function") {
      reducedMotionQuery.addListener(handleMotionPreferenceChange);
    }

    applyFixedTopPosition();
    window.addEventListener("resize", applyFixedTopPosition, { passive: true });
    syncCarouselState(true);

    const controller = {
      toggle(on) {
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
      },
      start() {
        state.manualEnabled = true;
        syncCarouselState(true);
      },
      stop() {
        state.manualEnabled = false;
        stopCarousel();
      },
      refresh(resetToFirstQuote) {
        syncCarouselState(!!resetToFirstQuote);
      },
      setQuotes(nextQuotes, resetToFirstQuote) {
        if (!Array.isArray(nextQuotes) || !nextQuotes.length) return false;
        quoteList.length = 0;
        nextQuotes.filter(Boolean).forEach((quote) => quoteList.push(quote));
        if (!quoteList.length) {
          stopCarousel();
          return false;
        }
        if (resetToFirstQuote !== false) state.quoteIndex = 0;
        syncCarouselState(resetToFirstQuote !== false);
        return true;
      },
      destroy() {
        stopCarousel();
        themeObserver?.disconnect();
        bodyObserver?.disconnect();
        if (typeof reducedMotionQuery.removeEventListener === "function") {
          reducedMotionQuery.removeEventListener("change", handleMotionPreferenceChange);
        } else if (typeof reducedMotionQuery.removeListener === "function") {
          reducedMotionQuery.removeListener(handleMotionPreferenceChange);
        }
        window.removeEventListener("resize", applyFixedTopPosition);
      },
      getState() {
        return {
          quoteIndex: state.quoteIndex,
          running: state.running,
          manualEnabled: state.manualEnabled,
          totalQuotes: quoteList.length,
        };
      },
    };

    if (typeof mergedConfig.toggleName === "string" && mergedConfig.toggleName) {
      window[mergedConfig.toggleName] = (on) => controller.toggle(on);
    }

    return controller;
  }

  window.createQuoteCarousel = createQuoteCarousel;

  const defaultRuntimeConfig = Object.assign({}, window.aboutQuoteCarouselConfig || {});
  if (!defaultRuntimeConfig.quotes) {
    defaultRuntimeConfig.quotes = QUOTES;
  }

  const defaultCarousel = createQuoteCarousel(defaultRuntimeConfig);
  if (defaultCarousel) {
    window.aboutQuoteCarousel = defaultCarousel;
    window.toggleQuoteCarousel = (on) => defaultCarousel.toggle(on);
  }

  if (Array.isArray(window.aboutQuoteCarousels)) {
    const builtInstances = window.aboutQuoteCarousels
      .map((instanceConfig) => createQuoteCarousel(instanceConfig))
      .filter(Boolean);
    window.aboutQuoteCarouselInstances = builtInstances;
  }
})();
