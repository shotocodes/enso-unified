import { AmbientSoundType } from "@/types";

const BASE_PATH = "";

const SOUND_FILES: Record<AmbientSoundType, string> = {
  thunder: `${BASE_PATH}/sounds/thunder.mp3`,
  fire: `${BASE_PATH}/sounds/fire.mp3`,
  cafe: `${BASE_PATH}/sounds/cafe.mp3`,
  birds: `${BASE_PATH}/sounds/birds.mp3`,
  waves: `${BASE_PATH}/sounds/waves.mp3`,
};

let audioEl: HTMLAudioElement | null = null;
let currentRequestId = 0;

export async function startAmbient(type: AmbientSoundType | "break", volume: number): Promise<void> {
  stopAmbient();
  const requestId = ++currentRequestId;

  if (type === "break") return;

  const audio = new Audio(SOUND_FILES[type]);
  audio.loop = true;
  audio.volume = Math.max(0, Math.min(1, volume));
  try {
    await audio.play();
  } catch {
    return;
  }
  if (currentRequestId !== requestId) { audio.pause(); audio.src = ""; return; }
  audioEl = audio;
}

export function stopAmbient(): void {
  currentRequestId++;
  if (audioEl) { audioEl.pause(); audioEl.src = ""; audioEl = null; }
}

export function setAmbientVolume(volume: number): void {
  if (audioEl) audioEl.volume = Math.max(0, Math.min(1, volume));
}
