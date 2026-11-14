"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";

import { Detective, TouchControls } from "./Detective";
import styles from "./scenario.module.css";
import {
  GRID,
  floorZones,
  navigation,
  objects,
  passages,
  walls,
  type MapObject,
  type Rect,
} from "./map-data";
import { useDetectiveMovement } from "./useDetectiveMovement";

type SceneStyle = CSSProperties & Record<`--${string}`, string | number>;

function rectStyle(rect: Rect, extra: SceneStyle = {}): SceneStyle {
  return {
    "--x": rect.x,
    "--y": rect.y,
    "--w": rect.width,
    "--h": rect.height,
    ...extra,
  };
}

const bookColors = ["wine", "blue", "ochre", "green", "dust", "wine", "ochre", "blue"];

function Books(): ReactNode {
  return bookColors.map((color, index) => (
    <i key={`${color}-${index}`} data-color={color} />
  ));
}

function FurnitureArt({ object }: { object: MapObject }) {
  switch (object.type) {
    case "rug":
      return <span className={styles.rugInset} />;
    case "roundTable":
      return (
        <>
          <span className={styles.tableTop} />
          <span className={styles.tableApron} />
          <span className={styles.tableLeg} />
        </>
      );
    case "chair":
    case "writingChair":
      return (
        <>
          <span className={styles.chairBack} />
          <span className={styles.chairSeat} />
          <i className={styles.legOne} />
          <i className={styles.legTwo} />
        </>
      );
    case "bookshelf":
      return (
        <>
          <span className={styles.shelfTop} />
          <span className={styles.bookRow}>{Books()}</span>
          <span className={styles.shelfFront} />
        </>
      );
    case "receptionDesk":
      return (
        <>
          <span className={styles.deskTop} />
          <span className={styles.deskFront}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.deskFoot} />
        </>
      );
    case "registerBook":
      return (
        <>
          <span className={styles.bookCover} />
          <span className={styles.bookPages} />
          <span className={styles.bookRibbon} />
        </>
      );
    case "serviceBell":
      return (
        <>
          <span className={styles.bellDome} />
          <span className={styles.bellButton} />
          <span className={styles.bellBase} />
        </>
      );
    case "keyRack":
      return (
        <>
          <span className={styles.keyBoard}>
            {Array.from({ length: 6 }, (_, index) => (
              <i key={index} />
            ))}
          </span>
          <span className={styles.keyShelf} />
        </>
      );
    case "plant":
      return (
        <>
          <span className={styles.plantLeaves}>
            {Array.from({ length: 7 }, (_, index) => (
              <i key={index} />
            ))}
          </span>
          <span className={styles.plantPot} />
        </>
      );
    case "bench":
      return (
        <>
          <span className={styles.benchBack} />
          <span className={styles.benchSeat} />
          <i className={styles.benchLegOne} />
          <i className={styles.benchLegTwo} />
        </>
      );
    case "counter":
      return (
        <>
          <span className={styles.counterTop} />
          <span className={styles.counterFront} />
          <span className={styles.counterHandles}><i /><i /><i /></span>
        </>
      );
    case "sink":
      return (
        <>
          <span className={styles.sinkBasin} />
          <span className={styles.faucet} />
        </>
      );
    case "stove":
      return (
        <span className={styles.stovePlate}>
          <i /><i /><i /><i />
        </span>
      );
    case "produceCrate":
      return (
        <>
          <span className={styles.producePile}>
            {Array.from({ length: 7 }, (_, index) => (
              <i key={index} />
            ))}
          </span>
          <span className={styles.produceCrateBody}>
            <i /><i /><i />
          </span>
        </>
      );
    case "pantry":
      return (
        <>
          <span className={styles.pantryTop} />
          <span className={styles.pantryDoor}><i /></span>
          <span className={styles.pantrySide} />
        </>
      );
    case "bed":
      return (
        <>
          <span className={styles.headboard} />
          <span className={styles.mattress}>
            <i className={styles.pillowOne} />
            <i className={styles.pillowTwo} />
            <i className={styles.blanketFold} />
          </span>
          <span className={styles.bedFront} />
        </>
      );
    case "suitcase":
      return (
        <>
          <span className={styles.suitcaseHandle} />
          <span className={styles.suitcaseCase}>
            <i />
            <i />
          </span>
          <span className={styles.suitcaseStrap} />
        </>
      );
    case "nightstand":
      return (
        <>
          <span className={styles.nightstandTop} />
          <span className={styles.nightstandFront}><i /></span>
        </>
      );
    case "wardrobe":
      return (
        <>
          <span className={styles.wardrobeTop} />
          <span className={styles.wardrobeFront}><i /><i /></span>
          <span className={styles.wardrobeSide} />
        </>
      );
    case "desk":
      return (
        <>
          <span className={styles.officeDeskTop} />
          <span className={styles.officeDeskFront}><i /><i /></span>
          <span className={styles.inkwell} />
          <span className={styles.letter} />
        </>
      );
    case "filingCabinet":
      return (
        <>
          <span className={styles.cabinetTop} />
          <span className={styles.cabinetFront}>
            <i /><i /><i />
          </span>
        </>
      );
    case "lamp":
      return (
        <>
          <span className={styles.lampShade} />
          <span className={styles.lampStem} />
          <span className={styles.lampBase} />
        </>
      );
    case "smallBooks":
      return <span className={styles.bookStack}>{Books()}</span>;
    case "coatStand":
      return (
        <>
          <span className={styles.coatHooks}><i /><i /><i /></span>
          <span className={styles.coatPole} />
          <span className={styles.coatBase} />
        </>
      );
    case "openSafe":
      return (
        <>
          <span className={styles.safeBody}>
            <i className={styles.safeShelf} />
            <i className={styles.safeDial} />
          </span>
          <span className={styles.safeDoor}>
            <i />
          </span>
          <span className={styles.safeTop} />
        </>
      );
  }
}

export function MapObjectView({ object }: { object: MapObject }) {
  const classNames = [
    styles.mapObject,
    styles[object.type],
    object.orientation ? styles[object.orientation] : "",
  ].filter(Boolean).join(" ");

  return (
    <div
      className={classNames}
      data-object={object.type}
      style={rectStyle(object, {
        "--depth": object.type === "rug"
          ? 4
          : 1000 + Math.round((object.depthY ?? object.y + object.height) * 10),
      })}
    >
      <FurnitureArt object={object} />
    </div>
  );
}

export default function InnScene() {
  const [debug, setDebug] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const footBoxRef = useRef<HTMLDivElement>(null);
  const { pressTouch, releaseTouch } = useDetectiveMovement({
    gameRef,
    spriteRef,
    footBoxRef,
    obstacles: navigation.blockedZones,
    world: GRID,
  });

  return (
    <main className={styles.page}>
      <h1 className={styles.srOnly}>Interior de la posada La Corneja</h1>
      <div className={styles.scrollArea}>
        <div className={styles.frame}>
          <div
            className={`${styles.scene} ${debug ? styles.debugScene : ""}`}
            ref={gameRef}
            style={{
              "--columns": GRID.columns,
              "--rows": GRID.rows,
            } as SceneStyle}
            aria-label="Escenario jugable de una posada. Mueve al detective con las flechas o WASD. Mantén Shift para caminar más rápido."
            onPointerDown={() => gameRef.current?.focus({ preventScroll: true })}
            tabIndex={0}
          >
            <div className={styles.floorLayer} aria-hidden="true">
              {floorZones.map((zone) => (
                <div
                  className={styles.floorZone}
                  data-floor={zone.kind}
                  data-room={zone.room}
                  key={zone.id}
                  style={rectStyle(zone)}
                />
              ))}
            </div>

            <div className={styles.structureLayer} aria-hidden="true">
              {passages.map((passage) => (
                <div
                  className={styles.threshold}
                  data-axis={passage.axis}
                  key={passage.id}
                  style={rectStyle(passage)}
                />
              ))}
              {walls.map((wall) => (
                <div
                  className={styles.wall}
                  data-axis={wall.axis}
                  data-outer={wall.outer ? "true" : "false"}
                  key={wall.id}
                  style={rectStyle(wall)}
                />
              ))}
              <div className={styles.entranceStep} style={rectStyle({ x: 14.75, y: 23.1, width: 2.5, height: 0.65 })} />
            </div>

            <div className={styles.worldLayer}>
              {objects.map((object) => (
                <MapObjectView key={object.id} object={object} />
              ))}
              <Detective spriteRef={spriteRef} footBoxRef={footBoxRef} />
            </div>

            <div className={styles.topLayer} aria-hidden="true">
              <span className={styles.roomPlaque} data-label="COMÚN" style={rectStyle({ x: 5, y: 0.45, width: 3, height: 0.7 })} />
              <span className={styles.roomPlaque} data-label="POSADA" style={rectStyle({ x: 14.3, y: 0.45, width: 2.4, height: 0.7 })} />
              <span className={styles.roomPlaque} data-label="COCINA" style={rectStyle({ x: 19.6, y: 0.45, width: 3, height: 0.7 })} />
              <span className={styles.roomPlaque} data-label="HUÉSPED" style={rectStyle({ x: 26.6, y: 0.45, width: 3, height: 0.7 })} />
            </div>

            {debug && (
              <div className={styles.debugLayer} aria-hidden="true">
                {navigation.blockedZones.map((zone) => (
                  <span
                    className={styles.collision}
                    data-source={zone.source}
                    key={zone.id}
                    style={rectStyle(zone)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <TouchControls onPress={pressTouch} onRelease={releaseTouch} />

      <label className={styles.debugControl}>
        <input
          checked={debug}
          onChange={(event) => setDebug(event.target.checked)}
          type="checkbox"
        />
        <span aria-hidden="true" />
        Mostrar cuadrícula y colisiones
      </label>
    </main>
  );
}
