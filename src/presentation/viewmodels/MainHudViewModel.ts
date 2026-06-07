import type {
  P0CombatTrainPartId,
  UiActionState,
  UiMetricState,
  UiScreenLayoutConfig,
  UiVisualAssetResolver,
} from '../../shared/ui/P0Ui.types.js';
import { P0_COMBAT_TRAIN_PART_IDS } from '../../shared/ui/P0Ui.types.js';
import type { StageChapterConfig, StageEnemyConfig, StageWaveConfig } from '../../domain/stage/Stage.types.js';
import type { P0UiSnapshot } from './P0UiSnapshot.types.js';
import type { UiTextService } from './UiTextService.js';

export type P0CombatPreviewMode = 'ready' | 'clear' | 'failed';

export interface MainHudCombatTrainPartState {
  partId: P0CombatTrainPartId;
  spriteAssetId?: string;
}

export interface MainHudCombatEnemyState {
  enemyId: string;
  spriteAssetId?: string;
  count: number;
  hp: number;
  attack: number;
}

export interface MainHudCombatPreviewState {
  combatRunRevision: number;
  stageId: string;
  stageName: string;
  waveId?: string;
  trainParts: MainHudCombatTrainPartState[];
  enemies: MainHudCombatEnemyState[];
  powerText: string;
  threatText: string;
  statusText: string;
  combatText: string;
  clearText: string;
  finishText: string;
  damageText: string;
  hideEnemiesOnFinish: boolean;
}

export interface MainHudState {
  title: string;
  statusText: string;
  power: number;
  coin: number;
  currentStageId: string;
  combatPreview: MainHudCombatPreviewState;
  metrics: UiMetricState[];
  actions: UiActionState[];
  layout?: UiScreenLayoutConfig;
}

export function createMainHudState(
  snapshot: P0UiSnapshot,
  text?: UiTextService,
  layout?: UiScreenLayoutConfig,
  resolveVisualAsset?: UiVisualAssetResolver,
  stage?: StageChapterConfig,
  wave?: StageWaveConfig,
  combatRunRevision = 0,
  combatPreviewMode: P0CombatPreviewMode = 'ready',
  combatDamageAmount?: number,
  stageStartLocked = false,
): MainHudState {
  const power = snapshot.power;
  const coin = snapshot.progress.resources.coin ?? 0;
  const currentStageId = snapshot.progress.currentStageId;
  const combatPreview = createCombatPreviewState(
    snapshot,
    currentStageId,
    text,
    resolveVisualAsset,
    stage,
    wave,
    combatRunRevision,
    combatPreviewMode,
    combatDamageAmount,
  );
  const stageStatusText = createStageStatusText(text, combatPreviewMode);

  return {
    title: getText(text, 'ui.screen.mainHud.title'),
    statusText: stageStatusText,
    power,
    coin,
    currentStageId,
    combatPreview,
    metrics: [
      {
        labelKey: 'ui.label.power',
        label: getText(text, 'ui.label.power'),
        value: String(power),
        accentToken: 'ember_orange',
      },
      {
        labelKey: 'ui.label.coin',
        label: getText(text, 'ui.label.coin'),
        value: String(coin),
        accentToken: 'warning_yellow',
        iconAssetId: resolveVisualAsset?.('resource', 'coin'),
      },
      {
        labelKey: 'ui.label.stage',
        label: getText(text, 'ui.label.stage'),
        value: combatPreview.stageName,
        accentToken: 'steel_white',
      },
    ],
    actions: [
      {
        actionId: 'ui_request_stage_start',
        labelKey: stageStartLocked ? 'ui.button.stage.resolving' : 'ui.button.stage.start',
        label: getText(text, stageStartLocked ? 'ui.button.stage.resolving' : 'ui.button.stage.start'),
        enabled: !stageStartLocked,
        disabledReasonKey: stageStartLocked ? 'ui.status.stage.combat' : undefined,
        disabledReason: stageStartLocked ? getText(text, 'ui.status.stage.combat') : undefined,
      },
    ],
    layout,
  };
}

function createCombatPreviewState(
  snapshot: P0UiSnapshot,
  currentStageId: string,
  text?: UiTextService,
  resolveVisualAsset?: UiVisualAssetResolver,
  stage?: StageChapterConfig,
  wave?: StageWaveConfig,
  combatRunRevision = 0,
  combatPreviewMode: P0CombatPreviewMode = 'ready',
  combatDamageAmount?: number,
): MainHudCombatPreviewState {
  const enemies = wave?.enemies.map((enemy) => createEnemyState(enemy, resolveVisualAsset)) ?? [];
  const totalEnemyCount = enemies.reduce((sum, enemy) => sum + enemy.count, 0);
  const stageName = stage ? getText(text, stage.displayNameKey) : currentStageId;
  const requiredPower = stage?.requiredPower ?? 0;
  const finishText = createStageStatusText(text, combatPreviewMode);
  const damageAmount = combatDamageAmount === undefined ? 0 : Math.max(0, Math.floor(combatDamageAmount));

  return {
    combatRunRevision,
    stageId: stage?.id ?? currentStageId,
    stageName,
    waveId: wave?.id,
    trainParts: P0_COMBAT_TRAIN_PART_IDS.map((partId) => ({
      partId,
      spriteAssetId: resolveVisualAsset?.('train_part', partId),
    })),
    enemies,
    powerText: `${getText(text, 'ui.label.power')} ${snapshot.power}/${requiredPower}`,
    threatText: `${getText(text, 'ui.label.threat')} x${totalEnemyCount}`,
    statusText: finishText,
    combatText: getText(text, 'ui.status.stage.combat'),
    clearText: getText(text, 'ui.status.stage.clear'),
    finishText,
    damageText: `-${damageAmount}`,
    hideEnemiesOnFinish: combatPreviewMode === 'clear',
  };
}

function createStageStatusText(text: UiTextService | undefined, mode: P0CombatPreviewMode): string {
  if (mode === 'clear') return getText(text, 'ui.status.stage.clear');
  if (mode === 'failed') return getText(text, 'ui.status.stage.failed');
  return getText(text, 'ui.status.stage.ready');
}

function createEnemyState(
  enemy: StageEnemyConfig,
  resolveVisualAsset?: UiVisualAssetResolver,
): MainHudCombatEnemyState {
  return {
    enemyId: enemy.enemyId,
    spriteAssetId: resolveVisualAsset?.('enemy', enemy.enemyId),
    count: enemy.count,
    hp: enemy.hp,
    attack: enemy.attack,
  };
}

function getText(text: UiTextService | undefined, key: string): string {
  return text?.text(key) ?? key;
}
