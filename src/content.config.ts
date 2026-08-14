import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const expeditions = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/expeditions' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			year: z.number(),
			location: z.string(),
			country: z.string(),
			dates: z.string(),
			excerpt: z.string(),
			cover: image(),
			featured: z.boolean().default(true),
			order: z.number(),
		}),
});

const team = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/team' }),
	schema: ({ image }) =>
		z.object({
			name: z.string(),
			role: z.string(),
			affiliation: z.string().optional(),
			order: z.number().default(0),
			photo: image().optional(),
		}),
});

export const collections = { expeditions, team };
