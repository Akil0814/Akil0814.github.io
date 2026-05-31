(function () {
  let mermaidRenderer = null;

  function t(key, fallbackText, params) {
    if (window.I18N && typeof window.I18N.t === "function") {
      return window.I18N.t(key, params, fallbackText);
    }

    return typeof fallbackText === "string" ? fallbackText : key;
  }

  function getMermaidDiagrams() {
    return [
      {
        title: t("TakeMeToBallgame.mermaid.application_architecture.title", "Application Backend Module Diagram"),
        description: t(
          "TakeMeToBallgame.mermaid.application_architecture.desc",
          "Shows how Qt pages connect to the Application singleton, backend services, and project data files."
        ),
        code: `flowchart LR
  Main["main.cpp / MainWindow"] --> APP["Application Singleton"]
  UIAdmin["AdminPage / DashboardPage"] --> APP
  UITrip["TripPlanningPage / TripDetailPage"] --> APP
  UIBrowse["BrowseWindow / DetailWindow"] --> APP

  APP --> DBM["DatabaseManager"]
  APP --> SR["StadiumRepository"]
  APP --> SUR["SouvenirRepository"]
  APP --> DR["DistanceRepository"]
  APP --> AUTH["AuthService"]
  APP --> TP["TripPlanner"]

  TP --> Trip["Trip"]
  Trip --> Cart["ShoppingCart"]

  DBM --> SQLite["BaseBall_data.db"]
  DBM --> CSV["MLB Information.csv / Distance between stadiums.csv"]
  AUTH --> KEY["key.dat"]
  UITrip --> Assets["assets/images/stadiums/*.jpg"]`,
      },
    ];
  }

  function initMermaidSection(theme) {
    const targetElement = document.getElementById("takemetoballgame-mermaid");
    if (!targetElement || !window.ProjectMermaid) {
      if (!window.ProjectMermaid) {
        console.warn("ProjectMermaid module is missing.");
      }
      return;
    }

    mermaidRenderer = window.ProjectMermaid.mount(targetElement, {
      diagrams: getMermaidDiagrams(),
      theme,
      idPrefix: "takemetoballgame-mermaid",
      mermaidConfig: {
        flowchart: {
          curve: "basis",
        },
      },
    });
  }

  function init() {
    if (!window.ProjectPageCore) {
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
      onLangChange(language) {
        if (!mermaidRenderer || typeof window.applyI18n !== "function") return;

        window.applyI18n(language)
          .then(() => {
            mermaidRenderer.setDiagrams(getMermaidDiagrams());
          })
          .catch((error) => {
            console.warn("[i18n] Failed to refresh TakeMeToBallgame Mermaid translations.", error);
          });
      },
    });

    const codeCount = document.getElementById("codeCount");
    if (codeCount) {
      codeCount.textContent = "0";
    }

    initMermaidSection(pageCore.getTheme());

    if (typeof window.applyI18n === "function") {
      window.applyI18n(pageCore.getLang())
        .then(() => {
          if (mermaidRenderer) {
            mermaidRenderer.setDiagrams(getMermaidDiagrams());
          }
        })
        .catch((error) => {
          console.warn("[i18n] Failed to apply TakeMeToBallgame translations.", error);
        });
    }
  }

  window.addEventListener("DOMContentLoaded", init);
})();
