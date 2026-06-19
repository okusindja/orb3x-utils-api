import type { DocsPage, DocsSection, DocsTableCell } from '@/lib/site-content';

// Serializes a DocsPage into a single self-contained Markdown document — the full
// page (header, endpoint, summary cards, every section, related pages) — for the
// "Copy as Markdown" action on the docs detail pages.

function cell(value: DocsTableCell): string {
  if (typeof value === 'string') {
    return value;
  }
  return `[${value.label}](${value.href})`;
}

function escapeCell(value: string): string {
  // Pipes break Markdown table columns; escape them.
  return value.replace(/\|/g, '\\|');
}

function tableToMarkdown(columns: string[], rows: DocsTableCell[][]): string {
  const header = `| ${columns.map(escapeCell).join(' | ')} |`;
  const divider = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.map((c) => escapeCell(cell(c))).join(' | ')} |`).join('\n');
  return [header, divider, body].filter(Boolean).join('\n');
}

function codeToMarkdown(label: string, language: string, content: string): string {
  const heading = label ? `**${label}**\n\n` : '';
  return `${heading}\`\`\`${language}\n${content}\n\`\`\``;
}

function sectionToMarkdown(section: DocsSection): string {
  const parts: string[] = [`## ${section.title}`];

  if (section.description) {
    parts.push(section.description);
  }
  if (section.paragraphs?.length) {
    parts.push(section.paragraphs.join('\n\n'));
  }
  if (section.bullets?.length) {
    parts.push(section.bullets.map((b) => `- ${b}`).join('\n'));
  }
  if (section.table) {
    parts.push(tableToMarkdown(section.table.columns, section.table.rows));
  }
  if (section.code) {
    parts.push(codeToMarkdown(section.code.label, section.code.language, section.code.content));
  }
  if (section.codes?.length) {
    parts.push(section.codes.map((c) => codeToMarkdown(c.label, c.language, c.content)).join('\n\n'));
  }
  if (section.note) {
    parts.push(
      section.note
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n'),
    );
  }

  return parts.join('\n\n');
}

export function docsPageToMarkdown(page: DocsPage): string {
  const blocks: string[] = [`# ${page.title}`];

  if (page.intro) {
    blocks.push(page.intro);
  }
  if (page.endpoint) {
    blocks.push(`**${page.endpoint.method} \`${page.endpoint.path}\`** — ${page.endpoint.detail}`);
  }
  if (page.summaryCards.length) {
    blocks.push(page.summaryCards.map((card) => `- **${card.label}:** ${card.value}`).join('\n'));
  }

  for (const section of page.sections) {
    blocks.push(sectionToMarkdown(section));
  }

  if (page.relatedSlugs.length) {
    blocks.push(
      ['## Related pages', page.relatedSlugs.map((slug) => `- [/docs/${slug}](/docs/${slug})`).join('\n')].join(
        '\n\n',
      ),
    );
  }

  return `${blocks.join('\n\n')}\n`;
}
