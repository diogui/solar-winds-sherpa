export const site = {
	name: 'Solar Wind Sherpas',
	tagline: 'We follow total solar eclipses to study the Sun’s outer atmosphere and the origins of the solar wind.',
	description:
		'We follow total solar eclipses to study the Sun’s outer atmosphere and the origins of the solar wind.',
	email: 'contact@solarwindsherpas.com',
};

export const navLeft = [
	{ href: '/about', label: 'About' },
	{ href: '/science', label: 'Science' },
	{ href: '/expeditions', label: 'Expeditions' },
] as const;

export const navRight = [{ href: '/join', label: 'Support' }] as const;

export const footerLinks = [
	{ href: '/about', label: 'About' },
	{ href: '/science', label: 'Science' },
	{ href: '/expeditions', label: 'Expeditions' },
	{ href: '/join', label: 'Support' },
] as const;
