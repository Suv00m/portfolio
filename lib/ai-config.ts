import { createOpenRouter } from '@openrouter/ai-sdk-provider';

/**
 * AI Configuration for OpenRouter
 */

export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.warn('OPENROUTER_API_KEY is not set. AI features will be disabled.');
}

/**
 * Create OpenRouter provider instance
 */
export const openrouter = OPENROUTER_API_KEY
  ? createOpenRouter({
      apiKey: OPENROUTER_API_KEY,
    })
  : null;

/**
 * Default model to use for AI features
 * You can change this to any model supported by OpenRouter
 * Examples: 'anthropic/claude-3.5-sonnet', 'openai/gpt-4', 'google/gemini-pro'
 */
export const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';

/**
 * Model configuration for different AI features
 */
export const MODEL_CONFIG = {
  autocomplete: DEFAULT_MODEL, // Fast model for autocomplete
  ideas: DEFAULT_MODEL, // Creative model for idea generation
  assist: DEFAULT_MODEL, // Capable model for writing assistance
};

/**
 * Check if AI features are enabled
 */
export function isAIEnabled(): boolean {
  return !!OPENROUTER_API_KEY && !!openrouter;
}
