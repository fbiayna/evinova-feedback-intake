# Decisions

## Key choices

- **Contract.** Zod, checked on the request, the model output and the response. I added `text` (the original feedback) to the brief's record, to audit it or run the extraction again. Summary and action have length limits (200 and 300) to keep them short. The id is `fb_` plus a UUID: no extra dependency, and the list is sorted by `submittedAt`, so I did not need a sortable ULID. The dashboard shares the types but does not check responses again, because the API already does.
- **Model output.** The model returns only the content fields. The code sets id, time, status and text. It is one call per attempt. If the answer breaks the contract I retry once with the validation error, then return a 502 and store nothing. One retry fixes most format slips, and more would cost time and money.
- **Architecture.** Two interfaces, `Extractor` and `FeedbackRepository`. Tests use stubs, and DynamoDB or another provider can replace the real ones. Feature folders, no DI container.
- **Mock by default.** The service runs offline. The real model is used with `EXTRACTOR=anthropic`.
- **Dashboard.** React, Vite and Mantine. The form and the table share one page to keep it small. In production they would be a public form and an internal dashboard with authentication. The counts are computed in the browser, and the table shows the summary, not the original text.
- **Repository.** One `package.json` with folders. Workspaces would be the next step if the API and the web app needed separate dependencies.
- **Tests.** They call the API through Fastify `inject`, so routes, validation and error codes are real and only the model is a stub. No browser tests, because the brief asks for targeted tests.

## Who decided what

Claude wrote most of the code. I set the scope and what "done and safe" means, and I tested every branch before merging it.

| My calls | Drafted by Claude, I reviewed and accepted |
|---|---|
| The idea and scope: form, AI extraction, API, dashboard | First drafts of PLAN.md and the three scenarios |
| React, Yarn and the Anthropic provider | Ports and adapters layout |
| A clean structure by feature, like NestJS (I asked for the refactor) | Retry once, then 502 |
| Done means: I test each branch, I merge, conventional commits, no secrets | Error format, CDK stack, prompt rules |
| Form and table on one page | Vite and Mantine |

A second AI model reviewed the repo and found problems (call time, prompt escaping, docs that said too much). I fixed them in a separate pull request.

## Known limitations

- Records are in memory, so they are lost on restart.
- Sentiment has no "mixed" value, so "I love it but it crashes" gets one label.
- Severity depends on the prompt rules, and nothing checks the model answers automatically yet.
- The Lambda is a placeholder: the Fastify adapter is not built and the dashboard is not uploaded.
- I checked the dashboard by hand.

## With more time

The list in HARDENING.md, then changing the status of a record with the proportion resolved, and counts by severity.

## Time spent

About 4 to 5 hours of my own time, within the range of the brief.
