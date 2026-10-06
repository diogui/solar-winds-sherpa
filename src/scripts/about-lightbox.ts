type Slide = {
	src: string;
	alt: string;
	caption: string;
};

function largestSrc(img: HTMLImageElement): string {
	const srcset = img.getAttribute('srcset');
	if (!srcset) return img.currentSrc || img.src;

	let best = '';
	let bestWidth = 0;
	for (const part of srcset.split(',')) {
		const [url, descriptor] = part.trim().split(/\s+/);
		const width = descriptor?.endsWith('w') ? Number.parseInt(descriptor, 10) : 0;
		if (url && width >= bestWidth) {
			best = url;
			bestWidth = width;
		}
	}
	return best || img.currentSrc || img.src;
}

function slidesFromGallery(gallery: HTMLElement): Slide[] {
	return [...gallery.querySelectorAll<HTMLElement>('[data-lightbox-trigger]')].map((trigger) => {
		const frame = trigger.closest('figure') ?? trigger;
		const img = trigger.querySelector<HTMLImageElement>('img');
		const cap =
			frame.querySelector('[data-lightbox-caption-text]') ??
			frame.querySelector('.about-story-caption, .about-people-caption');
		return {
			src: img ? largestSrc(img) : '',
			alt: img?.alt ?? '',
			caption: cap?.textContent?.trim() ?? '',
		};
	});
}

export function mountAboutLightbox() {
	const dialog = document.querySelector<HTMLDialogElement>('[data-about-lightbox]');
	if (!dialog) return;

	const image = dialog.querySelector<HTMLImageElement>('[data-lightbox-image]');
	const caption = dialog.querySelector<HTMLElement>('[data-lightbox-caption]');
	const counter = dialog.querySelector<HTMLElement>('[data-lightbox-counter]');
	const closeBtn = dialog.querySelector<HTMLButtonElement>('[data-lightbox-close]');
	const prevBtn = dialog.querySelector<HTMLButtonElement>('[data-lightbox-prev]');
	const nextBtn = dialog.querySelector<HTMLButtonElement>('[data-lightbox-next]');
	const stage = dialog.querySelector<HTMLElement>('[data-lightbox-stage]');
	if (!image || !caption || !counter || !closeBtn || !prevBtn || !nextBtn || !stage) return;

	const galleries = [...document.querySelectorAll<HTMLElement>('[data-lightbox-gallery]')];
	if (!galleries.length) return;

	let slides: Slide[] = [];
	let index = 0;
	let lastFocus: HTMLElement | null = null;
	let lockedScrollY = 0;

	const render = () => {
		const slide = slides[index];
		if (!slide) return;
		image.src = slide.src;
		image.alt = slide.alt;
		caption.textContent = slide.caption;
		caption.hidden = !slide.caption;
		counter.textContent = `${index + 1} / ${slides.length}`;
		prevBtn.disabled = slides.length < 2;
		nextBtn.disabled = slides.length < 2;
	};

	const jumpTo = (y: number) => {
		const root = document.documentElement;
		const previous = root.style.scrollBehavior;
		root.style.scrollBehavior = 'auto';
		window.scrollTo(0, y);
		root.style.scrollBehavior = previous;
	};

	const lockScroll = () => {
		lockedScrollY = window.scrollY;
		document.documentElement.classList.add('has-lightbox-open');
		document.body.style.top = `-${lockedScrollY}px`;
	};

	const unlockScroll = () => {
		document.documentElement.classList.remove('has-lightbox-open');
		document.body.style.removeProperty('top');
		jumpTo(lockedScrollY);
	};

	const close = () => {
		if (!dialog.open) return;
		const returnTo = lastFocus;
		dialog.close();
		unlockScroll();
		// Defer focus so it cannot fight the scroll restore / smooth-scroll styles.
		window.requestAnimationFrame(() => {
			returnTo?.focus({ preventScroll: true });
		});
	};

	const step = (delta: number) => {
		if (slides.length < 2) return;
		index = (index + delta + slides.length) % slides.length;
		render();
	};

	const open = (gallery: HTMLElement, start: number, label: string) => {
		slides = slidesFromGallery(gallery);
		if (!slides.length) return;
		index = start;
		lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		dialog.setAttribute('aria-label', label);
		render();
		lockScroll();
		if (!dialog.open) dialog.showModal();
		closeBtn.focus({ preventScroll: true });
	};

	galleries.forEach((gallery) => {
		const label = gallery.getAttribute('aria-label') || 'Photo gallery';
		gallery.querySelectorAll<HTMLElement>('[data-lightbox-trigger]').forEach((trigger, i) => {
			trigger.addEventListener('click', (event) => {
				event.preventDefault();
				open(gallery, i, label);
			});
		});
	});

	closeBtn.addEventListener('click', () => close());
	prevBtn.addEventListener('click', () => step(-1));
	nextBtn.addEventListener('click', () => step(1));

	dialog.addEventListener('click', (event) => {
		if (event.target === dialog) close();
	});

	stage.addEventListener('click', (event) => {
		event.stopPropagation();
	});

	dialog.addEventListener('cancel', (event) => {
		event.preventDefault();
		close();
	});

	dialog.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			step(-1);
		}
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			step(1);
		}
	});
}
