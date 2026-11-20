// The answer is untrusted: the caller validates it.
// `validationError` is the reason a previous answer was rejected.
export interface Extractor {
  extract(text: string, validationError?: string): Promise<unknown>;
}
