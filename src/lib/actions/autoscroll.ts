// lib/actions/autoscroll.ts
import { tick } from 'svelte';

export function autoscroll(node: HTMLElement, threshold = 100) {
	let bottom: HTMLElement;
	node.insertAdjacentHTML('beforeend', '<span id="__bottom"></span>');
	bottom = node.querySelector('#__bottom') as HTMLElement;

	async function scrollIfSticky() {
		await tick();
		const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
		if (distance < threshold) bottom.scrollIntoView({ behavior: 'smooth', block: 'end' });
	}

	const observer = new MutationObserver(scrollIfSticky);
	observer.observe(node, { childList: true, subtree: true });

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
