import type { ExtensionSettings, RewriteMode } from './types';

export const DEFAULT_ABOUT_ME = `English is not my first language, so I often write rough messages and want them rewritten naturally. I prefer friendly, clear, respectful, and practical communication.`;

export const DEFAULT_GLOBAL_PROMPT = `Preserve my original meaning.
Do not add fake details.
Make the text grammatically correct and easy to understand.
Keep the message human, warm, and direct.
Use simple natural English.
Keep the output suitable for the same context.`;

export const DEFAULT_AVOID_PROMPT = `Avoid robotic language.
Avoid unnecessary fancy words.
Avoid over-apologizing.
Avoid exaggerated compliments.
Avoid emojis unless my original text already has emojis.
Avoid phrases like I hope this message finds you well.
Avoid changing the emotional meaning.
Avoid making short casual messages sound like corporate emails.`;

export const DEFAULT_MODE: RewriteMode = 'normal';

export const DEFAULT_SETTINGS: ExtensionSettings = {
  aiChatUrl: '',
  aboutMe: DEFAULT_ABOUT_ME,
  globalPrompt: DEFAULT_GLOBAL_PROMPT,
  avoidPrompt: DEFAULT_AVOID_PROMPT,
  defaultMode: DEFAULT_MODE,
  autoOpenAiTab: false,
  buttonPosition: 'auto',
  enableOnAllSites: true,
  disabledSites: [],
};
