(function () {
  const codeBlockEntries = [
    {
      targetSelector: "#code-main-loop",
      filePath: "../snippets/MineSweepr/MineSweeper_main_lop.cpp",
      title: "MineSweeper_main_lop.cpp",
      sourceUrl: "https://github.com/Akil0814/College_Tour/blob/main/projects/snippets/MineSweepr/MineSweeper_main_lop.cpp",
    },
    {
      targetSelector: "#code-scene-class",
      filePath: "../snippets/MineSweepr/MineSweeper_scene_class.cpp",
      title: "MineSweeper_scene_class.cpp",
      sourceUrl: "https://github.com/Akil0814/College_Tour/blob/main/projects/snippets/MineSweepr/MineSweeper_scene_class.cpp",
    },
    {
      targetSelector: "#code-scene-manager",
      filePath: "../snippets/MineSweepr/MineSweeper_scene_manager.cpp",
      title: "MineSweeper_scene_manager.cpp",
      sourceUrl: "https://github.com/Akil0814/College_Tour/blob/main/projects/snippets/MineSweepr/MineSweeper_scene_manager.cpp",
    },
    {
      targetSelector: "#code-board",
      filePath: "../snippets/MineSweepr/MineSweeper_board.cpp",
      title: "MineSweeper_board.cpp",
      sourceUrl: "https://github.com/Akil0814/College_Tour/blob/main/projects/snippets/MineSweepr/MineSweeper_board.cpp",
    },
  ];

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

    loadCodeBlocks();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
