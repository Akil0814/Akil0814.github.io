// Reusable C++ code block renderer for static pages.
// Usage:
//   renderCppCodeBlock("#slot", "int main() { return 0; }");
//   await renderCppFile("#slot", "/projects/snippets/demo.cpp");

(function () {
  const STYLE_ID = "cpp-code-block-style";

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
.cpp-block {
  border: 1px solid rgba(127,127,127,.35);
  border-radius: 14px;
  overflow: hidden;
  background: #0f172a;
  color: #e2e8f0;
  box-shadow: 0 8px 26px rgba(0,0,0,.18);
  font-family: "JetBrains Mono", Consolas, "Courier New", monospace;
}
.cpp-block__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255,255,255,.04);
  border-bottom: 1px solid rgba(127,127,127,.25);
}
.cpp-block__title {
  font-size: 12px;
  opacity: .9;
}
.cpp-block__copy {
  border: 1px solid rgba(127,127,127,.4);
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
}
.cpp-block__copy:hover {
  background: rgba(255,255,255,.08);
}
.cpp-block pre {
  margin: 0;
  padding: 12px 14px;
  overflow: auto;
  line-height: 1.55;
  font-size: 13px;
}
.cpp-block code {
  white-space: pre;
  display: block;
}
.cpp-block code.lines {
  counter-reset: line;
}
.cpp-block code.lines > span {
  display: block;
  counter-increment: line;
}
.cpp-block code.lines > span::before {
  content: counter(line);
  width: 2.5em;
  margin-right: 12px;
  display: inline-block;
  color: rgba(148,163,184,.85);
  text-align: right;
}
[data-theme="light"] .cpp-block {
  background: #f8fafc;
  color: #1e293b;
}
[data-theme="light"] .cpp-block__bar {
  background: rgba(15,23,42,.03);
}
    `;
    document.head.appendChild(style);
  }

  function resolveTarget(target) {
    if (typeof target === "string") return document.querySelector(target);
    return target || null;
  }

  function escapeHtml(raw) {
    return raw
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function buildCodeHtml(code, showLineNumbers) {
    const escaped = escapeHtml(code ?? "");
    if (!showLineNumbers) return escaped;
    return escaped
      .split("\n")
      .map((line) => `<span>${line || " "}</span>`)
      .join("");
  }

  function createBlock(code, options) {
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

    const title = document.createElement("div");
    title.className = "cpp-block__title";
    title.textContent = opts.title;
    bar.appendChild(title);

    if (opts.copyButton) {
      const copy = document.createElement("button");
      copy.type = "button";
      copy.className = "cpp-block__copy";
      copy.textContent = "Copy";
      copy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(code);
          copy.textContent = "Copied";
          setTimeout(() => {
            copy.textContent = "Copy";
          }, 1000);
        } catch (_) {
          copy.textContent = "Failed";
          setTimeout(() => {
            copy.textContent = "Copy";
          }, 1000);
        }
      });
      bar.appendChild(copy);
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
    injectStyles();
    const host = resolveTarget(target);
    if (!host) throw new Error("renderCppCodeBlock: target not found");
    host.innerHTML = "";
    host.appendChild(createBlock(code, options));
  }

  async function renderCppFile(target, filePath, options = {}) {
    const resp = await fetch(filePath);
    if (!resp.ok) {
      throw new Error(`renderCppFile: failed to load ${filePath} (${resp.status})`);
    }
    const text = await resp.text();
    const title = options.title || filePath.split("/").pop() || "C++";
    renderCppCodeBlock(target, text, { ...options, title });
  }

  window.renderCppCodeBlock = renderCppCodeBlock;
  window.renderCppFile = renderCppFile;
})();
