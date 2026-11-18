import type { FastifyInstance } from "fastify";
import { FeedbackRecordSchema } from "../contract";
import {
  InvalidInputError,
  InvalidModelOutputError,
  type FeedbackService,
} from "./feedback.service";

const errorBody = (code: string, message: string) => ({ error: { code, message } });

/** HTTP routes for feedback. Translates the service's results and errors into responses. */
export function registerFeedbackRoutes(app: FastifyInstance, service: FeedbackService) {
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
}
