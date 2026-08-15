# Jira API

A small compatibility proxy over Jira search queries. It keeps the original HTTP contract used by the existing clients while running on a modern Node.js runtime and supporting Vercel deployment.

## Runtime

- Node.js 24
- Express 5
- native ES modules
- Node's built-in test runner
- GitHub Actions for CI and production deployment
- Vercel-compatible default Express export in `src/index.mjs`

## Public API contract

The existing routes are intentionally preserved:

| Route | Jira query |
| --- | --- |
| `GET /team/:team` | Current open sprint for a team |
| `GET /project/:project` | Current open sprint for a project |
| `GET /version/:version` | Issues for a fix version |
| `GET /sprint/:sprint` | Issues for a sprint |
| `GET /epic/:epic` | Issues for an epic |

Requests continue to use these headers:

- `username`: Atlassian account email
- `password`: Atlassian API token. The header name is retained for compatibility; do not send an Atlassian account password.

Successful calls continue to pass the Jira search JSON through to the caller. Legacy text responses and their HTTP 200 status are also covered by contract tests so existing clients are not silently broken during the hosting migration.

An additive `GET /health` endpoint returns:

```json
{"status":"ok"}
```

## Local development

```bash
nvm use
npm ci
npm test
npm run lint
npm run build
npm start
```

The local server listens on port `4001` unless `PORT` is set.

Example request:

```bash
curl -X GET \
  http://localhost:4001/project/WED \
  -H 'username: you@example.com' \
  -H 'password: your-jira-api-token'
```

For active development you can use Node's built-in watcher:

```bash
npm run dev
```

## Configuration

The original Jira host remains the default so existing behaviour is unchanged:

```text
immediateco.atlassian.net
```

Set `JIRA_HOST` to point the proxy at another Jira Cloud site without changing code. `JIRA_API_VERSION` defaults to `2` to retain the response contract used by the current `jira-client` integration.

The existing CORS origins are preserved in `src/Http/CORs.mjs`. Extra origins can be added at runtime using a comma-separated environment variable:

```text
CORS_ALLOWED_ORIGINS=https://preview.example.com,https://app.example.com
```

This is useful for Vercel preview or production frontends without having to commit deployment-specific domains.

## Testing and CI

Every pull request, push to `master`, and manual CI run executes:

1. deterministic `npm ci`
2. ESLint
3. the complete Node test suite
4. a build/startup check that loads the Vercel entrypoint and calls `/health`

The tests cover the Jira JQL construction plus the legacy HTTP contract, including credentials headers, CORS, error text, trailing path behaviour, and every supported route.

Dependabot groups npm dependency updates and GitHub Actions updates into manageable weekly PRs.

## Vercel deployment through GitHub Actions

The application is structured for Vercel's Express detection: `src/index.mjs` default-exports the Express app, while `src/server.mjs` exists only for local/standalone execution.

After creating the `jiraapi` project in Vercel, add these repository secrets in GitHub:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

The IDs are available from the linked Vercel project's `.vercel/project.json` after running `vercel link`, or from the Vercel project/team metadata.

Once those secrets exist, a successful CI run on `master` performs the production deployment through GitHub Actions:

```text
vercel pull --environment=production
        ↓
vercel build --prod
        ↓
vercel deploy --prebuilt --prod
```

Until the secrets are configured, the production deployment job exits successfully with a notice rather than breaking CI.

If the Vercel project is also connected directly to GitHub for automatic Git deployments, choose one deployment path as the source of truth to avoid duplicate production deployments. This repository is configured for GitHub Actions to own the production release.

## Maintenance boundary

`jira-client` 8.2.2 is deliberately retained for now even though it is old. Existing clients may depend on the pagination and response shape from Jira's legacy search API, while Atlassian's enhanced JQL search API returns different pagination metadata. The library is isolated behind `DataLayer`, making a later Jira API migration possible once that response contract has explicit migration requirements.
