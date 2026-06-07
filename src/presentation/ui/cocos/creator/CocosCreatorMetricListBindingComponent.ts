import { _decorator, Component, Node } from 'cc';
import type { UiMetricState } from '../../../../shared/ui/P0Ui.types.js';
import type { CocosUiMetricListBinding } from '../CocosUiBinding.types.js';
import { CocosCreatorAssetRegistryComponent } from './CocosCreatorAssetRegistryComponent.js';
import { applyAccent, renderList, setSpriteByNames, setTextByNames } from './CocosCreatorUiBindingUtils.js';

const { ccclass, property } = _decorator;

@ccclass('CocosCreatorMetricListBindingComponent')
export class CocosCreatorMetricListBindingComponent extends Component implements CocosUiMetricListBinding {
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

  setItems(items: UiMetricState[]): void {
    renderList(this.contentRoot ?? this.node, this.itemTemplate, items, (node, item) => {
      setTextByNames(node, ['Label', 'Name', 'Title'], item.label);
      setTextByNames(node, ['Value', 'Amount', 'Count'], item.value);
      setSpriteByNames(node, ['Icon'], item.iconAssetId ? this.assetRegistry?.resolveSpriteFrame(item.iconAssetId) : null);
      applyAccent(node, this.assetRegistry?.resolveColor(item.accentToken));
    });
  }
}
