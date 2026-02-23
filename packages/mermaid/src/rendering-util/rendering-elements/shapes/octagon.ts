import { labelHelper, updateNodeBounds, getNodeClasses, createPathFromPoints } from './util.js';
import intersect from '../intersect/index.js';
import type { Node } from '../../types.js';
import { styles2String, userNodeOverrides } from './handDrawnShapeStyles.js';
import rough from 'roughjs';
import { insertPolygonShape } from './insertPolygonShape.js';
import type { D3Selection } from '../../../types.js';

export async function octagon<T extends SVGGraphicsElement>(parent: D3Selection<T>, node: Node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const { shapeSvg, bbox } = await labelHelper(parent, node, getNodeClasses(node));

  const minWidth = 60,
    minHeight = 20;
  const w = Math.max(minWidth, bbox.width + (node.padding ?? 0) * 2, node?.width ?? 0);
  const h = Math.max(minHeight, bbox.height + (node.padding ?? 0) * 2, node?.height ?? 0);

  // The cut amount at each corner to form the octagon shape
  const cut = (Math.min(w, h) * (Math.SQRT2 - 1)) / 2;

  const points = [
    { x: cut, y: 0 },
    { x: w - cut, y: 0 },
    { x: w, y: -cut },
    { x: w, y: -(h - cut) },
    { x: w - cut, y: -h },
    { x: cut, y: -h },
    { x: 0, y: -(h - cut) },
    { x: 0, y: -cut },
  ];

  let polygon: D3Selection<SVGGElement> | Awaited<ReturnType<typeof insertPolygonShape>>;
  const { cssStyles } = node;

  if (node.look === 'handDrawn') {
    // @ts-expect-error -- Passing a D3.Selection seems to work for some reason
    const rc = rough.svg(shapeSvg);
    const options = userNodeOverrides(node, {});
    const pathData = createPathFromPoints(points);
    const roughNode = rc.path(pathData, options);

    polygon = shapeSvg
      .insert(() => roughNode, ':first-child')
      .attr('transform', `translate(${-w / 2}, ${h / 2})`);

    if (cssStyles) {
      polygon.attr('style', cssStyles);
    }
  } else {
    polygon = insertPolygonShape(shapeSvg, w, h, points);
  }

  if (nodeStyles) {
    polygon.attr('style', nodeStyles);
  }

  node.width = w;
  node.height = h;

  updateNodeBounds(node, polygon);

  node.intersect = function (point) {
    return intersect.polygon(node, points, point);
  };

  return shapeSvg;
}
