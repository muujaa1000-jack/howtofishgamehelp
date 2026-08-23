---
title: "How to Invert Camera Controls in How to Fish"
description: "Use the official 1.0.5 X- and Y-axis inversion settings, confirm the correct look direction, and isolate controller problems without remapping blindly."
slug: "camera-invert-controls"
category: "fixes"
primaryIntent: "Invert horizontal or vertical camera controls in How to Fish"
publishedAt: 2026-08-23
updatedAt: 2026-08-23
lastVerifiedAt: 2026-08-23
gameVersion: "1.0.5"
verificationStatus: "official"
sources:
  - title: "How to Fish Patch 1.0.5"
    url: "https://steamcommunity.com/games/4001890/announcements/detail/1841579228671636"
    type: "official-patch"
    accessedAt: 2026-08-23
  - title: "How to Fish on Steam"
    url: "https://store.steampowered.com/app/4001890/How_to_Fish/"
    type: "official-store"
    accessedAt: 2026-08-23
previousGuide: "/fixes/private-lobby-invites/"
nextGuide: null
relatedGuides:
  - "/fixes/problems-and-fixes/"
  - "/fixes/multiplayer-black-screen/"
  - "/guides/beginner-guide/"
draft: false
noindex: false
answer: "Install version 1.0.5 or later, open the game’s look or camera settings, and enable inversion separately for the X axis, Y axis, or both. X changes horizontal look direction; Y changes vertical look direction. Apply one axis at a time, return to a safe area, and move the mouse or right stick slowly to confirm it feels correct. If the option is absent, update first. If input still behaves unpredictably, test one controller and disable external remapping temporarily."
featured: false
priority: "P2"
---

## Quick steps

1. Close the game and confirm Steam has installed patch 1.0.5 or later.
2. Open the game settings and find the look or camera control section.
3. Enable X-axis inversion only if horizontal look should reverse.
4. Enable Y-axis inversion only if vertical look should reverse.
5. Apply the change and test slowly in a safe, stationary area.
6. If behavior remains wrong, test with one input device and no external remapper.

## Use the two axes independently

The official 1.0.5 notes added separate inversion options for looking around on X and Y. Horizontal inversion changes left and right. Vertical inversion changes up and down. Players who only want flight-style vertical control should invert Y without touching X; enabling both reverses both directions.

The Steam store currently lists full controller support. That confirms controller use is intended, but it does not prove every third-party remapping layer is compatible. If the in-game setting and an external tool both invert the same axis, the two reversals can cancel or produce confusing menu-versus-game behavior.

## Why it may not work

- **No invert option appears:** update the game; the controls were added in patch 1.0.5.
- **Only one direction feels wrong:** change one axis rather than toggling both.
- **The result seems unchanged:** apply or leave the menu, then test in gameplay rather than moving through UI lists.
- **The axis flips twice:** disable Steam Input, driver, or third-party remapping temporarily so only the game setting is active.
- **One controller behaves differently:** unplug extra devices and test one supported input path at a time.

## Solo and co-op notes

Camera settings are local and do not require a multiplayer session. Adjust them in solo or a safe area before joining friends, so a control test does not interrupt a boss or boat sequence. Other players do not need to match your inversion choice.

## What to do next

For startup or joining failures rather than camera direction, return to [problems and fixes](/fixes/problems-and-fixes/) or the focused [multiplayer black screen guide](/fixes/multiplayer-black-screen/).

