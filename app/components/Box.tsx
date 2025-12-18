'use client';

import { useMemo } from 'react';
import * as makerjs from 'makerjs';

export default function MakerTwoRectanglesMm() {
  const svg = useMemo(() => {
    // Bottom horizontal rectangle
    
    const rect1 = new makerjs.models.Rectangle(580, 40);

    // Left vertical
    const rect2 = new makerjs.models.Rectangle(25, 690);

    // Right vertical
    const rect3 = new makerjs.models.Rectangle(25, 690);

    // Top horizontal (rect4)
    const rect4 = new makerjs.models.Rectangle(580, 60);

    // Legs – positive height (10), move them down using origin
    const leg1 = new makerjs.models.Rectangle(40, -100);
    const leg2 = new makerjs.models.Rectangle(40, -100);

    const legLeft  = MakerLegWithLines(36, 34, 0,   0, 89);
    const legRight = MakerLegWithLines(36, 34, 555, 0, 89);


    // Positions
    rect1.origin = [5, 120];       // bottom
    rect2.origin = [5, -1];       // left
    rect3.origin = [560, -1];     // right
    rect4.origin = [5, 690];     // top
    leg1.origin = [0, 0];      // left leg
    leg2.origin = [540, 0];    // right leg

    const rootModel: makerjs.IModel = {
      models: {
        bottom: rect1,
        left: rect2,
        right: rect3,
        top: rect4,
        // legLeft: leg1,
        // legRight: leg2,
        leg_1: legLeft,
        leg_2: legRight,

      },
    };

    let svgOut = makerjs.exporter.toSVG(rootModel, {
      units: 'mm',
      scale: 1,
    } as makerjs.exporter.IExportOptions);

    // Add a style block to control stroke (line) appearance
    const styleBlock = `
      <style>
        path {
          stroke: #0074D9;      /* blue */
          stroke-width: 4;
          fill: none;
        }
      </style>
    `;

    svgOut = svgOut.replace('</svg>', `${styleBlock}</svg>`);

    return svgOut;
  }, []);

  const screenScale = 0.5; // shrink on screen; mm stays correct (adjust this value: 0.1 = very small, 1 = full size)

  return (
    <>  
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-lg font-bold mb-4">Rectangles in mm (styled lines)</h2>

      <div className="flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg p-8 shadow-lg min-h-[600px]">
        <div
          style={{
            background: 'white',
            // border: '1px solid #a10606ff',
            display: 'inline-block',
            padding: '8px',
            transform: `scale(${screenScale})`,
            transformOrigin: 'center center',
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
     </>
  );
  function MakerLegWithLines(
  w: number,      // base width (mm)
  h: number,      // leg height (mm)
  x: number,      // base start X
  y: number,      // base Y
  angleDeg = 89   // tilt angle
): makerjs.IModel {

  const angleRad = angleDeg * Math.PI / 180;

  const dx = Math.cos(angleRad) * h;
  const dy = Math.sin(angleRad) * h;

  // Base points
  const p1: makerjs.IPoint = [x, y];
  const p2: makerjs.IPoint = [x + w, y];

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


}