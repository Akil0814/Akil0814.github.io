(function () {
  async function init() {
    if (!window.ProjectPageCore) {
      console.error("ProjectPageCore module is missing.");
      return;
    }

    const pageCore = window.ProjectPageCore.init();
    await pageCore.setLang(pageCore.getLang());

    const videoCount = document.getElementById("videoCount");
    if (videoCount) {
      videoCount.textContent = "0";
    }

  }

  window.addEventListener("DOMContentLoaded", init);
})();
