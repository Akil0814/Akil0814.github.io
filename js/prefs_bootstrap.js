(function () {
  try {
    document.documentElement.setAttribute("data-theme", localStorage.getItem("theme") || "dark");
    const lang = localStorage.getItem("lang") || "en";
    const langMap = { zh: "zh-CN", ja: "ja", en: "en" };
    document.documentElement.setAttribute("lang", langMap[lang] || "en");
  } catch (_) {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.setAttribute("lang", "en");
  }
})();
