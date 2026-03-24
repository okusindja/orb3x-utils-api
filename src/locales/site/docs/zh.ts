import type { DocsPageMap } from '@/lib/site-content';

export const zhDocsPages: DocsPageMap = {
  "getting-started": {
    "slug": "getting-started",
    "label": "开始使用",
    "description": "路由系列、请求约定和部署说明的概述。",
    "eyebrow": "平台指南",
    "title": "开始使用已发布的 ORB3X Utils API 路由。",
    "intro": "ORB3X 实用程序 API 现在将原始 NIF、翻译和交换端点与以安哥拉为中心的验证、电话、地址、地理位置、日历、财务、工资、时间和文档实用程序相结合。所有路由都是动态的，默认为 no-store 缓存。",
    "summaryCards": [
      {
        "label": "运行时",
        "value": "Node.js 处理程序"
      },
      {
        "label": "缓存策略",
        "value": "无商店响应"
      },
      {
        "label": "端点样式",
        "value": "24 GET, 4 POST"
      }
    ],
    "sections": [
      {
        "id": "mental-model",
        "title": "从平台模型开始",
        "paragraphs": [
          "大多数新端点是由类型化内部数据集支持的本地计算器、注册表或标准化器。现有的税务、翻译和交换路线仍然调用实时上游提供商。",
          "这种分割在客户端设计中很有用：本地数据端点具有确定性且快速，而上游支持的路由需要更强的重试、超时和可观察性处理。"
        ],
        "bullets": [
          "成功和失败响应均期望 JSON。",
          "将 NIF、翻译和交换响应视为动态且时间敏感的。",
          "将工资、VAT 和通货膨胀输出视为假设驱动的计算器，并保留您使用的年份或利率输入。",
          "在决定重试时，请读取返回的错误代码，而不仅仅是 HTTP 状态。",
          "在调用端点之前标准化您自己的用户输入，以减少可避免的 400 响应。"
        ]
      },
      {
        "id": "request-conventions",
        "title": "共享请求约定",
        "table": {
          "columns": [
            "关注",
            "行为"
          ],
          "rows": [
            [
              "交通",
              "HTTPS JSON API 专为服务器端和浏览器端消费者设计。"
            ],
            [
              "缓存",
              "响应将 Cache-Control 全面设置为 no-store ，以便集成始终读取实时结果。"
            ],
            [
              "超时配置文件",
              "处理程序最多允许 30 秒；只有一部分传统路由依赖于第三方上游调用。"
            ],
            [
              "验证",
              "查询参数、路径值和 POST 主体在业务逻辑运行之前进行清理。"
            ],
            [
              "错误处理",
              "验证错误返回 400 级代码，具有稳定的机器可读 error.code 值。"
            ]
          ]
        }
      },
      {
        "id": "first-calls",
        "title": "发出第一个成功请求",
        "description": "在将每个路由集成到应用程序代码之前，运行一个请求。",
        "codes": [
          {
            "label": "启动冒烟测试 (cURL)",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\"\n\ncurl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=%2B244923456789\"\n\ncurl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\"\n\ncurl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/invoice \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"seller\":{\"name\":\"Orb3x, Lda\"},\"buyer\":{\"name\":\"Cliente Exemplo\"},\"items\":[{\"description\":\"Service\",\"quantity\":1,\"unitPrice\":100000,\"vatRate\":14}]}'"
          },
          {
            "label": "启动冒烟测试 (Node.js)",
            "language": "js",
            "content": "async function main() {\n  const response1 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\");\n  if (!response1.ok) {\n    throw new Error(`Request failed with status ${response1.status}`);\n  }\n  const data1 = await response1.json();\n  console.log(\"Example 1\", data1);\n\n  const response2 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=%2B244923456789\");\n  if (!response2.ok) {\n    throw new Error(`Request failed with status ${response2.status}`);\n  }\n  const data2 = await response2.json();\n  console.log(\"Example 2\", data2);\n\n  const response3 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\");\n  if (!response3.ok) {\n    throw new Error(`Request failed with status ${response3.status}`);\n  }\n  const data3 = await response3.json();\n  console.log(\"Example 3\", data3);\n\n  const payload4 = {\n    \"seller\": {\n      \"name\": \"Orb3x, Lda\"\n    },\n    \"buyer\": {\n      \"name\": \"Cliente Exemplo\"\n    },\n    \"items\": [\n      {\n        \"description\": \"Service\",\n        \"quantity\": 1,\n        \"unitPrice\": 100000,\n        \"vatRate\": 14\n      }\n    ]\n  };\n  const response4 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/invoice\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload4)\n  });\n  if (!response4.ok) {\n    throw new Error(`Request failed with status ${response4.status}`);\n  }\n  const data4 = await response4.json();\n  console.log(\"Example 4\", data4);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          }
        ],
        "bullets": [
          "验证来自您部署的确切运行时的文档路由，因为 PDF 生成在服务器端运行。",
          "记录 NIF、转换和交换端点的请求 ID 和上游错误代码。",
          "围绕假设驱动的输出（例如工资、通货膨胀和编号计划可用性）建立响应防护。"
        ]
      },
      {
        "id": "launch-checklist",
        "title": "生产启动清单",
        "bullets": [
          "集中基本 URL 配置，以便无需编辑代码即可切换临时环境和生产环境。",
          "使用存储 HTTP 状态、端点、代码和请求上下文的结构化日志记录捕获非 200 响应。",
          "仅针对上游超时和可用性故障定义重试策略；不要重试无效的输入错误。",
          "每当财务输出流入发票、工资单或报告时，存储计算年份或费率输入。",
          "在将用户输入传递到持久性或交付工作流程之前，验证文档生成的 POST 有效负载。",
          "为 CI 中的每个端点保留轻量级契约测试，以捕获意外的响应形状回归。"
        ],
        "note": "如果您只实现一层防御层，请使其明确的错误代码处理。这是区分可重试失败和错误请求的最简单方法。"
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
    "label": "API 参考",
    "description": "整个已发布的 API 表面的规范请求和响应行为。",
    "eyebrow": "参考",
    "title": "共享请求和响应行为的参考。",
    "intro": "本参考总结了当前安哥拉公用事业表面共享的约定，包括验证、地理、财务、工资、时间和文档路线以及原始上游支持的端点。",
    "summaryCards": [
      {
        "label": "已发布的端点",
        "value": "28"
      },
      {
        "label": "成功格式",
        "value": "仅限 JSON"
      },
      {
        "label": "二元反应",
        "value": "POST 文档上的 PDF"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "端点目录",
        "table": {
          "columns": [
            "路线",
            "方法",
            "目的",
            "按键输入"
          ],
          "rows": [
            [
              "/api/v1/validate/*",
              "GET",
              "验证安哥拉 IBAN 和当地银行账户结构。",
              "iban或账户查询"
            ],
            [
              "/api/v1/phone/*",
              "GET",
              "解析电话号码、验证格式并检测运营商。",
              "电话查询"
            ],
            [
              "/api/v1/address/* + /api/v1/geo/*",
              "GET",
              "标准化地址并读取安哥拉位置注册表。",
              "q, province, municipality, address"
            ],
            [
              "/api/v1/calendar/*",
              "GET",
              "返回假期和工作日计算。",
              "年、从/到、日期/天"
            ],
            [
              "/api/v1/finance/*",
              "GET",
              "运行 VAT、发票和通货膨胀计算。",
              "金额或行数查询"
            ],
            [
              "/api/v1/salary/*",
              "GET",
              "估计工资净值、毛值和雇主成本值。",
              "总查询或净查询"
            ],
            [
              "/api/v1/time/*",
              "GET",
              "读取当前时间、转换时区并检查营业时间。",
              "时区、日期时间、开始/结束"
            ],
            [
              "/api/v1/documents/*",
              "POST",
              "生成发票、收据和合同 PDF。",
              "JSON 主体"
            ],
            [
              "/api/nif/{nif}",
              "GET",
              "查找安哥拉纳税人身份字段。",
              "NIF 路径参数"
            ],
            [
              "/api/translate",
              "POST",
              "翻译文本并返回检测到的源语言。",
              "JSON body：文本，至，可选自"
            ],
            [
              "/api/exchange/{base}",
              "GET",
              "返回汇率，可以选择乘以金额。",
              "基本路径参数，可选金额查询"
            ]
          ]
        }
      },
      {
        "id": "response-patterns",
        "title": "反应模式",
        "paragraphs": [
          "成功有效负载是特定于端点的，但它们保持平坦且面向应用程序。计算器端点表面导出值加上用于生成它们的假设或基础。",
          "文档路由是主要的例外：它们返回带有附件标头的二进制 PDF 响应。当出现问题时，大多数其他端点都会返回 JSON 和错误信封。"
        ],
        "code": {
          "label": "典型错误响应",
          "language": "json",
          "content": "{\n  \"error\": {\n    \"code\": \"UPSTREAM_TIMEOUT\",\n    \"message\": \"The currency service did not respond in time.\",\n    \"baseCurrency\": \"AOA\",\n    \"amount\": \"1000000\"\n  }\n}"
        }
      },
      {
        "id": "status-codes",
        "title": "状态代码和意图",
        "table": {
          "columns": [
            "状态",
            "含义",
            "典型动作"
          ],
          "rows": [
            [
              "200",
              "验证请求成功。",
              "直接使用有效负载。"
            ],
            [
              "400",
              "输入丢失、格式错误或不受支持。",
              "修复请求；无需重试。"
            ],
            [
              "404",
              "在上游找不到请求的资源。",
              "显示明确的未找到状态。"
            ],
            [
              "502",
              "上游服务失败或返回格式错误的数据。",
              "重试退避或优雅降级。"
            ],
            [
              "504",
              "上游依赖超时。",
              "如果用户流量可以承受，请重试。"
            ],
            [
              "500",
              "意外的内部故障。",
              "仅当您的用户体验允许时，才记录、发出警报并视为可重试。"
            ]
          ]
        }
      },
      {
        "id": "operational-notes",
        "title": "操作注意事项",
        "bullets": [
          "所有路由处理程序都标记为动态，因此您不应依赖构建时预渲染响应。",
          "用户代理标头是为上游支持的遗留请求显式设置的，以提高提供程序兼容性。",
          "输入清理是保守的：在请求分派之前对路由参数进行修剪和标准化。",
          "银行验证响应包括生成的银行图像徽章，因此前端可以呈现可识别的视觉效果，而无需额外的查找。",
          "文档端点是同步的；保持有效负载紧凑，并在需要时在您自己的系统中异步执行下游存储。"
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
    "label": "验证",
    "description": "IBAN 和通过银行检测进行安哥拉当地银行账户验证。",
    "eyebrow": "类别",
    "title": "验证安哥拉银行标识符并检测发卡银行。",
    "intro": "验证系列涵盖 `/api/v1/validate/iban` 和 `/api/v1/validate/bank-account`。这两个路由都会对输入进行标准化，根据银行代码检测银行，并返回生成的银行徽章图像以供 UI 使用。",
    "summaryCards": [
      {
        "label": "路线",
        "value": "2 GET"
      },
      {
        "label": "国家范围",
        "value": "安哥拉"
      },
      {
        "label": "视觉输出",
        "value": "银行徽章图片"
      }
    ],
    "sections": [
      {
        "id": "routes",
        "title": "该系列中的路线",
        "table": {
          "columns": [
            "路线",
            "目的",
            "按键查询"
          ],
          "rows": [
            [
              "/api/v1/validate/iban",
              "使用 mod-97 检查和银行查询验证 AO 格式的 IBAN。",
              "伊班"
            ],
            [
              "/api/v1/validate/bank-account",
              "验证 21 位本地帐户结构并派生匹配的 IBAN。",
              "帐户"
            ]
          ]
        }
      },
      {
        "id": "validate-iban-route",
        "title": "GET /api/v1/validate/iban",
        "description": "当您已经拥有完整的 AO IBAN 并且需要标准化部件、库元数据和验证标志时，请使用此路线。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "伊班",
              "是的",
              "AO 格式 IBAN。处理程序在检查之前会修剪分隔符并将值大写。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"isValid\": true,\n  \"normalized\": \"AO06004000010123456789012\",\n  \"formatted\": \"AO06 0040 0001 0123 4567 8901 2\",\n  \"countryCode\": \"AO\",\n  \"checkDigits\": \"06\",\n  \"bank\": {\n    \"code\": \"BAI\",\n    \"ibanBankCode\": \"0040\",\n    \"name\": \"Banco Angolano de Investimentos\",\n    \"image\": \"data:image/svg+xml;base64,...\"\n  },\n  \"components\": {\n    \"bankCode\": \"0040\",\n    \"branchCode\": \"0001\",\n    \"accountNumber\": \"01234567890\",\n    \"controlDigits\": \"12\"\n  },\n  \"validation\": {\n    \"countrySupported\": true,\n    \"lengthValid\": true,\n    \"bankCodeKnown\": true,\n    \"mod97Valid\": true\n  }\n}"
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_IBAN\",\n    \"message\": \"Angolan IBANs must contain exactly 25 characters.\",\n    \"field\": \"iban\",\n    \"length\": 18\n  }\n}"
          }
        ],
        "bullets": [
          "当您需要精细的 UI 状态时，请检查 `validation.mod97Valid` 和 `validation.bankCodeKnown`，而不是单独依赖 `isValid`。",
          "直接在付款摘要或验证卡中使用 `bank.image`。"
        ]
      },
      {
        "id": "validate-bank-account-route",
        "title": "GET /api/v1/validate/bank-account",
        "description": "当您需要结构验证和匹配的派生 IBAN 时，请将此路由用于本地 21 位帐户字符串。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "帐户",
              "是的",
              "21 位安哥拉本地账户字符串。非数字分隔符将被忽略。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/validate/bank-account?account=004000010123456789012\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/validate/bank-account?account=004000010123456789012\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"isValid\": true,\n  \"normalized\": \"004000010123456789012\",\n  \"formatted\": \"0040 0001 0123 4567 8901 2\",\n  \"derivedIban\": \"AO06004000010123456789012\",\n  \"bankRecognized\": true,\n  \"bank\": {\n    \"code\": \"BAI\",\n    \"name\": \"Banco Angolano de Investimentos\",\n    \"image\": \"data:image/svg+xml;base64,...\"\n  },\n  \"components\": {\n    \"bankCode\": \"0040\",\n    \"branchCode\": \"0001\",\n    \"accountNumber\": \"01234567890\",\n    \"controlDigits\": \"12\"\n  },\n  \"validation\": {\n    \"formatValid\": true,\n    \"bankCodeKnown\": true,\n    \"controlDigitsPresent\": true\n  }\n}"
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_BANK_ACCOUNT\",\n    \"message\": \"Angolan local bank account numbers must contain exactly 21 digits.\",\n    \"field\": \"account\",\n    \"length\": 9\n  }\n}"
          }
        ],
        "bullets": [
          "这是结构验证，而不是确认该帐户在银行网络中处于活动状态。",
          "保留规范化帐户或派生的 IBAN 而不是原始输入字符串。"
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
    "label": "电话",
    "description": "按运营商解析、验证和分类安哥拉电话号码。",
    "eyebrow": "类别",
    "title": "解析安哥拉号码并对编号范围进行分类。",
    "intro": "电话路由标准化本地或国际输入、单独的国家/地区和国家部分，并在范围已知时将移动前缀映射到 Unitel、Africell 或 Movicel。",
    "summaryCards": [
      {
        "label": "路线",
        "value": "3 GET"
      },
      {
        "label": "国家代码",
        "value": "+244"
      },
      {
        "label": "可用性模型",
        "value": "编号方案"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "该系列中的路线",
        "table": {
          "columns": [
            "路线",
            "目的",
            "按键查询"
          ],
          "rows": [
            [
              "/api/v1/phone/parse",
              "返回结构化电话号码组件和格式。",
              "电话"
            ],
            [
              "/api/v1/phone/validate",
              "验证格式并报告编号计划的可用性。",
              "电话"
            ],
            [
              "/api/v1/phone/operator",
              "从范围前缀中检测移动运营商。",
              "电话"
            ]
          ]
        }
      },
      {
        "id": "phone-parse-route",
        "title": "GET /api/v1/phone/parse",
        "description": "当您需要规范化的数字以及可重用的存储或 UI 格式时，请使用解析。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "电话",
              "是的",
              "安哥拉本地或国际号码，例如 `923456789` 或 `+244923456789`。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/parse?phone=%2B244923456789\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/parse?phone=%2B244923456789\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"normalized\": \"+244923456789\",\n  \"countryCode\": \"+244\",\n  \"nationalNumber\": \"923456789\",\n  \"internationalFormat\": \"+244 923 456 789\",\n  \"nationalFormat\": \"923 456 789\",\n  \"isMobile\": true,\n  \"type\": \"mobile\",\n  \"prefix\": \"92\",\n  \"subscriberNumber\": \"3456789\",\n  \"operator\": {\n    \"code\": \"UNITEL\",\n    \"name\": \"Unitel\",\n    \"prefix\": \"92\",\n    \"prefixes\": [\"92\", \"93\", \"94\"]\n  }\n}"
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_PHONE\",\n    \"message\": \"Angolan phone numbers must contain 9 national digits.\",\n    \"field\": \"phone\",\n    \"length\": 6\n  }\n}"
          }
        ]
      },
      {
        "id": "phone-validate-route",
        "title": "GET /api/v1/phone/validate",
        "description": "当您需要通过/失败结果以及编号计划可用性信息时，请使用验证。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "电话",
              "是的",
              "安哥拉本地或国际电话号码。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=952345678\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=952345678\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"isValid\": true,\n  \"normalized\": \"+244952345678\",\n  \"type\": \"mobile\",\n  \"operator\": {\n    \"code\": \"AFRICELL\",\n    \"name\": \"Africell\",\n    \"prefix\": \"95\",\n    \"prefixes\": [\"95\"]\n  },\n  \"availability\": {\n    \"type\": \"numbering-plan\",\n    \"status\": \"allocated-range\",\n    \"canConfirmLiveSubscriber\": false\n  }\n}"
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_PHONE\",\n    \"message\": \"The \\\"phone\\\" query parameter is required.\",\n    \"field\": \"phone\"\n  }\n}"
          }
        ],
        "note": "可用性基于已知的安哥拉编号范围。它不确认实时订阅者的可达性。"
      },
      {
        "id": "phone-operator-route",
        "title": "GET /api/v1/phone/operator",
        "description": "当您只需要运算符查找而不需要解析电话有效负载的其余部分时，请使用运算符。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "电话",
              "是的",
              "安哥拉本地或国际电话号码。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/operator?phone=912345678\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/operator?phone=912345678\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"phone\": \"912345678\",\n  \"operator\": {\n    \"code\": \"MOVICEL\",\n    \"name\": \"Movicel\",\n    \"prefix\": \"91\",\n    \"prefixes\": [\"91\", \"99\"]\n  }\n}"
          },
          {
            "label": "错误响应",
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
    "label": "地址和地理位置",
    "description": "标准化安哥拉地址并读取省、市和公社。",
    "eyebrow": "类别",
    "title": "标准化安哥拉地址并查询位置注册表。",
    "intro": "地址标准化和建议由精心策划的安哥拉地理注册表支持。地理路线返回省、市和社区数据，这些数据可以驱动管理表单和自动完成流程。",
    "summaryCards": [
      {
        "label": "路线",
        "value": "5 GET"
      },
      {
        "label": "地理级别",
        "value": "省到公社"
      },
      {
        "label": "自动完成",
        "value": "上城区 + 公社 + 市政府"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "该系列中的路线",
        "table": {
          "columns": [
            "路线",
            "目的",
            "按键查询"
          ],
          "rows": [
            [
              "/api/v1/address/normalize",
              "清理并构建自由文本安哥拉地址。",
              "地址"
            ],
            [
              "/api/v1/address/suggest",
              "建议市镇、公社或市政府。",
              "q, type, province, municipality"
            ],
            [
              "/api/v1/geo/provinces",
              "列出 安哥拉 的所有省份。",
              "无"
            ],
            [
              "/api/v1/geo/municipalities",
              "列出城市，可以选择按省进行过滤。",
              "省份"
            ],
            [
              "/api/v1/geo/communes",
              "列出一个市镇的公社。",
              "直辖市，可选省份"
            ]
          ]
        }
      },
      {
        "id": "address-normalize-route",
        "title": "GET /api/v1/address/normalize",
        "description": "在保留自由文本地址或将其与内部记录进行匹配之前，请使用标准化来清理自由文本地址。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "地址",
              "是的",
              "免费文本安哥拉地址。常见缩写如 `prov.` 和 `mun.` 会自动扩展。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/address/normalize?address=Benfica,%20Luanda\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/address/normalize?address=Benfica,%20Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"input\": \"Benfica, Luanda\",\n  \"normalized\": \"Benfica, Luanda\",\n  \"components\": {\n    \"bairro\": \"Benfica\",\n    \"commune\": \"Benfica\",\n    \"municipality\": \"Belas\",\n    \"province\": \"Luanda\"\n  },\n  \"diagnostics\": {\n    \"provinceMatched\": true,\n    \"municipalityMatched\": true,\n    \"communeMatched\": true,\n    \"bairroMatched\": true\n  }\n}"
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_ADDRESS\",\n    \"message\": \"The \\\"address\\\" query parameter is required.\",\n    \"field\": \"address\"\n  }\n}"
          }
        ]
      },
      {
        "id": "address-suggest-route",
        "title": "GET /api/v1/address/suggest",
        "description": "使用建议来驱动市政厅、公社、直辖市和省的自动填充字段。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "q",
              "是的",
              "搜索片段。"
            ],
            [
              "类型",
              "否",
              "可选过滤器：`bairro`、`commune`、`municipality` 或 `province`。"
            ],
            [
              "省份",
              "否",
              "可选省份过滤器。"
            ],
            [
              "市政府",
              "否",
              "可选的市政过滤器。"
            ],
            [
              "限制",
              "否",
              "返回的建议的最大数量。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/address/suggest?q=tal&type=municipality&province=Luanda\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/address/suggest?q=tal&type=municipality&province=Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"query\": \"tal\",\n  \"suggestions\": [\n    {\n      \"type\": \"municipality\",\n      \"label\": \"Talatona\",\n      \"province\": \"Luanda\",\n      \"municipality\": \"Talatona\"\n    }\n  ]\n}"
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"MISSING_QUERY_PARAMETER\",\n    \"message\": \"The \\\"q\\\" query parameter is required.\",\n    \"field\": \"q\"\n  }\n}"
          }
        ]
      },
      {
        "id": "geo-provinces-route",
        "title": "GET /api/v1/geo/provinces",
        "description": "使用省份作为位置选择器和管理过滤的顶级注册表源。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": []
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/geo/provinces\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/geo/provinces\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"country\": \"AO\",\n  \"countryName\": \"Angola\",\n  \"provinces\": [\n    {\n      \"name\": \"Luanda\",\n      \"slug\": \"luanda\",\n      \"capital\": \"Luanda\",\n      \"municipalityCount\": 16\n    }\n  ]\n}"
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INTERNAL_SERVER_ERROR\",\n    \"message\": \"Unexpected error while listing provinces.\"\n  }\n}"
          }
        ]
      },
      {
        "id": "geo-municipalities-route",
        "title": "GET /api/v1/geo/municipalities",
        "description": "使用市政当局填充二级位置选择器，无论是否有省份过滤器。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "省份",
              "否",
              "用于过滤列表的可选省份名称。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/geo/municipalities?province=Luanda\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/geo/municipalities?province=Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"province\": \"Luanda\",\n  \"municipalities\": [\n    {\n      \"name\": \"Talatona\",\n      \"slug\": \"talatona\",\n      \"province\": \"Luanda\",\n      \"communeCount\": 2\n    }\n  ]\n}"
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"PROVINCE_NOT_FOUND\",\n    \"message\": \"No Angolan province matched the supplied query.\",\n    \"field\": \"province\",\n    \"value\": \"Atlantis\"\n  }\n}"
          }
        ]
      },
      {
        "id": "geo-communes-route",
        "title": "GET /api/v1/geo/communes",
        "description": "当已经选择了一个城市并且您需要下一个行政级别时，请使用公社。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "市政府",
              "是的",
              "市镇名称扩大。"
            ],
            [
              "省份",
              "否",
              "可选省份名称，用于消除重复的城市标签的歧义。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/geo/communes?municipality=Talatona&province=Luanda\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/geo/communes?municipality=Talatona&province=Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"municipality\": \"Talatona\",\n  \"province\": \"Luanda\",\n  \"coverage\": \"curated\",\n  \"communes\": [\n    { \"name\": \"Cidade Universitaria\", \"slug\": \"cidade-universitaria\" },\n    { \"name\": \"Talatona\", \"slug\": \"talatona\" }\n  ]\n}"
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"MISSING_QUERY_PARAMETER\",\n    \"message\": \"The \\\"municipality\\\" query parameter is required.\",\n    \"field\": \"municipality\"\n  }\n}"
          }
        ],
        "note": "一些城市使用精心策划的公社细节，而其他城市目前只提供座位覆盖。"
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
    "label": "日历",
    "description": "安哥拉公共假期和工作日计算。",
    "eyebrow": "类别",
    "title": "使用假期、工作日和工作日偏移。",
    "intro": "日历系列返回官方固定和可移动假期以及对工资单、发票和交货安排有用的工作日计算。",
    "summaryCards": [
      {
        "label": "路线",
        "value": "3 GET"
      },
      {
        "label": "假日模型",
        "value": "固定+移动"
      },
      {
        "label": "核心用途",
        "value": "工作日数学"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "该系列中的路线",
        "table": {
          "columns": [
            "路线",
            "目的",
            "按键查询"
          ],
          "rows": [
            [
              "/api/v1/calendar/holidays",
              "返回一年的公共假期。",
              "年"
            ],
            [
              "/api/v1/calendar/working-days",
              "计算两个日期之间的工作日。",
              "from, to"
            ],
            [
              "/api/v1/calendar/add-working-days",
              "将日期向前或向后移动工作日。",
              "date, days"
            ]
          ]
        }
      },
      {
        "id": "calendar-holidays-route",
        "title": "GET /api/v1/calendar/holidays",
        "description": "使用假期获取给定年份受支持的安哥拉公共假期时间表。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "年",
              "否",
              "可选日历年。默认为当前年份。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/calendar/holidays?year=2026\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/calendar/holidays?year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"year\": 2026,\n  \"holidays\": [\n    {\n      \"date\": \"2026-02-16\",\n      \"name\": \"Carnival Holiday\",\n      \"localName\": \"Tolerancia de Ponto de Carnaval\",\n      \"category\": \"movable\"\n    },\n    {\n      \"date\": \"2026-02-17\",\n      \"name\": \"Carnival\",\n      \"localName\": \"Carnaval\",\n      \"category\": \"movable\"\n    }\n  ]\n}"
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_YEAR\",\n    \"message\": \"The \\\"year\\\" query parameter must be an integer between 2000 and 2100.\",\n    \"field\": \"year\",\n    \"value\": 1800\n  }\n}"
          }
        ]
      },
      {
        "id": "calendar-working-days-route",
        "title": "GET /api/v1/calendar/working-days",
        "description": "使用工作日来计算两个日期之间的工作日，同时排除周末和支持的安哥拉假期。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "来自",
              "是的",
              "开始日期，采用 `YYYY-MM-DD` 格式。"
            ],
            [
              "到",
              "是的",
              "结束日期，采用 `YYYY-MM-DD` 格式。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/calendar/working-days?from=2026-03-20&to=2026-03-24\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/calendar/working-days?from=2026-03-20&to=2026-03-24\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"from\": \"2026-03-20\",\n  \"to\": \"2026-03-24\",\n  \"workingDays\": 2,\n  \"excludedWeekendDays\": 2,\n  \"excludedHolidayDays\": 1\n}"
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_DATE_RANGE\",\n    \"message\": \"The \\\"from\\\" date must be earlier than or equal to the \\\"to\\\" date.\",\n    \"from\": \"2026-03-25\",\n    \"to\": \"2026-03-24\"\n  }\n}"
          }
        ]
      },
      {
        "id": "calendar-add-working-days-route",
        "title": "GET /api/v1/calendar/add-working-days",
        "description": "使用 add-working-days 根据支持的工作日日历向前或向后移动基准日期。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "日期",
              "是的",
              "`YYYY-MM-DD` 格式的基准日期。"
            ],
            [
              "天",
              "是的",
              "表示工作日偏移量的有符号整数。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/calendar/add-working-days?date=2026-03-20&days=1\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/calendar/add-working-days?date=2026-03-20&days=1\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"inputDate\": \"2026-03-20\",\n  \"days\": 1,\n  \"resultDate\": \"2026-03-24\",\n  \"direction\": \"forward\"\n}"
          },
          {
            "label": "错误响应",
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
    "label": "金融",
    "description": "VAT、发票总额以及安哥拉资金流的通货膨胀调整。",
    "eyebrow": "类别",
    "title": "计算 VAT、发票总额和通货膨胀调整值。",
    "intro": "财务端点提供可用于后台系统、报价估算和报告工具的确定性计算。它们返回派生值以及用于实现这些值的基础。",
    "summaryCards": [
      {
        "label": "路线",
        "value": "3 GET"
      },
      {
        "label": "货币",
        "value": "AOA优先"
      },
      {
        "label": "发票输入",
        "value": "JSON 查询负载"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "该系列中的路线",
        "table": {
          "columns": [
            "路线",
            "目的",
            "按键查询"
          ],
          "rows": [
            [
              "/api/v1/finance/vat",
              "拆分或构建包含 VAT 在内的总数。",
              "amount, rate, inclusive"
            ],
            [
              "/api/v1/finance/invoice-total",
              "根据行项目计算发票总计。",
              "lines, discount, discountType"
            ],
            [
              "/api/v1/finance/inflation-adjust",
              "使用安哥拉 CPI 系列调整各年份的值。",
              "amount, from, to"
            ]
          ]
        }
      },
      {
        "id": "finance-vat-route",
        "title": "GET /api/v1/finance/vat",
        "description": "使用 VAT 将总总额拆分为净额加税或根据净额构建总总额。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "金额",
              "是的",
              "评估的基础金额。"
            ],
            [
              "率",
              "否",
              "税率百分比。默认为 14。"
            ],
            [
              "包容性",
              "否",
              "当 `true` 时，将金额视为 VAT（含）。当 `false` 时，将金额视为净额。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"amount\": 114000,\n  \"rate\": 14,\n  \"inclusive\": true,\n  \"netAmount\": 100000,\n  \"vatAmount\": 14000,\n  \"grossAmount\": 114000\n}"
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_RATE\",\n    \"message\": \"Tax rates must be between 0 and 100.\",\n    \"field\": \"rate\",\n    \"value\": 140\n  }\n}"
          }
        ]
      },
      {
        "id": "finance-invoice-total-route",
        "title": "GET /api/v1/finance/invoice-total",
        "description": "使用发票总计根据编码行项目计算发票总计，而无需在每个客户端中重复定价数学。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "线",
              "是的",
              "JSON 数组字符串，包含 `description`、`quantity`、`unitPrice` 和可选的 `vatRate`。"
            ],
            [
              "折扣",
              "否",
              "折扣金额或百分比，取决于 `discountType`。"
            ],
            [
              "折扣类型",
              "否",
              "`amount` 或 `percent`。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/invoice-total?lines=%5B%7B%22description%22%3A%22Service%22%2C%22quantity%22%3A1%2C%22unitPrice%22%3A100000%2C%22vatRate%22%3A14%7D%5D&discount=10&discountType=percent\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/invoice-total?lines=%5B%7B%22description%22%3A%22Service%22%2C%22quantity%22%3A1%2C%22unitPrice%22%3A100000%2C%22vatRate%22%3A14%7D%5D&discount=10&discountType=percent\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"discountType\": \"percent\",\n  \"subtotal\": 100000,\n  \"discountAmount\": 10000,\n  \"taxableBase\": 90000,\n  \"vatTotal\": 12600,\n  \"grandTotal\": 102600\n}"
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_JSON\",\n    \"message\": \"The \\\"lines\\\" query parameter must be a valid JSON array.\",\n    \"field\": \"lines\"\n  }\n}"
          }
        ]
      },
      {
        "id": "finance-inflation-route",
        "title": "GET /api/v1/finance/inflation-adjust",
        "description": "使用通货膨胀调整来比较受支持的安哥拉 CPI 年份的名义值。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "金额",
              "是的",
              "原始名义金额。"
            ],
            [
              "来自",
              "是的",
              "源日期或年份字符串。前四位数字用作 CPI 年份。"
            ],
            [
              "到",
              "是的",
              "目标日期或年份字符串。前四位数字用作 CPI 年份。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/inflation-adjust?amount=100000&from=2020-01-01&to=2025-01-01\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/inflation-adjust?amount=100000&from=2020-01-01&to=2025-01-01\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"amount\": 100000,\n  \"fromYear\": 2020,\n  \"toYear\": 2025,\n  \"inflationFactor\": 2.5642,\n  \"adjustedAmount\": 256420,\n  \"source\": \"Curated annual Angola CPI index series.\"\n}"
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"UNSUPPORTED_CPI_YEAR\",\n    \"message\": \"Inflation adjustment is available for Angola annual CPI years from 2019 through 2025.\",\n    \"fromYear\": 2010,\n    \"toYear\": 2025\n  }\n}"
          }
        ],
        "note": "每当在报告或定价流程中使用调整后的金额时，请保留计算年份范围。"
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
    "label": "薪资",
    "description": "根据安哥拉工资假设估算净工资、总工资和雇主成本。",
    "eyebrow": "类别",
    "title": "运行安哥拉工资估算以了解雇员和雇主的意见。",
    "intro": "工资族对雇员社会保障、雇主社会保障和受支持年份的就业收入预扣表应用安哥拉内部工资假设。",
    "summaryCards": [
      {
        "label": "路线",
        "value": "3 GET"
      },
      {
        "label": "年",
        "value": "2025 年和 2026 年"
      },
      {
        "label": "输出",
        "value": "净额、毛额、雇主成本"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "该系列中的路线",
        "table": {
          "columns": [
            "路线",
            "目的",
            "按键查询"
          ],
          "rows": [
            [
              "/api/v1/salary/net",
              "根据工资总额估算实得工资。",
              "gross, year"
            ],
            [
              "/api/v1/salary/gross",
              "估计目标净额所需的工资总额。",
              "net, year"
            ],
            [
              "/api/v1/salary/employer-cost",
              "估计雇主成本，包括缴款。",
              "gross, year"
            ]
          ]
        }
      },
      {
        "id": "salary-net-route",
        "title": "GET /api/v1/salary/net",
        "description": "当您的源值是工资总额并且您想要估计的实得金额时，请使用净额。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "毛重",
              "是的",
              "每月工资总额。"
            ],
            [
              "年",
              "否",
              "支持纳税年度。当前为 `2025` 或 `2026`。默认为 `2026`。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/salary/net?gross=500000&year=2026\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/salary/net?gross=500000&year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"year\": 2026,\n  \"grossSalary\": 500000,\n  \"taxableIncome\": 485000,\n  \"employeeSocialSecurity\": 15000,\n  \"irtRate\": 16,\n  \"irtTaxAmount\": 52100,\n  \"netSalary\": 432900,\n  \"employerContribution\": 40000,\n  \"assumptions\": [\"Applies monthly employment-income withholding for Angola.\"]\n}"
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"UNSUPPORTED_TAX_YEAR\",\n    \"message\": \"Supported salary-tax years are 2025 and 2026.\",\n    \"year\": 2024\n  }\n}"
          }
        ]
      },
      {
        "id": "salary-gross-route",
        "title": "GET /api/v1/salary/gross",
        "description": "当目标值为净工资并且您需要达到该目标所需的大致工资总额时，请使用毛工资。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "网",
              "是的",
              "期望的月净工资。"
            ],
            [
              "年",
              "否",
              "支持纳税年度。默认为 `2026`。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/salary/gross?net=432900&year=2026\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/salary/gross?net=432900&year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"year\": 2026,\n  \"targetNetSalary\": 432900,\n  \"grossSalary\": 500000,\n  \"employeeSocialSecurity\": 15000,\n  \"irtTaxAmount\": 52100,\n  \"netSalary\": 432900\n}"
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_NUMBER\",\n    \"message\": \"The \\\"net\\\" query parameter must be a non-negative number.\",\n    \"field\": \"net\",\n    \"value\": \"-1\"\n  }\n}"
          }
        ]
      },
      {
        "id": "salary-employer-cost-route",
        "title": "GET /api/v1/salary/employer-cost",
        "description": "当工资计划需要公司方在员工工资总额之上缴款时，请使用雇主成本。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "毛重",
              "是的",
              "每月工资总额。"
            ],
            [
              "年",
              "否",
              "支持纳税年度。默认为 `2026`。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/salary/employer-cost?gross=500000&year=2026\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/salary/employer-cost?gross=500000&year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"year\": 2026,\n  \"grossSalary\": 500000,\n  \"employerContribution\": 40000,\n  \"totalEmployerCost\": 540000\n}"
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_NUMBER\",\n    \"message\": \"The \\\"gross\\\" query parameter must be a non-negative number.\",\n    \"field\": \"gross\",\n    \"value\": \"abc\"\n  }\n}"
          }
        ],
        "note": "这些端点是场景计算器，而不是工资单归档服务。在显示结果的任何 UI 中呈现假设。"
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
    "label": "时间",
    "description": "当前当地时间、时区转换和营业时间检查。",
    "eyebrow": "类别",
    "title": "使用时区和当地营业时间检查。",
    "intro": "时间端点为您提供了一个小型时区实用程序层，而无需将完整的调度平台拉入您的应用程序。",
    "summaryCards": [
      {
        "label": "路线",
        "value": "3 GET"
      },
      {
        "label": "默认区域",
        "value": "非洲/罗安达"
      },
      {
        "label": "业务窗口",
        "value": "08:00 至 17:00"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "该系列中的路线",
        "table": {
          "columns": [
            "路线",
            "目的",
            "按键查询"
          ],
          "rows": [
            [
              "/api/v1/time/now",
              "返回时区的当前时间。",
              "时区"
            ],
            [
              "/api/v1/time/convert",
              "将日期时间从一个时区转换为另一时区。",
              "datetime, from, to"
            ],
            [
              "/api/v1/time/business-hours",
              "检查日期时间是否在工作时间内。",
              "datetime, timezone, start, end"
            ]
          ]
        }
      },
      {
        "id": "time-now-route",
        "title": "GET /api/v1/time/now",
        "description": "当您需要特定 IANA 时区的当前本地时间时，请使用 now。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "时区",
              "否",
              "IANA 时区。默认为 `Africa/Luanda`。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/time/now?timezone=Africa/Luanda\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/time/now?timezone=Africa/Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"iso\": \"2026-03-23T18:45:00\",\n  \"timezone\": \"Africa/Luanda\",\n  \"offset\": \"GMT+1\",\n  \"components\": {\n    \"year\": 2026,\n    \"month\": 3,\n    \"day\": 23,\n    \"hour\": 18,\n    \"minute\": 45,\n    \"second\": 0,\n    \"weekday\": 1\n  }\n}"
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_TIMEZONE\",\n    \"message\": \"The supplied timezone is not supported by the runtime.\",\n    \"field\": \"timezone\",\n    \"value\": \"Mars/Base\"\n  }\n}"
          }
        ]
      },
      {
        "id": "time-convert-route",
        "title": "GET /api/v1/time/convert",
        "description": "使用 Convert 将本地或绝对日期时间从一个时区转换为另一时区。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "日期时间",
              "是的",
              "ISO 日期时间。如果未提供偏移量，则路由将在源时区中解释它。"
            ],
            [
              "来自",
              "是的",
              "来源 IANA 时区。"
            ],
            [
              "到",
              "是的",
              "目标 IANA 时区。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/time/convert?datetime=2026-03-23T10:00:00&from=Africa/Luanda&to=UTC\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/time/convert?datetime=2026-03-23T10:00:00&from=Africa/Luanda&to=UTC\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"input\": {\n    \"datetime\": \"2026-03-23T10:00:00\",\n    \"timezone\": \"Africa/Luanda\"\n  },\n  \"source\": {\n    \"iso\": \"2026-03-23T10:00:00\",\n    \"timezone\": \"Africa/Luanda\"\n  },\n  \"target\": {\n    \"iso\": \"2026-03-23T09:00:00\",\n    \"timezone\": \"UTC\"\n  }\n}"
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_DATETIME\",\n    \"message\": \"Date-times without an offset must use YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss format.\",\n    \"field\": \"datetime\",\n    \"value\": \"23/03/2026 10:00\"\n  }\n}"
          }
        ]
      },
      {
        "id": "time-business-hours-route",
        "title": "GET /api/v1/time/business-hours",
        "description": "在工作时间发送通知、电话或提醒之前，应尊重当地办公室的窗口。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "日期时间",
              "是的",
              "要评估的 ISO 日期时间。"
            ],
            [
              "时区",
              "否",
              "IANA 时区。默认为 `Africa/Luanda`。"
            ],
            [
              "开始",
              "否",
              "工作日开始时间，以 `HH:mm` 表示。默认为 `08:00`。"
            ],
            [
              "结束",
              "否",
              "工作日结束时间为 `HH:mm`。默认为 `17:00`。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/time/business-hours?datetime=2026-03-23T09:30:00&timezone=Africa/Luanda\""
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/time/business-hours?datetime=2026-03-23T09:30:00&timezone=Africa/Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "json",
            "content": "{\n  \"timezone\": \"Africa/Luanda\",\n  \"businessHours\": {\n    \"start\": \"08:00\",\n    \"end\": \"17:00\",\n    \"timezone\": \"Africa/Luanda\"\n  },\n  \"isBusinessDay\": true,\n  \"isWithinBusinessHours\": true\n}"
          },
          {
            "label": "错误响应",
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
    "label": "文件",
    "description": "从 JSON 有效负载生成发票、收据和合同 PDF。",
    "eyebrow": "类别",
    "title": "按需生成交易和合同 PDF。",
    "intro": "文档路由将紧凑的 JSON 有效负载转换为同步 PDF 文件，这些文件可以直接下载或由您自己的应用程序存储。",
    "summaryCards": [
      {
        "label": "路线",
        "value": "3 POST"
      },
      {
        "label": "格式",
        "value": "PDF 附件"
      },
      {
        "label": "最适合",
        "value": "内部工作流程"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "该系列中的路线",
        "table": {
          "columns": [
            "路线",
            "目的",
            "身体关键字段"
          ],
          "rows": [
            [
              "/api/v1/documents/invoice",
              "生成发票 PDF。",
              "seller, buyer, items"
            ],
            [
              "/api/v1/documents/receipt",
              "生成收据 PDF。",
              "receivedFrom, amount"
            ],
            [
              "/api/v1/documents/contract",
              "生成合约 PDF。",
              "parties, clauses"
            ]
          ]
        }
      },
      {
        "id": "documents-invoice-route",
        "title": "POST /api/v1/documents/invoice",
        "description": "当您需要来自紧凑 JSON 有效负载的同步 PDF 发票时，请使用发票。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "卖家",
              "是的",
              "至少具有 `name` 的卖家对象。"
            ],
            [
              "买家",
              "是的",
              "至少具有 `name` 的买家对象。"
            ],
            [
              "项目",
              "是的",
              "具有 `description`、`quantity`、`unitPrice` 和可选 `vatRate` 的项目数组。"
            ],
            [
              "发票编号 / 签发日期 / 到期日期 / 备注",
              "否",
              "可选的发票元数据字段。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/invoice \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"seller\":{\"name\":\"Orb3x, Lda\"},\"buyer\":{\"name\":\"Cliente Exemplo\"},\"items\":[{\"description\":\"Service\",\"quantity\":1,\"unitPrice\":100000,\"vatRate\":14}]}' \\\n  --output invoice.pdf"
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "import { writeFile } from \"node:fs/promises\";\n\nasync function main() {\n  const payload = {\n    \"seller\": {\n      \"name\": \"Orb3x, Lda\"\n    },\n    \"buyer\": {\n      \"name\": \"Cliente Exemplo\"\n    },\n    \"items\": [\n      {\n        \"description\": \"Service\",\n        \"quantity\": 1,\n        \"unitPrice\": 100000,\n        \"vatRate\": 14\n      }\n    ]\n  };\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/invoice\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload)\n  });\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const fileBuffer = Buffer.from(await response.arrayBuffer());\n  await writeFile(\"invoice.pdf\", fileBuffer);\n  console.log(\"Saved invoice.pdf\");\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "bash",
            "content": "HTTP/1.1 200 OK\nContent-Type: application/pdf\nContent-Disposition: attachment; filename=\"invoice.pdf\""
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_INVOICE_PAYLOAD\",\n    \"message\": \"Invoice payload must include seller, buyer, and at least one item.\"\n  }\n}"
          }
        ]
      },
      {
        "id": "documents-receipt-route",
        "title": "POST /api/v1/documents/receipt",
        "description": "使用收据进行付款确认，只需要付款人和金额。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "收到来自",
              "是的",
              "至少具有 `name` 的参与方对象。"
            ],
            [
              "金额",
              "是的",
              "已收到金额。"
            ],
            [
              "收据编号 / 签发日期 / 原因 / 付款方式 / 备注",
              "否",
              "可选的收据元数据字段。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/receipt \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"receivedFrom\":{\"name\":\"Cliente Exemplo\"},\"amount\":100000}' \\\n  --output receipt.pdf"
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "import { writeFile } from \"node:fs/promises\";\n\nasync function main() {\n  const payload = {\n    \"receivedFrom\": {\n      \"name\": \"Cliente Exemplo\"\n    },\n    \"amount\": 100000\n  };\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/receipt\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload)\n  });\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const fileBuffer = Buffer.from(await response.arrayBuffer());\n  await writeFile(\"receipt.pdf\", fileBuffer);\n  console.log(\"Saved receipt.pdf\");\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "bash",
            "content": "HTTP/1.1 200 OK\nContent-Type: application/pdf\nContent-Disposition: attachment; filename=\"receipt.pdf\""
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_RECEIPT_PAYLOAD\",\n    \"message\": \"Receipt payload must include receivedFrom and amount.\"\n  }\n}"
          }
        ]
      },
      {
        "id": "documents-contract-route",
        "title": "POST /api/v1/documents/contract",
        "description": "当您需要从各方和条款生成基本协议 PDF 时，请使用合同。",
        "table": {
          "columns": [
            "参数",
            "必填",
            "描述"
          ],
          "rows": [
            [
              "聚会",
              "是的",
              "至少包含两个方对象的数组。"
            ],
            [
              "条款",
              "是的",
              "一系列合同条款。"
            ],
            [
              "标题/合同号/发行日期/注释",
              "否",
              "可选的合同元数据字段。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL 用法",
            "language": "bash",
            "content": "curl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/contract \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"parties\":[{\"name\":\"Orb3x, Lda\"},{\"name\":\"Cliente Exemplo\"}],\"clauses\":[\"The provider delivers the service.\",\"The client pays within 15 days.\"]}' \\\n  --output contract.pdf"
          },
          {
            "label": "Node.js 用法",
            "language": "js",
            "content": "import { writeFile } from \"node:fs/promises\";\n\nasync function main() {\n  const payload = {\n    \"parties\": [\n      {\n        \"name\": \"Orb3x, Lda\"\n      },\n      {\n        \"name\": \"Cliente Exemplo\"\n      }\n    ],\n    \"clauses\": [\n      \"The provider delivers the service.\",\n      \"The client pays within 15 days.\"\n    ]\n  };\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/contract\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload)\n  });\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const fileBuffer = Buffer.from(await response.arrayBuffer());\n  await writeFile(\"contract.pdf\", fileBuffer);\n  console.log(\"Saved contract.pdf\");\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 条回复",
            "language": "bash",
            "content": "HTTP/1.1 200 OK\nContent-Type: application/pdf\nContent-Disposition: attachment; filename=\"contract.pdf\""
          },
          {
            "label": "错误响应",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_CONTRACT_PAYLOAD\",\n    \"message\": \"Contract payload must include at least two parties and one clause.\"\n  }\n}"
          }
        ],
        "note": "文档生成有意缩小范围。如果您需要可审核性或重新生成，请自行保留源 JSON 。"
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
    "label": "NIF 验证",
    "description": "纳税人验证的查找行为、有效负载字段和失败模式。",
    "eyebrow": "端点",
    "title": "从规范化的 NIF 值查找纳税人详细信息。",
    "intro": "NIF 路由接受路径中的安哥拉税务标识符，对其进行验证，从公共税务门户请求数据，并返回已解析的 JSON 响应。",
    "endpoint": {
      "method": "GET",
      "path": "/api/nif/{nif}",
      "detail": "在尝试查找之前，路径参数会被修剪、大写并限制为字母和数字。"
    },
    "summaryCards": [
      {
        "label": "输入类型",
        "value": "路径参数"
      },
      {
        "label": "上游来源",
        "value": "安哥拉税务门户网站"
      },
      {
        "label": "主要故障",
        "value": "门户可用性"
      }
    ],
    "sections": [
      {
        "id": "success-shape",
        "title": "成功负载",
        "code": {
          "label": "200 条回复",
          "language": "json",
          "content": "{\n  \"NIF\": \"004813023LA040\",\n  \"Name\": \"EMPRESA EXEMPLO, LDA\",\n  \"Type\": \"Pessoa Colectiva\",\n  \"Status\": \"Activo\",\n  \"Defaulting\": \"Não\",\n  \"VATRegime\": \"Regime Geral\",\n  \"isTaxResident\": true\n}"
        }
      },
      {
        "id": "field-glossary",
        "title": "返回字段",
        "table": {
          "columns": [
            "领域",
            "含义"
          ],
          "rows": [
            [
              "NIF",
              "用于查找并在响应中回显的标准化标识符。"
            ],
            [
              "名称",
              "从门户响应中解析的注册纳税人名称。"
            ],
            [
              "类型",
              "源门户返回的纳税人分类。"
            ],
            [
              "状态",
              "当前纳税人身份字符串。"
            ],
            [
              "违约",
              "纳税人是否被标记为违约。"
            ],
            [
              "增值税制度",
              "VAT 门户返回的制度文本。"
            ],
            [
              "是税务居民",
              "从结果部分中的驻留或非驻留标记派生的布尔值。"
            ]
          ]
        }
      },
      {
        "id": "error-cases",
        "title": "可能会出现什么问题",
        "bullets": [
          "在进行任何上游调用之前，空或无效的路径参数会返回 400 INVALID_NIF 错误。",
          "如果税务门户报告没有结果，则路由返回 404 NIF_NOT_FOUND 响应。",
          "门户中格式错误或结构发生更改的 HTML 会返回 502 UNPARSEABLE_RESPONSE 错误。",
          "网络和 TLS 问题表现为上游可用性错误，并针对证书边缘情况提供内部回退。"
        ],
        "note": "由于上游源是 HTML，因此门户上的架构更改是最大的长期维护风险。围绕解析器进行契约测试。"
      },
      {
        "id": "integration-tips",
        "title": "集成技巧",
        "bullets": [
          "在构建路由路径之前，规范用户输入的标识符中的空格和大小写。",
          "将此端点视为实时验证而不是永久记录源；门户数据可能会随着时间而变化。",
          "当输出通知合规操作时，将原始查找结果与您自己的审核上下文一起存储。",
          "当门户暂时不可用时，显示清晰的用户消息，而不是将上游故障转变为一般验证错误。"
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
    "label": "翻译",
    "description": "请求正文规则、语言处理和实用集成指导。",
    "eyebrow": "端点",
    "title": "通过显式验证和源语言报告翻译文本。",
    "intro": "翻译路由接受 JSON 输入，验证语言代码，调用 Google 的公共翻译端点，并使用检测到或提供的源语言返回翻译后的文本。",
    "endpoint": {
      "method": "POST",
      "path": "/api/translate",
      "detail": "发送带有文本、目标语言代码和可选源语言代码的 JSON。如果省略 source，则路由使用自动检测。"
    },
    "summaryCards": [
      {
        "label": "输入类型",
        "value": "JSON 主体"
      },
      {
        "label": "目标验证",
        "value": "2-12 个字符"
      },
      {
        "label": "自动检测",
        "value": "默认启用"
      }
    ],
    "sections": [
      {
        "id": "request-shape",
        "title": "请求负载",
        "code": {
          "label": "POST 主体",
          "language": "json",
          "content": "{\n  \"text\": \"Olá mundo\",\n  \"to\": \"en\",\n  \"from\": \"pt\"\n}"
        },
        "bullets": [
          "文本是必需的，并在发送前进行修剪。",
          "to 是必需的，并且必须与简单的小写语言代码模式匹配。",
          "from 是可选的；如果不存在，路由将使用自动检测上游。",
          "无效的 JSON 在任何翻译工作开始之前返回 400 响应。"
        ]
      },
      {
        "id": "success-shape",
        "title": "成功负载",
        "code": {
          "label": "200 条回复",
          "language": "json",
          "content": "{\n  \"translatedText\": \"Hello world\",\n  \"sourceLanguage\": \"pt\",\n  \"targetLanguage\": \"en\",\n  \"status\": true,\n  \"message\": \"\"\n}"
        }
      },
      {
        "id": "failure-modes",
        "title": "常见故障模式",
        "table": {
          "columns": [
            "代码",
            "原因",
            "建议处理"
          ],
          "rows": [
            [
              "INVALID_TEXT",
              "文本字段缺失或为空。",
              "阻止提交并提示用户输入内容。"
            ],
            [
              "INVALID_LANGUAGE",
              "源或目标语言代码丢失或格式错误。",
              "重试之前修复有效负载。"
            ],
            [
              "UPSTREAM_TIMEOUT",
              "翻译提供程序超出了超时窗口。",
              "如果用户流量允许，请重试退避。"
            ],
            [
              "UPSTREAM_BAD_RESPONSE",
              "提供商返回非 200 响应。",
              "优雅降级或排队重试。"
            ],
            [
              "UNPARSEABLE_RESPONSE",
              "无法将提供程序 JSON 解析为翻译文本。",
              "警惕并回到原文。"
            ]
          ]
        }
      },
      {
        "id": "best-practices",
        "title": "使用说明",
        "bullets": [
          "将原始文本保留在您自己的数据模型中，以便编辑人员稍后可以比较源文本和翻译后的副本。",
          "当可以重复使用时，缓存您自己的成功翻译；路由本身故意不缓存响应。",
          "在您已经知道输入语言的批处理工作流程中，首选显式源语言代码。",
          "使用响应中的 sourceLanguage 来标记审核或支持工具中的意外检测结果。"
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
    "label": "货币兑换",
    "description": "外汇数据的基本速率查找、金额转换和有效负载语义。",
    "eyebrow": "端点",
    "title": "从同一端点返回单位费率或转换后的总计。",
    "intro": "货币路由查找基础货币的元数据和汇率表，然后可以选择将这些汇率乘以金额查询参数。",
    "endpoint": {
      "method": "GET",
      "path": "/api/exchange/{base}",
      "detail": "路径参数标识基础货币。当您还希望在响应中预先计算 convertedRates 时，请添加 ?amount=value 。"
    },
    "summaryCards": [
      {
        "label": "输入类型",
        "value": "路径+查询"
      },
      {
        "label": "扩展输出",
        "value": "convertedRates"
      },
      {
        "label": "主要风险",
        "value": "上游新鲜度"
      }
    ],
    "sections": [
      {
        "id": "lookup-shape",
        "title": "成功有效负载，无金额",
        "code": {
          "label": "单位费率查询",
          "language": "json",
          "content": "{\n  \"currencyCode\": \"aoa\",\n  \"currencyName\": \"Angolan kwanza\",\n  \"currencySymbol\": \"Kz\",\n  \"countryName\": \"Angola\",\n  \"countryCode\": \"AO\",\n  \"flagImage\": \"https://example.com/flags/ao.png\",\n  \"ratesDate\": \"2026-03-22\",\n  \"baseCurrency\": \"AOA\",\n  \"unitRates\": {\n    \"usd\": 0.0011,\n    \"eur\": 0.0010\n  }\n}"
        }
      },
      {
        "id": "conversion-shape",
        "title": "成功有效负载及金额",
        "code": {
          "label": "带转换的查找",
          "language": "json",
          "content": "{\n  \"baseCurrency\": \"AOA\",\n  \"amount\": 1000000,\n  \"unitRates\": {\n    \"usd\": 0.0011\n  },\n  \"convertedRates\": {\n    \"usd\": 1100\n  }\n}"
        },
        "bullets": [
          "amount 被解析为数字，并且必须为零或更大。",
          "convertedRates 镜像 unitRates 中的键并将每个值乘以金额。",
          "即使路由接受小写输入，baseCurrency 在响应中也会标准化为大写。"
        ]
      },
      {
        "id": "metadata",
        "title": "元数据字段",
        "table": {
          "columns": [
            "领域",
            "含义"
          ],
          "rows": [
            [
              "货币代码",
              "来自上游响应的标准化基础货币代码。"
            ],
            [
              "货币名称",
              "基础货币的显示名称。"
            ],
            [
              "货币符号",
              "与基础货币相关的符号。"
            ],
            [
              "国家名称/国家代码",
              "与基础货币相关的国家/地区元数据。"
            ],
            [
              "标志图像",
              "标记资产 URL 由上游提供商返回。"
            ],
            [
              "ratesDate",
              "附加到上游速率快照的日期。"
            ]
          ]
        }
      },
      {
        "id": "implementation-guidance",
        "title": "实施指导",
        "bullets": [
          "当您需要完全控制格式、舍入或下游业务计算时，请使用 unitRates。",
          "当端点直接提供 UI 并且您希望避免跨客户端重复数学时，请使用 convertedRates。",
          "防止 UI 中丢失货币，因为上游提供商可能不会在每个快照中包含所有代码。",
          "如果您保留转换后的总计，还请保留 ratesDate ，以便报告保持可审核性。"
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
    "label": "示例",
    "description": "用于类似生产用途的实用 cURL、Node.js 和 TypeScript 示例。",
    "eyebrow": "实施",
    "title": "调用已发布路由的示例。",
    "intro": "下面的代码片段显示了 cURL 请求、匹配 Node.js 获取调用，以及用于此存储库中发布的路由的类型化 TypeScript 帮助程序。",
    "summaryCards": [
      {
        "label": "格式",
        "value": "cURL + Node.js"
      },
      {
        "label": "以客户为中心",
        "value": "服务器安全获取"
      },
      {
        "label": "错误策略",
        "value": "代码感知处理"
      }
    ],
    "sections": [
      {
        "id": "curl",
        "title": "cURL 和 Node.js 示例",
        "codes": [
          {
            "label": "终端冒烟测试 (cURL)",
            "language": "bash",
            "content": "curl -s https://orb3x-utils-api.vercel.app/api/nif/004813023LA040\n\ncurl -s -X POST https://orb3x-utils-api.vercel.app/api/translate \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"text\":\"Preciso de ajuda\",\"to\":\"en\"}'\n\ncurl -s \"https://orb3x-utils-api.vercel.app/api/exchange/aoa?amount=250000\""
          },
          {
            "label": "终端冒烟测试 (Node.js)",
            "language": "js",
            "content": "async function main() {\n  const response1 = await fetch(\"https://orb3x-utils-api.vercel.app/api/nif/004813023LA040\");\n  if (!response1.ok) {\n    throw new Error(`Request failed with status ${response1.status}`);\n  }\n  const data1 = await response1.json();\n  console.log(\"Example 1\", data1);\n\n  const payload2 = {\n    \"text\": \"Preciso de ajuda\",\n    \"to\": \"en\"\n  };\n  const response2 = await fetch(\"https://orb3x-utils-api.vercel.app/api/translate\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload2)\n  });\n  if (!response2.ok) {\n    throw new Error(`Request failed with status ${response2.status}`);\n  }\n  const data2 = await response2.json();\n  console.log(\"Example 2\", data2);\n\n  const response3 = await fetch(\"https://orb3x-utils-api.vercel.app/api/exchange/aoa?amount=250000\");\n  if (!response3.ok) {\n    throw new Error(`Request failed with status ${response3.status}`);\n  }\n  const data3 = await response3.json();\n  console.log(\"Example 3\", data3);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          }
        ]
      },
      {
        "id": "typescript",
        "title": "输入 TypeScript 帮助程序",
        "code": {
          "label": "共享客户端实用程序",
          "language": "ts",
          "content": "type ApiError = {\n  error?: {\n    code?: string;\n    message?: string;\n  };\n  code?: string;\n  message?: string;\n};\n\nexport async function callApi\u003cT>(input: RequestInfo, init?: RequestInit): Promise\u003cT> {\n  const response = await fetch(input, init);\n\n  if (!response.ok) {\n    const error = (await response.json().catch(() => ({}))) as ApiError;\n    throw new Error(error.error?.code ?? error.code ?? \"REQUEST_FAILED\");\n  }\n\n  return (await response.json()) as T;\n}"
        }
      },
      {
        "id": "workflow-patterns",
        "title": "工作流程模式",
        "bullets": [
          "客户入职：在后台流程中激活帐户之前验证纳税人记录。",
          "本地化管道：翻译面向用户的内容并存储翻译后的文本和检测到的源语言。",
          "定价仪表板：请求基本费率一次，然后根据 UI 需要的控制程度使用 unitRates 或 convertedRates。",
          "支持工具：向内部代理显示上游错误代码，以便他们可以快速区分错误输入和提供商中断。"
        ]
      },
      {
        "id": "production-hardening",
        "title": "生产强化",
        "bullets": [
          "使用类型化的成功和错误形状将调用包装在共享客户端中。",
          "分别发出超时、不良响应、未找到和无效输入率的指标。",
          "使重试逻辑保持靠近客户端边界，以便产品代码不会针对每个功能重新实现它。",
          "当 ratesDate 和 sourceLanguage 对于可审核性或编辑审查很重要时，记录这些字段。"
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
