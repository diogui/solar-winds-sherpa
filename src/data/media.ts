/** Public media hosted on Cloudflare R2 (keeps Pages under the 25 MiB asset limit). */
export const r2MediaBase = 'https://pub-2b2894ec7ec14018aad0aef692c3e3d9.r2.dev';

export const burgosFilm = {
	full: `${r2MediaBase}/latest/burgos.mp4`,
	light: `${r2MediaBase}/latest/burgos-640.mp4`,
} as const;
