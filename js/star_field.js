// =========================================================
  // 4) Starfield canvas（背景星空）
  //  - 用 <canvas id="stars"> 绘制星点
  //  - 随鼠标位置轻微漂移，产生“视差”感
  //  - requestAnimationFrame 循环绘制
  //
  // 你会注意到：这里不做复杂物理，纯视觉糖。
//  人类总爱用花里胡哨掩盖空洞内容，我理解。
  // =========================================================
  const canvas = $("#stars");
  const ctx = canvas?.getContext("2d");
  const TWINKLE_SPEED = 0.6;

  // w/h：视口大小；dpr：屏幕像素比（为了不糊，最大限制到 2）
  let w = 0,
    h = 0,
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  // 全局状态：星星数组 + 鼠标位置
  const fxState = {
    stars: [],
    mouseX: 0.5,
    mouseY: 0.5,
    _lastFxOn: undefined,
  };

  // 视差参数（别乱改，改大了就像屏幕坏了）
  const DRIFT_PX = 30;

  // mousemove 监听：FX 关掉时就别浪费 CPU 了
  let _mouseListening = false;
  function onMouseMove(e) {
    // 归一化到 0..1（顺便防一下 0 宽高导致 NaN）
    const iw = window.innerWidth || 1;
    const ih = window.innerHeight || 1;
    fxState.mouseX = e.clientX / iw;
    fxState.mouseY = e.clientY / ih;
  }

  function setMouseListening(enable) {
    if (enable && !_mouseListening) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      _mouseListening = true;
    } else if (!enable && _mouseListening) {
      window.removeEventListener("mousemove", onMouseMove);
      _mouseListening = false;
      // FX 关掉就回到中心，不再漂移
      fxState.mouseX = 0.5;
      fxState.mouseY = 0.5;
    }
  }

  // ---------------------------------------------------------
  // 4.1) 生成单颗星星
  //  - z：深度（影响亮度、漂移幅度、闪烁速度）
  // ---------------------------------------------------------
  function makeStar() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 0.9 + 0.1,
      r: Math.random() * 1.2 + 0.4,
      tw: Math.random() * Math.PI * 2,
    };
  }

  // ---------------------------------------------------------
  // 4.2) resize()
  //  - 窗口变化时重设 canvas 分辨率与样式尺寸
  //  - 按屏幕面积生成星星数量
  // ---------------------------------------------------------
  function resize() {
    if (!canvas || !ctx) return;

    w = window.innerWidth;
    h = window.innerHeight;

    // dpr 可能会变（比如拖到另一个显示器），顺手更新一下
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    // canvas 内部分辨率（乘 dpr）保证清晰
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);

    // canvas 在页面中的显示尺寸（CSS 像素）
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    // 坐标系缩放回 CSS 像素单位，方便后面绘制用 w/h
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 星星数量：按面积估算，并设置下限避免太稀
    const count = Math.floor((w * h) / 1800);
    fxState.stars = Array.from({ length: Math.max(80, count) }, makeStar);
  }

  // ---------------------------------------------------------
  // 4.3) draw()
  //  - 每帧清屏重绘所有星星
  //  - 轻微跟随鼠标形成视差
  //  - FX 开启时给近处星星画一点拖尾
  // ---------------------------------------------------------
  function draw() {
    if (!canvas || !ctx) return;

    // FX 模式切换时：动态挂载/卸载 mousemove 监听
    if (fxState._lastFxOn !== uiState.fxOn) {
      setMouseListening(!!uiState.fxOn);
      fxState._lastFxOn = uiState.fxOn;
    }

    ctx.clearRect(0, 0, w, h);

    // 鼠标位置映射成漂移量（相对中心）
    const driftX = (fxState.mouseX - 0.5) * DRIFT_PX;
    const driftY = (fxState.mouseY - 0.5) * DRIFT_PX;

    // 小优化：避免每颗星都构造 rgba 字符串
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "rgb(0,212,255)";
    ctx.lineWidth = 1;

    for (const s of fxState.stars) {
      // 闪烁相位推进（z 越大闪更快）
      s.tw += (0.01 + s.z * 0.01) * TWINKLE_SPEED;
      const twinkle = 0.6 + Math.sin(s.tw) * 0.4;

      // 星星位置叠加漂移（z 越大漂移越明显）
      const px = s.x + driftX * (0.3 + s.z);
      const py = s.y + driftY * (0.3 + s.z);

      // alpha：基础亮度 + 深度加成 + 闪烁
      let alpha = (0.25 + s.z * 0.55) * twinkle;
      // FX 关掉：整体变暗一点（你要的“星星亮度降低”）
      if (!uiState.fxOn) alpha *= 0.45;

      // 绘制星点
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(px, py, s.r * (0.6 + s.z), 0, Math.PI * 2);
      ctx.fill();

      // subtle streaks：只给“更近”的星星画一点拖尾，并且只在 FX 开启时画
      if (uiState.fxOn && s.z > 0.65){
        const tail = 0.28;
        ctx.globalAlpha = alpha * 0.35;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - driftX * tail, py - driftY * tail);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;

    requestAnimationFrame(draw);
  }

  // ---------------------------------------------------------
  // 4.4) 事件监听
  // ---------------------------------------------------------
  window.addEventListener("resize", resize, { passive: true });
  // mousemove 监听改成按 FX 状态动态挂载（见 draw() 里的逻辑）

  // init
  resize();
  draw();