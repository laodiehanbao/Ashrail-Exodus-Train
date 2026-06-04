# PERFORMANCE_BUDGET

## Prototype 预算

- 核心逻辑必须可脱离 Cocos 运行。
- 第一轮不引入 Spine、长音频、大图、录屏或压缩包。
- 主包只保留启动、首屏、第一段可玩内容、基础配置和必要占位资源。
- 模拟和测试不得依赖渲染环境。

## Audio Budget

- P0 generated runtime audio target: `<= 250 KB`.
- P0+ generated runtime audio target after event variants: `<= 384 KB`.
- Main package audio target: `<= 1.5 MB`; hard limit: `<= 2 MB`.
- Single runtime SFX target: `<= 80 KB`.
- P0 short ambience loop target: `<= 80 KB`.
- Runtime audio must use `.ogg`; `.wav` is only allowed as a temporary generated intermediate and must not remain in the repo.
- P0+ does not include long BGM. ElevenLabs Creator voice is allowed only as an offline asset-production step, with exported `.ogg` assets and no runtime API calls.
- Voice asset budget: `<= 320 KB`; voice lines must be low-frequency and configurable.
- Validate with `npm run validate:audio`.

## 后续检查

- Cocos `library/`、`build/`、`temp/`、`profiles/` 不入库。
- 大资源进入分包、远程资源或外部资产库。
- 首屏 UI 和核心配置优先加载，后续章节延迟加载。
