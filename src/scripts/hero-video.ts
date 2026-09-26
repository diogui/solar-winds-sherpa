import { mountHeroAnnotation } from './hero-annotation';

// Selection happens before any video is requested. This is not HLS/streaming ABR.

export type ConnectionLike = {
	effectiveType?: string;
	downlink?: number;
	saveData?: boolean;
	addEventListener?(type: string, listener: () => void): void;
};

export type HeroChoice = {
	file: string | null;
	poster: string;
	reason: string;
};

type ChooseHeroOptions = {
	width: number;
	portrait: boolean;
	reducedMotion?: boolean;
	connection?: ConnectionLike | null;
};

export function chooseHero({
	reducedMotion = false,
	connection = null,
}: ChooseHeroOptions): HeroChoice {
	const poster = 'hero-poster.jpg';
	const type = connection?.effectiveType;
	if (reducedMotion || connection?.saveData || ['slow-2g', '2g'].includes(type ?? '')) {
		return { file: null, poster, reason: 'poster' };
	}
	return { file: 'hero-final.mp4', poster, reason: 'final' };
}

function currentChoice(connection: ConnectionLike | null, reducedMotion: boolean) {
	return chooseHero({
		width: window.innerWidth,
		portrait: window.innerHeight > window.innerWidth,
		reducedMotion,
		connection,
	});
}

export function mountHero(root: HTMLElement, base = '/media/hero/') {
	const video = root.querySelector<HTMLVideoElement>('[data-hero-video], video');
	const button = root.querySelector<HTMLButtonElement>('[data-hero-pause], [data-video-toggle]');
	if (!video || !button) return null;
	const label = button.querySelector<HTMLElement>('[data-hero-pause-label]') ?? button;

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

	let timeout: number | undefined;
	let userPaused = false;
	let ended = false;

	const setButton = (playing: boolean) => {
		root.dataset.playing = playing || ended ? 'true' : 'false';
		if (ended) {
			root.dataset.ended = 'true';
			label.textContent = 'Restart video';
			button.setAttribute('aria-pressed', 'true');
			button.setAttribute('aria-label', 'Restart video');
			return;
		}
		delete root.dataset.ended;
		const copy = playing ? 'Pause video' : 'Play video';
		label.textContent = copy;
		button.setAttribute('aria-pressed', String(!playing));
		button.setAttribute('aria-label', copy);
	};

	const idle = () => {
		if (timeout !== undefined) window.clearTimeout(timeout);
		timeout = undefined;
		if (!ended) setButton(false);
	};

	const stop = () => {
		if (ended) return;
		video.pause();
		idle();
	};

	const unload = () => {
		stop();
		video.removeAttribute('src');
		video.load();
	};

	const release = () => {
		if (ended) {
			video.pause();
			return;
		}
		video.pause();
		if (!video.getAttribute('src')) {
			idle();
			return;
		}
		video.removeAttribute('src');
		video.load();
		idle();
	};

	const play = async (explicit = false) => {
		if (ended && !explicit) return;
		if (ended && explicit) {
			ended = false;
			delete root.dataset.ended;
			video.currentTime = 0;
		}
		if (!video.getAttribute('src')) {
			const selected =
				explicit && !selection.file ? currentChoice(null, motion.matches) : selection;
			if (!selected.file) return;
			video.src = base + selected.file;
			root.dataset.heroFile = selected.file;
		}
		userPaused = false;
		if (timeout !== undefined) window.clearTimeout(timeout);
		timeout = window.setTimeout(unload, 10000);
		try {
			await video.play();
		} catch {
			idle();
		}
	};

	video.addEventListener('playing', () => {
		if (timeout !== undefined) window.clearTimeout(timeout);
		timeout = undefined;
		ended = false;
		setButton(true);
	});
	video.addEventListener('ended', () => {
		ended = true;
		userPaused = true;
		if (timeout !== undefined) window.clearTimeout(timeout);
		timeout = undefined;
		setButton(false);
	});
	video.addEventListener('waiting', () => {
		if (ended) return;
		if (timeout !== undefined) window.clearTimeout(timeout);
		timeout = window.setTimeout(unload, 10000);
	});
	video.addEventListener('error', unload);
	button.addEventListener('click', () => {
		if (ended || video.ended) {
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
	mountHeroAnnotation(root, video);
	new IntersectionObserver(
		([entry]) => {
			if (entry?.isIntersecting && (entry.intersectionRatio ?? 0) >= 0.2) {
				if (!userPaused && !ended && selection.file) void play();
				return;
			}
			release();
		},
		{ threshold: [0, 0.2] },
	).observe(root);

	return selection;
}
