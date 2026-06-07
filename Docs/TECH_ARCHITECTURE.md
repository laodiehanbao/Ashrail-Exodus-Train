# TECH_ARCHITECTURE

本文档记录第一阶段工程边界。所有实现应遵循 AGENTS.md：声明先于实现、平台能力隔离、配置驱动、逻辑可测试。

## 技术栈

```text
Cocos Creator 3.8 LTS
TypeScript
Douyin mini-game target
Canvas / WebGL rendering
JSON / CSV / TS Config
```

## 分层职责

```text
src/app
  启动、依赖装配、场景入口，只做组合，不承载业务规则。

src/core
  事件总线、日志、生命周期、通用工具。

src/data
  配置加载、schema 校验、仓库、远程配置预留。

src/domain
  纯业务模型：玩家、资源、装备、列车、关卡、奖励。

src/gameplay
  战斗、开箱、升级、关卡、事件、离线奖励等玩法系统。

src/presentation
  UI、动画、音效、浮字、镜头、表现控制。

src/platform
  广告、存档、登录、分享、分析等平台接口与实现。

src/shared
  公共类型、常量、枚举、错误码。

src/tools
  数值模拟、配置校验、包体检查、调试工具。
```

## 依赖方向

允许：

- `presentation -> gameplay -> domain`
- `presentation -> platform interface`
- `gameplay -> data / domain / platform interface`
- `platform implementation -> platform interface`
- `app -> all layers`，仅用于装配。

禁止：

- `domain` 依赖 UI、平台 API 或 Cocos 场景脚本。
- UI 直接改存档、直接算掉落、直接决定战斗结果。
- `gameplay` 直接调用 `tt` 或任何 Douyin 原生 API。
- 动画回调直接发奖励、开箱或写存档。
- 平台实现反向污染玩法层。

## UI Request Flow

P0 UI uses a one-way state/request flow:

```text
configs/ui/P0UiNodeBindings.json
  -> src/data/schemas/UiNodeBinding.schema.ts
  -> src/presentation/ui/cocos/P0CocosUiBindingFactory
  -> no-cc Cocos UI binding host
  -> src/presentation/ui/cocos/P0CocosUiRuntime
  -> src/presentation/ui/cocos/P0CocosUiPresenter
  -> UiInteractionRequest
  -> IP0UiPresenter implementation, currently src/app/P0UiRequestRouter
  -> gameplay services / platform interfaces
  -> GameApp snapshot
  -> src/presentation/viewmodels/createP0UiState
  -> P0UiState
  -> Cocos node binding
```

Rules:

- `UiInteractionRequest` is a strict union; payloads carry stable IDs only.
- `src/presentation` must not import `src/app`, `cc`, concrete platform adapters, save adapters, or concrete gameplay systems.
- Disabled buttons must not emit UI requests, but gameplay/app services still perform final validation.
- `GameApp.runPrototypeLoop()` is a CLI/demo helper and must not be wired to UI buttons.
- Real Creator components implement binding interfaces later; current `src/presentation/ui/cocos` files intentionally do not import `cc`.
- `P0UiNodeBindings.json` is a no-`cc` manifest. It validates screen coverage, required slots, action IDs, panel/component references, and stable Cocos node paths. The generated scene `assets/scenes/scene_p0_exodus_train_main.scene` is the current real Creator node tree for that manifest.
- `P0CocosUiBindingFactory` converts the validated manifest into `P0CocosUiBinding` through a no-`cc` host. Host failures return `Result` errors and must not create gameplay behavior.
- `P0CocosUiRuntime` wires `IP0UiPresenter`, `P0CocosUiPresenter`, and `P0CocosUiBinding`. It serializes fire-and-forget Cocos clicks, renders only accepted update states, exposes request failures to tests, and uses an injected clock.
- `P0CocosUiRuntime` must not import `src/app`, gameplay services, platform adapters, saves, Douyin APIs, or `cc`. App composition decides which `IP0UiPresenter` implementation it receives.
- `src/presentation/ui/cocos/creator` is the only presentation subfolder allowed to import Cocos Creator `cc`. It contains real Creator binding components and a manifest host, but still must not import app, gameplay, platform, or save implementations.
- Creator 3.8 requires every script file in `src/presentation/ui/cocos/creator` to define at most one `extends Component` class. Shared helpers must stay in non-Component utility files, and barrel files must not re-export multiple Creator Component classes into the Cocos mirror.
- `src/app/cocos/P0CocosCreatorBootstrap.ts` is the current Creator scene composition component. It reads assigned `JsonAsset` configs, creates `GameApp`, routes requests through `P0UiRequestRouter`, and mounts the real Cocos UI runtime.
- MainHud combat visuals use the same one-way flow: current stage/wave config is mapped into `MainHudCombatPreviewState`, then `CocosCreatorCombatPreviewBindingComponent` resolves SpriteFrames through `AssetRegistry`. It must not run combat settlement or mutate progress.

## Cocos Creator Asset Flow

The main repository remains the source of truth. The temporary Creator project is a generated mirror.

```text
npm run sync:cocos
  -> copies src to Cocos assets/scripts/src
  -> strips relative .js import suffixes only in the Cocos mirror
  -> copies configs and runtime asset folders
  -> writes stable .meta files for JSON/TypeScript assets

npm run generate:cocos:p0-scene
  -> writes assets/scenes/scene_p0_exodus_train_main.scene
  -> binds P0CocosCreatorBootstrap, AssetRegistry, 21 JsonAssets, and all P0 UI node paths
  -> fails if a manifest node/template path is missing
```

`CocosCreatorAssetRegistryComponent` stores color tokens as `colorTokensJson` in the generated scene instead of custom entry classes, because Creator 3.8 warns on primitive property types inside entry classes. String defaults should be inferred with empty property options, string arrays should use `CCString`, and numeric Inspector fields should use `CCInteger` or `CCFloat`. P0 visual assets are declared in `configs/ui/P0VisualAssets.json`; domain ID to SpriteFrame mappings are declared in `configs/ui/P0VisualBindings.json` and validated by `ConfigLoader`. Synced Creator mirrors receive stable image `.meta` files, and generated scenes bind sprite frames through explicit `SpriteFrame[]` plus stable `spriteFrameAssetIds[]`. Local P0 audio cues are also registered through explicit `AudioClip[]` plus stable `audioClipCueIds[]`; remote voice cues stay outside the first scene registry until a subpackage/remote loader exists.

Do not copy `library/`, `temp/`, `profiles/`, `.creator/`, or build cache from Cocos Creator back into this repository. After generation, refresh the Cocos Creator asset panel and save the scene once to confirm AssetDB imports the scene without missing script or missing JsonAsset references.

## 第一阶段模块拆分

### 战斗

```text
CombatResolver      纯结算入口
DamageCalculator    伤害公式
EnemySpawner        敌人生成
WaveDirector        波次推进
TrainCombatModel    列车战斗状态
CombatView          表现层
```

第一阶段可以简化公式，但 `CombatResolver` 必须能脱离 UI 测试。

### Loot Box

```text
LootBoxSystem       开箱流程入口
LootGenerator       根据配置生成掉落
RewardService       统一奖励发放
InventoryService    背包接收
AdRewardService     广告奖励加成
LootBoxView         展示
LootBoxAnimator     动画
```

UI 只能请求开箱，不能生成奖励。

### Train Module

```text
TrainModel              列车业务数据
TrainModuleSystem       安装、升级、卸下
TrainModuleRepository   模块配置读取
TrainView               列车展示
TrainSocketView         插槽展示
```

模块必须存在于业务模型和配置中，不能只存在于贴图或 UI。

### Platform

```text
IAdService
MockAdService
DouyinAdService
ISaveService
LocalSaveService
DouyinSaveService
IAnalyticsService
```

第一阶段默认使用 Mock 与 Local 实现，真实 Douyin 实现在垂直切片阶段接入。

## 配置与校验

配置按领域拆分：

- `configs/balance`：基础成长、敌人强度、升级费用。
- `configs/loot`：宝箱、奖池、稀有度、保底。
- `configs/stages`：章节、关卡、波次、目标。
- `configs/ads`：广告点位、倍率、限制、兜底奖励。
- `configs/themes`：主题文案、颜色、资源引用。
- `configs/ui`：P0 文案、布局、视觉资产、视觉绑定、无 `cc` 节点绑定 manifest。

每类配置必须具备：

- schema 或显式 validation。
- 失败时清晰报错。
- 安全默认值或中止启动策略。
- 测试或脚本覆盖基础合法性。

## 事件约定

跨系统优先使用事件或服务调用。第一阶段推荐事件：

- `RewardGrantedEvent`
- `PowerChangedEvent`
- `LootBoxOpenedEvent`
- `AdRewardCompletedEvent`
- `StageClearedEvent`
- `TrainModuleUpgradedEvent`
- `SaveCommittedEvent`

事件载荷必须使用稳定 ID，不使用展示文案作为业务 ID。

## 存档要求

第一阶段本地存档至少包含：

- save version。
- player level。
- current stage。
- resources。
- train module state。
- equipment inventory。
- unlocked systems。
- ad count records。
- offline reward timestamp。
- tutorial progress。
- theme skin selection。

存档写入必须通过 repository 或 save service；UI 不直接写。

## 日志

使用统一日志模块：

```text
Log.info('loot', 'Generated reward', data)
Log.warn('ad', 'Rewarded ad unavailable', context)
Log.error('save', 'Save migration failed', error)
```

长期代码中不得保留无分类 `console.log`、`alert` 调试或临时数字日志。
