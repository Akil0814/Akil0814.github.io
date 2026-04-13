(function () {
  const topQuotes = [
    "これで全部よ",
    "私が持っているもの、全部",
    "……この星空",
    "私が持っているのは、これくらいのもの",
    "私があなたにあげられるのは、これくらいのもの",
    "これくらいで全部",
  ];

  const meteorQuotes = [
    "「ねえ、流れ星が見たいな」",
    "冗談で振りかざした指先",
    "綺麗な尾を引いた",
    "それはまるで魔法のようで",
  ];

  window.aboutQuoteCarousels = [
    {
      layerSelector: "#quoteCarousel",
      lineSelector: "#quoteCarouselText",
      quotes: topQuotes,
      theme: "dark",
      fadeInMs: 1200,
      holdMs: 3600,
      fadeOutMs: 1200,
      maxOpacity: 0.75,
      fixedTop: true,
      fixedTopOffset: "calc(62px + clamp(12px, 3vh, 22px))",
    },
    {
      layerSelector: "#quoteCarouselMeteor",
      lineSelector: "#quoteCarouselMeteorText",
      quotes: meteorQuotes,
      theme: "dark",
      fadeInMs: 1000,
      holdMs: 3200,
      fadeOutMs: 1000,
      maxOpacity: 0.72,
      fixedPosition: {
        top: "auto",
        right: "clamp(20px, 4vw, 56px)",
        bottom: "clamp(16px, 4vh, 36px)",
        left: "auto",
        transform: "none",
        width: "min(48vw, 620px)",
        textAlign: "right",
      },
    },
  ];
})();
