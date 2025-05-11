<script lang="ts">
	import { marked } from 'marked';
	import 'highlight.js/styles/atom-one-dark.css'; // Use a dark theme as base

	// Configure marked with highlight.js
	marked.setOptions({
		gfm: true,
		breaks: true
	});

	// Define props using $props
	let { content = '' } = $props<{ content: string }>();

	// Use $derived for reactive computation
	let htmlContent = $derived(marked(content || ''));
</script>

<div class="prose dark:prose-invert markdown-content">
	{@html htmlContent}
</div>
<style>
    .prose {
        max-width: 65ch;
        line-height: 1.6;
    }

    /* Code block background and border */
    .markdown-content :global(pre) {
        /*background-color: transparent; !* Inherit from parent bubble *!*/
        border: 1px solid var(--color-surface-200-800);
        border-radius: 0.375rem;
        padding: 1rem;
        overflow-x: auto;
        font-size: 0.875rem;
        line-height: 1.5;
    }

    /* Code text */
    .markdown-content :global(code) {
        font-family: var(--base-font-family);
    }

    /* Links */
    .markdown-content :global(a) {
        /*color: var(--color-primary-500);*/
        transition: color 0.2s ease;
    }

    .markdown-content :global(a:hover) {
        /*color: var(--color-primary-600);*/
    }

    /* Ensure all text elements inherit the root color */
    .markdown-content :global(p),
    .markdown-content :global(h1),
    .markdown-content :global(h2),
    .markdown-content :global(h3),
    .markdown-content :global(h4),
    .markdown-content :global(h5),
    .markdown-content :global(h6),
    .markdown-content :global(ul),
    .markdown-content :global(ol),
    .markdown-content :global(li) {
        color: inherit;
    }

    /* Scrollbar styles */
    .markdown-content :global(pre::-webkit-scrollbar) {
        height: 6px;
    }

    .markdown-content :global(pre::-webkit-scrollbar-track) {
        background: var(--color-surface-100-900);
        border-radius: 4px;
        border: 1px solid transparent;
    }

    .markdown-content :global(pre::-webkit-scrollbar-thumb) {
        background: var(--color-primary-500);
        border-radius: 4px;
        box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.3);
        opacity: 0.3;
        border: 1px solid var(--color-surface-200-800);
        transition: background 0.2s ease, box-shadow 0.2s ease, opacity 0.3s ease;
    }

    .markdown-content :global(pre::-webkit-scrollbar-thumb:hover) {
        background: var(--color-primary-600);
        box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.4);
        opacity: 1;
        border-color: var(--color-primary-600);
    }
</style>
