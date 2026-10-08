/** Switch the canonical `/about` page between the two review versions. */
export type AboutVersionId = 'atual' | 'chat';

/**
 * Canonical About version served at `/about`.
 * - `atual` → current live layout (versao-atual)
 * - `chat`  → ChatGPT report redesign (versao-chat)
 */
export const aboutVersion: AboutVersionId = 'chat';

export const aboutVersionMeta = {
	atual: {
		id: 'atual' as const,
		label: 'versao-atual',
		path: '/about-atual',
		description: 'Current About layout',
	},
	chat: {
		id: 'chat' as const,
		label: 'versao-chat',
		path: '/about-chat',
		description: 'Report redesign with draft content',
	},
} as const;
