# ART_ASSET_ID_MAP

## Rule

Every runtime visual must have a stable `assetId` before it is referenced by gameplay, UI, config, or Cocos prefabs.

Do not use generated source filenames, display text, Chinese names, or config display keys as runtime visual IDs.

## Columns

| Field | Meaning |
|---|---|
| `assetId` | Stable visual ID, snake_case |
| `sourcePath` | Current source/contact sheet path |
| `runtimePath` | Final sliced runtime path |
| `domainId` | Optional gameplay/config ID |
| `screen` | First screen/use case |
| `mainPackage` | `yes` or `no` |
| `status` | `sheet`, `selected`, `cropped`, `compressed`, `integrated` |
| `notes` | Selection or slicing instruction |

## P0 Mapping Draft

| assetId | sourcePath | runtimePath | domainId | screen | mainPackage | status | notes |
|---|---|---|---|---|---|---|---|
| `tex_train_head_rust_001` | `assets/textures/trains/tex_train_head_rust_001.png` | `assets/textures/trains/runtime/tex_train_head_rust_001.png` | `train_head_base_001` | cruise/combat | yes | selected | crop/alpha cleanup if needed |
| `tex_train_carriage_combat_001` | `assets/textures/trains/sheet_train_carriages_p0_001.png` | `assets/textures/trains/runtime/tex_train_carriage_combat_001.png` | `carriage_combat_basic_001` | cruise/combat | yes | sheet | select weapon platform carriage |
| `tex_train_carriage_supply_001` | `assets/textures/trains/sheet_train_carriages_p0_001.png` | `assets/textures/trains/runtime/tex_train_carriage_supply_001.png` | `carriage_supply_basic_001` | cruise/loot | yes | sheet | select loot/resource carriage |
| `icon_module_cannon_basic_001` | `assets/icons/train_modules/sheet_train_module_icons_p0_001.png` | `assets/icons/train_modules/runtime/icon_module_cannon_basic_001.png` | `module_cannon_basic_001` | train upgrade | yes | sheet | select basic cannon turret |
| `icon_equipment_rifle_rusty_001` | `assets/icons/equipment/sheet_equipment_icons_p0_001.png` | `assets/icons/equipment/runtime/icon_equipment_rifle_rusty_001.png` | `equipment_rifle_rusty_001` | inventory/reward | yes | sheet | select rusty rifle |
| `icon_equipment_engine_core_001` | `assets/icons/equipment/sheet_equipment_icons_p0_001.png` | `assets/icons/equipment/runtime/icon_equipment_engine_core_001.png` | `equipment_cogwheel_reinforced_001` | inventory/reward | yes | sheet | select engine/core icon |
| `icon_lootbox_supply_common` | `assets/icons/resources/sheet_lootboxes_resources_p0_001.png` | `assets/icons/resources/runtime/icon_lootbox_supply_common.png` | `lootbox_supply_common` | loot box | yes | sheet | select common supply crate |
| `icon_resource_coin_001` | `assets/icons/resources/sheet_lootboxes_resources_p0_001.png` | `assets/icons/resources/runtime/icon_resource_coin_001.png` | `coin` | HUD/reward | yes | sheet | select old coin stack |
| `icon_resource_module_fragment_001` | `assets/icons/resources/sheet_lootboxes_resources_p0_001.png` | `assets/icons/resources/runtime/icon_resource_module_fragment_001.png` | `module_fragment` | reward/upgrade | yes | sheet | select module shard |
| `tex_enemy_raider_basic_001` | `assets/textures/enemies/sheet_enemies_p0_001.png` | `assets/textures/enemies/runtime/tex_enemy_raider_basic_001.png` | `enemy_raider_basic_001` | combat | yes | sheet | select readable fast/small enemy |
| `tex_enemy_husk_brute_001` | `assets/textures/enemies/sheet_enemies_p0_001.png` | `assets/textures/enemies/runtime/tex_enemy_husk_brute_001.png` | `enemy_husk_brute_001` | combat | yes | sheet | select heavy blocker |
| `tex_bg_stage_wasteland_rail_001` | `assets/textures/backgrounds/tex_bg_stage_wasteland_rail_001.png` | `assets/textures/runtime/tex_bg_stage_wasteland_rail_001.jpg` | `stage_chapter_01_001` | combat | yes | integrated | 720x1280, under 180KB target |
| `tex_bg_train_garage_upgrade_001` | `assets/textures/backgrounds/tex_bg_train_garage_upgrade_001.png` | `assets/textures/runtime/tex_bg_train_garage_upgrade_001.jpg` | `screen_train_upgrade` | train upgrade | yes | integrated | 720x1280, under 180KB target |
| `tex_bg_lootbox_cargo_bay_001` | `assets/textures/backgrounds/tex_bg_lootbox_cargo_bay_001.png` | `assets/textures/runtime/tex_bg_lootbox_cargo_bay_001.jpg` | `screen_lootbox` | loot box | yes | integrated | 720x1280, under 180KB target |

## Concept References

| assetId | sourcePath | Runtime |
|---|---|---|
| `concept_ashrail_key_visual_v01` | `assets/textures/concept/ashrail_key_visual_v01.png` | no |
| `concept_ashrail_key_visual_v02` | `assets/textures/concept/ashrail_key_visual_v02.png` | no |

## Status Values

| Status | Meaning |
|---|---|
| `sheet` | still inside generated contact sheet |
| `selected` | chosen from source sheet, not yet cut |
| `cropped` | isolated into runtime path |
| `compressed` | resized/compressed for package target |
| `integrated` | referenced by UI/prefab/config safely |
