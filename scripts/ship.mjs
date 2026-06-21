#!/usr/bin/env node
// Ship a content change end-to-end on a fresh branch: stage → local checks →
// commit → push → open PR → wait for CI → squash-merge → delete branch →
// back to main. Designed for the common case of editing content/*.json.
//
//   npm run ship -- <branch-name> [commit message...]
//
// Examples:
//   npm run ship -- add-fta-project
//   npm run ship -- fix-lol-slug "Fix League of Legends slug 2026 -> 2025"
//
// If no commit message is given, the branch name (spaces for dashes) is used.
// Local checks (lint, format:check, test, build) run before anything is pushed;
// if any fail, the script stops and nothing leaves your machine.

import { execFileSync, spawnSync } from 'node:child_process';

const [branch, ...messageParts] = process.argv.slice(2);

if (!branch || branch.startsWith('-')) {
  console.error('Usage: npm run ship -- <branch-name> [commit message...]');
  process.exit(1);
}

const commitMessage =
  messageParts.join(' ').trim() ||
  branch.replace(/[-_]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

// Run a command, streaming its output. Throws (non-zero exit) on failure.
function run(cmd, args, opts = {}) {
  console.log(`\n$ ${cmd} ${args.join(' ')}`);
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: false, ...opts });
  if (result.status !== 0) {
    throw new Error(`Command failed (exit ${result.status}): ${cmd} ${args.join(' ')}`);
  }
}

// Capture stdout of a command as a trimmed string.
function capture(cmd, args) {
  return execFileSync(cmd, args, { encoding: 'utf8' }).trim();
}

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

// --- preflight ------------------------------------------------------------

const currentBranch = capture('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
if (currentBranch !== 'main') {
  fail(`Run this from main (you're on "${currentBranch}"). Stash or finish that work first.`);
}

const staged = capture('git', ['status', '--porcelain']);
if (!staged) {
  fail('No changes to ship — edit some content first.');
}

// Refuse to clobber an existing branch of the same name.
const existing = spawnSync('git', ['rev-parse', '--verify', '--quiet', branch], {
  stdio: 'ignore',
});
if (existing.status === 0) {
  fail(`Branch "${branch}" already exists. Pick another name or delete it.`);
}

console.log(`Shipping "${branch}" — commit: "${commitMessage}"`);

// --- local checks (same as CI) -------------------------------------------

try {
  run('npm', ['run', 'lint']);
  run('npm', ['run', 'format:check']);
  run('npm', ['test']);
  run('npm', ['run', 'build']);
} catch (err) {
  fail(`Local checks failed — nothing pushed. ${err.message}`);
}

// --- branch, commit, push -------------------------------------------------

try {
  run('git', ['switch', '-c', branch]);
  run('git', ['add', '-A']);
  run('git', ['commit', '-m', commitMessage]);
  run('git', ['push', '-u', 'origin', branch]);
} catch (err) {
  fail(`Git step failed: ${err.message}`);
}

// --- PR, wait for CI, merge ----------------------------------------------

try {
  run('gh', ['pr', 'create', '--fill', '--base', 'main', '--head', branch]);

  console.log('\nWaiting for CI to pass on the PR (this can take a couple of minutes)...');
  // --auto squash-merges as soon as required checks pass; --delete-branch cleans up.
  // We still poll the checks so the script blocks until it's actually done.
  run('gh', ['pr', 'merge', branch, '--squash', '--delete-branch', '--auto']);

  // Block until checks resolve, surfacing failures.
  run('gh', ['pr', 'checks', branch, '--watch', '--fail-fast']);
} catch (err) {
  fail(
    `PR/merge step failed: ${err.message}\n` +
      `Your branch is pushed — check the PR on GitHub. Run \`gh pr view ${branch} --web\`.`,
  );
}

// --- back to main ---------------------------------------------------------

try {
  run('git', ['switch', 'main']);
  run('git', ['pull', '--ff-only']);
  // Local copy of the merged branch (kept by --auto on the remote only).
  spawnSync('git', ['branch', '-D', branch], { stdio: 'ignore' });
} catch (err) {
  fail(`Merged OK, but returning to main failed: ${err.message}`);
}

console.log(`\n✔ Done. "${commitMessage}" is merged to main and deploying on Vercel.`);
