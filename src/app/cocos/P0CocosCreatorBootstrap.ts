import { _decorator, AudioSource, CCInteger, Component, JsonAsset, Node } from 'cc';
import { Log } from '../../core/Log.js';
import { fail, ok, type Result } from '../../core/Result.types.js';
import type { RawConfigSources } from '../../data/ConfigLoader.js';
import { createDefaultProgress } from '../../gameplay/save/SaveVersionMigrator.js';
import { createP0CocosUiBindingFromManifest } from '../../presentation/ui/cocos/P0CocosUiBindingFactory.js';
import { P0CocosUiRuntime } from '../../presentation/ui/cocos/P0CocosUiRuntime.js';
import { CocosCreatorAssetRegistryComponent } from '../../presentation/ui/cocos/creator/CocosCreatorAssetRegistryComponent.js';
import { CocosCreatorUiBindingHost } from '../../presentation/ui/cocos/creator/CocosCreatorUiBindingHost.js';
import { ErrorCode } from '../../shared/ErrorCodes.js';
import { createGameAppFromRawConfigs } from '../SceneBootstrap.js';
import { P0UiRequestRouter } from '../P0UiRequestRouter.js';
import { CocosCreatorAudioPlaybackAdapter } from './CocosCreatorAudioPlaybackAdapter.js';

const { ccclass, property } = _decorator;

const CONFIG_ASSET_KEYS = [
  'lootBoxes',
  'lootPools',
  'rewardDefinitions',
  'equipmentItems',
  'stageChapters',
  'stageWaves',
  'trainModules',
  'adPlacements',
  'economyCurve',
  'audioCues',
  'audioEvents',
  'audioMixer',
  'audioBudget',
  'audioLicenses',
  'audioVoiceLines',
  'elevenLabsVoiceProfile',
  'uiCopy',
  'uiLayout',
  'uiVisualAssets',
  'uiNodeBindings',
] as const satisfies readonly (keyof RawConfigSources)[];

const CONFIG_ASSET_NAME_TO_KEY = new Map<string, keyof RawConfigSources>([
  ['lootboxes', 'lootBoxes'],
  ['lootpools', 'lootPools'],
  ['rewarddefinitions', 'rewardDefinitions'],
  ['equipmentitems', 'equipmentItems'],
  ['stagechapters', 'stageChapters'],
  ['stagewaves', 'stageWaves'],
  ['trainmodules', 'trainModules'],
  ['adplacements', 'adPlacements'],
  ['economycurve', 'economyCurve'],
  ['audiocues', 'audioCues'],
  ['audioevents', 'audioEvents'],
  ['audiomixer', 'audioMixer'],
  ['audiobudget', 'audioBudget'],
  ['audiolicenses', 'audioLicenses'],
  ['audiolicensemanifest', 'audioLicenses'],
  ['voicelines', 'audioVoiceLines'],
  ['elevenlabsvoiceprofile', 'elevenLabsVoiceProfile'],
  ['p0uicopyzhcn', 'uiCopy'],
  ['p0uilayout', 'uiLayout'],
  ['p0visualassets', 'uiVisualAssets'],
  ['p0uinodebindings', 'uiNodeBindings'],
]);

@ccclass('P0CocosCreatorBootstrap')
export class P0CocosCreatorBootstrap extends Component {
  @property({ type: Node })
  uiRoot: Node | null = null;

  @property({ type: CocosCreatorAssetRegistryComponent })
  assetRegistry: CocosCreatorAssetRegistryComponent | null = null;

  @property({ type: [JsonAsset] })
  configAssets: JsonAsset[] = [];

  @property({ type: CCInteger })
  seed = 1001;

  private runtime: P0CocosUiRuntime | null = null;

  start(): void {
    const rawConfigs = createRawConfigSourcesFromJsonAssets(this.configAssets);
    if (!rawConfigs.ok) {
      Log.error('app', rawConfigs.error.message, rawConfigs.error.context);
      return;
    }

    const audioSource = this.node.getComponent(AudioSource) ?? this.node.addComponent(AudioSource);
    const app = createGameAppFromRawConfigs(
      rawConfigs.value,
      createDefaultProgress(),
      this.seed,
      new CocosCreatorAudioPlaybackAdapter(this.assetRegistry, audioSource),
    );
    const host = new CocosCreatorUiBindingHost(this.uiRoot ?? this.node, this.assetRegistry);
    const binding = createP0CocosUiBindingFromManifest(app.configs.uiNodeBindings, host);
    if (!binding.ok) {
      Log.error('app', binding.error.message, binding.error.context);
      return;
    }

    this.runtime = new P0CocosUiRuntime({
      presenter: new P0UiRequestRouter(app),
      binding: binding.value,
      clock: { nowMs: () => Date.now() },
    });
    this.runtime.mount();
  }

  refreshUi(): void {
    this.runtime?.refresh();
  }
}

export function createRawConfigSourcesFromJsonAssets(assets: JsonAsset[]): Result<RawConfigSources> {
  const configs: Partial<RawConfigSources> = {};
  for (const asset of assets) {
    const key = CONFIG_ASSET_NAME_TO_KEY.get(normalizeAssetName(asset.name));
    if (key) {
      configs[key] = asset.json;
    }
  }

  const missing = CONFIG_ASSET_KEYS.find((key) => configs[key] === undefined);
  if (missing) {
    return fail(ErrorCode.ConfigMissingReference, `Missing Cocos JsonAsset for config ${missing}`, {
      expectedAssets: CONFIG_ASSET_KEYS,
    });
  }

  return ok(configs as RawConfigSources);
}

function normalizeAssetName(name: string): string {
  return name.replace(/\.json$/i, '').replace(/[^a-z0-9]/gi, '').toLowerCase();
}
