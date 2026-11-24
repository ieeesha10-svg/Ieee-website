// DotField: a field of small dots drifting slowly across the auth pages' empty
// background. Canvas rather than DOM on purpose - the dots carry no content, so
// the cheapest representation is one element and one animation frame callback
// instead of ~80 absolutely-positioned spans each needing their own keyframes.
// It also stays smooth on a phone, where that many DOM nodes would not.
import React, { useEffect, useRef } from "react";

// Matches --color-primary (#0096ff) so the field belongs to the palette instead
// of being grey dust on top of it.
const DOT_RGB = "0, 150, 255";

// Wrapping rather than bouncing. A dot leaving the right edge reappears on the
// left, which loops invisibly; bouncing makes the whole field twitch every time
// any single dot turns around. The `max > 0` branch is not reachable today -
// makeDot() only runs after resize() has confirmed a non-zero box, so dots
// cannot exist without one - but it keeps the helper total rather than relying
// on that invariant holding at every call site.
const wrap = (value, max) => (max > 0 ? ((value % max) + max) % max : 0);

// Clamped to the same [0, max] range wrap() keeps centres in, so re-fitting the
// field to a new canvas size does not pop any dot inwards from the edge.
const clamp = (value, max) => (max > 0 ? Math.min(Math.max(value, 0), max) : 0);

export default function DotField({
  density = 0.00007,
  minSize = 1.5,
  maxSize = 4,
  speed = 0.14,
  opacity = 0.5,
  className = "",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    let width = 0;
    let height = 0;
    let dots = [];
    let frame = 0;
    let running = false;

    const makeDot = () => {
      const r = minSize + Math.random() * (maxSize - minSize);
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r,
        // A random angle is biased hard towards the axes, so the field drifts
        // and swirls instead of being blown one way across the page.
        angle: Math.random() * Math.PI * 2,
        speed: speed * (0.4 + Math.random() * 1.2),
        // Per-dot alpha as well as per-dot size. Without it every dot carries
        // equal weight and the field reads as one flat texture.
        alpha: 0.25 + Math.random() * 0.55,
      };
    };

    // Existing dots are kept and re-fitted rather than thrown away and
    // re-rolled. A phone's address bar collapsing changes the viewport height
    // on every ordinary scroll, and regenerating on each of those would make
    // the entire field visibly teleport again and again.
    const syncDots = () => {
      const target = Math.round(
        Math.min(110, Math.max(24, width * height * density)),
      );
      for (const dot of dots) {
        dot.x = clamp(dot.x, width);
        dot.y = clamp(dot.y, height);
      }
      while (dots.length > target) dots.pop();
      while (dots.length < target) dots.push(makeDot());
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      // Cap the pixel ratio at 2: a 3x phone screen would otherwise ask for 9x
      // the fill rate to draw decoration nobody consciously looks at.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // Draw in CSS pixels; the transform handles the device ratio.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      syncDots();
    };

    const draw = (step) => {
      ctx.clearRect(0, 0, width, height);
      for (const dot of dots) {
        if (step) {
          // A slow turn keeps the movement from looking like a rigid conveyor
          // belt once the field has been running for a while.
          dot.angle += (Math.random() - 0.5) * 0.02;
          dot.x += Math.cos(dot.angle) * dot.speed;
          dot.y += Math.sin(dot.angle) * dot.speed;
          dot.x = wrap(dot.x, width);
          dot.y = wrap(dot.y, height);
        }
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${DOT_RGB}, ${dot.alpha * opacity})`;
        ctx.fill();
      }
    };

    const loop = () => {
      if (!running) return;
      draw(true);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    // Reduced motion gets the same field, drawn once and left alone: still
    // textured, but nothing moving.
    const render = () => {
      if (motionQuery.matches) {
        stop();
        draw(false);
      } else {
        start();
      }
    };

    resize();
    render();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            resize();
            if (motionQuery.matches) draw(false);
          })
        : null;
    observer?.observe(canvas);

    const onMotionChange = () => render();
    motionQuery.addEventListener?.("change", onMotionChange);

    // A background tab is not being watched, so stop spending frames on it.
    const onVisibility = () => {
      if (document.hidden) stop();
      else if (!motionQuery.matches) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      observer?.disconnect();
      motionQuery.removeEventListener?.("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density, minSize, maxSize, speed, opacity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      // Purely decorative: must never swallow a click meant for the form.
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
