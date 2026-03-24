import type { DocsPageMap } from '@/lib/site-content';

export const esDocsPages: DocsPageMap = {
  "getting-started": {
    "slug": "getting-started",
    "label": "Empezando",
    "description": "Descripción general de familias de rutas, convenciones de solicitud y notas de implementación.",
    "eyebrow": "Guía de plataforma",
    "title": "Comience con las rutas ORB3X Utils API publicadas.",
    "intro": "ORB3X Utils API ahora combina el NIF original, puntos finales de traducción e intercambio con utilidades de validación, teléfono, dirección, geografía, calendario, finanzas, salario, tiempo y documentos centrados en Angola. Todas las rutas son dinámicas y de forma predeterminada utilizan el almacenamiento en caché no-store.",
    "summaryCards": [
      {
        "label": "Tiempo de ejecución",
        "value": "Node.js controladores"
      },
      {
        "label": "Política de caché",
        "value": "Respuestas sin tienda"
      },
      {
        "label": "Estilos de punto final",
        "value": "24 GET, 4 POST"
      }
    ],
    "sections": [
      {
        "id": "mental-model",
        "title": "Comience con el modelo de plataforma",
        "paragraphs": [
          "La mayoría de los nuevos puntos finales son calculadoras, registros o normalizadores locales respaldados por conjuntos de datos internos tipificados. Las rutas de impuestos, traducción e intercambio existentes todavía llaman a proveedores ascendentes en vivo.",
          "Esa división es útil en el diseño del cliente: los puntos finales de datos locales son deterministas y rápidos, mientras que las rutas respaldadas en sentido ascendente necesitan un mayor manejo de reintentos, tiempos de espera y observabilidad."
        ],
        "bullets": [
          "Espere JSON para las respuestas de éxito y de fracaso.",
          "Trate las respuestas NIF, traducción e intercambio como dinámicas y urgentes.",
          "Trate los salarios, VAT y los resultados de inflación como calculadoras basadas en suposiciones y mantenga los datos de año o tasa que utilizó.",
          "Lea el código de error devuelto, no solo el estado HTTP, al decidir los reintentos.",
          "Normalice la entrada de su propio usuario antes de llamar a los puntos finales para reducir las 400 respuestas evitables."
        ]
      },
      {
        "id": "request-conventions",
        "title": "Convenciones de solicitud compartida",
        "table": {
          "columns": [
            "Preocupación",
            "Comportamiento"
          ],
          "rows": [
            [
              "Transporte",
              "HTTPS JSON API diseñado para consumidores del lado del servidor y del navegador."
            ],
            [
              "Almacenamiento en caché",
              "Las respuestas configuran Cache-Control en no-store en todos los ámbitos para que las integraciones siempre lean resultados en vivo."
            ],
            [
              "Perfil de tiempo de espera",
              "Los manejadores permiten hasta 30 segundos; sólo un subconjunto de rutas heredadas depende de llamadas ascendentes de terceros."
            ],
            [
              "Validación",
              "Los parámetros de consulta, los valores de ruta y los cuerpos POST se desinfectan antes de ejecutar la lógica empresarial."
            ],
            [
              "Manejo de errores",
              "Los errores de validación devuelven códigos de 400 niveles con valores error.code estables y legibles por máquina."
            ]
          ]
        }
      },
      {
        "id": "first-calls",
        "title": "Realizar una primera solicitud exitosa",
        "description": "Ejecute una solicitud por ruta antes de integrarlas en el código de la aplicación.",
        "codes": [
          {
            "label": "Pruebas de humo del motor de arranque (cURL)",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\"\n\ncurl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=%2B244923456789\"\n\ncurl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\"\n\ncurl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/invoice \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"seller\":{\"name\":\"Orb3x, Lda\"},\"buyer\":{\"name\":\"Cliente Exemplo\"},\"items\":[{\"description\":\"Service\",\"quantity\":1,\"unitPrice\":100000,\"vatRate\":14}]}'"
          },
          {
            "label": "Pruebas de humo del motor de arranque (Node.js)",
            "language": "js",
            "content": "async function main() {\n  const response1 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\");\n  if (!response1.ok) {\n    throw new Error(`Request failed with status ${response1.status}`);\n  }\n  const data1 = await response1.json();\n  console.log(\"Example 1\", data1);\n\n  const response2 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=%2B244923456789\");\n  if (!response2.ok) {\n    throw new Error(`Request failed with status ${response2.status}`);\n  }\n  const data2 = await response2.json();\n  console.log(\"Example 2\", data2);\n\n  const response3 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\");\n  if (!response3.ok) {\n    throw new Error(`Request failed with status ${response3.status}`);\n  }\n  const data3 = await response3.json();\n  console.log(\"Example 3\", data3);\n\n  const payload4 = {\n    \"seller\": {\n      \"name\": \"Orb3x, Lda\"\n    },\n    \"buyer\": {\n      \"name\": \"Cliente Exemplo\"\n    },\n    \"items\": [\n      {\n        \"description\": \"Service\",\n        \"quantity\": 1,\n        \"unitPrice\": 100000,\n        \"vatRate\": 14\n      }\n    ]\n  };\n  const response4 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/invoice\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload4)\n  });\n  if (!response4.ok) {\n    throw new Error(`Request failed with status ${response4.status}`);\n  }\n  const data4 = await response4.json();\n  console.log(\"Example 4\", data4);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          }
        ],
        "bullets": [
          "Verifique las rutas de documentos desde el tiempo de ejecución exacto que implementa porque la generación PDF se ejecuta en el lado del servidor.",
          "Registre los ID de solicitud y los códigos de error ascendentes para los puntos finales NIF, traducción e intercambio.",
          "Construya guardias de respuesta en torno a resultados basados en suposiciones, como salarios, inflación y disponibilidad de planes de numeración."
        ]
      },
      {
        "id": "launch-checklist",
        "title": "Lista de verificación de lanzamiento de producción",
        "bullets": [
          "Centralice la configuración base URL para que los entornos de ensayo y producción se puedan cambiar sin editar el código.",
          "Capture respuestas que no sean 200 con registro estructurado que almacena HTTP estado, punto final, código y contexto de solicitud.",
          "Defina la política de reintento solo para tiempos de espera ascendentes y fallas de disponibilidad; no vuelva a intentar errores de entrada no válidos.",
          "Almacene el año de cálculo o las entradas de tarifas siempre que los resultados financieros fluyan hacia facturas, nóminas o informes.",
          "Valide las cargas útiles POST para la generación de documentos antes de pasar la entrada del usuario a flujos de trabajo de persistencia o entrega.",
          "Mantenga una prueba de contrato ligera para cada punto final en CI para detectar regresiones accidentales de forma de respuesta."
        ],
        "note": "Si solo implementa una capa defensiva, hágala explícita en el manejo de códigos de error. Ésta es la forma más sencilla de distinguir los errores reintentables de las solicitudes incorrectas."
      }
    ],
    "relatedSlugs": [
      "api-reference",
      "validation",
      "examples"
    ]
  },
  "api-reference": {
    "slug": "api-reference",
    "label": "API Referencia",
    "description": "Comportamiento canónico de solicitud y respuesta en toda la superficie API publicada.",
    "eyebrow": "Referencia",
    "title": "Referencia para el comportamiento compartido de solicitud y respuesta.",
    "intro": "Esta referencia resume las convenciones compartidas por la superficie de servicios públicos actual de Angola, incluidas las rutas de validación, geo, finanzas, salario, tiempo y documentos junto con los puntos finales originales respaldados por aguas arriba.",
    "summaryCards": [
      {
        "label": "Puntos finales publicados",
        "value": "28"
      },
      {
        "label": "Formato de éxito",
        "value": "JSON solamente"
      },
      {
        "label": "Respuestas binarias",
        "value": "PDF en documentos POST"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Catálogo de terminales",
        "table": {
          "columns": [
            "Ruta",
            "Método",
            "Propósito",
            "Entrada clave"
          ],
          "rows": [
            [
              "/api/v1/validate/*",
              "GET",
              "Validar el IBAN angoleño y las estructuras de cuentas bancarias locales.",
              "iban o consulta de cuenta"
            ],
            [
              "/api/v1/phone/*",
              "GET",
              "Analice números de teléfono, valide formatos y detecte operadores.",
              "consulta telefónica"
            ],
            [
              "/api/v1/address/* + /api/v1/geo/*",
              "GET",
              "Normalice direcciones y lea registros de ubicación de Angola.",
              "q, province, municipality, address"
            ],
            [
              "/api/v1/calendar/*",
              "GET",
              "Días festivos de regreso y cómputo de días hábiles.",
              "año, desde/hasta, fecha/días"
            ],
            [
              "/api/v1/finance/*",
              "GET",
              "Ejecute VAT, cálculos de factura e inflación.",
              "consulta de cantidad o líneas"
            ],
            [
              "/api/v1/salary/*",
              "GET",
              "Calcule los valores netos, brutos y de costos para el empleador de la nómina.",
              "consulta bruta o neta"
            ],
            [
              "/api/v1/time/*",
              "GET",
              "Lea la hora actual, convierta zonas horarias y consulte el horario comercial.",
              "zona horaria, fechahora, inicio/fin"
            ],
            [
              "/api/v1/documents/*",
              "POST",
              "Genere archivos PDF de facturas, recibos y contratos.",
              "JSON cuerpo"
            ],
            [
              "/api/nif/{nif}",
              "GET",
              "Busque campos de identidad del contribuyente angoleño.",
              "NIF parámetro de ruta"
            ],
            [
              "/api/translate",
              "POST",
              "Traduce texto y devuelve el idioma de origen detectado.",
              "JSON cuerpo: texto, a, opcional desde"
            ],
            [
              "/api/exchange/{base}",
              "GET",
              "Tipos de cambio de retorno, opcionalmente multiplicados por el monto.",
              "parámetro de ruta base, consulta de cantidad opcional"
            ]
          ]
        }
      },
      {
        "id": "response-patterns",
        "title": "Patrones de respuesta",
        "paragraphs": [
          "Las cargas útiles de éxito son específicas de los terminales, pero se mantienen planas y orientadas a las aplicaciones. Los puntos finales de la calculadora muestran los valores derivados más las suposiciones o bases utilizadas para producirlos.",
          "Las rutas de documentos son la principal excepción: devuelven respuestas binarias PDF con encabezados adjuntos. La mayoría de los demás puntos finales devuelven JSON y un sobre de error cuando algo sale mal."
        ],
        "code": {
          "label": "Respuesta de error típica",
          "language": "json",
          "content": "{\n  \"error\": {\n    \"code\": \"UPSTREAM_TIMEOUT\",\n    \"message\": \"The currency service did not respond in time.\",\n    \"baseCurrency\": \"AOA\",\n    \"amount\": \"1000000\"\n  }\n}"
        }
      },
      {
        "id": "status-codes",
        "title": "Códigos de estado e intención",
        "table": {
          "columns": [
            "Estado",
            "Significado",
            "Acción típica"
          ],
          "rows": [
            [
              "200",
              "La solicitud validada se realizó correctamente.",
              "Utilice la carga útil directamente."
            ],
            [
              "400",
              "Falta entrada, está mal formada o no es compatible.",
              "Arreglar la solicitud; no hay reintento."
            ],
            [
              "404",
              "No se pudo encontrar el recurso solicitado en sentido ascendente.",
              "Muestra un estado claro de no encontrado."
            ],
            [
              "502",
              "El servicio ascendente falló o devolvió datos con formato incorrecto.",
              "Vuelva a intentarlo con retroceso o degrade con gracia."
            ],
            [
              "504",
              "Se agotó el tiempo de espera de la dependencia ascendente.",
              "Vuelva a intentarlo si el flujo de usuarios puede tolerarlo."
            ],
            [
              "500",
              "Fallo interno inesperado.",
              "Registre, alerte y trate como reintentable solo si su UX lo permite."
            ]
          ]
        }
      },
      {
        "id": "operational-notes",
        "title": "Notas operativas",
        "bullets": [
          "Todos los controladores de ruta están marcados como dinámicos, por lo que no debe confiar en las respuestas renderizadas previamente en tiempo de compilación.",
          "Los encabezados User-Agent se configuran explícitamente para las solicitudes heredadas respaldadas en sentido ascendente para mejorar la compatibilidad del proveedor.",
          "La desinfección de la entrada es conservadora: los parámetros de ruta se recortan y normalizan antes del envío de la solicitud.",
          "Las respuestas de validación bancaria incluyen una insignia de imagen del banco generada para que las interfaces puedan generar una imagen reconocible sin búsquedas adicionales.",
          "Los puntos finales de documentos son sincrónicos; mantenga las cargas útiles compactas y realice el almacenamiento descendente de forma asincrónica en su propio sistema cuando sea necesario."
        ]
      }
    ],
    "relatedSlugs": [
      "getting-started",
      "validation",
      "examples"
    ]
  },
  "validation": {
    "slug": "validation",
    "label": "Validación",
    "description": "IBAN y validación de cuenta bancaria local angoleña con detección bancaria.",
    "eyebrow": "categoría",
    "title": "Validar identificadores bancarios angoleños y detectar el banco emisor.",
    "intro": "La familia de validación cubre `/api/v1/validate/iban` y `/api/v1/validate/bank-account`. Ambas rutas normalizan la entrada, detectan el banco a partir del código bancario y devuelven una imagen de credencial bancaria generada para uso de la interfaz de usuario.",
    "summaryCards": [
      {
        "label": "Rutas",
        "value": "2 GET"
      },
      {
        "label": "Alcance del país",
        "value": "Angola"
      },
      {
        "label": "Salida visual",
        "value": "Imagen de placa bancaria"
      }
    ],
    "sections": [
      {
        "id": "routes",
        "title": "Rutas de esta familia.",
        "table": {
          "columns": [
            "Ruta",
            "Propósito",
            "consulta clave"
          ],
          "rows": [
            [
              "/api/v1/validate/iban",
              "Valide IBAN en formato AO con cheques mod-97 y búsqueda bancaria.",
              "iban"
            ],
            [
              "/api/v1/validate/bank-account",
              "Valide las estructuras de cuentas locales de 21 dígitos y obtenga el IBAN coincidente.",
              "cuenta"
            ]
          ]
        }
      },
      {
        "id": "validate-iban-route",
        "title": "GET /api/v1/validate/iban",
        "description": "Utilice esta ruta cuando ya tenga un AO IBAN completo y necesite piezas normalizadas, metadatos bancarios e indicadores de validación.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "iban",
              "si",
              "Formato AO IBAN. El controlador recorta los separadores y pone en mayúsculas el valor antes de verificarlo."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"isValid\": true,\n  \"normalized\": \"AO06004000010123456789012\",\n  \"formatted\": \"AO06 0040 0001 0123 4567 8901 2\",\n  \"countryCode\": \"AO\",\n  \"checkDigits\": \"06\",\n  \"bank\": {\n    \"code\": \"BAI\",\n    \"ibanBankCode\": \"0040\",\n    \"name\": \"Banco Angolano de Investimentos\",\n    \"image\": \"data:image/svg+xml;base64,...\"\n  },\n  \"components\": {\n    \"bankCode\": \"0040\",\n    \"branchCode\": \"0001\",\n    \"accountNumber\": \"01234567890\",\n    \"controlDigits\": \"12\"\n  },\n  \"validation\": {\n    \"countrySupported\": true,\n    \"lengthValid\": true,\n    \"bankCodeKnown\": true,\n    \"mod97Valid\": true\n  }\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_IBAN\",\n    \"message\": \"Angolan IBANs must contain exactly 25 characters.\",\n    \"field\": \"iban\",\n    \"length\": 18\n  }\n}"
          }
        ],
        "bullets": [
          "Marque `validation.mod97Valid` y `validation.bankCodeKnown` en lugar de confiar solo en `isValid` cuando necesite estados granulares de la interfaz de usuario.",
          "Utilice `bank.image` directamente en resúmenes de pago o tarjetas de verificación."
        ]
      },
      {
        "id": "validate-bank-account-route",
        "title": "GET /api/v1/validate/bank-account",
        "description": "Utilice esta ruta para cadenas de cuenta locales de 21 dígitos cuando necesite validación estructural y el IBAN derivado coincidente.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "cuenta",
              "si",
              "Cadena de cuenta local angoleña con 21 dígitos. Se ignoran los separadores que no son dígitos."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/validate/bank-account?account=004000010123456789012\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/validate/bank-account?account=004000010123456789012\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"isValid\": true,\n  \"normalized\": \"004000010123456789012\",\n  \"formatted\": \"0040 0001 0123 4567 8901 2\",\n  \"derivedIban\": \"AO06004000010123456789012\",\n  \"bankRecognized\": true,\n  \"bank\": {\n    \"code\": \"BAI\",\n    \"name\": \"Banco Angolano de Investimentos\",\n    \"image\": \"data:image/svg+xml;base64,...\"\n  },\n  \"components\": {\n    \"bankCode\": \"0040\",\n    \"branchCode\": \"0001\",\n    \"accountNumber\": \"01234567890\",\n    \"controlDigits\": \"12\"\n  },\n  \"validation\": {\n    \"formatValid\": true,\n    \"bankCodeKnown\": true,\n    \"controlDigitsPresent\": true\n  }\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_BANK_ACCOUNT\",\n    \"message\": \"Angolan local bank account numbers must contain exactly 21 digits.\",\n    \"field\": \"account\",\n    \"length\": 9\n  }\n}"
          }
        ],
        "bullets": [
          "Esta es una validación estructural, no una confirmación de que la cuenta está activa en la red bancaria.",
          "Conserve la cuenta normalizada o IBAN derivada en lugar de la cadena de entrada sin formato."
        ]
      }
    ],
    "relatedSlugs": [
      "phone",
      "finance",
      "examples"
    ]
  },
  "phone": {
    "slug": "phone",
    "label": "Teléfono",
    "description": "Analiza, valida y clasifica números de teléfono angoleños por operador.",
    "eyebrow": "categoría",
    "title": "Analizar números angoleños y clasificar el rango de numeración.",
    "intro": "Las rutas telefónicas normalizan la entrada local o internacional, separan las partes nacionales y nacionales y asignan prefijos móviles a Unitel, Africell o Movicel cuando se conoce el alcance.",
    "summaryCards": [
      {
        "label": "Rutas",
        "value": "3 GET"
      },
      {
        "label": "código de país",
        "value": "+244"
      },
      {
        "label": "Modelo de disponibilidad",
        "value": "Plan de numeración"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Rutas de esta familia.",
        "table": {
          "columns": [
            "Ruta",
            "Propósito",
            "consulta clave"
          ],
          "rows": [
            [
              "/api/v1/phone/parse",
              "Devuelve componentes y formatos de números de teléfono estructurados.",
              "telefono"
            ],
            [
              "/api/v1/phone/validate",
              "Validar formato y reportar disponibilidad del plan de numeración.",
              "telefono"
            ],
            [
              "/api/v1/phone/operator",
              "Detecta el operador de telefonía móvil a partir del prefijo de rango.",
              "telefono"
            ]
          ]
        }
      },
      {
        "id": "phone-parse-route",
        "title": "GET /api/v1/phone/parse",
        "description": "Utilice el análisis cuando necesite un número canónico normalizado más formato reutilizable para almacenamiento o interfaz de usuario.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "telefono",
              "si",
              "Número angoleño local o internacional, como `923456789` o `+244923456789`."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/parse?phone=%2B244923456789\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/parse?phone=%2B244923456789\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"normalized\": \"+244923456789\",\n  \"countryCode\": \"+244\",\n  \"nationalNumber\": \"923456789\",\n  \"internationalFormat\": \"+244 923 456 789\",\n  \"nationalFormat\": \"923 456 789\",\n  \"isMobile\": true,\n  \"type\": \"mobile\",\n  \"prefix\": \"92\",\n  \"subscriberNumber\": \"3456789\",\n  \"operator\": {\n    \"code\": \"UNITEL\",\n    \"name\": \"Unitel\",\n    \"prefix\": \"92\",\n    \"prefixes\": [\"92\", \"93\", \"94\"]\n  }\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_PHONE\",\n    \"message\": \"Angolan phone numbers must contain 9 national digits.\",\n    \"field\": \"phone\",\n    \"length\": 6\n  }\n}"
          }
        ]
      },
      {
        "id": "phone-validate-route",
        "title": "GET /api/v1/phone/validate",
        "description": "Utilice validar cuando necesite un resultado de aprobación/rechazo además de información de disponibilidad del plan de numeración.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "telefono",
              "si",
              "Número de teléfono local o internacional de Angola."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=952345678\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=952345678\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"isValid\": true,\n  \"normalized\": \"+244952345678\",\n  \"type\": \"mobile\",\n  \"operator\": {\n    \"code\": \"AFRICELL\",\n    \"name\": \"Africell\",\n    \"prefix\": \"95\",\n    \"prefixes\": [\"95\"]\n  },\n  \"availability\": {\n    \"type\": \"numbering-plan\",\n    \"status\": \"allocated-range\",\n    \"canConfirmLiveSubscriber\": false\n  }\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_PHONE\",\n    \"message\": \"The \\\"phone\\\" query parameter is required.\",\n    \"field\": \"phone\"\n  }\n}"
          }
        ],
        "note": "La disponibilidad se basa en rangos de numeración angoleños conocidos. No confirma la accesibilidad del suscriptor en vivo."
      },
      {
        "id": "phone-operator-route",
        "title": "GET /api/v1/phone/operator",
        "description": "Utilice operador cuando solo necesite la búsqueda del operador y no el resto de la carga útil del teléfono analizada.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "telefono",
              "si",
              "Número de teléfono local o internacional de Angola."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/operator?phone=912345678\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/operator?phone=912345678\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"phone\": \"912345678\",\n  \"operator\": {\n    \"code\": \"MOVICEL\",\n    \"name\": \"Movicel\",\n    \"prefix\": \"91\",\n    \"prefixes\": [\"91\", \"99\"]\n  }\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_PHONE\",\n    \"message\": \"Angolan phone numbers must contain 9 national digits.\",\n    \"field\": \"phone\",\n    \"length\": 4\n  }\n}"
          }
        ]
      }
    ],
    "relatedSlugs": [
      "validation",
      "address-geo",
      "examples"
    ]
  },
  "address-geo": {
    "slug": "address-geo",
    "label": "Dirección y geografía",
    "description": "Normalizar direcciones angoleñas y leer provincias, municipios y comunas.",
    "eyebrow": "categoría",
    "title": "Estandarizar direcciones angoleñas y consultar el registro de ubicaciones.",
    "intro": "La normalización y sugerencia de direcciones están respaldadas por un registro geográfico seleccionado de Angola. Las rutas geográficas devuelven datos de provincias, municipios y comunas que pueden impulsar formularios de administración y flujos de autocompletar.",
    "summaryCards": [
      {
        "label": "Rutas",
        "value": "5 GET"
      },
      {
        "label": "Niveles geográficos",
        "value": "Provincia a comuna"
      },
      {
        "label": "Autocompletar",
        "value": "barrio + comuna + municipio"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Rutas de esta familia.",
        "table": {
          "columns": [
            "Ruta",
            "Propósito",
            "consulta clave"
          ],
          "rows": [
            [
              "/api/v1/address/normalize",
              "Limpiar y estructurar una dirección angoleña de texto libre.",
              "dirección"
            ],
            [
              "/api/v1/address/suggest",
              "Sugerir barrios, comunas o municipios.",
              "q, type, province, municipality"
            ],
            [
              "/api/v1/geo/provinces",
              "Lista todas las provincias de Angola.",
              "ninguno"
            ],
            [
              "/api/v1/geo/municipalities",
              "Lista de municipios, opcionalmente filtrados por provincia.",
              "provincia"
            ],
            [
              "/api/v1/geo/communes",
              "Listar comunas de un municipio.",
              "municipio, provincia opcional"
            ]
          ]
        }
      },
      {
        "id": "address-normalize-route",
        "title": "GET /api/v1/address/normalize",
        "description": "Utilice normalizar para limpiar una dirección de texto libre antes de conservarla o compararla con registros internos.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "dirección",
              "si",
              "Dirección angoleña en texto libre. Las abreviaturas comunes como `prov.` y `mun.` se expanden automáticamente."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/address/normalize?address=Benfica,%20Luanda\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/address/normalize?address=Benfica,%20Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"input\": \"Benfica, Luanda\",\n  \"normalized\": \"Benfica, Luanda\",\n  \"components\": {\n    \"bairro\": \"Benfica\",\n    \"commune\": \"Benfica\",\n    \"municipality\": \"Belas\",\n    \"province\": \"Luanda\"\n  },\n  \"diagnostics\": {\n    \"provinceMatched\": true,\n    \"municipalityMatched\": true,\n    \"communeMatched\": true,\n    \"bairroMatched\": true\n  }\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_ADDRESS\",\n    \"message\": \"The \\\"address\\\" query parameter is required.\",\n    \"field\": \"address\"\n  }\n}"
          }
        ]
      },
      {
        "id": "address-suggest-route",
        "title": "GET /api/v1/address/suggest",
        "description": "Utilice sugerencias para activar campos de autocompletar para barrios, comunas, municipios y provincias.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "q",
              "si",
              "Fragmento de búsqueda."
            ],
            [
              "tipo",
              "No",
              "Filtro opcional: `bairro`, `commune`, `municipality` o `province`."
            ],
            [
              "provincia",
              "No",
              "Filtro de provincia opcional."
            ],
            [
              "municipio",
              "No",
              "Filtro municipal opcional."
            ],
            [
              "límite",
              "No",
              "Número máximo de sugerencias para devolver."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/address/suggest?q=tal&type=municipality&province=Luanda\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/address/suggest?q=tal&type=municipality&province=Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"query\": \"tal\",\n  \"suggestions\": [\n    {\n      \"type\": \"municipality\",\n      \"label\": \"Talatona\",\n      \"province\": \"Luanda\",\n      \"municipality\": \"Talatona\"\n    }\n  ]\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"MISSING_QUERY_PARAMETER\",\n    \"message\": \"The \\\"q\\\" query parameter is required.\",\n    \"field\": \"q\"\n  }\n}"
          }
        ]
      },
      {
        "id": "geo-provinces-route",
        "title": "GET /api/v1/geo/provinces",
        "description": "Utilice provincias como fuente de registro de nivel superior para selectores de ubicación y filtrado administrativo.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": []
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/geo/provinces\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/geo/provinces\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"country\": \"AO\",\n  \"countryName\": \"Angola\",\n  \"provinces\": [\n    {\n      \"name\": \"Luanda\",\n      \"slug\": \"luanda\",\n      \"capital\": \"Luanda\",\n      \"municipalityCount\": 16\n    }\n  ]\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INTERNAL_SERVER_ERROR\",\n    \"message\": \"Unexpected error while listing provinces.\"\n  }\n}"
          }
        ]
      },
      {
        "id": "geo-municipalities-route",
        "title": "GET /api/v1/geo/municipalities",
        "description": "Utilice municipios para completar selectores de ubicación de segundo nivel, con o sin filtro de provincia.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "provincia",
              "No",
              "Nombre de provincia opcional utilizado para filtrar la lista."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/geo/municipalities?province=Luanda\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/geo/municipalities?province=Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"province\": \"Luanda\",\n  \"municipalities\": [\n    {\n      \"name\": \"Talatona\",\n      \"slug\": \"talatona\",\n      \"province\": \"Luanda\",\n      \"communeCount\": 2\n    }\n  ]\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"PROVINCE_NOT_FOUND\",\n    \"message\": \"No Angolan province matched the supplied query.\",\n    \"field\": \"province\",\n    \"value\": \"Atlantis\"\n  }\n}"
          }
        ]
      },
      {
        "id": "geo-communes-route",
        "title": "GET /api/v1/geo/communes",
        "description": "Utilice comunas cuando un municipio ya esté seleccionado y necesite el siguiente nivel administrativo.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "municipio",
              "si",
              "Nombre del municipio a ampliar."
            ],
            [
              "provincia",
              "No",
              "Nombre de provincia opcional utilizado para eliminar la ambigüedad de las etiquetas de municipio repetidas."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/geo/communes?municipality=Talatona&province=Luanda\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/geo/communes?municipality=Talatona&province=Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"municipality\": \"Talatona\",\n  \"province\": \"Luanda\",\n  \"coverage\": \"curated\",\n  \"communes\": [\n    { \"name\": \"Cidade Universitaria\", \"slug\": \"cidade-universitaria\" },\n    { \"name\": \"Talatona\", \"slug\": \"talatona\" }\n  ]\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"MISSING_QUERY_PARAMETER\",\n    \"message\": \"The \\\"municipality\\\" query parameter is required.\",\n    \"field\": \"municipality\"\n  }\n}"
          }
        ],
        "note": "Algunos municipios utilizan detalles curados de las comunas, mientras que otros actualmente exponen la cobertura solo de los asientos."
      }
    ],
    "relatedSlugs": [
      "phone",
      "calendar",
      "examples"
    ]
  },
  "calendar": {
    "slug": "calendar",
    "label": "Calendario",
    "description": "Días festivos angoleños y cómputo de días hábiles.",
    "eyebrow": "categoría",
    "title": "Trabaje con feriados, días laborables y compensaciones de días hábiles.",
    "intro": "La familia de calendarios devuelve días festivos oficiales fijos y móviles, además de cálculos de días hábiles útiles para la nómina, la facturación y la programación de entregas.",
    "summaryCards": [
      {
        "label": "Rutas",
        "value": "3 GET"
      },
      {
        "label": "modelo de vacaciones",
        "value": "Fijo + móvil"
      },
      {
        "label": "Uso principal",
        "value": "Matemáticas del día laborable"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Rutas de esta familia.",
        "table": {
          "columns": [
            "Ruta",
            "Propósito",
            "consulta clave"
          ],
          "rows": [
            [
              "/api/v1/calendar/holidays",
              "Volver los días festivos durante un año.",
              "año"
            ],
            [
              "/api/v1/calendar/working-days",
              "Cuente los días laborables entre dos fechas.",
              "from, to"
            ],
            [
              "/api/v1/calendar/add-working-days",
              "Avanzar o retroceder una fecha días laborables.",
              "date, days"
            ]
          ]
        }
      },
      {
        "id": "calendar-holidays-route",
        "title": "GET /api/v1/calendar/holidays",
        "description": "Utilice los días festivos para obtener el calendario de días festivos públicos admitido en Angola para un año determinado.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "año",
              "No",
              "Año calendario opcional. El valor predeterminado es el año actual."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/calendar/holidays?year=2026\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/calendar/holidays?year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"year\": 2026,\n  \"holidays\": [\n    {\n      \"date\": \"2026-02-16\",\n      \"name\": \"Carnival Holiday\",\n      \"localName\": \"Tolerancia de Ponto de Carnaval\",\n      \"category\": \"movable\"\n    },\n    {\n      \"date\": \"2026-02-17\",\n      \"name\": \"Carnival\",\n      \"localName\": \"Carnaval\",\n      \"category\": \"movable\"\n    }\n  ]\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_YEAR\",\n    \"message\": \"The \\\"year\\\" query parameter must be an integer between 2000 and 2100.\",\n    \"field\": \"year\",\n    \"value\": 1800\n  }\n}"
          }
        ]
      },
      {
        "id": "calendar-working-days-route",
        "title": "GET /api/v1/calendar/working-days",
        "description": "Utilice los días laborables para contar los días hábiles entre dos fechas, excluyendo los fines de semana y los días festivos admitidos en Angola.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "de",
              "si",
              "Fecha de inicio en formato `YYYY-MM-DD`."
            ],
            [
              "a",
              "si",
              "Fecha de finalización en formato `YYYY-MM-DD`."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/calendar/working-days?from=2026-03-20&to=2026-03-24\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/calendar/working-days?from=2026-03-20&to=2026-03-24\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"from\": \"2026-03-20\",\n  \"to\": \"2026-03-24\",\n  \"workingDays\": 2,\n  \"excludedWeekendDays\": 2,\n  \"excludedHolidayDays\": 1\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_DATE_RANGE\",\n    \"message\": \"The \\\"from\\\" date must be earlier than or equal to the \\\"to\\\" date.\",\n    \"from\": \"2026-03-25\",\n    \"to\": \"2026-03-24\"\n  }\n}"
          }
        ]
      },
      {
        "id": "calendar-add-working-days-route",
        "title": "GET /api/v1/calendar/add-working-days",
        "description": "Utilice add-working-days para adelantar o retroceder una fecha base según el calendario de días laborables admitido.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "fecha",
              "si",
              "Fecha base en formato `YYYY-MM-DD`."
            ],
            [
              "dias",
              "si",
              "Entero con signo que representa el desplazamiento del día laborable."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/calendar/add-working-days?date=2026-03-20&days=1\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/calendar/add-working-days?date=2026-03-20&days=1\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"inputDate\": \"2026-03-20\",\n  \"days\": 1,\n  \"resultDate\": \"2026-03-24\",\n  \"direction\": \"forward\"\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_INTEGER\",\n    \"message\": \"The \\\"days\\\" query parameter must be an integer.\",\n    \"field\": \"days\",\n    \"value\": \"1.5\"\n  }\n}"
          }
        ]
      }
    ],
    "relatedSlugs": [
      "time",
      "finance",
      "examples"
    ]
  },
  "finance": {
    "slug": "finance",
    "label": "Finanzas",
    "description": "VAT, totales de facturas y ajustes por inflación para los flujos de dinero angoleños.",
    "eyebrow": "categoría",
    "title": "Calcule VAT, los totales de las facturas y los valores ajustados por inflación.",
    "intro": "Los puntos finales de finanzas proporcionan cálculos deterministas que se pueden utilizar en sistemas administrativos, estimaciones cotizadas y herramientas de generación de informes. Devuelven tanto los valores derivados como la base utilizada para alcanzarlos.",
    "summaryCards": [
      {
        "label": "Rutas",
        "value": "3 GET"
      },
      {
        "label": "Moneda",
        "value": "AOA-primero"
      },
      {
        "label": "Entrada de factura",
        "value": "JSON carga útil de consulta"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Rutas de esta familia.",
        "table": {
          "columns": [
            "Ruta",
            "Propósito",
            "consulta clave"
          ],
          "rows": [
            [
              "/api/v1/finance/vat",
              "Divida o cree totales que incluyan VAT.",
              "amount, rate, inclusive"
            ],
            [
              "/api/v1/finance/invoice-total",
              "Calcule los totales de facturas a partir de partidas individuales.",
              "lines, discount, discountType"
            ],
            [
              "/api/v1/finance/inflation-adjust",
              "Ajuste los valores a lo largo de los años utilizando la serie del IPC de Angola.",
              "amount, from, to"
            ]
          ]
        }
      },
      {
        "id": "finance-vat-route",
        "title": "GET /api/v1/finance/vat",
        "description": "Utilice VAT para dividir los totales brutos en neto más impuestos o para generar totales brutos a partir de un monto neto.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "cantidad",
              "si",
              "Monto base a evaluar."
            ],
            [
              "tarifa",
              "No",
              "Porcentaje de tasa impositiva. El valor predeterminado es 14."
            ],
            [
              "inclusivo",
              "No",
              "Cuando `true`, trata la cantidad como VAT-inclusive. Cuando `false`, trata el monto como neto."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"amount\": 114000,\n  \"rate\": 14,\n  \"inclusive\": true,\n  \"netAmount\": 100000,\n  \"vatAmount\": 14000,\n  \"grossAmount\": 114000\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_RATE\",\n    \"message\": \"Tax rates must be between 0 and 100.\",\n    \"field\": \"rate\",\n    \"value\": 140\n  }\n}"
          }
        ]
      },
      {
        "id": "finance-invoice-total-route",
        "title": "GET /api/v1/finance/invoice-total",
        "description": "Utilice el total de factura para calcular los totales de las facturas a partir de partidas codificadas sin duplicar los cálculos de precios en cada cliente.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "lineas",
              "si",
              "JSON cadena de matriz con `description`, `quantity`, `unitPrice` y `vatRate` opcional."
            ],
            [
              "descuento",
              "No",
              "Importe o porcentaje del descuento, según `discountType`."
            ],
            [
              "tipo de descuento",
              "No",
              "Ya sea `amount` o `percent`."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/invoice-total?lines=%5B%7B%22description%22%3A%22Service%22%2C%22quantity%22%3A1%2C%22unitPrice%22%3A100000%2C%22vatRate%22%3A14%7D%5D&discount=10&discountType=percent\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/invoice-total?lines=%5B%7B%22description%22%3A%22Service%22%2C%22quantity%22%3A1%2C%22unitPrice%22%3A100000%2C%22vatRate%22%3A14%7D%5D&discount=10&discountType=percent\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"discountType\": \"percent\",\n  \"subtotal\": 100000,\n  \"discountAmount\": 10000,\n  \"taxableBase\": 90000,\n  \"vatTotal\": 12600,\n  \"grandTotal\": 102600\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_JSON\",\n    \"message\": \"The \\\"lines\\\" query parameter must be a valid JSON array.\",\n    \"field\": \"lines\"\n  }\n}"
          }
        ]
      },
      {
        "id": "finance-inflation-route",
        "title": "GET /api/v1/finance/inflation-adjust",
        "description": "Utilice el ajuste por inflación para comparar los valores nominales entre los años respaldados por el IPC de Angola.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "cantidad",
              "si",
              "Importe nominal original."
            ],
            [
              "de",
              "si",
              "Fecha de origen o cadena de año. Los primeros cuatro dígitos se utilizan como año del IPC."
            ],
            [
              "a",
              "si",
              "Cadena de fecha o año objetivo. Los primeros cuatro dígitos se utilizan como año del IPC."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/inflation-adjust?amount=100000&from=2020-01-01&to=2025-01-01\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/inflation-adjust?amount=100000&from=2020-01-01&to=2025-01-01\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"amount\": 100000,\n  \"fromYear\": 2020,\n  \"toYear\": 2025,\n  \"inflationFactor\": 2.5642,\n  \"adjustedAmount\": 256420,\n  \"source\": \"Curated annual Angola CPI index series.\"\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"UNSUPPORTED_CPI_YEAR\",\n    \"message\": \"Inflation adjustment is available for Angola annual CPI years from 2019 through 2025.\",\n    \"fromYear\": 2010,\n    \"toYear\": 2025\n  }\n}"
          }
        ],
        "note": "Conserve el rango de años de cálculo siempre que el monto ajustado se utilice en los flujos de informes o fijación de precios."
      }
    ],
    "relatedSlugs": [
      "salary",
      "documents",
      "examples"
    ]
  },
  "salary": {
    "slug": "salary",
    "label": "Salario",
    "description": "Calcule el salario neto, el salario bruto y el costo para el empleador según los supuestos de la nómina de Angola.",
    "eyebrow": "categoría",
    "title": "Ejecute estimaciones de nómina en Angola para conocer las opiniones de empleados y empleadores.",
    "intro": "La familia salarial aplica supuestos internos de nómina de Angola para la seguridad social de los empleados, la seguridad social del empleador y las tablas de retención de ingresos laborales para los años respaldados.",
    "summaryCards": [
      {
        "label": "Rutas",
        "value": "3 GET"
      },
      {
        "label": "Años",
        "value": "2025 y 2026"
      },
      {
        "label": "Salidas",
        "value": "Costo neto, bruto, para el empleador"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Rutas de esta familia.",
        "table": {
          "columns": [
            "Ruta",
            "Propósito",
            "consulta clave"
          ],
          "rows": [
            [
              "/api/v1/salary/net",
              "Calcule el salario neto a partir del salario bruto.",
              "gross, year"
            ],
            [
              "/api/v1/salary/gross",
              "Calcule el salario bruto requerido para un objetivo neto.",
              "net, year"
            ],
            [
              "/api/v1/salary/employer-cost",
              "Estimar el costo del empleador, incluidas las contribuciones.",
              "gross, year"
            ]
          ]
        }
      },
      {
        "id": "salary-net-route",
        "title": "GET /api/v1/salary/net",
        "description": "Utilice neto cuando su valor fuente sea el salario bruto y desee el monto neto estimado.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "bruto",
              "si",
              "Salario mensual bruto."
            ],
            [
              "año",
              "No",
              "Año fiscal admitido. Actualmente `2025` o `2026`. El valor predeterminado es `2026`."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/salary/net?gross=500000&year=2026\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/salary/net?gross=500000&year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"year\": 2026,\n  \"grossSalary\": 500000,\n  \"taxableIncome\": 485000,\n  \"employeeSocialSecurity\": 15000,\n  \"irtRate\": 16,\n  \"irtTaxAmount\": 52100,\n  \"netSalary\": 432900,\n  \"employerContribution\": 40000,\n  \"assumptions\": [\"Applies monthly employment-income withholding for Angola.\"]\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"UNSUPPORTED_TAX_YEAR\",\n    \"message\": \"Supported salary-tax years are 2025 and 2026.\",\n    \"year\": 2024\n  }\n}"
          }
        ]
      },
      {
        "id": "salary-gross-route",
        "title": "GET /api/v1/salary/gross",
        "description": "Utilice bruto cuando el valor objetivo sea el salario neto y necesite el salario bruto aproximado necesario para alcanzarlo.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "neto",
              "si",
              "Salario neto mensual deseado."
            ],
            [
              "año",
              "No",
              "Año fiscal admitido. El valor predeterminado es `2026`."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/salary/gross?net=432900&year=2026\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/salary/gross?net=432900&year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"year\": 2026,\n  \"targetNetSalary\": 432900,\n  \"grossSalary\": 500000,\n  \"employeeSocialSecurity\": 15000,\n  \"irtTaxAmount\": 52100,\n  \"netSalary\": 432900\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_NUMBER\",\n    \"message\": \"The \\\"net\\\" query parameter must be a non-negative number.\",\n    \"field\": \"net\",\n    \"value\": \"-1\"\n  }\n}"
          }
        ]
      },
      {
        "id": "salary-employer-cost-route",
        "title": "GET /api/v1/salary/employer-cost",
        "description": "Utilice el costo del empleador cuando la planificación de la nómina necesite la contribución de la empresa además del salario bruto del empleado.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "bruto",
              "si",
              "Salario mensual bruto."
            ],
            [
              "año",
              "No",
              "Año fiscal admitido. El valor predeterminado es `2026`."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/salary/employer-cost?gross=500000&year=2026\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/salary/employer-cost?gross=500000&year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"year\": 2026,\n  \"grossSalary\": 500000,\n  \"employerContribution\": 40000,\n  \"totalEmployerCost\": 540000\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_NUMBER\",\n    \"message\": \"The \\\"gross\\\" query parameter must be a non-negative number.\",\n    \"field\": \"gross\",\n    \"value\": \"abc\"\n  }\n}"
          }
        ],
        "note": "Estos puntos finales son calculadoras de escenarios, no servicios de presentación de nóminas. Descubra las suposiciones en cualquier interfaz de usuario que muestre el resultado."
      }
    ],
    "relatedSlugs": [
      "finance",
      "time",
      "examples"
    ]
  },
  "time": {
    "slug": "time",
    "label": "tiempo",
    "description": "Verificaciones de hora local actual, conversión de zona horaria y horario comercial.",
    "eyebrow": "categoría",
    "title": "Trabaje con zonas horarias y comprobaciones de horarios comerciales locales.",
    "intro": "Los puntos finales de tiempo le brindan una pequeña capa de utilidad de zona horaria sin necesidad de incorporar una plataforma de programación completa a su aplicación.",
    "summaryCards": [
      {
        "label": "Rutas",
        "value": "3 GET"
      },
      {
        "label": "Zona predeterminada",
        "value": "África/Luanda"
      },
      {
        "label": "ventana de negocios",
        "value": "08:00 a 17:00"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Rutas de esta familia.",
        "table": {
          "columns": [
            "Ruta",
            "Propósito",
            "consulta clave"
          ],
          "rows": [
            [
              "/api/v1/time/now",
              "Devuelve la hora actual de una zona horaria.",
              "zona horaria"
            ],
            [
              "/api/v1/time/convert",
              "Convierta una fecha y hora de una zona horaria a otra.",
              "datetime, from, to"
            ],
            [
              "/api/v1/time/business-hours",
              "Compruebe si una fecha y hora cae dentro del horario comercial.",
              "datetime, timezone, start, end"
            ]
          ]
        }
      },
      {
        "id": "time-now-route",
        "title": "GET /api/v1/time/now",
        "description": "Úselo ahora cuando necesite la hora local actual para una zona horaria específica de la IANA.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "zona horaria",
              "No",
              "Zona horaria de la IANA. El valor predeterminado es `Africa/Luanda`."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/time/now?timezone=Africa/Luanda\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/time/now?timezone=Africa/Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"iso\": \"2026-03-23T18:45:00\",\n  \"timezone\": \"Africa/Luanda\",\n  \"offset\": \"GMT+1\",\n  \"components\": {\n    \"year\": 2026,\n    \"month\": 3,\n    \"day\": 23,\n    \"hour\": 18,\n    \"minute\": 45,\n    \"second\": 0,\n    \"weekday\": 1\n  }\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_TIMEZONE\",\n    \"message\": \"The supplied timezone is not supported by the runtime.\",\n    \"field\": \"timezone\",\n    \"value\": \"Mars/Base\"\n  }\n}"
          }
        ]
      },
      {
        "id": "time-convert-route",
        "title": "GET /api/v1/time/convert",
        "description": "Utilice convert para transformar una fecha y hora local o absoluta de una zona horaria a otra.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "fecha y hora",
              "si",
              "Fecha y hora ISO. Si no se proporciona ningún desplazamiento, la ruta lo interpreta en la zona horaria de origen."
            ],
            [
              "de",
              "si",
              "Fuente Zona horaria de la IANA."
            ],
            [
              "a",
              "si",
              "Zona horaria de la IANA de destino."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/time/convert?datetime=2026-03-23T10:00:00&from=Africa/Luanda&to=UTC\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/time/convert?datetime=2026-03-23T10:00:00&from=Africa/Luanda&to=UTC\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"input\": {\n    \"datetime\": \"2026-03-23T10:00:00\",\n    \"timezone\": \"Africa/Luanda\"\n  },\n  \"source\": {\n    \"iso\": \"2026-03-23T10:00:00\",\n    \"timezone\": \"Africa/Luanda\"\n  },\n  \"target\": {\n    \"iso\": \"2026-03-23T09:00:00\",\n    \"timezone\": \"UTC\"\n  }\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_DATETIME\",\n    \"message\": \"Date-times without an offset must use YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss format.\",\n    \"field\": \"datetime\",\n    \"value\": \"23/03/2026 10:00\"\n  }\n}"
          }
        ]
      },
      {
        "id": "time-business-hours-route",
        "title": "GET /api/v1/time/business-hours",
        "description": "Utilice el horario comercial antes de enviar notificaciones, llamadas o recordatorios que deben respetar la ventana de la oficina local.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "fecha y hora",
              "si",
              "Fecha y hora ISO para evaluar."
            ],
            [
              "zona horaria",
              "No",
              "Zona horaria de la IANA. El valor predeterminado es `Africa/Luanda`."
            ],
            [
              "empezar",
              "No",
              "Hora de inicio del día hábil en `HH:mm`. El valor predeterminado es `08:00`."
            ],
            [
              "fin",
              "No",
              "Hora de finalización del día hábil en `HH:mm`. El valor predeterminado es `17:00`."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/time/business-hours?datetime=2026-03-23T09:30:00&timezone=Africa/Luanda\""
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/time/business-hours?datetime=2026-03-23T09:30:00&timezone=Africa/Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "json",
            "content": "{\n  \"timezone\": \"Africa/Luanda\",\n  \"businessHours\": {\n    \"start\": \"08:00\",\n    \"end\": \"17:00\",\n    \"timezone\": \"Africa/Luanda\"\n  },\n  \"isBusinessDay\": true,\n  \"isWithinBusinessHours\": true\n}"
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_TIME\",\n    \"message\": \"The \\\"start\\\" query parameter must use HH:mm format.\",\n    \"field\": \"start\",\n    \"value\": \"8am\"\n  }\n}"
          }
        ]
      }
    ],
    "relatedSlugs": [
      "calendar",
      "documents",
      "examples"
    ]
  },
  "documents": {
    "slug": "documents",
    "label": "Documentos",
    "description": "Genere archivos PDF de facturas, recibos y contratos a partir de cargas útiles JSON.",
    "eyebrow": "categoría",
    "title": "Genere archivos PDF de transacciones y contratos a pedido.",
    "intro": "Las rutas de documentos convierten cargas útiles compactas JSON en archivos PDF sincrónicos que pueden descargarse directamente o almacenarse mediante su propia aplicación.",
    "summaryCards": [
      {
        "label": "Rutas",
        "value": "3 POST"
      },
      {
        "label": "Formato",
        "value": "PDF archivos adjuntos"
      },
      {
        "label": "Lo mejor para",
        "value": "Flujos de trabajo internos"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Rutas de esta familia.",
        "table": {
          "columns": [
            "Ruta",
            "Propósito",
            "Campos clave del cuerpo"
          ],
          "rows": [
            [
              "/api/v1/documents/invoice",
              "Generar una factura PDF.",
              "seller, buyer, items"
            ],
            [
              "/api/v1/documents/receipt",
              "Generar un recibo PDF.",
              "receivedFrom, amount"
            ],
            [
              "/api/v1/documents/contract",
              "Generar un contrato PDF.",
              "parties, clauses"
            ]
          ]
        }
      },
      {
        "id": "documents-invoice-route",
        "title": "POST /api/v1/documents/invoice",
        "description": "Utilice la factura cuando necesite una factura PDF sincrónica de una carga útil compacta JSON.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "vendedor",
              "si",
              "Objeto del vendedor con al menos `name`."
            ],
            [
              "comprador",
              "si",
              "Objeto del comprador con al menos `name`."
            ],
            [
              "artículos",
              "si",
              "Matriz de elementos con `description`, `quantity`, `unitPrice` y `vatRate` opcional."
            ],
            [
              "Número de factura/Fecha de emisión/Fecha de vencimiento/notas",
              "No",
              "Campos opcionales de metadatos de factura."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/invoice \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"seller\":{\"name\":\"Orb3x, Lda\"},\"buyer\":{\"name\":\"Cliente Exemplo\"},\"items\":[{\"description\":\"Service\",\"quantity\":1,\"unitPrice\":100000,\"vatRate\":14}]}' \\\n  --output invoice.pdf"
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "import { writeFile } from \"node:fs/promises\";\n\nasync function main() {\n  const payload = {\n    \"seller\": {\n      \"name\": \"Orb3x, Lda\"\n    },\n    \"buyer\": {\n      \"name\": \"Cliente Exemplo\"\n    },\n    \"items\": [\n      {\n        \"description\": \"Service\",\n        \"quantity\": 1,\n        \"unitPrice\": 100000,\n        \"vatRate\": 14\n      }\n    ]\n  };\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/invoice\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload)\n  });\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const fileBuffer = Buffer.from(await response.arrayBuffer());\n  await writeFile(\"invoice.pdf\", fileBuffer);\n  console.log(\"Saved invoice.pdf\");\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "bash",
            "content": "HTTP/1.1 200 OK\nContent-Type: application/pdf\nContent-Disposition: attachment; filename=\"invoice.pdf\""
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_INVOICE_PAYLOAD\",\n    \"message\": \"Invoice payload must include seller, buyer, and at least one item.\"\n  }\n}"
          }
        ]
      },
      {
        "id": "documents-receipt-route",
        "title": "POST /api/v1/documents/receipt",
        "description": "Utilice el recibo para acuses de pago que solo necesiten el pagador y el monto.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "recibidoDe",
              "si",
              "Objeto de fiesta con al menos `name`."
            ],
            [
              "cantidad",
              "si",
              "Monto recibido."
            ],
            [
              "Número de recibo/emisiónFecha/motivo/método de pago/notas",
              "No",
              "Campos de metadatos de recibo opcionales."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/receipt \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"receivedFrom\":{\"name\":\"Cliente Exemplo\"},\"amount\":100000}' \\\n  --output receipt.pdf"
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "import { writeFile } from \"node:fs/promises\";\n\nasync function main() {\n  const payload = {\n    \"receivedFrom\": {\n      \"name\": \"Cliente Exemplo\"\n    },\n    \"amount\": 100000\n  };\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/receipt\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload)\n  });\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const fileBuffer = Buffer.from(await response.arrayBuffer());\n  await writeFile(\"receipt.pdf\", fileBuffer);\n  console.log(\"Saved receipt.pdf\");\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "bash",
            "content": "HTTP/1.1 200 OK\nContent-Type: application/pdf\nContent-Disposition: attachment; filename=\"receipt.pdf\""
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_RECEIPT_PAYLOAD\",\n    \"message\": \"Receipt payload must include receivedFrom and amount.\"\n  }\n}"
          }
        ]
      },
      {
        "id": "documents-contract-route",
        "title": "POST /api/v1/documents/contract",
        "description": "Utilice contrato cuando necesite un acuerdo básico PDF generado a partir de partes y cláusulas.",
        "table": {
          "columns": [
            "Parámetro",
            "Requerido",
            "Descripción"
          ],
          "rows": [
            [
              "fiestas",
              "si",
              "Matriz con al menos dos objetos de grupo."
            ],
            [
              "clausulas",
              "si",
              "Conjunto de cláusulas contractuales."
            ],
            [
              "título/contratoNúmero/emisiónFecha/notas",
              "No",
              "Campos de metadatos de contrato opcionales."
            ]
          ]
        },
        "codes": [
          {
            "label": "Uso de cURL",
            "language": "bash",
            "content": "curl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/contract \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"parties\":[{\"name\":\"Orb3x, Lda\"},{\"name\":\"Cliente Exemplo\"}],\"clauses\":[\"The provider delivers the service.\",\"The client pays within 15 days.\"]}' \\\n  --output contract.pdf"
          },
          {
            "label": "Uso de Node.js",
            "language": "js",
            "content": "import { writeFile } from \"node:fs/promises\";\n\nasync function main() {\n  const payload = {\n    \"parties\": [\n      {\n        \"name\": \"Orb3x, Lda\"\n      },\n      {\n        \"name\": \"Cliente Exemplo\"\n      }\n    ],\n    \"clauses\": [\n      \"The provider delivers the service.\",\n      \"The client pays within 15 days.\"\n    ]\n  };\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/contract\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload)\n  });\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const fileBuffer = Buffer.from(await response.arrayBuffer());\n  await writeFile(\"contract.pdf\", fileBuffer);\n  console.log(\"Saved contract.pdf\");\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 respuesta",
            "language": "bash",
            "content": "HTTP/1.1 200 OK\nContent-Type: application/pdf\nContent-Disposition: attachment; filename=\"contract.pdf\""
          },
          {
            "label": "Respuesta de error",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_CONTRACT_PAYLOAD\",\n    \"message\": \"Contract payload must include at least two parties and one clause.\"\n  }\n}"
          }
        ],
        "note": "La generación de documentos es intencionalmente limitada. Conserve la fuente JSON usted mismo si necesita auditabilidad o regeneración."
      }
    ],
    "relatedSlugs": [
      "finance",
      "validation",
      "examples"
    ]
  },
  "nif-verification": {
    "slug": "nif-verification",
    "label": "NIF Verificación",
    "description": "Comportamiento de búsqueda, campos de carga útil y modos de falla para la verificación del contribuyente.",
    "eyebrow": "Punto final",
    "title": "Busque los detalles del contribuyente a partir de un valor NIF normalizado.",
    "intro": "La ruta NIF acepta un identificador fiscal angoleño en la ruta, lo valida, solicita datos del portal fiscal público y devuelve una respuesta JSON analizada.",
    "endpoint": {
      "method": "GET",
      "path": "/api/nif/{nif}",
      "detail": "El parámetro de ruta se recorta, se pone en mayúsculas y se limita a letras y dígitos antes de intentar la búsqueda."
    },
    "summaryCards": [
      {
        "label": "Tipo de entrada",
        "value": "Parámetro de ruta"
      },
      {
        "label": "Fuente ascendente",
        "value": "Portal fiscal angoleño"
      },
      {
        "label": "falla primaria",
        "value": "Disponibilidad del portal"
      }
    ],
    "sections": [
      {
        "id": "success-shape",
        "title": "Carga útil exitosa",
        "code": {
          "label": "200 respuesta",
          "language": "json",
          "content": "{\n  \"NIF\": \"004813023LA040\",\n  \"Name\": \"EMPRESA EXEMPLO, LDA\",\n  \"Type\": \"Pessoa Colectiva\",\n  \"Status\": \"Activo\",\n  \"Defaulting\": \"Não\",\n  \"VATRegime\": \"Regime Geral\",\n  \"isTaxResident\": true\n}"
        }
      },
      {
        "id": "field-glossary",
        "title": "Campos devueltos",
        "table": {
          "columns": [
            "campo",
            "Significado"
          ],
          "rows": [
            [
              "NIF",
              "Identificador normalizado utilizado para la búsqueda y repetido en la respuesta."
            ],
            [
              "Nombre",
              "Nombre del contribuyente registrado analizado de la respuesta del portal."
            ],
            [
              "Tipo",
              "Clasificación de contribuyentes devuelta por el portal fuente."
            ],
            [
              "Estado",
              "Cadena de estado actual del contribuyente."
            ],
            [
              "Incumplimiento",
              "Si el contribuyente está marcado como en mora."
            ],
            [
              "Régimen del IVA",
              "VAT texto del régimen devuelto por el portal."
            ],
            [
              "esResidenteImpuesto",
              "Booleano derivado del marcador residente o no residente en la sección de resultados."
            ]
          ]
        }
      },
      {
        "id": "error-cases",
        "title": "¿Qué puede salir mal?",
        "bullets": [
          "Un parámetro de ruta vacío o no válido devuelve un error 400 INVALID_NIF antes de realizar cualquier llamada ascendente.",
          "Si el portal fiscal no informa ningún resultado, la ruta devuelve una respuesta 404 NIF_NOT_FOUND.",
          "El HTML con formato incorrecto o modificado estructuralmente del portal devuelve un error 502 UNPARSEABLE_RESPONSE.",
          "Los problemas de red y TLS surgen como errores de disponibilidad ascendente, con un respaldo interno para casos extremos de certificados."
        ],
        "note": "Debido a que la fuente ascendente es HTML, los cambios de esquema en el portal son el mayor riesgo de mantenimiento a largo plazo. Mantenga una prueba de contrato alrededor del analizador."
      },
      {
        "id": "integration-tips",
        "title": "Consejos de integración",
        "bullets": [
          "Normalice los espacios y mayúsculas en los identificadores ingresados por el usuario antes de crear la ruta.",
          "Trate este punto final como una verificación en vivo en lugar de una fuente de registro permanente; Los datos del portal pueden cambiar con el tiempo.",
          "Almacene el resultado de la búsqueda sin procesar junto con su propio contexto de auditoría cuando el resultado informe las acciones de cumplimiento.",
          "Muestre mensajes de usuario claros cuando el portal no esté disponible temporalmente en lugar de convertir los fallos ascendentes en errores de validación genéricos."
        ]
      }
    ],
    "relatedSlugs": [
      "api-reference",
      "getting-started",
      "examples"
    ]
  },
  "translation": {
    "slug": "translation",
    "label": "Traducción",
    "description": "Solicite reglas corporales, manejo del lenguaje y orientación práctica de integración.",
    "eyebrow": "Punto final",
    "title": "Traduzca texto con validación explícita e informes en el idioma de origen.",
    "intro": "La ruta de traducción acepta entradas JSON, valida códigos de idioma, llama al punto final de traducción pública de Google y devuelve el texto traducido con el idioma de origen detectado o proporcionado.",
    "endpoint": {
      "method": "POST",
      "path": "/api/translate",
      "detail": "Envíe JSON con texto, código de idioma de destino y un código de idioma de origen opcional. Si se omite la fuente, la ruta utiliza la detección automática."
    },
    "summaryCards": [
      {
        "label": "Tipo de entrada",
        "value": "JSON cuerpo"
      },
      {
        "label": "Validación de objetivos",
        "value": "2-12 caracteres"
      },
      {
        "label": "Detección automática",
        "value": "Habilitado por defecto"
      }
    ],
    "sections": [
      {
        "id": "request-shape",
        "title": "Solicitar carga útil",
        "code": {
          "label": "POST cuerpo",
          "language": "json",
          "content": "{\n  \"text\": \"Olá mundo\",\n  \"to\": \"en\",\n  \"from\": \"pt\"\n}"
        },
        "bullets": [
          "Se requiere texto y se recorta antes del envío.",
          "to es obligatorio y debe coincidir con un patrón de código de idioma en minúsculas simple.",
          "de es opcional; cuando está ausente, la ruta utiliza la detección automática aguas arriba.",
          "JSON no válido devuelve una respuesta 400 antes de que comience cualquier trabajo de traducción."
        ]
      },
      {
        "id": "success-shape",
        "title": "Carga útil exitosa",
        "code": {
          "label": "200 respuesta",
          "language": "json",
          "content": "{\n  \"translatedText\": \"Hello world\",\n  \"sourceLanguage\": \"pt\",\n  \"targetLanguage\": \"en\",\n  \"status\": true,\n  \"message\": \"\"\n}"
        }
      },
      {
        "id": "failure-modes",
        "title": "Modos de falla comunes",
        "table": {
          "columns": [
            "Código",
            "causa",
            "Manejo sugerido"
          ],
          "rows": [
            [
              "INVALID_TEXT",
              "El campo de texto falta o está en blanco.",
              "Bloquee el envío y solicite contenido al usuario."
            ],
            [
              "INVALID_LANGUAGE",
              "Falta el código del idioma de origen o de destino o está mal formado.",
              "Corrija la carga útil antes de volver a intentarlo."
            ],
            [
              "UPSTREAM_TIMEOUT",
              "El proveedor de traducción superó el tiempo de espera.",
              "Vuelva a intentarlo con retroceso si el flujo de usuarios lo permite."
            ],
            [
              "UPSTREAM_BAD_RESPONSE",
              "El proveedor devolvió una respuesta distinta de 200.",
              "Degradar correctamente o hacer cola para volver a intentarlo."
            ],
            [
              "UNPARSEABLE_RESPONSE",
              "El proveedor JSON no se pudo analizar en texto traducido.",
              "Alertar y volver al texto original."
            ]
          ]
        }
      },
      {
        "id": "best-practices",
        "title": "Notas de uso",
        "bullets": [
          "Conserve el texto original en su propio modelo de datos para que los editores puedan comparar la fuente y la copia traducida más adelante.",
          "Guarde en caché sus propias traducciones exitosas cuando la reutilización sea aceptable; la ruta en sí misma no almacena en caché las respuestas intencionalmente.",
          "Prefiera códigos de idioma fuente explícitos en flujos de trabajo por lotes donde ya conozca el idioma de entrada.",
          "Utilice sourceLanguage de la respuesta para marcar resultados de detección inesperados con moderación o herramientas de soporte."
        ]
      }
    ],
    "relatedSlugs": [
      "api-reference",
      "examples",
      "currency-exchange"
    ]
  },
  "currency-exchange": {
    "slug": "currency-exchange",
    "label": "Cambio de moneda",
    "description": "Búsquedas de tasas base, conversiones de cantidades y semántica de carga útil para datos FX.",
    "eyebrow": "Punto final",
    "title": "Devuelve tasas unitarias o totales convertidos desde el mismo punto final.",
    "intro": "La ruta de moneda busca metadatos y tablas de tasas para una moneda base y luego, opcionalmente, multiplica esas tasas por un parámetro de consulta de cantidad.",
    "endpoint": {
      "method": "GET",
      "path": "/api/exchange/{base}",
      "detail": "El parámetro de ruta identifica la moneda base. Agregue ?amount=value cuando también desee convertedRates precalculado en la respuesta."
    },
    "summaryCards": [
      {
        "label": "Tipo de entrada",
        "value": "Ruta + consulta"
      },
      {
        "label": "Salida extendida",
        "value": "convertedRates"
      },
      {
        "label": "Riesgo primario",
        "value": "Frescura aguas arriba"
      }
    ],
    "sections": [
      {
        "id": "lookup-shape",
        "title": "Carga útil de éxito sin cantidad",
        "code": {
          "label": "Búsqueda de tasa unitaria",
          "language": "json",
          "content": "{\n  \"currencyCode\": \"aoa\",\n  \"currencyName\": \"Angolan kwanza\",\n  \"currencySymbol\": \"Kz\",\n  \"countryName\": \"Angola\",\n  \"countryCode\": \"AO\",\n  \"flagImage\": \"https://example.com/flags/ao.png\",\n  \"ratesDate\": \"2026-03-22\",\n  \"baseCurrency\": \"AOA\",\n  \"unitRates\": {\n    \"usd\": 0.0011,\n    \"eur\": 0.0010\n  }\n}"
        }
      },
      {
        "id": "conversion-shape",
        "title": "Carga útil exitosa con cantidad",
        "code": {
          "label": "Búsqueda con conversión",
          "language": "json",
          "content": "{\n  \"baseCurrency\": \"AOA\",\n  \"amount\": 1000000,\n  \"unitRates\": {\n    \"usd\": 0.0011\n  },\n  \"convertedRates\": {\n    \"usd\": 1100\n  }\n}"
        },
        "bullets": [
          "La cantidad se analiza como un número y debe ser cero o mayor.",
          "convertedRates refleja las claves de unitRates y multiplica cada valor por cantidad.",
          "baseCurrency está normalizado a mayúsculas en la respuesta aunque la ruta acepte entradas en minúsculas."
        ]
      },
      {
        "id": "metadata",
        "title": "Campos de metadatos",
        "table": {
          "columns": [
            "campo",
            "Significado"
          ],
          "rows": [
            [
              "monedaCódigo",
              "Código de moneda base normalizado de la respuesta ascendente."
            ],
            [
              "monedaNombre",
              "Nombre para mostrar de la moneda base."
            ],
            [
              "monedaSímbolo",
              "Símbolo asociado a la moneda base."
            ],
            [
              "nombre del país / código del país",
              "Metadatos del país vinculados a la moneda base."
            ],
            [
              "banderaImagen",
              "Marcar activo URL devuelto por el proveedor ascendente."
            ],
            [
              "ratesDate",
              "Fecha adjunta a la instantánea de la tarifa ascendente."
            ]
          ]
        }
      },
      {
        "id": "implementation-guidance",
        "title": "Guía de implementación",
        "bullets": [
          "Utilice unitRates cuando necesite control total sobre el formato, el redondeo o los cálculos comerciales posteriores.",
          "Utilice convertedRates cuando el punto final esté alimentando la interfaz de usuario directamente y desee evitar cálculos duplicados entre los clientes.",
          "Protéjase contra la falta de monedas en su interfaz de usuario porque es posible que el proveedor ascendente no incluya todos los códigos en cada instantánea.",
          "Si persiste en los totales convertidos, también persista en el ratesDate para que los informes sigan siendo auditables."
        ]
      }
    ],
    "relatedSlugs": [
      "api-reference",
      "examples",
      "translation"
    ]
  },
  "examples": {
    "slug": "examples",
    "label": "Ejemplos",
    "description": "Ejemplos prácticos de cURL, Node.js y TypeScript para un uso similar al de producción.",
    "eyebrow": "Implementación",
    "title": "Ejemplos de llamada a las rutas publicadas.",
    "intro": "Los fragmentos a continuación muestran solicitudes cURL, llamadas de recuperación Node.js coincidentes y un ayudante TypeScript escrito para las rutas publicadas en este repositorio.",
    "summaryCards": [
      {
        "label": "Formatos",
        "value": "cURL + Node.js"
      },
      {
        "label": "Enfoque en el cliente",
        "value": "Recuperación segura del servidor"
      },
      {
        "label": "estrategia de error",
        "value": "Manejo consciente del código"
      }
    ],
    "sections": [
      {
        "id": "curl",
        "title": "Ejemplos de cURL y Node.js",
        "codes": [
          {
            "label": "Pruebas de humo de terminales (cURL)",
            "language": "bash",
            "content": "curl -s https://orb3x-utils-api.vercel.app/api/nif/004813023LA040\n\ncurl -s -X POST https://orb3x-utils-api.vercel.app/api/translate \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"text\":\"Preciso de ajuda\",\"to\":\"en\"}'\n\ncurl -s \"https://orb3x-utils-api.vercel.app/api/exchange/aoa?amount=250000\""
          },
          {
            "label": "Pruebas de humo de terminales (Node.js)",
            "language": "js",
            "content": "async function main() {\n  const response1 = await fetch(\"https://orb3x-utils-api.vercel.app/api/nif/004813023LA040\");\n  if (!response1.ok) {\n    throw new Error(`Request failed with status ${response1.status}`);\n  }\n  const data1 = await response1.json();\n  console.log(\"Example 1\", data1);\n\n  const payload2 = {\n    \"text\": \"Preciso de ajuda\",\n    \"to\": \"en\"\n  };\n  const response2 = await fetch(\"https://orb3x-utils-api.vercel.app/api/translate\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload2)\n  });\n  if (!response2.ok) {\n    throw new Error(`Request failed with status ${response2.status}`);\n  }\n  const data2 = await response2.json();\n  console.log(\"Example 2\", data2);\n\n  const response3 = await fetch(\"https://orb3x-utils-api.vercel.app/api/exchange/aoa?amount=250000\");\n  if (!response3.ok) {\n    throw new Error(`Request failed with status ${response3.status}`);\n  }\n  const data3 = await response3.json();\n  console.log(\"Example 3\", data3);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          }
        ]
      },
      {
        "id": "typescript",
        "title": "Ayudante TypeScript escrito",
        "code": {
          "label": "Utilidad de cliente compartido",
          "language": "ts",
          "content": "type ApiError = {\n  error?: {\n    code?: string;\n    message?: string;\n  };\n  code?: string;\n  message?: string;\n};\n\nexport async function callApi\u003cT>(input: RequestInfo, init?: RequestInit): Promise\u003cT> {\n  const response = await fetch(input, init);\n\n  if (!response.ok) {\n    const error = (await response.json().catch(() => ({}))) as ApiError;\n    throw new Error(error.error?.code ?? error.code ?? \"REQUEST_FAILED\");\n  }\n\n  return (await response.json()) as T;\n}"
        }
      },
      {
        "id": "workflow-patterns",
        "title": "Patrones de flujo de trabajo",
        "bullets": [
          "Incorporación de clientes: verifique el registro del contribuyente antes de activar una cuenta en su flujo de back-office.",
          "Canal de localización: traduzca contenido orientado al usuario y almacene tanto el texto traducido como el idioma de origen detectado.",
          "Panel de precios: solicite tarifas base una vez, luego use unitRates o convertedRates dependiendo de cuánto control necesita la interfaz de usuario.",
          "Herramientas de soporte: muestre los códigos de error ascendentes a los agentes internos para que puedan distinguir rápidamente las entradas incorrectas de las interrupciones del proveedor."
        ]
      },
      {
        "id": "production-hardening",
        "title": "Endurecimiento de producción",
        "bullets": [
          "Envuelva llamadas en un cliente compartido con formas de éxito y error escritas.",
          "Emita métricas de tiempo de espera, mala respuesta, no encontrado y tasas de entrada no válidas por separado.",
          "Mantenga la lógica de reintento cerca del límite del cliente para que el código del producto no la vuelva a implementar por función.",
          "Registre ratesDate y sourceLanguage cuando esos campos sean importantes para la auditabilidad o la revisión editorial."
        ]
      }
    ],
    "relatedSlugs": [
      "getting-started",
      "api-reference",
      "translation"
    ]
  }
};
