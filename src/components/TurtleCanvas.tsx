import { useEffect, useRef } from "react";

export type TurtleEvent = Record<string, any>;

interface TState { x: number; y: number; h: number; color: string; fill: string; shape: string; visible: boolean }

const W = 600;
const H = 400;

const drawTurtle = (ctx: CanvasRenderingContext2D, t: TState) => {
  if (!t.visible) return;
  const cx = W / 2 + t.x, cy = H / 2 - t.y;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-t.h * Math.PI) / 180);
  ctx.fillStyle = t.fill;
  ctx.strokeStyle = t.color;
  ctx.lineWidth = 1;
  if (t.shape === "turtle") {
    // legs
    for (const [lx, ly] of [[5, 6], [5, -6], [-5, 6], [-5, -6]]) {
      ctx.beginPath(); ctx.arc(lx, ly, 2.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.beginPath(); ctx.arc(10, 0, 3, 0, Math.PI * 2); ctx.fill(); // head
    ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-12, 0); ctx.stroke(); // tail
    ctx.beginPath(); ctx.ellipse(0, 0, 8, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (t.shape === "circle") {
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (t.shape === "square") {
    ctx.fillRect(-8, -8, 16, 16); ctx.strokeRect(-8, -8, 16, 16);
  } else {
    ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-6, 5); ctx.lineTo(-3, 0); ctx.lineTo(-6, -5); ctx.closePath();
    ctx.fill(); ctx.stroke();
  }
  ctx.restore();
};

const TurtleCanvas = ({ events, runKey }: { events: TurtleEvent[]; runKey: number }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const layer = document.createElement("canvas");
    layer.width = W; layer.height = H;
    const lctx = layer.getContext("2d")!;
    lctx.lineCap = "round";
    let bg = "#ffffff";
    let tracer = true;
    const turtles = new Map<number, TState>();
    let i = 0;
    let raf = 0;

    const apply = (e: TurtleEvent): boolean => {
      const t = turtles.get(e.t);
      switch (e.type) {
        case "new":
          turtles.set(e.t, { x: 0, y: 0, h: 0, color: e.color, fill: e.fill, shape: e.shape, visible: e.visible });
          return false;
        case "move":
          if (e.pen) {
            lctx.strokeStyle = e.color; lctx.lineWidth = e.width;
            lctx.beginPath(); lctx.moveTo(W / 2 + e.x1, H / 2 - e.y1); lctx.lineTo(W / 2 + e.x, H / 2 - e.y); lctx.stroke();
          }
          if (t) { t.x = e.x; t.y = e.y; t.h = e.h; }
          return tracer && e.speed !== 0 && !!t?.visible;
        case "state":
          if (t) { t.x = e.x; t.y = e.y; t.h = e.h; }
          return tracer && e.speed !== 0 && !!t?.visible;
        case "look": if (t) { t.color = e.color; t.fill = e.fill; } return false;
        case "shape": if (t) t.shape = e.shape; return false;
        case "vis": if (t) t.visible = e.visible; return false;
        case "bg": bg = e.color; return false;
        case "tracer": tracer = e.on; return false;
        case "write": {
          const [fam, size, style] = e.font || ["Arial", 8, "normal"];
          lctx.fillStyle = e.color;
          lctx.font = `${style === "normal" ? "" : style} ${Math.round((size || 8) * 1.33)}px ${fam}, sans-serif`;
          lctx.textAlign = e.align === "center" ? "center" : e.align === "right" ? "right" : "left";
          lctx.textBaseline = "bottom";
          lctx.fillText(e.text, W / 2 + e.x, H / 2 - e.y);
          return false;
        }
        case "dot":
          lctx.fillStyle = e.color;
          lctx.beginPath(); lctx.arc(W / 2 + e.x, H / 2 - e.y, e.size / 2, 0, Math.PI * 2); lctx.fill();
          return false;
        case "fill":
          lctx.fillStyle = e.color; lctx.beginPath();
          e.points.forEach(([x, y]: number[], k: number) => k ? lctx.lineTo(W / 2 + x, H / 2 - y) : lctx.moveTo(W / 2 + x, H / 2 - y));
          lctx.closePath(); lctx.fill();
          return false;
        case "stamp":
          drawTurtle(lctx, { x: e.x, y: e.y, h: e.h, color: e.color, fill: e.fill, shape: e.shape, visible: true });
          return false;
      }
      return false;
    };

    const render = () => {
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      ctx.drawImage(layer, 0, 0);
      turtles.forEach(t => drawTurtle(ctx, t));
    };

    const frame = () => {
      let budget = 3; // visible steps per frame
      while (i < events.length && budget > 0) {
        if (apply(events[i++])) budget--;
      }
      render();
      if (i < events.length) raf = requestAnimationFrame(frame);
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, [events, runKey]);

  return (
    <canvas ref={ref} width={W} height={H} className="w-full max-w-[600px] mx-auto block rounded-md" style={{ aspectRatio: `${W}/${H}` }} />
  );
};

export default TurtleCanvas;
