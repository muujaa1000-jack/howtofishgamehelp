---
title: "How to Fish Steam Cloud: Sync PC and Steam Deck Saves"
description: "Upload an existing How to Fish save with Patch 1.0.12, wait for Steam Cloud before switching PC or Steam Deck, and handle sync warnings safely."
slug: "steam-cloud-pc-steam-deck-sync"
category: "fixes"
primaryIntent: "Move an existing How to Fish save between PC and Steam Deck through Steam Cloud"
publishedAt: 2026-09-08
updatedAt: 2026-09-08
lastVerifiedAt: 2026-09-08
gameVersion: "1.0.12"
lastSourceReview: 2026-09-08
evidenceThroughVersion: "1.0.12"
firstHandTested: false
patchSensitive: true
adEligible: false
verificationStatus: "official"
sources:
  - title: "How to Fish Steam Cloud Support and Patch 1.0.12"
    url: "https://steamcommunity.com/games/4001890/announcements/detail/698774889153168486"
    type: "official-patch"
    accessedAt: 2026-09-08
    notes: "Existing saves require a play-and-exit cycle on their original device to upload."
  - title: "Steamworks Documentation: Steam Cloud"
    url: "https://partner.steamgames.com/doc/features/cloud"
    type: "official-doc"
    accessedAt: 2026-09-08
    notes: "Steam Cloud synchronizes before and after sessions and can be enabled in Steam settings."
previousGuide: "/fixes/problems-and-fixes/"
nextGuide: "/fixes/save-file-corrupted-or-weapon-crash/"
relatedGuides:
  - "/fixes/problems-and-fixes/"
  - "/fixes/save-file-corrupted-or-weapon-crash/"
draft: false
noindex: false
answer: "How to Fish added Steam Cloud in 1.0.12. On the device that already holds your working save, update the game, play once, and exit normally to trigger its first upload. Leave Steam online and wait for synchronization to finish before opening the game on your PC or Steam Deck. Stop if Steam reports a conflict or failed sync; do not overwrite the only copy. Cloud synchronization does not automatically repair a corrupted save."
featured: true
priority: "P0"
---

## Quick steps

1. Start on the device containing the working progress you want to keep. Let Steam install 1.0.12 or a later available update.
2. Check that Steam Cloud is enabled for the game and Steam is online. Use the same Steam account on the other device.
3. Play How to Fish once on the original device, then quit normally. This is the first-upload step specified by the developer.
4. Keep Steam running and wait until the game's Cloud status shows synchronization has finished. Do not launch the other copy while upload is pending.
5. On the destination PC or Steam Deck, let Steam finish synchronization before starting the game.
6. Check that the expected save and progress are present before continuing. If progress is missing or Steam shows a warning, stop and investigate that state first.

## Why an older save may not appear yet

The [1.0.12 announcement](https://steamcommunity.com/games/4001890/announcements/detail/698774889153168486) adds Cloud storage and explicitly asks players to run and exit the game on the device holding their existing save. Installing the update on a second device alone does not complete that first-upload step.

After quitting, check the game's Cloud status in Steam. A closed game window does not mean the upload has finished. On the destination device, confirm the save contains your expected progress before you continue playing.

## If Steam reports a conflict or failed synchronization

Do not continue a new play session on the other device while synchronization is unresolved. Check that the original device is online, the game has fully closed, and its upload has completed. Follow [Steam's Cloud guidance](https://help.steampowered.com/en/faqs/view/68D2-35AB-09A9-7678) for the warning shown.

If local and cloud copies conflict, identify which device contains the progress you intend to keep and preserve the available copies before choosing a replacement. Do not assume that a cloud copy is always the correct one, or approve an overwrite when you cannot identify the copies.

## Why it may not work

- **The original device has not run the updated game:** complete the developer's play-and-exit step there first, provided its save works.
- **Steam is still uploading or shows a warning:** wait for successful synchronization before switching devices.
- **The destination shows different progress:** stop before saving over it and compare the original device's progress and Cloud status.
- **The save crashes on the original device:** treat that as a save-loading issue, not a reason to force repeated uploads. Use the [save and weapon crash guide](/fixes/save-file-corrupted-or-weapon-crash/).

## Synchronization is different from corruption recovery

Patch 1.0.11 introduced save checks and backups. Patch 1.0.12 adds Cloud synchronization, which moves a save between devices. A synchronized copy can still contain the same loading failure. Preserve it rather than deleting it or replacing it with an empty run.

## Solo and co-op saves

Start with the device that holds the save you want to continue. If you previously joined someone else's lobby, check who hosted it and which device has the expected progress. Steam Cloud does not merge different players' saves. For a co-op discrepancy, record the host and joiner roles before changing files.

## FAQ

### Does How to Fish support Steam Cloud now?

Yes. Steam Cloud was added in 1.0.12. Existing saves need the original-device play-and-exit step for their first upload.

### Can I close the game and immediately switch to Steam Deck?

Wait until Steam finishes synchronization first. Then allow the destination device to sync before launching and confirm the expected progress.

### Will Cloud fix a corrupted save?

No automatic repair comes with synchronization. If the original save fails to load, a synced copy may fail too. Stop at a load failure or unresolved conflict and preserve the copies you have.

## What to do next

For a save that exists but will not load, use [save corruption and weapon-equip crashes](/fixes/save-file-corrupted-or-weapon-crash/). For lobby, sound, or frame-rate symptoms, return to [problems and fixes](/fixes/problems-and-fixes/).
