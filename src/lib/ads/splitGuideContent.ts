import {
  parseFragment,
  serializeOuter,
  type DefaultTreeAdapterTypes,
} from 'parse5';

type ChildNode = DefaultTreeAdapterTypes.ChildNode;
type Element = DefaultTreeAdapterTypes.Element;

export interface GuideContentSplit {
  status: 'split';
  route: string;
  beforeBanner: string;
  afterBanner: string;
}

export interface GuideContentSkip {
  status: 'skipped';
  route: string;
  reason: string;
}

export type GuideContentSplitResult = GuideContentSplit | GuideContentSkip;

export interface GuidePlacementSummary {
  totalRoutes: number;
  skippedRoutes: string[];
  skipRatio: number;
  shouldFailBuild: boolean;
}

function isElement(node: ChildNode): node is Element {
  return 'tagName' in node;
}

function isTopLevelH2(node: ChildNode): node is Element {
  return isElement(node) && node.tagName === 'h2';
}

function elementId(node: Element): string | undefined {
  return node.attrs.find((attribute) => attribute.name === 'id')?.value;
}

function serializeNodes(nodes: ChildNode[]): string {
  return nodes.map((node) => serializeOuter(node)).join('');
}

export function splitGuideContentAfterQuickSteps(
  html: string | undefined,
  route: string,
): GuideContentSplitResult {
  if (!html) {
    return { status: 'skipped', route, reason: 'Astro rendered HTML was unavailable' };
  }

  const fragment = parseFragment(html);
  const nodes = fragment.childNodes;
  const quickStepsIndex = nodes.findIndex(
    (node) => isTopLevelH2(node) && elementId(node) === 'quick-steps',
  );

  if (quickStepsIndex === -1) {
    return { status: 'skipped', route, reason: 'top-level h2#quick-steps was not found' };
  }

  const nextH2Offset = nodes.slice(quickStepsIndex + 1).findIndex(isTopLevelH2);
  if (nextH2Offset === -1) {
    return {
      status: 'skipped',
      route,
      reason: 'the next top-level H2 after Quick steps was not found',
    };
  }

  const splitIndex = quickStepsIndex + 1 + nextH2Offset;
  return {
    status: 'split',
    route,
    beforeBanner: serializeNodes(nodes.slice(0, splitIndex)),
    afterBanner: serializeNodes(nodes.slice(splitIndex)),
  };
}

export function summarizeGuideAdPlacements(
  results: GuideContentSplitResult[],
): GuidePlacementSummary {
  const skippedRoutes = results
    .filter((result): result is GuideContentSkip => result.status === 'skipped')
    .map((result) => result.route);
  const totalRoutes = results.length;
  const skipRatio = totalRoutes === 0 ? 1 : skippedRoutes.length / totalRoutes;

  return {
    totalRoutes,
    skippedRoutes,
    skipRatio,
    shouldFailBuild: totalRoutes === 0 || skipRatio >= 0.8,
  };
}
