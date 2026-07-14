(function () {
  "use strict";

  const TAU = Math.PI * 2;
  const MIN_STAR_COUNT = 90;
  const MAX_STAR_COUNT = 120;
  const MAX_DPR = 1.5;

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function createRandom(seed) {
    let state = seed >>> 0;
    return function random() {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function init(canvas) {
    if (!(canvas instanceof HTMLCanvasElement)) return null;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return null;

    const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)") || null;
    const usesModernMotionListener = typeof motionQuery?.addEventListener === "function";
    let theme = document.documentElement.getAttribute("data-theme") || "dark";
    let fxEnabled = !document.body.classList.contains("fx-off");
    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars = [];
    let dust = [];
    let animationFrame = null;
    let resizeFrame = null;
    let previousTime = 0;
    let destroyed = false;

    function isVisible() {
      return theme === "dark" && fxEnabled;
    }

    function shouldAnimate() {
      return isVisible() && !document.hidden && !motionQuery?.matches;
    }

    function clear() {
      context.clearRect(0, 0, width, height);
    }

    function createParticles() {
      const area = width * height;
      const starCount = clamp(Math.round(area / 14000), MIN_STAR_COUNT, MAX_STAR_COUNT);
      const dustCount = clamp(Math.round(starCount * 0.34), 30, 40);
      const maximumRadius = Math.hypot(width * 0.58, height * 1.08);
      const random = createRandom(((width * 73856093) ^ (height * 19349663)) >>> 0);
      const bands = [
        [0.3, 0.56],
        [0.52, 0.79],
        [0.75, 1.04],
      ];

      stars = Array.from({ length: starCount }, (_, index) => {
        const layer = index % bands.length;
        const [innerRadius, outerRadius] = bands[layer];
        const radius = maximumRadius * (innerRadius + (outerRadius - innerRadius) * random());
        const period = 180000 + random() * 140000;
        const brightness = 0.34 + random() * 0.56;

        return {
          radius,
          angle: Math.PI + 0.04 + random() * (Math.PI - 0.08),
          angularVelocity: TAU / period,
          size: 0.55 + layer * 0.22 + random() * (0.7 + layer * 0.2),
          brightness,
          hue: random() > 0.58 ? "pink" : random() > 0.42 ? "violet" : "white",
          trail: brightness > 0.65 && random() < 0.34,
          trailLength: 4 + random() * 13,
          twinkleOffset: random() * TAU,
          twinkleSpeed: 0.00035 + random() * 0.00065,
        };
      });

      dust = Array.from({ length: dustCount }, () => ({
        x: random(),
        y: 0.76 + random() * 0.25,
        size: 0.45 + random() * 1.1,
        alpha: 0.14 + random() * 0.3,
        phase: random() * TAU,
      }));
    }

    function resize() {
      if (destroyed) return;

      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      createParticles();

      if (isVisible()) draw(performance.now(), false);
      else clear();
    }

    function drawHorizon() {
      const centerX = width * 0.5;
      const centerY = height * 1.055;
      const radiusX = Math.max(width * 0.7, 520);
      const radiusY = Math.max(height * 0.28, 160);
      const lowerGlow = context.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        Math.max(width, height) * 0.72
      );

      lowerGlow.addColorStop(0, "rgba(113, 92, 255, 0.16)");
      lowerGlow.addColorStop(0.42, "rgba(196, 91, 255, 0.075)");
      lowerGlow.addColorStop(1, "rgba(73, 62, 190, 0)");
      context.fillStyle = lowerGlow;
      context.fillRect(0, height * 0.58, width, height * 0.42);

      context.save();
      context.globalCompositeOperation = "screen";
      context.beginPath();
      context.ellipse(centerX, centerY, radiusX, radiusY, 0, Math.PI, TAU);
      context.strokeStyle = "rgba(239, 151, 255, 0.34)";
      context.lineWidth = 1.1;
      context.shadowColor = "rgba(222, 103, 255, 0.58)";
      context.shadowBlur = 14;
      context.stroke();

      context.beginPath();
      context.ellipse(centerX, centerY + 3, radiusX * 1.035, radiusY * 1.08, 0, Math.PI, TAU);
      context.strokeStyle = "rgba(141, 128, 255, 0.14)";
      context.lineWidth = 2.4;
      context.shadowBlur = 24;
      context.stroke();
      context.restore();
    }

    function drawDust(time) {
      context.save();
      context.globalCompositeOperation = "screen";

      for (const particle of dust) {
        const shimmer = 0.72 + Math.sin(time * 0.00045 + particle.phase) * 0.28;
        const alpha = particle.alpha * shimmer;
        context.beginPath();
        context.arc(particle.x * width, particle.y * height, particle.size, 0, TAU);
        context.fillStyle = `rgba(236, 151, 255, ${alpha})`;
        context.shadowColor = "rgba(211, 104, 255, 0.42)";
        context.shadowBlur = particle.size * 5;
        context.fill();
      }

      context.restore();
    }

    function starColor(star, alpha) {
      if (star.hue === "pink") return `rgba(255, 157, 232, ${alpha})`;
      if (star.hue === "violet") return `rgba(178, 165, 255, ${alpha})`;
      return `rgba(247, 240, 255, ${alpha})`;
    }

    function drawStars(time, advance, deltaTime) {
      const centerX = width * 0.5;
      const centerY = height * 1.08;

      context.save();
      context.globalCompositeOperation = "screen";

      for (const star of stars) {
        if (advance) {
          star.angle += star.angularVelocity * deltaTime;
          if (star.angle >= TAU) star.angle = Math.PI + (star.angle - TAU);
        }

        const x = centerX + Math.cos(star.angle) * star.radius;
        const y = centerY + Math.sin(star.angle) * star.radius;
        if (x < -24 || x > width + 24 || y < -24 || y > height + 28) continue;

        const twinkle = 0.78 + Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.22;
        const alpha = star.brightness * twinkle;
        const color = starColor(star, alpha);

        if (star.trail) {
          const tangentX = -Math.sin(star.angle);
          const tangentY = Math.cos(star.angle);
          const startX = x - tangentX * star.trailLength;
          const startY = y - tangentY * star.trailLength;
          const trailGradient = context.createLinearGradient(startX, startY, x, y);
          trailGradient.addColorStop(0, starColor(star, 0));
          trailGradient.addColorStop(1, starColor(star, alpha * 0.82));
          context.beginPath();
          context.moveTo(startX, startY);
          context.lineTo(x, y);
          context.strokeStyle = trailGradient;
          context.lineWidth = Math.max(0.65, star.size * 0.72);
          context.shadowColor = color;
          context.shadowBlur = 5 + star.size * 3;
          context.stroke();
        }

        context.beginPath();
        context.arc(x, y, star.size, 0, TAU);
        context.fillStyle = color;
        context.shadowColor = color;
        context.shadowBlur = 4 + star.size * 4;
        context.fill();
      }

      context.restore();
    }

    function draw(time, advance = true, deltaTime = 0) {
      clear();
      drawHorizon();
      drawDust(time);
      drawStars(time, advance, deltaTime);
    }

    function frame(time) {
      if (!shouldAnimate()) {
        animationFrame = null;
        if (isVisible()) draw(time, false);
        return;
      }

      const deltaTime = previousTime ? Math.min(time - previousTime, 50) : 0;
      previousTime = time;
      draw(time, true, deltaTime);
      animationFrame = window.requestAnimationFrame(frame);
    }

    function stop() {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      previousTime = 0;
    }

    function sync() {
      if (!isVisible()) {
        stop();
        clear();
        return;
      }

      draw(performance.now(), false);
      if (shouldAnimate() && animationFrame === null) {
        previousTime = 0;
        animationFrame = window.requestAnimationFrame(frame);
      } else if (!shouldAnimate()) {
        stop();
      }
    }

    function setTheme(nextTheme) {
      theme = nextTheme === "light" ? "light" : "dark";
      sync();
    }

    function setFx(enabled) {
      fxEnabled = Boolean(enabled);
      sync();
    }

    function queueResize() {
      if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = null;
        resize();
        sync();
      });
    }

    function onVisibilityChange() {
      sync();
    }

    function onMotionPreferenceChange() {
      sync();
    }

    window.addEventListener("resize", queueResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    if (usesModernMotionListener) motionQuery.addEventListener("change", onMotionPreferenceChange);
    else motionQuery?.addListener?.(onMotionPreferenceChange);
    resize();
    sync();

    return {
      setTheme,
      setFx,
      resize,
      destroy() {
        if (destroyed) return;
        destroyed = true;
        stop();
        if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame);
        window.removeEventListener("resize", queueResize);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        if (usesModernMotionListener) motionQuery.removeEventListener("change", onMotionPreferenceChange);
        else motionQuery?.removeListener?.(onMotionPreferenceChange);
        clear();
      },
    };
  }

  window.ElysiaCosmos = { init };
})();
