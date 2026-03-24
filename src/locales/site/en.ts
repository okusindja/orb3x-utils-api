import { enDocsPages } from './docs/en';

export const enSiteCopy = {
  languageName: 'English',
  languages: {
    en: 'English',
    pt: 'Português',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    zh: '中文',
    ja: '日本語',
  },
  metadata: {
    title: 'ORB3X Utils API - Tax Verification, Translation & Currency Conversion',
    description: 'Documentation for ORB3X Utils API routes covering Angola-focused validation, geo, finance, payroll, documents, and legacy upstream utilities.',
    keywords: [
      'API',
      'tax verification',
      'translation',
      'currency exchange',
      'NIF',
      'developer tools',
      'Angola',
      'exchange rates',
    ],
    openGraphTitle: 'ORB3X Utils API',
    openGraphDescription: 'Documentation for Angola-focused validation, geo, finance, payroll, documents, and legacy upstream routes.',
  },
  brand: {
    homeAriaLabel: 'ORB3X Utils API home',
    companyWebsiteAriaLabel: 'Open the ORB3X company website',
  },
  header: {
    themeToDark: 'Switch to dark mode',
    themeToLight: 'Switch to light mode',
    language: 'Language',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    navigation: 'Navigation',
  },
  navigation: {
    docs: 'Docs',
    apiReference: 'API Reference',
    examples: 'Examples',
    faq: 'FAQ',
    privacy: 'Privacy',
  },
  footer: {
    description: 'Documentation and reference pages for the Angola-focused ORB3X Utils API route families.',
    companyLabel: 'Company',
    companyDescription: 'ORB3X Utils API is maintained by ORB3X. Visit the main company website for the broader product and institutional presence.',
    companyWebsite: 'Visit orb3x.com',
    explore: 'Explore',
    documentation: 'Documentation',
    policies: 'Policies',
    privacy: 'Privacy Policy',
    terms: 'Terms of Use',
    faq: 'FAQ',
    copyright: '© 2026 ORB3X Utils API. All rights reserved.',
    tagline: 'Validation, geo, finance, salary, document, and legacy utility API documentation.',
  },
  routes: {
    nif: {
      title: 'NIF verification',
      description: 'Validate and normalize Angolan taxpayer details from the official public portal with a single GET request.',
    },
    translation: {
      title: 'Text translation',
      description: 'Translate application copy, customer messages, or support content with explicit source and target language handling.',
    },
    exchange: {
      title: 'Currency exchange',
      description: 'Look up base currency rates or pre-compute converted amounts from the same response envelope.',
    },
  },
  home: {
    eyebrow: 'ORB3X Utils API',
    title: 'APIs for Angola validation, geo, finance, salary, documents, and core utilities.',
    description: 'Use the docs to check request formats, response payloads, calculators, and upstream behavior across the current ORB3X Utils API surface.',
    primaryCta: 'Start with the docs',
    secondaryCta: 'View examples',
    quickRequestLabel: 'Quick request sample (cURL)',
    quickRequestNodeLabel: 'Quick request sample (Node.js)',
    stats: [
      { label: 'Published routes', value: '28' },
      { label: 'Response format', value: 'JSON' },
      { label: 'Cache policy', value: 'no-store' },
    ],
    notes: [
      {
        title: 'Shared response handling',
        description: 'Most routes return JSON and expose enough error detail to separate invalid input from upstream failures or assumption-driven calculation issues.',
      },
      {
        title: 'Live upstream data',
        description: 'The platform mixes deterministic local-data endpoints with a few upstream-backed routes, but all responses stay no-store to preserve freshness.',
      },
      {
        title: 'Route-level documentation',
        description: 'Each route family has a dedicated page covering request shape, response payload, assumptions, and common failure cases.',
      },
    ],
    ownershipLabel: 'Maintained by ORB3X',
    ownershipDescription: 'ORB3X Utils API is part of the broader ORB3X platform. The institutional company website lives at orb3x.com.',
    ownershipCta: 'Open orb3x.com',
    docs: {
      eyebrow: 'Documentation',
      title: 'Written like reference pages, not marketing copy.',
      description: 'The docs section covers shared behavior, route-specific payloads, and examples for each endpoint. Use it as the main entry point for implementation work.',
      bullets: [
        'Start with the route overview to understand shared status codes and caching rules.',
        'Use the dedicated endpoint pages for request fields, response examples, and integration notes.',
        'Keep the examples page open while wiring fetch helpers or smoke tests.',
      ],
      tableLabel: 'Documentation page',
      tableType: 'Type',
      tableTypeValue: 'Docs',
      open: 'Open',
    },
  },
  docsOverview: {
    navLabel: 'Overview',
    navDescription: 'Documentation index, conventions, and route map.',
    eyebrow: 'Documentation',
    title: 'Reference pages for the published route families.',
    description: 'Use these pages to check inputs, outputs, status codes, assumptions, and examples across validation, geo, finance, salary, time, documents, and legacy upstream endpoints.',
    primaryCta: 'Open getting started',
    secondaryCta: 'Open examples',
    stats: [
      { label: 'Docs pages', value: '14' },
      { label: 'Published routes', value: '28' },
      { label: 'Response format', value: 'JSON' },
    ],
    startHereTitle: 'Start here',
    startHereDescription: 'The pages below cover the shared rules first, then the request and response details for each route.',
    routesTitle: 'Routes',
    routesDescription: 'Each published route has a dedicated page with request examples and failure cases.',
    sharedBehaviorTitle: 'Shared behavior',
    sharedBehaviorDescription: 'These rules apply across the published endpoints and are the main things to account for in a shared client.',
    sharedBehaviorColumns: ['Concern', 'Behavior'],
    quickstartTitle: 'Quickstart',
    quickstartDescription: 'Run one request per route before you wire the endpoints into application code.',
    quickstartLabel: 'Smoke test sequence (cURL)',
    quickstartNodeLabel: 'Smoke test sequence (Node.js)',
    sharedBehaviorRows: [
      ['Request body', 'Most routes are query-driven GET endpoints. The document routes and `/api/translate` expect JSON bodies.'],
      ['Response freshness', 'Each route sends Cache-Control: no-store. Some endpoints are deterministic, while others depend on live upstream services.'],
      ['Error handling', 'Check HTTP status and the returned code field or error.code value before deciding whether to retry.'],
      ['Deployment profile', 'Handlers run on Node.js and are marked dynamic.'],
    ],
    versionLabel: 'Version',
    versionSelectorLabel: 'Select documentation version',
    versionCurrent: 'v1',
    versionLatest: 'Latest',
    versionDescription: 'Current stable API documentation for the `/api/v1` route surface.',
    onPageLabel: 'On this page',
    onPageItems: ['Start here', 'Routes', 'Shared behavior', 'Quickstart'],
    open: 'Open',
  },
  docsDetail: {
    endpoint: 'Endpoint',
    onPage: 'On this page',
    relatedPages: 'Related pages',
    open: 'Open',
  },
  docsPages: enDocsPages,
  faq: {
    eyebrow: 'FAQ',
    title: 'Questions about requests, response formats, and upstream behavior.',
    description: 'Common answers for teams integrating the Angola-focused ORB3X Utils API surface.',
    cards: [
      { label: 'Response format', value: 'JSON' },
      { label: 'Cache policy', value: 'no-store' },
      { label: 'Start with', value: 'Getting Started' },
    ],
    groups: [
      {
        title: 'Requests',
        items: [
          { question: 'What does this site document?', answer: 'The site documents the current ORB3X Utils API surface, including validation, phone, geo, calendar, finance, salary, time, documents, and the legacy NIF, translation, and exchange routes.' },
          { question: 'Do all routes return JSON?', answer: 'Most routes do, but the document endpoints return PDF files on success. Error responses still use JSON.' },
          { question: 'Which routes expect a request body?', answer: 'The document endpoints and `/api/translate` expect JSON bodies. Most of the other routes use query parameters.' },
        ],
      },
      {
        title: 'Caching and errors',
        items: [
          { question: 'Are responses cached?', answer: 'No. The route handlers return `Cache-Control: no-store` because the data comes from live upstream services.' },
          { question: 'What happens when an upstream provider times out?', answer: 'The route returns a timeout-related error code so your client can decide whether to retry or show a fallback state.' },
          { question: 'How should retries be handled?', answer: 'Retry only when the response indicates an upstream timeout or upstream availability problem. Do not retry validation errors.' },
        ],
      },
      {
        title: 'Route behavior',
        items: [
          { question: 'How current is the NIF data?', answer: 'The route returns whatever the public Angolan tax portal exposes at request time.' },
          { question: 'Which languages can the translation route accept?', answer: 'It accepts the language codes supported by the underlying translate endpoint, subject to the validation rules described in the docs.' },
          { question: 'Can the currency route return converted totals?', answer: 'Yes. Add an `amount` query parameter to receive both `unitRates` and `convertedRates` in the same response.' },
        ],
      },
      {
        title: 'Using the output',
        items: [
          { question: 'Should I store the returned data?', answer: 'That depends on your own product requirements. If a response affects an audit or business decision, store it together with your own context.' },
          { question: 'Where should I look first when debugging?', answer: 'Start with the API reference for shared status codes, then move to the dedicated route page for endpoint-specific request and response details.' },
          { question: 'Which pages should stay open while integrating?', answer: 'The getting started page, API reference, and examples page cover most integration work.' },
        ],
      },
    ],
    ctaTitle: 'Keep the reference pages close while integrating.',
    ctaDescription: 'The getting started guide covers shared behavior first, then the route pages cover the request and response details.',
    primaryCta: 'Open getting started',
    secondaryCta: 'Open API reference',
  },
  legal: {
    eyebrow: 'Legal',
    lastUpdated: 'Last updated',
    updatedOn: 'March 22, 2026',
    scope: 'Scope',
    appliesTo: 'Applies to',
    companySite: 'Company website',
    companySiteDescription: 'The publisher and company information for this API is available on the official ORB3X website.',
    companySiteCta: 'Open orb3x.com',
    privacy: {
      title: 'Privacy policy.',
      description: 'This page explains which categories of information may be processed when the site or API routes are used.',
      scopeValue: 'Website and API operations',
      sections: [
        {
          title: 'Information we process',
          paragraphs: [
            'We process the minimum information required to receive requests, operate the API, protect the service, and troubleshoot issues. Depending on the route, that may include path parameters, request payloads, response metadata, and technical diagnostics.',
            'Examples include taxpayer lookup identifiers, translation request text, base currency codes, request timestamps, IP-related telemetry, and structured application logs used for security and debugging.',
          ],
          bullets: [
            'Request content submitted to the API',
            'Metadata such as timestamps, route names, and response status',
            'Network and device signals used for security, debugging, and rate control',
          ],
        },
        {
          title: 'How the information is used',
          paragraphs: ['Information is used to execute the requested action, monitor availability, investigate incidents, and improve service quality.'],
          bullets: [
            'Return API responses',
            'Detect abuse, downtime, and malformed requests',
            'Investigate support requests and reproduce reported issues',
            'Generate aggregated internal metrics about usage and reliability',
          ],
        },
        {
          title: 'Third-party processing',
          paragraphs: [
            'Some routes depend on upstream providers, including public government services and third-party APIs. When those routes are called, relevant request data is sent to those providers to complete the request.',
            'Those providers operate under their own terms and privacy practices. Review those dependencies before using the service in regulated or high-sensitivity workflows.',
          ],
        },
        {
          title: 'Retention and security',
          paragraphs: [
            'Operational logs and support artifacts are retained only for as long as reasonably necessary to secure the service, investigate incidents, and satisfy legal or contractual obligations.',
            'We use administrative, technical, and organizational safeguards appropriate to the service, but no internet-facing system can guarantee absolute security.',
          ],
          bullets: [
            'Access controls for operational systems',
            'Environment separation for development and production',
            'Monitoring and incident response procedures',
          ],
        },
      ],
    },
    terms: {
      title: 'Terms of use.',
      description: 'These terms describe the general conditions for using the site, documentation, and published API routes.',
      appliesToValue: 'Website, docs, and API routes',
      sections: [
        {
          title: 'Acceptance and scope',
          paragraphs: [
            'By accessing or using the website or API routes, you agree to these terms and to any additional written commercial terms that may apply to your use of the service.',
            'These terms cover the public website, documentation, and published API endpoints. They do not automatically override any separate written agreement.',
          ],
        },
        {
          title: 'Permitted use',
          paragraphs: [
            'You may use the service to evaluate and integrate legitimate workflows that comply with applicable law and do not interfere with the availability or integrity of the platform.',
          ],
          bullets: [
            'Do not attempt unauthorized access, scraping beyond intended use, or abuse of upstream providers.',
            'Do not use the service for unlawful screening, discriminatory decision-making, or deceptive activity.',
            'Do not misrepresent the source or reliability of returned data to downstream users.',
          ],
        },
        {
          title: 'Service behavior and upstream dependencies',
          paragraphs: [
            'The service relies on third-party and public upstream systems for some responses. Availability, latency, and data completeness may therefore be affected by those dependencies.',
            'We may change internal implementation details over time, provided the published route behavior remains materially usable for documented integrations.',
          ],
        },
        {
          title: 'Output and customer responsibility',
          paragraphs: [
            'You are responsible for how you use the output returned by the service in your own products and workflows.',
            'Review critical actions carefully, especially when the underlying data comes from third-party systems.',
          ],
        },
      ],
    },
  },
  notFound: {
    eyebrow: '404',
    title: 'Page not found',
    description: 'The page you requested does not exist. Use one of the links below to return to the published documentation pages.',
    primaryCta: 'Go home',
    secondaryCta: 'Open docs',
    tertiaryCta: 'Visit FAQ',
  },
};

export type SiteCopy = typeof enSiteCopy;
