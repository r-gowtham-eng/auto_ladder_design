const makerjs = require('makerjs');

function createLeg(w: any,h: any,r: any) {

  const model: { paths: { [key: string]: any } } = {
    paths: {
      bottom: new makerjs.paths.Line([0, 0], [w, 0]),
      right: makerjs.path.rotate(new makerjs.paths.Line([w, 0], [w, h]), 1, [w, 0]),
      left:  makerjs.path.rotate(new makerjs.paths.Line([0, h], [0, 0]), 1, [0, 0]),
      top:   new makerjs.paths.Line([w, h], [0, h])
    }
  };

  const end = model.paths.right.end;
  const start = model.paths.left.origin;  

  const top_line = new makerjs.paths.Line(start, end);

  model.paths.top = top_line;

  const a1 = makerjs.path.fillet(model.paths.bottom, model.paths.right, r);
  const a2 = makerjs.path.fillet(model.paths.right, model.paths.top, r);
  const a3 = makerjs.path.fillet(model.paths.top, model.paths.left, r);
  const a4 = makerjs.path.fillet(model.paths.left, model.paths.bottom, r);

  model.paths.arc_br = a1;
  model.paths.arc_tr = a2;
  model.paths.arc_tl = a3;
  model.paths.arc_bl = a4;

  const svg = makerjs.exporter.toSVG(model);
  return svg

}


