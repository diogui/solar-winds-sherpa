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

initMobileNav();
initCarousel();
initReveals();
initContactForm();
initInnerHeader();
