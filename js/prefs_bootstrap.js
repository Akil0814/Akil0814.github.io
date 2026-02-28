(function () {
  const LANGUAGE_MAP = { zh: "zh-CN", ja: "ja", en: "en" };

  try {
    const savedTheme = localStorage.getItem("theme") || "dark";
    const savedLanguage = localStorage.getItem("lang") || "en";
    const htmlLanguage = LANGUAGE_MAP[savedLanguage] || "en";

    document.documentElement.setAttribute("data-theme", savedTheme);
    document.documentElement.setAttribute("lang", htmlLanguage);
  } catch (_) {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.setAttribute("lang", "en");
  }
})();
