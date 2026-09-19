const FILM = 'film';
const PHOTOS = 'photos';

export function mountLatestTriptych(root: HTMLElement) {
	const videos = [...root.querySelectorAll<HTMLVideoElement>('[data-latest-video]')];
	const toggle = root.querySelector<HTMLButtonElement>('[data-latest-toggle]');
	if (!videos.length) return;

	const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const src = root.dataset.latestSrc ?? '/media/latest/burgos.mp4';
	const master = videos[0];
	const slaves = videos.slice(1);
	let inView = false;

	videos.forEach((video) => {
		video.muted = true;
		video.defaultMuted = true;
		video.loop = true;
		video.playsInline = true;
		if (!video.getAttribute('src') && !video.querySelector('source')) {
			video.src = src;
		}
	});

	const mode = () => (root.dataset.latestMode === PHOTOS ? PHOTOS : FILM);

	const syncSlaves = () => {
		const time = master.currentTime;
		for (const slave of slaves) {
			if (Math.abs(slave.currentTime - time) > 0.12) slave.currentTime = time;
		}
	};

	const playAll = () => {
		if (mode() !== FILM || motion.matches) return;
		videos.forEach((video) => {
			const play = video.play();
			if (play) play.catch(() => undefined);
		});
	};

	const pauseAll = () => {
		videos.forEach((video) => video.pause());
	};

	const setMode = (next: typeof FILM | typeof PHOTOS) => {
		root.dataset.latestMode = next;
		toggle?.setAttribute('aria-checked', String(next === PHOTOS));
		if (next === PHOTOS) pauseAll();
		else if (inView) playAll();
	};

	if (!motion.matches) {
		master.addEventListener('timeupdate', syncSlaves);
		master.addEventListener('seeked', syncSlaves);
		master.addEventListener('play', playAll);
		master.addEventListener('pause', () => {
			if (mode() === PHOTOS || !inView) slaves.forEach((video) => video.pause());
		});

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					inView = entry.isIntersecting && entry.intersectionRatio >= 0.28;
					if (inView) playAll();
					else pauseAll();
				}
			},
			{ threshold: [0, 0.28, 0.6] },
		);
		observer.observe(root);
	} else {
		setMode(PHOTOS);
	}

	toggle?.addEventListener('click', () => {
		setMode(mode() === FILM ? PHOTOS : FILM);
	});
}
