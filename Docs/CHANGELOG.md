# CHANGELOG

本文档记录项目文档和工程约定变更。格式保持简洁，便于后续同步到版本日志。

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
- 当前 UI 完成的是 Cocos-ready TypeScript 状态/请求层、绑定 Presenter、无 `cc` runtime 和 manifest factory；Cocos Creator prefab、节点实例绑定和动画控制仍是下一步，不把纯 TS 壳声明为最终 UI。
- `GameApp.runPrototypeLoop()` 仍只用于 CLI/demo 验证，不作为 UI command handler。
