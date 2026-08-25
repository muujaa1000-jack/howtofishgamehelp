---
title: "How to Host a Private Lobby in How to Fish"
description: "Use the official 1.0.5 private-lobby option, send Steam invites, and change session type safely without confusing a required restart with a failed invite."
slug: "private-lobby-invites"
category: "fixes"
primaryIntent: "Create an invite-only How to Fish lobby and troubleshoot joining"
publishedAt: 2026-08-23
updatedAt: 2026-08-25
lastVerifiedAt: 2026-08-23
gameVersion: "1.0.5"
lastSourceReview: 2026-08-25
evidenceThroughVersion: "1.0.9"
firstHandTested: false
patchSensitive: true
adEligible: false
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
  - title: "How to Fish Patch 1.0.9"
    url: "https://steamcommunity.com/games/4001890/announcements/detail/711158520539514352"
    type: "official-patch"
    accessedAt: 2026-08-25
previousGuide: "/fixes/multiplayer-black-screen/"
nextGuide: "/fixes/camera-invert-controls/"
relatedGuides:
  - "/fixes/problems-and-fixes/"
  - "/guides/beginner-guide/"
  - "/walkthrough/story-walkthrough/"
draft: false
noindex: false
answer: "Update to 1.0.5, choose the private or invite-only option while creating the session, then invite friends through the supported Steam flow. A private lobby cannot be browsed like a public one; joining depends on the invite. Patch 1.0.5 also allows changing session type in server settings while in-game, but the official note says that change requires a restart. If an invite appears ineffective, restart the session after changing type and test with one joiner first."
featured: false
priority: "P2"
---

## Quick steps

1. Confirm every player has the 1.0.5 update or later.
2. Create a new session and choose the private, invite-only setting.
3. Use a plain server name while testing.
4. Send a Steam invite to one friend and wait for that join to finish.
5. Add more players only after the first connection succeeds.
6. If you change session type in server settings, restart as the patch note requires.

## Private means invite-only

Patch 1.0.5 introduced a lobby type that is joinable only through invites. That is useful for friends who do not want random players and for diagnosing join problems with fewer variables. It also explains why a friend may not find the session in a public list: discovery is not the expected path.

The patch adds an in-game session-type control but explicitly says a restart is required after changing it. Do not keep sending invites to a session that has not restarted after the switch. Recreate or restart once, then test one clean invite.

## Why it may not work

- **The private option is missing:** one or more players may still be on a pre-1.0.5 build.
- **Friends cannot browse the lobby:** invite-only sessions require the invite path.
- **Changing the type has no immediate effect:** restart the session as documented.
- **The joiner sees a black screen:** apply the separate 1.0.4/1.0.5 join-screen troubleshooting flow.
- **An old server name contains special characters:** use a plain name for the new test because 1.0.4 identified a filename issue.

## Solo and co-op notes

There is no invite flow in solo, but a solo load proves the host can open the save. In co-op, keep the first test to one host and one joiner. Once stable, invite the rest of the party and verify quest state before continuing progression.

## Check relay status before recreating the lobby

If patch 1.0.9 shows a red Steam relay status, record who sees it and when before changing invite or lobby settings. Rebuilding the lobby may create a useful comparison, but it is not proof that the invite itself caused the relay failure. Follow the [relay diagnostic guide](/fixes/steam-relay-connection-failed/) and keep the host, joiner, and game versions explicit.

## What to do next

If the screen fails during the join, use [multiplayer black screen](/fixes/multiplayer-black-screen/). For a broader diagnostic checklist, return to [problems and fixes](/fixes/problems-and-fixes/).
