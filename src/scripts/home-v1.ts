/** Frozen Home v1 scripts. Live Home uses ui.ts — keep these copies independent. */
import { mountHero } from './hero-video-v1';

function initHomeHeader() {
	const header = document.querySelector<HTMLElement>('[data-header]');
	if (!header || header.dataset.variant !== 'home') return;
	const hero = document.querySelector<HTMLElement>('.home-hero');
	let ticking = false;

	const update = () => {
		const range = Math.max(180, (hero?.offsetHeight ?? 640) * 0.22);
		const progress = Math.min(1, window.scrollY / range);
		header.style.setProperty('--header-progress', String(progress));
		header.classList.toggle('is-scrolled', window.scrollY > 20);
	};

	update();
	window.addEventListener(
		'scroll',
		() => {
			if (ticking) return;
			ticking = true;
			window.requestAnimationFrame(() => {
				update();
				ticking = false;
			});
		},
		{ passive: true },
	);
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

	let start = 0;
	let range = 1;
	const measure = () => {
		start = section.getBoundingClientRect().top + window.scrollY - headerOffset();
		range = Math.max(1, section.offsetHeight - window.innerHeight);
	};

	const progressFromScroll = () => Math.min(1, Math.max(0, (window.scrollY - start) / range));

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
			window.scrollTo({ top: start + progress * range, behavior: 'auto' });
		});
	});

	setStage(0);
	measure();
	if (reduced) {
		section.style.setProperty('--why-progress', '1');
		return;
	}

	window.addEventListener('resize', measure, { passive: true });
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

initHomeHeader();
initHeroVideo();
initWhyEclipses();
