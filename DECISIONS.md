# Decisions

## Who decided what

I used Claude as a pair programmer. Claude wrote most of the code. I chose the
direction, reviewed each step and tested every branch myself before merging.

| Mine | Proposed by Claude, and I accepted it |
|---|---|
| React for the dashboard, Yarn, one repo | Ports and adapters layout, feature folders |
| Form and table in the same app | Zod contract and tool use for the model output |
| NestJS-style structure and clean code | Retry once, then 502, store nothing |
| Branches and PRs, conventional commits, my own merges | Error format, CDK layout, Vite and Mantine |
| Real model checked by me with my own key | Prompt rules for severity |

## Why this architecture

The API is small, but the model and the store are the parts most likely to
change. They sit behind two interfaces (`Extractor`, `FeedbackRepository`), so
tests use stubs and DynamoDB can replace memory behind the same interface (listing newest first needs an index, see HARDENING.md).
No DI container: `app.ts` wires everything by hand.

## Other choices

- Form and table share one page to keep the exercise small. In production the
  public form and an internal, authenticated dashboard would be separate.
- One `package.json` with folders, not workspaces. Workspaces are the next step if
  the API and the web app need separate dependencies.
- Counts are computed in the browser. With paging they would come from the API.
- The table shows the summary, not the original text. The text is stored and returned by the API.
- Tests call the API through Fastify `inject`: routes, validation and error codes
  run for real and only the model is replaced by a stub. No browser end-to-end
  tests: the brief asks for non-exhaustive tests, so the dashboard was checked by hand.

## Not done

Authentication, deployment, a real database, the Lambda adapter, CI, containers
and an observability stack (non-goals in the brief). Next steps are in
[HARDENING.md](HARDENING.md).

## Time spent

TODO (Ferran): my own time, in hours. Setup and commit signing counted apart.

## Limitations

- Storage is in memory: records are lost on restart.
- Sentiment has no "mixed" value, so "I love it but it crashes" is one label only.
- Severity depends on the prompt rules. There are no automated checks of the
  model's answers yet.
- Tests cover the API and the infra. The dashboard was checked by hand.
