# MLV-WIP/release-tooling

Shared **semantic-release** + **commitlint** tooling for MLV-WIP repos — GitLab-style “include a central CI project,” adapted to GitHub **reusable workflows**.

Peer of `slab-pool-allocator` and `mlvlib` under `~/dev/projects/mlv-wip/`.

## Publish this repo

1. Create empty GitHub repo `MLV-WIP/release-tooling` (if not already).
2. Push this tree to `main`.
3. Tag **`v1.0.0`** (consumers pin `@v1.0.0`).
4. In each consumer, use thin workflow wrappers:

```yaml
jobs:
  release:
    uses: MLV-WIP/release-tooling/.github/workflows/semantic-release.yml@v1.0.0
    with:
      verified-sha: ${{ github.event.workflow_run.head_sha }}
      prepare-command: "python3 scripts/set-version.py ${nextRelease.version}"
      git-assets: spallocator/version.hpp
    secrets: inherit
```

```yaml
jobs:
  commitlint:
    uses: MLV-WIP/release-tooling/.github/workflows/commitlint.yml@v1.0.0
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
| — | Domain CI (e.g. C/C++ matrix) |

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

Consumers should pin `@v1.0.0` (or a newer SemVer tag / SHA). Bump according to SemVer when workflow inputs break.
