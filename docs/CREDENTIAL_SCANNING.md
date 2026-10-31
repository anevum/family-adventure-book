# Targeted history credential scanner

The verification-only workflow runs the tested scanner from `anevum/brandle` (Apache-2.0), and its two synthetic tests. This repository is already Apache-2.0 licensed, so the reused tool keeps its original license. The scanner reads Git text blobs reachable from locally fetched refs, checks eight credential patterns and reports rule names and object IDs without printing matched text. It skips binary blobs, unknown formats, unavailable refs, unreachable/deleted Git objects and patient/personal data outside its targeted patterns.

For a comparable local check, fetch the branch heads and run:

```sh
git fetch --no-tags origin '+refs/heads/*:refs/remotes/origin/*'
python3 -m unittest scripts/test_scan_git_history.py
python3 scripts/scan-git-history.py
```

A match requires private credential revocation/rotation and incident triage, not publication in an issue or PR.

**Release hold:** Cloudflare Builds watches production `main` independently and the existing deployment gate is not proven to require GitHub CI. [Release issue #11](https://github.com/anevum/family-adventure-book/issues/11) must be resolved before merging this non-runtime change. Do not infer that a source-verification change cannot trigger a production Worker deployment.
