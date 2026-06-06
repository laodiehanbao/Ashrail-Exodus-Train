# ART_UI_COMPONENT_SPEC

## UI Direction

The UI should feel like a compact train control panel: metal, ash, warning paint, ember highlights, readable on a phone, and built for repeated taps.

## Components

| Component | Required States | Notes |
|---|---|---|
| primary_button | normal, pressed, disabled | ember highlight, no baked text |
| secondary_button | normal, pressed, disabled | lower contrast |
| icon_button | normal, pressed, disabled | stable square hit target |
| tab | selected, unselected | clear active state |
| progress_bar | empty, partial, full | stage and upgrade progress |
| resource_counter | normal, increasing | icon + number rendered by UI text |
| equipment_slot | empty, filled, selected, locked | rarity frame separate |
| module_slot | empty, installable, installed, upgradeable | socket visual must be readable |
| reward_card | common, rare, epic, legendary | frame separate from item icon |
| modal_panel | normal | 9-slice preferred |
| ad_reward_panel | available, unavailable, cooldown | must show video/ad marker via UI layer, not baked art |

## Rarity Colors

| Rarity | Color Token | Use |
|---|---|---|
| common | coal_gray / steel_white | base frame |
| rare | signal_cyan | edge glow |
| epic | epic_violet | small halo |
| legendary | reward_gold + ember_orange | high-value burst |

## Layout Rules

- UI text is rendered by the engine, never baked into generated art.
- Buttons must not contain fake text in source art.
- Keep touch targets stable and large enough for mobile.
- Do not place cards inside cards.
- Reward popups use item icon, rarity frame, quantity text, and optional FX layer separately.
- Ad reward UI must offer clear video/ad marker and a nearby non-ad option of comparable readability.

## P0 Screens

- Main cruise/combat HUD.
- Loot box opening screen.
- Reward settlement popup.
- Train module upgrade screen.
- Ad double reward popup.

## Engineering Contract

P0 UI code is split into three layers:

- `configs/ui`: copy and layout data.
- `configs/ui/P0UiNodeBindings.json`: no-`cc` Cocos node binding manifest for P0 screens. It records stable node paths, slot IDs, list item template paths, component skin references, and action IDs.
- `src/gameplay/*Availability.ts`: pure read-only availability queries for loot box, train module, and ad reward states.
- `src/presentation/viewmodels`: display-state mapping from config, snapshot, and gameplay availability into renderable UI state.
- `src/presentation/ui`: thin views that render state and emit `ui_request_*` interaction requests only.
- `src/presentation/ui/cocos`: Cocos-ready binding contracts, no-`cc` manifest binding factory, runtime, and presenter code. The `creator` subfolder contains the only real `cc` binding components allowed in presentation.
- `src/app/cocos`: Creator scene composition components that may import `cc` and app systems to mount the UI runtime.
- `src/app/P0UiRequestRouter.ts`: the only current UI request router allowed to call gameplay systems.

The current implementation is Cocos-ready TypeScript state/request, a binding-presenter, a no-`cc` runtime, a machine-validated node binding manifest, a no-`cc` factory, real Cocos Creator binding components, an app-layer Creator bootstrap, and a generated P0 Creator scene asset at `assets/scenes/scene_p0_exodus_train_main.scene`.

## P0 Node Binding Manifest

`configs/ui/P0UiNodeBindings.json` must remain a UI contract only.

It may contain:

- `screenId`, `rootPath`, `slotId`, `nodePath`, `kind`, `panelId`, `componentId`, `actionId`, `itemTemplatePath`, and `emptyStatePath`.

It must not contain:

- reward amounts, drop weights, upgrade costs, ad multipliers, settlement IDs, save patches, ad watched flags, or platform API details.

Required slots are declared in `src/shared/ui/P0UiNodeBinding.types.ts` and validated by `src/data/schemas/UiNodeBinding.schema.ts`. The manifest covers the five P0 screens and their frame/text/list/action slots, but real Creator node lookup and `cc` component implementation are still deferred.

## P0 Binding Factory

`src/presentation/ui/cocos/P0CocosUiBindingFactory.ts` assembles the validated manifest into a `P0CocosUiBinding`.

The host may:

- resolve UI nodes by validated `nodePath`.
- create frame, text, list, and action binding adapters.
- fail with a clear `Result` when a node or template is missing.

The host must not:

- import `GameApp`, gameplay systems, platform adapters, saves, or `cc`.
- generate request payloads from node names.
- decide button availability, grant rewards, write saves, show ads, or calculate costs.

## P0 Cocos Runtime

`src/presentation/ui/cocos/P0CocosUiRuntime.ts` connects a binding to an `IP0UiPresenter`.

The runtime may:

- call `getState(nowMs)` for mount and refresh.
- forward stable `UiInteractionRequest` values to `handleRequest(request, nowMs)`.
- serialize fire-and-forget Cocos button presses.
- render the returned state only when a request succeeds.
- expose request/render failures as `Result` values for tests and app composition.

The runtime must not:

- import `GameApp`, `P0UiRequestRouter`, gameplay services, platform adapters, saves, Douyin APIs, or `cc`.
- calculate rewards, costs, ad availability, or button state.
- create node bindings from the manifest; that remains the factory/host responsibility.
- treat failed requests as accepted gameplay state.

## Real Cocos Creator Components

`src/presentation/ui/cocos/creator` provides real Cocos Creator components:

- frame, text, action, metric list, reward list, and train module card list bindings.
- asset registry for stable `assetId` to `SpriteFrame` and color token mapping.
- manifest host that resolves validated `nodePath` and `itemTemplatePath` values against a real Cocos `Node` tree.

`src/app/cocos/P0CocosCreatorBootstrap.ts` provides the current scene entry component. The generated scene assigns:

- `uiRoot`: `Canvas`.
- `configAssets`: the 20 JSON assets required by the P0 bootstrap.
- `assetRegistry`: a generated `CocosCreatorAssetRegistryComponent` with P0 color tokens, registered P0 background sprite frames, and local P0 audio clips.

The scene is produced by `npm run sync:cocos` plus `npm run generate:cocos:p0-scene`. After generation, refresh the Cocos Creator asset panel and save the scene once so AssetDB can confirm there are no missing scripts or missing JSON references.

## P0 Engineering Acceptance

- UI copy and layout must pass `npm run validate:configs`.
- P0 node binding manifest must pass `npm run validate:configs`.
- P0 screens must all exist in `configs/ui/P0UiLayout.json`.
- P0 node bindings must cover every required slot declared by `P0_UI_NODE_BINDING_SLOT_SPECS`.
- P0 binding factory must turn the manifest into `P0CocosUiBinding` through a no-`cc` host and fail clearly when a slot/node is missing.
- P0 Cocos runtime must mount state, serialize click requests, render accepted updates, expose failures, and stay no-`cc`.
- Real Cocos Creator components must remain restricted to `src/presentation/ui/cocos/creator` and app composition under `src/app/cocos`.
- `assets/scenes/scene_p0_exodus_train_main.scene` must contain all paths from `configs/ui/P0UiNodeBindings.json` and 20 bootstrap `JsonAsset` references.
- UI copy must cover screen labels, button labels, resource names, loot box names, equipment names, train module names, and reward fragment text.
- Presentation views may not grant rewards, spend resources, write saves, call ads, or call Douyin APIs.
- Presentation views may only emit stable `ui_request_*` action IDs and stable ID payloads.
- Button availability must come from gameplay read models or services, not from Cocos node scripts.
- Cocos presenters must bind labels, panels, lists, and click handlers only; disabled actions must not emit requests.
- Reward amounts, costs, multipliers, settlement IDs, save patches, and ad completion flags must never appear in UI request payloads.
