(function () {
  const videoEntries = [
    {
      fileName: "SoftRenderer_Blending_And_Depth_Test.webm",
      titleKey: "SoftRenderer.videos.blending_depth.title",
      titleFallback: "Blending and Depth Test",
      descriptionKey: "SoftRenderer.videos.blending_depth.desc",
      descriptionFallback: "Shows fragment blending behavior together with depth-based visibility checks.",
    },
    {
      fileName: "SoftRenderer_ImGui_And_Cull_Face.webm",
      titleKey: "SoftRenderer.videos.imgui_cull_face.title",
      titleFallback: "ImGui and Cull Face",
      descriptionKey: "SoftRenderer.videos.imgui_cull_face.desc",
      descriptionFallback: "Shows the debug UI workflow and back-face culling controls.",
    },
    {
      fileName: "SoftRenderer_Texture_Perspective_Correction.webm",
      titleKey: "SoftRenderer.videos.texture_perspective.title",
      titleFallback: "Texture Perspective Correction",
      descriptionKey: "SoftRenderer.videos.texture_perspective.desc",
      descriptionFallback: "Shows perspective-correct texture mapping during triangle rasterization.",
    },
    {
      fileName: "SoftRenderer_View_Frustum_Clipping.webm",
      titleKey: "SoftRenderer.videos.frustum_clipping.title",
      titleFallback: "View Frustum Clipping",
      descriptionKey: "SoftRenderer.videos.frustum_clipping.desc",
      descriptionFallback: "Shows clipping behavior when geometry crosses the camera frustum bounds.",
    },
  ];

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
    if (videoCount) videoCount.textContent = String(videoEntries.length);

    const codeCount = document.getElementById("codeCount");
    if (codeCount) codeCount.textContent = "0";
  }

  function renderVideos() {
    const videoGrid = document.getElementById("videoGrid");
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

      card.appendChild(title);
      card.appendChild(player);
      card.appendChild(description);
      videoGrid.appendChild(card);
    }
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
    renderVideos();
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
