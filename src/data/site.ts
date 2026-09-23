export const site = {
	name: 'Solar Wind Sherpas',
	tagline: 'We follow total solar eclipses to study the Sun’s outer atmosphere and the origins of the solar wind.',
	description:
		'We follow total solar eclipses to study the Sun’s outer atmosphere and the origins of the solar wind.',
	email: 'contact@solarwindsherpas.com',
};

/** Science, Expeditions and Join redirect to Home while this is true. About is live. Drop `public/_redirects` when opening the rest. */
export const homeOnlyPreview = true;

export const navLeft = [
	{ href: '/about', label: 'About', live: true },
	{ href: '/science', label: 'Science', live: !homeOnlyPreview },
	{ href: '/expeditions', label: 'Expeditions', live: !homeOnlyPreview },
];

export const navRight = [
	{ href: '/#contact', label: 'Contact', live: true },
	{ href: homeOnlyPreview ? '/#support' : '/join', label: 'Support', live: true },
];

export const footerLinks = [
	{ href: navLeft[0].href, label: 'About', live: navLeft[0].live },
	{ href: navLeft[1].href, label: 'Science', live: navLeft[1].live },
	{ href: navLeft[2].href, label: 'Expeditions', live: navLeft[2].live },
	{ href: navRight[1].href, label: 'Support', live: navRight[1].live },
];
