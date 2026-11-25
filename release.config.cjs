/**
 * Default semantic-release config for MLV-WIP consumers.
 * prepareCmd / git assets come from env set by the reusable workflow.
 */
const prepareCmd = process.env.RELEASE_PREPARE_CMD || '';
const gitAssets = (process.env.RELEASE_GIT_ASSETS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const plugins = [
  [
    '@semantic-release/commit-analyzer',
    {
      preset: 'conventionalcommits',
    },
  ],
  [
    '@semantic-release/release-notes-generator',
    {
      preset: 'conventionalcommits',
    },
  ],
];

if (prepareCmd) {
  plugins.push([
    '@semantic-release/exec',
    {
      prepareCmd,
    },
  ]);
}

if (gitAssets.length > 0) {
  plugins.push([
    '@semantic-release/git',
    {
      assets: gitAssets,
      message:
        'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    },
  ]);
}

plugins.push('@semantic-release/github');

module.exports = {
  branches: ['main'],
  tagFormat: 'v${version}',
  plugins,
};
