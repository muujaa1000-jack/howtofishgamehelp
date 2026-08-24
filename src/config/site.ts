const analyticsId = import.meta.env.PUBLIC_ANALYTICS_ID?.trim() ?? '';
const analyticsIdIsValid = /^G-[A-Z0-9]{8,}$/.test(analyticsId);

export const site = {
  name: 'How to Fish Game Help',
  title: 'How to Fish Game Guides, Bosses, Islands & Fixes',
  description: 'Clear walkthroughs, boss strategies, island progression, achievements, item help, and troubleshooting for How to Fish.',
  url: 'https://howtofishgamehelp.com',
  gameName: 'How to Fish',
  steamAppId: '4001890',
  analyticsEnabled: import.meta.env.PUBLIC_ANALYTICS_ENABLED === 'true' && analyticsIdIsValid,
  analyticsId,
  contactEmailEnabled: import.meta.env.PUBLIC_CONTACT_EMAIL_ENABLED === 'true',
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

export const categoryFieldNotes: Record<CategorySlug, { start: string; route: string[]; caution: string }> = {
  guides: {
    start: 'Begin with the core loop, protect story drops, and spend early money only on tools that solve the next gate.',
    route: ['Learn the lighthouse loop', 'Unlock island travel', 'Prepare for the next story hand-in'],
    caution: 'If a tip depends on a precise timer or drop rate, treat it as patch-sensitive unless a current source confirms it.',
  },
  walkthrough: {
    start: 'Use the route in story order: lighthouse, forest, desert, rocky island, then the volcano endgame.',
    route: ['Finish the current island hand-in', 'Keep the unique boss drop', 'Travel only after the unlock dialogue completes'],
    caution: 'The game may label locations through quests rather than numbered-island names, so these guides use landmarks as well as progression order.',
  },
  islands: {
    start: 'Each island is a compact chain of requests, bait preparation, a boss encounter, and a return hand-in.',
    route: ['Read the local requests', 'Gather the required bait or tool', 'Defeat the gate boss and return the trophy'],
    caution: 'Do not sell, cook, or discard an unfamiliar unique drop until the island hand-in is complete.',
  },
  bosses: {
    start: 'Prepare the correct story bait, improve one dependable weapon, and fight where you can read the boss approach.',
    route: ['Confirm the summon item', 'Learn one safe damage window', 'Collect and return the progression drop'],
    caution: 'Attack timing is supported by current gameplay guides, but balance and edge-case behavior can change after patches.',
  },
  items: {
    start: 'Buy for the next obstacle instead of trying to complete every upgrade path at once.',
    route: ['Protect quest items', 'Upgrade one weapon path', 'Add utility tools when the story calls for them'],
    caution: 'Exact prices and damage values are deliberately omitted where current public evidence is incomplete.',
  },
  achievements: {
    start: 'Finish the story first, then separate collection cleanup from challenge runs that may need a fresh attempt.',
    route: ['Collect story unlocks', 'Review missing Fishipedia entries', 'Plan the hardest challenge conditions separately'],
    caution: 'Steam currently lists 28 achievements, but the list and unlock behavior can change with a game update.',
  },
  fixes: {
    start: 'Try the narrow, confirmed fix first; preserve saves before repeating a workaround or recreating a lobby.',
    route: ['Check the current game version', 'Reproduce once with the simplest setup', 'Use a community workaround only when its limits are clear'],
    caution: 'A workaround is not a permanent fix. Pages distinguish official patch notes, repeated community reports, and unresolved bugs.',
  },
};

export function guidePath(category: CategorySlug, slug: string) {
  return `/${category}/${slug}/`;
}
