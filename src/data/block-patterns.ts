export type BlockPattern = {
	id: string;
	name: string;
	layout: string;
	bestFor: string;
	usedOn: string[];
	variants?: string[];
	status: 'shared' | 'candidate' | 'exception';
	wire: string;
};

/**
 * Layout families — named by structure, not by page copy.
 * `wire` keys map to schematic markup in wire-frames-blocks.astro.
 */
export const blockPatterns: BlockPattern[] = [
	{
		id: 'screen-hero',
		name: 'Screen Hero',
		layout: 'Full-bleed photo or video · copy anchored bottom · optional credit',
		bestFor: 'Place-led openings — Home, About, Latest Expedition',
		usedOn: ['Home', 'About', 'Latest Expedition'],
		variants: ['Video (Home)', 'Photo + facts (Expedition)', 'Photo + indicators (About)'],
		status: 'shared',
		wire: 'screen-hero',
	},
	{
		id: 'essay-opening',
		name: 'Essay Opening',
		layout: 'Label + H1 + lead under header · inset figure below',
		bestFor: 'Concept-led pages where a photo hero would compete with the argument',
		usedOn: ['Science'],
		status: 'exception',
		wire: 'essay-opening',
	},
	{
		id: 'section-intro',
		name: 'Section Intro',
		layout: 'Yellow label · section H2 · optional short lead',
		bestFor: 'House grammar before any content block — use on almost every section',
		usedOn: ['Home', 'About', 'Science', 'Latest Expedition'],
		variants: ['Narrow / prose width', 'Wide / content width'],
		status: 'shared',
		wire: 'section-intro',
	},
	{
		id: 'centered-manifesto',
		name: 'Centered Manifesto',
		layout: 'Label · large statement · short prose, centered in content rail',
		bestFor: 'Identity / mission moments (Who we are)',
		usedOn: ['Home'],
		status: 'candidate',
		wire: 'centered-manifesto',
	},
	{
		id: 'feature-grid-3',
		name: 'Feature Grid · 3',
		layout: 'Section intro · three equal columns (card or text+media)',
		bestFor: 'Three fronts, three actions, three offers',
		usedOn: ['Home (What we do)', 'Take Action columns', 'Science (questions)'],
		variants: ['Media cards (WorkCards)', 'Text columns (Take Action / Science)'],
		status: 'shared',
		wire: 'feature-grid-3',
	},
	{
		id: 'split-steps',
		name: 'Split · Steps + Media',
		layout: 'Copy + numbered steps left · sticky / swapping media right',
		bestFor: 'Explaining a process or concept with visuals',
		usedOn: ['Home (Why we follow eclipses)'],
		status: 'candidate',
		wire: 'split-steps',
	},
	{
		id: 'split-media-copy',
		name: 'Split · Media ↔ Copy',
		layout: 'Media one side · label + H2 + prose the other',
		bestFor: 'Processed images, founder, film intro, science asides',
		usedOn: ['Latest Expedition (Processed)', 'About (Founder)', 'Home (Latest teaser)'],
		variants: ['Media left', 'Media right'],
		status: 'shared',
		wire: 'split-media-copy',
	},
	{
		id: 'film-stage',
		name: 'Film Stage',
		layout: 'Section intro · large video stage · credit / controls',
		bestFor: 'Expedition films and documentary moments',
		usedOn: ['Latest Expedition (Film)', 'Home (Latest with film toggle)'],
		status: 'shared',
		wire: 'film-stage',
	},
	{
		id: 'gallery-carousel',
		name: 'Gallery · Carousel',
		layout: 'Optional filters · horizontal track · captions · lightbox',
		bestFor: 'Photo sets by site, story chapters, people galleries',
		usedOn: ['Latest Expedition', 'About (story / people)'],
		variants: ['With site filters', 'Story chapters', 'People grid → lightbox'],
		status: 'shared',
		wire: 'gallery-carousel',
	},
	{
		id: 'field-beat-grid',
		name: 'Field Beat Grid',
		layout: 'Section intro · labeled photo tiles (Assemble / Camp / …)',
		bestFor: 'Chronology of fieldwork without a long essay',
		usedOn: ['Latest Expedition (In the Field)'],
		status: 'candidate',
		wire: 'field-beat-grid',
	},
	{
		id: 'people-roster',
		name: 'People Roster',
		layout: 'Section intro · groups · portrait + name rows',
		bestFor: 'Expedition team, contributors, chapter casts',
		usedOn: ['Latest Expedition (Team)'],
		status: 'shared',
		wire: 'people-roster',
	},
	{
		id: 'logo-strip',
		name: 'Logo Strip',
		layout: 'Quiet institutional row of partner marks',
		bestFor: 'Made possible by / affiliations',
		usedOn: ['Home', 'About', 'Latest Expedition'],
		status: 'shared',
		wire: 'logo-strip',
	},
	{
		id: 'podcast-embed',
		name: 'Podcast / Embed',
		layout: 'Portrait or cover · copy · language toggle · embed / listen CTA',
		bestFor: 'External media that still belongs in the expedition story',
		usedOn: ['Latest Expedition (Podcast)'],
		status: 'candidate',
		wire: 'podcast-embed',
	},
	{
		id: 'panel-callout',
		name: 'Panel Callout',
		layout: 'Contained panel · label · H2 · lead · list or meta',
		bestFor: 'Next expedition, soft announcements',
		usedOn: ['Latest Expedition (Next)'],
		status: 'candidate',
		wire: 'panel-callout',
	},
	{
		id: 'closing-band',
		name: 'Closing Band · Take Action',
		layout: 'Dusk band · label · H2 · three columns (Support / Contact / Stay Informed)',
		bestFor: 'End of every live page',
		usedOn: ['Home', 'About', 'Science', 'Latest Expedition'],
		status: 'shared',
		wire: 'closing-band',
	},
	{
		id: 'on-page-toc',
		name: 'On-page TOC',
		layout: 'Fixed left rail after hero · scroll-spy links (desktop)',
		bestFor: 'Long expedition / essay pages',
		usedOn: ['Latest Expedition'],
		status: 'candidate',
		wire: 'on-page-toc',
	},
];
