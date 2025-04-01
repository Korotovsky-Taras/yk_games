export const revealWaitTime = 1000;

export const playersSettings = ['1', '2', '3', '4'] as const;

export const gridSettings = ['4x4', '6x6'] as const;

export type PlayersSetting = typeof playersSettings[number];

export type GridSetting = typeof gridSettings[number];

export type MemorySettings = {
  players: PlayersSetting;
  grid: GridSetting;
};
