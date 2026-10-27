(function () {
  const sourceBase = "https://github.com/Akil0814/FlyMe2TheMoon/blob/master/";
  const codeEntries = [
    { name: "scene_registration.cpp", source: "game/application/game_module.cpp" },
    { name: "flight_input_and_thrust.cpp", source: "game/gameplay/flight_input.h" },
    { name: "story_coroutines.cpp", source: "game/story/story_runtime.cpp" },
    { name: "progress_and_unlocks.cpp", source: "game/progress/progress.cpp" },
  ];
  let renderer;

  function t(key, fallback) {
    return window.I18N?.t(key, undefined, fallback) ?? fallback;
  }

  function diagrams() {
    return [
      {
        title: t("FlyMe2TheMoon.diagrams.modules.title", "Game modules and systems"),
        description: t("FlyMe2TheMoon.diagrams.modules.desc", "GameModule registers the scenes; FlightScene brings content, gameplay, story, presentation, and progress together on ElysiaEngine."),
        code: `flowchart TD
  Module[GameModule] --> Scenes[SceneManager]
  Scenes --> Menu[MainMenu / Selection / Settings / Achievements / Credits]
  Scenes --> Flight[FlightScene]
  Content[Level data / Lua scripts / Assets] --> Flight
  Flight --> Play[Player / Entities / Projectiles]
  Flight --> Story[story::Runtime]
  Flight --> Frontend[HUD / Dialogue / Pickup effects / Results]
  Flight --> Progress[progress::Store]
  Story -->|Host callbacks| Flight
  Play --> Engine[ElysiaEngine: Input / Physics / Rendering / Audio]
  Frontend --> Engine
  Progress --> Save[ElysiaEngine SaveService]`,
      },
      {
        title: t("FlyMe2TheMoon.diagrams.flow.title", "From level selection to saved progress"),
        description: t("FlyMe2TheMoon.diagrams.flow.desc", "Level dependencies control selection. A run loads its world and story, then a successful result updates records, achievements, and pending unlock notifications."),
        code: `flowchart TD
  Menu[Main menu] --> Select[SelectionScene]
  Store[Progress + Level dependencies] --> Select
  Select -->|FlightPayload: level| Flight[FlightScene]
  Flight --> Load[Load terrain / Entities / Lua story]
  Load --> Run[Input / Fixed-step physics / Story / HUD]
  Run --> Pause[Pause menu]
  Pause --> Run
  Pause --> Retry[Retry level]
  Retry --> Flight
  Run --> Outcome{Run outcome}
  Outcome -->|Moon reached| Clear[record_clear]
  Outcome -->|Death| Death[record_death]
  Clear --> Records[Best stars / Score / Time / Achievements / Unlocks]
  Death --> Deaths[Death count / Collected crystals]
  Records --> Save[SaveService commit]
  Deaths --> Save
  Save --> Result[Result panel]
  Result --> Retry
  Result --> Select`,
      },
    ];
  }

  async function init() {
    const core = window.ProjectPageCore.init({
      codeThemeLinkId: "prismThemeLink",
      codeThemeDarkHref: "../../assets/prism/prism-dark.css",
      codeThemeLightHref: "../../assets/prism/prism-light.css",
      onThemeChange(theme) {
        renderer?.setTheme(theme);
      },
      onLangChange() {
        renderer?.setDiagrams(diagrams());
      },
    });
    await core.setLang(core.getLang());
    renderer = window.ProjectMermaid.mount("#flymoon-mermaid", {
      diagrams: diagrams(),
      theme: core.getTheme(),
      idPrefix: "flymoon-mermaid",
    });

    await Promise.all(codeEntries.map(async (entry, index) => {
      const target = `#code-slot-${index + 1}`;
      const file = `../snippets/FlyMe2TheMoon/${entry.name}`;
      try {
        await window.ProjectCodeBlock.renderCppFile(target, file, {
          title: entry.name,
          sourceUrl: sourceBase + entry.source,
          showLineNumbers: true,
          copyButton: true,
          visibleLines: 22,
        });
      } catch (error) {
        const message = document.createElement("p");
        message.textContent = window.I18N?.t("common.misc.failed_load_code", { path: file }, `Failed to load code: ${file}`) ?? `Failed to load code: ${file}`;
        document.querySelector(target).replaceChildren(message);
        console.error(error);
      }
    }));
  }

  window.addEventListener("DOMContentLoaded", init);
})();
