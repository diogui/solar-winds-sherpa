import type { ConnectionLike } from './hero-video';

const FILM = 'film';
const PHOTOS = 'photos';

function network(): ConnectionLike | null {
	const nav = navigator as Navigator & {
		connection?: ConnectionLike;
		mozConnection?: ConnectionLike;
		webkitConnection?: ConnectionLike;
	};
	return nav.connection ?? nav.mozConnection ?? nav.webkitConnection ?? null;
}

function chooseSrc(root: HTMLElement, force = false): string | null {
	const full = root.dataset.latestSrc ?? '/media/latest/burgos.mp4';
	const light = root.dataset.latestSrcLight ?? '/media/latest/burgos-640.mp4';
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const connection = network();
	const type = connection?.effectiveType;
	if (!force && (reducedMotion || connection?.saveData || ['slow-2g', '2g'].includes(type ?? ''))) {
		return null;
	}
	const slow = type === '3g' || (typeof connection?.downlink === 'number' && connection.downlink < 1.5);
	return slow || window.innerWidth < 768 ? light : full;
}

export function mountLatestTriptych(root: HTMLElement) {
	const video = root.querySelector<HTMLVideoElement>('[data-latest-video]');
	const toggle = root.querySelector<HTMLButtonElement>('[data-latest-toggle]');
	if (!video || !toggle) return;

	const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
	let inView = false;
	let warmed = false;

	const mode = () => (root.dataset.latestMode === PHOTOS ? PHOTOS : FILM);

	const attach = (src: string) => {
		if (video.getAttribute('src') === src) return;
		video.preload = 'auto';
		video.src = src;
	};

	const warm = (force = false) => {
		const src = chooseSrc(root, force);
		if (!src || warmed) return;
		warmed = true;
		attach(src);
	};

	const play = () => {
		if (mode() !== FILM || motion.matches) return;
		warm(true);
		const playAttempt = video.play();
		if (playAttempt) playAttempt.catch(() => undefined);
	};

	const pause = () => {
		video.pause();
	};

	const setMode = (next: typeof FILM | typeof PHOTOS) => {
		root.dataset.latestMode = next;
		toggle.setAttribute('aria-checked', String(next === PHOTOS));
		if (next === PHOTOS) pause();
		else if (inView) play();
		else warm(true);
	};

	video.addEventListener('canplay', () => {
		if (inView && mode() === FILM && !motion.matches) {
			const playAttempt = video.play();
			if (playAttempt) playAttempt.catch(() => undefined);
		}
	});

	if (motion.matches || !chooseSrc(root)) setMode(PHOTOS);

	new IntersectionObserver(
		(entries) => {
			if (entries.some((entry) => entry.isIntersecting)) warm();
		},
		{ rootMargin: '900px 0px', threshold: 0 },
	).observe(root);

	new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				inView = entry.isIntersecting && entry.intersectionRatio >= 0.2;
				if (inView) play();
				else pause();
			}
		},
		{ threshold: [0, 0.2, 0.6] },
	).observe(root);

	toggle.addEventListener('click', () => {
		setMode(mode() === FILM ? PHOTOS : FILM);
	});
}
