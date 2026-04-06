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
        title: t("SoftRenderer.mermaid.pipeline.title", "Rendering Pipeline Overview"),
        description: t(
          "SoftRenderer.mermaid.pipeline.desc",
          "Shows the CPU-side rendering pipeline from model input to framebuffer output."
        ),
        code: `flowchart LR
  A[Model Vertices] --> B[Model / View / Projection]
  B --> C[Clip Space]
  C --> D[Perspective Divide]
  D --> E[Viewport Transform]
  E --> F[Triangle Setup]
  F --> G[Rasterization]
  G --> H[Depth Test]
  H --> I[Shading]
  I --> J[Framebuffer]`,
      },
      {
        title: t("SoftRenderer.mermaid.frame_loop.title", "Per-Frame Execution"),
        description: t(
          "SoftRenderer.mermaid.frame_loop.desc",
          "Highlights the update-render-present cycle used in each frame."
        ),
        code: `sequenceDiagram
  participant Main as Main Loop
  participant Scene as Scene State
  participant Renderer as SoftRenderer
  participant Buffer as Frame/Depth Buffer

  Main->>Scene: update(deltaTime)
  Main->>Renderer: beginFrame(clearColor)
  Renderer->>Buffer: clear color + depth
  Scene->>Renderer: submit meshes
  Renderer->>Renderer: transform + rasterize + shade
  Renderer->>Buffer: write visible fragments
  Main->>Renderer: present()`,
      },
    ];
  }

  function setStaticCounts() {
    const videoCount = document.getElementById("videoCount");
    if (videoCount) videoCount.textContent = "0";

    const codeCount = document.getElementById("codeCount");
    if (codeCount) codeCount.textContent = "0";
  }

  function initMermaidSection(theme) {
    const targetElement = document.getElementById("soft-renderer-mermaid");
    if (!targetElement || !window.ProjectMermaid) return;

    mermaidRenderer = window.ProjectMermaid.mount(targetElement, {
      diagrams: getMermaidDiagrams(),
      theme,
      idPrefix: "soft-renderer-mermaid",
    });
  }

  function init() {
    if (!window.ProjectPageCore) {
      console.error("ProjectPageCore module is missing.");
      return;
    }

    const pageCore = window.ProjectPageCore.init({
      codeThemeLinkId: "prismThemeLink",
      codeThemeDarkHref: "../../assets/prism/prism-dark.css",
      codeThemeLightHref: "../../assets/prism/prism-light.css",
      onThemeChange(theme) {
        if (mermaidRenderer) mermaidRenderer.setTheme(theme);
      },
      onLangChange(language) {
        if (!mermaidRenderer || typeof window.applyI18n !== "function") return;
        window.applyI18n(language)
          .then(() => mermaidRenderer.setDiagrams(getMermaidDiagrams()))
          .catch((error) => {
            console.warn("[i18n] Failed to refresh SoftRenderer Mermaid translations.", error);
          });
      },
    });

    setStaticCounts();
    initMermaidSection(pageCore.getTheme());

    if (typeof window.applyI18n === "function") {
      window.applyI18n(pageCore.getLang())
        .then(() => {
          if (mermaidRenderer) mermaidRenderer.setDiagrams(getMermaidDiagrams());
        })
        .catch((error) => {
          console.warn("[i18n] Failed to apply SoftRenderer translations.", error);
        });
    }
  }

  window.addEventListener("DOMContentLoaded", init);
})();

