import Globe from 'globe.gl';
import { defaultExpeditionId, expeditionSites, type ExpeditionSite } from '../data/expeditions-map';

function isSite(value: object): value is ExpeditionSite {
	return 'id' in value && 'place' in value;
}

function kickerFor(site: ExpeditionSite) {
	return site.status === 'upcoming'
		? `Upcoming · ${site.date}`
		: `Expedition ${site.n} · ${site.date}`;
}

function readAccent() {
	const probe = document.createElement('span');
	probe.style.color = 'var(--accent)';
	document.documentElement.appendChild(probe);
	const computed = getComputedStyle(probe).color;
	probe.remove();
	const channels = computed.match(/\d+/g)?.slice(0, 3).join(', ') ?? '249, 171, 0';
	const hex =
		'#' +
		channels
			.split(', ')
			.map((n) => Number(n).toString(16).padStart(2, '0'))
			.join('');
	return { hex, rgb: channels };
}

function setLabel(root: HTMLElement, site: ExpeditionSite) {
	const kicker = root.querySelector('[data-expedition-kicker]');
	const name = root.querySelector('[data-expedition-name]');
	const duration = root.querySelector('[data-expedition-duration]');
	if (kicker) kicker.textContent = kickerFor(site);
	if (name) name.textContent = site.place;
	if (duration) duration.textContent = `Totality ${site.totality}`;
}

function captionElement(site: ExpeditionSite) {
	const el = document.createElement('div');
	el.className = 'globe-caption';
	el.innerHTML = `
		<p class="globe-caption-kicker">${kickerFor(site)}</p>
		<p class="globe-caption-place">${site.place}</p>
		<p class="globe-caption-duration">Totality ${site.totality}</p>
	`;
	return el;
}

function markerElement(
	site: ExpeditionSite,
	onSelect: (site: ExpeditionSite) => void,
	onHover: (active: boolean) => void,
) {
	const wrap = document.createElement('div');
	wrap.className = 'globe-marker';
	wrap.dataset.siteId = site.id;

	const hit = document.createElement('button');
	hit.type = 'button';
	hit.className = 'globe-marker-hit';
	hit.setAttribute('aria-label', `${site.place}. Totality ${site.totality}`);
	hit.style.pointerEvents = 'auto';
	hit.addEventListener('click', (event) => {
		event.preventDefault();
		event.stopPropagation();
		onSelect(site);
	});
	hit.addEventListener('pointerenter', () => onHover(true));
	hit.addEventListener('pointerleave', () => onHover(false));
	wrap.appendChild(hit);
	return wrap;
}

function hasWebGL() {
	try {
		const canvas = document.createElement('canvas');
		return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
	} catch {
		return false;
	}
}

export function initExpeditionGlobe() {
	const section = document.querySelector<HTMLElement>('[data-expedition-section]');
	const holder = section?.querySelector<HTMLElement>('[data-expedition-map]');
	if (!section || !holder || holder.dataset.ready === 'true') return;
	holder.dataset.ready = 'true';

	const start = expeditionSites.find((site) => site.id === defaultExpeditionId) ?? expeditionSites[0];
	if (start) setLabel(section, start);

	if (!hasWebGL()) {
		holder.dataset.globe = 'unavailable';
		return;
	}

	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const { hex: accentHex, rgb: accentRgb } = readAccent();
	let selectedId = defaultExpeditionId;
	let userLocked = false;
	let tourTimer: number | undefined;
	let tourIndex = Math.max(
		0,
		expeditionSites.findIndex((site) => site.id === defaultExpeditionId),
	);
	const dwellMs = 4800;
	let scheduleTour = () => {};

	const pauseTour = () => {
		if (tourTimer !== undefined) {
			window.clearInterval(tourTimer);
			tourTimer = undefined;
		}
	};

	const onMarkerHover = (active: boolean) => {
		holder.style.cursor = active ? 'pointer' : '';
		if (userLocked || reduced) return;
		if (active) pauseTour();
		else scheduleTour();
	};

	const globe = new Globe(holder, {
		rendererConfig: { antialias: true, alpha: true },
		animateIn: !reduced,
	})
		.globeImageUrl('/images/earth-night.jpg')
		.backgroundColor('rgba(8,13,20,0)')
		.showAtmosphere(true)
		.atmosphereColor(accentHex)
		.atmosphereAltitude(0.18)
		.pointsData(expeditionSites)
		.pointLat('lat')
		.pointLng('lng')
		.pointAltitude(0.026)
		.pointResolution(20)
		.pointLabel((d) => {
			const site = d as ExpeditionSite;
			if (site.id === selectedId) return '';
			return `<span class="globe-tip">${site.place}<br>${site.totality}</span>`;
		})
		.onPointClick((point) => {
			if (isSite(point)) select(point);
		})
		.onPointHover((point) => onMarkerHover(Boolean(point)))
		.ringsData([])
		.ringLat('lat')
		.ringLng('lng')
		.ringColor(() => (t: number) => `rgba(${accentRgb}, ${1 - t})`)
		.ringMaxRadius(5)
		.ringPropagationSpeed(2.4)
		.ringRepeatPeriod(1400)
		.htmlElementsData(expeditionSites)
		.htmlLat('lat')
		.htmlLng('lng')
		.htmlAltitude(0.045)
		.htmlTransitionDuration(reduced ? 0 : 500)
		.htmlElement((d) =>
			markerElement(d as ExpeditionSite, (site) => select(site), onMarkerHover),
		);

	const paintMarkers = () => {
		holder.querySelectorAll<HTMLElement>('.globe-marker').forEach((el) => {
			const on = el.dataset.siteId === selectedId;
			el.classList.toggle('is-selected', on);
			el.querySelector('.globe-caption')?.remove();
			if (!on) return;
			const selected = expeditionSites.find((site) => site.id === selectedId);
			if (selected) el.appendChild(captionElement(selected));
		});
	};

	const paint = () => {
		const selected = expeditionSites.find((site) => site.id === selectedId);
		globe
			.pointColor((d) => ((d as ExpeditionSite).id === selectedId ? '#f5f5f3' : accentHex))
			.pointRadius((d) => ((d as ExpeditionSite).id === selectedId ? 0.95 : 0.7))
			.ringsData(selected ? [selected] : []);
		paintMarkers();
	};

	const showSite = (site: ExpeditionSite, animate: boolean) => {
		selectedId = site.id;
		tourIndex = expeditionSites.findIndex((item) => item.id === site.id);
		setLabel(section, site);
		paint();
		globe.pointOfView(
			{ lat: site.lat, lng: site.lng, altitude: 2.05 },
			animate && !reduced ? 1100 : 0,
		);
	};

	const select = (site: ExpeditionSite) => {
		userLocked = true;
		section.classList.add('is-locked');
		pauseTour();
		globe.controls().autoRotate = false;
		showSite(site, true);
	};

	const advanceTour = () => {
		if (userLocked || !expeditionSites.length) return;
		tourIndex = (tourIndex + 1) % expeditionSites.length;
		const site = expeditionSites[tourIndex];
		if (site) showSite(site, true);
	};

	paint();
	globe.pointOfView({ lat: start.lat, lng: start.lng, altitude: 2.25 }, 0);

	let frames = 0;
	const waitForMarkers = () => {
		if (holder.querySelector('.globe-marker')) {
			paintMarkers();
			return;
		}
		if (frames > 180) return;
		frames += 1;
		window.requestAnimationFrame(waitForMarkers);
	};
	waitForMarkers();

	const controls = globe.controls();
	controls.enableZoom = false;
	controls.enablePan = false;
	controls.autoRotate = false;
	controls.autoRotateSpeed = 0.55;
	controls.minPolarAngle = 0.55;
	controls.maxPolarAngle = Math.PI - 0.55;

	const layout = () => {
		const { width, height } = holder.getBoundingClientRect();
		if (width < 8 || height < 8) return;
		globe.width(width).height(height);
		const shift = width >= 900 ? Math.round(width * 0.18) : 0;
		globe.globeOffset([shift, 0]);
	};

	layout();
	requestAnimationFrame(layout);
	window.addEventListener('resize', layout, { passive: true });
	new ResizeObserver(layout).observe(holder);

	let sectionVisible = false;
	const tryTour = () => {
		if (sectionVisible) scheduleTour();
		else pauseTour();
	};
	scheduleTour = () => {
		if (userLocked || reduced || document.hidden || !sectionVisible) return;
		pauseTour();
		tourTimer = window.setInterval(advanceTour, dwellMs);
	};

	new IntersectionObserver(
		([entry]) => {
			sectionVisible = Boolean(entry?.isIntersecting);
			tryTour();
		},
		{ threshold: 0.35 },
	).observe(section);

	document.addEventListener('visibilitychange', tryTour);

	holder.addEventListener('pointerdown', (event) => {
		if (userLocked) return;
		if (event.target instanceof Element && event.target.closest('.globe-marker-hit')) return;
		pauseTour();
	});
	holder.addEventListener('pointerup', tryTour);
	holder.addEventListener('pointercancel', tryTour);

	holder.addEventListener('choose-expedition', ((event: Event) => {
		const id = (event as CustomEvent<string>).detail;
		const site = expeditionSites.find((item) => item.id === id);
		if (site) select(site);
	}) as EventListener);
}

initExpeditionGlobe();
