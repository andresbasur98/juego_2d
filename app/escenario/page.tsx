import type { Metadata } from "next";
import Link from "next/link";

import BackgroundMusic from "./BackgroundMusic";
import GameScene from "./GameScene";
import styles from "./scenario.module.css";

export const metadata: Metadata = {
  title: "Escenario de la posada",
  description: "Interior cenital de La Corneja, una pequeña posada de madera.",
};

export default function ScenarioPage() {
  return (
    <>
      <BackgroundMusic />
      <aside aria-label="Controles del juego" className={styles.controlsHelp}>
        <strong>CONTROLES</strong>
        <span><kbd>WASD</kbd><kbd>Flechas</kbd> Mover</span>
        <span><kbd>Shift</kbd> Correr</span>
        <span><kbd>E</kbd> Interactuar</span>
      </aside>
      <GameScene />
      <Link className={styles.devMapLink} href="/escenario/mapa-original">
        Mapa general
      </Link>
    </>
  );
}
