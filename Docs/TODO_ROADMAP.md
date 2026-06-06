# TODO_ROADMAP

本文档记录当前阶段路线。优先级以能跑通第一轮闭环为准，后续系统必须服务核心循环。

## P0 工程骨架

- 建立 `src` 分层目录和稳定命名。
- 建立 `configs` 按领域拆分的配置目录。
- 建立 `tests/unit`、`tests/integration`、`tests/simulations`。
- 建立统一类型、错误码、事件定义。
- 建立统一日志与基础事件总线。
- 建立 Mock 平台服务接口：广告、存档、分析预留。

验收：空项目能启动入口模块，配置加载失败能给出明确错误。

## P1 第一轮闭环

- 加载默认配置与本地存档。
- 创建玩家资源、装备、列车模块、关卡进度模型。
- 实现简化自动战斗结算。
- 实现第一批敌人、关卡、奖励配置。
- 实现 Loot Box 奖池与固定随机种子开箱。
- 实现 RewardService，统一发放资源、装备、模块碎片。
- 实现基础升级：装备或列车模块至少一种。
- 实现 Mock 广告奖励翻倍。
- 实现 LocalSaveService 与版本号。
- 实现最小 UI 状态/请求层：巡航、战斗结果、开箱、成长反馈。
- 实现 app 层 UI request router：接收严格 `ui_request_*`，由 gameplay 服务二次判定并刷新 UI state。
- 建立无 `cc` 的 P0 Cocos node binding manifest：覆盖五屏 required slot、节点路径、列表模板、组件引用和 actionId。
- 建立无 `cc` 的 manifest-to-binding factory：通过 host 接口装配 `P0CocosUiBinding`，缺节点/缺 slot 时返回清晰错误。
- 建立无 `cc` 的 P0 Cocos UI runtime：装配 `IP0UiPresenter` 与 binding presenter，串行处理点击请求，只渲染 accepted update state。
- 建立真实 Cocos Creator TypeScript 组件：presentation 只提供 `cc` binding components 和 manifest host，app 层提供 Creator bootstrap 装配。
- 接入生成式 Cocos Creator scene/node 绑定：`assets/scenes/scene_p0_exodus_train_main.scene` 覆盖五个 P0 screen、所有 manifest path 和 20 个 bootstrap JsonAsset 引用，只渲染 UI state、转发 `ui_request_*`，不得承载业务规则。

验收：新存档可连续完成 3 个阶段，并能保存后重新加载。

## P2 测试与模拟

- Loot-box simulation：固定箱子打开 1000 次，输出稀有度分布。
- Combat simulation：指定敌人与模块，模拟 60 秒 DPS。
- Economy simulation：模拟前 30 分钟资源增长与升级时间。
- Ad tests：成功、失败、取消、无填充、冷却、每日限制。
- Save tests：保存、读取、缺字段默认、版本迁移、异常恢复。
- Config tests：schema 校验、缺字段、非法 ID、概率总和。

验收：核心逻辑可脱离 UI 测试，失败信息能定位到配置或系统。

## P3 垂直切片

- 增加 3-5 种敌人和 1 个 Boss。
- 增加 5-10 件装备、3 个稀有度。
- 增加 3 个列车模块。
- 完成开箱动画、稀有度颜色、战力浮字。
- 增加关卡失败、复活、奖励翻倍。
- 接入 DouyinAdService 的真实适配层。
- 增加广告异常降级策略。
- 补齐第一版性能和包体预算文档。

验收：玩法可作为 10-15 分钟可体验版本，不依赖调试按钮完成主循环。

## P4 软启动准备

- 完成前 30-60 分钟数值曲线。
- 增加离线收益和每日奖励。
- 增加基础教程。
- 接入分析事件。
- 准备远程配置预留。
- 增加包体检查与资源分包规则。
- 清理 `TEMP_PROTOTYPE` 标记或补齐替换计划。

验收：广告、存档、性能、包体、配置回滚具备上线前检查路径。

## 当前禁止事项

- 不写 `GameManager` 式总控对象。
- 不从 UI 直接改资源、发奖励或写存档。
- 不把 Douyin API 写进 `gameplay` 或 `presentation`。
- 不把敌人、装备、宝箱概率硬编码到业务逻辑。
- 不提交 Cocos 缓存、构建产物、重型素材源文件。
- 不创建无归属目录或临时命名目录。

## 打开问题

- 第一阶段 UI 已完成逻辑测试驱动的 TypeScript state/request 层、Cocos-ready Presenter、无 `cc` node binding manifest、manifest-to-binding factory、P0 Cocos UI runtime、真实 Cocos Creator TS binding components、Creator bootstrap、app request router、Creator 同步脚本、生成式 P0 scene/meta 和三张 P0 背景 SpriteFrame 接线。下一步需要在 Cocos Creator 内刷新 AssetDB、打开并保存 `scene_p0_exodus_train_main.scene`，确认没有 missing script / missing JsonAsset。
- 第一批数值表的粒度需要和模拟脚本同步调整。
- 真实 Douyin 广告点位 ID 暂未确定，先使用稳定内部 placement ID。
- 正式资源包体预算需要在第一批美术资源进入前补充。
