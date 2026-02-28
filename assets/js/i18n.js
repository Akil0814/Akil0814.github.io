(function () {
  const SUPPORTED_LANGUAGES = new Set(["en", "zh", "ja"]);
  const HTML_LANG_TO_SHORT = {
    en: "en",
    "en-us": "en",
    zh: "zh",
    "zh-cn": "zh",
    ja: "ja",
  };

  const state = {
    lang: "en",
    page: "index",
    dict: {},
    enDict: {},
  };

  const bundleCache = new Map();

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function deepClone(value) {
    if (!isPlainObject(value)) return value;
    const clone = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      clone[key] = deepClone(nestedValue);
    }
    return clone;
  }

  function deepMerge(target, source) {
    if (!isPlainObject(source)) return target;
    const output = isPlainObject(target) ? target : {};

    for (const [key, value] of Object.entries(source)) {
      if (isPlainObject(value)) {
        output[key] = deepMerge(output[key], value);
      } else {
        output[key] = value;
      }
    }

    return output;
  }

  function getNestedValue(source, keyPath) {
    if (!keyPath) return undefined;
    const segments = keyPath.split(".");
    let cursor = source;

    for (const segment of segments) {
      if (!isPlainObject(cursor) || !(segment in cursor)) {
        return undefined;
      }
      cursor = cursor[segment];
    }

    return cursor;
  }

  function interpolate(template, params) {
    if (typeof template !== "string" || !isPlainObject(params)) return template;
    return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, paramKey) => {
      if (paramKey in params) return String(params[paramKey]);
      return match;
    });
  }

  function normalizeLanguage(rawLanguage) {
    if (!rawLanguage) return "en";
    const normalized = String(rawLanguage).trim().toLowerCase();

    if (SUPPORTED_LANGUAGES.has(normalized)) return normalized;
    if (normalized in HTML_LANG_TO_SHORT) return HTML_LANG_TO_SHORT[normalized];
    if (normalized.startsWith("zh")) return "zh";
    if (normalized.startsWith("ja")) return "ja";
    if (normalized.startsWith("en")) return "en";
    return "en";
  }

  function getCurrentPageName() {
    const explicitPage = document.documentElement.dataset.i18nPage;
    if (explicitPage) return explicitPage;

    const pathName = window.location.pathname || "";
    const fileName = pathName.split("/").pop() || "index.html";
    const pageName = fileName.replace(/\.[^.]+$/, "");
    return pageName || "index";
  }

  function getI18nBasePath() {
    const explicitBase = document.documentElement.dataset.i18nBase;
    if (explicitBase) {
      return explicitBase.replace(/\/+$/, "");
    }
    return ".";
  }

  function buildLocaleFilePath(basePath, lang, fileName) {
    return `${basePath}/i18n/${lang}/${fileName}.json`;
  }

  async function readJson(path) {
    try {
      const response = await fetch(path, { cache: "no-cache" });
      if (!response.ok) {
        if (response.status !== 404) {
          console.warn(`[i18n] Failed to load ${path} (${response.status})`);
        }
        return {};
      }

      const json = await response.json();
      return isPlainObject(json) ? json : {};
    } catch (error) {
      console.warn(`[i18n] Error while loading ${path}`, error);
      return {};
    }
  }

  async function loadBundle(lang, page) {
    const basePath = getI18nBasePath();
    const cacheKey = `${basePath}|${lang}|${page}`;
    if (bundleCache.has(cacheKey)) {
      return bundleCache.get(cacheKey);
    }

    const enCommonPath = buildLocaleFilePath(basePath, "en", "common");
    const enPagePath = buildLocaleFilePath(basePath, "en", page);
    const [enCommon, enPage] = await Promise.all([readJson(enCommonPath), readJson(enPagePath)]);

    const enBundle = deepMerge(deepClone(enCommon), enPage);
    if (lang === "en") {
      const result = { merged: enBundle, english: enBundle };
      bundleCache.set(cacheKey, result);
      return result;
    }

    const commonPath = buildLocaleFilePath(basePath, lang, "common");
    const pagePath = buildLocaleFilePath(basePath, lang, page);
    const [commonBundle, pageBundle] = await Promise.all([readJson(commonPath), readJson(pagePath)]);

    const localizedBundle = deepMerge(
      deepMerge(deepClone(enBundle), commonBundle),
      pageBundle
    );
    const result = { merged: localizedBundle, english: enBundle };
    bundleCache.set(cacheKey, result);
    return result;
  }

  function resolveLanguageFromEnvironment() {
    try {
      const localStorageLanguage = normalizeLanguage(localStorage.getItem("lang"));
      if (SUPPORTED_LANGUAGES.has(localStorageLanguage)) return localStorageLanguage;
    } catch (_) {
      // Ignore localStorage errors and continue with HTML language.
    }

    const htmlLanguage = normalizeLanguage(document.documentElement.getAttribute("lang"));
    if (SUPPORTED_LANGUAGES.has(htmlLanguage)) return htmlLanguage;

    return "en";
  }

  function translate(key, params, fallbackText) {
    const resolvedFromActive = getNestedValue(state.dict, key);
    const resolvedFromEnglish = getNestedValue(state.enDict, key);
    let value = resolvedFromActive ?? resolvedFromEnglish;

    if (typeof value !== "string") {
      console.warn(`[i18n] Missing key "${key}" in page "${state.page}" and English fallback.`);
      value = typeof fallbackText === "string" ? fallbackText : key;
    }

    return interpolate(value, params);
  }

  function applyElementTranslation(element) {
    const key = element.getAttribute("data-i18n");
    if (!key) return;

    const value = translate(key);
    const rawAttrs = element.getAttribute("data-i18n-attr");
    const attrs = rawAttrs
      ? rawAttrs
          .split("|")
          .map((part) => part.trim())
          .filter(Boolean)
      : [];

    for (const attrName of attrs) {
      element.setAttribute(attrName, value);
    }

    if (attrs.length === 0 || element.hasAttribute("data-i18n-text")) {
      element.textContent = value;
    }
  }

  async function applyI18n(targetLanguage) {
    const normalizedLanguage = normalizeLanguage(targetLanguage || resolveLanguageFromEnvironment());
    const pageName = getCurrentPageName();
    const bundle = await loadBundle(normalizedLanguage, pageName);

    state.lang = normalizedLanguage;
    state.page = pageName;
    state.dict = bundle.merged;
    state.enDict = bundle.english;

    const translatableElements = document.querySelectorAll("[data-i18n]");
    translatableElements.forEach((element) => applyElementTranslation(element));
  }

  function initI18n() {
    applyI18n();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initI18n);
  } else {
    initI18n();
  }

  window.I18N = {
    t: translate,
    applyI18n,
    getCurrentLang() {
      return state.lang;
    },
    getCurrentPage() {
      return state.page;
    },
  };

  window.applyI18n = applyI18n;
})();
