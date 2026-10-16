/** Switch the canonical `/about` page between review versions. */
export type AboutVersionId = 'atual' | 'chat' | 'more';

/**
 * Canonical About version served at `/about`.
 * - `atual` → previous live layout
 * - `chat`  → report redesign without field voices
 * - `more`  → current About with field voices
 */
export const aboutVersion: AboutVersionId = 'more';

export const aboutVersionMeta = {
	atual: {
		id: 'atual' as const,
		label: 'versao-atual',
		path: '/about-atual',
		description: 'Previous About layout',
	},
	chat: {
		id: 'chat' as const,
		label: 'versao-chat',
		path: '/about-chat',
		description: 'Report redesign without field voices',
	},
	more: {
		id: 'more' as const,
		label: 'versao-more',
		path: '/about-more',
		description: 'Current About with field voices',
	},
} as const;
