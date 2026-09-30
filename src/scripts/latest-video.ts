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

export function mountLatestFilm(root: HTMLElement) {
	const video = root.querySelector<HTMLVideoElement>('[data-latest-video]');
	const toggle = root.querySelector<HTMLButtonElement>('[data-latest-toggle]');
	const load = root.querySelector<HTMLElement>('[data-latest-load]');
	const loadBar = root.querySelector<HTMLElement>('[data-latest-load-bar]');
	if (!video || !toggle) return;

	const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
	let inView = false;
	let warmed = false;

	const mode = () => (root.dataset.latestMode === PHOTOS ? PHOTOS : FILM);

	const setReady = (ready: boolean) => {
		if (ready && mode() === FILM && !video.paused) root.dataset.latestReady = 'true';
		else delete root.dataset.latestReady;
	};

	const setLoad = (percent: number, state: 'idle' | 'loading' | 'ready') => {
		const value = Math.max(0, Math.min(100, Math.round(percent)));
		root.dataset.latestLoad = state;
		if (loadBar) loadBar.style.transform = `scaleX(${value / 100})`;
		if (!load) return;
		load.setAttribute('aria-valuenow', String(value));
		load.setAttribute(
			'aria-valuetext',
			state === 'ready' ? 'Film downloaded' : `Film downloading, ${value} percent`,
		);
	};

	const updateLoad = () => {
		const duration = video.duration;
		if (!duration || !Number.isFinite(duration)) {
			setLoad(0, warmed ? 'loading' : 'idle');
			return;
		}
		let loaded = 0;
		const ranges = video.buffered;
		if (ranges.length) loaded = ranges.end(ranges.length - 1);
		const percent = (loaded / duration) * 100;
		setLoad(percent, percent >= 99.5 ? 'ready' : 'loading');
	};

	const attach = (src: string) => {
		if (video.getAttribute('src') === src) return;
		setLoad(0, 'loading');
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
		if (playAttempt) playAttempt.then(() => setReady(true)).catch(() => setReady(false));
	};

	const pause = () => {
		video.pause();
		setReady(false);
	};

	const setMode = (next: typeof FILM | typeof PHOTOS) => {
		root.dataset.latestMode = next;
		toggle.setAttribute('aria-checked', String(next === PHOTOS));
		if (next === PHOTOS) pause();
		else if (inView) play();
		else {
			setReady(false);
			warm(true);
		}
	};

	video.muted = true;
	video.defaultMuted = true;
	video.loop = false;
	video.playsInline = true;

	video.addEventListener('loadstart', () => setLoad(0, 'loading'));
	video.addEventListener('progress', updateLoad);
	video.addEventListener('loadedmetadata', updateLoad);
	video.addEventListener('playing', () => setReady(true));
	video.addEventListener('pause', () => {
		if (mode() === PHOTOS || video.ended) setReady(false);
	});
	video.addEventListener('ended', () => {
		if (inView && mode() === FILM && !motion.matches) {
			const src = video.getAttribute('src');
			if (src) {
				warmed = false;
				video.removeAttribute('src');
				video.load();
				attach(src);
				play();
				return;
			}
		}
		setReady(false);
	});
	video.addEventListener('canplay', () => {
		updateLoad();
		if (inView && mode() === FILM && !motion.matches) play();
	});
	video.addEventListener('canplaythrough', updateLoad);

	if (motion.matches || !chooseSrc(root)) setMode(PHOTOS);
	setLoad(0, 'idle');

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
				if (inView) {
					warm();
					play();
				} else pause();
			}
		},
		{ threshold: [0, 0.2, 0.6] },
	).observe(root);

	toggle.addEventListener('click', () => {
		setMode(mode() === FILM ? PHOTOS : FILM);
	});
}
