(function () {
  const LANGUAGE_MAP = {
    zh: "zh-CN",
    ja: "ja",
    en: "en",
  };

  function normalizeTheme(theme, fallbackTheme) {
    return theme === "dark" || theme === "light" ? theme : fallbackTheme;
  }

  function normalizeLanguage(language, fallbackLanguage) {
    return LANGUAGE_MAP[language] ? language : fallbackLanguage;
  }

  function ensureThemeColorMeta(theme) {
    const themeColor = theme === "light" ? "#fff3f8" : "#170d19";
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      document.head.appendChild(metaThemeColor);
    }

    metaThemeColor.setAttribute("content", themeColor);
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
      onThemeChange: null,
      onFxChange: null,
      onLangChange: null,
      ...options,
    };

    const themeButton = document.getElementById(config.themeButtonId);
    const fxButton = document.getElementById(config.fxButtonId);
    const languageSelect = document.getElementById(config.langSelectId);
    const yearElement = document.getElementById(config.yearElementId);

    function getTheme() {
      return normalizeTheme(localStorage.getItem("theme"), config.defaultTheme);
    }

    function setTheme(theme) {
      const normalizedTheme = normalizeTheme(theme, config.defaultTheme);
      document.documentElement.setAttribute("data-theme", normalizedTheme);
      localStorage.setItem("theme", normalizedTheme);
      ensureThemeColorMeta(normalizedTheme);
      if (typeof config.onThemeChange === "function") {
        config.onThemeChange(normalizedTheme);
      }
    }

    function getFx() {
      return (localStorage.getItem("fx") || config.defaultFx) === "on";
    }

    function setFx(enabled) {
      document.body.classList.toggle("fx-off", !enabled);
      localStorage.setItem("fx", enabled ? "on" : "off");
      if (typeof config.onFxChange === "function") {
        config.onFxChange(enabled);
      }
    }

    function getLang() {
      return normalizeLanguage(localStorage.getItem("lang"), config.defaultLang);
    }

    function setLang(language) {
      const normalizedLanguage = normalizeLanguage(language, config.defaultLang);
      document.documentElement.setAttribute("lang", LANGUAGE_MAP[normalizedLanguage]);
      localStorage.setItem("lang", normalizedLanguage);

      if (languageSelect && languageSelect.value !== normalizedLanguage) {
        languageSelect.value = normalizedLanguage;
      }

      if (typeof config.onLangChange === "function") {
        config.onLangChange(normalizedLanguage);
      }
    }

    const onThemeButtonClick = () => setTheme(getTheme() === "dark" ? "light" : "dark");
    const onFxButtonClick = () => setFx(!getFx());
    const onLanguageChange = () => {
      if (!languageSelect) return;
      setLang(languageSelect.value);
    };

    const onStorageChange = (event) => {
      if (event.key === "theme" && event.newValue) setTheme(event.newValue);
      if (event.key === "fx" && event.newValue) setFx(event.newValue === "on");
      if (event.key === "lang" && event.newValue) setLang(event.newValue);
    };

    setTheme(getTheme());
    setFx(getFx());
    setLang(getLang());

    if (yearElement) {
      yearElement.textContent = String(new Date().getFullYear());
    }

    themeButton?.addEventListener("click", onThemeButtonClick);
    fxButton?.addEventListener("click", onFxButtonClick);
    languageSelect?.addEventListener("change", onLanguageChange);
    window.addEventListener("storage", onStorageChange);

    return {
      getTheme,
      setTheme,
      getFx,
      setFx,
      getLang,
      setLang,
      destroy() {
        themeButton?.removeEventListener("click", onThemeButtonClick);
        fxButton?.removeEventListener("click", onFxButtonClick);
        languageSelect?.removeEventListener("change", onLanguageChange);
        window.removeEventListener("storage", onStorageChange);
      },
    };
  }

  window.ElysiaBase = {
    init,
  };
})();
