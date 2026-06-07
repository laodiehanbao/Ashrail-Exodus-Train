import { readAssetMetaUuid, readSpriteFrameMetaUuid, stableUuid } from './cocosCreatorAssetUtils.js';
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
  audioClipRef,
  spriteFrameRef,
} from './cocosSceneSerialization.js';
import { addSceneGlobals } from './cocosSceneGlobals.js';
import type { AudioCueConfig } from '../shared/audio/AudioCue.types.js';
import type { UiVisualAssetSetConfig, UiVisualBindingConfig, UiVisualBindingDomainType } from '../shared/ui/P0Ui.types.js';
import type {
  SceneBuildContext,
  UiLayoutConfig,
  UiNodeBindingConfig,
  UiNodeBindingEntryConfig,
  UiPanelLayoutConfig,
  UiScreenLayoutConfig,
} from './cocosSceneSerialization.types.js';

interface NodePlacement {
  x: number;
  y: number;
  width: number;
  height: number;
  active?: boolean;
  spriteFrameUuid?: string;
}

interface LayoutBuildPlan {
  placementsByPath: Map<string, NodePlacement>;
  skinRefsByComponentId: Map<string, ComponentSkinReference>;
  spriteFrameUuidByAssetId: Map<string, string>;
  visualAssetIdByDomain: Map<string, string>;
}

interface ComponentSkinReference {
  assetId: string;
  spriteFrameUuid: string;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
}

interface SpriteFrameAssetReference {
  assetId: string;
  assetPath: string;
  uuid: string;
}

interface AudioClipAssetReference {
  cueId: string;
  assetPath: string;
  uuid: string;
}

export function buildP0CocosScene(
  projectRoot: string,
  bindings: UiNodeBindingConfig,
  layout: UiLayoutConfig,
  visualAssets: UiVisualAssetSetConfig,
  visualBindings: UiVisualBindingConfig,
  audioCues: AudioCueConfig[],
): SceneBuildContext {
  const context = createSceneContext();
  const spriteFrameAssets = createSpriteFrameAssetReferences(projectRoot, visualAssets);
  const audioClipAssets = createAudioClipAssetReferences(projectRoot, audioCues);
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

  const registryComponentId = createAssetRegistryComponent(context, registryNodeId, layout, spriteFrameAssets, audioClipAssets);
  createBootstrapComponent(context, projectRoot, bootstrapNodeId, canvasId, registryComponentId);
  createManifestNodes(context, bindings, p0Id, createLayoutBuildPlan(bindings, layout, visualAssets, visualBindings, spriteFrameAssets));
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

function createManifestNodes(context: SceneBuildContext, bindings: UiNodeBindingConfig, p0Id: number, plan: LayoutBuildPlan): void {
  for (const screen of bindings.screens) {
    createPathNode(context, p0Id, screen.rootPath, inferNodeKind(screen.rootPath, undefined), plan);
    for (const binding of screen.bindings) {
      const nodeId = createPathNode(context, p0Id, binding.nodePath, inferNodeKind(binding.nodePath, binding.kind), plan);
      if (binding.kind === 'combatPreview') {
        addCombatPreviewChildren(context, binding.nodePath, nodeId, plan);
      }
      addTemplateIfNeeded(context, p0Id, binding, plan);
      if (binding.emptyStatePath) createPathNode(context, p0Id, binding.emptyStatePath, 'text', plan);
      if (binding.kind === 'action') addButtonLabelIfMissing(context, binding.nodePath);
    }
  }
}

function addTemplateIfNeeded(context: SceneBuildContext, p0Id: number, binding: UiNodeBindingEntryConfig, plan: LayoutBuildPlan): void {
  if (!binding.itemTemplatePath) return;
  const templateId = createPathNode(context, p0Id, binding.itemTemplatePath, 'template', plan);
  if (binding.kind === 'metricList') {
    addSpriteChild(context, binding.itemTemplatePath, templateId, 'Icon', { x: -120, y: 0, width: 42, height: 42 });
    addLabelChild(context, binding.itemTemplatePath, templateId, 'Label', 'Metric', { x: -40, y: 0, width: 108, height: 28, fontSize: 20 });
    addLabelChild(context, binding.itemTemplatePath, templateId, 'Value', '0', { x: 82, y: 0, width: 76, height: 28, fontSize: 20 });
  }
  if (binding.kind === 'rewardItemList') {
    addSpriteChild(context, binding.itemTemplatePath, templateId, 'Icon', { x: 0, y: 34, width: 66, height: 66 });
    addLabelChild(context, binding.itemTemplatePath, templateId, 'Label', 'Reward', { x: 0, y: -24, width: 156, height: 28, fontSize: 20 });
    addLabelChild(context, binding.itemTemplatePath, templateId, 'Amount', 'x1', { x: 0, y: -60, width: 96, height: 28, fontSize: 22 });
  }
  if (binding.kind === 'moduleCardList') {
    addModuleCardTemplateChildren(context, binding.itemTemplatePath, templateId, plan.skinRefsByComponentId.get('primary_button')?.spriteFrameUuid);
  }
}

function addModuleCardTemplateChildren(
  context: SceneBuildContext,
  templatePath: string,
  templateId: number,
  upgradeButtonSpriteFrameUuid?: string,
): void {
  addSpriteChild(context, templatePath, templateId, 'Icon', { x: -60, y: 50, width: 64, height: 64 });
  addLabelChild(context, templatePath, templateId, 'Label', 'Train Module', { x: 28, y: 58, width: 120, height: 28, fontSize: 20 });
  addLabelChild(context, templatePath, templateId, 'Level', 'Lv 1/5', { x: 28, y: 26, width: 120, height: 24, fontSize: 18 });
  addLabelChild(context, templatePath, templateId, 'Power', '0 -> 0', { x: 28, y: 0, width: 120, height: 24, fontSize: 18 });
  addLabelChild(context, templatePath, templateId, 'Fragments', '0/0', { x: 28, y: -26, width: 120, height: 24, fontSize: 18 });
  addLabelChild(context, templatePath, templateId, 'Status', 'Ready', { x: 0, y: -52, width: 150, height: 24, fontSize: 18 });
  const buttonPath = `${templatePath}/UpgradeButton`;
  const buttonId = createNode(context, { name: 'UpgradeButton', parentId: templateId, path: buttonPath, y: -98 });
  createUiTransform(context, buttonId, 160, 56);
  createSpriteComponent(
    context,
    buttonId,
    upgradeButtonSpriteFrameUuid ? color(255, 255, 255, 255) : color(255, 138, 29, 255),
    upgradeButtonSpriteFrameUuid,
  );
  createButtonComponent(context, buttonId);
  addLabelChild(context, buttonPath, buttonId, 'Label', 'Upgrade');
}

function addCombatPreviewChildren(
  context: SceneBuildContext,
  previewPath: string,
  previewId: number,
  plan: LayoutBuildPlan,
): void {
  addLabelChild(context, previewPath, previewId, 'StageLabel', 'Stage', { x: 0, y: 238, width: 360, height: 34, fontSize: 24 });
  addLabelChild(context, previewPath, previewId, 'StatusLabel', 'Ready', { x: 0, y: 198, width: 300, height: 30, fontSize: 22 });
  addLabelChild(context, previewPath, previewId, 'PowerLabel', 'Power 0/0', { x: -168, y: 166, width: 220, height: 28, fontSize: 20 });
  addLabelChild(context, previewPath, previewId, 'ThreatLabel', 'Threat x0', { x: 168, y: 166, width: 220, height: 28, fontSize: 20 });

  addSpriteChild(context, previewPath, previewId, 'TrainHead', {
    x: -162,
    y: -76,
    width: 230,
    height: 182,
    spriteFrameUuid: resolveVisualBindingSpriteFrame(plan, 'train_part', 'train_head'),
  });
  addSpriteChild(context, previewPath, previewId, 'CombatCarriage', {
    x: 8,
    y: -66,
    width: 188,
    height: 182,
    spriteFrameUuid: resolveVisualBindingSpriteFrame(plan, 'train_part', 'train_carriage_combat'),
  });
  addSpriteChild(context, previewPath, previewId, 'SupplyCarriage', {
    x: 158,
    y: -56,
    width: 188,
    height: 126,
    spriteFrameUuid: resolveVisualBindingSpriteFrame(plan, 'train_part', 'train_carriage_supply'),
  });
  addSpriteChild(context, previewPath, previewId, 'EnemyPrimary', {
    x: 220,
    y: 86,
    width: 98,
    height: 154,
    spriteFrameUuid: resolveVisualBindingSpriteFrame(plan, 'enemy', 'enemy_raider_basic_001'),
  });
  addLabelChild(context, previewPath, previewId, 'DamageLabel', '-0', { x: 226, y: 138, width: 100, height: 34, fontSize: 26, active: false });
  addLabelChild(context, previewPath, previewId, 'EnemyPrimaryCount', 'x0', { x: 220, y: -8, width: 70, height: 26, fontSize: 20 });
  addSpriteChild(context, previewPath, previewId, 'EnemySecondary', {
    x: 306,
    y: 74,
    width: 118,
    height: 140,
    spriteFrameUuid: resolveVisualBindingSpriteFrame(plan, 'enemy', 'enemy_husk_brute_001'),
  });
  addLabelChild(context, previewPath, previewId, 'EnemySecondaryCount', 'x0', { x: 306, y: -8, width: 70, height: 26, fontSize: 20 });
}

function resolveVisualBindingSpriteFrame(
  plan: LayoutBuildPlan,
  domainType: UiVisualBindingDomainType,
  domainId: string,
): string | undefined {
  const assetId = plan.visualAssetIdByDomain.get(visualBindingKey(domainType, domainId));
  return assetId ? plan.spriteFrameUuidByAssetId.get(assetId) : undefined;
}

function createPathNode(context: SceneBuildContext, p0Id: number, fullPath: string, kind: string, plan: LayoutBuildPlan): number {
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
    const placement = plan.placementsByPath.get(currentPath);
    const nodeId = createNode(context, {
      name: segment,
      parentId,
      path: currentPath,
      x: placement?.x,
      y: placement?.y,
      active: placement?.active,
    });
    createUiTransform(
      context,
      nodeId,
      placement?.width ?? inferWidth(segment, segmentKind),
      placement?.height ?? inferHeight(segment, segmentKind),
    );
    addVisualComponents(context, nodeId, segment, segmentKind, placement);
    parentId = nodeId;
  }
  return parentId;
}

function addVisualComponents(context: SceneBuildContext, nodeId: number, name: string, kind: string, placement?: NodePlacement): void {
  if (isPanelBackdropName(name)) {
    createSpriteComponent(context, nodeId, color(16, 14, 12, 150));
  }
  if (kind === 'frame' || kind === 'template' || kind === 'action' || name.endsWith('Button')) {
    createSpriteComponent(
      context,
      nodeId,
      placement?.spriteFrameUuid ? color(255, 255, 255, 255) : colorForKind(kind),
      placement?.spriteFrameUuid,
    );
  }
  if (kind === 'action' || name.endsWith('Button')) createButtonComponent(context, nodeId);
  if (kind === 'text' || isTextLikeName(name)) createLabelComponent(context, nodeId, initialTextForName(name));
  if (['metricList', 'rewardItemList', 'moduleCardList'].includes(kind) || ['Metrics', 'RewardList', 'CardList'].includes(name)) {
    createLayoutComponent(context, nodeId);
  }
}

function isPanelBackdropName(name: string): boolean {
  return [
    'TopStatus',
    'CombatPreview',
    'BottomActions',
    'Focus',
    'Actions',
    'ModuleSlots',
    'ModuleDetail',
  ].includes(name);
}

function addLabelChild(
  context: SceneBuildContext,
  parentPath: string,
  parentId: number,
  name: string,
  text: string,
  placement: Partial<NodePlacement> & { fontSize?: number } = {},
): number {
  const path = `${parentPath}/${name}`;
  const existing = context.nodeIdsByPath.get(path);
  if (existing !== undefined) return existing;
  const nodeId = createNode(context, { name, parentId, path, x: placement.x, y: placement.y, active: placement.active });
  createUiTransform(context, nodeId, placement.width ?? 180, placement.height ?? 32);
  createLabelComponent(context, nodeId, text, placement.fontSize ?? 24);
  return nodeId;
}

function addSpriteChild(
  context: SceneBuildContext,
  parentPath: string,
  parentId: number,
  name: string,
  placement: Partial<NodePlacement> = {},
): number {
  const path = `${parentPath}/${name}`;
  const existing = context.nodeIdsByPath.get(path);
  if (existing !== undefined) return existing;
  const nodeId = createNode(context, { name, parentId, path, x: placement.x, y: placement.y });
  createUiTransform(context, nodeId, placement.width ?? 64, placement.height ?? 64);
  createSpriteComponent(context, nodeId, color(255, 255, 255, 255), placement.spriteFrameUuid);
  return nodeId;
}

function addButtonLabelIfMissing(context: SceneBuildContext, buttonPath: string): void {
  const buttonId = context.nodeIdsByPath.get(buttonPath);
  if (buttonId !== undefined && !context.nodeIdsByPath.has(`${buttonPath}/Label`)) {
    addLabelChild(context, buttonPath, buttonId, 'Label', 'Action');
  }
}

function createAssetRegistryComponent(
  context: SceneBuildContext,
  nodeId: number,
  layout: UiLayoutConfig,
  spriteFrameAssets: SpriteFrameAssetReference[],
  audioClipAssets: AudioClipAssetReference[],
): number {
  return addNodeComponent(context, nodeId, {
    __type__: P0_CREATOR_CLASS_IDS.assetRegistry,
    _name: '',
    _objFlags: 0,
    node: { __id__: nodeId },
    _enabled: true,
    __prefab: null,
    spriteFrameAssetIds: spriteFrameAssets.map((asset) => asset.assetId),
    spriteFrames: spriteFrameAssets.map((asset) => spriteFrameRef(asset.uuid)),
    audioClipCueIds: audioClipAssets.map((asset) => asset.cueId),
    audioClips: audioClipAssets.map((asset) => audioClipRef(asset.uuid)),
    colorTokensJson: JSON.stringify(layout.colorTokens),
    _id: shortId(`component:assetRegistry:${nodeId}`),
  });
}

function createLayoutBuildPlan(
  bindings: UiNodeBindingConfig,
  layout: UiLayoutConfig,
  visualAssets: UiVisualAssetSetConfig,
  visualBindings: UiVisualBindingConfig,
  spriteFrameAssets: SpriteFrameAssetReference[],
): LayoutBuildPlan {
  const placementsByPath = new Map<string, NodePlacement>();
  const designWidth = layout.designWidth || P0_DESIGN_WIDTH;
  const designHeight = layout.designHeight || P0_DESIGN_HEIGHT;
  const previewGap = 160;
  const spriteFrameUuidByAssetId = new Map(spriteFrameAssets.map((asset) => [asset.assetId, asset.uuid]));
  const visualAssetIdByDomain = new Map(
    visualBindings.entries.map((entry) => [visualBindingKey(entry.domainType, entry.domainId), entry.assetId]),
  );
  const skinRefsByComponentId = createComponentSkinRefs(layout, visualAssets, spriteFrameUuidByAssetId);

  bindings.screens.forEach((screen, screenIndex) => {
    const screenLayout = layout.screens.find((entry) => entry.screenId === screen.screenId);
    placementsByPath.set(screen.rootPath, {
      x: 0,
      y: -screenIndex * (designHeight + previewGap),
      width: designWidth,
      height: designHeight,
    });

    const frameBindings = screen.bindings.filter((binding) => binding.kind === 'frame' && !binding.panelId);
    for (const binding of frameBindings) {
      placementsByPath.set(binding.nodePath, {
        x: designWidth / 2,
        y: -designHeight / 2,
        width: designWidth,
        height: designHeight,
        spriteFrameUuid: screenLayout ? spriteFrameUuidByAssetId.get(screenLayout.backgroundAssetId) : undefined,
      });
    }

    if (!screenLayout) return;
    const panelPaths = collectPanelPaths(screen.rootPath, screen.bindings, screenLayout);
    for (const [panelPath, panel] of panelPaths) {
      placementsByPath.set(panelPath, panelToPlacement(panel));
    }
    applyBindingPlacements(
      placementsByPath,
      screen.rootPath,
      screen.bindings,
      screenLayout,
      panelPaths,
      skinRefsByComponentId,
      designWidth,
      designHeight,
    );
  });

  return { placementsByPath, skinRefsByComponentId, spriteFrameUuidByAssetId, visualAssetIdByDomain };
}

function createComponentSkinRefs(
  layout: UiLayoutConfig,
  visualAssets: UiVisualAssetSetConfig,
  spriteFrameUuidByAssetId: Map<string, string>,
): Map<string, ComponentSkinReference> {
  const assetsById = new Map(visualAssets.assets.map((asset) => [asset.assetId, asset]));
  const refsByComponentId = new Map<string, ComponentSkinReference>();
  for (const skin of layout.componentSkins) {
    const asset = assetsById.get(skin.assetId);
    const spriteFrameUuid = spriteFrameUuidByAssetId.get(skin.assetId);
    if (!asset || !spriteFrameUuid) continue;
    refsByComponentId.set(skin.componentId, {
      assetId: skin.assetId,
      spriteFrameUuid,
      width: asset.width,
      height: asset.height,
      minWidth: skin.minWidth,
      minHeight: skin.minHeight,
    });
  }
  return refsByComponentId;
}

function createSpriteFrameAssetReferences(
  projectRoot: string,
  visualAssets: UiVisualAssetSetConfig,
): SpriteFrameAssetReference[] {
  return visualAssets.assets
    .filter((asset) => asset.kind === 'spriteFrame')
    .map((asset) => ({
      assetId: asset.assetId,
      assetPath: asset.assetPath,
      uuid: readSpriteFrameMetaUuid(projectRoot, asset.assetPath),
    }));
}

function createAudioClipAssetReferences(projectRoot: string, audioCues: AudioCueConfig[]): AudioClipAssetReference[] {
  return audioCues
    .filter((cue) => cue.status !== 'deferred' && cue.packageTag !== 'remote')
    .map((cue) => ({
      cueId: cue.cueId,
      assetPath: cue.assetPath,
      uuid: readAssetMetaUuid(projectRoot, cue.assetPath),
    }));
}

function collectPanelPaths(
  screenRootPath: string,
  bindings: UiNodeBindingEntryConfig[],
  screenLayout: UiScreenLayoutConfig,
): Map<string, UiPanelLayoutConfig> {
  const panelsById = new Map(screenLayout.panels.map((panel) => [panel.panelId, panel]));
  const panelPaths = new Map<string, UiPanelLayoutConfig>();
  for (const binding of bindings) {
    if (!binding.panelId) continue;
    const panel = panelsById.get(binding.panelId);
    if (!panel) continue;
    panelPaths.set(resolvePanelPath(screenRootPath, binding), panel);
  }
  return panelPaths;
}

function applyBindingPlacements(
  placementsByPath: Map<string, NodePlacement>,
  screenRootPath: string,
  bindings: UiNodeBindingEntryConfig[],
  screenLayout: UiScreenLayoutConfig,
  panelPaths: Map<string, UiPanelLayoutConfig>,
  skinRefsByComponentId: Map<string, ComponentSkinReference>,
  designWidth: number,
  designHeight: number,
): void {
  const panelEntryByPath = new Map(
    [...panelPaths.entries()].map(([path, panel]) => [path, { panel, bindings: [] as UiNodeBindingEntryConfig[] }]),
  );
  const fallbackPanel = { panelId: 'screen', x: 0, y: 0, width: designWidth, height: designHeight };
  const fallbackEntry = { panel: fallbackPanel, bindings: [] as UiNodeBindingEntryConfig[] };

  for (const binding of bindings) {
    const panelPath = binding.panelId ? resolvePanelPath(screenRootPath, binding) : screenRootPath;
    const entry = panelEntryByPath.get(panelPath) ?? fallbackEntry;
    entry.bindings.push(binding);
  }

  for (const [panelPath, entry] of panelEntryByPath) {
    placeBindingsInPanel(placementsByPath, panelPath, entry.panel, entry.bindings, skinRefsByComponentId);
  }
  placeBindingsInPanel(placementsByPath, screenRootPath, fallbackPanel, fallbackEntry.bindings, skinRefsByComponentId);

  for (const binding of bindings) {
    if (binding.itemTemplatePath) {
      const listPlacement = placementsByPath.get(binding.nodePath);
      const skin = binding.componentId ? skinRefsByComponentId.get(binding.componentId) : undefined;
      placementsByPath.set(binding.itemTemplatePath, {
        x: 0,
        y: 0,
        width: skin ? Math.max(skin.width, skin.minWidth) : Math.min(listPlacement?.width ?? 180, inferWidth('Template', 'template')),
        height: skin ? Math.max(skin.height, skin.minHeight) : inferHeight('Template', 'template'),
        active: false,
        spriteFrameUuid: skin?.spriteFrameUuid,
      });
    }
    if (binding.emptyStatePath) {
      placementsByPath.set(binding.emptyStatePath, { x: 0, y: 0, width: 320, height: 36 });
    }
  }
}

function placeBindingsInPanel(
  placementsByPath: Map<string, NodePlacement>,
  panelPath: string,
  panel: UiPanelLayoutConfig,
  bindings: UiNodeBindingEntryConfig[],
  skinRefsByComponentId: Map<string, ComponentSkinReference>,
): void {
  const texts = bindings.filter((binding) => binding.kind === 'text');
  const lists = bindings.filter((binding) => binding.kind === 'metricList' || binding.kind === 'rewardItemList' || binding.kind === 'moduleCardList');
  const combatPreviews = bindings.filter((binding) => binding.kind === 'combatPreview');
  const actions = bindings.filter((binding) => binding.kind === 'action');

  texts.forEach((binding, index) => {
    placementsByPath.set(binding.nodePath, {
      x: 0,
      y: panel.height / 2 - 46 - index * 46,
      width: Math.max(180, panel.width - 56),
      height: 36,
    });
  });

  lists.forEach((binding, index) => {
    const reservedTop = texts.length > 0 ? 118 : 48;
    const reservedBottom = actions.length > 0 ? 112 : 36;
    placementsByPath.set(binding.nodePath, {
      x: 0,
      y: index === 0 ? 0 : -index * 130,
      width: Math.max(180, panel.width - 64),
      height: Math.max(96, panel.height - reservedTop - reservedBottom),
    });
  });

  combatPreviews.forEach((binding) => {
    placementsByPath.set(
      binding.nodePath,
      binding.nodePath === panelPath
        ? panelToPlacement(panel)
        : {
            x: 0,
            y: 0,
            width: panel.width,
            height: panel.height,
          },
    );
  });

  actions.forEach((binding, index) => {
    const spacing = 252;
    const startX = -((actions.length - 1) * spacing) / 2;
    const skin = binding.componentId ? skinRefsByComponentId.get(binding.componentId) : undefined;
    placementsByPath.set(binding.nodePath, {
      x: startX + index * spacing,
      y: -panel.height / 2 + 52,
      width: Math.max(inferWidth(pathName(binding.nodePath), binding.kind), skin?.minWidth ?? 0),
      height: Math.max(inferHeight(pathName(binding.nodePath), binding.kind), skin?.minHeight ?? 0),
      spriteFrameUuid: skin?.spriteFrameUuid,
    });
  });

  for (const binding of bindings.filter((item) => item.kind === 'frame')) {
    if (binding.nodePath === panelPath) {
      const skin = binding.componentId ? skinRefsByComponentId.get(binding.componentId) : undefined;
      placementsByPath.set(binding.nodePath, {
        ...panelToPlacement(panel),
        spriteFrameUuid: skin?.spriteFrameUuid,
      });
    }
  }
}

function resolvePanelPath(screenRootPath: string, binding: UiNodeBindingEntryConfig): string {
  if (binding.kind === 'frame') return binding.nodePath;
  const relative = binding.nodePath.slice(screenRootPath.length).split('/').filter(Boolean);
  return relative.length > 0 ? `${screenRootPath}/${relative[0]}` : binding.nodePath;
}

function panelToPlacement(panel: UiPanelLayoutConfig): NodePlacement {
  return {
    x: panel.x + panel.width / 2,
    y: -(panel.y + panel.height / 2),
    width: panel.width,
    height: panel.height,
  };
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

function pathName(path: string): string {
  return path.split('/').at(-1) ?? path;
}

function visualBindingKey(domainType: UiVisualBindingDomainType, domainId: string): string {
  return `${domainType}:${domainId}`;
}

function isTextLikeName(name: string): boolean {
  return [
    'Title',
    'StatusText',
    'LootBoxName',
    'CountText',
    'CostText',
    'EmptyState',
    'Label',
    'Value',
    'Amount',
    'Level',
    'Power',
    'Fragments',
    'Status',
    'Name',
    'StageLabel',
    'PowerLabel',
    'ThreatLabel',
    'EnemyPrimaryCount',
    'EnemySecondaryCount',
  ].includes(name);
}

function inferWidth(name: string, kind: string): number {
  if (name === 'P0') return P0_DESIGN_WIDTH;
  if (kind === 'action' || name.endsWith('Button')) return 240;
  if (kind === 'combatPreview') return 520;
  if (kind === 'template') return 180;
  if (kind === 'text') return 420;
  if (kind.includes('List') || ['Metrics', 'RewardList', 'CardList'].includes(name)) return 520;
  return name === 'Frame' || name === 'ModalFrame' ? 560 : 520;
}

function inferHeight(name: string, kind: string): number {
  if (name === 'P0') return P0_DESIGN_HEIGHT;
  if (kind === 'action' || name.endsWith('Button')) return 72;
  if (kind === 'combatPreview') return 420;
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
