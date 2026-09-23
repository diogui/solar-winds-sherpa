// @ts-check
import { defineConfig } from 'astro/config';
import { homeOnlyPreview } from './src/data/site.ts';

export default defineConfig({
	site: 'https://solarwindsherpas.com',
	prefetch: {
		prefetchAll: true,
		defaultStrategy: 'hover',
	},
	image: {
		responsiveStyles: true,
	},
	redirects: homeOnlyPreview
		? {
				'/science': '/',
				'/join': '/',
				'/expeditions': '/',
			}
		: {},
});
