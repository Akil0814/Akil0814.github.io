(function () {
  function init() {
    if (!window.ProjectPageCore) {
      console.error("Shared project modules are missing.");
      return;
    }

    window.ProjectPageCore.init();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
