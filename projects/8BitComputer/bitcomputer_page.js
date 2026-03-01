(function () {
  function init() {
    if (!window.ProjectPageCore) {
      console.error("ProjectPageCore module is missing.");
      return;
    }

    const pageCore = window.ProjectPageCore.init();
    const videoCount = document.getElementById("videoCount");
    if (videoCount) {
      videoCount.textContent = "0";
    }

    if (typeof window.applyI18n === "function") {
      window.applyI18n(pageCore.getLang()).catch((error) => {
        console.warn("[i18n] Failed to apply 8BitComputer translations.", error);
      });
    }
  }

  window.addEventListener("DOMContentLoaded", init);
})();

