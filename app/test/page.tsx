'use client';



import React, { use, useEffect, useRef } from "react";
import makerjs from "makerjs";

export default function DynamicMakerSVG() {
  const svgRef = useRef();

  useEffect(() => {
    const model = new makerjs.models.ConnectTheDots(false, [[0, 0], [120, 100]]);
    const svg = makerjs.exporter.toSVG(model);
    svgRef.current.innerHTML = svg;
  }, []);

  return (
    <div>
      <center>
      <div
        ref={svgRef}
        style={{ border: "1px solid #ddd", borderRadius: 8, background: "#fff" }}
      />
      </center>
    </div>
  );
}
