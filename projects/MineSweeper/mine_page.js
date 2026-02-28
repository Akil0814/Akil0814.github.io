(function () {
  const codeBlockEntries = [
    {
      targetSelector: "#code-main-loop",
      cardId: "code-card-main-loop",
      filePath: "../snippets/MineSweepr/MineSweeper_main_lop.cpp",
      title: "MineSweeper_main_lop.cpp",
      sourceUrl: "https://github.com/Akil0814/College_Tour/blob/main/projects/snippets/MineSweepr/MineSweeper_main_lop.cpp",
    },
    {
      targetSelector: "#code-scene-class",
      cardId: "code-card-scene-class",
      filePath: "../snippets/MineSweepr/MineSweeper_scene_class.cpp",
      title: "MineSweeper_scene_class.cpp",
      sourceUrl: "https://github.com/Akil0814/College_Tour/blob/main/projects/snippets/MineSweepr/MineSweeper_scene_class.cpp",
    },
    {
      targetSelector: "#code-scene-manager",
      cardId: "code-card-scene-manager",
      filePath: "../snippets/MineSweepr/MineSweeper_scene_manager.cpp",
      title: "MineSweeper_scene_manager.cpp",
      sourceUrl: "https://github.com/Akil0814/College_Tour/blob/main/projects/snippets/MineSweepr/MineSweeper_scene_manager.cpp",
    },
    {
      targetSelector: "#code-board",
      cardId: "code-card-board",
      filePath: "../snippets/MineSweepr/MineSweeper_board.cpp",
      title: "MineSweeper_board.cpp",
      sourceUrl: "https://github.com/Akil0814/College_Tour/blob/main/projects/snippets/MineSweepr/MineSweeper_board.cpp",
    },
  ];

  const relatedCodeByVideoIndex = [
    ["#code-main-loop", "#code-scene-manager"],
    ["#code-main-loop", "#code-scene-class"],
    ["#code-board", "#code-scene-class"],
    ["#code-board", "#code-scene-manager"],
  ];

  const codeEntryBySelector = new Map(codeBlockEntries.map((entry) => [entry.targetSelector, entry]));

  function buildTagLabel(selector) {
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
        messageElement.textContent = `Failed to load code: ${entry.filePath}`;
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

    window.ProjectPageCore.init({
      codeThemeLinkId: "prismThemeLink",
      codeThemeDarkHref: "../../assets/prism/prism-dark.css",
      codeThemeLightHref: "../../assets/prism/prism-light.css",
    });

    assignCodeCardIds();
    renderVideoCodeTags();
    loadCodeBlocks();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
