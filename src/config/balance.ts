export const TIME = {
  dayStartMinute: 6 * 60,
  daysPerSeason: 28,
} as const;

export const ECONOMY = {
  startWallet: 0,
} as const;

export const RELATIONSHIP = {
  startFriendship: 0,
  startRomance: 0,
  meterMax: 100,
} as const;

export const PLAYER = {
  walkSpeed: 3.2,
  runSpeed: 5.6,
  edgeMargin: 0.35,
  turnDelay: 0.06,
  radius: 0.28,
  maxStep: 0.35,
  shallowTiles: 1,
  wadeFactor: 0.5,
  jumpTime: 0.55,
  jumpHeight: 0.6,
} as const;
