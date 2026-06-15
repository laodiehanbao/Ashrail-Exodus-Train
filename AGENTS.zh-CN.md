# 项目生成规则

本文件定义 Codex 在这个仓库中工作时需要遵守的项目级规则。

对应英文版：`AGENTS.md`。当规则发生变化时，需要同步维护两个文件。

## 项目

- 项目英文名：Ashrail Exodus Train
- 项目中文名：烬轨：流亡列车

## 生成规则

- 在本仓库生成代码、内容、设计和资源时，都必须遵守本文件中的规则。
- 项目结构建立后，优先保持与现有文件、命名和风格一致。
- 生成内容需要贴合项目标题、整体氛围和世界观方向。
- 不要覆盖用户亲自编写的内容，除非用户明确要求。
- 新增规则时，应尽量具体、可检查，并且便于执行。

# AGENTS.md

> 本文件用于约束 Codex / Claude Code / Cursor Agent / 其他代码生成代理在本项目中的行为。  
> 目标不是“写一个 demo”，而是生成一个可以长期扩展、可换皮、可调数值、可接广告、可逐步并入 UE5 大游戏世界观的成熟小游戏工程。

---

## 0. 项目一句话定位

本项目是一个 **末日列车题材的 2.5D 轻度爽文开箱 / 挂机成长 / 模块化列车养成小游戏**。

它面向抖音小游戏

- 核心玩法简单、反馈强、广告点自然；
- 底层框架可多次换皮；
- 数值、关卡、掉落、装备、广告、列车模块全部数据驱动；
- 禁止为了快速 demo 写成不可维护的屎山。

---

## 1. 项目定位

项目名称：烬轨：流亡列车  
英文名：Ashrail Exodus Train

项目类型：

```text
抖音小游戏
2.5D 轻量自动战斗
开箱成长
挂机收益
模块化列车养成
广告变现
数据驱动换皮框架
```

项目首发目标：

```text
快速跑通核心闭环
适配抖音小游戏运行环境
保证包体、加载、帧率、广告、存档稳定
避免一次性 demo 架构
保留后续换皮、活动、赛季、长期扩展能力
```

---

## 2. 当前技术架构

### 2.1 默认技术栈

```text
Cocos Creator 3.8 LTS
TypeScript
抖音小游戏构建目标
Canvas / WebGL 渲染
JSON / CSV / TS Config 数据驱动
平台能力通过 Service 层隔离
```

### 2.2 平台能力

所有抖音平台能力必须通过接口封装，不得在玩法系统、UI 组件、数据模型中直接调用平台 API。

平台能力包括：

```text
广告
登录
用户信息
存档
分享
支付预留
埋点
排行榜预留
震动
网络状态
版本信息
```

### 2.3 工程边界

主工程只生成当前技术栈需要的代码、资源、配置和文档。

禁止生成与当前技术栈无关的客户端主工程目录、运行时结构、资源组织方式或平台专属实现。

---

## 3. 核心玩法闭环

所有系统必须服务以下闭环：

```text
进入巡航 / 关卡
        ↓
遭遇敌人 / 事件 / 宝箱 / 废墟
        ↓
自动战斗或轻交互结算
        ↓
获得资源 / 装备 / 模块碎片
        ↓
开箱 / 合成 / 升级 / 装备
        ↓
战力提升 / 列车变强 / 外观变化
        ↓
挑战更高阶段 / 解锁新车厢 / 新系统
        ↓
出现资源卡点或战斗压力
        ↓
广告翻倍 / 临时增益 / 离线收益 / 继续成长
```

新系统如果不能进入该闭环，不得优先实现。

---

## 4. 目录结构

### 4.1 推荐目录

```text
/project-root
  /assets
    /audio
    /effects
    /fonts
    /icons
    /prefabs
    /scenes
    /spine
    /textures
    /ui
  /src
    /app
    /core
    /data
    /domain
    /gameplay
    /presentation
    /platform
    /shared
    /tools
  /configs
    /balance
    /loot
    /stages
    /themes
    /ads
  /docs
    AGENTS.md
    DESIGN_CORE_LOOP.md
    DESIGN_NUMERIC_CURVES.md
    DESIGN_LOOT_SYSTEM.md
    DESIGN_TRAIN_MODULES.md
    DESIGN_AD_PLACEMENTS.md
    TECH_ARCHITECTURE.md
    PERFORMANCE_BUDGET.md
    PACKAGE_SPLIT_RULES.md
    TODO_ROADMAP.md
    CHANGELOG.md
  /tests
    /simulations
    /unit
    /integration
```

### 4.2 src 分层

```text
app             启动、全局初始化、场景装配
core            事件总线、生命周期、日志、工具、基础容器
data            配置读取、Schema 校验、数据仓库、远程配置预留
domain          纯业务模型：玩家、资源、装备、列车、阶段、奖励
gameplay        玩法系统：战斗、开箱、升级、关卡、事件、离线收益
presentation    UI、动画、飘字、音效、镜头、表现控制
platform        广告、存档、登录、分享、埋点、平台 API 适配
shared          通用类型、常量、枚举、错误码
tools           数值模拟、配置校验、包体检查、调试工具
```

### 4.3 目录硬约束

禁止出现以下目录或命名：

```text
new
old
temp
test123
manager
manager2
final
final2
all
misc
backup
copy
随便放
```

新增文件必须先判断归属层级。无法判断归属时，先补充设计文档，不得乱建目录。

---

## 5. 命名规范

### 5.1 TypeScript 文件命名

```text
PascalCase.ts       类、系统、服务、控制器
camelCase.ts        纯工具函数
*.types.ts          类型定义
*.schema.ts         配置 Schema
*.config.ts         静态配置入口
*.constants.ts      常量
*.events.ts         事件定义
*.test.ts           测试
*.sim.ts            模拟脚本
```

示例：

```text
TrainModuleSystem.ts
LootBoxSystem.ts
RewardService.ts
AdService.types.ts
LootBox.schema.ts
StageBalance.config.ts
combatPower.sim.ts
```

### 5.2 类与接口命名

```text
IAdService
ISaveService
IAnalyticsService
LootBoxSystem
LootGenerator
RewardService
TrainModuleSystem
CombatResolver
StageProgressService
PlayerProgressRepository
```

### 5.3 ID 命名

所有业务 ID 使用稳定字符串，不使用显示文本当 ID。

```text
module_cannon_basic_001
lootbox_supply_common
stage_chapter_01_005
equipment_rifle_rusty_001
ad_reward_stage_clear_double
theme_doom_train
```

---

## 6. 先声明，再实现

### 6.1 TypeScript 规则

实现任何核心系统前，必须先建立：

```text
类型定义
接口定义
配置 Schema
事件定义
输入输出结构
错误码
```

推荐顺序：

```text
1. *.types.ts
2. *.schema.ts
3. *.events.ts
4. Interface
5. System / Service / Controller
6. UI / View / Animation
7. Test / Simulation
8. Docs
```

禁止直接从 UI 按钮开始写业务逻辑。

### 6.2 C++ / 原生模块规则

如果项目后续出现 C++、原生扩展或独立大工程，必须遵守：

```text
先写 .h / .hpp
再写 .cpp
先定义接口和数据结构
再写具体实现
```

不得先堆实现文件，再反向补接口。

---

## 7. 分层依赖规则

### 7.1 允许依赖方向

```text
presentation → gameplay → domain
presentation → platform interface
app → all layers for composition only
gameplay → data / domain / platform interface
platform implementation → platform interface
```

### 7.2 禁止依赖方向

```text
domain 不得依赖 UI
domain 不得依赖平台 API
gameplay 不得直接调用 tt API
UI 不得直接改存档
UI 不得直接计算掉落
UI 不得直接决定战斗胜负
广告实现不得污染玩法层
表现动画不得直接发奖励
```

### 7.3 事件通信

跨系统通信优先使用事件或明确的 Service 调用。

推荐：

```text
RewardGrantedEvent
PowerChangedEvent
LootBoxOpenedEvent
AdRewardCompletedEvent
StageClearedEvent
TrainModuleUpgradedEvent
```

禁止到处互相 import 具体实现类形成循环依赖。

---

## 8. 数据驱动规则

### 8.1 禁止硬编码

以下内容不得写死在代码里：

```text
装备名称
装备品质
掉落概率
敌人血量
敌人攻击力
关卡波次
阶段目标
广告奖励倍数
宝箱价格
升级消耗
车厢模块解锁条件
皮肤主题文本
UI 展示文案
```

必须放入：

```text
JSON
CSV
TS Config
远程配置预留
数值表
主题表
```

### 8.2 配置必须校验

所有配置必须有 Schema 或校验函数。

配置加载失败时必须：

```text
输出明确错误
阻止进入错误状态
使用安全默认值或中断启动
不得静默失败
```

### 8.3 数值表分层

```text
BaseCurve       基础曲线：等级、阶段、敌人强度
EconomyCurve    经济曲线：金币、材料、燃料、升级消耗
DropCurve       掉落曲线：品质概率、装备池、宝箱收益
AdCurve         广告曲线：广告奖励倍率、每日限制、触发时机
StageCurve      阶段曲线：章节目标、Boss、卡点设计
ThemeConfig     换皮配置：名称、文案、资源、颜色、音效
```

不得把所有数值塞进一个大表。

---

## 9. 核心系统拆分

### 9.1 开箱系统

必须拆成：

```text
LootBoxSystem       开箱流程入口
LootGenerator       掉落生成
RewardService       奖励发放
InventoryService    背包接收
AdService           广告加成
LootBoxView         UI 展示
LootBoxAnimator     开箱表现
```

UI 不得生成掉落结果。

### 9.2 战斗系统

必须拆成：

```text
CombatResolver      战斗结算
EnemySpawner        敌人生成
WaveDirector        波次控制
DamageCalculator    伤害计算
TrainCombatModel    列车战斗状态
CombatView          战斗表现
```

战斗初期可以简化，但系统边界不得混乱。

### 9.3 列车模块系统

必须拆成：

```text
TrainModel              列车业务数据
TrainModuleSystem       模块安装、卸载、升级
TrainModuleRepository   模块配置读取
TrainView               列车表现
TrainSocketView         模块挂点表现
```

模块不得只存在于 UI 或贴图里。

### 9.4 广告系统

必须拆成：

```text
IAdService
MockAdService
DouyinAdService
AdPlacementConfig
AdRewardService
AdLimitService
```

广告失败、取消、无填充、超时都必须有处理。

### 9.5 存档系统

必须拆成：

```text
ISaveService
LocalSaveService
DouyinSaveService
SaveVersionMigrator
PlayerProgressRepository
```

存档必须有版本号和迁移逻辑。

---

## 10. 抖音小游戏平台规则

### 10.1 平台 API 规则

平台 API 只允许出现在：

```text
/src/platform
```

其他层只能依赖接口。

### 10.2 广告规则

广告位必须配置化：

```text
placementId
triggerScene
rewardType
rewardMultiplier
dailyLimit
cooldownSeconds
fallbackReward
```

广告不得强插破坏主循环。

### 10.3 存档规则

至少保存：

```text
玩家等级
当前阶段
当前资源
列车模块状态
装备背包
已解锁系统
广告次数记录
离线收益时间戳
新手引导进度
主题皮肤选择
存档版本号
```

### 10.4 弱网规则

必须支持：

```text
广告不可用时安全降级
远程配置失败时使用本地默认配置
网络异常时不损坏存档
结算奖励必须幂等
```

---

## 11. 包体与资源规则

### 11.1 主包原则

主包只放：

```text
启动代码
首屏 UI
第一段可玩内容
基础字体
基础音效
核心配置
必要图集
```

### 11.2 分包与远程资源

以下内容优先进入分包或远程资源：

```text
后续章节
活动资源
皮肤资源
长音频
大图
高帧率动画
宣传素材
非首日玩法资源
```

### 11.3 资源命名

```text
tex_train_head_rust_001.png
icon_equipment_rifle_common_001.png
sfx_lootbox_open_001.mp3
spine_enemy_zombie_basic_001
prefab_train_module_cannon_basic
```

### 11.4 禁止资源行为

禁止：

```text
无压缩大图直接进主包
长音频直接进主包
重复导入同一素材
同一图片存在 png、jpg、psd 多份正式资源
把源工程文件当运行资源提交
把录屏、截图、临时压缩包提交进仓库
```

---

## 12. Git 与 .gitignore 规则

### 12.1 必须忽略

`.gitignore` 必须覆盖：

```text
node_modules/
build/
dist/
out/
temp/
.tmp/
logs/
.cache/
.DS_Store
*.log
.env
.env.*
*.key
*.pem
*.p12
*.keystore
```

### 12.2 Cocos 常见忽略项

```text
library/
local/
temp/
build/
profiles/
```

如果项目实际生成目录不同，以实际引擎版本为准补充。

### 12.3 重文件规则

以下文件默认不进 Git 普通仓库：

```text
.psd
.blend
.fbx
.wav
.mp4
.mov
.zip
.rar
.7z
源工程大文件
批量截图
录屏文件
AI 生成过程文件
```

需要保留时，必须满足至少一项：

```text
使用 Git LFS
放入外部资源库
放入云盘并在 docs 中记录链接
压缩到可控体积
转为运行时所需格式
```

### 12.4 重复上传限制

短时间内不得反复上传同一批大文件。

禁止重复上传：

```text
node_modules
build 产物
library 缓存
dist 产物
未压缩大图包
长音频包
录屏包
重复 zip 包
```

上传前必须先检查：

```text
是否已经在仓库存在
是否只是构建缓存
是否可以通过安装依赖再生成
是否应放 Git LFS
是否应放外部资源库
是否会拖慢 Codex 读取和检索
```

---

## 13. 代码质量硬约束

### 13.1 单文件限制

```text
普通 .ts 文件尽量不超过 300 行
复杂系统超过 300 行必须拆分
单个 UI 组件不得承载多个核心系统
单个 Service 只负责一个业务领域
单个函数尽量不超过 80 行
复杂条件必须拆成命名函数
不得出现 5 层以上嵌套
```

### 13.2 禁止 God Object

禁止出现：

```text
GameManager 管所有系统
MainScene 写所有逻辑
PlayerController 写广告、存档、掉落、战斗
UI Button 直接改资源和存档
一个文件里塞十几个系统
```

### 13.3 日志规则

必须使用统一日志模块。

推荐：

```text
Log.info('loot', 'Generated reward', data)
Log.warn('ad', 'Rewarded ad unavailable', context)
Log.error('save', 'Save migration failed', error)
```

禁止长期保留：

```text
console.log('111')
console.log('test')
alert 调试
无分类刷屏日志
```

---

## 14. 表现层规则

### 14.1 表现优先级

优先实现：

```text
开箱闪光
装备品质颜色
战力上涨飘字
列车震动
受击反馈
敌人死亡爆裂
车厢升级外观变化
广告奖励空投表现
```

### 14.2 表现不得污染逻辑

动画只能播放表现和发事件。

推荐：

```text
playLootBoxAnimation(rewardPreview)
onLootBoxAnimationFinished.emit(result)
```

禁止：

```text
动画回调里直接修改存档
动画脚本里直接生成掉落
动画脚本里直接调用广告
```

---

## 15. UI 规则

UI 可以：

```text
展示数据
播放动画
接收点击
发起请求
监听事件
显示结果
```

UI 不可以：

```text
计算掉落
决定战斗胜负
修改核心存档
直接写广告逻辑
硬编码经济数值
绕过 Service 改业务模型
```

UI 必须通过 ViewModel / Presenter / Controller 获取数据。

---

## 16. 测试与模拟

### 16.1 每个核心系统必须可测

```text
开箱测试：固定宝箱 ID，连续开 1000 次，输出品质分布
战斗测试：指定敌人与模块，模拟 60 秒 DPS
经济测试：模拟前 30 分钟资源增长
广告测试：成功 / 失败 / 取消 / 无填充
存档测试：保存、读取、版本迁移、异常恢复
包体测试：检查主包和资源大小
```

### 16.2 数值系统必须有模拟

涉及数值曲线时，必须优先生成模拟脚本。

输出至少包括：

```text
每分钟战力
每阶段平均升级耗时
广告触发频率
宝箱品质分布
玩家卡点位置
资源缺口
```

---

## 17. Agent 工作流程

### 17.1 修改前

Agent 必须先检查：

```text
当前目录结构
已有系统命名
已有配置文件
已有接口
已有文档
是否存在类似实现
```

不得盲目新建重复系统。

### 17.2 实现顺序

```text
1. 类型定义
2. 配置 Schema
3. 接口
4. 核心逻辑
5. 平台适配
6. UI / 表现
7. 存档 / 事件
8. 测试 / 模拟
9. 文档更新
```

不得先从 UI 或场景脚本硬写。

### 17.3 输出要求

每次完成任务必须说明：

```text
完成内容
修改文件
新增系统
测试方法
风险点
后续 TODO
是否存在临时实现
```

---

## 18. 禁止行为清单

Agent 严禁：

```text
为了省事写 GodManager
为了跑通直接硬编码奖励
为了 UI 方便直接改玩家存档
为了动画方便直接发奖励
为了广告方便把平台 API 写进玩法层
为了测试方便污染正式代码
为了省文件把所有类写一起
为了换皮复制一份完整项目
为了数值方便只堆指数不做分段
为了快把 TODO 当最终实现
生成重复目录
生成无归属文件
提交构建缓存
提交大体积临时资源
短时间重复上传同一批重文件
```

如必须临时简化，必须标记：

```text
TEMP_PROTOTYPE
原因
替换方案
清理时间点
TODO 记录
```

---

## 19. 允许的原型简化

原型阶段允许：

```text
Mock 广告
占位美术
简单敌人 AI
本地配置代替远程配置
本地存档
简化战斗公式
假排行榜
调试按钮触发开箱
```

但必须保留正式接口。

---

## 20. 版本目标

### 20.1 Prototype

```text
列车显示
简单敌人
自动战斗
开箱
装备
战力变化
升级
Mock 广告
本地存档
基础 UI
```

### 20.2 Vertical Slice

```text
3-5 种敌人
1 个 Boss
5-10 种装备
3 种品质
3 个列车模块
完整开箱动画
完整奖励结算
广告翻倍
阶段目标
失败与复活
```

### 20.3 Soft Launch

```text
前 30-60 分钟数值曲线
留存点设计
广告点完整
埋点
性能优化
新手引导
离线收益
每日奖励
基础活动
```

### 20.4 Scalable

```text
主题配置
皮肤资源包
活动配置
赛季配置
远程配置预留
多装备池
多章节
多广告策略
数据模拟工具
```

---

## 21. 最终验收标准

功能只有满足以下条件才算完成：

```text
能运行
结构清晰
数据可调
表现可换
逻辑可测
存档安全
广告隔离
UI 不越权
目录干净
包体可控
文档同步
未来能扩展
```

只要“看起来能用”但未来无法维护，不算完成。

## 修改安全规则
- 修改任何正在使用的东西，必须先备份原文件，或者新建文件修改；不得直接覆盖正在使用的配置、数据、脚本、文档或运行中资源。

---

## Agent Rule: Full-Scope Work And Recoverable Batching

- Do not use conservative partial progress, small-sample execution, or "do a few first" as a substitute for the user's requested full scope.
- If the user asks for all items, all candidates, full search, full review, or complete coverage, the default scope is the full set.
- Batching is allowed only as an execution mechanism, not as scope reduction. Before batching, create or update a durable plan that lists every batch, every item range, status fields, completion criteria, and the resume entry point.
- Do not rely on chat history as the only state. Persist progress in project files such as CSV ledgers, manifests, TODO/checkpoint docs, or per-item notes so another agent can resume after context compaction.
- A subset is not complete unless the durable plan explicitly says it is the requested scope, or the user explicitly asked for that subset.
- Platform/search result pages are not final source verification. For assets, dependencies, data, or citations, verify item-level source, license/terms, author/rightsholder, format, and evidence before marking an item usable or final.
