(function () {
  function selectElement(selector) {
    return typeof window.$ === "function"
      ? window.$(selector)
      : document.querySelector(selector);
  }

  function clamp(value, minValue, maxValue) {
    return Math.min(maxValue, Math.max(minValue, value));
  }

  function lerp(startValue, endValue, ratio) {
    return startValue + (endValue - startValue) * ratio;
  }

  function randomRange(minValue, maxValue) {
    return minValue + Math.random() * (maxValue - minValue);
  }

  function getTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }

  function isFxEnabled() {
    return typeof uiState === "undefined" ? true : !!uiState.fxOn;
  }

  window.aboutFxUtils = {
    TAU: Math.PI * 2,
    BASE_AREA: 1920 * 1080,
    selectElement,
    clamp,
    lerp,
    randomRange,
    getTheme,
    isFxEnabled,
  };
})();
