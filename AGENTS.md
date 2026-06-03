# AGENTS.md

This file constrains Codex / Claude Code / Cursor Agent / other code-generation agents when working on this project.

Chinese maintained version: `AGENTS.zh-CN.md`. Keep both files synchronized when rules change.

The goal is not to write a demo. The goal is to generate a mature mini-game project that can be expanded long-term, reskinned, tuned through data, connected to ads, and gradually merged into a larger UE5 game world.

---

## 0. One-Sentence Project Positioning

This project is a **2.5D lightweight satisfying loot-box / idle-growth / modular train-building mini-game with an apocalyptic train theme**.

It targets Douyin mini-games:

- The core gameplay is simple, feedback is strong, and ad placements feel natural.
- The underlying framework can be reskinned repeatedly.
- Values, stages, drops, equipment, ads, and train modules are fully data-driven.
- Do not create an unmaintainable mess just to make a quick demo.

---

## 1. General Agent Principles

All AI code agents must follow these principles.

### 1.1 Read the Project Before Writing Code

Before making any change, first inspect:

- Current directory structure.
- Key README / AGENTS / DESIGN / TODO files.
- Existing module naming.
- Existing data tables, configuration files, and asset directories.
- Existing code style.

Do not blindly create many files without understanding the existing structure.

### 1.2 Do Not Write One-Off Demo Code

Unless the task explicitly asks for a temporary validation, never:

- Put all logic into one Actor / Blueprint / Manager.
- Use large amounts of hard-coded values.
- Write business logic directly inside UI.
- Handle ads, drops, saves, or growth directly in character classes.
- Copy-paste repeated logic.
- Bypass architecture just to make a feature run.

### 1.3 Interface First, Implementation Second

Anything that may later change theme, gameplay, platform, or balance must be isolated through interfaces or a data layer.

Always prioritize:

- DataAsset / DataTable / JSON configuration.
- Interface.
- Component.
- Subsystem.
- Event / Delegate.
- Clear Base Class.
- Replaceable implementation.

### 1.4 Generated Content Must Remain Extensible

When implementing any new feature, consider:

- Will new train carriages be added later?
- Will new equipment rarities be added later?
- Could the theme be changed to cultivation, cyberpunk, workplace, pirates, magic, or something else?
- Will ads, payment, events, or seasons be integrated later?
- Could this migrate into a larger UE5 3D project later?

If the answer is "possibly", do not hard-code it.

---

## 2. Core Experience

### 2.1 Player Fantasy

The player controls a train constantly moving through an apocalyptic wasteland.

The train is the base, the weapon, and the carrier of character growth.

Through:

- Opening boxes.
- Scavenging junk.
- Repelling zombie hordes / monsters / raiders.
- Upgrading carriages.
- Unlocking modules.
- Combining equipment.
- Watching ads to double rewards.

The player turns a broken train into a mobile apocalypse fortress.

### 2.2 Target Satisfying Moments

When generating gameplay, agents must design around these satisfying moments:

1. **Power surges**: Numbers jump quickly and equipment is replaced often.
2. **Loot-box anticipation**: Every box opening has color, sound, flash, affixes, and power changes.
3. **Low cognitive load decisions**: The player mainly taps "equip / upgrade / combine / watch ad to double".
4. **Phased pressure**: Zombie hordes, fuel shortage, carriage damage, and approaching bosses.
5. **Comeback contrast**: From scrap junk to steel beast.
6. **Light story, strong atmosphere**: Worldbuilding appears through short lines, events, and item descriptions, not long exposition.
7. **Ads feel natural**: Ads must be framed as supply airdrops / mysterious merchants / emergency repairs / double loot.

---

## 3. Core Gameplay Loop

All features should serve this loop.

```text
Enter stage / idle cruise
        ↓
Encounter event / enemy / chest / ruin
        ↓
Combat or automatic settlement
        ↓
Gain resources / equipment / module fragments
        ↓
Open boxes / combine / upgrade / equip
        ↓
Power increases / train strengthens / appearance changes
        ↓
Challenge higher stages / unlock new carriages / new systems
        ↓
Progression bottleneck appears
        ↓
Ad doubling / temporary buffs / continued growth
```

Any new system that cannot fit into this loop must be added cautiously.

---

## 4. Architecture Overview

The project must be organized by these layers.

```text
Presentation Layer    UI, animation, audio, VFX, camera, floating text
Gameplay Layer        Combat, loot boxes, train modules, enemies, events
Progression Layer     Levels, equipment, resources, unlocks, stage goals
Data Layer            DataAsset, DataTable, configuration, numeric curves
Platform Layer        Ads, saves, login, analytics, payment reservation
Core Layer            Event bus, utilities, common components, interfaces
```

Presentation Layer must not directly modify Data Layer.

UI must not directly decide drops, combat, or ad rewards.

Platform Layer must not pollute gameplay core in reverse.

---

## 5. Recommended Directory Structure

### 5.1 UE5 Project Structure

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

### 5.2 Content Structure

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

## 6. Naming Conventions

### 6.1 C++ Naming

| Type | Prefix | Example |
|---|---:|---|
| Actor | A | `ADTTrainActor` |
| UObject | U | `UDTLootGenerator` |
| Component | U | `UDTHealthComponent` |
| Interface | I / U | `IDTRewardSourceInterface` |
| Struct | F | `FDTRewardEntry` |
| Enum | E | `EDTEquipmentRarity` |
| Widget | U | `UDTLootBoxWidget` |

### 6.2 Blueprint Naming

| Type | Prefix | Example |
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

## 7. Data-Driven Rules

### 7.1 Content That Must Not Be Hard-Coded

The following must not be hard-coded:

- Equipment names.
- Equipment rarities.
- Drop probabilities.
- Enemy HP.
- Enemy attack.
- Stage waves.
- Stage goals.
- Ad reward multipliers.
- Chest prices.
- Upgrade costs.
- Train module unlock conditions.
- Skin/theme text.
- UI display copy.

These must live in:

- DataAsset.
- DataTable.
- JSON.
- CSV.
- Hot-updateable configuration.
- Balance sheets.

### 7.2 Core Data Types

The following data assets must be reserved.

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

### 7.3 Numeric Tables Must Be Layered

Numeric configuration must be split at least into:

```text
BaseCurve      Base curve: levels, stages, enemy strength
EconomyCurve   Economy curve: coins, materials, fuel, upgrade costs
DropCurve      Drop curve: rarity probabilities, equipment pools, chest returns
AdCurve        Ad curve: ad reward multipliers, daily limits, trigger timing
StageCurve     Stage curve: chapter goals, bosses, bottleneck design
```

Do not put all values into one table.

---

## 8. Reskin Framework

The underlying project must be reskinnable into other themes.

### 8.1 Theme / Skin Data

Use Theme / Skin configuration to isolate presentation.

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

Future replacement example:

```text
ThemeId: Cultivation
CoreVehicleName: 洞府
CurrencyName: 灵石
LootBoxName: 机缘宝匣
EnemyGroupName: 妖潮
AdRewardName: 天降机缘
```

Therefore, code must not directly write fixed copy such as "train", "zombie horde", or "supply box".

Read such text from Theme configuration.

### 8.2 Reskin Boundaries

Reskinnable content:

- Names.
- Copy.
- UI skins.
- Character models.
- Enemy models.
- Equipment icons.
- Resource names.
- Audio.
- VFX.
- Story event text.

Core systems that should not be casually reskinned:

- Growth curves.
- Loot-box pacing.
- Ad pacing.
- Reward settlement.
- Train module system abstraction.
- Combat settlement interfaces.

---

## 9. Train Module System

### 9.1 Core Abstraction

The train consists of multiple carriages and modules.

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

Each module must be an independent object and must not be hard-coded directly into the Train Actor.

### 9.2 Recommended Classes

```text
ADTTrainActor
ADTTrainCarriageBase
ADTBuildableModuleBase
UDTTrainSocketComponent
UDTTrainModuleManagerComponent
UDTTrainModuleDataAsset
```

### 9.3 Module Types

Initially support at least:

```text
Weapon       Weapon modules: machine gun, cannon, railgun, flamethrower
Defense      Defense modules: armor plate, shield, repair bot
Economy      Economy modules: recycler, furnace, warehouse
Engine       Engine modules: engine, fuel furnace, thruster
Utility      Utility modules: radar, lucky antenna, ad airdrop beacon
Decoration   Cosmetic modules: flags, signs, paint jobs
```

### 9.4 Module Interface

Modules must support:

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

Modules must not exist only in the UI or visual layer.

---

## 10. Loot-Box System

### 10.1 Loot-Box Flow

```text
Request box opening
  ↓
Check keys / currency / free attempts
  ↓
Read loot-box data
  ↓
Generate drop results
  ↓
Play opening animation
  ↓
Show rewards
  ↓
Compare power improvement
  ↓
One-tap equip / dismantle / combine
  ↓
Trigger ad doubling or extra box opening
```

### 10.2 Loot-Box System Must Be Split

```text
UDTLootBoxSystem        Entry point and flow control
UDTLootGenerator        Drop generation
UDTRewardComponent      Reward granting
UDTInventoryComponent   Inventory receiving
UDTLootBoxWidget        UI display
UDTAdServiceInterface   Ad doubling
```

### 10.3 Drop Rules

Drops must support:

- Weighted random.
- Pity / guarantee.
- Stage unlock.
- Rarity pools.
- Role/function pools.
- Duplicate conversion.
- Extra ad rewards.
- Reserved event pools.
- Special beginner pools.
- Debug fixed drops.

---

## 11. Combat System

### 11.1 Initial Combat Form

The initial version can use lightweight auto combat.

```text
Train moves forward automatically
  ↓
Enemies appear from the right / above / ruins
  ↓
Weapon modules attack automatically
  ↓
Player taps skills / picks supplies / triggers ad buffs
  ↓
Wave defeated
  ↓
Rewards settle
```

### 11.2 Combat Implementation Principles

The initial implementation may be lightweight, but extension interfaces must remain.

Initially allowed:

- Auto targeting.
- Simple collision.
- Health components.
- Attack intervals.
- Wave spawning.
- Numeric settlement.

Must reserve:

- Enemy AI.
- Boss skills.
- Carriage part damage.
- Weapon projectiles.
- Elemental damage.
- Status effects.
- Stage events.
- World-map migration.

### 11.3 Not Allowed

Do not implement combat as:

```text
UI button click → directly grant coins → directly upgrade
```

Even as a mini-game, system boundaries among combat, rewards, and growth must be preserved.

---

## 12. Stage Goal Design

Stages must have clear goals, not just infinite numeric growth.

### 12.1 Stage Segments

```text
Stage 1-10      Broken-train survival: fast equipment replacement and frequent upgrades
Stage 11-30     Stable cruise: unlock carriages and start module combinations
Stage 31-60     Horde pressure: bosses, repairs, and fuel pressure appear
Stage 61-100    Fortress formation: multi-module synergy and stronger ad rewards
Stage 101+      Endless expedition: leaderboard, seasons, events, skins
```

### 12.2 Each Stage Must Include At Least

```text
Goal description
Enemy strength
Reward pool
Unlock content
Ad trigger points
Visual changes
Boss or special event
Bottleneck design
```

---

## 13. Numeric Inflation Rules

### 13.1 Numeric Experience Goal

Values should feel satisfying without becoming completely uncontrolled.

Recommended pacing:

```text
First 5 minutes: one clear improvement every 10-20 seconds
First 30 minutes: unlock something new every 1-3 minutes
Day 1: at least 3 major power jumps
Day 3: build choices start appearing
Day 7: long-term systems or season goals open
```

### 13.2 Power Calculation Principles

Power can be exaggerated, but must remain explainable.

```text
PowerScore = BaseStats
           + EquipmentPower
           + TrainModulePower
           + UpgradePower
           + CollectionBonus
           + TemporaryBuff
```

UI may show simplified power, but internals must preserve the components.

### 13.3 Ad Bottlenecks

Ad points must appear naturally:

```text
After reward settlement: watch ad ×2
On failure revive: watch ad to repair train
After free box: watch ad to open one more
Almost enough resources for upgrade: watch ad to fill the gap
Before boss: watch ad for temporary fire support
Returning from idle: watch ad to claim offline income ×2
```

Do not force ads in a way that breaks the core experience.

Ad logic must be isolated through `UDTAdServiceInterface` or an equivalent interface.

---

## 14. Animation and Presentation Rules

### 14.1 Animation Priority

Even a mini-game must have layered presentation.

Prioritize:

1. Loot-box flash.
2. Equipment rarity colors.
3. Power-increase floating text.
4. Train shake.
5. Hit feedback.
6. Enemy death burst.
7. Carriage upgrade visual changes.
8. Ad reward presentation as airdrop / radio / merchant.

### 14.2 Animation Implementation

Choose based on available assets:

```text
UI animation: UMG Animation / Tween / Timeline
Character animation: Skeletal Mesh / Sprite Flipbook / PaperZD
Train animation: component movement, shake, lights, particles, material parameters
Attack animation: Niagara, Projectile, Hit Flash, Camera Shake
Loot-box animation: Widget Animation + Niagara + Sound Cue
```

### 14.3 Presentation Must Not Pollute Logic

After animation finishes, it may only notify the business layer through events.

Recommended:

```text
PlayLootBoxAnimation(RewardData)
OnLootBoxAnimationFinished.Broadcast(RewardData)
```

Forbidden:

```text
Animation blueprint directly grants rewards to the player
```

---

## 15. UI Rules

### 15.1 UI Only Handles Display and Input

UI may:

- Display data.
- Play animation.
- Receive clicks.
- Send requests.
- Listen to events.
- Show results.

UI must not:

- Calculate drops.
- Decide combat outcomes.
- Modify core saves directly.
- Write ad logic directly.
- Hard-code economy values.

### 15.2 UI Data Binding

UI must get data through ViewModel / Presenter / Widget Controller.

Recommended:

```text
UDTMainHUDViewModel
UDTLootBoxViewModel
UDTTrainUpgradeViewModel
UDTRewardPopupViewModel
```

---

## 16. Save Rules

### 16.1 Save Contents

At least save:

```text
Player level
Current stage
Current resources
Train module state
Equipment inventory
Unlocked systems
Ad count records
Offline income timestamp
Tutorial progress
Selected theme skin
```

### 16.2 Save Principles

Must support:

- Version number.
- Default values.
- Migration.
- Backward compatibility.
- Local mock.
- Reserved future cloud-save support.

Do not bind save format to UI.

---

## 17. Platform and Ad Interfaces

### 17.1 Ad Service Interface

All ad calls must go through an interface.

```cpp
class IDTAdServiceInterface
{
public:
    virtual bool IsRewardedAdReady(FName PlacementId) const = 0;
    virtual void ShowRewardedAd(FName PlacementId, FOnAdRewardGranted Callback) = 0;
};
```

### 17.2 Placement Configuration

Ad placements must be configurable.

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

### 17.3 Mock Implementation

Development must have a MockAdService.

Do not block gameplay development just because the real platform SDK is unavailable.

---

## 18. AI Agent Workflow

For every task, the agent must follow this workflow.

### 18.1 Analysis Stage

First answer internally:

```text
Which layer does this feature belong to?
Is there an existing similar module?
Does it need data configuration?
Does it affect saves?
Does it affect UI?
Does it affect animation?
Does it affect ads?
Does it need tests?
```

### 18.2 Implementation Stage

Proceed in order:

```text
1. Modify or add data structures
2. Add interfaces or components
3. Implement core logic
4. Connect UI / presentation
5. Connect saves / events
6. Add tests or debug entry points
7. Update documentation
```

Do not start by hard-coding logic in UI.

### 18.3 Output Stage

After every completion, explain:

```text
Which files changed
Which systems were added
How to test
Follow-up TODOs
Any technical debt
Any intentional simplifications
```

---

## 19. Code Quality Hard Constraints

### 19.1 Single-File Limits

Except for data tables and generated content, ordinary code files should generally stay within:

```text
Single .h file: no more than 300 lines
Single .cpp file: no more than 600 lines
Single Widget: must not own more than 1 core system
Single Actor: must not own more than 1 primary responsibility
```

Split files when limits are exceeded.

### 19.2 Function Limits

Functions must be short and clear.

```text
Single function should generally stay under 80 lines
Complex conditions must be split into named functions
No nesting deeper than 5 levels
No large copy-pasted blocks
```

### 19.3 Logging and Debugging

Use unified log categories.

```cpp
UE_LOG(LogDoomTrainLoot, Log, TEXT("Generated reward: %s"), *RewardId.ToString());
```

Do not keep meaningless logs long-term:

```cpp
UE_LOG(LogTemp, Warning, TEXT("111"));
```

---

## 20. Blueprint Usage Rules

### 20.1 What Blueprint Is Good For

Blueprint may handle:

- Visual assembly.
- Animation events.
- Simple interactions.
- Debug panels.
- Asset references.
- VFX playback.
- Level placement.

### 20.2 What Blueprint Should Not Own

Blueprint should not own:

- Core drop algorithms.
- Main combat loop.
- Save format.
- Complex economy systems.
- Ad platform adaptation.
- Heavy numeric calculation.

### 20.3 C++ and BP Responsibilities

```text
C++: rules, data, systems, interfaces, saves, complex logic
BP: presentation, assets, composition, animation, tuning, level instances
```

---

## 21. Testing and Verification

### 21.1 Debug Entry Points Required

Every core system must be testable independently.

```text
Loot-box test: fixed box ID, open 100 times, output rarity distribution
Combat test: specified enemies and modules, simulate 60 seconds of DPS
Economy test: simulate player resource growth for first 30 minutes
Ad test: mock ad success / failure / cancellation
Save test: save, load, version migration
```

### 21.2 Numeric Simulation

When a task involves numeric curves, the agent should prioritize generating simulation scripts or test functions.

Recommended output:

```text
Power per minute
Average upgrade time per stage
Ad trigger frequency
Loot-box rarity distribution
Player bottleneck positions
Resource gaps
```

---

## 22. Documentation Rules

The project must maintain these documents.

```text
/Docs
  DESIGN_CORE_LOOP.md          Core loop
  DESIGN_TRAIN_MODULES.md      Train modules
  DESIGN_LOOT_SYSTEM.md        Loot-box system
  DESIGN_NUMERIC_CURVES.md     Numeric curves
  DESIGN_AD_PLACEMENTS.md      Ad placements
  DESIGN_ANIMATION_GUIDE.md    Animation presentation
  TECH_ARCHITECTURE.md         Technical architecture
  TODO_ROADMAP.md              Roadmap
  CHANGELOG.md                 Change log
```

After every major feature change, update the related documents.

---

## 23. Forbidden Behaviors

Agents must never:

```text
Write a GodManager for convenience
Hard-code rewards just to make things run
Modify player saves directly for UI convenience
Grant rewards directly from animation for convenience
Put SDK code into the gameplay layer for ad convenience
Pollute production code for testing convenience
Put all classes together to reduce files
Copy an entire project for reskinning convenience
Only stack exponentials without staged design for values
Treat TODO as final implementation for speed
```

If this must be done temporarily:

1. Mark it as `TEMP_PROTOTYPE`.
2. Explain why.
3. Explain the replacement plan.
4. Add it to TODO.
5. Do not treat temporary code as final code.

---

## 24. Allowed Temporary Simplifications

During prototype stage, it is acceptable to:

```text
Use mock ads
Use placeholder models
Use simple enemy AI
Use data tables instead of backend configuration
Use local saves
Use simplified combat formulas
Use fake leaderboards
Use debug buttons to trigger loot boxes
```

But formal interfaces must remain.

---

## 25. Version Roadmap

### 25.1 Prototype Version

Goal: complete the core loop.

Must include:

```text
Train display
Simple enemies
Auto combat
Loot boxes
Equipment
Power changes
Upgrades
Mock ads
Local saves
Basic UI
```

### 25.2 Vertical Slice Version

Goal: produce a complete short experience that can be shown.

Must include:

```text
3-5 enemy types
1 Boss
5-10 equipment items
3 rarities
3 train modules
Complete loot-box animation
Complete reward settlement
Ad doubling
Stage goals
Failure and revive
```

### 25.3 Soft Launch Version

Goal: ready for acquisition testing.

Must include:

```text
First 30-60 minutes of numeric curves
Retention point design
Complete ad placements
Analytics
Performance optimization
Tutorial
Offline income
Daily rewards
Basic events
```

### 25.4 Scalable Version

Goal: support repeated reskinning and long-term expansion.

Must include:

```text
Theme configuration
Skin asset packages
Event configuration
Season configuration
Reserved remote configuration
Multiple equipment pools
Multiple chapters
Multiple ad strategies
Data simulation tools
```

---

## 26. Agent Task Template

When the user asks to "implement a feature", the agent should interpret the task through this template.

```text
Task name:
System:
Target experience:
Related data:
Related classes:
Related UI:
Related animation:
Related save data:
Related ads:
Test method:
Future extension points:
```

Do not only output code without explaining architectural impact.

---

## 27. Example: Add a Cannon Carriage Module

The agent should not only create one BP.

Correct approach:

```text
1. Add DA_Module_Cannon_Lv01
2. Confirm Weapon type in TrainModuleType
3. Use ADTBuildableModuleBase or a subclass
4. Add data fields such as FireInterval / Damage / Range
5. Connect UDTTrainModuleManagerComponent
6. Connect combat event OnCombatTick
7. Connect UI display
8. Connect upgrade cost table
9. Add test map or debug command
10. Update DESIGN_TRAIN_MODULES.md
```

---

## 28. Example: Add a Loot Box

Correct approach:

```text
1. Add LootBox DataAsset
2. Configure drop pool
3. Configure pity rules
4. Configure extra ad rewards
5. Configure opening animation theme
6. Register through UDTLootBoxSystem
7. UI only reads display data
8. DTLootGenerator generates results
9. RewardComponent grants rewards
10. Run 1000 simulations to verify probabilities
```

---

## 29. Example: Add Ad Double Rewards

Correct approach:

```text
1. Add AdPlacement configuration
2. Request ads through UDTAdServiceInterface
3. In mock environment, return success directly or simulate failure
4. Grant extra reward after ad success
5. Do not break original reward when ad fails
6. Record daily counts
7. UI displays naturally themed copy
8. Update DESIGN_AD_PLACEMENTS.md
```

---

## 30. Code Generation Output Requirements

When generating code, agents should provide complete files whenever possible, not scattered fragments.

For larger changes, split into batches:

```text
Batch 1: Data structures and interfaces
Batch 2: Core systems
Batch 3: UI and presentation
Batch 4: Tests and documentation
```

Final replies must include:

```text
Completed work
Modified files
Test method
Risks
Suggested next steps
```

---

## 31. Special Requirements for Codex

When executing tasks, Codex must:

1. Read `AGENTS.md` first.
2. Search for existing related systems first.
3. Avoid creating duplicate systems with the same name.
4. Never delete user files without permission.
5. Avoid large unrelated refactors.
6. Keep the project compilable before and after changes.
7. Ensure all new classes follow naming conventions.
8. Add comments explaining the intent of all core logic.
9. Mark all temporary implementations.
10. Update TODO or documentation after each completion.

---

## 32. Final Completion Criteria

A feature is complete only if it satisfies:

```text
Feature runs
Structure is clear
Data is tunable
Presentation is replaceable
Logic is testable
Saves stay clean
Ads are isolated
UI does not overreach
Future expansion is possible
Documentation is recorded
```

If it only "looks usable" but cannot be maintained later, it is not complete.

---

## 33. Project Spirit

This project is not a disposable mini-game demo.

It is an underlying experiment field for repeated reskinning, fast launch testing, accumulating reusable system assets, and gradually transitioning into a larger UE5 apocalyptic train game.

Every line of code should serve:

```text
Satisfying feel
Retention
Ad monetization
Extensibility
Reskinning
Maintainability
Migration
```

Do not write a toy project.

Do not write temporary messy architecture.

Do not block the future.
