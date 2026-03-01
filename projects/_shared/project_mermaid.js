(function () {
  const DEFAULT_MERMAID_SRC = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
  const DEFAULT_THEME_BY_MODE = {
    dark: "dark",
    light: "default",
  };

  let scriptLoadPromise = null;
  let rendererSeed = 0;

  function resolveTargetElement(target) {
    if (typeof target === "string") return document.querySelector(target);
    return target || null;
  }

  function normalizeTheme(theme) {
    return theme === "light" ? "light" : "dark";
  }

  function createScriptTag(src) {
    return new Promise((resolve, reject) => {
      const scriptElement = document.createElement("script");
      scriptElement.src = src;
      scriptElement.async = true;
      scriptElement.onload = () => resolve();
      scriptElement.onerror = () => reject(new Error(`Failed to load Mermaid script: ${src}`));
      document.head.appendChild(scriptElement);
    });
  }

  async function ensureMermaidLoaded(src) {
    if (
      typeof window.mermaid !== "undefined" &&
      typeof window.mermaid.initialize === "function" &&
      typeof window.mermaid.render === "function"
    ) {
      return window.mermaid;
    }

    if (!scriptLoadPromise) {
      scriptLoadPromise = createScriptTag(src);
    }

    await scriptLoadPromise;

    if (
      typeof window.mermaid === "undefined" ||
      typeof window.mermaid.initialize !== "function" ||
      typeof window.mermaid.render !== "function"
    ) {
      throw new Error("Mermaid loaded, but API is unavailable.");
    }

    return window.mermaid;
  }

  function createEmptyElement(text) {
    const emptyElement = document.createElement("p");
    emptyElement.className = "project-mermaid__empty";
    emptyElement.textContent = text || "No diagram data.";
    return emptyElement;
  }

  function createErrorElement(text) {
    const errorElement = document.createElement("p");
    errorElement.className = "project-mermaid__error";
    errorElement.textContent = text || "Failed to render diagram.";
    return errorElement;
  }

  function getLocalizedToggleText(isCollapsed) {
    if (window.I18N && typeof window.I18N.t === "function") {
      const key = isCollapsed ? "common.controls.show_diagram" : "common.controls.hide_diagram";
      const fallback = isCollapsed ? "Show Diagram" : "Hide Diagram";
      return window.I18N.t(key, undefined, fallback);
    }

    return isCollapsed ? "Show Diagram" : "Hide Diagram";
  }

  function createDiagramCard(diagram, state) {
    const cardElement = document.createElement("article");
    cardElement.className = "project-mermaid-card";
    const shouldStartCollapsed =
      typeof diagram.defaultCollapsed === "boolean"
        ? diagram.defaultCollapsed
        : state.defaultCollapsed;
    if (shouldStartCollapsed) {
      cardElement.classList.add("is-collapsed");
    }

    if (diagram.title) {
      const titleElement = document.createElement("h3");
      titleElement.textContent = diagram.title;
      cardElement.appendChild(titleElement);
    }

    if (diagram.description) {
      const descriptionElement = document.createElement("p");
      descriptionElement.className = "project-mermaid__desc";
      descriptionElement.textContent = diagram.description;
      cardElement.appendChild(descriptionElement);
    }

    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "project-mermaid__toggle";
    cardElement.appendChild(toggleButton);

    const canvasElement = document.createElement("div");
    canvasElement.className = "project-mermaid__canvas";
    const canvasId = `${state.idPrefix}-canvas-${state.cardSeed += 1}`;
    canvasElement.id = canvasId;
    toggleButton.setAttribute("aria-controls", canvasId);
    cardElement.appendChild(canvasElement);

    const syncToggleState = () => {
      const isCollapsed = cardElement.classList.contains("is-collapsed");
      toggleButton.textContent = getLocalizedToggleText(isCollapsed);
      toggleButton.setAttribute("aria-expanded", String(!isCollapsed));
    };

    toggleButton.addEventListener("click", () => {
      cardElement.classList.toggle("is-collapsed");
      syncToggleState();
    });

    syncToggleState();

    return { cardElement, canvasElement };
  }

  function resolveThemeName(state) {
    const overrideThemeMap = state.themeByMode || {};
    const fallbackThemeName = DEFAULT_THEME_BY_MODE[state.theme] || "default";
    return overrideThemeMap[state.theme] || fallbackThemeName;
  }

  function observeThemeChange(onThemeChange) {
    const observer = new MutationObserver((entries) => {
      for (const entry of entries) {
        if (entry.type !== "attributes" || entry.attributeName !== "data-theme") continue;
        const nextTheme = normalizeTheme(document.documentElement.getAttribute("data-theme"));
        onThemeChange(nextTheme);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }

  function sanitizeDiagrams(diagrams) {
    if (!Array.isArray(diagrams)) return [];
    return diagrams.filter((diagram) => diagram && typeof diagram.code === "string" && diagram.code.trim().length > 0);
  }

  function createRenderer(options = {}) {
    const targetElement = resolveTargetElement(options.target);
    if (!targetElement) {
      throw new Error("ProjectMermaid: target element not found.");
    }

    const state = {
      targetElement,
      diagrams: sanitizeDiagrams(options.diagrams),
      theme: normalizeTheme(options.theme || document.documentElement.getAttribute("data-theme")),
      mermaidSrc: options.mermaidSrc || DEFAULT_MERMAID_SRC,
      themeByMode: options.themeByMode || null,
      mermaidConfig: options.mermaidConfig || {},
      autoSyncTheme: options.autoSyncTheme !== false,
      defaultCollapsed: options.defaultCollapsed !== false,
      idPrefix: options.idPrefix || `project-mermaid-${rendererSeed += 1}`,
      observerCleanup: null,
      renderVersion: 0,
      isMounted: false,
      cardSeed: 0,
    };

    async function render() {
      const version = state.renderVersion + 1;
      state.renderVersion = version;

      state.targetElement.innerHTML = "";
      if (state.diagrams.length === 0) {
        state.targetElement.appendChild(createEmptyElement(options.emptyText));
        return;
      }

      const mermaid = await ensureMermaidLoaded(state.mermaidSrc);
      if (state.renderVersion !== version) return;

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: resolveThemeName(state),
        ...state.mermaidConfig,
      });

      for (let index = 0; index < state.diagrams.length; index += 1) {
        if (state.renderVersion !== version) return;

        const diagram = state.diagrams[index];
        const { cardElement, canvasElement } = createDiagramCard(diagram, state);
        state.targetElement.appendChild(cardElement);

        const diagramId = `${state.idPrefix}-${index + 1}`;
        try {
          const renderResult = await mermaid.render(diagramId, diagram.code);
          if (state.renderVersion !== version) return;

          canvasElement.innerHTML = renderResult.svg;
          if (typeof renderResult.bindFunctions === "function") {
            renderResult.bindFunctions(canvasElement);
          }
        } catch (error) {
          canvasElement.innerHTML = "";
          canvasElement.appendChild(createErrorElement(diagram.errorText || "Invalid Mermaid syntax."));
          console.error(`[ProjectMermaid] Failed to render diagram "${diagramId}".`, error);
        }
      }
    }

    function mount() {
      if (state.isMounted) return api;
      state.isMounted = true;

      if (state.autoSyncTheme) {
        state.observerCleanup = observeThemeChange((nextTheme) => {
          if (state.theme === nextTheme) return;
          state.theme = nextTheme;
          render();
        });
      }

      render();
      return api;
    }

    function setTheme(theme) {
      const nextTheme = normalizeTheme(theme);
      if (state.theme === nextTheme) return;
      state.theme = nextTheme;
      render();
    }

    function setDiagrams(diagrams) {
      state.diagrams = sanitizeDiagrams(diagrams);
      render();
    }

    function destroy() {
      if (!state.isMounted) return;
      state.isMounted = false;
      state.renderVersion += 1;

      if (typeof state.observerCleanup === "function") {
        state.observerCleanup();
      }
      state.observerCleanup = null;
    }

    const api = {
      mount,
      render,
      setTheme,
      setDiagrams,
      destroy,
    };

    return api;
  }

  function mount(target, options = {}) {
    const renderer = createRenderer({ ...options, target });
    renderer.mount();
    return renderer;
  }

  window.ProjectMermaid = {
    createRenderer,
    mount,
  };
})();
