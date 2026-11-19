# Hardening

## Done in this exercise

- Input validated and capped at 2000 characters; request body capped at 16 KiB.
- Model output validated with Zod, one retry, then 502. Nothing invalid is stored.
- The prompt treats the feedback as data, escapes its `<` and `>` so it cannot close the tag, and has rules for category and severity.
- Each model attempt waits at most 10 s, with no hidden SDK retries, and there are at most 2 attempts: a request takes 20 s at worst. The Lambda is set to 29 s, under the 30 s limit of the HTTP API. Provider failures return 502, not a crash.
- Unexpected errors return a generic 500. Details go to the log, never to the client.
- Feedback text is not logged. No secrets in the repository.
- The mock extractor is refused when `NODE_ENV=production`.

## Security checks (OWASP Top 10 for LLM applications)

| Risk | How it is covered |
|---|---|
| Prompt injection | The feedback is escaped and marked as data, and the model has no tools that act. This lowers the risk but does not remove it: a hostile text can still bias the labels, so the summary is untrusted input for whoever reads it. |
| Improper output handling | The answer is validated with Zod. React escapes the text, so no HTML is injected. |
| Unbounded consumption | Text capped at 2000 characters, body at 16 KiB, 20 s at most per request, one retry. |
| Sensitive information | Feedback text is not logged. The key is in `.env` or Secrets Manager. |
| Excessive agency | The model only returns data. The code decides what to store. |

## Next, in this order

1. Lambda adapter for Fastify and a DynamoDB repository (the CDK stack describes them). Listing newest first needs an index on time: with `id` as the key it would be a scan.
2. Authentication and rate limiting (API Gateway throttling, WAF).
3. Do not lose feedback when the model fails: save first and extract later through a queue, with a "needs review" state for answers that stay invalid. Today they are dropped.
4. A small set of example feedbacks to check prompt and model changes (evals).
5. Logs with token usage and cost, and alarms on 5xx and on model failures.
6. Personal data: redact before storing or sending, and set a retention period.
7. Pagination, an idempotency key so a retried submit is not stored twice, frontend tests, browser end-to-end tests, CI (with `yarn audit`), security headers.
8. Split the public form from an internal, authenticated dashboard.

## Promotion

dev, then staging, then prod, with the same code and different config.
`cdk diff` is reviewed in the PR. A new model or prompt is a release: check it
against the examples in staging first, then move traffic gradually with a weighted
Lambda alias (once the Lambda adapter exists).

## Rollback

- API: once the Lambda adapter exists, publish versions and point an alias back to the previous one.
- Model or prompt: both are config or code, so revert the change and redeploy.
- Data: DynamoDB point-in-time recovery is on.
- Dashboard: redeploy the previous build (keep builds as artifacts).
