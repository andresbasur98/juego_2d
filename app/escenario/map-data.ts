export const GRID = {
  columns: 32,
  rows: 24,
  logicalWidth: 1024,
  logicalHeight: 768,
} as const;

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FloorKind = "oak" | "darkOak" | "tile" | "rug";

export type FloorZone = Rect & {
  id: string;
  kind: FloorKind;
  room:
    | "sala-comun"
    | "recepcion"
    | "cocina"
    | "dormitorio"
    | "despacho"
    | "pasillo";
};

export type WallSegment = Rect & {
  id: string;
  axis: "horizontal" | "vertical";
  outer?: boolean;
};

export type Passage = Rect & {
  id: string;
  axis: "horizontal" | "vertical";
};

export type ObjectType =
  | "rug"
  | "roundTable"
  | "chair"
  | "bookshelf"
  | "receptionDesk"
  | "registerBook"
  | "serviceBell"
  | "keyRack"
  | "plant"
  | "bench"
  | "counter"
  | "sink"
  | "stove"
  | "produceCrate"
  | "pantry"
  | "bed"
  | "suitcase"
  | "nightstand"
  | "wardrobe"
  | "desk"
  | "writingChair"
  | "filingCabinet"
  | "lamp"
  | "smallBooks"
  | "coatStand"
  | "openSafe";

export type MapObject = Rect & {
  id: string;
  type: ObjectType;
  layer: "furniture" | "decoration";
  orientation?: "north" | "east" | "south" | "west";
  /** Ground support used to interleave the object with the detective. */
  depthY?: number;
  /** The actual obstacle on the floor, independent of shadows and tall artwork. */
  footprint?: Rect;
};

export const floorZones: FloorZone[] = [
  { id: "common-floor", room: "sala-comun", kind: "oak", x: 1, y: 1, width: 12, height: 8 },
  { id: "reception-floor", room: "recepcion", kind: "darkOak", x: 1, y: 10, width: 12, height: 13 },
  { id: "main-hall", room: "pasillo", kind: "oak", x: 14, y: 1, width: 3, height: 22 },
  { id: "upper-hall", room: "pasillo", kind: "oak", x: 17, y: 9, width: 14, height: 2 },
  { id: "kitchen-floor", room: "cocina", kind: "tile", x: 18, y: 1, width: 6, height: 7 },
  { id: "bedroom-floor", room: "dormitorio", kind: "darkOak", x: 25, y: 1, width: 6, height: 7 },
  { id: "office-floor", room: "despacho", kind: "oak", x: 18, y: 12, width: 13, height: 11 },
];

export const walls: WallSegment[] = [
  { id: "outer-north", axis: "horizontal", outer: true, x: 0, y: 0, width: 32, height: 1 },
  { id: "outer-west", axis: "vertical", outer: true, x: 0, y: 1, width: 1, height: 22 },
  { id: "outer-east", axis: "vertical", outer: true, x: 31, y: 1, width: 1, height: 22 },
  { id: "outer-south-west", axis: "horizontal", outer: true, x: 0, y: 23, width: 15, height: 1 },
  { id: "outer-south-east", axis: "horizontal", outer: true, x: 17, y: 23, width: 15, height: 1 },

  { id: "common-reception", axis: "horizontal", x: 1, y: 9, width: 12, height: 1 },

  { id: "left-spine-a", axis: "vertical", x: 13, y: 1, width: 1, height: 4 },
  { id: "left-spine-b", axis: "vertical", x: 13, y: 7, width: 1, height: 8 },
  { id: "left-spine-c", axis: "vertical", x: 13, y: 17, width: 1, height: 6 },

  { id: "right-spine-top", axis: "vertical", x: 17, y: 1, width: 1, height: 8 },
  { id: "right-spine-bottom", axis: "vertical", x: 17, y: 11, width: 1, height: 12 },

  { id: "kitchen-bedroom", axis: "vertical", x: 24, y: 1, width: 1, height: 7 },

  { id: "upper-rooms-a", axis: "horizontal", x: 18, y: 8, width: 2, height: 1 },
  { id: "upper-rooms-b", axis: "horizontal", x: 22, y: 8, width: 5, height: 1 },
  { id: "upper-rooms-c", axis: "horizontal", x: 29, y: 8, width: 2, height: 1 },

  { id: "office-a", axis: "horizontal", x: 18, y: 11, width: 3, height: 1 },
  { id: "office-b", axis: "horizontal", x: 23, y: 11, width: 8, height: 1 },
];

export const passages: Passage[] = [
  { id: "entrance", axis: "horizontal", x: 15, y: 23, width: 2, height: 1 },
  { id: "common-door", axis: "vertical", x: 13, y: 5, width: 1, height: 2 },
  { id: "reception-door", axis: "vertical", x: 13, y: 15, width: 1, height: 2 },
  { id: "hall-turn", axis: "vertical", x: 17, y: 9, width: 1, height: 2 },
  { id: "kitchen-door", axis: "horizontal", x: 20, y: 8, width: 2, height: 1 },
  { id: "bedroom-door", axis: "horizontal", x: 27, y: 8, width: 2, height: 1 },
  { id: "office-door", axis: "horizontal", x: 21, y: 11, width: 2, height: 1 },
];

export const objects: MapObject[] = [
  // Common room
  { id: "common-rug", type: "rug", layer: "furniture", x: 3, y: 3, width: 7, height: 4 },
  { id: "common-table", type: "roundTable", layer: "furniture", x: 5, y: 4, width: 3, height: 2, footprint: { x: 5.55, y: 4.35, width: 1.9, height: 1.25 } },
  { id: "chair-west", type: "chair", layer: "furniture", orientation: "east", x: 4, y: 4, width: 1, height: 2, footprint: { x: 4.2, y: 4.45, width: 0.65, height: 1.05 } },
  { id: "chair-east", type: "chair", layer: "furniture", orientation: "west", x: 8, y: 4, width: 1, height: 2, footprint: { x: 8.15, y: 4.45, width: 0.65, height: 1.05 } },
  { id: "chair-north", type: "chair", layer: "furniture", orientation: "south", x: 6, y: 2.5, width: 1, height: 1.5, footprint: { x: 6.15, y: 2.8, width: 0.7, height: 0.8 } },
  { id: "chair-south", type: "chair", layer: "furniture", orientation: "north", x: 6, y: 6.25, width: 1, height: 1.5, footprint: { x: 6.15, y: 6.45, width: 0.7, height: 0.8 } },
  { id: "common-books", type: "bookshelf", layer: "furniture", orientation: "north", x: 1.5, y: 1, width: 3.25, height: 1.25, footprint: { x: 1.5, y: 1, width: 3.25, height: 0.85 } },
  { id: "common-lamp", type: "lamp", layer: "decoration", x: 10.8, y: 1.4, width: 0.8, height: 1.1, footprint: { x: 11, y: 2.05, width: 0.4, height: 0.35 } },

  // Reception
  { id: "reception-desk", type: "receptionDesk", layer: "furniture", orientation: "south", x: 7, y: 12.5, width: 5, height: 2.25, footprint: { x: 7, y: 13.25, width: 5, height: 1.5 } },
  { id: "register", type: "registerBook", layer: "decoration", x: 8.15, y: 12.65, width: 1.2, height: 0.8, depthY: 14.8 },
  { id: "keys", type: "keyRack", layer: "decoration", x: 8, y: 10.25, width: 3, height: 1.35, depthY: 10.5, footprint: { x: 8, y: 10.25, width: 3, height: 0.2 } },
  { id: "reception-plant", type: "plant", layer: "decoration", x: 10.8, y: 16.8, width: 1.35, height: 2.1, footprint: { x: 11.1, y: 18.05, width: 0.8, height: 0.65 } },
  { id: "waiting-bench", type: "bench", layer: "furniture", orientation: "west", x: 1.5, y: 12.5, width: 2.25, height: 3.5, footprint: { x: 1.5, y: 13.05, width: 1.25, height: 2.8 } },
  { id: "coat-stand", type: "coatStand", layer: "furniture", x: 2, y: 19.25, width: 1.2, height: 2.4, footprint: { x: 2.25, y: 20.85, width: 0.7, height: 0.55 } },

  // Kitchen
  { id: "kitchen-counter", type: "counter", layer: "furniture", orientation: "north", x: 18.25, y: 1, width: 5.5, height: 1.8, footprint: { x: 18.25, y: 1, width: 5.5, height: 1.25 } },
  { id: "sink", type: "sink", layer: "decoration", x: 18.75, y: 1.25, width: 1.7, height: 1.05, depthY: 2.9 },
  { id: "stove", type: "stove", layer: "decoration", x: 21.35, y: 1.2, width: 1.8, height: 1.15, depthY: 2.9 },
  { id: "pantry", type: "pantry", layer: "furniture", orientation: "east", x: 22.25, y: 4, width: 1.5, height: 2.75, footprint: { x: 22.55, y: 4, width: 1.2, height: 2.75 } },
  { id: "kitchen-plant", type: "plant", layer: "decoration", x: 18.35, y: 5.3, width: 1.1, height: 1.6, footprint: { x: 18.55, y: 6.2, width: 0.65, height: 0.5 } },

  // Bedroom
  { id: "bed", type: "bed", layer: "furniture", orientation: "north", x: 26, y: 1.5, width: 3.1, height: 4.7, footprint: { x: 26, y: 1.5, width: 3.1, height: 4.7 } },
  { id: "bedside", type: "nightstand", layer: "furniture", x: 29.25, y: 1.65, width: 1.15, height: 1.4, footprint: { x: 29.25, y: 1.85, width: 1.15, height: 1.2 } },
  { id: "bedside-lamp", type: "lamp", layer: "decoration", x: 29.38, y: 1.15, width: 0.85, height: 1.15, depthY: 3.1 },
  { id: "wardrobe", type: "wardrobe", layer: "furniture", orientation: "west", x: 25, y: 4.4, width: 1.3, height: 2.7, footprint: { x: 25, y: 4.4, width: 1.3, height: 2.7 } },

  // Office
  { id: "office-rug", type: "rug", layer: "furniture", x: 21, y: 15, width: 6.5, height: 5.5 },
  { id: "office-shelves", type: "bookshelf", layer: "furniture", orientation: "north", x: 24, y: 12, width: 5.5, height: 1.4, footprint: { x: 24, y: 12, width: 5.5, height: 0.95 } },
  { id: "desk", type: "desk", layer: "furniture", orientation: "south", x: 22, y: 15, width: 5, height: 2.2, footprint: { x: 22, y: 15.55, width: 5, height: 1.65 } },
  { id: "desk-chair", type: "writingChair", layer: "furniture", orientation: "north", x: 23.7, y: 17.35, width: 1.4, height: 2, footprint: { x: 23.9, y: 17.7, width: 1, height: 1.1 } },
  { id: "filing", type: "filingCabinet", layer: "furniture", x: 29.2, y: 14.1, width: 1.4, height: 2.6, footprint: { x: 29.2, y: 14.1, width: 1.4, height: 2.6 } },
  { id: "desk-books", type: "smallBooks", layer: "decoration", x: 25.4, y: 14.95, width: 1.1, height: 0.75, depthY: 17.3 },
  { id: "office-plant", type: "plant", layer: "decoration", x: 18.7, y: 19.5, width: 1.5, height: 2.15, footprint: { x: 19, y: 20.8, width: 0.9, height: 0.7 } },
];

export type CollisionZone = Rect & {
  id: string;
  source: "wall" | "object" | "door";
};

export const navigation = {
  /** Walkable room and corridor rectangles. Doorways join these regions. */
  traversableZones: floorZones.map(({ id, x, y, width, height }) => ({
    id: `walk-${id}`,
    x,
    y,
    width,
    height,
  })),
  /** Exact wall footprints and deliberately smaller furniture footprints. */
  blockedZones: [
    ...walls.map(({ id, x, y, width, height }): CollisionZone => ({
      id: `collision-${id}`,
      source: "wall",
      x,
      y,
      width,
      height,
    })),
    ...objects.flatMap((object): CollisionZone[] =>
      object.footprint
        ? [{ id: `collision-${object.id}`, source: "object", ...object.footprint }]
        : [],
    ),
  ],
} as const;

export const innMap = {
  grid: GRID,
  floors: floorZones,
  walls,
  passages,
  objects,
  navigation,
} as const;
