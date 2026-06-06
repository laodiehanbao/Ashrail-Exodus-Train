export type SceneObject = Record<string, unknown>;

export interface SceneBuildContext {
  objects: SceneObject[];
  nodeIdsByPath: Map<string, number>;
}

export interface NodeOptions {
  name: string;
  parentId: number;
  path: string;
  x?: number;
  y?: number;
  active?: boolean;
}

export interface UiNodeBindingConfig {
  screens: UiScreenNodeBindingConfig[];
}

export interface UiScreenNodeBindingConfig {
  screenId: string;
  rootPath: string;
  bindings: UiNodeBindingEntryConfig[];
}

export interface UiNodeBindingEntryConfig {
  slotId: string;
  nodePath: string;
  kind: 'frame' | 'text' | 'metricList' | 'action' | 'rewardItemList' | 'moduleCardList';
  panelId?: string;
  itemTemplatePath?: string;
  emptyStatePath?: string;
}

export interface UiLayoutConfig {
  designWidth: number;
  designHeight: number;
  colorTokens: { token: string; hex: string }[];
  screens: UiScreenLayoutConfig[];
}

export interface UiScreenLayoutConfig {
  screenId: string;
  backgroundAssetId: string;
  panels: UiPanelLayoutConfig[];
}

export interface UiPanelLayoutConfig {
  panelId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function pushObject(context: SceneBuildContext, object: SceneObject): number {
  context.objects.push(object);
  return context.objects.length - 1;
}

export function addChild(context: SceneBuildContext, parentId: number, childId: number): void {
  const parent = context.objects[parentId];
  const children = parent._children as { __id__: number }[];
  children.push({ __id__: childId });
}

export function addComponent(context: SceneBuildContext, nodeId: number, componentId: number): void {
  const node = context.objects[nodeId];
  const components = node._components as { __id__: number }[];
  components.push({ __id__: componentId });
}

export function vec3(x: number, y: number, z = 0): SceneObject {
  return { __type__: 'cc.Vec3', x, y, z };
}

export function vec4(x: number, y: number, z: number, w: number): SceneObject {
  return { __type__: 'cc.Vec4', x, y, z, w };
}

export function quat(): SceneObject {
  return { __type__: 'cc.Quat', x: 0, y: 0, z: 0, w: 1 };
}

export function color(r: number, g: number, b: number, a: number): { __type__: 'cc.Color'; r: number; g: number; b: number; a: number } {
  return { __type__: 'cc.Color', r, g, b, a };
}
