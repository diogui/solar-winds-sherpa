import { mountHero } from './hero-video';

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

function initNewsletterForm() {
	const form = document.querySelector<HTMLFormElement>('[data-newsletter-form]');
	if (!form) return;

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		const email = new FormData(form).get('email');
		const to = form.dataset.mailto;
		if (typeof email !== 'string' || !email.trim() || !to) return;
		const subject = encodeURIComponent('Newsletter subscribe');
		const body = encodeURIComponent(`Please add this address to the newsletter:\n\n${email.trim()}`);
		window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
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

function initHeroVideo() {
	const hero = document.querySelector<HTMLElement>('.home-hero[data-hero]');
	if (!hero?.querySelector('[data-hero-video]')) return;
	mountHero(hero);
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
initNewsletterForm();
initInnerHeader();
initHomeHeader();
initHeroVideo();
initWhyEclipses();
