/** Content + validation status for the About versao-chat review. */
export type ContentStatus = 'draft' | 'proposed' | 'approved';

export type ContentBlock = {
	id: string;
	status: ContentStatus;
	/** Short note for the Danilo checklist */
	needsFromDanilo?: string;
};

export const aboutChatBlocks: ContentBlock[] = [
	{
		id: 'intro-identity',
		status: 'proposed',
		needsFromDanilo: 'Confirm “international collaboration” wording and host institution',
	},
	{
		id: 'intro-indicators',
		status: 'approved',
		needsFromDanilo: 'Optional: source/date for 31 years · 21 expeditions · 40+ publications',
	},
	{
		id: 'story-origin',
		status: 'proposed',
		needsFromDanilo: 'Confirm founding year (1995?), founder framing, and purpose wording',
	},
	{
		id: 'story-name',
		status: 'draft',
		needsFromDanilo: 'Confirm the real meaning / origin of the name “Sherpas”',
	},
	{
		id: 'story-milestones',
		status: 'draft',
		needsFromDanilo: 'Confirm three highlight years (1995 / 2017 / 2026 drafts) + photo credits',
	},
	{
		id: 'founder',
		status: 'proposed',
		needsFromDanilo: 'Confirm current title, institutional profile URL, and recognition scope',
	},
	{
		id: 'people-roles',
		status: 'proposed',
		needsFromDanilo: 'Confirm who continues instrument, field and analysis work between campaigns',
	},
	{
		id: 'people-profile',
		status: 'draft',
		needsFromDanilo: 'Optional: approved recurring contributors for selected profiles',
	},
	{
		id: 'actions',
		status: 'approved',
		needsFromDanilo: 'Our Actions module from versao-atual',
	},
	{
		id: 'partners-context',
		status: 'proposed',
		needsFromDanilo: 'Ask Danilo if each partner/logo can have a named contribution role',
	},
];

export function isDraft(status: ContentStatus) {
	return status === 'draft';
}
