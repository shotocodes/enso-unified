import { CompletionSoundType } from "@/types";

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
    masterGain.gain.value = 0.5;
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function getMasterGain(): GainNode | null {
  getAudioContext();
  return masterGain;
}

export function setVolume(volume: number): void {
  const gain = getMasterGain();
  if (gain) {
    gain.gain.value = Math.max(0, Math.min(1, volume));
  }
}

export function playTickSound(type: string = "classic"): void {
  const ctx = getAudioContext();
  const gain = getMasterGain();
  if (!ctx || !gain) return;

  const osc = ctx.createOscillator();
  const envGain = ctx.createGain();
  osc.connect(envGain);
  envGain.connect(gain);

  switch (type) {
    case "classic":
      osc.type = "square";
      osc.frequency.value = 800;
      envGain.gain.setValueAtTime(0.06, ctx.currentTime);
      envGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.02);
      break;
    case "soft":
      osc.type = "sine";
      osc.frequency.value = 400;
      envGain.gain.setValueAtTime(0.04, ctx.currentTime);
      envGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
      break;
    case "digital":
      osc.type = "triangle";
      osc.frequency.value = 1200;
      envGain.gain.setValueAtTime(0.05, ctx.currentTime);
      envGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.015);
      break;
  }
}

export function previewSound(type: string): void {
  playTickSound(type);
  setTimeout(() => playTickSound(type), 300);
  setTimeout(() => playTickSound(type), 600);
}

export function playCelebration(): void {
  const ctx = getAudioContext();
  const gain = getMasterGain();
  if (!ctx || !gain) return;

  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const envGain = ctx.createGain();
    osc.connect(envGain);
    envGain.connect(gain);

    osc.type = "sine";
    osc.frequency.value = freq;
    const start = ctx.currentTime + i * 0.15;
    envGain.gain.setValueAtTime(0.15, start);
    envGain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

    osc.start(start);
    osc.stop(start + 0.3);
  });
}

export function playChime(): void {
  const ctx = getAudioContext();
  const gain = getMasterGain();
  if (!ctx || !gain) return;
  const notes = [784, 988, 1175];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const envGain = ctx.createGain();
    osc.connect(envGain); envGain.connect(gain);
    osc.type = "sine"; osc.frequency.value = freq;
    const start = ctx.currentTime + i * 0.2;
    envGain.gain.setValueAtTime(0.1, start);
    envGain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
    osc.start(start); osc.stop(start + 0.5);
  });
}

export function playGentle(): void {
  const ctx = getAudioContext();
  const gain = getMasterGain();
  if (!ctx || !gain) return;
  const osc = ctx.createOscillator();
  const envGain = ctx.createGain();
  osc.connect(envGain); envGain.connect(gain);
  osc.type = "sine"; osc.frequency.value = 440;
  envGain.gain.setValueAtTime(0.08, ctx.currentTime);
  envGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
  osc.start(); osc.stop(ctx.currentTime + 1.5);
}

export function playCompletionSound(type: CompletionSoundType): void {
  switch (type) {
    case "celebration": playCelebration(); break;
    case "chime": playChime(); break;
    case "gentle": playGentle(); break;
    case "none": break;
  }
}

export function playAlert(): void {
  const ctx = getAudioContext();
  const gain = getMasterGain();
  if (!ctx || !gain) return;

  for (let i = 0; i < 2; i++) {
    const osc = ctx.createOscillator();
    const envGain = ctx.createGain();
    osc.connect(envGain);
    envGain.connect(gain);

    osc.type = "sine";
    osc.frequency.value = i === 0 ? 880 : 660;
    const start = ctx.currentTime + i * 0.25;
    envGain.gain.setValueAtTime(0.12, start);
    envGain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

    osc.start(start);
    osc.stop(start + 0.2);
  }
}
