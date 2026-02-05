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

  // w/h：视口大小；dpr：屏幕像素比（为了不糊，最大限制到 2）
  let w = 0,
    h = 0,
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  // 全局状态：星星数组 + 鼠标位置
  const fxState = {
    stars: [],
    mouseX: 0.5,
    mouseY: 0.5,
  };

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

    ctx.clearRect(0, 0, w, h);

    // 鼠标位置映射成漂移量（相对中心）
    const driftX = (fxState.mouseX - 0.5) * 30;
    const driftY = (fxState.mouseY - 0.5) * 30;

    for (const s of fxState.stars) {
      // 闪烁相位推进（z 越大闪更快）
      s.tw += 0.02 + s.z * 0.02;
      const twinkle = 0.6 + Math.sin(s.tw) * 0.4;

      // 星星位置叠加漂移（z 越大漂移越明显）
      const px = s.x + driftX * (0.3 + s.z);
      const py = s.y + driftY * (0.3 + s.z);

      // alpha：基础亮度 + 深度加成 + 闪烁
      let alpha = (0.25 + s.z * 0.55) * twinkle;
      if (!uiState.fxOn) alpha *= 0.65;

      // 绘制星点
      ctx.beginPath();
      ctx.arc(px, py, s.r * (0.6 + s.z), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
      ctx.fill();

      // subtle streaks：只给“更近”的星星画一点拖尾，并且只在 FX 开启时画
      if (uiState.fxOn && s.z > 0.65){
        const tail = 0.28;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - driftX * tail, py - driftY * tail);
        ctx.strokeStyle = `rgba(0,212,255,${(alpha * 0.35).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    requestAnimationFrame(draw);
  }

  // ---------------------------------------------------------
  // 4.4) 事件监听
  // ---------------------------------------------------------
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener(
    "mousemove",
    (e) => {
      fxState.mouseX = e.clientX / window.innerWidth;
      fxState.mouseY = e.clientY / window.innerHeight;
    },
    { passive: true }
  );

  // init
  resize();
  draw();