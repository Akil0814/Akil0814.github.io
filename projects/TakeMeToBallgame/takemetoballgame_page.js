(function () {
  function init() {
    if (!window.ProjectPageCore) {
      console.error("Shared project modules are missing.");
      return;
    }

    window.ProjectPageCore.init({
      codeThemeLinkId: "prismThemeLink",
      codeThemeDarkHref: "../../assets/prism/prism-dark.css",
      codeThemeLightHref: "../../assets/prism/prism-light.css",
    });

    const codeCount = document.getElementById("codeCount");
    if (codeCount) {
      codeCount.textContent = "0";
    }
  }

  window.addEventListener("DOMContentLoaded", init);
})();
