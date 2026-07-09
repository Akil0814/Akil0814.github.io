(function () {
  const INTRO_CODE = [
    "int main(int argc, char const *argv[])",
    "{",
    "    RestoreEgo();",
    "    RestorePurePinkHeart();",
    "    RestructureHerrscherOfHuman();",
    "    RestoreThirteenFlameChasers();",
    "    RebuildIncarnation();",
    "    return 0;",
    "}",
  ].join("\n");

  const TIMINGS = {
    codeStart: 520,
    revealInterval: 320,
    lineDuration: 380,
    holdAfterReveal: 620,
    exitDuration: 700,
    reducedMotionHold: 250,
    videoReadyTimeout: 1200,
  };

  function escapeHtml(text) {
    return String(text ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function clearFailSafe() {
    if (typeof window.__elysiaIntroFailSafe === "number") {
      window.clearTimeout(window.__elysiaIntroFailSafe);
      window.__elysiaIntroFailSafe = null;
    }
  }

  function syncPrismTheme(theme) {
    const prismThemeLink = document.getElementById("elysiaPrismThemeLink");
    if (!prismThemeLink) return;

    prismThemeLink.setAttribute(
      "href",
      theme === "dark" ? "../assets/prism/prism-dark.css" : "../assets/prism/prism-light.css"
    );
  }

  function createHighlightedCodeLines(targetElement) {
    if (!targetElement) return [];

    const highlightedCode = (
      typeof window.Prism !== "undefined" &&
      window.Prism.languages &&
      window.Prism.languages.cpp &&
      typeof window.Prism.highlight === "function"
    )
      ? window.Prism.highlight(INTRO_CODE, window.Prism.languages.cpp, "cpp")
      : escapeHtml(INTRO_CODE);

    const lines = highlightedCode.split("\n");
    const fragment = document.createDocumentFragment();

    targetElement.innerHTML = "";

    for (const lineHtml of lines) {
      const lineElement = document.createElement("span");
      lineElement.className = "elysia-intro-code__line";
      lineElement.innerHTML = lineHtml || "&nbsp;";
      fragment.appendChild(lineElement);
    }

    targetElement.appendChild(fragment);
    return Array.from(targetElement.querySelectorAll(".elysia-intro-code__line"));
  }

  function setPageContentInert(isInert) {
    const targets = document.querySelectorAll("header.nav, main.elysia-shell, footer.elysia-footer");

    document.body.classList.toggle("elysia-intro-active", isInert);
    for (const element of targets) {
      if (isInert) {
        element.setAttribute("inert", "");
      } else {
        element.removeAttribute("inert");
      }
    }
  }

  function initIntro(pageCore) {
    const root = document.documentElement;
    const introElement = document.getElementById("elysiaIntro");
    const videoElement = document.getElementById("elysiaIntroVideo");
    const codePanelElement = document.getElementById("elysiaIntroCodePanel");
    const codeElement = document.getElementById("elysiaIntroCode");
    const reducedMotionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    const prefersReducedMotion = Boolean(reducedMotionQuery && reducedMotionQuery.matches);
    const introEnabled = pageCore.getFx();

    clearFailSafe();

    if (!introElement) {
      root.setAttribute("data-elysia-intro", "done");
      return;
    }

    if (!introEnabled) {
      root.setAttribute("data-elysia-intro", "skip");
      introElement.setAttribute("aria-hidden", "true");
      return;
    }

    const codeLines = createHighlightedCodeLines(codeElement);
    introElement.style.setProperty("--elysia-intro-line-count", String(codeLines.length));

    let isExiting = false;
    let hasFinished = false;
    const timeoutIds = [];
    const cleanupCallbacks = [];

    function schedule(callback, delay) {
      const timeoutId = window.setTimeout(callback, delay);
      timeoutIds.push(timeoutId);
      return timeoutId;
    }

    function clearScheduledWork() {
      while (timeoutIds.length > 0) {
        window.clearTimeout(timeoutIds.pop());
      }
    }

    function runCleanup() {
      while (cleanupCallbacks.length > 0) {
        const cleanup = cleanupCallbacks.pop();
        cleanup();
      }
    }

    function finishIntro() {
      if (hasFinished) return;
      hasFinished = true;

      clearScheduledWork();
      runCleanup();
      clearFailSafe();

      if (videoElement) {
        videoElement.pause();
        try {
          videoElement.currentTime = 0;
        } catch (_) {
          // Ignore seek failures for browsers that have already detached the media pipeline.
        }
      }

      setPageContentInert(false);
      introElement.setAttribute("aria-hidden", "true");
      root.setAttribute("data-elysia-intro", "done");
    }

    function beginExit() {
      if (isExiting) return;
      isExiting = true;

      clearScheduledWork();
      runCleanup();

      root.setAttribute("data-elysia-intro", "exiting");
      introElement.classList.add("is-exiting");

      schedule(finishIntro, TIMINGS.exitDuration);
    }

    function revealCodeLines() {
      if (isExiting) return;

      codePanelElement?.setAttribute("aria-hidden", "false");
      introElement.classList.add("is-code-active");

      const revealOrder = codeLines.slice().reverse();
      if (revealOrder.length === 0) {
        beginExit();
        return;
      }

      for (const [index, lineElement] of revealOrder.entries()) {
        schedule(() => {
          lineElement.classList.add("is-visible");
        }, index * TIMINGS.revealInterval);
      }

      const totalRevealTime =
        (revealOrder.length - 1) * TIMINGS.revealInterval +
        TIMINGS.lineDuration +
        TIMINGS.holdAfterReveal;

      schedule(beginExit, totalRevealTime);
    }

    function markVideoReady() {
      if (isExiting || !introElement) return;
      introElement.classList.add("is-video-ready");
      introElement.classList.remove("is-video-failed");
    }

    function markVideoFailed() {
      if (isExiting || !introElement) return;
      introElement.classList.add("is-video-failed");
    }

    function attachSkipHandlers() {
      const onKeyDown = (event) => {
        if (event.key === "Escape" || event.key === "Enter") {
          event.preventDefault();
          beginExit();
        }
      };

      const onOverlayClick = (event) => {
        if (event.target instanceof Element && event.target.closest(".elysia-intro__code-shell")) {
          return;
        }
        beginExit();
      };

      window.addEventListener("keydown", onKeyDown);
      introElement.addEventListener("click", onOverlayClick);

      cleanupCallbacks.push(() => window.removeEventListener("keydown", onKeyDown));
      cleanupCallbacks.push(() => introElement.removeEventListener("click", onOverlayClick));
    }

    function attachVideoHandling() {
      if (!videoElement) return;

      let hasResolvedVideo = false;
      let videoTimeoutId = null;

      const resolveVideo = (handler) => {
        if (hasResolvedVideo || isExiting) return;
        hasResolvedVideo = true;

        if (videoTimeoutId !== null) {
          window.clearTimeout(videoTimeoutId);
          videoTimeoutId = null;
        }

        handler();
      };

      const onVideoReady = () => resolveVideo(markVideoReady);
      const onVideoFailure = () => resolveVideo(markVideoFailed);

      videoElement.addEventListener("loadeddata", onVideoReady, { once: true });
      videoElement.addEventListener("canplay", onVideoReady, { once: true });
      videoElement.addEventListener("playing", onVideoReady, { once: true });
      videoElement.addEventListener("error", onVideoFailure, { once: true });
      videoElement.addEventListener("stalled", onVideoFailure, { once: true });
      videoElement.addEventListener("abort", onVideoFailure, { once: true });

      cleanupCallbacks.push(() => videoElement.removeEventListener("loadeddata", onVideoReady));
      cleanupCallbacks.push(() => videoElement.removeEventListener("canplay", onVideoReady));
      cleanupCallbacks.push(() => videoElement.removeEventListener("playing", onVideoReady));
      cleanupCallbacks.push(() => videoElement.removeEventListener("error", onVideoFailure));
      cleanupCallbacks.push(() => videoElement.removeEventListener("stalled", onVideoFailure));
      cleanupCallbacks.push(() => videoElement.removeEventListener("abort", onVideoFailure));

      videoTimeoutId = window.setTimeout(() => resolveVideo(markVideoFailed), TIMINGS.videoReadyTimeout);
      cleanupCallbacks.push(() => {
        if (videoTimeoutId !== null) {
          window.clearTimeout(videoTimeoutId);
          videoTimeoutId = null;
        }
      });

      if (videoElement.readyState >= 2) {
        onVideoReady();
      }

      const playPromise = videoElement.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(onVideoFailure);
      }
    }

    setPageContentInert(true);
    introElement.setAttribute("aria-hidden", "false");
    root.setAttribute("data-elysia-intro", "running");
    attachSkipHandlers();

    if (prefersReducedMotion) {
      introElement.classList.add("is-code-active");
      for (const lineElement of codeLines) {
        lineElement.classList.add("is-visible");
      }
      codePanelElement?.setAttribute("aria-hidden", "false");
      schedule(beginExit, TIMINGS.reducedMotionHold);
      return;
    }

    attachVideoHandling();
    schedule(revealCodeLines, TIMINGS.codeStart);
  }

  function init() {
    if (!window.ElysiaBase) {
      console.error("ElysiaBase module is missing.");
      document.documentElement.setAttribute("data-elysia-intro", "skip");
      clearFailSafe();
      return;
    }

    const pageCore = window.ElysiaBase.init({
      onThemeChange(theme) {
        syncPrismTheme(theme);
      },
      onLangChange(language) {
        if (typeof window.applyI18n !== "function") return;
        window.applyI18n(language).catch((error) => {
          console.warn("[i18n] Failed to apply Elysia Engine translations.", error);
        });
      },
    });

    syncPrismTheme(pageCore.getTheme());
    initIntro(pageCore);
  }

  window.addEventListener("DOMContentLoaded", init);
})();
