import { mountHeroAnnotation } from './hero-annotation';

// Selection happens before any video is requested. This is not HLS/streaming ABR.

export const HERO_MOBILE_MAX = 767;

export type ConnectionLike = {
	effectiveType?: string;
	downlink?: number;
	saveData?: boolean;
	addEventListener?(type: string, listener: () => void): void;
};

export type HeroChoice = {
	file: string | null;
	poster: string;
	ending: string;
	reason: string;
	mobile: boolean;
};

type ChooseHeroOptions = {
	width: number;
	portrait?: boolean;
	reducedMotion?: boolean;
	connection?: ConnectionLike | null;
};

export function chooseHero({
	width,
	reducedMotion = false,
	connection = null,
}: ChooseHeroOptions): HeroChoice {
	const mobile = width <= HERO_MOBILE_MAX;
	/* Cache-bust when posters are regenerated to match the opening frame. */
	const poster = mobile ? 'hero-mobile-poster.jpg?v=4' : 'hero-poster.jpg?v=4';
	const ending = mobile ? 'hero-mobile-ending.jpg' : 'hero-ending.jpg';
	const type = connection?.effectiveType;
	if (reducedMotion || connection?.saveData || ['slow-2g', '2g'].includes(type ?? '')) {
		return { file: null, poster, ending, reason: 'poster', mobile };
	}
	if (mobile) {
		if (type === '3g') {
			return { file: 'hero-mobile-480.mp4?v=9', poster, ending, reason: 'mobile-3g', mobile };
		}
		return { file: 'hero-mobile-720.mp4?v=9', poster, ending, reason: 'mobile', mobile };
	}
	return { file: 'hero-final-24.mp4?v=4', poster, ending, reason: 'final', mobile };
}

function currentChoice(connection: ConnectionLike | null, reducedMotion: boolean) {
	return chooseHero({
		width: window.innerWidth,
		portrait: window.innerHeight > window.innerWidth,
		reducedMotion,
		connection,
	});
}

/** Bad eclipse→celebration crossfade baked into hero-final / hero-mobile masters. */
const HERO_GHOST_SKIP = { from: 38.72, to: 39.55 } as const;
/** Skip the weak opening; start just before the eclipse callout so motion leads. */
const HERO_START_AT = 2;
/** Brief beat on the large title before it tucks downward. */
const HERO_BRAND_HOLD_MS = 700;
/** Match `.home-hero-name` compact transition — video starts after the title settles. */
const HERO_COMPACT_MS = 1200;
/** Pause when less than half the hero remains visible, or as soon as it scrolls up. */
const HERO_PLAY_MIN_RATIO = 0.5;

export function mountHero(root: HTMLElement, base = '/media/hero/') {
	const video = root.querySelector<HTMLVideoElement>('[data-hero-video], video');
	const button = root.querySelector<HTMLButtonElement>('[data-hero-pause], [data-video-toggle]');
	if (!video || !button) return null;
	const label = button.querySelector<HTMLElement>('[data-hero-pause-label]') ?? button;
	const ending = root.querySelector<HTMLImageElement>('[data-hero-ending], .home-hero-ending');

	const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const nav = navigator as Navigator & {
		connection?: ConnectionLike;
		mozConnection?: ConnectionLike;
		webkitConnection?: ConnectionLike;
	};
	const connection = nav.connection ?? nav.mozConnection ?? nav.webkitConnection ?? null;
	const selection = currentChoice(connection, motion.matches);

	video.muted = true;
	video.loop = false;
	video.playsInline = true;
	video.preload = 'none';
	video.poster = base + selection.poster;
	root.dataset.heroFile = selection.file ?? 'poster';
	root.dataset.heroMobile = selection.mobile ? 'true' : 'false';

	let timeout: number | undefined;
	let startDelay: number | undefined;
	let userPaused = false;
	/** Paused because the hero left the viewport — resume when it returns (unless the user paused). */
	let scrollPaused = false;
	let ended = false;
	let skippingGhost = false;

	const setHeroCompact = (compact: boolean) => {
		if (compact) root.dataset.heroCompact = 'true';
		else delete root.dataset.heroCompact;
	};

	const clearStartDelay = () => {
		if (startDelay === undefined) return;
		window.clearTimeout(startDelay);
		startDelay = undefined;
	};

	const skipGhostFrame = () => {
		if (skippingGhost || ended || userPaused) return;
		const t = video.currentTime;
		if (t < HERO_GHOST_SKIP.from || t >= HERO_GHOST_SKIP.to) return;
		skippingGhost = true;
		try {
			video.currentTime = HERO_GHOST_SKIP.to;
		} finally {
			window.requestAnimationFrame(() => {
				skippingGhost = false;
			});
		}
	};

	const atEnd = () =>
		video.duration > 1 && video.currentTime >= video.duration - 0.08;

	const setButton = (playing: boolean) => {
		root.dataset.playing = playing || ended ? 'true' : 'false';
		if (ended) {
			root.dataset.ended = 'true';
			delete root.dataset.paused;
			if (selection.mobile) {
				button.hidden = true;
				button.setAttribute('aria-hidden', 'true');
				return;
			}
			label.textContent = 'Restart video';
			button.hidden = false;
			button.removeAttribute('aria-hidden');
			button.setAttribute('aria-pressed', 'true');
			button.setAttribute('aria-label', 'Restart video');
			return;
		}
		delete root.dataset.ended;
		button.hidden = false;
		button.removeAttribute('aria-hidden');
		const copy = playing ? 'Pause video' : 'Play video';
		label.textContent = copy;
		button.setAttribute('aria-pressed', String(!playing));
		button.setAttribute('aria-label', copy);
	};

	const idle = () => {
		if (timeout !== undefined) window.clearTimeout(timeout);
		timeout = undefined;
		if (!ended) {
			delete root.dataset.paused;
			setButton(false);
		}
	};

	const clearWarmState = () => {
		delete root.dataset.heroWarming;
		delete root.dataset.heroReady;
	};

	const stop = () => {
		if (ended) return;
		clearStartDelay();
		scrollPaused = false;
		video.pause();
		root.dataset.paused = 'true';
		if (timeout !== undefined) window.clearTimeout(timeout);
		timeout = undefined;
		setButton(false);
	};

	/** Leave the file in place so returning to the hero can resume mid-play. */
	const pauseForScroll = () => {
		clearStartDelay();
		if (ended || userPaused) return;
		if (!video.getAttribute('src')) {
			clearWarmState();
			if (!motion.matches) setHeroCompact(false);
			idle();
			return;
		}
		if (video.paused) return;
		scrollPaused = true;
		video.pause();
		root.dataset.paused = 'true';
		if (timeout !== undefined) window.clearTimeout(timeout);
		timeout = undefined;
		setButton(false);
	};

	const unload = () => {
		if (ended) return;
		clearStartDelay();
		clearWarmState();
		scrollPaused = false;
		video.pause();
		video.removeAttribute('src');
		video.load();
		if (!motion.matches) setHeroCompact(false);
		idle();
	};

	const ensureEnding = () => {
		if (!ending || ending.getAttribute('src')) return;
		ending.src = base + selection.ending;
	};

	/** Start buffering during the brand hold so autoplay is not a second “frozen” wait. */
	const warm = () => {
		if (!selection.file || video.getAttribute('src') || motion.matches) return;
		video.preload = 'auto';
		video.src = base + selection.file;
		root.dataset.heroFile = selection.file;
		root.dataset.heroWarming = 'true';
		const seekStart = () => {
			try {
				if (video.currentTime < HERO_START_AT - 0.05) video.currentTime = HERO_START_AT;
			} catch {
				/* ignore seek before ready */
			}
		};
		if (video.readyState >= 1) seekStart();
		else video.addEventListener('loadedmetadata', seekStart, { once: true });
		video.addEventListener(
			'canplay',
			() => {
				root.dataset.heroReady = 'true';
			},
			{ once: true },
		);
	};

	const play = async (explicit = false) => {
		clearStartDelay();
		delete root.dataset.heroWarming;
		if (ended && selection.mobile && atEnd()) return;
		if (ended && explicit && !selection.mobile) {
			ended = false;
			delete root.dataset.ended;
			video.currentTime = HERO_START_AT;
		}
		if (!video.getAttribute('src')) {
			const selected =
				explicit && !selection.file ? currentChoice(null, motion.matches) : selection;
			if (!selected.file) return;
			video.preload = 'auto';
			video.src = base + selected.file;
			root.dataset.heroFile = selected.file;
		}
		userPaused = false;
		scrollPaused = false;
		delete root.dataset.paused;
		setHeroCompact(true);
		if (timeout !== undefined) window.clearTimeout(timeout);
		timeout = window.setTimeout(unload, 10000);
		try {
			if (video.currentTime < HERO_START_AT - 0.05) video.currentTime = HERO_START_AT;
			await video.play();
		} catch {
			if (!ended) idle();
		}
	};

	const scheduleAutoplay = () => {
		if (userPaused || ended || !selection.file || startDelay !== undefined) return;
		warm();
		/* 1) Hold large brand → 2) title tucks down → 3) video starts. */
		startDelay = window.setTimeout(() => {
			if (userPaused || ended || scrollPaused) {
				startDelay = undefined;
				return;
			}
			setHeroCompact(true);
			startDelay = window.setTimeout(() => {
				startDelay = undefined;
				if (userPaused || ended || scrollPaused) return;
				void play();
			}, HERO_COMPACT_MS);
		}, HERO_BRAND_HOLD_MS);
	};

	const schedulePosterCompact = () => {
		if (selection.file || startDelay !== undefined) return;
		startDelay = window.setTimeout(() => {
			startDelay = undefined;
			setHeroCompact(true);
		}, HERO_BRAND_HOLD_MS);
	};

	const inHeroPlayZone = (entry: IntersectionObserverEntry) =>
		entry.isIntersecting &&
		entry.boundingClientRect.top >= -16 &&
		(entry.intersectionRatio ?? 0) >= HERO_PLAY_MIN_RATIO;

	video.addEventListener('playing', () => {
		if (atEnd()) return;
		ended = false;
		if (timeout !== undefined) window.clearTimeout(timeout);
		timeout = undefined;
		delete root.dataset.paused;
		ensureEnding();
		setButton(true);
		skipGhostFrame();
	});
	video.addEventListener('timeupdate', skipGhostFrame);
	video.addEventListener('seeked', skipGhostFrame);
	video.addEventListener('ended', () => {
		if (!atEnd()) return;
		ended = true;
		userPaused = true;
		if (timeout !== undefined) window.clearTimeout(timeout);
		timeout = undefined;
		ensureEnding();
		video.pause();
		setButton(false);
	});
	video.addEventListener('waiting', () => {
		if (ended) return;
		if (timeout !== undefined) window.clearTimeout(timeout);
		timeout = window.setTimeout(unload, 10000);
	});
	video.addEventListener('error', () => {
		if (ended) return;
		unload();
	});
	button.addEventListener('click', () => {
		if (ended || atEnd()) {
			if (selection.mobile) return;
			void play(true);
			return;
		}
		if (video.paused) {
			void play(true);
		} else {
			userPaused = true;
			stop();
		}
	});
	motion.addEventListener('change', () => {
		if (motion.matches) unload();
	});
	connection?.addEventListener?.('change', () => {
		if (connection.saveData || ['slow-2g', '2g'].includes(connection.effectiveType ?? '')) unload();
	});
	document.addEventListener('visibilitychange', () => {
		if (document.hidden && !userPaused && !ended) stop();
	});

	idle();
	if (motion.matches) setHeroCompact(true);
	else setHeroCompact(false);
	mountHeroAnnotation(root, video);
	new IntersectionObserver(
		([entry]) => {
			if (!entry) return;
			if (inHeroPlayZone(entry)) {
				if (userPaused || ended) return;
				if (scrollPaused && video.getAttribute('src')) {
					void play();
					return;
				}
				if (selection.file) scheduleAutoplay();
				else schedulePosterCompact();
				return;
			}
			/* First scroll that lifts the hero, or ≤ half visible → pause immediately. */
			pauseForScroll();
		},
		{ threshold: [0, 0.25, 0.5, 0.75, 1] },
	).observe(root);

	return selection;
}
