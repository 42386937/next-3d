/**
 * Road geometry for the dc.glb campus, measured from the asphalt mesh
 * "Rectangle308_Material #13208_0", whose quads form one ring road around the
 * plant.
 *
 * All values are in dc.glb model units, which the scene treats as metres: the
 * ring road is ~14.6 units wide and the campus footprint is ~291 x 277 units.
 */

export type Vec2 = { x: number; z: number };

/** Top of the asphalt in dc.glb model space; the car's wheels rest here. */
export const ROAD_SURFACE_Y = 0.114;

/** Half the ring-road width, so the centreline keeps the car clear of both kerbs. */
export const ROAD_HALF_WIDTH = 7.3;

/** Outer corners of the ring road, ordered around the loop. */
const ROAD_OUTER: Vec2[] = [
  { x: -12.32, z: 113.65 },
  { x: 124.68, z: 240.66 },
  { x: 278.96, z: 101.83 },
  { x: 154.5, z: -36.47 },
];

/**
 * Corner radius used to round the loop. Rounded corners move the centreline
 * inward by ~`0.414 * radius`; with the half width at 7.3 this keeps the car on
 * the asphalt while the corners stay wide enough to drive smoothly.
 */
const CORNER_RADIUS = 8;

/** Arc-length spacing of the sampled centreline, in model units. */
const SAMPLE_STEP = 0.75;

/** Smoothing passes applied after the loop is uniformly sampled. */
const SMOOTH_PASSES = 3;

export type RoadPath = {
  /** Closed loop of centreline samples, evenly spaced along the loop. */
  points: Vec2[];
  /** Arc length from the first point to each sample. */
  cumulative: number[];
  /** Total loop length. */
  total: number;
};

export type RoadSample = {
  x: number;
  z: number;
  /** Unit heading along the loop. */
  dirX: number;
  dirZ: number;
};

function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(b.x - a.x, b.z - a.z);
}

function signedArea(poly: Vec2[]): number {
  let area = 0;
  for (let i = 0; i < poly.length; i += 1) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    area += p.x * q.z - q.x * p.z;
  }
  return area / 2;
}

/** Move every edge of the polygon inward by `distance`. */
function insetPolygon(poly: Vec2[], distance: number): Vec2[] {
  const sign = signedArea(poly) > 0 ? 1 : -1;
  const count = poly.length;
  const out: Vec2[] = [];

  for (let i = 0; i < count; i += 1) {
    const prev = poly[(i - 1 + count) % count];
    const cur = poly[i];
    const next = poly[(i + 1) % count];

    const normal = (a: Vec2, b: Vec2): Vec2 => {
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const len = Math.hypot(dx, dz) || 1;
      return { x: (-dz / len) * sign, z: (dx / len) * sign };
    };

    const n1 = normal(prev, cur);
    const n2 = normal(cur, next);
    let bx = n1.x + n2.x;
    let bz = n1.z + n2.z;
    const blen = Math.hypot(bx, bz) || 1;
    bx /= blen;
    bz /= blen;

    const cosHalf = Math.max(bx * n1.x + bz * n1.z, 0.2);
    const scale = distance / cosHalf;
    out.push({ x: cur.x + bx * scale, z: cur.z + bz * scale });
  }

  return out;
}

/** Replace every corner with a circular arc of at most `radius`. */
function roundCorners(poly: Vec2[], radius: number): Vec2[] {
  const count = poly.length;
  const out: Vec2[] = [];

  for (let i = 0; i < count; i += 1) {
    const prev = poly[(i - 1 + count) % count];
    const cur = poly[i];
    const next = poly[(i + 1) % count];

    const inLen = distance(prev, cur) || 1;
    const outLen = distance(cur, next) || 1;
    // `u` arrives at the corner, `v` leaves it.
    const u = { x: (cur.x - prev.x) / inLen, z: (cur.z - prev.z) / inLen };
    const v = { x: (next.x - cur.x) / outLen, z: (next.z - cur.z) / outLen };

    const turn = Math.acos(Math.max(-1, Math.min(1, u.x * v.x + u.z * v.z)));
    if (turn < 1e-3) {
      out.push({ x: cur.x, z: cur.z });
      continue;
    }

    const tanHalf = Math.tan(turn / 2);
    const maxTangent = 0.45 * Math.min(inLen, outLen);
    const r = Math.min(radius, maxTangent / Math.max(tanHalf, 1e-6));
    const tangent = r * tanHalf;

    const start = { x: cur.x - u.x * tangent, z: cur.z - u.z * tangent };
    const end = { x: cur.x + v.x * tangent, z: cur.z + v.z * tangent };

    // Centre sits on the bisector of the turn, `r / sin(turn / 2)` from the corner.
    const bisX = v.x - u.x;
    const bisZ = v.z - u.z;
    const bisLen = Math.hypot(bisX, bisZ) || 1;
    const centreDist = r / Math.max(Math.sin(turn / 2), 1e-6);
    const cx = cur.x + (bisX / bisLen) * centreDist;
    const cz = cur.z + (bisZ / bisLen) * centreDist;

    const a1 = Math.atan2(start.z - cz, start.x - cx);
    const a2 = Math.atan2(end.z - cz, end.x - cx);
    let sweep = a2 - a1;
    while (sweep > Math.PI) sweep -= Math.PI * 2;
    while (sweep < -Math.PI) sweep += Math.PI * 2;

    // One step per unit of arc keeps the corner round at this model scale.
    const arcSteps = Math.max(6, Math.min(64, Math.ceil(Math.abs(sweep) * r)));

    for (let s = 0; s <= arcSteps; s += 1) {
      const a = a1 + (sweep * s) / arcSteps;
      out.push({ x: cx + Math.cos(a) * r, z: cz + Math.sin(a) * r });
    }
  }

  return out;
}

/**
 * Resample a closed polyline at a fixed arc-length spacing. Samples land on
 * exact multiples of the step, so consecutive points never coincide and the
 * tangent between them stays well defined.
 */
function resample(loop: Vec2[], step: number): Vec2[] {
  const vertexDistance: number[] = [];
  let total = 0;
  for (let i = 0; i < loop.length; i += 1) {
    vertexDistance.push(total);
    total += distance(loop[i], loop[(i + 1) % loop.length]);
  }

  const count = Math.max(8, Math.round(total / step));
  const actualStep = total / count;

  const points: Vec2[] = [];
  let segment = 0;

  for (let i = 0; i < count; i += 1) {
    const target = i * actualStep;

    while (
      segment < loop.length - 1 &&
      vertexDistance[segment + 1] <= target
    ) {
      segment += 1;
    }

    const a = loop[segment];
    const b = loop[(segment + 1) % loop.length];
    const segStart = vertexDistance[segment];
    const segEnd =
      segment + 1 < vertexDistance.length
        ? vertexDistance[segment + 1]
        : total;
    const segLen = segEnd - segStart;
    const t = segLen > 1e-9 ? (target - segStart) / segLen : 0;

    points.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
  }

  return points;
}

/**
 * Average each sample with its neighbours on the closed loop. Run only on evenly
 * spaced samples: on a polyline with mixed spacing this would drag the corners
 * out of shape and leave a kink at every straight.
 */
function smoothLoop(loop: Vec2[], passes: number): Vec2[] {
  let current = loop;
  for (let pass = 0; pass < passes; pass += 1) {
    const count = current.length;
    const next: Vec2[] = new Array(count);
    for (let i = 0; i < count; i += 1) {
      const a = current[(i - 1 + count) % count];
      const b = current[i];
      const c = current[(i + 1) % count];
      next[i] = {
        x: (a.x + b.x * 2 + c.x) / 4,
        z: (a.z + b.z * 2 + c.z) / 4,
      };
    }
    current = next;
  }
  return current;
}

/** Rebuild arc lengths so they match the final point positions. */
function withArcLength(points: Vec2[]): RoadPath {
  const cumulative: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length; i += 1) {
    cumulative.push(total);
    total += distance(points[i], points[(i + 1) % points.length]);
  }
  return { points, cumulative, total };
}

let cached: RoadPath | null = null;

/** Centreline of the ring road, built once and reused. */
export function buildRoadPath(): RoadPath {
  if (cached) return cached;
  const centre = insetPolygon(ROAD_OUTER, ROAD_HALF_WIDTH);
  const rounded = roundCorners(centre, CORNER_RADIUS);
  // Uniform spacing first, then smoothing: the other order kinks every corner.
  const sampled = resample(rounded, SAMPLE_STEP);
  cached = withArcLength(smoothLoop(sampled, SMOOTH_PASSES));
  return cached;
}

/** Position and heading at `distance` along the loop (wraps automatically). */
export function sampleRoad(path: RoadPath, distance: number): RoadSample {
  const { points, cumulative, total } = path;

  let d = distance % total;
  if (d < 0) d += total;

  let low = 0;
  let high = cumulative.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (cumulative[mid] <= d) low = mid;
    else high = mid - 1;
  }

  const nextIndex = (low + 1) % points.length;
  const a = points[low];
  const b = points[nextIndex];
  const span =
    nextIndex === 0 ? total - cumulative[low] : cumulative[nextIndex] - cumulative[low];
  const t = span > 1e-9 ? (d - cumulative[low]) / span : 0;

  const x = a.x + (b.x - a.x) * t;
  const z = a.z + (b.z - a.z) * t;

  let dx = b.x - a.x;
  let dz = b.z - a.z;
  const len = Math.hypot(dx, dz) || 1;
  dx /= len;
  dz /= len;

  return { x, z, dirX: dx, dirZ: dz };
}
