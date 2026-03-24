import { deDocsPages } from './docs/de';
import type { PartialSiteCopy } from './types';

export const deSiteCopy: PartialSiteCopy = {
  "languageName": "Deutsch",
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
    "title": "ORB3X Utils API – Steuerüberprüfung, Übersetzung und Währungsumrechnung",
    "description": "Dokumentation für ORB3X Utils API-Routen, die auf Angola ausgerichtete Validierung, Geo, Finanzen, Gehaltsabrechnung, Dokumente und ältere Upstream-Dienstprogramme abdecken.",
    "keywords": [
      "API",
      "Steuerprüfung",
      "Übersetzung",
      "Geldwechsel",
      "NIF",
      "Entwicklertools",
      "Angola",
      "Wechselkurse"
    ],
    "openGraphTitle": "ORB3X Utils API",
    "openGraphDescription": "Dokumentation für auf Angola ausgerichtete Validierung, Geo, Finanzen, Gehaltsabrechnung, Dokumente und ältere Upstream-Routen."
  },
  "brand": {
    "homeAriaLabel": "ORB3X Nutzt API home",
    "companyWebsiteAriaLabel": "Öffnen Sie die Unternehmenswebsite ORB3X"
  },
  "header": {
    "themeToDark": "Wechseln Sie in den Dunkelmodus",
    "themeToLight": "Wechseln Sie in den Lichtmodus",
    "language": "Language",
    "openMenu": "Menü öffnen",
    "closeMenu": "Menü schließen",
    "navigation": "Navigation"
  },
  "navigation": {
    "docs": "Dokumente",
    "apiReference": "API Referenz",
    "examples": "Beispiele",
    "faq": "FAQ",
    "privacy": "Privatsphäre"
  },
  "footer": {
    "description": "Dokumentations- und Referenzseiten für die auf Angola ausgerichteten Routenfamilien ORB3X Utils API.",
    "companyLabel": "Unternehmen",
    "companyDescription": "ORB3X Utils API wird von ORB3X verwaltet. Besuchen Sie die Hauptwebsite des Unternehmens für eine breitere Produkt- und institutionelle Präsenz.",
    "companyWebsite": "Besuchen Sie orb3x.com",
    "explore": "Entdecken",
    "documentation": "Dokumentation",
    "policies": "Richtlinien",
    "privacy": "Datenschutzrichtlinie",
    "terms": "Nutzungsbedingungen",
    "faq": "FAQ",
    "copyright": "© 2026 ORB3X Utils API. Alle Rechte vorbehalten.",
    "tagline": "Validierung, Geo-, Finanz-, Gehalts-, Dokument- und Legacy-Utility-Dokumentation API."
  },
  "routes": {
    "nif": {
      "title": "NIF Überprüfung",
      "description": "Validieren und normalisieren Sie angolanische Steuerzahlerdaten über das offizielle öffentliche Portal mit einer einzigen GET-Anfrage."
    },
    "translation": {
      "title": "Textübersetzung",
      "description": "Übersetzen Sie Anwendungstexte, Kundennachrichten oder Supportinhalte mit expliziter Quell- und Zielsprachenbehandlung."
    },
    "exchange": {
      "title": "Geldwechsel",
      "description": "Suchen Sie nach Basiswährungskursen oder berechnen Sie vorab umgerechnete Beträge aus demselben Antwortumschlag."
    }
  },
  "home": {
    "eyebrow": "ORB3X Utils API",
    "title": "APIs für Angola-Validierung, Geo-, Finanz-, Gehalts-, Dokumenten- und Kerndienstprogramme.",
    "description": "Verwenden Sie die Dokumente, um Anforderungsformate, Antwortnutzlasten, Rechner und Upstream-Verhalten auf der aktuellen ORB3X Utils API-Oberfläche zu überprüfen.",
    "primaryCta": "Beginnen Sie mit den Dokumenten",
    "secondaryCta": "Beispiele ansehen",
    "quickRequestLabel": "Beispiel für eine Schnellanfrage (cURL)",
    "quickRequestNodeLabel": "Beispiel für eine Schnellanfrage (Node.js)",
    "stats": [
      {
        "label": "Veröffentlichte Routen",
        "value": "28"
      },
      {
        "label": "Antwortformat",
        "value": "JSON"
      },
      {
        "label": "Cache-Richtlinie",
        "value": "no-store"
      }
    ],
    "notes": [
      {
        "title": "Gemeinsame Antwortverarbeitung",
        "description": "Die meisten Routen geben JSON zurück und legen genügend Fehlerdetails offen, um ungültige Eingaben von Upstream-Fehlern oder annahmebedingten Berechnungsproblemen zu trennen."
      },
      {
        "title": "Live-Upstream-Daten",
        "description": "Die Plattform kombiniert deterministische lokale Datenendpunkte mit einigen Upstream-gestützten Routen, aber alle Antworten bleiben no-store, um die Aktualität zu bewahren."
      },
      {
        "title": "Dokumentation auf Routenebene",
        "description": "Jede Routenfamilie verfügt über eine eigene Seite, die die Form der Anfrage, die Nutzlast der Antwort, Annahmen und häufige Fehlerfälle abdeckt."
      }
    ],
    "ownershipLabel": "Verwaltet von ORB3X",
    "ownershipDescription": "ORB3X Utils API ist Teil der umfassenderen ORB3X-Plattform. Die Website des institutionellen Unternehmens befindet sich unter orb3x.com.",
    "ownershipCta": "Öffnen Sie orb3x.com",
    "docs": {
      "eyebrow": "Dokumentation",
      "title": "Geschrieben wie Referenzseiten, nicht wie Marketingtexte.",
      "description": "Der Abschnitt „Dokumente“ behandelt gemeinsames Verhalten, routenspezifische Nutzlasten und Beispiele für jeden Endpunkt. Nutzen Sie es als Haupteinstiegspunkt für die Implementierungsarbeit.",
      "bullets": [
        "Beginnen Sie mit der Routenübersicht, um gemeinsame Statuscodes und Caching-Regeln zu verstehen.",
        "Verwenden Sie die speziellen Endpunktseiten für Anforderungsfelder, Antwortbeispiele und Integrationshinweise.",
        "Lassen Sie die Beispielseite geöffnet, während Sie Abrufhilfen oder Rauchtests verkabeln."
      ],
      "tableLabel": "Dokumentationsseite",
      "tableType": "Typ",
      "tableTypeValue": "Dokumente",
      "open": "Offen"
    }
  },
  "docsOverview": {
    "navLabel": "Übersicht",
    "navDescription": "Dokumentationsindex, Konventionen und Routenkarte.",
    "eyebrow": "Dokumentation",
    "title": "Referenzseiten für die veröffentlichten Routenfamilien.",
    "description": "Verwenden Sie diese Seiten, um Eingaben, Ausgaben, Statuscodes, Annahmen und Beispiele in den Bereichen Validierung, Geo, Finanzen, Gehalt, Zeit, Dokumente und ältere Upstream-Endpunkte zu überprüfen.",
    "primaryCta": "Öffnen Sie den Einstieg",
    "secondaryCta": "Beispiele öffnen",
    "stats": [
      {
        "label": "Dokumentenseiten",
        "value": "14"
      },
      {
        "label": "Veröffentlichte Routen",
        "value": "28"
      },
      {
        "label": "Antwortformat",
        "value": "JSON"
      }
    ],
    "startHereTitle": "Beginnen Sie hier",
    "startHereDescription": "Auf den folgenden Seiten werden zunächst die gemeinsamen Regeln und dann die Anforderungs- und Antwortdetails für jede Route behandelt.",
    "routesTitle": "Routen",
    "routesDescription": "Für jede veröffentlichte Route gibt es eine eigene Seite mit Anforderungsbeispielen und Fehlerfällen.",
    "sharedBehaviorTitle": "Geteiltes Verhalten",
    "sharedBehaviorDescription": "Diese Regeln gelten für alle veröffentlichten Endpunkte und sind die wichtigsten Dinge, die in einem gemeinsam genutzten Client berücksichtigt werden müssen.",
    "sharedBehaviorColumns": [
      "Sorge",
      "Verhalten"
    ],
    "quickstartTitle": "Schnellstart",
    "quickstartDescription": "Führen Sie eine Anfrage pro Route aus, bevor Sie die Endpunkte mit dem Anwendungscode verbinden.",
    "quickstartLabel": "Rauchtestsequenz (cURL)",
    "quickstartNodeLabel": "Rauchtestsequenz (Node.js)",
    "sharedBehaviorRows": [
      [
        "Anforderungstext",
        "Die meisten Routen sind abfragegesteuerte GET-Endpunkte. Die Dokumentrouten und `/api/translate` erwarten JSON-Körper."
      ],
      [
        "Antwortfrische",
        "Jede Route sendet Cache-Control: no-store. Einige Endpunkte sind deterministisch, während andere auf Live-Upstream-Dienste angewiesen sind."
      ],
      [
        "Fehlerbehandlung",
        "Überprüfen Sie den Status von HTTP und das zurückgegebene Codefeld oder den Wert von error.code, bevor Sie entscheiden, ob Sie es erneut versuchen möchten."
      ],
      [
        "Bereitstellungsprofil",
        "Handler laufen auf Node.js und sind als dynamisch gekennzeichnet."
      ]
    ],
    "versionLabel": "Version",
    "versionSelectorLabel": "Dokumentationsversion auswählen",
    "versionCurrent": "v1",
    "versionLatest": "Neueste",
    "versionDescription": "Aktuelle stabile API-Dokumentation für die Routenoberfläche `/api/v1`.",
    "onPageLabel": "Auf dieser Seite",
    "onPageItems": [
      "Beginnen Sie hier",
      "Routen",
      "Geteiltes Verhalten",
      "Schnellstart"
    ],
    "open": "Offen"
  },
  "docsDetail": {
    "endpoint": "Endpunkt",
    "onPage": "Auf dieser Seite",
    "relatedPages": "Verwandte Seiten",
    "open": "Offen"
  },
  "faq": {
    "eyebrow": "FAQ",
    "title": "Fragen zu Anfragen, Antwortformaten und Upstream-Verhalten.",
    "description": "Allgemeine Antworten für Teams, die die auf Angola ausgerichtete ORB3X Utils API-Oberfläche integrieren.",
    "cards": [
      {
        "label": "Antwortformat",
        "value": "JSON"
      },
      {
        "label": "Cache-Richtlinie",
        "value": "no-store"
      },
      {
        "label": "Beginnen Sie mit",
        "value": "Erste Schritte"
      }
    ],
    "groups": [
      {
        "title": "Anfragen",
        "items": [
          {
            "question": "Was dokumentiert diese Website?",
            "answer": "Die Website dokumentiert die aktuelle ORB3X Utils API-Oberfläche, einschließlich Validierung, Telefon, Geo, Kalender, Finanzen, Gehalt, Zeit, Dokumente und die alten NIF, Übersetzungs- und Austauschrouten."
          },
          {
            "question": "Geben alle Routen JSON zurück?",
            "answer": "Bei den meisten Routen ist dies der Fall, aber die Dokumentendpunkte geben bei Erfolg PDF Dateien zurück. Fehlermeldungen verwenden immer noch JSON."
          },
          {
            "question": "Welche Routen erwarten einen Anfragetext?",
            "answer": "Die Dokumentendpunkte und `/api/translate` erwarten JSON-Körper. Die meisten anderen Routen verwenden Abfrageparameter."
          }
        ]
      },
      {
        "title": "Caching und Fehler",
        "items": [
          {
            "question": "Werden Antworten zwischengespeichert?",
            "answer": "Nein. Die Routenhandler geben `Cache-Control: no-store` zurück, da die Daten von Live-Upstream-Diensten stammen."
          },
          {
            "question": "Was passiert, wenn bei einem Upstream-Anbieter eine Zeitüberschreitung auftritt?",
            "answer": "Die Route gibt einen Timeout-bezogenen Fehlercode zurück, sodass Ihr Client entscheiden kann, ob er es erneut versucht oder einen Fallback-Status anzeigt."
          },
          {
            "question": "Wie sollen Wiederholungsversuche gehandhabt werden?",
            "answer": "Versuchen Sie es nur dann erneut, wenn die Antwort auf eine Upstream-Zeitüberschreitung oder ein Upstream-Verfügbarkeitsproblem hinweist. Validierungsfehler nicht erneut versuchen."
          }
        ]
      },
      {
        "title": "Routenverhalten",
        "items": [
          {
            "question": "Wie aktuell sind die NIF-Daten?",
            "answer": "Die Route gibt alles zurück, was das öffentliche angolanische Steuerportal zum Zeitpunkt der Anfrage offenlegt."
          },
          {
            "question": "Welche Sprachen kann die Übersetzungsroute akzeptieren?",
            "answer": "Es akzeptiert die vom zugrunde liegenden Übersetzungsendpunkt unterstützten Sprachcodes, vorbehaltlich der in den Dokumenten beschriebenen Validierungsregeln."
          },
          {
            "question": "Kann die Währungsroute umgerechnete Summen zurückgeben?",
            "answer": "Ja. Fügen Sie einen Abfrageparameter `amount` hinzu, um sowohl `unitRates` als auch `convertedRates` in derselben Antwort zu erhalten."
          }
        ]
      },
      {
        "title": "Verwendung der Ausgabe",
        "items": [
          {
            "question": "Soll ich die zurückgegebenen Daten speichern?",
            "answer": "Das hängt von Ihren eigenen Produktanforderungen ab. Wenn sich eine Antwort auf eine Prüfung oder Geschäftsentscheidung auswirkt, speichern Sie sie zusammen mit Ihrem eigenen Kontext."
          },
          {
            "question": "Wo sollte ich beim Debuggen zuerst suchen?",
            "answer": "Beginnen Sie mit der API-Referenz für gemeinsame Statuscodes und wechseln Sie dann zur dedizierten Routenseite für endpunktspezifische Anforderungs- und Antwortdetails."
          },
          {
            "question": "Welche Seiten sollten während der Integration geöffnet bleiben?",
            "answer": "Die Seite „Erste Schritte“, die API-Referenz und die Beispielseite decken den größten Teil der Integrationsarbeit ab."
          }
        ]
      }
    ],
    "ctaTitle": "Halten Sie die Referenzseiten während der Integration in der Nähe.",
    "ctaDescription": "Im Leitfaden „Erste Schritte“ wird zunächst das gemeinsame Verhalten behandelt, dann werden auf den Routenseiten die Anfrage- und Antwortdetails behandelt.",
    "primaryCta": "Öffnen Sie den Einstieg",
    "secondaryCta": "Öffnen Sie die Referenz API"
  },
  "legal": {
    "eyebrow": "Legal",
    "lastUpdated": "Zuletzt aktualisiert",
    "updatedOn": "22. März 2026",
    "scope": "Umfang",
    "appliesTo": "Gilt für",
    "companySite": "Firmenwebsite",
    "companySiteDescription": "Die Herausgeber- und Unternehmensinformationen für diesen API sind auf der offiziellen ORB3X-Website verfügbar.",
    "companySiteCta": "Öffnen Sie orb3x.com",
    "privacy": {
      "title": "Datenschutzrichtlinie.",
      "description": "Auf dieser Seite wird erläutert, welche Kategorien von Informationen verarbeitet werden können, wenn die Website oder API-Routen verwendet werden.",
      "scopeValue": "Website- und API-Vorgänge",
      "sections": [
        {
          "title": "Informationen, die wir verarbeiten",
          "paragraphs": [
            "Wir verarbeiten die Mindestinformationen, die erforderlich sind, um Anfragen zu empfangen, den API zu betreiben, den Dienst zu schützen und Probleme zu beheben. Abhängig von der Route können dazu Pfadparameter, Anforderungsnutzdaten, Antwortmetadaten und technische Diagnosen gehören.",
            "Beispiele hierfür sind Suchkennungen für Steuerzahler, Übersetzungsanforderungstexte, Basiswährungscodes, Anforderungszeitstempel, IP-bezogene Telemetrie und strukturierte Anwendungsprotokolle, die für Sicherheit und Fehlerbehebung verwendet werden."
          ],
          "bullets": [
            "Fordern Sie Inhalte an, die an API übermittelt wurden.",
            "Metadaten wie Zeitstempel, Routennamen und Antwortstatus",
            "Netzwerk- und Gerätesignale, die für Sicherheit, Debugging und Ratenkontrolle verwendet werden"
          ]
        },
        {
          "title": "Wie die Informationen verwendet werden",
          "paragraphs": [
            "Informationen werden verwendet, um die angeforderte Aktion auszuführen, die Verfügbarkeit zu überwachen, Vorfälle zu untersuchen und die Servicequalität zu verbessern."
          ],
          "bullets": [
            "Gibt API Antworten zurück",
            "Erkennen Sie Missbrauch, Ausfallzeiten und fehlerhafte Anfragen",
            "Untersuchen Sie Supportanfragen und reproduzieren Sie gemeldete Probleme",
            "Generieren Sie aggregierte interne Kennzahlen zu Nutzung und Zuverlässigkeit"
          ]
        },
        {
          "title": "Verarbeitung durch Dritte",
          "paragraphs": [
            "Einige Routen sind von vorgelagerten Anbietern abhängig, darunter öffentliche Regierungsdienste und APIs von Drittanbietern. Wenn diese Routen aufgerufen werden, werden relevante Anfragedaten an diese Anbieter gesendet, um die Anfrage abzuschließen.",
            "Diese Anbieter arbeiten nach ihren eigenen Bedingungen und Datenschutzpraktiken. Überprüfen Sie diese Abhängigkeiten, bevor Sie den Dienst in regulierten oder hochsensiblen Arbeitsabläufen verwenden."
          ]
        },
        {
          "title": "Aufbewahrung und Sicherheit",
          "paragraphs": [
            "Betriebsprotokolle und Support-Artefakte werden nur so lange aufbewahrt, wie dies zur Sicherung des Dienstes, zur Untersuchung von Vorfällen und zur Erfüllung gesetzlicher oder vertraglicher Verpflichtungen erforderlich ist.",
            "Wir nutzen für den Dienst angemessene administrative, technische und organisatorische Sicherheitsmaßnahmen, aber kein mit dem Internet verbundenes System kann absolute Sicherheit garantieren."
          ],
          "bullets": [
            "Zugriffskontrollen für Betriebssysteme",
            "Umgebungstrennung für Entwicklung und Produktion",
            "Verfahren zur Überwachung und Reaktion auf Vorfälle"
          ]
        }
      ]
    },
    "terms": {
      "title": "Nutzungsbedingungen.",
      "description": "Diese Bedingungen beschreiben die allgemeinen Bedingungen für die Nutzung der Website, der Dokumentation und der veröffentlichten API-Routen.",
      "appliesToValue": "Website, Dokumente und API Routen",
      "sections": [
        {
          "title": "Akzeptanz und Umfang",
          "paragraphs": [
            "Durch den Zugriff auf oder die Nutzung der Website oder der API-Routen stimmen Sie diesen Bedingungen und allen zusätzlichen schriftlichen Geschäftsbedingungen zu, die für Ihre Nutzung des Dienstes gelten können.",
            "Diese Bedingungen gelten für die öffentliche Website, die Dokumentation und die veröffentlichten API-Endpunkte. Sie setzen eine gesonderte schriftliche Vereinbarung nicht automatisch außer Kraft."
          ]
        },
        {
          "title": "Zulässige Nutzung",
          "paragraphs": [
            "Sie können den Dienst nutzen, um legitime Arbeitsabläufe zu bewerten und zu integrieren, die dem geltenden Recht entsprechen und die Verfügbarkeit oder Integrität der Plattform nicht beeinträchtigen."
          ],
          "bullets": [
            "Versuchen Sie keinen unbefugten Zugriff, kein Scraping über den vorgesehenen Zweck hinaus oder den Missbrauch von Upstream-Anbietern.",
            "Nutzen Sie den Dienst nicht für rechtswidrige Überprüfungen, diskriminierende Entscheidungen oder betrügerische Aktivitäten.",
            "Stellen Sie die Quelle oder Zuverlässigkeit der zurückgegebenen Daten gegenüber nachgeschalteten Benutzern nicht falsch dar."
          ]
        },
        {
          "title": "Dienstverhalten und Upstream-Abhängigkeiten",
          "paragraphs": [
            "Für einige Antworten ist der Dienst auf Drittanbieter und öffentliche Upstream-Systeme angewiesen. Verfügbarkeit, Latenz und Datenvollständigkeit können daher durch diese Abhängigkeiten beeinträchtigt werden.",
            "Wir können interne Implementierungsdetails im Laufe der Zeit ändern, vorausgesetzt, das veröffentlichte Routenverhalten bleibt für dokumentierte Integrationen im Wesentlichen verwendbar."
          ]
        },
        {
          "title": "Output und Kundenverantwortung",
          "paragraphs": [
            "Sie sind dafür verantwortlich, wie Sie die vom Dienst zurückgegebene Ausgabe in Ihren eigenen Produkten und Arbeitsabläufen verwenden.",
            "Überprüfen Sie kritische Maßnahmen sorgfältig, insbesondere wenn die zugrunde liegenden Daten aus Drittsystemen stammen."
          ]
        }
      ]
    }
  },
  "notFound": {
    "eyebrow": "404",
    "title": "Seite nicht gefunden",
    "description": "Die von Ihnen angeforderte Seite existiert nicht. Verwenden Sie einen der folgenden Links, um zu den veröffentlichten Dokumentationsseiten zurückzukehren.",
    "primaryCta": "Geh nach Hause",
    "secondaryCta": "Dokumente öffnen",
    "tertiaryCta": "Besuchen Sie FAQ"
  },
  "docsPages": deDocsPages
};
