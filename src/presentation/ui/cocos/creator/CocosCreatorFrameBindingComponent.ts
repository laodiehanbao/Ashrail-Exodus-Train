import { _decorator, Component, Node, Sprite } from 'cc';
import type { UiPanelLayoutConfig } from '../../../../shared/ui/P0Ui.types.js';
import type { CocosUiFrameBinding } from '../CocosUiBinding.types.js';
import { CocosCreatorAssetRegistryComponent } from './CocosCreatorAssetRegistryComponent.js';
import { applyPanelLayout, findPanelNode } from './CocosCreatorUiBindingUtils.js';

const { ccclass, property } = _decorator;

@ccclass('CocosCreatorFrameBindingComponent')
export class CocosCreatorFrameBindingComponent extends Component implements CocosUiFrameBinding {
  @property({})
  panelId = '';

  @property({ type: Sprite })
  backgroundSprite: Sprite | null = null;

  @property({ type: CocosCreatorAssetRegistryComponent })
  assetRegistry: CocosCreatorAssetRegistryComponent | null = null;

  private layoutRoot: Node | null = null;

  configure(panelId?: string, assetRegistry?: CocosCreatorAssetRegistryComponent | null, layoutRoot?: Node | null): void {
    this.panelId = panelId ?? this.panelId;
    this.assetRegistry = assetRegistry ?? this.assetRegistry;
    this.layoutRoot = layoutRoot ?? this.layoutRoot;
  }

  setVisible(visible: boolean): void {
    this.node.active = visible;
    if (this.layoutRoot?.name === 'RewardPanel') {
      this.layoutRoot.active = visible;
      if (visible) {
        this.layoutRoot.setPosition(0, 0, 0);
      }
    }
  }

  setBackgroundAsset(assetId: string): void {
    const sprite = this.backgroundSprite ?? this.node.getComponent(Sprite);
    if (!sprite) return;
    if (!assetId) {
      sprite.spriteFrame = null;
      return;
    }
    const frame = this.assetRegistry?.resolveSpriteFrame(assetId);
    if (frame) {
      sprite.spriteFrame = frame;
    }
  }

  setPanelLayouts(panels: UiPanelLayoutConfig[]): void {
    const root = this.layoutRoot ?? this.node;
    for (const panel of panels) {
      const target = this.panelId === panel.panelId ? this.node : findPanelNode(root, panel);
      if (target) {
        applyPanelLayout(target, panel);
      }
    }
  }
}
