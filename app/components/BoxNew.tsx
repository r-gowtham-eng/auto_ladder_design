'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as makerjs from 'makerjs';
import { fabric } from 'fabric';

export default function FabricMakerBoard() {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  const svg = useMemo(() => {
    const rect1 = new makerjs.models.Rectangle(580, 50);
    const rect2 = new makerjs.models.Rectangle(40, 690);
    const rect3 = new makerjs.models.Rectangle(40, 690);
    const rect4 = new makerjs.models.Rectangle(580, 60);

    const leg1 = new makerjs.models.Rectangle(40, 10);
    const leg2 = new makerjs.models.Rectangle(40, 10);

    rect1.origin = [0, 0];
    rect2.origin = [0, 0];
    rect3.origin = [540, 0];
    rect4.origin = [0, 690];
    leg1.origin = [0, -10];
    leg2.origin = [540, -10];

    const rootModel: makerjs.IModel = {
      models: {
        bottom: rect1,
        left: rect2,
        right: rect3,
        top: rect4,
        legLeft: leg1,
        legRight: leg2,
      },
    };

    // SVG in mm
    let out = makerjs.exporter.toSVG(rootModel, { units: 'mm', scale: 1 } as any);

    // Ensure visible stroke
    out = out.replace(
      '<svg ',
      '<svg stroke="black" stroke-width="4" fill="none" stroke-linejoin="round" '
    );

    return out;
  }, []);

  useEffect(() => {
    if (!canvasElRef.current) return;

    // Create fabric canvas once
    const fc = new fabric.Canvas(canvasElRef.current, {
      backgroundColor: '#f8fafc', // light background
      selection: false,
    });
    fabricRef.current = fc;

    // Optional: draw a simple grid background
    const gridSize = 25;
    for (let i = 0; i < 2000; i += gridSize) {
      fc.add(
        new fabric.Line([i, 0, i, 2000], {
          stroke: '#e5e7eb',
          selectable: false,
          evented: false,
        }),
        new fabric.Line([0, i, 2000, i], {
          stroke: '#e5e7eb',
          selectable: false,
          evented: false,
        })
      );
    }

    return () => {
      fc.dispose();
      fabricRef.current = null;
    };
  }, []);

  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;

    // Remove old SVG objects (keep grid lines)
    const toRemove = fc.getObjects().filter(o => (o as any).__isDrawing === true);
    toRemove.forEach(o => fc.remove(o));

    // Load SVG into Fabric
    fabric.loadSVGFromString(svg, (objects, options) => {
      const group = fabric.util.groupSVGElements(objects, options);

      // Mark so we can remove later
      (group as any).__isDrawing = true;

      // Visual-only scaling (because mm->px is huge)
      group.scale(0.25);

      // Center it
      group.left = (fc.getWidth() - group.getScaledWidth()) / 2;
      group.top = (fc.getHeight() - group.getScaledHeight()) / 2;

      group.selectable = true;
      fc.add(group);
      fc.requestRenderAll();
    });
  }, [svg]);

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-3">Fabric board + Maker.js drawing</h2>
      <div className="border inline-block bg-white">
        <canvas ref={canvasElRef} width={1000} height={650} />
      </div>
    </div>
  );
}
