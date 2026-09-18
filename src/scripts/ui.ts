function initMobileNav() {
	const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
	const panel = document.querySelector<HTMLElement>('[data-mobile-nav]');
	if (!toggle || !panel) return;

	const setOpen = (open: boolean) => {
		toggle.setAttribute('aria-expanded', String(open));
		toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
		panel.classList.toggle('is-open', open);
		panel.setAttribute('aria-hidden', String(!open));
		document.documentElement.classList.toggle('has-eclipse-lock', open);
	};

	toggle.addEventListener('click', () => {
		setOpen(toggle.getAttribute('aria-expanded') !== 'true');
	});

	panel.querySelectorAll('a').forEach((link) => {
		link.addEventListener('click', () => setOpen(false));
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') setOpen(false);
	});
}

function initCarousel() {
	const root = document.querySelector<HTMLElement>('[data-carousel]');
	if (!root) return;

	const track = root.querySelector<HTMLElement>('[data-carousel-track]');
	const prev = root.querySelector<HTMLButtonElement>('[data-carousel-prev]');
	const next = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
	if (!track || !prev || !next) return;

	const distance = () => Math.min(track.clientWidth * 0.82, 380);

	prev.addEventListener('click', () => {
		track.scrollBy({ left: -distance(), behavior: 'smooth' });
	});
	next.addEventListener('click', () => {
		track.scrollBy({ left: distance(), behavior: 'smooth' });
	});

	track.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			track.scrollBy({ left: -distance(), behavior: 'smooth' });
		}
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			track.scrollBy({ left: distance(), behavior: 'smooth' });
		}
	});
}

function initReveals() {
	const nodes = document.querySelectorAll('.reveal');
	if (!nodes.length) return;

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		nodes.forEach((node) => node.classList.add('is-visible'));
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					observer.unobserve(entry.target);
				}
			}
		},
		{ threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
	);

	nodes.forEach((node) => observer.observe(node));
}

function initContactForm() {
	const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
	if (!form) return;

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		const status = form.querySelector<HTMLElement>('[data-form-status]');
		form.querySelectorAll('input, textarea, button').forEach((el) => {
			(el as HTMLInputElement).disabled = true;
		});
		if (status) {
			status.hidden = false;
			status.textContent = 'Thank you. This draft form is not yet connected — we will be in touch.';
		}
	});
}

function initInnerHeader() {
	const header = document.querySelector<HTMLElement>('[data-header]');
	if (!header || header.dataset.variant === 'home') return;
	header.style.setProperty('--header-progress', '1');
}

function initHomeHeader() {
	const header = document.querySelector<HTMLElement>('[data-header]');
	if (!header || header.dataset.variant !== 'home') return;
	const hero = document.querySelector<HTMLElement>('.home-hero');

	const update = () => {
		const range = Math.max(180, (hero?.offsetHeight ?? 640) * 0.22);
		const progress = Math.min(1, window.scrollY / range);
		header.style.setProperty('--header-progress', String(progress));
		header.classList.toggle('is-scrolled', window.scrollY > 20);
	};

	update();
	window.addEventListener('scroll', update, { passive: true });
}

function parseObjectPosition(value: string) {
	const parts = value.trim().split(/\s+/);
	const toFrac = (token: string | undefined, fallback: number) => {
		if (!token) return fallback;
		if (token.endsWith('%')) return Number.parseFloat(token) / 100;
		if (token === 'left' || token === 'top') return 0;
		if (token === 'right' || token === 'bottom') return 1;
		if (token === 'center') return 0.5;
		return fallback;
	};
	return { x: toFrac(parts[0], 0.5), y: toFrac(parts[1] ?? parts[0], 0.5) };
}

function placeHeroEclipseMark(video: HTMLVideoElement, mark: HTMLElement) {
	const vw = video.videoWidth || 1920;
	const vh = video.videoHeight || 1080;
	const box = video.getBoundingClientRect();
	const host = video.offsetParent as HTMLElement | null;
	const hostBox = host?.getBoundingClientRect() ?? box;
	const { x: posX, y: posY } = parseObjectPosition(getComputedStyle(video).objectPosition);
	const scale = Math.max(box.width / vw, box.height / vh);
	const extraX = vw * scale - box.width;
	const extraY = vh * scale - box.height;
	const sunX = 0.5729 * vw * scale - extraX * posX;
	const sunY = 0.162 * vh * scale - extraY * posY;
	const diameter = Math.max(52, 0.048 * vw * scale);
	mark.style.setProperty('--sun-x', `${box.left - hostBox.left + sunX}px`);
	mark.style.setProperty('--sun-y', `${box.top - hostBox.top + sunY}px`);
	mark.style.setProperty('--sun-d', `${diameter}px`);
}

function initHeroVideo() {
	const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
	const pause = document.querySelector<HTMLButtonElement>('[data-hero-pause]');
	const mark = document.querySelector<HTMLElement>('[data-hero-mark]');
	if (!video || !pause) return;

	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduced) {
		video.pause();
		pause.hidden = true;
		return;
	}

	const holdMs = 30000;
	const captionLines = [
		'Total Solar Eclipse',
		'Location: Burgos, Spain',
		'Duration: 1 min 40 seconds',
	];
	let holdTimer: number | undefined;
	let typeTimer: number | undefined;
	let userPaused = false;

	const setPlayingUi = (playing: boolean) => {
		pause.textContent = playing ? 'Pause video' : 'Play video';
		pause.setAttribute('aria-pressed', String(!playing));
	};

	const stopTyping = () => {
		if (typeTimer !== undefined) {
			window.clearTimeout(typeTimer);
			typeTimer = undefined;
		}
		mark?.querySelectorAll('[data-hero-line]').forEach((line) => {
			line.classList.remove('is-typing');
		});
	};

	const clearHold = () => {
		if (holdTimer !== undefined) {
			window.clearTimeout(holdTimer);
			holdTimer = undefined;
		}
		stopTyping();
	};

	const typeCaption = () => {
		if (!mark) return;
		const lines = [...mark.querySelectorAll<HTMLElement>('[data-hero-line]')];
		lines.forEach((line) => {
			line.textContent = '';
			line.classList.remove('is-typing');
		});

		let index = 0;
		let count = 0;

		const step = () => {
			if (index >= captionLines.length) {
				typeTimer = undefined;
				return;
			}
			const target = captionLines[index];
			const node = lines[index];
			if (!node) return;
			node.classList.add('is-typing');
			count += 1;
			node.textContent = target.slice(0, count);
			if (count >= target.length) {
				node.classList.remove('is-typing');
				index += 1;
				count = 0;
				typeTimer = window.setTimeout(step, 320);
			} else {
				typeTimer = window.setTimeout(step, 36);
			}
		};

		typeTimer = window.setTimeout(step, 700);
	};

	const showMark = () => {
		if (!mark) return;
		placeHeroEclipseMark(video, mark);
		mark.classList.remove('is-on');
		void mark.offsetWidth;
		mark.classList.add('is-on');
		typeCaption();
	};

	const hideMark = () => {
		stopTyping();
		mark?.querySelectorAll('[data-hero-line]').forEach((line) => {
			line.textContent = '';
		});
		mark?.classList.remove('is-on');
	};

	const restart = () => {
		clearHold();
		hideMark();
		video.playbackRate = 1;
		video.currentTime = 0;
		void video.play();
		setPlayingUi(true);
	};

	video.loop = false;
	video.playbackRate = 1;

	video.addEventListener('ended', () => {
		setPlayingUi(false);
		if (userPaused) return;
		// Last frame of the current hero is the instrument ridge, not the eclipsed disk.
		hideMark();
		holdTimer = window.setTimeout(() => {
			holdTimer = undefined;
			if (!userPaused) restart();
		}, holdMs);
	});

	pause.addEventListener('click', () => {
		if (video.paused) {
			userPaused = false;
			if (video.ended || video.currentTime >= video.duration - 0.05) {
				restart();
			} else {
				clearHold();
				hideMark();
				void video.play();
				setPlayingUi(true);
			}
		} else {
			userPaused = true;
			clearHold();
			hideMark();
			video.pause();
			setPlayingUi(false);
		}
	});

	window.addEventListener(
		'resize',
		() => {
			if (mark?.classList.contains('is-on')) placeHeroEclipseMark(video, mark);
		},
		{ passive: true },
	);
}

function initWhyEclipses() {
	const section = document.querySelector<HTMLElement>('[data-why-section]');
	const figure = document.querySelector<HTMLElement>('[data-why-figure]');
	const caption = document.querySelector<HTMLElement>('[data-why-caption]');
	const hint = document.querySelector<HTMLElement>('[data-why-hint]');
	const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-why-step]')];
	if (!section || !figure || !buttons.length) return;

	const labels = buttons.map(
		(button) => button.querySelector('.home-why-step-title')?.textContent ?? '',
	);
	const hintCopy = [
		'Scroll to reveal the corona',
		'Scroll to see prominences',
		'Keep scrolling',
	];
	const last = buttons.length - 1;
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	let index = 0;
	let ticking = false;
	let captionTimer: number | undefined;

	section.style.setProperty('--why-progress', '0');

	const headerOffset = () => {
		const header = document.querySelector<HTMLElement>('[data-header]');
		return header?.offsetHeight ?? 72;
	};

	const setCaption = (label: string) => {
		if (!caption || caption.textContent === label) return;
		if (reduced) {
			caption.textContent = label;
			return;
		}
		if (captionTimer !== undefined) window.clearTimeout(captionTimer);
		caption.classList.remove('is-in');
		caption.classList.add('is-out');
		captionTimer = window.setTimeout(() => {
			caption.textContent = label;
			caption.classList.remove('is-out');
			caption.classList.add('is-in');
			captionTimer = undefined;
		}, 220);
	};

	const setStage = (next: number) => {
		index = Math.max(0, Math.min(last, next));
		figure.dataset.stage = String(index);
		section.dataset.stage = String(index);
		setCaption(labels[index] ?? '');
		buttons.forEach((button, i) => {
			const active = i === index;
			button.classList.toggle('is-active', active);
			button.classList.toggle('is-past', i < index);
			button.classList.toggle('is-locked', !reduced && i > index);
			button.setAttribute('aria-pressed', String(active));
		});
		if (hint) {
			const done = reduced || index >= last;
			hint.hidden = done;
			if (!done) {
				hint.innerHTML = `${hintCopy[index] ?? 'Scroll to reveal'} <span aria-hidden="true">↓</span>`;
			}
		}
	};

	const trackStart = () => section.getBoundingClientRect().top + window.scrollY - headerOffset();
	const trackRange = () => Math.max(1, section.offsetHeight - window.innerHeight);

	const progressFromScroll = () =>
		Math.min(1, Math.max(0, (window.scrollY - trackStart()) / trackRange()));

	const stageFromProgress = (progress: number) => {
		if (progress >= 0.999) return last;
		return Math.min(last, Math.floor(progress * (last + 1)));
	};

	const syncFromScroll = () => {
		const progress = progressFromScroll();
		section.style.setProperty('--why-progress', progress.toFixed(4));
		const next = stageFromProgress(progress);
		if (next !== index) setStage(next);
	};

	buttons.forEach((button) => {
		button.addEventListener('click', () => {
			const next = Number(button.dataset.whyStep);
			const stage = Number.isFinite(next) ? next : 0;
			setStage(stage);
			if (reduced) return;
			const progress = (stage + 0.4) / (last + 1);
			window.scrollTo({ top: trackStart() + progress * trackRange(), behavior: 'auto' });
		});
	});

	setStage(0);
	if (reduced) {
		section.style.setProperty('--why-progress', '1');
		return;
	}

	window.addEventListener(
		'scroll',
		() => {
			if (ticking) return;
			ticking = true;
			window.requestAnimationFrame(() => {
				syncFromScroll();
				ticking = false;
			});
		},
		{ passive: true },
	);

	syncFromScroll();
}

initMobileNav();
initCarousel();
initReveals();
initContactForm();
initInnerHeader();
initHomeHeader();
initHeroVideo();
initWhyEclipses();
