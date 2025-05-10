<script lang="ts">
  import { processMarkdown } from '$lib/utils/markdown';
  // Static imports for highlight.js themes
  import 'highlight.js/styles/github.css';
  import 'highlight.js/styles/atom-one-dark.css';

  export let content: string = '';
  export let preRenderedHtml: string | null = null;

  let htmlPromise: Promise<string> | string = preRenderedHtml || processMarkdown(content);

  // Debug content, preRenderedHtml, and htmlPromise
  $: console.log('MarkdownRenderer: content=', content, 'preRenderedHtml=', preRenderedHtml, 'htmlPromise=', htmlPromise);

  $: htmlPromise = preRenderedHtml || processMarkdown(content);
</script>

{#if typeof htmlPromise === 'string' && htmlPromise}
  <div class="markdown-content">{@html htmlPromise}</div>
{:else if typeof htmlPromise === 'string' && !htmlPromise}
  <p class="error">Empty HTML content</p>
  <p>{content}</p>
{:else}
  {#await htmlPromise}
    <!-- Render nothing while loading -->
  {:then html}
    {#if html}
      <div class="markdown-content">{@html html}</div>
    {:else}
      <p class="error">Empty HTML content</p>
      <p>{content}</p>
    {/if}
  {:catch error}
    <p class="error">{error.message || 'Failed to render content'}</p>
    <p>{content}</p>
  {/await}
{/if}

<style>
  /* Default to github.css (light mode) */
  .markdown-content :global(.hljs) {
    background: #e5e7eb; /* surface-100 */
  }
  .markdown-content :global(pre) {
    background: #e5e7eb; /* surface-100 */
    padding: 1rem;
    border-radius: 0.375rem;
    overflow-x: auto;
  }
  /* Hide atom-one-dark by default */
  .markdown-content :global(.hljs-atom-one-dark) {
    display: none;
  }

  /* Dark mode: use atom-one-dark.css */
  :where([data-theme='dark']) .markdown-content :global(.hljs) {
    display: none;
  }
  :where([data-theme='dark']) .markdown-content :global(.hljs-atom-one-dark) {
    display: block;
    background: #111827; /* surface-900 */
  }
  :where([data-theme='dark']) .markdown-content :global(pre) {
    background: #111827; /* surface-900 */
  }

  .markdown-content :global(p) {
    margin: 0;
  }
  .markdown-content :global(ul),
  .markdown-content :global(ol) {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }
  .markdown-content :global(li) {
    margin: 0.25rem 0;
  }
  .markdown-content :global(a) {
    color: #3b82f6;
    text-decoration: underline;
  }
  .markdown-content :global(a:hover) {
    color: #2563eb;
  }
  .markdown-content :global(strong) {
    font-weight: bold;
  }
  .markdown-content :global(em) {
    font-style: italic;
  }
  .markdown-content :global(code) {
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 0.875rem;
  }
  .markdown-content :global(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 0.5rem 0;
  }
  .markdown-content :global(th),
  .markdown-content :global(td) {
    border: 1px solid #d1d5db; /* surface-200 */
    padding: 0.5rem;
  }
  .markdown-content :global(th) {
    background: #d1d5db; /* surface-200 */
    font-weight: 600;
  }
  .markdown-content :global(.task-list-item) {
    list-style: none;
  }
  .markdown-content :global(.task-list-item input) {
    margin-right: 0.5rem;
  }
  .markdown-content :global(del) {
    text-decoration: line-through;
  }
  .error {
    color: #ef4444; /* error-500 */
  }

  /* Dark mode styles */
  :where([data-theme='dark']) .markdown-content :global(a) {
    color: #60a5fa; /* blue-400 */
  }
  :where([data-theme='dark']) .markdown-content :global(a:hover) {
    color: #93c5fd; /* blue-300 */
  }
  :where([data-theme='dark']) .markdown-content :global(th),
  :where([data-theme='dark']) .markdown-content :global(td) {
    border-color: #374151; /* surface-700 */
  }
  :where([data-theme='dark']) .markdown-content :global(th) {
    background: #1f2937; /* surface-800 */
  }
  :where([data-theme='dark']) .error {
    color: #f87171; /* red-400 */
  }
</style>
