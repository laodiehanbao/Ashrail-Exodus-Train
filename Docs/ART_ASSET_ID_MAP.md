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
| `tex_train_head_rust_001` | `assets/textures/trains/tex_train_head_rust_001.png` | `assets/textures/trains/runtime/tex_train_head_rust_001.png` | `train_head_base_001` | cruise/combat | yes | integrated | 384x304, alpha cleaned, registered as `train_sprite` |
| `tex_train_carriage_combat_001` | `assets/textures/trains/sheet_train_carriages_p0_001.png` | `assets/textures/trains/runtime/tex_train_carriage_combat_001.png` | `carriage_combat_basic_001` | cruise/combat | yes | integrated | 265x256, alpha cleaned, registered as `train_sprite` |
| `tex_train_carriage_supply_001` | `assets/textures/trains/sheet_train_carriages_p0_001.png` | `assets/textures/trains/runtime/tex_train_carriage_supply_001.png` | `carriage_supply_basic_001` | cruise/loot | yes | integrated | 326x218, alpha cleaned, registered as `train_sprite` |
| `icon_module_cannon_basic_001` | `assets/icons/train_modules/sheet_train_module_icons_p0_001.png` | `assets/icons/train_modules/runtime/icon_module_cannon_basic_001.png` | `module_cannon_basic_001` | train upgrade | yes | integrated | 128x116, alpha cleaned, registered as `train_module_icon` |
| `icon_equipment_rifle_rusty_001` | `assets/icons/equipment/sheet_equipment_icons_p0_001.png` | `assets/icons/equipment/runtime/icon_equipment_rifle_rusty_001.png` | `equipment_rifle_rusty_001` | inventory/reward | yes | integrated | 128x88, alpha cleaned, registered as `equipment_icon` |
| `icon_equipment_engine_core_001` | `assets/icons/equipment/sheet_equipment_icons_p0_001.png` | `assets/icons/equipment/runtime/icon_equipment_engine_core_001.png` | `equipment_cogwheel_reinforced_001` | inventory/reward | yes | integrated | 128x119, alpha cleaned, registered as `equipment_icon` |
| `icon_lootbox_supply_common` | `assets/icons/resources/sheet_lootboxes_resources_p0_001.png` | `assets/icons/resources/runtime/icon_lootbox_supply_common.png` | `lootbox_supply_common` | loot box | yes | integrated | 128x111, alpha cleaned, registered as `resource_icon` |
| `icon_resource_coin_001` | `assets/icons/resources/sheet_lootboxes_resources_p0_001.png` | `assets/icons/resources/runtime/icon_resource_coin_001.png` | `coin` | HUD/reward | yes | integrated | 128x108, alpha cleaned, registered as `resource_icon` |
| `icon_resource_module_fragment_001` | `assets/icons/resources/sheet_lootboxes_resources_p0_001.png` | `assets/icons/resources/runtime/icon_resource_module_fragment_001.png` | `module_fragment` | reward/upgrade | yes | integrated | 128x90, alpha cleaned, registered as `resource_icon` |
| `tex_enemy_raider_basic_001` | `assets/textures/enemies/sheet_enemies_p0_001.png` | `assets/textures/enemies/runtime/tex_enemy_raider_basic_001.png` | `enemy_raider_basic_001` | combat | yes | integrated | 163x256, alpha cleaned, registered as `enemy_sprite` |
| `tex_enemy_husk_brute_001` | `assets/textures/enemies/sheet_enemies_p0_001.png` | `assets/textures/enemies/runtime/tex_enemy_husk_brute_001.png` | `enemy_husk_brute_001` | combat | yes | integrated | 215x256, alpha cleaned, registered as `enemy_sprite` |
| `tex_bg_stage_wasteland_rail_001` | `assets/textures/backgrounds/tex_bg_stage_wasteland_rail_001.png` | `assets/textures/runtime/tex_bg_stage_wasteland_rail_001.jpg` | `stage_chapter_01_001` | combat | yes | integrated | 720x1280, under 180KB target |
| `tex_bg_train_garage_upgrade_001` | `assets/textures/backgrounds/tex_bg_train_garage_upgrade_001.png` | `assets/textures/runtime/tex_bg_train_garage_upgrade_001.jpg` | `screen_train_upgrade` | train upgrade | yes | integrated | 720x1280, under 180KB target |
| `tex_bg_lootbox_cargo_bay_001` | `assets/textures/backgrounds/tex_bg_lootbox_cargo_bay_001.png` | `assets/textures/runtime/tex_bg_lootbox_cargo_bay_001.jpg` | `screen_lootbox` | loot box | yes | integrated | 720x1280, under 180KB target |
| `ui_primary_button_ember` | `assets/ui/core/sheet_ui_core_p0_001.png` | `assets/ui/runtime/ui_primary_button_ember.png` | `primary_button` | all P0 actions | yes | integrated | sliced with alpha cleanup, registered as `ui_skin` |
| `ui_secondary_button_iron` | `assets/ui/core/sheet_ui_core_p0_001.png` | `assets/ui/runtime/ui_secondary_button_iron.png` | `secondary_button` | ad skip/cancel | yes | integrated | sliced with alpha cleanup, registered as `ui_skin` |
| `ui_icon_button_square` | `assets/ui/core/sheet_ui_core_p0_001.png` | `assets/ui/runtime/ui_icon_button_square.png` | `icon_button` | reserved P0 tools | yes | integrated | sliced with alpha cleanup, registered as `ui_skin` |
| `ui_modal_panel_iron` | `assets/ui/core/sheet_ui_core_p0_001.png` | `assets/ui/runtime/ui_modal_panel_iron.png` | `modal_panel` | reward/ad popup | yes | integrated | sliced with alpha cleanup, registered as `ui_skin` |
| `ui_reward_card_common` | `assets/ui/core/sheet_ui_core_p0_001.png` | `assets/ui/runtime/ui_reward_card_common.png` | `reward_card` | reward popup | yes | integrated | sliced with alpha cleanup, registered as `ui_skin` |
| `ui_progress_bar_ember` | `assets/ui/core/sheet_ui_core_p0_001.png` | `assets/ui/runtime/ui_progress_bar_ember.png` | `progress_bar` | reserved stage/upgrade progress | yes | integrated | sliced with alpha cleanup, registered as `ui_skin` |
| `ui_module_slot_iron` | `assets/ui/core/sheet_ui_core_p0_001.png` | `assets/ui/runtime/ui_module_slot_iron.png` | `module_slot` | train upgrade | yes | integrated | sliced with alpha cleanup, registered as `ui_skin` |

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
