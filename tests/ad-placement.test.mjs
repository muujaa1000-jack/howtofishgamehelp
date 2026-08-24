import assert from 'node:assert/strict';
import test from 'node:test';
import {
  splitGuideContentAfterQuickSteps,
  summarizeGuideAdPlacements,
} from '../src/lib/ads/splitGuideContent.ts';

test('splits after every complete node in the Quick steps section', () => {
  const html = [
    '<p>Opening</p>',
    '<h2 id="quick-steps">Quick steps</h2>',
    '<p>Read this first.</p>',
    '<ol><li><a href="/one/">One</a></li><li><code>Two</code></li></ol>',
    '<h2 id="details">Details</h2>',
    '<p>More detail.</p>',
  ].join('');

  const result = splitGuideContentAfterQuickSteps(html, '/guides/example/');

  assert.equal(result.status, 'split');
  assert.match(result.beforeBanner, /<h2 id="quick-steps">Quick steps<\/h2>/);
  assert.match(result.beforeBanner, /<ol><li><a href="\/one\/">One<\/a><\/li><li><code>Two<\/code><\/li><\/ol>$/);
  assert.doesNotMatch(result.beforeBanner, /id="details"/);
  assert.match(result.afterBanner, /^<h2 id="details">Details<\/h2>/);
});

test('skips the banner when Quick steps is missing or not a top-level H2', () => {
  const missing = splitGuideContentAfterQuickSteps('<h2 id="details">Details</h2>', '/guides/missing/');
  const nested = splitGuideContentAfterQuickSteps(
    '<section><h2 id="quick-steps">Quick steps</h2><ol><li>One</li></ol></section><h2 id="details">Details</h2>',
    '/guides/nested/',
  );

  assert.deepEqual(missing, {
    status: 'skipped',
    route: '/guides/missing/',
    reason: 'top-level h2#quick-steps was not found',
  });
  assert.equal(nested.status, 'skipped');
});

test('skips the banner when no following same-level H2 establishes the boundary', () => {
  const result = splitGuideContentAfterQuickSteps(
    '<h2 id="quick-steps">Quick steps</h2><ol><li>One</li></ol>',
    '/guides/no-boundary/',
  );

  assert.deepEqual(result, {
    status: 'skipped',
    route: '/guides/no-boundary/',
    reason: 'the next top-level H2 after Quick steps was not found',
  });
});

test('summary tolerates isolated skips and fails at an 80 percent skip ratio', () => {
  const split = (route) => ({ status: 'split', route, beforeBanner: '<p>A</p>', afterBanner: '<p>B</p>' });
  const skipped = (route) => ({ status: 'skipped', route, reason: 'missing' });

  const isolated = summarizeGuideAdPlacements([
    split('/a/'), split('/b/'), split('/c/'), split('/d/'), skipped('/e/'),
  ]);
  const broadFailure = summarizeGuideAdPlacements([
    split('/a/'), skipped('/b/'), skipped('/c/'), skipped('/d/'), skipped('/e/'),
  ]);

  assert.deepEqual(isolated.skippedRoutes, ['/e/']);
  assert.equal(isolated.shouldFailBuild, false);
  assert.equal(broadFailure.skipRatio, 0.8);
  assert.equal(broadFailure.shouldFailBuild, true);
});
