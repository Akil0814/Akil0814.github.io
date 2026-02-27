(function () {
  function resolveTarget(target) {
    if (typeof target === "string") return document.querySelector(target);
    return target || null;
  }

  function escapeHtml(raw) {
    return String(raw ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function highlightCpp(code) {
    if (
      typeof window.Prism !== "undefined" &&
      window.Prism.languages &&
      typeof window.Prism.highlight === "function"
    ) {
      const grammar =
        window.Prism.languages.cpp ||
        window.Prism.languages.c ||
        window.Prism.languages.clike;
      if (grammar) {
        return window.Prism.highlight(code, grammar, "cpp");
      }
    }
    return escapeHtml(code);
  }

  function createLineGutter(lineCount) {
    const gutter = document.createElement("ol");
    gutter.className = "cpp-block__lines";
    gutter.setAttribute("aria-hidden", "true");

    for (let i = 1; i <= lineCount; i += 1) {
      const line = document.createElement("li");
      line.textContent = String(i);
      gutter.appendChild(line);
    }

    return gutter;
  }

  function createCppBlock(code, options = {}) {
    const opts = {
      title: "C++",
      showLineNumbers: true,
      copyButton: true,
      ...options,
    };

    const root = document.createElement("section");
    root.className = "cpp-block";

    const bar = document.createElement("div");
    bar.className = "cpp-block__bar";

    const title = document.createElement("span");
    title.className = "cpp-block__title";
    title.textContent = opts.title;
    bar.appendChild(title);

    if (opts.copyButton) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cpp-block__copy";
      btn.textContent = "Copy";
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(code);
          btn.textContent = "Copied";
        } catch (_) {
          btn.textContent = "Failed";
        } finally {
          setTimeout(() => {
            btn.textContent = "Copy";
          }, 900);
        }
      });
      bar.appendChild(btn);
    }

    const codeWrap = document.createElement("div");
    codeWrap.className = "cpp-block__codewrap";

    const pre = document.createElement("pre");
    pre.className = "language-cpp";

    const codeEl = document.createElement("code");
    codeEl.className = "language-cpp";
    codeEl.innerHTML = highlightCpp(code);
    pre.appendChild(codeEl);

    if (opts.showLineNumbers) {
      const lineCount = String(code ?? "").split("\n").length;
      codeWrap.appendChild(createLineGutter(lineCount));
    }

    codeWrap.appendChild(pre);
    root.appendChild(bar);
    root.appendChild(codeWrap);
    return root;
  }

  function renderCppCodeBlock(target, code, options = {}) {
    const host = resolveTarget(target);
    if (!host) throw new Error("renderCppCodeBlock: target not found");
    host.innerHTML = "";
    host.appendChild(createCppBlock(code, options));
  }

  async function renderCppFile(target, filePath, options = {}) {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error("renderCppFile: failed to fetch " + filePath + " (" + response.status + ")");
    }
    const text = await response.text();
    const title = options.title || filePath.split("/").pop() || "C++";
    renderCppCodeBlock(target, text, { ...options, title });
  }

  window.ProjectCodeBlock = {
    renderCppCodeBlock,
    renderCppFile,
  };
})();
