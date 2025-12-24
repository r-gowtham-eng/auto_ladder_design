'use client';

import * as makerjs from 'makerjs';
import {FramePart} from '../parts/frame';


export default function StepLadder() {

    const svgOutput = makerjs.exporter.toSVG(FramePart(), {
          useSvgPathOnly: false,
          units: makerjs.unitType.Millimeter,
          scale: 0.1,
          // You can tweak these if needed:
          // strokeWidth: 0.5,
          // fill: 'none',
        });

  return (
        <div>
            <center>
          <div
          className='pt-100'
            dangerouslySetInnerHTML={{ __html: svgOutput }}
          />
          </center>
        </div>
);

}
