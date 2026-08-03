# Project Generation Rules

This file defines the project-level rules Codex must follow when working in this repository.

Corresponding Chinese version: `AGENTS.zh-CN.md`. Keep both files synchronized when rules change.

## Project

- English name: Ashrail Exodus Train
- Chinese name: 烬轨：流亡列车

## Generation Rules

- All code, content, design, and assets generated in this repository must follow this file.
- After the project structure is established, prioritize consistency with existing files, naming, and style.
- Generated content must fit the project title, overall atmosphere, and worldbuilding direction.
- Do not overwrite user-authored content unless the user explicitly asks for it.
- New rules should be specific, checkable, and easy to execute.

# AGENTS.md

> This file constrains Codex / Claude Code / Cursor Agent / other code-generation agents when working on this project.
> The goal is not to "write a demo", but to generate a mature mini-game project that can be expanded long-term, reskinned, tuned through data, connected to ads, and gradually merged into a larger UE5 game world.

---

## 0. One-Sentence Project Positioning

This project is a **2.5D lightweight satisfying loot-box / idle-growth / modular train-building mini-game with an apocalyptic train theme**.

It targets Douyin mini-games:

- The core gameplay is simple, feedback is strong, and ad placements feel natural.
- The underlying framework can be reskinned repeatedly.
- Values, stages, drops, equipment, ads, and train modules are fully data-driven.
- Do not create an unmaintainable mess just to make a quick demo.

---

## 1. Project Positioning

Project name: 烬轨：流亡列车
English name: Ashrail Exodus Train

Project type:

```text
Douyin mini-game
2.5D lightweight auto combat
Loot-box growth
Idle rewards
Modular train development
Ad monetization
Data-driven reskin framework
```

Initial launch target:

```text
Quickly complete the core loop
Adapt to the Douyin mini-game runtime environment
Keep package size, loading, frame rate, ads, and saves stable
Avoid one-off demo architecture
Reserve future capacity for reskins, events, seasons, and long-term expansion
```

---

## 2. Current Technical Architecture

### 2.1 Default Tech Stack

```text
Cocos Creator 3.8 LTS
TypeScript
Douyin mini-game build target
Canvas / WebGL rendering
JSON / CSV / TS Config data-driven setup
Platform capabilities isolated through Service layer
```

### 2.2 Platform Capabilities

All Douyin platform capabilities must be wrapped through interfaces. They must not be called directly from gameplay systems, UI components, or data models.

Platform capabilities include:

```text
Ads
Login
User information
Saves
Sharing
Payment reservation
Analytics
Leaderboard reservation
Vibration
Network status
Version information
```

### 2.3 Project Boundaries

The main project should only generate code, assets, configuration, and documentation required by the current tech stack.

Do not generate unrelated client main-project directories, runtime structures, asset organization schemes, or platform-specific implementations that do not belong to the current tech stack.

---

## 3. Core Gameplay Loop

All systems must serve this loop:

```text
Enter cruise / stage
        ↓
Encounter enemy / event / chest / ruin
        ↓
Auto combat or light-interaction settlement
        ↓
Gain resources / equipment / module fragments
        ↓
Open boxes / combine / upgrade / equip
        ↓
Power increases / train strengthens / appearance changes
        ↓
Challenge higher phases / unlock new carriages / new systems
        ↓
Resource bottleneck or combat pressure appears
        ↓
Ad doubling / temporary buff / offline rewards / continued growth
```

If a new system cannot enter this loop, it must not be prioritized.

---

## 4. Directory Structure

### 4.1 Recommended Directory

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

### 4.2 `src` Layers

```text
app             Startup, global initialization, scene composition
core            Event bus, lifecycle, logging, utilities, base containers
data            Config loading, schema validation, data repositories, remote config reservation
domain          Pure business models: player, resources, equipment, train, stages, rewards
gameplay        Gameplay systems: combat, loot boxes, upgrades, stages, events, offline rewards
presentation    UI, animation, floating text, audio, camera, presentation control
platform        Ads, saves, login, sharing, analytics, platform API adapters
shared          Common types, constants, enums, error codes
tools           Numeric simulation, config validation, package checks, debug tools
```

### 4.3 Directory Hard Constraints

The following directories or names are forbidden:

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

Before adding a file, first determine which layer it belongs to. If the ownership is unclear, add or update design documentation first instead of creating a random directory.

---

## 5. Naming Conventions

### 5.1 TypeScript File Naming

```text
PascalCase.ts       Classes, systems, services, controllers
camelCase.ts        Pure utility functions
*.types.ts          Type definitions
*.schema.ts         Config schemas
*.config.ts         Static config entry points
*.constants.ts      Constants
*.events.ts         Event definitions
*.test.ts           Tests
*.sim.ts            Simulation scripts
```

Examples:

```text
TrainModuleSystem.ts
LootBoxSystem.ts
RewardService.ts
AdService.types.ts
LootBox.schema.ts
StageBalance.config.ts
combatPower.sim.ts
```

### 5.2 Class and Interface Naming

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

### 5.3 ID Naming

All business IDs must use stable strings. Do not use display text as IDs.

```text
module_cannon_basic_001
lootbox_supply_common
stage_chapter_01_005
equipment_rifle_rusty_001
ad_reward_stage_clear_double
theme_doom_train
```

---

## 6. Declare First, Implement Second

### 6.1 TypeScript Rules

Before implementing any core system, first create:

```text
Type definitions
Interface definitions
Config schema
Event definitions
Input/output structures
Error codes
```

Recommended order:

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

Do not start business logic directly from a UI button.

### 6.2 C++ / Native Module Rules

If C++, native extensions, or a separate large project are added later, they must follow:

```text
Write .h / .hpp first
Then write .cpp
Define interfaces and data structures first
Then write concrete implementations
```

Do not pile up implementation files first and backfill interfaces afterward.

---

## 7. Layered Dependency Rules

### 7.1 Allowed Dependency Direction

```text
presentation → gameplay → domain
presentation → platform interface
app → all layers for composition only
gameplay → data / domain / platform interface
platform implementation → platform interface
```

### 7.2 Forbidden Dependency Direction

```text
domain must not depend on UI
domain must not depend on platform APIs
gameplay must not directly call tt APIs
UI must not directly modify saves
UI must not directly calculate drops
UI must not directly decide combat outcomes
Ad implementation must not pollute gameplay layer
Presentation animation must not directly grant rewards
```

### 7.3 Event Communication

Cross-system communication should prefer events or explicit Service calls.

Recommended:

```text
RewardGrantedEvent
PowerChangedEvent
LootBoxOpenedEvent
AdRewardCompletedEvent
StageClearedEvent
TrainModuleUpgradedEvent
```

Do not import concrete implementation classes everywhere and create circular dependencies.

---

## 8. Data-Driven Rules

### 8.1 No Hard-Coding

The following content must not be hard-coded:

```text
Equipment names
Equipment rarities
Drop probabilities
Enemy HP
Enemy attack
Stage waves
Stage goals
Ad reward multipliers
Chest prices
Upgrade costs
Train carriage/module unlock conditions
Skin/theme text
UI display copy
```

They must live in:

```text
JSON
CSV
TS Config
Remote config reservation
Numeric tables
Theme tables
```

### 8.2 Config Must Be Validated

All configs must have a schema or validation function.

When config loading fails:

```text
Output a clear error
Prevent entering an invalid state
Use safe defaults or abort startup
Do not fail silently
```

### 8.3 Numeric Tables Must Be Layered

```text
BaseCurve       Base curve: levels, stages, enemy strength
EconomyCurve    Economy curve: coins, materials, fuel, upgrade costs
DropCurve       Drop curve: rarity probabilities, equipment pools, chest returns
AdCurve         Ad curve: ad reward multipliers, daily limits, trigger timing
StageCurve      Stage curve: chapter goals, bosses, bottleneck design
ThemeConfig     Reskin config: names, copy, assets, colors, audio
```

Do not put all numeric values into one giant table.

---

## 9. Core System Splits

### 9.1 Loot-Box System

Must be split into:

```text
LootBoxSystem       Loot-box flow entry point
LootGenerator       Drop generation
RewardService       Reward granting
InventoryService    Inventory receiving
AdService           Ad bonus
LootBoxView         UI display
LootBoxAnimator     Loot-box presentation
```

UI must not generate drop results.

### 9.2 Combat System

Must be split into:

```text
CombatResolver      Combat settlement
EnemySpawner        Enemy spawning
WaveDirector        Wave control
DamageCalculator    Damage calculation
TrainCombatModel    Train combat state
CombatView          Combat presentation
```

Initial combat may be simplified, but system boundaries must remain clean.

### 9.3 Train Module System

Must be split into:

```text
TrainModel              Train business data
TrainModuleSystem       Module install, uninstall, upgrade
TrainModuleRepository   Module config loading
TrainView               Train presentation
TrainSocketView         Module socket presentation
```

Modules must not exist only in UI or textures.

### 9.4 Ad System

Must be split into:

```text
IAdService
MockAdService
DouyinAdService
AdPlacementConfig
AdRewardService
AdLimitService
```

Ad failure, cancellation, no-fill, and timeout must all be handled.

### 9.5 Save System

Must be split into:

```text
ISaveService
LocalSaveService
DouyinSaveService
SaveVersionMigrator
PlayerProgressRepository
```

Saves must have a version number and migration logic.

---

## 10. Douyin Mini-Game Platform Rules

### 10.1 Platform API Rules

Platform APIs are only allowed in:

```text
/src/platform
```

Other layers may only depend on interfaces.

### 10.2 Ad Rules

Ad placements must be configurable:

```text
placementId
triggerScene
rewardType
rewardMultiplier
dailyLimit
cooldownSeconds
fallbackReward
```

Ads must not be forced in a way that breaks the main loop.

### 10.3 Save Rules

At least save:

```text
Player level
Current stage
Current resources
Train module state
Equipment inventory
Unlocked systems
Ad count records
Offline reward timestamp
Tutorial progress
Theme skin selection
Save version number
```

### 10.4 Weak-Network Rules

Must support:

```text
Safe degradation when ads are unavailable
Use local default config when remote config fails
Do not corrupt saves during network exceptions
Reward settlement must be idempotent
```

---

## 11. Package Size and Asset Rules

### 11.1 Main Package Principles

The main package should only contain:

```text
Startup code
First-screen UI
First playable segment
Base fonts
Base audio
Core config
Required atlases
```

### 11.2 Subpackages and Remote Assets

The following should preferably go into subpackages or remote assets:

```text
Later chapters
Event assets
Skin assets
Long audio
Large images
High-frame-rate animation
Promotional material
Non-day-one gameplay assets
```

### 11.3 Asset Naming

```text
tex_train_head_rust_001.png
icon_equipment_rifle_common_001.png
sfx_lootbox_open_001.mp3
spine_enemy_zombie_basic_001
prefab_train_module_cannon_basic
```

### 11.4 Forbidden Asset Behavior

Forbidden:

```text
Uncompressed large images directly in the main package
Long audio directly in the main package
Repeatedly importing the same asset
Keeping png, jpg, and psd copies of the same image as formal runtime assets
Submitting source project files as runtime assets
Submitting recordings, screenshots, temporary archives into the repository
```

---

## 12. Git and `.gitignore` Rules

### 12.1 Must Ignore

`.gitignore` must cover:

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

### 12.2 Common Cocos Ignore Items

```text
library/
local/
temp/
build/
profiles/
```

If the actual generated directories differ by engine version, supplement them according to the real project.

### 12.3 Heavy File Rules

The following files should not enter a normal Git repository by default:

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
Large source project files
Batch screenshots
Screen recordings
AI generation process files
```

If they must be kept, at least one condition must be met:

```text
Use Git LFS
Place them in an external asset repository
Place them in cloud storage and record the link in docs
Compress them to a controlled size
Convert them to runtime-required formats
```

### 12.4 Repeated Upload Limit

Do not repeatedly upload the same batch of heavy files in a short time.

Do not repeatedly upload:

```text
node_modules
build artifacts
library cache
dist artifacts
uncompressed large image packs
long audio packs
recording packs
duplicate zip packs
```

Before uploading, check:

```text
Whether it already exists in the repository
Whether it is only build cache
Whether it can be regenerated by installing dependencies
Whether it should go through Git LFS
Whether it should go into an external asset repository
Whether it will slow down Codex reading and searching
```

---

## 13. Code Quality Hard Constraints

### 13.1 Single-File Limits

```text
Ordinary .ts files should generally stay under 300 lines
Complex systems over 300 lines must be split
A single UI component must not own multiple core systems
A single Service should own only one business domain
A single function should generally stay under 80 lines
Complex conditions must be split into named functions
Do not nest deeper than 5 levels
```

### 13.2 No God Object

Forbidden:

```text
GameManager controls all systems
MainScene contains all logic
PlayerController handles ads, saves, drops, and combat
UI Button directly modifies resources and saves
One file contains a dozen systems
```

### 13.3 Logging Rules

Use the unified logging module.

Recommended:

```text
Log.info('loot', 'Generated reward', data)
Log.warn('ad', 'Rewarded ad unavailable', context)
Log.error('save', 'Save migration failed', error)
```

Do not keep long-term:

```text
console.log('111')
console.log('test')
alert debugging
Uncategorized log spam
```

---

## 14. Presentation Layer Rules

### 14.1 Presentation Priority

Prioritize:

```text
Loot-box flash
Equipment rarity colors
Power-increase floating text
Train shake
Hit feedback
Enemy death burst
Carriage upgrade visual changes
Ad reward airdrop presentation
```

### 14.2 Presentation Must Not Pollute Logic

Animation may only play presentation and emit events.

Recommended:

```text
playLootBoxAnimation(rewardPreview)
onLootBoxAnimationFinished.emit(result)
```

Forbidden:

```text
Animation callback directly modifies saves
Animation script directly generates drops
Animation script directly calls ads
```

---

## 15. UI Rules

UI may:

```text
Display data
Play animation
Receive clicks
Send requests
Listen to events
Show results
```

UI may not:

```text
Calculate drops
Decide combat outcomes
Modify core saves
Write ad logic directly
Hard-code economy values
Bypass Services to modify business models
```

UI must obtain data through ViewModel / Presenter / Controller.

---

## 16. Testing and Simulation

### 16.1 Every Core System Must Be Testable

```text
Loot-box test: fixed box ID, open 1000 times, output rarity distribution
Combat test: specified enemies and modules, simulate 60 seconds of DPS
Economy test: simulate resource growth for the first 30 minutes
Ad test: success / failure / cancellation / no-fill
Save test: save, load, version migration, exception recovery
Package test: check main package and asset sizes
```

### 16.2 Numeric Systems Must Have Simulations

When numeric curves are involved, prioritize generating simulation scripts.

Output at least:

```text
Power per minute
Average upgrade time per stage
Ad trigger frequency
Loot-box rarity distribution
Player bottleneck positions
Resource gaps
```

---

## 17. Agent Workflow

### 17.1 Before Modifying

Agent must first inspect:

```text
Current directory structure
Existing system naming
Existing config files
Existing interfaces
Existing docs
Whether a similar implementation already exists
```

Do not blindly create duplicate systems.

### 17.2 Implementation Order

```text
1. Type definitions
2. Config schema
3. Interfaces
4. Core logic
5. Platform adapters
6. UI / presentation
7. Saves / events
8. Tests / simulations
9. Documentation updates
```

Do not start by hard-coding from UI or scene scripts.

### 17.3 Output Requirements

Every completed task must explain:

```text
Completed work
Modified files
New systems
Test method
Risks
Follow-up TODOs
Whether temporary implementations exist
```

---

## 18. Forbidden Behaviors

Agents must never:

```text
Write a GodManager for convenience
Hard-code rewards just to make things run
Modify player saves directly for UI convenience
Grant rewards directly from animation for convenience
Put platform APIs into gameplay layer for ad convenience
Pollute production code for testing convenience
Put all classes together to reduce file count
Copy an entire project for reskinning convenience
Only stack exponentials without staged numeric design
Treat TODO as final implementation for speed
Generate duplicate directories
Generate unowned files
Submit build cache
Submit large temporary assets
Repeatedly upload the same batch of heavy files in a short time
```

If temporary simplification is required, it must be marked:

```text
TEMP_PROTOTYPE
Reason
Replacement plan
Cleanup timing
TODO record
```

---

## 19. Allowed Prototype Simplifications

During prototype stage, the following are allowed:

```text
Mock ads
Placeholder art
Simple enemy AI
Local config instead of remote config
Local saves
Simplified combat formulas
Fake leaderboards
Debug buttons to trigger loot boxes
```

Formal interfaces must remain.

---

## 20. Version Goals

### 20.1 Prototype

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

### 20.2 Vertical Slice

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

### 20.3 Soft Launch

```text
First 30-60 minutes of numeric curves
Retention point design
Complete ad placements
Analytics
Performance optimization
Tutorial
Offline rewards
Daily rewards
Basic events
```

### 20.4 Scalable

```text
Theme configuration
Skin asset packages
Event configuration
Season configuration
Remote config reservation
Multiple equipment pools
Multiple chapters
Multiple ad strategies
Data simulation tools
```

---

## 21. Final Acceptance Criteria

A feature is complete only if it satisfies:

```text
Runs correctly
Structure is clear
Data is tunable
Presentation is replaceable
Logic is testable
Saves are safe
Ads are isolated
UI does not overreach
Directories are clean
Package size is controlled
Docs are synchronized
Future expansion is possible
```

If it only "looks usable" but cannot be maintained later, it is not complete.

## 修改安全规则
- 修改任何正在使用的东西，必须先备份原文件，或者新建文件修改；不得直接覆盖正在使用的配置、数据、脚本、文档或运行中资源。

## Agent Safety Lesson: App-Specific Settings Only

- When the user asks to change one specific app, modify only that app's own settings, files, or supported configuration surface.
- Do not change OS-wide settings, registry keys, shell defaults, browser defaults, shared IDE settings, or other global state as a substitute unless the user explicitly approves that wider impact first.
- If the target app does not support the requested per-app change, state the limitation plainly instead of approximating with a global workaround.
- Before any setting change outside the named app/project, explain the affected scope and wait for explicit confirmation.
- If a global setting is changed by mistake, restore it immediately and report exactly what was touched.

---

## Agent Rule: Full-Scope Work And Recoverable Batching

- Do not use conservative partial progress, small-sample execution, or "do a few first" as a substitute for the user's requested full scope.
- If the user asks for all items, all candidates, full search, full review, or complete coverage, the default scope is the full set.
- Batching is allowed only as an execution mechanism, not as scope reduction. Before batching, create or update a durable plan that lists every batch, every item range, status fields, completion criteria, and the resume entry point.
- Do not rely on chat history as the only state. Persist progress in project files such as CSV ledgers, manifests, TODO/checkpoint docs, or per-item notes so another agent can resume after context compaction.
- A subset is not complete unless the durable plan explicitly says it is the requested scope, or the user explicitly asked for that subset.
- Platform/search result pages are not final source verification. For assets, dependencies, data, or citations, verify item-level source, license/terms, author/rightsholder, format, and evidence before marking an item usable or final.

## 回答原则：求真而非附和

> 不要默认认同我的观点，也不要为了让我满意而附和我。
> 回答前，先检查我的问题里是否存在错误前提、逻辑跳跃、信息缺失或未经证实的判断。 如果有，请直接指出，不要沿着错误前提继续推导。
> 请明确区分:已确认的事实、合理推测、个人观点和暂时无法验证的信息。涉及事实、数字、人物、日期、引用和案例时，尽可能核对来源；无法确认就直接说明，不要编造
> 当你不同意我的判断时，请清楚说明原因并给出反例、风险或更合理的解释。不要只给结论，要说明推理过程
> 语气可以直接，但不要刻意尖刻、说教或卖弄。比起让我感觉良好，更重要的是帮助我发现自己忽略的问题。
