// =========================================================
// script.js
// 这份脚本只做“页面交互 + 轻量背景特效”三件事：
// 1) 站点提示（建设中，只弹一次）
// 2) UI：年份、状态轮播、Theme / FX 开关（并记住选择）
// 3) Canvas 星空：不影响内容交互的背景装饰
// =========================================================

(() => {
  // ---------------------------------------------------------
  // Tiny helper: $()
//  - document.querySelector 的快捷方式
  // ---------------------------------------------------------
  const $ = (s) => document.querySelector(s);

  // ---------------------------------------------------------
  // 0) “建设中”弹窗（只弹一次）
//  - 之前你写在 HTML 里，这里挪到 JS，HTML 更干净
  // ---------------------------------------------------------
  window.addEventListener("load", () => {
    const key = "site_building_notice_shown";
    if (!localStorage.getItem(key)) {
      alert("⚠️ 正在建设中/currently under construction ⚠️");
      localStorage.setItem(key, "1");
    }
  });

  // ---------------------------------------------------------
  // 1) Footer 年份自动填充
  // ---------------------------------------------------------
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------------------------------------------------------
  // 2) 状态文字轮播（me 里的 Status）
  // ---------------------------------------------------------
  const statusText = $("#statusText");
  const statuses = ["Learning..."];
  let st = 0;

  // 每 1.4s 换一句（列表长度为 1 时其实不会变，但留着给你以后扩展）
  setInterval(() => {
    if (!statusText) return;
    st = (st + 1) % statuses.length;
    statusText.textContent = statuses[st];
  }, 1400);

  // ---------------------------------------------------------
  // 3) Theme / FX 控件节点
  // ---------------------------------------------------------
  const themeBtn = $("#themeBtn");
  const toggleFx = $("#toggleFx");

  // ---------------------------------------------------------
  // 3.1) Theme control
  //  - 把主题写到 <html data-theme="...">
  //  - 用 localStorage 记住 "dark" 或 "light"
  // ---------------------------------------------------------
  function setTheme(next) {
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }
  function getTheme() {
    return localStorage.getItem("theme") || "dark";
  }

  // 初始化主题
  setTheme(getTheme());

  // 点击切换主题
  themeBtn?.addEventListener("click", () => {
    const cur = getTheme();
    setTheme(cur === "dark" ? "light" : "dark");
  });

  // ---------------------------------------------------------
  // 3.2) FX control（背景特效开关）
  //  - 通过给 <body> 加/删 .fx-off 控制 CSS 特效显示
  //  - 用 localStorage 记住是否开启
  //  - 额外：把当前状态缓存到内存里，避免每帧读 localStorage
  // ---------------------------------------------------------
  const uiState = {
    fxOn: true,
  };

  function setFx(on) {
    uiState.fxOn = on;
    document.body.classList.toggle("fx-off", !on);
    localStorage.setItem("fx", on ? "on" : "off");
  }
  function getFx() {
    return (localStorage.getItem("fx") || "on") === "on";
  }

  // 初始化 FX
  setFx(getFx());
  // ---------------------------------------------------------
  // 3.3) Moon peek（贴顶月亮：顶部全显，滚动半显）
  //  - 通过给 <body> 加/删 .moon-docked 控制 CSS 裁切
  //  - 顶部（scrollY 很小）显示完整月亮；往下滚动就只露出一半
  // ---------------------------------------------------------
  function updateMoonPeek() {
    // 给一点点容忍区，避免滚动到 1px 就抖
    const docked = window.scrollY > 100;
    document.body.classList.toggle("moon-docked", docked);
  }

  // 首次更新 + 监听滚动
  updateMoonPeek();
  window.addEventListener("scroll", updateMoonPeek, { passive: true });



  // 点击切换 FX
  toggleFx?.addEventListener("click", () => {
    setFx(!uiState.fxOn);
  });

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
      if (uiState.fxOn && s.z > 0.65) {
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - driftX * 0.06, py - driftY * 0.06);
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
})();
