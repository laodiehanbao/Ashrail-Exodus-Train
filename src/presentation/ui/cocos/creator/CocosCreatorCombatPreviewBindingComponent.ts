import { _decorator, Color, Component, Sprite } from 'cc';
import type {
  MainHudCombatEnemyState,
  MainHudCombatPreviewState,
  MainHudCombatTrainPartState,
} from '../../../viewmodels/MainHudViewModel.js';
import type { CocosCombatPreviewBinding } from '../CocosUiBinding.types.js';
import { CocosCreatorAssetRegistryComponent } from './CocosCreatorAssetRegistryComponent.js';
import { findDescendantByName, setSpriteByNames, setTextByNames } from './CocosCreatorUiBindingUtils.js';

const { ccclass, property } = _decorator;

const TRAIN_PART_NODE_NAMES = new Map<string, string>([
  ['train_head', 'TrainHead'],
  ['train_carriage_combat', 'CombatCarriage'],
  ['train_carriage_supply', 'SupplyCarriage'],
]);

const ENEMY_SLOT_NODE_NAMES = ['EnemyPrimary', 'EnemySecondary'] as const;
const TRAIN_PART_BASE_POSITIONS = new Map<string, { x: number; y: number }>([
  ['TrainHead', { x: -162, y: -76 }],
  ['CombatCarriage', { x: 8, y: -66 }],
  ['SupplyCarriage', { x: 158, y: -56 }],
]);
const ENEMY_BASE_POSITIONS = new Map<string, { x: number; y: number }>([
  ['EnemyPrimary', { x: 220, y: 86 }],
  ['EnemySecondary', { x: 306, y: 74 }],
]);

@ccclass('CocosCreatorCombatPreviewBindingComponent')
export class CocosCreatorCombatPreviewBindingComponent extends Component implements CocosCombatPreviewBinding {
  @property({ type: CocosCreatorAssetRegistryComponent })
  assetRegistry: CocosCreatorAssetRegistryComponent | null = null;

  private lastCombatRunRevision = 0;

  configure(assetRegistry?: CocosCreatorAssetRegistryComponent | null): void {
    this.assetRegistry = assetRegistry ?? this.assetRegistry;
  }

  setState(state: MainHudCombatPreviewState): void {
    this.unscheduleAllCallbacks();
    setTextByNames(this.node, ['StageLabel'], state.stageName);
    setTextByNames(this.node, ['PowerLabel'], state.powerText);
    setTextByNames(this.node, ['ThreatLabel'], state.threatText);
    setTextByNames(this.node, ['StatusLabel'], state.statusText);
    setTextByNames(this.node, ['DamageLabel'], state.damageText);
    this.setNodeActive('DamageLabel', false);
    this.resetAnimatedNodes();
    const shouldAnimate = state.combatRunRevision > this.lastCombatRunRevision;
    for (const part of state.trainParts) {
      this.renderTrainPart(part);
    }
    ENEMY_SLOT_NODE_NAMES.forEach((nodeName, index) => this.renderEnemySlot(nodeName, state.enemies[index], state, shouldAnimate));
    if (shouldAnimate) {
      this.playStageRunFeedback(state);
    }
    this.lastCombatRunRevision = state.combatRunRevision;
  }

  private renderTrainPart(part: MainHudCombatTrainPartState): void {
    const nodeName = TRAIN_PART_NODE_NAMES.get(part.partId);
    if (!nodeName) return;
    setSpriteByNames(
      this.node,
      [nodeName],
      part.spriteAssetId ? this.assetRegistry?.resolveSpriteFrame(part.spriteAssetId) : null,
    );
  }

  private renderEnemySlot(
    nodeName: string,
    enemy: MainHudCombatEnemyState | undefined,
    state: MainHudCombatPreviewState,
    shouldAnimate: boolean,
  ): void {
    const visible = Boolean(enemy) && (!state.hideEnemiesOnFinish || shouldAnimate);
    this.setNodeActive(nodeName, visible);
    this.setNodeActive(`${nodeName}Count`, visible);
    setSpriteByNames(
      this.node,
      [nodeName],
      enemy?.spriteAssetId ? this.assetRegistry?.resolveSpriteFrame(enemy.spriteAssetId) : null,
    );
    setTextByNames(this.node, [`${nodeName}Count`], enemy ? `x${enemy.count}` : '');
  }

  private playStageRunFeedback(state: MainHudCombatPreviewState): void {
    setTextByNames(this.node, ['StatusLabel'], state.combatText);
    this.scheduleOnce(() => this.setTrainOffset(10, -4), 0.04);
    this.scheduleOnce(() => this.setEnemyTint(new Color(255, 96, 70, 255)), 0.08);
    this.scheduleOnce(() => {
      this.setTrainOffset(-8, 3);
      this.showDamageLabel(true);
    }, 0.16);
    this.scheduleOnce(() => this.setEnemyTint(new Color(255, 255, 255, 255)), 0.26);
    this.scheduleOnce(() => this.setTrainOffset(6, -2), 0.32);
    this.scheduleOnce(() => {
      this.setTrainOffset(0, 0);
      if (state.hideEnemiesOnFinish) {
        this.hideDefeatedEnemies();
      }
      setTextByNames(this.node, ['StatusLabel'], state.finishText);
    }, 0.48);
    this.scheduleOnce(() => this.showDamageLabel(false), 0.72);
  }

  private resetAnimatedNodes(): void {
    this.setTrainOffset(0, 0);
    this.setEnemyTint(new Color(255, 255, 255, 255));
    for (const [nodeName, position] of ENEMY_BASE_POSITIONS) {
      findDescendantByName(this.node, nodeName)?.setPosition(position.x, position.y, 0);
    }
  }

  private setTrainOffset(offsetX: number, offsetY: number): void {
    for (const [nodeName, position] of TRAIN_PART_BASE_POSITIONS) {
      findDescendantByName(this.node, nodeName)?.setPosition(position.x + offsetX, position.y + offsetY, 0);
    }
  }

  private setEnemyTint(color: Color): void {
    for (const nodeName of ENEMY_SLOT_NODE_NAMES) {
      const sprite = findDescendantByName(this.node, nodeName)?.getComponent(Sprite);
      if (sprite) {
        sprite.color = color;
      }
    }
  }

  private hideDefeatedEnemies(): void {
    this.setNodeActive('EnemyPrimary', false);
    this.setNodeActive('EnemyPrimaryCount', false);
    this.setNodeActive('EnemySecondary', false);
    this.setNodeActive('EnemySecondaryCount', false);
  }

  private showDamageLabel(visible: boolean): void {
    const label = findDescendantByName(this.node, 'DamageLabel');
    if (!label) return;
    label.active = visible;
    label.setPosition(226, visible ? 138 : 96, 0);
  }

  private setNodeActive(nodeName: string, active: boolean): void {
    const node = findDescendantByName(this.node, nodeName);
    if (node) {
      node.active = active;
    }
  }
}
