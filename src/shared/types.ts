// Core shared types for the Re-Phraser extension.

export type RewriteMode = 'quick' | 'normal' | 'formal';

export type ButtonPositionPreference = 'auto' | 'above' | 'below';

export interface ExtensionSettings {
  aiChatUrl: string;
  aboutMe: string;
  globalPrompt: string;
  avoidPrompt: string;
  defaultMode: RewriteMode;
  autoOpenAiTab: boolean;
  buttonPosition: ButtonPositionPreference;
  enableOnAllSites: boolean;
  disabledSites: string[];
}

export interface BuildPromptInput {
  selectedText: string;
  mode: RewriteMode;
  aboutMe: string;
  globalPrompt: string;
  avoidPrompt: string;
}
