# ART_RUNTIME_ASSET_SPEC

## Purpose

Turn current contact sheets into runtime assets without letting concept art enter the first package.

## Runtime Classes

| Class | Source | Target | Main Package |
|---|---|---|---|
| train_sprite | `assets/textures/trains/` | cropped transparent PNG/WebP | yes |
| enemy_sprite | `assets/textures/enemies/` | cropped transparent PNG/WebP | yes |
| resource_icon | `assets/icons/resources/` | transparent 128px source, atlas 64px/96px | yes |
| equipment_icon | `assets/icons/equipment/` | transparent 128px source, atlas 64px/96px | yes |
| train_module_icon | `assets/icons/train_modules/` | transparent 128px source, atlas 64px/96px | yes |
| ui_sprite | `assets/ui/core/` | sliced atlas parts | yes |
| fx_sprite | `assets/effects/` | cropped sprite or Cocos particle reference | yes |
| background | `assets/textures/backgrounds/` | compressed screen background | yes for first 3 |
| key_visual | `assets/textures/concept/` | reference/promotional only | no |

## Machine Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `assetId` | string | yes | stable snake_case visual ID |
| `sourcePath` | path | yes | current source/contact sheet path |
| `runtimePath` | path | yes | final sliced/compressed path |
| `assetType` | enum | yes | `sprite`, `atlas_sprite`, `background`, `ui_9slice`, `fx_sprite` |
| `packGroup` | enum | yes | `main_package`, `subpackage_reserved`, `remote_reserved`, `concept_only` |
| `p0Required` | boolean | yes | required for first playable loop |
| `sliceStatus` | enum | yes | `not_sliced`, `sliced`, `not_required` |
| `compressionStatus` | enum | yes | `uncompressed_source`, `compressed_runtime`, `not_required` |
| `alphaStatus` | enum | yes | `transparent_required`, `opaque_required`, `alpha_cleaned`, `unknown` |
| `maxRuntimeSize` | string | yes | example: `128x128`, `512x384`, `1280x720` |
| `maxBytes` | number | yes | per-resource budget |
| `configOwner` | string | yes | config/system owner |
| `runtimeOwner` | string | yes | presentation owner |

## Size Targets

| Asset Type | Source Size | Runtime Target |
|---|---:|---:|
| icon source | 128x128 or 256x256 | atlas 64/96/128, under 60KB |
| lootbox prop | 256x256 | under 120KB |
| train sprite | max 1024 wide | train head 512x384 under 260KB; carriage 512x256 under 220KB |
| enemy sprite | max 512 high | runtime 256x256 under 160KB |
| UI pieces | variable | atlas, 9-slice where possible |
| FX sprite | max 512 | runtime 256x256 under 120KB |
| battle background | landscape source | runtime 1280x720 under 500KB |
| portrait UI background | portrait source | runtime 720x1280 under 650KB |

## Export Rules

- Use transparent background for sprites and icons.
- Keep 8-12% padding around isolated sprites before atlas packing.
- Anchor train sprites at rail-contact center.
- Anchor enemies at feet/base center.
- Anchor icons at center.
- No baked shadows that make atlas reuse difficult.
- Contact sheets are selection sources, not final runtime files.

## Package Rules

- Main package may include only first playable battle, first loot-box screen, train upgrade screen, core UI, and P0 icons.
- Concept images, unused sheet rows, alternate variants, and later backgrounds stay out of runtime packaging.
- Do not duplicate the same generated image under multiple runtime paths.

## Allowed Operations

Allowed until P0 art closure:

```text
crop
slice
resize
compress
alpha_cleanup
atlas_pack
id_mapping
docs_update
```

Forbidden until P0 closure:

```text
new_prompt_generation
new_background
new_character_sheet
new_icon_sheet
concept_to_runtime
direct_sheet_runtime_reference
```
