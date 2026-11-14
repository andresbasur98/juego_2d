"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type RefObject,
} from "react";

import { getFootBox, moveWithSubsteps } from "./collisions";
import {
  DETECTIVE_MOVEMENT,
  DETECTIVE_SPRITE,
  type Direction,
  type MapPoint,
} from "./detective-config";
import type { CollisionZone } from "./map-data";

type ActiveInput = {
  direction: Direction;
  order: number;
};

type ControllerOptions = {
  gameRef: RefObject<HTMLDivElement | null>;
  spriteRef: RefObject<HTMLDivElement | null>;
  footBoxRef: RefObject<HTMLDivElement | null>;
  obstacles: readonly CollisionZone[];
  world: { columns: number; rows: number };
  initialPosition?: MapPoint;
  initialDirection?: Direction;
  movementLocked?: boolean;
  onPositionChange?: (position: MapPoint) => void;
};

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  KeyA: "left",
  KeyD: "right",
  KeyS: "down",
  KeyW: "up",
};

const SPRINT_KEYS = new Set(["ShiftLeft", "ShiftRight"]);

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest("input, textarea, select, [contenteditable='true']"),
  );
}

function getLatestDirection(inputs: Map<string, ActiveInput>): Direction | null {
  let latest: ActiveInput | null = null;

  for (const input of inputs.values()) {
    if (!latest || input.order > latest.order) {
      latest = input;
    }
  }

  return latest?.direction ?? null;
}

export function useDetectiveMovement({
  gameRef,
  spriteRef,
  footBoxRef,
  obstacles,
  world,
  initialPosition = DETECTIVE_MOVEMENT.spawn,
  initialDirection = DETECTIVE_MOVEMENT.initialDirection,
  movementLocked = false,
  onPositionChange,
}: ControllerOptions) {
  const positionRef = useRef<MapPoint>({ ...initialPosition });
  const directionRef = useRef<Direction>(initialDirection);
  const activeInputsRef = useRef(new Map<string, ActiveInput>());
  const activeSprintKeysRef = useRef(new Set<string>());
  const inputOrderRef = useRef(0);
  const renderRef = useRef<(moving: boolean) => void>(() => undefined);
  const runtimeRef = useRef({
    obstacles,
    world,
    movementLocked,
    onPositionChange,
  });

  useEffect(() => {
    runtimeRef.current = {
      ...runtimeRef.current,
      obstacles,
      world,
      onPositionChange,
    };
  }, [obstacles, onPositionChange, world]);

  useEffect(() => {
    runtimeRef.current.movementLocked = movementLocked;
  }, [movementLocked]);

  const clearInputs = useCallback(() => {
    activeInputsRef.current.clear();
    activeSprintKeysRef.current.clear();
  }, []);

  const pressInput = useCallback((inputId: string, direction: Direction) => {
    if (activeInputsRef.current.has(inputId) || runtimeRef.current.movementLocked) {
      return;
    }

    inputOrderRef.current += 1;
    activeInputsRef.current.set(inputId, {
      direction,
      order: inputOrderRef.current,
    });
  }, []);

  const releaseInput = useCallback((inputId: string) => {
    activeInputsRef.current.delete(inputId);
  }, []);

  const pressTouch = useCallback(
    (pointerId: number, direction: Direction) => {
      gameRef.current?.focus({ preventScroll: true });
      pressInput(`pointer:${pointerId}`, direction);
    },
    [gameRef, pressInput],
  );

  const releaseTouch = useCallback(
    (pointerId: number) => {
      releaseInput(`pointer:${pointerId}`);
    },
    [releaseInput],
  );

  const teleport = useCallback((position: MapPoint, direction: Direction) => {
    positionRef.current = { ...position };
    directionRef.current = direction;
    renderRef.current(false);
  }, []);

  const setMovementLocked = useCallback(
    (locked: boolean) => {
      runtimeRef.current.movementLocked = locked;
      if (locked) {
        clearInputs();
        renderRef.current(false);
      }
    },
    [clearInputs],
  );

  const getPosition = useCallback((): MapPoint => ({ ...positionRef.current }), []);

  useEffect(() => {
    const game = gameRef.current;
    game?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      const direction = KEY_DIRECTIONS[event.code];
      const isSprintKey = SPRINT_KEYS.has(event.code);
      if ((!direction && !isSprintKey) || isEditableTarget(event.target)) {
        return;
      }

      const activeElement = document.activeElement;
      const gameHasFocus = Boolean(
        game && (activeElement === game || game.contains(activeElement)),
      );
      if (!gameHasFocus || runtimeRef.current.movementLocked) {
        return;
      }

      event.preventDefault();
      if (isSprintKey) {
        activeSprintKeysRef.current.add(event.code);
        return;
      }

      if (!event.repeat) {
        pressInput(`key:${event.code}`, direction!);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const isSprintKey = SPRINT_KEYS.has(event.code);
      if (!KEY_DIRECTIONS[event.code] && !isSprintKey) {
        return;
      }

      if (isSprintKey) {
        activeSprintKeysRef.current.delete(event.code);
      } else {
        releaseInput(`key:${event.code}`);
      }
      if (game && (document.activeElement === game || game.contains(document.activeElement))) {
        event.preventDefault();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInputs();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp, { passive: false });
    window.addEventListener("blur", clearInputs);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    game?.addEventListener("blur", clearInputs);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearInputs);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      game?.removeEventListener("blur", clearInputs);
      clearInputs();
    };
  }, [clearInputs, gameRef, pressInput, releaseInput]);

  useEffect(() => {
    let animationFrame = 0;
    let lastTimestamp: number | null = null;
    let walkElapsed = 0;

    const renderCharacter = (moving: boolean) => {
      const sprite = spriteRef.current;
      const footBoxElement = footBoxRef.current;
      const position = positionRef.current;
      const direction = directionRef.current;

      if (sprite) {
        const cycleIndex = Math.floor(
          walkElapsed * DETECTIVE_MOVEMENT.animationFramesPerSecond,
        ) % DETECTIVE_SPRITE.walkColumns.length;
        const column = moving
          ? DETECTIVE_SPRITE.walkColumns[cycleIndex]
          : DETECTIVE_SPRITE.restingColumn;
        const row = DETECTIVE_SPRITE.directionRows[direction];
        const positionX = (column / (DETECTIVE_SPRITE.columns - 1)) * 100;
        const positionY = (row / (DETECTIVE_SPRITE.rows - 1)) * 100;

        sprite.style.setProperty("--actor-x", String(position.x));
        sprite.style.setProperty("--actor-y", String(position.y));
        sprite.style.setProperty(
          "--actor-depth",
          String(1000 + Math.round(position.y * 10)),
        );
        sprite.style.backgroundPosition = `${positionX}% ${positionY}%`;
        sprite.dataset.direction = direction;
        sprite.dataset.frame = String(column);
        sprite.dataset.moving = String(moving);
        sprite.dataset.sprinting = String(
          moving && activeSprintKeysRef.current.size > 0,
        );
      }

      if (footBoxElement) {
        const footBox = getFootBox(position);
        footBoxElement.style.setProperty("--x", String(footBox.x));
        footBoxElement.style.setProperty("--y", String(footBox.y));
        footBoxElement.style.setProperty("--w", String(footBox.width));
        footBoxElement.style.setProperty("--h", String(footBox.height));
      }
    };

    renderRef.current = renderCharacter;

    const tick = (timestamp: number) => {
      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
      }

      const deltaSeconds = Math.min(
        (timestamp - lastTimestamp) / 1000,
        DETECTIVE_MOVEMENT.maxDeltaSeconds,
      );
      lastTimestamp = timestamp;

      const runtime = runtimeRef.current;
      const requestedDirection = runtime.movementLocked
        ? null
        : getLatestDirection(activeInputsRef.current);
      let moved = false;

      if (requestedDirection) {
        const speedMultiplier = activeSprintKeysRef.current.size > 0
          ? DETECTIVE_MOVEMENT.sprintMultiplier
          : 1;
        directionRef.current = requestedDirection;
        const result = moveWithSubsteps(
          positionRef.current,
          requestedDirection,
          DETECTIVE_MOVEMENT.speed * speedMultiplier * deltaSeconds,
          runtime.obstacles,
          runtime.world,
        );
        positionRef.current = result.position;
        moved = result.moved;

        if (moved) {
          runtime.onPositionChange?.({ ...result.position });
        }
      }

      if (moved) {
        walkElapsed += deltaSeconds * (activeSprintKeysRef.current.size > 0
          ? DETECTIVE_MOVEMENT.sprintMultiplier
          : 1);
      }

      renderCharacter(moved);
      animationFrame = window.requestAnimationFrame(tick);
    };

    renderCharacter(false);
    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      renderRef.current = () => undefined;
      window.cancelAnimationFrame(animationFrame);
    };
  }, [footBoxRef, spriteRef]);

  return {
    clearInputs,
    getPosition,
    pressTouch,
    releaseTouch,
    setMovementLocked,
    teleport,
  };
}
