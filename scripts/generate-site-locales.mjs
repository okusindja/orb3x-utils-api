import fs from 'node:fs/promises';
import path from 'node:path';
import Module, { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function patchedResolveFilename(request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    request = path.join(projectRoot, 'src', request.slice(2));
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

// Load the local TypeScript modules directly so the generator can reuse the app source of truth.
Module._extensions['.ts'] = function registerTypeScript(module, filename) {
  const source = ts.sys.readFile(filename);

  if (typeof source !== 'string') {
    throw new Error(`Unable to read TypeScript module: ${filename}`);
  }

  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
    fileName: filename,
  });

  module._compile(outputText, filename);
};

const { translateText } = require(path.join(projectRoot, 'src/lib/translate.ts'));
const { enSiteCopy } = require(path.join(projectRoot, 'src/locales/site/en.ts'));
const { enDocsPages } = require(path.join(projectRoot, 'src/locales/site/docs/en.ts'));

const LANGUAGE_NAMES = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  ja: '日本語',
};

const LOCALE_CONFIG = [
  { code: 'es', siteConst: 'esSiteCopy', docsConst: 'esDocsPages', languageName: 'Español', targetLanguage: 'es' },
  { code: 'fr', siteConst: 'frSiteCopy', docsConst: 'frDocsPages', languageName: 'Français', targetLanguage: 'fr' },
  { code: 'de', siteConst: 'deSiteCopy', docsConst: 'deDocsPages', languageName: 'Deutsch', targetLanguage: 'de' },
  { code: 'zh', siteConst: 'zhSiteCopy', docsConst: 'zhDocsPages', languageName: '中文', targetLanguage: 'zh' },
  { code: 'ja', siteConst: 'jaSiteCopy', docsConst: 'jaDocsPages', languageName: '日本語', targetLanguage: 'ja' },
];

const TOKEN_PATTERNS = [
  /`[^`]+`/g,
  /https?:\/\/[^\s"'`]+/g,
  /\/(?:api|docs|legal|faq|examples|robots\.txt|sitemap\.xml)[^\s"'`)]*/g,
  /\bCache-Control:\s*no-store\b/g,
  /\bno-store\b/g,
  /\bNode\.js\b/g,
  /\bTypeScript\b/g,
  /\bcURL\b/g,
  /\bJSON\b/g,
  /\bPDF\b/g,
  /\bHTTP\b/g,
  /\bAPI\b/g,
  /\bORB3X\b/g,
  /\bNIF\b/g,
  /\bIBAN\b/g,
  /\bVAT\b/g,
  /\bURL\b/g,
  /\bFAQ\b/g,
  /\bGET\b/g,
  /\bPOST\b/g,
  /ORB3X Utils API/g,
  /\berror\.code\b/g,
  /\bunitRates\b/g,
  /\bconvertedRates\b/g,
  /\bratesDate\b/g,
  /\bsourceLanguage\b/g,
];

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function clone(value) {
  return structuredClone(value);
}

function createPathKey(pathParts) {
  return pathParts.join('.');
}

function containsLetters(value) {
  return /[\p{L}\p{N}]/u.test(value);
}

function shouldPreserveString(pathParts, value) {
  const last = pathParts[pathParts.length - 1] ?? '';
  const pathKey = createPathKey(pathParts);

  if (!containsLetters(value)) {
    return true;
  }

  if (last === 'slug' || last === 'href' || last === 'id' || last === 'method' || last === 'path') {
    return true;
  }

  if (last === 'language' || value === 'bash' || value === 'json' || value === 'js' || value === 'ts') {
    return true;
  }

  if (pathParts.includes('relatedSlugs')) {
    return true;
  }

  if (pathKey.includes('.code.content') || pathKey.includes('.codes.') && pathKey.endsWith('.content')) {
    return true;
  }

  if (value.startsWith('/api/') || value.startsWith('/docs/') || value.startsWith('http://') || value.startsWith('https://')) {
    return true;
  }

  if (/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/.test(value)) {
    return true;
  }

  if (/^[A-Z0-9_.:/+-]+$/.test(value) && !value.includes(' ')) {
    return true;
  }

  if (/^[A-Za-z0-9_.-]+(?:,\s*[A-Za-z0-9_.-]+)+$/.test(value)) {
    return true;
  }

  return false;
}

function protectTokens(value) {
  const tokens = [];
  let nextValue = value;

  TOKEN_PATTERNS.forEach((pattern) => {
    nextValue = nextValue.replace(pattern, (match) => {
      const tokenId = `__ORB3X_TOKEN_${tokens.length}__`;
      tokens.push(match);
      return tokenId;
    });
  });

  return {
    text: nextValue,
    restore(translatedValue) {
      return translatedValue.replace(/__ORB3X_TOKEN_(\d+)__/g, (_, index) => tokens[Number(index)] ?? '');
    },
  };
}

function collectTranslatableEntries(value, pathParts = [], entries = []) {
  if (typeof value === 'string') {
    if (!shouldPreserveString(pathParts, value)) {
      entries.push({ pathParts, value });
    }

    return entries;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectTranslatableEntries(item, [...pathParts, String(index)], entries));
    return entries;
  }

  if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, childValue]) => collectTranslatableEntries(childValue, [...pathParts, key], entries));
  }

  return entries;
}

function setValueAtPath(target, pathParts, translatedValue) {
  let current = target;

  for (let index = 0; index < pathParts.length - 1; index += 1) {
    current = current[pathParts[index]];
  }

  current[pathParts[pathParts.length - 1]] = translatedValue;
}

function buildTranslationBatches(entries) {
  const uniqueEntries = [];
  const seen = new Map();

  entries.forEach((entry) => {
    if (seen.has(entry.value)) {
      return;
    }

    seen.set(entry.value, true);
    uniqueEntries.push(entry);
  });

  const batches = [];
  let currentBatch = [];
  let currentLength = 0;

  uniqueEntries.forEach((entry) => {
    const protectedEntry = protectTokens(entry.value);
    const entryLength = protectedEntry.text.length;

    if (currentBatch.length > 0 && currentLength + entryLength > 3200) {
      batches.push(currentBatch);
      currentBatch = [];
      currentLength = 0;
    }

    currentBatch.push({
      original: entry.value,
      protectedText: protectedEntry.text,
      restore: protectedEntry.restore,
    });
    currentLength += entryLength;
  });

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

async function translateStringMap(entries, targetLanguage) {
  const batches = buildTranslationBatches(entries);
  const translations = new Map();

  for (const batch of batches) {
    const markers = batch.map((_, index) => `__ORB3X_SEGMENT_${index}__`);
    const payload = batch
      .map((entry, index) => `${markers[index]}\n${entry.protectedText}`)
      .join('\n');
    const { translatedText } = await translateText({
      text: payload,
      to: targetLanguage,
      from: 'en',
    });

    markers.forEach((marker, index) => {
      const start = translatedText.indexOf(marker);

      if (start < 0) {
        throw new Error(`Unable to recover translated segment ${marker} for ${targetLanguage}.`);
      }

      const end = index === markers.length - 1
        ? translatedText.length
        : translatedText.indexOf(markers[index + 1], start + marker.length);
      const segment = translatedText
        .slice(start + marker.length, end === -1 ? translatedText.length : end)
        .trim();
      translations.set(batch[index].original, batch[index].restore(segment));
    });
  }

  return translations;
}

async function translateObject(sourceValue, targetLanguage) {
  const translatedValue = clone(sourceValue);
  const entries = collectTranslatableEntries(sourceValue);
  const translations = await translateStringMap(entries, targetLanguage);

  entries.forEach((entry) => {
    const nextValue = translations.get(entry.value);

    if (typeof nextValue === 'string') {
      setValueAtPath(translatedValue, entry.pathParts, nextValue);
    }
  });

  return translatedValue;
}

function serializeTsObject(value) {
  return JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
}

async function writeLocaleFiles(config, siteCopy, docsPages) {
  const docsOutput = `import type { DocsPageMap } from '@/lib/site-content';\n\nexport const ${config.docsConst}: DocsPageMap = ${serializeTsObject(docsPages)};\n`;
  const siteOutput = `import { ${config.docsConst} } from './docs/${config.code}';\nimport type { PartialSiteCopy } from './types';\n\nexport const ${config.siteConst}: PartialSiteCopy = ${serializeTsObject({
    ...siteCopy,
    docsPages: config.docsConst,
  }).replace(`"${config.docsConst}"`, config.docsConst)};\n`;

  await fs.writeFile(path.join(projectRoot, 'src/locales/site/docs', `${config.code}.ts`), docsOutput);
  await fs.writeFile(path.join(projectRoot, 'src/locales/site', `${config.code}.ts`), siteOutput);
}

async function main() {
  const baseSiteCopy = {
    ...enSiteCopy,
  };
  delete baseSiteCopy.docsPages;

  for (const config of LOCALE_CONFIG) {
    console.log(`Translating site copy for ${config.code}...`);
    const translatedSiteCopy = await translateObject(baseSiteCopy, config.targetLanguage);
    const translatedDocsPages = await translateObject(enDocsPages, config.targetLanguage);

    translatedSiteCopy.languageName = config.languageName;
    translatedSiteCopy.languages = LANGUAGE_NAMES;
    translatedSiteCopy.docsPages = undefined;

    await writeLocaleFiles(
      config,
      translatedSiteCopy,
      translatedDocsPages,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
