# Code Guardian Checklist

第一轮守护目标：先挡住目录失控、依赖反向、UI 越权、平台 API 污染和无测试核心逻辑。

## 必查边界

- `Docs/` 是当前文档目录；禁止再创建并列的 `docs/`。
- `domain` 不依赖 UI、平台、Cocos、存档或广告。
- `gameplay` 不直接调用 `tt.*`，只依赖平台接口。
- `presentation` 不计算掉落、不判定战斗、不写存档、不直接发奖励。
- `platform` 才允许承载 Douyin/local/mock 适配。
- 新系统按 `*.types.ts`、`*.schema.ts`、接口、系统、测试/模拟、文档顺序推进。

## 命名拦截

- 禁止目录：`new`、`old`、`temp`、`test123`、`manager`、`manager2`、`final`、`final2`、`all`、`misc`、`backup`、`copy`、`随便放`。
- 禁止 `GameManager.ts` 和承载全局业务的 `MainScene.ts`。
- 业务 ID 必须是稳定小写 snake_case，并带领域前缀。
- 数值、掉落、敌人、广告倍率、升级成本、UI 文案必须来自配置。

## 最小验证

- `npm run validate:configs`
- `npm run check`
- `npm test`
- `npm run sim:loot`
- `npm run sim:combat`
- `npm run sim:economy`
- `npm run sim:ads`

## 提交前确认

- 没有新增无归属目录或构建缓存。
- `.gitignore` 覆盖 Cocos 缓存、构建产物、日志、环境变量、密钥和重资产。
- 核心奖励结算使用 settlement ID 保持幂等。
- 存档有 `saveVersion` 和迁移入口。
- 广告成功、取消、失败、无填充、超时都有受控结果。
- 临时代码必须标 `TEMP_PROTOTYPE`，并写明原因、替换计划和清理时机。
