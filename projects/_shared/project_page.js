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
    const themeColor = theme === "light" ? "#dbe3ec" : "#0b1020";
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      document.head.appendChild(metaThemeColor);
    }

    metaThemeColor.setAttribute("content", themeColor);
  }

  function applyThemeAssets(theme) {
    document.querySelectorAll("img[data-src-dark][data-src-light]").forEach((imageElement) => {
      const nextSource = theme === "dark" ? imageElement.dataset.srcDark : imageElement.dataset.srcLight;
      if (nextSource && imageElement.getAttribute("src") !== nextSource) {
        imageElement.setAttribute("src", nextSource);
      }
    });

    document.querySelectorAll("[data-bg-dark][data-bg-light]").forEach((element) => {
      const nextBackground = theme === "dark" ? element.dataset.bgDark : element.dataset.bgLight;
      if (nextBackground) {
        element.style.backgroundImage = `url('${nextBackground}')`;
      }
    });
  }

  function applyCodeThemeStylesheet(config, theme) {
    if (!config.codeThemeDarkHref || !config.codeThemeLightHref) return;

    const linkId = config.codeThemeLinkId || "codeThemeLink";
    const nextStylesheetHref = theme === "dark" ? config.codeThemeDarkHref : config.codeThemeLightHref;
    let codeThemeLink = document.getElementById(linkId);

    if (!codeThemeLink) {
      codeThemeLink = document.createElement("link");
      codeThemeLink.id = linkId;
      codeThemeLink.rel = "stylesheet";
      document.head.appendChild(codeThemeLink);
    }

    if (codeThemeLink.getAttribute("href") !== nextStylesheetHref) {
      codeThemeLink.setAttribute("href", nextStylesheetHref);
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
      applyThemeAssets(normalizedTheme);
      applyCodeThemeStylesheet(config, normalizedTheme);
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

    function syncLanguage(language) {
      const normalizedLanguage = normalizeLanguage(language, config.defaultLang);
      document.documentElement.setAttribute("lang", LANGUAGE_MAP[normalizedLanguage]);
      localStorage.setItem("lang", normalizedLanguage);

      if (languageSelect && languageSelect.value !== normalizedLanguage) {
        languageSelect.value = normalizedLanguage;
      }

      return normalizedLanguage;
    }

    async function setLang(language) {
      const normalizedLanguage = syncLanguage(language);

      try {
        const applied = typeof window.applyI18n === "function"
          ? await window.applyI18n(normalizedLanguage)
          : true;

        if (applied && typeof config.onLangChange === "function") {
          await config.onLangChange(normalizedLanguage);
        }

        return applied;
      } catch (error) {
        console.warn("[i18n] Failed to apply language on project page.", error);
        return false;
      }
    }

    const onThemeButtonClick = () => setTheme(getTheme() === "dark" ? "light" : "dark");
    const onFxButtonClick = () => setFx(!getFx());
    const onLanguageChange = () => {
      if (!languageSelect) return;
      void setLang(languageSelect.value);
    };

    const onStorageChange = (event) => {
      if (event.key === "theme" && event.newValue) setTheme(event.newValue);
      if (event.key === "fx" && event.newValue) setFx(event.newValue === "on");
      if (event.key === "lang" && event.newValue) void setLang(event.newValue);
    };

    setTheme(getTheme());
    setFx(getFx());
    syncLanguage(getLang());

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

  window.ProjectPageCore = {
    init,
    applyThemeAssets,
  };
})();
