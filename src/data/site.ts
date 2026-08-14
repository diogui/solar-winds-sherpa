export const site = {
	name: 'Solar Wind Sherpas',
	tagline: 'We chase total solar eclipses. We study the Sun’s corona to uncover the secrets of the solar wind.',
	description:
		'An international team of scientists and explorers who travel the world to observe total solar eclipses and study the solar corona and the solar wind.',
	email: 'hello@solarwindsherpas.com',
};

export const navLeft = [
	{ href: '/about', label: 'About' },
	{ href: '/science', label: 'Science' },
	{ href: '/expeditions', label: 'Expeditions' },
] as const;

export const navRight = [
	{ href: '/join', label: 'Join / Support' },
	{ href: '/#contact', label: 'Contact' },
] as const;

export const footerLinks = [
	{ href: '/about', label: 'About' },
	{ href: '/science', label: 'Science' },
	{ href: '/expeditions', label: 'Expeditions' },
	{ href: '/join', label: 'Join / Support' },
] as const;
