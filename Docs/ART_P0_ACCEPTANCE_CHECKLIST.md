# ART_P0_ACCEPTANCE_CHECKLIST

## Stop Rule

Do not generate more P1/P2 art until this checklist passes for P0.

Allowed operations only:

```text
crop, slice, resize, compress, alpha_cleanup, atlas_pack, id_mapping, docs_update
```

Forbidden operations:

```text
new_prompt_generation, new_background, new_character_sheet, new_icon_sheet, concept_to_runtime, direct_sheet_runtime_reference
```

## Asset Closure

- [ ] `ashrail_key_visual_v02` is locked as commercial style anchor.
- [ ] Concept images are marked reference-only and excluded from runtime atlases.
- [ ] P0 contact sheets have selected cells for train, enemies, icons, UI, FX, and backgrounds.
- [ ] Selected cells are cropped into runtime paths.
- [ ] Runtime sprites/icons have transparent backgrounds where needed.
- [x] Backgrounds are resized/compressed for first package use.
- [x] Runtime assets have stable `assetId` entries in `ART_ASSET_ID_MAP.md`.
- [x] Every integrated runtime visual maps to a screen or gameplay/config ID.
- [ ] No generated contact sheet is referenced directly by a Cocos prefab, UI config, or gameplay config.

## Readability

- [ ] Icons are readable at 64px.
- [ ] Key icons are readable at 128px.
- [ ] Enemy silhouettes are distinguishable in battle scale.
- [ ] Train/module silhouettes remain readable on 375x667.
- [ ] Reward rarity can be recognized in under 1 second.
- [ ] UI buttons and panels do not overlap or depend on baked labels.

## Package Hygiene

- [ ] No PSD/FBX/BLEND/video/zip files in runtime folders.
- [ ] No duplicate image copies under multiple runtime paths.
- [ ] Sheets remain selection sources, not first-package runtime assets.
- [ ] Main package includes only first battle, loot box, upgrade, UI, and P0 feedback assets.
- [ ] Long-term concept/promotional art stays out of runtime package.

## Design Integrity

- [ ] Assets serve the loop: combat -> reward -> loot box -> equipment/module upgrade -> power feedback.
- [ ] UI does not encode gameplay values in art.
- [ ] Ad reward visuals do not imply forced ads or hide the non-ad option.
- [ ] No baked text, numbers, platform logos, reward quantities, or readable signs.
- [ ] No gore or heavy horror visuals.
- [ ] No modern bullet train, clean sci-fi spaceship, or unrelated fantasy assets.

## Blocking Checks

| checkId | category | requirement | passCondition |
|---|---|---|---|
| `p0_art_001` | scope | no more generation | no new key visual, background, character, icon, or sheet prompts |
| `p0_art_002` | runtime | concept excluded | `assets/textures/concept/*` not referenced by runtime package |
| `p0_art_003` | id | stable IDs | each runtime asset has one unique `assetId` |
| `p0_art_004` | package | pack group clear | each asset has `main_package`, reserved, or concept-only status |
| `p0_art_005` | slicing | sheets not runtime | selected sheet cells are cropped before integration |
| `p0_art_006` | compression | under budget | runtime files meet `ART_RUNTIME_ASSET_SPEC.md` budgets |
| `p0_art_007` | alpha | transparency clear | sprites/icons/UI/FX have cleaned alpha where required |
| `p0_art_008` | text | no baked text | no text, numbers, logos, or platform marks in images |
| `p0_art_009` | readability | mobile readable | icons readable at 64/128px, enemies readable in battle scale |
| `p0_art_010` | config | ID separation | `businessId` and `assetId` remain distinct |

## Required Next Screens

- [x] Main cruise/combat HUD state contract.
- [x] Loot box opening screen state contract.
- [x] Reward settlement popup state contract.
- [x] Train module upgrade screen state contract.
- [x] Ad double reward popup state contract.
- [x] Cocos-ready binding contract and presenter for P0 UI state.
- [x] No-`cc` P0 node binding manifest for all required presenter slots.
- [x] No-`cc` manifest-to-`P0CocosUiBinding` factory and host contract.
- [x] No-`cc` P0 Cocos UI runtime for mount, refresh, serialized UI requests, and accepted-state rendering.
- [x] Real Cocos Creator TypeScript binding components and app bootstrap script.
- [x] Generated Cocos Creator scene node binding for main cruise/combat HUD.
- [x] Generated Cocos Creator scene node binding for loot box opening screen.
- [x] Generated Cocos Creator scene node binding for reward settlement popup.
- [x] Generated Cocos Creator scene node binding for train module upgrade screen.
- [x] Generated Cocos Creator scene node binding for ad double reward popup.
- [x] Creator TS bindings split to one `Component` per script file.
- [x] Generated scene AssetRegistry uses `colorTokensJson` instead of custom entry classes.
- [x] Generated scene AssetRegistry includes P0 background SpriteFrames from `P0VisualAssets.json`.
- [ ] Cocos Creator AssetDB refresh/open/save confirmation for `scene_p0_exodus_train_main.scene`.
