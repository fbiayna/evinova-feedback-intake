# Decisions

## Key choices and why

- **Contract.** Zod, checked on the request, on the model output and on the response. I extended the brief's record with `text` (the original feedback, to audit or re-run extraction). Length limits (summary 200, action 300) keep the output short. The id is `fb_` plus a UUID: no extra dependency, and the list is ordered by `submittedAt`, so I did not need a sortable ULID. The dashboard shares the types but does not re-check responses, because the API already does.
- **Model output.** The model returns the content fields only. The code owns id, time, status and text. It is one call per attempt. If the answer breaks the contract there is one retry that carries the validation error, then a 502 and nothing is stored. One retry fixes most format slips; more would add cost and latency. Saving for review is the next step (see HARDENING.md).
- **Architecture.** Two interfaces, `Extractor` and `FeedbackRepository`, so tests use stubs and DynamoDB or another provider can replace the real ones. Feature folders, no DI container.
- **Mock by default.** The service runs offline. The real model is used with `EXTRACTOR=anthropic`.
- **Dashboard.** React, Vite and Mantine. The form and the table share one page to keep it small. In production they would be a public form and an internal, authenticated dashboard. Counts are computed in the browser. The table shows the summary, not the original text.
- **Repository.** One `package.json` with folders, not workspaces. Workspaces are the next step if the API and the web app need separate dependencies.
- **Tests.** They call the API through Fastify `inject`, so routes, validation and error codes run for real and only the model is a stub. No browser end-to-end tests, as the brief asks for targeted tests.

## Who decided what

I used Claude as a pair programmer and it wrote most of the code. I set the scope and the bar for "done and safe", and I tested every branch myself before merging it.

| My calls | Claude drafted, I reviewed and accepted |
|---|---|
| The product idea and scope: form, AI extraction, API, dashboard | First drafts of PLAN.md and the three Gherkin scenarios |
| React, Yarn and the Anthropic provider | Ports and adapters layout |
| Clean, NestJS-style structure by feature (I asked for the refactor) | Retry once, then 502 |
| Done means: I test each branch, I merge, conventional commits, no secrets | Error format, CDK stack, prompt rules |
| Form and table on one page | Vite and Mantine |

An independent review by another AI model found problems (call time, prompt escaping, docs that claimed too much). I fixed them in a separate pull request.

## Known limitations

- Storage is in memory: records are lost on restart.
- Sentiment has no "mixed" value, so "I love it but it crashes" gets one label only.
- Severity depends on the prompt rules, and nothing checks the model's answers automatically yet.
- The Lambda is a placeholder: the Fastify adapter is not built and the dashboard is not uploaded.
- The dashboard was checked by hand.

## With more time

The list in HARDENING.md, then changing a record's status and showing the proportion resolved, and counts by severity.

## Time spent

About 4 to 5 hours of my own time, within the range the brief suggests.
