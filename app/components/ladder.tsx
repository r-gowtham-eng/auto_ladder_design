'use client';

import { useMemo } from 'react';
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


export default function SingleStepLadder() {
  const svg = useMemo(() => {
    // Bottom horizontal rectangle
    //step base size input 
    // top step size input
    // side rod size input
    //from the base  of the base where should the bottm horizontal rectangle start

    // I need to get all this inpiuts from the user later on

    const bottomW = 530;
    const bottomH = 40;

    const bottom_rect = new makerjs.models.Rectangle(bottomW, bottomH);

    // Left vertical
    const left_rect_width = 25;
    const left_rect_height = 700;
    const left_rect = new makerjs.models.Rectangle(left_rect_width, left_rect_height);

    // Right vertical
    const right_rect_width = 25;
    const right_rect_height = 700;
    const right_rect = new makerjs.models.Rectangle(right_rect_width, right_rect_height);
    // Top horizontal (top_rect)
    const topW = 580;
    const topH = 50;
    const top_rect = new makerjs.models.Rectangle(topW, topH);

    // const leg_left_rect =  new makerjs.models.Rectangle(25, 86);
    // const leg_right_rect = new makerjs.models.Rectangle(25, 86);
    

    const leg_width = 34;
    const leg_height = 35;

    const leg_placeholder = (leg_width - right_rect_width) / 2;
    console.log('leg_placeholder:', leg_placeholder);


    const legLeft  = MakerLegWithLines(leg_width, leg_height, 0,   34, 89, leg_placeholder);
    const legRight = MakerLegWithLines(leg_width, leg_height, 555, 34, 89, leg_placeholder);

    
    // Positions 
    bottom_rect.origin = [25, 120];       // bottom
    left_rect.origin = [0, 0];       // left
    right_rect.origin = [555, 0];     // right
    top_rect.origin = [0, 700];     // top
    // leg_left_rect.origin = [0, 34];      // left leg
    // leg_right_rect.origin = [564, 0];    // right leg

    const rootModel: makerjs.IModel = {
      models: {
        bottom: bottom_rect,
        left: left_rect,
        right: right_rect,
        top: top_rect,
        // legLeft: leg_left_rect,
        // legRight: leg_right_rect,
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


}