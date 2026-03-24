import { zhDocsPages } from './docs/zh';
import type { PartialSiteCopy } from './types';

export const zhSiteCopy: PartialSiteCopy = {
  "languageName": "中文",
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
    "title": "ORB3X 实用程序 API - 税务验证、翻译和货币转换",
    "description": "ORB3X 实用程序 API 路线的文档，涵盖以安哥拉为重点的验证、地理、财务、工资单、文档和遗留上游实用程序。",
    "keywords": [
      "API",
      "税务核查",
      "翻译",
      "货币兑换",
      "NIF",
      "开发者工具",
      "安哥拉",
      "汇率"
    ],
    "openGraphTitle": "ORB3X 实用程序 API",
    "openGraphDescription": "以安哥拉为中心的验证、地理、财务、薪资、文档和传统上游路线的文档。"
  },
  "brand": {
    "homeAriaLabel": "ORB3X 实用程序 API 主页",
    "companyWebsiteAriaLabel": "打开ORB3X公司网站"
  },
  "header": {
    "themeToDark": "切换到深色模式",
    "themeToLight": "切换到灯光模式",
    "language": "Language",
    "openMenu": "打开菜单",
    "closeMenu": "关闭菜单",
    "navigation": "导航"
  },
  "navigation": {
    "docs": "文档",
    "apiReference": "API 参考",
    "examples": "示例",
    "faq": "FAQ",
    "privacy": "隐私"
  },
  "footer": {
    "description": "针对安哥拉的 ORB3X Utils API 路线系列的文档和参考页。",
    "companyLabel": "公司简介",
    "companyDescription": "ORB3X 实用程序 API 由 ORB3X 维护。访问公司主要网站，了解更广泛的产品和机构信息。",
    "companyWebsite": "访问 orb3x.com",
    "explore": "探索",
    "documentation": "文档",
    "policies": "政策",
    "privacy": "隐私政策",
    "terms": "使用条款",
    "faq": "FAQ",
    "copyright": "© 2026 ORB3X 实用程序 API。版权所有。",
    "tagline": "验证、地理、财务、工资、文档和遗留实用程序 API 文档。"
  },
  "routes": {
    "nif": {
      "title": "NIF 验证",
      "description": "通过单个 GET 请求，从官方公共门户验证并规范安哥拉纳税人详细信息。"
    },
    "translation": {
      "title": "文字翻译",
      "description": "通过明确的源语言和目标语言处理来翻译应用程序副本、客户消息或支持内容。"
    },
    "exchange": {
      "title": "货币兑换",
      "description": "从同一响应信封中查找基础货币汇率或预先计算换算金额。"
    }
  },
  "home": {
    "eyebrow": "ORB3X 实用程序 API",
    "title": "用于安哥拉验证、地理、财务、工资、文档和核心实用程序的 API。",
    "description": "使用文档检查当前 ORB3X 实用程序 API 表面的请求格式、响应负载、计算器和上游行为。",
    "primaryCta": "从文档开始",
    "secondaryCta": "查看示例",
    "quickRequestLabel": "快速请求示例 (cURL)",
    "quickRequestNodeLabel": "快速请求示例 (Node.js)",
    "stats": [
      {
        "label": "已发布的路线",
        "value": "28"
      },
      {
        "label": "响应格式",
        "value": "JSON"
      },
      {
        "label": "缓存策略",
        "value": "no-store"
      }
    ],
    "notes": [
      {
        "title": "共享响应处理",
        "description": "大多数路由返回 JSON 并公开足够的错误详细信息，以将无效输入与上游故障或假设驱动的计算问题分开。"
      },
      {
        "title": "实时上游数据",
        "description": "该平台将确定性本地数据端点与一些上游支持的路由混合在一起，但所有响应都保持 no-store 以保持新鲜度。"
      },
      {
        "title": "路由级文档",
        "description": "每个路由系列都有一个专用页面，涵盖请求形状、响应负载、假设和常见故障情况。"
      }
    ],
    "ownershipLabel": "由 ORB3X 维护",
    "ownershipDescription": "ORB3X 实用程序 API 是更广泛的 ORB3X 平台的一部分。该机构公司网站位于 orb3x.com。",
    "ownershipCta": "打开 orb3x.com",
    "docs": {
      "eyebrow": "文档",
      "title": "写得像参考页，而不是营销文案。",
      "description": "文档部分涵盖了共享行为、特定于路由的有效负载以及每个端点的示例。将其作为实施工作的主要切入点。",
      "bullets": [
        "从路由概述开始，了解共享状态代码和缓存规则。",
        "使用请求字段、响应示例和集成说明的专用端点页面。",
        "在连接获取助手或冒烟测试时，保持示例页面打开。"
      ],
      "tableLabel": "文档页面",
      "tableType": "类型",
      "tableTypeValue": "文档",
      "open": "打开"
    }
  },
  "docsOverview": {
    "navLabel": "概述",
    "navDescription": "文档索引、约定和路线图。",
    "eyebrow": "文档",
    "title": "已发布路线系列的参考页。",
    "description": "使用这些页面检查验证、地理、财务、工资、时间、文档和旧上游端点的输入、输出、状态代码、假设和示例。",
    "primaryCta": "打开入门",
    "secondaryCta": "打开示例",
    "stats": [
      {
        "label": "文档页面",
        "value": "14"
      },
      {
        "label": "已发布的路线",
        "value": "28"
      },
      {
        "label": "响应格式",
        "value": "JSON"
      }
    ],
    "startHereTitle": "从这里开始",
    "startHereDescription": "下面的页面首先介绍共享规则，然后介绍每个路由的请求和响应详细信息。",
    "routesTitle": "路线",
    "routesDescription": "每个发布的路由都有一个专门的页面，其中包含请求示例和失败案例。",
    "sharedBehaviorTitle": "共同行为",
    "sharedBehaviorDescription": "这些规则适用于已发布的端点，并且是共享客户端中需要考虑的主要事项。",
    "sharedBehaviorColumns": [
      "关注",
      "行为"
    ],
    "quickstartTitle": "快速入门",
    "quickstartDescription": "在将端点连接到应用程序代码之前，对每个路由运行一个请求。",
    "quickstartLabel": "冒烟测试序列 (cURL)",
    "quickstartNodeLabel": "冒烟测试序列 (Node.js)",
    "sharedBehaviorRows": [
      [
        "请求正文",
        "大多数路由是查询驱动的 GET 端点。文档路由和 `/api/translate` 需要 JSON 主体。"
      ],
      [
        "响应新鲜度",
        "每个路由发送 Cache-Control: no-store。一些端点是确定性的，而另一些端点则依赖于实时上游服务。"
      ],
      [
        "错误处理",
        "在决定是否重试之前，请检查 HTTP 状态和返回的代码字段或 error.code 值。"
      ],
      [
        "部署配置文件",
        "处理程序在 Node.js 上运行并标记为动态。"
      ]
    ],
    "versionLabel": "版本",
    "versionSelectorLabel": "选择文档版本",
    "versionCurrent": "v1",
    "versionLatest": "最新",
    "versionDescription": "`/api/v1` 路线表面的当前稳定 API 文档。",
    "onPageLabel": "在此页面上",
    "onPageItems": [
      "从这里开始",
      "路线",
      "共同行为",
      "快速入门"
    ],
    "open": "打开"
  },
  "docsDetail": {
    "endpoint": "端点",
    "onPage": "在此页面上",
    "relatedPages": "相关页面",
    "open": "打开"
  },
  "faq": {
    "eyebrow": "FAQ",
    "title": "有关请求、响应格式和上游行为的问题。",
    "description": "集成专注于安哥拉的 ORB3X Utils API 表面的团队的常见答案。",
    "cards": [
      {
        "label": "响应格式",
        "value": "JSON"
      },
      {
        "label": "缓存策略",
        "value": "no-store"
      },
      {
        "label": "开始于",
        "value": "开始使用"
      }
    ],
    "groups": [
      {
        "title": "要求",
        "items": [
          {
            "question": "该网站记录了什么？",
            "answer": "该站点记录了当前 ORB3X 实用程序 API 表面，包括验证、电话、地理位置、日历、财务、工资、时间、文档和旧版 NIF、翻译和交换路线。"
          },
          {
            "question": "所有路由都返回 JSON 吗？",
            "answer": "大多数路由都会这样做，但文档端点在成功时返回 PDF 文件。错误响应仍然使用 JSON。"
          },
          {
            "question": "哪些路由需要请求正文？",
            "answer": "文档端点和 `/api/translate` 需要 JSON 主体。大多数其他路由使用查询参数。"
          }
        ]
      },
      {
        "title": "缓存和错误",
        "items": [
          {
            "question": "响应是否被缓存？",
            "answer": "不会。路由处理程序返回 `Cache-Control: no-store` 因为数据来自实时上游服务。"
          },
          {
            "question": "当上游提供商超时时会发生什么？",
            "answer": "该路由返回与超时相关的错误代码，以便您的客户端可以决定是重试还是显示回退状态。"
          },
          {
            "question": "应该如何处理重试？",
            "answer": "仅当响应指示上游超时或上游可用性问题时才重试。不要重试验证错误。"
          }
        ]
      },
      {
        "title": "路线行为",
        "items": [
          {
            "question": "NIF 数据有多新？",
            "answer": "该路线返回安哥拉公共税务门户在请求时公开的所有内容。"
          },
          {
            "question": "翻译路线可以接受哪些语言？",
            "answer": "它接受底层翻译端点支持的语言代码，并遵守文档中描述的验证规则。"
          },
          {
            "question": "货币路由能否返回转换后的总计？",
            "answer": "是的。添加 `amount` 查询参数以在同一响应中接收 `unitRates` 和 `convertedRates` 。"
          }
        ]
      },
      {
        "title": "使用输出",
        "items": [
          {
            "question": "我应该存储返回的数据吗？",
            "answer": "这取决于你自己的产品要求。如果响应影响审计或业务决策，请将其与您自己的上下文存储在一起。"
          },
          {
            "question": "调试时我应该首先看哪里？",
            "answer": "从共享状态代码的 API 参考开始，然后转到专用路由页面以获取特定于端点的请求和响应详细信息。"
          },
          {
            "question": "集成时哪些页面应保持打开状态？",
            "answer": "入门页面、API 参考和示例页面涵盖了大部分集成工作。"
          }
        ]
      }
    ],
    "ctaTitle": "集成时保持参考页面靠近。",
    "ctaDescription": "入门指南首先介绍共享行为，然后路由页面介绍请求和响应详细信息。",
    "primaryCta": "打开入门",
    "secondaryCta": "打开 API 参考"
  },
  "legal": {
    "eyebrow": "法律",
    "lastUpdated": "最后更新",
    "updatedOn": "2026 年 3 月 22 日",
    "scope": "适用范围",
    "appliesTo": "适用于",
    "companySite": "公司网站",
    "companySiteDescription": "此 API 的发行商和公司信息可在官方 ORB3X 网站上找到。",
    "companySiteCta": "打开 orb3x.com",
    "privacy": {
      "title": "隐私政策。",
      "description": "本页说明使用站点或 API 路由时可以处理哪些类别的信息。",
      "scopeValue": "网站和 API 操作",
      "sections": [
        {
          "title": "我们处理的信息",
          "paragraphs": [
            "我们处理接收请求、操作 API、保护服务和解决问题所需的最少信息。根据路由的不同，这可能包括路径参数、请求负载、响应元数据和技术诊断。",
            "示例包括纳税人查找标识符、翻译请求文本、基础货币代码、请求时间戳、IP 相关遥测以及用于安全和调试的结构化应用程序日志。"
          ],
          "bullets": [
            "请求内容提交到API",
            "元数据，例如时间戳、路由名称和响应状态",
            "用于安全、调试和速率控制的网络和设备信号"
          ]
        },
        {
          "title": "如何使用信息",
          "paragraphs": [
            "信息用于执行请求的操作、监控可用性、调查事件并提高服务质量。"
          ],
          "bullets": [
            "返回 API 响应",
            "检测滥用、停机和格式错误的请求",
            "调查支持请求并重现报告的问题",
            "生成有关使用情况和可靠性的汇总内部指标"
          ]
        },
        {
          "title": "第三方处理",
          "paragraphs": [
            "有些路线依赖于上游提供商，包括公共政府服务和第三方 API。当这些路由被调用时，相关的请求数据将被发送到这些提供者以完成请求。",
            "这些提供商按照自己的条款和隐私惯例运营。在受监管或高敏感度工作流程中使用该服务之前，请检查这些依赖关系。"
          ]
        },
        {
          "title": "保留和安全",
          "paragraphs": [
            "操作日志和支持工件仅在确保服务安全、调查事件以及履行法律或合同义务所需的合理时间内保留。",
            "我们使用适合服务的管理、技术和组织保障措施，但没有任何面向互联网的系统可以保证绝对安全。"
          ],
          "bullets": [
            "操作系统的访问控制",
            "开发和生产环境分离",
            "监控和事件响应程序"
          ]
        }
      ]
    },
    "terms": {
      "title": "使用条款。",
      "description": "这些术语描述了使用站点、文档和已发布的 API 路由的一般条件。",
      "appliesToValue": "网站、文档和 API 路线",
      "sections": [
        {
          "title": "接受和范围",
          "paragraphs": [
            "通过访问或使用网站或 API 路线，您同意这些条款以及可能适用于您使用服务的任何其他书面商业条款。",
            "这些条款涵盖公共网站、文档和已发布的 API 端点。它们不会自动推翻任何单独的书面协议。"
          ]
        },
        {
          "title": "允许使用",
          "paragraphs": [
            "您可以使用该服务来评估和集成符合适用法律且不干扰平台的可用性或完整性的合法工作流程。"
          ],
          "bullets": [
            "请勿尝试未经授权的访问、超出预期用途的抓取或滥用上游提供商。",
            "请勿使用该服务进行非法筛选、歧视性决策或欺骗性活动。",
            "不得向下游用户歪曲返回数据的来源或可靠性。"
          ]
        },
        {
          "title": "服务行为和上游依赖关系",
          "paragraphs": [
            "该服务依赖第三方和公共上游系统来进行某些响应。因此，可用性、延迟和数据完整性可能会受到这些依赖性的影响。",
            "我们可能会随着时间的推移更改内部实现细节，前提是已发布的路由行为对于记录的集成仍然具有实质用途。"
          ]
        },
        {
          "title": "产出和客户责任",
          "paragraphs": [
            "您负责如何在自己的产品和工作流程中使用服务返回的输出。",
            "仔细审查关键操作，尤其是当基础数据来自第三方系统时。"
          ]
        }
      ]
    }
  },
  "notFound": {
    "eyebrow": "404",
    "title": "找不到页面",
    "description": "您请求的页面不存在。使用下面的链接之一返回已发布的文档页面。",
    "primaryCta": "回家吧",
    "secondaryCta": "打开文档",
    "tertiaryCta": "访问FAQ"
  },
  "docsPages": zhDocsPages
};
