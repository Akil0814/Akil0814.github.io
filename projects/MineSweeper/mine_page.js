(function () {
  function t(key, fallbackText, params) {
    if (window.I18N && typeof window.I18N.t === "function") {
      return window.I18N.t(key, params, fallbackText);
    }

    if (typeof fallbackText === "string") return fallbackText;
    return key;
  }

  const codeBlockEntries = [
    {
      targetSelector: "#code-main-loop",
      cardId: "code-card-main-loop",
      filePath: "../snippets/MineSweeper/main_loop.cpp",
      title: "MineSweeper_main_loop.cpp",
      sourceUrl: "https://github.com/Akil0814/Minesweeper/blob/master/main.cpp",
    },
    {
      targetSelector: "#code-scene-class",  
      cardId: "code-card-scene-class",
      filePath: "../snippets/MineSweeper/scene_class.cpp",
      title: "MineSweeper_scene_class.cpp",
      sourceUrl: "https://github.com/Akil0814/Minesweeper/blob/master/scene.h",
    },
    {
      targetSelector: "#code-scene-manager",
      cardId: "code-card-scene-manager",
      filePath: "../snippets/MineSweeper/scene_manager.cpp",
      title: "MineSweeper_scene_manager.cpp",
      sourceUrl: "https://github.com/Akil0814/Minesweeper/blob/master/scene_manager.h",
    },
    {
      targetSelector: "#code-board",
      cardId: "code-card-board",
      filePath: "../snippets/MineSweeper/board.cpp",
      title: "MineSweeper_board.cpp",
      sourceUrl: "https://github.com/Akil0814/Minesweeper/blob/master/button.h",
    },
  ];

  const relatedCodeByVideoIndex = [
    ["#code-main-loop", "#code-scene-manager"],
    ["#code-main-loop", "#code-scene-class"],
    ["#code-board", "#code-scene-class"],
    ["#code-board", "#code-scene-manager"],
  ];

  const codeEntryBySelector = new Map(codeBlockEntries.map((entry) => [entry.targetSelector, entry]));
  const videoTagKeyBySelector = {
    "#code-main-loop": "MineSweeper.video_tags.main_loop",
    "#code-scene-class": "MineSweeper.video_tags.scene_class",
    "#code-scene-manager": "MineSweeper.video_tags.scene_manager",
    "#code-board": "MineSweeper.video_tags.board",
  };
  let mermaidRenderer = null;

  function getMermaidDiagrams() {
    return [
      {
        title: t("MineSweeper.mermaid.scene_lifecycle.title", "Scene Lifecycle"),
        description: t(
          "MineSweeper.mermaid.scene_lifecycle.desc",
          "Main loop and scene manager collaboration during runtime."
        ),
        code: `stateDiagram-v2
  [*] --> Menu
  Menu --> Game: Start
  Menu --> Selector: Setting
  Selector --> Menu: Back
  Game --> Menu: Exit
  Game --> Game: Restart`,
      },
      {
        title: t("MineSweeper.mermaid.cell_reveal_pipeline.title", "Cell Reveal Pipeline"),
        description: t(
          "MineSweeper.mermaid.cell_reveal_pipeline.desc",
          "How click input drives reveal, expansion, and game-over checks."
        ),
        code: `flowchart TD
  A[Start] --> B[MenuScene]
  B -->|Start| C[GameScene]
  B -->|Setting| D[SelectorScene]
  D -->|Select preset / Custom| B

  C --> E{First left click?}
  E -->|Yes| F[set_mine]
  F --> G[Start timer]
  E -->|No| H[check_mine]

  H --> I{Cell number=0?}
  I -->|Yes| J[check_around]
  I -->|No| K[Reveal only this cell]

  C -->|Right click| L[set_flag - toggle flag state]
  C -->|Restart| M[reset board data]
  C -->|Exit| B
  `,
      },
    ];
  }

  function buildTagLabel(selector) {
    const labelKey = videoTagKeyBySelector[selector];
    if (labelKey) {
      return t(labelKey, "Code");
    }

    const entry = codeEntryBySelector.get(selector);
    if (!entry) return "Code";

    return entry.title
      .replace(/^MineSweeper_/i, "")
      .replace(/\.cpp$/i, "")
      .replaceAll("_", " ")
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  }

  function focusCodeCard(cardId) {
    const cardElement = document.getElementById(cardId);
    if (!cardElement) return;

    cardElement.classList.remove("is-targeted");
    void cardElement.offsetWidth;
    cardElement.classList.add("is-targeted");
    cardElement.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => {
      cardElement.classList.remove("is-targeted");
    }, 1400);
  }

  function assignCodeCardIds() {
    for (const entry of codeBlockEntries) {
      const slotElement = document.querySelector(entry.targetSelector);
      const cardElement = slotElement?.closest(".code-card");
      if (cardElement) {
        cardElement.id = entry.cardId;
      }
    }
  }

  function renderVideoCodeTags() {
    const videoCards = Array.from(document.querySelectorAll("#videos .video-card"));
    if (videoCards.length === 0) return;

    videoCards.forEach((card, index) => {
      const relatedSelectors = relatedCodeByVideoIndex[index] || [];
      if (relatedSelectors.length === 0) return;

      const tagRow = document.createElement("div");
      tagRow.className = "video-tags";

      for (const selector of relatedSelectors) {
        const entry = codeEntryBySelector.get(selector);
        if (!entry) continue;

        const tagButton = document.createElement("button");
        tagButton.type = "button";
        tagButton.className = "video-tag";
        const labelKey = videoTagKeyBySelector[selector];
        if (labelKey) {
          tagButton.setAttribute("data-i18n", labelKey);
        }
        tagButton.textContent = buildTagLabel(selector);
        tagButton.addEventListener("click", () => {
          focusCodeCard(entry.cardId);
        });
        tagRow.appendChild(tagButton);
      }

      if (tagRow.childElementCount > 0) {
        card.appendChild(tagRow);
      }
    });
  }

  async function loadCodeBlocks() {
    for (const entry of codeBlockEntries) {
      try {
        await window.ProjectCodeBlock.renderCppFile(entry.targetSelector, entry.filePath, {
          title: entry.title,
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
    const targetElement = document.getElementById("mine-mermaid");
    if (!targetElement || !window.ProjectMermaid) {
      if (!window.ProjectMermaid) {
        console.warn("ProjectMermaid module is missing.");
      }
      return;
    }

    mermaidRenderer = window.ProjectMermaid.mount(targetElement, {
      diagrams: getMermaidDiagrams(),
      theme: initialTheme,
      idPrefix: "mine-mermaid",
      mermaidConfig: {
        flowchart: {
          curve: "basis",
        },
      },
    });
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
      onThemeChange(theme) {
        if (mermaidRenderer) {
          mermaidRenderer.setTheme(theme);
        }
      },
      onLangChange(language) {
        if (!mermaidRenderer) return;

        if (typeof window.applyI18n === "function") {
          window.applyI18n(language)
            .then(() => {
              mermaidRenderer.setDiagrams(getMermaidDiagrams());
            })
            .catch((error) => {
              console.warn("[i18n] Failed to refresh Mermaid translations.", error);
            });
          return;
        }

        mermaidRenderer.setDiagrams(getMermaidDiagrams());
      },
    });

    assignCodeCardIds();
    renderVideoCodeTags();
    initMermaidSection(pageCore.getTheme());
    if (typeof window.applyI18n === "function") {
      window.applyI18n(pageCore.getLang()).catch((error) => {
        console.warn("[i18n] Failed to apply MineSweeper translations.", error);
      }).finally(() => {
        if (mermaidRenderer) {
          mermaidRenderer.setDiagrams(getMermaidDiagrams());
        }
      });
    }
    loadCodeBlocks();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
