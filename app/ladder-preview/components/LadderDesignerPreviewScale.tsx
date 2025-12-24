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

  depth: number;

  depth_rod : number;

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

    depth: 300,
    depth_rod : 40,

    bottomStartFromBaseY: 120,
  });

  // Preview scale (screen only)
  const [screenScale, setScreenScale] = useState<number>(0.1);

  function setNum<K extends keyof Params>(key: K, value: string) {
    const n = Number(value);
    if (!Number.isNaN(n)) setP(prev => ({ ...prev, [key]: n }));
  }

  
  function frontView(pp: Params): makerjs.IModel {
    const leftRodX = 0;
    const rodY = 0;

    const rightRodX = pp.topW - pp.rodW ;
    const rightRodY = 0;

    const topX = 0;
    const topY = pp.rodH;

    
    const bottomY = pp.bottomStartFromBaseY;

    const bottom_width = pp.topW - (pp.rodW * 2);

    const bottomX = (pp.topW - bottom_width) / 2;

    const bottom = new makerjs.models.Rectangle(bottom_width, pp.bottomH);
    const leftRod = new makerjs.models.Rectangle(pp.rodW, pp.rodH);
    const rightRod = new makerjs.models.Rectangle(pp.rodW, pp.rodH);
    const top = new makerjs.models.Rectangle(pp.topW, pp.topH);
    // Legs (simple derived sizes; adjust as you like)
    const leg_width = pp.rodW + 10;
    const leg_height = pp.rodW + 9;
    const leg_placeholder = (leg_width - pp.rodW) / 2;

    const legLeft = MakerLegTrapeziumByAngle(leg_width, leg_height, 0, leg_width, 89, leg_placeholder);
    const legRight = MakerLegTrapeziumByAngle(leg_width,leg_height,pp.topW - pp.rodW,leg_width,89,leg_placeholder);

    bottom.origin = [bottomX, bottomY];
    leftRod.origin = [leftRodX, rodY];
    rightRod.origin = [rightRodX, rightRodY];
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

  function TopView(pp: Params): makerjs.IModel {
    const depth_cut = pp.rodW * 2;
    const depth_cut_inner = pp.rodW * 2 - 20;
    const top_inner_width = pp.topW - depth_cut;
    const top_inner_hight = pp.depth - depth_cut;
    
    const top = new makerjs.models.Rectangle(pp.topW, pp.depth);


    const top_inner = new makerjs.models.Rectangle(top_inner_width,top_inner_hight);

    const top_inner_2 = new makerjs.models.Rectangle(top_inner_width - 20,top_inner_hight - 20);


    top.origin = [0, 0];
    top_inner.origin = [depth_cut - pp.rodW, depth_cut -pp.rodW];
    top_inner_2.origin = [depth_cut - 15, depth_cut -15];


    return {
      models: {
        top,
        top_inner,
        top_inner_2
      },
    };
  }

  function sideView(pp: Params): makerjs.IModel {
    const leftRodX = 0;
    const rodY = 0;

    const rightRodX = pp.depth - pp.depth_rod;

    const topX = 0;
    const topY = pp.rodH;

    const bottomX = pp.depth_rod;
    const bottomY = pp.bottomStartFromBaseY;
    const bottom_width = pp.depth - pp.depth_rod * 2;
    const bottom = new makerjs.models.Rectangle(bottom_width, pp.bottomH);
    const leftRod = new makerjs.models.Rectangle(pp.depth_rod, pp.rodH);
    const rightRod = new makerjs.models.Rectangle(pp.depth_rod, pp.rodH);
    const top = new makerjs.models.Rectangle(pp.depth, pp.topH);

    // Legs (simple derived sizes; adjust as you like)
    const leg_width = pp.depth_rod + 10;
    const leg_height = pp.depth_rod + 9;
    const leg_placeholder = (leg_width - pp.depth_rod) / 2;

    const legLeft = MakerLegTrapeziumByAngle(leg_width, leg_height, 0, leg_width, 89, leg_placeholder);
    const legRight = MakerLegTrapeziumByAngle(leg_width,leg_height,bottom_width + pp.depth_rod,leg_width,89,leg_placeholder);

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
    const root = frontView(p);
    const mirror = makerjs.model.mirror(root, true, false);
    let out = makerjs.exporter.toSVG(root, { units: 'mm', scale: 1 } as any);
    out = out.replace(
      '</svg>',
      `<style>
        path { stroke: #0074D9; stroke-width: 4; fill: none; }
      </style></svg>`
    );
    return out;
  }, [p]);

  const svg_top = useMemo(() => {
    const root = TopView(p);

    let out = makerjs.exporter.toSVG(root, { units: 'mm', scale: 1 } as any);
    out = out.replace(
      '</svg>',
      `<style>
        path { stroke: #d90024ff; stroke-width: 4; fill: none; }
      </style></svg>`
    );
    return out;
  }, [p]);

  const svg_side = useMemo(() => {
    const root = sideView(p);

    let out = makerjs.exporter.toSVG(root, { units: 'mm', scale: 1 } as any);
    out = out.replace(
      '</svg>',
      `<style>
        path { stroke: #d90024ff; stroke-width: 4; fill: none; }
      </style></svg>`
    );
    return out;
  }, [p]);

  return (
  <div className="bg-black min-h-screen text-white">
    {/* TOP BAR (always visible) */}
    <div className="sticky top-0 z-10 bg-black border-b border-gray-800 px-6 py-4">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-lg font-bold">Single Step Ladder (mm)</h2>
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
    </div>

    {/* MAIN AREA */}
    <div className="px-6 py-6 h-[calc(100vh-72px)]">
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 h-full">
        {/* LEFT: INPUTS (scrollable, stays visible) */}
        <div className="bg-white text-black border rounded shadow p-4 overflow-auto h-full">
          <Section title="Top step (size)">
            <Num label="Top width (mm)" value={p.topW} onChange={v => setNum('topW', v)} />
            <Num label="Top height (mm)" value={p.topH} onChange={v => setNum('topH', v)} />
          </Section>

          <Section title="Bottom step (size)">
            <Num label="Bottom width (mm)" value={p.bottomW} onChange={v => setNum('bottomW', v)} />
            <Num label="Bottom height (mm)" value={p.bottomH} onChange={v => setNum('bottomH', v)} />
          </Section>

          <Section title="Side rods (size)">
            <Num label="Rod width (mm)" value={p.rodW} onChange={v => setNum('rodW', v)} />
            <Num label="Rod height (mm)" value={p.rodH} onChange={v => setNum('rodH', v)} />
          </Section>
          <Section title="Depth">
            <Num label="Depth (mm)" value={p.depth} onChange={v => setNum('depth', v)} />
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

        {/* RIGHT: SVG PREVIEW (fills remaining space) */}
        <div className="bg-gray-950 border border-gray-800 rounded shadow h-full overflow-hidden flex items-center justify-center">
          <p className='font-bold'>Front View</p>
          <div
            style={{
              transform: `scale(${screenScale})`,
              transformOrigin: 'center center',
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
        <div className="bg-gray-950 border border-gray-800 rounded shadow h-full overflow-hidden flex items-center justify-center">
          <p className='font-bold'>Top View</p>
          <div
            style={{
              transform: `scale(${screenScale})`,
              transformOrigin: 'center center',
            }}
            dangerouslySetInnerHTML={{ __html: svg_top }}
          />
        </div>
        <div className="bg-gray-950 border border-gray-800 rounded shadow h-full overflow-hidden flex items-center justify-center">
          <p className='font-bold'>Side View</p>
          <div
            style={{
              transform: `scale(${screenScale})`,
              transformOrigin: 'center center',
            }}
            dangerouslySetInnerHTML={{ __html: svg_side }}
          />
        </div>
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

