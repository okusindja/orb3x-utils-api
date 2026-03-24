import type { DocsCodeSample } from '@/lib/site-content';

type ParsedCurlCommand = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  outputFile?: string;
};

function tokenizeCommand(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (quote) {
      if (character === quote) {
        quote = null;
        continue;
      }

      current += character;
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }

    if (/\s/.test(character)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += character;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

function parseCurlCommand(command: string): ParsedCurlCommand {
  const normalizedCommand = command.replace(/\\\s*\n\s*/g, ' ').trim();
  const tokens = tokenizeCommand(normalizedCommand);
  let method = 'GET';
  let url = '';
  let body: string | undefined;
  let outputFile: string | undefined;
  const headers: Record<string, string> = {};

  for (let index = 1; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token === '-X' || token === '--request') {
      method = (tokens[index + 1] ?? method).toUpperCase();
      index += 1;
      continue;
    }

    if (token === '-H' || token === '--header') {
      const header = tokens[index + 1] ?? '';
      const separatorIndex = header.indexOf(':');

      if (separatorIndex >= 0) {
        const name = header.slice(0, separatorIndex).trim();
        const value = header.slice(separatorIndex + 1).trim();
        headers[name] = value;
      }

      index += 1;
      continue;
    }

    if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
      body = tokens[index + 1] ?? '';
      if (method === 'GET') {
        method = 'POST';
      }
      index += 1;
      continue;
    }

    if (token === '-o' || token === '--output') {
      outputFile = tokens[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (token.startsWith('http://') || token.startsWith('https://')) {
      url = token;
    }
  }

  if (!url) {
    throw new Error(`Unable to parse cURL command: ${command}`);
  }

  return {
    url,
    method,
    headers,
    body,
    outputFile,
  };
}

function indentBlock(value: string, spaces = 2) {
  const indentation = ' '.repeat(spaces);

  return value
    .split('\n')
    .map((line) => (line ? `${indentation}${line}` : line))
    .join('\n');
}

function buildFetchOptions(command: ParsedCurlCommand, payloadName?: string) {
  const options: string[] = [];

  if (command.method !== 'GET') {
    options.push(`method: ${JSON.stringify(command.method)}`);
  }

  if (Object.keys(command.headers).length > 0) {
    const headerLines = Object.entries(command.headers).map(
      ([name, value]) => `  ${JSON.stringify(name)}: ${JSON.stringify(value)},`,
    );

    options.push(`headers: {\n${headerLines.join('\n')}\n}`);
  }

  if (command.body) {
    options.push(payloadName ? `body: JSON.stringify(${payloadName})` : `body: ${JSON.stringify(command.body)}`);
  }

  if (options.length === 0) {
    return '';
  }

  return `, {\n${indentBlock(options.join(',\n'))}\n}`;
}

function buildNodeRequestBlock(command: ParsedCurlCommand, index: number, multiple: boolean) {
  const suffix = multiple ? `${index + 1}` : '';
  const responseName = `response${suffix}`;
  const label = multiple ? `Example ${index + 1}` : 'Response';
  const lines: string[] = [];
  let payloadName: string | undefined;

  if (command.body) {
    try {
      const parsedBody = JSON.parse(command.body);
      payloadName = `payload${suffix}`;
      lines.push(`const ${payloadName} = ${JSON.stringify(parsedBody, null, 2)};`);
    } catch {
      payloadName = undefined;
    }
  }

  lines.push(`const ${responseName} = await fetch(${JSON.stringify(command.url)}${buildFetchOptions(command, payloadName)});`);
  lines.push(`if (!${responseName}.ok) {`);
  lines.push(`  throw new Error(\`Request failed with status \${${responseName}.status}\`);`);
  lines.push(`}`);

  if (command.outputFile) {
    const bufferName = `fileBuffer${suffix}`;
    lines.push(`const ${bufferName} = Buffer.from(await ${responseName}.arrayBuffer());`);
    lines.push(`await writeFile(${JSON.stringify(command.outputFile)}, ${bufferName});`);
    lines.push(`console.log(${JSON.stringify(`Saved ${command.outputFile}`)});`);
    return lines.join('\n');
  }

  const dataName = `data${suffix}`;
  lines.push(`const ${dataName} = await ${responseName}.json();`);
  lines.push(`console.log(${JSON.stringify(label)}, ${dataName});`);

  return lines.join('\n');
}

export function curlToNodeSnippet(curlCommands: string): string {
  const commands = curlCommands
    .split(/\n\s*\n/g)
    .map((command) => command.trim())
    .filter(Boolean)
    .map(parseCurlCommand);
  const multiple = commands.length > 1;
  const needsFileWrite = commands.some((command) => command.outputFile);
  const body = commands
    .map((command, index) => buildNodeRequestBlock(command, index, multiple))
    .join('\n\n');
  const importBlock = needsFileWrite ? 'import { writeFile } from "node:fs/promises";\n\n' : '';

  return `${importBlock}async function main() {\n${indentBlock(body)}\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});`;
}

export function makeCurlAndNodeCodeSamples(
  curlCode: string,
  labels: {
    curl: string;
    node: string;
  },
): DocsCodeSample[] {
  return [
    { label: labels.curl, language: 'bash', content: curlCode },
    { label: labels.node, language: 'js', content: curlToNodeSnippet(curlCode) },
  ];
}
