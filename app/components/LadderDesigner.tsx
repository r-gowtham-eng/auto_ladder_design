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

  bottomStartFromBaseY: number; // where bottom step starts (Y)
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

  const svg = useMemo(() => {
    // ---- Auto layout (NO manual x/y inputs) ----
    const leftRodX = 0;
    const rodY = 0;

    const rightRodX = p.topW - p.rodW;

    const topX = 0;
    const topY = p.rodH;

    // bottom step: centered horizontally, y controlled by user offset
    const bottomX = (p.topW - p.bottomW) / 2;
    const bottomY = p.bottomStartFromBaseY;

    // ---- Models ----
    const bottom = new makerjs.models.Rectangle(p.bottomW, p.bottomH);
    const leftRod = new makerjs.models.Rectangle(p.rodW, p.rodH);
    const rightRod = new makerjs.models.Rectangle(p.rodW, p.rodH);
    const top = new makerjs.models.Rectangle(p.topW, p.topH);
    const top_opening = new makerjs.models.Rectangle(p.bottomW, p.bottomH);

    const leg_width = p.rodW + 10; //assuming from left rect width
    const leg_height = p.rodW + 9; // assuming from left rect width

    const leg_placeholder = (leg_width - (p.rodW)) / 2;
    console.log('leg_placeholder:', leg_placeholder);


    const legLeft  = MakerLegWithLines(leg_width, leg_height, 0,   leg_width, 89, leg_placeholder);
    const legRight = MakerLegWithLines(leg_width, leg_height, p.bottomW+p.rodW, leg_width, 89, leg_placeholder);

    bottom.origin = [bottomX, bottomY];
    leftRod.origin = [leftRodX, rodY];
    rightRod.origin = [rightRodX, rodY];
    top.origin = [topX, topY];
    top_opening.origin = [topX, topY + p.topH + 10];

    const root: makerjs.IModel = {
      models: {
        bottom,
        leftRod,
        rightRod,
        top,
        legLeft,
        legRight,
      },
    };

    let out = makerjs.exporter.toSVG(root, { units: 'mm', scale: 1 } as any);

    out = out.replace(
      '</svg>',
      `<style>
        path { stroke: #0074D9; stroke-width: 4; fill: none; }
      </style></svg>`
    );

    return out;
  }, [p]);

  function setNum<K extends keyof Params>(key: K, value: string) {
    const n = Number(value);
    if (!Number.isNaN(n)) setP(prev => ({ ...prev, [key]: n }));
  }

  const handleDownloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    await import('svg2pdf.js');

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    const svgEl = doc.documentElement as unknown as SVGSVGElement;

    const x = 10;
    const y = 10;
    const scale = 10;

    // @ts-ignore
    await (pdf as any).svg(svgEl, { x, y, scale });

    pdf.save('ladder.pdf');
  };


  return (
    <div className="p-6 bg-black min-h-screen text-black">

      <h2 className="text-lg font-bold mb-4">Single Step Ladder (mm)</h2>
      <button
  onClick={handleDownloadPDF}
  className="px-4 py-2 rounded bg-white text-black font-semibold"
>
  Download PDF
</button>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FORM */}
        <div className="bg-white border rounded p-4 shadow">
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
        <div className="bg-gray-900 border border-gray-700 rounded p-6 shadow min-h-[600px] flex items-center justify-center">

          <div
            style={{
              transform: 'scale(0.5)',
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

function MakerLegWithLines(
  w: number,      // base width (mm)
  h: number,      // leg height (mm)
  x: number,      // base start X
  y: number,      // base Y
  angleDeg = 89,   // tilt angle
  leg_placeholder: number,
): makerjs.IModel {

  const angleRad = angleDeg * Math.PI / 180;

  const dx = Math.cos(angleRad) * h;
  const dy = Math.sin(angleRad) * h;

  // Base points
  const p1: makerjs.IPoint = [x - leg_placeholder, y];
  const p2: makerjs.IPoint = [x + w - leg_placeholder, y];

  // Top points (tilted)
  const p3: makerjs.IPoint = [p2[0] + dx, p2[1] - dy];
  const p4: makerjs.IPoint = [p1[0] + dx, p1[1] - dy];

  return {
    paths: {
      base: new makerjs.paths.Line(p3, p4),
      right: new makerjs.paths.Line(p2, p3),
      top: new makerjs.paths.Line(p1, p2),
      left: new makerjs.paths.Line(p4, p1),
    }
  };
}

