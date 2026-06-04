import { EventBus } from '../../core/EventBus.js';
import { fail, ok, type Result } from '../../core/Result.types.js';
import type { RewardBundle } from '../../domain/reward/Reward.types.js';
import type { StageChapterConfig } from '../../domain/stage/Stage.types.js';
import { ErrorCode } from '../../shared/ErrorCodes.js';
import type { CombatResolver, CombatResolveResult } from '../combat/CombatResolver.js';
import type { TrainCombatModel } from '../combat/TrainCombatModel.js';
import type { RewardService } from '../loot/RewardService.js';
import type { WaveDirector } from './WaveDirector.js';

export interface StageClearResult {
  stage: StageChapterConfig;
  combat: CombatResolveResult;
  nextStageId: string;
  reward?: RewardBundle;
}

export class StageProgressService {
  private readonly stagesById: Map<string, StageChapterConfig>;
  private readonly orderedStages: StageChapterConfig[];

  constructor(
    stages: StageChapterConfig[],
    private readonly waveDirector: WaveDirector,
    private readonly combatResolver: CombatResolver,
    private readonly rewardService: RewardService,
    private readonly eventBus: EventBus,
  ) {
    this.orderedStages = [...stages].sort((left, right) => left.order - right.order);
    this.stagesById = new Map(stages.map((stage) => [stage.id, stage]));
  }

  runStage(stageId: string, train: TrainCombatModel): Result<StageClearResult> {
    const stage = this.stagesById.get(stageId);
    if (!stage) {
      return fail(ErrorCode.UnknownStage, `Unknown stage ${stageId}`);
    }

    const wave = this.waveDirector.getWave(stage.waveId);
    if (!wave) {
      return fail(ErrorCode.ConfigMissingReference, `Missing wave ${stage.waveId}`);
    }

    const combat = this.combatResolver.resolve(train, wave);
    if (combat.result === 'defeat') {
      return ok({
        stage,
        combat,
        nextStageId: stage.id,
      });
    }

    const reward = this.rewardService.createBundle(stage.clearRewardId);
    if (!reward.ok) {
      return reward;
    }

    const nextStageId = this.getNextStageId(stage.id);
    return ok({
      stage,
      combat,
      nextStageId,
      reward: reward.value,
    });
  }

  grantStageReward(stageId: string, reward: RewardBundle, settlementId: string, nowMs: number): Result<void> {
    const granted = this.rewardService.grant({ settlementId, reward }, nowMs);
    if (!granted.ok) {
      return granted;
    }

    this.eventBus.emit({
      type: 'stage_cleared',
      stageId,
      reward,
    });

    return ok(undefined);
  }

  private getNextStageId(stageId: string): string {
    const index = this.orderedStages.findIndex((stage) => stage.id === stageId);
    return this.orderedStages[index + 1]?.id ?? stageId;
  }
}
