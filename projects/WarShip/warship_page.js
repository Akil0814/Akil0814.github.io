(function () {
  const codeEntries = [
    "WarShip_main_loop.cpp",
    "WarShip_scene_pool.cpp",
    "WarShip_Board.cpp",
    "WarShip_ship.cpp",
    "WarShip_ship_factory.cpp",
    "WarShip_Button.cpp",
    "WarShip_bullet.cpp",
    "WarShip_effect.cpp",
    "WarShip_effect_manager.cpp",
    "WarShip_animation.cpp",
    "WarShip_atlas.cpp",
    "WarShip_resources_manager.cpp",
    "WarShip_Txt_to_Texture.cpp",
  ].map((fileName, index) => ({
    fileName,
    targetSelector: `#code-slot-${index + 1}`,
    cardId: `code-card-${index + 1}`,
    title: fileName,
    summary: buildCodeSummary(fileName),
    filePath: `../snippets/WarShip/${fileName}`,
    sourceUrl: `https://github.com/Akil0814/WarShips/blob/main/projects/snippets/WarShip/${fileName}`,
  }));

  const codeEntryByFileName = new Map(codeEntries.map((entry) => [entry.fileName, entry]));

  const videoEntries = [
    {
      fileName: "WarShip_start_shoping.webm",
      title: "Start Shopping",
      description: "Shows pre-battle shop flow and preparation phase.",
      relatedCodeFiles: [
        "WarShip_Button.cpp",
        "WarShip_resources_manager.cpp",
        "WarShip_Txt_to_Texture.cpp",
      ],
    },
    {
      fileName: "WarShip_place_ship.webm",
      title: "Ship Placement",
      description: "Shows ship deployment rules and board placement interactions.",
      relatedCodeFiles: [
        "WarShip_Board.cpp",
        "WarShip_ship.cpp",
        "WarShip_ship_factory.cpp",
      ],
    },
    {
      fileName: "WarShip_attak.webm",
      title: "Attack Action",
      description: "Shows core attack execution and battle feedback.",
      relatedCodeFiles: [
        "WarShip_main_loop.cpp",
        "WarShip_Board.cpp",
        "WarShip_bullet.cpp",
      ],
    },
    {
      fileName: "WarShip_skill_detect_and_focu_fire.webm",
      title: "Detect + Focus Fire",
      description: "Shows detection and focused-fire skill combo behavior.",
      relatedCodeFiles: [
        "WarShip_effect.cpp",
        "WarShip_effect_manager.cpp",
        "WarShip_animation.cpp",
      ],
    },
    {
      fileName: "WarShip_skill_repear.webm",
      title: "Repair Skill",
      description: "Shows repair effect and ship state recovery flow.",
      relatedCodeFiles: [
        "WarShip_effect.cpp",
        "WarShip_effect_manager.cpp",
        "WarShip_ship.cpp",
      ],
    },
  ];

  function buildCodeSummary(fileName) {
    const key = fileName.toLowerCase();
    if (key.includes("main_loop")) return "Defines the main game loop and frame update sequence.";
    if (key.includes("scene_pool")) return "Manages scene lifecycle, registration, and switching.";
    if (key.includes("board")) return "Handles board state, grid logic, and hit/miss evaluation.";
    if (key.includes("ship_factory")) return "Builds ship instances and applies configuration presets.";
    if (key.includes("ship")) return "Defines ship data model and runtime behavior.";
    if (key.includes("effect_manager")) return "Coordinates effect scheduling and render timing.";
    if (key.includes("effect")) return "Implements visual and gameplay effects.";
    if (key.includes("button")) return "Implements button interaction and UI event handling.";
    if (key.includes("bullet")) return "Handles projectile movement and collision resolution.";
    if (key.includes("animation")) return "Controls animation state, timing, and transitions.";
    if (key.includes("atlas")) return "Manages texture atlas lookup and sprite regions.";
    if (key.includes("resources_manager")) return "Loads and caches game resources.";
    if (key.includes("txt_to_texture")) return "Builds text textures for runtime UI rendering.";
    return "Core WarShip module implementation.";
  }

  function buildCodeTagLabel(fileName) {
    const raw = fileName
      .replace(/^WarShip_/i, "")
      .replace(/\.cpp$/i, "")
      .replaceAll("_", " ");

    return raw
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  }

  function focusCodeCard(cardId) {
    const targetCard = document.getElementById(cardId);
    if (!targetCard) return;

    targetCard.classList.remove("is-targeted");
    void targetCard.offsetWidth;
    targetCard.classList.add("is-targeted");
    targetCard.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => {
      targetCard.classList.remove("is-targeted");
    }, 1400);
  }

  function createRelatedCodeTags(relatedCodeFiles) {
    const tagList = document.createElement("div");
    tagList.className = "video-tags";

    for (const fileName of relatedCodeFiles) {
      const codeEntry = codeEntryByFileName.get(fileName);
      if (!codeEntry) continue;

      const tagButton = document.createElement("button");
      tagButton.type = "button";
      tagButton.className = "video-tag";
      tagButton.textContent = buildCodeTagLabel(fileName);
      tagButton.addEventListener("click", () => {
        focusCodeCard(codeEntry.cardId);
      });
      tagList.appendChild(tagButton);
    }

    return tagList;
  }

  function renderVideos() {
    const videoGrid = document.getElementById("videoGrid");
    const videoCount = document.getElementById("videoCount");
    if (!videoGrid) return;

    videoGrid.innerHTML = "";
    for (const video of videoEntries) {
      const card = document.createElement("article");
      card.className = "video-card";

      const title = document.createElement("h3");
      title.textContent = video.title;

      const player = document.createElement("video");
      player.controls = true;
      player.preload = "metadata";
      player.playsInline = true;
      player.src = `./res/${video.fileName}`;

      const description = document.createElement("p");
      description.textContent = video.description;

      const tags = createRelatedCodeTags(video.relatedCodeFiles);

      card.appendChild(title);
      card.appendChild(player);
      card.appendChild(description);
      if (tags.childElementCount > 0) {
        card.appendChild(tags);
      }

      videoGrid.appendChild(card);
    }

    if (videoCount) {
      videoCount.textContent = String(videoEntries.length);
    }
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
      description.textContent = entry.summary;

      const slot = document.createElement("div");
      slot.id = entry.targetSelector.replace("#", "");
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
          title: entry.title,
          showLineNumbers: true,
          copyButton: true,
          sourceUrl: entry.sourceUrl,
          visibleLines: 18,
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

    renderVideos();
    renderCodeCards();
    loadCodeBlocks();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
