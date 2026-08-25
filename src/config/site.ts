const adsenseAccount = import.meta.env.PUBLIC_GOOGLE_ADSENSE_ACCOUNT?.trim() ?? '';
const adsenseAccountIsValid = /^ca-pub-[0-9]{16}$/.test(adsenseAccount);

export const site = {
  name: 'How to Fish Game Help',
  title: 'How to Fish Game Guides, Bosses, Islands & Fixes',
  description: 'Clear walkthroughs, boss strategies, island progression, achievements, item help, and troubleshooting for How to Fish.',
  url: 'https://howtofishgamehelp.com',
  gameName: 'How to Fish',
  steamAppId: '4001890',
  adsenseEnabled: import.meta.env.PUBLIC_ADSENSE_ENABLED === 'true' && adsenseAccountIsValid,
  adsenseAccount,
  adsenseAccountIsValid,
  contactEmail: 'contact@howtofishgamehelp.com',
  disclaimer: 'How to Fish Game Help is an independent fan-made guide site and is not affiliated with or endorsed by the game’s developer, publisher, Steam, or Valve.',
} as const;

export const categories = [
  { slug: 'guides', label: 'Guides', description: 'Start clean, learn the core loop, and make early choices with fewer resets.' },
  { slug: 'walkthrough', label: 'Walkthrough', description: 'Follow the main quest chain from the lighthouse to the end route.' },
  { slug: 'islands', label: 'Islands', description: 'Unlock each destination and understand the item or boss gate in the way.' },
  { slug: 'bosses', label: 'Bosses', description: 'Prepare the bait, read the attack, preserve the trophy, and keep moving.' },
  { slug: 'items', label: 'Items', description: 'Spend carefully on weapons, lures, radar, upgrades, and useful resources.' },
  { slug: 'achievements', label: 'Achievements', description: 'Separate story unlocks from cleanup, challenge runs, and collection goals.' },
  { slug: 'fixes', label: 'Fixes', description: 'Try confirmed fixes first and keep patch-sensitive workarounds clearly labeled.' },
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
      'Read the beginner guide before buying widely. Early money is more useful when it solves the current quest than when it is spread across every upgrade family. If a boss or island is already named in your objective, follow the focused page instead of repeating the whole introduction. Each card below states one main problem so the section remains a route, not a list of keyword variations.',
      'Difficulty is now a separate decision. Easy, Normal, and Hard change creature health and damage, while the official note does not document alternate quests or rewards. Use the difficulty page to set combat pressure, then return to the same quest sequence. Older route pages retain their original evidence label even when their sources were reviewed against the newer patch.',
      'When progress appears stuck, check the active request, special bait, boss drop, return conversation, keys, and radar in that order. Do not delete a save to solve a missing hand-in. Technical symptoms such as a red relay status or a crash while loading belong in Fixes, where preservation and reporting steps are separated from story advice.',
      'Recommended reading order is intentionally short: Beginner Guide, Difficulty Settings, then Unlock the Next Island. After that, follow the page named by the current objective. This prevents future-island details from being mistaken for the present gate and keeps each guide useful as a direct answer rather than a thin recap of the same route.',
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
      'For a first full run, read Main Story Route, then Lighthouse First Island, and keep Island Progression available as the compact checklist. The longer walkthrough explains recovery and uncertainty; the shorter pages help when a single item or conversation is blocking progress. None of them should be read as evidence of an independent site playtest.',
    ],
    patchNote: 'The reviewed 1.0.9 announcement changes difficulty and technical diagnostics, not the published five-location story order. Fight length can differ by mode, so this Hub avoids unsupported damage thresholds and keeps route evidence separate from balance.',
    caution: 'The game may label locations through quests rather than numbered-island names, so these guides use landmarks as well as progression order.',
  },
  islands: {
    start: 'Each island is a compact chain of requests, bait preparation, a boss encounter, and a return hand-in.',
    route: ['Read the local requests', 'Gather the required bait or tool', 'Defeat the gate boss and return the trophy'],
    overview: [
      'Use this section when you know the location but not its progression gate. The island progression page gives the complete order, while the focused pages cover forest leeches, the desert request, the rock-island Tuna gate, and the volcano ending. Read only the current location first so later objectives do not obscure the item you need now.',
      'Every island combines exploration with an NPC dependency. Speak before gathering whenever possible, keep named bait and unusual drops, and finish the return dialogue before sailing. Selling, cooking, or discarding an unfamiliar item can turn a short hand-in into a repeat encounter. The guides avoid universal spawn timers and drop rates where the evidence does not establish them.',
      'The location names used here describe progression order and visible landmarks. The game may not present the same numbered labels in every interface. Links therefore use both the island position and its recognizable objective. This makes the route useful without pretending that an editorial name is an official map label.',
      'If an island cannot progress, decide whether the symptom is content or technical. A missing leech, Carrot, Tuna, trophy, or NPC return belongs to the relevant island page. A save that will not load, a weapon crash, or a red Steam relay status belongs in Fixes. Preserve the save before crossing from route diagnosis into file troubleshooting.',
      'A practical reading order is Island Progression first, followed by the page for the current location. Forest players can continue to Island Two Leeches, desert players to Island Three Desert, rock-island players to Island Four Rocks, and final-route players to Volcano Endgame. This order mirrors player decisions instead of creating near-duplicate pages for every wording of an island question.',
    ],
    patchNote: 'Patch 1.0.9 does not announce new island gates. Its difficulty modifiers can change the pressure of island creatures and bosses, while the relay and save notes affect how technical failures should be reported.',
    caution: 'Do not sell, cook, or discard an unfamiliar unique drop until the island hand-in is complete.',
  },
  bosses: {
    start: 'Prepare the correct story bait, improve one dependable weapon, and fight where you can read the boss approach.',
    route: ['Confirm the summon item', 'Learn one safe damage window', 'Collect and return the progression drop'],
    overview: [
      'Boss pages are organized around the full progression gate, not only combat. Start with the boss guide to identify the story order, then open the named encounter for its trigger, preparation, movement, trophy, and hand-in. A victory that leaves the unique item behind does not complete the island route described by the reviewed walkthrough evidence.',
      'Preparation should be practical rather than numeric. Carry healing, choose terrain that leaves room to move, and use a weapon you can operate consistently. The sources do not establish universal health totals, damage thresholds, or ideal kill times, and the 1.0.9 difficulty modifiers make fixed estimates even less transferable.',
      'Most encounters reward one readable cycle: identify the approach, leave its line, use a safe window, then reset. The exact pattern differs for Spider Crab, Giant Piranha, Pufferfish, the terrorizing bird, and the whale encounters. Focused pages distinguish source-supported behavior from editorial safety advice instead of presenting every tactic as developer-confirmed.',
      'In co-op, spread far enough to read the target and assign one trophy carrier. Reviving in a persistent hazard or disconnecting before a hand-in can add a second failure after the fight. In solo, prepare before equipping one-use quest bait and keep enough recovery resources to avoid repeating the setup.',
      'Recommended reading starts with the complete Boss Guide, then moves to the named encounter in story order. Use the Pufferfish page when you need the most detailed example of terrain, healing, difficulty boundaries, recovery, and hand-in logic. Return to the island or walkthrough section after the trophy is secure, because combat completion and route completion are separate checks.',
    ],
    patchNote: 'Easy reduces creature health by 25% and creature damage by 50%; Hard increases both health and damage by 25%; Normal keeps the earlier balance. These official modifiers do not supply base boss values or different quest rewards.',
    caution: 'Attack timing is supported by current gameplay guides, but balance and edge-case behavior can change after patches.',
  },
  items: {
    start: 'Buy for the next obstacle instead of trying to complete every upgrade path at once.',
    route: ['Protect quest items', 'Upgrade one weapon path', 'Add utility tools when the story calls for them'],
    overview: [
      'Item guides help decide what to keep, buy, improve, or use next. Begin with early upgrades if money is limited, weapon progression if combat is the gate, and lures and bait when a specific catch or boss trigger is unclear. Radar, grilling, and money pages address one utility each so their advice can be followed without reading a broad inventory encyclopedia.',
      'Quest items deserve different treatment from ordinary stock. A Carrot, Tuna used as encounter bait, boss trophy, key, or other distinctive object may represent progression rather than sale value. Protect unfamiliar named items until the current NPC return is complete. The site does not publish an exact value merely because another guide lists one; prices and damage stay omitted when reliable current evidence is incomplete.',
      'A focused upgrade is usually safer than buying across every category. Solve the immediate obstacle, retain a recovery buffer, and add utility when the route calls for it. Difficulty settings can change how much combat preparation feels necessary, but the official 1.0.9 note does not announce different shop prices, drops, or rewards.',
      'If equipping a weapon crashes the game, stop treating it as an equipment-choice question. Preserve the save, avoid repeating the transition, and move to the dedicated Fixes page. Installation-file verification and save recovery are different tasks, and no item recommendation should encourage overwriting the only evidence of an unresolved crash.',
      'A sensible reading order is Early Upgrades, Weapon Progression, then the utility page required by the current objective: Lures and Bait, Radar, Grilling, or Money. This section does not manufacture separate pages for every weapon or fish. A new page should exist only when it solves an independently useful question with enough evidence to support the answer.',
    ],
    patchNote: 'Patch 1.0.9 changes creature health and damage by mode and still requests reports about some weapon-equip crashes. It does not publish new item values, so this Hub keeps exact prices and damage outside the evidence boundary.',
    caution: 'Exact prices and damage values are deliberately omitted where current public evidence is incomplete.',
  },
  achievements: {
    start: 'Finish the story first, then separate collection cleanup from challenge runs that may need a fresh attempt.',
    route: ['Collect story unlocks', 'Review missing Fishipedia entries', 'Plan the hardest challenge conditions separately'],
    overview: [
      'Start with the achievement guide to divide the reviewed 28 Steam entries into story, action, equipment, economy, collection, and challenge groups. During the first route, let story achievements unlock through normal hand-ins and collect simple interactions without derailing progression. Post-story access is better for broad collection and expensive cleanup.',
      'Collector and Fishipedia need separate tracking. One concerns ordinary creature coverage and the other Drip variants, so a boss checklist cannot prove either is complete. Record entries by island and check the official Steam condition before repeating a large sweep. Live completion percentages describe player statistics, not an official ranking of difficulty.',
      'Handyman and Bean are clearer as separate attempts. A restricted final encounter and a one-hour completion route reward conflicting preparation. Use a preserved main save for ordinary cleanup and a controlled attempt for conditions that can become ambiguous. Do not delete completed progress because one trigger failed.',
      'Co-op can shorten travel and combat, but personal-action triggers may belong to the player who performs them. Have the achievement-seeking player complete the named action and check Steam afterward. For story achievements, keep the relevant quest item with the host party until the return conversation records progress.',
      'Recommended reading begins with Achievements Guide and Story Achievements. Use Hardest Achievements only after the route is stable, and open Achievement Not Unlocking when a specific trigger remains absent after updating. Keep the selected difficulty, save, player role, and exact condition in any report. The official list is the authority; this section organizes it without inventing hidden requirements.',
      'Before a long cleanup session, compare the Steam list with your own records and choose one missing group. Finishing a clear group is easier to diagnose than mixing collection, money, stunt, and timed conditions in one run. Keep uncertain co-op ownership and patch-sensitive behavior visible instead of presenting a guessed trigger as settled fact.',
    ],
    patchNote: 'Patches 1.0.4 and 1.0.5 included achievement fixes. Patch 1.0.9 adds difficulty but does not announce new achievements or say that a mode changes eligibility, so that effect remains unknown.',
    caution: 'Steam currently lists 28 achievements, but the list and unlock behavior can change with a game update.',
  },
  fixes: {
    start: 'Try the narrow, confirmed fix first; preserve saves before repeating a workaround or recreating a lobby.',
    route: ['Check the current game version', 'Reproduce once with the simplest setup', 'Use a community workaround only when its limits are clear'],
    overview: [
      'Use the troubleshooting index first when the symptom is unclear. Then move to the narrow page for a black screen, private lobby, camera control, missing leeches, red Steam relay status, or save and weapon crash. Each page separates developer patch statements, official platform tools, community observations, and editorial diagnosis so one evidence level is not mistaken for another.',
      'Preserve state before experimenting. Update the game, record the exact transition, compare solo with co-op only when relevant, and change one reversible variable. Deleting saves, exposing router ports, disabling security controls, or installing unknown repair tools are not safe first steps. A repeatable unchanged result is useful evidence for a developer report.',
      'Patch wording matters. “Fixed” is a developer claim about a release, not proof for every machine. “Hopefully fixed” is explicitly qualified. Patch 1.0.9 uses that caution for corruption while still asking players to report saves that crash during loading or when a weapon is equipped. This section keeps those statements together.',
      'For multiplayer, record host and joiner roles. A red relay indicator, a black screen, and a save that fails in solo are different observations even if they occur in one session. For installation problems, Steam’s Verify Integrity feature checks game files; it should not be described as a universal save repair.',
      'Recommended reading starts with Problems and Fixes. Branch to Steam Relay when red status appears, Multiplayer Black Screen when the joiner has no image, Private Lobby Invites for session setup, or Save Corrupted or Weapon Equip Crash for preserved-data diagnosis. Return to the index instead of combining several remedies when the symptom changes.',
    ],
    patchNote: 'Patch 1.0.9 adds a red Steam relay diagnostic and requests reports when it appears. It also uses qualified language for save corruption and names remaining load or weapon-equip crashes. The current pages preserve those limits.',
    caution: 'A workaround is not a permanent fix. Pages distinguish official patch notes, repeated community reports, and unresolved bugs.',
  },
};

export function guidePath(category: CategorySlug, slug: string) {
  return `/${category}/${slug}/`;
}
