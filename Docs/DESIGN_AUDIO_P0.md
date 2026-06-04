# DESIGN_AUDIO_P0

## Multi-Agent Decision

This pass used the requested A/B/C/D/E workflow:

- Agent A proposed a broad audio concept with music, ambience, SFX, and voice.
- Agent B cut the scope down for Douyin mini-game package safety and repetition control.
- Agent C first locked P0 as audio system skeleton, core feedback SFX, and one short train ambience placeholder.
- Agent D researched free/commercial resource routes and confirmed that every downloaded asset needs per-file license tracking.
- Agent E refined procedural synthesis and P0+ event-variant recipes.
- Follow-up P0+ decision: keep event-level weighted variants and runtime jitter; allow ElevenLabs Creator voice only as offline, low-frequency, replaceable assets.

## P0 Scope

P0 audio must support the first playable loot-box train loop without long music or unmanaged assets. P0+ adds event-level variants to reduce repetition fatigue.

Required:

- Config-driven audio cues, mixer buses, budget, and license manifest.
- Stable audio event IDs used by gameplay and UI instead of direct file paths.
- Short SFX for UI, loot box, reward, combat hit, enemy break, train module upgrade, ad reward drop, and stage clear.
- One short loop placeholder for train idle ambience.
- Package-size validation and source/license tracking.

Deferred beyond P0+:

- Menu BGM, combat BGM, boss BGM.
- Layered real Foley ambience and professional train recordings.
- Dynamic music, chapter music, skin audio, event audio.

Allowed in P0+:

- ElevenLabs Creator voice as an offline asset-production step only.
- Runtime must only play exported local/remote audio files; it must never call ElevenLabs.
- Voice lines must remain low-frequency, short, configurable, and replaceable with non-voice cues.

## P0+ Event Variant List

| Event ID | Variants | Status | Use |
|---|---|---|---|
| `audio_ui_tap_metal` | 4 | release-ready | General tap |
| `audio_ui_confirm_steam` | 3 | release-ready | Confirm, collect, equip |
| `audio_lootbox_open_mech` | 3 | release-ready | Loot box mechanical open |
| `audio_lootbox_reward_spark` | 4 | release-ready | Reward reveal sparkle |
| `audio_combat_hit_iron` | 5 | release-ready | Light combat hit |
| `audio_combat_enemy_break` | 3 | release-ready | Enemy death/break |
| `audio_train_module_upgrade` | 3 | release-ready | Train module upgrade |
| `audio_ad_reward_drop` | 2 | release-ready | Ad reward drop |
| `audio_stage_clear_whistle` | 2 | placeholder | Stage clear whistle |
| `audio_train_loop_idle` | 2 | placeholder | Short train idle loop |

## Runtime Rules

- Runtime files must be `.ogg`, mono, 44.1 kHz.
- `.wav` files are only allowed as temporary generation intermediates and must not remain in the repo.
- P0+ generated runtime audio target is `<= 384 KB`.
- Main package audio target is `<= 1.5 MB`; hard limit is `<= 2 MB`.
- Single SFX target is `<= 80 KB`.
- Short loop target is `<= 80 KB` for this generated placeholder pass.
- High-frequency events must use cooldown, weighted variants, no-immediate-repeat down-weighting, and pitch/volume/pan jitter.
- Placeholder cues must not be tagged as `main` package assets.
- Maximum variants per event: `5`.

## Resource Research

Preferred future resource routes:

- Kenney assets: CC0 game audio, suitable for UI and short game feedback.
- Freesound: useful only when each file is checked; prefer CC0, use CC BY only with attribution, avoid non-commercial licenses.
- itch.io CC0 sound effects: useful with per-asset license confirmation.
- FreePD: possible CC0 music source for P1 temporary BGM.
- OpenGameArt: license is mixed, so use only clearly compatible entries.
- Sonniss GDC bundle: useful commercial Foley route if the project keeps license proof and does not import the full pack.
- Mixkit and Pixabay: useful supplements, but still record license/source and avoid standalone redistribution issues.

ElevenLabs Creator is allowed for offline P0+ voice production. The current script requires `ELEVENLABS_API_KEY`, uses the configured default voice unless `ELEVENLABS_VOICE_ID` overrides it, generates Mandarin speech with `eleven_multilingual_v2`, then converts it to mono radio-style `.ogg`. API keys must never enter source, configs, logs, screenshots, or client builds.

## P0+ Voice Direction

Agent C locked the P0+ voice direction after Agent A/B review:

- Main voice: adult neutral Mandarin dispatcher, clear, restrained, slightly tired, low-mid tone, old train radio texture.
- Backup voice: adult male low-mid Mandarin train announcer, dry and authoritative, still functional rather than cinematic.
- Search terms: `calm`, `low`, `deep`, `radio`, `broadcast`, `announcer`, `narrator`, `serious`, `mature`, `command`, `Mandarin`, `Chinese`.
- Reject: child or teen voice, ASMR or whisper, sexy AI voice, crying or screaming, trailer voice, villain voice, strong accent, comedy, dramatic acting, multi-role skit delivery.
- Text style: short dispatch lines, not cinematic dialogue, fear pressure, or ad coercion.

The machine-readable profile lives in `configs/audio/ElevenLabsVoiceProfile.json`. The generation tool reads this config for selected voice, model, language, voice settings, output format, and ffmpeg post-processing.

Selected P0+ voice:

```text
River - Relaxed, Neutral, Informative
Voice ID: SAz9YHcvj6GT2YYXdXww
Reason: closest available default voice to the approved neutral dispatcher direction.
```

Current P0+ voice lines:

| Event ID | Text |
|---|---|
| `audio_voice_stage_depart` | `列车启动，进入废轨区。` |
| `audio_voice_stage_clear` | `威胁清除，物资入库。` |
| `audio_voice_loot_rare` | `发现高价值货箱。` |
| `audio_voice_module_upgrade` | `模块接入，功率上升。` |
| `audio_voice_ad_reward` | `补给空投已抵达。` |
| `audio_voice_threat_warning` | `前方热源接近，准备撞击。` |

Local generation must set secrets only in the shell environment:

```text
$env:ELEVENLABS_API_KEY="..."
npm run generate:voice:elevenlabs
```

`ELEVENLABS_VOICE_ID` is optional and may override the configured default voice for tests or future replacement passes.

If a key has been pasted into chat, logs, screenshots, or source control, revoke it in ElevenLabs and create a new one before release generation.

Generated P0+ voice assets:

| Cue ID | Size |
|---|---:|
| `vo_radio_ad_reward_zh_001` | 15,497 bytes |
| `vo_radio_loot_rare_zh_001` | 17,113 bytes |
| `vo_radio_module_upgrade_zh_001` | 20,452 bytes |
| `vo_radio_stage_clear_zh_001` | 18,799 bytes |
| `vo_radio_stage_depart_zh_001` | 20,659 bytes |
| `vo_radio_threat_warning_zh_001` | 25,070 bytes |

## Validation

Use:

```text
npm run generate:audio:p0
npm run generate:voice:elevenlabs
npm run validate:audio
npm run validate:configs
npm run check
npm test
```

`validate:audio` checks cue config, event references, file existence, extension policy, per-file budget, generated P0+ total size, voice budget, unreferenced cues, and main package audio size.

## Source Links

- Cocos Creator 3.8 audio assets: https://docs.cocos.com/creator/3.8/manual/en/asset/audio.html
- Kenney support/license route: https://kenney.nl/support
- Freesound license FAQ: https://freesound.org/help/faq/
- ElevenLabs generated-content publishing terms: https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform
- ElevenLabs supported languages: https://help.elevenlabs.io/hc/en-us/articles/13313366263441-What-languages-do-you-support
