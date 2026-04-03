(function () {
  const TAU = Math.PI * 2;
  const BASE_AREA = 1920 * 1080;

  const selectElement = typeof window.$ === "function"
    ? window.$
    : (selector) => document.querySelector(selector);

  const config = window.aboutLightFxConfig;
  if (!config?.sakura) return;
  const sakuraConfig = config.sakura;

  const canvasElement = selectElement(`#${config.canvasId || "stars"}`);
  if (!canvasElement) return;

  const context = canvasElement.getContext("2d");
  if (!context) return;

  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    petals: [],
    wasRendererActive: false,
    pointer: {
      clientX: -10000,
      clientY: -10000,
      active: false,
    },
    lastFrameTimeMs: performance.now(),
  };

  function clamp(value, minValue, maxValue) {
    return Math.min(maxValue, Math.max(minValue, value));
  }

  function randomRange(minValue, maxValue) {
    return minValue + Math.random() * (maxValue - minValue);
  }

  function getTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }

  function isFxEnabled() {
    return typeof uiState === "undefined" ? true : !!uiState.fxOn;
  }

  function isRendererActive() {
    return getTheme() === "light" && isFxEnabled();
  }

  function chooseSakuraColor() {
    const colors = sakuraConfig.colors || [];
    if (!colors.length) return [255, 206, 223];
    return colors[Math.floor(Math.random() * colors.length)] || colors[0];
  }

  function createPetal(spawnFromTop) {
    return {
      x: Math.random() * state.width,
      y: spawnFromTop ? randomRange(-state.height * 0.24, -12) : Math.random() * state.height,
      radius: randomRange(sakuraConfig.sizePx[0], sakuraConfig.sizePx[1]),
      speedY: randomRange(sakuraConfig.fallSpeedPxPerSec[0], sakuraConfig.fallSpeedPxPerSec[1]),
      speedX: randomRange(sakuraConfig.driftPxPerSec[0], sakuraConfig.driftPxPerSec[1]),
      wobbleAmp: randomRange(sakuraConfig.wobbleAmplitudePx[0], sakuraConfig.wobbleAmplitudePx[1]),
      wobblePhase: Math.random() * TAU,
      wobbleSpeed: randomRange(sakuraConfig.wobbleSpeedHz[0], sakuraConfig.wobbleSpeedHz[1]),
      angle: Math.random() * TAU,
      spin: randomRange(sakuraConfig.spinRadPerSec[0], sakuraConfig.spinRadPerSec[1]) * (Math.random() > 0.5 ? 1 : -1),
      alpha: randomRange(sakuraConfig.alpha[0], sakuraConfig.alpha[1]),
      color: chooseSakuraColor(),
      blur: randomRange(sakuraConfig.blurRadius[0], sakuraConfig.blurRadius[1]),
      boostX: 0,
      boostY: 0,
    };
  }

  function rebuildPetals() {
    const areaRatio = clamp((state.width * state.height) / BASE_AREA, 0.72, 1.45);
    const petalCount = Math.max(24, Math.round(sakuraConfig.count * areaRatio));
    state.petals = Array.from({ length: petalCount }, () => createPetal(false));
  }

  function respawnPetal(petal) {
    const reset = createPetal(true);
    Object.assign(petal, reset);
  }

  function resizeCanvas() {
    state.width = Math.max(1, window.innerWidth || 1);
    state.height = Math.max(1, window.innerHeight || 1);
    state.dpr = Math.max(1, Math.min(config.maxDevicePixelRatio || 2, window.devicePixelRatio || 1));

    canvasElement.width = Math.floor(state.width * state.dpr);
    canvasElement.height = Math.floor(state.height * state.dpr);
    canvasElement.style.width = `${state.width}px`;
    canvasElement.style.height = `${state.height}px`;
    context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    rebuildPetals();
  }

  function onPointerMove(event) {
    if (!isRendererActive()) return;
    state.pointer.clientX = event.clientX;
    state.pointer.clientY = event.clientY;
    state.pointer.active = true;
  }

  function onPointerReset() {
    state.pointer.clientX = -10000;
    state.pointer.clientY = -10000;
    state.pointer.active = false;
  }

  function drawPetal(drawX, drawY, petal) {
    const [r, g, b] = petal.color;
    const innerR = clamp(Math.round(r + 18), 0, 255);
    const innerG = clamp(Math.round(g + 14), 0, 255);
    const innerB = clamp(Math.round(b + 16), 0, 255);
    const outerR = clamp(Math.round(r - 28), 0, 255);
    const outerG = clamp(Math.round(g - 30), 0, 255);
    const outerB = clamp(Math.round(b - 36), 0, 255);
    const radius = petal.radius;

    context.save();
    context.translate(drawX, drawY);
    context.rotate(petal.angle);
    context.scale(1, 0.88);

    context.shadowColor = `rgba(${r}, ${g}, ${b}, ${Math.min(0.32, petal.alpha * 0.35)})`;
    context.shadowBlur = petal.blur * 6;

    const gradient = context.createRadialGradient(
      -radius * 0.16,
      -radius * 0.18,
      radius * 0.22,
      0,
      0,
      radius * 1.08
    );
    gradient.addColorStop(0, `rgba(${innerR}, ${innerG}, ${innerB}, ${petal.alpha * 0.95})`);
    gradient.addColorStop(0.68, `rgba(${r}, ${g}, ${b}, ${petal.alpha})`);
    gradient.addColorStop(1, `rgba(${outerR}, ${outerG}, ${outerB}, ${petal.alpha * 0.88})`);

    context.fillStyle = gradient;
    context.beginPath();
    context.moveTo(0, -radius * 0.95);
    context.bezierCurveTo(radius * 0.74, -radius * 0.7, radius * 0.82, radius * 0.1, 0, radius * 0.9);
    context.bezierCurveTo(-radius * 0.82, radius * 0.1, -radius * 0.74, -radius * 0.7, 0, -radius * 0.95);
    context.closePath();
    context.fill();

    context.shadowBlur = 0;
    context.lineWidth = 0.75;
    context.strokeStyle = `rgba(255, 255, 255, ${Math.min(0.36, petal.alpha * 0.55)})`;
    context.beginPath();
    context.moveTo(0, -radius * 0.62);
    context.quadraticCurveTo(radius * 0.06, 0, 0, radius * 0.44);
    context.stroke();

    context.restore();
  }

  function drawSakuraLayer(deltaTimeSec) {
    const pointerConfig = sakuraConfig.pointer || {};
    const pointerRadius = pointerConfig.radiusPx || 140;
    const pointerRadiusSq = pointerRadius * pointerRadius;
    const pushStrength = pointerConfig.push || 400;
    const swirlStrength = pointerConfig.swirl || 150;
    const maxBoostSpeed = pointerConfig.maxBoostSpeed || 150;
    const dampingBase = clamp(pointerConfig.damping || 0.985, 0.82, 0.9995);
    const dampingFactor = Math.pow(dampingBase, deltaTimeSec * 60);
    const pointerIsActive = state.pointer.active;

    for (const petal of state.petals) {
      if (pointerIsActive) {
        const dx = petal.x - state.pointer.clientX;
        const dy = petal.y - state.pointer.clientY;
        const distSq = dx * dx + dy * dy;

        if (distSq < pointerRadiusSq) {
          const dist = Math.max(12, Math.sqrt(distSq));
          const falloff = 1 - dist / pointerRadius;
          const awayX = dx / dist;
          const awayY = dy / dist;
          const tangentX = -awayY;
          const tangentY = awayX;

          petal.boostX += (awayX * pushStrength + tangentX * swirlStrength) * falloff * deltaTimeSec;
          petal.boostY += (awayY * pushStrength * 0.62 + tangentY * swirlStrength * 0.16) * falloff * deltaTimeSec;
        }
      }

      petal.boostX *= dampingFactor;
      petal.boostY *= dampingFactor;

      const boostSpeed = Math.hypot(petal.boostX, petal.boostY);
      if (boostSpeed > maxBoostSpeed) {
        const ratio = maxBoostSpeed / boostSpeed;
        petal.boostX *= ratio;
        petal.boostY *= ratio;
      }

      petal.wobblePhase += deltaTimeSec * petal.wobbleSpeed * TAU;
      petal.angle += (petal.spin + petal.boostX * 0.0035) * deltaTimeSec;
      petal.x += (petal.speedX + petal.boostX) * deltaTimeSec;
      petal.y += (petal.speedY + petal.boostY) * deltaTimeSec;

      if (
        petal.y > state.height + petal.radius * 2.2 ||
        petal.x < -state.width * 0.32 ||
        petal.x > state.width * 1.32
      ) {
        respawnPetal(petal);
        continue;
      }

      const wobbleOffsetX = Math.sin(petal.wobblePhase) * petal.wobbleAmp;
      drawPetal(petal.x + wobbleOffsetX, petal.y, petal);
    }
  }

  function clearCanvas() {
    context.clearRect(0, 0, state.width, state.height);
  }

  function renderFrame(nowMs) {
    const deltaTimeSec = clamp((nowMs - state.lastFrameTimeMs) / 1000, 0, 0.05);
    state.lastFrameTimeMs = nowMs;

    if (!isRendererActive()) {
      if (state.wasRendererActive) {
        clearCanvas();
        state.wasRendererActive = false;
      }
      requestAnimationFrame(renderFrame);
      return;
    }

    state.wasRendererActive = true;
    clearCanvas();
    drawSakuraLayer(deltaTimeSec);
    requestAnimationFrame(renderFrame);
  }

  window.addEventListener("resize", resizeCanvas, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", onPointerReset, { passive: true });
  window.addEventListener("pointercancel", onPointerReset, { passive: true });
  window.addEventListener("blur", onPointerReset, { passive: true });

  resizeCanvas();
  requestAnimationFrame(renderFrame);
})();
