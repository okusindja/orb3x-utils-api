import { docsPageToMarkdown } from '@/lib/docs-markdown';
import type { DocsPage } from '@/lib/site-content';

const page: DocsPage = {
  slug: 'mcp',
  label: 'MCP Server',
  description: 'desc',
  eyebrow: 'Reference',
  title: 'MCP Server',
  intro: 'Connect any MCP client.',
  endpoint: { method: 'POST', path: '/api/mcp', detail: 'Streamable HTTP endpoint.' },
  summaryCards: [
    { label: 'Tools', value: '25' },
    { label: 'Transport', value: 'Streamable HTTP' },
  ],
  sections: [
    {
      id: 'catalog',
      title: 'Tool catalog',
      description: 'All tools.',
      bullets: ['One', 'Two'],
      table: {
        columns: ['Tool', 'Docs'],
        rows: [
          ['salary_net', { label: 'View docs', href: '/docs/salary' }],
          ['nif_lookup', { label: 'View docs', href: '/docs/nif-verification' }],
        ],
      },
      note: 'NIF latency is 5–30 s.',
    },
    {
      id: 'connect',
      title: 'Connect',
      code: { label: 'mcp.json', language: 'json', content: '{ "url": "x" }' },
    },
  ],
  relatedSlugs: ['salary', 'nif-verification'],
};

describe('docsPageToMarkdown', () => {
  const md = docsPageToMarkdown(page);

  it('renders the title as an H1 and the intro', () => {
    expect(md).toContain('# MCP Server');
    expect(md).toContain('Connect any MCP client.');
  });

  it('renders the endpoint and summary cards', () => {
    expect(md).toContain('**POST `/api/mcp`** — Streamable HTTP endpoint.');
    expect(md).toContain('- **Tools:** 25');
  });

  it('renders sections as H2 with bullets', () => {
    expect(md).toContain('## Tool catalog');
    expect(md).toContain('- One');
  });

  it('renders a table with link cells as Markdown links', () => {
    expect(md).toContain('| Tool | Docs |');
    expect(md).toContain('| --- | --- |');
    expect(md).toContain('| salary_net | [View docs](/docs/salary) |');
  });

  it('renders notes as blockquotes and code as fenced blocks', () => {
    expect(md).toContain('> NIF latency is 5–30 s.');
    expect(md).toContain('```json');
    expect(md).toContain('{ "url": "x" }');
  });

  it('renders related pages as a list of links', () => {
    expect(md).toContain('## Related pages');
    expect(md).toContain('- [/docs/salary](/docs/salary)');
  });
});
