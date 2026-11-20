import { AnthropicExtractor } from "./extraction/anthropic.extractor";
import { createApp } from "./app";
import type { Extractor } from "./extraction/extractor";
import { MockExtractor } from "./extraction/mock.extractor";

function buildExtractor(): Extractor {
  if (process.env.EXTRACTOR !== "anthropic") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("The mock extractor is not allowed in production. Set EXTRACTOR=anthropic.");
    }
    return new MockExtractor();
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("EXTRACTOR=anthropic needs ANTHROPIC_API_KEY (set it in .env).");
  return new AnthropicExtractor(
    apiKey,
    process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
    process.env.PRODUCT_CONTEXT || undefined,
  );
}

try {
  process.loadEnvFile();
} catch {
  // No .env file: use the defaults.
}

const extractor = buildExtractor();
const app = createApp({ extractor, logger: true });
app.log.info({ extractor: extractor.constructor.name, model: process.env.ANTHROPIC_MODEL }, "Extractor in use");
const port = Number(process.env.PORT ?? 3000);

app.listen({ port }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
