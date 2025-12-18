'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Params = {
  bottomW: number;
  bottomH: number;

  topW: number;
  topH: number;

  rodW: number;
  rodH: number;

  bottomStartFromBaseY: number;

  legBottomW: number; // trapezium bottom width
  legH: number;       // trapezium height
  legAngleDeg: number;
};

const PX_PER_MM = 96 / 25.4; // 3.7795...

export default function SingleStepLadder_Canvas() {
  const [p, setP] = useState<Params>({
    bottomW: 530,
    bottomH: 40,

    topW: 580,
    topH: 50,

    rodW: 25,
    rodH: 700,

    bottomStartFromBaseY: 120,

    legBottomW: 30,
    legH: 100,
    legAngleDeg: 89,
  });

  const [screenScale, setScreenScale] = useState(0.25);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Precompute layout in mm (same logic as your Maker.js)
  const geom = useMemo(() => {
    const leftRodX = 0;
    const rodY = 0;

    const rightRodX = p.topW - p.rodW;

    const topX = 0;
    const topY = p.rodH;

    const bottomX = (p.topW - p.bottomW) / 2;
    const bottomY = p.bottomStartFromBaseY;

    // Legs: place them under each rod (bottom reference)
    // You can tweak legBaseY; using rod width-ish like you were doing
    const legBaseY = p.rodW; // mm
    const legLeftBaseX = 0 + (p.rodW / 2);                 // center under left rod
    const legRightBaseX = rightRodX + (p.rodW / 2);        // center under right rod

    return {
      bottomRect: { x: bottomX, y: bottomY, w: p.bottomW, h: p.bottomH },
      leftRod: { x: leftRodX, y: rodY, w: p.rodW, h: p.rodH },
      rightRod: { x: rightRodX, y: rodY, w: p.rodW, h: p.rodH },
      topRect: { x: topX, y: topY, w: p.topW, h: p.topH },

      legLeft: { cx: legLeftBaseX, baseY: legBaseY },
      legRight: { cx: legRightBaseX, baseY: legBaseY },
    };
  }, [p]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Size canvas to container-ish (you can make this responsive later)
    const W = 1100;
    const H = 800;
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(0, 0, W, H);

    // Draw settings
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00a2ff';

    // Convert mm->px and also flip Y so “up” is positive like CAD
    const toPx = (mm: number) => mm * PX_PER_MM * screenScale;

    // choose an origin on canvas so drawing is visible
    const originPx = { x: 80, y: H - 80 }; // bottom-left margin

    const mmToCanvas = (xMm: number, yMm: number) => {
      return {
        x: originPx.x + toPx(xMm),
        y: originPx.y - toPx(yMm), // flip Y
      };
    };

    const strokeRectMm = (xMm: number, yMm: number, wMm: number, hMm: number) => {
      const p0 = mmToCanvas(xMm, yMm);
      const p1 = mmToCanvas(xMm + wMm, yMm + hMm);
      const x = p0.x;
      const y = p1.y;
      const w = p1.x - p0.x;
      const h = p0.y - p1.y;

      ctx.strokeRect(x, y, w, h);
    };

    const strokeLineMm = (x1: number, y1: number, x2: number, y2: number) => {
      const a = mmToCanvas(x1, y1);
      const b = mmToCanvas(x2, y2);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    };

    // --- Draw ladder rectangles (in mm space) ---
    strokeRectMm(geom.leftRod.x, geom.leftRod.y, geom.leftRod.w, geom.leftRod.h);
    strokeRectMm(geom.rightRod.x, geom.rightRod.y, geom.rightRod.w, geom.rightRod.h);
    strokeRectMm(geom.topRect.x, geom.topRect.y, geom.topRect.w, geom.topRect.h);
    strokeRectMm(geom.bottomRect.x, geom.bottomRect.y, geom.bottomRect.w, geom.bottomRect.h);

    // --- Draw trapezium legs by angle (4 lines) ---
    const drawTrapeziumLeg = (baseCenterX: number, baseY: number) => {
      const angleRad = (p.legAngleDeg * Math.PI) / 180;

      // dx = horizontal shift per side to achieve given angle from horizontal
      const dx = p.legH / Math.tan(angleRad);

      // bottom line centered at baseCenterX
      const halfBottom = p.legBottomW / 2;

      const p1 = { x: baseCenterX - halfBottom, y: baseY }; // bottom-left
      const p2 = { x: baseCenterX + halfBottom, y: baseY }; // bottom-right

      // top points: move up by legH, and inward by dx (both sides)
      const p4 = { x: p1.x + dx, y: baseY + p.legH }; // top-left
      const p3 = { x: p2.x - dx, y: baseY + p.legH }; // top-right

      // 4 lines
      strokeLineMm(p1.x, p1.y, p2.x, p2.y); // bottom
      strokeLineMm(p1.x, p1.y, p4.x, p4.y); // left side
      strokeLineMm(p2.x, p2.y, p3.x, p3.y); // right side
      strokeLineMm(p4.x, p4.y, p3.x, p3.y); // top
    };

    drawTrapeziumLeg(geom.legLeft.cx, geom.legLeft.baseY);
    drawTrapeziumLeg(geom.legRight.cx, geom.legRight.baseY);

    // Optional: small axis marker
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Scale: ${screenScale}x (screen only)`, 20, 20);
  }, [p, screenScale, geom]);

  const setNum = <K extends keyof Params>(key: K, value: string) => {
    const n = Number(value);
    if (!Number.isNaN(n)) setP(prev => ({ ...prev, [key]: n }));
  };

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <div className="bg-white text-black rounded px-3 py-2">
          <label className="text-sm font-semibold mr-2">Preview scale:</label>
          <select
            className="border rounded px-2 py-1"
            value={screenScale}
            onChange={(e) => setScreenScale(Number(e.target.value))}
          >
            <option value={0.1}>10%</option>
            <option value={0.25}>25%</option>
            <option value={0.5}>50%</option>
            <option value={0.75}>75%</option>
            <option value={1}>100%</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FORM */}
        <div className="bg-white text-black rounded p-4">
          <h3 className="font-bold mb-2">Inputs (mm)</h3>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Bottom W" value={p.bottomW} onChange={(v) => setNum('bottomW', v)} />
            <Field label="Bottom H" value={p.bottomH} onChange={(v) => setNum('bottomH', v)} />
            <Field label="Top W" value={p.topW} onChange={(v) => setNum('topW', v)} />
            <Field label="Top H" value={p.topH} onChange={(v) => setNum('topH', v)} />
            <Field label="Rod W" value={p.rodW} onChange={(v) => setNum('rodW', v)} />
            <Field label="Rod H" value={p.rodH} onChange={(v) => setNum('rodH', v)} />
            <Field
              label="Bottom start Y"
              value={p.bottomStartFromBaseY}
              onChange={(v) => setNum('bottomStartFromBaseY', v)}
            />

            <div className="col-span-2 mt-2 font-semibold">Leg trapezium</div>
            <Field label="Leg bottom W" value={p.legBottomW} onChange={(v) => setNum('legBottomW', v)} />
            <Field label="Leg height" value={p.legH} onChange={(v) => setNum('legH', v)} />
            <Field label="Leg angle (deg)" value={p.legAngleDeg} onChange={(v) => setNum('legAngleDeg', v)} />
          </div>
        </div>

        {/* CANVAS */}
        <div className="bg-gray-900 border border-gray-700 rounded p-4 flex items-center justify-center">
          <canvas ref={canvasRef} className="border border-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: string) => void;
}) {
  return (
    <label className="text-sm">
      <div className="mb-1">{label}</div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded px-2 py-1"
      />
    </label>
  );
}
