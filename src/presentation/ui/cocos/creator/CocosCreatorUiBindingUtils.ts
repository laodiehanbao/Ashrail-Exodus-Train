import { Color, instantiate, Label, Node, Sprite, UITransform } from 'cc';
import type { UiPanelLayoutConfig } from '../../../../shared/ui/P0Ui.types.js';

export const GENERATED_ITEM_PREFIX = '__p0_runtime_item_';

export function renderList<T>(root: Node, template: Node | null, items: T[], renderItem: (node: Node, item: T) => void): void {
  for (const child of [...root.children]) {
    if (child.name.startsWith(GENERATED_ITEM_PREFIX)) {
      child.destroy();
    }
  }
  if (template) {
    template.active = false;
  }
  items.forEach((item, index) => {
    const node = template ? instantiate(template) : new Node(`${GENERATED_ITEM_PREFIX}${index}`);
    node.name = `${GENERATED_ITEM_PREFIX}${index}`;
    node.active = true;
    root.addChild(node);
    renderItem(node, item);
  });
}

export function setTextByNames(root: Node, names: string[], text: string): void {
  const label = findDescendantLabel(root, names) ?? root.getComponent(Label) ?? root.addComponent(Label);
  label.string = text;
}

export function getOrAddLabel(node: Node, preferred: Label | null): Label {
  return preferred ?? node.getComponent(Label) ?? node.addComponent(Label);
}

export function findDescendantLabel(root: Node, names: string[]): Label | null {
  for (const name of names) {
    const node = findDescendantByName(root, name);
    const label = node?.getComponent(Label);
    if (label) return label;
  }
  return null;
}

export function findDescendantByName(root: Node, name: string): Node | null {
  for (const child of root.children) {
    if (child.name === name) return child;
    const nested = findDescendantByName(child, name);
    if (nested) return nested;
  }
  return null;
}

export function findPanelNode(root: Node, panel: UiPanelLayoutConfig): Node | null {
  return findDescendantByPredicate(root, (node) => isPanelNameMatch(node.name, panel.panelId, root.name));
}

export function applyPanelLayout(node: Node, panel: UiPanelLayoutConfig): void {
  node.setPosition(panel.x + panel.width / 2, -(panel.y + panel.height / 2), 0);
  const transform = node.getComponent(UITransform) ?? node.addComponent(UITransform);
  transform.setContentSize(panel.width, panel.height);
}

export function applyAccent(node: Node, color: Color | null | undefined): void {
  if (!color) return;
  const sprite = node.getComponent(Sprite);
  if (sprite) sprite.color = color;
  const label = node.getComponent(Label);
  if (label) label.color = color;
}

function findDescendantByPredicate(root: Node, predicate: (node: Node) => boolean): Node | null {
  for (const child of root.children) {
    if (predicate(child)) return child;
    const nested = findDescendantByPredicate(child, predicate);
    if (nested) return nested;
  }
  return null;
}

function isPanelNameMatch(nodeName: string, panelId: string, screenRootName: string): boolean {
  const normalizedNode = normalizeNameToken(nodeName);
  const normalizedPanel = normalizeNameToken(panelId);
  if (normalizedNode === normalizedPanel) return true;

  const normalizedRoot = normalizeNameToken(screenRootName);
  const rootPrefixed = normalizedRoot && normalizedPanel.startsWith(normalizedRoot)
    ? normalizedPanel.slice(normalizedRoot.length)
    : normalizedPanel;
  return normalizedNode === rootPrefixed;
}

function normalizeNameToken(value: string): string {
  return value.replace(/[^a-z0-9]/gi, '').toLowerCase();
}
