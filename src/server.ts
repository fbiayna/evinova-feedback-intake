import { AnthropicExtractor } from "./anthropic-extractor";
import { createApp } from "./app";
import type { Extractor } from "./extractor";
import { MockExtractor } from "./mock-extractor";

function buildExtractor(): Extractor {
  if (process.env.EXTRACTOR !== "anthropic") return new MockExtractor();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("EXTRACTOR=anthropic needs ANTHROPIC_API_KEY (set it in .env).");
  return new AnthropicExtractor(apiKey, process.env.ANTHROPIC_MODEL ?? "claude-haiku-5-5");
}

try {
  process.loadEnvFile();
} catch {
  // No .env file: fine, the defaults use the mock.
}

const app = createApp({ extractor: buildExtractor(), logger: true });
const port = Number(process.env.PORT ?? 3000);

app.listen({ port }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
