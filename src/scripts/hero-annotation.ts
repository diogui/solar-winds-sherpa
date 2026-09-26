export const HERO_SOURCE = {
	width: 1600,
	height: 900,
	centerX: 890,
	centerY: 104,
	radius: 36,
	boxX: 986,
	boxY: 150,
	boxWidth: 510,
} as const;

export const OVERLAY_TIMING = {
	fadeInStart: 3.2,
	fadeInEnd: 3.5,
	fadeOutStart: 7.25,
	fadeOutEnd: 7.6,
} as const;

export const NAME_COMPACT_AT = 3;

type CoverMap = {
	scale: number;
	offsetX: number;
	offsetY: number;
	cx: number;
	cy: number;
	radius: number;
};

type ObjectPosition = { posX: number; posY: number };

type VideoWithFrameCallback = HTMLVideoElement & {
	requestVideoFrameCallback?: (
		callback: (now: number, metadata: { mediaTime?: number }) => void,
	) => number;
	cancelVideoFrameCallback?: (handle: number) => void;
};

export function overlayOpacity(time: number): number {
	const { fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd } = OVERLAY_TIMING;
	return Math.max(
		0,
		Math.min(1, (time - fadeInStart) / (fadeInEnd - fadeInStart), (fadeOutEnd - time) / (fadeOutEnd - fadeOutStart)),
	);
}

export function parseObjectPosition(value: string): ObjectPosition {
	const parts = value.trim().split(/\s+/);
	const axis = (token: string | undefined, fallback: number) => {
		if (!token) return fallback;
		if (token === 'left' || token === 'top') return 0;
		if (token === 'right' || token === 'bottom') return 1;
		if (token === 'center') return 0.5;
		if (token.endsWith('%')) {
			const n = Number.parseFloat(token);
			return Number.isFinite(n) ? n / 100 : fallback;
		}
		return fallback;
	};
	if (parts.length === 1) return { posX: axis(parts[0], 0.5), posY: 0.5 };
	return { posX: axis(parts[0], 0.5), posY: axis(parts[1], 0.5) };
}

export function mapCoverPoint(
	width: number,
	height: number,
	posX: number,
	posY: number,
	fit: string = 'cover',
): CoverMap {
	const { width: srcW, height: srcH, centerX, centerY, radius } = HERO_SOURCE;
	const scale = (fit === 'contain' ? Math.min : Math.max)(width / srcW, height / srcH);
	const offsetX = (width - srcW * scale) * posX;
	const offsetY = (height - srcH * scale) * posY;
	return {
		scale,
		offsetX,
		offsetY,
		cx: offsetX + centerX * scale,
		cy: offsetY + centerY * scale,
		radius: radius * scale,
	};
}

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function rectsOverlap(
	a: { left: number; top: number; right: number; bottom: number },
	b: { left: number; top: number; right: number; bottom: number },
	gap = 12,
) {
	return a.left < b.right + gap && a.right > b.left - gap && a.top < b.bottom + gap && a.bottom > b.top - gap;
}

function nearestPointOnRect(
	x: number,
	y: number,
	rect: { left: number; top: number; right: number; bottom: number },
) {
	const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
	if (!inside) {
		return {
			x: clamp(x, rect.left, rect.right),
			y: clamp(y, rect.top, rect.bottom),
		};
	}
	const toLeft = x - rect.left;
	const toRight = rect.right - x;
	const toTop = y - rect.top;
	const toBottom = rect.bottom - y;
	const nearest = Math.min(toLeft, toRight, toTop, toBottom);
	if (nearest === toLeft) return { x: rect.left, y };
	if (nearest === toRight) return { x: rect.right, y };
	if (nearest === toTop) return { x, y: rect.top };
	return { x, y: rect.bottom };
}

export function mountHeroAnnotation(root: HTMLElement, video: HTMLVideoElement) {
	const layer = root.querySelector<HTMLElement>('[data-hero-annotation]');
	const svg = layer?.querySelector<SVGSVGElement>('[data-hero-svg]');
	const circle = svg?.querySelector('circle');
	const line = svg?.querySelector('line');
	const card = layer?.querySelector<HTMLElement>('[data-hero-caption]');
	if (!layer || !svg || !circle || !line || !card) return () => {};

	const media = root.querySelector<HTMLElement>('.home-hero-media') ?? root;
	let frameHandle: number | null = null;
	let rafHandle = 0;
	let usingVideoFrames = false;

	const hide = () => {
		layer.style.opacity = '0';
		layer.hidden = true;
		layer.classList.remove('is-on');
	};

	const obstacles = () => {
		const nodes = [
			document.querySelector<HTMLElement>('[data-header]'),
			root.querySelector<HTMLElement>('.home-hero-name'),
			root.querySelector<HTMLElement>('.home-hero-question'),
			root.querySelector<HTMLElement>('.home-hero-cta'),
		];
		const mediaBox = media.getBoundingClientRect();
		return nodes
			.filter((node): node is HTMLElement => Boolean(node))
			.map((node) => {
				const r = node.getBoundingClientRect();
				return {
					left: r.left - mediaBox.left,
					top: r.top - mediaBox.top,
					right: r.right - mediaBox.left,
					bottom: r.bottom - mediaBox.top,
				};
			});
	};

	const placeCard = (mapped: CoverMap, width: number, height: number, mobile: boolean) => {
		const margin = mobile ? 16 : 24;
		const maxWidth = mobile
			? Math.min(340, Math.max(0, width - margin * 2))
			: Math.min(HERO_SOURCE.boxWidth, Math.max(0, width - margin * 2));
		card.style.width = 'max-content';
		card.style.maxWidth = `${maxWidth}px`;
		const cardH = card.offsetHeight;
		const cardW = card.offsetWidth || maxWidth;

		let left = mobile
			? (width - cardW) / 2
			: mapped.offsetX + HERO_SOURCE.boxX * mapped.scale;
		let top = mobile
			? mapped.cy + mapped.radius + 24
			: mapped.offsetY + HERO_SOURCE.boxY * mapped.scale;

		const minTop = margin;
		const maxLeft = Math.max(margin, width - cardW - margin);
		const maxTop = Math.max(minTop, height - cardH - margin);
		left = clamp(left, margin, maxLeft);
		top = clamp(top, minTop, maxTop);

		const tryShift = () => {
			const box = { left, top, right: left + cardW, bottom: top + cardH };
			for (const block of obstacles()) {
				if (!rectsOverlap(box, block)) continue;
		if (mobile) {
					const belowCircle = mapped.cy + mapped.radius + 24;
					if (belowCircle + cardH + 16 <= block.top) {
						top = clamp(belowCircle, minTop, maxTop);
					} else {
						top = clamp(block.bottom + 16, minTop, maxTop);
					}
				} else if (block.left > mapped.cx) {
					left = clamp(block.left - cardW - 16, margin, maxLeft);
				} else {
					left = clamp(block.right + 16, margin, maxLeft);
					top = clamp(Math.max(top, mapped.cy + mapped.radius * 0.35), minTop, maxTop);
				}
			}
		};
		tryShift();
		tryShift();

		card.style.left = `${left}px`;
		card.style.top = `${top}px`;
		return { left, top, right: left + cardW, bottom: top + cardH };
	};

	const drawLine = (mapped: CoverMap, box: { left: number; top: number; right: number; bottom: number }, mobile: boolean) => {
		if (mobile) {
			line.setAttribute('visibility', 'hidden');
			return;
		}
		const point = nearestPointOnRect(mapped.cx, mapped.cy, box);
		const dx = point.x - mapped.cx;
		const dy = point.y - mapped.cy;
		const dist = Math.hypot(dx, dy);
		if (dist <= mapped.radius + 2) {
			line.setAttribute('visibility', 'hidden');
			return;
		}
		line.setAttribute('visibility', 'visible');
		line.setAttribute('x1', String(mapped.cx + (dx / dist) * mapped.radius));
		line.setAttribute('y1', String(mapped.cy + (dy / dist) * mapped.radius));
		line.setAttribute('x2', String(point.x));
		line.setAttribute('y2', String(point.y));
	};

	const layout = () => {
		const width = media.clientWidth;
		const height = media.clientHeight;
		if (width < 2 || height < 2) return;
		const fit = getComputedStyle(video).objectFit || 'cover';
		const { posX, posY } = parseObjectPosition(getComputedStyle(video).objectPosition);
		const mapped = mapCoverPoint(width, height, posX, posY, fit);
		const mobile = width < 768;
		svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
		svg.setAttribute('width', String(width));
		svg.setAttribute('height', String(height));
		circle.setAttribute('cx', String(mapped.cx));
		circle.setAttribute('cy', String(mapped.cy));
		circle.setAttribute('r', String(mapped.radius));
		const box = placeCard(mapped, width, height, mobile);
		drawLine(mapped, box, mobile);
	};

	const showingPoster = () =>
		root.dataset.playing !== 'true' || !video.getAttribute('src') || video.readyState < 2;

	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const setHeroCompact = (time: number) => {
		const compact = !showingPoster() && !reducedMotion.matches && time >= NAME_COMPACT_AT;
		if (compact) root.dataset.heroCompact = 'true';
		else delete root.dataset.heroCompact;
	};

	const sync = (time = video.currentTime) => {
		setHeroCompact(time);
		if (showingPoster()) {
			hide();
			return;
		}
		const opacity = overlayOpacity(time);
		if (opacity <= 0) {
			hide();
			return;
		}
		layer.hidden = false;
		layout();
		layer.classList.add('is-on');
		layer.style.opacity = String(opacity);
	};

	const stopFrames = () => {
		const framed = video as VideoWithFrameCallback;
		if (frameHandle !== null && framed.cancelVideoFrameCallback) {
			framed.cancelVideoFrameCallback(frameHandle);
		}
		frameHandle = null;
		if (rafHandle) cancelAnimationFrame(rafHandle);
		rafHandle = 0;
		usingVideoFrames = false;
	};

	const tickFrames = (now: number, metadata?: { mediaTime?: number }) => {
		const framed = video as VideoWithFrameCallback;
		const time = typeof metadata?.mediaTime === 'number' ? metadata.mediaTime : video.currentTime;
		sync(time);
		if (video.paused || video.ended) {
			frameHandle = null;
			usingVideoFrames = false;
			return;
		}
		if (framed.requestVideoFrameCallback) {
			frameHandle = framed.requestVideoFrameCallback(tickFrames);
			usingVideoFrames = true;
			return;
		}
		rafHandle = requestAnimationFrame((next) => tickFrames(next));
	};

	const startFrames = () => {
		if (video.paused) {
			sync();
			return;
		}
		if (usingVideoFrames || rafHandle) return;
		const framed = video as VideoWithFrameCallback;
		if (framed.requestVideoFrameCallback) {
			frameHandle = framed.requestVideoFrameCallback(tickFrames);
			usingVideoFrames = true;
			return;
		}
		rafHandle = requestAnimationFrame((now) => tickFrames(now));
	};

	const onPlay = () => startFrames();
	const onPause = () => {
		stopFrames();
		sync();
	};
	const onSeeked = () => sync();
	const onTimeUpdate = () => {
		if (!usingVideoFrames) sync();
	};
	const onLoaded = () => sync();
	const onEmptied = () => {
		delete root.dataset.heroCompact;
		hide();
	};

	video.addEventListener('play', onPlay);
	video.addEventListener('playing', onPlay);
	video.addEventListener('pause', onPause);
	video.addEventListener('seeked', onSeeked);
	video.addEventListener('timeupdate', onTimeUpdate);
	video.addEventListener('loadeddata', onLoaded);
	video.addEventListener('emptied', onEmptied);
	video.addEventListener('ended', onPause);

	const resize = new ResizeObserver(() => {
		if (!layer.hidden) layout();
	});
	resize.observe(media);

	hide();
	if (!video.paused) startFrames();

	return () => {
		stopFrames();
		resize.disconnect();
		video.removeEventListener('play', onPlay);
		video.removeEventListener('playing', onPlay);
		video.removeEventListener('pause', onPause);
		video.removeEventListener('seeked', onSeeked);
		video.removeEventListener('timeupdate', onTimeUpdate);
		video.removeEventListener('loadeddata', onLoaded);
		video.removeEventListener('emptied', onEmptied);
		video.removeEventListener('ended', onPause);
		delete root.dataset.heroCompact;
		hide();
	};
}
