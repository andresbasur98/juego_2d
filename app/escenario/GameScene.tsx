"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { Detective, TouchControls } from "./Detective";
import { MapObjectView } from "./InnScene";
import {
  GAME_SCENARIOS,
  INITIAL_SCENARIO_ID,
  INITIAL_SPAWN_ID,
  type GameScenario,
  type ScenarioDoor,
  type ScenarioInteraction,
  type ScenarioNpc,
  type ScenarioSpawn,
} from "./game-scenarios";
import {
  INITIAL_GAME_PROGRESS,
  type GameProgress,
} from "./game-state";
import type { MapPoint } from "./detective-config";
import type { Rect } from "./map-data";
import styles from "./scenario.module.css";
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

function containsPoint(rect: Rect, point: MapPoint): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

function ScenarioNpcView({ npc }: { npc: ScenarioNpc }) {
  return (
    <div
      aria-label={npc.name}
      className={styles.scenarioNpc}
      data-npc={npc.id}
      role="img"
      style={{
        "--npc-x": npc.x,
        "--npc-y": npc.y,
        "--npc-width": npc.width,
        "--npc-height": npc.height,
        "--npc-depth": 1000 + Math.round(npc.depthY * 10),
        backgroundImage: `url(${npc.spriteSrc})`,
      } as SceneStyle}
    />
  );
}

export default function GameScene() {
  const initialScenario = GAME_SCENARIOS[INITIAL_SCENARIO_ID];
  const initialSpawn = initialScenario.spawns[INITIAL_SPAWN_ID];
  const [scenarioId, setScenarioId] = useState(INITIAL_SCENARIO_ID);
  const [spawnMarker, setSpawnMarker] = useState<ScenarioSpawn>(initialSpawn);
  const [progress, setProgress] = useState<GameProgress>(INITIAL_GAME_PROGRESS);
  const [debug, setDebug] = useState(false);
  const [transitionCovered, setTransitionCovered] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [nearbyInteraction, setNearbyInteraction] = useState<ScenarioInteraction | null>(null);
  const [activeInteraction, setActiveInteraction] = useState<ScenarioInteraction | null>(null);
  const scenario = GAME_SCENARIOS[scenarioId];

  const gameRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const footBoxRef = useRef<HTMLDivElement>(null);
  const scenarioRef = useRef<GameScenario>(scenario);
  const movementHandlerRef = useRef<(position: MapPoint) => void>(() => undefined);
  const transitionActiveRef = useRef(false);
  const guardedDoorRef = useRef<string | null>(null);
  const insideDoorIdsRef = useRef(new Set<string>());
  const noticeTimerRef = useRef<number | null>(null);
  const transitionTimersRef = useRef<number[]>([]);

  useEffect(() => {
    scenarioRef.current = scenario;
  }, [scenario]);

  const onPositionChange = useCallback((position: MapPoint) => {
    movementHandlerRef.current(position);
  }, []);

  const {
    clearInputs,
    getPosition,
    pressTouch,
    releaseTouch,
    setMovementLocked,
    teleport,
  } = useDetectiveMovement({
    gameRef,
    spriteRef,
    footBoxRef,
    obstacles: scenario.blockedZones,
    world: scenario.grid,
    initialPosition: initialSpawn,
    initialDirection: initialSpawn.direction,
    onPositionChange,
  });

  const centerSceneOnPoint = useCallback((point: MapPoint, activeScenario: GameScenario) => {
    const scrollArea = scrollAreaRef.current;
    const game = gameRef.current;
    if (!scrollArea || !game) {
      return;
    }

    const scrollRect = scrollArea.getBoundingClientRect();
    const gameRect = game.getBoundingClientRect();
    const pointX = gameRect.left - scrollRect.left + scrollArea.scrollLeft
      + (point.x / activeScenario.grid.columns) * gameRect.width;
    const pointY = gameRect.top - scrollRect.top + scrollArea.scrollTop
      + (point.y / activeScenario.grid.rows) * gameRect.height;

    scrollArea.scrollTo({
      left: Math.max(0, pointX - scrollArea.clientWidth / 2),
      top: Math.max(0, pointY - scrollArea.clientHeight / 2),
      behavior: "auto",
    });
  }, []);

  useEffect(() => {
    const centerOnDetective = () => {
      centerSceneOnPoint(getPosition(), scenario);
    };
    const animationFrame = window.requestAnimationFrame(centerOnDetective);
    window.addEventListener("resize", centerOnDetective);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", centerOnDetective);
    };
  }, [centerSceneOnPoint, getPosition, scenario]);

  const openInteraction = useCallback((interaction: ScenarioInteraction) => {
    if (transitionActiveRef.current) {
      return;
    }

    clearInputs();
    setMovementLocked(true);
    setActiveInteraction(interaction);
    setProgress((current) => ({
      ...current,
      flags: {
        ...current.flags,
        [`inspected:${scenarioRef.current.id}:${interaction.id}`]: true,
      },
    }));
  }, [clearInputs, setMovementLocked]);

  const closeInteraction = useCallback(() => {
    setActiveInteraction(null);
    setMovementLocked(false);
    window.requestAnimationFrame(() => {
      gameRef.current?.focus({ preventScroll: true });
    });
  }, [setMovementLocked]);

  useEffect(() => {
    const handleInteractionKey = (event: KeyboardEvent) => {
      const isActionKey = event.code === "KeyE"
        || event.code === "Enter"
        || event.code === "NumpadEnter";

      if (activeInteraction && (event.code === "Escape" || isActionKey)) {
        event.preventDefault();
        closeInteraction();
        return;
      }

      if (!activeInteraction && nearbyInteraction && isActionKey) {
        event.preventDefault();
        openInteraction(nearbyInteraction);
      }
    };

    window.addEventListener("keydown", handleInteractionKey, { passive: false });
    return () => window.removeEventListener("keydown", handleInteractionKey);
  }, [activeInteraction, closeInteraction, nearbyInteraction, openInteraction]);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimerRef.current = null;
    }, 2200);
  }, []);

  const scheduleTransitionTimer = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    transitionTimersRef.current.push(timer);
  }, []);

  const beginTransition = useCallback((door: ScenarioDoor) => {
    if (!door.connection || transitionActiveRef.current) {
      return;
    }

    transitionActiveRef.current = true;
    setMovementLocked(true);
    clearInputs();
    setNotice(null);
    setNearbyInteraction(null);
    setActiveInteraction(null);
    setTransitionCovered(true);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fadeDuration = reducedMotion ? 0 : 170;

    scheduleTransitionTimer(() => {
      const destination = GAME_SCENARIOS[door.connection!.scenarioId];
      const destinationSpawn = destination.spawns[door.connection!.spawnId];

      guardedDoorRef.current = door.connection!.arrivalDoorId;
      insideDoorIdsRef.current.clear();
      scenarioRef.current = destination;
      setScenarioId(destination.id);
      setSpawnMarker(destinationSpawn);
      teleport(destinationSpawn, door.connection!.direction);
      setProgress((current) => current.visitedScenarioIds.includes(destination.id)
        ? current
        : {
            ...current,
            visitedScenarioIds: [...current.visitedScenarioIds, destination.id],
          });

      window.requestAnimationFrame(() => {
        setTransitionCovered(false);
        scheduleTransitionTimer(() => {
          transitionActiveRef.current = false;
          setMovementLocked(false);
          gameRef.current?.focus({ preventScroll: true });
        }, fadeDuration + 20);
      });
    }, fadeDuration);
  }, [clearInputs, scheduleTransitionTimer, setMovementLocked, teleport]);

  useEffect(() => {
    movementHandlerRef.current = (position: MapPoint) => {
      if (transitionActiveRef.current) {
        return;
      }

      const activeScenario = scenarioRef.current;
      const guardedDoorId = guardedDoorRef.current;

      if (guardedDoorId) {
        const guardedDoor = activeScenario.doors.find((door) => door.id === guardedDoorId);
        if (!guardedDoor || !containsPoint(guardedDoor.trigger, position)) {
          guardedDoorRef.current = null;
        }
      }

      const overlappingDoors = activeScenario.doors.filter((door) =>
        containsPoint(door.trigger, position),
      );
      const nextInsideIds = new Set(overlappingDoors.map((door) => door.id));

      for (const door of overlappingDoors) {
        if (door.id === guardedDoorRef.current) {
          continue;
        }

        if (door.connection) {
          beginTransition(door);
          return;
        }

        if (!insideDoorIdsRef.current.has(door.id) && door.unavailableMessage) {
          showNotice(door.unavailableMessage);
        }
      }

      insideDoorIdsRef.current = nextInsideIds;
      const nextInteraction = activeScenario.interactions.find((interaction) =>
        containsPoint(interaction.trigger, position),
      ) ?? null;
      setNearbyInteraction((current) => current?.id === nextInteraction?.id
        ? current
        : nextInteraction);
    };

    return () => {
      movementHandlerRef.current = () => undefined;
    };
  }, [beginTransition, showNotice]);

  useEffect(() => () => {
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
    }
    for (const timer of transitionTimersRef.current) {
      window.clearTimeout(timer);
    }
  }, []);

  const frameStyle = {
    "--scenario-aspect": scenario.grid.columns / scenario.grid.rows,
  } as SceneStyle;

  return (
    <main className={styles.page} data-scenario={scenario.id}>
      <h1 className={styles.srOnly}>{scenario.name}</h1>
      <div className={styles.scrollArea} ref={scrollAreaRef}>
        <div className={`${styles.frame} ${styles.gameFrame}`} style={frameStyle}>
          <div
            aria-label={`${scenario.name}. Mueve al detective con las flechas o WASD. Mantén Shift para caminar más rápido.`}
            className={`${styles.scene} ${styles.gameScene} ${debug ? styles.debugScene : ""}`}
            data-active-scenario={scenario.id}
            onPointerDown={() => gameRef.current?.focus({ preventScroll: true })}
            ref={gameRef}
            style={{
              "--columns": scenario.grid.columns,
              "--rows": scenario.grid.rows,
              aspectRatio: `${scenario.grid.columns} / ${scenario.grid.rows}`,
            } as SceneStyle}
            tabIndex={0}
          >
            <div className={styles.floorLayer} aria-hidden="true">
              {scenario.floors.map((zone) => (
                <div
                  className={styles.floorZone}
                  data-floor={zone.kind}
                  data-room={zone.zone}
                  key={zone.id}
                  style={rectStyle(zone)}
                />
              ))}
            </div>

            <div className={styles.structureLayer} aria-hidden="true">
              {scenario.doors.map((door) => (
                <div
                  className={styles.scenarioDoor}
                  data-axis={door.axis}
                  data-label={door.label}
                  data-side={door.side}
                  data-state={door.state}
                  key={door.id}
                  style={rectStyle(door.rect)}
                >
                  <i />
                </div>
              ))}
              {scenario.walls.map((wall) => (
                <div
                  className={styles.wall}
                  data-axis={wall.axis}
                  data-outer={wall.outer ? "true" : "false"}
                  key={wall.id}
                  style={rectStyle(wall)}
                />
              ))}
              {scenario.windows.map((window) => (
                <div
                  className={styles.scenarioWindow}
                  data-side={window.side}
                  key={window.id}
                  style={rectStyle(window)}
                >
                  <i /><i />
                </div>
              ))}
            </div>

            <div className={styles.worldLayer}>
              {scenario.objects.map((object) => (
                <MapObjectView key={object.id} object={object} />
              ))}
              {scenario.npcs.map((npc) => (
                <ScenarioNpcView key={npc.id} npc={npc} />
              ))}
              <Detective
                footBoxRef={footBoxRef}
                spawn={spawnMarker}
                spriteRef={spriteRef}
              />
            </div>

            <div className={styles.topLayer}>
              <span
                aria-hidden="true"
                className={styles.sceneNamePlaque}
                data-label={scenario.name.toUpperCase()}
                style={rectStyle({
                  x: scenario.grid.columns / 2 - 3.25,
                  y: 0.22,
                  width: 6.5,
                  height: 0.62,
                })}
              />
              {scenario.interactions.map((interaction) => (
                <button
                  aria-label={`${interaction.action}: ${interaction.title}`}
                  className={styles.interactionMarker}
                  data-nearby={nearbyInteraction?.id === interaction.id ? "true" : "false"}
                  key={interaction.id}
                  onClick={() => openInteraction(interaction)}
                  style={{
                    "--marker-x": interaction.marker.x,
                    "--marker-y": interaction.marker.y,
                  } as SceneStyle}
                  title={`${interaction.action}: ${interaction.title}`}
                  type="button"
                />
              ))}
            </div>

            {debug && (
              <div className={styles.debugLayer} aria-hidden="true">
                {scenario.blockedZones.map((zone) => (
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

          <div
            aria-hidden="true"
            className={styles.transitionOverlay}
            data-covered={transitionCovered ? "true" : "false"}
          />
        </div>
      </div>

      <TouchControls onPress={pressTouch} onRelease={releaseTouch} />

      {notice && (
        <div className={styles.gameNotice} role="status">
          {notice}
        </div>
      )}

      {nearbyInteraction && !activeInteraction && (
        <button
          aria-label={`${nearbyInteraction.action}: ${nearbyInteraction.title}`}
          className={styles.interactionPrompt}
          onClick={() => openInteraction(nearbyInteraction)}
          type="button"
        >
          <kbd>E</kbd>
          <span>{nearbyInteraction.action}</span>
          <strong>{nearbyInteraction.title}</strong>
        </button>
      )}

      {activeInteraction && (
        <div
          className={styles.interactionBackdrop}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) {
              closeInteraction();
            }
          }}
        >
          <section
            aria-labelledby="interaction-title"
            aria-modal="true"
            className={styles.interactionDialog}
            role="dialog"
          >
            <span>{activeInteraction.kind === "npc" ? "CONVERSACIÓN" : "INSPECCIÓN"}</span>
            <h2 id="interaction-title">{activeInteraction.title}</h2>
            <p>{activeInteraction.text}</p>
            <button autoFocus onClick={closeInteraction} type="button">
              Continuar
            </button>
          </section>
        </div>
      )}

      <label className={styles.debugControl}>
        <input
          checked={debug}
          onChange={(event) => setDebug(event.target.checked)}
          type="checkbox"
        />
        <span aria-hidden="true" />
        Mostrar cuadrícula y colisiones
      </label>

      <span className={styles.progressProbe} aria-hidden="true">
        {progress.visitedScenarioIds.join(",")}
      </span>
    </main>
  );
}
