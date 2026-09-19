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
	{ href: homeOnlyPreview ? '/#who-we-are' : '/about', label: 'About' },
	{ href: homeOnlyPreview ? '/#why-eclipses' : '/science', label: 'Science' },
	{ href: homeOnlyPreview ? '/#latest-expedition' : '/expeditions', label: 'Expeditions' },
] as const;

export const navRight = [
	{ href: '/#contact', label: 'Contact' },
	{ href: homeOnlyPreview ? '/#support' : '/join', label: 'Support' },
] as const;

export const footerLinks = [
	{ href: navLeft[0].href, label: 'About' },
	{ href: navLeft[1].href, label: 'Science' },
	{ href: navLeft[2].href, label: 'Expeditions' },
	{ href: navRight[1].href, label: 'Support' },
] as const;
