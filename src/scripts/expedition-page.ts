export function mountExpeditionSites(root: HTMLElement) {
	const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-site]')];
	if (!buttons.length) return;

	const setSite = (id: string) => {
		root.dataset.activeSite = id;
		for (const button of buttons) {
			button.setAttribute('aria-pressed', String(button.dataset.site === id));
		}
	};

	for (const button of buttons) {
		button.addEventListener('click', () => {
			const id = button.dataset.site;
			if (id) setSite(id);
		});
	}
}
