# Plan

Feedback Intake Service: free-text feedback goes in, an AI model extracts a
structured record, the service validates and stores it, and an API and a dashboard
expose it.

This is the **Plan** phase. **Execute** builds to the criteria below and **Harden**
is in `HARDENING.md`. Architecture diagrams are in the [README](README.md).

## Scope

**In**
- `FeedbackRecord` contract in Zod: the brief's fields plus `text`.
- AI extraction behind an interface: mock by default (offline), Anthropic optional.
  The model returns only category, sentiment, severity, summary and suggested
  action. The code sets `id`, `submittedAt`, `status` and `text`.
- API to submit, list and get records, with an in-memory repository.
- Dashboard: submit form, records table, counts by category.
- AWS CDK stack, not deployed.

**Out**
- The brief's non-goals: auth, deployment, persistent database, broad tests, UI
  polish, CI, containers, observability.
- Status changes, pagination, filters, rate limiting.
- A Lambda adapter for the API (noted in `HARDENING.md`).

## Decisions

| Area | Decision |
|---|---|
| Repository | One repo, one `package.json`, Yarn. `src/` API, `web/` dashboard, `infra/` CDK, `tests/` |
| API | Fastify. `POST /feedback` (201), `GET /feedback` (newest first), `GET /feedback/:id` (404 if missing). Errors: `{ "error": { "code", "message" } }`, 400 invalid input, 502 invalid model output |
| Contract | Zod on the request, the model output and the response. `text`: trimmed, 1 to 2000 characters. The dashboard imports the type from `src/contract` |
| IDs and time | `fb_` plus a UUID. Injected clock for deterministic tests |
| AI | Anthropic SDK, tool use with a JSON schema from the Zod contract. `ANTHROPIC_MODEL` sets the model. `EXTRACTOR=mock` by default |
| Dashboard | React, Vite, Mantine. Counts computed in the browser. Dev proxy to the API, so no CORS |
| IaC | CDK: S3 and CloudFront (routes `/feedback*` to the API), HTTP API and Lambda, DynamoDB, key in Secrets Manager. Checked with `cdk synth` |
| Tests | Vitest. Test names are the scenario titles |

## Invalid model output

Check the answer with Zod. If invalid, retry once with the error. If still invalid,
return 502 and store nothing, so the store only holds valid records. A "needs
review" queue is a next step.

## Risks

- Invalid model output: handled above.
- Prompt injection: the feedback is data, marked in the prompt, and the model
  cannot trigger actions.
- Cost and abuse: text capped at 2000 characters.
- Personal data: feedback text is not logged.
- Time (4 to 5 hours): cut the form first, then the CDK detail, then the severity
  breakdown.

## Acceptance criteria

```gherkin
Feature: Feedback intake

  Scenario: A valid submission produces a conforming record
    Given the model returns valid content for the feedback
    When the user submits the feedback
    Then a record is returned with an id and a submittedAt set by the service
    And the record status is "new"
    And category, sentiment, severity, summary and suggestedAction satisfy the contract
    And the record can be fetched by id and appears in the list

  Scenario: The model returns content that breaks the contract
    Given the model returns a severity that is not in the contract on both attempts
    When the user submits the feedback
    Then the request is rejected with a 502
    And no record is stored

  Scenario: Invalid input is rejected before reaching the model
    Given a feedback text that is empty or longer than 2000 characters
    When the user submits the feedback
    Then the request is rejected with a 400
    And the model is not called
```

## Execution steps

Each step is a branch and a pull request, merged with a merge commit.

| # | Branch | Done when |
|---|---|---|
| 1 | `docs/plan` | Plan and README are reviewed |
| 2 | `chore/scaffold` | Tests and typecheck run |
| 3 | `feat/intake-core` | The failing tests come first (`test:`), then the implementation in small commits |
| 4 | `feat/dashboard` | Form, table and counts work against the local API |
| 5 | `feat/infra` | `cdk synth` passes |
| 6 | `docs/harden` | `HARDENING.md` (with promotion and rollback), `DECISIONS.md` and the run steps in the README. Hardening fixes are separate commits |

Ways of working: conventional commits, nothing pushed to `main` directly, no
secrets in the repo, and the time spent and use of AI recorded in `DECISIONS.md`.

## References

- [Kiro: spec-driven development](https://kiro.dev/docs/specs/)
- [BDD 101: Writing Good Gherkin](https://automationpanda.com/2017/01/30/bdd-101-writing-good-gherkin/)
- [OWASP Top 10 for LLMs 2025 (HackerOne summary)](https://www.hackerone.com/ai/owasp-top-10-llms-2025)
- [Architecture Decision Records](https://endjin.com/blog/architecture-decision-records)
