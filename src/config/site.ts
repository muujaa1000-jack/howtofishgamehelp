const analyticsId = import.meta.env.PUBLIC_ANALYTICS_ID?.trim() ?? '';
const analyticsIdIsValid = /^G-[A-Z0-9]{8,}$/.test(analyticsId);
const adsenseAccount = import.meta.env.PUBLIC_GOOGLE_ADSENSE_ACCOUNT?.trim() ?? '';
const adsenseAccountIsValid = /^ca-pub-[0-9]{16}$/.test(adsenseAccount);

export const site = {
  name: 'How to Fish Game Help',
  title: 'How to Fish Game Guides, Bosses, Islands & Fixes',
  homeUpdatedAt: '2026-09-08',
  description: 'Clear walkthroughs, boss strategies, island progression, achievements, item help, and troubleshooting for How to Fish.',
  url: 'https://howtofishgamehelp.com',
  gameName: 'How to Fish',
  steamAppId: '4001890',
  analyticsEnabled: import.meta.env.PUBLIC_ANALYTICS_ENABLED === 'true' && analyticsIdIsValid,
  analyticsId,
  adsenseEnabled: import.meta.env.PUBLIC_ADSENSE_ENABLED === 'true' && adsenseAccountIsValid,
  adsenseAccount,
  adsenseAccountIsValid,
  contactEmail: 'contact@howtofishgamehelp.com',
  disclaimer: 'How to Fish Game Help is an independent fan-made guide site and is not affiliated with or endorsed by the game’s developer, publisher, Steam, or Valve.',
} as const;

export const categories = [
  { slug: 'guides', label: 'Guides', description: 'Start How to Fish with a beginner route, difficulty choices, early spending advice, and focused progression guides for your next objective.' },
  { slug: 'walkthrough', label: 'Walkthrough', description: 'Follow the main quest chain from the lighthouse to the end route.' },
  { slug: 'islands', label: 'Islands', description: 'Unlock each destination and understand the item or boss gate in the way.' },
  { slug: 'bosses', label: 'Bosses', description: 'Find the How to Fish boss order, required quest bait, fight strategies, healing preparation, and trophy hand-ins for your next island.' },
  { slug: 'items', label: 'Items', description: 'Find what to keep, buy, upgrade, or use next: weapons, lures, boss bait, radar, grilling, money, and other How to Fish items.' },
  { slug: 'achievements', label: 'Achievements', description: 'Separate story unlocks from cleanup, challenge runs, and collection goals.' },
  { slug: 'fixes', label: 'Fixes', description: 'Find the right How to Fish fix for crashes, black screens, Steam relay errors, private lobbies, save problems, missing leeches, and camera controls.' },
] as const;

export type CategorySlug = (typeof categories)[number]['slug'];

type CategoryFieldNote = {
  start: string;
  route: string[];
  overview: string[];
  patchNote: string;
  caution: string;
};

export const categoryFieldNotes: Record<CategorySlug, CategoryFieldNote> = {
  guides: {
    start: 'Begin with the core loop, protect story drops, and spend early money only on tools that solve the next gate.',
    route: ['Learn the lighthouse loop', 'Unlock island travel', 'Prepare for the next story hand-in'],
    overview: [
      'This section is the best starting point for a new player who needs decisions rather than a complete scene-by-scene route. Begin with the first-island loop, then move to the travel unlock and the immediate next objective. The pages focus on dependencies: which conversation starts the gate, which item must be preserved, and which return step records progress.',
      'Read the beginner guide before buying widely. Early money is more useful when it solves the current quest than when it is spread across every upgrade family. If a boss or island is already named in your objective, follow the focused page instead of repeating the whole introduction.',
      'Difficulty is now a separate decision. Easy, Normal, and Hard change creature health and damage, while the official note does not document alternate quests or rewards. Use the difficulty page to set combat pressure, then return to the same quest sequence. An older walkthrough’s fight length may differ from your selected difficulty.',
      'When progress appears stuck, check the active request, special bait, boss drop, return conversation, keys, and radar in that order. Do not delete a save to solve a missing hand-in. Technical symptoms such as a red relay status or a crash while loading belong in Fixes, where preservation and reporting steps are separated from story advice.',
      'Recommended reading order is intentionally short: Beginner Guide, Difficulty Settings, then Unlock the Next Island. After that, follow the page named by the current objective. This prevents future-island details from being mistaken for the present gate.',
    ],
    patchNote: 'Patch 1.0.9 adds difficulty settings but does not announce a change to the lighthouse or island-unlock sequence. Combat descriptions are therefore patch-sensitive; the documented quest dependencies remain the starting route unless later official evidence says otherwise.',
    caution: 'If a tip depends on a precise timer or drop rate, treat it as patch-sensitive unless a current source confirms it.',
  },
  walkthrough: {
    start: 'Use the route in story order: lighthouse, forest, desert, rocky island, then the volcano endgame.',
    route: ['Finish the current island hand-in', 'Keep the unique boss drop', 'Travel only after the unlock dialogue completes'],
    overview: [
      'Walkthrough pages answer sequence questions: where the main route begins, what each island asks for, and why a boss kill may not be the final trigger. Start with the main story route for the complete chain. Open the lighthouse page when you need the opening in more detail, then switch to the relevant island or boss page instead of reading every guide from the top.',
      'The central pattern is request, preparation, encounter, trophy, and return. Coordinates and vehicles are rewards within that chain. A known destination does not replace an unfinished conversation. When an island fails to advance, reconstruct the last confirmed hand-in before farming more creatures or repeating the boss.',
      'Co-op can make fights quicker while making item custody less obvious. Pick one player to carry every distinctive quest drop, keep the host present for the return conversation, and confirm the next coordinate before the party leaves. Solo players should prepare before consuming special bait because they have no teammate to hold the trophy or create recovery space.',
      'The ending route continues through the volcano objectives, the mutated whale drop, the scientist return, the RHIB key, and starting that boat. Stopping after a dramatic kill is a common source of confusion. Use the island progression overview for a compact gate map and the boss section for encounter-specific movement.',
      'For a first full run, read Main Story Route, then Lighthouse First Island, and keep Island Progression available as the compact checklist. The longer walkthrough explains recovery and uncertainty; the shorter pages help when a single item or conversation is blocking progress.',
    ],
    patchNote: 'The reviewed 1.0.9 announcement changes difficulty and technical diagnostics, not the published five-location story order. Fight length can differ by mode, so prepare for your selected difficulty while following the quest and hand-in sequence.',
    caution: 'The game may label locations through quests rather than numbered-island names, so these guides use landmarks as well as progression order.',
  },
  islands: {
    start: 'Each island is a compact chain of requests, bait preparation, a boss encounter, and a return hand-in.',
    route: ['Read the local requests', 'Gather the required bait or tool', 'Defeat the gate boss and return the trophy'],
    overview: [
      'Use this section when you know the location but not its progression gate. The island progression page gives the complete order, while the focused pages cover forest leeches, the desert request, the rock-island Tuna gate, and the volcano ending. Read only the current location first so later objectives do not obscure the item you need now.',
      'Every island combines exploration with an NPC dependency. Speak before gathering whenever possible, keep named bait and unusual drops, and finish the return dialogue before sailing. This starts with returning Spider Crab’s drop to the lighthouse keeper for the boat keys. Selling, cooking, or discarding an unfamiliar item can turn a short hand-in into a repeat encounter.',
      'The location names used here describe progression order and visible landmarks. The game may not present the same numbered labels in every interface. Links therefore use both the island position and its recognizable objective. Match the terrain and active objective if your game uses a different location label.',
      'If an island cannot progress, decide whether the symptom is content or technical. A missing leech, Carrot, Tuna, trophy, or NPC return belongs to the relevant island page. A save that will not load, a weapon crash, or a red Steam relay status belongs in Fixes. Preserve the save before crossing from route diagnosis into file troubleshooting.',
      'A practical reading order is Island Progression first, followed by the page for the current location. Forest players can continue to Island Two Leeches, desert players to Island Three Desert, rock-island players to Island Four Rocks, and final-route players to Volcano Endgame.',
    ],
    patchNote: 'Patch 1.0.9 does not announce new island gates. Its difficulty modifiers can change the pressure of island creatures and bosses, while the relay and save notes affect how technical failures should be reported.',
    caution: 'Do not sell, cook, or discard an unfamiliar unique drop until the island hand-in is complete.',
  },
  bosses: {
    start: 'Prepare the correct story bait, improve one dependable weapon, and fight where you can read the boss approach.',
    route: ['Confirm the summon item', 'Learn one safe damage window', 'Collect and return the progression drop'],
    overview: [
      'Find your next boss in the fight order, then open its page before spending the quest bait. Each encounter has a preparation step and a progression step after the kill. Keep the distinctive drop until you have returned to the requesting NPC. Leaving it on the ground or selling it can leave the island unfinished even after a successful fight.',
      'Prepare healing, clear nearby threats, and choose a place with enough room to see the approach. Improve one weapon you can use consistently before spreading money across several upgrades. Easy, Normal, and Hard change creature health and damage, so compare advice with your selected mode. A fight that takes longer may leave less room for mistakes or consume more food.',
      'During the fight, watch the approach, leave its line, attack during an opening, then reset your position. Spider Crab gives different openings from Giant Piranha, whose small fish can block your escape. Tuna requires sideways movement around its jump; keep its body afterward because placing it starts the bird encounter. For the whales, bring healing for both fights before beginning the finale.',
      'In co-op, spread far enough to read the target and assign one trophy carrier. Reviving in a persistent hazard or disconnecting before a hand-in can add a second failure after the fight. In solo, prepare before equipping one-use quest bait and keep enough recovery resources to avoid repeating the setup.',
      'Start with Boss Guide if you do not know which encounter comes next. Use the named boss page when you already have its request. If you win but cannot travel onward, return to the island guide and check the trophy and NPC conversation. At the finale, return the mutated whale drop, collect the RHIB key, and start the boat to finish the story.',
    ],
    patchNote: 'Patch 1.0.12 rebalanced Piranha, slightly nerfed Tuna, and says explosives should now damage the final boss even when landing on its tail. Piranha player reports remain mixed. Patch 1.0.10 fixed a respawn failure after dying to Tuna and spawning the albatross.',
    caution: 'Before another attempt, note whether movement, damage, or healing ended the fight, and change one part of the setup.',
  },
  items: {
    start: 'Buy for the next obstacle instead of trying to complete every upgrade path at once.',
    route: ['Protect quest items', 'Upgrade one weapon path', 'Add utility tools when the story calls for them'],
    overview: [
      'Choose an item guide by the obstacle in front of you. Open Early Upgrades when money is limited, Weapon Progression when combat is blocking the route, and Lures and Bait when you cannot trigger a catch. Radar helps with island travel, Grilling with food preparation, and Money with purchases after the required story supplies are secure.',
      'Keep quest items apart from ordinary catches. A Carrot, Tuna body, boss trophy, or key can be needed for the next encounter or NPC return. Read the active request before selling or cooking an unfamiliar named item. In co-op, agree who will carry it and confirm that player is ready before the group sails to another island.',
      'Buy the upgrade that solves the current obstacle and keep enough resources for recovery. If the next step is a boss, prepare a dependable weapon and cooked fish before optional utility purchases. If the next step is travel, confirm the key and coordinates first. Owning a radar helps you follow a destination; it does not unlock an unfinished island gate.',
      'For a lost radar on the forest island, players reported a replacement beneath the signs against the shop post on August 24. That report predates 1.0.12, so current availability and price are unknown. Check the location before considering a restart, and preserve your progress if the item is absent. Use the Radar page for the original lighthouse unlock steps.',
      'At the grill, practice on an ordinary catch and remove it when cooked. Keep rare catches and story trophies away while learning the timing. If you accidentally cook a weapon or tool, dip it in water to clear its cooking state, a feature added in 1.0.10. This does not turn burnt food back into properly cooked fish.',
      'If equipping a weapon crashes the game, stop that action and preserve the save. Record the weapon name and whether the crash happens while selecting, equipping, or loading with it active, then use the save and weapon crash page in Fixes. After the save works again, return to equipment planning with the next quest in mind.',
    ],
    patchNote: 'Patch 1.0.11 fixes Drip Parrotfish cooking and marks dropped weapons with orange dots. It also removes Iron Sight from purchases and blocks a Suppressor-to-Compensator downgrade. Patch 1.0.12 limits item velocity in the hope of reducing item loss.',
    caution: 'Check the displayed price before spending, and keep unique quest items until their hand-in is complete.',
  },
  achievements: {
    start: 'Finish the story first, then separate collection cleanup from challenge runs that may need a fresh attempt.',
    route: ['Collect story unlocks', 'Review missing Fishipedia entries', 'Plan the hardest challenge conditions separately'],
    overview: [
      'Start with the achievement guide to divide the 28 Steam entries listed on September 8 into story, action, equipment, economy, collection, and challenge groups. During the first route, finish NPC hand-ins and take simple interaction goals when they require no detour. Use post-story travel for broad collection and expensive cleanup once required purchases are secure.',
      'Collector and Fishipedia need separate tracking. One concerns ordinary creature coverage and the other Drip variants, so a boss checklist cannot prove either is complete. Record entries by island and check the official Steam condition before repeating a large sweep. Live completion percentages describe player statistics, not an official ranking of difficulty.',
      'Handyman requires a bare-hands final-boss defeat. Older community guides describe gun damage followed by a fist finish; whether that method works in 1.0.12 is unconfirmed. Practicing the finish separately from the one-hour Bean route is optional. If you try it, stop other damage before the punch and check your own Steam unlock afterward.',
      'Co-op can shorten travel and combat, but personal-action triggers may belong to the player who performs them. Have the achievement-seeking player complete the named action and check Steam afterward. For story achievements, keep the relevant quest item with the host party until the return conversation records progress.',
      'Begin with Achievements Guide and Story Achievements during the first route. Open Hardest Achievements when you are ready to prepare a challenge attempt. If a condition remains locked after updating, use Achievement Not Unlocking before repeating a long run. Keep the selected difficulty, save, player role, and exact action in the report, and preserve your completed progress.',
      'Before a long cleanup session, compare the Steam list with your own records and choose one missing group. Keep normal creatures and Drip variants on separate lists so that each new find has a clear place. For Handyman, reports disagree on lobby-wide credit and brass-knuckle eligibility is unknown. Have the player seeking it use bare fists and check each account after the attempt.',
    ],
    patchNote: 'Patches 1.0.4 and 1.0.5 included achievement fixes. Patch 1.0.9 adds difficulty but does not announce new achievements or say that a mode changes eligibility, so that effect remains unknown.',
    caution: 'Steam currently lists 28 achievements, but the list and unlock behavior can change with a game update.',
  },
  fixes: {
    start: 'Identify the failing action, try the matching check, and preserve saves before repeating a workaround or recreating a lobby.',
    route: ['Check the current game version', 'Reproduce once with the simplest setup', 'Record what changed before trying another check'],
    overview: [
      'Use Problems and Fixes first when the symptom is unclear. Then open the page for Steam Cloud sync, a black screen, private lobby, camera control, missing leeches, red Steam relay status, or a save and weapon crash. Match the moment of failure: starting the game, loading a save, joining another player, or performing an action after the session begins.',
      'Preserve state before experimenting. Update the game, record the exact transition, compare solo with co-op only when relevant, and change one reversible variable. Deleting saves, exposing router ports, disabling security controls, or installing unknown repair tools are not safe first steps. A repeatable unchanged result is useful evidence for a developer report.',
      'For a loading crash, record whether the menu opens and whether another existing save loads. For a weapon crash, record the item name and the exact equip transition. Patch 1.0.11 adds pre-load corruption checks and backups, but recovery of an older damaged save remains uncertain. Keep the original if the failure persists after updating.',
      'For multiplayer, record host and joiner roles. A red relay indicator, a black screen, and a save that fails in solo are different symptoms even if they occur in one session. Steam’s Verify Integrity feature checks installed game files; it does not rebuild save progression or inventory. If the check finishes but the crash persists, keep both results in your report.',
      'Branch to Steam Relay when red status appears, Multiplayer Black Screen when the joiner has no image, and Private Lobby Invites for session setup. Use Save Corrupted or Weapon Equip Crash if the failure follows a specific save or item. If a quest seems stuck while the game otherwise works, check the NPC request, bait, trophy, and return dialogue before changing files.',
    ],
    patchNote: 'Patch 1.0.12 adds Steam Cloud: play and exit on the original device to upload an existing save, then wait for sync before switching. It fixes the FPS-cap override on joining and the first-Radio lag spike. MetaVoice 4.3 and item-speed limits are intended to reduce some voice and item-loss bugs. Cloud does not automatically repair corrupted saves.',
    caution: 'If Steam shows a sync conflict, stop and identify the progress you want to keep before choosing a replacement.',
  },
};

export type QuickAnswerLink = {
  label: string;
  href: `/${string}/`;
};

const boatKeys: QuickAnswerLink = {
  label: 'Get the boat keys and unlock Island 2',
  href: '/guides/unlock-next-island/',
};
const radar: QuickAnswerLink = {
  label: 'Find and use the radar',
  href: '/items/radar-guide/',
};
const islandThree: QuickAnswerLink = {
  label: 'Reach and beat Island 3',
  href: '/islands/island-three-desert/',
};
const tuna: QuickAnswerLink = {
  label: 'Tuna boss guide: lure, fight and next step',
  href: '/bosses/tuna/',
};

const steamCloud: QuickAnswerLink = {
  label: 'Sync a save between PC and Steam Deck',
  href: '/fixes/steam-cloud-pc-steam-deck-sync/',
};

export const homeQuickAnswers = [boatKeys, radar, islandThree, tuna, steamCloud] as const;

export const categoryQuickAnswers: Partial<Record<CategorySlug, readonly QuickAnswerLink[]>> = {
  guides: [boatKeys],
  items: [radar],
  islands: [islandThree],
  bosses: [tuna],
  fixes: [steamCloud],
};

export function guidePath(category: CategorySlug, slug: string) {
  return `/${category}/${slug}/`;
}
