/**
 * Turns free-text feedback into structured content.
 *
 * The answer is untrusted: the caller must validate it. When the first answer
 * was rejected, `validationError` carries the reason so the model can correct it.
 */
export interface Extractor {
  extract(text: string, validationError?: string): Promise<unknown>;
}
