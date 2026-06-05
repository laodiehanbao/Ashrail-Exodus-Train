import { readAssetMetaUuid, stableUuid } from './cocosCreatorAssetUtils.js';
import {
  P0_CONFIG_ASSET_PATHS,
  P0_CREATOR_CLASS_IDS,
  P0_DESIGN_HEIGHT,
  P0_DESIGN_WIDTH,
  P0_SCENE_NAME,
} from './p0CocosScene.constants.js';
import {
  addNodeComponent,
  color,
  createButtonComponent,
  createCameraComponent,
  createCanvasComponent,
  createLabelComponent,
  createLayoutComponent,
  createNode,
  createSceneContext,
  createSpriteComponent,
  createUiTransform,
  createWidgetComponent,
  pushObject,
  shortId,
} from './cocosSceneSerialization.js';
import { addSceneGlobals } from './cocosSceneGlobals.js';
import type {
  SceneBuildContext,
  UiLayoutConfig,
  UiNodeBindingConfig,
  UiNodeBindingEntryConfig,
} from './cocosSceneSerialization.types.js';

export function buildP0CocosScene(projectRoot: string, bindings: UiNodeBindingConfig, layout: UiLayoutConfig): SceneBuildContext {
  const context = createSceneContext();
  pushObject(context, {
    __type__: 'cc.SceneAsset',
    _name: P0_SCENE_NAME,
    _objFlags: 0,
    _native: '',
    scene: { __id__: 1 },
  });
  pushObject(context, {
    __type__: 'cc.Scene',
    _name: P0_SCENE_NAME,
    _objFlags: 0,
    _parent: null,
    _children: [],
    _active: true,
    _components: [],
    _prefab: null,
    autoReleaseAssets: false,
    _globals: { __id__: 0 },
    _id: stableUuid('cocos-scene-node:scene_p0_exodus_train_main'),
  });

  const canvasId = createNode(context, {
    name: 'Canvas',
    parentId: 1,
    path: 'Canvas',
    x: P0_DESIGN_WIDTH / 2,
    y: P0_DESIGN_HEIGHT / 2,
  });
  const cameraId = createNode(context, { name: 'Camera', parentId: canvasId, path: 'Canvas/Camera' });
  const p0Id = createNode(context, {
    name: 'P0',
    parentId: canvasId,
    path: 'Canvas/P0',
    x: -P0_DESIGN_WIDTH / 2,
    y: P0_DESIGN_HEIGHT / 2,
  });
  const registryNodeId = createNode(context, { name: 'AssetRegistry', parentId: p0Id, path: 'Canvas/P0/AssetRegistry' });
  const bootstrapNodeId = createNode(context, { name: 'Bootstrap', parentId: p0Id, path: 'Canvas/P0/Bootstrap' });

  const cameraComponentId = createCameraComponent(context, cameraId);
  createUiTransform(context, canvasId, P0_DESIGN_WIDTH, P0_DESIGN_HEIGHT);
  createCanvasComponent(context, canvasId, cameraComponentId);
  createWidgetComponent(context, canvasId);
  createUiTransform(context, cameraId, 100, 100);
  createUiTransform(context, p0Id, P0_DESIGN_WIDTH, P0_DESIGN_HEIGHT);
  createUiTransform(context, registryNodeId, 10, 10);
  createUiTransform(context, bootstrapNodeId, 10, 10);

  const registryComponentId = createAssetRegistryComponent(context, registryNodeId, layout);
  createBootstrapComponent(context, projectRoot, bootstrapNodeId, canvasId, registryComponentId);
  createManifestNodes(context, bindings, p0Id);
  addSceneGlobals(context, 1);
  return context;
}

export function collectP0ManifestPaths(bindings: UiNodeBindingConfig): string[] {
  const paths = new Set<string>();
  for (const screen of bindings.screens) {
    paths.add(screen.rootPath);
    for (const binding of screen.bindings) {
      paths.add(binding.nodePath);
      if (binding.itemTemplatePath) paths.add(binding.itemTemplatePath);
      if (binding.emptyStatePath) paths.add(binding.emptyStatePath);
    }
  }
  return [...paths];
}

function createManifestNodes(context: SceneBuildContext, bindings: UiNodeBindingConfig, p0Id: number): void {
  for (const screen of bindings.screens) {
    createPathNode(context, p0Id, screen.rootPath, inferNodeKind(screen.rootPath, undefined));
    for (const binding of screen.bindings) {
      createPathNode(context, p0Id, binding.nodePath, inferNodeKind(binding.nodePath, binding.kind));
      addTemplateIfNeeded(context, p0Id, binding);
      if (binding.emptyStatePath) createPathNode(context, p0Id, binding.emptyStatePath, 'text');
      if (binding.kind === 'action') addButtonLabelIfMissing(context, binding.nodePath);
    }
  }
}

function addTemplateIfNeeded(context: SceneBuildContext, p0Id: number, binding: UiNodeBindingEntryConfig): void {
  if (!binding.itemTemplatePath) return;
  const templateId = createPathNode(context, p0Id, binding.itemTemplatePath, 'template');
  if (binding.kind === 'metricList') {
    addLabelChild(context, binding.itemTemplatePath, templateId, 'Label', 'Metric');
    addLabelChild(context, binding.itemTemplatePath, templateId, 'Value', '0');
  }
  if (binding.kind === 'rewardItemList') {
    addLabelChild(context, binding.itemTemplatePath, templateId, 'Label', 'Reward');
    addLabelChild(context, binding.itemTemplatePath, templateId, 'Amount', 'x1');
    addLabelChild(context, binding.itemTemplatePath, templateId, 'Type', 'resource');
  }
  if (binding.kind === 'moduleCardList') {
    addModuleCardTemplateChildren(context, binding.itemTemplatePath, templateId);
  }
}

function addModuleCardTemplateChildren(context: SceneBuildContext, templatePath: string, templateId: number): void {
  addLabelChild(context, templatePath, templateId, 'Label', 'Train Module');
  addLabelChild(context, templatePath, templateId, 'Level', 'Lv 1/5');
  addLabelChild(context, templatePath, templateId, 'Power', '0 -> 0');
  addLabelChild(context, templatePath, templateId, 'Fragments', '0/0');
  addLabelChild(context, templatePath, templateId, 'Status', 'Ready');
  const buttonPath = `${templatePath}/UpgradeButton`;
  const buttonId = createNode(context, { name: 'UpgradeButton', parentId: templateId, path: buttonPath, y: -98 });
  createUiTransform(context, buttonId, 160, 56);
  createSpriteComponent(context, buttonId, color(255, 138, 29, 255));
  createButtonComponent(context, buttonId);
  addLabelChild(context, buttonPath, buttonId, 'Label', 'Upgrade');
}

function createPathNode(context: SceneBuildContext, p0Id: number, fullPath: string, kind: string): number {
  const existing = context.nodeIdsByPath.get(fullPath);
  if (existing !== undefined) return existing;
  const segments = fullPath.split('/').filter(Boolean);
  if (segments[0] !== 'Canvas' || segments[1] !== 'P0') throw new Error(`Invalid P0 node path: ${fullPath}`);

  let parentId = p0Id;
  let currentPath = 'Canvas/P0';
  const childSegments = segments.slice(2);
  for (let index = 0; index < childSegments.length; index += 1) {
    const segment = childSegments[index];
    currentPath += `/${segment}`;
    const existingChild = context.nodeIdsByPath.get(currentPath);
    if (existingChild !== undefined) {
      parentId = existingChild;
      continue;
    }

    const segmentKind = index === childSegments.length - 1 ? kind : inferNodeKind(currentPath, undefined);
    const nodeId = createNode(context, { name: segment, parentId, path: currentPath });
    createUiTransform(context, nodeId, inferWidth(segment, segmentKind), inferHeight(segment, segmentKind));
    addVisualComponents(context, nodeId, segment, segmentKind);
    parentId = nodeId;
  }
  return parentId;
}

function addVisualComponents(context: SceneBuildContext, nodeId: number, name: string, kind: string): void {
  if (kind === 'frame' || kind === 'template' || kind === 'action' || name.endsWith('Button')) {
    createSpriteComponent(context, nodeId, colorForKind(kind));
  }
  if (kind === 'action' || name.endsWith('Button')) createButtonComponent(context, nodeId);
  if (kind === 'text' || isTextLikeName(name)) createLabelComponent(context, nodeId, initialTextForName(name));
  if (['metricList', 'rewardItemList', 'moduleCardList'].includes(kind) || ['Metrics', 'RewardList', 'CardList'].includes(name)) {
    createLayoutComponent(context, nodeId);
  }
}

function addLabelChild(context: SceneBuildContext, parentPath: string, parentId: number, name: string, text: string): number {
  const path = `${parentPath}/${name}`;
  const existing = context.nodeIdsByPath.get(path);
  if (existing !== undefined) return existing;
  const nodeId = createNode(context, { name, parentId, path });
  createUiTransform(context, nodeId, 180, 32);
  createLabelComponent(context, nodeId, text, 24);
  return nodeId;
}

function addButtonLabelIfMissing(context: SceneBuildContext, buttonPath: string): void {
  const buttonId = context.nodeIdsByPath.get(buttonPath);
  if (buttonId !== undefined && !context.nodeIdsByPath.has(`${buttonPath}/Label`)) {
    addLabelChild(context, buttonPath, buttonId, 'Label', 'Action');
  }
}

function createAssetRegistryComponent(context: SceneBuildContext, nodeId: number, layout: UiLayoutConfig): number {
  return addNodeComponent(context, nodeId, {
    __type__: P0_CREATOR_CLASS_IDS.assetRegistry,
    _name: '',
    _objFlags: 0,
    node: { __id__: nodeId },
    _enabled: true,
    __prefab: null,
    spriteFrameAssetIds: [],
    spriteFrames: [],
    colorTokensJson: JSON.stringify(layout.colorTokens),
    _id: shortId(`component:assetRegistry:${nodeId}`),
  });
}

function createBootstrapComponent(context: SceneBuildContext, projectRoot: string, nodeId: number, uiRootId: number, registryId: number): number {
  return addNodeComponent(context, nodeId, {
    __type__: P0_CREATOR_CLASS_IDS.bootstrap,
    _name: '',
    _objFlags: 0,
    node: { __id__: nodeId },
    _enabled: true,
    __prefab: null,
    uiRoot: { __id__: uiRootId },
    assetRegistry: { __id__: registryId },
    configAssets: P0_CONFIG_ASSET_PATHS.map((assetPath) => ({
      __uuid__: readAssetMetaUuid(projectRoot, assetPath),
      __expectedType__: 'cc.JsonAsset',
    })),
    seed: 1001,
    _id: shortId(`component:bootstrap:${nodeId}`),
  });
}

function inferNodeKind(path: string, bindingKind: string | undefined): string {
  const name = path.split('/').at(-1) ?? '';
  if (bindingKind) return bindingKind;
  if (name.endsWith('Button')) return 'action';
  if (isTextLikeName(name)) return 'text';
  if (name === 'Metrics') return 'metricList';
  if (name === 'RewardList') return 'rewardItemList';
  if (name === 'CardList') return 'moduleCardList';
  if (name === 'Frame' || name === 'ModalFrame') return 'frame';
  return 'container';
}

function isTextLikeName(name: string): boolean {
  return ['Title', 'StatusText', 'LootBoxName', 'CountText', 'CostText', 'EmptyState', 'Label', 'Value', 'Amount', 'Type', 'Level', 'Power', 'Fragments', 'Status', 'Name'].includes(name);
}

function inferWidth(name: string, kind: string): number {
  if (name === 'P0') return P0_DESIGN_WIDTH;
  if (kind === 'action' || name.endsWith('Button')) return 240;
  if (kind === 'template') return 180;
  if (kind === 'text') return 420;
  if (kind.includes('List') || ['Metrics', 'RewardList', 'CardList'].includes(name)) return 520;
  return name === 'Frame' || name === 'ModalFrame' ? 560 : 520;
}

function inferHeight(name: string, kind: string): number {
  if (name === 'P0') return P0_DESIGN_HEIGHT;
  if (kind === 'action' || name.endsWith('Button')) return 72;
  if (kind === 'template') return 112;
  if (kind === 'text') return 42;
  if (kind.includes('List') || ['Metrics', 'RewardList', 'CardList'].includes(name)) return 220;
  return name === 'Frame' || name === 'ModalFrame' ? 340 : 180;
}

function colorForKind(kind: string): { __type__: 'cc.Color'; r: number; g: number; b: number; a: number } {
  if (kind === 'action') return color(255, 138, 29, 255);
  if (kind === 'template') return color(43, 41, 37, 235);
  return color(21, 19, 17, 220);
}

function initialTextForName(name: string): string {
  return new Map<string, string>([
    ['Title', 'Ashrail Exodus Train'],
    ['StatusText', 'Stand by'],
    ['LootBoxName', 'Supply Box'],
    ['CountText', '0'],
    ['CostText', 'Cost: 0'],
    ['EmptyState', 'No rewards'],
  ]).get(name) ?? name;
}
