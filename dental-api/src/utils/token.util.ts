import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a cryptographically random, unique review token.
 * This is a one-time-use UUID sent to the patient after treatment.
 */
export function generateReviewToken(): string {
  return uuidv4();
}
