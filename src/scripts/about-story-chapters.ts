/** Scroll-linked chapter stage for About Our Story highlights. */
export function mountAboutStoryChapters() {
	const root = document.querySelector<HTMLElement>('[data-story-chapters]');
	if (!root) return;

	const visuals = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter-visual]'));
	const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter-panel]'));
	const caption = root.querySelector<HTMLElement>('[data-chapter-caption]');
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (!visuals.length || !panels.length) return;

	let active = -1;

	const setActive = (index: number) => {
		if (index === active || index < 0 || index >= panels.length) return;
		active = index;

		visuals.forEach((el, i) => {
			el.classList.toggle('is-active', i === index);
			el.setAttribute('aria-hidden', String(i !== index));
		});
		panels.forEach((el, i) => {
			el.classList.toggle('is-active', i === index);
		});

		const panel = panels[index];
		if (caption && panel) {
			caption.textContent = panel.dataset.caption ?? '';
		}
	};

	const pickMostVisible = () => {
		const mid = window.innerHeight * 0.42;
		let best = 0;
		let bestDist = Number.POSITIVE_INFINITY;

		panels.forEach((panel, index) => {
			const rect = panel.getBoundingClientRect();
			const center = rect.top + rect.height / 2;
			const dist = Math.abs(center - mid);
			if (dist < bestDist) {
				bestDist = dist;
				best = index;
			}
		});

		setActive(best);
	};

	panels.forEach((panel, index) => {
		const yearBtn = panel.querySelector<HTMLButtonElement>('[data-chapter-jump]');
		yearBtn?.addEventListener('click', () => {
			panel.scrollIntoView({
				behavior: reducedMotion ? 'auto' : 'smooth',
				block: 'center',
			});
			setActive(index);
		});
	});

	const observer = new IntersectionObserver(
		() => {
			pickMostVisible();
		},
		{
			root: null,
			rootMargin: '-35% 0px -35% 0px',
			threshold: [0, 0.25, 0.5, 0.75, 1],
		},
	);

	panels.forEach((panel) => observer.observe(panel));

	let ticking = false;
	window.addEventListener(
		'scroll',
		() => {
			if (ticking) return;
			ticking = true;
			window.requestAnimationFrame(() => {
				pickMostVisible();
				ticking = false;
			});
		},
		{ passive: true },
	);

	setActive(0);
}
