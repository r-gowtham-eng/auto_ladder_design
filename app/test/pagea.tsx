'use client';

import { useEffect, useState } from 'react';
import * as makerjs from 'makerjs';

export default function Page() {
  const [dxf, setDxf] = useState<string>('');
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    const rectangle = new makerjs.models.Rectangle(40, 50);
    const line = new makerjs.paths.Line([0, 0], [10, 0]);
    const circle = new makerjs.paths.Circle([20, 0], 10);
    const line_2 = new makerjs.paths.Line([30, 0], [40, 0]);
    

    // Optional: move rectangle so it doesn't overlap everything
    rectangle.origin = [0, 40];

    const model: makerjs.IModel = {
      paths: { line, circle, line_2 },
      models: { rectangle },
    };
    // DXF export
    setDxf(makerjs.exporter.toDXF(model ));

    // SVG export (preview)
    const svgOutput = makerjs.exporter.toSVG(model, {
      useSvgPathOnly: false,
      units: makerjs.unitType.Millimeter,
      // You can tweak these if needed:
      // strokeWidth: 0.5,
      // fill: 'none',
    });
    setSvg(svgOutput);
  }, []);

  const downloadDxf = () => {
    const blob = new Blob([dxf], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drawing.dxf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Maker.js DXF Export + SVG Preview</h2>

      <button onClick={downloadDxf} disabled={!dxf}>
        Download DXF
      </button>

      <h3 style={{ marginTop: 16 }}>Preview (SVG)</h3>

      {/* SVG preview */}
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: 12,
          width: 'fit-content',
          background: '#fff',
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      <h3 style={{ marginTop: 16 }}>DXF Text (debug)</h3>
      <pre style={{ marginTop: 12, maxHeight: 300, overflow: 'auto' }}>
        {dxf}
      </pre>
    </div>
  );
}
