import type { DocsPageMap } from '@/lib/site-content';

export const deDocsPages: DocsPageMap = {
  "getting-started": {
    "slug": "getting-started",
    "label": "Erste Schritte",
    "description": "Übersicht über Routenfamilien, Anforderungskonventionen und Bereitstellungshinweise.",
    "eyebrow": "Plattformhandbuch",
    "title": "Beginnen Sie mit den veröffentlichten ORB3X Utils API Routen.",
    "intro": "ORB3X Utils API kombiniert jetzt die ursprünglichen NIF-, Übersetzungs- und Austauschendpunkte mit auf Angola ausgerichteten Validierungs-, Telefon-, Adress-, Geo-, Kalender-, Finanz-, Gehalts-, Zeit- und Dokumentendienstprogrammen. Alle Routen sind dynamisch und verwenden standardmäßig das no-store-Caching.",
    "summaryCards": [
      {
        "label": "Laufzeit",
        "value": "Node.js Handler"
      },
      {
        "label": "Cache-Richtlinie",
        "value": "No-Store-Antworten"
      },
      {
        "label": "Endpunktstile",
        "value": "24 GET, 4 POST"
      }
    ],
    "sections": [
      {
        "id": "mental-model",
        "title": "Beginnen Sie mit dem Plattformmodell",
        "paragraphs": [
          "Bei den meisten neuen Endpunkten handelt es sich um lokale Rechner, Register oder Normalisierer, die auf typisierten internen Datensätzen basieren. Die bestehenden Steuer-, Übersetzungs- und Umtauschrouten rufen immer noch Live-Upstream-Anbieter auf.",
          "Diese Aufteilung ist beim Client-Design nützlich: Lokale Datenendpunkte sind deterministisch und schnell, während Upstream-gestützte Routen eine stärkere Wiederholung, Zeitüberschreitung und Beobachtbarkeitsbehandlung erfordern."
        ],
        "bullets": [
          "Erwarten Sie JSON sowohl für Erfolgs- als auch für Fehlerantworten.",
          "Behandeln Sie NIF, Übersetzungs- und Austauschantworten als dynamisch und zeitkritisch.",
          "Behandeln Sie Gehalts-, VAT- und Inflationsausgaben als annahmegesteuerte Rechner und behalten Sie die von Ihnen verwendeten Jahres- oder Tarifeingaben bei.",
          "Lesen Sie den zurückgegebenen Fehlercode und nicht nur den HTTP-Status, wenn Sie über Wiederholungsversuche entscheiden.",
          "Normalisieren Sie Ihre eigenen Benutzereingaben, bevor Sie die Endpunkte aufrufen, um vermeidbare 400-Antworten zu reduzieren."
        ]
      },
      {
        "id": "request-conventions",
        "title": "Konventionen für gemeinsame Anfragen",
        "table": {
          "columns": [
            "Sorge",
            "Verhalten"
          ],
          "rows": [
            [
              "Transport",
              "HTTPS JSON API wurde für serverseitige und browserseitige Verbraucher entwickelt."
            ],
            [
              "Caching",
              "Antworten setzen Cache-Control generell auf no-store, sodass Integrationen immer Live-Ergebnisse lesen."
            ],
            [
              "Timeout-Profil",
              "Handler erlauben bis zu 30 Sekunden; Nur ein Teil der Legacy-Routen ist von Upstream-Anrufen Dritter abhängig."
            ],
            [
              "Validierung",
              "Abfrageparameter, Pfadwerte und POST-Körper werden bereinigt, bevor die Geschäftslogik ausgeführt wird."
            ],
            [
              "Fehlerbehandlung",
              "Validierungsfehler geben 400-Level-Codes mit stabilen maschinenlesbaren error.code-Werten zurück."
            ]
          ]
        }
      },
      {
        "id": "first-calls",
        "title": "Stellen Sie eine erste erfolgreiche Anfrage",
        "description": "Führen Sie eine Anfrage pro Route aus, bevor Sie sie in den Anwendungscode integrieren.",
        "codes": [
          {
            "label": "Starterrauchtests (cURL)",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\"\n\ncurl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=%2B244923456789\"\n\ncurl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\"\n\ncurl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/invoice \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"seller\":{\"name\":\"Orb3x, Lda\"},\"buyer\":{\"name\":\"Cliente Exemplo\"},\"items\":[{\"description\":\"Service\",\"quantity\":1,\"unitPrice\":100000,\"vatRate\":14}]}'"
          },
          {
            "label": "Starterrauchtests (Node.js)",
            "language": "js",
            "content": "async function main() {\n  const response1 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\");\n  if (!response1.ok) {\n    throw new Error(`Request failed with status ${response1.status}`);\n  }\n  const data1 = await response1.json();\n  console.log(\"Example 1\", data1);\n\n  const response2 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=%2B244923456789\");\n  if (!response2.ok) {\n    throw new Error(`Request failed with status ${response2.status}`);\n  }\n  const data2 = await response2.json();\n  console.log(\"Example 2\", data2);\n\n  const response3 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\");\n  if (!response3.ok) {\n    throw new Error(`Request failed with status ${response3.status}`);\n  }\n  const data3 = await response3.json();\n  console.log(\"Example 3\", data3);\n\n  const payload4 = {\n    \"seller\": {\n      \"name\": \"Orb3x, Lda\"\n    },\n    \"buyer\": {\n      \"name\": \"Cliente Exemplo\"\n    },\n    \"items\": [\n      {\n        \"description\": \"Service\",\n        \"quantity\": 1,\n        \"unitPrice\": 100000,\n        \"vatRate\": 14\n      }\n    ]\n  };\n  const response4 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/invoice\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload4)\n  });\n  if (!response4.ok) {\n    throw new Error(`Request failed with status ${response4.status}`);\n  }\n  const data4 = await response4.json();\n  console.log(\"Example 4\", data4);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          }
        ],
        "bullets": [
          "Überprüfen Sie Dokumentrouten genau von der Laufzeit, die Sie bereitstellen, da die PDF-Generierung serverseitig ausgeführt wird.",
          "Protokollieren Sie Anforderungs-IDs und Upstream-Fehlercodes für die NIF-, Übersetzungs- und Exchange-Endpunkte.",
          "Erstellen Sie Reaktionsschutzmaßnahmen rund um annahmegesteuerte Ergebnisse wie Gehalt, Inflation und Nummerierungsplanverfügbarkeit."
        ]
      },
      {
        "id": "launch-checklist",
        "title": "Checkliste für den Produktionsstart",
        "bullets": [
          "Zentralisieren Sie die Basiskonfiguration URL, sodass Staging- und Produktionsumgebungen ohne Codeänderungen gewechselt werden können.",
          "Erfassen Sie Antworten, die nicht 200 sind, mit strukturierter Protokollierung, die den HTTP-Status, den Endpunkt, den Code und den Anforderungskontext speichert.",
          "Definieren Sie eine Wiederholungsrichtlinie nur für Upstream-Zeitüberschreitungen und Verfügbarkeitsfehler. Versuchen Sie es bei ungültigen Eingabefehlern nicht erneut.",
          "Speichern Sie das Berechnungsjahr oder die Tarifeingaben, wenn Finanzergebnisse in Rechnungen, Gehaltsabrechnungen oder Berichte einfließen.",
          "Validieren Sie POST-Nutzlasten für die Dokumentgenerierung, bevor Sie Benutzereingaben an Persistenz- oder Bereitstellungsworkflows übergeben.",
          "Führen Sie für jeden Endpunkt in CI einen einfachen Vertragstest durch, um versehentliche Regressionen der Antwortform zu erkennen."
        ],
        "note": "Wenn Sie nur eine Verteidigungsschicht implementieren, machen Sie diese explizit zur Fehlercodebehandlung. Dies ist die einfachste Möglichkeit, wiederholbare Fehler von fehlerhaften Anforderungen zu unterscheiden."
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
    "label": "API Referenz",
    "description": "Kanonisches Anforderungs- und Antwortverhalten auf der gesamten veröffentlichten API-Oberfläche.",
    "eyebrow": "Referenz",
    "title": "Referenz für gemeinsames Anforderungs- und Antwortverhalten.",
    "intro": "Diese Referenz fasst die von der aktuellen Angola-Versorgungsoberfläche geteilten Konventionen zusammen, einschließlich Validierung, Geo, Finanzen, Gehalt, Zeit und Dokumentenrouten neben den ursprünglichen vorgelagerten Endpunkten.",
    "summaryCards": [
      {
        "label": "Veröffentlichte Endpunkte",
        "value": "28"
      },
      {
        "label": "Erfolgsformat",
        "value": "Nur JSON"
      },
      {
        "label": "Binäre Antworten",
        "value": "PDF für POST Dokumente"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Endpunktkatalog",
        "table": {
          "columns": [
            "Route",
            "Methode",
            "Zweck",
            "Schlüsseleingabe"
          ],
          "rows": [
            [
              "/api/v1/validate/*",
              "GET",
              "Validieren Sie angolanische IBAN und lokale Bankkontostrukturen.",
              "IBAN- oder Kontoabfrage"
            ],
            [
              "/api/v1/phone/*",
              "GET",
              "Analysieren Sie Telefonnummern, validieren Sie das Format und erkennen Sie Betreiber.",
              "telefonische Anfrage"
            ],
            [
              "/api/v1/address/* + /api/v1/geo/*",
              "GET",
              "Normalisieren Sie Adressen und lesen Sie Angola-Standortregister.",
              "q, province, municipality, address"
            ],
            [
              "/api/v1/calendar/*",
              "GET",
              "Berechnung von Feiertagen und Werktagen.",
              "Jahr, von/bis, Datum/Tage"
            ],
            [
              "/api/v1/finance/*",
              "GET",
              "Führen Sie VAT-, Rechnungs- und Inflationsberechnungen aus.",
              "Betrags- oder Zeilenabfrage"
            ],
            [
              "/api/v1/salary/*",
              "GET",
              "Schätzen Sie die Netto-, Brutto- und Arbeitgeberkostenwerte der Lohn- und Gehaltsabrechnung.",
              "Brutto- oder Nettoabfrage"
            ],
            [
              "/api/v1/time/*",
              "GET",
              "Lesen Sie die aktuelle Uhrzeit ab, konvertieren Sie Zeitzonen und prüfen Sie die Geschäftszeiten.",
              "Zeitzone, Datum/Uhrzeit, Start/Ende"
            ],
            [
              "/api/v1/documents/*",
              "POST",
              "Erstellen Sie Rechnungs-, Quittungs- und Vertrags-PDFs.",
              "JSON Körper"
            ],
            [
              "/api/nif/{nif}",
              "GET",
              "Suchen Sie nach angolanischen Steueridentitätsfeldern.",
              "NIF Pfadparameter"
            ],
            [
              "/api/translate",
              "POST",
              "Übersetzen Sie Text und geben Sie die erkannte Ausgangssprache zurück.",
              "JSON Körper: Text, an, optional von"
            ],
            [
              "/api/exchange/{base}",
              "GET",
              "Rückgabe-Wechselkurse, optional multipliziert mit dem Betrag.",
              "Basispfadparameter, optionale Mengenabfrage"
            ]
          ]
        }
      },
      {
        "id": "response-patterns",
        "title": "Antwortmuster",
        "paragraphs": [
          "Erfolgsnutzlasten sind endpunktspezifisch, bleiben aber flach und anwendungsorientiert. Rechnerendpunkte zeigen abgeleitete Werte sowie die Annahmen oder Grundlagen an, die zu ihrer Erstellung verwendet wurden.",
          "Dokumentrouten sind die Hauptausnahme: Sie geben binäre PDF-Antworten mit Anhangsheadern zurück. Die meisten anderen Endpunkte geben JSON und einen Fehlerumschlag zurück, wenn etwas schief geht."
        ],
        "code": {
          "label": "Typische Fehlerreaktion",
          "language": "json",
          "content": "{\n  \"error\": {\n    \"code\": \"UPSTREAM_TIMEOUT\",\n    \"message\": \"The currency service did not respond in time.\",\n    \"baseCurrency\": \"AOA\",\n    \"amount\": \"1000000\"\n  }\n}"
        }
      },
      {
        "id": "status-codes",
        "title": "Statuscodes und Absicht",
        "table": {
          "columns": [
            "Status",
            "Bedeutung",
            "Typische Aktion"
          ],
          "rows": [
            [
              "200",
              "Die validierte Anfrage war erfolgreich.",
              "Nutzen Sie die Nutzlast direkt."
            ],
            [
              "400",
              "Die Eingabe fehlt, ist fehlerhaft oder wird nicht unterstützt.",
              "Korrigieren Sie die Anfrage. kein erneuter Versuch."
            ],
            [
              "404",
              "Die angeforderte Ressource konnte stromaufwärts nicht gefunden werden.",
              "Zeigen Sie einen eindeutigen Nicht-Gefunden-Status an."
            ],
            [
              "502",
              "Der Upstream-Dienst ist fehlgeschlagen oder hat fehlerhafte Daten zurückgegeben.",
              "Versuchen Sie es erneut mit Backoff oder führen Sie eine ordnungsgemäße Herabstufung durch."
            ],
            [
              "504",
              "Zeitüberschreitung bei der Upstream-Abhängigkeit.",
              "Versuchen Sie es erneut, wenn der Benutzerfluss dies toleriert."
            ],
            [
              "500",
              "Unerwarteter interner Fehler.",
              "Protokollieren, warnen Sie und behandeln Sie sie nur dann als wiederholbar, wenn Ihr UX dies zulässt."
            ]
          ]
        }
      },
      {
        "id": "operational-notes",
        "title": "Betriebshinweise",
        "bullets": [
          "Alle Routenhandler sind als dynamisch gekennzeichnet, daher sollten Sie sich nicht auf vorab gerenderte Antworten zur Build-Zeit verlassen.",
          "User-Agent-Header werden explizit für die vom Upstream unterstützten Legacy-Anfragen festgelegt, um die Anbieterkompatibilität zu verbessern.",
          "Die Eingabebereinigung ist konservativ: Routenparameter werden vor dem Senden der Anfrage gekürzt und normalisiert.",
          "Zu den Antworten zur Bankvalidierung gehört ein generiertes Bankbild-Badge, sodass Frontends ohne zusätzliche Suche ein erkennbares Bild darstellen können.",
          "Dokumentendpunkte sind synchron; Halten Sie die Nutzdaten kompakt und führen Sie bei Bedarf eine asynchrone Downstream-Speicherung in Ihrem eigenen System durch."
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
    "label": "Validierung",
    "description": "IBAN und lokale angolanische Bankkontovalidierung mit Bankerkennung.",
    "eyebrow": "Kategorie",
    "title": "Validieren Sie angolanische Bankkennungen und ermitteln Sie die ausstellende Bank.",
    "intro": "Die Validierungsfamilie umfasst `/api/v1/validate/iban` und `/api/v1/validate/bank-account`. Beide Routen normalisieren die Eingabe, erkennen die Bank anhand der Bankleitzahl und geben ein generiertes Bankausweisbild zur Verwendung auf der Benutzeroberfläche zurück.",
    "summaryCards": [
      {
        "label": "Routen",
        "value": "2 GET"
      },
      {
        "label": "Länderumfang",
        "value": "Angola"
      },
      {
        "label": "Visuelle Ausgabe",
        "value": "Bild des Bankausweises"
      }
    ],
    "sections": [
      {
        "id": "routes",
        "title": "Routen in dieser Familie",
        "table": {
          "columns": [
            "Route",
            "Zweck",
            "Schlüsselabfrage"
          ],
          "rows": [
            [
              "/api/v1/validate/iban",
              "Validieren Sie IBANs im AO-Format mit Mod-97-Prüfungen und Banksuche.",
              "iban"
            ],
            [
              "/api/v1/validate/bank-account",
              "Validieren Sie 21-stellige lokale Kontostrukturen und leiten Sie den passenden IBAN ab.",
              "Konto"
            ]
          ]
        }
      },
      {
        "id": "validate-iban-route",
        "title": "GET /api/v1/validate/iban",
        "description": "Verwenden Sie diese Route, wenn Sie bereits über ein vollständiges AO IBAN verfügen und normalisierte Teile, Bankmetadaten und Validierungsflags benötigen.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "iban",
              "Ja",
              "AO-Format IBAN. Der Handler entfernt Trennzeichen und schreibt den Wert in Großbuchstaben, bevor er ihn überprüft."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"isValid\": true,\n  \"normalized\": \"AO06004000010123456789012\",\n  \"formatted\": \"AO06 0040 0001 0123 4567 8901 2\",\n  \"countryCode\": \"AO\",\n  \"checkDigits\": \"06\",\n  \"bank\": {\n    \"code\": \"BAI\",\n    \"ibanBankCode\": \"0040\",\n    \"name\": \"Banco Angolano de Investimentos\",\n    \"image\": \"data:image/svg+xml;base64,...\"\n  },\n  \"components\": {\n    \"bankCode\": \"0040\",\n    \"branchCode\": \"0001\",\n    \"accountNumber\": \"01234567890\",\n    \"controlDigits\": \"12\"\n  },\n  \"validation\": {\n    \"countrySupported\": true,\n    \"lengthValid\": true,\n    \"bankCodeKnown\": true,\n    \"mod97Valid\": true\n  }\n}"
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_IBAN\",\n    \"message\": \"Angolan IBANs must contain exactly 25 characters.\",\n    \"field\": \"iban\",\n    \"length\": 18\n  }\n}"
          }
        ],
        "bullets": [
          "Überprüfen Sie `validation.mod97Valid` und `validation.bankCodeKnown`, anstatt sich nur auf `isValid` zu verlassen, wenn Sie detaillierte UI-Zustände benötigen.",
          "Verwenden Sie `bank.image` direkt in Zahlungszusammenfassungen oder Verifizierungskarten."
        ]
      },
      {
        "id": "validate-bank-account-route",
        "title": "GET /api/v1/validate/bank-account",
        "description": "Verwenden Sie diese Route für lokale 21-stellige Kontozeichenfolgen, wenn Sie eine strukturelle Validierung und den passenden abgeleiteten IBAN benötigen.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "Konto",
              "Ja",
              "Lokale angolanische Kontozeichenfolge mit 21 Ziffern. Nicht-stellige Trennzeichen werden ignoriert."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/validate/bank-account?account=004000010123456789012\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/validate/bank-account?account=004000010123456789012\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"isValid\": true,\n  \"normalized\": \"004000010123456789012\",\n  \"formatted\": \"0040 0001 0123 4567 8901 2\",\n  \"derivedIban\": \"AO06004000010123456789012\",\n  \"bankRecognized\": true,\n  \"bank\": {\n    \"code\": \"BAI\",\n    \"name\": \"Banco Angolano de Investimentos\",\n    \"image\": \"data:image/svg+xml;base64,...\"\n  },\n  \"components\": {\n    \"bankCode\": \"0040\",\n    \"branchCode\": \"0001\",\n    \"accountNumber\": \"01234567890\",\n    \"controlDigits\": \"12\"\n  },\n  \"validation\": {\n    \"formatValid\": true,\n    \"bankCodeKnown\": true,\n    \"controlDigitsPresent\": true\n  }\n}"
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_BANK_ACCOUNT\",\n    \"message\": \"Angolan local bank account numbers must contain exactly 21 digits.\",\n    \"field\": \"account\",\n    \"length\": 9\n  }\n}"
          }
        ],
        "bullets": [
          "Dies ist eine strukturelle Validierung und keine Bestätigung, dass das Konto im Bankennetzwerk aktiv ist.",
          "Behalten Sie das normalisierte Konto oder das abgeleitete IBAN anstelle der rohen Eingabezeichenfolge bei."
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
    "label": "Telefon",
    "description": "Analysieren, validieren und klassifizieren Sie angolanische Telefonnummern nach Betreiber.",
    "eyebrow": "Kategorie",
    "title": "Analysieren Sie angolanische Zahlen und klassifizieren Sie den Nummerierungsbereich.",
    "intro": "Die Telefonrouten normalisieren lokale oder internationale Eingaben, trennen Länder- und Landesteile und ordnen Mobilfunkpräfixe Unitel, Africell oder Movicel zu, wenn die Reichweite bekannt ist.",
    "summaryCards": [
      {
        "label": "Routen",
        "value": "3 GET"
      },
      {
        "label": "Ländercode",
        "value": "+244"
      },
      {
        "label": "Verfügbarkeitsmodell",
        "value": "Nummerierungsplan"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Routen in dieser Familie",
        "table": {
          "columns": [
            "Route",
            "Zweck",
            "Schlüsselabfrage"
          ],
          "rows": [
            [
              "/api/v1/phone/parse",
              "Geben Sie strukturierte Telefonnummernkomponenten und -formate zurück.",
              "Telefon"
            ],
            [
              "/api/v1/phone/validate",
              "Validieren Sie das Format und melden Sie die Verfügbarkeit des Nummerierungsplans.",
              "Telefon"
            ],
            [
              "/api/v1/phone/operator",
              "Ermitteln Sie den Mobilfunkanbieter anhand des Bereichspräfixes.",
              "Telefon"
            ]
          ]
        }
      },
      {
        "id": "phone-parse-route",
        "title": "GET /api/v1/phone/parse",
        "description": "Verwenden Sie Parse, wenn Sie eine kanonisch normalisierte Zahl plus wiederverwendbare Formatierung für die Speicherung oder Benutzeroberfläche benötigen.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "Telefon",
              "Ja",
              "Lokale oder internationale angolanische Nummer, z. B. `923456789` oder `+244923456789`."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/parse?phone=%2B244923456789\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/parse?phone=%2B244923456789\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"normalized\": \"+244923456789\",\n  \"countryCode\": \"+244\",\n  \"nationalNumber\": \"923456789\",\n  \"internationalFormat\": \"+244 923 456 789\",\n  \"nationalFormat\": \"923 456 789\",\n  \"isMobile\": true,\n  \"type\": \"mobile\",\n  \"prefix\": \"92\",\n  \"subscriberNumber\": \"3456789\",\n  \"operator\": {\n    \"code\": \"UNITEL\",\n    \"name\": \"Unitel\",\n    \"prefix\": \"92\",\n    \"prefixes\": [\"92\", \"93\", \"94\"]\n  }\n}"
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_PHONE\",\n    \"message\": \"Angolan phone numbers must contain 9 national digits.\",\n    \"field\": \"phone\",\n    \"length\": 6\n  }\n}"
          }
        ]
      },
      {
        "id": "phone-validate-route",
        "title": "GET /api/v1/phone/validate",
        "description": "Verwenden Sie „Validieren“, wenn Sie ein Pass/Fail-Ergebnis sowie Informationen zur Nummerierungsplanverfügbarkeit benötigen.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "Telefon",
              "Ja",
              "Lokale oder internationale angolanische Telefonnummer."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=952345678\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=952345678\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"isValid\": true,\n  \"normalized\": \"+244952345678\",\n  \"type\": \"mobile\",\n  \"operator\": {\n    \"code\": \"AFRICELL\",\n    \"name\": \"Africell\",\n    \"prefix\": \"95\",\n    \"prefixes\": [\"95\"]\n  },\n  \"availability\": {\n    \"type\": \"numbering-plan\",\n    \"status\": \"allocated-range\",\n    \"canConfirmLiveSubscriber\": false\n  }\n}"
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_PHONE\",\n    \"message\": \"The \\\"phone\\\" query parameter is required.\",\n    \"field\": \"phone\"\n  }\n}"
          }
        ],
        "note": "Die Verfügbarkeit basiert auf bekannten angolanischen Nummerierungsbereichen. Es bestätigt nicht die Erreichbarkeit von Live-Abonnenten."
      },
      {
        "id": "phone-operator-route",
        "title": "GET /api/v1/phone/operator",
        "description": "Verwenden Sie den Operator, wenn Sie nur die Operator-Suche benötigen und nicht den Rest der analysierten Telefonnutzlast.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "Telefon",
              "Ja",
              "Lokale oder internationale angolanische Telefonnummer."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/operator?phone=912345678\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/operator?phone=912345678\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"phone\": \"912345678\",\n  \"operator\": {\n    \"code\": \"MOVICEL\",\n    \"name\": \"Movicel\",\n    \"prefix\": \"91\",\n    \"prefixes\": [\"91\", \"99\"]\n  }\n}"
          },
          {
            "label": "Fehlerreaktion",
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
    "label": "Adresse und Geo",
    "description": "Normalisieren Sie angolanische Adressen und lesen Sie Provinzen, Gemeinden und Gemeinden.",
    "eyebrow": "Kategorie",
    "title": "Standardisieren Sie angolanische Adressen und fragen Sie das Standortregister ab.",
    "intro": "Die Adressnormalisierung und -vorschläge werden durch ein kuratiertes Angola-Georegister unterstützt. Die Georouten geben Daten zu Provinzen, Gemeinden und Gemeinden zurück, die Verwaltungsformulare und Autovervollständigungsabläufe steuern können.",
    "summaryCards": [
      {
        "label": "Routen",
        "value": "5 GET"
      },
      {
        "label": "Geo-Ebenen",
        "value": "Provinz zur Gemeinde"
      },
      {
        "label": "Automatische Vervollständigung",
        "value": "Bairro + Gemeinde + Gemeinde"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Routen in dieser Familie",
        "table": {
          "columns": [
            "Route",
            "Zweck",
            "Schlüsselabfrage"
          ],
          "rows": [
            [
              "/api/v1/address/normalize",
              "Bereinigen und strukturieren Sie eine angolanische Freitextadresse.",
              "Adresse"
            ],
            [
              "/api/v1/address/suggest",
              "Schlagen Sie Bairros, Kommunen oder Gemeinden vor.",
              "q, type, province, municipality"
            ],
            [
              "/api/v1/geo/provinces",
              "Listen Sie alle Provinzen in Angola auf.",
              "keine"
            ],
            [
              "/api/v1/geo/municipalities",
              "Listen Sie Gemeinden auf, optional gefiltert nach Provinz.",
              "Provinz"
            ],
            [
              "/api/v1/geo/communes",
              "Listen Sie Gemeinden für eine Gemeinde auf.",
              "Gemeinde, optionale Provinz"
            ]
          ]
        }
      },
      {
        "id": "address-normalize-route",
        "title": "GET /api/v1/address/normalize",
        "description": "Verwenden Sie Normalize, um eine Freitextadresse zu bereinigen, bevor Sie sie beibehalten oder mit internen Datensätzen abgleichen.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "Adresse",
              "Ja",
              "Angolanische Freitextadresse. Gängige Abkürzungen wie `prov.` und `mun.` werden automatisch erweitert."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/address/normalize?address=Benfica,%20Luanda\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/address/normalize?address=Benfica,%20Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"input\": \"Benfica, Luanda\",\n  \"normalized\": \"Benfica, Luanda\",\n  \"components\": {\n    \"bairro\": \"Benfica\",\n    \"commune\": \"Benfica\",\n    \"municipality\": \"Belas\",\n    \"province\": \"Luanda\"\n  },\n  \"diagnostics\": {\n    \"provinceMatched\": true,\n    \"municipalityMatched\": true,\n    \"communeMatched\": true,\n    \"bairroMatched\": true\n  }\n}"
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_ADDRESS\",\n    \"message\": \"The \\\"address\\\" query parameter is required.\",\n    \"field\": \"address\"\n  }\n}"
          }
        ]
      },
      {
        "id": "address-suggest-route",
        "title": "GET /api/v1/address/suggest",
        "description": "Verwenden Sie „Suggest“, um Autovervollständigungsfelder für Bairros, Gemeinden, Gemeinden und Provinzen zu steuern.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "q",
              "Ja",
              "Suchfragment."
            ],
            [
              "Typ",
              "Nein",
              "Optionaler Filter: `bairro`, `commune`, `municipality` oder `province`."
            ],
            [
              "Provinz",
              "Nein",
              "Optionaler Provinzfilter."
            ],
            [
              "Gemeinde",
              "Nein",
              "Optionaler Gemeindefilter."
            ],
            [
              "Grenze",
              "Nein",
              "Maximale Anzahl zurückzugebender Vorschläge."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/address/suggest?q=tal&type=municipality&province=Luanda\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/address/suggest?q=tal&type=municipality&province=Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"query\": \"tal\",\n  \"suggestions\": [\n    {\n      \"type\": \"municipality\",\n      \"label\": \"Talatona\",\n      \"province\": \"Luanda\",\n      \"municipality\": \"Talatona\"\n    }\n  ]\n}"
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"MISSING_QUERY_PARAMETER\",\n    \"message\": \"The \\\"q\\\" query parameter is required.\",\n    \"field\": \"q\"\n  }\n}"
          }
        ]
      },
      {
        "id": "geo-provinces-route",
        "title": "GET /api/v1/geo/provinces",
        "description": "Verwenden Sie Provinzen als Registrierungs-Feed der obersten Ebene für Standortauswahl und administrative Filterung.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": []
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/geo/provinces\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/geo/provinces\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"country\": \"AO\",\n  \"countryName\": \"Angola\",\n  \"provinces\": [\n    {\n      \"name\": \"Luanda\",\n      \"slug\": \"luanda\",\n      \"capital\": \"Luanda\",\n      \"municipalityCount\": 16\n    }\n  ]\n}"
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INTERNAL_SERVER_ERROR\",\n    \"message\": \"Unexpected error while listing provinces.\"\n  }\n}"
          }
        ]
      },
      {
        "id": "geo-municipalities-route",
        "title": "GET /api/v1/geo/municipalities",
        "description": "Verwenden Sie Gemeinden, um Standortselektoren der zweiten Ebene mit oder ohne Provinzfilter zu füllen.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "Provinz",
              "Nein",
              "Optionaler Provinzname, der zum Filtern der Liste verwendet wird."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/geo/municipalities?province=Luanda\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/geo/municipalities?province=Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"province\": \"Luanda\",\n  \"municipalities\": [\n    {\n      \"name\": \"Talatona\",\n      \"slug\": \"talatona\",\n      \"province\": \"Luanda\",\n      \"communeCount\": 2\n    }\n  ]\n}"
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"PROVINCE_NOT_FOUND\",\n    \"message\": \"No Angolan province matched the supplied query.\",\n    \"field\": \"province\",\n    \"value\": \"Atlantis\"\n  }\n}"
          }
        ]
      },
      {
        "id": "geo-communes-route",
        "title": "GET /api/v1/geo/communes",
        "description": "Verwenden Sie Gemeinden, wenn eine Gemeinde bereits ausgewählt ist und Sie die nächste Verwaltungsebene benötigen.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "Gemeinde",
              "Ja",
              "Gemeindename soll erweitert werden."
            ],
            [
              "Provinz",
              "Nein",
              "Optionaler Provinzname, der verwendet wird, um wiederholte Gemeindebezeichnungen eindeutig zu machen."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/geo/communes?municipality=Talatona&province=Luanda\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/geo/communes?municipality=Talatona&province=Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"municipality\": \"Talatona\",\n  \"province\": \"Luanda\",\n  \"coverage\": \"curated\",\n  \"communes\": [\n    { \"name\": \"Cidade Universitaria\", \"slug\": \"cidade-universitaria\" },\n    { \"name\": \"Talatona\", \"slug\": \"talatona\" }\n  ]\n}"
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"MISSING_QUERY_PARAMETER\",\n    \"message\": \"The \\\"municipality\\\" query parameter is required.\",\n    \"field\": \"municipality\"\n  }\n}"
          }
        ],
        "note": "Einige Kommunen verwenden kuratierte Gemeindedetails, während andere derzeit nur Sitzplätze anbieten."
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
    "label": "Kalender",
    "description": "Angolanische Feiertage und Werktagsberechnungen.",
    "eyebrow": "Kategorie",
    "title": "Arbeiten Sie mit Feiertagen, Arbeitstagen und Werktagsversätzen.",
    "intro": "Die Kalenderfamilie gibt offizielle feste und bewegliche Feiertage sowie Geschäftstagsberechnungen zurück, die für die Gehaltsabrechnung, Rechnungsstellung und Lieferplanung nützlich sind.",
    "summaryCards": [
      {
        "label": "Routen",
        "value": "3 GET"
      },
      {
        "label": "Urlaubsmodell",
        "value": "Fest + beweglich"
      },
      {
        "label": "Kernnutzung",
        "value": "Mathematik für den Geschäftsalltag"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Routen in dieser Familie",
        "table": {
          "columns": [
            "Route",
            "Zweck",
            "Schlüsselabfrage"
          ],
          "rows": [
            [
              "/api/v1/calendar/holidays",
              "Feiertage für ein Jahr zurückgeben.",
              "Jahr"
            ],
            [
              "/api/v1/calendar/working-days",
              "Zählen Sie die Arbeitstage zwischen zwei Terminen.",
              "from, to"
            ],
            [
              "/api/v1/calendar/add-working-days",
              "Verschieben Sie ein Datum um Arbeitstage vor oder zurück.",
              "date, days"
            ]
          ]
        }
      },
      {
        "id": "calendar-holidays-route",
        "title": "GET /api/v1/calendar/holidays",
        "description": "Verwenden Sie Feiertage, um den unterstützten Feiertagsplan für Angola für ein bestimmtes Jahr zu erhalten.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "Jahr",
              "Nein",
              "Optionales Kalenderjahr. Standardmäßig wird das aktuelle Jahr verwendet."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/calendar/holidays?year=2026\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/calendar/holidays?year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"year\": 2026,\n  \"holidays\": [\n    {\n      \"date\": \"2026-02-16\",\n      \"name\": \"Carnival Holiday\",\n      \"localName\": \"Tolerancia de Ponto de Carnaval\",\n      \"category\": \"movable\"\n    },\n    {\n      \"date\": \"2026-02-17\",\n      \"name\": \"Carnival\",\n      \"localName\": \"Carnaval\",\n      \"category\": \"movable\"\n    }\n  ]\n}"
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_YEAR\",\n    \"message\": \"The \\\"year\\\" query parameter must be an integer between 2000 and 2100.\",\n    \"field\": \"year\",\n    \"value\": 1800\n  }\n}"
          }
        ]
      },
      {
        "id": "calendar-working-days-route",
        "title": "GET /api/v1/calendar/working-days",
        "description": "Verwenden Sie „working-days“, um Werktage zwischen zwei Daten zu zählen und dabei Wochenenden und unterstützte Feiertage in Angola auszuschließen.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "von",
              "Ja",
              "Startdatum im Format `YYYY-MM-DD`."
            ],
            [
              "zu",
              "Ja",
              "Enddatum im Format `YYYY-MM-DD`."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/calendar/working-days?from=2026-03-20&to=2026-03-24\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/calendar/working-days?from=2026-03-20&to=2026-03-24\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"from\": \"2026-03-20\",\n  \"to\": \"2026-03-24\",\n  \"workingDays\": 2,\n  \"excludedWeekendDays\": 2,\n  \"excludedHolidayDays\": 1\n}"
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_DATE_RANGE\",\n    \"message\": \"The \\\"from\\\" date must be earlier than or equal to the \\\"to\\\" date.\",\n    \"from\": \"2026-03-25\",\n    \"to\": \"2026-03-24\"\n  }\n}"
          }
        ]
      },
      {
        "id": "calendar-add-working-days-route",
        "title": "GET /api/v1/calendar/add-working-days",
        "description": "Verwenden Sie add-working-days, um ein Basisdatum entsprechend dem unterstützten Arbeitstagskalender nach vorne oder hinten zu verschieben.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "Datum",
              "Ja",
              "Basisdatum im Format `YYYY-MM-DD`."
            ],
            [
              "Tage",
              "Ja",
              "Vorzeichenbehaftete Ganzzahl, die den Arbeitstag-Offset darstellt."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/calendar/add-working-days?date=2026-03-20&days=1\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/calendar/add-working-days?date=2026-03-20&days=1\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"inputDate\": \"2026-03-20\",\n  \"days\": 1,\n  \"resultDate\": \"2026-03-24\",\n  \"direction\": \"forward\"\n}"
          },
          {
            "label": "Fehlerreaktion",
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
    "label": "Finanzen",
    "description": "VAT, Rechnungssummen und Inflationsanpassungen für angolanische Geldflüsse.",
    "eyebrow": "Kategorie",
    "title": "Berechnen Sie VAT, Rechnungssummen und inflationsbereinigte Werte.",
    "intro": "Finanzendpunkte stellen deterministische Berechnungen bereit, die in Backoffice-Systemen, Angebotsschätzungen und Berichtstools verwendet werden können. Sie geben sowohl die abgeleiteten Werte als auch die Grundlage zurück, auf der sie ermittelt wurden.",
    "summaryCards": [
      {
        "label": "Routen",
        "value": "3 GET"
      },
      {
        "label": "Währung",
        "value": "AOA-zuerst"
      },
      {
        "label": "Rechnungseingang",
        "value": "JSON Nutzlast abfragen"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Routen in dieser Familie",
        "table": {
          "columns": [
            "Route",
            "Zweck",
            "Schlüsselabfrage"
          ],
          "rows": [
            [
              "/api/v1/finance/vat",
              "Teilen oder erstellen Sie VAT-inklusive Gesamtsummen.",
              "amount, rate, inclusive"
            ],
            [
              "/api/v1/finance/invoice-total",
              "Berechnen Sie Rechnungssummen aus Einzelposten.",
              "lines, discount, discountType"
            ],
            [
              "/api/v1/finance/inflation-adjust",
              "Passen Sie die Werte über Jahre hinweg mithilfe der CPI-Reihe für Angola an.",
              "amount, from, to"
            ]
          ]
        }
      },
      {
        "id": "finance-vat-route",
        "title": "GET /api/v1/finance/vat",
        "description": "Verwenden Sie VAT, um Bruttosummen in Nettosummen plus Steuern aufzuteilen oder Bruttosummen aus einem Nettobetrag zu erstellen.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "Menge",
              "Ja",
              "Zu bewertender Grundbetrag."
            ],
            [
              "Rate",
              "Nein",
              "Prozentsatz des Steuersatzes. Der Standardwert ist 14."
            ],
            [
              "inklusive",
              "Nein",
              "Bei `true` wird der Betrag als VAT einschließlich behandelt. Bei `false` wird der Betrag als Nettobetrag behandelt."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"amount\": 114000,\n  \"rate\": 14,\n  \"inclusive\": true,\n  \"netAmount\": 100000,\n  \"vatAmount\": 14000,\n  \"grossAmount\": 114000\n}"
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_RATE\",\n    \"message\": \"Tax rates must be between 0 and 100.\",\n    \"field\": \"rate\",\n    \"value\": 140\n  }\n}"
          }
        ]
      },
      {
        "id": "finance-invoice-total-route",
        "title": "GET /api/v1/finance/invoice-total",
        "description": "Verwenden Sie „invoice-total“, um Rechnungssummen aus codierten Einzelposten zu berechnen, ohne die Preisberechnung in jedem Kunden zu duplizieren.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "Linien",
              "Ja",
              "JSON Array-String mit `description`, `quantity`, `unitPrice` und optional `vatRate`."
            ],
            [
              "Rabatt",
              "Nein",
              "Rabattbetrag oder -prozentsatz, abhängig von `discountType`."
            ],
            [
              "Rabatttyp",
              "Nein",
              "Entweder `amount` oder `percent`."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/invoice-total?lines=%5B%7B%22description%22%3A%22Service%22%2C%22quantity%22%3A1%2C%22unitPrice%22%3A100000%2C%22vatRate%22%3A14%7D%5D&discount=10&discountType=percent\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/invoice-total?lines=%5B%7B%22description%22%3A%22Service%22%2C%22quantity%22%3A1%2C%22unitPrice%22%3A100000%2C%22vatRate%22%3A14%7D%5D&discount=10&discountType=percent\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"discountType\": \"percent\",\n  \"subtotal\": 100000,\n  \"discountAmount\": 10000,\n  \"taxableBase\": 90000,\n  \"vatTotal\": 12600,\n  \"grandTotal\": 102600\n}"
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_JSON\",\n    \"message\": \"The \\\"lines\\\" query parameter must be a valid JSON array.\",\n    \"field\": \"lines\"\n  }\n}"
          }
        ]
      },
      {
        "id": "finance-inflation-route",
        "title": "GET /api/v1/finance/inflation-adjust",
        "description": "Verwenden Sie die Inflationsanpassung, um Nominalwerte über die unterstützten CPI-Jahre in Angola hinweg zu vergleichen.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "Menge",
              "Ja",
              "Ursprünglicher Nominalbetrag."
            ],
            [
              "von",
              "Ja",
              "Quelldatum oder Jahreszeichenfolge. Die ersten vier Ziffern werden als CPI-Jahr verwendet."
            ],
            [
              "zu",
              "Ja",
              "Zeichenfolge für Zieldatum oder -jahr. Die ersten vier Ziffern werden als CPI-Jahr verwendet."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/inflation-adjust?amount=100000&from=2020-01-01&to=2025-01-01\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/inflation-adjust?amount=100000&from=2020-01-01&to=2025-01-01\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"amount\": 100000,\n  \"fromYear\": 2020,\n  \"toYear\": 2025,\n  \"inflationFactor\": 2.5642,\n  \"adjustedAmount\": 256420,\n  \"source\": \"Curated annual Angola CPI index series.\"\n}"
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"UNSUPPORTED_CPI_YEAR\",\n    \"message\": \"Inflation adjustment is available for Angola annual CPI years from 2019 through 2025.\",\n    \"fromYear\": 2010,\n    \"toYear\": 2025\n  }\n}"
          }
        ],
        "note": "Behalten Sie den Berechnungsjahresbereich bei, wenn der angepasste Betrag in Berichten oder Preisbewegungen verwendet wird."
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
    "label": "Gehalt",
    "description": "Schätzen Sie das Nettogehalt, das Bruttogehalt und die Arbeitgeberkosten unter den Annahmen zur Lohn- und Gehaltsabrechnung in Angola.",
    "eyebrow": "Kategorie",
    "title": "Führen Sie Gehaltsschätzungen für Angola für Arbeitnehmer- und Arbeitgeberansichten durch.",
    "intro": "Die Gehaltsfamilie wendet interne angolanische Gehaltsabrechnungsannahmen für die Sozialversicherung der Arbeitnehmer, die Sozialversicherung des Arbeitgebers und die Quellensteuertabellen für Arbeitseinkommen für unterstützte Jahre an.",
    "summaryCards": [
      {
        "label": "Routen",
        "value": "3 GET"
      },
      {
        "label": "Jahre",
        "value": "2025 und 2026"
      },
      {
        "label": "Ausgänge",
        "value": "Netto-, Brutto-, Arbeitgeberkosten"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Routen in dieser Familie",
        "table": {
          "columns": [
            "Route",
            "Zweck",
            "Schlüsselabfrage"
          ],
          "rows": [
            [
              "/api/v1/salary/net",
              "Schätzen Sie das Take-Home-Gehalt anhand des Bruttogehalts.",
              "gross, year"
            ],
            [
              "/api/v1/salary/gross",
              "Schätzen Sie das erforderliche Bruttogehalt für ein Zielnetto.",
              "net, year"
            ],
            [
              "/api/v1/salary/employer-cost",
              "Schätzen Sie die Arbeitgeberkosten einschließlich der Beiträge.",
              "gross, year"
            ]
          ]
        }
      },
      {
        "id": "salary-net-route",
        "title": "GET /api/v1/salary/net",
        "description": "Verwenden Sie „Netto“, wenn Ihr Quellwert das Bruttogehalt ist und Sie den geschätzten Nettobetrag wünschen.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "eklig",
              "Ja",
              "Bruttomonatsgehalt."
            ],
            [
              "Jahr",
              "Nein",
              "Unterstütztes Steuerjahr. Derzeit `2025` oder `2026`. Standardmäßig ist `2026`."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/salary/net?gross=500000&year=2026\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/salary/net?gross=500000&year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"year\": 2026,\n  \"grossSalary\": 500000,\n  \"taxableIncome\": 485000,\n  \"employeeSocialSecurity\": 15000,\n  \"irtRate\": 16,\n  \"irtTaxAmount\": 52100,\n  \"netSalary\": 432900,\n  \"employerContribution\": 40000,\n  \"assumptions\": [\"Applies monthly employment-income withholding for Angola.\"]\n}"
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"UNSUPPORTED_TAX_YEAR\",\n    \"message\": \"Supported salary-tax years are 2025 and 2026.\",\n    \"year\": 2024\n  }\n}"
          }
        ]
      },
      {
        "id": "salary-gross-route",
        "title": "GET /api/v1/salary/gross",
        "description": "Verwenden Sie „Brutto“, wenn der Zielwert der Nettolohn ist und Sie das ungefähre Bruttogehalt benötigen, um diesen zu erreichen.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "Netto",
              "Ja",
              "Gewünschtes Netto-Monatsgehalt."
            ],
            [
              "Jahr",
              "Nein",
              "Unterstütztes Steuerjahr. Der Standardwert ist `2026`."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/salary/gross?net=432900&year=2026\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/salary/gross?net=432900&year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"year\": 2026,\n  \"targetNetSalary\": 432900,\n  \"grossSalary\": 500000,\n  \"employeeSocialSecurity\": 15000,\n  \"irtTaxAmount\": 52100,\n  \"netSalary\": 432900\n}"
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_NUMBER\",\n    \"message\": \"The \\\"net\\\" query parameter must be a non-negative number.\",\n    \"field\": \"net\",\n    \"value\": \"-1\"\n  }\n}"
          }
        ]
      },
      {
        "id": "salary-employer-cost-route",
        "title": "GET /api/v1/salary/employer-cost",
        "description": "Verwenden Sie die Arbeitgeberkosten, wenn bei der Lohn- und Gehaltsabrechnung der unternehmensseitige Beitrag zusätzlich zum Bruttogehalt des Arbeitnehmers erforderlich ist.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "eklig",
              "Ja",
              "Bruttomonatsgehalt."
            ],
            [
              "Jahr",
              "Nein",
              "Unterstütztes Steuerjahr. Der Standardwert ist `2026`."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/salary/employer-cost?gross=500000&year=2026\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/salary/employer-cost?gross=500000&year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"year\": 2026,\n  \"grossSalary\": 500000,\n  \"employerContribution\": 40000,\n  \"totalEmployerCost\": 540000\n}"
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_NUMBER\",\n    \"message\": \"The \\\"gross\\\" query parameter must be a non-negative number.\",\n    \"field\": \"gross\",\n    \"value\": \"abc\"\n  }\n}"
          }
        ],
        "note": "Bei diesen Endpunkten handelt es sich um Szenariorechner, nicht um Gehaltsabrechnungsdienste. Zeigen Sie die Annahmen in jeder Benutzeroberfläche an, die das Ergebnis anzeigt."
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
    "label": "Zeit",
    "description": "Aktuelle Ortszeit, Zeitzonenumrechnung und Prüfung der Geschäftszeiten.",
    "eyebrow": "Kategorie",
    "title": "Arbeiten Sie mit Zeitzonen und lokalen Geschäftszeiten.",
    "intro": "Zeitendpunkte bieten Ihnen eine kleine Zeitzonen-Dienstprogrammebene, ohne eine vollständige Planungsplattform in Ihre Anwendung integrieren zu müssen.",
    "summaryCards": [
      {
        "label": "Routen",
        "value": "3 GET"
      },
      {
        "label": "Standardzone",
        "value": "Afrika/Luanda"
      },
      {
        "label": "Geschäftsfenster",
        "value": "08:00 bis 17:00 Uhr"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Routen in dieser Familie",
        "table": {
          "columns": [
            "Route",
            "Zweck",
            "Schlüsselabfrage"
          ],
          "rows": [
            [
              "/api/v1/time/now",
              "Gibt die aktuelle Zeit für eine Zeitzone zurück.",
              "Zeitzone"
            ],
            [
              "/api/v1/time/convert",
              "Konvertieren Sie eine Datums- und Uhrzeitangabe von einer Zeitzone in eine andere.",
              "datetime, from, to"
            ],
            [
              "/api/v1/time/business-hours",
              "Überprüfen Sie, ob ein Datum/Uhrzeit innerhalb der Geschäftszeiten liegt.",
              "datetime, timezone, start, end"
            ]
          ]
        }
      },
      {
        "id": "time-now-route",
        "title": "GET /api/v1/time/now",
        "description": "Verwenden Sie „Jetzt“, wenn Sie die aktuelle Ortszeit für eine bestimmte IANA-Zeitzone benötigen.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "Zeitzone",
              "Nein",
              "IANA-Zeitzone. Der Standardwert ist `Africa/Luanda`."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/time/now?timezone=Africa/Luanda\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/time/now?timezone=Africa/Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"iso\": \"2026-03-23T18:45:00\",\n  \"timezone\": \"Africa/Luanda\",\n  \"offset\": \"GMT+1\",\n  \"components\": {\n    \"year\": 2026,\n    \"month\": 3,\n    \"day\": 23,\n    \"hour\": 18,\n    \"minute\": 45,\n    \"second\": 0,\n    \"weekday\": 1\n  }\n}"
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_TIMEZONE\",\n    \"message\": \"The supplied timezone is not supported by the runtime.\",\n    \"field\": \"timezone\",\n    \"value\": \"Mars/Base\"\n  }\n}"
          }
        ]
      },
      {
        "id": "time-convert-route",
        "title": "GET /api/v1/time/convert",
        "description": "Verwenden Sie „convert“, um ein lokales oder absolutes Datum/Uhrzeitdatum von einer Zeitzone in eine andere umzuwandeln.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "Datum/Uhrzeit",
              "Ja",
              "ISO-Datum/Uhrzeit. Wenn kein Offset angegeben wird, interpretiert die Route ihn in der Quellzeitzone."
            ],
            [
              "von",
              "Ja",
              "Quelle: IANA-Zeitzone."
            ],
            [
              "zu",
              "Ja",
              "Zielzeitzone der IANA."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/time/convert?datetime=2026-03-23T10:00:00&from=Africa/Luanda&to=UTC\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/time/convert?datetime=2026-03-23T10:00:00&from=Africa/Luanda&to=UTC\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"input\": {\n    \"datetime\": \"2026-03-23T10:00:00\",\n    \"timezone\": \"Africa/Luanda\"\n  },\n  \"source\": {\n    \"iso\": \"2026-03-23T10:00:00\",\n    \"timezone\": \"Africa/Luanda\"\n  },\n  \"target\": {\n    \"iso\": \"2026-03-23T09:00:00\",\n    \"timezone\": \"UTC\"\n  }\n}"
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_DATETIME\",\n    \"message\": \"Date-times without an offset must use YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss format.\",\n    \"field\": \"datetime\",\n    \"value\": \"23/03/2026 10:00\"\n  }\n}"
          }
        ]
      },
      {
        "id": "time-business-hours-route",
        "title": "GET /api/v1/time/business-hours",
        "description": "Nutzen Sie die Geschäftszeiten, bevor Sie Benachrichtigungen, Anrufe oder Erinnerungen senden, die ein lokales Bürofenster respektieren sollten.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "Datum/Uhrzeit",
              "Ja",
              "ISO-Datum/Uhrzeit zur Auswertung."
            ],
            [
              "Zeitzone",
              "Nein",
              "IANA-Zeitzone. Der Standardwert ist `Africa/Luanda`."
            ],
            [
              "beginnen",
              "Nein",
              "Startzeit am Geschäftstag in `HH:mm`. Standardmäßig ist `08:00`."
            ],
            [
              "Ende",
              "Nein",
              "Endzeit des Geschäftstages in `HH:mm`. Standardmäßig ist `17:00`."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/time/business-hours?datetime=2026-03-23T09:30:00&timezone=Africa/Luanda\""
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/time/business-hours?datetime=2026-03-23T09:30:00&timezone=Africa/Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "json",
            "content": "{\n  \"timezone\": \"Africa/Luanda\",\n  \"businessHours\": {\n    \"start\": \"08:00\",\n    \"end\": \"17:00\",\n    \"timezone\": \"Africa/Luanda\"\n  },\n  \"isBusinessDay\": true,\n  \"isWithinBusinessHours\": true\n}"
          },
          {
            "label": "Fehlerreaktion",
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
    "label": "Dokumente",
    "description": "Generieren Sie Rechnungs-, Quittungs- und Vertrags-PDFs aus JSON-Nutzdaten.",
    "eyebrow": "Kategorie",
    "title": "Generieren Sie bei Bedarf Transaktions- und Vertrags-PDFs.",
    "intro": "Die Dokumentrouten konvertieren kompakte JSON-Nutzlasten in synchrone PDF-Dateien, die direkt heruntergeladen oder von Ihrer eigenen Anwendung gespeichert werden können.",
    "summaryCards": [
      {
        "label": "Routen",
        "value": "3 POST"
      },
      {
        "label": "Formatieren",
        "value": "PDF Anhänge"
      },
      {
        "label": "Am besten für",
        "value": "Interne Arbeitsabläufe"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Routen in dieser Familie",
        "table": {
          "columns": [
            "Route",
            "Zweck",
            "Wichtige Körperfelder"
          ],
          "rows": [
            [
              "/api/v1/documents/invoice",
              "Erstellen Sie eine Rechnung PDF.",
              "seller, buyer, items"
            ],
            [
              "/api/v1/documents/receipt",
              "Generieren Sie eine Quittung PDF.",
              "receivedFrom, amount"
            ],
            [
              "/api/v1/documents/contract",
              "Generieren Sie einen Vertrag PDF.",
              "parties, clauses"
            ]
          ]
        }
      },
      {
        "id": "documents-invoice-route",
        "title": "POST /api/v1/documents/invoice",
        "description": "Verwenden Sie die Rechnung, wenn Sie eine synchrone PDF-Rechnung aus einer kompakten JSON-Nutzlast benötigen.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "Verkäufer",
              "Ja",
              "Verkäuferobjekt mit mindestens `name`."
            ],
            [
              "Käufer",
              "Ja",
              "Käuferobjekt mit mindestens `name`."
            ],
            [
              "Artikel",
              "Ja",
              "Array von Elementen mit `description`, `quantity`, `unitPrice` und optional `vatRate`."
            ],
            [
              "Rechnungsnummer / Ausgabedatum / Fälligkeitsdatum / Notizen",
              "Nein",
              "Optionale Rechnungsmetadatenfelder."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/invoice \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"seller\":{\"name\":\"Orb3x, Lda\"},\"buyer\":{\"name\":\"Cliente Exemplo\"},\"items\":[{\"description\":\"Service\",\"quantity\":1,\"unitPrice\":100000,\"vatRate\":14}]}' \\\n  --output invoice.pdf"
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "import { writeFile } from \"node:fs/promises\";\n\nasync function main() {\n  const payload = {\n    \"seller\": {\n      \"name\": \"Orb3x, Lda\"\n    },\n    \"buyer\": {\n      \"name\": \"Cliente Exemplo\"\n    },\n    \"items\": [\n      {\n        \"description\": \"Service\",\n        \"quantity\": 1,\n        \"unitPrice\": 100000,\n        \"vatRate\": 14\n      }\n    ]\n  };\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/invoice\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload)\n  });\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const fileBuffer = Buffer.from(await response.arrayBuffer());\n  await writeFile(\"invoice.pdf\", fileBuffer);\n  console.log(\"Saved invoice.pdf\");\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "bash",
            "content": "HTTP/1.1 200 OK\nContent-Type: application/pdf\nContent-Disposition: attachment; filename=\"invoice.pdf\""
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_INVOICE_PAYLOAD\",\n    \"message\": \"Invoice payload must include seller, buyer, and at least one item.\"\n  }\n}"
          }
        ]
      },
      {
        "id": "documents-receipt-route",
        "title": "POST /api/v1/documents/receipt",
        "description": "Verwenden Sie den Beleg für Zahlungsbestätigungen, bei denen nur der Zahler und der Betrag erforderlich sind.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "erhaltenVon",
              "Ja",
              "Partyobjekt mit mindestens `name`."
            ],
            [
              "Menge",
              "Ja",
              "Erhaltener Betrag."
            ],
            [
              "Empfangsnummer / Ausstellungsdatum / Grund / Zahlungsmethode / Notizen",
              "Nein",
              "Optionale Belegmetadatenfelder."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/receipt \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"receivedFrom\":{\"name\":\"Cliente Exemplo\"},\"amount\":100000}' \\\n  --output receipt.pdf"
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "import { writeFile } from \"node:fs/promises\";\n\nasync function main() {\n  const payload = {\n    \"receivedFrom\": {\n      \"name\": \"Cliente Exemplo\"\n    },\n    \"amount\": 100000\n  };\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/receipt\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload)\n  });\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const fileBuffer = Buffer.from(await response.arrayBuffer());\n  await writeFile(\"receipt.pdf\", fileBuffer);\n  console.log(\"Saved receipt.pdf\");\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "bash",
            "content": "HTTP/1.1 200 OK\nContent-Type: application/pdf\nContent-Disposition: attachment; filename=\"receipt.pdf\""
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_RECEIPT_PAYLOAD\",\n    \"message\": \"Receipt payload must include receivedFrom and amount.\"\n  }\n}"
          }
        ]
      },
      {
        "id": "documents-contract-route",
        "title": "POST /api/v1/documents/contract",
        "description": "Verwenden Sie den Vertrag, wenn Sie eine aus Parteien und Klauseln generierte Grundvereinbarung PDF benötigen.",
        "table": {
          "columns": [
            "Parameter",
            "Erforderlich",
            "Beschreibung"
          ],
          "rows": [
            [
              "Parteien",
              "Ja",
              "Array mit mindestens zwei Partyobjekten."
            ],
            [
              "Klauseln",
              "Ja",
              "Reihe von Vertragsklauseln."
            ],
            [
              "Titel / Vertragsnummer / Ausgabedatum / Notizen",
              "Nein",
              "Optionale Vertragsmetadatenfelder."
            ]
          ]
        },
        "codes": [
          {
            "label": "cURL Nutzung",
            "language": "bash",
            "content": "curl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/contract \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"parties\":[{\"name\":\"Orb3x, Lda\"},{\"name\":\"Cliente Exemplo\"}],\"clauses\":[\"The provider delivers the service.\",\"The client pays within 15 days.\"]}' \\\n  --output contract.pdf"
          },
          {
            "label": "Node.js Nutzung",
            "language": "js",
            "content": "import { writeFile } from \"node:fs/promises\";\n\nasync function main() {\n  const payload = {\n    \"parties\": [\n      {\n        \"name\": \"Orb3x, Lda\"\n      },\n      {\n        \"name\": \"Cliente Exemplo\"\n      }\n    ],\n    \"clauses\": [\n      \"The provider delivers the service.\",\n      \"The client pays within 15 days.\"\n    ]\n  };\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/contract\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload)\n  });\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const fileBuffer = Buffer.from(await response.arrayBuffer());\n  await writeFile(\"contract.pdf\", fileBuffer);\n  console.log(\"Saved contract.pdf\");\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 Antwort",
            "language": "bash",
            "content": "HTTP/1.1 200 OK\nContent-Type: application/pdf\nContent-Disposition: attachment; filename=\"contract.pdf\""
          },
          {
            "label": "Fehlerreaktion",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_CONTRACT_PAYLOAD\",\n    \"message\": \"Contract payload must include at least two parties and one clause.\"\n  }\n}"
          }
        ],
        "note": "Die Dokumentenerstellung ist bewusst eng gefasst. Behalten Sie die Quelle JSON selbst bei, wenn Sie Überprüfbarkeit oder Neugenerierung benötigen."
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
    "label": "NIF Überprüfung",
    "description": "Suchverhalten, Nutzlastfelder und Fehlermodi für die Überprüfung des Steuerzahlers.",
    "eyebrow": "Endpunkt",
    "title": "Suchen Sie nach Steuerzahlerdetails anhand eines normalisierten NIF-Werts.",
    "intro": "Die Route NIF akzeptiert eine angolanische Steuerkennung im Pfad, validiert sie, fordert Daten vom öffentlichen Steuerportal an und gibt eine geparste JSON-Antwort zurück.",
    "endpoint": {
      "method": "GET",
      "path": "/api/nif/{nif}",
      "detail": "Der Pfadparameter wird gekürzt, in Großbuchstaben geschrieben und auf Buchstaben und Ziffern beschränkt, bevor die Suche versucht wird."
    },
    "summaryCards": [
      {
        "label": "Eingabetyp",
        "value": "Pfadparameter"
      },
      {
        "label": "Upstream-Quelle",
        "value": "Angolanisches Steuerportal"
      },
      {
        "label": "Primärer Fehler",
        "value": "Portalverfügbarkeit"
      }
    ],
    "sections": [
      {
        "id": "success-shape",
        "title": "Erfolgsnutzlast",
        "code": {
          "label": "200 Antwort",
          "language": "json",
          "content": "{\n  \"NIF\": \"004813023LA040\",\n  \"Name\": \"EMPRESA EXEMPLO, LDA\",\n  \"Type\": \"Pessoa Colectiva\",\n  \"Status\": \"Activo\",\n  \"Defaulting\": \"Não\",\n  \"VATRegime\": \"Regime Geral\",\n  \"isTaxResident\": true\n}"
        }
      },
      {
        "id": "field-glossary",
        "title": "Zurückgegebene Felder",
        "table": {
          "columns": [
            "Feld",
            "Bedeutung"
          ],
          "rows": [
            [
              "NIF",
              "Normalisierter Bezeichner, der für die Suche verwendet und in der Antwort wiedergegeben wird."
            ],
            [
              "Name",
              "Der Name des registrierten Steuerzahlers wurde aus der Portalantwort geparst."
            ],
            [
              "Typ",
              "Vom Quellportal zurückgegebene Steuerzahlerklassifizierung."
            ],
            [
              "Status",
              "Aktuelle Steuerstatuszeichenfolge."
            ],
            [
              "Standardmäßig",
              "Ob der Steuerzahler als säumig gekennzeichnet ist."
            ],
            [
              "Mehrwertsteuerregelung",
              "Vom Portal zurückgegebener Regimetext VAT."
            ],
            [
              "istTaxResident",
              "Boolescher Wert, abgeleitet von der residenten oder nicht residenten Markierung im Ergebnisabschnitt."
            ]
          ]
        }
      },
      {
        "id": "error-cases",
        "title": "Was kann schief gehen",
        "bullets": [
          "Ein leerer oder ungültiger Pfadparameter gibt den Fehler 400 INVALID_NIF zurück, bevor ein Upstream-Aufruf erfolgt.",
          "Wenn das Steuerportal kein Ergebnis meldet, gibt die Route eine 404 NIF_NOT_FOUND-Antwort zurück.",
          "Fehlerhafter oder strukturell veränderter HTML-Code aus dem Portal gibt den Fehler 502 UNPARSEABLE_RESPONSE zurück.",
          "Netzwerk- und TLS-Probleme werden als Upstream-Verfügbarkeitsfehler angezeigt, mit einem internen Fallback für Zertifikat-Edge-Fälle."
        ],
        "note": "Da es sich bei der Upstream-Quelle um HTML handelt, stellen Schemaänderungen im Portal das größte langfristige Wartungsrisiko dar. Führen Sie einen Vertragstest rund um den Parser durch."
      },
      {
        "id": "integration-tips",
        "title": "Integrationstipps",
        "bullets": [
          "Normalisieren Sie Leerzeichen und Groß-/Kleinschreibung in vom Benutzer eingegebenen Bezeichnern, bevor Sie den Routenpfad erstellen.",
          "Behandeln Sie diesen Endpunkt als Live-Überprüfung und nicht als permanente Aufzeichnungsquelle. Portaldaten können sich im Laufe der Zeit ändern.",
          "Speichern Sie das rohe Suchergebnis zusammen mit Ihrem eigenen Prüfkontext, wenn die Ausgabe Informationen zu Compliance-Maßnahmen liefert.",
          "Zeigen Sie klare Benutzernachrichten an, wenn das Portal vorübergehend nicht verfügbar ist, anstatt Upstream-Fehler in allgemeine Validierungsfehler umzuwandeln."
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
    "label": "Übersetzung",
    "description": "Fordern Sie Körperregeln, Sprachgebrauch und praktische Integrationsanleitungen an.",
    "eyebrow": "Endpunkt",
    "title": "Übersetzen Sie Text mit expliziter Validierung und Berichten in der Ausgangssprache.",
    "intro": "Die Übersetzungsroute akzeptiert JSON-Eingaben, validiert Sprachcodes, ruft den öffentlichen Übersetzungsendpunkt von Google auf und gibt übersetzten Text mit der erkannten oder bereitgestellten Quellsprache zurück.",
    "endpoint": {
      "method": "POST",
      "path": "/api/translate",
      "detail": "Senden Sie JSON mit Text, Zielsprachencode und einem optionalen Quellsprachencode. Wenn die Quelle weggelassen wird, verwendet die Route die automatische Erkennung."
    },
    "summaryCards": [
      {
        "label": "Eingabetyp",
        "value": "JSON Körper"
      },
      {
        "label": "Zielvalidierung",
        "value": "2-12 Zeichen"
      },
      {
        "label": "Automatische Erkennung",
        "value": "Standardmäßig aktiviert"
      }
    ],
    "sections": [
      {
        "id": "request-shape",
        "title": "Nutzlast anfordern",
        "code": {
          "label": "POST Körper",
          "language": "json",
          "content": "{\n  \"text\": \"Olá mundo\",\n  \"to\": \"en\",\n  \"from\": \"pt\"\n}"
        },
        "bullets": [
          "Der Text ist erforderlich und muss vor dem Versand zugeschnitten werden.",
          "to ist erforderlich und muss mit einem einfachen Sprachcodemuster in Kleinbuchstaben übereinstimmen.",
          "from ist optional; Bei Abwesenheit nutzt die Route die automatische Upstream-Erkennung.",
          "Ungültig JSON gibt eine 400-Antwort zurück, bevor mit der Übersetzungsarbeit begonnen wird."
        ]
      },
      {
        "id": "success-shape",
        "title": "Erfolgsnutzlast",
        "code": {
          "label": "200 Antwort",
          "language": "json",
          "content": "{\n  \"translatedText\": \"Hello world\",\n  \"sourceLanguage\": \"pt\",\n  \"targetLanguage\": \"en\",\n  \"status\": true,\n  \"message\": \"\"\n}"
        }
      },
      {
        "id": "failure-modes",
        "title": "Häufige Fehlermodi",
        "table": {
          "columns": [
            "Code",
            "Ursache",
            "Empfohlene Handhabung"
          ],
          "rows": [
            [
              "INVALID_TEXT",
              "Das Textfeld fehlt oder ist leer.",
              "Blockieren Sie die Übermittlung und fordern Sie den Benutzer zur Eingabe von Inhalten auf."
            ],
            [
              "INVALID_LANGUAGE",
              "Der Quell- oder Zielsprachencode fehlt oder ist fehlerhaft.",
              "Korrigieren Sie die Nutzlast, bevor Sie es erneut versuchen."
            ],
            [
              "UPSTREAM_TIMEOUT",
              "Der Übersetzungsanbieter hat das Zeitlimit überschritten.",
              "Versuchen Sie es mit Backoff erneut, wenn der Benutzerfluss dies zulässt."
            ],
            [
              "UPSTREAM_BAD_RESPONSE",
              "Der Anbieter hat eine Nicht-200-Antwort zurückgegeben.",
              "Reduzieren Sie den Vorgang ordnungsgemäß oder stellen Sie ihn in die Warteschlange für einen erneuten Versuch."
            ],
            [
              "UNPARSEABLE_RESPONSE",
              "Anbieter JSON konnte nicht in übersetzten Text analysiert werden.",
              "Warnen Sie und greifen Sie auf den Originaltext zurück."
            ]
          ]
        }
      },
      {
        "id": "best-practices",
        "title": "Nutzungshinweise",
        "bullets": [
          "Behalten Sie den Originaltext in Ihrem eigenen Datenmodell bei, damit Redakteure später die Quelle und die übersetzte Kopie vergleichen können.",
          "Zwischenspeichern Sie Ihre eigenen erfolgreichen Übersetzungen, wenn eine Wiederverwendung akzeptabel ist. Die Route selbst speichert absichtlich keine Antworten im Cache.",
          "Bevorzugen Sie explizite Quellsprachencodes in Batch-Workflows, bei denen Sie die Eingabesprache bereits kennen.",
          "Verwenden Sie sourceLanguage aus der Antwort, um unerwartete Erkennungsergebnisse in Moderations- oder Support-Tools zu kennzeichnen."
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
    "label": "Geldwechsel",
    "description": "Basiskurssuche, Betragsumrechnungen und Nutzlastsemantik für FX-Daten.",
    "eyebrow": "Endpunkt",
    "title": "Geben Sie Einheitspreise oder umgerechnete Summen vom selben Endpunkt zurück.",
    "intro": "Die Währungsroute sucht nach Metadaten und Kurstabellen für eine Basiswährung und multipliziert diese Kurse dann optional mit einem Betragsabfrageparameter.",
    "endpoint": {
      "method": "GET",
      "path": "/api/exchange/{base}",
      "detail": "Der Pfadparameter identifiziert die Basiswährung. Fügen Sie ?amount=value hinzu, wenn Sie auch vorberechnetes convertedRates in der Antwort haben möchten."
    },
    "summaryCards": [
      {
        "label": "Eingabetyp",
        "value": "Pfad + Abfrage"
      },
      {
        "label": "Erweiterte Ausgabe",
        "value": "convertedRates"
      },
      {
        "label": "Primäres Risiko",
        "value": "Upstream-Frische"
      }
    ],
    "sections": [
      {
        "id": "lookup-shape",
        "title": "Erfolgsnutzlast ohne Betrag",
        "code": {
          "label": "Suche nach Einheitspreisen",
          "language": "json",
          "content": "{\n  \"currencyCode\": \"aoa\",\n  \"currencyName\": \"Angolan kwanza\",\n  \"currencySymbol\": \"Kz\",\n  \"countryName\": \"Angola\",\n  \"countryCode\": \"AO\",\n  \"flagImage\": \"https://example.com/flags/ao.png\",\n  \"ratesDate\": \"2026-03-22\",\n  \"baseCurrency\": \"AOA\",\n  \"unitRates\": {\n    \"usd\": 0.0011,\n    \"eur\": 0.0010\n  }\n}"
        }
      },
      {
        "id": "conversion-shape",
        "title": "Erfolgreiche Nutzlast mit Betrag",
        "code": {
          "label": "Suche mit Konvertierung",
          "language": "json",
          "content": "{\n  \"baseCurrency\": \"AOA\",\n  \"amount\": 1000000,\n  \"unitRates\": {\n    \"usd\": 0.0011\n  },\n  \"convertedRates\": {\n    \"usd\": 1100\n  }\n}"
        },
        "bullets": [
          "Der Betrag wird als Zahl geparst und muss null oder größer sein.",
          "convertedRates spiegelt die Schlüssel von unitRates wider und multipliziert jeden Wert mit dem Betrag.",
          "baseCurrency wird in der Antwort auf Großbuchstaben normalisiert, obwohl die Route Eingaben in Kleinbuchstaben akzeptiert."
        ]
      },
      {
        "id": "metadata",
        "title": "Metadatenfelder",
        "table": {
          "columns": [
            "Feld",
            "Bedeutung"
          ],
          "rows": [
            [
              "Währungscode",
              "Normalisierter Basiswährungscode aus der Upstream-Antwort."
            ],
            [
              "Währungsname",
              "Anzeigename für die Basiswährung."
            ],
            [
              "Währungssymbol",
              "Symbol, das der Basiswährung zugeordnet ist."
            ],
            [
              "Ländername / Ländercode",
              "An die Basiswährung gebundene Ländermetadaten."
            ],
            [
              "flagImage",
              "Flag-Asset URL, das vom Upstream-Anbieter zurückgegeben wurde."
            ],
            [
              "ratesDate",
              "Datum, das dem Upstream-Raten-Snapshot beigefügt ist."
            ]
          ]
        }
      },
      {
        "id": "implementation-guidance",
        "title": "Anleitung zur Umsetzung",
        "bullets": [
          "Verwenden Sie unitRates, wenn Sie die volle Kontrolle über Formatierung, Rundung oder nachgelagerte Geschäftsberechnungen benötigen.",
          "Verwenden Sie convertedRates, wenn der Endpunkt die Benutzeroberfläche direkt speist und Sie doppelte Berechnungen auf allen Clients vermeiden möchten.",
          "Schützen Sie sich vor fehlenden Währungen in Ihrer Benutzeroberfläche, da der Upstream-Anbieter möglicherweise nicht jeden Code in jeden Snapshot einbezieht.",
          "Wenn Sie konvertierte Summen beibehalten, behalten Sie auch ratesDate bei, damit Berichte überprüfbar bleiben."
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
    "label": "Beispiele",
    "description": "Praktische Beispiele für cURL, Node.js und TypeScript für den produktionsähnlichen Einsatz.",
    "eyebrow": "Umsetzung",
    "title": "Beispiele für den Aufruf der veröffentlichten Routen.",
    "intro": "Die folgenden Snippets zeigen cURL-Anfragen, passende Node.js-Abrufaufrufe und einen typisierten TypeScript-Helfer für die in diesem Repository veröffentlichten Routen.",
    "summaryCards": [
      {
        "label": "Formate",
        "value": "cURL + Node.js"
      },
      {
        "label": "Kundenorientierung",
        "value": "Serversicherer Abruf"
      },
      {
        "label": "Fehlerstrategie",
        "value": "Codebewusster Umgang"
      }
    ],
    "sections": [
      {
        "id": "curl",
        "title": "Beispiele für cURL und Node.js",
        "codes": [
          {
            "label": "Terminal-Rauchtests (cURL)",
            "language": "bash",
            "content": "curl -s https://orb3x-utils-api.vercel.app/api/nif/004813023LA040\n\ncurl -s -X POST https://orb3x-utils-api.vercel.app/api/translate \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"text\":\"Preciso de ajuda\",\"to\":\"en\"}'\n\ncurl -s \"https://orb3x-utils-api.vercel.app/api/exchange/aoa?amount=250000\""
          },
          {
            "label": "Terminal-Rauchtests (Node.js)",
            "language": "js",
            "content": "async function main() {\n  const response1 = await fetch(\"https://orb3x-utils-api.vercel.app/api/nif/004813023LA040\");\n  if (!response1.ok) {\n    throw new Error(`Request failed with status ${response1.status}`);\n  }\n  const data1 = await response1.json();\n  console.log(\"Example 1\", data1);\n\n  const payload2 = {\n    \"text\": \"Preciso de ajuda\",\n    \"to\": \"en\"\n  };\n  const response2 = await fetch(\"https://orb3x-utils-api.vercel.app/api/translate\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload2)\n  });\n  if (!response2.ok) {\n    throw new Error(`Request failed with status ${response2.status}`);\n  }\n  const data2 = await response2.json();\n  console.log(\"Example 2\", data2);\n\n  const response3 = await fetch(\"https://orb3x-utils-api.vercel.app/api/exchange/aoa?amount=250000\");\n  if (!response3.ok) {\n    throw new Error(`Request failed with status ${response3.status}`);\n  }\n  const data3 = await response3.json();\n  console.log(\"Example 3\", data3);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          }
        ]
      },
      {
        "id": "typescript",
        "title": "Eingegebener Helfer TypeScript",
        "code": {
          "label": "Gemeinsam genutztes Client-Dienstprogramm",
          "language": "ts",
          "content": "type ApiError = {\n  error?: {\n    code?: string;\n    message?: string;\n  };\n  code?: string;\n  message?: string;\n};\n\nexport async function callApi\u003cT>(input: RequestInfo, init?: RequestInit): Promise\u003cT> {\n  const response = await fetch(input, init);\n\n  if (!response.ok) {\n    const error = (await response.json().catch(() => ({}))) as ApiError;\n    throw new Error(error.error?.code ?? error.code ?? \"REQUEST_FAILED\");\n  }\n\n  return (await response.json()) as T;\n}"
        }
      },
      {
        "id": "workflow-patterns",
        "title": "Workflow-Muster",
        "bullets": [
          "Kunden-Onboarding: Überprüfen Sie den Steuerzahlerdatensatz, bevor Sie ein Konto in Ihrem Backoffice-Ablauf aktivieren.",
          "Lokalisierungspipeline: Übersetzen Sie benutzerbezogene Inhalte und speichern Sie sowohl den übersetzten Text als auch die erkannte Quellsprache.",
          "Preis-Dashboard: Fordern Sie einmal Basispreise an und verwenden Sie dann unitRates oder convertedRates, je nachdem, wie viel Kontrolle die Benutzeroberfläche benötigt.",
          "Support-Tools: Zeigen Sie Upstream-Fehlercodes an interne Agenten an, damit diese fehlerhafte Eingaben schnell von Anbieterausfällen unterscheiden können."
        ]
      },
      {
        "id": "production-hardening",
        "title": "Produktionshärten",
        "bullets": [
          "Wickeln Sie Anrufe in einem gemeinsamen Client mit typisierten Erfolgs- und Fehlerformen um.",
          "Geben Sie Metriken für Zeitüberschreitung, schlechte Antwort, Nicht gefunden und ungültige Eingaberaten separat aus.",
          "Halten Sie die Wiederholungslogik nahe an der Clientgrenze, damit der Produktcode sie nicht pro Feature erneut implementiert.",
          "Erfassen Sie ratesDate und sourceLanguage, wenn diese Felder für die Überprüfbarkeit oder redaktionelle Überprüfung wichtig sind."
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
