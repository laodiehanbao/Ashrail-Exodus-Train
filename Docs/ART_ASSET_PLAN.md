# ART_ASSET_PLAN

## Scope

This round produces a lean P0 visual skeleton for the prototype loop:

```text
cruise -> combat -> reward drops -> loot box -> equipment/module upgrade -> power feedback
```

P1/P2 content is documented as prompt/spec reserve only. Do not expand this round into a worldbuilding art pack.

Round 01 is now in closure mode:

```text
No more key visual exploration.
No more new sheets.
Only select, crop, slice, resize, compress, map asset IDs, and verify P0 readability.
```

## P0 Asset Packs

- `train_base_pack`: locomotive, cargo carriage, combat carriage, supply/core carriage, visible module sockets.
- `combat_enemy_pack`: three readable common enemies plus one small boss concept.
- `lootbox_reward_pack`: common/rare/epic supply boxes, opening states, reward lights, coin/fuel/scrap/module fragment icons.
- `equipment_icon_pack`: rifle, armor plate, engine core in common/rare/epic variants.
- `train_module_icon_pack`: cannon, armor plate, steam engine, radar, repair arm, fuel tank.
- `ui_core_pack`: restrained wasteland train-control UI skin, buttons, panels, rarity frames, progress bar.
- `feedback_fx_pack`: hit spark, death burst, power-up flash, ad reward drop/double feedback.
- `background_pack`: main screen, combat railway, loot box screen backgrounds.

## Production Rules

- Concept/key visual images stay in `assets/textures/concept/` and are not runtime atlas assets.
- Runtime art should be smaller, readable, and named by stable asset purpose.
- No text, logo, watermark, baked numbers, baked UI copy, or platform branding inside generated art.
- No PSD, FBX, BLEND, video, long audio, build output, or duplicate source formats in the repo.
- Prefer contact sheets for early selection; split/crop only after a design direction is accepted.

## Directories

```text
assets/textures/trains
assets/textures/enemies
assets/textures/backgrounds
assets/icons/resources
assets/icons/equipment
assets/icons/train_modules
assets/ui/core
assets/effects/combat
assets/effects/lootbox
assets/textures/concept
```

## Acceptance

- Train, loot box, rewards, enemy, equipment, and upgrade modules are readable at phone size.
- Style remains rusted steel, coal ash, ember orange, warning yellow, cold blue-gray, and small green/cyan signal accents.
- Assets express presentation only and do not encode gameplay rules.
