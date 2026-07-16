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
      fileName: "data_manager_class.h",
      summaryKey: "CollegeTour.code_summaries.data_manager_class",
      summaryFallback: "DataManager class contract, members, and backend-facing interfaces.",
      sourceUrl: "https://github.com/Akil0814/College_Tour/blob/main/data_manager.h",
    },
    {
      fileName: "data_manager_init.cpp",
      summaryKey: "CollegeTour.code_summaries.data_manager_init",
      summaryFallback: "Initializes core data structures and startup loading path.",
      sourceUrl: "https://github.com/Akil0814/College_Tour/blob/main/data_manager.cpp",
    },
    {
      fileName: "data_manager_read_dynamic.cpp",
      summaryKey: "CollegeTour.code_summaries.data_manager_read_dynamic",
      summaryFallback: "Reads runtime data from SQLite-backed storage and maps it into in-memory state.",
      sourceUrl: "https://github.com/Akil0814/College_Tour/blob/main/data_manager.cpp",
    },
    {
      fileName: "data_manager_reset_database.cpp",
      summaryKey: "CollegeTour.code_summaries.data_manager_reset_database",
      summaryFallback: "Resets backend data state and rebuilds required base records.",
      sourceUrl: "https://github.com/Akil0814/College_Tour/blob/main/data_manager.cpp",
    },
    {
      fileName: "login_XOR.cpp",
      summaryKey: "CollegeTour.code_summaries.login_xor",
      summaryFallback: "Administrator login verification flow and XOR-based credential processing.",
      sourceUrl: "https://github.com/Akil0814/College_Tour/blob/main/login_window.cpp",
    },
  ].map((entry, index) => ({
    ...entry,
    targetSelector: `#code-slot-${index + 1}`,
    cardId: `code-card-${index + 1}`,
    filePath: `../snippets/CollegeTour/${entry.fileName}`,
  }));
  let mermaidRenderer = null;

  function getMermaidDiagrams() {
    return [
      {
        title: t("CollegeTour.mermaid.data_manager_class.title", "Data Layer Class Diagram"),
        description: t(
          "CollegeTour.mermaid.data_manager_class.desc",
          "Shows DataManager-centered architecture and how UI windows, route planning, and SQLite interact."
        ),
        code: `classDiagram
  direction LR

  class DataManager{
    -QString connName
    -QString lastError
    +bool open_db()
    +void close_db()
    +QString last_error() const
    +bool transaction()
    +bool commit()
    +bool rollback()
    +optional<int> get_college_id(name)
    +optional<QString> get_college_name(id)
    +bool add_college(...)
    +bool remove_college(id)
    +bool adjust_souvenir_price(...)
    +vector<int> compute_route(...)
  }

  class LoginWindow{
    +onLoginClicked()
    +onAdminClicked()
  }

  class MainWindow{
    +showColleges()
    +showRoute()
    +showShopping()
  }

  class AdminWindow{
    +addCollege()
    +deleteCollege()
    +updatePrice()
    +rebuildDatabase()
  }

  class RoutePlanner{
    +vector<int> plan(...)
    +double totalDistance(...)
  }

  class SQLite{
    <<database>>
  }

  LoginWindow --> DataManager : auth/query
  MainWindow --> DataManager : read/write
  AdminWindow --> DataManager : admin CRUD
  DataManager --> SQLite : SQL/transaction
  DataManager --> RoutePlanner : provide data / invoke algorithm`,
      },
      {
        title: t("CollegeTour.mermaid.price_update_txn.title", "Price Update Transaction Sequence"),
        description: t(
          "CollegeTour.mermaid.price_update_txn.desc",
          "Shows transactional execution of souvenir price updates with commit on success and rollback on failure."
        ),
        code: `sequenceDiagram
  participant UI as Qt Widget
  participant DM as DataManager
  participant DB as SQLite

  UI->>DM: adjust_souvenir_price(...)
  DM->>DM: validate connection (isValid && isOpen)
  DM->>DB: BEGIN TRANSACTION
  DM->>DB: PREPARE + BIND + EXEC
  alt success
    DM->>DB: COMMIT
    DM-->>UI: true
  else fail
    DM->>DB: ROLLBACK
    DM->>DM: set lastError
    DM-->>UI: false
  end`,
      },
    ];
  }

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

  function initMermaidSection(initialTheme) {
    const targetElement = document.getElementById("college-mermaid");
    if (!targetElement || !window.ProjectMermaid) {
      if (!window.ProjectMermaid) {
        console.warn("ProjectMermaid module is missing.");
      }
      return;
    }

    mermaidRenderer = window.ProjectMermaid.mount(targetElement, {
      diagrams: getMermaidDiagrams(),
      theme: initialTheme,
      idPrefix: "college-mermaid",
      mermaidConfig: {
        flowchart: {
          curve: "basis",
        },
      },
    });
  }

  async function init() {
    if (!window.ProjectPageCore || !window.ProjectCodeBlock) {
      console.error("Shared project modules are missing.");
      return;
    }

    const pageCore = window.ProjectPageCore.init({
      codeThemeLinkId: "prismThemeLink",
      codeThemeDarkHref: "../../assets/prism/prism-dark.css",
      codeThemeLightHref: "../../assets/prism/prism-light.css",
      onThemeChange(theme) {
        if (mermaidRenderer) {
          mermaidRenderer.setTheme(theme);
        }
      },
      onLangChange() {
        if (mermaidRenderer) {
          mermaidRenderer.setDiagrams(getMermaidDiagrams());
        }
      },
    });

    await pageCore.setLang(pageCore.getLang());
    renderCodeCards();
    initMermaidSection(pageCore.getTheme());
    loadCodeBlocks();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
