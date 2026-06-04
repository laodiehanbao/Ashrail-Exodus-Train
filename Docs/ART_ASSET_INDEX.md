# ART_ASSET_INDEX

## Runtime Candidate Sheets

These assets are P0 production candidates. Most are contact sheets and should be cropped or sliced before being packed into runtime atlases.

| Path | Purpose | Status | Next Step |
|---|---|---|---|
| `assets/textures/trains/tex_train_head_rust_001.png` | Main P0 locomotive visual anchor | Generated | Crop/clean background if needed |
| `assets/textures/trains/sheet_train_carriages_p0_001.png` | Modular carriage direction sheet | Generated sheet | Select 3-4 carriages and crop |
| `assets/textures/enemies/sheet_enemies_p0_001.png` | Enemy silhouette direction sheet | Generated sheet | Select 3 common enemies and 1 blocker |
| `assets/icons/resources/sheet_lootboxes_resources_p0_001.png` | Loot boxes and reward/resource icons | Generated sheet | Crop boxes and resource icons |
| `assets/icons/equipment/sheet_equipment_icons_p0_001.png` | Equipment icon mother sheet | Generated sheet | Crop rifle, armor plate, engine core variants |
| `assets/icons/train_modules/sheet_train_module_icons_p0_001.png` | Train module icon mother sheet | Generated sheet | Crop cannon, armor, engine, radar, repair arm, fuel tank |
| `assets/ui/core/sheet_ui_core_p0_001.png` | Core UI component skin direction | Generated sheet | Slice buttons, panels, progress bars, rarity frames |
| `assets/effects/combat/sheet_feedback_fx_p0_001.png` | Combat, loot, upgrade, ad feedback FX shapes | Generated sheet | Rebuild selected FX in Cocos particles or crop sprites |
| `assets/textures/backgrounds/tex_bg_stage_wasteland_rail_001.png` | First playable battle background | Generated | Resize/compress for runtime |
| `assets/textures/backgrounds/tex_bg_train_garage_upgrade_001.png` | Train upgrade/garage background | Generated | Resize/compress for runtime |
| `assets/textures/backgrounds/tex_bg_lootbox_cargo_bay_001.png` | Loot box screen background | Generated | Resize/compress for runtime |

## Concept References

| Path | Purpose | Runtime? |
|---|---|---|
| `assets/textures/concept/ashrail_key_visual_v01.png` | Key visual and style reference | No |
| `assets/textures/concept/ashrail_key_visual_v02.png` | Locked commercial style anchor for P0 | No |

## Round 01 Closure Docs

| Path | Purpose |
|---|---|
| `Docs/ART_STYLE_GUIDE.md` | Locked style tokens, palette, material and forbidden styles |
| `Docs/ART_RUNTIME_ASSET_SPEC.md` | Runtime sizes, alpha, compression, package rules |
| `Docs/ART_ASSET_ID_MAP.md` | Stable assetId to source/runtime/config mapping |
| `Docs/ART_UI_COMPONENT_SPEC.md` | UI component states and non-baked text rules |
| `Docs/ART_P0_ACCEPTANCE_CHECKLIST.md` | Blocking acceptance checklist for P0 art closure |

## Rules

- Concept images must not be packed into the first runtime atlas.
- Sheets are selection sources, not final sliced sprites.
- Do not duplicate the same generated image under multiple paths.
- Do not bake text, numbers, reward values, or UI copy into runtime art.
- Final runtime exports should be size-controlled and listed in config by stable asset IDs.
- Do not generate more P1/P2 art before P0 sheet selection, slicing, compression, and mapping are complete.
