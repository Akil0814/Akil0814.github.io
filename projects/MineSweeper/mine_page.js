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

  async function loadCodeBlocks() {
    for (const item of codeEntries) {
      try {
        await window.ProjectCodeBlock.renderCppFile(item.target, item.file, {
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
        msg.textContent = "Failed to load code: " + item.file;
        host.appendChild(msg);
        console.error(err);
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
      codeThemeDarkHref: "../../prism_dark.css",
      codeThemeLightHref: "../../prism_light.css",
    });
    loadCodeBlocks();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
