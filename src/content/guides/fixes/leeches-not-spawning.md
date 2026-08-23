---
title: "Leeches Not Spawning in How to Fish"
description: "Diagnose a missing-leech block on the forest island without inventing a spawn timer, deleting a save, or confusing the ground pickups with fish."
slug: "leeches-not-spawning"
category: "fixes"
primaryIntent: "Troubleshoot missing leech pickups during the Island 2 quest"
publishedAt: 2026-08-23
updatedAt: 2026-08-23
lastVerifiedAt: 2026-08-23
gameVersion: "1.0.5"
verificationStatus: "community-confirmed"
sources:
  - title: "How to Fish Full Island and Boss Progression Walkthrough"
    url: "https://allthings.how/how-to-fish-full-island-and-boss-progression-walkthrough/"
    type: "gameplay-guide"
    accessedAt: 2026-08-23
  - title: "How to Fish Piranha Boss Loadout and Fight Steps"
    url: "https://nerdschalk.com/how-to-fish-piranha-boss/"
    type: "gameplay-guide"
    accessedAt: 2026-08-23
previousGuide: "/islands/island-two-leeches/"
nextGuide: "/bosses/giant-piranha/"
relatedGuides:
  - "/fixes/problems-and-fixes/"
  - "/guides/unlock-next-island/"
  - "/islands/island-three-desert/"
draft: false
noindex: false
answer: "First confirm the forest lady’s request is active and that you are searching ground pickups, not fishing for leeches. Make one slow island sweep while watching the interaction prompt and the live three-leech counter. If the counter remains short after a complete sweep, leave the pickups untouched in future attempts, return to the main menu, reload the same session once, and check again. No reliable respawn interval or destructive save fix was verified for version 1.0.5."
featured: false
priority: "P0"
---

## Quick steps

1. Revisit the lady by the lake and confirm her leech objective is active.
2. Check that the live counter is below three rather than already complete.
3. Walk the whole island and look for ground interaction prompts through tall grass.
4. Ask co-op players to stop picking items up until the host checks the counter.
5. Return to the main menu and reload the same save once if a complete sweep stays short.
6. Preserve the save and report the objective state if the pickups are still absent.

## Confirm the symptom before resetting

The supported fact is narrow: three ground-collected leeches go to the forest lady, who returns Giant Piranha bait. Public sources do not establish a dependable spawn timer, a console command, or a reliable reset. That means the safest troubleshooting page must stay narrow too.

Most false alarms come from searching the water, missing prompts in grass, or collecting before the quest state is visible. A second category is multiplayer state: another player may grab a pickup while the host watches a different part of the island. Check the shared objective before changing sessions.

## Why it may not work

- **Reloading changes nothing:** the missing pickup may be a save-state bug rather than an unloaded object.
- **A player suggests waiting a fixed number of minutes:** no current evidence supports a precise respawn time.
- **Starting a new save seems to work:** that does not repair the affected save and should not be presented as a harmless fix.
- **The counter is already complete:** you need to return to the lady, not find another leech.
- **The bait is missing after hand-in:** check inventory and quest dialogue before re-running the search.

## Solo and co-op notes

Solo diagnosis is simpler because every pickup belongs to one state. In co-op, keep the host stationary near the quest giver while one player searches, then verify each counter increase. If the issue only occurs when joining, test with the affected player hosting a new private lobby without overwriting the original save.

## What to do next

If all three register, continue to [Giant Piranha](/bosses/giant-piranha/). If the state remains blocked, keep the save and use the official bug-report channel rather than deleting progress.
