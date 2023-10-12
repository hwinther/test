# github actions test repository

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
