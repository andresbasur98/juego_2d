import type { CollisionZone, Rect } from "./map-data";
import {
  DETECTIVE_MOVEMENT,
  DIRECTION_VECTORS,
  type Direction,
  type MapPoint,
} from "./detective-config";

export function getFootBox(position: MapPoint): Rect {
  const { width, height, centerOffsetY } = DETECTIVE_MOVEMENT.footBox;
  const centerY = position.y + centerOffsetY;

  return {
    x: position.x - width / 2,
    y: centerY - height / 2,
    width,
    height,
  };
}

function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function canOccupy(
  position: MapPoint,
  obstacles: readonly CollisionZone[],
  world: { columns: number; rows: number },
): boolean {
  const footBox = getFootBox(position);

  if (
    footBox.x < 0 ||
    footBox.y < 0 ||
    footBox.x + footBox.width > world.columns ||
    footBox.y + footBox.height > world.rows
  ) {
    return false;
  }

  return !obstacles.some((obstacle) => overlaps(footBox, obstacle));
}

export function moveWithSubsteps(
  position: MapPoint,
  direction: Direction,
  distance: number,
  obstacles: readonly CollisionZone[],
  world: { columns: number; rows: number },
): { position: MapPoint; moved: boolean } {
  const stepCount = Math.max(
    1,
    Math.ceil(distance / DETECTIVE_MOVEMENT.maxSubstepDistance),
  );
  const stepDistance = distance / stepCount;
  const vector = DIRECTION_VECTORS[direction];
  let current = position;
  let moved = false;

  for (let step = 0; step < stepCount; step++) {
    const candidate = {
      x: current.x + vector.x * stepDistance,
      y: current.y + vector.y * stepDistance,
    };

    if (!canOccupy(candidate, obstacles, world)) {
      break;
    }

    current = candidate;
    moved = true;
  }

  return { position: current, moved };
}
