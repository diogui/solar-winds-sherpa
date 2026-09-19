export const site = {
	name: 'Solar Wind Sherpas',
	tagline: 'We follow total solar eclipses to study the Sun’s outer atmosphere and the origins of the solar wind.',
	description:
		'We follow total solar eclipses to study the Sun’s outer atmosphere and the origins of the solar wind.',
	email: 'contact@solarwindsherpas.com',
};

/** Inner pages stay in the repo but redirect to Home until this is false. Also drop `public/_redirects`. */
export const homeOnlyPreview = true;

export const navLeft = [
	{ href: '/about', label: 'About', live: !homeOnlyPreview },
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
