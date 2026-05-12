// Pricing data and sources for all AI tools
// Sources verified as of 2024-2025

export const TOOLS = [
  'Cursor',
  'GitHub Copilot',
  'Claude',
  'ChatGPT',
  'Anthropic API',
  'OpenAI API',
  'Gemini',
  'Windsurf',
] as const;

export type Tool = (typeof TOOLS)[number];

export const PRICING: Record<Tool, { plans: Record<string, number>; description: string }> = {
  Cursor: {
    plans: {
      'Hobby (Free)': 0,
      'Pro ($20/month)': 20,
      'Business ($40/month)': 40,
      'Enterprise (Custom)': 0, // Custom pricing
    },
    description: 'AI-powered code editor',
  },
  'GitHub Copilot': {
    plans: {
      'Individual ($10/month)': 10,
      'Business ($19/seat/month)': 19,
      'Enterprise ($39/seat/month)': 39,
    },
    description: 'GitHub AI pair programmer',
  },
  Claude: {
    plans: {
      'Free': 0,
      'Pro ($20/month)': 20,
      'Team ($30/seat/month)': 30,
      'Max ($100/month)': 100,
      'API (Usage-based)': 0, // Custom pricing
    },
    description: 'Anthropic AI assistant',
  },
  ChatGPT: {
    plans: {
      'Free': 0,
      'Plus ($20/month)': 20,
      'Team ($30/seat/month)': 30,
      'Enterprise (Custom)': 0, // Custom pricing
      'API (Usage-based)': 0, // Custom pricing
    },
    description: 'OpenAI AI assistant',
  },
  'Anthropic API': {
    plans: {
      'Pay-as-you-go': 0, // Usage-based
    },
    description: 'Direct API access to Claude',
  },
  'OpenAI API': {
    plans: {
      'Pay-as-you-go': 0, // Usage-based
    },
    description: 'Direct API access to GPT models',
  },
  Gemini: {
    plans: {
      'Free': 0,
      'Pro ($20/month)': 20,
      'Ultra ($30/month)': 30,
      'API (Usage-based)': 0, // Custom pricing
    },
    description: 'Google AI assistant',
  },
  Windsurf: {
    plans: {
      'Free': 0,
      'Pro ($15/month)': 15,
      'Teams ($25/seat/month)': 25,
    },
    description: 'Codeium AI code editor',
  },
};

export const USE_CASES = [
  'Coding',
  'Writing',
  'Data Analysis',
  'Research',
  'Mixed',
] as const;

export type UseCase = (typeof USE_CASES)[number];
