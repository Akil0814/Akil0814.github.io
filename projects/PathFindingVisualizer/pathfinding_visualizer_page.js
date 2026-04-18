(function () {
  const codeEntries = [
    {
      fileName: "simulation_controller_step_history.cpp",
      summaryKey: "PathFindingVisualizer.code.simulation_controller_step_history.desc",
      summaryFallback: "SimulationController coordinates auto-run, single-step execution, history snapshots, undo, and final statistics.",
    },
    {
      fileName: "pathfinder_shared_helpers.cpp",
      summaryKey: "PathFindingVisualizer.code.pathfinder_shared_helpers.desc",
      summaryFallback: "Pathfinder centralizes shared board access, movement cost, heuristic cost, tile-state markers, and final path rebuild logic.",
    },
    {
      fileName: "a_star_visual_step.cpp",
      summaryKey: "PathFindingVisualizer.code.a_star_visual_step.desc",
      summaryFallback: "A* advances one visual step at a time, updating best cost, parent links, tile status, and the priority queue.",
    },
    {
      fileName: "board_neighbors_and_cost.cpp",
      summaryKey: "PathFindingVisualizer.code.board_neighbors_and_cost.desc",
      summaryFallback: "Board owns neighbor filtering, diagonal policy, weighted movement cost, and final path statistics.",
    },
  ].map((entry, index) => ({
    ...entry,
    targetSelector: `#code-slot-${index + 1}`,
    cardId: `code-card-${index + 1}`,
    filePath: `../snippets/PathFindingVisualizer/${entry.fileName}`,
  }));

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
        title: t("PathFindingVisualizer.mermaid.module_architecture.title", "模块架构图"),
        description: t(
          "PathFindingVisualizer.mermaid.module_architecture.desc",
          "展示 Application、SimulationController、Pathfinder、Board 与 Tile 的职责边界。"
        ),
        code: `flowchart LR
  UI[ButtonManager / Dev Options] --> App[Application]
  App --> Controller[SimulationController]
  Controller --> Pathfinder[Pathfinder Interface]
  Pathfinder --> AStar[A*]
  Pathfinder --> Dijkstra[Dijkstra]
  Pathfinder --> BFS[BFS]
  Pathfinder --> Greedy[Greedy]
  Controller --> Board[Board]
  Pathfinder --> Board
  Board --> Tile[Tile Grid]
  Tile --> Visual[Open / Current / Closed / Path]
  App --> Board
  App --> Status[Status Titles / Error Message]`,
      },
      {
        title: t("PathFindingVisualizer.mermaid.step_sequence.title", "单步执行与回退时序"),
        description: t(
          "PathFindingVisualizer.mermaid.step_sequence.desc",
          "展示 Next Step / Auto Run 如何保存快照、推进算法、更新统计，并支持 Prev Step。"
        ),
        code: `sequenceDiagram
  participant User as User Input
  participant App as Application
  participant Ctrl as SimulationController
  participant Board as Board
  participant Finder as Pathfinder

  User->>App: Next Step / Auto Run
  App->>Ctrl: next_step()
  Ctrl->>Ctrl: save_history_state()
  Ctrl->>Board: save_snapshot()
  Ctrl->>Finder: next_step()
  Finder->>Board: update parent / costs / tile status
  Ctrl->>Finder: is_finished()
  alt finished
    Ctrl->>Board: path_cost() / path_steps()
    Ctrl->>Ctrl: stop auto run
  else still searching
    Ctrl-->>App: wait for next tick/input
  end
  User->>App: Prev Step
  App->>Ctrl: previous_step()
  Ctrl->>Board: undo()
  Ctrl->>Ctrl: restore cloned Pathfinder`,
      },
      {
        title: t("PathFindingVisualizer.mermaid.search_data_flow.title", "搜索数据流"),
        description: t(
          "PathFindingVisualizer.mermaid.search_data_flow.desc",
          "展示一次可视化搜索步骤中起终点、邻居、代价、parent 链和最终路径之间的数据流。"
        ),
        code: `flowchart TD
  A[Read Start / Goal] --> B[Pop Frontier / Open Set]
  B --> C[Board.neighbors]
  C --> D[Filter Bounds / Walls / Diagonal Policy]
  D --> E[Compute Movement Cost + Heuristic]
  E --> F{Better Path?}
  F -- Yes --> G[Set Parent]
  G --> H[Set G / H / F]
  H --> I[Mark Open / Current / Closed]
  I --> J[Push Frontier / Open Set]
  F -- No --> K[Skip Tile]
  B --> L{Goal Reached?}
  L -- Yes --> M[Rebuild Parent Chain]
  M --> N[Mark Path + Update Cost]
  L -- No --> J`,
      },
    ];
  }

  function setStaticCounts() {
    const videoCount = document.getElementById("videoCount");
    if (videoCount) videoCount.textContent = "0";

    const codeCount = document.getElementById("codeCount");
    if (codeCount) codeCount.textContent = String(codeEntries.length);
  }

  function renderCodeCards() {
    const codeList = document.getElementById("codeList");
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
  }

  async function loadCodeBlocks() {
    if (!window.ProjectCodeBlock) return;

    for (const entry of codeEntries) {
      try {
        await window.ProjectCodeBlock.renderCppFile(entry.targetSelector, entry.filePath, {
          title: entry.fileName,
          showLineNumbers: true,
          copyButton: true,
          visibleLines: 22,
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

  function initMermaidSection(theme) {
    const targetElement = document.getElementById("pathfinding-mermaid");
    if (!targetElement || !window.ProjectMermaid) {
      if (!window.ProjectMermaid) {
        console.warn("ProjectMermaid module is missing.");
      }
      return;
    }

    mermaidRenderer = window.ProjectMermaid.mount(targetElement, {
      diagrams: getMermaidDiagrams(),
      theme,
      idPrefix: "pathfinding-mermaid",
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
              console.warn("[i18n] Failed to refresh PathFindingVisualizer Mermaid translations.", error);
            });
          return;
        }

        mermaidRenderer.setDiagrams(getMermaidDiagrams());
      },
    });

    setStaticCounts();
    renderCodeCards();
    initMermaidSection(pageCore.getTheme());

    if (typeof window.applyI18n === "function") {
      window.applyI18n(pageCore.getLang())
        .catch((error) => {
          console.warn("[i18n] Failed to apply PathFindingVisualizer translations.", error);
        })
        .finally(() => {
          if (mermaidRenderer) {
            mermaidRenderer.setDiagrams(getMermaidDiagrams());
          }
        });
    }

    loadCodeBlocks();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
