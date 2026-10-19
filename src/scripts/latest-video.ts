import type { ConnectionLike } from './hero-video';

const FILM = 'film';
const PHOTOS = 'photos';
/** Match latest-expedition `data-exp-skip-start` — fade-in after the black lead-in. */
const FILM_START_AT = 5;
/** Match latest-expedition `data-exp-skip-tail` — stop before the black lead-out. */
const FILM_SKIP_TAIL = 4.3;

function network(): ConnectionLike | null {
	const nav = navigator as Navigator & {
		connection?: ConnectionLike;
		mozConnection?: ConnectionLike;
		webkitConnection?: ConnectionLike;
	};
	return nav.connection ?? nav.mozConnection ?? nav.webkitConnection ?? null;
}

function chooseSrc(root: HTMLElement, force = false): string | null {
	const full = root.dataset.latestSrc ?? '';
	const light = root.dataset.latestSrcLight ?? full;
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
	const playBtn = root.querySelector<HTMLButtonElement>('[data-latest-play]');
	const playLabel = root.querySelector<HTMLElement>('[data-latest-play-label]');
	const muteBtn = root.querySelector<HTMLButtonElement>('[data-latest-mute]');
	const load = root.querySelector<HTMLElement>('[data-latest-load]');
	const loadBar = root.querySelector<HTMLElement>('[data-latest-load-bar]');
	if (!video || !toggle) return;

	const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
	let inView = false;
	let warmed = false;
	/** After the visitor leaves the section, resume only on an explicit Play click. */
	let needsClick = false;

	const mode = () => (root.dataset.latestMode === PHOTOS ? PHOTOS : FILM);

	const setReady = (ready: boolean) => {
		if (ready) root.dataset.latestReady = 'true';
		else delete root.dataset.latestReady;
	};

	const syncTransport = () => {
		const playing = mode() === FILM && !video.paused && !video.ended;
		if (playing) root.dataset.latestPlaying = 'true';
		else delete root.dataset.latestPlaying;

		if (!playBtn) return;
		const copy = playing ? 'Pause' : 'Play';
		if (playLabel) playLabel.textContent = copy;
		playBtn.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
		playBtn.setAttribute('aria-pressed', String(!playing));
	};

	const syncMute = () => {
		if (!muteBtn) return;
		const muted = video.muted;
		muteBtn.setAttribute('aria-pressed', String(muted));
		muteBtn.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
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

	const atFadeIn = () =>
		Number.isFinite(video.currentTime) && video.currentTime >= FILM_START_AT - 0.05;

	const seekToFadeIn = () => {
		if (!Number.isFinite(video.duration) || video.duration <= FILM_START_AT) return;
		if (video.currentTime < FILM_START_AT - 0.05 || video.ended) {
			video.currentTime = FILM_START_AT;
		}
	};

	const loopEnd = () => {
		const duration = video.duration;
		if (!duration || !Number.isFinite(duration)) return Number.POSITIVE_INFINITY;
		return Math.max(FILM_START_AT + 1, duration - FILM_SKIP_TAIL);
	};

	const play = async (explicit = false) => {
		if (mode() !== FILM || motion.matches) return;
		if (needsClick && !explicit) {
			syncTransport();
			return;
		}
		warm(true);
		try {
			if (video.readyState >= 1) seekToFadeIn();
			await video.play();
			needsClick = false;
			if (!atFadeIn()) {
				seekToFadeIn();
				syncTransport();
				return;
			}
			setReady(true);
			syncTransport();
		} catch {
			syncTransport();
		}
	};

	const pause = (requireClick = false) => {
		video.pause();
		if (requireClick) needsClick = true;
		/* Keep the frozen film frame visible so Play stays on the video. */
		if (mode() === FILM && atFadeIn()) setReady(true);
		else if (mode() !== FILM) setReady(false);
		syncTransport();
	};

	const setMode = (next: typeof FILM | typeof PHOTOS) => {
		root.dataset.latestMode = next;
		toggle.setAttribute('aria-checked', String(next === PHOTOS));
		if (next === PHOTOS) {
			pause(false);
			setReady(false);
			return;
		}
		if (inView && !needsClick) void play();
		else {
			warm(true);
			if (atFadeIn()) setReady(true);
			syncTransport();
		}
	};

	video.muted = true;
	video.defaultMuted = true;
	video.loop = false;
	video.playsInline = true;

	video.addEventListener('loadstart', () => setLoad(0, 'loading'));
	video.addEventListener('progress', updateLoad);
	video.addEventListener('loadedmetadata', () => {
		updateLoad();
		if (inView && mode() === FILM && !motion.matches) seekToFadeIn();
	});
	video.addEventListener('seeked', () => {
		if (mode() === FILM && atFadeIn()) setReady(true);
		syncTransport();
	});
	video.addEventListener('playing', () => {
		if (!atFadeIn()) {
			seekToFadeIn();
			return;
		}
		setReady(true);
		syncTransport();
	});
	video.addEventListener('pause', () => {
		syncTransport();
	});
	video.addEventListener('timeupdate', () => {
		if (mode() !== FILM || video.paused || motion.matches) return;
		if (video.currentTime < FILM_START_AT - 0.05) {
			seekToFadeIn();
			return;
		}
		if (video.currentTime >= loopEnd() - 0.05) {
			video.currentTime = FILM_START_AT;
		}
	});
	video.addEventListener('ended', () => {
		if (inView && mode() === FILM && !motion.matches && !needsClick) {
			seekToFadeIn();
			void play();
			return;
		}
		needsClick = true;
		if (mode() === FILM && atFadeIn()) setReady(true);
		syncTransport();
	});
	video.addEventListener('canplay', () => {
		updateLoad();
		if (inView && mode() === FILM && !motion.matches && !needsClick) void play();
	});
	video.addEventListener('canplaythrough', updateLoad);

	if (motion.matches || !chooseSrc(root)) setMode(PHOTOS);
	setLoad(0, 'idle');
	syncMute();
	syncTransport();

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
					if (!needsClick) void play();
					else syncTransport();
				} else if (mode() === FILM && !video.paused) {
					pause(true);
				} else if (mode() === FILM) {
					needsClick = true;
					syncTransport();
				}
			}
		},
		{ threshold: [0, 0.2, 0.6] },
	).observe(root);

	toggle.addEventListener('click', () => {
		setMode(mode() === FILM ? PHOTOS : FILM);
	});

	playBtn?.addEventListener('click', (event) => {
		event.stopPropagation();
		if (mode() !== FILM) {
			setMode(FILM);
			void play(true);
		} else if (video.paused) {
			void play(true);
		} else {
			pause(true);
		}
		/* Drop focus so controls hide on mouse leave instead of sticking via :focus-within. */
		playBtn.blur();
	});

	muteBtn?.addEventListener('click', (event) => {
		event.stopPropagation();
		video.muted = !video.muted;
		video.defaultMuted = video.muted;
		syncMute();
		muteBtn.blur();
	});
}
