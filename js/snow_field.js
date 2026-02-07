// =========================================================
// Light-theme snowfall background.
// - Drawn on <canvas id="snow">
// - Active only in light theme and when FX is ON
// =========================================================
(function () {
  // Smaller value = more flakes on screen (higher density).
  const SNOW_DENSITY_AREA = 10000;
  const CLICK_BURST_RADIUS = 140;
  const CLICK_BURST_FORCE = 2.4;
  const CLICK_BURST_LIFE = 22;

  const select = typeof window.$ === "function"
    ? window.$
    : (s) => document.querySelector(s);

  const canvas = select("#snow");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const state = {
    w: 0,
    h: 0,
    dpr: Math.max(1, Math.min(2, window.devicePixelRatio || 1)),
    flakes: [],
    windT: 0,
    bursts: [],
  };

  function isLightTheme() {
    return document.documentElement.getAttribute("data-theme") === "light";
  }

  function isFxOn() {
    return typeof uiState === "undefined" ? true : !!uiState.fxOn;
  }

  function makeFlake() {
    const depth = Math.random();
    return {
      x: Math.random() * state.w,
      y: Math.random() * state.h,
      r: 0.8 + depth * 2.2,
      vy: 0.28 + depth * 0.95,
      vx: -0.08 + Math.random() * 0.16,
      alpha: 0.3 + depth * 0.55,
      wigglePhase: Math.random() * Math.PI * 2,
      wiggleAmp: 0.2 + depth * 1.6,
      wiggleSpeed: 0.01 + Math.random() * 0.018,
      depth,
    };
  }

  function resetFlake(flake, fromTop) {
    flake.x = Math.random() * state.w;
    flake.y = fromTop ? -10 - Math.random() * state.h * 0.25 : Math.random() * state.h;
  }

  function resize() {
    state.w = window.innerWidth;
    state.h = window.innerHeight;
    state.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    canvas.width = Math.floor(state.w * state.dpr);
    canvas.height = Math.floor(state.h * state.dpr);
    canvas.style.width = state.w + "px";
    canvas.style.height = state.h + "px";
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    const count = Math.max(90, Math.floor((state.w * state.h) / SNOW_DENSITY_AREA));
    state.flakes = Array.from({ length: count }, makeFlake);
  }

  function onPointerDown(e) {
    const rect = canvas.getBoundingClientRect();
    state.bursts.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      radius: CLICK_BURST_RADIUS,
      force: CLICK_BURST_FORCE,
      life: CLICK_BURST_LIFE,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, state.w, state.h);

    if (!isLightTheme() || !isFxOn()) {
      requestAnimationFrame(draw);
      return;
    }

    state.windT += 0.006;
    const wind = Math.sin(state.windT) * 0.18;

    for (const b of state.bursts) b.life -= 1;
    state.bursts = state.bursts.filter((b) => b.life > 0);

    for (const f of state.flakes) {
      let repelX = 0;
      let repelY = 0;

      for (const b of state.bursts) {
        const dx = f.x - b.x;
        const dy = f.y - b.y;
        const distSq = dx * dx + dy * dy;
        const radiusSq = b.radius * b.radius;
        if (distSq <= 0 || distSq > radiusSq) continue;

        const dist = Math.sqrt(distSq);
        const nx = dx / dist;
        const ny = dy / dist;
        const falloff = 1 - dist / b.radius;
        const lifeFactor = b.life / CLICK_BURST_LIFE;
        const strength = b.force * falloff * lifeFactor;

        repelX += nx * strength;
        repelY += ny * strength;
      }

      f.y += f.vy + repelY;
      f.x += f.vx + wind * (0.35 + f.depth) + repelX;
      f.wigglePhase += f.wiggleSpeed;

      const px = f.x + Math.sin(f.wigglePhase) * f.wiggleAmp;
      const py = f.y;

      if (py > state.h + 16 || px < -20 || px > state.w + 20) {
        resetFlake(f, true);
        continue;
      }

      ctx.globalAlpha = f.alpha;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(px, py, f.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize, { passive: true });
  canvas.addEventListener("pointerdown", onPointerDown, { passive: true });
  resize();
  draw();
})();
