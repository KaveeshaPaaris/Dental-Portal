import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidateTarget = 'body' | 'query' | 'params';

/**
 * Validates req[target] against a Zod schema.
 * Returns 400 with field-level errors on failure.
 */
export function validate(schema: ZodSchema, target: ValidateTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
      return;
    }

    // Replace the target with the parsed (sanitized) data
    req[target] = result.data;
    next();
  };
}
