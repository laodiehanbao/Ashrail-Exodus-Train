# ART_STYLE_GUIDE

## Locked Direction

`ashrail_key_visual_v02.png` is the P0 commercial style anchor.

The first-round art direction is:

```text
rusted armored train + modular upgrade readability + loot-box reward burst + controlled wasteland pressure
```

Do not continue exploring new key visual directions until P0 runtime assets are sliced, mapped, compressed, and checked in-game.

## Shape Language

- Train: chunky, armored, bolted, readable silhouette, large plates, reinforced cowcatcher, visible module sockets.
- Modules: compact mechanical blocks, clear function at small size, one main readable form per icon.
- Enemies: simple silhouettes, 3 readable roles only for P0: fast small, ranged/thrower, heavy blocker.
- Loot boxes: square/rectangular industrial crates, strong lid silhouette, rarity communicated through light and trim.
- UI: utilitarian train-control metal panels, compact controls, clear icon slots, no ornamental fantasy frames.

## Materials

| Material | Use |
|---|---|
| Rusted steel | Train body, module shell, loot crates |
| Coal-black metal | UI panels, train undercarriage, dark equipment |
| Worn warning paint | Module sockets, button accents, interactable edges |
| Ember glass/core | Furnace, reward glow, upgrade feedback |
| Ash cloth/rubber | enemy clothing, straps, tires, background props |

## Palette

| Token | Hex | Use | Limit |
|---|---:|---|---|
| iron_black | `#191716` | train shadow, UI dark base | primary dark |
| coal_gray | `#343637` | panels, train midtone | primary neutral |
| rust_red | `#8f3e2d` | rust, damage, warm accents | support |
| ember_orange | `#e36a24` | furnace, hit sparks, upgrade | highlight |
| reward_gold | `#f3c64d` | loot burst, coins, reward focus | brightest |
| warning_yellow | `#d8a531` | interactable trim, safety stripes | small accents |
| signal_cyan | `#35b9c8` | energy core, rare signals | under 8% area |
| repair_green | `#6bbf67` | repair/heal FX only | under 5% area |
| epic_violet | `#8b5cf6` | epic rarity spark only | tiny accent |

Avoid dominant purple, neon cyberpunk blue, beige-only desert palettes, and fully black unreadable scenes.

## Light Rules

- Loot-box reward light is the brightest focal light.
- Furnace glow and hit sparks use ember orange.
- Cyan/green are tiny signal accents, never large area lighting.
- Backgrounds stay low contrast so UI and gameplay sprites remain readable.

## Forbidden

- Baked text, numbers, platform logos, buttons, UI copy, or reward values inside art.
- Concept key visuals inside runtime atlases.
- Photorealistic trains, modern bullet trains, clean sci-fi vehicles, fantasy treasure chests.
- Gore, realistic corpses, close-up horror monsters.
- More key visual variants before P0 runtime closure.
