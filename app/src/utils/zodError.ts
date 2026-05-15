import { ZodError } from 'zod';

export function formatZodError(err: ZodError): Record<string, string> {
  return Object.fromEntries(
    err.errors.map((e) => [e.path.join('.') || 'value', e.message])
  );
}
