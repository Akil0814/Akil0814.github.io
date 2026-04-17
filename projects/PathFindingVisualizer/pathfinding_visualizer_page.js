(function () {
  function setStaticCounts() {
    const videoCount = document.getElementById("videoCount");
    if (videoCount) videoCount.textContent = "0";

    const codeCount = document.getElementById("codeCount");
    if (codeCount) codeCount.textContent = "0";
  }

  function init() {
    if (!window.ProjectPageCore) {
      console.error("ProjectPageCore module is missing.");
      return;
    }

    const pageCore = window.ProjectPageCore.init();
    setStaticCounts();

    if (typeof window.applyI18n === "function") {
      window.applyI18n(pageCore.getLang()).catch((error) => {
        console.warn("[i18n] Failed to apply PathFindingVisualizer translations.", error);
      });
    }
  }

  window.addEventListener("DOMContentLoaded", init);
})();
