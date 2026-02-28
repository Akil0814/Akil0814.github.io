(function () {
  function resolveTargetElement(target) {
    if (typeof target === "string") return document.querySelector(target);
    return target || null;
  }

  function escapeHtml(text) {
    return String(text ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function canUsePrismHighlightElement() {
    return (
      typeof window.Prism !== "undefined" &&
      typeof window.Prism.highlightElement === "function"
    );
  }

  function createLineNumberGutter(lineCount) {
    const gutterList = document.createElement("ol");
    gutterList.className = "cpp-block__lines";
    gutterList.setAttribute("aria-hidden", "true");

    for (let lineNumber = 1; lineNumber <= lineCount; lineNumber += 1) {
      const lineItem = document.createElement("li");
      lineItem.textContent = String(lineNumber);
      gutterList.appendChild(lineItem);
    }

    return gutterList;
  }

  function createCppBlock(code, options = {}) {
    const resolvedOptions = {
      title: "C++",
      showLineNumbers: true,
      copyButton: true,
      sourceUrl: "",
      ...options,
    };

    const rootElement = document.createElement("section");
    rootElement.className = "cpp-block";

    const topBarElement = document.createElement("div");
    topBarElement.className = "cpp-block__bar";

    const titleElement = document.createElement("span");
    titleElement.className = "cpp-block__title";
    titleElement.textContent = resolvedOptions.title;
    topBarElement.appendChild(titleElement);

    const actionsElement = document.createElement("div");
    actionsElement.className = "cpp-block__actions";

    if (resolvedOptions.sourceUrl) {
      const sourceLinkElement = document.createElement("a");
      sourceLinkElement.className = "cpp-block__source";
      sourceLinkElement.href = resolvedOptions.sourceUrl;
      sourceLinkElement.target = "_blank";
      sourceLinkElement.rel = "noreferrer";
      sourceLinkElement.textContent = "View Source";
      actionsElement.appendChild(sourceLinkElement);
    }

    if (resolvedOptions.copyButton) {
      const copyButtonElement = document.createElement("button");
      copyButtonElement.type = "button";
      copyButtonElement.className = "cpp-block__copy";
      copyButtonElement.textContent = "Copy";
      copyButtonElement.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(code);
          copyButtonElement.textContent = "Copied";
        } catch (_) {
          copyButtonElement.textContent = "Failed";
        } finally {
          setTimeout(() => {
            copyButtonElement.textContent = "Copy";
          }, 900);
        }
      });
      actionsElement.appendChild(copyButtonElement);
    }

    if (actionsElement.childElementCount > 0) {
      topBarElement.appendChild(actionsElement);
    }

    const codeWrapElement = document.createElement("div");
    codeWrapElement.className = "cpp-block__codewrap";

    const preElement = document.createElement("pre");
    preElement.className = "language-cpp";

    const codeElement = document.createElement("code");
    codeElement.className = "language-cpp";
    if (canUsePrismHighlightElement()) {
      codeElement.textContent = code;
    } else {
      codeElement.innerHTML = escapeHtml(code);
    }
    preElement.appendChild(codeElement);

    if (resolvedOptions.showLineNumbers) {
      const lineCount = String(code ?? "").split("\n").length;
      codeWrapElement.appendChild(createLineNumberGutter(lineCount));
    }

    codeWrapElement.appendChild(preElement);
    rootElement.appendChild(topBarElement);
    rootElement.appendChild(codeWrapElement);

    if (canUsePrismHighlightElement()) {
      window.Prism.highlightElement(codeElement);
    }

    return rootElement;
  }

  function renderCppCodeBlock(target, code, options = {}) {
    const targetElement = resolveTargetElement(target);
    if (!targetElement) {
      throw new Error("renderCppCodeBlock: target not found");
    }

    targetElement.innerHTML = "";
    targetElement.appendChild(createCppBlock(code, options));
  }

  async function renderCppFile(target, filePath, options = {}) {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`renderCppFile: failed to fetch ${filePath} (${response.status})`);
    }

    const codeContent = await response.text();
    const inferredTitle = options.title || filePath.split("/").pop() || "C++";
    renderCppCodeBlock(target, codeContent, { ...options, title: inferredTitle });
  }

  window.ProjectCodeBlock = {
    renderCppCodeBlock,
    renderCppFile,
  };
})();
