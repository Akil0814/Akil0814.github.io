(function () {
  const pillarEntries = [
    {
      eyebrowKey: "ElysiaEngine.pillars.rendering.eyebrow",
      eyebrowFallback: "Renderer",
      titleKey: "ElysiaEngine.pillars.rendering.title",
      titleFallback: "Understand the pipeline, don't hide it",
      bodyKey: "ElysiaEngine.pillars.rendering.body",
      bodyFallback: "The renderer should stay readable enough that each stage can be studied, profiled, and replaced without losing the mental model.",
    },
    {
      eyebrowKey: "ElysiaEngine.pillars.tools.eyebrow",
      eyebrowFallback: "Tools",
      titleKey: "ElysiaEngine.pillars.tools.title",
      titleFallback: "Build debugging into the engine early",
      bodyKey: "ElysiaEngine.pillars.tools.body",
      bodyFallback: "Debug overlays, scene inspection, and frame stats should be part of the engine shell instead of late add-ons.",
    },
    {
      eyebrowKey: "ElysiaEngine.pillars.structure.eyebrow",
      eyebrowFallback: "Structure",
      titleKey: "ElysiaEngine.pillars.structure.title",
      titleFallback: "Prefer clean seams over premature scale",
      bodyKey: "ElysiaEngine.pillars.structure.body",
      bodyFallback: "The first versions should stay small, but the subsystems need enough separation to avoid redoing the whole project later.",
    },
    {
      eyebrowKey: "ElysiaEngine.pillars.identity.eyebrow",
      eyebrowFallback: "Identity",
      titleKey: "ElysiaEngine.pillars.identity.title",
      titleFallback: "Give the project a voice, not just features",
      bodyKey: "ElysiaEngine.pillars.identity.body",
      bodyFallback: "This page is meant to frame the engine as a signature project with its own visual language, goals, and documentation flow.",
    },
  ];

  const moduleEntries = [
    {
      tagKey: "ElysiaEngine.modules.renderer.tag",
      tagFallback: "Module",
      titleKey: "ElysiaEngine.modules.renderer.title",
      titleFallback: "Renderer Core",
      bodyKey: "ElysiaEngine.modules.renderer.body",
      bodyFallback: "A dedicated page for frame flow, render passes, materials, and future backend work.",
      href: "./renderer.html",
    },
    {
      tagKey: "ElysiaEngine.modules.scene.tag",
      tagFallback: "Module",
      titleKey: "ElysiaEngine.modules.scene.title",
      titleFallback: "Scene System",
      bodyKey: "ElysiaEngine.modules.scene.body",
      bodyFallback: "A dedicated page for transforms, object ownership, scene graph direction, and runtime-to-render bridging.",
      href: "./scene-system.html",
    },
    {
      tagKey: "ElysiaEngine.modules.tooling.tag",
      tagFallback: "Module",
      titleKey: "ElysiaEngine.modules.tooling.title",
      titleFallback: "Tooling",
      bodyKey: "ElysiaEngine.modules.tooling.body",
      bodyFallback: "A dedicated page for debug panels, live controls, inspectors, and developer experience.",
      href: "./tooling.html",
    },
    {
      tagKey: "ElysiaEngine.modules.roadmap.tag",
      tagFallback: "Module",
      titleKey: "ElysiaEngine.modules.roadmap.title",
      titleFallback: "Roadmap",
      bodyKey: "ElysiaEngine.modules.roadmap.body",
      bodyFallback: "A dedicated page for milestone planning, sequencing, risks, and representative-project framing.",
      href: "./roadmap.html",
    },
  ];

  const systemEntries = [
    {
      stageKey: "ElysiaEngine.systems.app.stage",
      stageFallback: "Foundation",
      titleKey: "ElysiaEngine.systems.app.title",
      titleFallback: "App / Platform Layer",
      bodyKey: "ElysiaEngine.systems.app.body",
      bodyFallback: "Window creation, input routing, frame pacing, and the bootstrap path that keeps the engine launch flow predictable.",
      tags: ["Loop", "Input", "Bootstrap"],
    },
    {
      stageKey: "ElysiaEngine.systems.renderer.stage",
      stageFallback: "Graphics",
      titleKey: "ElysiaEngine.systems.renderer.title",
      titleFallback: "Renderer Core",
      bodyKey: "ElysiaEngine.systems.renderer.body",
      bodyFallback: "A focused rendering shell for command submission, camera data, render passes, materials, and future backend experiments.",
      tags: ["Passes", "Materials", "Cameras"],
    },
    {
      stageKey: "ElysiaEngine.systems.scene.stage",
      stageFallback: "Runtime",
      titleKey: "ElysiaEngine.systems.scene.title",
      titleFallback: "Scene / Entity Flow",
      bodyKey: "ElysiaEngine.systems.scene.body",
      bodyFallback: "A light scene structure for transforms, object ownership, and the path between gameplay objects and renderer data.",
      tags: ["Transforms", "Ownership", "Submission"],
    },
    {
      stageKey: "ElysiaEngine.systems.tooling.stage",
      stageFallback: "Editor",
      titleKey: "ElysiaEngine.systems.tooling.title",
      titleFallback: "Tooling / Diagnostics",
      bodyKey: "ElysiaEngine.systems.tooling.body",
      bodyFallback: "Debug panels, live tuning, and future asset inspection pages that make iteration smoother while the engine is still changing rapidly.",
      tags: ["ImGui", "Stats", "Inspectors"],
    },
  ];

  const noteEntries = [
    {
      tagKey: "ElysiaEngine.notes.renderer.tag",
      tagFallback: "Reserved",
      titleKey: "ElysiaEngine.notes.renderer.title",
      titleFallback: "Renderer bootstrap note",
      bodyKey: "ElysiaEngine.notes.renderer.body",
      bodyFallback: "This slot is reserved for the first write-up covering initialization flow, ownership boundaries, and frame startup.",
      meta: ["Init", "Ownership"],
    },
    {
      tagKey: "ElysiaEngine.notes.assets.tag",
      tagFallback: "Reserved",
      titleKey: "ElysiaEngine.notes.assets.title",
      titleFallback: "Asset path note",
      bodyKey: "ElysiaEngine.notes.assets.body",
      bodyFallback: "This slot can document how models, textures, and future materials move through the engine without creating fragile dependencies.",
      meta: ["Assets", "Pipeline"],
    },
    {
      tagKey: "ElysiaEngine.notes.debug.tag",
      tagFallback: "Reserved",
      titleKey: "ElysiaEngine.notes.debug.title",
      titleFallback: "Debug surface note",
      bodyKey: "ElysiaEngine.notes.debug.body",
      bodyFallback: "This slot can explain debug overlays, live tuning controls, and how the engine exposes information while still being built.",
      meta: ["ImGui", "UX"],
    },
  ];

  function t(key, fallbackText) {
    if (window.I18N && typeof window.I18N.t === "function") {
      return window.I18N.t(key, undefined, fallbackText);
    }
    return fallbackText || key;
  }

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (typeof text === "string") element.textContent = text;
    return element;
  }

  function renderPillars() {
    const pillarGrid = document.getElementById("pillarGrid");
    if (!pillarGrid) return;

    pillarGrid.innerHTML = "";
    for (const pillar of pillarEntries) {
      const card = createElement("article", "elysia-card");
      const eyebrow = createElement("p", "elysia-card__eyebrow", t(pillar.eyebrowKey, pillar.eyebrowFallback));
      const title = createElement("h3", "elysia-card__title", t(pillar.titleKey, pillar.titleFallback));
      const body = createElement("p", "elysia-card__body", t(pillar.bodyKey, pillar.bodyFallback));

      card.appendChild(eyebrow);
      card.appendChild(title);
      card.appendChild(body);
      pillarGrid.appendChild(card);
    }
  }

  function renderModules() {
    const moduleGrid = document.getElementById("moduleGrid");
    if (!moduleGrid) return;

    moduleGrid.innerHTML = "";
    for (const moduleEntry of moduleEntries) {
      const card = createElement("article", "elysia-note-card");
      const tag = createElement("p", "elysia-note-card__tag", t(moduleEntry.tagKey, moduleEntry.tagFallback));
      const title = createElement("h3", "", t(moduleEntry.titleKey, moduleEntry.titleFallback));
      const body = createElement("p", "", t(moduleEntry.bodyKey, moduleEntry.bodyFallback));
      const link = createElement("a", "elysia-note-card__link", t("common.actions.more_info", "More information"));

      link.href = moduleEntry.href;
      card.appendChild(tag);
      card.appendChild(title);
      card.appendChild(body);
      card.appendChild(link);
      moduleGrid.appendChild(card);
    }
  }

  function renderSystems() {
    const systemGrid = document.getElementById("systemGrid");
    if (!systemGrid) return;

    systemGrid.innerHTML = "";
    for (const system of systemEntries) {
      const card = createElement("article", "elysia-system-card");
      const stage = createElement("p", "elysia-system-card__stage", t(system.stageKey, system.stageFallback));
      const title = createElement("h3", "", t(system.titleKey, system.titleFallback));
      const body = createElement("p", "", t(system.bodyKey, system.bodyFallback));
      const tags = createElement("div", "elysia-system-card__tags");

      for (const tagText of system.tags) {
        tags.appendChild(createElement("span", "elysia-inline-tag", tagText));
      }

      card.appendChild(stage);
      card.appendChild(title);
      card.appendChild(body);
      card.appendChild(tags);
      systemGrid.appendChild(card);
    }
  }

  function renderNotes() {
    const notesGrid = document.getElementById("notesGrid");
    if (!notesGrid) return;

    notesGrid.innerHTML = "";
    for (const note of noteEntries) {
      const card = createElement("article", "elysia-note-card");
      const tag = createElement("p", "elysia-note-card__tag", t(note.tagKey, note.tagFallback));
      const title = createElement("h3", "", t(note.titleKey, note.titleFallback));
      const body = createElement("p", "", t(note.bodyKey, note.bodyFallback));
      const meta = createElement("div", "elysia-note-card__meta");

      for (const item of note.meta) {
        meta.appendChild(createElement("span", "elysia-inline-tag", item));
      }

      card.appendChild(tag);
      card.appendChild(title);
      card.appendChild(body);
      card.appendChild(meta);
      notesGrid.appendChild(card);
    }
  }

  function renderAll() {
    renderPillars();
    renderModules();
    renderSystems();
    renderNotes();
  }

  function init() {
    if (!window.ElysiaBase) {
      console.error("ElysiaBase module is missing.");
      return;
    }

    const pageCore = window.ElysiaBase.init({
      fixedTheme: "light",
      onLangChange(language) {
        if (typeof window.applyI18n !== "function") {
          renderAll();
          return;
        }

        window.applyI18n(language)
          .then(renderAll)
          .catch((error) => {
            console.warn("[i18n] Failed to apply Elysia Engine translations.", error);
            renderAll();
          });
      },
    });

    if (typeof window.applyI18n === "function") {
      window.applyI18n(pageCore.getLang())
        .then(renderAll)
        .catch((error) => {
          console.warn("[i18n] Failed to initialize Elysia Engine translations.", error);
          renderAll();
        });
      return;
    }

    renderAll();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
