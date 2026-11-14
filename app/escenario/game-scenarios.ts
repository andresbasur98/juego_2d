import type { Direction, MapPoint } from "./detective-config";
import type {
  CollisionZone,
  FloorKind,
  MapObject,
  Rect,
  WallSegment,
} from "./map-data";

export type ScenarioId = "hallway" | "office" | "reception" | "guest-room" | "kitchen";

export type ScenarioFloor = Rect & {
  id: string;
  kind: FloorKind;
  zone: string;
};

export type ScenarioSpawn = MapPoint & {
  id: string;
  direction: Direction;
};

export type ScenarioConnection = {
  scenarioId: ScenarioId;
  spawnId: string;
  direction: Direction;
  arrivalDoorId: string;
};

export type ScenarioDoor = {
  id: string;
  label: string;
  axis: "horizontal" | "vertical";
  side: "north" | "east" | "south" | "west";
  rect: Rect;
  trigger: Rect;
  state: "open" | "future" | "entrance";
  unavailableMessage?: string;
  connection?: ScenarioConnection;
  blockingRect?: Rect;
};

export type ScenarioWindow = Rect & {
  id: string;
  side: "east" | "west";
};

export type ScenarioNpc = {
  id: string;
  name: string;
  spriteSrc: string;
  x: number;
  y: number;
  width: number;
  height: number;
  depthY: number;
};

export type ScenarioInteraction = {
  id: string;
  kind: "npc" | "object";
  action: "Hablar" | "Inspeccionar";
  title: string;
  text: string;
  trigger: Rect;
  marker: MapPoint;
};

export type GameScenario = {
  id: ScenarioId;
  name: string;
  grid: {
    columns: number;
    rows: number;
    logicalWidth: number;
    logicalHeight: number;
  };
  floors: ScenarioFloor[];
  walls: WallSegment[];
  objects: MapObject[];
  npcs: ScenarioNpc[];
  interactions: ScenarioInteraction[];
  doors: ScenarioDoor[];
  windows: ScenarioWindow[];
  spawns: Record<string, ScenarioSpawn>;
  blockedZones: CollisionZone[];
};

function createBlockedZones(
  walls: WallSegment[],
  objects: MapObject[],
  doors: ScenarioDoor[],
): CollisionZone[] {
  return [
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
    ...doors.flatMap((door): CollisionZone[] =>
      door.blockingRect
        ? [{ id: `collision-${door.id}`, source: "door", ...door.blockingRect }]
        : [],
    ),
  ];
}

const hallwayWalls: WallSegment[] = [
  { id: "hall-north", axis: "horizontal", outer: true, x: 5, y: 0, width: 15, height: 1 },
  { id: "hall-south-west", axis: "horizontal", outer: true, x: 5, y: 29, width: 5, height: 1 },
  { id: "hall-south-east", axis: "horizontal", outer: true, x: 14, y: 29, width: 6, height: 1 },
  { id: "hall-left-a", axis: "vertical", outer: true, x: 5, y: 1, width: 1, height: 4 },
  { id: "hall-left-b", axis: "vertical", outer: true, x: 5, y: 7, width: 1, height: 10 },
  { id: "hall-left-c", axis: "vertical", outer: true, x: 5, y: 19, width: 1, height: 10 },
  { id: "hall-right-a", axis: "vertical", outer: true, x: 19, y: 1, width: 1, height: 3 },
  { id: "hall-right-b", axis: "vertical", outer: true, x: 19, y: 6, width: 1, height: 4 },
  { id: "hall-right-c", axis: "vertical", outer: true, x: 19, y: 12, width: 1, height: 8 },
  { id: "hall-right-d", axis: "vertical", outer: true, x: 19, y: 22, width: 1, height: 7 },
];

const hallwayDoors: ScenarioDoor[] = [
  {
    id: "common-room",
    label: "SALA COMÚN",
    axis: "vertical",
    side: "west",
    rect: { x: 5, y: 5, width: 1, height: 2 },
    trigger: { x: 5.75, y: 5, width: 1.35, height: 2 },
    blockingRect: { x: 5, y: 5, width: 1, height: 2 },
    state: "future",
    unavailableMessage: "La sala común aún no está disponible.",
  },
  {
    id: "reception",
    label: "RECEPCIÓN",
    axis: "vertical",
    side: "west",
    rect: { x: 5, y: 17, width: 1, height: 2 },
    trigger: { x: 5.75, y: 17, width: 1.35, height: 2 },
    state: "open",
    connection: {
      scenarioId: "reception",
      spawnId: "from-hallway",
      direction: "left",
      arrivalDoorId: "reception-exit",
    },
  },
  {
    id: "kitchen",
    label: "COCINA",
    axis: "vertical",
    side: "east",
    rect: { x: 19, y: 4, width: 1, height: 2 },
    trigger: { x: 17.9, y: 4, width: 1.35, height: 2 },
    state: "open",
    connection: {
      scenarioId: "kitchen",
      spawnId: "from-hallway",
      direction: "right",
      arrivalDoorId: "kitchen-exit",
    },
  },
  {
    id: "guest-room",
    label: "HABITACIÓN",
    axis: "vertical",
    side: "east",
    rect: { x: 19, y: 10, width: 1, height: 2 },
    trigger: { x: 17.9, y: 10, width: 1.35, height: 2 },
    state: "open",
    connection: {
      scenarioId: "guest-room",
      spawnId: "from-hallway",
      direction: "right",
      arrivalDoorId: "guest-room-exit",
    },
  },
  {
    id: "office-door",
    label: "DESPACHO",
    axis: "vertical",
    side: "east",
    rect: { x: 19, y: 20, width: 1, height: 2 },
    trigger: { x: 18.05, y: 20, width: 1.35, height: 2 },
    state: "open",
    connection: {
      scenarioId: "office",
      spawnId: "from-hallway",
      direction: "right",
      arrivalDoorId: "office-exit",
    },
  },
  {
    id: "main-entrance",
    label: "ENTRADA",
    axis: "horizontal",
    side: "south",
    rect: { x: 10, y: 29, width: 4, height: 1 },
    trigger: { x: 10, y: 27.8, width: 4, height: 1.2 },
    blockingRect: { x: 10, y: 29, width: 4, height: 1 },
    state: "entrance",
    unavailableMessage: "La salida aún no está disponible.",
  },
];

const hallwayObjects: MapObject[] = [
  { id: "hall-runner-north", type: "rug", layer: "furniture", x: 9, y: 3, width: 6, height: 8 },
  { id: "hall-runner-south", type: "rug", layer: "furniture", x: 9, y: 15, width: 6, height: 9 },
  { id: "hall-bench", type: "bench", layer: "furniture", orientation: "west", x: 6.35, y: 21.8, width: 2.1, height: 3.2, footprint: { x: 6.35, y: 22.2, width: 1.2, height: 2.7 } },
  { id: "hall-coat-stand", type: "coatStand", layer: "furniture", x: 6.6, y: 25.6, width: 1.2, height: 2.4, footprint: { x: 6.85, y: 27.15, width: 0.7, height: 0.6 } },
  { id: "hall-plant", type: "plant", layer: "decoration", x: 16.5, y: 24.5, width: 1.4, height: 2.1, footprint: { x: 16.8, y: 25.8, width: 0.85, height: 0.65 } },
  { id: "hall-lamp-a", type: "lamp", layer: "decoration", x: 7.1, y: 1.5, width: 0.8, height: 1.1, footprint: { x: 7.3, y: 2.2, width: 0.4, height: 0.35 } },
  { id: "hall-lamp-b", type: "lamp", layer: "decoration", x: 16.1, y: 12.8, width: 0.8, height: 1.1, footprint: { x: 16.3, y: 13.5, width: 0.4, height: 0.35 } },
];

const officeWalls: WallSegment[] = [
  { id: "office-north", axis: "horizontal", outer: true, x: 0, y: 0, width: 24, height: 1 },
  { id: "office-south", axis: "horizontal", outer: true, x: 0, y: 17, width: 24, height: 1 },
  { id: "office-east", axis: "vertical", outer: true, x: 23, y: 1, width: 1, height: 16 },
  { id: "office-west-a", axis: "vertical", outer: true, x: 0, y: 1, width: 1, height: 7 },
  { id: "office-west-b", axis: "vertical", outer: true, x: 0, y: 10, width: 1, height: 7 },
];

const officeDoors: ScenarioDoor[] = [
  {
    id: "office-exit",
    label: "PASILLO",
    axis: "vertical",
    side: "west",
    rect: { x: 0, y: 8, width: 1, height: 2 },
    trigger: { x: 0.7, y: 8, width: 1.15, height: 2 },
    state: "open",
    connection: {
      scenarioId: "hallway",
      spawnId: "from-office",
      direction: "left",
      arrivalDoorId: "office-door",
    },
  },
];

const officeObjects: MapObject[] = [
  { id: "office-large-rug", type: "rug", layer: "furniture", x: 7, y: 5, width: 9, height: 7 },
  { id: "office-library", type: "bookshelf", layer: "furniture", orientation: "north", x: 3, y: 1, width: 7, height: 1.5, footprint: { x: 3, y: 1, width: 7, height: 1 } },
  { id: "office-main-desk", type: "desk", layer: "furniture", orientation: "south", x: 10, y: 6, width: 6, height: 2.4, footprint: { x: 10, y: 6.65, width: 6, height: 1.75 } },
  { id: "office-chair", type: "writingChair", layer: "furniture", orientation: "north", x: 12.2, y: 8.75, width: 1.5, height: 2.1, footprint: { x: 12.45, y: 9.1, width: 1, height: 1.2 } },
  { id: "office-files", type: "filingCabinet", layer: "furniture", x: 20.6, y: 2.2, width: 1.5, height: 2.8, footprint: { x: 20.6, y: 2.2, width: 1.5, height: 2.8 } },
  { id: "office-safe", type: "openSafe", layer: "furniture", orientation: "east", x: 18.6, y: 12.2, width: 2.7, height: 3.2, footprint: { x: 19.2, y: 12.6, width: 2.1, height: 2.6 } },
  { id: "office-desk-books", type: "smallBooks", layer: "decoration", x: 14.2, y: 5.95, width: 1.1, height: 0.75, depthY: 8.55 },
  { id: "office-desk-lamp", type: "lamp", layer: "decoration", x: 10.7, y: 5.35, width: 0.9, height: 1.25, depthY: 8.55 },
  { id: "office-floor-lamp", type: "lamp", layer: "decoration", x: 3.2, y: 13.2, width: 1.1, height: 1.9, footprint: { x: 3.45, y: 14.45, width: 0.65, height: 0.55 } },
  { id: "office-plant", type: "plant", layer: "decoration", x: 20.2, y: 7.4, width: 1.5, height: 2.2, footprint: { x: 20.5, y: 8.75, width: 0.9, height: 0.7 } },
];

const officeNpcs: ScenarioNpc[] = [
  {
    id: "inn-proprietor",
    name: "Propietario de la posada",
    spriteSrc: "/sprites/inn-proprietor-static.png",
    x: 13,
    y: 6.65,
    width: 2.3,
    height: 3.45,
    depthY: 6.65,
  },
];

const officeInteractions: ScenarioInteraction[] = [
  {
    id: "office-proprietor",
    kind: "npc",
    action: "Hablar",
    title: "Propietario de la posada",
    text: "El propietario te observa desde el otro lado del escritorio. Mantiene la calma, pero su mirada vuelve una y otra vez hacia la caja fuerte abierta.",
    trigger: { x: 10.15, y: 8.3, width: 5.85, height: 2.8 },
    marker: { x: 13, y: 3.05 },
  },
  {
    id: "office-desk",
    kind: "object",
    action: "Inspeccionar",
    title: "Escritorio del propietario",
    text: "Recibos, cartas y anotaciones ocupan casi toda la superficie. Una de las hojas fue arrancada del bloc con mucha prisa.",
    trigger: { x: 8.35, y: 6.05, width: 1.65, height: 4.25 },
    marker: { x: 9.6, y: 7.15 },
  },
  {
    id: "office-library",
    kind: "object",
    action: "Inspeccionar",
    title: "Biblioteca",
    text: "Los libros están perfectamente ordenados salvo por un hueco reciente. El polvo dibuja el contorno de un volumen grueso que ya no está.",
    trigger: { x: 2.4, y: 2.1, width: 8.2, height: 2.25 },
    marker: { x: 6.5, y: 2.55 },
  },
  {
    id: "office-files",
    kind: "object",
    action: "Inspeccionar",
    title: "Archivador",
    text: "Las carpetas están clasificadas por huésped y fecha. El último cajón no termina de cerrar, como si alguien hubiera registrado su contenido.",
    trigger: { x: 19.35, y: 4.8, width: 3.35, height: 2.25 },
    marker: { x: 20.45, y: 4.85 },
  },
  {
    id: "office-safe",
    kind: "object",
    action: "Inspeccionar",
    title: "Caja fuerte abierta",
    text: "No hay señales de fuerza en la cerradura. En el interior quedan marcas rectangulares sobre el polvo: faltan al menos dos objetos.",
    trigger: { x: 17.15, y: 10.55, width: 5.55, height: 5.4 },
    marker: { x: 18.55, y: 12.15 },
  },
];

const receptionWalls: WallSegment[] = [
  { id: "reception-north", axis: "horizontal", outer: true, x: 0, y: 0, width: 24, height: 1 },
  { id: "reception-south", axis: "horizontal", outer: true, x: 0, y: 17, width: 24, height: 1 },
  { id: "reception-west", axis: "vertical", outer: true, x: 0, y: 1, width: 1, height: 16 },
  { id: "reception-east-a", axis: "vertical", outer: true, x: 23, y: 1, width: 1, height: 7 },
  { id: "reception-east-b", axis: "vertical", outer: true, x: 23, y: 10, width: 1, height: 7 },
];

const receptionDoors: ScenarioDoor[] = [
  {
    id: "reception-exit",
    label: "PASILLO",
    axis: "vertical",
    side: "east",
    rect: { x: 23, y: 8, width: 1, height: 2 },
    trigger: { x: 22.15, y: 8, width: 1.15, height: 2 },
    state: "open",
    connection: {
      scenarioId: "hallway",
      spawnId: "from-reception",
      direction: "right",
      arrivalDoorId: "reception",
    },
  },
];

const receptionObjects: MapObject[] = [
  { id: "reception-waiting-rug", type: "rug", layer: "furniture", x: 2.4, y: 9.5, width: 6.6, height: 5.4 },
  { id: "reception-main-desk", type: "receptionDesk", layer: "furniture", orientation: "south", x: 10.3, y: 5.4, width: 9, height: 2.8, footprint: { x: 10.3, y: 6.3, width: 9, height: 1.9 } },
  { id: "reception-register", type: "registerBook", layer: "decoration", x: 11.7, y: 5.55, width: 1.45, height: 0.9, depthY: 8.25 },
  { id: "reception-bell", type: "serviceBell", layer: "decoration", x: 16.25, y: 5.75, width: 0.85, height: 0.65, depthY: 8.25 },
  { id: "reception-key-rack", type: "keyRack", layer: "decoration", x: 12, y: 1.25, width: 5.7, height: 1.65, depthY: 1.55, footprint: { x: 12, y: 1.25, width: 5.7, height: 0.25 } },
  { id: "reception-clerk-chair", type: "writingChair", layer: "furniture", orientation: "south", x: 13.9, y: 3.15, width: 1.5, height: 2.1, footprint: { x: 14.15, y: 3.55, width: 1, height: 1.15 } },
  { id: "reception-files", type: "filingCabinet", layer: "furniture", x: 20.45, y: 2.05, width: 1.5, height: 2.8, footprint: { x: 20.45, y: 2.05, width: 1.5, height: 2.8 } },
  { id: "reception-waiting-bench", type: "bench", layer: "furniture", orientation: "west", x: 1.8, y: 10.4, width: 2.2, height: 3.5, footprint: { x: 1.8, y: 10.95, width: 1.25, height: 2.8 } },
  { id: "reception-waiting-table", type: "roundTable", layer: "furniture", x: 5, y: 11.25, width: 2.7, height: 1.95, footprint: { x: 5.5, y: 11.6, width: 1.7, height: 1.2 } },
  { id: "reception-archive", type: "bookshelf", layer: "furniture", orientation: "south", x: 10.2, y: 15.35, width: 6.4, height: 1.4, footprint: { x: 10.2, y: 15.75, width: 6.4, height: 1 } },
  { id: "reception-coat-stand", type: "coatStand", layer: "furniture", x: 2.1, y: 2, width: 1.2, height: 2.4, footprint: { x: 2.35, y: 3.6, width: 0.7, height: 0.55 } },
  { id: "reception-floor-lamp", type: "lamp", layer: "decoration", x: 6.9, y: 2.25, width: 1, height: 1.55, footprint: { x: 7.15, y: 3.25, width: 0.55, height: 0.45 } },
  { id: "reception-plant", type: "plant", layer: "decoration", x: 20.25, y: 12.75, width: 1.55, height: 2.25, footprint: { x: 20.6, y: 14.15, width: 0.9, height: 0.7 } },
];

const guestRoomWalls: WallSegment[] = [
  { id: "guest-room-north", axis: "horizontal", outer: true, x: 0, y: 0, width: 24, height: 1 },
  { id: "guest-room-south", axis: "horizontal", outer: true, x: 0, y: 17, width: 24, height: 1 },
  { id: "guest-room-east", axis: "vertical", outer: true, x: 23, y: 1, width: 1, height: 16 },
  { id: "guest-room-west-a", axis: "vertical", outer: true, x: 0, y: 1, width: 1, height: 7 },
  { id: "guest-room-west-b", axis: "vertical", outer: true, x: 0, y: 10, width: 1, height: 7 },
];

const guestRoomDoors: ScenarioDoor[] = [
  {
    id: "guest-room-exit",
    label: "PASILLO",
    axis: "vertical",
    side: "west",
    rect: { x: 0, y: 8, width: 1, height: 2 },
    trigger: { x: 0.7, y: 8, width: 1.15, height: 2 },
    state: "open",
    connection: {
      scenarioId: "hallway",
      spawnId: "from-guest-room",
      direction: "left",
      arrivalDoorId: "guest-room",
    },
  },
];

const guestRoomObjects: MapObject[] = [
  { id: "guest-room-rug", type: "rug", layer: "furniture", x: 6.5, y: 8.2, width: 9.2, height: 6.2 },
  { id: "guest-room-bed", type: "bed", layer: "furniture", orientation: "north", x: 16.5, y: 1.45, width: 4.4, height: 6.5, footprint: { x: 16.5, y: 1.45, width: 4.4, height: 6.5 } },
  { id: "guest-room-nightstand", type: "nightstand", layer: "furniture", x: 21.15, y: 2.15, width: 1.35, height: 1.55, footprint: { x: 21.15, y: 2.35, width: 1.35, height: 1.35 } },
  { id: "guest-room-bedside-lamp", type: "lamp", layer: "decoration", x: 21.3, y: 1.55, width: 1.05, height: 1.45, depthY: 3.75 },
  { id: "guest-room-wardrobe", type: "wardrobe", layer: "furniture", orientation: "west", x: 1.65, y: 1.5, width: 2.45, height: 4.4, footprint: { x: 1.65, y: 1.5, width: 2.45, height: 4.4 } },
  { id: "guest-room-desk", type: "desk", layer: "furniture", orientation: "south", x: 6.1, y: 2.15, width: 6.2, height: 2.55, footprint: { x: 6.1, y: 2.85, width: 6.2, height: 1.85 } },
  { id: "guest-room-chair", type: "writingChair", layer: "furniture", orientation: "north", x: 8.45, y: 4.85, width: 1.5, height: 2.1, footprint: { x: 8.7, y: 5.2, width: 1, height: 1.2 } },
  { id: "guest-room-desk-books", type: "smallBooks", layer: "decoration", x: 10.45, y: 2, width: 1.1, height: 0.75, depthY: 4.75 },
  { id: "guest-room-desk-lamp", type: "lamp", layer: "decoration", x: 6.7, y: 1.55, width: 0.95, height: 1.35, depthY: 4.75 },
  { id: "guest-room-bed-bench", type: "bench", layer: "furniture", orientation: "north", x: 16.65, y: 9.2, width: 4.1, height: 1.75, footprint: { x: 17, y: 9.65, width: 3.4, height: 1.05 } },
  { id: "guest-room-suitcase", type: "suitcase", layer: "furniture", x: 17.25, y: 12.25, width: 3.15, height: 2.15, footprint: { x: 17.45, y: 12.85, width: 2.75, height: 1.35 } },
  { id: "guest-room-library", type: "bookshelf", layer: "furniture", orientation: "south", x: 7.1, y: 15.35, width: 6.2, height: 1.4, footprint: { x: 7.1, y: 15.75, width: 6.2, height: 1 } },
  { id: "guest-room-plant", type: "plant", layer: "decoration", x: 2.15, y: 13.25, width: 1.55, height: 2.25, footprint: { x: 2.5, y: 14.65, width: 0.9, height: 0.7 } },
];

const kitchenWalls: WallSegment[] = [
  { id: "kitchen-north", axis: "horizontal", outer: true, x: 0, y: 0, width: 24, height: 1 },
  { id: "kitchen-south", axis: "horizontal", outer: true, x: 0, y: 17, width: 24, height: 1 },
  { id: "kitchen-east", axis: "vertical", outer: true, x: 23, y: 1, width: 1, height: 16 },
  { id: "kitchen-west-a", axis: "vertical", outer: true, x: 0, y: 1, width: 1, height: 7 },
  { id: "kitchen-west-b", axis: "vertical", outer: true, x: 0, y: 10, width: 1, height: 7 },
];

const kitchenDoors: ScenarioDoor[] = [
  {
    id: "kitchen-exit",
    label: "PASILLO",
    axis: "vertical",
    side: "west",
    rect: { x: 0, y: 8, width: 1, height: 2 },
    trigger: { x: 0.7, y: 8, width: 1.15, height: 2 },
    state: "open",
    connection: {
      scenarioId: "hallway",
      spawnId: "from-kitchen",
      direction: "left",
      arrivalDoorId: "kitchen",
    },
  },
];

const kitchenObjects: MapObject[] = [
  { id: "kitchen-wall-counter", type: "counter", layer: "furniture", orientation: "north", x: 4.4, y: 1.1, width: 12.2, height: 2.45, footprint: { x: 4.4, y: 1.1, width: 12.2, height: 1.8 } },
  { id: "kitchen-sink", type: "sink", layer: "decoration", x: 5.35, y: 1.35, width: 2.25, height: 1.25, depthY: 3.6 },
  { id: "kitchen-stove", type: "stove", layer: "decoration", x: 11.7, y: 1.3, width: 2.35, height: 1.35, depthY: 3.6 },
  { id: "kitchen-pantry", type: "pantry", layer: "furniture", orientation: "east", x: 20.25, y: 1.45, width: 1.85, height: 4.5, footprint: { x: 20.55, y: 1.45, width: 1.55, height: 4.5 } },
  { id: "kitchen-island", type: "counter", layer: "furniture", orientation: "south", x: 14.4, y: 6.15, width: 6.3, height: 2.5, footprint: { x: 14.4, y: 6.95, width: 6.3, height: 1.7 } },
  { id: "kitchen-cookbook", type: "smallBooks", layer: "decoration", x: 18.65, y: 6, width: 1.1, height: 0.75, depthY: 8.7 },
  { id: "kitchen-table", type: "roundTable", layer: "furniture", x: 6.4, y: 10.1, width: 4.2, height: 2.8, footprint: { x: 7.1, y: 10.6, width: 2.8, height: 1.7 } },
  { id: "kitchen-chair-west", type: "chair", layer: "furniture", orientation: "east", x: 5.05, y: 10.25, width: 1.35, height: 2.45, footprint: { x: 5.3, y: 10.75, width: 0.8, height: 1.35 } },
  { id: "kitchen-chair-east", type: "chair", layer: "furniture", orientation: "west", x: 10.55, y: 10.25, width: 1.35, height: 2.45, footprint: { x: 10.8, y: 10.75, width: 0.8, height: 1.35 } },
  { id: "kitchen-chair-south", type: "chair", layer: "furniture", orientation: "north", x: 7.8, y: 12.75, width: 1.45, height: 2.05, footprint: { x: 8.05, y: 13.15, width: 0.95, height: 1.1 } },
  { id: "kitchen-produce", type: "produceCrate", layer: "furniture", x: 17.2, y: 12.25, width: 3.25, height: 2.35, footprint: { x: 17.45, y: 12.95, width: 2.75, height: 1.45 } },
  { id: "kitchen-storage-shelf", type: "bookshelf", layer: "furniture", orientation: "south", x: 5.4, y: 15.4, width: 6.3, height: 1.35, footprint: { x: 5.4, y: 15.75, width: 6.3, height: 1 } },
  { id: "kitchen-herb-plant", type: "plant", layer: "decoration", x: 2.05, y: 13.1, width: 1.45, height: 2.1, footprint: { x: 2.35, y: 14.4, width: 0.85, height: 0.65 } },
];

const hallway: GameScenario = {
  id: "hallway",
  name: "Pasillo de la posada",
  grid: { columns: 24, rows: 30, logicalWidth: 768, logicalHeight: 960 },
  floors: [
    { id: "hall-floor", kind: "oak", zone: "pasillo", x: 6, y: 1, width: 13, height: 28 },
  ],
  walls: hallwayWalls,
  objects: hallwayObjects,
  npcs: [],
  interactions: [],
  doors: hallwayDoors,
  windows: [],
  spawns: {
    entrance: { id: "entrance", x: 12, y: 27.15, direction: "up" },
    "from-office": { id: "from-office", x: 17.25, y: 21, direction: "left" },
    "from-reception": { id: "from-reception", x: 7.25, y: 18, direction: "right" },
    "from-guest-room": { id: "from-guest-room", x: 17.25, y: 11, direction: "left" },
    "from-kitchen": { id: "from-kitchen", x: 17.25, y: 5, direction: "left" },
  },
  blockedZones: createBlockedZones(hallwayWalls, hallwayObjects, hallwayDoors),
};

const office: GameScenario = {
  id: "office",
  name: "Despacho del propietario",
  grid: { columns: 24, rows: 18, logicalWidth: 768, logicalHeight: 576 },
  floors: [
    { id: "office-floor", kind: "darkOak", zone: "despacho", x: 1, y: 1, width: 22, height: 16 },
  ],
  walls: officeWalls,
  objects: officeObjects,
  npcs: officeNpcs,
  interactions: officeInteractions,
  doors: officeDoors,
  windows: [
    { id: "office-window", side: "east", x: 22.72, y: 5.2, width: 1.15, height: 4.2 },
  ],
  spawns: {
    "from-hallway": { id: "from-hallway", x: 2.3, y: 9, direction: "right" },
  },
  blockedZones: createBlockedZones(officeWalls, officeObjects, officeDoors),
};

const reception: GameScenario = {
  id: "reception",
  name: "Recepción de la posada",
  grid: { columns: 24, rows: 18, logicalWidth: 768, logicalHeight: 576 },
  floors: [
    { id: "reception-floor", kind: "darkOak", zone: "recepcion", x: 1, y: 1, width: 22, height: 16 },
  ],
  walls: receptionWalls,
  objects: receptionObjects,
  npcs: [],
  interactions: [],
  doors: receptionDoors,
  windows: [
    { id: "reception-window", side: "west", x: 0.12, y: 5.1, width: 1.15, height: 3.8 },
  ],
  spawns: {
    "from-hallway": { id: "from-hallway", x: 21.65, y: 9, direction: "left" },
  },
  blockedZones: createBlockedZones(receptionWalls, receptionObjects, receptionDoors),
};

const guestRoom: GameScenario = {
  id: "guest-room",
  name: "Habitación del huésped",
  grid: { columns: 24, rows: 18, logicalWidth: 768, logicalHeight: 576 },
  floors: [
    { id: "guest-room-floor", kind: "oak", zone: "dormitorio", x: 1, y: 1, width: 22, height: 16 },
  ],
  walls: guestRoomWalls,
  objects: guestRoomObjects,
  npcs: [],
  interactions: [],
  doors: guestRoomDoors,
  windows: [
    { id: "guest-room-window", side: "east", x: 22.72, y: 9.2, width: 1.15, height: 4.1 },
  ],
  spawns: {
    "from-hallway": { id: "from-hallway", x: 2.3, y: 9, direction: "right" },
  },
  blockedZones: createBlockedZones(guestRoomWalls, guestRoomObjects, guestRoomDoors),
};

const kitchen: GameScenario = {
  id: "kitchen",
  name: "Cocina de la posada",
  grid: { columns: 24, rows: 18, logicalWidth: 768, logicalHeight: 576 },
  floors: [
    { id: "kitchen-floor", kind: "tile", zone: "cocina", x: 1, y: 1, width: 22, height: 16 },
  ],
  walls: kitchenWalls,
  objects: kitchenObjects,
  npcs: [],
  interactions: [],
  doors: kitchenDoors,
  windows: [
    { id: "kitchen-window", side: "east", x: 22.72, y: 8.6, width: 1.15, height: 4.2 },
  ],
  spawns: {
    "from-hallway": { id: "from-hallway", x: 2.3, y: 9, direction: "right" },
  },
  blockedZones: createBlockedZones(kitchenWalls, kitchenObjects, kitchenDoors),
};

export const GAME_SCENARIOS: Record<ScenarioId, GameScenario> = {
  hallway,
  office,
  reception,
  "guest-room": guestRoom,
  kitchen,
};

export const INITIAL_SCENARIO_ID: ScenarioId = "hallway";
export const INITIAL_SPAWN_ID = "entrance";
