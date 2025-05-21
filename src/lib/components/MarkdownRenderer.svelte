<script lang="ts">
  import { Marked } from 'marked';
  import { markedHighlight } from 'marked-highlight';
  import hljs from 'highlight.js';

  import javascript from 'highlight.js/lib/languages/javascript';
  import typescript from 'highlight.js/lib/languages/typescript';
  import python from 'highlight.js/lib/languages/python';
  import java from 'highlight.js/lib/languages/java';

  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('typescript', typescript);
  hljs.registerLanguage('python', python);
  hljs.registerLanguage('java', java);

  const marked = new Marked(
    markedHighlight({
      emptyLangClass: 'hljs',
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'java';
        return hljs.highlight(code, { language }).value;
      }
    })
  );

  let { content = '' } = $props<{ content: string }>();
  let htmlContent = $derived(marked.parse(content.trim()));
</script>

<div class="prose-sm dark:prose-invert markdown-content">
  {@html htmlContent}
</div>

<style>
  .prose-sm {
    max-width: 65ch;
    line-height: 1.5;
  }

  .markdown-content :global(pre) {
    border: 1px solid var(--color-surface-200-800);
    border-radius: 0.375rem;
    padding: 0.75rem;
    overflow-x: auto;
    font-size: 0.875rem;
    line-height: 1.4;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .markdown-content :global(code) {
    font-family: var(--code-font-family), monospace;
  }

  .markdown-content :global(a) {
    transition: color 0.2s ease;
  }

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
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }

  .markdown-content :global(p:empty),
  .markdown-content :global(pre:empty) {
    display: none;
    margin: 0;
    padding: 0;
  }

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
