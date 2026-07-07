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
  const JAPANESE_NOTICE_KEY = "ja_notice_shown_v1";
  const JAPANESE_NOTICE_TEXT =
    "日本語はまだ学習中で、十分に上手ではありません。多くの日本語テキストはAI翻訳を使用しています。誤りがあれば、あらかじめお詫びします。";

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

  function getPageScope(page) {
    if (!page || !page.includes("/")) return "";
    const segments = page.split("/");
    segments.pop();
    return segments.join("/");
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

    const pageScope = getPageScope(page);

    const enCommonPath = buildLocaleFilePath(basePath, "en", "common");
    const enScopedCommonPath = pageScope
      ? buildLocaleFilePath(basePath, "en", `${pageScope}/common`)
      : null;
    const enPagePath = buildLocaleFilePath(basePath, "en", page);
    const [enCommon, enScopedCommon, enPage] = await Promise.all([
      readJson(enCommonPath),
      enScopedCommonPath ? readJson(enScopedCommonPath) : Promise.resolve({}),
      readJson(enPagePath),
    ]);

    const enBundle = deepMerge(
      deepMerge(deepClone(enCommon), enScopedCommon),
      enPage
    );
    if (lang === "en") {
      const result = { merged: enBundle, english: enBundle };
      bundleCache.set(cacheKey, result);
      return result;
    }

    const commonPath = buildLocaleFilePath(basePath, lang, "common");
    const scopedCommonPath = pageScope
      ? buildLocaleFilePath(basePath, lang, `${pageScope}/common`)
      : null;
    const pagePath = buildLocaleFilePath(basePath, lang, page);
    const [commonBundle, scopedCommonBundle, pageBundle] = await Promise.all([
      readJson(commonPath),
      scopedCommonPath ? readJson(scopedCommonPath) : Promise.resolve({}),
      readJson(pagePath),
    ]);

    const localizedBundle = deepMerge(
      deepMerge(
        deepMerge(deepClone(enBundle), commonBundle),
        scopedCommonBundle
      ),
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

  function maybeShowJapaneseNotice(language) {
    if (language !== "ja") return;

    try {
      if (localStorage.getItem(JAPANESE_NOTICE_KEY) === "1") return;
      window.alert(JAPANESE_NOTICE_TEXT);
      localStorage.setItem(JAPANESE_NOTICE_KEY, "1");
    } catch (_) {
      // Ignore localStorage or alert restrictions.
    }
  }

  function translate(key, params, fallbackText, options = {}) {
    const resolvedFromActive = getNestedValue(state.dict, key);
    const resolvedFromEnglish = getNestedValue(state.enDict, key);
    let value = resolvedFromActive ?? resolvedFromEnglish;
    const renderAsHtml = Boolean(options.html);

    if (Array.isArray(value)) {
      const pieces = value
        .map((item) => {
          if (typeof item === "string") return interpolate(item, params);
          if (item === null || item === undefined) return "";
          return String(item);
        })
        .filter((item) => item.length > 0);

      // Arrays are concatenated inline by default.
      // Add explicit "<br>" in locale strings when line breaks are needed.
      return renderAsHtml ? pieces.join("") : pieces.join(" ");
    }

    if (typeof value !== "string") {
      console.warn(`[i18n] Missing key "${key}" in page "${state.page}" and English fallback.`);
      value = typeof fallbackText === "string" ? fallbackText : key;
    }

    return interpolate(value, params);
  }

  function applyElementTranslation(element) {
    const key = element.getAttribute("data-i18n");
    if (!key) return;

    const allowHtml = element.hasAttribute("data-i18n-html");
    const value = translate(key, undefined, undefined, { html: allowHtml });
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
      if (allowHtml) {
        element.innerHTML = value;
        return;
      }
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
    maybeShowJapaneseNotice(normalizedLanguage);

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
