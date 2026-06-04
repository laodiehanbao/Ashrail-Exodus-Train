export const RewardItemTypes = [
  'resource',
  'equipment',
  'module_fragment',
  'loot_box',
] as const;

export type RewardItemType = (typeof RewardItemTypes)[number];

export const EquipmentRarities = ['common', 'rare', 'epic', 'legendary'] as const;

export type EquipmentRarity = (typeof EquipmentRarities)[number];

export const AdPlayStatuses = [
  'success',
  'cancelled',
  'failed',
  'no_fill',
  'timeout',
] as const;

export type AdPlayStatus = (typeof AdPlayStatuses)[number];

export const StageRunResults = ['victory', 'defeat'] as const;

export type StageRunResult = (typeof StageRunResults)[number];
