// =========================================================
// Light-theme snowfall background.
// - Drawn on <canvas id="snow">
// - Active only in light theme and when FX is ON
// =========================================================
(function () {
  // Smaller value = more flakes on screen (higher density).
  const SNOW_DENSITY_AREA = 1000;
  // Bigger value = faster snowfall (global speed multiplier).
  const SNOW_FALL_SPEED_MULTIPLIER = 0.78;

  const MOUSE_REPEL_RADIUS = 25;
  const MOUSE_REPEL_FORCE = 0.10;
  const VELOCITY_DAMPING = 0.92;

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
    pointer: { x: 0, y: 0, active: false },
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
      vy: (0.28 + depth * 0.95) * SNOW_FALL_SPEED_MULTIPLIER,
      vx: -0.08 + Math.random() * 0.16,
      ivx: 0,
      ivy: 0,
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
    flake.ivx = 0;
    flake.ivy = 0;
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
    if (!isLightTheme() || !isFxOn()) return;
    state.bursts.push({
      x: e.clientX,
      y: e.clientY,
      radius: CLICK_BURST_RADIUS,
      force: CLICK_BURST_FORCE,
      life: CLICK_BURST_LIFE,
    });
  }

  function onPointerMove(e) {
    if (!isLightTheme() || !isFxOn()) {
      state.pointer.active = false;
      return;
    }
    state.pointer.x = e.clientX;
    state.pointer.y = e.clientY;
    state.pointer.active = true;
  }

  function onPointerLeave() {
    state.pointer.active = false;
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
      let accelX = 0;
      let accelY = 0;

      if (state.pointer.active) {
        const dx = f.x - state.pointer.x;
        const dy = f.y - state.pointer.y;
        const distSq = dx * dx + dy * dy;
        const radiusSq = MOUSE_REPEL_RADIUS * MOUSE_REPEL_RADIUS;

        if (distSq > 0 && distSq < radiusSq) {
          const dist = Math.sqrt(distSq);
          const nx = dx / dist;
          const ny = dy / dist;
          const falloff = 1 - dist / MOUSE_REPEL_RADIUS;
          const strength = MOUSE_REPEL_FORCE * falloff;
          accelX += nx * strength;
          accelY += ny * strength;
        }
      }

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

        accelX += nx * strength;
        accelY += ny * strength;
      }

      f.ivx = (f.ivx + accelX) * VELOCITY_DAMPING;
      f.ivy = (f.ivy + accelY) * VELOCITY_DAMPING;

      f.y += f.vy + f.ivy;
      f.x += f.vx + wind * (0.35 + f.depth) + f.ivx;
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
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", onPointerLeave, { passive: true });
  window.addEventListener("blur", onPointerLeave, { passive: true });
  resize();
  draw();
})();
