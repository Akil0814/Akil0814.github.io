(function () {
  const codeEntries = [
    {
      target: "#code-main-loop",
      file: "../snippets/MineSweeper_main_lop.cpp",
      title: "MineSweeper_main_lop.cpp",
    },
    {
      target: "#code-scene-class",
      file: "../snippets/MineSweeper_scene_class.cpp",
      title: "MineSweeper_scene_class.cpp",
    },
    {
      target: "#code-scene-manager",
      file: "../snippets/MineSweeper_scene_manager.cpp",
      title: "MineSweeper_scene_manager.cpp",
    },
  ];

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

  function getTheme() {
    return localStorage.getItem("theme") || "dark";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    setThemeColorMeta(theme);
  }

  function setupThemeToggle() {
    const btn = document.getElementById("themeBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const next = getTheme() === "dark" ? "light" : "dark";
      setTheme(next);
    });
  }

  function getFxEnabled() {
    return (localStorage.getItem("fx") || "on") === "on";
  }

  function setFxEnabled(on) {
    document.body.classList.toggle("fx-off", !on);
    localStorage.setItem("fx", on ? "on" : "off");
  }

  function setupFxToggle() {
    const btn = document.getElementById("toggleFx");
    if (!btn) return;
    btn.addEventListener("click", () => {
      setFxEnabled(!getFxEnabled());
    });
  }

  function setupLanguageSelect() {
    const langSelect = document.getElementById("langSelect");
    if (!langSelect) return;

    const current = localStorage.getItem("lang") || "en";
    if ([...langSelect.options].some((opt) => opt.value === current)) {
      langSelect.value = current;
    }

    langSelect.addEventListener("change", () => {
      localStorage.setItem("lang", langSelect.value);
    });
  }

  function setYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  async function loadCodeBlocks() {
    for (const item of codeEntries) {
      try {
        await window.MineCppBlock.renderCppFile(item.target, item.file, {
          title: item.title,
          showLineNumbers: true,
          copyButton: true,
        });
      } catch (err) {
        const host = document.querySelector(item.target);
        if (!host) continue;
        host.innerHTML = "";
        const msg = document.createElement("p");
        msg.className = "panel";
        msg.textContent = `Failed to load code: ${item.file}`;
        host.appendChild(msg);
        console.error(err);
      }
    }
  }

  function init() {
    setTheme(getTheme());
    setFxEnabled(getFxEnabled());
    setupLanguageSelect();
    setupFxToggle();
    setupThemeToggle();
    setYear();
    loadCodeBlocks();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
