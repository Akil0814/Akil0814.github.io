// ===== Small UI bits =====
const $ = (s) => document.querySelector(s);

const yearEl = $("#year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const statusText = $("#statusText");
const statuses = [
  "Rendering neon...",
  "Compiling vibes...",
  "Linking shaders...",
  "Optimizing aesthetics...",
  "Ready."
];
let st = 0;
setInterval(() => {
  if (!statusText) return;
  st = (st + 1) % statuses.length;
  statusText.textContent = statuses[st];
}, 1400);

const themeBtn = $("#themeBtn");
const toggleFx = $("#toggleFx");

function setTheme(next) {
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}
function getTheme() {
  return localStorage.getItem("theme") || "dark";
}
setTheme(getTheme());

themeBtn?.addEventListener("click", () => {
  const cur = getTheme();
  setTheme(cur === "dark" ? "light" : "dark");
});

function setFx(on) {
  document.body.classList.toggle("fx-off", !on);
  localStorage.setItem("fx", on ? "on" : "off");
}
function getFx() {
  return (localStorage.getItem("fx") || "on") === "on";
}
setFx(getFx());

toggleFx?.addEventListener("click", () => {
  setFx(!getFx());
});

// ===== Starfield canvas =====
const canvas = $("#stars");
const ctx = canvas?.getContext("2d");
let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

const state = {
  stars: [],
  mouseX: 0.5,
  mouseY: 0.5,
  t: 0
};

function resize() {
  if (!canvas || !ctx) return;
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.floor((w * h) / 18000);
  state.stars = Array.from({ length: Math.max(80, count) }, () => makeStar());
}

function makeStar() {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    z: Math.random() * 0.9 + 0.1,
    r: Math.random() * 1.2 + 0.4,
    tw: Math.random() * Math.PI * 2
  };
}

function draw() {
  if (!canvas || !ctx) return;
  const fxOn = getFx();
  ctx.clearRect(0, 0, w, h);

  const mx = state.mouseX;
  const my = state.mouseY;
  const driftX = (mx - 0.5) * 30;
  const driftY = (my - 0.5) * 30;

  state.t += 0.016;

  for (const s of state.stars) {
    s.tw += 0.02 + s.z * 0.02;
    const twinkle = 0.6 + Math.sin(s.tw) * 0.4;

    const px = s.x + driftX * (0.3 + s.z);
    const py = s.y + driftY * (0.3 + s.z);

    let alpha = (0.25 + s.z * 0.55) * twinkle;
    if (!fxOn) alpha *= 0.65;

    ctx.beginPath();
    ctx.arc(px, py, s.r * (0.6 + s.z), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    ctx.fill();

    // subtle streaks
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

window.addEventListener("resize", resize, { passive: true });
window.addEventListener("mousemove", (e) => {
  state.mouseX = e.clientX / window.innerWidth;
  state.mouseY = e.clientY / window.innerHeight;
}, { passive: true });

// init
resize();
draw();
