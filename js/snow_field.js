// Light-theme snowfall background rendered on <canvas id="snow">.
(function () {
  const SNOW_DENSITY_AREA = 1000;
  const SNOW_FALL_SPEED_MULTIPLIER = 0.78;

  const POINTER_REPEL_RADIUS = 25;
  const POINTER_REPEL_FORCE = 0.10;
  const VELOCITY_DAMPING_FACTOR = 0.92;

  const CLICK_BURST_RADIUS = 80;
  const CLICK_BURST_FORCE = 2.4;
  const CLICK_BURST_LIFETIME = 22;

  const selectElement = typeof window.$ === "function"
    ? window.$
    : (selector) => document.querySelector(selector);

  const canvasElement = selectElement("#snow");
  if (!canvasElement) return;

  const context = canvasElement.getContext("2d");
  if (!context) return;

  const snowState = {
    viewportWidth: 0,
    viewportHeight: 0,
    devicePixelRatio: Math.max(1, Math.min(2, window.devicePixelRatio || 1)),
    flakes: [],
    windPhase: 0,
    bursts: [],
    pointer: { x: 0, y: 0, active: false },
  };

  function isLightThemeActive() {
    return document.documentElement.getAttribute("data-theme") === "light";
  }

  function isFxEnabled() {
    return typeof uiState === "undefined" ? true : !!uiState.fxOn;
  }

  function createFlake() {
    const depth = Math.random();
    return {
      x: Math.random() * snowState.viewportWidth,
      y: Math.random() * snowState.viewportHeight,
      radius: 0.8 + depth * 2.2,
      fallVelocityY: (0.28 + depth * 0.95) * SNOW_FALL_SPEED_MULTIPLIER,
      driftVelocityX: -0.08 + Math.random() * 0.16,
      impulseVelocityX: 0,
      impulseVelocityY: 0,
      alpha: 0.3 + depth * 0.55,
      wigglePhase: Math.random() * Math.PI * 2,
      wiggleAmplitude: 0.2 + depth * 1.6,
      wiggleSpeed: 0.01 + Math.random() * 0.018,
      depth,
    };
  }

  function resetFlake(flake, spawnFromTop) {
    flake.x = Math.random() * snowState.viewportWidth;
    flake.y = spawnFromTop
      ? -10 - Math.random() * snowState.viewportHeight * 0.25
      : Math.random() * snowState.viewportHeight;
    flake.impulseVelocityX = 0;
    flake.impulseVelocityY = 0;
  }

  function resizeCanvas() {
    snowState.viewportWidth = window.innerWidth;
    snowState.viewportHeight = window.innerHeight;
    snowState.devicePixelRatio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    canvasElement.width = Math.floor(snowState.viewportWidth * snowState.devicePixelRatio);
    canvasElement.height = Math.floor(snowState.viewportHeight * snowState.devicePixelRatio);
    canvasElement.style.width = `${snowState.viewportWidth}px`;
    canvasElement.style.height = `${snowState.viewportHeight}px`;
    context.setTransform(snowState.devicePixelRatio, 0, 0, snowState.devicePixelRatio, 0, 0);

    const flakeCount = Math.max(
      90,
      Math.floor((snowState.viewportWidth * snowState.viewportHeight) / SNOW_DENSITY_AREA)
    );
    snowState.flakes = Array.from({ length: flakeCount }, createFlake);
  }

  function onPointerDown(event) {
    if (!isLightThemeActive() || !isFxEnabled()) return;

    snowState.bursts.push({
      x: event.clientX,
      y: event.clientY,
      radius: CLICK_BURST_RADIUS,
      force: CLICK_BURST_FORCE,
      life: CLICK_BURST_LIFETIME,
    });
  }

  function onPointerMove(event) {
    if (!isLightThemeActive() || !isFxEnabled()) {
      snowState.pointer.active = false;
      return;
    }

    snowState.pointer.x = event.clientX;
    snowState.pointer.y = event.clientY;
    snowState.pointer.active = true;
  }

  function clearPointerState() {
    snowState.pointer.active = false;
  }

  function drawSnowFrame() {
    context.clearRect(0, 0, snowState.viewportWidth, snowState.viewportHeight);

    if (!isLightThemeActive() || !isFxEnabled()) {
      requestAnimationFrame(drawSnowFrame);
      return;
    }

    snowState.windPhase += 0.006;
    const windOffset = Math.sin(snowState.windPhase) * 0.18;

    for (const burst of snowState.bursts) burst.life -= 1;
    snowState.bursts = snowState.bursts.filter((burst) => burst.life > 0);

    for (const flake of snowState.flakes) {
      let accelerationX = 0;
      let accelerationY = 0;

      if (snowState.pointer.active) {
        const deltaX = flake.x - snowState.pointer.x;
        const deltaY = flake.y - snowState.pointer.y;
        const distanceSquared = deltaX * deltaX + deltaY * deltaY;
        const repelRadiusSquared = POINTER_REPEL_RADIUS * POINTER_REPEL_RADIUS;

        if (distanceSquared > 0 && distanceSquared < repelRadiusSquared) {
          const distance = Math.sqrt(distanceSquared);
          const normalX = deltaX / distance;
          const normalY = deltaY / distance;
          const falloffFactor = 1 - distance / POINTER_REPEL_RADIUS;
          const repelStrength = POINTER_REPEL_FORCE * falloffFactor;
          accelerationX += normalX * repelStrength;
          accelerationY += normalY * repelStrength;
        }
      }

      for (const burst of snowState.bursts) {
        const deltaX = flake.x - burst.x;
        const deltaY = flake.y - burst.y;
        const distanceSquared = deltaX * deltaX + deltaY * deltaY;
        const burstRadiusSquared = burst.radius * burst.radius;
        if (distanceSquared <= 0 || distanceSquared > burstRadiusSquared) continue;

        const distance = Math.sqrt(distanceSquared);
        const normalX = deltaX / distance;
        const normalY = deltaY / distance;
        const falloffFactor = 1 - distance / burst.radius;
        const lifeRatio = burst.life / CLICK_BURST_LIFETIME;
        const burstStrength = burst.force * falloffFactor * lifeRatio;

        accelerationX += normalX * burstStrength;
        accelerationY += normalY * burstStrength;
      }

      flake.impulseVelocityX = (flake.impulseVelocityX + accelerationX) * VELOCITY_DAMPING_FACTOR;
      flake.impulseVelocityY = (flake.impulseVelocityY + accelerationY) * VELOCITY_DAMPING_FACTOR;

      flake.y += flake.fallVelocityY + flake.impulseVelocityY;
      flake.x += flake.driftVelocityX + windOffset * (0.35 + flake.depth) + flake.impulseVelocityX;
      flake.wigglePhase += flake.wiggleSpeed;

      const drawX = flake.x + Math.sin(flake.wigglePhase) * flake.wiggleAmplitude;
      const drawY = flake.y;

      if (
        drawY > snowState.viewportHeight + 16 ||
        drawX < -20 ||
        drawX > snowState.viewportWidth + 20
      ) {
        resetFlake(flake, true);
        continue;
      }

      context.globalAlpha = flake.alpha;
      context.fillStyle = "#ffffff";
      context.beginPath();
      context.arc(drawX, drawY, flake.radius, 0, Math.PI * 2);
      context.fill();
    }

    context.globalAlpha = 1;
    requestAnimationFrame(drawSnowFrame);
  }

  window.addEventListener("resize", resizeCanvas, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", clearPointerState, { passive: true });
  window.addEventListener("blur", clearPointerState, { passive: true });

  resizeCanvas();
  drawSnowFrame();
})();
