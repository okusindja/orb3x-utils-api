import type { DocsPageMap } from '@/lib/site-content';

export const frDocsPages: DocsPageMap = {
  "getting-started": {
    "slug": "getting-started",
    "label": "Commencer",
    "description": "Présentation des familles de routes, des conventions de requête et des notes de déploiement.",
    "eyebrow": "Guide de la plateforme",
    "title": "Commencez avec les routes ORB3X Utils API publiées.",
    "intro": "ORB3X Utils API combine désormais les points de terminaison NIF d'origine, de traduction et d'échange avec des utilitaires de validation, de téléphone, d'adresse, de géolocalisation, de calendrier, de finances, de salaire, de temps et de documents axés sur l'Angola. Toutes les routes sont dynamiques et utilisent par défaut la mise en cache no-store.",
    "summaryCards": [
      {
        "label": "Durée d'exécution",
        "value": "Gestionnaires Node.js"
      },
      {
        "label": "Politique de cache",
        "value": "Réponses sans magasin"
      },
      {
        "label": "Styles de point de terminaison",
        "value": "24 GET, 4 POST"
      }
    ],
    "sections": [
      {
        "id": "mental-model",
        "title": "Commencez par le modèle de plateforme",
        "paragraphs": [
          "La plupart des nouveaux points de terminaison sont des calculateurs locaux, des registres ou des normalisateurs soutenus par des ensembles de données internes typés. Les routes existantes en matière de taxe, de traduction et d'échange font toujours appel à des fournisseurs en amont.",
          "Cette répartition est utile dans la conception du client : les points de terminaison de données locales sont déterministes et rapides, tandis que les routes sauvegardées en amont nécessitent une gestion plus stricte des nouvelles tentatives, des délais d'attente et de l'observabilité."
        ],
        "bullets": [
          "Attendez-vous à JSON pour les réponses de réussite et d'échec.",
          "Traitez les réponses NIF, de traduction et d'échange comme dynamiques et sensibles au temps.",
          "Traitez les résultats du salaire, de VAT et de l'inflation comme des calculateurs basés sur des hypothèses et conservez les entrées d'année ou de taux que vous avez utilisées.",
          "Lisez le code d'erreur renvoyé, et pas seulement le statut HTTP, lorsque vous décidez des tentatives.",
          "Normalisez vos propres entrées utilisateur avant d'appeler les points de terminaison pour réduire les 400 réponses évitables."
        ]
      },
      {
        "id": "request-conventions",
        "title": "Conventions de requêtes partagées",
        "table": {
          "columns": [
            "Préoccupation",
            "Comportement"
          ],
          "rows": [
            [
              "Transports",
              "HTTPS JSON API conçu pour les consommateurs côté serveur et côté navigateur."
            ],
            [
              "Mise en cache",
              "Les réponses définissent Cache-Control sur no-store à tous les niveaux afin que les intégrations lisent toujours les résultats en direct."
            ],
            [
              "Profil de délai d'attente",
              "Les gestionnaires accordent jusqu'à 30 secondes ; seul un sous-ensemble d’itinéraires existants dépend d’appels tiers en amont."
            ],
            [
              "Validation",
              "Les paramètres de requête, les valeurs de chemin et les corps POST sont nettoyés avant l'exécution de la logique métier."
            ],
            [
              "Gestion des erreurs",
              "Les erreurs de validation renvoient des codes de niveau 400 avec des valeurs error.code stables lisibles par machine."
            ]
          ]
        }
      },
      {
        "id": "first-calls",
        "title": "Faire une première demande réussie",
        "description": "Exécutez une requête par route avant de les intégrer dans le code de l’application.",
        "codes": [
          {
            "label": "Tests de fumée de démarrage (cURL)",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\"\n\ncurl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=%2B244923456789\"\n\ncurl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\"\n\ncurl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/invoice \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"seller\":{\"name\":\"Orb3x, Lda\"},\"buyer\":{\"name\":\"Cliente Exemplo\"},\"items\":[{\"description\":\"Service\",\"quantity\":1,\"unitPrice\":100000,\"vatRate\":14}]}'"
          },
          {
            "label": "Tests de fumée de démarrage (Node.js)",
            "language": "js",
            "content": "async function main() {\n  const response1 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\");\n  if (!response1.ok) {\n    throw new Error(`Request failed with status ${response1.status}`);\n  }\n  const data1 = await response1.json();\n  console.log(\"Example 1\", data1);\n\n  const response2 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=%2B244923456789\");\n  if (!response2.ok) {\n    throw new Error(`Request failed with status ${response2.status}`);\n  }\n  const data2 = await response2.json();\n  console.log(\"Example 2\", data2);\n\n  const response3 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\");\n  if (!response3.ok) {\n    throw new Error(`Request failed with status ${response3.status}`);\n  }\n  const data3 = await response3.json();\n  console.log(\"Example 3\", data3);\n\n  const payload4 = {\n    \"seller\": {\n      \"name\": \"Orb3x, Lda\"\n    },\n    \"buyer\": {\n      \"name\": \"Cliente Exemplo\"\n    },\n    \"items\": [\n      {\n        \"description\": \"Service\",\n        \"quantity\": 1,\n        \"unitPrice\": 100000,\n        \"vatRate\": 14\n      }\n    ]\n  };\n  const response4 = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/invoice\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload4)\n  });\n  if (!response4.ok) {\n    throw new Error(`Request failed with status ${response4.status}`);\n  }\n  const data4 = await response4.json();\n  console.log(\"Example 4\", data4);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          }
        ],
        "bullets": [
          "Vérifiez les itinéraires des documents à partir du runtime exact que vous déployez, car la génération PDF s'exécute côté serveur.",
          "Enregistrez les ID de demande et les codes d’erreur en amont pour les points de terminaison NIF, de traduction et d’échange.",
          "Créez des gardes de réponse autour de résultats fondés sur des hypothèses, tels que le salaire, l'inflation et la disponibilité du plan de numérotation."
        ]
      },
      {
        "id": "launch-checklist",
        "title": "Liste de contrôle de lancement de production",
        "bullets": [
          "Centralisez la configuration de base de URL afin que les environnements de test et de production puissent être changés sans modification du code.",
          "Capturez les réponses autres que 200 avec une journalisation structurée qui stocke le statut HTTP, le point de terminaison, le code et le contexte de la demande.",
          "Définir une politique de nouvelle tentative uniquement pour les délais d'attente en amont et les échecs de disponibilité ; ne réessayez pas les erreurs de saisie non valides.",
          "Stockez l’année de calcul ou les entrées de taux chaque fois que les résultats financiers sont intégrés aux factures, à la paie ou aux rapports.",
          "Validez les charges utiles POST pour la génération de documents avant de transmettre les entrées de l'utilisateur aux workflows de persistance ou de livraison.",
          "Conservez un test de contrat léger pour chaque point de terminaison dans CI afin de détecter les régressions accidentelles de forme de réponse."
        ],
        "note": "Si vous n'implémentez qu'une seule couche défensive, rendez-la explicite dans la gestion des codes d'erreur. C'est le moyen le plus simple de distinguer les échecs réessayables des mauvaises demandes."
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
    "label": "API Référence",
    "description": "Comportement canonique de requête et de réponse sur toute la surface API publiée.",
    "eyebrow": "Référence",
    "title": "Référence pour le comportement des demandes et des réponses partagées.",
    "intro": "Cette référence résume les conventions partagées par la surface utilitaire actuelle de l'Angola, y compris les itinéraires de validation, de géolocalisation, de finance, de salaire, de temps et de documents aux côtés des points de terminaison d'origine soutenus en amont.",
    "summaryCards": [
      {
        "label": "Points de terminaison publiés",
        "value": "28"
      },
      {
        "label": "Format de réussite",
        "value": "JSON uniquement"
      },
      {
        "label": "Réponses binaires",
        "value": "PDF sur les documents POST"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Catalogue de points de terminaison",
        "table": {
          "columns": [
            "Itinéraire",
            "Méthode",
            "Objectif",
            "Entrée clé"
          ],
          "rows": [
            [
              "/api/v1/validate/*",
              "GET",
              "Validez les structures de comptes bancaires angolais IBAN et locaux.",
              "iban ou requête de compte"
            ],
            [
              "/api/v1/phone/*",
              "GET",
              "Analysez les numéros de téléphone, validez le format et détectez les opérateurs.",
              "requête téléphonique"
            ],
            [
              "/api/v1/address/* + /api/v1/geo/*",
              "GET",
              "Normalisez les adresses et lisez les registres de localisation de l'Angola.",
              "q, province, municipality, address"
            ],
            [
              "/api/v1/calendar/*",
              "GET",
              "Calculs des jours fériés et des jours ouvrables.",
              "année, de/à, date/jours"
            ],
            [
              "/api/v1/finance/*",
              "GET",
              "Exécutez les calculs de VAT, de facture et d'inflation.",
              "requête de montant ou de lignes"
            ],
            [
              "/api/v1/salary/*",
              "GET",
              "Estimez les valeurs nettes, brutes et de coût pour l’employeur de la masse salariale.",
              "requête brute ou nette"
            ],
            [
              "/api/v1/time/*",
              "GET",
              "Lisez l'heure actuelle, convertissez les fuseaux horaires et vérifiez les heures de bureau.",
              "fuseau horaire, dateheure, début/fin"
            ],
            [
              "/api/v1/documents/*",
              "POST",
              "Générez des PDF de factures, de reçus et de contrats.",
              "corps JSON"
            ],
            [
              "/api/nif/{nif}",
              "GET",
              "Recherchez les champs d’identité des contribuables angolais.",
              "Paramètre de chemin NIF"
            ],
            [
              "/api/translate",
              "POST",
              "Traduisez le texte et renvoyez la langue source détectée.",
              "JSON corps : texte, à, facultatif de"
            ],
            [
              "/api/exchange/{base}",
              "GET",
              "Taux de change de retour, éventuellement multipliés par le montant.",
              "paramètre de chemin de base, requête de montant facultative"
            ]
          ]
        }
      },
      {
        "id": "response-patterns",
        "title": "Modèles de réponse",
        "paragraphs": [
          "Les charges utiles réussies sont spécifiques au point de terminaison, mais elles restent plates et orientées application. Les points finaux du calculateur font apparaître les valeurs dérivées ainsi que les hypothèses ou la base utilisée pour les produire.",
          "Les routes de documents constituent la principale exception : elles renvoient des réponses binaires PDF avec des en-têtes de pièces jointes. La plupart des autres points de terminaison renvoient JSON et une enveloppe d'erreur en cas de problème."
        ],
        "code": {
          "label": "Réponse d'erreur typique",
          "language": "json",
          "content": "{\n  \"error\": {\n    \"code\": \"UPSTREAM_TIMEOUT\",\n    \"message\": \"The currency service did not respond in time.\",\n    \"baseCurrency\": \"AOA\",\n    \"amount\": \"1000000\"\n  }\n}"
        }
      },
      {
        "id": "status-codes",
        "title": "Codes de statut et intention",
        "table": {
          "columns": [
            "Statut",
            "Signification",
            "Action typique"
          ],
          "rows": [
            [
              "200",
              "La demande validée a réussi.",
              "Utilisez directement la charge utile."
            ],
            [
              "400",
              "L'entrée est manquante, mal formée ou non prise en charge.",
              "Corrigez la demande ; pas de nouvelle tentative."
            ],
            [
              "404",
              "La ressource demandée n'a pas pu être trouvée en amont.",
              "Afficher un état clair introuvable."
            ],
            [
              "502",
              "Le service en amont a échoué ou a renvoyé des données mal formées.",
              "Réessayez avec une interruption ou dégradez-vous gracieusement."
            ],
            [
              "504",
              "La dépendance en amont a expiré.",
              "Réessayez si le flux d'utilisateurs peut le tolérer."
            ],
            [
              "500",
              "Défaillance interne inattendue.",
              "Enregistrez, alertez et traitez comme réessayable uniquement si votre UX le permet."
            ]
          ]
        }
      },
      {
        "id": "operational-notes",
        "title": "Notes opérationnelles",
        "bullets": [
          "Tous les gestionnaires de routes sont marqués comme dynamiques, vous ne devez donc pas vous fier aux réponses pré-rendues au moment de la construction.",
          "Les en-têtes User-Agent sont explicitement définis pour les requêtes héritées sauvegardées en amont afin d'améliorer la compatibilité des fournisseurs.",
          "La vérification des entrées est conservatrice : les paramètres d'itinéraire sont ajustés et normalisés avant l'envoi de la demande.",
          "Les réponses de validation de la banque incluent un badge d'image bancaire généré afin que les frontaux puissent afficher un visuel reconnaissable sans recherches supplémentaires.",
          "Les points de terminaison du document sont synchrones ; gardez les charges utiles compactes et effectuez le stockage en aval de manière asynchrone dans votre propre système si nécessaire."
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
    "label": "Validation",
    "description": "IBAN et validation de compte bancaire local angolais avec détection bancaire.",
    "eyebrow": "Catégorie",
    "title": "Validez les identifiants bancaires angolais et détectez la banque émettrice.",
    "intro": "La famille de validation couvre `/api/v1/validate/iban` et `/api/v1/validate/bank-account`. Les deux routes normalisent la saisie, détectent la banque à partir du code bancaire et renvoient une image de badge bancaire générée pour une utilisation dans l'interface utilisateur.",
    "summaryCards": [
      {
        "label": "Itinéraires",
        "value": "2 GET"
      },
      {
        "label": "Champ d'application par pays",
        "value": "Angola"
      },
      {
        "label": "Sortie visuelle",
        "value": "Image du badge bancaire"
      }
    ],
    "sections": [
      {
        "id": "routes",
        "title": "Itinéraires dans cette famille",
        "table": {
          "columns": [
            "Itinéraire",
            "Objectif",
            "Requête clé"
          ],
          "rows": [
            [
              "/api/v1/validate/iban",
              "Validez les IBAN au format AO avec les chèques mod-97 et la recherche bancaire.",
              "iban"
            ],
            [
              "/api/v1/validate/bank-account",
              "Validez les structures de comptes locaux à 21 chiffres et dérivez le IBAN correspondant.",
              "compte"
            ]
          ]
        }
      },
      {
        "id": "validate-iban-route",
        "title": "GET /api/v1/validate/iban",
        "description": "Utilisez cette voie lorsque vous disposez déjà d'un AO IBAN complet et que vous avez besoin de parties normalisées, de métadonnées bancaires et d'indicateurs de validation.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "iban",
              "Oui",
              "Format AO IBAN. Le gestionnaire coupe les séparateurs et met la valeur en majuscule avant de la vérifier."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/validate/iban?iban=AO06004000010123456789012\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"isValid\": true,\n  \"normalized\": \"AO06004000010123456789012\",\n  \"formatted\": \"AO06 0040 0001 0123 4567 8901 2\",\n  \"countryCode\": \"AO\",\n  \"checkDigits\": \"06\",\n  \"bank\": {\n    \"code\": \"BAI\",\n    \"ibanBankCode\": \"0040\",\n    \"name\": \"Banco Angolano de Investimentos\",\n    \"image\": \"data:image/svg+xml;base64,...\"\n  },\n  \"components\": {\n    \"bankCode\": \"0040\",\n    \"branchCode\": \"0001\",\n    \"accountNumber\": \"01234567890\",\n    \"controlDigits\": \"12\"\n  },\n  \"validation\": {\n    \"countrySupported\": true,\n    \"lengthValid\": true,\n    \"bankCodeKnown\": true,\n    \"mod97Valid\": true\n  }\n}"
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_IBAN\",\n    \"message\": \"Angolan IBANs must contain exactly 25 characters.\",\n    \"field\": \"iban\",\n    \"length\": 18\n  }\n}"
          }
        ],
        "bullets": [
          "Vérifiez `validation.mod97Valid` et `validation.bankCodeKnown` au lieu de vous fier uniquement à `isValid` lorsque vous avez besoin d'états granulaires de l'interface utilisateur.",
          "Utilisez `bank.image` directement dans les récapitulatifs de paiement ou les cartes de vérification."
        ]
      },
      {
        "id": "validate-bank-account-route",
        "title": "GET /api/v1/validate/bank-account",
        "description": "Utilisez cette route pour les chaînes de compte locales à 21 chiffres lorsque vous avez besoin d'une validation structurelle et du IBAN dérivé correspondant.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "compte",
              "Oui",
              "Chaîne de compte angolais local à 21 chiffres. Les séparateurs autres que des chiffres sont ignorés."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/validate/bank-account?account=004000010123456789012\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/validate/bank-account?account=004000010123456789012\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"isValid\": true,\n  \"normalized\": \"004000010123456789012\",\n  \"formatted\": \"0040 0001 0123 4567 8901 2\",\n  \"derivedIban\": \"AO06004000010123456789012\",\n  \"bankRecognized\": true,\n  \"bank\": {\n    \"code\": \"BAI\",\n    \"name\": \"Banco Angolano de Investimentos\",\n    \"image\": \"data:image/svg+xml;base64,...\"\n  },\n  \"components\": {\n    \"bankCode\": \"0040\",\n    \"branchCode\": \"0001\",\n    \"accountNumber\": \"01234567890\",\n    \"controlDigits\": \"12\"\n  },\n  \"validation\": {\n    \"formatValid\": true,\n    \"bankCodeKnown\": true,\n    \"controlDigitsPresent\": true\n  }\n}"
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_BANK_ACCOUNT\",\n    \"message\": \"Angolan local bank account numbers must contain exactly 21 digits.\",\n    \"field\": \"account\",\n    \"length\": 9\n  }\n}"
          }
        ],
        "bullets": [
          "Il s'agit d'une validation structurelle et non d'une confirmation que le compte est actif dans le réseau bancaire.",
          "Conservez le compte normalisé ou dérivé IBAN plutôt que la chaîne d'entrée brute."
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
    "label": "Téléphone",
    "description": "Analysez, validez et classez les numéros de téléphone angolais par opérateur.",
    "eyebrow": "Catégorie",
    "title": "Analysez les numéros angolais et classez la plage de numérotation.",
    "intro": "Les itinéraires téléphoniques normalisent les entrées locales ou internationales, séparent les parties nationales et nationales et mappent les préfixes mobiles vers Unitel, Africell ou Movicel lorsque la portée est connue.",
    "summaryCards": [
      {
        "label": "Itinéraires",
        "value": "3 GET"
      },
      {
        "label": "Code pays",
        "value": "+244"
      },
      {
        "label": "Modèle de disponibilité",
        "value": "Plan de numérotation"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Itinéraires dans cette famille",
        "table": {
          "columns": [
            "Itinéraire",
            "Objectif",
            "Requête clé"
          ],
          "rows": [
            [
              "/api/v1/phone/parse",
              "Renvoie les composants et les formats de numéros de téléphone structurés.",
              "téléphone"
            ],
            [
              "/api/v1/phone/validate",
              "Validez le format et signalez la disponibilité du plan de numérotation.",
              "téléphone"
            ],
            [
              "/api/v1/phone/operator",
              "Détectez l'opérateur mobile à partir du préfixe de portée.",
              "téléphone"
            ]
          ]
        }
      },
      {
        "id": "phone-parse-route",
        "title": "GET /api/v1/phone/parse",
        "description": "Utilisez parse lorsque vous avez besoin d'un nombre normalisé canonique ainsi que d'un formatage réutilisable pour le stockage ou l'interface utilisateur.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "téléphone",
              "Oui",
              "Numéro angolais local ou international, tel que `923456789` ou `+244923456789`."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/parse?phone=%2B244923456789\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/parse?phone=%2B244923456789\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"normalized\": \"+244923456789\",\n  \"countryCode\": \"+244\",\n  \"nationalNumber\": \"923456789\",\n  \"internationalFormat\": \"+244 923 456 789\",\n  \"nationalFormat\": \"923 456 789\",\n  \"isMobile\": true,\n  \"type\": \"mobile\",\n  \"prefix\": \"92\",\n  \"subscriberNumber\": \"3456789\",\n  \"operator\": {\n    \"code\": \"UNITEL\",\n    \"name\": \"Unitel\",\n    \"prefix\": \"92\",\n    \"prefixes\": [\"92\", \"93\", \"94\"]\n  }\n}"
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_PHONE\",\n    \"message\": \"Angolan phone numbers must contain 9 national digits.\",\n    \"field\": \"phone\",\n    \"length\": 6\n  }\n}"
          }
        ]
      },
      {
        "id": "phone-validate-route",
        "title": "GET /api/v1/phone/validate",
        "description": "Utilisez validate lorsque vous avez besoin d’un résultat réussite/échec ainsi que d’informations sur la disponibilité du plan de numérotation.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "téléphone",
              "Oui",
              "Numéro de téléphone angolais local ou international."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=952345678\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=952345678\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"isValid\": true,\n  \"normalized\": \"+244952345678\",\n  \"type\": \"mobile\",\n  \"operator\": {\n    \"code\": \"AFRICELL\",\n    \"name\": \"Africell\",\n    \"prefix\": \"95\",\n    \"prefixes\": [\"95\"]\n  },\n  \"availability\": {\n    \"type\": \"numbering-plan\",\n    \"status\": \"allocated-range\",\n    \"canConfirmLiveSubscriber\": false\n  }\n}"
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_PHONE\",\n    \"message\": \"The \\\"phone\\\" query parameter is required.\",\n    \"field\": \"phone\"\n  }\n}"
          }
        ],
        "note": "La disponibilité est basée sur les plages de numérotation angolaises connues. Cela ne confirme pas la joignabilité des abonnés en direct."
      },
      {
        "id": "phone-operator-route",
        "title": "GET /api/v1/phone/operator",
        "description": "Utilisez l'opérateur lorsque vous n'avez besoin que de la recherche de l'opérateur et non du reste de la charge utile du téléphone analysée.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "téléphone",
              "Oui",
              "Numéro de téléphone angolais local ou international."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/phone/operator?phone=912345678\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/phone/operator?phone=912345678\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"phone\": \"912345678\",\n  \"operator\": {\n    \"code\": \"MOVICEL\",\n    \"name\": \"Movicel\",\n    \"prefix\": \"91\",\n    \"prefixes\": [\"91\", \"99\"]\n  }\n}"
          },
          {
            "label": "Réponse à l'erreur",
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
    "label": "Adresse et géolocalisation",
    "description": "Normalisez les adresses angolaises et lisez les provinces, les municipalités et les communes.",
    "eyebrow": "Catégorie",
    "title": "Standardisez les adresses angolaises et interrogez le registre de localisation.",
    "intro": "La normalisation et la suggestion d'adresses sont soutenues par un registre géographique angolais organisé. Les itinéraires géographiques renvoient des données sur les provinces, les municipalités et les communes qui peuvent gérer les formulaires administratifs et les flux de saisie semi-automatique.",
    "summaryCards": [
      {
        "label": "Itinéraires",
        "value": "5 GET"
      },
      {
        "label": "Niveaux géographiques",
        "value": "Province à commune"
      },
      {
        "label": "Saisie semi-automatique",
        "value": "bairro + commune + municipalité"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Itinéraires dans cette famille",
        "table": {
          "columns": [
            "Itinéraire",
            "Objectif",
            "Requête clé"
          ],
          "rows": [
            [
              "/api/v1/address/normalize",
              "Nettoyer et structurer une adresse angolaise en texte libre.",
              "adresse"
            ],
            [
              "/api/v1/address/suggest",
              "Suggérez des bairros, des communes ou des municipalités.",
              "q, type, province, municipality"
            ],
            [
              "/api/v1/geo/provinces",
              "Répertoriez toutes les provinces d'Angola.",
              "aucun"
            ],
            [
              "/api/v1/geo/municipalities",
              "Répertoriez les municipalités, éventuellement filtrées par province.",
              "province"
            ],
            [
              "/api/v1/geo/communes",
              "Liste des communes pour une commune.",
              "municipalité, province facultative"
            ]
          ]
        }
      },
      {
        "id": "address-normalize-route",
        "title": "GET /api/v1/address/normalize",
        "description": "Utilisez normalize pour nettoyer une adresse en texte libre avant de la conserver ou de la comparer à des enregistrements internes.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "adresse",
              "Oui",
              "Adresse angolaise en texte libre. Les abréviations courantes telles que `prov.` et `mun.` sont développées automatiquement."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/address/normalize?address=Benfica,%20Luanda\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/address/normalize?address=Benfica,%20Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"input\": \"Benfica, Luanda\",\n  \"normalized\": \"Benfica, Luanda\",\n  \"components\": {\n    \"bairro\": \"Benfica\",\n    \"commune\": \"Benfica\",\n    \"municipality\": \"Belas\",\n    \"province\": \"Luanda\"\n  },\n  \"diagnostics\": {\n    \"provinceMatched\": true,\n    \"municipalityMatched\": true,\n    \"communeMatched\": true,\n    \"bairroMatched\": true\n  }\n}"
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_ADDRESS\",\n    \"message\": \"The \\\"address\\\" query parameter is required.\",\n    \"field\": \"address\"\n  }\n}"
          }
        ]
      },
      {
        "id": "address-suggest-route",
        "title": "GET /api/v1/address/suggest",
        "description": "Utilisez la suggestion pour générer des champs de saisie semi-automatique pour les bairros, les communes, les municipalités et les provinces.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "q",
              "Oui",
              "Fragment de recherche."
            ],
            [
              "tapez",
              "Non",
              "Filtre en option : `bairro`, `commune`, `municipality` ou `province`."
            ],
            [
              "province",
              "Non",
              "Filtre de province en option."
            ],
            [
              "municipalité",
              "Non",
              "Filtre de municipalité en option."
            ],
            [
              "limite",
              "Non",
              "Nombre maximum de suggestions à retourner."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/address/suggest?q=tal&type=municipality&province=Luanda\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/address/suggest?q=tal&type=municipality&province=Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"query\": \"tal\",\n  \"suggestions\": [\n    {\n      \"type\": \"municipality\",\n      \"label\": \"Talatona\",\n      \"province\": \"Luanda\",\n      \"municipality\": \"Talatona\"\n    }\n  ]\n}"
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"MISSING_QUERY_PARAMETER\",\n    \"message\": \"The \\\"q\\\" query parameter is required.\",\n    \"field\": \"q\"\n  }\n}"
          }
        ]
      },
      {
        "id": "geo-provinces-route",
        "title": "GET /api/v1/geo/provinces",
        "description": "Utilisez les provinces comme flux de registre de niveau supérieur pour les sélecteurs d'emplacement et le filtrage administratif.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": []
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/geo/provinces\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/geo/provinces\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"country\": \"AO\",\n  \"countryName\": \"Angola\",\n  \"provinces\": [\n    {\n      \"name\": \"Luanda\",\n      \"slug\": \"luanda\",\n      \"capital\": \"Luanda\",\n      \"municipalityCount\": 16\n    }\n  ]\n}"
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INTERNAL_SERVER_ERROR\",\n    \"message\": \"Unexpected error while listing provinces.\"\n  }\n}"
          }
        ]
      },
      {
        "id": "geo-municipalities-route",
        "title": "GET /api/v1/geo/municipalities",
        "description": "Utilisez les municipalités pour remplir les sélecteurs d'emplacement de deuxième niveau, avec ou sans filtre de province.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "province",
              "Non",
              "Nom de province facultatif utilisé pour filtrer la liste."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/geo/municipalities?province=Luanda\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/geo/municipalities?province=Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"province\": \"Luanda\",\n  \"municipalities\": [\n    {\n      \"name\": \"Talatona\",\n      \"slug\": \"talatona\",\n      \"province\": \"Luanda\",\n      \"communeCount\": 2\n    }\n  ]\n}"
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"PROVINCE_NOT_FOUND\",\n    \"message\": \"No Angolan province matched the supplied query.\",\n    \"field\": \"province\",\n    \"value\": \"Atlantis\"\n  }\n}"
          }
        ]
      },
      {
        "id": "geo-communes-route",
        "title": "GET /api/v1/geo/communes",
        "description": "Utilisez les communes lorsqu'une commune est déjà sélectionnée et que vous avez besoin du niveau administratif suivant.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "municipalité",
              "Oui",
              "Nom de la municipalité à agrandir."
            ],
            [
              "province",
              "Non",
              "Nom de province facultatif utilisé pour lever l’ambiguïté des étiquettes de municipalité répétées."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/geo/communes?municipality=Talatona&province=Luanda\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/geo/communes?municipality=Talatona&province=Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"municipality\": \"Talatona\",\n  \"province\": \"Luanda\",\n  \"coverage\": \"curated\",\n  \"communes\": [\n    { \"name\": \"Cidade Universitaria\", \"slug\": \"cidade-universitaria\" },\n    { \"name\": \"Talatona\", \"slug\": \"talatona\" }\n  ]\n}"
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"MISSING_QUERY_PARAMETER\",\n    \"message\": \"The \\\"municipality\\\" query parameter is required.\",\n    \"field\": \"municipality\"\n  }\n}"
          }
        ],
        "note": "Certaines municipalités utilisent des informations détaillées sur les communes, tandis que d'autres exposent actuellement une couverture uniquement par siège."
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
    "label": "Calendrier",
    "description": "Jours fériés angolais et calculs des jours ouvrables.",
    "eyebrow": "Catégorie",
    "title": "Travaillez avec les jours fériés, les jours ouvrables et les décalages de jours ouvrables.",
    "intro": "La famille de calendriers renvoie les jours fériés officiels fixes et mobiles ainsi que les calculs des jours ouvrables utiles pour la paie, la facturation et la planification des livraisons.",
    "summaryCards": [
      {
        "label": "Itinéraires",
        "value": "3 GET"
      },
      {
        "label": "Modèle de vacances",
        "value": "Fixe + mobile"
      },
      {
        "label": "Utilisation principale",
        "value": "Mathématiques du jour ouvrable"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Itinéraires dans cette famille",
        "table": {
          "columns": [
            "Itinéraire",
            "Objectif",
            "Requête clé"
          ],
          "rows": [
            [
              "/api/v1/calendar/holidays",
              "Retournez les jours fériés pendant un an.",
              "année"
            ],
            [
              "/api/v1/calendar/working-days",
              "Comptez les jours ouvrés entre deux dates.",
              "from, to"
            ],
            [
              "/api/v1/calendar/add-working-days",
              "Avancez ou reculez une date de jours ouvrés.",
              "date, days"
            ]
          ]
        }
      },
      {
        "id": "calendar-holidays-route",
        "title": "GET /api/v1/calendar/holidays",
        "description": "Utilisez les jours fériés pour obtenir le calendrier des jours fériés pris en charge en Angola pour une année donnée.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "année",
              "Non",
              "Année civile facultative. La valeur par défaut est l'année en cours."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/calendar/holidays?year=2026\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/calendar/holidays?year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"year\": 2026,\n  \"holidays\": [\n    {\n      \"date\": \"2026-02-16\",\n      \"name\": \"Carnival Holiday\",\n      \"localName\": \"Tolerancia de Ponto de Carnaval\",\n      \"category\": \"movable\"\n    },\n    {\n      \"date\": \"2026-02-17\",\n      \"name\": \"Carnival\",\n      \"localName\": \"Carnaval\",\n      \"category\": \"movable\"\n    }\n  ]\n}"
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_YEAR\",\n    \"message\": \"The \\\"year\\\" query parameter must be an integer between 2000 and 2100.\",\n    \"field\": \"year\",\n    \"value\": 1800\n  }\n}"
          }
        ]
      },
      {
        "id": "calendar-working-days-route",
        "title": "GET /api/v1/calendar/working-days",
        "description": "Utilisez les jours ouvrables pour compter les jours ouvrables entre deux dates tout en excluant les week-ends et les jours fériés pris en charge en Angola.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "de",
              "Oui",
              "Date de début au format `YYYY-MM-DD`."
            ],
            [
              "à",
              "Oui",
              "Date de fin au format `YYYY-MM-DD`."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/calendar/working-days?from=2026-03-20&to=2026-03-24\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/calendar/working-days?from=2026-03-20&to=2026-03-24\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"from\": \"2026-03-20\",\n  \"to\": \"2026-03-24\",\n  \"workingDays\": 2,\n  \"excludedWeekendDays\": 2,\n  \"excludedHolidayDays\": 1\n}"
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_DATE_RANGE\",\n    \"message\": \"The \\\"from\\\" date must be earlier than or equal to the \\\"to\\\" date.\",\n    \"from\": \"2026-03-25\",\n    \"to\": \"2026-03-24\"\n  }\n}"
          }
        ]
      },
      {
        "id": "calendar-add-working-days-route",
        "title": "GET /api/v1/calendar/add-working-days",
        "description": "Utilisez add-working-days pour avancer ou reculer une date de base en fonction du calendrier des jours ouvrables pris en charge.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "rendez-vous",
              "Oui",
              "Date de base au format `YYYY-MM-DD`."
            ],
            [
              "jours",
              "Oui",
              "Entier signé représentant le décalage du jour ouvrable."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/calendar/add-working-days?date=2026-03-20&days=1\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/calendar/add-working-days?date=2026-03-20&days=1\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"inputDate\": \"2026-03-20\",\n  \"days\": 1,\n  \"resultDate\": \"2026-03-24\",\n  \"direction\": \"forward\"\n}"
          },
          {
            "label": "Réponse à l'erreur",
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
    "label": "Finances",
    "description": "VAT, totaux des factures et ajustements d'inflation pour les flux monétaires angolais.",
    "eyebrow": "Catégorie",
    "title": "Calculez VAT, les totaux des factures et les valeurs ajustées à l'inflation.",
    "intro": "Les points de terminaison financiers fournissent des calculs déterministes qui peuvent être utilisés dans les systèmes de back-office, les estimations proposées et les outils de reporting. Ils renvoient à la fois les valeurs dérivées et la base utilisée pour les atteindre.",
    "summaryCards": [
      {
        "label": "Itinéraires",
        "value": "3 GET"
      },
      {
        "label": "Devise",
        "value": "AOA-premier"
      },
      {
        "label": "Saisie des factures",
        "value": "Charge utile de requête JSON"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Itinéraires dans cette famille",
        "table": {
          "columns": [
            "Itinéraire",
            "Objectif",
            "Requête clé"
          ],
          "rows": [
            [
              "/api/v1/finance/vat",
              "Divisez ou créez des totaux inclusifs de VAT.",
              "amount, rate, inclusive"
            ],
            [
              "/api/v1/finance/invoice-total",
              "Calculez les totaux des factures à partir des éléments de ligne.",
              "lines, discount, discountType"
            ],
            [
              "/api/v1/finance/inflation-adjust",
              "Ajustez les valeurs au fil des années à l’aide de la série de l’IPC de l’Angola.",
              "amount, from, to"
            ]
          ]
        }
      },
      {
        "id": "finance-vat-route",
        "title": "GET /api/v1/finance/vat",
        "description": "Utilisez VAT pour diviser les totaux bruts en nets plus taxes ou pour créer des totaux bruts à partir d'un montant net.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "montant",
              "Oui",
              "Montant de base à évaluer."
            ],
            [
              "taux",
              "Non",
              "Pourcentage du taux d'imposition. La valeur par défaut est 14."
            ],
            [
              "inclusif",
              "Non",
              "Lorsque `true`, traite le montant comme VAT inclus. Lorsque `false`, traite le montant comme net."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"amount\": 114000,\n  \"rate\": 14,\n  \"inclusive\": true,\n  \"netAmount\": 100000,\n  \"vatAmount\": 14000,\n  \"grossAmount\": 114000\n}"
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_RATE\",\n    \"message\": \"Tax rates must be between 0 and 100.\",\n    \"field\": \"rate\",\n    \"value\": 140\n  }\n}"
          }
        ]
      },
      {
        "id": "finance-invoice-total-route",
        "title": "GET /api/v1/finance/invoice-total",
        "description": "Utilisez le total de la facture pour calculer les totaux des factures à partir des éléments de campagne encodés sans dupliquer les calculs de tarification pour chaque client.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "lignes",
              "Oui",
              "Chaîne de tableau JSON avec `description`, `quantity`, `unitPrice` et `vatRate` en option."
            ],
            [
              "remise",
              "Non",
              "Montant ou pourcentage de la remise, en fonction de `discountType`."
            ],
            [
              "Type de réduction",
              "Non",
              "Soit `amount` ou `percent`."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/invoice-total?lines=%5B%7B%22description%22%3A%22Service%22%2C%22quantity%22%3A1%2C%22unitPrice%22%3A100000%2C%22vatRate%22%3A14%7D%5D&discount=10&discountType=percent\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/invoice-total?lines=%5B%7B%22description%22%3A%22Service%22%2C%22quantity%22%3A1%2C%22unitPrice%22%3A100000%2C%22vatRate%22%3A14%7D%5D&discount=10&discountType=percent\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"discountType\": \"percent\",\n  \"subtotal\": 100000,\n  \"discountAmount\": 10000,\n  \"taxableBase\": 90000,\n  \"vatTotal\": 12600,\n  \"grandTotal\": 102600\n}"
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_JSON\",\n    \"message\": \"The \\\"lines\\\" query parameter must be a valid JSON array.\",\n    \"field\": \"lines\"\n  }\n}"
          }
        ]
      },
      {
        "id": "finance-inflation-route",
        "title": "GET /api/v1/finance/inflation-adjust",
        "description": "Utilisez l’ajustement à l’inflation pour comparer les valeurs nominales des années d’IPC de l’Angola prises en charge.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "montant",
              "Oui",
              "Montant nominal initial."
            ],
            [
              "de",
              "Oui",
              "Chaîne de date ou d’année source. Les quatre premiers chiffres sont utilisés comme année de l'IPC."
            ],
            [
              "à",
              "Oui",
              "Chaîne de date ou d’année cible. Les quatre premiers chiffres sont utilisés comme année de l'IPC."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/finance/inflation-adjust?amount=100000&from=2020-01-01&to=2025-01-01\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/finance/inflation-adjust?amount=100000&from=2020-01-01&to=2025-01-01\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"amount\": 100000,\n  \"fromYear\": 2020,\n  \"toYear\": 2025,\n  \"inflationFactor\": 2.5642,\n  \"adjustedAmount\": 256420,\n  \"source\": \"Curated annual Angola CPI index series.\"\n}"
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"UNSUPPORTED_CPI_YEAR\",\n    \"message\": \"Inflation adjustment is available for Angola annual CPI years from 2019 through 2025.\",\n    \"fromYear\": 2010,\n    \"toYear\": 2025\n  }\n}"
          }
        ],
        "note": "Conservez la plage d’années de calcul chaque fois que le montant ajusté est utilisé dans les flux de reporting ou de tarification."
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
    "label": "Salaire",
    "description": "Estimez le salaire net, le salaire brut et le coût pour l'employeur selon les hypothèses de masse salariale de l'Angola.",
    "eyebrow": "Catégorie",
    "title": "Exécutez des estimations de masse salariale en Angola pour connaître les opinions des employés et des employeurs.",
    "intro": "La famille salariale applique des hypothèses de paie internes en Angola pour les tableaux de sécurité sociale des employés, de sécurité sociale des employeurs et de retenue sur les revenus d'emploi pour les années prises en charge.",
    "summaryCards": [
      {
        "label": "Itinéraires",
        "value": "3 GET"
      },
      {
        "label": "Années",
        "value": "2025 et 2026"
      },
      {
        "label": "Sorties",
        "value": "Coût net, brut, employeur"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Itinéraires dans cette famille",
        "table": {
          "columns": [
            "Itinéraire",
            "Objectif",
            "Requête clé"
          ],
          "rows": [
            [
              "/api/v1/salary/net",
              "Estimez le salaire net à partir du salaire brut.",
              "gross, year"
            ],
            [
              "/api/v1/salary/gross",
              "Estimez le salaire brut requis pour un objectif net.",
              "net, year"
            ],
            [
              "/api/v1/salary/employer-cost",
              "Estimer le coût pour l’employeur, cotisations comprises.",
              "gross, year"
            ]
          ]
        }
      },
      {
        "id": "salary-net-route",
        "title": "GET /api/v1/salary/net",
        "description": "Utilisez net lorsque votre valeur source est le salaire brut et que vous souhaitez le montant net estimé.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "brut",
              "Oui",
              "Salaire mensuel brut."
            ],
            [
              "année",
              "Non",
              "Année d'imposition prise en charge. Actuellement `2025` ou `2026`. La valeur par défaut est `2026`."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/salary/net?gross=500000&year=2026\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/salary/net?gross=500000&year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"year\": 2026,\n  \"grossSalary\": 500000,\n  \"taxableIncome\": 485000,\n  \"employeeSocialSecurity\": 15000,\n  \"irtRate\": 16,\n  \"irtTaxAmount\": 52100,\n  \"netSalary\": 432900,\n  \"employerContribution\": 40000,\n  \"assumptions\": [\"Applies monthly employment-income withholding for Angola.\"]\n}"
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"UNSUPPORTED_TAX_YEAR\",\n    \"message\": \"Supported salary-tax years are 2025 and 2026.\",\n    \"year\": 2024\n  }\n}"
          }
        ]
      },
      {
        "id": "salary-gross-route",
        "title": "GET /api/v1/salary/gross",
        "description": "Utilisez le brut lorsque la valeur cible est le salaire net et que vous avez besoin du salaire brut approximatif requis pour l'atteindre.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "net",
              "Oui",
              "Salaire mensuel net souhaité."
            ],
            [
              "année",
              "Non",
              "Année d'imposition prise en charge. La valeur par défaut est `2026`."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/salary/gross?net=432900&year=2026\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/salary/gross?net=432900&year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"year\": 2026,\n  \"targetNetSalary\": 432900,\n  \"grossSalary\": 500000,\n  \"employeeSocialSecurity\": 15000,\n  \"irtTaxAmount\": 52100,\n  \"netSalary\": 432900\n}"
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_NUMBER\",\n    \"message\": \"The \\\"net\\\" query parameter must be a non-negative number.\",\n    \"field\": \"net\",\n    \"value\": \"-1\"\n  }\n}"
          }
        ]
      },
      {
        "id": "salary-employer-cost-route",
        "title": "GET /api/v1/salary/employer-cost",
        "description": "Utilisez le coût de l'employeur lorsque la planification de la paie nécessite la contribution de l'entreprise en plus du salaire brut de l'employé.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "brut",
              "Oui",
              "Salaire mensuel brut."
            ],
            [
              "année",
              "Non",
              "Année d'imposition prise en charge. La valeur par défaut est `2026`."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/salary/employer-cost?gross=500000&year=2026\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/salary/employer-cost?gross=500000&year=2026\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"currency\": \"AOA\",\n  \"year\": 2026,\n  \"grossSalary\": 500000,\n  \"employerContribution\": 40000,\n  \"totalEmployerCost\": 540000\n}"
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_NUMBER\",\n    \"message\": \"The \\\"gross\\\" query parameter must be a non-negative number.\",\n    \"field\": \"gross\",\n    \"value\": \"abc\"\n  }\n}"
          }
        ],
        "note": "Ces points de terminaison sont des calculateurs de scénarios et non des services de dépôt de paie. Faites apparaître les hypothèses dans n’importe quelle interface utilisateur qui affiche le résultat."
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
    "label": "Temps",
    "description": "Heure locale actuelle, conversion du fuseau horaire et vérification des heures de bureau.",
    "eyebrow": "Catégorie",
    "title": "Travaillez avec les fuseaux horaires et les vérifications des heures de bureau locales.",
    "intro": "Les points de terminaison horaires vous offrent une petite couche utilitaire de fuseau horaire sans intégrer une plate-forme de planification complète dans votre application.",
    "summaryCards": [
      {
        "label": "Itinéraires",
        "value": "3 GET"
      },
      {
        "label": "Zone par défaut",
        "value": "Afrique/Luanda"
      },
      {
        "label": "Fenêtre d'affaires",
        "value": "08h00 à 17h00"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Itinéraires dans cette famille",
        "table": {
          "columns": [
            "Itinéraire",
            "Objectif",
            "Requête clé"
          ],
          "rows": [
            [
              "/api/v1/time/now",
              "Renvoie l'heure actuelle pour un fuseau horaire.",
              "fuseau horaire"
            ],
            [
              "/api/v1/time/convert",
              "Convertissez une date/heure d’un fuseau horaire à un autre.",
              "datetime, from, to"
            ],
            [
              "/api/v1/time/business-hours",
              "Vérifiez si une date/heure tombe pendant les heures de bureau.",
              "datetime, timezone, start, end"
            ]
          ]
        }
      },
      {
        "id": "time-now-route",
        "title": "GET /api/v1/time/now",
        "description": "À utiliser maintenant lorsque vous avez besoin de l'heure locale actuelle pour un fuseau horaire IANA spécifique.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "fuseau horaire",
              "Non",
              "Fuseau horaire de l'IANA. La valeur par défaut est `Africa/Luanda`."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/time/now?timezone=Africa/Luanda\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/time/now?timezone=Africa/Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"iso\": \"2026-03-23T18:45:00\",\n  \"timezone\": \"Africa/Luanda\",\n  \"offset\": \"GMT+1\",\n  \"components\": {\n    \"year\": 2026,\n    \"month\": 3,\n    \"day\": 23,\n    \"hour\": 18,\n    \"minute\": 45,\n    \"second\": 0,\n    \"weekday\": 1\n  }\n}"
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_TIMEZONE\",\n    \"message\": \"The supplied timezone is not supported by the runtime.\",\n    \"field\": \"timezone\",\n    \"value\": \"Mars/Base\"\n  }\n}"
          }
        ]
      },
      {
        "id": "time-convert-route",
        "title": "GET /api/v1/time/convert",
        "description": "Utilisez convert pour transformer une date/heure locale ou absolue d’un fuseau horaire à un autre.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "dateheure",
              "Oui",
              "Date-heure ISO. Si aucun décalage n'est fourni, la route l'interprète dans le fuseau horaire source."
            ],
            [
              "de",
              "Oui",
              "Source Fuseau horaire IANA."
            ],
            [
              "à",
              "Oui",
              "Ciblez le fuseau horaire de l’IANA."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/time/convert?datetime=2026-03-23T10:00:00&from=Africa/Luanda&to=UTC\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/time/convert?datetime=2026-03-23T10:00:00&from=Africa/Luanda&to=UTC\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"input\": {\n    \"datetime\": \"2026-03-23T10:00:00\",\n    \"timezone\": \"Africa/Luanda\"\n  },\n  \"source\": {\n    \"iso\": \"2026-03-23T10:00:00\",\n    \"timezone\": \"Africa/Luanda\"\n  },\n  \"target\": {\n    \"iso\": \"2026-03-23T09:00:00\",\n    \"timezone\": \"UTC\"\n  }\n}"
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_DATETIME\",\n    \"message\": \"Date-times without an offset must use YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss format.\",\n    \"field\": \"datetime\",\n    \"value\": \"23/03/2026 10:00\"\n  }\n}"
          }
        ]
      },
      {
        "id": "time-business-hours-route",
        "title": "GET /api/v1/time/business-hours",
        "description": "Utilisez les heures de bureau avant d'envoyer des notifications, des appels ou des rappels qui doivent respecter une fenêtre de bureau local.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "dateheure",
              "Oui",
              "Date/heure ISO à évaluer."
            ],
            [
              "fuseau horaire",
              "Non",
              "Fuseau horaire de l'IANA. La valeur par défaut est `Africa/Luanda`."
            ],
            [
              "commencer",
              "Non",
              "Heure de début du jour ouvrable dans `HH:mm`. La valeur par défaut est `08:00`."
            ],
            [
              "fin",
              "Non",
              "Heure de fin du jour ouvrable dans `HH:mm`. La valeur par défaut est `17:00`."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s \"https://orb3x-utils-api.vercel.app/api/v1/time/business-hours?datetime=2026-03-23T09:30:00&timezone=Africa/Luanda\""
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "async function main() {\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/time/business-hours?datetime=2026-03-23T09:30:00&timezone=Africa/Luanda\");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const data = await response.json();\n  console.log(\"Response\", data);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "json",
            "content": "{\n  \"timezone\": \"Africa/Luanda\",\n  \"businessHours\": {\n    \"start\": \"08:00\",\n    \"end\": \"17:00\",\n    \"timezone\": \"Africa/Luanda\"\n  },\n  \"isBusinessDay\": true,\n  \"isWithinBusinessHours\": true\n}"
          },
          {
            "label": "Réponse à l'erreur",
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
    "label": "Documents",
    "description": "Générez des PDF de factures, de reçus et de contrats à partir des charges utiles JSON.",
    "eyebrow": "Catégorie",
    "title": "Générez des PDF de transactions et de contrats à la demande.",
    "intro": "Les routes de documents convertissent les charges utiles compactes JSON en fichiers PDF synchrones qui peuvent être téléchargés directement ou stockés par votre propre application.",
    "summaryCards": [
      {
        "label": "Itinéraires",
        "value": "3 POST"
      },
      {
        "label": "Formater",
        "value": "PDF pièces jointes"
      },
      {
        "label": "Idéal pour",
        "value": "Flux de travail internes"
      }
    ],
    "sections": [
      {
        "id": "catalog",
        "title": "Itinéraires dans cette famille",
        "table": {
          "columns": [
            "Itinéraire",
            "Objectif",
            "Champs du corps clé"
          ],
          "rows": [
            [
              "/api/v1/documents/invoice",
              "Générez une facture PDF.",
              "seller, buyer, items"
            ],
            [
              "/api/v1/documents/receipt",
              "Générez un reçu PDF.",
              "receivedFrom, amount"
            ],
            [
              "/api/v1/documents/contract",
              "Générez un contrat PDF.",
              "parties, clauses"
            ]
          ]
        }
      },
      {
        "id": "documents-invoice-route",
        "title": "POST /api/v1/documents/invoice",
        "description": "Utilisez la facture lorsque vous avez besoin d’une facture PDF synchrone à partir d’une charge utile JSON compacte.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "vendeur",
              "Oui",
              "Objet du vendeur avec au moins `name`."
            ],
            [
              "acheteur",
              "Oui",
              "Objet de l'acheteur avec au moins `name`."
            ],
            [
              "articles",
              "Oui",
              "Tableau d'éléments avec `description`, `quantity`, `unitPrice` et `vatRate` en option."
            ],
            [
              "numéro de facture / date d'émission / date d'échéance / notes",
              "Non",
              "Champs de métadonnées de facture facultatifs."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/invoice \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"seller\":{\"name\":\"Orb3x, Lda\"},\"buyer\":{\"name\":\"Cliente Exemplo\"},\"items\":[{\"description\":\"Service\",\"quantity\":1,\"unitPrice\":100000,\"vatRate\":14}]}' \\\n  --output invoice.pdf"
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "import { writeFile } from \"node:fs/promises\";\n\nasync function main() {\n  const payload = {\n    \"seller\": {\n      \"name\": \"Orb3x, Lda\"\n    },\n    \"buyer\": {\n      \"name\": \"Cliente Exemplo\"\n    },\n    \"items\": [\n      {\n        \"description\": \"Service\",\n        \"quantity\": 1,\n        \"unitPrice\": 100000,\n        \"vatRate\": 14\n      }\n    ]\n  };\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/invoice\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload)\n  });\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const fileBuffer = Buffer.from(await response.arrayBuffer());\n  await writeFile(\"invoice.pdf\", fileBuffer);\n  console.log(\"Saved invoice.pdf\");\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "bash",
            "content": "HTTP/1.1 200 OK\nContent-Type: application/pdf\nContent-Disposition: attachment; filename=\"invoice.pdf\""
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_INVOICE_PAYLOAD\",\n    \"message\": \"Invoice payload must include seller, buyer, and at least one item.\"\n  }\n}"
          }
        ]
      },
      {
        "id": "documents-receipt-route",
        "title": "POST /api/v1/documents/receipt",
        "description": "Utilisez le reçu pour les accusés de réception qui ne nécessitent que le payeur et le montant.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "reçuDe",
              "Oui",
              "Objet de fête avec au moins `name`."
            ],
            [
              "montant",
              "Oui",
              "Montant reçu."
            ],
            [
              "Numéro de reçu / Date d'émission / Raison / Méthode de paiement / Notes",
              "Non",
              "Champs de métadonnées de reçu facultatifs."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/receipt \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"receivedFrom\":{\"name\":\"Cliente Exemplo\"},\"amount\":100000}' \\\n  --output receipt.pdf"
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "import { writeFile } from \"node:fs/promises\";\n\nasync function main() {\n  const payload = {\n    \"receivedFrom\": {\n      \"name\": \"Cliente Exemplo\"\n    },\n    \"amount\": 100000\n  };\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/receipt\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload)\n  });\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const fileBuffer = Buffer.from(await response.arrayBuffer());\n  await writeFile(\"receipt.pdf\", fileBuffer);\n  console.log(\"Saved receipt.pdf\");\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "bash",
            "content": "HTTP/1.1 200 OK\nContent-Type: application/pdf\nContent-Disposition: attachment; filename=\"receipt.pdf\""
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_RECEIPT_PAYLOAD\",\n    \"message\": \"Receipt payload must include receivedFrom and amount.\"\n  }\n}"
          }
        ]
      },
      {
        "id": "documents-contract-route",
        "title": "POST /api/v1/documents/contract",
        "description": "Utilisez le contrat lorsque vous avez besoin d'un accord de base PDF généré à partir de parties et de clauses.",
        "table": {
          "columns": [
            "Paramètre",
            "Obligatoire",
            "Descriptif"
          ],
          "rows": [
            [
              "fêtes",
              "Oui",
              "Tableau avec au moins deux objets de fête."
            ],
            [
              "clauses",
              "Oui",
              "Tableau de clauses contractuelles."
            ],
            [
              "titre / numéro de contrat / date d'émission / notes",
              "Non",
              "Champs de métadonnées du contrat facultatifs."
            ]
          ]
        },
        "codes": [
          {
            "label": "Utilisation de cURL",
            "language": "bash",
            "content": "curl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/contract \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"parties\":[{\"name\":\"Orb3x, Lda\"},{\"name\":\"Cliente Exemplo\"}],\"clauses\":[\"The provider delivers the service.\",\"The client pays within 15 days.\"]}' \\\n  --output contract.pdf"
          },
          {
            "label": "Utilisation de Node.js",
            "language": "js",
            "content": "import { writeFile } from \"node:fs/promises\";\n\nasync function main() {\n  const payload = {\n    \"parties\": [\n      {\n        \"name\": \"Orb3x, Lda\"\n      },\n      {\n        \"name\": \"Cliente Exemplo\"\n      }\n    ],\n    \"clauses\": [\n      \"The provider delivers the service.\",\n      \"The client pays within 15 days.\"\n    ]\n  };\n  const response = await fetch(\"https://orb3x-utils-api.vercel.app/api/v1/documents/contract\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload)\n  });\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const fileBuffer = Buffer.from(await response.arrayBuffer());\n  await writeFile(\"contract.pdf\", fileBuffer);\n  console.log(\"Saved contract.pdf\");\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          },
          {
            "label": "200 réponse",
            "language": "bash",
            "content": "HTTP/1.1 200 OK\nContent-Type: application/pdf\nContent-Disposition: attachment; filename=\"contract.pdf\""
          },
          {
            "label": "Réponse à l'erreur",
            "language": "json",
            "content": "{\n  \"error\": {\n    \"code\": \"INVALID_CONTRACT_PAYLOAD\",\n    \"message\": \"Contract payload must include at least two parties and one clause.\"\n  }\n}"
          }
        ],
        "note": "La génération de documents est intentionnellement étroite. Conservez vous-même la source JSON si vous avez besoin d'auditabilité ou de régénération."
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
    "label": "NIF Vérification",
    "description": "Comportement de recherche, champs de charge utile et modes d'échec pour la vérification des contribuables.",
    "eyebrow": "Point de terminaison",
    "title": "Recherchez les détails du contribuable à partir d’une valeur NIF normalisée.",
    "intro": "La route NIF accepte un identifiant fiscal angolais dans le chemin, le valide, demande des données au portail fiscal public et renvoie une réponse JSON analysée.",
    "endpoint": {
      "method": "GET",
      "path": "/api/nif/{nif}",
      "detail": "Le paramètre path est tronqué, mis en majuscule et limité aux lettres et aux chiffres avant la tentative de recherche."
    },
    "summaryCards": [
      {
        "label": "Type d'entrée",
        "value": "Paramètre de chemin"
      },
      {
        "label": "Origine amont",
        "value": "Portail fiscal angolais"
      },
      {
        "label": "Échec primaire",
        "value": "Disponibilité du portail"
      }
    ],
    "sections": [
      {
        "id": "success-shape",
        "title": "Charge utile de réussite",
        "code": {
          "label": "200 réponse",
          "language": "json",
          "content": "{\n  \"NIF\": \"004813023LA040\",\n  \"Name\": \"EMPRESA EXEMPLO, LDA\",\n  \"Type\": \"Pessoa Colectiva\",\n  \"Status\": \"Activo\",\n  \"Defaulting\": \"Não\",\n  \"VATRegime\": \"Regime Geral\",\n  \"isTaxResident\": true\n}"
        }
      },
      {
        "id": "field-glossary",
        "title": "Champs renvoyés",
        "table": {
          "columns": [
            "Champ",
            "Signification"
          ],
          "rows": [
            [
              "NIF",
              "Identifiant normalisé utilisé pour la recherche et repris dans la réponse."
            ],
            [
              "Nom",
              "Nom du contribuable enregistré analysé à partir de la réponse du portail."
            ],
            [
              "Tapez",
              "Classification des contribuables renvoyée par le portail source."
            ],
            [
              "Statut",
              "Chaîne de statut de contribuable actuel."
            ],
            [
              "Par défaut",
              "Si le contribuable est signalé comme étant en défaut."
            ],
            [
              "Régime TVA",
              "Texte du régime VAT renvoyé par le portail."
            ],
            [
              "isTaxResident",
              "Booléen dérivé du marqueur résident ou non-résident dans la section résultat."
            ]
          ]
        }
      },
      {
        "id": "error-cases",
        "title": "Qu'est-ce qui peut mal se passer",
        "bullets": [
          "Un paramètre de chemin vide ou non valide renvoie une erreur 400 INVALID_NIF avant tout appel en amont.",
          "Si le portail fiscal ne rapporte aucun résultat, la route renvoie une réponse 404 NIF_NOT_FOUND.",
          "Un code HTML mal formé ou structurellement modifié à partir du portail renvoie une erreur 502 UNPARSEABLE_RESPONSE.",
          "Les problèmes de réseau et de TLS apparaissent comme des erreurs de disponibilité en amont, avec une solution de secours interne pour les cas extrêmes de certificat."
        ],
        "note": "Étant donné que la source en amont est HTML, les modifications de schéma sur le portail représentent le plus grand risque de maintenance à long terme. Gardez un test de contrat autour de l'analyseur."
      },
      {
        "id": "integration-tips",
        "title": "Conseils d'intégration",
        "bullets": [
          "Normalisez les espaces et la casse dans les identifiants saisis par l'utilisateur avant de créer le chemin d'itinéraire.",
          "Traitez ce point de terminaison comme une vérification en direct plutôt que comme une source d'enregistrement permanente ; les données du portail peuvent changer avec le temps.",
          "Stockez le résultat brut de la recherche avec votre propre contexte d'audit lorsque le résultat éclaire les actions de conformité.",
          "Affichez des messages utilisateur clairs lorsque le portail est temporairement indisponible au lieu de transformer les échecs en amont en erreurs de validation génériques."
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
    "label": "Traduction",
    "description": "Demandez des règles corporelles, la gestion du langage et des conseils pratiques d’intégration.",
    "eyebrow": "Point de terminaison",
    "title": "Traduisez du texte avec une validation explicite et des rapports dans la langue source.",
    "intro": "La route de traduction accepte l'entrée JSON, valide les codes de langue, appelle le point de terminaison de traduction public de Google et renvoie le texte traduit avec la langue source détectée ou fournie.",
    "endpoint": {
      "method": "POST",
      "path": "/api/translate",
      "detail": "Envoyez JSON avec le texte, le code de la langue cible et un code de langue source facultatif. Si la source est omise, l'itinéraire utilise la détection automatique."
    },
    "summaryCards": [
      {
        "label": "Type d'entrée",
        "value": "corps JSON"
      },
      {
        "label": "Validation de la cible",
        "value": "2 à 12 caractères"
      },
      {
        "label": "Détection automatique",
        "value": "Activé par défaut"
      }
    ],
    "sections": [
      {
        "id": "request-shape",
        "title": "Demander une charge utile",
        "code": {
          "label": "corps POST",
          "language": "json",
          "content": "{\n  \"text\": \"Olá mundo\",\n  \"to\": \"en\",\n  \"from\": \"pt\"\n}"
        },
        "bullets": [
          "le texte est requis et coupé avant l’expédition.",
          "to est obligatoire et doit correspondre à un simple modèle de code de langue en minuscules.",
          "from est facultatif ; en cas d'absence, la route utilise la détection automatique en amont.",
          "Un JSON non valide renvoie une réponse 400 avant le début de tout travail de traduction."
        ]
      },
      {
        "id": "success-shape",
        "title": "Charge utile de réussite",
        "code": {
          "label": "200 réponse",
          "language": "json",
          "content": "{\n  \"translatedText\": \"Hello world\",\n  \"sourceLanguage\": \"pt\",\n  \"targetLanguage\": \"en\",\n  \"status\": true,\n  \"message\": \"\"\n}"
        }
      },
      {
        "id": "failure-modes",
        "title": "Modes de défaillance courants",
        "table": {
          "columns": [
            "Coder",
            "Parce que",
            "Manipulation suggérée"
          ],
          "rows": [
            [
              "INVALID_TEXT",
              "Le champ de texte est manquant ou vide.",
              "Bloquez la soumission et invitez l'utilisateur à fournir du contenu."
            ],
            [
              "INVALID_LANGUAGE",
              "Le code de la langue source ou cible est manquant ou mal formé.",
              "Corrigez la charge utile avant de réessayer."
            ],
            [
              "UPSTREAM_TIMEOUT",
              "Le fournisseur de traduction a dépassé le délai d'expiration.",
              "Réessayez avec une interruption si le flux utilisateur le permet."
            ],
            [
              "UPSTREAM_BAD_RESPONSE",
              "Le fournisseur a renvoyé une réponse non 200.",
              "Dégradez gracieusement ou faites la queue pour réessayer."
            ],
            [
              "UNPARSEABLE_RESPONSE",
              "Le fournisseur JSON n'a pas pu être analysé dans le texte traduit.",
              "Alertez et revenez au texte original."
            ]
          ]
        }
      },
      {
        "id": "best-practices",
        "title": "Notes d'utilisation",
        "bullets": [
          "Conservez le texte original dans votre propre modèle de données afin que les éditeurs puissent comparer la source et la copie traduite ultérieurement.",
          "Mettez en cache vos propres traductions réussies lorsque la réutilisation est acceptable ; la route elle-même ne met pas intentionnellement en cache les réponses.",
          "Préférez les codes de langue source explicites dans les workflows batch où vous connaissez déjà la langue d’entrée.",
          "Utilisez sourceLanguage de la réponse pour signaler les résultats de détection inattendus dans les outils de modération ou d'assistance."
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
    "label": "Change de devises",
    "description": "Recherches de taux de base, conversions de montants et sémantique de charge utile pour les données FX.",
    "eyebrow": "Point de terminaison",
    "title": "Renvoie les taux unitaires ou les totaux convertis à partir du même point de terminaison.",
    "intro": "La route des devises recherche les métadonnées et les tableaux de taux pour une devise de base, puis multiplie éventuellement ces taux par un paramètre de requête de montant.",
    "endpoint": {
      "method": "GET",
      "path": "/api/exchange/{base}",
      "detail": "Le paramètre path identifie la devise de base. Ajoutez ?amount=value lorsque vous souhaitez également convertedRates précalculé dans la réponse."
    },
    "summaryCards": [
      {
        "label": "Type d'entrée",
        "value": "Chemin + requête"
      },
      {
        "label": "Sortie étendue",
        "value": "convertedRates"
      },
      {
        "label": "Risque principal",
        "value": "Fraîcheur en amont"
      }
    ],
    "sections": [
      {
        "id": "lookup-shape",
        "title": "Charge utile de réussite sans montant",
        "code": {
          "label": "Recherche de taux unitaire",
          "language": "json",
          "content": "{\n  \"currencyCode\": \"aoa\",\n  \"currencyName\": \"Angolan kwanza\",\n  \"currencySymbol\": \"Kz\",\n  \"countryName\": \"Angola\",\n  \"countryCode\": \"AO\",\n  \"flagImage\": \"https://example.com/flags/ao.png\",\n  \"ratesDate\": \"2026-03-22\",\n  \"baseCurrency\": \"AOA\",\n  \"unitRates\": {\n    \"usd\": 0.0011,\n    \"eur\": 0.0010\n  }\n}"
        }
      },
      {
        "id": "conversion-shape",
        "title": "Charge utile de réussite avec montant",
        "code": {
          "label": "Recherche avec conversion",
          "language": "json",
          "content": "{\n  \"baseCurrency\": \"AOA\",\n  \"amount\": 1000000,\n  \"unitRates\": {\n    \"usd\": 0.0011\n  },\n  \"convertedRates\": {\n    \"usd\": 1100\n  }\n}"
        },
        "bullets": [
          "le montant est analysé comme un nombre et doit être nul ou supérieur.",
          "convertedRates reflète les clés de unitRates et multiplie chaque valeur par le montant.",
          "baseCurrency est normalisée en majuscules dans la réponse même si la route accepte les entrées en minuscules."
        ]
      },
      {
        "id": "metadata",
        "title": "Champs de métadonnées",
        "table": {
          "columns": [
            "Champ",
            "Signification"
          ],
          "rows": [
            [
              "codemonnaie",
              "Code de devise de base normalisé issu de la réponse en amont."
            ],
            [
              "nom de la devise",
              "Nom d’affichage de la devise de base."
            ],
            [
              "monnaieSymbole",
              "Symbole associé à la devise de base."
            ],
            [
              "Nom du pays / Code du pays",
              "Métadonnées du pays liées à la devise de base."
            ],
            [
              "drapeauImage",
              "Indicateur de l'actif URL renvoyé par le fournisseur en amont."
            ],
            [
              "ratesDate",
              "Date attachée à l’instantané du débit en amont."
            ]
          ]
        }
      },
      {
        "id": "implementation-guidance",
        "title": "Conseils de mise en œuvre",
        "bullets": [
          "Utilisez unitRates lorsque vous avez besoin d'un contrôle total sur le formatage, les arrondis ou les calculs commerciaux en aval.",
          "Utilisez convertedRates lorsque le point de terminaison alimente directement l’interface utilisateur et que vous souhaitez éviter les calculs en double entre les clients.",
          "Protégez-vous contre les devises manquantes dans votre interface utilisateur, car le fournisseur en amont peut ne pas inclure tous les codes dans chaque instantané.",
          "Si vous conservez les totaux convertis, conservez également le ratesDate afin que les rapports restent auditables."
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
    "label": "Exemples",
    "description": "Exemples pratiques de cURL, Node.js et TypeScript pour une utilisation en production.",
    "eyebrow": "Mise en œuvre",
    "title": "Exemples d'appel des itinéraires publiés.",
    "intro": "Les extraits ci-dessous montrent les requêtes cURL, correspondant aux appels de récupération Node.js et un assistant typé TypeScript pour les routes publiées dans ce référentiel.",
    "summaryCards": [
      {
        "label": "Formats",
        "value": "cURL + Node.js"
      },
      {
        "label": "Orientation client",
        "value": "Récupération sécurisée du serveur"
      },
      {
        "label": "Stratégie d'erreur",
        "value": "Gestion sensible au code"
      }
    ],
    "sections": [
      {
        "id": "curl",
        "title": "Exemples cURL et Node.js",
        "codes": [
          {
            "label": "Tests de fumée des terminaux (cURL)",
            "language": "bash",
            "content": "curl -s https://orb3x-utils-api.vercel.app/api/nif/004813023LA040\n\ncurl -s -X POST https://orb3x-utils-api.vercel.app/api/translate \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"text\":\"Preciso de ajuda\",\"to\":\"en\"}'\n\ncurl -s \"https://orb3x-utils-api.vercel.app/api/exchange/aoa?amount=250000\""
          },
          {
            "label": "Tests de fumée des terminaux (Node.js)",
            "language": "js",
            "content": "async function main() {\n  const response1 = await fetch(\"https://orb3x-utils-api.vercel.app/api/nif/004813023LA040\");\n  if (!response1.ok) {\n    throw new Error(`Request failed with status ${response1.status}`);\n  }\n  const data1 = await response1.json();\n  console.log(\"Example 1\", data1);\n\n  const payload2 = {\n    \"text\": \"Preciso de ajuda\",\n    \"to\": \"en\"\n  };\n  const response2 = await fetch(\"https://orb3x-utils-api.vercel.app/api/translate\", {\n    method: \"POST\",\n    headers: {\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify(payload2)\n  });\n  if (!response2.ok) {\n    throw new Error(`Request failed with status ${response2.status}`);\n  }\n  const data2 = await response2.json();\n  console.log(\"Example 2\", data2);\n\n  const response3 = await fetch(\"https://orb3x-utils-api.vercel.app/api/exchange/aoa?amount=250000\");\n  if (!response3.ok) {\n    throw new Error(`Request failed with status ${response3.status}`);\n  }\n  const data3 = await response3.json();\n  console.log(\"Example 3\", data3);\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});"
          }
        ]
      },
      {
        "id": "typescript",
        "title": "Assistant TypeScript tapé",
        "code": {
          "label": "Utilitaire client partagé",
          "language": "ts",
          "content": "type ApiError = {\n  error?: {\n    code?: string;\n    message?: string;\n  };\n  code?: string;\n  message?: string;\n};\n\nexport async function callApi\u003cT>(input: RequestInfo, init?: RequestInit): Promise\u003cT> {\n  const response = await fetch(input, init);\n\n  if (!response.ok) {\n    const error = (await response.json().catch(() => ({}))) as ApiError;\n    throw new Error(error.error?.code ?? error.code ?? \"REQUEST_FAILED\");\n  }\n\n  return (await response.json()) as T;\n}"
        }
      },
      {
        "id": "workflow-patterns",
        "title": "Modèles de flux de travail",
        "bullets": [
          "Intégration des clients : vérifiez le dossier du contribuable avant d'activer un compte dans votre flux back-office.",
          "Pipeline de localisation : traduisez le contenu destiné aux utilisateurs et stockez à la fois le texte traduit et la langue source détectée.",
          "Tableau de bord des tarifs : demandez les tarifs de base une fois, puis utilisez unitRates ou convertedRates en fonction du degré de contrôle dont l'interface utilisateur a besoin.",
          "Outils de support : signalez les codes d'erreur en amont aux agents internes afin qu'ils puissent distinguer rapidement les mauvaises entrées des pannes du fournisseur."
        ]
      },
      {
        "id": "production-hardening",
        "title": "Durcissement de production",
        "bullets": [
          "Enveloppez les appels dans un client partagé avec des formes de réussite et d’erreur saisies.",
          "Émettez séparément des métriques pour le délai d'attente, les mauvaises réponses, les taux d'entrée non trouvés et les taux d'entrée non valides.",
          "Gardez la logique de nouvelle tentative proche des limites du client afin que le code produit ne la réimplémente pas par fonctionnalité.",
          "Enregistrez ratesDate et sourceLanguage lorsque ces champs sont importants pour l'auditabilité ou la révision éditoriale."
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
