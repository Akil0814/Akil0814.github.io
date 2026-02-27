// MineSweeper page local C++ block renderer.
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

  function buildCodeHtml(code, showLineNumbers) {
    const escaped = escapeHtml(code);
    if (!showLineNumbers) return escaped;
    return escaped
      .split("\n")
      .map((line) => `<span>${line || " "}</span>`)
      .join("");
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

    const pre = document.createElement("pre");
    const codeEl = document.createElement("code");
    codeEl.className = opts.showLineNumbers ? "lines" : "";
    codeEl.innerHTML = buildCodeHtml(code, opts.showLineNumbers);
    pre.appendChild(codeEl);

    root.appendChild(bar);
    root.appendChild(pre);
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
      throw new Error(`renderCppFile: failed to fetch ${filePath} (${response.status})`);
    }
    const text = await response.text();
    const title = options.title || filePath.split("/").pop() || "C++";
    renderCppCodeBlock(target, text, { ...options, title });
  }

  window.MineCppBlock = {
    renderCppCodeBlock,
    renderCppFile,
  };
})();
