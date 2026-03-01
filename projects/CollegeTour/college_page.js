(function () {
  function t(key, fallbackText, params) {
    if (window.I18N && typeof window.I18N.t === "function") {
      return window.I18N.t(key, params, fallbackText);
    }

    if (typeof fallbackText === "string") return fallbackText;
    return key;
  }

  const codeEntries = [
    {
      fileName: "CollegeTour_data_manager_class.h",
      summaryKey: "CollegeTour.code.data_manager_class.desc",
      summaryFallback: "DataManager class contract, members, and backend-facing interfaces.",
    },
    {
      fileName: "CollegeTour_data_manager_init.cpp",
      summaryKey: "CollegeTour.code.data_manager_init.desc",
      summaryFallback: "Initializes core data structures and startup loading path.",
    },
    {
      fileName: "CollegeTour_data_manager_read_dynamic.cpp",
      summaryKey: "CollegeTour.code.data_manager_read_dynamic.desc",
      summaryFallback: "Reads runtime data from SQLite-backed storage and maps it into in-memory state.",
    },
    {
      fileName: "CollegeTour_data_manager_reset_database.cpp",
      summaryKey: "CollegeTour.code.data_manager_reset_database.desc",
      summaryFallback: "Resets backend data state and rebuilds required base records.",
    },
    {
      fileName: "CollegeTour_login_XOR.cpp",
      summaryKey: "CollegeTour.code.login_xor.desc",
      summaryFallback: "Administrator login verification flow and XOR-based credential processing.",
    },
  ].map((entry, index) => ({
    ...entry,
    targetSelector: `#code-slot-${index + 1}`,
    cardId: `code-card-${index + 1}`,
    filePath: `../snippets/CollegeTour/${entry.fileName}`,
    sourceUrl: `https://github.com/Akil0814/College_Tour/blob/main/projects/snippets/CollegeTour/${entry.fileName}`,
  }));

  function renderCodeCards() {
    const codeList = document.getElementById("codeList");
    const codeCount = document.getElementById("codeCount");
    if (!codeList) return;

    codeList.innerHTML = "";
    for (const entry of codeEntries) {
      const card = document.createElement("article");
      card.className = "code-card";
      card.id = entry.cardId;

      const title = document.createElement("h3");
      title.textContent = entry.fileName;

      const description = document.createElement("p");
      description.setAttribute("data-i18n", entry.summaryKey);
      description.textContent = t(entry.summaryKey, entry.summaryFallback);

      const slot = document.createElement("div");
      slot.id = entry.targetSelector.slice(1);
      slot.className = "code-slot";

      card.appendChild(title);
      card.appendChild(description);
      card.appendChild(slot);
      codeList.appendChild(card);
    }

    if (codeCount) {
      codeCount.textContent = String(codeEntries.length);
    }
  }

  async function loadCodeBlocks() {
    for (const entry of codeEntries) {
      try {
        await window.ProjectCodeBlock.renderCppFile(entry.targetSelector, entry.filePath, {
          title: entry.fileName,
          showLineNumbers: true,
          copyButton: true,
          sourceUrl: entry.sourceUrl,
          visibleLines: 20,
        });
      } catch (error) {
        const targetElement = document.querySelector(entry.targetSelector);
        if (!targetElement) continue;

        targetElement.innerHTML = "";
        const messageElement = document.createElement("p");
        messageElement.className = "panel";
        messageElement.textContent = t(
          "common.misc.failed_load_code",
          `Failed to load code: ${entry.filePath}`,
          { path: entry.filePath }
        );
        targetElement.appendChild(messageElement);
        console.error(error);
      }
    }
  }

  function init() {
    if (!window.ProjectPageCore || !window.ProjectCodeBlock) {
      console.error("Shared project modules are missing.");
      return;
    }

    const pageCore = window.ProjectPageCore.init({
      codeThemeLinkId: "prismThemeLink",
      codeThemeDarkHref: "../../assets/prism/prism-dark.css",
      codeThemeLightHref: "../../assets/prism/prism-light.css",
    });

    renderCodeCards();
    if (typeof window.applyI18n === "function") {
      window.applyI18n(pageCore.getLang()).catch((error) => {
        console.warn("[i18n] Failed to apply CollegeTour translations.", error);
      });
    }
    loadCodeBlocks();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
