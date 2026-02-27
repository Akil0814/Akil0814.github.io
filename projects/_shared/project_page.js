(function () {
  const LANG_MAP = {
    zh: "zh-CN",
    ja: "ja",
    en: "en",
  };

  function setThemeColorMeta(theme) {
    const value = theme === "light" ? "#dbe3ec" : "#0b1020";
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", value);
  }

  function normalizeTheme(next, fallback) {
    if (next === "dark" || next === "light") return next;
    return fallback;
  }

  function normalizeLang(next, fallback) {
    if (LANG_MAP[next]) return next;
    return fallback;
  }

  function applyThemeAssets(theme) {
    document.querySelectorAll("img[data-src-dark][data-src-light]").forEach((img) => {
      const next = theme === "dark" ? img.dataset.srcDark : img.dataset.srcLight;
      if (next && img.getAttribute("src") !== next) img.setAttribute("src", next);
    });

    document.querySelectorAll("[data-bg-dark][data-bg-light]").forEach((el) => {
      const next = theme === "dark" ? el.dataset.bgDark : el.dataset.bgLight;
      if (next) el.style.backgroundImage = "url('" + next + "')";
    });
  }

  function applyCodeThemeStylesheet(config, theme) {
    if (!config.codeThemeDarkHref || !config.codeThemeLightHref) return;

    const linkId = config.codeThemeLinkId || "codeThemeLink";
    const nextHref = theme === "dark" ? config.codeThemeDarkHref : config.codeThemeLightHref;
    let linkEl = document.getElementById(linkId);

    if (!linkEl) {
      linkEl = document.createElement("link");
      linkEl.id = linkId;
      linkEl.rel = "stylesheet";
      document.head.appendChild(linkEl);
    }

    if (linkEl.getAttribute("href") !== nextHref) {
      linkEl.setAttribute("href", nextHref);
    }
  }

  function init(options = {}) {
    const config = {
      defaultTheme: "dark",
      defaultFx: "on",
      defaultLang: "en",
      themeButtonId: "themeBtn",
      fxButtonId: "toggleFx",
      langSelectId: "langSelect",
      yearElementId: "year",
      codeThemeLinkId: "codeThemeLink",
      codeThemeDarkHref: null,
      codeThemeLightHref: null,
      onThemeChange: null,
      onFxChange: null,
      onLangChange: null,
      ...options,
    };

    const themeBtn = document.getElementById(config.themeButtonId);
    const fxBtn = document.getElementById(config.fxButtonId);
    const langSelect = document.getElementById(config.langSelectId);
    const yearEl = document.getElementById(config.yearElementId);

    function getTheme() {
      return normalizeTheme(localStorage.getItem("theme"), config.defaultTheme);
    }

    function setTheme(theme) {
      const normalized = normalizeTheme(theme, config.defaultTheme);
      document.documentElement.setAttribute("data-theme", normalized);
      localStorage.setItem("theme", normalized);
      applyThemeAssets(normalized);
      applyCodeThemeStylesheet(config, normalized);
      setThemeColorMeta(normalized);
      if (typeof config.onThemeChange === "function") {
        config.onThemeChange(normalized);
      }
    }

    function getFx() {
      return (localStorage.getItem("fx") || config.defaultFx) === "on";
    }

    function setFx(on) {
      document.body.classList.toggle("fx-off", !on);
      localStorage.setItem("fx", on ? "on" : "off");
      if (typeof config.onFxChange === "function") {
        config.onFxChange(on);
      }
    }

    function getLang() {
      return normalizeLang(localStorage.getItem("lang"), config.defaultLang);
    }

    function setLang(lang) {
      const normalized = normalizeLang(lang, config.defaultLang);
      document.documentElement.setAttribute("lang", LANG_MAP[normalized]);
      localStorage.setItem("lang", normalized);
      if (langSelect && langSelect.value !== normalized) {
        langSelect.value = normalized;
      }
      if (typeof config.onLangChange === "function") {
        config.onLangChange(normalized);
      }
    }

    const themeChangeHandler = () => {
      setTheme(getTheme() === "dark" ? "light" : "dark");
    };
    const fxChangeHandler = () => {
      setFx(!getFx());
    };
    const langChangeHandler = () => {
      if (!langSelect) return;
      setLang(langSelect.value);
    };
    const storageHandler = (event) => {
      if (event.key === "theme" && event.newValue) setTheme(event.newValue);
      if (event.key === "fx" && event.newValue) setFx(event.newValue === "on");
      if (event.key === "lang" && event.newValue) setLang(event.newValue);
    };

    setTheme(getTheme());
    setFx(getFx());
    setLang(getLang());

    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    if (themeBtn) themeBtn.addEventListener("click", themeChangeHandler);
    if (fxBtn) fxBtn.addEventListener("click", fxChangeHandler);
    if (langSelect) langSelect.addEventListener("change", langChangeHandler);
    window.addEventListener("storage", storageHandler);

    return {
      getTheme,
      setTheme,
      getFx,
      setFx,
      getLang,
      setLang,
      destroy() {
        if (themeBtn) themeBtn.removeEventListener("click", themeChangeHandler);
        if (fxBtn) fxBtn.removeEventListener("click", fxChangeHandler);
        if (langSelect) langSelect.removeEventListener("change", langChangeHandler);
        window.removeEventListener("storage", storageHandler);
      },
    };
  }

  window.ProjectPageCore = {
    init,
    applyThemeAssets,
  };
})();
