type CutId = 'quick' | 'full';

function chooseSrc(panel: HTMLElement) {
	const full = panel.dataset.expSrc;
	const light = panel.dataset.expSrcLight;
	if (!full) return '';
	if (light && window.innerWidth < 768) return light;
	return full;
}

function mountCut(panel: HTMLElement) {
	const video = panel.querySelector<HTMLVideoElement>('[data-exp-video]');
	const playButton = panel.querySelector<HTMLButtonElement>('[data-exp-play]');
	const load = panel.querySelector<HTMLElement>('[data-exp-load]');
	const loadBar = panel.querySelector<HTMLElement>('[data-exp-load-bar]');
	const playLabel = playButton?.querySelector<HTMLElement>('[data-exp-play-label]') ?? playButton;
	if (!video || !playButton) return null;

	const skipStart = Number(panel.dataset.expSkipStart ?? 0);
	const skipTail = Number(panel.dataset.expSkipTail ?? 0);
	const preload = panel.dataset.expPreload === 'auto' ? 'auto' : 'none';
	const muted = panel.dataset.expMuted === 'true';

	let seeking = false;
	let playing = false;
	let attached = false;
	let revealing = false;

	const loopEnd = () => {
		const duration = video.duration;
		if (!duration || !Number.isFinite(duration)) return Number.POSITIVE_INFINITY;
		return Math.max(skipStart + 1, duration - skipTail);
	};

	const rewindToPoster = () => {
		seeking = false;
	};

	const restartFromStart = () => {
		const src = chooseSrc(panel);
		if (!src) return;
		attached = false;
		video.removeAttribute('src');
		video.load();
		attach();
		video.addEventListener('canplay', () => startPlayback(), { once: true });
	};

	const skipHold = () => {
		if (!playing || skipTail <= 0) return;
		if (video.currentTime >= loopEnd() - 0.05) {
			video.pause();
			setPlaying(false);
			revealing = false;
			panel.classList.remove('has-played');
			rewindToPoster();
		}
	};

	const revealVideo = () => {
		if (!playing || panel.classList.contains('has-played')) return;
		panel.classList.add('has-played');
		revealing = false;
	};

	const waitForStartFrame = () => {
		if (revealing || panel.classList.contains('has-played')) return;
		revealing = true;
		const videoEl = video as HTMLVideoElement & {
			requestVideoFrameCallback?: (
				callback: (now: number, metadata: { mediaTime: number }) => void,
			) => number;
		};
		if (typeof videoEl.requestVideoFrameCallback === 'function') {
			const onFrame = (_now: number, metadata: { mediaTime: number }) => {
				if (!playing) {
					revealing = false;
					return;
				}
				if (skipStart > 0 && metadata.mediaTime < skipStart - 0.05) {
					videoEl.requestVideoFrameCallback!(onFrame);
					return;
				}
				revealVideo();
			};
			videoEl.requestVideoFrameCallback(onFrame);
			return;
		}
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				if (playing && (skipStart <= 0 || video.currentTime >= skipStart - 0.05)) {
					revealVideo();
				} else {
					revealing = false;
					if (playing) waitForStartFrame();
				}
			});
		});
	};

	const setLoad = (percent: number, state: 'idle' | 'loading' | 'ready') => {
		const value = Math.max(0, Math.min(100, Math.round(percent)));
		panel.dataset.expLoad = state;
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
			setLoad(0, video.getAttribute('src') ? 'loading' : 'idle');
			return;
		}
		let loaded = 0;
		const ranges = video.buffered;
		if (ranges.length) loaded = ranges.end(ranges.length - 1);
		const percent = (loaded / duration) * 100;
		setLoad(percent, percent >= 99.5 ? 'ready' : 'loading');
	};

	const setPlaying = (next: boolean) => {
		playing = next;
		panel.classList.toggle('is-playing', next);
		if (next) waitForStartFrame();
		const copy = next ? 'Pause' : 'Play';
		if (playLabel) playLabel.textContent = copy;
		playButton.setAttribute('aria-label', next ? 'Pause video' : 'Play video');
		playButton.setAttribute('aria-pressed', String(next));
		playButton.setAttribute('aria-hidden', String(next));
		playButton.tabIndex = next ? -1 : 0;
	};

	const pause = () => {
		video.pause();
		setPlaying(false);
	};

	const startPlayback = () => {
		const attempt = video.play();
		if (attempt) {
			attempt.then(() => setPlaying(true)).catch(() => setPlaying(false));
		}
	};

	const play = () => {
		if (video.ended) {
			restartFromStart();
			return;
		}
		attach();
		if (video.readyState < 1) {
			video.addEventListener('loadedmetadata', () => play(), { once: true });
			return;
		}
		startPlayback();
	};

	const togglePlay = () => {
		if (playing) pause();
		else play();
	};

	const attach = () => {
		const src = chooseSrc(panel);
		if (!src || attached) return;
		attached = true;
		video.muted = muted;
		video.defaultMuted = muted;
		video.loop = false;
		video.playsInline = true;
		video.preload = 'auto';
		video.src = src;
		setLoad(0, 'loading');
	};

	video.addEventListener('loadstart', () => setLoad(0, 'loading'));
	video.addEventListener('progress', updateLoad);
	video.addEventListener('loadedmetadata', updateLoad);
	video.addEventListener('seeked', () => {
		seeking = false;
	});
	video.addEventListener('timeupdate', skipHold);
	video.addEventListener('ended', () => {
		setPlaying(false);
		revealing = false;
		panel.classList.remove('has-played');
		rewindToPoster();
	});
	video.addEventListener('canplay', updateLoad);
	video.addEventListener('canplaythrough', updateLoad);
	video.addEventListener('pause', () => {
		if (!seeking) setPlaying(false);
	});
	video.addEventListener('playing', () => setPlaying(true));
	playButton.addEventListener('click', (event) => {
		event.stopPropagation();
		togglePlay();
	});
	video.addEventListener('click', togglePlay);

	setPlaying(false);
	if (preload === 'auto') attach();

	return { play, pause, attach };
}

export function mountExpeditionSites(root: HTMLElement) {
	const buttons = [...root.querySelectorAll<HTMLButtonElement>('button.exp-site-btn[data-cut]')];
	const cuts = new Map<CutId, ReturnType<typeof mountCut>>();

	for (const panel of root.querySelectorAll<HTMLElement>('.exp-hero-panel[data-cut]')) {
		const id = panel.dataset.cut;
		if (id !== 'quick' && id !== 'full') continue;
		cuts.set(id, mountCut(panel));
	}

	const setCut = (id: CutId) => {
		root.dataset.activeCut = id;
		for (const button of buttons) {
			button.setAttribute('aria-pressed', String(button.dataset.cut === id));
		}
		for (const [cutId, player] of cuts) {
			if (cutId === id) player?.attach();
			else player?.pause();
		}
	};

	for (const button of buttons) {
		button.addEventListener('click', () => {
			const id = button.dataset.cut;
			if (id === 'quick' || id === 'full') setCut(id);
		});
	}

	const initial = root.dataset.activeCut === 'quick' ? 'quick' : 'full';
	setCut(initial);
}
