import { randomUUID } from "node:crypto";
import Fastify, { type FastifyError } from "fastify";
import type { Extractor } from "./extraction/extractor";
import { registerFeedbackRoutes } from "./feedback/feedback.controller";
import type { FeedbackRepository } from "./feedback/feedback.repository";
import { createFeedbackService } from "./feedback/feedback.service";
import { InMemoryFeedbackRepository } from "./feedback/in-memory-feedback.repository";

// Texts are at most 2000 characters, so 16 KiB is plenty.
const BODY_LIMIT_BYTES = 16 * 1024;

export interface AppOptions {
  extractor: Extractor;
  repository?: FeedbackRepository;
  now?: () => Date;
  newId?: () => string;
  logger?: boolean;
}

// Wires the pieces together.
export function createApp(options: AppOptions) {
  const app = Fastify({ logger: options.logger ?? false, bodyLimit: BODY_LIMIT_BYTES });
  const service = createFeedbackService({
    extractor: options.extractor,
    repository: options.repository ?? new InMemoryFeedbackRepository(),
    now: options.now ?? (() => new Date()),
    newId: options.newId ?? (() => `fb_${randomUUID()}`),
  });

  // Log the details of unexpected errors, never send them to the client.
  app.setErrorHandler((error: FastifyError, request, reply) => {
    const status = error.statusCode ?? 500;
    if (status < 500) {
      return reply.code(status).send({ error: { code: "bad_request", message: error.message } });
    }
    request.log.error(error);
    return reply.code(500).send({ error: { code: "internal_error", message: "Unexpected error." } });
  });

  app.setNotFoundHandler((_request, reply) =>
    reply.code(404).send({ error: { code: "not_found", message: "Not found." } }),
  );

  registerFeedbackRoutes(app, service);
  return app;
}
