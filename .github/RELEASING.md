# Beta releases

The `Beta release` workflow runs daily at 12:46 UTC. It publishes `main` when its
commit differs from the last successful run. In GitHub Actions, use **Run workflow**
on `main` to release sooner; select **force** to publish an unchanged commit again.

Versions use `<current-version>-beta.<workflow-run-number>.g<commit-sha>`. For
example, `1.7.1-beta.123.g123456789abc` identifies a snapshot, without choosing the
next stable release number. All eight packages receive the same version, including
their internal dependency references. Version changes stay in the CI checkout;
the workflow creates no commits or Git tags and does not update npm's `latest` tag.

## One-time npm setup

Configure a GitHub Actions trusted publisher in npm's settings for each package:
`@unovis/ts`, `@unovis/angular`, `@unovis/react`, `@unovis/svelte`, `@unovis/vue`,
`@unovis/solid`, `@unovis/ssr`, and `@unovis/mcp`.

- Organization: `f5`
- Repository: `unovis`
- Workflow filename: `release-beta.yml`
- Environment: leave empty
- Allowed actions: enable direct publishing (`npm publish`) and dist-tag management
  (`npm dist-tag`)

No npm token secret is needed. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).

## Failed releases

Use **Re-run failed jobs** to reuse the `beta-packages` artifact and version from
the same workflow run. Artifacts are retained for 14 days. Already published
packages are skipped only when their registry integrity matches the saved tarball;
missing packages are published, then all `beta` tags are set to that version.
Publishing across packages is sequential, so a failed run can temporarily leave
packages' `beta` tags pointing to different versions. Check that the whole run
succeeded before announcing a beta. Install an exact version for reproducible use.
