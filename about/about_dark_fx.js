(function () {
  const TAU = Math.PI * 2;
  const BASE_AREA = 1920 * 1080;

  const selectElement = typeof window.$ === "function"
    ? window.$
    : (selector) => document.querySelector(selector);

  const config = window.aboutDarkFxConfig;
  if (!config) return;

  const canvasElement = selectElement(`#${config.canvasId || "stars"}`);
  if (!canvasElement) return;

  const context = canvasElement.getContext("2d");
  if (!context) return;

  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    layers: [],
    wasRendererActive: false,
    pointer: {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
    },
    meteor: null,
    nextMeteorAtMs: 0,
    lastFrameTimeMs: performance.now(),
    lastPrimaryConstellation: -1,
    lastPrimaryChangeMs: 0,
    focusPulse: {
      anchor: "",
      startMs: 0,
    },
  };

  function clamp(value, minValue, maxValue) {
    return Math.min(maxValue, Math.max(minValue, value));
  }

  function lerp(startValue, endValue, ratio) {
    return startValue + (endValue - startValue) * ratio;
  }

  function easeInOut(ratio) {
    const normalized = clamp(ratio, 0, 1);
    return 0.5 - 0.5 * Math.cos(normalized * Math.PI);
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
    return getTheme() === "dark" && isFxEnabled();
  }

  function scheduleNextMeteor(nowMs) {
    const meteorConfig = config.meteors;
    if (!meteorConfig?.enabled) {
      state.nextMeteorAtMs = Number.POSITIVE_INFINITY;
      return;
    }

    const waitMs = randomRange(meteorConfig.minIntervalMs, meteorConfig.maxIntervalMs);
    state.nextMeteorAtMs = nowMs + waitMs;
  }

  function createStar(layerConfig) {
    return {
      xRatio: Math.random(),
      yRatio: Math.random(),
      radius: randomRange(layerConfig.radius[0], layerConfig.radius[1]),
      alphaBase: randomRange(layerConfig.alpha[0], layerConfig.alpha[1]),
      twinklePhase: Math.random() * TAU,
      twinkleSpeed: randomRange(layerConfig.twinkleSpeed[0], layerConfig.twinkleSpeed[1]),
      twinkleStrength: layerConfig.twinkleStrength * randomRange(0.75, 1.2),
    };
  }

  function rebuildStarLayers() {
    const areaRatio = clamp((state.width * state.height) / BASE_AREA, 0.7, 1.7);
    state.layers = config.layers.map((layerConfig) => {
      const starCount = Math.max(24, Math.round(layerConfig.count * areaRatio));
      return {
        config: layerConfig,
        stars: Array.from({ length: starCount }, () => createStar(layerConfig)),
      };
    });
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

    rebuildStarLayers();
  }

  function onPointerMove(event) {
    if (!isRendererActive()) return;

    const x = clamp(event.clientX / state.width, 0, 1);
    const y = clamp(event.clientY / state.height, 0, 1);
    state.pointer.targetX = (x - 0.5) * 2;
    state.pointer.targetY = (y - 0.5) * 2;
  }

  function onPointerReset() {
    state.pointer.targetX = 0;
    state.pointer.targetY = 0;
  }

  function getParallaxOffset(parallaxFactor) {
    const pointerConfig = config.pointer;
    return {
      x: state.pointer.currentX * pointerConfig.maxOffsetX * parallaxFactor,
      y: state.pointer.currentY * pointerConfig.maxOffsetY * parallaxFactor,
    };
  }

  function buildAnchorPositions(parallaxFactor) {
    const majorStars = config.majorStars.stars;
    const offset = getParallaxOffset(parallaxFactor);
    return {
      deneb: {
        x: state.width * majorStars.deneb.x + offset.x,
        y: state.height * majorStars.deneb.y + offset.y,
      },
      vega: {
        x: state.width * majorStars.vega.x + offset.x,
        y: state.height * majorStars.vega.y + offset.y,
      },
      altair: {
        x: state.width * majorStars.altair.x + offset.x,
        y: state.height * majorStars.altair.y + offset.y,
      },
    };
  }

  function drawStarLayers(deltaTimeSec) {
    for (const layer of state.layers) {
      const layerConfig = layer.config;
      const offset = getParallaxOffset(layerConfig.parallax);
      const layerColor = layerConfig.color.join(", ");

      context.fillStyle = `rgb(${layerColor})`;
      for (const star of layer.stars) {
        star.twinklePhase += deltaTimeSec * star.twinkleSpeed;

        const twinkleRatio = 0.5 + 0.5 * Math.sin(star.twinklePhase);
        const twinkleAlpha = lerp(1 - star.twinkleStrength, 1, twinkleRatio);
        const alpha = star.alphaBase * twinkleAlpha;

        const drawX = star.xRatio * state.width + offset.x;
        const drawY = star.yRatio * state.height + offset.y;
        if (
          drawX < -4 ||
          drawX > state.width + 4 ||
          drawY < -4 ||
          drawY > state.height + 4
        ) {
          continue;
        }

        context.globalAlpha = alpha;
        context.beginPath();
        context.arc(drawX, drawY, star.radius, 0, TAU);
        context.fill();
      }
    }

    context.globalAlpha = 1;
  }

  function spawnMeteor(nowMs) {
    const meteorConfig = config.meteors;
    const startX = state.width * randomRange(meteorConfig.spawnXRatio[0], meteorConfig.spawnXRatio[1]);
    const startY = state.height * randomRange(meteorConfig.spawnYRatio[0], meteorConfig.spawnYRatio[1]);
    const angle = randomRange(meteorConfig.angleRad[0], meteorConfig.angleRad[1]);

    state.meteor = {
      startMs: nowMs,
      durationMs: randomRange(meteorConfig.durationMs[0], meteorConfig.durationMs[1]),
      speed: randomRange(meteorConfig.speedPxPerSec[0], meteorConfig.speedPxPerSec[1]),
      tailLength: randomRange(meteorConfig.tailLengthPx[0], meteorConfig.tailLengthPx[1]),
      thickness: randomRange(meteorConfig.thickness[0], meteorConfig.thickness[1]),
      alpha: meteorConfig.alpha,
      color: meteorConfig.color,
      angle,
      startX,
      startY,
    };
  }

  function drawMeteor(nowMs) {
    if (!config.meteors?.enabled) return;

    if (!state.meteor && nowMs >= state.nextMeteorAtMs) {
      spawnMeteor(nowMs);
      scheduleNextMeteor(nowMs);
    }

    const meteor = state.meteor;
    if (!meteor) return;

    const elapsedMs = nowMs - meteor.startMs;
    const progress = elapsedMs / meteor.durationMs;
    if (progress >= 1) {
      state.meteor = null;
      return;
    }

    const elapsedSec = elapsedMs / 1000;
    const traveledDistance = meteor.speed * elapsedSec;
    const directionX = Math.cos(meteor.angle);
    const directionY = Math.sin(meteor.angle);
    const headX = meteor.startX + directionX * traveledDistance;
    const headY = meteor.startY + directionY * traveledDistance;

    if (
      headX < -120 ||
      headX > state.width + 120 ||
      headY < -120 ||
      headY > state.height + 120
    ) {
      state.meteor = null;
      return;
    }

    const fade = Math.sin(clamp(progress, 0, 1) * Math.PI);
    const alpha = meteor.alpha * fade;
    const tailLength = meteor.tailLength * (0.8 + progress * 0.35);
    const tailX = headX - directionX * tailLength;
    const tailY = headY - directionY * tailLength;

    const [r, g, b] = meteor.color;
    const tailGradient = context.createLinearGradient(headX, headY, tailX, tailY);
    tailGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
    tailGradient.addColorStop(0.65, `rgba(${r}, ${g}, ${b}, ${alpha * 0.2})`);
    tailGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    context.lineCap = "round";
    context.lineWidth = meteor.thickness;
    context.strokeStyle = tailGradient;
    context.beginPath();
    context.moveTo(headX, headY);
    context.lineTo(tailX, tailY);
    context.stroke();

    context.globalAlpha = alpha * 0.75;
    context.fillStyle = `rgb(${r}, ${g}, ${b})`;
    context.beginPath();
    context.arc(headX, headY, meteor.thickness * 1.2, 0, TAU);
    context.fill();
    context.globalAlpha = 1;
  }

  function getConstellationCycle(nowMs, constellationConfig) {
    const items = constellationConfig?.items || [];
    const constellationCount = items.length;
    const weights = new Array(constellationCount).fill(0);

    if (!constellationConfig || !constellationConfig.cycle || constellationCount <= 1) {
      weights[0] = 1;
      return { weights, primaryIndex: 0 };
    }

    const slotDuration = constellationConfig.cyclePeriodMs / constellationCount;
    const phaseOffsetMs = constellationConfig.phaseOffsetMs || 0;
    const normalizedTime = (((nowMs + phaseOffsetMs) % constellationConfig.cyclePeriodMs) +
      constellationConfig.cyclePeriodMs) %
      constellationConfig.cyclePeriodMs;
    const currentIndex = Math.floor(normalizedTime / slotDuration);
    const slotTime = normalizedTime - currentIndex * slotDuration;
    const slotProgress = clamp(slotTime / slotDuration, 0, 1);
    // One constellation per slot: dark -> bright -> dark.
    const pulseWeight = 0.5 - 0.5 * Math.cos(slotProgress * TAU);
    weights[currentIndex] = pulseWeight;
    return { weights, primaryIndex: currentIndex };
  }

  function updateFocusPulse(primaryIndex, nowMs) {
    if (primaryIndex === state.lastPrimaryConstellation) return;
    if (
      state.lastPrimaryConstellation !== -1 &&
      nowMs - state.lastPrimaryChangeMs < 280
    ) {
      return;
    }

    state.lastPrimaryConstellation = primaryIndex;
    state.lastPrimaryChangeMs = nowMs;
    const activeConstellation = config.constellations.items[primaryIndex];
    if (!activeConstellation) return;

    state.focusPulse.anchor = activeConstellation.anchor;
    state.focusPulse.startMs = nowMs;
  }

  function buildAnchorBoosts(weights, nowMs) {
    const boosts = { deneb: 0, vega: 0, altair: 0 };
    const focusBoost = config.majorStars.focusBoost;

    config.constellations.items.forEach((item, index) => {
      const weight = weights[index] || 0;
      boosts[item.anchor] = Math.max(boosts[item.anchor], weight * focusBoost);
    });

    if (state.focusPulse.anchor) {
      const pulseAge = nowMs - state.focusPulse.startMs;
      if (pulseAge <= config.majorStars.focusPulseDurationMs) {
        const ratio = 1 - pulseAge / config.majorStars.focusPulseDurationMs;
        const pulseStrength = easeInOut(ratio) * 0.26;
        boosts[state.focusPulse.anchor] = clamp(
          boosts[state.focusPulse.anchor] + pulseStrength,
          0,
          1
        );
      }
    }

    return boosts;
  }

  function drawConstellationLayer(nowMs, constellationConfig, weights, namedAnchors) {
    const shortSide = Math.min(state.width, state.height);
    const [lineR, lineG, lineB] = constellationConfig.color;
    const nodeConfig = constellationConfig.nodes;
    const flowConfig = constellationConfig.flowHighlight;
    const inactiveAlpha = constellationConfig.inactiveAlphaMode === "summerTriangle"
      ? config.summerTriangle.alpha
      : constellationConfig.inactiveAlpha;
    const groupOffset = getParallaxOffset(constellationConfig.parallax || 0);

    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = constellationConfig.lineWidth;
    context.globalAlpha = 1;

    constellationConfig.items.forEach((item, itemIndex) => {
      let anchor = null;
      if (item.anchor && namedAnchors && namedAnchors[item.anchor]) {
        anchor = namedAnchors[item.anchor];
      } else if (item.anchorPos) {
        anchor = {
          x: state.width * item.anchorPos[0] + groupOffset.x,
          y: state.height * item.anchorPos[1] + groupOffset.y,
        };
      }
      if (!anchor) return;

      const scaledPoints = item.points.map(([x, y]) => ({
        x: anchor.x + x * shortSide * item.scale,
        y: anchor.y + y * shortSide * item.scale,
      }));

      if (nodeConfig) {
        context.globalAlpha = 1;
        const [nodeR, nodeG, nodeB] = nodeConfig.color;
        context.fillStyle = `rgba(${nodeR}, ${nodeG}, ${nodeB}, ${nodeConfig.alpha})`;
        for (const point of scaledPoints) {
          context.beginPath();
          context.arc(point.x, point.y, nodeConfig.radius, 0, TAU);
          context.fill();
        }
      }

      const weight = weights[itemIndex] || 0;
      const lineAlpha = lerp(inactiveAlpha, constellationConfig.activeAlpha, weight);
      if (lineAlpha <= 0.003) return;

      context.globalAlpha = 1;
      context.strokeStyle = `rgba(${lineR}, ${lineG}, ${lineB}, ${lineAlpha})`;
      for (const [startIndex, endIndex] of item.lines) {
        const startPoint = scaledPoints[startIndex];
        const endPoint = scaledPoints[endIndex];
        if (!startPoint || !endPoint) continue;
        context.beginPath();
        context.moveTo(startPoint.x, startPoint.y);
        context.lineTo(endPoint.x, endPoint.y);
        context.stroke();
      }

      if (!flowConfig?.enabled || weight <= 0.01) return;
      const [flowR, flowG, flowB] = flowConfig.color;
      const flowBase = (nowMs * 0.001 * flowConfig.speed) % 1;

      item.lines.forEach(([startIndex, endIndex], lineIndex) => {
        const startPoint = scaledPoints[startIndex];
        const endPoint = scaledPoints[endIndex];
        if (!startPoint || !endPoint) return;

        const progress = (flowBase + lineIndex * flowConfig.phaseStep) % 1;
        const flowX = lerp(startPoint.x, endPoint.x, progress);
        const flowY = lerp(startPoint.y, endPoint.y, progress);
        const alpha = weight * flowConfig.alpha * 0.8;

        context.globalAlpha = alpha;
        context.fillStyle = `rgb(${flowR}, ${flowG}, ${flowB})`;
        context.beginPath();
        context.arc(flowX, flowY, flowConfig.radius, 0, TAU);
        context.fill();
      });
    });

    context.globalAlpha = 1;
  }

  function drawSummerTriangle(anchors) {
    const triangleConfig = config.summerTriangle;
    const [r, g, b] = triangleConfig.color;

    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = triangleConfig.lineWidth;
    context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${triangleConfig.alpha})`;

    context.beginPath();
    context.moveTo(anchors.deneb.x, anchors.deneb.y);
    context.lineTo(anchors.vega.x, anchors.vega.y);
    context.lineTo(anchors.altair.x, anchors.altair.y);
    context.closePath();
    context.stroke();
  }

  function drawMajorStars(anchors, boosts) {
    const starConfigMap = config.majorStars.stars;
    const drawOrder = ["deneb", "vega", "altair"];

    for (const starName of drawOrder) {
      const anchor = anchors[starName];
      const starConfig = starConfigMap[starName];
      if (!anchor || !starConfig) continue;

      const boost = boosts[starName] || 0;
      const [r, g, b] = starConfig.color;
      const glowRadius = starConfig.glowRadius * (1 + boost * 0.45);
      const coreRadius = starConfig.radius * (1 + boost * 0.22);
      const coreAlpha = clamp(starConfig.alpha + boost * 0.28, 0, 1);

      const gradient = context.createRadialGradient(
        anchor.x,
        anchor.y,
        0,
        anchor.x,
        anchor.y,
        glowRadius
      );
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${starConfig.glowAlpha * (1 + boost * 0.6)})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      context.fillStyle = gradient;
      context.beginPath();
      context.arc(anchor.x, anchor.y, glowRadius, 0, TAU);
      context.fill();

      context.fillStyle = `rgba(${r}, ${g}, ${b}, ${coreAlpha})`;
      context.beginPath();
      context.arc(anchor.x, anchor.y, coreRadius, 0, TAU);
      context.fill();

      context.fillStyle = `rgba(255, 255, 255, ${0.45 + boost * 0.25})`;
      context.beginPath();
      context.arc(anchor.x, anchor.y, Math.max(0.8, coreRadius * 0.42), 0, TAU);
      context.fill();
    }
  }

  function clearCanvas() {
    context.clearRect(0, 0, state.width, state.height);
  }

  function renderFrame(nowMs) {
    const deltaTimeSec = clamp((nowMs - state.lastFrameTimeMs) / 1000, 0, 0.05);
    state.lastFrameTimeMs = nowMs;

    const smoothing = config.pointer.smoothing;
    state.pointer.currentX += (state.pointer.targetX - state.pointer.currentX) * smoothing;
    state.pointer.currentY += (state.pointer.targetY - state.pointer.currentY) * smoothing;

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

    drawStarLayers(deltaTimeSec);
    drawMeteor(nowMs);

    const summerConstellationCycle = getConstellationCycle(nowMs, config.constellations);
    const summerConstellationAnchors = buildAnchorPositions(config.constellations.parallax);
    drawConstellationLayer(
      nowMs,
      config.constellations,
      summerConstellationCycle.weights,
      summerConstellationAnchors
    );

    const extraConstellationConfig = config.extraConstellations;
    if (extraConstellationConfig?.items?.length) {
      const extraCycle = getConstellationCycle(nowMs, extraConstellationConfig);
      drawConstellationLayer(nowMs, extraConstellationConfig, extraCycle.weights, null);
    }

    const majorAnchors = buildAnchorPositions(config.majorStars.parallax);
    drawSummerTriangle(majorAnchors);
    drawMajorStars(majorAnchors, { deneb: 0, vega: 0, altair: 0 });

    requestAnimationFrame(renderFrame);
  }

  window.addEventListener("resize", resizeCanvas, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", onPointerReset, { passive: true });
  window.addEventListener("pointercancel", onPointerReset, { passive: true });
  window.addEventListener("blur", onPointerReset, { passive: true });

  resizeCanvas();
  scheduleNextMeteor(performance.now());
  requestAnimationFrame(renderFrame);
})();
