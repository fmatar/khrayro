<script lang="ts">
	import { marked } from 'marked';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/atom-one-dark.css'; // Use a dark theme as base

	// Configure marked with highlight.js
	marked.setOptions({
		gfm: true,
		breaks: true,
		highlight: (code, lang) => {
			if (lang && hljs.getLanguage(lang)) {
				return hljs.highlight(code, { language: lang }).value;
			}
			return hljs.highlightAuto(code).value;
		},
	});

	// Define props using $props
	let { content = '' } = $props<{ content: string }>();

	// Use $derived for reactive computation
	let htmlContent = $derived(marked(content || ''));
</script>

<div class="prose markdown-content text-surface-900 dark:text-surface-100">
	{@html htmlContent}
</div>

<style>
    .prose {
        max-width: 65ch;
        line-height: 1.6;
    }

    /* Code block background and border */
    .markdown-content :global(pre) {
        background-color: var(--color-surface-800-100);
        border: 1px solid var(--color-surface-200-800);
        border-radius: 0.375rem;
        padding: 1rem;
        overflow-x: auto;
    }

    /* Code text */
    .markdown-content :global(code) {
        font-family: var(--base-font-family);
        color: var(--color-surface-100-800);
    }

    /* Dark mode adjustments for code text */
    :where([data-theme='dark']) .markdown-content :global(code) {
        color: var(--color-surface-100);
        background-color: var(--color-surface-900);
    }

    /* Links */
    .markdown-content :global(a) {
        color: var(--color-primary-500);
        transition: color 0.2s ease;
    }

    .markdown-content :global(a:hover) {
        color: var(--color-primary-600);
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

    /* Highlight.js styles */
    .markdown-content :global(.hljs) {
        background: transparent;
        color: var(--color-surface-900) !important;
    }

    /* Override all highlight.js classes for consistent text color */
    .markdown-content :global(.hljs-comment),
    .markdown-content :global(.hljs-quote),
    .markdown-content :global(.hljs-variable),
    .markdown-content :global(.hljs-template-variable),
    .markdown-content :global(.hljs-tag),
    .markdown-content :global(.hljs-name),
    .markdown-content :global(.hljs-selector-id),
    .markdown-content :global(.hljs-selector-class),
    .markdown-content :global(.hljs-regexp),
    .markdown-content :global(.hljs-deletion),
    .markdown-content :global(.hljs-number),
    .markdown-content :global(.hljs-built_in),
    .markdown-content :global(.hljs-literal),
    .markdown-content :global(.hljs-type),
    .markdown-content :global(.hljs-params),
    .markdown-content :global(.hljs-meta),
    .markdown-content :global(.hljs-link),
    .markdown-content :global(.hljs-attribute),
    .markdown-content :global(.hljs-string),
    .markdown-content :global(.hljs-symbol),
    .markdown-content :global(.hljs-bullet),
    .markdown-content :global(.hljs-addition),
    .markdown-content :global(.hljs-title),
    .markdown-content :global(.hljs-section),
    .markdown-content :global(.hljs-keyword),
    .markdown-content :global(.hljs-selector-tag) {
        color: var(--color-surface-900) !important;
    }

    /* Dark mode adjustments for highlight.js */
    :where([data-theme='dark']) .markdown-content :global(.hljs) {
        color: var(--color-surface-100) !important;
    }

    :where([data-theme='dark']) .markdown-content :global(.hljs-comment),
    :where([data-theme='dark']) .markdown-content :global(.hljs-quote),
    :where([data-theme='dark']) .markdown-content :global(.hljs-variable),
    :where([data-theme='dark']) .markdown-content :global(.hljs-template-variable),
    :where([data-theme='dark']) .markdown-content :global(.hljs-tag),
    :where([data-theme='dark']) .markdown-content :global(.hljs-name),
    :where([data-theme='dark']) .markdown-content :global(.hljs-selector-id),
    :where([data-theme='dark']) .markdown-content :global(.hljs-selector-class),
    :where([data-theme='dark']) .markdown-content :global(.hljs-regexp),
    :where([data-theme='dark']) .markdown-content :global(.hljs-deletion),
    :where([data-theme='dark']) .markdown-content :global(.hljs-number),
    :where([data-theme='dark']) .markdown-content :global(.hljs-built_in),
    :where([data-theme='dark']) .markdown-content :global(.hljs-literal),
    :where([data-theme='dark']) .markdown-content :global(.hljs-type),
    :where([data-theme='dark']) .markdown-content :global(.hljs-params),
    :where([data-theme='dark']) .markdown-content :global(.hljs-meta),
    :where([data-theme='dark']) .markdown-content :global(.hljs-link),
    :where([data-theme='dark']) .markdown-content :global(.hljs-attribute),
    :where([data-theme='dark']) .markdown-content :global(.hljs-string),
    :where([data-theme='dark']) .markdown-content :global(.hljs-symbol),
    :where([data-theme='dark']) .markdown-content :global(.hljs-bullet),
    :where([data-theme='dark']) .markdown-content :global(.hljs-addition),
    :where([data-theme='dark']) .markdown-content :global(.hljs-title),
    :where([data-theme='dark']) .markdown-content :global(.hljs-section),
    :where([data-theme='dark']) .markdown-content :global(.hljs-keyword),
    :where([data-theme='dark']) .markdown-content :global(.hljs-selector-tag) {
        color: var(--color-surface-100) !important;
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
