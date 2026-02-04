// =========================================================
// Small UI helpers
// - $() 只是 querySelector 的快捷方式
// - 年份自动更新
// - “statusText” 动态轮播一句话
// - Theme / FX 开关：用 localStorage 记住用户选择
// =========================================================

const $ = (s) => document.querySelector(s);

// --- Footer 年份自动填充 ---
const yearEl = $("#year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// --- 状态文字轮播（me 里的 Status） ---
const statusText = $("#statusText");
const statuses = [
  "Learning...",
];
let st = 0;

// 每 1.4s 换一句
setInterval(() => {
  if (!statusText) return;
  st = (st + 1) % statuses.length;
  statusText.textContent = statuses[st];
}, 1400);

// --- Theme / FX 按钮节点 ---
const themeBtn = $("#themeBtn");
const toggleFx = $("#toggleFx");

// =========================================================
// Theme control
// - 把主题写到 <html data-theme="...">
// - 用 localStorage 记住 "dark" 或 "light"
// =========================================================
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

// =========================================================
// FX control (背景特效开关)
// - 通过给 <body> 加/删 .fx-off 控制 CSS 中的特效显示
// - 用 localStorage 记住是否开启
// =========================================================
function setFx(on) {
  document.body.classList.toggle("fx-off", !on);
  localStorage.setItem("fx", on ? "on" : "off");
}
function getFx() {
  return (localStorage.getItem("fx") || "on") === "on";
}

// 初始化 FX
setFx(getFx());

// 点击切换 FX
toggleFx?.addEventListener("click", () => {
  setFx(!getFx());
});

// =========================================================
// Starfield canvas (背景星空)
// - 用 <canvas id="stars"> 绘制星点
// - 随鼠标位置轻微漂移，产生“视差”感
// - requestAnimationFrame 循环绘制
// =========================================================
const canvas = $("#stars");
const ctx = canvas?.getContext("2d");

// w/h：视口大小；dpr：屏幕像素比（为了不糊，最大限制到 2）
let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

// 全局状态：星星数组 + 鼠标位置 + 时间
const state = {
  stars: [],
  mouseX: 0.5,
  mouseY: 0.5,
  t: 0
};

// =========================================================
// resize()
// - 每次窗口变化时重设 canvas 分辨率与样式尺寸
// - 按屏幕面积生成星星数量
// =========================================================
function resize() {
  if (!canvas || !ctx) return;

  w = window.innerWidth;
  h = window.innerHeight;

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
  state.stars = Array.from({ length: Math.max(80, count) }, () => makeStar());
}

// =========================================================
// makeStar()
// - 生成单个星星参数
// - x/y：位置
// - z：深度（影响亮度、漂移幅度、闪烁速度）
// - r：半径
// - tw：闪烁相位
// =========================================================
function makeStar() {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    z: Math.random() * 0.9 + 0.1,
    r: Math.random() * 1.2 + 0.4,
    tw: Math.random() * Math.PI * 2
  };
}

// =========================================================
// draw()
// - 每帧清屏重绘所有星星
// - 轻微跟随鼠标（driftX/driftY）形成视差
// - fxOn 时额外画一点“拖尾”
// =========================================================
function draw() {
  if (!canvas || !ctx) return;

  // 当前 FX 状态（如果关闭，就整体弱化一点）
  const fxOn = getFx();

  ctx.clearRect(0, 0, w, h);

  // 鼠标位置映射成漂移量（相对中心）
  const mx = state.mouseX;
  const my = state.mouseY;
  const driftX = (mx - 0.5) * 30;
  const driftY = (my - 0.5) * 30;

  state.t += 0.016;

  for (const s of state.stars) {
    // 闪烁相位推进（z 越大闪更快）
    s.tw += 0.02 + s.z * 0.02;
    const twinkle = 0.6 + Math.sin(s.tw) * 0.4;

    // 星星位置叠加漂移（z 越大漂移越明显）
    const px = s.x + driftX * (0.3 + s.z);
    const py = s.y + driftY * (0.3 + s.z);

    // alpha：基础亮度 + 深度加成 + 闪烁
    let alpha = (0.25 + s.z * 0.55) * twinkle;
    if (!fxOn) alpha *= 0.65;

    // 绘制星点
    ctx.beginPath();
    ctx.arc(px, py, s.r * (0.6 + s.z), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    ctx.fill();

    // subtle streaks：只给“更近”的星星画一点拖尾，并且只在 FX 开启时画
    if (fxOn && s.z > 0.65) {
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

// =========================================================
// Event listeners
// - resize：窗口变化重建 canvas 与星星
// - mousemove：更新漂移目标
// =========================================================
window.addEventListener("resize", resize, { passive: true });
window.addEventListener("mousemove", (e) => {
  state.mouseX = e.clientX / window.innerWidth;
  state.mouseY = e.clientY / window.innerHeight;
}, { passive: true });

// init
resize();
draw();
