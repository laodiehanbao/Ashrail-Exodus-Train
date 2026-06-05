import { Component, Node } from 'cc';
import { fail, ok, type Result } from '../../../../core/Result.types.js';
import { ErrorCode } from '../../../../shared/ErrorCodes.js';
import type { UiNodeBindingEntryConfig } from '../../../../shared/ui/P0UiNodeBinding.types.js';
import type {
  CocosRewardItemListBinding,
  CocosTrainModuleCardListBinding,
  CocosUiActionBinding,
  CocosUiFrameBinding,
  CocosUiMetricListBinding,
  CocosUiTextBinding,
} from '../CocosUiBinding.types.js';
import type { CocosUiBindingHost } from '../P0CocosUiBindingFactory.js';
import { CocosCreatorAssetRegistryComponent } from './CocosCreatorAssetRegistryComponent.js';
import { CocosCreatorActionBindingComponent } from './CocosCreatorActionBindingComponent.js';
import { CocosCreatorFrameBindingComponent } from './CocosCreatorFrameBindingComponent.js';
import { CocosCreatorMetricListBindingComponent } from './CocosCreatorMetricListBindingComponent.js';
import { CocosCreatorRewardItemListBindingComponent } from './CocosCreatorRewardItemListBindingComponent.js';
import { CocosCreatorTextBindingComponent } from './CocosCreatorTextBindingComponent.js';
import { CocosCreatorTrainModuleCardListBindingComponent } from './CocosCreatorTrainModuleCardListBindingComponent.js';

export class CocosCreatorUiBindingHost implements CocosUiBindingHost {
  constructor(
    private readonly root: Node,
    private readonly assetRegistry: CocosCreatorAssetRegistryComponent | null = null,
  ) {}

  createFrameBinding(binding: UiNodeBindingEntryConfig): Result<CocosUiFrameBinding> {
    const node = this.requireNode(binding);
    if (!node.ok) return node;
    const component = getOrAddComponent(node.value, CocosCreatorFrameBindingComponent);
    component.configure(binding.panelId, this.assetRegistry, node.value.parent ?? this.root);
    return ok(component);
  }

  createTextBinding(binding: UiNodeBindingEntryConfig): Result<CocosUiTextBinding> {
    const node = this.requireNode(binding);
    if (!node.ok) return node;
    return ok(getOrAddComponent(node.value, CocosCreatorTextBindingComponent));
  }

  createMetricListBinding(binding: UiNodeBindingEntryConfig): Result<CocosUiMetricListBinding> {
    const node = this.requireNode(binding);
    if (!node.ok) return node;
    const template = this.requireTemplate(binding);
    if (!template.ok) return template;
    const component = getOrAddComponent(node.value, CocosCreatorMetricListBindingComponent);
    component.configure(template.value, this.assetRegistry);
    return ok(component);
  }

  createActionBinding(binding: UiNodeBindingEntryConfig): Result<CocosUiActionBinding> {
    const node = this.requireNode(binding);
    if (!node.ok) return node;
    return ok(getOrAddComponent(node.value, CocosCreatorActionBindingComponent));
  }

  createRewardItemListBinding(binding: UiNodeBindingEntryConfig): Result<CocosRewardItemListBinding> {
    const node = this.requireNode(binding);
    if (!node.ok) return node;
    const template = this.requireTemplate(binding);
    if (!template.ok) return template;
    const component = getOrAddComponent(node.value, CocosCreatorRewardItemListBindingComponent);
    component.configure(template.value, this.assetRegistry);
    return ok(component);
  }

  createTrainModuleCardListBinding(binding: UiNodeBindingEntryConfig): Result<CocosTrainModuleCardListBinding> {
    const node = this.requireNode(binding);
    if (!node.ok) return node;
    const template = this.requireTemplate(binding);
    if (!template.ok) return template;
    const component = getOrAddComponent(node.value, CocosCreatorTrainModuleCardListBindingComponent);
    component.configure(template.value);
    return ok(component);
  }

  private requireNode(binding: UiNodeBindingEntryConfig): Result<Node> {
    const node = findNodeByPath(this.root, binding.nodePath);
    if (!node) {
      return fail(ErrorCode.ConfigMissingReference, `Missing Cocos node ${binding.nodePath} for ${binding.slotId}`, binding);
    }
    return ok(node);
  }

  private requireTemplate(binding: UiNodeBindingEntryConfig): Result<Node | null> {
    if (!binding.itemTemplatePath) return ok(null);
    const template = findNodeByPath(this.root, binding.itemTemplatePath);
    if (!template) {
      return fail(
        ErrorCode.ConfigMissingReference,
        `Missing Cocos list template ${binding.itemTemplatePath} for ${binding.slotId}`,
        binding,
      );
    }
    return ok(template);
  }
}

function getOrAddComponent<T extends Component>(node: Node, component: new () => T): T {
  return node.getComponent(component) ?? node.addComponent(component);
}

function findNodeByPath(root: Node, nodePath: string): Node | null {
  const segments = nodePath.split('/').filter(Boolean);
  if (segments.length === 0) return root;
  let current: Node | null = root;
  const rootIndex = segments.findIndex((segment) => segment === root.name);
  const startIndex = rootIndex >= 0 ? rootIndex + 1 : 0;
  for (let index = startIndex; index < segments.length; index += 1) {
    current = current?.getChildByName(segments[index]) ?? null;
    if (!current) return null;
  }
  return current;
}
