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
	let selectedId = defaultExpeditionId;

	const globe = new Globe(holder, {
		rendererConfig: { antialias: true, alpha: true },
		animateIn: !reduced,
	})
		.globeImageUrl('/images/earth-night.jpg')
		.backgroundColor('rgba(8,13,20,0)')
		.showAtmosphere(true)
		.atmosphereColor('#e87991')
		.atmosphereAltitude(0.18)
		.pointsData(expeditionSites)
		.pointLat('lat')
		.pointLng('lng')
		.pointAltitude(0.018)
		.pointResolution(12)
		.pointLabel((d) => {
			const site = d as ExpeditionSite;
			if (site.id === selectedId) return '';
			return `<span class="globe-tip">${site.place}<br>${site.totality}</span>`;
		})
		.onPointClick((point) => {
			if (isSite(point)) select(point);
		})
		.ringsData([])
		.ringLat('lat')
		.ringLng('lng')
		.ringColor(() => (t: number) => `rgba(232, 121, 145, ${1 - t})`)
		.ringMaxRadius(4)
		.ringPropagationSpeed(2.4)
		.ringRepeatPeriod(1400)
		.htmlElementsData([])
		.htmlLat('lat')
		.htmlLng('lng')
		.htmlAltitude(0.08)
		.htmlTransitionDuration(reduced ? 0 : 500)
		.htmlElement((d) => captionElement(d as ExpeditionSite));

	const paint = () => {
		const selected = expeditionSites.find((site) => site.id === selectedId);
		globe
			.pointColor((d) => ((d as ExpeditionSite).id === selectedId ? '#f5f5f3' : '#e87991'))
			.pointRadius((d) => ((d as ExpeditionSite).id === selectedId ? 0.62 : 0.34))
			.ringsData(selected ? [selected] : [])
			.htmlElementsData(selected ? [selected] : []);
	};

	const select = (site: ExpeditionSite) => {
		selectedId = site.id;
		setLabel(section, site);
		section.classList.add('is-locked');
		const controls = globe.controls();
		controls.autoRotate = false;
		paint();
		globe.pointOfView({ lat: site.lat, lng: site.lng, altitude: 2.05 }, reduced ? 0 : 900);
	};

	paint();
	globe.pointOfView({ lat: start.lat, lng: start.lng, altitude: 2.25 }, 0);

	const controls = globe.controls();
	controls.enableZoom = false;
	controls.enablePan = false;
	controls.autoRotate = !reduced;
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

	holder.addEventListener('choose-expedition', ((event: Event) => {
		const id = (event as CustomEvent<string>).detail;
		const site = expeditionSites.find((item) => item.id === id);
		if (site) select(site);
	}) as EventListener);
}

initExpeditionGlobe();
