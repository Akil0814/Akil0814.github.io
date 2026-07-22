(function () {
  const diagramRenderers = new Map();

  function syncPrismTheme(theme) {
    const link = document.getElementById("elysiaPrismThemeLink");
    if (!link) return;

    const darkHref = link.dataset.darkHref;
    const lightHref = link.dataset.lightHref;
    link.href = theme === "dark" ? darkHref : lightHref;
  }

  function diagramSource(card) {
    return card.querySelector("[data-module-diagram-source]")?.textContent.trim() || "";
  }

  function renderDiagrams() {
    document.querySelectorAll("[data-module-diagram]").forEach((card, index) => {
      const target = card.querySelector("[data-diagram-target]");
      if (!target || !window.ProjectMermaid) return;

      const diagrams = [{ code: diagramSource(card) }];
      const existing = diagramRenderers.get(card);
      if (existing) {
        existing.setDiagrams(diagrams);
        card.classList.add("is-enhanced");
        return;
      }

      const renderer = window.ProjectMermaid.mount(target, {
        diagrams,
        defaultCollapsed: false,
        idPrefix: `elysia-module-diagram-${index + 1}`,
        emptyText: card.dataset.emptyText || "No diagram data.",
        mermaidConfig: {
          flowchart: { curve: "basis" },
        },
      });
      diagramRenderers.set(card, renderer);
      card.classList.add("is-enhanced");
    });
  }

  async function enhanceCodeCard(card) {
    if (!window.ProjectCodeBlock) return;

    const path = card.dataset.codePath;
    const target = card.querySelector("[data-code-target]");
    if (!path || !target) return;

    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Failed to load ${path} (${response.status})`);
      const code = await response.text();

      window.ProjectCodeBlock.renderCppCodeBlock(target, code.trimEnd(), {
        title: card.dataset.codeTitle || path.split("/").pop() || "C++",
        showLineNumbers: true,
        copyButton: true,
        sourceUrl: card.dataset.sourceUrl || "",
        visibleLines: Number(card.dataset.visibleLines || 20),
      });
      card.classList.add("is-enhanced");
    } catch (error) {
      console.error("[ElysiaModulePage] Code enhancement failed.", error);
    }
  }

  function enhanceCodeBlocks() {
    return Promise.all(
      Array.from(document.querySelectorAll("[data-module-code]"), enhanceCodeCard)
    );
  }

  function initToc() {
    const links = Array.from(document.querySelectorAll("[data-module-toc] a[href^='#']"));
    if (!links.length || !("IntersectionObserver" in window)) return;

    const byId = new Map(links.map((link) => [link.hash.slice(1), link]));
    const sections = Array.from(byId.keys())
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!visible) return;
        links.forEach((link) => link.classList.remove("is-active"));
        const active = byId.get(visible.target.id);
        active?.classList.add("is-active");
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: [0, 0.1] }
    );

    sections.forEach((section) => observer.observe(section));
  }

  async function applyLanguage(language) {
    if (typeof window.applyI18n === "function") {
      await window.applyI18n(language);
    }
  }

  function init() {
    if (!window.ElysiaBase) {
      console.error("ElysiaBase module is missing.");
      return;
    }

    const cosmos = window.ElysiaCosmos?.init(document.getElementById("elysiaCosmos"));
    const pageCore = window.ElysiaBase.init({
      onThemeChange(theme) {
        syncPrismTheme(theme);
        cosmos?.setTheme(theme);
      },
      onFxChange(enabled) {
        cosmos?.setFx(enabled);
      },
      onLangChange(language) {
        applyLanguage(language)
          .then(enhanceCodeBlocks)
          .catch((error) => {
            console.warn("[i18n] Failed to apply Elysia module translations.", error);
          });
      },
    });

    syncPrismTheme(pageCore.getTheme());
    cosmos?.setTheme(pageCore.getTheme());
    cosmos?.setFx(pageCore.getFx());
    initToc();
    renderDiagrams();
    applyLanguage(pageCore.getLang())
      .then(enhanceCodeBlocks)
      .catch((error) => {
        console.warn("[i18n] Failed to initialize Elysia module translations.", error);
        enhanceCodeBlocks();
      });
  }

  window.addEventListener("DOMContentLoaded", init);
})();
