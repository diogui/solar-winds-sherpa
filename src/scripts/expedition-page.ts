type GalleryFilter = 'all' | 'padilla' | 'trigaza';

export function mountPodcastLang(root: HTMLElement) {
	const frame = root.querySelector<HTMLIFrameElement>('[data-podcast-frame]');
	const listen = root.querySelector<HTMLAnchorElement>('[data-podcast-listen]');
	const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-podcast-lang]')];
	if (!frame || !listen || !buttons.length) return;

	const setLang = (button: HTMLButtonElement) => {
		const episode = button.dataset.episode;
		const spotify = button.dataset.spotify;
		const title = button.dataset.iframeTitle;
		if (!episode || !spotify) return;
		frame.src = `https://open.spotify.com/embed/episode/${episode}?utm_source=generator&theme=0`;
		if (title) frame.title = title;
		listen.href = spotify;
		for (const item of buttons) {
			item.setAttribute('aria-pressed', String(item === button));
		}
	};

	for (const button of buttons) {
		button.addEventListener('click', () => setLang(button));
	}
}

export function mountBurgosGalleryFilter(root: HTMLElement) {
	const gallery = root.querySelector<HTMLElement>('[data-burgos-gallery]');
	const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-gallery-filter]')];
	if (!gallery || !buttons.length) return;

	const shots = [...gallery.querySelectorAll<HTMLElement>('.exp-burgos-shot')];
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
	let filter: GalleryFilter = 'all';
	let busy = false;

	const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

	const rectsOf = (els: HTMLElement[]) => {
		const map = new Map<HTMLElement, DOMRect>();
		for (const el of els) {
			if (!el.hidden) map.set(el, el.getBoundingClientRect());
		}
		return map;
	};

	const apply = async (next: GalleryFilter) => {
		if (busy || next === filter) return;
		busy = true;
		filter = next;

		for (const button of buttons) {
			button.setAttribute('aria-pressed', String(button.dataset.galleryFilter === next));
		}

		const keep = shots.filter((shot) => next === 'all' || shot.dataset.site === next);
		const drop = shots.filter((shot) => !keep.includes(shot));
		const first = rectsOf(keep);

		if (!reduced.matches) {
			const exiting = drop.filter((shot) => !shot.hidden);
			for (const shot of exiting) shot.classList.add('is-exiting');
			if (exiting.length) await wait(320);
		}

		for (const shot of drop) {
			shot.hidden = true;
			shot.classList.remove('is-exiting', 'is-entering');
		}

		const appearing = keep.filter((shot) => shot.hidden);
		for (const shot of appearing) {
			shot.hidden = false;
			if (!reduced.matches) shot.classList.add('is-entering');
		}

		// Force layout before FLIP / enter
		void gallery.offsetHeight;

		if (!reduced.matches) {
			for (const shot of keep) {
				const last = shot.getBoundingClientRect();
				const prev = first.get(shot);
				if (prev) {
					const dx = prev.left - last.left;
					const dy = prev.top - last.top;
					if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
						shot.animate(
							[{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
							{ duration: 480, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
						);
					}
				} else if (shot.classList.contains('is-entering')) {
					shot.animate(
						[
							{ opacity: 0, transform: 'scale(0.9)' },
							{ opacity: 1, transform: 'scale(1)' },
						],
						{ duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
					);
				}
			}
			await wait(40);
		}

		for (const shot of keep) shot.classList.remove('is-entering');
		busy = false;
	};

	for (const button of buttons) {
		button.addEventListener('click', () => {
			const id = button.dataset.galleryFilter;
			if (id === 'all' || id === 'padilla' || id === 'trigaza') void apply(id);
		});
	}
}

function chooseSrc(panel: HTMLElement, preferFull = false) {
	const full = panel.dataset.expSrc;
	const light = panel.dataset.expSrcLight;
	if (!full) return '';
	// Mobile / narrow screens: prefer the lighter encode for faster start
	if (!preferFull && light && window.innerWidth < 768) return light;
	return full;
}

function isNarrowViewport() {
	return window.innerWidth < 768;
}

function flipHero(hero: HTMLElement, first: DOMRect, duration: number) {
	const last = hero.getBoundingClientRect();
	const dx = first.left - last.left;
	const dy = first.top - last.top;
	const sx = first.width / Math.max(last.width, 1);
	const sy = first.height / Math.max(last.height, 1);
	if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) {
		return Promise.resolve();
	}
	const anim = hero.animate(
		[
			{ transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
			{ transform: 'translate(0, 0) scale(1)' },
		],
		{
			duration,
			easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
			fill: 'none',
		},
	);
	return anim.finished.catch(() => undefined);
}

function isPortraitMobile() {
	if (window.matchMedia('(max-width: 900px) and (orientation: portrait)').matches) return true;
	// Fallback: some mobile browsers mis-report orientation media queries
	return window.innerWidth <= 900 && window.innerHeight >= window.innerWidth;
}

function isLandscapeMobile() {
	if (window.matchMedia('(max-width: 900px) and (orientation: landscape)').matches) return true;
	return window.innerWidth <= 900 && window.innerWidth > window.innerHeight;
}

/** Phones / small tablets: keep the film in its page frame (no FLIP expand). */
function shouldPlayFilmInline() {
	if (window.matchMedia('(max-width: 900px)').matches) return true;
	if (
		window.matchMedia('(hover: none) and (pointer: coarse)').matches &&
		window.innerWidth < 1024
	) {
		return true;
	}
	return window.innerWidth <= 900;
}

type NativeFsVideo = HTMLVideoElement & {
	webkitEnterFullscreen?: () => void;
	webkitExitFullscreen?: () => void;
	webkitDisplayingFullscreen?: boolean;
};

function isNativeFullscreen(video: HTMLVideoElement) {
	const v = video as NativeFsVideo;
	if (v.webkitDisplayingFullscreen) return true;
	return document.fullscreenElement === video;
}

async function enterNativeFullscreen(video: HTMLVideoElement) {
	if (!isLandscapeMobile() || isNativeFullscreen(video)) return;
	const v = video as NativeFsVideo;
	try {
		// iOS Safari: only the video element's native player covers browser chrome
		if (typeof v.webkitEnterFullscreen === 'function') {
			v.webkitEnterFullscreen();
			return;
		}
		if (typeof video.requestFullscreen === 'function') {
			await video.requestFullscreen();
		}
	} catch {
		// Gesture / policy may reject — CSS immersive remains the fallback
	}
}

async function exitNativeFullscreen(video: HTMLVideoElement) {
	if (!isNativeFullscreen(video)) return;
	const v = video as NativeFsVideo;
	try {
		if (v.webkitDisplayingFullscreen && typeof v.webkitExitFullscreen === 'function') {
			v.webkitExitFullscreen();
			return;
		}
		if (document.fullscreenElement === video && typeof document.exitFullscreen === 'function') {
			await document.exitFullscreen();
		}
	} catch {
		// ignore
	}
}

function syncRotateHint(open: HTMLElement) {
	const hint = open.querySelector<HTMLElement>('[data-exp-rotate-hint]');
	if (!hint) return;
	const inlineOrImmersive =
		open.classList.contains('is-inline-playing') || open.classList.contains('is-immersive');
	const show = inlineOrImmersive && isPortraitMobile();
	hint.hidden = !show;
}

function setInlinePlaying(open: HTMLElement | null, on: boolean) {
	if (!open) return;
	open.classList.toggle('is-inline-playing', on);
	open.classList.toggle('is-controls-visible', on);
	syncRotateHint(open);
}

async function setOpenImmersive(open: HTMLElement, on: boolean) {
	const hero = open.querySelector<HTMLElement>('.exp-hero');
	const intro =
		open.querySelector<HTMLElement>('.exp-open-copy') ??
		open.querySelector<HTMLElement>('.exp-film-copy');
	if (!hero) return;

	const was = open.classList.contains('is-immersive');
	if (was === on) return;

	// Hard stop: never grow to fullscreen chrome on phones / small tablets
	if (on && shouldPlayFilmInline()) {
		setInlinePlaying(open, true);
		return;
	}

	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (on) {
		open.scrollIntoView({ block: 'start', behavior: 'auto' });
		const first = hero.getBoundingClientRect();
		open.classList.add('is-immersive', 'is-controls-visible');
		document.documentElement.classList.add('is-exp-immersive');
		intro?.setAttribute('aria-hidden', 'true');
		if (!reduced) {
			void hero.offsetWidth;
			await flipHero(hero, first, 1450);
		}
		syncRotateHint(open);
		return;
	}

	const first = hero.getBoundingClientRect();
	open.classList.remove('is-immersive', 'is-controls-visible');
	document.documentElement.classList.remove('is-exp-immersive');
	intro?.setAttribute('aria-hidden', 'false');
	syncRotateHint(open);
	if (!reduced) {
		void hero.offsetWidth;
		await flipHero(hero, first, 1000);
	}
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
		const src = chooseSrc(panel, !isNarrowViewport());
		if (!src) return;
		attached = false;
		video.removeAttribute('src');
		video.load();
		attach(!isNarrowViewport());
		void expandThenPlay();
	};

	const skipHold = () => {
		if (!playing || skipTail <= 0) return;
		if (video.currentTime >= loopEnd() - 0.05) {
			video.pause();
			void endPlayback(false);
			revealing = false;
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

	const setPlaybackUi = (next: boolean) => {
		playing = next;
		panel.classList.toggle('is-playing', next);
		if (next) waitForStartFrame();
		const label = next ? 'Pause' : 'Play';
		if (playLabel) playLabel.textContent = label;
		playButton.setAttribute('aria-label', next ? 'Pause video' : 'Play video');
		playButton.setAttribute('aria-pressed', String(next));
		playButton.setAttribute('aria-hidden', String(next));
		playButton.tabIndex = next ? -1 : 0;
	};

	const seekTo = (time: number, timeoutMs = 1500) =>
		new Promise<void>((resolve) => {
			if (!Number.isFinite(time) || Math.abs(video.currentTime - time) < 0.04) {
				resolve();
				return;
			}
			seeking = true;
			let settled = false;
			const done = () => {
				if (settled) return;
				settled = true;
				seeking = false;
				window.clearTimeout(timer);
				video.removeEventListener('seeked', done);
				resolve();
			};
			const timer = window.setTimeout(done, timeoutMs);
			video.addEventListener('seeked', done);
			try {
				video.currentTime = time;
			} catch {
				done();
			}
		});

	const endPlayback = async (keepFrame = false) => {
		setPlaybackUi(false);
		await exitNativeFullscreen(video);
		const atFrame =
			keepFrame && !video.ended && video.currentTime > Math.max(skipStart, 0.05);
		panel.classList.toggle('has-played', atFrame);
		const open = panel.closest<HTMLElement>('.exp-open');
		setInlinePlaying(open, false);
		if (open) await setOpenImmersive(open, false);
	};

	const expandThenPlay = async () => {
		const open = panel.closest<HTMLElement>('.exp-open');
		const narrow = isNarrowViewport();
		const inline = shouldPlayFilmInline();
		panel.classList.add('is-expanding');
		// On mobile use the light encode; full 1080p is too heavy to start playback reliably
		attach(!narrow);
		video.playsInline = true;
		video.setAttribute('playsinline', '');
		video.setAttribute('webkit-playsinline', '');

		// Start play before canplay/seek/expand — waiting loses the iOS/Android
		// user-gesture token, and seeking an under-buffered R2 file can hang forever.
		let started = false;
		try {
			await video.play();
			started = true;
			setPlaybackUi(true);
		} catch {
			// Fall back to muted start (still within/near the gesture), then unmute
			if (!muted) {
				video.muted = true;
				try {
					await video.play();
					started = true;
					setPlaybackUi(true);
					window.setTimeout(() => {
						if (playing) video.muted = false;
					}, 120);
				} catch {
					video.muted = muted;
				}
			}
		}

		// Native FS must stay in the gesture window when already landscape
		if (started) void enterNativeFullscreen(video);

		if (started && skipStart > 0 && (video.currentTime < skipStart - 0.05 || video.ended)) {
			await seekTo(skipStart, inline || narrow ? 1200 : 2500);
			if (playing) panel.classList.add('has-played');
		}

		// Mobile / touch: never FLIP-expand — stay in the page frame (+ rotate hint).
		// Desktop only gets the immersive grow.
		if (started && inline) {
			if (!isLandscapeMobile()) setInlinePlaying(open, true);
		} else if (started && open) {
			await setOpenImmersive(open, true);
		}

		panel.classList.remove('is-expanding');

		if (!started) {
			await endPlayback(video.currentTime > Math.max(skipStart, 0.05));
		} else if (playing) {
			void enterNativeFullscreen(video);
		}
	};

	const pause = () => {
		video.pause();
		return endPlayback(true);
	};

	const play = () => {
		if (video.ended) {
			restartFromStart();
			return;
		}
		void expandThenPlay();
	};

	const togglePlay = () => {
		if (playing) pause();
		else play();
	};

	const attach = (preferFull = false) => {
		const src = chooseSrc(panel, preferFull);
		if (!src) return;
		if (attached && video.getAttribute('src') === src) return;
		attached = true;
		video.muted = muted;
		video.defaultMuted = muted;
		video.loop = false;
		video.playsInline = true;
		video.setAttribute('playsinline', '');
		video.setAttribute('webkit-playsinline', '');
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
		revealing = false;
		void endPlayback(false);
		rewindToPoster();
	});
	video.addEventListener('canplay', updateLoad);
	video.addEventListener('canplaythrough', updateLoad);
	video.addEventListener('webkitendfullscreen', () => {
		// Leaving the native player — collapse back to the page chrome
		if (playing) void endPlayback(true);
	});
	document.addEventListener('fullscreenchange', () => {
		// System UI exited fullscreen for this video
		if (playing && !document.fullscreenElement && !isNativeFullscreen(video)) {
			void endPlayback(true);
		}
	});
	playButton.addEventListener('click', (event) => {
		event.stopPropagation();
		togglePlay();
	});
	video.addEventListener('click', togglePlay);

	setPlaybackUi(false);
	if (preload === 'auto') attach(!isNarrowViewport());

	const setMuted = (next: boolean) => {
		video.muted = next;
		video.defaultMuted = next;
	};

	const syncNativeFullscreen = () => {
		if (!playing) return;
		if (isLandscapeMobile()) void enterNativeFullscreen(video);
		else void exitNativeFullscreen(video);
	};

	return {
		play,
		pause,
		attach: () => attach(!isNarrowViewport()),
		setMuted,
		isMuted: () => video.muted,
		syncNativeFullscreen,
	};
}

export function mountExpeditionSites(root: HTMLElement) {
	const open = root.closest<HTMLElement>('.exp-open');
	const closeBtn = root.querySelector<HTMLButtonElement>('[data-exp-close]');
	const muteBtn = root.querySelector<HTMLButtonElement>('[data-exp-mute]');
	const panel = root.querySelector<HTMLElement>('.exp-hero-panel');
	const player = panel ? mountCut(panel) : null;

	const syncMuteUi = () => {
		const muted = player?.isMuted() ?? false;
		if (!muteBtn) return;
		muteBtn.setAttribute('aria-pressed', String(muted));
		muteBtn.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
	};

	const pauseActive = () => player?.pause() ?? Promise.resolve();

	closeBtn?.addEventListener('click', (event) => {
		event.preventDefault();
		event.stopPropagation();
		void pauseActive();
	});

	muteBtn?.addEventListener('click', (event) => {
		event.preventDefault();
		event.stopPropagation();
		if (!player) return;
		player.setMuted(!player.isMuted());
		syncMuteUi();
	});

	player?.attach();
	syncMuteUi();

	if (open) {
		let hideTimer = 0;
		let exitingScroll = false;
		let touchStartY = 0;

		const syncLandscapeFullscreen = () => {
			syncRotateHint(open);
			player?.syncNativeFullscreen();
		};

		window.matchMedia('(max-width: 767px) and (orientation: portrait)').addEventListener('change', () => {
			syncLandscapeFullscreen();
		});
		window.matchMedia('(max-width: 900px) and (orientation: landscape)').addEventListener('change', () => {
			syncLandscapeFullscreen();
		});
		window.addEventListener('orientationchange', () => {
			window.setTimeout(syncLandscapeFullscreen, 120);
		});

		const revealControls = () => {
			if (!open.classList.contains('is-immersive')) return;
			open.classList.add('is-controls-visible');
			window.clearTimeout(hideTimer);
			hideTimer = window.setTimeout(() => {
				open.classList.remove('is-controls-visible');
			}, 2200);
		};

		const exitImmersiveAndScroll = (deltaY: number) => {
			if (!open.classList.contains('is-immersive') || exitingScroll) return;
			exitingScroll = true;
			void pauseActive().finally(() => {
				exitingScroll = false;
			});
			// Class removal is sync; scroll as soon as the page can move again
			window.scrollBy({ top: Math.max(deltaY, 96), behavior: 'auto' });
		};

		root.addEventListener('mousemove', revealControls);
		root.addEventListener('pointerdown', revealControls);

		document.addEventListener(
			'wheel',
			(event) => {
				if (!open.classList.contains('is-immersive')) return;
				if (event.deltaY <= 0) return;
				event.preventDefault();
				exitImmersiveAndScroll(event.deltaY);
			},
			{ passive: false },
		);

		document.addEventListener(
			'touchstart',
			(event) => {
				if (!open.classList.contains('is-immersive')) return;
				touchStartY = event.touches[0]?.clientY ?? 0;
			},
			{ passive: true },
		);

		document.addEventListener(
			'touchmove',
			(event) => {
				if (!open.classList.contains('is-immersive')) return;
				const y = event.touches[0]?.clientY ?? touchStartY;
				const delta = touchStartY - y;
				if (delta < 28) return;
				event.preventDefault();
				exitImmersiveAndScroll(delta);
			},
			{ passive: false },
		);

		document.addEventListener('keydown', (event) => {
			if (!open.classList.contains('is-immersive')) return;
			if (event.key === 'Escape') {
				event.preventDefault();
				void pauseActive();
				return;
			}
			if (event.key === 'ArrowDown' || event.key === 'PageDown') {
				event.preventDefault();
				exitImmersiveAndScroll(event.key === 'PageDown' ? 420 : 140);
			}
		});
	}
}

export function mountOnPageNav(nav: HTMLElement) {
	const heroSelector =
		nav.dataset.tocHero?.trim() || '.home-hero, .exp-screen, .about-screen, [data-header-hero]';
	const hero = document.querySelector<HTMLElement>(heroSelector);
	const links = [...nav.querySelectorAll<HTMLAnchorElement>('[data-onpage-toc-link]')];
	if (!hero || !links.length) return;

	const sections = links
		.map((link) => {
			const id = link.dataset.onpageTocLink;
			const el = id ? document.getElementById(id) : null;
			return id && el ? { id, el, link } : null;
		})
		.filter((item): item is { id: string; el: HTMLElement; link: HTMLAnchorElement } => Boolean(item));

	if (!sections.length) return;

	const mq = window.matchMedia('(min-width: 1680px)');
	let visible = false;
	let activeId = '';

	const setVisible = (next: boolean) => {
		if (visible === next) return;
		visible = next;
		nav.setAttribute('aria-hidden', String(!next));
		if (next) {
			nav.hidden = false;
			window.requestAnimationFrame(() => {
				nav.classList.add('is-visible');
			});
			return;
		}
		nav.classList.remove('is-visible');
		window.setTimeout(() => {
			if (!visible) nav.hidden = true;
		}, 420);
	};

	const setActive = (id: string) => {
		if (activeId === id) return;
		activeId = id;
		for (const section of sections) {
			const on = section.id === id;
			section.link.classList.toggle('is-active', on);
			if (on) section.link.setAttribute('aria-current', 'location');
			else section.link.removeAttribute('aria-current');
		}
	};

	const update = () => {
		if (!mq.matches || document.documentElement.classList.contains('is-exp-immersive')) {
			setVisible(false);
			return;
		}

		const headerH =
			Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 88;
		const heroBottom = hero.getBoundingClientRect().bottom;
		const pastHero = heroBottom <= headerH + 8;
		setVisible(pastHero);
		if (!pastHero) return;

		const mark = headerH + Math.min(160, window.innerHeight * 0.28);
		let current = sections[0];
		for (const section of sections) {
			if (section.el.getBoundingClientRect().top <= mark) current = section;
		}
		setActive(current.id);
	};

	let ticking = false;
	const onScroll = () => {
		if (ticking) return;
		ticking = true;
		window.requestAnimationFrame(() => {
			update();
			ticking = false;
		});
	};

	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll, { passive: true });
	mq.addEventListener('change', onScroll);

	const immersiveObserver = new MutationObserver(onScroll);
	immersiveObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['class'],
	});

	for (const section of sections) {
		section.link.addEventListener('click', () => {
			setActive(section.id);
		});
	}

	update();
}

/** @deprecated Use mountOnPageNav */
export const mountExpeditionSectionNav = mountOnPageNav;
