export const site = {
	name: 'Solar Wind Sherpas',
	tagline: 'We follow total solar eclipses to study the Sun’s outer atmosphere and the origins of the solar wind.',
	description:
		'We follow total solar eclipses to study the Sun’s outer atmosphere and the origins of the solar wind.',
	email: 'contact@solarwindsherpas.com',
};

export const supportLinks = [
	{ href: 'https://www.patreon.com/SolarWindSherpas', label: 'Patreon' },
	{ href: 'https://buymeacoffee.com/solarwindsherpas', label: 'Buy Me a Coffee' },
] as const;

export const socialLinks = [
	{ href: 'https://www.instagram.com/solarwindsherpas', label: 'Instagram' },
	{ href: 'https://www.facebook.com/solarwindsherpas', label: 'Facebook' },
] as const;

/** Expeditions index and Join redirect to Home while this is true. About and Science are live. */
export const homeOnlyPreview = true;

/**
 * Permanent URL for the current campaign story page.
 * When the next expedition ships, point this at the new slug; `/latest-expedition` redirects here.
 */
export const currentExpeditionPath = '/expeditions/2026-burgos';

/** Soft alias used in the main nav — always the current campaign. */
export const latestExpeditionHref = '/latest-expedition';

export const navLeft = [
	{ href: '/', label: 'Home', live: true },
	{ href: '/about', label: 'About', live: true },
	{ href: '/science', label: 'Science', live: true },
	{ href: latestExpeditionHref, label: 'Latest Expedition', live: true },
];

export const navRight = [
	{ href: '#take-action', label: 'Contact/Support', live: true, featured: true },
];

export const footerLinks = [
	{ href: navLeft[0].href, label: 'Home', live: navLeft[0].live },
	{ href: navLeft[1].href, label: 'About', live: navLeft[1].live },
	{ href: navLeft[2].href, label: 'Science', live: navLeft[2].live },
	{ href: navLeft[3].href, label: navLeft[3].label, live: navLeft[3].live },
	{ href: navRight[0].href, label: navRight[0].label, live: navRight[0].live },
];
