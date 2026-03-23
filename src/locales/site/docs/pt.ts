import type { DocsPageMap, DocsSection } from '@/lib/site-content';

function routeSection({
  id,
  title,
  description,
  params,
  usage,
  success,
  error,
  successLanguage = 'json',
  errorLanguage = 'json',
  bullets,
  note,
}: {
  id: string;
  title: string;
  description: string;
  params: string[][];
  usage: string;
  success: string;
  error: string;
  successLanguage?: 'bash' | 'json' | 'ts';
  errorLanguage?: 'bash' | 'json' | 'ts';
  bullets?: string[];
  note?: string;
}): DocsSection {
  return {
    id,
    title,
    description,
    table: {
      columns: ['Parâmetro', 'Obrigatório', 'Descrição'],
      rows: params,
    },
    codes: [
      { label: 'Uso', language: 'bash', content: usage },
      { label: 'Resposta 200', language: successLanguage, content: success },
      { label: 'Resposta de erro', language: errorLanguage, content: error },
    ],
    bullets,
    note,
  };
}

export const ptDocsPages: DocsPageMap = {
  'getting-started': {
    slug: 'getting-started',
    label: 'Primeiros Passos',
    description: 'Visão geral das famílias de rotas, convenções dos pedidos e notas de implementação.',
    eyebrow: 'Guia da Plataforma',
    title: 'Comece a usar as rotas publicadas da ORB3X Utils API.',
    intro:
      'A ORB3X Utils API agora combina as rotas originais de NIF, tradução e câmbio com utilitários angolanos de validação, telefone, morada, geo, calendário, finanças, salário, tempo e documentos. Todas as rotas são dinâmicas e usam no-store por omissão.',
    summaryCards: [
      { label: 'Runtime', value: 'Handlers Node.js' },
      { label: 'Política de cache', value: 'Respostas no-store' },
      { label: 'Estilos de endpoint', value: '24 GET, 4 POST' },
    ],
    sections: [
      {
        id: 'mental-model',
        title: 'Comece pelo modelo da plataforma',
        paragraphs: [
          'A maior parte dos novos endpoints usa datasets internos tipados, calculadoras ou normalizadores locais. As rotas legadas de NIF, tradução e câmbio continuam a depender de serviços externos.',
          'Essa distinção ajuda o desenho do cliente: endpoints locais são determinísticos e rápidos, enquanto rotas dependentes de upstream exigem maior atenção com retry, timeout e observabilidade.',
        ],
        bullets: [
          'Espere JSON tanto nas respostas de sucesso quanto nas de erro.',
          'Trate NIF, tradução e câmbio como respostas dinâmicas e sensíveis ao tempo.',
          'Trate saídas de salário, IVA e inflação como calculadoras baseadas em pressupostos e persista o ano ou taxa usados.',
          'Leia o código de erro retornado, não apenas o status HTTP, antes de definir retries.',
          'Normalize a entrada do seu utilizador antes de chamar os endpoints para evitar erros 400 desnecessários.',
        ],
      },
      {
        id: 'request-conventions',
        title: 'Convenções partilhadas dos pedidos',
        table: {
          columns: ['Aspeto', 'Comportamento'],
          rows: [
            ['Transporte', 'API HTTPS JSON pensada para consumidores no servidor e no browser.'],
            ['Cache', 'As respostas enviam Cache-Control: no-store para que as integrações leiam sempre o resultado atual.'],
            ['Perfil de timeout', 'Os handlers permitem até 30 segundos; apenas uma parte das rotas depende de upstream externo.'],
            ['Validação', 'Queries, parâmetros de caminho e corpos POST são sanitizados antes da lógica de negócio.'],
            ['Tratamento de erros', 'Falhas de validação retornam 4xx com error.code estável e orientado para máquinas.'],
          ],
        },
      },
      {
        id: 'first-calls',
        title: 'Faça um primeiro pedido bem-sucedido',
        description: 'Execute um pedido por rota antes de integrar os endpoints no código da aplicação.',
        code: {
          label: 'Smoke tests iniciais',
          language: 'bash',
          content: `curl -s "https://your-domain.com/api/v1/validate/iban?iban=AO06004000010123456789012"

curl -s "https://your-domain.com/api/v1/phone/validate?phone=%2B244923456789"

curl -s "https://your-domain.com/api/v1/finance/vat?amount=114000&inclusive=true"

curl -s -X POST https://your-domain.com/api/v1/documents/invoice \\
  -H "Content-Type: application/json" \\
  -d '{"seller":{"name":"Orb3x, Lda"},"buyer":{"name":"Cliente Exemplo"},"items":[{"description":"Servico","quantity":1,"unitPrice":100000,"vatRate":14}]}'`,
        },
        bullets: [
          'Verifique as rotas de documento no mesmo runtime que vai para produção, porque a geração de PDF corre no servidor.',
          'Registe request IDs e códigos de erro upstream nas rotas de NIF, tradução e câmbio.',
          'Crie guards em torno de saídas baseadas em pressupostos, como salário, inflação e disponibilidade do plano de numeração.',
        ],
      },
      {
        id: 'launch-checklist',
        title: 'Checklist para produção',
        bullets: [
          'Centralize a configuração do base URL para alternar entre staging e produção sem editar código.',
          'Capture respostas não-200 com logs estruturados contendo status HTTP, endpoint, código e contexto do pedido.',
          'Defina política de retry apenas para timeouts e indisponibilidade upstream; não repita erros de entrada inválida.',
          'Persista o ano ou a taxa usada quando saídas financeiras forem parar a faturas, payroll ou reporting.',
          'Valide os payloads POST para geração de documentos antes de enviar dados do utilizador para fluxos de persistência ou entrega.',
          'Mantenha um teste leve de contrato para cada endpoint no CI para detetar regressões de formato de resposta.',
        ],
        note:
          'Se for implementar apenas uma camada defensiva, faça-a baseada em códigos de erro. Essa é a forma mais simples de distinguir falhas repetíveis de pedidos inválidos.',
      },
    ],
    relatedSlugs: ['api-reference', 'validation', 'examples'],
  },
  'api-reference': {
    slug: 'api-reference',
    label: 'Referência da API',
    description: 'Comportamento canónico de pedido e resposta em toda a superfície publicada da API.',
    eyebrow: 'Referência',
    title: 'Referência para o comportamento partilhado de pedidos e respostas.',
    intro:
      'Esta referência resume as convenções partilhadas pela superfície atual de utilitários angolanos, incluindo validação, geo, finanças, salário, tempo e documentos, além das rotas legadas dependentes de upstream.',
    summaryCards: [
      { label: 'Endpoints publicados', value: '28' },
      { label: 'Formato de sucesso', value: 'Apenas JSON' },
      { label: 'Respostas binárias', value: 'PDF em documentos' },
    ],
    sections: [
      {
        id: 'catalog',
        title: 'Catálogo de endpoints',
        table: {
          columns: ['Rota', 'Método', 'Objetivo', 'Entrada principal'],
          rows: [
            ['/api/v1/validate/*', 'GET', 'Validar IBAN angolano e estrutura de conta bancária local.', 'Query iban ou account'],
            ['/api/v1/phone/*', 'GET', 'Fazer parse, validar e detetar operadora em números angolanos.', 'Query phone'],
            ['/api/v1/address/* + /api/v1/geo/*', 'GET', 'Normalizar moradas e consultar registos territoriais.', 'q, province, municipality, address'],
            ['/api/v1/calendar/*', 'GET', 'Retornar feriados e cálculos de dias úteis.', 'year, from/to, date/days'],
            ['/api/v1/finance/*', 'GET', 'Executar cálculos de IVA, fatura e inflação.', 'amount ou lines'],
            ['/api/v1/salary/*', 'GET', 'Estimar salário líquido, bruto e custo do empregador.', 'gross ou net'],
            ['/api/v1/time/*', 'GET', 'Ler hora local, converter fusos e validar horário comercial.', 'timezone, datetime, start/end'],
            ['/api/v1/documents/*', 'POST', 'Gerar PDFs de fatura, recibo e contrato.', 'Corpo JSON'],
            ['/api/nif/{nif}', 'GET', 'Consultar campos de identificação fiscal angolana.', 'Parâmetro de caminho NIF'],
            ['/api/translate', 'POST', 'Traduzir texto e retornar o idioma de origem detetado.', 'Corpo JSON: text, to, from opcional'],
            ['/api/exchange/{base}', 'GET', 'Retornar taxas de câmbio e, opcionalmente, aplicar amount.', 'Parâmetro base e query amount opcional'],
          ],
        },
      },
      {
        id: 'response-patterns',
        title: 'Padrões de resposta',
        paragraphs: [
          'Os payloads de sucesso são específicos por endpoint, mas mantêm-se planos e orientados para a aplicação. Endpoints calculadores devolvem também a base ou os pressupostos usados no cálculo.',
          'As rotas de documentos são a principal exceção: retornam PDFs binários com cabeçalhos de attachment. A maioria das outras rotas retorna JSON com envelope de erro quando algo falha.',
        ],
        code: {
          label: 'Resposta de erro típica',
          language: 'json',
          content: `{
  "error": {
    "code": "UPSTREAM_TIMEOUT",
    "message": "The currency service did not respond in time.",
    "baseCurrency": "AOA",
    "amount": "1000000"
  }
}`,
        },
      },
      {
        id: 'status-codes',
        title: 'Status codes e intenção',
        table: {
          columns: ['Status', 'Significado', 'Ação típica'],
          rows: [
            ['200', 'O pedido validado foi concluído com sucesso.', 'Use o payload diretamente.'],
            ['400', 'A entrada está ausente, malformada ou não é suportada.', 'Corrija o pedido; sem retry.'],
            ['404', 'O recurso pedido não foi encontrado no upstream.', 'Mostre um estado claro de não encontrado.'],
            ['502', 'O serviço upstream falhou ou retornou dados malformados.', 'Repita com backoff ou degrade graciosamente.'],
            ['504', 'A dependência upstream excedeu o timeout.', 'Repita se o fluxo do utilizador tolerar isso.'],
            ['500', 'Falha interna inesperada.', 'Registe, alerte e trate como repetível apenas se o UX permitir.'],
          ],
        },
      },
      {
        id: 'operational-notes',
        title: 'Notas operacionais',
        bullets: [
          'Todos os handlers de rota são marcados como dinâmicos, portanto não conte com respostas pré-renderizadas no build.',
          'Os pedidos legados dependentes de upstream definem explicitamente User-Agent para melhorar compatibilidade com serviços terceiros.',
          'A sanitização de entrada é conservadora: os parâmetros são limpos e normalizados antes do dispatch.',
          'As respostas de validação bancária incluem uma imagem-badge gerada para o banco detetado, útil para frontends sem biblioteca própria de logos.',
          'Os endpoints de documentos são síncronos; mantenha os payloads compactos e trate persistência ou distribuição no seu próprio sistema.',
        ],
      },
    ],
    relatedSlugs: ['getting-started', 'validation', 'examples'],
  },
  validation: {
    slug: 'validation',
    label: 'Validação',
    description: 'Validação de IBAN e conta bancária angolana com deteção do banco.',
    eyebrow: 'Categoria',
    title: 'Valide identificadores bancários angolanos e detete o banco emissor.',
    intro:
      'A família de validação cobre `/api/v1/validate/iban` e `/api/v1/validate/bank-account`. Ambas as rotas normalizam a entrada, detetam o banco pelo código bancário e devolvem uma imagem-badge gerada para uso em UI.',
    summaryCards: [
      { label: 'Rotas', value: '2 GET' },
      { label: 'Âmbito', value: 'Angola' },
      { label: 'Saída visual', value: 'Imagem do banco' },
    ],
    sections: [
      {
        id: 'routes',
        title: 'Rotas desta família',
        table: {
          columns: ['Rota', 'Objetivo', 'Query principal'],
          rows: [
            ['/api/v1/validate/iban', 'Validar IBANs AO com verificação mod-97 e lookup de banco.', 'iban'],
            ['/api/v1/validate/bank-account', 'Validar estruturas locais de 21 dígitos e derivar o IBAN correspondente.', 'account'],
          ],
        },
      },
      routeSection({
        id: 'validate-iban-route',
        title: 'GET /api/v1/validate/iban',
        description: 'Use esta rota quando já tiver um IBAN AO completo e precisar de partes normalizadas, metadados do banco e flags de validação.',
        params: [['iban', 'Sim', 'IBAN no formato AO. O handler remove separadores e converte o valor para maiúsculas antes da validação.']],
        usage: 'curl -s "https://your-domain.com/api/v1/validate/iban?iban=AO06004000010123456789012"',
        success: `{
  "isValid": true,
  "normalized": "AO06004000010123456789012",
  "formatted": "AO06 0040 0001 0123 4567 8901 2",
  "countryCode": "AO",
  "checkDigits": "06",
  "bank": {
    "code": "BAI",
    "ibanBankCode": "0040",
    "name": "Banco Angolano de Investimentos",
    "image": "data:image/svg+xml;base64,..."
  },
  "components": {
    "bankCode": "0040",
    "branchCode": "0001",
    "accountNumber": "01234567890",
    "controlDigits": "12"
  },
  "validation": {
    "countrySupported": true,
    "lengthValid": true,
    "bankCodeKnown": true,
    "mod97Valid": true
  }
}`,
        error: `{
  "error": {
    "code": "INVALID_IBAN",
    "message": "Angolan IBANs must contain exactly 25 characters.",
    "field": "iban",
    "length": 18
  }
}`,
        bullets: [
          'Verifique `validation.mod97Valid` e `validation.bankCodeKnown` quando precisar de estados de UI mais granulares.',
          'Use `bank.image` diretamente em cartões de verificação ou resumos de pagamento.',
        ],
      }),
      routeSection({
        id: 'validate-bank-account-route',
        title: 'GET /api/v1/validate/bank-account',
        description: 'Use esta rota para contas locais de 21 dígitos quando precisar de validação estrutural e do IBAN correspondente.',
        params: [['account', 'Sim', 'Conta bancária local angolana com 21 dígitos. Separadores não numéricos são ignorados.']],
        usage: 'curl -s "https://your-domain.com/api/v1/validate/bank-account?account=004000010123456789012"',
        success: `{
  "isValid": true,
  "normalized": "004000010123456789012",
  "formatted": "0040 0001 0123 4567 8901 2",
  "derivedIban": "AO06004000010123456789012",
  "bankRecognized": true,
  "bank": {
    "code": "BAI",
    "name": "Banco Angolano de Investimentos",
    "image": "data:image/svg+xml;base64,..."
  },
  "components": {
    "bankCode": "0040",
    "branchCode": "0001",
    "accountNumber": "01234567890",
    "controlDigits": "12"
  },
  "validation": {
    "formatValid": true,
    "bankCodeKnown": true,
    "controlDigitsPresent": true
  }
}`,
        error: `{
  "error": {
    "code": "INVALID_BANK_ACCOUNT",
    "message": "Angolan local bank account numbers must contain exactly 21 digits.",
    "field": "account",
    "length": 9
  }
}`,
        bullets: [
          'Trata-se de validação estrutural, não de confirmação de conta ativa na rede bancária.',
          'Persista a conta normalizada ou o IBAN derivado, não a entrada bruta do utilizador.',
        ],
      }),
    ],
    relatedSlugs: ['phone', 'finance', 'examples'],
  },
  phone: {
    slug: 'phone',
    label: 'Telefone',
    description: 'Parse, validação e classificação de números angolanos por operadora.',
    eyebrow: 'Categoria',
    title: 'Faça parse de números angolanos e classifique a faixa numérica.',
    intro:
      'As rotas de telefone normalizam entrada local ou internacional, separam país e número nacional e mapeiam prefixos móveis para Unitel, Africell ou Movicel quando a faixa é conhecida.',
    summaryCards: [
      { label: 'Rotas', value: '3 GET' },
      { label: 'Código do país', value: '+244' },
      { label: 'Modelo de disponibilidade', value: 'Plano de numeração' },
    ],
    sections: [
      {
        id: 'catalog',
        title: 'Rotas desta família',
        table: {
          columns: ['Rota', 'Objetivo', 'Query principal'],
          rows: [
            ['/api/v1/phone/parse', 'Retornar componentes e formatos estruturados do número.', 'phone'],
            ['/api/v1/phone/validate', 'Validar formato e reportar disponibilidade do plano numérico.', 'phone'],
            ['/api/v1/phone/operator', 'Detetar a operadora móvel a partir do prefixo.', 'phone'],
          ],
        },
      },
      routeSection({
        id: 'phone-parse-route',
        title: 'GET /api/v1/phone/parse',
        description: 'Use parse quando precisar de um número canónico e de formatações reutilizáveis para armazenamento ou UI.',
        params: [['phone', 'Sim', 'Número angolano local ou internacional, como `923456789` ou `+244923456789`.']],
        usage: 'curl -s "https://your-domain.com/api/v1/phone/parse?phone=%2B244923456789"',
        success: `{
  "normalized": "+244923456789",
  "countryCode": "+244",
  "nationalNumber": "923456789",
  "internationalFormat": "+244 923 456 789",
  "nationalFormat": "923 456 789",
  "isMobile": true,
  "type": "mobile",
  "prefix": "92",
  "subscriberNumber": "3456789",
  "operator": {
    "code": "UNITEL",
    "name": "Unitel",
    "prefix": "92",
    "prefixes": ["92", "93", "94"]
  }
}`,
        error: `{
  "error": {
    "code": "INVALID_PHONE",
    "message": "Angolan phone numbers must contain 9 national digits.",
    "field": "phone",
    "length": 6
  }
}`,
      }),
      routeSection({
        id: 'phone-validate-route',
        title: 'GET /api/v1/phone/validate',
        description: 'Use validate quando precisar de um resultado passa/falha juntamente com a disponibilidade do plano de numeração.',
        params: [['phone', 'Sim', 'Número angolano local ou internacional.']],
        usage: 'curl -s "https://your-domain.com/api/v1/phone/validate?phone=952345678"',
        success: `{
  "isValid": true,
  "normalized": "+244952345678",
  "type": "mobile",
  "operator": {
    "code": "AFRICELL",
    "name": "Africell",
    "prefix": "95",
    "prefixes": ["95"]
  },
  "availability": {
    "type": "numbering-plan",
    "status": "allocated-range",
    "canConfirmLiveSubscriber": false
  }
}`,
        error: `{
  "error": {
    "code": "INVALID_PHONE",
    "message": "The \\"phone\\" query parameter is required.",
    "field": "phone"
  }
}`,
        note: 'A disponibilidade é baseada em faixas conhecidas do plano numérico. Não confirma se o assinante está ativo.',
      }),
      routeSection({
        id: 'phone-operator-route',
        title: 'GET /api/v1/phone/operator',
        description: 'Use operator quando precisar apenas do lookup da operadora e não do restante payload do parse.',
        params: [['phone', 'Sim', 'Número angolano local ou internacional.']],
        usage: 'curl -s "https://your-domain.com/api/v1/phone/operator?phone=912345678"',
        success: `{
  "phone": "912345678",
  "operator": {
    "code": "MOVICEL",
    "name": "Movicel",
    "prefix": "91",
    "prefixes": ["91", "99"]
  }
}`,
        error: `{
  "error": {
    "code": "INVALID_PHONE",
    "message": "Angolan phone numbers must contain 9 national digits.",
    "field": "phone",
    "length": 4
  }
}`,
      }),
    ],
    relatedSlugs: ['validation', 'address-geo', 'examples'],
  },
  'address-geo': {
    slug: 'address-geo',
    label: 'Morada & Geo',
    description: 'Normalização de moradas angolanas e registo de províncias, municípios e comunas.',
    eyebrow: 'Categoria',
    title: 'Padronize moradas angolanas e consulte o registo territorial.',
    intro:
      'A normalização e sugestão de moradas é suportada por um registo geo curado de Angola. As rotas geo devolvem províncias, municípios e comunas para formulários e fluxos de autocomplete.',
    summaryCards: [
      { label: 'Rotas', value: '5 GET' },
      { label: 'Níveis geo', value: 'Província até comuna' },
      { label: 'Autocomplete', value: 'bairro + comuna + município' },
    ],
    sections: [
      {
        id: 'catalog',
        title: 'Rotas desta família',
        table: {
          columns: ['Rota', 'Objetivo', 'Query principal'],
          rows: [
            ['/api/v1/address/normalize', 'Limpar e estruturar uma morada angolana em texto livre.', 'address'],
            ['/api/v1/address/suggest', 'Sugerir bairros, comunas ou municípios.', 'q, type, province, municipality'],
            ['/api/v1/geo/provinces', 'Listar todas as províncias de Angola.', 'nenhuma'],
            ['/api/v1/geo/municipalities', 'Listar municípios, opcionalmente filtrados por província.', 'province'],
            ['/api/v1/geo/communes', 'Listar comunas de um município.', 'municipality, province opcional'],
          ],
        },
      },
      routeSection({
        id: 'address-normalize-route',
        title: 'GET /api/v1/address/normalize',
        description: 'Use normalize para limpar uma morada em texto livre antes de a persistir ou comparar com registos internos.',
        params: [['address', 'Sim', 'Morada angolana em texto livre. Abreviações comuns como `prov.` e `mun.` são expandidas automaticamente.']],
        usage: 'curl -s "https://your-domain.com/api/v1/address/normalize?address=Benfica,%20Luanda"',
        success: `{
  "input": "Benfica, Luanda",
  "normalized": "Benfica, Luanda",
  "components": {
    "bairro": "Benfica",
    "commune": "Benfica",
    "municipality": "Belas",
    "province": "Luanda"
  },
  "diagnostics": {
    "provinceMatched": true,
    "municipalityMatched": true,
    "communeMatched": true,
    "bairroMatched": true
  }
}`,
        error: `{
  "error": {
    "code": "INVALID_ADDRESS",
    "message": "The \\"address\\" query parameter is required.",
    "field": "address"
  }
}`,
      }),
      routeSection({
        id: 'address-suggest-route',
        title: 'GET /api/v1/address/suggest',
        description: 'Use suggest para alimentar autocomplete de bairros, comunas, municípios e províncias.',
        params: [
          ['q', 'Sim', 'Fragmento de pesquisa.'],
          ['type', 'Não', 'Filtro opcional: `bairro`, `commune`, `municipality` ou `province`.'],
          ['province', 'Não', 'Filtro opcional de província.'],
          ['municipality', 'Não', 'Filtro opcional de município.'],
          ['limit', 'Não', 'Máximo de sugestões a devolver.'],
        ],
        usage: 'curl -s "https://your-domain.com/api/v1/address/suggest?q=tal&type=municipality&province=Luanda"',
        success: `{
  "query": "tal",
  "suggestions": [
    {
      "type": "municipality",
      "label": "Talatona",
      "province": "Luanda",
      "municipality": "Talatona"
    }
  ]
}`,
        error: `{
  "error": {
    "code": "MISSING_QUERY_PARAMETER",
    "message": "The \\"q\\" query parameter is required.",
    "field": "q"
  }
}`,
      }),
      routeSection({
        id: 'geo-provinces-route',
        title: 'GET /api/v1/geo/provinces',
        description: 'Use provinces como feed de topo para seletores de localização e filtros administrativos.',
        params: [],
        usage: 'curl -s "https://your-domain.com/api/v1/geo/provinces"',
        success: `{
  "country": "AO",
  "countryName": "Angola",
  "provinces": [
    {
      "name": "Luanda",
      "slug": "luanda",
      "capital": "Luanda",
      "municipalityCount": 16
    }
  ]
}`,
        error: `{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Unexpected error while listing provinces."
  }
}`,
      }),
      routeSection({
        id: 'geo-municipalities-route',
        title: 'GET /api/v1/geo/municipalities',
        description: 'Use municipalities para alimentar seletores de segundo nível, com ou sem filtro por província.',
        params: [['province', 'Não', 'Nome da província usado para filtrar a lista.']],
        usage: 'curl -s "https://your-domain.com/api/v1/geo/municipalities?province=Luanda"',
        success: `{
  "province": "Luanda",
  "municipalities": [
    {
      "name": "Talatona",
      "slug": "talatona",
      "province": "Luanda",
      "communeCount": 2
    }
  ]
}`,
        error: `{
  "error": {
    "code": "PROVINCE_NOT_FOUND",
    "message": "No Angolan province matched the supplied query.",
    "field": "province",
    "value": "Atlantis"
  }
}`,
      }),
      routeSection({
        id: 'geo-communes-route',
        title: 'GET /api/v1/geo/communes',
        description: 'Use communes quando o município já estiver selecionado e precisar do próximo nível administrativo.',
        params: [
          ['municipality', 'Sim', 'Nome do município a expandir.'],
          ['province', 'Não', 'Nome da província para desambiguar municípios repetidos.'],
        ],
        usage: 'curl -s "https://your-domain.com/api/v1/geo/communes?municipality=Talatona&province=Luanda"',
        success: `{
  "municipality": "Talatona",
  "province": "Luanda",
  "coverage": "curated",
  "communes": [
    { "name": "Cidade Universitaria", "slug": "cidade-universitaria" },
    { "name": "Talatona", "slug": "talatona" }
  ]
}`,
        error: `{
  "error": {
    "code": "MISSING_QUERY_PARAMETER",
    "message": "The \\"municipality\\" query parameter is required.",
    "field": "municipality"
  }
}`,
        note: 'Alguns municípios usam detalhe curado de comunas, enquanto outros expõem apenas coverage seat-only.',
      }),
    ],
    relatedSlugs: ['phone', 'calendar', 'examples'],
  },
  calendar: {
    slug: 'calendar',
    label: 'Calendário',
    description: 'Feriados públicos angolanos e cálculos de dias úteis.',
    eyebrow: 'Categoria',
    title: 'Trabalhe com feriados, dias úteis e deslocamentos por dia útil.',
    intro:
      'A família de calendário devolve feriados fixos e móveis, além de cálculos de dias úteis úteis para payroll, faturação e planeamento.',
    summaryCards: [
      { label: 'Rotas', value: '3 GET' },
      { label: 'Modelo de feriado', value: 'Fixo + móvel' },
      { label: 'Uso central', value: 'Matemática de dias úteis' },
    ],
    sections: [
      {
        id: 'catalog',
        title: 'Rotas desta família',
        table: {
          columns: ['Rota', 'Objetivo', 'Query principal'],
          rows: [
            ['/api/v1/calendar/holidays', 'Retornar feriados públicos de um ano.', 'year'],
            ['/api/v1/calendar/working-days', 'Contar dias úteis entre duas datas.', 'from, to'],
            ['/api/v1/calendar/add-working-days', 'Mover uma data para frente ou para trás em dias úteis.', 'date, days'],
          ],
        },
      },
      routeSection({
        id: 'calendar-holidays-route',
        title: 'GET /api/v1/calendar/holidays',
        description: 'Use holidays para obter o calendário de feriados públicos suportado para um ano.',
        params: [['year', 'Não', 'Ano civil opcional. Por omissão usa o ano atual.']],
        usage: 'curl -s "https://your-domain.com/api/v1/calendar/holidays?year=2026"',
        success: `{
  "year": 2026,
  "holidays": [
    {
      "date": "2026-02-16",
      "name": "Carnival Holiday",
      "localName": "Tolerancia de Ponto de Carnaval",
      "category": "movable"
    },
    {
      "date": "2026-02-17",
      "name": "Carnival",
      "localName": "Carnaval",
      "category": "movable"
    }
  ]
}`,
        error: `{
  "error": {
    "code": "INVALID_YEAR",
    "message": "The \\"year\\" query parameter must be an integer between 2000 and 2100.",
    "field": "year",
    "value": 1800
  }
}`,
      }),
      routeSection({
        id: 'calendar-working-days-route',
        title: 'GET /api/v1/calendar/working-days',
        description: 'Use working-days para contar dias úteis entre duas datas, excluindo fins de semana e feriados suportados.',
        params: [
          ['from', 'Sim', 'Data inicial em `YYYY-MM-DD`.'],
          ['to', 'Sim', 'Data final em `YYYY-MM-DD`.'],
        ],
        usage: 'curl -s "https://your-domain.com/api/v1/calendar/working-days?from=2026-03-20&to=2026-03-24"',
        success: `{
  "from": "2026-03-20",
  "to": "2026-03-24",
  "workingDays": 2,
  "excludedWeekendDays": 2,
  "excludedHolidayDays": 1
}`,
        error: `{
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "The \\"from\\" date must be earlier than or equal to the \\"to\\" date.",
    "from": "2026-03-25",
    "to": "2026-03-24"
  }
}`,
      }),
      routeSection({
        id: 'calendar-add-working-days-route',
        title: 'GET /api/v1/calendar/add-working-days',
        description: 'Use add-working-days para deslocar uma data base para frente ou para trás segundo o calendário de dias úteis suportado.',
        params: [
          ['date', 'Sim', 'Data base em `YYYY-MM-DD`.'],
          ['days', 'Sim', 'Inteiro com o deslocamento em dias úteis.'],
        ],
        usage: 'curl -s "https://your-domain.com/api/v1/calendar/add-working-days?date=2026-03-20&days=1"',
        success: `{
  "inputDate": "2026-03-20",
  "days": 1,
  "resultDate": "2026-03-24",
  "direction": "forward"
}`,
        error: `{
  "error": {
    "code": "INVALID_INTEGER",
    "message": "The \\"days\\" query parameter must be an integer.",
    "field": "days",
    "value": "1.5"
  }
}`,
      }),
    ],
    relatedSlugs: ['time', 'finance', 'examples'],
  },
  finance: {
    slug: 'finance',
    label: 'Finanças',
    description: 'IVA, totais de fatura e ajustes por inflação em fluxos monetários angolanos.',
    eyebrow: 'Categoria',
    title: 'Calcule IVA, totais de fatura e valores ajustados pela inflação.',
    intro:
      'Os endpoints financeiros fornecem cálculos determinísticos para back-office, orçamentos e reporting. As respostas devolvem os valores derivados e a base usada para os obter.',
    summaryCards: [
      { label: 'Rotas', value: '3 GET' },
      { label: 'Moeda', value: 'AOA primeiro' },
      { label: 'Entrada de fatura', value: 'JSON na query' },
    ],
    sections: [
      {
        id: 'catalog',
        title: 'Rotas desta família',
        table: {
          columns: ['Rota', 'Objetivo', 'Query principal'],
          rows: [
            ['/api/v1/finance/vat', 'Separar ou compor totais com IVA.', 'amount, rate, inclusive'],
            ['/api/v1/finance/invoice-total', 'Calcular totais de fatura a partir de linhas.', 'lines, discount, discountType'],
            ['/api/v1/finance/inflation-adjust', 'Ajustar valores entre anos usando série CPI de Angola.', 'amount, from, to'],
          ],
        },
      },
      routeSection({
        id: 'finance-vat-route',
        title: 'GET /api/v1/finance/vat',
        description: 'Use VAT para separar totais com IVA incluído em líquido mais imposto ou para montar o bruto a partir do líquido.',
        params: [
          ['amount', 'Sim', 'Montante base a avaliar.'],
          ['rate', 'Não', 'Percentagem da taxa. Por omissão usa 14.'],
          ['inclusive', 'Não', 'Quando `true`, trata amount como valor com IVA incluído. Quando `false`, trata amount como líquido.'],
        ],
        usage: 'curl -s "https://your-domain.com/api/v1/finance/vat?amount=114000&inclusive=true"',
        success: `{
  "amount": 114000,
  "rate": 14,
  "inclusive": true,
  "netAmount": 100000,
  "vatAmount": 14000,
  "grossAmount": 114000
}`,
        error: `{
  "error": {
    "code": "INVALID_RATE",
    "message": "Tax rates must be between 0 and 100.",
    "field": "rate",
    "value": 140
  }
}`,
      }),
      routeSection({
        id: 'finance-invoice-total-route',
        title: 'GET /api/v1/finance/invoice-total',
        description: 'Use invoice-total para calcular totais de fatura a partir de linhas sem duplicar a matemática de pricing em cada cliente.',
        params: [
          ['lines', 'Sim', 'String JSON com array de linhas contendo `description`, `quantity`, `unitPrice` e `vatRate` opcional.'],
          ['discount', 'Não', 'Valor ou percentagem do desconto, conforme `discountType`.'],
          ['discountType', 'Não', 'Pode ser `amount` ou `percent`.'],
        ],
        usage: 'curl -s "https://your-domain.com/api/v1/finance/invoice-total?lines=%5B%7B%22description%22%3A%22Service%22%2C%22quantity%22%3A1%2C%22unitPrice%22%3A100000%2C%22vatRate%22%3A14%7D%5D&discount=10&discountType=percent"',
        success: `{
  "currency": "AOA",
  "discountType": "percent",
  "subtotal": 100000,
  "discountAmount": 10000,
  "taxableBase": 90000,
  "vatTotal": 12600,
  "grandTotal": 102600
}`,
        error: `{
  "error": {
    "code": "INVALID_JSON",
    "message": "The \\"lines\\" query parameter must be a valid JSON array.",
    "field": "lines"
  }
}`,
      }),
      routeSection({
        id: 'finance-inflation-route',
        title: 'GET /api/v1/finance/inflation-adjust',
        description: 'Use inflation-adjust para comparar valores nominais entre anos CPI suportados de Angola.',
        params: [
          ['amount', 'Sim', 'Montante nominal original.'],
          ['from', 'Sim', 'Data ou ano de origem. Os primeiros quatro dígitos definem o ano CPI.'],
          ['to', 'Sim', 'Data ou ano de destino. Os primeiros quatro dígitos definem o ano CPI.'],
        ],
        usage: 'curl -s "https://your-domain.com/api/v1/finance/inflation-adjust?amount=100000&from=2020-01-01&to=2025-01-01"',
        success: `{
  "currency": "AOA",
  "amount": 100000,
  "fromYear": 2020,
  "toYear": 2025,
  "inflationFactor": 2.5642,
  "adjustedAmount": 256420,
  "source": "Curated annual Angola CPI index series."
}`,
        error: `{
  "error": {
    "code": "UNSUPPORTED_CPI_YEAR",
    "message": "Inflation adjustment is available for Angola annual CPI years from 2019 through 2025.",
    "fromYear": 2010,
    "toYear": 2025
  }
}`,
        note: 'Persista sempre o intervalo de anos usado quando o valor ajustado entrar em reporting ou pricing.',
      }),
    ],
    relatedSlugs: ['salary', 'documents', 'examples'],
  },
  salary: {
    slug: 'salary',
    label: 'Salário',
    description: 'Estimativas de salário líquido, bruto e custo do empregador segundo pressupostos angolanos.',
    eyebrow: 'Categoria',
    title: 'Execute estimativas de payroll para visão do colaborador e do empregador.',
    intro:
      'A família de salário aplica pressupostos internos de payroll de Angola para segurança social do trabalhador, do empregador e tabelas de retenção suportadas por ano.',
    summaryCards: [
      { label: 'Rotas', value: '3 GET' },
      { label: 'Anos', value: '2025 e 2026' },
      { label: 'Saídas', value: 'Líquido, bruto, custo' },
    ],
    sections: [
      {
        id: 'catalog',
        title: 'Rotas desta família',
        table: {
          columns: ['Rota', 'Objetivo', 'Query principal'],
          rows: [
            ['/api/v1/salary/net', 'Estimar salário líquido a partir do bruto.', 'gross, year'],
            ['/api/v1/salary/gross', 'Estimar o bruto necessário para um líquido desejado.', 'net, year'],
            ['/api/v1/salary/employer-cost', 'Estimar o custo total do empregador.', 'gross, year'],
          ],
        },
      },
      routeSection({
        id: 'salary-net-route',
        title: 'GET /api/v1/salary/net',
        description: 'Use net quando o valor de partida é o salário bruto e precisa do líquido estimado.',
        params: [
          ['gross', 'Sim', 'Salário bruto mensal.'],
          ['year', 'Não', 'Ano fiscal suportado. Atualmente `2025` ou `2026`. Por omissão usa `2026`.'],
        ],
        usage: 'curl -s "https://your-domain.com/api/v1/salary/net?gross=500000&year=2026"',
        success: `{
  "currency": "AOA",
  "year": 2026,
  "grossSalary": 500000,
  "taxableIncome": 485000,
  "employeeSocialSecurity": 15000,
  "irtRate": 16,
  "irtTaxAmount": 52100,
  "netSalary": 432900,
  "employerContribution": 40000,
  "assumptions": ["Applies monthly employment-income withholding for Angola."]
}`,
        error: `{
  "error": {
    "code": "UNSUPPORTED_TAX_YEAR",
    "message": "Supported salary-tax years are 2025 and 2026.",
    "year": 2024
  }
}`,
      }),
      routeSection({
        id: 'salary-gross-route',
        title: 'GET /api/v1/salary/gross',
        description: 'Use gross quando o valor-alvo é o salário líquido e precisa do bruto aproximado necessário para o atingir.',
        params: [
          ['net', 'Sim', 'Salário líquido mensal desejado.'],
          ['year', 'Não', 'Ano fiscal suportado. Por omissão usa `2026`.'],
        ],
        usage: 'curl -s "https://your-domain.com/api/v1/salary/gross?net=432900&year=2026"',
        success: `{
  "currency": "AOA",
  "year": 2026,
  "targetNetSalary": 432900,
  "grossSalary": 500000,
  "employeeSocialSecurity": 15000,
  "irtTaxAmount": 52100,
  "netSalary": 432900
}`,
        error: `{
  "error": {
    "code": "INVALID_NUMBER",
    "message": "The \\"net\\" query parameter must be a non-negative number.",
    "field": "net",
    "value": "-1"
  }
}`,
      }),
      routeSection({
        id: 'salary-employer-cost-route',
        title: 'GET /api/v1/salary/employer-cost',
        description: 'Use employer-cost quando o planeamento de payroll precisa do custo da empresa em cima do bruto do trabalhador.',
        params: [
          ['gross', 'Sim', 'Salário bruto mensal.'],
          ['year', 'Não', 'Ano fiscal suportado. Por omissão usa `2026`.'],
        ],
        usage: 'curl -s "https://your-domain.com/api/v1/salary/employer-cost?gross=500000&year=2026"',
        success: `{
  "currency": "AOA",
  "year": 2026,
  "grossSalary": 500000,
  "employerContribution": 40000,
  "totalEmployerCost": 540000
}`,
        error: `{
  "error": {
    "code": "INVALID_NUMBER",
    "message": "The \\"gross\\" query parameter must be a non-negative number.",
    "field": "gross",
    "value": "abc"
  }
}`,
        note: 'Estes endpoints são calculadoras de cenário, não serviços de processamento salarial. Mostre os pressupostos na UI.',
      }),
    ],
    relatedSlugs: ['finance', 'time', 'examples'],
  },
  time: {
    slug: 'time',
    label: 'Tempo',
    description: 'Hora local atual, conversão de fusos e verificação de horário comercial.',
    eyebrow: 'Categoria',
    title: 'Trabalhe com fusos horários e verificações de horário comercial.',
    intro:
      'Os endpoints de tempo fornecem uma camada utilitária pequena de timezone sem obrigar a puxar uma plataforma completa de scheduling para a aplicação.',
    summaryCards: [
      { label: 'Rotas', value: '3 GET' },
      { label: 'Fuso por omissão', value: 'Africa/Luanda' },
      { label: 'Janela comercial', value: '08:00 a 17:00' },
    ],
    sections: [
      {
        id: 'catalog',
        title: 'Rotas desta família',
        table: {
          columns: ['Rota', 'Objetivo', 'Query principal'],
          rows: [
            ['/api/v1/time/now', 'Retornar a hora atual de um fuso.', 'timezone'],
            ['/api/v1/time/convert', 'Converter uma data/hora de um fuso para outro.', 'datetime, from, to'],
            ['/api/v1/time/business-hours', 'Verificar se uma data/hora cai dentro do horário comercial.', 'datetime, timezone, start, end'],
          ],
        },
      },
      routeSection({
        id: 'time-now-route',
        title: 'GET /api/v1/time/now',
        description: 'Use now quando precisar da hora local atual para um fuso IANA específico.',
        params: [['timezone', 'Não', 'Timezone IANA. Por omissão usa `Africa/Luanda`.']],
        usage: 'curl -s "https://your-domain.com/api/v1/time/now?timezone=Africa/Luanda"',
        success: `{
  "iso": "2026-03-23T18:45:00",
  "timezone": "Africa/Luanda",
  "offset": "GMT+1",
  "components": {
    "year": 2026,
    "month": 3,
    "day": 23,
    "hour": 18,
    "minute": 45,
    "second": 0,
    "weekday": 1
  }
}`,
        error: `{
  "error": {
    "code": "INVALID_TIMEZONE",
    "message": "The supplied timezone is not supported by the runtime.",
    "field": "timezone",
    "value": "Mars/Base"
  }
}`,
      }),
      routeSection({
        id: 'time-convert-route',
        title: 'GET /api/v1/time/convert',
        description: 'Use convert para transformar uma data/hora local ou absoluta de um fuso para outro.',
        params: [
          ['datetime', 'Sim', 'Data/hora ISO. Sem offset, a rota interpreta-a no fuso de origem.'],
          ['from', 'Sim', 'Timezone IANA de origem.'],
          ['to', 'Sim', 'Timezone IANA de destino.'],
        ],
        usage: 'curl -s "https://your-domain.com/api/v1/time/convert?datetime=2026-03-23T10:00:00&from=Africa/Luanda&to=UTC"',
        success: `{
  "input": {
    "datetime": "2026-03-23T10:00:00",
    "timezone": "Africa/Luanda"
  },
  "source": {
    "iso": "2026-03-23T10:00:00",
    "timezone": "Africa/Luanda"
  },
  "target": {
    "iso": "2026-03-23T09:00:00",
    "timezone": "UTC"
  }
}`,
        error: `{
  "error": {
    "code": "INVALID_DATETIME",
    "message": "Date-times without an offset must use YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss format.",
    "field": "datetime",
    "value": "23/03/2026 10:00"
  }
}`,
      }),
      routeSection({
        id: 'time-business-hours-route',
        title: 'GET /api/v1/time/business-hours',
        description: 'Use business-hours antes de enviar notificações, chamadas ou lembretes que devem respeitar a janela local de trabalho.',
        params: [
          ['datetime', 'Sim', 'Data/hora ISO a avaliar.'],
          ['timezone', 'Não', 'Timezone IANA. Por omissão usa `Africa/Luanda`.'],
          ['start', 'Não', 'Início do horário comercial em `HH:mm`. Por omissão `08:00`.'],
          ['end', 'Não', 'Fim do horário comercial em `HH:mm`. Por omissão `17:00`.'],
        ],
        usage: 'curl -s "https://your-domain.com/api/v1/time/business-hours?datetime=2026-03-23T09:30:00&timezone=Africa/Luanda"',
        success: `{
  "timezone": "Africa/Luanda",
  "businessHours": {
    "start": "08:00",
    "end": "17:00",
    "timezone": "Africa/Luanda"
  },
  "isBusinessDay": true,
  "isWithinBusinessHours": true
}`,
        error: `{
  "error": {
    "code": "INVALID_TIME",
    "message": "The \\"start\\" query parameter must use HH:mm format.",
    "field": "start",
    "value": "8am"
  }
}`,
      }),
    ],
    relatedSlugs: ['calendar', 'documents', 'examples'],
  },
  documents: {
    slug: 'documents',
    label: 'Documentos',
    description: 'Geração de PDFs de fatura, recibo e contrato a partir de JSON.',
    eyebrow: 'Categoria',
    title: 'Gere PDFs transacionais e contratuais on demand.',
    intro:
      'As rotas de documentos convertem payloads JSON compactos em PDFs síncronos, prontos para download direto ou armazenamento pela sua aplicação.',
    summaryCards: [
      { label: 'Rotas', value: '3 POST' },
      { label: 'Formato', value: 'PDF attachment' },
      { label: 'Melhor uso', value: 'Workflows internos' },
    ],
    sections: [
      {
        id: 'catalog',
        title: 'Rotas desta família',
        table: {
          columns: ['Rota', 'Objetivo', 'Campos principais'],
          rows: [
            ['/api/v1/documents/invoice', 'Gerar PDF de fatura.', 'seller, buyer, items'],
            ['/api/v1/documents/receipt', 'Gerar PDF de recibo.', 'receivedFrom, amount'],
            ['/api/v1/documents/contract', 'Gerar PDF de contrato.', 'parties, clauses'],
          ],
        },
      },
      routeSection({
        id: 'documents-invoice-route',
        title: 'POST /api/v1/documents/invoice',
        description: 'Use invoice quando precisar de um PDF de fatura síncrono a partir de um payload JSON compacto.',
        params: [
          ['seller', 'Sim', 'Objeto do vendedor com pelo menos `name`.'],
          ['buyer', 'Sim', 'Objeto do comprador com pelo menos `name`.'],
          ['items', 'Sim', 'Array de itens com `description`, `quantity`, `unitPrice` e `vatRate` opcional.'],
          ['invoiceNumber / issueDate / dueDate / notes', 'Não', 'Campos opcionais de metadados da fatura.'],
        ],
        usage: `curl -s -X POST https://your-domain.com/api/v1/documents/invoice \\
  -H "Content-Type: application/json" \\
  -d '{"seller":{"name":"Orb3x, Lda"},"buyer":{"name":"Cliente Exemplo"},"items":[{"description":"Service","quantity":1,"unitPrice":100000,"vatRate":14}]}' \\
  --output invoice.pdf`,
        success: `HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="invoice.pdf"`,
        error: `{
  "error": {
    "code": "INVALID_INVOICE_PAYLOAD",
    "message": "Invoice payload must include seller, buyer, and at least one item."
  }
}`,
        successLanguage: 'bash',
      }),
      routeSection({
        id: 'documents-receipt-route',
        title: 'POST /api/v1/documents/receipt',
        description: 'Use receipt para comprovativos de pagamento que precisam apenas do pagador e do montante.',
        params: [
          ['receivedFrom', 'Sim', 'Objeto da parte pagadora com pelo menos `name`.'],
          ['amount', 'Sim', 'Montante recebido.'],
          ['receiptNumber / issueDate / reason / paymentMethod / notes', 'Não', 'Campos opcionais de metadados do recibo.'],
        ],
        usage: `curl -s -X POST https://your-domain.com/api/v1/documents/receipt \\
  -H "Content-Type: application/json" \\
  -d '{"receivedFrom":{"name":"Cliente Exemplo"},"amount":100000}' \\
  --output receipt.pdf`,
        success: `HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="receipt.pdf"`,
        error: `{
  "error": {
    "code": "INVALID_RECEIPT_PAYLOAD",
    "message": "Receipt payload must include receivedFrom and amount."
  }
}`,
        successLanguage: 'bash',
      }),
      routeSection({
        id: 'documents-contract-route',
        title: 'POST /api/v1/documents/contract',
        description: 'Use contract quando precisar de um PDF básico de acordo gerado a partir de partes e cláusulas.',
        params: [
          ['parties', 'Sim', 'Array com pelo menos dois objetos de partes.'],
          ['clauses', 'Sim', 'Array de cláusulas do contrato.'],
          ['title / contractNumber / issueDate / notes', 'Não', 'Campos opcionais de metadados do contrato.'],
        ],
        usage: `curl -s -X POST https://your-domain.com/api/v1/documents/contract \\
  -H "Content-Type: application/json" \\
  -d '{"parties":[{"name":"Orb3x, Lda"},{"name":"Cliente Exemplo"}],"clauses":["The provider delivers the service.","The client pays within 15 days."]}' \\
  --output contract.pdf`,
        success: `HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="contract.pdf"`,
        error: `{
  "error": {
    "code": "INVALID_CONTRACT_PAYLOAD",
    "message": "Contract payload must include at least two parties and one clause."
  }
}`,
        successLanguage: 'bash',
        note: 'A geração de documentos é estreita por design. Persista o JSON de origem no seu sistema se precisar de auditoria ou regeneração.',
      }),
    ],
    relatedSlugs: ['finance', 'validation', 'examples'],
  },
  'nif-verification': {
    slug: 'nif-verification',
    label: 'Verificação de NIF',
    description: 'Comportamento da consulta, campos do payload e modos de falha da verificação fiscal.',
    eyebrow: 'Endpoint',
    title: 'Consulte dados do contribuinte a partir de um NIF normalizado.',
    intro:
      'A rota de NIF recebe um identificador fiscal angolano no caminho, valida o valor, consulta o portal fiscal público e devolve uma resposta JSON processada.',
    endpoint: {
      method: 'GET',
      path: '/api/nif/{nif}',
      detail: 'O parâmetro do caminho é limpo, convertido para maiúsculas e limitado a letras e dígitos antes da tentativa de consulta.',
    },
    summaryCards: [
      { label: 'Tipo de entrada', value: 'Parâmetro de caminho' },
      { label: 'Origem upstream', value: 'Portal fiscal angolano' },
      { label: 'Falha principal', value: 'Disponibilidade do portal' },
    ],
    sections: [
      {
        id: 'success-shape',
        title: 'Payload de sucesso',
        code: {
          label: 'Resposta 200',
          language: 'json',
          content: `{
  "NIF": "004813023LA040",
  "Name": "EMPRESA EXEMPLO, LDA",
  "Type": "Pessoa Colectiva",
  "Status": "Activo",
  "Defaulting": "Não",
  "VATRegime": "Regime Geral",
  "isTaxResident": true
}`,
        },
      },
      {
        id: 'field-glossary',
        title: 'Campos retornados',
        table: {
          columns: ['Campo', 'Significado'],
          rows: [
            ['NIF', 'Identificador normalizado usado na consulta e devolvido na resposta.'],
            ['Name', 'Nome registado do contribuinte extraído da resposta do portal.'],
            ['Type', 'Classificação do contribuinte retornada pelo portal de origem.'],
            ['Status', 'Texto do estado atual do contribuinte.'],
            ['Defaulting', 'Indica se o contribuinte está marcado como inadimplente.'],
            ['VATRegime', 'Texto do regime de IVA retornado pelo portal.'],
            ['isTaxResident', 'Booleano derivado do marcador de residente ou não residente na secção de resultados.'],
          ],
        },
      },
      {
        id: 'error-cases',
        title: 'O que pode falhar',
        bullets: [
          'Um parâmetro de caminho vazio ou inválido retorna um erro 400 INVALID_NIF antes de qualquer chamada upstream.',
          'Se o portal fiscal não encontrar resultados, a rota retorna 404 com NIF_NOT_FOUND.',
          'HTML malformado ou estruturalmente alterado no portal retorna 502 com UNPARSEABLE_RESPONSE.',
          'Problemas de rede e TLS são expostos como falhas de disponibilidade upstream, com fallback interno para alguns cenários de certificado.',
        ],
        note:
          'Como a origem upstream é HTML, mudanças de schema no portal são o principal risco de manutenção a longo prazo. Mantenha um teste de contrato em torno do parser.',
      },
      {
        id: 'integration-tips',
        title: 'Dicas de integração',
        bullets: [
          'Normalize espaços e capitalização dos identificadores introduzidos pelo utilizador antes de compor a rota.',
          'Trate este endpoint como verificação ao vivo e não como fonte permanente de registo; os dados do portal podem mudar com o tempo.',
          'Guarde o resultado bruto da consulta juntamente com o contexto de auditoria quando a resposta afetar ações de compliance.',
          'Mostre mensagens claras quando o portal estiver temporariamente indisponível em vez de transformar falhas upstream em erros genéricos de validação.',
        ],
      },
    ],
    relatedSlugs: ['api-reference', 'getting-started', 'examples'],
  },
  translation: {
    slug: 'translation',
    label: 'Tradução',
    description: 'Regras do corpo do pedido, tratamento de idiomas e orientação prática de integração.',
    eyebrow: 'Endpoint',
    title: 'Traduza texto com validação explícita e reporte do idioma de origem.',
    intro:
      'A rota de tradução aceita entrada JSON, valida códigos de idioma, chama o endpoint público do Google Translate e retorna o texto traduzido com o idioma de origem detetado ou informado.',
    endpoint: {
      method: 'POST',
      path: '/api/translate',
      detail: 'Envie JSON com text, código do idioma de destino e um código de origem opcional. Se from for omitido, a rota usa deteção automática.',
    },
    summaryCards: [
      { label: 'Tipo de entrada', value: 'Corpo JSON' },
      { label: 'Validação do destino', value: '2-12 caracteres' },
      { label: 'Deteção automática', value: 'Ativa por omissão' },
    ],
    sections: [
      {
        id: 'request-shape',
        title: 'Payload do pedido',
        code: {
          label: 'Corpo POST',
          language: 'json',
          content: `{
  "text": "Olá mundo",
  "to": "en",
  "from": "pt"
}`,
        },
        bullets: [
          'text é obrigatório e é limpo antes do dispatch.',
          'to é obrigatório e deve seguir um padrão simples de código de idioma em minúsculas.',
          'from é opcional; quando ausente, a rota usa deteção automática no upstream.',
          'JSON inválido retorna 400 antes de qualquer trabalho de tradução começar.',
        ],
      },
      {
        id: 'success-shape',
        title: 'Payload de sucesso',
        code: {
          label: 'Resposta 200',
          language: 'json',
          content: `{
  "translatedText": "Hello world",
  "sourceLanguage": "pt",
  "targetLanguage": "en",
  "status": true,
  "message": ""
}`,
        },
      },
      {
        id: 'failure-modes',
        title: 'Modos de falha comuns',
        table: {
          columns: ['Código', 'Causa', 'Tratamento sugerido'],
          rows: [
            ['INVALID_TEXT', 'O campo text está ausente ou vazio.', 'Bloqueie o envio e peça conteúdo ao utilizador.'],
            ['INVALID_LANGUAGE', 'O código do idioma de origem ou destino está ausente ou malformado.', 'Corrija o payload antes de repetir.'],
            ['UPSTREAM_TIMEOUT', 'O fornecedor de tradução excedeu a janela de timeout.', 'Repita com backoff se o fluxo permitir.'],
            ['UPSTREAM_BAD_RESPONSE', 'O fornecedor retornou uma resposta não-200.', 'Degrade graciosamente ou coloque em fila para retry.'],
            ['UNPARSEABLE_RESPONSE', 'O JSON do fornecedor não pôde ser convertido em texto traduzido.', 'Alerte e use o texto original como fallback.'],
          ],
        },
      },
      {
        id: 'best-practices',
        title: 'Notas de utilização',
        bullets: [
          'Preserve o texto original no seu modelo de dados para que editores possam comparar a origem com a tradução depois.',
          'Faça cache das traduções bem-sucedidas do seu lado quando a reutilização for aceitável; a rota em si não faz cache intencionalmente.',
          'Prefira códigos de idioma de origem explícitos em workflows em lote quando já sabe o idioma da entrada.',
          'Use sourceLanguage da resposta para sinalizar deteções inesperadas em ferramentas de moderação ou suporte.',
        ],
      },
    ],
    relatedSlugs: ['api-reference', 'examples', 'currency-exchange'],
  },
  'currency-exchange': {
    slug: 'currency-exchange',
    label: 'Câmbio',
    description: 'Consulta de taxas base, conversão por montante e semântica do payload cambial.',
    eyebrow: 'Endpoint',
    title: 'Retorne taxas unitárias ou totais convertidos a partir do mesmo endpoint.',
    intro:
      'A rota de câmbio consulta metadados e tabelas de taxas para uma moeda base e, opcionalmente, multiplica essas taxas por um valor passado na query.',
    endpoint: {
      method: 'GET',
      path: '/api/exchange/{base}',
      detail: 'O parâmetro de caminho identifica a moeda base. Adicione ?amount=valor quando também quiser convertedRates pré-calculados na resposta.',
    },
    summaryCards: [
      { label: 'Tipo de entrada', value: 'Caminho + query' },
      { label: 'Saída expandida', value: 'convertedRates' },
      { label: 'Risco principal', value: 'Atualização upstream' },
    ],
    sections: [
      {
        id: 'lookup-shape',
        title: 'Payload de sucesso sem amount',
        code: {
          label: 'Consulta de taxa unitária',
          language: 'json',
          content: `{
  "currencyCode": "aoa",
  "currencyName": "Angolan kwanza",
  "currencySymbol": "Kz",
  "countryName": "Angola",
  "countryCode": "AO",
  "flagImage": "https://example.com/flags/ao.png",
  "ratesDate": "2026-03-22",
  "baseCurrency": "AOA",
  "unitRates": {
    "usd": 0.0011,
    "eur": 0.0010
  }
}`,
        },
      },
      {
        id: 'conversion-shape',
        title: 'Payload de sucesso com amount',
        code: {
          label: 'Consulta com conversão',
          language: 'json',
          content: `{
  "baseCurrency": "AOA",
  "amount": 1000000,
  "unitRates": {
    "usd": 0.0011
  },
  "convertedRates": {
    "usd": 1100
  }
}`,
        },
        bullets: [
          'amount é convertido para número e deve ser zero ou maior.',
          'convertedRates replica as chaves de unitRates e multiplica cada valor por amount.',
          'baseCurrency é normalizada para maiúsculas na resposta, mesmo que a rota aceite entrada em minúsculas.',
        ],
      },
      {
        id: 'metadata',
        title: 'Campos de metadados',
        table: {
          columns: ['Campo', 'Significado'],
          rows: [
            ['currencyCode', 'Código da moeda base normalizado a partir da resposta upstream.'],
            ['currencyName', 'Nome de apresentação da moeda base.'],
            ['currencySymbol', 'Símbolo associado à moeda base.'],
            ['countryName / countryCode', 'Metadados do país ligados à moeda base.'],
            ['flagImage', 'URL do ativo de bandeira retornado pelo fornecedor upstream.'],
            ['ratesDate', 'Data associada ao snapshot de taxas upstream.'],
          ],
        },
      },
      {
        id: 'implementation-guidance',
        title: 'Orientação de implementação',
        bullets: [
          'Use unitRates quando precisar de controlo total sobre formatação, arredondamento ou cálculos de negócio downstream.',
          'Use convertedRates quando o endpoint alimentar diretamente a UI e quiser evitar matemática duplicada entre clientes.',
          'Proteja a UI contra moedas ausentes, porque o fornecedor upstream pode não incluir todos os códigos em todos os snapshots.',
          'Se persistir totais convertidos, persista também ratesDate para manter relatórios auditáveis.',
        ],
      },
    ],
    relatedSlugs: ['api-reference', 'examples', 'translation'],
  },
  examples: {
    slug: 'examples',
    label: 'Exemplos',
    description: 'Exemplos práticos em cURL e TypeScript para uso próximo de produção.',
    eyebrow: 'Implementação',
    title: 'Exemplos para chamar as rotas publicadas.',
    intro:
      'Os snippets abaixo mostram pedidos em cURL e um helper tipado em TypeScript para as rotas publicadas neste repositório.',
    summaryCards: [
      { label: 'Formatos', value: 'cURL + TypeScript' },
      { label: 'Foco do cliente', value: 'fetch no servidor' },
      { label: 'Estratégia de erro', value: 'Tratamento por código' },
    ],
    sections: [
      {
        id: 'curl',
        title: 'Exemplos em cURL',
        code: {
          label: 'Smoke tests no terminal',
          language: 'bash',
          content: `curl -s https://your-domain.com/api/nif/004813023LA040

curl -s -X POST https://your-domain.com/api/translate \\
  -H "Content-Type: application/json" \\
  -d '{"text":"Preciso de ajuda","to":"en"}'

curl -s "https://your-domain.com/api/exchange/aoa?amount=250000"`,
        },
      },
      {
        id: 'typescript',
        title: 'Helper TypeScript tipado',
        code: {
          label: 'Utilitário de cliente partilhado',
          language: 'ts',
          content: `type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
  code?: string;
  message?: string;
};

export async function callApi<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(error.error?.code ?? error.code ?? "REQUEST_FAILED");
  }

  return (await response.json()) as T;
}`,
        },
      },
      {
        id: 'workflow-patterns',
        title: 'Padrões de workflow',
        bullets: [
          'Onboarding de clientes: verifique o registo fiscal antes de ativar uma conta no fluxo de back-office.',
          'Pipeline de localização: traduza conteúdo virado ao utilizador e armazene tanto o texto traduzido quanto o idioma de origem detetado.',
          'Dashboard de preços: peça taxas base uma vez e depois use unitRates ou convertedRates conforme o nível de controlo necessário na UI.',
          'Ferramentas de suporte: mostre códigos de erro upstream para que agentes internos distingam rapidamente entrada inválida de indisponibilidade do fornecedor.',
        ],
      },
      {
        id: 'production-hardening',
        title: 'Endurecimento para produção',
        bullets: [
          'Envolva as chamadas num cliente partilhado com formatos de sucesso e erro tipados.',
          'Emita métricas separadas para timeout, má resposta, não encontrado e taxa de entrada inválida.',
          'Mantenha a lógica de retry perto da fronteira do cliente para que o código do produto não a reimplemente por funcionalidade.',
          'Registe ratesDate e sourceLanguage quando esses campos forem importantes para auditoria ou revisão editorial.',
        ],
      },
    ],
    relatedSlugs: ['getting-started', 'api-reference', 'translation'],
  },
};
