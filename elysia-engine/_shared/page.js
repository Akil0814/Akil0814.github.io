(function () {
  function init() {
    if (!window.ElysiaBase) {
      console.error("ElysiaBase module is missing.");
      return;
    }

    const pageCore = window.ElysiaBase.init({
      onLangChange(language) {
        if (typeof window.applyI18n !== "function") return;
        window.applyI18n(language).catch((error) => {
          console.warn("[i18n] Failed to apply Elysia Engine translations.", error);
        });
      },
    });

    if (typeof window.applyI18n === "function") {
      window.applyI18n(pageCore.getLang()).catch((error) => {
        console.warn("[i18n] Failed to initialize Elysia Engine translations.", error);
      });
    }
  }

  window.addEventListener("DOMContentLoaded", init);
})();
