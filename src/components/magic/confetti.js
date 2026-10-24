/**
 * A short burst of confetti on a canvas — the "message sent" moment.
 *
 * Magic UI's Confetti wraps the canvas-confetti package. This is the same effect
 * in ~50 lines, so the contact form gains a celebration without a dependency:
 * particles launched upward from a point, pulled down by gravity, spinning, and
 * gone after about two seconds. It cleans up after itself — the canvas is removed
 * when the last particle has fallen — and does nothing for anyone who asked for
 * reduced motion.
 */
const COLORS = ["#6366f1", "#818cf8", "#38bdf8", "#a78bfa", "#22d3ee", "#f472b6", "#facc15"];

export function fireConfetti({ x = 0.5, y = 0.6, count = 90 } = {}) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "200",
  });
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const ox = x * window.innerWidth;
  const oy = y * window.innerHeight;
  const parts = Array.from({ length: count }, () => {
    const angle = (-90 + (Math.random() - 0.5) * 100) * (Math.PI / 180);
    const speed = 7 + Math.random() * 9;
    return {
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.4,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      life: 1,
    };
  });

  const started = performance.now();
  const frame = (now) => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let alive = 0;
    for (const p of parts) {
      p.vy += 0.32; // gravity
      p.vx *= 0.99; // a little drag
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life = Math.max(0, 1 - (now - started) / 2200);
      if (p.life > 0 && p.y < window.innerHeight + 20) {
        alive++;
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life * 2);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
        ctx.restore();
      }
    }
    if (alive) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}
