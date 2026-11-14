export type Direction = "down" | "left" | "right" | "up";

export type MapPoint = {
  x: number;
  y: number;
};

export const DETECTIVE_SPRITE = {
  source: "/sprites/detective-walk-normalized.png",
  sheetWidth: 528,
  sheetHeight: 1360,
  frameWidth: 176,
  frameHeight: 340,
  columns: 3,
  rows: 4,
  directionRows: {
    down: 0,
    left: 1,
    right: 2,
    up: 3,
  } satisfies Record<Direction, number>,
  restingColumn: 1,
  walkColumns: [0, 1, 2, 1] as const,
  displayWidth: 1.38,
  displayHeight: 2.66,
} as const;

export const DETECTIVE_MOVEMENT = {
  speed: 3.8,
  sprintMultiplier: 1.35,
  animationFramesPerSecond: 8,
  maxDeltaSeconds: 0.05,
  maxSubstepDistance: 0.1,
  initialDirection: "up" as Direction,
  spawn: { x: 15.5, y: 21.8 } satisfies MapPoint,
  footBox: {
    width: 0.66,
    height: 0.36,
    centerOffsetY: -0.12,
  },
} as const;

export const DIRECTION_VECTORS: Record<Direction, MapPoint> = {
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
};
