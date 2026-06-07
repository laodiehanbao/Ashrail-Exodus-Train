import { _decorator, Component, Node } from 'cc';
import type { TrainModuleCardState } from '../../../viewmodels/TrainModuleViewModel.js';
import type { CocosTrainModuleCardBindingState, CocosTrainModuleCardListBinding } from '../CocosUiBinding.types.js';
import { CocosCreatorActionBindingComponent } from './CocosCreatorActionBindingComponent.js';
import { CocosCreatorAssetRegistryComponent } from './CocosCreatorAssetRegistryComponent.js';
import { findDescendantByName, renderList, setSpriteByNames, setTextByNames } from './CocosCreatorUiBindingUtils.js';

const { ccclass, property } = _decorator;

@ccclass('CocosCreatorTrainModuleCardListBindingComponent')
export class CocosCreatorTrainModuleCardListBindingComponent extends Component implements CocosTrainModuleCardListBinding {
  @property({ type: Node })
  contentRoot: Node | null = null;

  @property({ type: Node })
  itemTemplate: Node | null = null;

  @property({ type: CocosCreatorAssetRegistryComponent })
  assetRegistry: CocosCreatorAssetRegistryComponent | null = null;

  configure(itemTemplate?: Node | null, assetRegistry?: CocosCreatorAssetRegistryComponent | null): void {
    this.itemTemplate = itemTemplate ?? this.itemTemplate;
    this.assetRegistry = assetRegistry ?? this.assetRegistry;
  }

  setItems(items: CocosTrainModuleCardBindingState[]): void {
    renderList(this.contentRoot ?? this.node, this.itemTemplate, items, (node, item) => {
      renderModuleCard(node, item, this.assetRegistry);
    });
  }
}

function renderModuleCard(
  node: Node,
  item: CocosTrainModuleCardBindingState,
  assetRegistry: CocosCreatorAssetRegistryComponent | null,
): void {
  const card = item as TrainModuleCardState;
  setTextByNames(node, ['Label', 'Name', 'Title'], card.displayName);
  setTextByNames(node, ['Level'], `Lv ${card.level}/${card.maxLevel}`);
  setTextByNames(node, ['Power'], `${card.currentPower} -> ${card.nextPower}`);
  setTextByNames(node, ['Fragments'], `${card.fragmentsOwned}/${card.fragmentsRequired}`);
  setTextByNames(node, ['Status'], card.statusText);
  setSpriteByNames(node, ['Icon'], card.iconAssetId ? assetRegistry?.resolveSpriteFrame(card.iconAssetId) : null);

  const buttonNode = findDescendantByName(node, 'UpgradeButton') ?? node;
  const action = buttonNode.getComponent(CocosCreatorActionBindingComponent)
    ?? buttonNode.addComponent(CocosCreatorActionBindingComponent);
  action.setLabel(card.action.label);
  action.setEnabled(card.action.enabled);
  action.setDisabledReason(card.action.disabledReason);
  action.setOnPress(item.onUpgrade);
}
