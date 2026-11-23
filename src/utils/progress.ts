export interface BarFill {
  fillWidth: number;
  percent: number;
}

export function loadingBarFill(progress: number, innerWidth: number): BarFill {
  const p = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
  return { fillWidth: Math.floor(p * innerWidth), percent: Math.floor(p * 100) };
}
