# Plan

Feedback Intake Service: free-text feedback goes in, an AI model extracts a
structured record, the service validates and stores it, and an API and a dashboard
expose it.

This is the **Plan** phase. **Execute** builds to the criteria below and **Harden**
is in `HARDENING.md`. Diagrams are in the [README](README.md) and the reasons for
the choices are in [DECISIONS.md](DECISIONS.md).

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

## Test-first

The three scenarios were written as failing tests first (commit `ff4a943`), before
any implementation. The work is staged plan, execute, harden: one branch and pull
request per step, so the history shows the shape.
