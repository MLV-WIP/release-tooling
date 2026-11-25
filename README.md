# MLV-WIP/release-tooling

Shared **semantic-release** + **commitlint** tooling for MLV-WIP repos — GitLab-style “include a central CI project,” adapted to GitHub **reusable workflows**.

Peer of `slab-pool-allocator` and `mlvlib` under `~/dev/projects/mlv-wip/`.

## Publish this repo

1. Create empty GitHub repo `MLV-WIP/release-tooling` (if not already).
2. Push this tree to `main`.
3. Tag SemVer (consumers pin e.g. `@v1.1.0`).
4. In each consumer, use thin workflow wrappers.

**Caller permissions (required):** a nested reusable job cannot request more
`GITHUB_TOKEN` scope than the calling job grants. Granting less fails the run
at startup (`conclusion: startup_failure`, UI: “workflow file issue”, no jobs/
logs). Match the reusable job’s scopes on the caller job (and workflow):

| Reusable workflow | Caller must grant |
|-------------------|-------------------|
| `semantic-release.yml` | `contents: write`, `issues: write`, `pull-requests: write` |
| `commitlint.yml` | `contents: read`, `pull-requests: read` |

### Release pushes and branch rulesets

`GITHUB_TOKEN` / `github-actions[bot]` **cannot** be a ruleset bypass actor.
To commit in-tree version files (and tags) to a protected `main`, consumers need:

1. A GitHub App (e.g. `mlv-release-bot`) with **Contents: Read and write** (plus Issues/PRs write if you want release comments).
2. App installed on the consumer repo.
3. App on the `main` ruleset **Bypass** list (Always allow).
4. An Environment (default name `mlv-release-bot-env`) on the consumer with:
   - Variable `RELEASE_APP_CLIENT_ID` = App **Client ID** string (`Iv23…`), not numeric App ID
   - Secret `RELEASE_APP_PRIVATE_KEY` = full PEM

The reusable Release job sets `environment: mlv-release-bot-env` (override with
input `github-app-environment`), mints an install token via
`actions/create-github-app-token`, and uses that token for `actions/checkout`
and for semantic-release’s `GITHUB_TOKEN` env.

```yaml
permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  release:
    permissions:
      contents: write
      issues: write
      pull-requests: write
    uses: MLV-WIP/release-tooling/.github/workflows/semantic-release.yml@v1.1.0
    with:
      verified-sha: ${{ github.event.workflow_run.head_sha }}
      prepare-command: "python3 scripts/set-version.py ${nextRelease.version}"
      git-assets: spallocator/version.hpp
      # optional; default is mlv-release-bot-env
      # github-app-environment: mlv-release-bot-env
    secrets: inherit
```

```yaml
permissions:
  contents: read
  pull-requests: read

jobs:
  commitlint:
    uses: MLV-WIP/release-tooling/.github/workflows/commitlint.yml@v1.1.0
    with:
      print-git-describe: true
```

## What lives here vs in consumers

| Shared (`release-tooling`) | Per consumer |
|----------------------------|--------------|
| `package.json` + lockfile, Node deps | No Node project required |
| Default `release.config.cjs` | Optional overrides via workflow inputs |
| `commitlint.config.cjs` | — |
| Reusable workflows `semantic-release.yml`, `commitlint.yml` | Thin `.github/workflows/*.yml` callers |
| — | Project version files / `scripts/set-version.py` |
| — | Domain CI (e.g. Validation workflow) |
| — | Release App + Environment credentials + ruleset bypass |

## Versioning policy

- Canonical SemVer: **main only** via semantic-release → GitHub Release + `v*` tag.
- Feature/PR identity: `git describe --tags --match 'v*'`.
- Release notes: GitHub Releases only.
- Commits: Conventional Commits; prefer rebase merge into `main`.

## Local install (optional)

```bash
npm clean-install
```

Consumers’ commit-msg hooks look for a sibling checkout at `../release-tooling` or clone this repo into a cache.

## Pinning

Consumers should pin a SemVer tag (or SHA). Bump according to SemVer when workflow inputs break.
