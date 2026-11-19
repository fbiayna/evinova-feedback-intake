# Hardening

## Done in this exercise

- Input validated and capped at 2000 characters; request body capped at 16 KiB.
- Model output validated with Zod, one retry, then 502. Nothing invalid is stored.
- The prompt treats the feedback as data and has rules for category and severity.
- Model call has a 20 s timeout. Provider failures return 502, not a crash.
- Unexpected errors return a generic 500. Details go to the log, never to the client.
- Feedback text is not logged. No secrets in the repository.
- The mock extractor is refused when `NODE_ENV=production`.

## Security checks (OWASP Top 10 for LLM applications)

| Risk | How it is covered |
|---|---|
| Prompt injection | The feedback is marked as data in the prompt. The model has no tools that act. |
| Improper output handling | The answer is validated with Zod. React escapes the text, so no HTML is injected. |
| Unbounded consumption | Text capped at 2000 characters, body at 16 KiB, 20 s timeout, one retry. |
| Sensitive information | Feedback text is not logged. The key is in `.env` or Secrets Manager. |
| Excessive agency | The model only returns data. The code decides what to store. |

## Next, in this order

1. Lambda adapter for Fastify and a DynamoDB repository (the CDK stack describes them).
2. Authentication and rate limiting (API Gateway throttling, WAF).
3. A "needs review" queue for answers that stay invalid, instead of dropping them.
4. A small set of example feedbacks to check prompt and model changes (evals).
5. Logs with token usage and cost, and alarms on 5xx and on model failures.
6. Personal data: redact before storing or sending, and set a retention period.
7. Pagination, frontend tests, browser end-to-end tests, CI (with `yarn audit`), security headers.
8. Split the public form from an internal, authenticated dashboard.

## Promotion

dev, then staging, then prod, with the same code and different config.
`cdk diff` is reviewed in the PR. A new model or prompt is a release: check it
against the examples in staging first, then move traffic gradually with a weighted
Lambda alias.

## Rollback

- API: point the Lambda alias back to the previous version.
- Model or prompt: both are config or code, so revert the change and redeploy.
- Data: DynamoDB point-in-time recovery is on.
- Dashboard: redeploy the previous build (keep builds as artifacts).
