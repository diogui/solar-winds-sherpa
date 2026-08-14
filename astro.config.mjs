// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://solarwindsherpas.com',
	prefetch: {
		prefetchAll: true,
		defaultStrategy: 'hover',
	},
	image: {
		responsiveStyles: true,
	},
});
