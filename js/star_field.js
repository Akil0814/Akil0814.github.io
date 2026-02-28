// Starfield background rendered on <canvas id="stars">.
(function () {
  const canvasElement = $("#stars");
  if (!canvasElement) return;

  const context = canvasElement.getContext("2d");
  if (!context) return;

  const TWINKLE_SPEED = 0.6;
  const POINTER_DRIFT_PIXELS = 30;

  let viewportWidth = 0;
  let viewportHeight = 0;
  let devicePixelRatio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  const starfieldState = {
    stars: [],
    pointerXRatio: 0.5,
    pointerYRatio: 0.5,
    lastFxEnabled: undefined,
  };

  let isMouseMoveListenerAttached = false;

  function isFxEnabled() {
    return typeof uiState === "undefined" ? true : !!uiState.fxOn;
  }

  function onMouseMove(event) {
    const safeWidth = window.innerWidth || 1;
    const safeHeight = window.innerHeight || 1;
    starfieldState.pointerXRatio = event.clientX / safeWidth;
    starfieldState.pointerYRatio = event.clientY / safeHeight;
  }

  function setMouseMoveListener(enabled) {
    if (enabled && !isMouseMoveListenerAttached) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      isMouseMoveListenerAttached = true;
      return;
    }

    if (!enabled && isMouseMoveListenerAttached) {
      window.removeEventListener("mousemove", onMouseMove);
      isMouseMoveListenerAttached = false;
      starfieldState.pointerXRatio = 0.5;
      starfieldState.pointerYRatio = 0.5;
    }
  }

  function createStar() {
    const depth = Math.random() * 0.9 + 0.1;
    return {
      x: Math.random() * viewportWidth,
      y: Math.random() * viewportHeight,
      depth,
      radius: Math.random() * 1.2 + 0.4,
      twinklePhase: Math.random() * Math.PI * 2,
    };
  }

  function resizeCanvas() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    devicePixelRatio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    canvasElement.width = Math.floor(viewportWidth * devicePixelRatio);
    canvasElement.height = Math.floor(viewportHeight * devicePixelRatio);
    canvasElement.style.width = `${viewportWidth}px`;
    canvasElement.style.height = `${viewportHeight}px`;
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    const estimatedStarCount = Math.floor((viewportWidth * viewportHeight) / 1800);
    const starCount = Math.max(80, estimatedStarCount);
    starfieldState.stars = Array.from({ length: starCount }, createStar);
  }

  function drawStarfieldFrame() {
    const fxEnabled = isFxEnabled();
    if (starfieldState.lastFxEnabled !== fxEnabled) {
      setMouseMoveListener(fxEnabled);
      starfieldState.lastFxEnabled = fxEnabled;
    }

    context.clearRect(0, 0, viewportWidth, viewportHeight);

    const pointerOffsetX = (starfieldState.pointerXRatio - 0.5) * POINTER_DRIFT_PIXELS;
    const pointerOffsetY = (starfieldState.pointerYRatio - 0.5) * POINTER_DRIFT_PIXELS;

    context.fillStyle = "#fff";
    context.strokeStyle = "rgb(0,212,255)";
    context.lineWidth = 1;

    for (const star of starfieldState.stars) {
      star.twinklePhase += (0.01 + star.depth * 0.01) * TWINKLE_SPEED;
      const twinkleIntensity = 0.6 + Math.sin(star.twinklePhase) * 0.4;

      const drawX = star.x + pointerOffsetX * (0.3 + star.depth);
      const drawY = star.y + pointerOffsetY * (0.3 + star.depth);

      let alpha = (0.25 + star.depth * 0.55) * twinkleIntensity;
      if (!fxEnabled) alpha *= 0.45;

      context.globalAlpha = alpha;
      context.beginPath();
      context.arc(drawX, drawY, star.radius * (0.6 + star.depth), 0, Math.PI * 2);
      context.fill();

      if (fxEnabled && star.depth > 0.65) {
        const trailFactor = 0.28;
        context.globalAlpha = alpha * 0.35;
        context.beginPath();
        context.moveTo(drawX, drawY);
        context.lineTo(drawX - pointerOffsetX * trailFactor, drawY - pointerOffsetY * trailFactor);
        context.stroke();
      }
    }

    context.globalAlpha = 1;
    requestAnimationFrame(drawStarfieldFrame);
  }

  window.addEventListener("resize", resizeCanvas, { passive: true });
  resizeCanvas();
  drawStarfieldFrame();
})();
