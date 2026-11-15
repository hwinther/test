# github actions test repository

| | |
|---|---|
| **Build and release** | [![E2E on main](https://github.com/hwinther/test/actions/workflows/pr-e2e.yml/badge.svg?branch=main&event=push)](https://github.com/hwinther/test/actions/workflows/pr-e2e.yml) [![Release](https://github.com/hwinther/test/actions/workflows/container.yml/badge.svg)](https://github.com/hwinther/test/actions/workflows/container.yml) [![Nightly preview E2E](https://github.com/hwinther/test/actions/workflows/nightly-preview.yml/badge.svg?branch=main)](https://github.com/hwinther/test/actions/workflows/nightly-preview.yml) |
| **Tests** | [![Unit tests](https://hwinther.github.io/test/badges/tests-unit.svg)](https://github.com/hwinther/test/actions/workflows/pr-e2e.yml?query=branch%3Amain+event%3Apush) [![E2E tests](https://hwinther.github.io/test/badges/tests-e2e.svg)](https://github.com/hwinther/test/actions/workflows/pr-e2e.yml?query=branch%3Amain+event%3Apush) [![Build, lint and typecheck warnings](https://hwinther.github.io/test/badges/warnings.svg)](https://github.com/hwinther/test/actions/workflows/pr-e2e.yml?query=branch%3Amain+event%3Apush) |
| **Coverage** | [![Backend coverage](https://hwinther.github.io/test/badges/coverage-backend.svg)](https://github.com/hwinther/test/actions/workflows/pr-e2e.yml?query=branch%3Amain+event%3Apush) [![Backend branch coverage](https://hwinther.github.io/test/badges/coverage-backend-branches.svg)](https://github.com/hwinther/test/actions/workflows/pr-e2e.yml?query=branch%3Amain+event%3Apush) [![Frontend coverage](https://hwinther.github.io/test/badges/coverage-frontend.svg)](https://github.com/hwinther/test/actions/workflows/pr-e2e.yml?query=branch%3Amain+event%3Apush) [![Frontend branch coverage](https://hwinther.github.io/test/badges/coverage-frontend-branches.svg)](https://github.com/hwinther/test/actions/workflows/pr-e2e.yml?query=branch%3Amain+event%3Apush) [![Frontend unit+e2e coverage](https://hwinther.github.io/test/badges/coverage-combined.svg)](https://github.com/hwinther/test/actions/workflows/pr-e2e.yml?query=branch%3Amain+event%3Apush) [![E2E coverage](https://hwinther.github.io/test/badges/coverage-e2e.svg)](https://github.com/hwinther/test/actions/workflows/pr-e2e.yml?query=branch%3Amain+event%3Apush) |
| **Security** | [![Image vulnerabilities (Grype)](https://hwinther.github.io/test/badges/vulnerabilities.svg)](https://github.com/hwinther/test/actions/workflows/pr-e2e.yml?query=branch%3Amain+event%3Apush) [![zizmor - GitHub Actions SAST](https://github.com/hwinther/test/actions/workflows/zizmor.yml/badge.svg?branch=main)](https://github.com/hwinther/test/actions/workflows/zizmor.yml) [![poutine - GitHub Actions SAST](https://github.com/hwinther/test/actions/workflows/poutine.yml/badge.svg?branch=main)](https://github.com/hwinther/test/actions/workflows/poutine.yml) |

Badges: [https://hwinther.github.io/test/](https://hwinther.github.io/test/), from the quality summary of every E2E run on main ([`pages.yml`](https://github.com/hwinther/test/blob/main/.github/workflows/pages.yml)).

This repository demonstrates a github flow with 3 environments; dev, test and prod.
![GitHub flow](https://user-images.githubusercontent.com/6351798/48032310-63842400-e114-11e8-8db0-06dc0504dcb5.png)

Several QOL workflows are in place to enforce set rules and assist the developers:

- Add labels based on which part of the system has been changed
- Automatically mark PR and issues stale after a set amount of time to avoid long lived/broken PR's
- Label pushes in test (increments version)
- Create release draft in main
- Enable auto merge automatically in PR's to expedite merges
- Promote changes between dev/test/main via automatically created PR
- Reset head between dev/test/main after PR has been merged
- Automatically set PR creator as PR author
- Automatically create PR when a feature branch has changes pushed to it

## Setup

`git config --local include.path ../.gitconfig`
