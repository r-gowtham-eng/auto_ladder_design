'use client';

import React, { useMemo, useState } from 'react';
import * as makerjs from 'makerjs';

type Params = {
  bottomW: number;
  bottomH: number;

  topW: number;
  topH: number;

  rodW: number;
  rodH: number;

  bottomStartFromBaseY: number;
};

export default function SingleStepLadder_MinForm() {
  const [p, setP] = useState<Params>({
    bottomW: 530,
    bottomH: 40,

    topW: 580,
    topH: 50,

    rodW: 25,
    rodH: 700,

    bottomStartFromBaseY: 120,
  });

  // Preview scale (screen only)
  const [screenScale, setScreenScale] = useState<number>(0.5);

  function setNum<K extends keyof Params>(key: K, value: string) {
    const n = Number(value);
    if (!Number.isNaN(n)) setP(prev => ({ ...prev, [key]: n }));
  }

  // Build a root model once from Params (reused by preview + PDF)
  function buildRootModel(pp: Params): makerjs.IModel {
    const leftRodX = 0;
    const rodY = 0;

    const rightRodX = pp.topW - pp.rodW;

    const topX = 0;
    const topY = pp.rodH;

    const bottomX = (pp.topW - pp.bottomW) / 2;
    const bottomY = pp.bottomStartFromBaseY;

    const bottom = new makerjs.models.Rectangle(pp.bottomW, pp.bottomH);
    const leftRod = new makerjs.models.Rectangle(pp.rodW, pp.rodH);
    const rightRod = new makerjs.models.Rectangle(pp.rodW, pp.rodH);
    const top = new makerjs.models.Rectangle(pp.topW, pp.topH);

    // Legs (simple derived sizes; adjust as you like)
    const leg_width = pp.rodW + 10;
    const leg_height = pp.rodW + 9;
    const leg_placeholder = (leg_width - pp.rodW) / 2;

    const legLeft = MakerLegTrapeziumByAngle(leg_width, leg_height, 0, leg_width, 89, leg_placeholder);
    const legRight = MakerLegTrapeziumByAngle(
      leg_width,
      leg_height,
      pp.bottomW + pp.rodW,
      leg_width,
      89,
      leg_placeholder
    );

    bottom.origin = [bottomX, bottomY];
    leftRod.origin = [leftRodX, rodY];
    rightRod.origin = [rightRodX, rodY];
    top.origin = [topX, topY];

    return {
      models: {
        bottom,
        leftRod,
        rightRod,
        top,
        legLeft,
        legRight,
      },
    };
  }

  const svg = useMemo(() => {
    const root = buildRootModel(p);

    let out = makerjs.exporter.toSVG(root, { units: 'mm', scale: 1 } as any);
    out = out.replace(
      '</svg>',
      `<style>
        path { stroke: #0074D9; stroke-width: 4; fill: none; }
      </style></svg>`
    );
    return out;
  }, [p]);

  // Auto-fit PDF to A4 (mm)
  const handleDownloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    await import('svg2pdf.js');

    // A4 in mm
    const pageW = 210;
    const pageH = 297;
    const margin = 10;

    // Build model and measure extents
    const root = buildRootModel(p);
    const ext = makerjs.measure.modelExtents(root);

    const lowX = ext.low[0];
    const lowY = ext.low[1];
    const drawW = ext.high[0] - ext.low[0];
    const drawH = ext.high[1] - ext.low[1];

    // Shift so drawing starts at (0,0) (prevents negative coords cropping)
    const shifted: makerjs.IModel = {
      origin: [-lowX, -lowY],
      models: { shifted: root },
    };

    // Export SVG (mm)
    let svgStr = makerjs.exporter.toSVG(shifted, { units: 'mm', scale: 1 } as any);
    svgStr = svgStr.replace(
      '</svg>',
      `<style>
        path { stroke: #0074D9; stroke-width: 1; fill: none; }
      </style></svg>`
    );

    // Fit scale (so it fits within margins)
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;
    const fitScale = Math.min(maxW / drawW, maxH / drawH);

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgStr, 'image/svg+xml');
    const svgEl = doc.documentElement as unknown as SVGSVGElement;

    // @ts-ignore - svg2pdf extends jsPDF
    await (pdf as any).svg(svgEl, { x: margin, y: margin, scale: fitScale });

    pdf.save('ladder-a4.pdf');
  };

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h2 className="text-lg font-bold mb-4">Single Step Ladder (mm)</h2>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 rounded bg-white text-black font-semibold"
        >
          Download PDF (A4 fit)
        </button>

        <div className="bg-white rounded px-3 py-2">
          <label className="text-sm font-semibold text-black mr-2">Preview scale:</label>
          <select
            className="border rounded px-2 py-1 text-black"
            value={screenScale}
            onChange={(e) => setScreenScale(Number(e.target.value))}
          >
            <option value={0.1}>10%</option>
            <option value={0.25}>25%</option>
            <option value={0.5}>50%</option>
            <option value={0.75}>75%</option>
            <option value={1}>100%</option>
            <option value={1.5}>150%</option>
            <option value={2}>200%</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FORM */}
        <div className="bg-white border rounded p-4 shadow text-black">
          <Section title="Bottom step (size)">
            <Num label="Bottom width (mm)" value={p.bottomW} onChange={v => setNum('bottomW', v)} />
            <Num label="Bottom height (mm)" value={p.bottomH} onChange={v => setNum('bottomH', v)} />
          </Section>

          <Section title="Top step (size)">
            <Num label="Top width (mm)" value={p.topW} onChange={v => setNum('topW', v)} />
            <Num label="Top height (mm)" value={p.topH} onChange={v => setNum('topH', v)} />
          </Section>

          <Section title="Side rods (size)">
            <Num label="Rod width (mm)" value={p.rodW} onChange={v => setNum('rodW', v)} />
            <Num label="Rod height (mm)" value={p.rodH} onChange={v => setNum('rodH', v)} />
          </Section>

          <Section title="Bottom start position">
            <Num
              label="Bottom start from base Y (mm)"
              value={p.bottomStartFromBaseY}
              onChange={v => setNum('bottomStartFromBaseY', v)}
            />
            <div className="text-xs text-gray-600 col-span-2">
              * Bottom step X is auto-centered.
            </div>
          </Section>
        </div>

        {/* PREVIEW */}
        <div className="bg-gray-900 border border-gray-700 rounded p-6 shadow min-h-[600px] flex items-center justify-center overflow-auto">
          <div
            style={{
              transform: `scale(${screenScale})`,
              transformOrigin: 'center center',
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded p-3 mb-3">
      <div className="font-semibold mb-2">{title}</div>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

function Num({
  label,
  value,
  onChange,
  step = '1',
}: {
  label: string;
  value: number;
  step?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="text-sm">
      <div className="mb-1">{label}</div>
      <input
        type="number"
        step={step}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border rounded px-2 py-1"
      />
    </label>
  );
}

// Your leg helper
function MakerLegWithLines(
  w: number,
  h: number,
  x: number,
  y: number,
  angleDeg = 89,
  leg_placeholder: number
): makerjs.IModel {
  const angleRad = (angleDeg * Math.PI) / 180;

  const dx = Math.cos(angleRad) * h;
  const dy = Math.sin(angleRad) * h;

  const p1: makerjs.IPoint = [x - leg_placeholder, y];
  const p2: makerjs.IPoint = [x + w - leg_placeholder, y];

  const p3: makerjs.IPoint = [p2[0] + dx, p2[1] - dy];
  const p4: makerjs.IPoint = [p1[0] + dx, p1[1] - dy];

  return {
    paths: {
      base: new makerjs.paths.Line(p3, p4),
      right: new makerjs.paths.Line(p2, p3),
      top: new makerjs.paths.Line(p1, p2),
      left: new makerjs.paths.Line(p4, p1),
    },
  };
}

function MakerLegTrapeziumByAngle(
  w: number,   // bottom width (mm)
  h: number,         // height (mm)
  x = 0,             // bottom-left X
  y = 0,           // bottom Y
  angleDeg = 89,     // side angle from horizontal
  leg_placeholder: number,
): makerjs.IModel {

  const angleRad = (angleDeg * Math.PI) / 180;

  // horizontal shift per side
  const dx = h / Math.tan(angleRad);

  // Bottom edge (straight)
  const p1: makerjs.IPoint = [x - leg_placeholder, y];
  const p2: makerjs.IPoint = [x + w - leg_placeholder, y];

  // Top edge points (connected by tilted sides)
  const p4: makerjs.IPoint = [p1[0] + dx, y - h];       // top-left
  const p3: makerjs.IPoint = [p2[0] - dx, y - h];       // top-right

  return {
    paths: {
      bottom: new makerjs.paths.Line(p1, p2),
      left:   new makerjs.paths.Line(p1, p4),  // 89° tilted
      right:  new makerjs.paths.Line(p2, p3),  // 89° tilted
      top:    new makerjs.paths.Line(p4, p3),  // connecting line
    },
  };
}

