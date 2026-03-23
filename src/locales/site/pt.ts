import { ptDocsPages } from './docs/pt';

export const ptSiteCopy = {
  languageName: 'Português',
  languages: {
    en: 'English',
    pt: 'Português',
  },
  metadata: {
    title: 'ORB3X Utils API - Verificação Fiscal, Tradução e Câmbio',
    description: 'Documentação das rotas da ORB3X Utils API para validação angolana, geo, finanças, payroll, documentos e utilitários legados.',
    keywords: [
      'API',
      'verificação fiscal',
      'tradução',
      'câmbio',
      'NIF',
      'ferramentas para programadores',
      'Angola',
      'taxas de câmbio',
    ],
    openGraphTitle: 'ORB3X Utils API',
    openGraphDescription: 'Documentação para validação angolana, geo, finanças, payroll, documentos e rotas legadas.',
  },
  brand: {
    homeAriaLabel: 'Página inicial da ORB3X Utils API',
  },
  header: {
    themeToDark: 'Mudar para o tema escuro',
    themeToLight: 'Mudar para o tema claro',
    language: 'Idioma',
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    navigation: 'Navegação',
  },
  navigation: {
    docs: 'Docs',
    apiReference: 'Referência da API',
    examples: 'Exemplos',
    faq: 'FAQ',
    privacy: 'Privacidade',
  },
  footer: {
    description: 'Documentação e páginas de referência para as famílias de rotas angolanas da ORB3X Utils API.',
    explore: 'Explorar',
    documentation: 'Documentação',
    policies: 'Políticas',
    privacy: 'Política de Privacidade',
    terms: 'Termos de Uso',
    faq: 'FAQ',
    copyright: '© 2026 ORB3X Utils API. Todos os direitos reservados.',
    tagline: 'Documentação de validação, geo, finanças, salário, documentos e utilitários legados.',
  },
  routes: {
    nif: {
      title: 'Verificação de NIF',
      description: 'Valide e normalize dados de contribuintes angolanos a partir do portal público oficial com um único pedido GET.',
    },
    translation: {
      title: 'Tradução de texto',
      description: 'Traduza conteúdo de aplicação, mensagens de clientes e textos de suporte com controlo explícito do idioma de origem e destino.',
    },
    exchange: {
      title: 'Câmbio',
      description: 'Consulte taxas base de moeda e calcule montantes convertidos a partir da mesma resposta.',
    },
  },
  home: {
    eyebrow: 'ORB3X Utils API',
    title: 'APIs para validação angolana, geo, finanças, salário, documentos e utilitários centrais.',
    description: 'Use a documentação para verificar formatos de pedido, payloads de resposta, calculadoras e comportamento upstream em toda a superfície atual da ORB3X Utils API.',
    primaryCta: 'Começar pela documentação',
    secondaryCta: 'Ver exemplos',
    quickRequestLabel: 'Exemplo rápido de pedido',
    stats: [
      { label: 'Rotas publicadas', value: '28' },
      { label: 'Formato de resposta', value: 'JSON' },
      { label: 'Política de cache', value: 'no-store' },
    ],
    notes: [
      {
        title: 'Tratamento comum de respostas',
        description: 'A maioria das rotas retorna JSON e expõe detalhe suficiente para separar entrada inválida de falhas upstream ou de pressupostos de cálculo.',
      },
      {
        title: 'Dados externos ao vivo',
        description: 'A plataforma mistura endpoints locais determinísticos com algumas rotas dependentes de upstream, mas todas as respostas permanecem no-store para manter frescura.',
      },
      {
        title: 'Documentação por rota',
        description: 'Cada família de rotas tem uma página dedicada com formato do pedido, payload de resposta, pressupostos e casos de falha comuns.',
      },
    ],
    docs: {
      eyebrow: 'Documentação',
      title: 'Escrito como páginas de referência, não como marketing.',
      description: 'A secção de documentação cobre comportamento partilhado, payloads por rota e exemplos de integração. Use-a como ponto principal para implementação.',
      bullets: [
        'Comece pela visão geral das rotas para entender códigos de estado e regras de cache.',
        'Use as páginas dedicadas para campos de pedido, exemplos de resposta e notas de integração.',
        'Mantenha a página de exemplos aberta enquanto monta helpers de fetch ou smoke tests.',
      ],
      tableLabel: 'Página de documentação',
      tableType: 'Tipo',
      tableTypeValue: 'Docs',
      open: 'Abrir',
    },
  },
  docsOverview: {
    navLabel: 'Visão geral',
    navDescription: 'Índice da documentação, convenções e mapa de rotas.',
    eyebrow: 'Documentação',
    title: 'Páginas de referência para as famílias de rotas publicadas.',
    description: 'Use estas páginas para consultar entradas, saídas, códigos de estado, pressupostos e exemplos em validação, geo, finanças, salário, tempo, documentos e rotas legadas.',
    primaryCta: 'Abrir primeiros passos',
    secondaryCta: 'Abrir exemplos',
    stats: [
      { label: 'Páginas de docs', value: '14' },
      { label: 'Rotas publicadas', value: '28' },
      { label: 'Formato de resposta', value: 'JSON' },
    ],
    startHereTitle: 'Comece aqui',
    startHereDescription: 'As páginas abaixo cobrem primeiro as regras partilhadas e depois os detalhes de pedido e resposta de cada rota.',
    routesTitle: 'Rotas',
    routesDescription: 'Cada rota publicada tem uma página dedicada com exemplos de pedido e casos de falha.',
    sharedBehaviorTitle: 'Comportamento partilhado',
    sharedBehaviorDescription: 'Estas regras aplicam-se a todos os endpoints publicados e são as principais considerações para um cliente comum.',
    sharedBehaviorColumns: ['Aspeto', 'Comportamento'],
    quickstartTitle: 'Arranque rápido',
    quickstartDescription: 'Execute um pedido por rota antes de ligar os endpoints ao código da aplicação.',
    quickstartLabel: 'Sequência de smoke tests',
    sharedBehaviorRows: [
      ['Corpo do pedido', 'A maioria das rotas são GET guiadas por query. As rotas de documentos e `/api/translate` esperam corpos JSON.'],
      ['Atualidade da resposta', 'Cada rota envia Cache-Control: no-store. Algumas são determinísticas e outras dependem de serviços externos ao vivo.'],
      ['Tratamento de erros', 'Verifique o estado HTTP e o campo code ou error.code antes de decidir se deve repetir.'],
      ['Perfil de deployment', 'Os handlers correm em Node.js e são marcados como dinâmicos.'],
    ],
    onPageLabel: 'Nesta página',
    onPageItems: ['Comece aqui', 'Rotas', 'Comportamento partilhado', 'Arranque rápido'],
    open: 'Abrir',
  },
  docsDetail: {
    endpoint: 'Endpoint',
    onPage: 'Nesta página',
    relatedPages: 'Páginas relacionadas',
    open: 'Abrir',
  },
  docsPages: ptDocsPages,
  faq: {
    eyebrow: 'FAQ',
    title: 'Perguntas sobre pedidos, formatos de resposta e comportamento upstream.',
    description: 'Respostas comuns para equipas que estão a integrar a superfície angolana atual da ORB3X Utils API.',
    cards: [
      { label: 'Formato de resposta', value: 'JSON' },
      { label: 'Política de cache', value: 'no-store' },
      { label: 'Comece com', value: 'Primeiros Passos' },
    ],
    groups: [
      {
        title: 'Pedidos',
        items: [
          {
            question: 'O que este site documenta?',
            answer: 'O site documenta a superfície atual da ORB3X Utils API, incluindo validação, telefone, geo, calendário, finanças, salário, tempo, documentos e as rotas legadas de NIF, tradução e câmbio.',
          },
          {
            question: 'Todas as rotas retornam JSON?',
            answer: 'A maioria retorna, mas os endpoints de documentos devolvem ficheiros PDF em sucesso. As respostas de erro continuam em JSON.',
          },
          {
            question: 'Que rotas esperam um corpo de pedido?',
            answer: 'Os endpoints de documentos e `/api/translate` esperam corpos JSON. A maioria das outras rotas usa parâmetros de query.',
          },
        ],
      },
      {
        title: 'Cache e erros',
        items: [
          {
            question: 'As respostas são colocadas em cache?',
            answer: 'Não. Os handlers retornam `Cache-Control: no-store` porque os dados vêm de serviços externos em tempo real.',
          },
          {
            question: 'O que acontece quando um fornecedor upstream excede o timeout?',
            answer: 'A rota retorna um código de erro relacionado com timeout para que o seu cliente possa decidir entre retry ou fallback.',
          },
          {
            question: 'Como os retries devem ser tratados?',
            answer: 'Repita apenas quando a resposta indicar timeout upstream ou indisponibilidade do fornecedor. Não repita erros de validação.',
          },
        ],
      },
      {
        title: 'Comportamento das rotas',
        items: [
          {
            question: 'Quão atuais são os dados do NIF?',
            answer: 'A rota retorna o que o portal público fiscal angolano expõe no momento da requisição.',
          },
          {
            question: 'Que idiomas a rota de tradução aceita?',
            answer: 'Aceita os códigos de idioma suportados pelo endpoint de tradução subjacente, sujeitos às regras de validação descritas na documentação.',
          },
          {
            question: 'A rota de câmbio pode retornar totais convertidos?',
            answer: 'Sim. Adicione um parâmetro `amount` para receber `unitRates` e `convertedRates` na mesma resposta.',
          },
        ],
      },
      {
        title: 'Uso da saída',
        items: [
          {
            question: 'Devo armazenar os dados retornados?',
            answer: 'Isso depende dos requisitos do seu produto. Se a resposta afetar uma auditoria ou decisão de negócio, armazene-a juntamente com o seu próprio contexto.',
          },
          {
            question: 'Onde devo começar quando estiver a depurar?',
            answer: 'Comece pela referência da API para os códigos de estado partilhados e depois vá para a página dedicada da rota para detalhes específicos de pedido e resposta.',
          },
          {
            question: 'Que páginas devem ficar abertas durante a integração?',
            answer: 'As páginas de primeiros passos, referência da API e exemplos cobrem a maior parte do trabalho de integração.',
          },
        ],
      },
    ],
    ctaTitle: 'Mantenha as páginas de referência abertas durante a integração.',
    ctaDescription: 'O guia inicial cobre o comportamento partilhado e as páginas de rota cobrem os detalhes de pedido e resposta.',
    primaryCta: 'Abrir primeiros passos',
    secondaryCta: 'Abrir referência da API',
  },
  legal: {
    eyebrow: 'Legal',
    lastUpdated: 'Última atualização',
    updatedOn: '22 de março de 2026',
    scope: 'Âmbito',
    appliesTo: 'Aplica-se a',
    privacy: {
      title: 'Política de privacidade.',
      description: 'Esta página explica quais categorias de informação podem ser processadas quando o site ou as rotas da API são utilizadas.',
      scopeValue: 'Website e operações da API',
      sections: [
        {
          title: 'Informação que processamos',
          paragraphs: [
            'Processamos a informação mínima necessária para receber pedidos, operar a API, proteger o serviço e investigar problemas. Dependendo da rota, isso pode incluir parâmetros de caminho, payloads de pedido, metadados de resposta e diagnósticos técnicos.',
            'Os exemplos incluem identificadores de consulta fiscal, texto submetido para tradução, códigos de moeda base, timestamps de pedido, telemetria relacionada com IP e logs estruturados usados para segurança e debugging.',
          ],
          bullets: [
            'Conteúdo do pedido submetido à API',
            'Metadados como timestamps, nomes de rota e estado da resposta',
            'Sinais de rede e dispositivo usados para segurança, debugging e controlo de taxa',
          ],
        },
        {
          title: 'Como a informação é usada',
          paragraphs: [
            'A informação é usada para executar a ação pedida, monitorizar disponibilidade, investigar incidentes e melhorar a qualidade do serviço.',
          ],
          bullets: [
            'Retornar respostas da API',
            'Detetar abuso, indisponibilidade e pedidos malformados',
            'Investigar pedidos de suporte e reproduzir problemas reportados',
            'Gerar métricas internas agregadas sobre uso e fiabilidade',
          ],
        },
        {
          title: 'Processamento por terceiros',
          paragraphs: [
            'Algumas rotas dependem de fornecedores upstream, incluindo serviços públicos governamentais e APIs terceiras. Quando essas rotas são chamadas, os dados relevantes são enviados a esses fornecedores para concluir o pedido.',
            'Esses fornecedores operam segundo os seus próprios termos e práticas de privacidade. Reveja essas dependências antes de usar o serviço em fluxos regulados ou altamente sensíveis.',
          ],
        },
        {
          title: 'Retenção e segurança',
          paragraphs: [
            'Logs operacionais e artefactos de suporte são mantidos apenas pelo tempo razoavelmente necessário para proteger o serviço, investigar incidentes e cumprir obrigações legais ou contratuais.',
            'Usamos salvaguardas administrativas, técnicas e organizacionais apropriadas para o serviço, mas nenhum sistema exposto à internet pode garantir segurança absoluta.',
          ],
          bullets: [
            'Controlos de acesso para sistemas operacionais',
            'Separação de ambientes entre desenvolvimento e produção',
            'Procedimentos de monitorização e resposta a incidentes',
          ],
        },
      ],
    },
    terms: {
      title: 'Termos de uso.',
      description: 'Estes termos descrevem as condições gerais de uso do site, da documentação e das rotas publicadas da API.',
      appliesToValue: 'Website, docs e rotas da API',
      sections: [
        {
          title: 'Aceitação e âmbito',
          paragraphs: [
            'Ao aceder ou utilizar o website ou as rotas da API, concorda com estes termos e com quaisquer condições comerciais adicionais por escrito que se apliquem ao seu uso do serviço.',
            'Estes termos cobrem o website público, a documentação e os endpoints publicados. Não substituem automaticamente qualquer acordo escrito separado.',
          ],
        },
        {
          title: 'Uso permitido',
          paragraphs: [
            'Pode usar o serviço para avaliar e integrar workflows legítimos que cumpram a lei aplicável e não interfiram com a disponibilidade ou integridade da plataforma.',
          ],
          bullets: [
            'Não tente acesso não autorizado, scraping além do uso previsto ou abuso de fornecedores upstream.',
            'Não use o serviço para triagem ilegal, decisões discriminatórias ou atividade enganosa.',
            'Não deturpe a origem ou a fiabilidade dos dados retornados perante utilizadores downstream.',
          ],
        },
        {
          title: 'Comportamento do serviço e dependências upstream',
          paragraphs: [
            'O serviço depende de sistemas públicos e terceiros para algumas respostas. A disponibilidade, latência e completude dos dados podem por isso ser afetadas por essas dependências.',
            'Podemos alterar detalhes internos de implementação ao longo do tempo, desde que o comportamento publicado das rotas continue materialmente utilizável para as integrações documentadas.',
          ],
        },
        {
          title: 'Saída e responsabilidade do cliente',
          paragraphs: [
            'É responsável por como usa a saída retornada pelo serviço nos seus próprios produtos e workflows.',
            'Reveja cuidadosamente ações críticas, especialmente quando os dados de base vêm de sistemas de terceiros.',
          ],
        },
      ],
    },
  },
  notFound: {
    eyebrow: '404',
    title: 'Página não encontrada',
    description: 'A página solicitada não existe. Use um dos links abaixo para voltar às páginas publicadas de documentação.',
    primaryCta: 'Ir para o início',
    secondaryCta: 'Abrir docs',
    tertiaryCta: 'Ver FAQ',
  },
};
