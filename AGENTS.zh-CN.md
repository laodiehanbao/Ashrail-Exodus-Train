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

## 1. Agent 总原则

所有 AI 代码代理必须遵守以下原则。

### 1.1 先读项目，再写代码

在任何修改前，必须先查看：

- 当前目录结构；
- 关键 README / AGENTS / DESIGN / TODO 文件；
- 已有模块命名方式；
- 已有数据表、配置文件、资源目录；
- 已有代码风格。

不得在不了解已有结构的情况下盲目新建大量文件。

### 1.2 不写一次性 demo 代码

除非任务明确要求临时验证，否则禁止：

- 把所有逻辑塞进一个 Actor / Blueprint / Manager；
- 使用大量硬编码数值；
- 在 UI 里直接写业务逻辑；
- 在角色类里直接处理广告、掉落、存档、数值成长；
- 复制粘贴相同逻辑；
- 为了跑通功能绕开架构。

### 1.3 先接口，后实现

凡是未来可能换皮、换玩法、换平台、换数值的内容，都必须通过接口或数据层隔离。

必须优先考虑：

- DataAsset / DataTable / JSON 配置；
- Interface；
- Component；
- Subsystem；
- Event / Delegate；
- 清晰的 Base Class；
- 可替换实现。

### 1.4 生成内容必须可继续扩展

每次实现新功能时，必须思考：

- 以后会不会增加新列车车厢？
- 以后会不会增加新装备品质？
- 以后会不会换成修仙、赛博、职场、海盗、魔法等皮？
- 以后会不会接广告、付费、活动、赛季？
- 以后会不会迁移到更大的 UE5 3D 项目？

如果答案是“可能”，就不得写死。

---

## 2. 项目核心体验

### 2.1 玩家幻想

玩家控制一列在末日废土中不断前进的列车。  
列车既是基地，也是武器，也是角色成长载体。

玩家通过：

- 开箱；
- 捡垃圾；
- 击退尸潮 / 怪物 / 劫匪；
- 升级车厢；
- 解锁模块；
- 合成装备；
- 看广告翻倍奖励；

让破烂列车逐渐变成末日移动堡垒。

### 2.2 目标爽点

Agent 生成玩法时，必须围绕以下爽点设计：

1. **战力暴涨**：数字跳得快，装备替换频繁。
2. **开箱期待**：每次开箱都有颜色、音效、闪光、词条、战力变化。
3. **低脑负担决策**：玩家只需要点“装备 / 升级 / 合成 / 看广告翻倍”。
4. **阶段性压迫**：尸潮、缺燃料、车厢破损、Boss 逼近。
5. **反差逆袭**：从破铜烂铁到钢铁巨兽。
6. **弱剧情强氛围**：世界观用短句、事件、物品描述体现，不长篇讲故事。
7. **广告不突兀**：广告必须包装成“补给空投 / 神秘商人 / 紧急维修 / 双倍战利品”。

---

## 3. 底层玩法闭环

所有功能都应服务以下闭环。

```text
进入关卡 / 挂机巡航
        ↓
遭遇事件 / 敌人 / 宝箱 / 废墟
        ↓
战斗或自动结算
        ↓
获得资源 / 装备 / 模块碎片
        ↓
开箱 / 合成 / 升级 / 装备
        ↓
战力提升 / 列车变强 / 外观变化
        ↓
挑战更高阶段 / 解锁新车厢 / 新系统
        ↓
卡点出现
        ↓
广告翻倍 / 临时增益 / 继续成长
```

任何新系统如果不能嵌入这个闭环，必须谨慎添加。

---

## 4. 项目架构总览

项目必须按以下层级组织。

```text
Presentation Layer    表现层：UI、动画、音效、特效、镜头、飘字
Gameplay Layer        玩法层：战斗、开箱、列车模块、敌人、事件
Progression Layer     成长层：等级、装备、资源、解锁、阶段目标
Data Layer            数据层：DataAsset、DataTable、配置、数值曲线
Platform Layer        平台层：广告、存档、登录、埋点、支付预留
Core Layer            基础层：事件总线、工具库、通用组件、接口
```

禁止 Presentation Layer 直接改 Data Layer。  
禁止 UI 直接决定掉落、战斗、广告奖励。  
禁止 Platform Layer 反向污染玩法核心。

---

## 5. 推荐目录结构

### 5.1 UE5 项目结构

```text
/Source
  /DoomTrain
    /Core
      DTTypes.h
      DTGameplayTags.h
      DTLogChannels.h
      DTAssetManager.h
    /Interfaces
      DTInteractableInterface.h
      DTDamageableInterface.h
      DTRewardSourceInterface.h
      DTUpgradeableInterface.h
    /Components
      DTHealthComponent.h
      DTCombatStatsComponent.h
      DTInventoryComponent.h
      DTTrainSocketComponent.h
      DTRewardComponent.h
    /Data
      DTTrainModuleDataAsset.h
      DTEquipmentDataAsset.h
      DTEnemyDataAsset.h
      DTStageDataAsset.h
      DTRewardTableDataAsset.h
      DTAdPlacementDataAsset.h
    /Train
      DTTrainActor.h
      DTTrainCarriageBase.h
      DTBuildableModuleBase.h
      DTTrainModuleManagerComponent.h
    /Combat
      DTCombatResolver.h
      DTEnemyBase.h
      DTProjectileBase.h
      DTWaveDirectorComponent.h
    /Loot
      DTLootBoxSystem.h
      DTLootGenerator.h
      DTRewardInstance.h
    /Progression
      DTPlayerProgressSubsystem.h
      DTStageProgressSubsystem.h
      DTUpgradeSystem.h
    /Events
      DTWorldEventSystem.h
      DTEncounterDirector.h
    /UI
      DTMainHUD.h
      DTLootBoxWidget.h
      DTTrainUpgradeWidget.h
    /Platform
      DTAdServiceInterface.h
      DTMockAdService.h
      DTSaveGameSubsystem.h
      DTAnalyticsService.h
```

### 5.2 Content 结构

```text
/Content/DoomTrain
  /Blueprints
    /Train
    /Enemies
    /Modules
    /UI
  /Data
    /TrainModules
    /Equipment
    /Enemies
    /Stages
    /Rewards
    /Ads
    /Balance
  /Art
    /Characters
    /Train
    /Environment
    /VFX
    /UI
  /Animation
    /Train
    /Enemies
    /UI
  /Audio
    /SFX
    /Music
  /Maps
    L_Prototype
    L_MainLoop
    L_CombatTest
```

---

## 6. 命名规范

### 6.1 C++ 命名

| 类型 | 前缀 | 示例 |
|---|---:|---|
| Actor | A | `ADTTrainActor` |
| UObject | U | `UDTLootGenerator` |
| Component | U | `UDTHealthComponent` |
| Interface | I / U | `IDTRewardSourceInterface` |
| Struct | F | `FDTRewardEntry` |
| Enum | E | `EDTEquipmentRarity` |
| Widget | U | `UDTLootBoxWidget` |

### 6.2 蓝图命名

| 类型 | 前缀 | 示例 |
|---|---:|---|
| Blueprint Actor | BP_ | `BP_TrainActor` |
| Widget Blueprint | WBP_ | `WBP_LootBoxPanel` |
| DataAsset | DA_ | `DA_Module_Cannon_Lv01` |
| DataTable | DT_ | `DT_EquipmentPool_Common` |
| Material | M_ | `M_TrainRustyMetal` |
| Material Instance | MI_ | `MI_TrainRustyMetal_01` |
| Niagara | NS_ | `NS_LootBox_OpenFlash` |
| Animation | AN_ | `AN_Enemy_Zombie_Attack` |

---

## 7. 数据驱动规则

### 7.1 禁止硬编码的内容

以下内容不得写死在代码里：

- 装备名称；
- 装备品质；
- 掉落概率；
- 敌人血量；
- 敌人攻击力；
- 关卡波次；
- 阶段目标；
- 广告奖励倍数；
- 宝箱价格；
- 升级消耗；
- 车厢模块解锁条件；
- 皮肤主题文本；
- UI 展示文案。

这些内容必须放在：

- DataAsset；
- DataTable；
- JSON；
- CSV；
- 可热更新配置；
- 平衡表。

### 7.2 核心数据类型

必须预留以下数据资产。

```cpp
UCLASS(BlueprintType)
class UDTTrainModuleDataAsset : public UPrimaryDataAsset
{
    GENERATED_BODY()

public:
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    FName ModuleId;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    FText DisplayName;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    FText Description;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    EDTTrainModuleType ModuleType;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    int32 UnlockStage;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    float BasePower;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    TMap<FName, float> StatModifiers;
};
```

### 7.3 数值表必须分层

数值配置必须至少分为：

```text
BaseCurve      基础曲线：等级、阶段、敌人强度
EconomyCurve   经济曲线：金币、材料、燃料、升级消耗
DropCurve      掉落曲线：品质概率、装备池、宝箱收益
AdCurve        广告曲线：广告奖励倍率、每日限制、触发时机
StageCurve     阶段曲线：章节目标、Boss、卡点设计
```

不得把所有数值塞进一个表。

---

## 8. 换皮框架

本项目底层必须可以换成其他题材。

### 8.1 主题皮肤数据

必须使用 Theme / Skin 配置隔离表现。

```text
ThemeId: DoomTrain
DisplayName: 末日列车
CoreVehicleName: 列车
CurrencyName: 废铁
PremiumCurrencyName: 能源核心
LootBoxName: 补给箱
EnemyGroupName: 尸潮
AdRewardName: 空投补给
```

未来可以替换为：

```text
ThemeId: Cultivation
CoreVehicleName: 洞府
CurrencyName: 灵石
LootBoxName: 机缘宝匣
EnemyGroupName: 妖潮
AdRewardName: 天降机缘
```

因此代码中不得直接写“列车”“尸潮”“补给箱”等固定文案。  
必须从 Theme 配置读取。

### 8.2 换皮边界

可换皮内容：

- 名称；
- 文案；
- UI 皮肤；
- 角色模型；
- 敌人模型；
- 装备图标；
- 资源名称；
- 音效；
- 特效；
- 剧情事件文本。

不可随意换皮的核心：

- 成长曲线；
- 开箱节奏；
- 广告节奏；
- 奖励结算；
- 列车模块系统抽象；
- 战斗结算接口。

---

## 9. 列车模块系统

### 9.1 核心抽象

列车由多个车厢和模块组成。

```text
TrainActor
  ├─ Carriage_Head
  ├─ Carriage_Cargo
  ├─ Carriage_Weapon
  ├─ Carriage_Engine
  └─ Carriage_Defense
        ├─ Socket_Front
        ├─ Socket_Top
        └─ Socket_Back
```

每个模块必须是独立对象，不得直接写死在列车 Actor 里。

### 9.2 推荐类

```text
ADTTrainActor
ADTTrainCarriageBase
ADTBuildableModuleBase
UDTTrainSocketComponent
UDTTrainModuleManagerComponent
UDTTrainModuleDataAsset
```

### 9.3 模块类型

初期至少支持：

```text
Weapon       武器模块：机枪、火炮、电磁炮、喷火器
Defense      防御模块：装甲板、护盾、维修机器人
Economy      经济模块：回收仓、熔炉、仓库
Engine       动力模块：引擎、燃料炉、推进器
Utility      功能模块：雷达、幸运天线、广告空投信标
Decoration   外观模块：旗帜、灯牌、涂装
```

### 9.4 模块接口

模块必须支持：

```text
Install
Uninstall
Upgrade
GetPowerScore
GetStatModifiers
OnCombatStart
OnCombatTick
OnCombatEnd
OnStageStart
OnStageEnd
```

不得让模块只存在于 UI 或视觉层。

---

## 10. 开箱系统

### 10.1 开箱流程

```text
请求开箱
  ↓
检查钥匙 / 货币 / 免费次数
  ↓
读取宝箱数据
  ↓
生成掉落结果
  ↓
播放开箱动画
  ↓
展示奖励
  ↓
比较是否战力提升
  ↓
一键装备 / 分解 / 合成
  ↓
触发广告翻倍或额外开箱
```

### 10.2 开箱系统必须拆分

```text
UDTLootBoxSystem        开箱入口和流程控制
UDTLootGenerator        掉落生成
UDTRewardComponent      奖励发放
UDTInventoryComponent   背包接收
UDTLootBoxWidget        UI 展示
UDTAdServiceInterface   广告翻倍
```

### 10.3 掉落规则

掉落必须支持：

- 权重随机；
- 保底；
- 阶段解锁；
- 品质池；
- 职能池；
- 重复转化；
- 广告额外奖励；
- 活动池预留；
- 新手特殊池；
- 调试固定掉落。

---

## 11. 战斗系统

### 11.1 初期战斗形式

初期可以是轻量自动战斗。

```text
列车自动前进
  ↓
敌人从屏幕右侧 / 上方 / 废墟中出现
  ↓
武器模块自动攻击
  ↓
玩家点击技能 / 拾取补给 / 触发广告增益
  ↓
击败波次
  ↓
结算奖励
```

### 11.2 战斗实现原则

可以先做轻量实现，但必须保留扩展接口。

初期允许：

- 自动索敌；
- 简单碰撞；
- 血量组件；
- 攻击间隔；
- 波次刷怪；
- 数值结算。

必须预留：

- 敌人 AI；
- Boss 技能；
- 车厢部位受击；
- 武器弹道；
- 元素伤害；
- 状态效果；
- 关卡事件；
- 大地图迁移。

### 11.3 不允许

不得把战斗写成：

```text
UI 按钮点击 → 直接给金币 → 直接升级
```

即使是小游戏，也要保留战斗、奖励、成长之间的系统边界。

---

## 12. 阶段目标设计

阶段必须有明确目标，不得只是无限数值增长。

### 12.1 阶段分段

```text
Stage 1-10      破车求生期：快速换装备，频繁升级
Stage 11-30     稳定巡航期：解锁车厢，开始模块搭配
Stage 31-60     尸潮压力期：Boss、维修、燃料压力出现
Stage 61-100    堡垒成型期：多模块联动，广告收益更高
Stage 101+      无限远征期：排行榜、赛季、活动、皮肤
```

### 12.2 每阶段至少包含

```text
目标描述
敌人强度
奖励池
解锁内容
广告触发点
视觉变化
Boss 或特殊事件
卡点设计
```

---

## 13. 数值膨胀规则

### 13.1 数值体验目标

数值应让玩家感到“爽”，但不能完全失控。

推荐节奏：

```text
前 5 分钟：每 10-20 秒有一次明显提升
前 30 分钟：每 1-3 分钟解锁一个新东西
第 1 天：至少经历 3 次战力跃迁
第 3 天：开始出现构筑选择
第 7 天：开放长期系统或赛季目标
```

### 13.2 战力计算原则

战力可以夸张，但必须可解释。

```text
PowerScore = BaseStats
           + EquipmentPower
           + TrainModulePower
           + UpgradePower
           + CollectionBonus
           + TemporaryBuff
```

UI 可以展示简化战力，内部必须保留分项。

### 13.3 广告卡点

广告点必须自然出现：

```text
奖励结算后：看广告 ×2
失败复活时：看广告维修列车
免费宝箱后：看广告再开一次
升级差一点资源：看广告补齐
Boss 前：看广告获得临时火力支援
挂机回来：看广告领取离线收益 ×2
```

不得强制广告破坏核心体验。  
广告逻辑必须通过 `UDTAdServiceInterface` 或同等接口隔离。

---

## 14. 动画与表现规则

### 14.1 动画优先级

小游戏也必须做表现分层。

必须优先实现：

1. 开箱闪光；
2. 装备品质颜色；
3. 战力上涨飘字；
4. 列车震动；
5. 受击反馈；
6. 敌人死亡爆裂；
7. 车厢升级外观变化；
8. 广告奖励的空投 / 无线电 / 商人表现。

### 14.2 动画实现方式

根据资源情况选择：

```text
UI 动画：UMG Animation / Tween / Timeline
角色动画：Skeletal Mesh / Sprite Flipbook / PaperZD
列车动画：组件位移、震动、灯光、粒子、材质参数
攻击动画：Niagara、Projectile、Hit Flash、Camera Shake
开箱动画：Widget Animation + Niagara + Sound Cue
```

### 14.3 表现不得污染逻辑

动画完成后只能通过事件通知业务层。

推荐：

```text
PlayLootBoxAnimation(RewardData)
OnLootBoxAnimationFinished.Broadcast(RewardData)
```

禁止：

```text
动画蓝图内部直接给玩家发奖励
```

---

## 15. UI 规则

### 15.1 UI 只负责展示与输入

UI 可以：

- 展示数据；
- 播放动画；
- 接收点击；
- 发起请求；
- 监听事件；
- 显示结果。

UI 不可以：

- 计算掉落；
- 决定战斗胜负；
- 修改核心存档；
- 直接写广告逻辑；
- 硬编码经济数值。

### 15.2 UI 数据绑定

UI 必须通过 ViewModel / Presenter / Widget Controller 获取数据。

推荐：

```text
UDTMainHUDViewModel
UDTLootBoxViewModel
UDTTrainUpgradeViewModel
UDTRewardPopupViewModel
```

---

## 16. 存档规则

### 16.1 存档内容

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
```

### 16.2 存档原则

必须支持：

- 版本号；
- 默认值；
- 迁移；
- 兼容旧存档；
- 本地 Mock；
- 未来云存档预留。

不得把存档格式和 UI 绑定。

---

## 17. 平台与广告接口

### 17.1 广告服务接口

所有广告调用必须走接口。

```cpp
class IDTAdServiceInterface
{
public:
    virtual bool IsRewardedAdReady(FName PlacementId) const = 0;
    virtual void ShowRewardedAd(FName PlacementId, FOnAdRewardGranted Callback) = 0;
};
```

### 17.2 Placement 配置

广告位必须配置化。

```text
PlacementId
DisplayName
TriggerScene
RewardType
RewardMultiplier
DailyLimit
CooldownSeconds
FailFallbackReward
```

### 17.3 Mock 实现

开发环境必须有 MockAdService。  
不允许因为没有真实平台 SDK 就阻塞玩法开发。

---

## 18. AI Agent 工作流程

每次接到任务，Agent 必须按以下流程执行。

### 18.1 分析阶段

先回答自己：

```text
这个功能属于哪个层？
是否已有类似模块？
是否需要数据配置？
是否影响存档？
是否影响 UI？
是否影响动画？
是否影响广告？
是否需要测试？
```

### 18.2 实现阶段

必须按顺序：

```text
1. 修改或新增数据结构
2. 新增接口或组件
3. 实现核心逻辑
4. 接入 UI / 表现
5. 接入存档 / 事件
6. 增加测试或调试入口
7. 更新文档
```

不得先从 UI 开始硬写逻辑。

### 18.3 输出阶段

每次完成后必须说明：

```text
修改了哪些文件
新增了哪些系统
如何测试
有哪些后续 TODO
有没有技术债
有没有故意简化的地方
```

---

## 19. 代码质量硬约束

### 19.1 单文件限制

除数据表和生成内容外，普通代码文件应尽量控制：

```text
单个 .h 文件不超过 300 行
单个 .cpp 文件不超过 600 行
单个 Widget 不承载超过 1 个核心系统
单个 Actor 不承载超过 1 个主职责
```

超过时必须拆分。

### 19.2 函数限制

函数必须短小明确。

```text
单函数尽量不超过 80 行
复杂条件必须拆成命名函数
不得出现 5 层以上嵌套
不得出现大段复制粘贴
```

### 19.3 日志与调试

必须使用统一日志分类。

```cpp
UE_LOG(LogDoomTrainLoot, Log, TEXT("Generated reward: %s"), *RewardId.ToString());
```

禁止长期保留无意义打印：

```cpp
UE_LOG(LogTemp, Warning, TEXT("111"));
```

---

## 20. Blueprint 使用规则

### 20.1 蓝图适合做什么

Blueprint 可以负责：

- 视觉拼装；
- 动画事件；
- 简单交互；
- 调试面板；
- 资源引用；
- 特效播放；
- 关卡摆放。

### 20.2 蓝图不适合做什么

Blueprint 不应承载：

- 核心掉落算法；
- 战斗主循环；
- 存档格式；
- 复杂经济系统；
- 广告平台适配；
- 大量数值计算。

### 20.3 C++ 与 BP 分工

```text
C++：规则、数据、系统、接口、存档、复杂逻辑
BP：表现、资源、组合、动画、调参、关卡实例
```

---

## 21. 测试与验证

### 21.1 必须提供调试入口

每个核心系统必须能单独测试。

```text
开箱测试：固定宝箱 ID，连续开 100 次，输出品质分布
战斗测试：指定敌人和模块，模拟 60 秒 DPS
经济测试：模拟玩家前 30 分钟资源增长
广告测试：Mock 广告成功 / 失败 / 取消
存档测试：保存、读取、版本迁移
```

### 21.2 数值模拟

当任务涉及数值曲线时，Agent 应优先生成模拟脚本或测试函数。

推荐输出：

```text
每分钟战力
每阶段平均升级耗时
广告触发频率
宝箱品质分布
玩家卡点位置
资源缺口
```

---

## 22. 文档规则

项目必须维护以下文档。

```text
/Docs
  DESIGN_CORE_LOOP.md          核心循环
  DESIGN_TRAIN_MODULES.md      列车模块
  DESIGN_LOOT_SYSTEM.md        开箱系统
  DESIGN_NUMERIC_CURVES.md     数值曲线
  DESIGN_AD_PLACEMENTS.md      广告点
  DESIGN_ANIMATION_GUIDE.md    动画表现
  TECH_ARCHITECTURE.md         技术架构
  TODO_ROADMAP.md              路线图
  CHANGELOG.md                 修改记录
```

每次大功能修改后，必须同步更新相关文档。

---

## 23. 禁止行为清单

Agent 严禁：

```text
为了省事写 GodManager
为了跑通直接硬编码奖励
为了 UI 方便直接改玩家存档
为了动画方便直接发奖励
为了广告方便把 SDK 写进玩法层
为了测试方便污染正式代码
为了省文件把所有类写一起
为了换皮方便复制一份完整项目
为了数值方便只堆指数不做分段
为了快把 TODO 当成最终实现
```

如果必须临时这样做，必须：

1. 标记为 `TEMP_PROTOTYPE`；
2. 写明原因；
3. 写明替换方案；
4. 加入 TODO；
5. 不得把临时代码当最终代码。

---

## 24. 允许的临时简化

原型阶段允许：

```text
使用 Mock 广告
使用占位模型
使用简单敌人 AI
使用数据表代替后台配置
使用本地存档
使用简化战斗公式
使用假排行榜
使用调试按钮触发开箱
```

但必须保留正式接口。

---

## 25. 版本路线图

### 25.1 Prototype 版本

目标：跑通核心闭环。

必须包含：

```text
列车显示
简单敌人
自动战斗
开箱
装备
战力变化
升级
广告 Mock
本地存档
基础 UI
```

### 25.2 Vertical Slice 版本

目标：形成可展示的一小段完整体验。

必须包含：

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

### 25.3 Soft Launch 版本

目标：可投放测试。

必须包含：

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

### 25.4 Scalable 版本

目标：可多次换皮和长期扩展。

必须包含：

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

## 26. Agent 任务模板

当用户要求“实现某功能”时，Agent 应按此模板理解任务。

```text
任务名称：
所属系统：
目标体验：
涉及数据：
涉及类：
涉及 UI：
涉及动画：
涉及存档：
涉及广告：
测试方式：
后续扩展点：
```

不得只输出代码，不解释架构影响。

---

## 27. 示例：新增一个“火炮车厢模块”

Agent 不应该只创建一个 BP。  
正确做法：

```text
1. 新增 DA_Module_Cannon_Lv01
2. 在 TrainModuleType 中确认 Weapon 类型
3. 使用 ADTBuildableModuleBase 或其子类
4. 添加 FireInterval / Damage / Range 等数据字段
5. 接入 UDTTrainModuleManagerComponent
6. 接入战斗事件 OnCombatTick
7. 接入 UI 展示
8. 接入升级消耗表
9. 添加测试地图或调试命令
10. 更新 DESIGN_TRAIN_MODULES.md
```

---

## 28. 示例：新增一个宝箱

正确做法：

```text
1. 新增 LootBox DataAsset
2. 配置掉落池
3. 配置保底规则
4. 配置广告额外奖励
5. 配置开箱动画主题
6. 通过 UDTLootBoxSystem 注册
7. UI 只读取展示数据
8. DTLootGenerator 负责生成结果
9. RewardComponent 负责发放奖励
10. 写 1000 次模拟测试验证概率
```

---

## 29. 示例：新增广告翻倍奖励

正确做法：

```text
1. 新增 AdPlacement 配置
2. 通过 UDTAdServiceInterface 请求广告
3. Mock 环境直接返回成功或模拟失败
4. 广告成功后发放额外奖励
5. 广告失败时不破坏原奖励
6. 记录每日次数
7. UI 显示自然包装文案
8. 更新 DESIGN_AD_PLACEMENTS.md
```

---

## 30. 代码生成输出要求

Agent 每次生成代码时，必须尽量提供完整文件，而不是零碎片段。  
如果改动较大，应分批提交：

```text
Batch 1: 数据结构和接口
Batch 2: 核心系统
Batch 3: UI 与表现
Batch 4: 测试与文档
```

最终回复必须包含：

```text
完成内容
修改文件
测试方法
风险点
下一步建议
```

---

## 31. 对 Codex 的特别要求

Codex 执行任务时必须：

1. 先读取 `AGENTS.md`；
2. 先搜索是否已有相关系统；
3. 不重复造同名系统；
4. 不擅自删除用户文件；
5. 不大规模重构无关文件；
6. 修改前后保持项目可编译；
7. 所有新增类必须符合命名规范；
8. 所有核心逻辑必须有注释说明意图；
9. 所有临时实现必须标记；
10. 每次完成后更新 TODO 或文档。

---

## 32. 最终判断标准

一个功能只有满足以下条件，才算完成：

```text
功能能跑
结构清晰
数据可调
表现可换
逻辑可测
存档不乱
广告隔离
UI 不越权
未来能扩展
文档有记录
```

如果只是“看起来能用”，但未来无法维护，不算完成。

---

## 33. 项目精神

本项目不是为了做一个一次性小游戏 demo。  
它是一个可以反复换皮、快速投放、积累系统资产，并逐步过渡到 UE5 末日列车大游戏的底层实验场。

每一行代码都应该服务于：

```text
爽感
留存
广告变现
可扩展
可换皮
可维护
可迁移
```

不要写玩具工程。  
不要写临时屎山。  
不要把未来堵死。

