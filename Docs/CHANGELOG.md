# CHANGELOG

本文档记录项目文档和工程约定变更。格式保持简洁，便于后续同步到版本日志。

## 2026-06-07

### Changed

- 新增 `configs/ui/P0VisualBindings.json`，把资源、宝箱、装备、列车模块的稳定业务 ID 映射到 `P0VisualAssets.json` 中的 SpriteFrame assetId；`ConfigLoader` 会校验 domain 引用、asset 存在性和 icon usage。
- P0 ViewModel 现在为金币资源计数、补给箱计数、奖励项和列车模块卡输出 `iconAssetId`；Cocos Creator list/card binding 组件通过 `AssetRegistry` 在运行时设置 Icon SpriteFrame，不把图标映射硬编码进 UI 组件。
- P0 scene 生成器现在给 metric item、reward card、module card template 生成 `Icon` Sprite 节点；bootstrap JsonAsset 引用数从 20 个增加到 21 个。
- `P0VisualBindings.json` 现在也覆盖 P0 列车部件和阶段敌人；MainHud 新增 `combatPreview` ViewModel/binding，按当前 stage/wave 运行时绑定列车、敌人、阶段名、战力和威胁数量，不再依赖静态 preview 节点。

## 2026-06-06

### Changed

- P0 scene 生成器现在默认隐藏 list item template 占位节点，避免 Creator 打开 scene 时模板文案与真实 UI 文案混在一起；新增 scene builder 回归测试锁定布局坐标与模板 inactive 状态。
- `npm run generate:cocos:p0-scene` 现在同时回写主仓库 `assets/scenes` 和 Creator 镜像，避免下一次同步把旧 scene 覆盖回 Creator。
- 新增 `configs/ui/P0VisualAssets.json` 和三张 720x1280 runtime JPG 背景；`sync:cocos` 会为这些图片写入稳定 Cocos image meta，`generate:cocos:p0-scene` 会把 SpriteFrame 填入 `AssetRegistry` 并给全屏 Frame 写入编辑器可见背景。
- 新增 Cocos `AudioSource` 播放适配器，`GameApp` 装配 `AudioService`，P0 UI 成功请求会播放配置化 audio event；生成的 scene 现在把 main/placeholder `.ogg` 注册为 `AudioClip[]`，远程人声仍不进入首包注册表。
- 新增 `scripts/generate-p0-ui-skin-assets.ps1`，从 `sheet_ui_core_p0_001.png` 切出 7 个带透明 alpha 的 P0 runtime UI skin PNG，并注册到 `P0VisualAssets.json`。
- `ConfigLoader` 现在校验 `componentSkins.assetId` 必须引用 `usage: "ui_skin"` 的 SpriteFrame；P0 scene 生成器会把按钮、弹窗、奖励卡、模块槽位和模板内升级按钮接入对应 UI skin SpriteFrame。
- Cocos image meta 生成器现在会为 PNG/WebP 标记 alpha，避免 UI 切片在 Creator 中被当作不透明图片导入。
- `npm run sync:cocos` 现在使用 P0 runtime manifest 白名单同步资源：视觉来自 `P0VisualAssets.json`，音频来自非远程/非 deferred `AudioCues.json`，并为音频写入稳定 Cocos `audio-clip` meta。
- 新增 Cocos 同步白名单回归测试，防止 UI source sheet、concept art、未声明 icon sheet 和远程 ElevenLabs 人声进入 Creator 首包镜像。
- 新增 `scripts/generate-p0-gameplay-visual-assets.ps1` 和 `npm run generate:visuals:p0`，从 P0 列车、敌人、资源、装备、模块图集中切出 11 个透明 runtime PNG，并注册为 `train_sprite`、`enemy_sprite`、`resource_icon`、`equipment_icon`、`train_module_icon`。
- P0 scene 生成器现在会在 MainHud 战斗区域生成 editor-visible 的列车和敌人预览 SpriteFrame 节点，方便 Creator 内确认 gameplay 视觉资源已接线；这些节点只做 presentation 展示。
- `P0CocosCreatorBootstrap` 现在会按 `P0UiLayout.json` 设置 Cocos runtime 设计分辨率为 720x1280 fixed-width，避免 Preview/真机沿用空白项目默认横屏比例。

## 2026-06-05

### Added

- 新增 Cocos Creator 同步与 P0 scene 生成流程：`npm run sync:cocos`、`npm run generate:cocos:p0-scene`，并生成 `assets/scenes/scene_p0_exodus_train_main.scene` / `.meta`，覆盖五屏 P0 UI 节点、19 个 JsonAsset 引用和 Creator bootstrap/asset registry 组件。

### Changed

- 拆分真实 Creator UI binding 组件为一文件一个 `extends Component`，移除旧聚合脚本，规避 Cocos Creator 3.8 的 `Each script can have at most one Component` 导入错误。
- `CocosCreatorAssetRegistryComponent` 改为用 `colorTokensJson` 序列化颜色 token，并为字符串/数字 Creator 属性显式声明类型，规避 `undefined type to cc property` 警告。
- P0 scene 生成器现在按 `configs/ui/P0UiLayout.json` 写入 screen/panel/text/list/button 初始坐标，并将五个 P0 screen 纵向错开展示，避免 Creator 打开 scene 时所有字符串重叠在原点。

### Notes

- 生成的 P0 scene 已同步到 `C:\Users\zhang\NewProject_1\assets\scenes` 和主仓库 `assets/scenes`；当前文件层面已修复 02:44 多 Component 硬错误和 03:05 primitive property 类型警告，仍需在 Cocos Creator 中手动刷新 AssetDB、打开并保存 scene，确认最新日志没有 missing script / missing JsonAsset。

## 2026-06-04

### Added

- 新增 `Docs/DESIGN_CORE_LOOP.md`，定义第一阶段核心闭环、数据边界、系统边界与验收标准。
- 新增 `Docs/TECH_ARCHITECTURE.md`，定义 TypeScript / Cocos Creator 分层职责、依赖方向、平台隔离和配置校验要求。
- 新增 `Docs/TODO_ROADMAP.md`，定义 P0 到 P4 的执行路线、验收条件、当前禁止事项和打开问题。
- 新增本变更记录文件，作为后续文档和架构调整的同步入口。
- 新增 P0/P0+ 音频方案、cue/event/mixer/budget/license/voice-line 配置、程序化音频生成脚本、音频资源校验脚本和 31 个自制 `.ogg` P0+ runtime 音频。
- 新增 ElevenLabs Creator 离线人声生成脚本 `npm run generate:voice:elevenlabs`；脚本只读取环境变量，不把 API key 写入仓库或客户端。
- 通过 ElevenLabs API 选定 `River - Relaxed, Neutral, Informative` 作为 P0+ 默认列车广播音色，生成 6 条中文 radio-style `.ogg` 人声并登记到音频授权清单。
- 新增 P0 UI copy/layout 配置、UI schema 校验、P0 聚合 ViewModel、五个薄 UI request view，以及 UI 配置/ViewModel/边界回归测试。
- 新增 P0 无 `cc` node binding manifest、独立 schema、manifest-to-binding factory、coverage/negative 回归测试，以及按 actionId 绑定的 Cocos-ready presenter。
- 新增无 `cc` 的 `P0CocosUiRuntime`：通过 `IP0UiPresenter` 装配 P0 Cocos binding/presenter，串行转发 UI 请求，成功后渲染 accepted state，并把请求/渲染失败暴露为 `Result`。
- 新增真实 Cocos Creator TypeScript 组件：`src/presentation/ui/cocos/creator` 提供 frame/text/action/list binding components、asset registry、manifest host；`src/app/cocos/P0CocosCreatorBootstrap.ts` 提供 Creator 场景装配入口。
- 加强 Cocos UI 回归：旧 render 闭包失效、重复 listener 不重复发请求、binding factory 校验 actionId 错配、runtime 请求串行与失败恢复。
- 新增 gameplay 只读可用性查询：开箱、列车模块升级、广告奖励状态，避免 UI 复刻业务系统规则。
- 新增 `src/presentation/ui/cocos` 的 Cocos-ready UI 绑定接口与 P0 Presenter；不引入 `cc` 依赖，由后续 Creator 组件实现节点绑定。
- 收紧 `UiInteractionRequest` 为严格 union，payload 只允许稳定 ID；新增 `P0UiRequestRouter` 作为 app 层 UI 请求入口，避免 Cocos/presentation 直接调用玩法系统。
- 加强 UI 回归：禁用态不发请求、ViewModel 不修改 snapshot、presentation 禁止依赖 app/cc/平台实现/可变玩法服务。

### Notes

- 当前文档以原型第一轮闭环为范围，不声明代码系统已经完成。
- 第一阶段允许 `MockAdService`、`LocalSaveService`、占位美术等 `TEMP_PROTOTYPE` 实现，但必须保留正式接口与替换计划。
- 文档遵循 AGENTS.md 的工程边界：平台能力隔离、数据驱动、UI 不越权、核心逻辑可测试。
- 音频 P0+ 不包含菜单 BGM 或战斗长 BGM；ElevenLabs Creator 人声只允许作为离线、低频、可替换资产进入，运行时不得调用外部 TTS。
- 当前 UI 完成的是 Cocos-ready TypeScript 状态/请求层、绑定 Presenter、无 `cc` runtime、manifest factory 和真实 Creator TS 组件。
- `GameApp.runPrototypeLoop()` 仍只用于 CLI/demo 验证，不作为 UI command handler。
