/**
 * Processes markdown content into HTML using unified, remark, and rehype plugins.
 * @param markdown - The markdown string to process.
 * @returns A promise resolving to the processed HTML string.
 */
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';

export async function processMarkdown(markdown: string): Promise<string> {
	try {
		const processor = unified()
			.use(remarkParse)
			.use(remarkGfm)
			.use(remarkRehype)
			.use(rehypeHighlight)
			.use(rehypeSanitize)
			.use(rehypeStringify);

		const result = await processor.process(markdown);
		return result.toString();
	} catch (error) {
		console.error('Markdown processing error:', error);
		return markdown;
	}
}
