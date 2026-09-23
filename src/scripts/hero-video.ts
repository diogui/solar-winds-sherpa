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
	width,
	portrait,
	reducedMotion = false,
	connection = null,
}: ChooseHeroOptions): HeroChoice {
	const mobile = width < 768 && portrait;
	const poster = `poster-${mobile ? 'mobile' : 'desktop'}.jpg`;
	const type = connection?.effectiveType;
	const downlink = connection?.downlink;
	if (reducedMotion || connection?.saveData || ['slow-2g', '2g'].includes(type ?? '')) {
		return { file: null, poster, reason: 'poster' };
	}
	const fast = type === '4g' && typeof downlink === 'number' && downlink >= 5;
	if (mobile) {
		return { file: `hero-mobile-${fast ? 720 : 480}.mp4`, poster, reason: fast ? 'mobile-fast' : 'mobile' };
	}
	return {
		file: `hero-desktop-${fast && width >= 1400 ? 1280 : 960}.mp4`,
		poster,
		reason: fast && width >= 1400 ? 'desktop-fast' : 'desktop',
	};
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

	const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const nav = navigator as Navigator & {
		connection?: ConnectionLike;
		mozConnection?: ConnectionLike;
		webkitConnection?: ConnectionLike;
	};
	const connection = nav.connection ?? nav.mozConnection ?? nav.webkitConnection ?? null;
	const selection = currentChoice(connection, motion.matches);

	video.muted = true;
	video.loop = true;
	video.playsInline = true;
	video.preload = 'none';
	video.poster = base + selection.poster;
	root.dataset.heroFile = selection.file ?? 'poster';

	let timeout: number | undefined;
	let userPaused = false;

	const setPlayingUi = (playing: boolean) => {
		root.dataset.playing = playing ? 'true' : 'false';
		button.textContent = playing ? 'Pause video' : 'Play video';
		button.setAttribute('aria-pressed', String(!playing));
	};

	const idle = () => {
		if (timeout !== undefined) window.clearTimeout(timeout);
		timeout = undefined;
		setPlayingUi(false);
	};

	const stop = () => {
		video.pause();
		idle();
	};

	const unload = () => {
		stop();
		video.removeAttribute('src');
		video.load();
	};

	const release = () => {
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
		setPlayingUi(true);
	});
	video.addEventListener('waiting', () => {
		if (timeout !== undefined) window.clearTimeout(timeout);
		timeout = window.setTimeout(unload, 10000);
	});
	video.addEventListener('error', unload);
	button.addEventListener('click', () => {
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
		if (document.hidden && !userPaused) stop();
	});

	idle();
	new IntersectionObserver(
		([entry]) => {
			if (entry?.isIntersecting && (entry.intersectionRatio ?? 0) >= 0.2) {
				if (!userPaused && selection.file) void play();
				return;
			}
			release();
		},
		{ threshold: [0, 0.2] },
	).observe(root);

	return selection;
}
