import { log } from '../../../logger.js';
import { labelHelper, updateNodeBounds, getNodeClasses } from './util.js';
import intersect from '../intersect/index.js';
import type { Node } from '../../types.js';
import { styles2String, userNodeOverrides } from './handDrawnShapeStyles.js';
import rough from 'roughjs';
import { createPathFromPoints } from './util.js';
import type { D3Selection } from '../../../types.js';

/**
 * Right-pointing triangle: the flat base is on the left, the tip points right.
 *
 * Used for X-as-a-Service in Team Topologies diagrams:
 *   - base (left)  → service provider
 *   - tip  (right) → service consumer
 */
export async function triangleRight<T extends SVGGraphicsElement>(
  parent: D3Selection<T>,
  node: Node
) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));

  const w = bbox.width + (node.padding ?? 0);
  const h = w + bbox.height;

  // Right-pointing triangle in shape-local coordinates (y increases upward).
  // After the centering translate below the shape spans:
  //   x: [-h/2, h/2]  — base on the left, tip on the right
  //   y: [-h/2, h/2]  — symmetric top/bottom
  const points = [
    { x: 0, y: 0 }, // bottom-left (base)
    { x: 0, y: -h }, // top-left    (base)
    { x: h, y: -h / 2 }, // right       (tip)
  ];

  const { cssStyles } = node;

  // @ts-expect-error -- Passing a D3.Selection seems to work for some reason
  const rc = rough.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== 'handDrawn') {
    options.roughness = 0;
    options.fillStyle = 'solid';
  }
  const pathData = createPathFromPoints(points);
  const roughNode = rc.path(pathData, options);

  const polygon = shapeSvg
    .insert(() => roughNode, ':first-child')
    .attr('transform', `translate(${-h / 2}, ${h / 2})`);

  if (cssStyles && node.look !== 'handDrawn') {
    polygon.selectChildren('path').attr('style', cssStyles);
  }

  if (nodeStyles && node.look !== 'handDrawn') {
    polygon.selectChildren('path').attr('style', nodeStyles);
  }

  node.width = w;
  node.height = h;

  updateNodeBounds(node, polygon);

  // Centre the label inside the bounding box (0,0 is the SVG centre of the shape).
  label.attr(
    'transform',
    `translate(${-bbox.width / 2 - (bbox.x - (bbox.left ?? 0))}, ${-(bbox.height / 2) - (bbox.y - (bbox.top ?? 0))})`
  );

  node.intersect = function (point) {
    log.info('TriangleRight intersect', node, points, point);
    return intersect.polygon(node, points, point);
  };

  return shapeSvg;
}
