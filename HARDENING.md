# Hardening

## What was done

- **Input:** text trimmed, 1 to 2000 characters, body capped at 16 KiB. Bad input gets a 400 before the model is called.
- **Model output:** validated with Zod. One retry that carries the validation error, then a 502. Nothing invalid is stored.
- **Model call:** 10 s per attempt, no hidden SDK retries, at most 2 attempts (20 s at worst). A provider failure returns a 502.
- **Prompt:** the feedback is escaped and marked as data, and the model has no tools that act. This lowers prompt-injection risk but does not remove it, so the summary is untrusted for whoever reads it.
- **Errors:** an unexpected error returns a generic 500. Details go to the log, not to the client. Feedback text is not logged.
- **Secrets:** the key lives in a git-ignored `.env`. The mock extractor is refused when `NODE_ENV=production`.
- **Tests:** the tests added in this phase are regression tests for the fixes above. They are not PLAN scenarios.

## Before production

1. Lambda adapter for Fastify and a DynamoDB repository (listing newest first needs an index on time).
2. Authentication, rate limiting (API Gateway throttling, WAF) and security headers.
3. Do not lose feedback when the model fails: save first, extract later through a queue, with a "needs review" state.
4. Evals: a small set of example feedbacks to check prompt and model changes.
5. Observability: structured logs with token use and cost, alarms on 5xx and on model failures.
6. Personal data: redact before storing or sending to the provider, and set a retention period.
7. An idempotency key so a retried submit is not stored twice, and pagination.
8. Split the public form from an internal, authenticated dashboard.

## Promotion and rollback

- **Promotion:** dev, staging, prod, with the same code and different config. CI gates (typecheck, tests, `cdk synth`, `yarn audit`) and a reviewed `cdk diff` must pass, and prod needs a manual approval after staging. A new model or prompt is a release: check it against the evals in staging, then move traffic gradually with a weighted Lambda alias.
- **Rollback:** point the Lambda alias back to the previous version. Prompt and model are code and config, so revert and redeploy. DynamoDB has point-in-time recovery. For the dashboard, redeploy the previous build.

## Why these were left out

CI gates, end-to-end tests, approvals, observability and a real database are non-goals of the brief and do not fit in four to five hours. They matter before production; they would not change the shape of the work shown here. The risks above follow the OWASP Top 10 for LLM applications: prompt injection, improper output handling and unbounded consumption.
