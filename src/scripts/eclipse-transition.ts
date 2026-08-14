import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion() {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function measure(
	origin: HTMLElement,
	target: HTMLElement,
	eclipse: HTMLElement,
) {
	const originRect = origin.getBoundingClientRect();
	const targetRect = target.getBoundingClientRect();
	const heroSize = eclipse.offsetWidth || 1;
	const logoSize = targetRect.width || 52;

	return {
		startX: originRect.left + originRect.width / 2,
		startY: originRect.top + originRect.height / 2 + window.scrollY,
		endX: targetRect.left + targetRect.width / 2,
		endY: targetRect.top + targetRect.height / 2,
		endScale: logoSize / heroSize,
	};
}

function initEclipseTransition() {
	const eclipse = document.querySelector<HTMLElement>('[data-eclipse]');
	const origin = document.querySelector<HTMLElement>('[data-eclipse-origin]');
	const target = document.querySelector<HTMLElement>('[data-eclipse-target]');
	const header = document.querySelector<HTMLElement>('[data-header]');
	const hero = document.querySelector<HTMLElement>('[data-hero]');
	const copy = document.querySelector<HTMLElement>('[data-hero-copy]');
	const hint = document.querySelector<HTMLElement>('.scroll-hint');

	if (!eclipse || !origin || !target || !header || !hero) return;

	if (prefersReducedMotion()) {
		header.classList.add('is-reduced');
		const onScroll = () => {
			const p = Math.min(1, window.scrollY / Math.max(hero.offsetHeight * 0.6, 1));
			header.style.setProperty('--header-progress', String(p));
			eclipse.style.opacity = String(1 - p);
			const photo = eclipse.querySelector<HTMLElement>('[data-eclipse-photo]');
			const mark = eclipse.querySelector<HTMLElement>('[data-eclipse-mark]');
			if (photo) photo.style.opacity = String(1 - p);
			if (mark) mark.style.opacity = '0';
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return;
	}

	const place = (progress: number) => {
		const m = measure(origin, target, eclipse);
		gsap.set(eclipse, {
			x: m.startX + (m.endX - m.startX) * progress,
			y: m.startY + (m.endY - m.startY) * progress,
			scale: 1 + (m.endScale - 1) * progress,
			xPercent: -50,
			yPercent: -50,
			transformOrigin: '50% 50%',
			force3D: true,
		});
		header.style.setProperty('--header-progress', String(progress));

		const morph = Math.min(1, Math.max(0, (progress - 0.46) / 0.4));
		const photo = eclipse.querySelector<HTMLElement>('[data-eclipse-photo]');
		const mark = eclipse.querySelector<HTMLElement>('[data-eclipse-mark]');
		if (photo) gsap.set(photo, { opacity: 1 - morph });
		if (mark) gsap.set(mark, { opacity: morph });

		if (copy) {
			const fade = Math.min(1, progress / 0.42);
			gsap.set(copy, { opacity: 1 - fade, y: -24 * fade });
		}
		if (hint) gsap.set(hint, { opacity: 1 - Math.min(1, progress / 0.25) });
	};

	eclipse.classList.add('is-fixed');
	gsap.set(eclipse, { transformOrigin: '50% 50%' });
	place(0);

	ScrollTrigger.create({
		trigger: hero,
		start: 'top top',
		end: 'bottom top',
		scrub: 0.5,
		invalidateOnRefresh: true,
		onUpdate: (self) => place(self.progress),
		onRefresh: (self) => place(self.progress),
	});

	const img = eclipse.querySelector('img');
	if (img && !img.complete) {
		img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
	}

	window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

initEclipseTransition();
