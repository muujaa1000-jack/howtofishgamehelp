import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('content validator reports the launch set and exits cleanly', () => {
  const result = spawnSync(process.execPath, ['scripts/validate-content.mjs'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /35 public guides/);
  assert.match(result.stdout, /0 validation errors/);
});
