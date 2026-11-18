import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import { FeedbackRecordSchema } from "./contract";
import type { Extractor } from "./extractor";
import {
  createIntakeService,
  InvalidInputError,
  InvalidModelOutputError,
} from "./intake-service";
import { InMemoryRepository, type FeedbackRepository } from "./repository";

export interface AppOptions {
  extractor: Extractor;
  repository?: FeedbackRepository;
  now?: () => Date;
  newId?: () => string;
  logger?: boolean;
}

const errorBody = (code: string, message: string) => ({ error: { code, message } });

export function createApp(options: AppOptions) {
  const app = Fastify({ logger: options.logger ?? false });
  const service = createIntakeService({
    extractor: options.extractor,
    repository: options.repository ?? new InMemoryRepository(),
    now: options.now ?? (() => new Date()),
    newId: options.newId ?? (() => `fb_${randomUUID()}`),
  });

  app.post("/feedback", async (request, reply) => {
    try {
      const record = await service.submit(request.body);
      return reply.code(201).send(FeedbackRecordSchema.parse(record));
    } catch (error) {
      if (error instanceof InvalidInputError) {
        return reply.code(400).send(errorBody(error.code, error.message));
      }
      if (error instanceof InvalidModelOutputError) {
        return reply.code(502).send(errorBody(error.code, error.message));
      }
      throw error;
    }
  });

  app.get("/feedback", async () => {
    const records = await service.list();
    return records.map((record) => FeedbackRecordSchema.parse(record));
  });

  app.get<{ Params: { id: string } }>("/feedback/:id", async (request, reply) => {
    const record = await service.get(request.params.id);
    if (!record) return reply.code(404).send(errorBody("not_found", "Feedback not found."));
    return FeedbackRecordSchema.parse(record);
  });

  return app;
}
