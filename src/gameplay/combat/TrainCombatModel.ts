export interface TrainCombatStats {
  power: number;
  maxHp: number;
  armor: number;
}

export class TrainCombatModel {
  constructor(private readonly stats: TrainCombatStats) {}

  get dps(): number {
    return Math.max(1, this.stats.power * 0.6);
  }

  get survivability(): number {
    return this.stats.maxHp + this.stats.armor * 10;
  }

  toStats(): TrainCombatStats {
    return { ...this.stats };
  }
}
