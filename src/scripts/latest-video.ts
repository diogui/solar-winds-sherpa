import type { ConnectionLike } from './hero-video';

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
	const playBtn = root.querySelector<HTMLButtonElement>('[data-latest-play]');
	const playLabel = root.querySelector<HTMLElement>('[data-latest-play-label]');
	const muteBtn = root.querySelector<HTMLButtonElement>('[data-latest-mute]');
	if (!video) return;

	const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
	let inView = false;
	let warmed = false;
	/** Visitor paused while the section is still on screen — do not auto-resume until they leave and return. */
	let userPaused = false;

	const setReady = (ready: boolean) => {
		if (ready) root.dataset.latestReady = 'true';
		else delete root.dataset.latestReady;
	};

	const syncTransport = () => {
		const playing = !video.paused && !video.ended;
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

	const play = async () => {
		if (motion.matches || userPaused) {
			syncTransport();
			return;
		}
		warm(true);
		try {
			if (video.readyState >= 1) seekToFadeIn();
			await video.play();
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

	const pause = () => {
		video.pause();
		if (atFadeIn()) setReady(true);
		syncTransport();
	};

	video.muted = true;
	video.defaultMuted = true;
	video.loop = false;
	video.playsInline = true;

	if (motion.matches || !chooseSrc(root)) {
		root.dataset.latestMode = 'photos';
		setReady(false);
	}

	syncMute();
	syncTransport();

	video.addEventListener('loadedmetadata', () => {
		if (inView && !motion.matches) seekToFadeIn();
	});
	video.addEventListener('seeked', () => {
		if (atFadeIn()) setReady(true);
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
	video.addEventListener('pause', syncTransport);
	video.addEventListener('timeupdate', () => {
		if (video.paused || motion.matches) return;
		if (video.currentTime < FILM_START_AT - 0.05) {
			seekToFadeIn();
			return;
		}
		if (video.currentTime >= loopEnd() - 0.05) {
			video.currentTime = FILM_START_AT;
		}
	});
	video.addEventListener('ended', () => {
		if (inView && !motion.matches && !userPaused) {
			seekToFadeIn();
			void play();
			return;
		}
		if (atFadeIn()) setReady(true);
		syncTransport();
	});
	video.addEventListener('canplay', () => {
		if (inView && !motion.matches && !userPaused) void play();
	});

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
					userPaused = false;
					warm();
					void play();
				} else if (!video.paused) {
					pause();
				} else {
					syncTransport();
				}
			}
		},
		{ threshold: [0, 0.2, 0.6] },
	).observe(root);

	playBtn?.addEventListener('click', (event) => {
		event.stopPropagation();
		if (video.paused) {
			userPaused = false;
			void play();
		} else {
			userPaused = true;
			pause();
		}
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
