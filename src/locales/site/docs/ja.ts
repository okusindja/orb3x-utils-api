import type { DocsPageMap } from '@/lib/site-content';

export const jaDocsPages: DocsPageMap = {
  "getting-started": {
    "slug": "getting-started",
    "label": "はじめに",
    "description": "ルート ファミリ、リクエスト規則、展開メモの概要。",
    "eyebrow": "プラットフォームガイド",
    "title": "公開された ORB3X Utils API ルートを使ってみましょう。",
    "intro": "ORB3X ユーティリティ API は、オリジナルの NIF、翻訳、および交換エンドポイントを、アンゴラに焦点を当てた検証、電話、住所、地理、カレンダー、財務、給与、時間、ドキュメント ユーティリティと組み合わせています。すべてのルートは動的であり、デフォルトでは no-store キャッシュになります。",
    "summaryCards": [
      {
        "label": "ランタイム",
        "value": "Node.js ハンドラー"
      },
      {
        "label": "キャッシュポリシー",
        "value": "無店舗対応"
      },
      {
        "label": "エンドポイントのスタイル",
        "value": "24 GET、4 POST"
      }
    ],
    "sections": [
      {
        "id": "mental-model",
        "title": "プラットフォームモデルから始める",
        "paragraphs": [
          "新しいエンドポイントのほとんどは、型指定された内部データセットをサポートするローカルの計算機、レジストリ、またはノーマライザーです。既存の税務、翻訳、交換ルートでは、引き続きライブ上流プロバイダーを呼び出します。",
          "この分割はクライアントの設計に役立ちます。ローカル データ エンドポイントは決定的で高速ですが、アップストリームにバックアップされたルートはより強力な再試行、タイムアウト、可観測性の処理を必要とします。"
        ],
        "bullets": [
          "成功応答と失敗応答の両方で JSON が返されることが予想されます。",
          "NIF、変換、応答の交換は動的で時間に依存するものとして扱います。",
          "給与、VAT、およびインフレの出力を仮定に基づいた計算機として扱い、使用した年またはレートの入力を保持します。",
          "再試行を決定するときは、HTTP ステータスだけでなく、返されたエラー コードを読み取ります。",
          "回避可能な 400 応答を減らすために、エンドポイントを呼び出す前に独自のユーザー入力を正規化します。"
        ]
      },
      {
        "id": "request-conventions",
        "title": "共有リクエストの規約",
        "table": {
          "columns": [
            "懸念",
            "行動"
          ],
          "rows": [
            [
              "輸送",
              "HTTPS JSON API はサーバー側およびブラウザ側のコンシューマー向けに設計されています。"
            ],
            [
              "キャッシング",
              "応答はキャッシュ制御を全面的に no-store に設定するため、統合は常にライブ結果を読み取ります。"
            ],
            [
              "タイムアウトプロファイル",
              "ハンドラーでは最大 30 秒まで許可されます。従来のルートのサブセットのみがサードパーティのアップストリーム呼び出しに依存します。"
            ],
            [
              "検証",
              "クエリ パラメーター、パス値、POST 本体は、ビジネス ロジックが実行される前にサニタイズされます。"
            ],
            [
              "エラー処理",
              "検証エラーは、安定した機械可読な error.code 値を含む 400 レベルのコードを返します。"
            ]
          ]
        }
      },
      {
        "id": "first-calls",
        "title": "最初に成功したリクエストを行う",
        "description": "リクエストをアプリケーション コードに統合する前に、ルートごとに 1 つのリクエストを実行します。",
        "codes": [
          {
            "label": "スタータースモークテスト (cURL)",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\"\n\ncurl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=%2B244923456789\"\n\ncurl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\"\n\ncurl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/invoice \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"seller\":{\"name\":\"Orb3x, Lda\"},\"buyer\":{\"name\":\"Cliente Exemplo\"},\"items\":[{\"description\":\"Service\",\"quantity\":1,\"unitPrice\":100000,\"vatRate\":14}]}'"
          },
          {
            "label": "スタータースモークテスト (Node.js)",
            "language": "js",
            "content": "async function main() {\n  const response1 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\");\n  if (!response1.ok) {\n    throw new Error(`Request failed with status ${response1.status}`);\n  }\n  const data1 = await response1.json();\n  console.log(\"Example 1\", data1);\n\n  const response2 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=%2B244923456789\");\n  if (!response2.ok) {\n    throw new Error(`Request failed with status ${response2.status}`);\n  }\n  const data2 = await response2.json();\n  console.log(\"Example 2\", data2);\n\n  const response3 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\");\n  if (!response3.ok) {\n    throw new Error(`Request failed with status ${response3.status}`);\n  }\n  const data3 = await response3.json();\n  console.log(\"Example 3\", data3);\n\n  const payload4 = {\n    \"seller\": {\n      \"name\": \"Orb3x, Lda\"\n    },\n    \"buyer\": {\n      \"name\": \"Cliente Exemplo\"\n    },\n    \"items\": [\n      {\n        \"description\": \"Service\",\n        \"quantity\": 1,\n        \"unitPrice\": 100000,\n        \"vatRate\": 14\n      }\n    ]\n  };\n  const response4 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/invoice\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload4)\n  });\n  if (!response4.ok) {\n    throw new Error(`Request failed with status ${response4.status}`);\n  }\n  const data4 = await response4.json();\n  console.log(\"Example 4\", data4);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          }
        ],
        "bullets": [
          "PDF の生成はサーバー側で実行されるため、展開する正確なランタイムからのドキュメント ルートを確認します。",
          "NIF、変換、および交換エンドポイントのリクエスト ID とアップストリーム エラー コードをログに記録します。",
          "給与、インフレ、番号計画の可用性などの仮定に基づいた出力を中心に対応ガードを構築します。"
        ]
      },
      {
        "id": "launch-checklist",
        "title": "実稼働開始チェックリスト",
        "bullets": [
          "基本の URL 構成を一元化することで、コードを編集せずにステージング環境と運用環境を切り替えることができます。",
          "HTTP ステータス、エンドポイント、コード、リクエスト コンテキストを保存する構造化ログを使用して、200 以外の応答をキャプチャします。",
          "アップストリームのタイムアウトと可用性エラーに対してのみ再試行ポリシーを定義します。無効な入力エラーを再試行しないでください。",
          "財務出力が請求書、給与計算、またはレポートに入力されるたびに、計算年またはレートの入力を保存します。",
          "ユーザー入力を永続化または配信ワークフローに渡す前に、ドキュメント生成用の POST ペイロードを検証します。",
          "CI のエンドポイントごとに軽量のコントラクト テストを維持し、偶発的な応答形状の回帰を検出します。"
        ],
        "note": "防御層を 1 つだけ実装する場合は、明示的なエラーコード処理を作成します。これは、再試行可能な失敗と不正なリクエストを区別する最も簡単な方法です。"
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
    "label": "API リファレンス",
    "description": "完全に公開された API サーフェス全体にわたる正規のリクエストとレスポンスの動作。",
    "eyebrow": "参考資料",
    "title": "共有リクエストとレスポンスの動作に関するリファレンス。",
    "intro": "このリファレンスでは、元のアップストリームでサポートされるエンドポイントに加えて、検証、地域、財務、給与、時間、ドキュメント ルートなど、現在のアンゴラ ユーティリティ サーフェスで共有されている規約をまとめています。",
    "summaryCards": [
      {
        "label": "公開されたエンドポイント",
        "value": "28"
      },
      {
        "label": "成功形式",
        "value": "JSON のみ"
      },
      {
        "label": "二値応答",
        "value": "POST ドキュメントの PDF"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "エンドポイントカタログ",
        "table": {
          "columns": [
            "ルート",
            "方法",
            "目的",
            "キー入力"
          ],
          "rows": [
            [
              "/api/v1/validate/*",
              "GET",
              "アンゴラの IBAN と現地の銀行口座構造を検証します。",
              "iban またはアカウントのクエリ"
            ],
            [
              "/api/v1/phone/*",
              "GET",
              "電話番号を解析し、形式を検証し、演算子を検出します。",
              "電話での問い合わせ"
            ],
            [
              "/api/v1/address/* + /api/v1/geo/*",
              "GET",
              "住所を正規化し、アンゴラの場所のレジストリを読み取ります。",
              "q, province, municipality, address"
            ],
            [
              "/api/v1/calendar/*",
              "GET",
              "休日と営業日の計算を返します。",
              "年、開始日/終了日、日付/日"
            ],
            [
              "/api/v1/finance/*",
              "GET",
              "VAT、請求書、およびインフレ計算を実行します。",
              "金額または行数のクエリ"
            ],
            [
              "/api/v1/salary/*",
              "GET",
              "給与の正味、総額、雇用主コストの値を推定します。",
              "総クエリまたはネットクエリ"
            ],
            [
              "/api/v1/time/*",
              "GET",
              "現在時刻を読み取り、タイムゾーンを変換し、営業時間を確認します。",
              "タイムゾーン、日時、開始/終了"
            ],
            [
              "/api/v1/documents/*",
              "POST",
              "請求書、領収書、契約書の PDF を生成します。",
              "JSON 本体"
            ],
            [
              "/api/nif/{nif}",
              "GET",
              "アンゴラの納税者の身元フィールドを検索します。",
              "NIF パスパラメータ"
            ],
            [
              "/api/translate",
              "POST",
              "テキストを翻訳し、検出されたソース言語を返します。",
              "JSON 本文: テキスト、to、オプションで from"
            ],
            [
              "/api/exchange/{base}",
              "GET",
              "返品の為替レート。オプションで金額を乗算します。",
              "ベースパスパラメータ、オプションの量クエリ"
            ]
          ]
        }
      },
      {
        "id": "response-patterns",
        "title": "応答パターン",
        "paragraphs": [
          "成功ペイロードはエンドポイント固有ですが、フラットでアプリケーション指向のままです。計算機のエンドポイントは、導出された値と、それらを生成するために使用された仮定または基礎を表します。",
          "ドキュメント ルートは主な例外です。ドキュメント ルートは添付ヘッダーを含むバイナリ PDF 応答を返します。他のほとんどのエンドポイントは、何か問題が発生した場合に JSON とエラー エンベロープを返します。"
        ],
        "code": {
          "label": "典型的なエラー応答",
          "language": "json",
          "content": "{\n  \"error\": {\n    \"code\": \"UPSTREAM_TIMEOUT\",\n    \"message\": \"The currency service did not respond in time.\",\n    \"baseCurrency\": \"AOA\",\n    \"amount\": \"1000000\"\n  }\n}"
        }
      },
      {
        "id": "status-codes",
        "title": "ステータスコードと意図",
        "table": {
          "columns": [
            "ステータス",
            "意味",
            "典型的なアクション"
          ],
          "rows": [
            [
              "200",
              "検証されたリクエストは成功しました。",
              "ペイロードを直接使用します。"
            ],
            [
              "400",
              "入力が欠落しているか、不正な形式であるか、サポートされていません。",
              "リクエストを修正します。再試行はありません。"
            ],
            [
              "404",
              "要求されたリソースがアップストリームで見つかりませんでした。",
              "明確な not found 状態を表示します。"
            ],
            [
              "502",
              "アップストリーム サービスが失敗したか、不正な形式のデータが返されました。",
              "バックオフで再試行するか、正常に機能を低下させます。"
            ],
            [
              "504",
              "アップストリームの依存関係がタイムアウトしました。",
              "ユーザー フローが許容できる場合は再試行してください。"
            ],
            [
              "500",
              "予期しない内部障害。",
              "UX で許可されている場合にのみ、ログに記録し、警告し、再試行可能として扱います。"
            ]
          ]
        }
      },
      {
        "id": "operational-notes",
        "title": "操作上の注意事項",
        "bullets": [
          "すべてのルート ハンドラーは動的としてマークされているため、ビルド時に事前にレンダリングされた応答に依存しないでください。",
          "User-Agent ヘッダーは、プロバイダーの互換性を向上させるために、アップストリームでサポートされるレガシー リクエストに対して明示的に設定されます。",
          "入力のサニタイズは保守的です。ルート パラメータはリクエストのディスパッチ前にトリミングおよび正規化されます。",
          "銀行検証応答には生成された銀行画像バッジが含まれるため、フロントエンドは追加の検索を行わずに認識可能なビジュアルをレンダリングできます。",
          "ドキュメントのエンドポイントは同期しています。ペイロードをコンパクトに保ち、必要に応じて独自のシステムでダウンストリーム ストレージを非同期に実行します。"
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
    "label": "検証",
    "description": "IBAN および銀行検出による現地アンゴラ銀行口座検証。",
    "eyebrow": "カテゴリ",
    "title": "アンゴラの銀行識別子を検証し、発行銀行を検出します。",
    "intro": "検証ファミリーは `/api/v1/validate/iban` および `/api/v1/validate/bank-account` をカバーします。どちらのルートも入力を正規化し、銀行コードから銀行を検出し、生成された銀行バッジ イメージを UI 用に返します。",
    "summaryCards": [
      {
        "label": "ルート",
        "value": "2 GET"
      },
      {
        "label": "対象国の範囲",
        "value": "アンゴラ"
      },
      {
        "label": "視覚的な出力",
        "value": "銀行バッジのイメージ"
      }
    ],
    "sections": [
      {
        "id": "routes",
        "title": "このファミリーのルート",
        "table": {
          "columns": [
            "ルート",
            "目的",
            "キークエリ"
          ],
          "rows": [
            [
              "/api/v1/validate/iban",
              "mod-97 チェックと銀行検索を使用して AO 形式の IBAN を検証します。",
              "イバン"
            ],
            [
              "/api/v1/validate/bank-account",
              "21 桁のローカル アカウント構造を検証し、一致する IBAN を導出します。",
              "アカウント"
            ]
          ]
        }
      },
      {
        "id": "validate-iban-route",
        "title": "GET /api/v1/validate/iban",
        "description": "すでに完全な AO IBAN があり、正規化された部分、銀行メタデータ、および検証フラグが必要な場合は、このルートを使用します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "イバン",
              "はい",
              "AO 形式 IBAN。ハンドラーは、値をチェックする前に区切り文字を削除し、値を大文字にします。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"isValid\": true,\n  \"normalized\": \"AO06004000010123456789012\",\n  \"formatted\": \"AO06 0040 0001 0123 4567 8901 2\",\n  \"countryCode\": \"AO\",\n  \"checkDigits\": \"06\",\n  \"bank\": {\n    \"code\": \"BAI\",\n    \"ibanBankCode\": \"0040\",\n    \"name\": \"Banco Angolano de Investimentos\",\n    \"image\": \"data:image/svg+xml;base64,...\"\n  },\n  \"components\": {\n    \"bankCode\": \"0040\",\n    \"branchCode\": \"0001\",\n    \"accountNumber\": \"01234567890\",\n    \"controlDigits\": \"12\"\n  },\n  \"validation\": {\n    \"countrySupported\": true,\n    \"lengthValid\": true,\n    \"bankCodeKnown\": true,\n    \"mod97Valid\": true\n  }\n}"
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_IBAN\",\n    \"message\": \"Angolan IBANs must contain exactly 25 characters.\",\n    \"field\": \"iban\",\n    \"length\": 18\n  }\n}"
          }
        ],
        "bullets": [
          "詳細な UI 状態が必要な場合は、`isValid` だけに依存するのではなく、`validation.mod97Valid` と `validation.bankCodeKnown` を確認してください。",
          "`bank.image` を支払い概要または確認カードで直接使用します。"
        ]
      },
      {
        "id": "validate-bank-account-route",
        "title": "GET /api/v1/validate/bank-account",
        "description": "構造検証と、派生した IBAN の一致が必要な場合は、ローカルの 21 桁のアカウント文字列に対してこのルートを使用します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "アカウント",
              "はい",
              "21 桁のローカル アンゴラ アカウント文字列。数字以外の区切り文字は無視されます。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/validate/bank-account?account=004000010123456789012\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/validate/bank-account?account=004000010123456789012\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"isValid\": true,\n  \"normalized\": \"004000010123456789012\",\n  \"formatted\": \"0040 0001 0123 4567 8901 2\",\n  \"derivedIban\": \"AO06004000010123456789012\",\n  \"bankRecognized\": true,\n  \"bank\": {\n    \"code\": \"BAI\",\n    \"name\": \"Banco Angolano de Investimentos\",\n    \"image\": \"data:image/svg+xml;base64,...\"\n  },\n  \"components\": {\n    \"bankCode\": \"0040\",\n    \"branchCode\": \"0001\",\n    \"accountNumber\": \"01234567890\",\n    \"controlDigits\": \"12\"\n  },\n  \"validation\": {\n    \"formatValid\": true,\n    \"bankCodeKnown\": true,\n    \"controlDigitsPresent\": true\n  }\n}"
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_BANK_ACCOUNT\",\n    \"message\": \"Angolan local bank account numbers must contain exactly 21 digits.\",\n    \"field\": \"account\",\n    \"length\": 9\n  }\n}"
          }
        ],
        "bullets": [
          "これは構造的な検証であり、口座が銀行ネットワークでアクティブであることの確認ではありません。",
          "生の入力文字列ではなく、正規化されたアカウントまたは派生した IBAN を保持します。"
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
    "label": "電話",
    "description": "アンゴラの電話番号をオペレーターごとに解析、検証、分類します。",
    "eyebrow": "カテゴリ",
    "title": "アンゴラの番号を解析し、番号範囲を分類します。",
    "intro": "電話ルートはローカルまたは国際入力を正規化し、国と国内の部分を分離し、範囲がわかっている場合はモバイル プレフィックスを Unitel、Africell、または Movicel にマッピングします。",
    "summaryCards": [
      {
        "label": "ルート",
        "value": "3 GET"
      },
      {
        "label": "国コード",
        "value": "+244"
      },
      {
        "label": "可用性モデル",
        "value": "番号計画"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "このファミリーのルート",
        "table": {
          "columns": [
            "ルート",
            "目的",
            "キークエリ"
          ],
          "rows": [
            [
              "/api/v1/phone/parse",
              "構造化された電話番号コンポーネントと形式を返します。",
              "電話"
            ],
            [
              "/api/v1/phone/validate",
              "形式を検証し、番号計画の可用性を報告します。",
              "電話"
            ],
            [
              "/api/v1/phone/operator",
              "範囲プレフィックスから携帯電話会社を検出します。",
              "電話"
            ]
          ]
        }
      },
      {
        "id": "phone-parse-route",
        "title": "GET /api/v1/phone/parse",
        "description": "正規化された数値と、ストレージまたは UI 用の再利用可能な形式が必要な場合は、parse を使用します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "電話",
              "はい",
              "`923456789` や `+244923456789` などのアンゴラの国内番号または国際番号。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/parse?phone=%2B244923456789\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/parse?phone=%2B244923456789\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"normalized\": \"+244923456789\",\n  \"countryCode\": \"+244\",\n  \"nationalNumber\": \"923456789\",\n  \"internationalFormat\": \"+244 923 456 789\",\n  \"nationalFormat\": \"923 456 789\",\n  \"isMobile\": true,\n  \"type\": \"mobile\",\n  \"prefix\": \"92\",\n  \"subscriberNumber\": \"3456789\",\n  \"operator\": {\n    \"code\": \"UNITEL\",\n    \"name\": \"Unitel\",\n    \"prefix\": \"92\",\n    \"prefixes\": [\"92\", \"93\", \"94\"]\n  }\n}"
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_PHONE\",\n    \"message\": \"Angolan phone numbers must contain 9 national digits.\",\n    \"field\": \"phone\",\n    \"length\": 6\n  }\n}"
          }
        ]
      },
      {
        "id": "phone-validate-route",
        "title": "GET /api/v1/phone/validate",
        "description": "合格/不合格の結果と番号計画の可用性情報が必要な場合は、validate を使用します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "電話",
              "はい",
              "アンゴラの国内または国際電話番号。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=952345678\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=952345678\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"isValid\": true,\n  \"normalized\": \"+244952345678\",\n  \"type\": \"mobile\",\n  \"operator\": {\n    \"code\": \"AFRICELL\",\n    \"name\": \"Africell\",\n    \"prefix\": \"95\",\n    \"prefixes\": [\"95\"]\n  },\n  \"availability\": {\n    \"type\": \"numbering-plan\",\n    \"status\": \"allocated-range\",\n    \"canConfirmLiveSubscriber\": false\n  }\n}"
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_PHONE\",\n    \"message\": \"The \\\"phone\\\" query parameter is required.\",\n    \"field\": \"phone\"\n  }\n}"
          }
        ],
        "note": "入手可能かどうかは、既知のアンゴラの番号付け範囲に基づいています。ライブ加入者の到達可能性は確認されません。"
      },
      {
        "id": "phone-operator-route",
        "title": "GET /api/v1/phone/operator",
        "description": "演算子の検索のみが必要で、解析された電話ペイロードの残りの部分は必要ない場合は、演算子を使用します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "電話",
              "はい",
              "アンゴラの国内または国際電話番号。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/operator?phone=912345678\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/operator?phone=912345678\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"phone\": \"912345678\",\n  \"operator\": {\n    \"code\": \"MOVICEL\",\n    \"name\": \"Movicel\",\n    \"prefix\": \"91\",\n    \"prefixes\": [\"91\", \"99\"]\n  }\n}"
          },
          {
            "label": "エラー応答",
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
    "label": "住所と地域",
    "description": "アンゴラの住所を正規化し、州、市区町村、コミューンを読み取ります。",
    "eyebrow": "カテゴリ",
    "title": "アンゴラの住所を標準化し、位置レジストリを照会します。",
    "intro": "住所の正規化と提案は、厳選されたアンゴラ地理レジストリによってサポートされています。地理ルートは、管理フォームとオートコンプリート フローを駆動できる州、市区町村、およびコミューンのデータを返します。",
    "summaryCards": [
      {
        "label": "ルート",
        "value": "5 GET"
      },
      {
        "label": "地理レベル",
        "value": "コミューンとなる州"
      },
      {
        "label": "オートコンプリート",
        "value": "バイロ + コミューン + 自治体"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "このファミリーのルート",
        "table": {
          "columns": [
            "ルート",
            "目的",
            "キークエリ"
          ],
          "rows": [
            [
              "/api/v1/address/normalize",
              "自由記述のアンゴラの住所を整理して構造化します。",
              "住所"
            ],
            [
              "/api/v1/address/suggest",
              "バイロス、コミューン、または自治体を提案してください。",
              "q, type, province, municipality"
            ],
            [
              "/api/v1/geo/provinces",
              "アンゴラのすべての州をリストします。",
              "なし"
            ],
            [
              "/api/v1/geo/municipalities",
              "市区町村をリストします。必要に応じて都道府県別にフィルタリングします。",
              "州"
            ],
            [
              "/api/v1/geo/communes",
              "自治体のコミューンをリストします。",
              "市区町村、オプションの都道府県"
            ]
          ]
        }
      },
      {
        "id": "address-normalize-route",
        "title": "GET /api/v1/address/normalize",
        "description": "正規化を使用して、フリーテキスト アドレスを永続化する前、または内部レコードと照合する前に、そのアドレスをクリーンアップします。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "住所",
              "はい",
              "自由記述のアンゴラの住所。 `prov.` や `mun.` などの一般的な略語は自動的に展開されます。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/address/normalize?address=Benfica,%20Luanda\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/address/normalize?address=Benfica,%20Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"input\": \"Benfica, Luanda\",\n  \"normalized\": \"Benfica, Luanda\",\n  \"components\": {\n    \"bairro\": \"Benfica\",\n    \"commune\": \"Benfica\",\n    \"municipality\": \"Belas\",\n    \"province\": \"Luanda\"\n  },\n  \"diagnostics\": {\n    \"provinceMatched\": true,\n    \"municipalityMatched\": true,\n    \"communeMatched\": true,\n    \"bairroMatched\": true\n  }\n}"
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_ADDRESS\",\n    \"message\": \"The \\\"address\\\" query parameter is required.\",\n    \"field\": \"address\"\n  }\n}"
          }
        ]
      },
      {
        "id": "address-suggest-route",
        "title": "GET /api/v1/address/suggest",
        "description": "バイロ、コミューン、自治体、および州のオートコンプリート フィールドを操作するには、suggest を使用します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "q",
              "はい",
              "検索フラグメント。"
            ],
            [
              "タイプ",
              "いいえ",
              "オプションのフィルター: `bairro`、`commune`、`municipality`、または `province`。"
            ],
            [
              "州",
              "いいえ",
              "オプションの都道府県フィルター。"
            ],
            [
              "市区町村",
              "いいえ",
              "オプションの市区町村フィルター。"
            ],
            [
              "限界",
              "いいえ",
              "返される提案の最大数。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/address/suggest?q=tal&type=municipality&province=Luanda\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/address/suggest?q=tal&type=municipality&province=Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"query\": \"tal\",\n  \"suggestions\": [\n    {\n      \"type\": \"municipality\",\n      \"label\": \"Talatona\",\n      \"province\": \"Luanda\",\n      \"municipality\": \"Talatona\"\n    }\n  ]\n}"
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"MISSING_QUERY_PARAMETER\",\n    \"message\": \"The \\\"q\\\" query parameter is required.\",\n    \"field\": \"q\"\n  }\n}"
          }
        ]
      },
      {
        "id": "geo-provinces-route",
        "title": "GET /api/v1/geo/provinces",
        "description": "場所セレクターと管理フィルターの最上位レジストリ フィードとして都道府県を使用します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": []
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/geo/provinces\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/geo/provinces\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"country\": \"AO\",\n  \"countryName\": \"Angola\",\n  \"provinces\": [\n    {\n      \"name\": \"Luanda\",\n      \"slug\": \"luanda\",\n      \"capital\": \"Luanda\",\n      \"municipalityCount\": 16\n    }\n  ]\n}"
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INTERNAL_SERVER_ERROR\",\n    \"message\": \"Unexpected error while listing provinces.\"\n  }\n}"
          }
        ]
      },
      {
        "id": "geo-municipalities-route",
        "title": "GET /api/v1/geo/municipalities",
        "description": "都道府県フィルターの有無にかかわらず、市区町村を使用して第 2 レベルの場所セレクターを設定します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "州",
              "いいえ",
              "リストをフィルタリングするために使用されるオプションの州名。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/geo/municipalities?province=Luanda\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/geo/municipalities?province=Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"province\": \"Luanda\",\n  \"municipalities\": [\n    {\n      \"name\": \"Talatona\",\n      \"slug\": \"talatona\",\n      \"province\": \"Luanda\",\n      \"communeCount\": 2\n    }\n  ]\n}"
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"PROVINCE_NOT_FOUND\",\n    \"message\": \"No Angolan province matched the supplied query.\",\n    \"field\": \"province\",\n    \"value\": \"Atlantis\"\n  }\n}"
          }
        ]
      },
      {
        "id": "geo-communes-route",
        "title": "GET /api/v1/geo/communes",
        "description": "自治体がすでに選択されており、次の行政レベルが必要な場合は、コミューンを使用します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "市区町村",
              "はい",
              "展開する自治体名。"
            ],
            [
              "州",
              "いいえ",
              "繰り返される自治体ラベルの曖昧さをなくすために使用されるオプションの州名。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/geo/communes?municipality=Talatona&province=Luanda\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/geo/communes?municipality=Talatona&province=Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"municipality\": \"Talatona\",\n  \"province\": \"Luanda\",\n  \"coverage\": \"curated\",\n  \"communes\": [\n    { \"name\": \"Cidade Universitaria\", \"slug\": \"cidade-universitaria\" },\n    { \"name\": \"Talatona\", \"slug\": \"talatona\" }\n  ]\n}"
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"MISSING_QUERY_PARAMETER\",\n    \"message\": \"The \\\"municipality\\\" query parameter is required.\",\n    \"field\": \"municipality\"\n  }\n}"
          }
        ],
        "note": "一部の自治体は厳選されたコミューンの詳細を使用していますが、他の自治体は現在座席のみの報道を公開しています。"
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
    "label": "カレンダー",
    "description": "アンゴラの祝日と営業日の計算。",
    "eyebrow": "カテゴリ",
    "title": "休日、営業日、営業日のオフセットを考慮して作業します。",
    "intro": "カレンダー ファミリは、正式な固定休日と移動休日に加えて、給与計算、請求書発行、配送スケジュールに役立つ営業日の計算を返します。",
    "summaryCards": [
      {
        "label": "ルート",
        "value": "3 GET"
      },
      {
        "label": "ホリデーモデル",
        "value": "固定＋可動"
      },
      {
        "label": "コア用途",
        "value": "営業日の計算"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "このファミリーのルート",
        "table": {
          "columns": [
            "ルート",
            "目的",
            "キークエリ"
          ],
          "rows": [
            [
              "/api/v1/calendar/holidays",
              "祝日を1年間返還する。",
              "年"
            ],
            [
              "/api/v1/calendar/working-days",
              "2 つの日付の間の営業日をカウントします。",
              "from, to"
            ],
            [
              "/api/v1/calendar/add-working-days",
              "日付を営業日単位で前後に移動します。",
              "date, days"
            ]
          ]
        }
      },
      {
        "id": "calendar-holidays-route",
        "title": "GET /api/v1/calendar/holidays",
        "description": "休日を使用して、特定の年のサポートされているアンゴラの祝日スケジュールを取得します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "年",
              "いいえ",
              "オプションの暦年。デフォルトは現在の年です。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/calendar/holidays?year=2026\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/calendar/holidays?year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"year\": 2026,\n  \"holidays\": [\n    {\n      \"date\": \"2026-02-16\",\n      \"name\": \"Carnival Holiday\",\n      \"localName\": \"Tolerancia de Ponto de Carnaval\",\n      \"category\": \"movable\"\n    },\n    {\n      \"date\": \"2026-02-17\",\n      \"name\": \"Carnival\",\n      \"localName\": \"Carnaval\",\n      \"category\": \"movable\"\n    }\n  ]\n}"
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_YEAR\",\n    \"message\": \"The \\\"year\\\" query parameter must be an integer between 2000 and 2100.\",\n    \"field\": \"year\",\n    \"value\": 1800\n  }\n}"
          }
        ]
      },
      {
        "id": "calendar-working-days-route",
        "title": "GET /api/v1/calendar/working-days",
        "description": "営業日を使用して、週末とサポートされているアンゴラの休日を除き、2 つの日付の間の営業日をカウントします。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "から",
              "はい",
              "`YYYY-MM-DD` 形式の開始日。"
            ],
            [
              "に",
              "はい",
              "`YYYY-MM-DD` 形式の終了日。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/calendar/working-days?from=2026-03-20&to=2026-03-24\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/calendar/working-days?from=2026-03-20&to=2026-03-24\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"from\": \"2026-03-20\",\n  \"to\": \"2026-03-24\",\n  \"workingDays\": 2,\n  \"excludedWeekendDays\": 2,\n  \"excludedHolidayDays\": 1\n}"
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_DATE_RANGE\",\n    \"message\": \"The \\\"from\\\" date must be earlier than or equal to the \\\"to\\\" date.\",\n    \"from\": \"2026-03-25\",\n    \"to\": \"2026-03-24\"\n  }\n}"
          }
        ]
      },
      {
        "id": "calendar-add-working-days-route",
        "title": "GET /api/v1/calendar/add-working-days",
        "description": "add-working-days を使用して、サポートされている営業日カレンダーに従って基準日を前後に移動します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "日付",
              "はい",
              "`YYYY-MM-DD` 形式の基準日付。"
            ],
            [
              "日",
              "はい",
              "営業日のオフセットを表す符号付き整数。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/calendar/add-working-days?date=2026-03-20&days=1\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/calendar/add-working-days?date=2026-03-20&days=1\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"inputDate\": \"2026-03-20\",\n  \"days\": 1,\n  \"resultDate\": \"2026-03-24\",\n  \"direction\": \"forward\"\n}"
          },
          {
            "label": "エラー応答",
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
    "description": "VAT、請求書の合計、アンゴラのマネー フローのインフレ調整。",
    "eyebrow": "カテゴリ",
    "title": "VAT、請求書の合計、インフレ調整後の値を計算します。",
    "intro": "財務エンドポイントは、バックオフィス システム、見積もり、レポート ツールで使用できる確定的な計算を提供します。これらは、導出された値と、その値に到達するために使用された基礎の両方を返します。",
    "summaryCards": [
      {
        "label": "ルート",
        "value": "3 GET"
      },
      {
        "label": "通貨",
        "value": "AOAファースト"
      },
      {
        "label": "請求書の入力",
        "value": "JSON クエリ ペイロード"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "このファミリーのルート",
        "table": {
          "columns": [
            "ルート",
            "目的",
            "キークエリ"
          ],
          "rows": [
            [
              "/api/v1/finance/vat",
              "VAT を含む合計を分割または構築します。",
              "amount, rate, inclusive"
            ],
            [
              "/api/v1/finance/invoice-total",
              "品目から請求書の合計を計算します。",
              "lines, discount, discountType"
            ],
            [
              "/api/v1/finance/inflation-adjust",
              "アンゴラ CPI シリーズを使用して、年をまたいで値を調整します。",
              "amount, from, to"
            ]
          ]
        }
      },
      {
        "id": "finance-vat-route",
        "title": "GET /api/v1/finance/vat",
        "description": "VAT を使用して、総計を正味プラス税金に分割するか、正味金額から総計を作成します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "金額",
              "はい",
              "評価する基本金額。"
            ],
            [
              "率",
              "いいえ",
              "税率の割合。デフォルトは 14 です。"
            ],
            [
              "包括的",
              "いいえ",
              "`true` の場合、金額は VAT を含むものとして扱われます。 `false` の場合、金額は正味として扱われます。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"amount\": 114000,\n  \"rate\": 14,\n  \"inclusive\": true,\n  \"netAmount\": 100000,\n  \"vatAmount\": 14000,\n  \"grossAmount\": 114000\n}"
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_RATE\",\n    \"message\": \"Tax rates must be between 0 and 100.\",\n    \"field\": \"rate\",\n    \"value\": 140\n  }\n}"
          }
        ]
      },
      {
        "id": "finance-invoice-total-route",
        "title": "GET /api/v1/finance/invoice-total",
        "description": "invoice-total を使用すると、各クライアントで価格計算を重複させることなく、エンコードされた品目から請求書の合計を計算できます。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "行",
              "はい",
              "JSON 配列文字列 (`description`、`quantity`、`unitPrice`、およびオプションの `vatRate`)。"
            ],
            [
              "割引",
              "いいえ",
              "`discountType` に応じた割引額またはパーセント。"
            ],
            [
              "割引タイプ",
              "いいえ",
              "`amount` または `percent` のいずれか。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/invoice-total?lines=%5B%7B%22description%22%3A%22Service%22%2C%22quantity%22%3A1%2C%22unitPrice%22%3A100000%2C%22vatRate%22%3A14%7D%5D&discount=10&discountType=percent\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/invoice-total?lines=%5B%7B%22description%22%3A%22Service%22%2C%22quantity%22%3A1%2C%22unitPrice%22%3A100000%2C%22vatRate%22%3A14%7D%5D&discount=10&discountType=percent\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"discountType\": \"percent\",\n  \"subtotal\": 100000,\n  \"discountAmount\": 10000,\n  \"taxableBase\": 90000,\n  \"vatTotal\": 12600,\n  \"grandTotal\": 102600\n}"
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_JSON\",\n    \"message\": \"The \\\"lines\\\" query parameter must be a valid JSON array.\",\n    \"field\": \"lines\"\n  }\n}"
          }
        ]
      },
      {
        "id": "finance-inflation-route",
        "title": "GET /api/v1/finance/inflation-adjust",
        "description": "インフレ調整を使用して、サポートされているアンゴラ CPI 年の名目値を比較します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "金額",
              "はい",
              "元の名目金額。"
            ],
            [
              "から",
              "はい",
              "ソースの日付または年の文字列。最初の 4 桁は CPI 年として使用されます。"
            ],
            [
              "に",
              "はい",
              "ターゲットの日付または年の文字列。最初の 4 桁は CPI 年として使用されます。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/inflation-adjust?amount=100000&from=2020-01-01&to=2025-01-01\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/inflation-adjust?amount=100000&from=2020-01-01&to=2025-01-01\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"amount\": 100000,\n  \"fromYear\": 2020,\n  \"toYear\": 2025,\n  \"inflationFactor\": 2.5642,\n  \"adjustedAmount\": 256420,\n  \"source\": \"Curated annual Angola CPI index series.\"\n}"
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"UNSUPPORTED_CPI_YEAR\",\n    \"message\": \"Inflation adjustment is available for Angola annual CPI years from 2019 through 2025.\",\n    \"fromYear\": 2010,\n    \"toYear\": 2025\n  }\n}"
          }
        ],
        "note": "調整された金額がレポートまたは価格設定フローで使用されるときは常に、計算年の範囲を保持します。"
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
    "label": "給与",
    "description": "アンゴラの給与計算の仮定に基づいて、純給与、総給与、雇用主コストを推定します。",
    "eyebrow": "カテゴリ",
    "title": "従業員と雇用主の観点からアンゴラの給与推計を実行します。",
    "intro": "サラリーファミリーは、従業員の社会保障、雇用主の社会保障、およびサポート対象期間の雇用所得の源泉徴収表について、アンゴラの内部給与仮定を適用します。",
    "summaryCards": [
      {
        "label": "ルート",
        "value": "3 GET"
      },
      {
        "label": "年",
        "value": "2025 年と 2026 年"
      },
      {
        "label": "出力",
        "value": "正味、総、雇用主コスト"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "このファミリーのルート",
        "table": {
          "columns": [
            "ルート",
            "目的",
            "キークエリ"
          ],
          "rows": [
            [
              "/api/v1/salary/net",
              "総給与から手取り給与を推定します。",
              "gross, year"
            ],
            [
              "/api/v1/salary/gross",
              "ターゲットネットに必要な総給与を見積もります。",
              "net, year"
            ],
            [
              "/api/v1/salary/employer-cost",
              "拠出金を含む雇用主のコストを見積もります。",
              "gross, year"
            ]
          ]
        }
      },
      {
        "id": "salary-net-route",
        "title": "GET /api/v1/salary/net",
        "description": "ソース値が総給与であり、推定手取り金額が必要な場合は、net を使用します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "ひどい",
              "はい",
              "総月給。"
            ],
            [
              "年",
              "いいえ",
              "サポートされている課税年度。現在は `2025` または `2026` です。デフォルトは `2026` です。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/salary/net?gross=500000&year=2026\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/salary/net?gross=500000&year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"year\": 2026,\n  \"grossSalary\": 500000,\n  \"taxableIncome\": 485000,\n  \"employeeSocialSecurity\": 15000,\n  \"irtRate\": 16,\n  \"irtTaxAmount\": 52100,\n  \"netSalary\": 432900,\n  \"employerContribution\": 40000,\n  \"assumptions\": [\"Applies monthly employment-income withholding for Angola.\"]\n}"
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"UNSUPPORTED_TAX_YEAR\",\n    \"message\": \"Supported salary-tax years are 2025 and 2026.\",\n    \"year\": 2024\n  }\n}"
          }
        ]
      },
      {
        "id": "salary-gross-route",
        "title": "GET /api/v1/salary/gross",
        "description": "目標値が純給与であり、その目標値を達成するために必要なおおよその総給与が必要な場合は、gross を使用します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "ネット",
              "はい",
              "希望する純月収。"
            ],
            [
              "年",
              "いいえ",
              "サポートされている課税年度。デフォルトは `2026` です。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/salary/gross?net=432900&year=2026\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/salary/gross?net=432900&year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"year\": 2026,\n  \"targetNetSalary\": 432900,\n  \"grossSalary\": 500000,\n  \"employeeSocialSecurity\": 15000,\n  \"irtTaxAmount\": 52100,\n  \"netSalary\": 432900\n}"
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_NUMBER\",\n    \"message\": \"The \\\"net\\\" query parameter must be a non-negative number.\",\n    \"field\": \"net\",\n    \"value\": \"-1\"\n  }\n}"
          }
        ]
      },
      {
        "id": "salary-employer-cost-route",
        "title": "GET /api/v1/salary/employer-cost",
        "description": "給与計画で従業員の総給与に加えて会社側の負担が必要な場合は、雇用主コストを使用します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "ひどい",
              "はい",
              "総月給。"
            ],
            [
              "年",
              "いいえ",
              "サポートされている課税年度。デフォルトは `2026` です。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/salary/employer-cost?gross=500000&year=2026\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/salary/employer-cost?gross=500000&year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"year\": 2026,\n  \"grossSalary\": 500000,\n  \"employerContribution\": 40000,\n  \"totalEmployerCost\": 540000\n}"
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_NUMBER\",\n    \"message\": \"The \\\"gross\\\" query parameter must be a non-negative number.\",\n    \"field\": \"gross\",\n    \"value\": \"abc\"\n  }\n}"
          }
        ],
        "note": "これらのエンドポイントはシナリオ計算ツールであり、給与計算サービスではありません。結果を表示する UI で仮定を明らかにします。"
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
    "label": "時間",
    "description": "現在の現地時間、タイムゾーンの変換、営業時間の確認。",
    "eyebrow": "カテゴリ",
    "title": "タイムゾーンと現地の営業時間を確認します。",
    "intro": "時間エンドポイントは、完全なスケジュール プラットフォームをアプリケーションに組み込むことなく、小さなタイムゾーン ユーティリティ レイヤーを提供します。",
    "summaryCards": [
      {
        "label": "ルート",
        "value": "3 GET"
      },
      {
        "label": "デフォルトゾーン",
        "value": "アフリカ/ルアンダ"
      },
      {
        "label": "ビジネス窓口",
        "value": "08:00～17:00"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "このファミリーのルート",
        "table": {
          "columns": [
            "ルート",
            "目的",
            "キークエリ"
          ],
          "rows": [
            [
              "/api/v1/time/now",
              "タイムゾーンの現在時刻を返します。",
              "タイムゾーン"
            ],
            [
              "/api/v1/time/convert",
              "日時をあるタイムゾーンから別のタイムゾーンに変換します。",
              "datetime, from, to"
            ],
            [
              "/api/v1/time/business-hours",
              "日付時刻が営業時間内かどうかを確認します。",
              "datetime, timezone, start, end"
            ]
          ]
        }
      },
      {
        "id": "time-now-route",
        "title": "GET /api/v1/time/now",
        "description": "特定の IANA タイムゾーンの現在の現地時間が必要な場合は、now を使用します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "タイムゾーン",
              "いいえ",
              "IANA タイムゾーン。デフォルトは `Africa/Luanda` です。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/time/now?timezone=Africa/Luanda\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/time/now?timezone=Africa/Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"iso\": \"2026-03-23T18:45:00\",\n  \"timezone\": \"Africa/Luanda\",\n  \"offset\": \"GMT+1\",\n  \"components\": {\n    \"year\": 2026,\n    \"month\": 3,\n    \"day\": 23,\n    \"hour\": 18,\n    \"minute\": 45,\n    \"second\": 0,\n    \"weekday\": 1\n  }\n}"
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_TIMEZONE\",\n    \"message\": \"The supplied timezone is not supported by the runtime.\",\n    \"field\": \"timezone\",\n    \"value\": \"Mars/Base\"\n  }\n}"
          }
        ]
      },
      {
        "id": "time-convert-route",
        "title": "GET /api/v1/time/convert",
        "description": "ローカルまたは絶対日時をあるタイムゾーンから別のタイムゾーンに変換するには、convert を使用します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "日時",
              "はい",
              "ISO 日時。オフセットが指定されていない場合、ルートはソース タイムゾーンでオフセットを解釈します。"
            ],
            [
              "から",
              "はい",
              "ソース IANA タイムゾーン。"
            ],
            [
              "に",
              "はい",
              "ターゲットの IANA タイムゾーン。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/time/convert?datetime=2026-03-23T10:00:00&from=Africa/Luanda&to=UTC\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/time/convert?datetime=2026-03-23T10:00:00&from=Africa/Luanda&to=UTC\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"input\": {\n    \"datetime\": \"2026-03-23T10:00:00\",\n    \"timezone\": \"Africa/Luanda\"\n  },\n  \"source\": {\n    \"iso\": \"2026-03-23T10:00:00\",\n    \"timezone\": \"Africa/Luanda\"\n  },\n  \"target\": {\n    \"iso\": \"2026-03-23T09:00:00\",\n    \"timezone\": \"UTC\"\n  }\n}"
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_DATETIME\",\n    \"message\": \"Date-times without an offset must use YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss format.\",\n    \"field\": \"datetime\",\n    \"value\": \"23/03/2026 10:00\"\n  }\n}"
          }
        ]
      },
      {
        "id": "time-business-hours-route",
        "title": "GET /api/v1/time/business-hours",
        "description": "通知、電話、またはリマインダーを送信する前に、現地オフィスの窓口を尊重する営業時間を使用してください。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "日時",
              "はい",
              "評価する ISO 日時。"
            ],
            [
              "タイムゾーン",
              "いいえ",
              "IANA タイムゾーン。デフォルトは `Africa/Luanda` です。"
            ],
            [
              "始める",
              "いいえ",
              "営業日の開始時刻 (`HH:mm`)。デフォルトは `08:00` です。"
            ],
            [
              "終わり",
              "いいえ",
              "営業日の終了時刻 (`HH:mm`)。デフォルトは `17:00` です。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/time/business-hours?datetime=2026-03-23T09:30:00&timezone=Africa/Luanda\""
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/time/business-hours?datetime=2026-03-23T09:30:00&timezone=Africa/Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "json",
            "content": "{\n  \"timezone\": \"Africa/Luanda\",\n  \"businessHours\": {\n    \"start\": \"08:00\",\n    \"end\": \"17:00\",\n    \"timezone\": \"Africa/Luanda\"\n  },\n  \"isBusinessDay\": true,\n  \"isWithinBusinessHours\": true\n}"
          },
          {
            "label": "エラー応答",
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
    "label": "書類",
    "description": "JSON ペイロードから請求書、領収書、契約書の PDF を生成します。",
    "eyebrow": "カテゴリ",
    "title": "オンデマンドで取引および契約の PDF を生成します。",
    "intro": "ドキュメント ルートは、コンパクトな JSON ペイロードを同期 PDF ファイルに変換し、直接ダウンロードしたり、独自のアプリケーションで保存したりできます。",
    "summaryCards": [
      {
        "label": "ルート",
        "value": "3 POST"
      },
      {
        "label": "フォーマット",
        "value": "PDF 添付ファイル"
      },
      {
        "label": "こんな方に最適",
        "value": "内部ワークフロー"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "このファミリーのルート",
        "table": {
          "columns": [
            "ルート",
            "目的",
            "主要な本文フィールド"
          ],
          "rows": [
            [
              "/api/v1/documents/invoice",
              "請求書 PDF を生成します。",
              "seller, buyer, items"
            ],
            [
              "/api/v1/documents/receipt",
              "レシート PDF を生成します。",
              "receivedFrom, amount"
            ],
            [
              "/api/v1/documents/contract",
              "コントラクト PDF を生成します。",
              "parties, clauses"
            ]
          ]
        }
      },
      {
        "id": "documents-invoice-route",
        "title": "POST /api/v1/documents/invoice",
        "description": "コンパクトな JSON ペイロードからの同期 PDF 請求書が必要な場合は、請求書を使用します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "売り手",
              "はい",
              "少なくとも `name` を持つ販売者オブジェクト。"
            ],
            [
              "買い手",
              "はい",
              "少なくとも `name` を持つ購入者オブジェクト。"
            ],
            [
              "アイテム",
              "はい",
              "`description`、`quantity`、`unitPrice`、およびオプションの `vatRate` を含む項目の配列。"
            ],
            [
              "請求書番号 / 発行日 / 期限日 / メモ",
              "いいえ",
              "オプションの請求書のメタデータ フィールド。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/invoice \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"seller\":{\"name\":\"Orb3x, Lda\"},\"buyer\":{\"name\":\"Cliente Exemplo\"},\"items\":[{\"description\":\"Service\",\"quantity\":1,\"unitPrice\":100000,\"vatRate\":14}]}' \\\n  --output invoice.pdf"
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "import { writeFile } from \"node:fs/promises\";\n\nasync function main() {\n  const payload = {\n    \"seller\": {\n      \"name\": \"Orb3x, Lda\"\n    },\n    \"buyer\": {\n      \"name\": \"Cliente Exemplo\"\n    },\n    \"items\": [\n      {\n        \"description\": \"Service\",\n        \"quantity\": 1,\n        \"unitPrice\": 100000,\n        \"vatRate\": 14\n      }\n    ]\n  };\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/invoice\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload)\n  });\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const fileBuffer = Buffer.from(await response.arrayBuffer());\n  await writeFile(\"invoice.pdf\", fileBuffer);\n  console.log(\"Saved invoice.pdf\");\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "bash",
            "content": "HTTP/1.1 200 OK\nContent-Type: application/pdf\nContent-Disposition: attachment; filename=\"invoice.pdf\""
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_INVOICE_PAYLOAD\",\n    \"message\": \"Invoice payload must include seller, buyer, and at least one item.\"\n  }\n}"
          }
        ]
      },
      {
        "id": "documents-receipt-route",
        "title": "POST /api/v1/documents/receipt",
        "description": "支払者と金額のみが必要な支払い確認には、領収書を使用します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "から受け取りました",
              "はい",
              "少なくとも `name` を持つパーティ オブジェクト。"
            ],
            [
              "金額",
              "はい",
              "受け取った金額。"
            ],
            [
              "領収書番号 / 発行日 / 理由 / 支払い方法 / 注意事項",
              "いいえ",
              "オプションのレシートメタデータフィールド。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/receipt \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"receivedFrom\":{\"name\":\"Cliente Exemplo\"},\"amount\":100000}' \\\n  --output receipt.pdf"
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "import { writeFile } from \"node:fs/promises\";\n\nasync function main() {\n  const payload = {\n    \"receivedFrom\": {\n      \"name\": \"Cliente Exemplo\"\n    },\n    \"amount\": 100000\n  };\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/receipt\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload)\n  });\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const fileBuffer = Buffer.from(await response.arrayBuffer());\n  await writeFile(\"receipt.pdf\", fileBuffer);\n  console.log(\"Saved receipt.pdf\");\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "bash",
            "content": "HTTP/1.1 200 OK\nContent-Type: application/pdf\nContent-Disposition: attachment; filename=\"receipt.pdf\""
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_RECEIPT_PAYLOAD\",\n    \"message\": \"Receipt payload must include receivedFrom and amount.\"\n  }\n}"
          }
        ]
      },
      {
        "id": "documents-contract-route",
        "title": "POST /api/v1/documents/contract",
        "description": "当事者と条項から生成された基本合意書 PDF が必要な場合は、契約書を使用します。",
        "table": {
          "columns": [
            "パラメータ",
            "必須",
            "説明"
          ],
          "rows": [
            [
              "パーティー",
              "はい",
              "少なくとも 2 つのパーティ オブジェクトを含む配列。"
            ],
            [
              "条項",
              "はい",
              "契約条項の配列。"
            ],
            [
              "タイトル / 契約番号 / 発行日 / 注意事項",
              "いいえ",
              "オプションの契約メタデータ フィールド。"
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL の使用法",
            "language": "bash",
            "content": "curl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/contract \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"parties\":[{\"name\":\"Orb3x, Lda\"},{\"name\":\"Cliente Exemplo\"}],\"clauses\":[\"The provider delivers the service.\",\"The client pays within 15 days.\"]}' \\\n  --output contract.pdf"
          },
          {
            "label": "Node.js の使用法",
            "language": "js",
            "content": "import { writeFile } from \"node:fs/promises\";\n\nasync function main() {\n  const payload = {\n    \"parties\": [\n      {\n        \"name\": \"Orb3x, Lda\"\n      },\n      {\n        \"name\": \"Cliente Exemplo\"\n      }\n    ],\n    \"clauses\": [\n      \"The provider delivers the service.\",\n      \"The client pays within 15 days.\"\n    ]\n  };\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/contract\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload)\n  });\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const fileBuffer = Buffer.from(await response.arrayBuffer());\n  await writeFile(\"contract.pdf\", fileBuffer);\n  console.log(\"Saved contract.pdf\");\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 応答",
            "language": "bash",
            "content": "HTTP/1.1 200 OK\nContent-Type: application/pdf\nContent-Disposition: attachment; filename=\"contract.pdf\""
          },
          {
            "label": "エラー応答",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_CONTRACT_PAYLOAD\",\n    \"message\": \"Contract payload must include at least two parties and one clause.\"\n  }\n}"
          }
        ],
        "note": "ドキュメントの生成は意図的に狭くされています。監査可能性や再生成が必要な場合は、ソース JSON を自分で永続化してください。"
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
    "label": "NIF 検証",
    "description": "納税者検証の検索動作、ペイロード フィールド、および失敗モード。",
    "eyebrow": "エンドポイント",
    "title": "正規化された NIF 値から納税者の詳細を検索します。",
    "intro": "NIF ルートは、パスでアンゴラの税 ID を受け入れ、それを検証し、公的税務ポータルにデータを要求し、解析された JSON 応答を返します。",
    "endpoint": {
      "method": "GET",
      "path": "/api/nif/{nif}",
      "detail": "パス パラメータは、検索が試行される前にトリミングされ、大文字にされ、文字と数字に制限されます。"
    },
    "summaryCards": [
      {
        "label": "入力タイプ",
        "value": "パスパラメータ"
      },
      {
        "label": "上流のソース",
        "value": "アンゴラ税務ポータル"
      },
      {
        "label": "一次障害",
        "value": "ポータルの可用性"
      }
    ],
    "sections": [
      {
        "id": "success-shape",
        "title": "成功のペイロード",
        "code": {
          "label": "200 応答",
          "language": "json",
          "content": "{\n  \"NIF\": \"004813023LA040\",\n  \"Name\": \"EMPRESA EXEMPLO, LDA\",\n  \"Type\": \"Pessoa Colectiva\",\n  \"Status\": \"Activo\",\n  \"Defaulting\": \"Não\",\n  \"VATRegime\": \"Regime Geral\",\n  \"isTaxResident\": true\n}"
        }
      },
      {
        "id": "field-glossary",
        "title": "返されるフィールド",
        "table": {
          "columns": [
            "フィールド",
            "意味"
          ],
          "rows": [
            [
              "NIF",
              "ルックアップに使用され、応答でエコーされる正規化された識別子。"
            ],
            [
              "名前",
              "ポータルの応答から解析された登録納税者名。"
            ],
            [
              "タイプ",
              "ソースポータルから返された納税者の分類。"
            ],
            [
              "ステータス",
              "現在の納税者のステータス文字列。"
            ],
            [
              "債務不履行",
              "納税者に債務不履行のフラグが立てられているかどうか。"
            ],
            [
              "VAT制度",
              "VAT ポータルから返された体制テキスト。"
            ],
            [
              "納税者です",
              "結果セクションの常駐マーカーまたは非常駐マーカーから導出されたブール値。"
            ]
          ]
        }
      },
      {
        "id": "error-cases",
        "title": "何がうまくいかないのか",
        "bullets": [
          "空または無効なパス パラメーターは、アップストリーム呼び出しが行われる前に 400 INVALID_NIF エラーを返します。",
          "税務ポータルが結果を報告しない場合、ルートは 404 NIF_NOT_FOUND 応答を返します。",
          "ポータルからの不正な形式または構造的に変更された HTML は、502 UNPARSEABLE_RESPONSE エラーを返します。",
          "ネットワークと TLS の問題は、証明書のエッジ ケースの内部フォールバックとともに、アップストリームの可用性エラーとして表面化します。"
        ],
        "note": "上流のソースは HTML であるため、ポータルでのスキーマの変更は長期的なメンテナンスの最大のリスクとなります。パーサーの周囲でコントラクト テストを維持します。"
      },
      {
        "id": "integration-tips",
        "title": "統合のヒント",
        "bullets": [
          "ルート パスを構築する前に、ユーザーが入力した識別子のスペースと大文字小文字を正規化します。",
          "このエンドポイントを永続的な記録ソースとしてではなく、ライブ検証として扱います。ポータルのデータは時間の経過とともに変化する可能性があります。",
          "出力がコンプライアンスアクションを通知する場合は、生の検索結果を独自の監査コンテキストと一緒に保存します。",
          "ポータルが一時的に利用できない場合は、上流のエラーを一般的な検証エラーに変えるのではなく、明確なユーザー メッセージを表示します。"
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
    "label": "翻訳",
    "description": "リクエスト本文のルール、言語処理、および実践的な統合ガイダンス。",
    "eyebrow": "エンドポイント",
    "title": "明示的な検証とソース言語レポートを使用してテキストを翻訳します。",
    "intro": "翻訳ルートは、JSON 入力を受け入れ、言語コードを検証し、Google のパブリック翻訳エンドポイントを呼び出し、検出または提供されたソース言語で翻訳されたテキストを返します。",
    "endpoint": {
      "method": "POST",
      "path": "/api/translate",
      "detail": "テキスト、ターゲット言語コード、およびオプションのソース言語コードを含む JSON を送信します。ソースが省略された場合、ルートは自動検出を使用します。"
    },
    "summaryCards": [
      {
        "label": "入力タイプ",
        "value": "JSON 本体"
      },
      {
        "label": "ターゲットの検証",
        "value": "2～12文字"
      },
      {
        "label": "自動検出",
        "value": "デフォルトで有効になっています"
      }
    ],
    "sections": [
      {
        "id": "request-shape",
        "title": "リクエストペイロード",
        "code": {
          "label": "POST 本体",
          "language": "json",
          "content": "{\n  \"text\": \"Olá mundo\",\n  \"to\": \"en\",\n  \"from\": \"pt\"\n}"
        },
        "bullets": [
          "テキストは必須であり、発送前にトリミングされます。",
          "to は必須であり、単純な小文字の言語コード パターンと一致する必要があります。",
          "from はオプションです。存在しない場合、ルートはアップストリームの自動検出を使用します。",
          "無効な JSON は、翻訳作業が開始される前に 400 応答を返します。"
        ]
      },
      {
        "id": "success-shape",
        "title": "成功のペイロード",
        "code": {
          "label": "200 応答",
          "language": "json",
          "content": "{\n  \"translatedText\": \"Hello world\",\n  \"sourceLanguage\": \"pt\",\n  \"targetLanguage\": \"en\",\n  \"status\": true,\n  \"message\": \"\"\n}"
        }
      },
      {
        "id": "failure-modes",
        "title": "一般的な故障モード",
        "table": {
          "columns": [
            "コード",
            "原因",
            "推奨される取り扱い"
          ],
          "rows": [
            [
              "INVALID_TEXT",
              "テキストフィールドが欠落しているか空白です。",
              "送信をブロックし、ユーザーにコンテンツの入力を求めます。"
            ],
            [
              "INVALID_LANGUAGE",
              "ソース言語またはターゲット言語のコードが欠落しているか、形式が正しくありません。",
              "再試行する前にペイロードを修正してください。"
            ],
            [
              "UPSTREAM_TIMEOUT",
              "翻訳プロバイダーがタイムアウト時間を超えました。",
              "ユーザー フローが許可する場合は、バックオフを使用して再試行します。"
            ],
            [
              "UPSTREAM_BAD_RESPONSE",
              "プロバイダーが 200 以外の応答を返しました。",
              "正常に機能を低下させるか、再試行のためにキューに入れます。"
            ],
            [
              "UNPARSEABLE_RESPONSE",
              "プロバイダー JSON を翻訳されたテキストに解析できませんでした。",
              "警告して元のテキストに戻ります。"
            ]
          ]
        }
      },
      {
        "id": "best-practices",
        "title": "使用上の注意",
        "bullets": [
          "編集者が後でソースと翻訳されたコピーを比較できるように、オリジナルのテキストを独自のデータ モデルに保存します。",
          "再利用が許容される場合は、成功した独自の翻訳をキャッシュします。ルート自体は意図的に応答をキャッシュしません。",
          "入力言語がすでにわかっているバッチ ワークフローでは、明示的なソース言語コードを優先します。",
          "応答の sourceLanguage を使用して、モデレーションまたはサポート ツールで予期しない検出結果にフラグを立てます。"
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
    "label": "外貨両替",
    "description": "FX データの基本レート検索、金額換算、およびペイロード セマンティクス。",
    "eyebrow": "エンドポイント",
    "title": "同じエンドポイントからの単位レートまたは換算された合計を返します。",
    "intro": "通貨ルートは、基本通貨のメタデータとレート テーブルを検索し、オプションでそれらのレートに金額クエリ パラメータを乗算します。",
    "endpoint": {
      "method": "GET",
      "path": "/api/exchange/{base}",
      "detail": "path パラメータは基本通貨を識別します。応答に事前計算された convertedRates も必要な場合は、?amount=value を追加します。"
    },
    "summaryCards": [
      {
        "label": "入力タイプ",
        "value": "パス + クエリ"
      },
      {
        "label": "拡張出力",
        "value": "convertedRates"
      },
      {
        "label": "主なリスク",
        "value": "上流の鮮度"
      }
    ],
    "sections": [
      {
        "id": "lookup-shape",
        "title": "金額のない成功ペイロード",
        "code": {
          "label": "単価検索",
          "language": "json",
          "content": "{\n  \"currencyCode\": \"aoa\",\n  \"currencyName\": \"Angolan kwanza\",\n  \"currencySymbol\": \"Kz\",\n  \"countryName\": \"Angola\",\n  \"countryCode\": \"AO\",\n  \"flagImage\": \"https://example.com/flags/ao.png\",\n  \"ratesDate\": \"2026-03-22\",\n  \"baseCurrency\": \"AOA\",\n  \"unitRates\": {\n    \"usd\": 0.0011,\n    \"eur\": 0.0010\n  }\n}"
        }
      },
      {
        "id": "conversion-shape",
        "title": "成功ペイロードと金額",
        "code": {
          "label": "変換を伴う検索",
          "language": "json",
          "content": "{\n  \"baseCurrency\": \"AOA\",\n  \"amount\": 1000000,\n  \"unitRates\": {\n    \"usd\": 0.0011\n  },\n  \"convertedRates\": {\n    \"usd\": 1100\n  }\n}"
        },
        "bullets": [
          "amount は数値として解析され、0 以上である必要があります。",
          "convertedRates は、unitRates のキーをミラーリングし、各値を量で乗算します。",
          "ルートが小文字の入力を受け入れても、baseCurrency は応答内で大文字に正規化されます。"
        ]
      },
      {
        "id": "metadata",
        "title": "メタデータフィールド",
        "table": {
          "columns": [
            "フィールド",
            "意味"
          ],
          "rows": [
            [
              "通貨コード",
              "アップストリーム応答からの正規化された基本通貨コード。"
            ],
            [
              "通貨名",
              "基本通貨の表示名。"
            ],
            [
              "通貨記号",
              "基本通貨に関連付けられたシンボル。"
            ],
            [
              "国名 / 国コード",
              "基本通貨に関連付けられた国のメタデータ。"
            ],
            [
              "旗画像",
              "上流プロバイダーから返されたフラグ資産 URL。"
            ],
            [
              "ratesDate",
              "アップストリーム レート スナップショットに添付された日付。"
            ]
          ]
        }
      },
      {
        "id": "implementation-guidance",
        "title": "実施ガイダンス",
        "bullets": [
          "書式設定、丸め、または下流のビジネス計算を完全に制御する必要がある場合は、unitRates を使用します。",
          "エンドポイントが UI を直接供給しており、クライアント間での重複した計算を避けたい場合は、convertedRates を使用します。",
          "上流のプロバイダーがすべてのスナップショットにすべてのコードを含めていない可能性があるため、UI で通貨が欠落しないように注意してください。",
          "変換された合計を永続化する場合は、レポートを監査可能な状態に保つために、ratesDate も永続化してください。"
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
    "label": "例",
    "description": "本番環境で使用するための実用的な cURL、Node.js、および TypeScript の例。",
    "eyebrow": "実装",
    "title": "公開されたルートを呼び出す例。",
    "intro": "以下のスニペットは、このリポジトリで公開されているルートの cURL リクエスト、一致する Node.js フェッチ呼び出し、および型指定された TypeScript ヘルパーを示しています。",
    "summaryCards": [
      {
        "label": "フォーマット",
        "value": "cURL + Node.js"
      },
      {
        "label": "クライアント重視",
        "value": "サーバーセーフなフェッチ"
      },
      {
        "label": "エラー戦略",
        "value": "コードを意識した処理"
      }
    ],
    "sections": [
      {
        "id": "curl",
        "title": "cURL および Node.js の例",
        "codes": [
          {
            "label": "ターミナルスモークテスト (cURL)",
            "language": "bash",
            "content": "curl -s https://orb3x-utils-api.vercel.app/api/nif/004813023LA040\n\ncurl -s -X POST https://orb3x-utils-api.vercel.app/api/translate \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"text\":\"Preciso de ajuda\",\"to\":\"en\"}'\n\ncurl -s \"https://orb3x-utils-api.vercel.app/api/exchange/aoa?amount=250000\""
          },
          {
            "label": "ターミナルスモークテスト (Node.js)",
            "language": "js",
            "content": "async function main() {\n  const response1 = await fetch(\"https://orb3x-utils-api.vercel.app/api/nif/004813023LA040\");\n  if (!response1.ok) {\n    throw new Error(`Request failed with status ${response1.status}`);\n  }\n  const data1 = await response1.json();\n  console.log(\"Example 1\", data1);\n\n  const payload2 = {\n    \"text\": \"Preciso de ajuda\",\n    \"to\": \"en\"\n  };\n  const response2 = await fetch(\"https://orb3x-utils-api.vercel.app/api/translate\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload2)\n  });\n  if (!response2.ok) {\n    throw new Error(`Request failed with status ${response2.status}`);\n  }\n  const data2 = await response2.json();\n  console.log(\"Example 2\", data2);\n\n  const response3 = await fetch(\"https://orb3x-utils-api.vercel.app/api/exchange/aoa?amount=250000\");\n  if (!response3.ok) {\n    throw new Error(`Request failed with status ${response3.status}`);\n  }\n  const data3 = await response3.json();\n  console.log(\"Example 3\", data3);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          }
        ]
      },
      {
        "id": "typescript",
        "title": "型付き TypeScript ヘルパー",
        "code": {
          "label": "共有クライアントユーティリティ",
          "language": "ts",
          "content": "type ApiError = {\n  error?: {\n    code?: string;\n    message?: string;\n  };\n  code?: string;\n  message?: string;\n};\n\nexport async function callApi\u003cT>(input: RequestInfo, init?: RequestInit): Promise\u003cT> {\n  const response = await fetch(input, init);\n\n  if (!response.ok) {\n    const error = (await response.json().catch(() => ({}))) as ApiError;\n    throw new Error(error.error?.code ?? error.code ?? \"REQUEST_FAILED\");\n  }\n\n  return (await response.json()) as T;\n}"
        }
      },
      {
        "id": "workflow-patterns",
        "title": "ワークフローパターン",
        "bullets": [
          "顧客のオンボーディング: バックオフィス フローでアカウントをアクティブ化する前に、納税者の記録を確認します。",
          "ローカリゼーション パイプライン: ユーザー向けコンテンツを翻訳し、翻訳されたテキストと検出されたソース言語の両方を保存します。",
          "価格設定ダッシュボード: 基本レートを一度リクエストし、UI がどの程度の制御を必要とするかに応じて、unitRates または convertedRates を使用します。",
          "サポート ツール: 内部エージェントにアップストリームのエラー コードを表示して、不正な入力とプロバイダーの停止を迅速に区別できるようにします。"
        ]
      },
      {
        "id": "production-hardening",
        "title": "生産強化",
        "bullets": [
          "型指定された成功およびエラーの形状を使用して、共有クライアントで呼び出しをラップします。",
          "タイムアウト、不良応答、見つからない、無効な入力レートのメトリクスを個別に出力します。",
          "再試行ロジックをクライアント境界近くに配置して、製品コードが機能ごとに再実装しないようにします。",
          "ratesDate および sourceLanguage は、これらのフィールドが監査可能性または編集レビューにとって重要である場合に記録します。"
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
