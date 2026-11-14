"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";

import styles from "./scenario.module.css";

const DEFAULT_MUSIC_VOLUME = 0.24;
const VOLUME_STORAGE_KEY = "la-corneja:music-volume";
const MUTED_STORAGE_KEY = "la-corneja:music-muted";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_MUSIC_VOLUME);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const storedVolume = Number(window.localStorage.getItem(VOLUME_STORAGE_KEY));
    const initialVolume = Number.isFinite(storedVolume) && storedVolume >= 0 && storedVolume <= 1
      ? storedVolume
      : DEFAULT_MUSIC_VOLUME;
    const initialMuted = window.localStorage.getItem(MUTED_STORAGE_KEY) === "true";

    audio.volume = initialVolume;
    audio.muted = initialMuted || initialVolume === 0;
    setVolume(initialVolume);
    setMuted(audio.muted);

    const removeUnlockListeners = () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };

    const unlock = () => {
      if (audio.muted || audio.volume === 0) return;

      void audio.play().then(() => {
        setStarted(true);
        removeUnlockListeners();
      }).catch(() => {
        // Browsers may reject playback until a real player gesture arrives.
      });
    };

    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    unlock();

    return () => {
      removeUnlockListeners();
      audio.pause();
    };
  }, []);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!started || audio.muted) {
      if (audio.volume === 0) {
        audio.volume = DEFAULT_MUSIC_VOLUME;
        setVolume(DEFAULT_MUSIC_VOLUME);
        window.localStorage.setItem(VOLUME_STORAGE_KEY, String(DEFAULT_MUSIC_VOLUME));
      }
      audio.muted = false;
      setMuted(false);
      window.localStorage.setItem(MUTED_STORAGE_KEY, "false");
      void audio.play().then(() => setStarted(true)).catch(() => undefined);
      return;
    }

    audio.muted = true;
    setMuted(true);
    window.localStorage.setItem(MUTED_STORAGE_KEY, "true");
  }, [started]);

  const changeVolume = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextVolume = Number(event.target.value);
    const nextMuted = nextVolume === 0;
    audio.volume = nextVolume;
    audio.muted = nextMuted;
    setVolume(nextVolume);
    setMuted(nextMuted);
    window.localStorage.setItem(VOLUME_STORAGE_KEY, String(nextVolume));
    window.localStorage.setItem(MUTED_STORAGE_KEY, String(nextMuted));

    if (!nextMuted) {
      void audio.play().then(() => setStarted(true)).catch(() => undefined);
    }
  }, []);

  const buttonLabel = !started
    ? "Activar música de fondo"
    : muted
      ? "Activar música de fondo"
      : "Silenciar música de fondo";

  return (
    <>
      <audio
        aria-hidden="true"
        className={styles.backgroundAudio}
        loop
        preload="auto"
        ref={audioRef}
        src="/audio/music.mp3"
      />
      <div
        aria-label="Control de volumen de la música"
        className={styles.musicControl}
        data-muted={!started || muted ? "true" : "false"}
        role="group"
      >
        <button
          aria-label={buttonLabel}
          aria-pressed={muted}
          className={styles.musicToggle}
          onClick={toggleMusic}
          title={buttonLabel}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M4 9v6h4l5 4V5L8 9H4Z" />
            {!muted && volume > 0 && <path d="M16 9c1.3 1.7 1.3 4.3 0 6M19 6c3.2 3.4 3.2 8.6 0 12" />}
            {(muted || volume === 0) && <path d="m17 9 5 6m0-6-5 6" />}
          </svg>
        </button>
        <input
          aria-label="Volumen de la música"
          className={styles.musicSlider}
          max="1"
          min="0"
          onChange={changeVolume}
          step="0.05"
          style={{ "--music-level": `${Math.round(volume * 100)}%` } as CSSProperties}
          type="range"
          value={volume}
        />
        <output aria-live="polite">{Math.round(volume * 100)}%</output>
      </div>
    </>
  );
}
