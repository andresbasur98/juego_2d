"use client";

import type { PointerEvent, RefObject } from "react";

import styles from "./scenario.module.css";
import {
  DETECTIVE_MOVEMENT,
  DETECTIVE_SPRITE,
  type Direction,
  type MapPoint,
} from "./detective-config";

type DetectiveProps = {
  spriteRef: RefObject<HTMLDivElement | null>;
  footBoxRef: RefObject<HTMLDivElement | null>;
  spawn?: MapPoint;
};

type TouchControlsProps = {
  onPress: (pointerId: number, direction: Direction) => void;
  onRelease: (pointerId: number) => void;
};

export function Detective({
  spriteRef,
  footBoxRef,
  spawn = DETECTIVE_MOVEMENT.spawn,
}: DetectiveProps) {
  return (
    <>
      <div
        className={styles.detective}
        ref={spriteRef}
        role="img"
        aria-label="Detective"
        style={{
          backgroundImage: `url(${DETECTIVE_SPRITE.source})`,
          "--actor-x": spawn.x,
          "--actor-y": spawn.y,
          "--actor-width": DETECTIVE_SPRITE.displayWidth,
          "--actor-height": DETECTIVE_SPRITE.displayHeight,
          "--actor-depth": 1000 + Math.round(spawn.y * 10),
        } as React.CSSProperties}
      />
      <div className={styles.detectiveHitbox} ref={footBoxRef} />
      <div
        className={styles.spawnPoint}
        style={{
          "--x": spawn.x,
          "--y": spawn.y,
        } as React.CSSProperties}
      />
    </>
  );
}

const DIRECTIONS: Direction[] = ["up", "left", "down", "right"];

export function TouchControls({ onPress, onRelease }: TouchControlsProps) {
  const handlePointerDown = (
    event: PointerEvent<HTMLButtonElement>,
    direction: Direction,
  ) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    onPress(event.pointerId, direction);
  };

  const handlePointerRelease = (event: PointerEvent<HTMLButtonElement>) => {
    onRelease(event.pointerId);
  };

  return (
    <div className={styles.touchControls} aria-label="Controles de movimiento">
      {DIRECTIONS.map((direction) => (
        <button
          aria-label={`Mover hacia ${direction === "up" ? "arriba" : direction === "down" ? "abajo" : direction === "left" ? "la izquierda" : "la derecha"}`}
          className={styles.touchButton}
          data-direction={direction}
          key={direction}
          onContextMenu={(event) => event.preventDefault()}
          onLostPointerCapture={handlePointerRelease}
          onPointerCancel={handlePointerRelease}
          onPointerDown={(event) => handlePointerDown(event, direction)}
          onPointerUp={handlePointerRelease}
          type="button"
        >
          <span aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
