# Hardening

## What I did

- The text is trimmed and limited to 2000 characters, and the body to 16 KiB. Bad input gets a 400 before the model is called.
- The model answer is validated with Zod. If it is invalid I retry once with the error, then return a 502. Nothing invalid is stored.
- Each model call times out after 10 s, with no SDK retries, so a request takes 20 s at worst. If the provider fails, the API returns a 502.
- The feedback is escaped and marked as data in the prompt, and the model has no tools. This lowers the prompt injection risk but does not remove it.
- An unexpected error returns a generic 500 and the details go to the log. The feedback text is never logged.
- The API key lives only in a git-ignored `.env`. The mock is refused when `NODE_ENV=production`.
- The tests added in this phase are regression tests for these fixes. They are not PLAN scenarios.

## Before production

1. A Lambda adapter for Fastify and a DynamoDB repository. Listing newest first needs an index on time.
2. Authentication, rate limiting (API Gateway throttling, WAF) and security headers.
3. Do not lose feedback when the model fails: save first, extract later with a queue, and add a "needs review" state.
4. A small set of example feedbacks to check changes of prompt or model.
5. Logs with token use and cost, and alarms on 5xx and on model failures.
6. Personal data: redact before storing or sending to the provider, and set a retention period.
7. An idempotency key, so a retried submit is not stored twice, and pagination.
8. Split the public form from an internal dashboard with authentication.

## Promotion and rollback

Promotion goes dev, staging, prod, with the same code and different config. CI must pass (typecheck, tests, `cdk synth`, `yarn audit`) and the `cdk diff` is reviewed. Prod needs a manual approval after staging. A new model or prompt counts as a release: check it against the examples in staging, then move traffic gradually with a weighted Lambda alias.

To roll back, point the alias to the previous version. The prompt and the model are code and config, so I revert and redeploy. DynamoDB has point-in-time recovery. The dashboard is redeployed from the previous build.

## Why these were left out

CI, end-to-end tests, approvals, observability and a real database are non-goals in the brief, and they do not fit in four to five hours. They matter before production, but they would not change what this exercise shows.
