import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import type { Extractor } from "./extraction/extractor";
import { registerFeedbackRoutes } from "./feedback/feedback.controller";
import type { FeedbackRepository } from "./feedback/feedback.repository";
import { createFeedbackService } from "./feedback/feedback.service";
import { InMemoryFeedbackRepository } from "./feedback/in-memory-feedback.repository";

export interface AppOptions {
  extractor: Extractor;
  repository?: FeedbackRepository;
  now?: () => Date;
  newId?: () => string;
  logger?: boolean;
}

/** Wires the pieces together: this is where the interfaces get their implementations. */
export function createApp(options: AppOptions) {
  const app = Fastify({ logger: options.logger ?? false });
  const service = createFeedbackService({
    extractor: options.extractor,
    repository: options.repository ?? new InMemoryFeedbackRepository(),
    now: options.now ?? (() => new Date()),
    newId: options.newId ?? (() => `fb_${randomUUID()}`),
  });

  registerFeedbackRoutes(app, service);
  return app;
}
