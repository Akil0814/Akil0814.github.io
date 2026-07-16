(function () {
  function t(key, fallbackText, params) {
    if (window.I18N && typeof window.I18N.t === "function") {
      return window.I18N.t(key, params, fallbackText);
    }

    if (typeof fallbackText === "string") return fallbackText;
    return key;
  }

  const SUMMARY_FALLBACK_BY_TOKEN = {
    main_loop: "Defines the main game loop and frame update sequence.",
    scene_pool: "Manages scene lifecycle, registration, and switching.",
    board: "Handles board state, grid logic, and hit/miss evaluation.",
    ship_factory: "Builds ship instances and applies configuration presets.",
    ship: "Defines ship data model and runtime behavior.",
    effect_manager: "Coordinates effect scheduling and render timing.",
    effect: "Implements visual and gameplay effects.",
    button: "Implements button interaction and UI event handling.",
    bullet: "Handles projectile movement and collision resolution.",
    animation: "Controls animation state, timing, and transitions.",
    atlas: "Manages texture atlas lookup and sprite regions.",
    resources_manager: "Loads and caches game resources.",
    txt_texture_manager: "Builds text textures for runtime UI rendering.",
    default: "Core WarShip module implementation.",
  };

  const TAG_FALLBACK_BY_TOKEN = {
    main_loop: "Main Loop",
    scene_pool: "Scene Pool",
    board: "Board",
    ship_factory: "Ship Factory",
    ship: "Ship",
    effect_manager: "Effect Manager",
    effect: "Effect",
    button: "Button",
    bullet: "Bullet",
    animation: "Animation",
    atlas: "Atlas",
    resources_manager: "Resources Manager",
    txt_texture_manager: "Text to Texture",
  };

  function resolveCodeToken(fileName) {
    const key = String(fileName).toLowerCase();
    if (key === "main.cpp") return "main_loop";
    if (key.includes("main_loop")) return "main_loop";
    if (key.includes("scene_pool")) return "scene_pool";
    if (key.includes("ship_factory")) return "ship_factory";
    if (key.includes("resources_manager")) return "resources_manager";
    if (key.includes("effect_manager")) return "effect_manager";
    if (key.includes("txt_texture_manager")) return "txt_texture_manager";
    if (key.includes("txt_to_texture")) return "txt_texture_manager";
    if (key.includes("board")) return "board";
    if (key.includes("bullet")) return "bullet";
    if (key.includes("button")) return "button";
    if (key.includes("animation")) return "animation";
    if (key.includes("atlas")) return "atlas";
    if (key.includes("effect")) return "effect";
    if (key.includes("ship")) return "ship";
    return "default";
  }

  function buildCodeTagFallback(fileName) {
    const raw = String(fileName)
      .replace(/^WarShip_/i, "")
      .replace(/\.cpp$/i, "")
      .replaceAll("_", " ");

    return raw
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  }

  function getCodeSummaryKey(fileName) {
    return `WarShip.code_summaries.${resolveCodeToken(fileName)}`;
  }

  function getCodeSummaryFallback(fileName) {
    const token = resolveCodeToken(fileName);
    return SUMMARY_FALLBACK_BY_TOKEN[token] || SUMMARY_FALLBACK_BY_TOKEN.default;
  }

  function getCodeTagKey(fileName) {
    const token = resolveCodeToken(fileName);
    if (token === "default") return "";
    return `WarShip.code_tags.${token}`;
  }

  function getCodeTagFallback(fileName) {
    const token = resolveCodeToken(fileName);
    return TAG_FALLBACK_BY_TOKEN[token] || buildCodeTagFallback(fileName);
  }

  const codeEntries = [
    "main.cpp",
    "scene_pool.cpp",
    "board.cpp",
    "ship.cpp",
    "ship_factory.cpp",
    "button.cpp",
    "bullet.cpp",
    "effect.cpp",
    "effect_manager.cpp",
    "animation.cpp",
    "atlas.cpp",
    "resources_manager.cpp",
    "txt_texture_manager.cpp",
  ].map((fileName, index) => ({
    fileName,
    targetSelector: `#code-slot-${index + 1}`,
    cardId: `code-card-${index + 1}`,
    title: fileName,
    summaryKey: getCodeSummaryKey(fileName),
    summaryFallback: getCodeSummaryFallback(fileName),
    tagKey: getCodeTagKey(fileName),
    tagFallback: getCodeTagFallback(fileName),
    filePath: `../snippets/WarShip/${fileName}`,
    sourceUrl: `https://github.com/Akil0814/WarShips/blob/master/${fileName}`,
  }));

  const codeEntryByFileName = new Map(codeEntries.map((entry) => [entry.fileName, entry]));
  let mermaidRenderer = null;

  const videoEntries = [
    {
      fileName: "WarShip_start_shopping.webm",
      titleKey: "WarShip.videos.start_shopping.title",
      titleFallback: "Start Shopping",
      descriptionKey: "WarShip.videos.start_shopping.desc",
      descriptionFallback: "Shows pre-battle shop flow and preparation phase.",
      relatedCodeFiles: [
        "scene_pool.cpp",
        "ship.cpp",
        "ship_factory.cpp",
        "button.cpp"
      ],
    },
    {
      fileName: "WarShip_place_ship.webm",
      titleKey: "WarShip.videos.ship_placement.title",
      titleFallback: "Ship Placement",
      descriptionKey: "WarShip.videos.ship_placement.desc",
      descriptionFallback: "Shows ship deployment rules and board placement interactions.",
      relatedCodeFiles: [
        "ship.cpp",
        "board.cpp",
      ],
    },
    {
      fileName: "WarShip_attack.webm",
      titleKey: "WarShip.videos.attack_action.title",
      titleFallback: "Attack Action",
      descriptionKey: "WarShip.videos.attack_action.desc",
      descriptionFallback: "Shows core attack execution and battle feedback.",
      relatedCodeFiles: [
        "effect.cpp",
        "effect_manager.cpp",
        "txt_texture_manager.cpp",
        "bullet.cpp",
        "board.cpp"
      ],
    },
    {
      fileName: "WarShip_skill_detect_and_focus_fire.webm",
      titleKey: "WarShip.videos.detect_focus_fire.title",
      titleFallback: "Detect + Focus Fire",
      descriptionKey: "WarShip.videos.detect_focus_fire.desc",
      descriptionFallback: "Shows detection and focused-fire skill combo behavior.",
      relatedCodeFiles: [
        "effect.cpp",
        "effect_manager.cpp",
        "animation.cpp",
        "board.cpp"
      ],
    },
    {
      fileName: "WarShip_skill_repair.webm",
      titleKey: "WarShip.videos.repair_skill.title",
      titleFallback: "Repair Skill",
      descriptionKey: "WarShip.videos.repair_skill.desc",
      descriptionFallback: "Shows repair effect and ship state recovery flow.",
      relatedCodeFiles: [
        "effect.cpp",
        "effect_manager.cpp",
        "ship.cpp",
        "board.cpp"
      ],
    },
  ];

  function getMermaidDiagrams() {
    return [
      {
        title: t("WarShip.mermaid.turn_flow.title", "State Flow"),
        description: t(
          "WarShip.mermaid.turn_flow.desc",
          "State transitions across Menu, Setup, Game, and Settlement, including key actions per state."
        ),
        code: `
        stateDiagram-v2
  [*] --> Menu

  Menu --> Setup : Start
  Setup --> Setup : Buy / Drag / Rotate
  Setup --> Setup : Next / Reset
  Setup --> Game : Start (P1 & P2 ready)

  Game --> Game : Attack / Skill / EndTurn
  Game --> Settlement : Opponent has no remaining ships

  Settlement --> Menu : Back (TODO)
  Menu --> [*] : Quit
  `,
      },
      {
        title: t("WarShip.mermaid.class_diagram.title", "Core Class Diagram"),
        description: t(
          "WarShip.mermaid.class_diagram.desc",
          "Relationships among managers, scenes, players, board/tile, ships, bullets, and effects."
        ),
        code: `
classDiagram
  class Manager~T~{
    +static T* instance()
  }

  class GameManager{
    -SDL_Window* window
    -SDL_Renderer* renderer
    -bool is_quit
    +int run(int argc,char** argv)
    +void switch_scene(SceneType)
    +void create_player()
    +Player* get_player1()
    +Player* get_player2()
  }
  Manager~GameManager~ <|-- GameManager

  class Scene{
    +on_enter()
    +on_exit()
    +on_update(delta)
    +on_render(renderer)
    +on_input(event)
  }

  class SceneManager{
    -Scene* current_scene
    +set_current_scene(Scene*)
    +switch_to(Scene*)
  }
  Manager~SceneManager~ <|-- SceneManager
  SceneManager o--> Scene

  class ScenePool{
    -Scene* menu_scene
    -Scene* setup_scene
    -Scene* game_scene
    -Scene* settlement_scene
    +get_scene(SceneType) Scene*
  }
  ScenePool o--> Scene

  class Player{
    -int coin_have
    -vector~Ship*~ ship_list
    -Board board
    +get_atk_time() int
    +get_skill_time(SkillType) int
    +have_remaining_ship() bool
  }
  GameManager o--> Player

  class Board{
    -TileBoard board
    -SkillType skill_using
    +place_ship(Ship*,pos,size,horizontal) SDL_Point
    +detect_board(SkillType,center)
  }
  Player *-- Board
  Board *-- Tile

  class Tile{
    -Status status
    -Ship* ship_on_tile
    +take_hit()
    +change_status(Status)
  }
  Tile o--> Ship

  class Ship{
    -int hp
    -int defense_time
    -int atk_time
    -SkillType skill
    -int skill_time
    +take_damage()
    +reinforce()
  }
  Ship <|-- Battleship
  Ship <|-- AircraftCarrier
  Ship <|-- Submarine
  Ship <|-- RepairShip

  class BulletManager{
    -vector~unique_ptr~Bullet~~ bullet_list
    +fire(end,board,index,skill)
  }
  Manager~BulletManager~ <|-- BulletManager
  BulletManager o--> Bullet
  Bullet o--> Board

  class EffectManager{
    -EffectPool effect_pool
    -EffectOnPlay effect_on_play
    +show_effect(id,rect,angle,callback)
  }
  Manager~EffectManager~ <|-- EffectManager
  EffectManager o--> Effect
  Effect <|-- Animation
  `,
      },
      {
        title: t("WarShip.mermaid.attack_commit.title", "Attack Commit Sequence"),
        description: t(
          "WarShip.mermaid.attack_commit.desc",
          "Sequence from bullet firing to effect playback and final board/tile state updates."
        ),
        code: `
sequenceDiagram
  participant UI as GameScene/Board
  participant BL as Bullet
  participant EM as EffectManager
  participant BD as Board
  participant TL as Tile

  UI->>BL: fire bullet (set effect_board/effect_index/end_pos)
  loop Every frame
    BL->>BL: on_update(delta) move bullet
  end
  BL->>BL: on_arrive()

  alt Hit ship and tile not Sink
    BL->>EM: show_effect(Explosion1, rect, callback)
    EM-->>BD: callback()
    BD->>TL: take_hit()
    opt Tile is Defend
      BL->>EM: show_effect(Shield, rect, no-op)
    end
  else Empty tile (no ship)
    BL->>EM: show_effect(WaterSplash, rect, callback)
    EM-->>BD: callback()
    BD->>TL: change_status(Miss)
  else Tile already Sink
    BL->>EM: show_effect(WaterSplash, rect, no-op)
  end
  `,
      },
    ];
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
      if (codeEntry.tagKey) {
        tagButton.setAttribute("data-i18n", codeEntry.tagKey);
      }
      tagButton.textContent = t(codeEntry.tagKey, codeEntry.tagFallback);
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
      title.setAttribute("data-i18n", video.titleKey);
      title.textContent = t(video.titleKey, video.titleFallback);

      const player = document.createElement("video");
      player.controls = true;
      player.preload = "metadata";
      player.playsInline = true;
      player.src = `./res/${video.fileName}`;

      const description = document.createElement("p");
      description.setAttribute("data-i18n", video.descriptionKey);
      description.textContent = t(video.descriptionKey, video.descriptionFallback);

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
      description.setAttribute("data-i18n", entry.summaryKey);
      description.textContent = t(entry.summaryKey, entry.summaryFallback);

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
    const targetElement = document.getElementById("warship-mermaid");
    if (!targetElement || !window.ProjectMermaid) {
      if (!window.ProjectMermaid) {
        console.warn("ProjectMermaid module is missing.");
      }
      return;
    }

    mermaidRenderer = window.ProjectMermaid.mount(targetElement, {
      diagrams: getMermaidDiagrams(),
      theme: initialTheme,
      idPrefix: "warship-mermaid",
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
    renderVideos();
    renderCodeCards();
    initMermaidSection(pageCore.getTheme());
    loadCodeBlocks();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
