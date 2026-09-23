# Contributing

This repo deliberately follows the same workflow a production team would use,
even though it is currently maintained by one person. The point is that the
process is what keeps `main` trustworthy.

## The rule

**Nothing is pushed directly to `main`.** Every change goes through a pull
request that passes CI. Branch protection enforces this; `git push origin main`
will be rejected.

## Workflow

```bash
git checkout main && git pull
git checkout -b fix/short-description
# ... make changes ...
git add -p                  # stage deliberately, review as you go
git commit
git push -u origin fix/short-description
gh pr create
```

Then: wait for CI, address review comments by pushing more commits, and merge
with **squash** once green.

## Branch naming

| Prefix | Use |
| --- | --- |
| `feat/` | new functionality |
| `fix/` | bug fix |
| `chore/` | tooling, dependencies, no behaviour change |
| `docs/` | documentation only |
| `hotfix/` | urgent production fix |

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):
`type: imperative summary under ~70 chars`, blank line, then the *why*.

The body matters more than the summary. Explain the reasoning a future reader
will not be able to infer from the diff.

## Running checks locally

Do this before pushing — it is faster than waiting for CI:

```bash
bash .github/scripts/check-local-links.sh
grep -rn 'YOUR_PROJECT_ID\|YOUR_ANON_KEY' --include='*.js' --include='*.html' .
```

## Secrets

Never commit API keys, tokens or credentials. Supabase *publishable* keys are
designed to be public and are safe in client code **only** when Row Level
Security is enabled on every table. Everything else belongs in Netlify
environment variables, not in the repository.

## Deployment

`main` auto-deploys to <https://akhileshj.site> via Netlify. Because there is no
staging environment, `main` is production — which is exactly why it is
protected.
