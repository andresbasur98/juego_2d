import type { Metadata } from "next";
import Link from "next/link";

import InnScene from "../InnScene";
import styles from "../scenario.module.css";

export const metadata: Metadata = {
  title: "Mapa general de desarrollo",
  description: "Vista general de desarrollo de la posada La Corneja.",
};

export default function OriginalMapPage() {
  return (
    <>
      <InnScene />
      <Link className={styles.devMapLink} href="/escenario">
        Volver al juego
      </Link>
    </>
  );
}
