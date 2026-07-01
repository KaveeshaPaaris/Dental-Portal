/**
 * Gemini Client — Singleton
 *
 * Single source of truth for the Google GenAI SDK instance.
 * All AI services (embedding, chat) import from here.
 * To switch AI providers, only this file and the service files need updating.
 */

import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env';

let _client: GoogleGenAI | null = null;

/**
 * Returns the shared GoogleGenAI client instance.
 * Initialised once on first call (lazy singleton).
 */
export function getGeminiClient(): GoogleGenAI {
  if (!_client) {
    _client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return _client;
}
