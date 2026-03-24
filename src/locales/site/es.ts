import { esDocsPages } from './docs/es';
import type { PartialSiteCopy } from './types';

export const esSiteCopy: PartialSiteCopy = {
  "languageName": "Español",
  "languages": {
    "en": "English",
    "pt": "Português",
    "es": "Español",
    "fr": "Français",
    "de": "Deutsch",
    "zh": "中文",
    "ja": "日本語"
  },
  "metadata": {
    "title": "ORB3X Utils API - Verificación de impuestos, traducción y conversión de moneda",
    "description": "Documentación para ORB3X Utils API rutas que cubren validación, geografía, finanzas, nómina, documentos y servicios públicos ascendentes heredados centrados en Angola.",
    "keywords": [
      "API",
      "verificación de impuestos",
      "traducción",
      "cambio de moneda",
      "NIF",
      "herramientas de desarrollo",
      "Angola",
      "tipos de cambio"
    ],
    "openGraphTitle": "ORB3X Utilidades API",
    "openGraphDescription": "Documentación para validación, geografía, finanzas, nómina, documentos y rutas ascendentes heredadas centradas en Angola."
  },
  "brand": {
    "homeAriaLabel": "ORB3X Utilidades API inicio",
    "companyWebsiteAriaLabel": "Abra el sitio web de la empresa ORB3X"
  },
  "header": {
    "themeToDark": "Cambiar al modo oscuro",
    "themeToLight": "Cambiar al modo de luz",
    "language": "Language",
    "openMenu": "abrir menú",
    "closeMenu": "Cerrar menú",
    "navigation": "Navegación"
  },
  "navigation": {
    "docs": "Documentos",
    "apiReference": "API Referencia",
    "examples": "Ejemplos",
    "faq": "FAQ",
    "privacy": "Privacidad"
  },
  "footer": {
    "description": "Páginas de documentación y referencia para las familias de rutas ORB3X Utils API centradas en Angola.",
    "companyLabel": "Empresa",
    "companyDescription": "ORB3X Las utilidades API son mantenidas por ORB3X. Visite el sitio web principal de la empresa para conocer la presencia institucional y de productos más amplia.",
    "companyWebsite": "Visita orb3x.com",
    "explore": "Explorar",
    "documentation": "Documentación",
    "policies": "Políticas",
    "privacy": "Política de privacidad",
    "terms": "Términos de uso",
    "faq": "FAQ",
    "copyright": "© 2026 ORB3X Utilidades API. Reservados todos los derechos.",
    "tagline": "Documentación de validación, geografía, finanzas, salario, documentos y utilidad heredada API."
  },
  "routes": {
    "nif": {
      "title": "NIF verificación",
      "description": "Valide y normalice los datos de los contribuyentes angoleños desde el portal público oficial con una única solicitud GET."
    },
    "translation": {
      "title": "Traducción de texto",
      "description": "Traduzca textos de aplicaciones, mensajes de clientes o contenido de soporte con manejo explícito del idioma de origen y de destino."
    },
    "exchange": {
      "title": "Cambio de moneda",
      "description": "Busque los tipos de moneda base o calcule previamente los montos convertidos del mismo sobre de respuesta."
    }
  },
  "home": {
    "eyebrow": "ORB3X Utilidades API",
    "title": "API para validación, geografía, finanzas, salarios, documentos y utilidades principales de Angola.",
    "description": "Utilice los documentos para verificar los formatos de solicitud, las cargas útiles de respuesta, las calculadoras y el comportamiento ascendente en la superficie actual de ORB3X Utils API.",
    "primaryCta": "Comience con los documentos",
    "secondaryCta": "Ver ejemplos",
    "quickRequestLabel": "Ejemplo de solicitud rápida (cURL)",
    "quickRequestNodeLabel": "Ejemplo de solicitud rápida (Node.js)",
    "stats": [
      {
        "label": "Rutas publicadas",
        "value": "28"
      },
      {
        "label": "Formato de respuesta",
        "value": "JSON"
      },
      {
        "label": "Política de caché",
        "value": "no-store"
      }
    ],
    "notes": [
      {
        "title": "Manejo de respuestas compartidas",
        "description": "La mayoría de las rutas devuelven JSON y exponen suficientes detalles de error para separar las entradas no válidas de las fallas ascendentes o los problemas de cálculo basados en suposiciones."
      },
      {
        "title": "Datos ascendentes en vivo",
        "description": "La plataforma combina puntos finales deterministas de datos locales con algunas rutas respaldadas en sentido ascendente, pero todas las respuestas permanecen no-store para preservar la frescura."
      },
      {
        "title": "Documentación a nivel de ruta",
        "description": "Cada familia de rutas tiene una página dedicada que cubre la forma de la solicitud, la carga útil de la respuesta, las suposiciones y los casos de fallas comunes."
      }
    ],
    "ownershipLabel": "Mantenido por ORB3X",
    "ownershipDescription": "ORB3X Utils API es parte de la plataforma más amplia ORB3X. El sitio web institucional de la empresa se encuentra en orb3x.com.",
    "ownershipCta": "Abra orb3x.com",
    "docs": {
      "eyebrow": "Documentación",
      "title": "Escrito como páginas de referencia, no como texto de marketing.",
      "description": "La sección de documentos cubre el comportamiento compartido, las cargas útiles específicas de la ruta y ejemplos para cada punto final. Úselo como el principal punto de entrada para el trabajo de implementación.",
      "bullets": [
        "Comience con la descripción general de la ruta para comprender los códigos de estado compartidos y las reglas de almacenamiento en caché.",
        "Utilice las páginas de puntos finales dedicadas para campos de solicitud, ejemplos de respuestas y notas de integración.",
        "Mantenga abierta la página de ejemplos mientras envía ayudas para buscar ayuda o realiza pruebas de humo."
      ],
      "tableLabel": "Página de documentación",
      "tableType": "Tipo",
      "tableTypeValue": "Documentos",
      "open": "Abierto"
    }
  },
  "docsOverview": {
    "navLabel": "Descripción general",
    "navDescription": "Índice de documentación, convenciones y mapa de ruta.",
    "eyebrow": "Documentación",
    "title": "Páginas de referencia para las familias de rutas publicadas.",
    "description": "Utilice estas páginas para verificar entradas, salidas, códigos de estado, suposiciones y ejemplos en validación, geografía, finanzas, salario, tiempo, documentos y puntos finales ascendentes heredados.",
    "primaryCta": "Abrir para empezar",
    "secondaryCta": "Ejemplos abiertos",
    "stats": [
      {
        "label": "Páginas de documentos",
        "value": "14"
      },
      {
        "label": "Rutas publicadas",
        "value": "28"
      },
      {
        "label": "Formato de respuesta",
        "value": "JSON"
      }
    ],
    "startHereTitle": "Empieza aquí",
    "startHereDescription": "Las páginas siguientes cubren primero las reglas compartidas y luego los detalles de solicitud y respuesta para cada ruta.",
    "routesTitle": "Rutas",
    "routesDescription": "Cada ruta publicada tiene una página dedicada con ejemplos de solicitudes y casos de falla.",
    "sharedBehaviorTitle": "Comportamiento compartido",
    "sharedBehaviorDescription": "Estas reglas se aplican en todos los puntos finales publicados y son los aspectos principales que se deben tener en cuenta en un cliente compartido.",
    "sharedBehaviorColumns": [
      "Preocupación",
      "Comportamiento"
    ],
    "quickstartTitle": "Inicio rápido",
    "quickstartDescription": "Ejecute una solicitud por ruta antes de conectar los puntos finales al código de la aplicación.",
    "quickstartLabel": "Secuencia de prueba de humo (cURL)",
    "quickstartNodeLabel": "Secuencia de prueba de humo (Node.js)",
    "sharedBehaviorRows": [
      [
        "Cuerpo de la solicitud",
        "La mayoría de las rutas son puntos finales GET controlados por consultas. Las rutas del documento y `/api/translate` esperan cuerpos JSON."
      ],
      [
        "Frescura de respuesta",
        "Cada ruta envía Cache-Control: no-store. Algunos puntos finales son deterministas, mientras que otros dependen de servicios ascendentes en vivo."
      ],
      [
        "Manejo de errores",
        "Verifique el estado de HTTP y el campo de código devuelto o el valor de error.code antes de decidir si desea volver a intentarlo."
      ],
      [
        "Perfil de implementación",
        "Los controladores se ejecutan en Node.js y están marcados como dinámicos."
      ]
    ],
    "versionLabel": "Versión",
    "versionSelectorLabel": "Seleccionar versión de documentación",
    "versionCurrent": "v1",
    "versionLatest": "Lo último",
    "versionDescription": "Documentación API estable actual para la superficie de ruta `/api/v1`.",
    "onPageLabel": "En esta página",
    "onPageItems": [
      "Empieza aquí",
      "Rutas",
      "Comportamiento compartido",
      "Inicio rápido"
    ],
    "open": "Abierto"
  },
  "docsDetail": {
    "endpoint": "Punto final",
    "onPage": "En esta página",
    "relatedPages": "Páginas relacionadas",
    "open": "Abierto"
  },
  "faq": {
    "eyebrow": "FAQ",
    "title": "Preguntas sobre solicitudes, formatos de respuesta y comportamiento ascendente.",
    "description": "Respuestas comunes para los equipos que integran la superficie ORB3X Utils API centrada en Angola.",
    "cards": [
      {
        "label": "Formato de respuesta",
        "value": "JSON"
      },
      {
        "label": "Política de caché",
        "value": "no-store"
      },
      {
        "label": "Empezar con",
        "value": "Empezando"
      }
    ],
    "groups": [
      {
        "title": "Solicitudes",
        "items": [
          {
            "question": "¿Qué documenta este sitio?",
            "answer": "El sitio documenta la superficie actual de ORB3X Utils API, incluida la validación, el teléfono, la ubicación geográfica, el calendario, las finanzas, el salario, el tiempo, los documentos y las rutas heredadas de NIF, traducción e intercambio."
          },
          {
            "question": "¿Todas las rutas devuelven JSON?",
            "answer": "La mayoría de las rutas lo hacen, pero los puntos finales de documentos devuelven archivos PDF en caso de éxito. Las respuestas de error todavía usan JSON."
          },
          {
            "question": "¿Qué rutas esperan un cuerpo de solicitud?",
            "answer": "Los puntos finales del documento y `/api/translate` esperan cuerpos JSON. La mayoría de las otras rutas utilizan parámetros de consulta."
          }
        ]
      },
      {
        "title": "Almacenamiento en caché y errores",
        "items": [
          {
            "question": "¿Se almacenan en caché las respuestas?",
            "answer": "No. Los controladores de ruta devuelven `Cache-Control: no-store` porque los datos provienen de servicios ascendentes en vivo."
          },
          {
            "question": "¿Qué sucede cuando se agota el tiempo de espera de un proveedor ascendente?",
            "answer": "La ruta devuelve un código de error relacionado con el tiempo de espera para que su cliente pueda decidir si vuelve a intentarlo o muestra un estado alternativo."
          },
          {
            "question": "¿Cómo se deben manejar los reintentos?",
            "answer": "Vuelva a intentarlo solo cuando la respuesta indique un tiempo de espera ascendente o un problema de disponibilidad ascendente. No vuelva a intentar errores de validación."
          }
        ]
      },
      {
        "title": "Comportamiento de ruta",
        "items": [
          {
            "question": "¿Qué tan actualizados están los datos NIF?",
            "answer": "La ruta retorna todo lo que el portal fiscal público angoleño expone en el momento de la solicitud."
          },
          {
            "question": "¿Qué idiomas puede aceptar la ruta de traducción?",
            "answer": "Acepta los códigos de idioma admitidos por el punto final de traducción subyacente, sujeto a las reglas de validación descritas en los documentos."
          },
          {
            "question": "¿Puede la ruta monetaria devolver totales convertidos?",
            "answer": "Sí. Agregue un parámetro de consulta `amount` para recibir `unitRates` y `convertedRates` en la misma respuesta."
          }
        ]
      },
      {
        "title": "Usando la salida",
        "items": [
          {
            "question": "¿Debo almacenar los datos devueltos?",
            "answer": "Eso depende de los requisitos de su propio producto. Si una respuesta afecta una auditoría o una decisión comercial, guárdela junto con su propio contexto."
          },
          {
            "question": "¿Dónde debería buscar primero al depurar?",
            "answer": "Comience con la referencia API para códigos de estado compartidos, luego pase a la página de ruta dedicada para obtener detalles de respuesta y solicitud específicos del punto final."
          },
          {
            "question": "¿Qué páginas deberían permanecer abiertas durante la integración?",
            "answer": "La página de introducción, la referencia API y la página de ejemplos cubren la mayor parte del trabajo de integración."
          }
        ]
      }
    ],
    "ctaTitle": "Mantenga las páginas de referencia cerca mientras realiza la integración.",
    "ctaDescription": "La guía de introducción cubre primero el comportamiento compartido, luego las páginas de ruta cubren los detalles de la solicitud y la respuesta.",
    "primaryCta": "Abrir para empezar",
    "secondaryCta": "Abrir referencia API"
  },
  "legal": {
    "eyebrow": "Legales",
    "lastUpdated": "Última actualización",
    "updatedOn": "22 de marzo de 2026",
    "scope": "Alcance",
    "appliesTo": "Se aplica a",
    "companySite": "Sitio web de la empresa",
    "companySiteDescription": "La información del editor y la empresa de este API está disponible en el sitio web oficial ORB3X.",
    "companySiteCta": "Abra orb3x.com",
    "privacy": {
      "title": "Política de privacidad.",
      "description": "Esta página explica qué categorías de información pueden procesarse cuando se utilizan el sitio o las rutas API.",
      "scopeValue": "Sitio web y operaciones API",
      "sections": [
        {
          "title": "Información que procesamos",
          "paragraphs": [
            "Procesamos la información mínima requerida para recibir solicitudes, operar el API, proteger el servicio y solucionar problemas. Dependiendo de la ruta, eso puede incluir parámetros de ruta, cargas útiles de solicitud, metadatos de respuesta y diagnósticos técnicos.",
            "Los ejemplos incluyen identificadores de búsqueda de contribuyentes, texto de solicitud de traducción, códigos de moneda base, marcas de tiempo de solicitud, telemetría relacionada con IP y registros de aplicaciones estructurados utilizados para seguridad y depuración."
          ],
          "bullets": [
            "Solicitar contenido enviado al API",
            "Metadatos como marcas de tiempo, nombres de rutas y estado de respuesta.",
            "Señales de red y dispositivos utilizadas para seguridad, depuración y control de velocidad."
          ]
        },
        {
          "title": "Cómo se utiliza la información",
          "paragraphs": [
            "La información se utiliza para ejecutar la acción solicitada, monitorear la disponibilidad, investigar incidentes y mejorar la calidad del servicio."
          ],
          "bullets": [
            "Devolver API respuestas",
            "Detecte abusos, tiempos de inactividad y solicitudes con formato incorrecto",
            "Investigar solicitudes de soporte y reproducir problemas reportados",
            "Genere métricas internas agregadas sobre uso y confiabilidad."
          ]
        },
        {
          "title": "Procesamiento de terceros",
          "paragraphs": [
            "Algunas rutas dependen de proveedores ascendentes, incluidos servicios gubernamentales públicos y API de terceros. Cuando se llaman esas rutas, se envían datos de solicitud relevantes a esos proveedores para completar la solicitud.",
            "Esos proveedores operan bajo sus propios términos y prácticas de privacidad. Revise esas dependencias antes de utilizar el servicio en flujos de trabajo regulados o de alta sensibilidad."
          ]
        },
        {
          "title": "Retención y seguridad",
          "paragraphs": [
            "Los registros operativos y los artefactos de soporte se conservan solo durante el tiempo razonablemente necesario para proteger el servicio, investigar incidentes y satisfacer obligaciones legales o contractuales.",
            "Utilizamos medidas de seguridad administrativas, técnicas y organizativas apropiadas para el servicio, pero ningún sistema conectado a Internet puede garantizar una seguridad absoluta."
          ],
          "bullets": [
            "Controles de acceso a sistemas operativos.",
            "Separación de entornos para desarrollo y producción.",
            "Procedimientos de seguimiento y respuesta a incidentes."
          ]
        }
      ]
    },
    "terms": {
      "title": "Condiciones de uso.",
      "description": "Estos términos describen las condiciones generales de uso del sitio, la documentación y las rutas API publicadas.",
      "appliesToValue": "Sitio web, documentos y rutas API",
      "sections": [
        {
          "title": "Aceptación y alcance",
          "paragraphs": [
            "Al acceder o utilizar el sitio web o las rutas API, usted acepta estos términos y cualquier término comercial escrito adicional que pueda aplicarse a su uso del servicio.",
            "Estos términos cubren el sitio web público, la documentación y los puntos finales API publicados. No anulan automáticamente ningún acuerdo escrito por separado."
          ]
        },
        {
          "title": "Uso permitido",
          "paragraphs": [
            "Puede utilizar el servicio para evaluar e integrar flujos de trabajo legítimos que cumplan con la ley aplicable y no interfieran con la disponibilidad o integridad de la plataforma."
          ],
          "bullets": [
            "No intente el acceso no autorizado, el scraping más allá del uso previsto ni el abuso de proveedores ascendentes.",
            "No utilice el servicio para realizar controles ilegales, tomar decisiones discriminatorias o realizar actividades engañosas.",
            "No tergiverse la fuente o la confiabilidad de los datos devueltos a los usuarios intermedios."
          ]
        },
        {
          "title": "Comportamiento del servicio y dependencias ascendentes",
          "paragraphs": [
            "El servicio depende de sistemas ascendentes públicos y de terceros para algunas respuestas. Por lo tanto, esas dependencias pueden afectar la disponibilidad, la latencia y la integridad de los datos.",
            "Podemos cambiar los detalles de implementación interna con el tiempo, siempre que el comportamiento de la ruta publicada siga siendo materialmente utilizable para integraciones documentadas."
          ]
        },
        {
          "title": "Salida y responsabilidad del cliente.",
          "paragraphs": [
            "Usted es responsable de cómo utiliza el resultado devuelto por el servicio en sus propios productos y flujos de trabajo.",
            "Revise cuidadosamente las acciones críticas, especialmente cuando los datos subyacentes provienen de sistemas de terceros."
          ]
        }
      ]
    }
  },
  "notFound": {
    "eyebrow": "404",
    "title": "Página no encontrada",
    "description": "La página que solicitaste no existe. Utilice uno de los enlaces siguientes para regresar a las páginas de documentación publicada.",
    "primaryCta": "Vete a casa",
    "secondaryCta": "Documentos abiertos",
    "tertiaryCta": "Visita FAQ"
  },
  "docsPages": esDocsPages
};
