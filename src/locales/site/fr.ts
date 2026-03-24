import { frDocsPages } from './docs/fr';
import type { PartialSiteCopy } from './types';

export const frSiteCopy: PartialSiteCopy = {
  "languageName": "Français",
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
    "title": "ORB3X Utils API - Vérification fiscale, conversion et conversion de devises",
    "description": "Documentation pour les itinéraires ORB3X Utils API couvrant la validation, la géo, la finance, la paie, les documents et les anciens utilitaires en amont axés sur l'Angola.",
    "keywords": [
      "API",
      "vérification fiscale",
      "traduction",
      "change de devises",
      "NIF",
      "outils de développement",
      "Angola",
      "taux de change"
    ],
    "openGraphTitle": "ORB3X Utilitaires API",
    "openGraphDescription": "Documentation pour la validation, la géo, la finance, la paie, les documents et les anciennes routes en amont axées sur l'Angola."
  },
  "brand": {
    "homeAriaLabel": "ORB3X Utilitaires API Accueil",
    "companyWebsiteAriaLabel": "Ouvrez le site Web de l'entreprise ORB3X"
  },
  "header": {
    "themeToDark": "Passer en mode sombre",
    "themeToLight": "Passer en mode lumière",
    "language": "Language",
    "openMenu": "Ouvrir le menu",
    "closeMenu": "Fermer le menu",
    "navigation": "Navigation"
  },
  "navigation": {
    "docs": "Documents",
    "apiReference": "API Référence",
    "examples": "Exemples",
    "faq": "FAQ",
    "privacy": "Confidentialité"
  },
  "footer": {
    "description": "Pages de documentation et de référence pour les familles de routes ORB3X Utils API axées sur l'Angola.",
    "companyLabel": "Entreprise",
    "companyDescription": "ORB3X Utilitaires API est géré par ORB3X. Visitez le site Web principal de l’entreprise pour connaître la présence plus large du produit et de l’institution.",
    "companyWebsite": "Visitez orb3x.com",
    "explore": "Explorer",
    "documentation": "Documentation",
    "policies": "Politiques",
    "privacy": "Politique de confidentialité",
    "terms": "Conditions d'utilisation",
    "faq": "FAQ",
    "copyright": "© 2026 ORB3X Utilitaires API. Tous droits réservés.",
    "tagline": "Documentation de validation, de géolocalisation, de finances, de salaire, de documents et d'utilitaires hérités API."
  },
  "routes": {
    "nif": {
      "title": "Vérification NIF",
      "description": "Validez et normalisez les détails des contribuables angolais depuis le portail public officiel avec une seule demande GET."
    },
    "translation": {
      "title": "Traduction de texte",
      "description": "Traduisez le texte de l'application, les messages des clients ou le contenu d'assistance avec une gestion explicite des langues source et cible."
    },
    "exchange": {
      "title": "Bureau de change",
      "description": "Recherchez les taux de change de base ou précalculez les montants convertis à partir de la même enveloppe de réponse."
    }
  },
  "home": {
    "eyebrow": "ORB3X Utilitaires API",
    "title": "API pour la validation, la géolocalisation, les finances, les salaires, les documents et les utilitaires de base de l'Angola.",
    "description": "Utilisez la documentation pour vérifier les formats de requête, les charges utiles de réponse, les calculateurs et le comportement en amont sur la surface ORB3X Utils API actuelle.",
    "primaryCta": "Commencez par les documents",
    "secondaryCta": "Voir des exemples",
    "quickRequestLabel": "Exemple de demande rapide (cURL)",
    "quickRequestNodeLabel": "Exemple de demande rapide (Node.js)",
    "stats": [
      {
        "label": "Itinéraires publiés",
        "value": "28"
      },
      {
        "label": "Format de réponse",
        "value": "JSON"
      },
      {
        "label": "Politique de cache",
        "value": "no-store"
      }
    ],
    "notes": [
      {
        "title": "Gestion des réponses partagées",
        "description": "La plupart des routes renvoient JSON et exposent suffisamment de détails sur les erreurs pour séparer les entrées non valides des échecs en amont ou des problèmes de calcul basés sur des hypothèses."
      },
      {
        "title": "Données en amont en direct",
        "description": "La plate-forme mélange des points de terminaison de données locales déterministes avec quelques routes sauvegardées en amont, mais toutes les réponses restent no-store pour préserver la fraîcheur."
      },
      {
        "title": "Documentation au niveau de l'itinéraire",
        "description": "Chaque famille de routes dispose d'une page dédiée couvrant la forme de la demande, la charge utile de la réponse, les hypothèses et les cas d'échec courants."
      }
    ],
    "ownershipLabel": "Maintenu par ORB3X",
    "ownershipDescription": "ORB3X Utils API fait partie de la plate-forme plus large ORB3X. Le site Web de l’entreprise institutionnelle se trouve sur orb3x.com.",
    "ownershipCta": "Ouvrez orb3x.com",
    "docs": {
      "eyebrow": "Documentation",
      "title": "Écrit comme des pages de référence, pas comme une copie marketing.",
      "description": "La section Documents couvre le comportement partagé, les charges utiles spécifiques à l'itinéraire et des exemples pour chaque point de terminaison. Utilisez-le comme point d’entrée principal pour le travail de mise en œuvre.",
      "bullets": [
        "Commencez par la présentation de l'itinéraire pour comprendre les codes d'état partagés et les règles de mise en cache.",
        "Utilisez les pages dédiées aux points de terminaison pour les champs de demande, les exemples de réponse et les notes d'intégration.",
        "Gardez la page d'exemples ouverte pendant le câblage des aides à la récupération ou des tests de fumée."
      ],
      "tableLabel": "Page de documentation",
      "tableType": "Tapez",
      "tableTypeValue": "Documents",
      "open": "Ouvert"
    }
  },
  "docsOverview": {
    "navLabel": "Aperçu",
    "navDescription": "Index de la documentation, conventions et feuille de route.",
    "eyebrow": "Documentation",
    "title": "Pages de référence pour les familles de routes publiées.",
    "description": "Utilisez ces pages pour vérifier les entrées, les sorties, les codes de statut, les hypothèses et les exemples dans les domaines de la validation, de la situation géographique, des finances, des salaires, du temps, des documents et des anciens points de terminaison en amont.",
    "primaryCta": "Ouvrir pour commencer",
    "secondaryCta": "Exemples ouverts",
    "stats": [
      {
        "label": "Pages de documentation",
        "value": "14"
      },
      {
        "label": "Itinéraires publiés",
        "value": "28"
      },
      {
        "label": "Format de réponse",
        "value": "JSON"
      }
    ],
    "startHereTitle": "Commencez ici",
    "startHereDescription": "Les pages ci-dessous couvrent d'abord les règles partagées, puis les détails de la demande et de la réponse pour chaque itinéraire.",
    "routesTitle": "Itinéraires",
    "routesDescription": "Chaque itinéraire publié dispose d'une page dédiée avec des exemples de requêtes et des cas d'échec.",
    "sharedBehaviorTitle": "Comportement partagé",
    "sharedBehaviorDescription": "Ces règles s'appliquent à tous les points de terminaison publiés et constituent les principaux éléments à prendre en compte dans un client partagé.",
    "sharedBehaviorColumns": [
      "Préoccupation",
      "Comportement"
    ],
    "quickstartTitle": "Démarrage rapide",
    "quickstartDescription": "Exécutez une requête par route avant de connecter les points de terminaison au code de l’application.",
    "quickstartLabel": "Séquence de test de fumée (cURL)",
    "quickstartNodeLabel": "Séquence de test de fumée (Node.js)",
    "sharedBehaviorRows": [
      [
        "Corps de la demande",
        "La plupart des routes sont des points de terminaison GET basés sur des requêtes. Les routes de documents et `/api/translate` attendent des corps JSON."
      ],
      [
        "Fraîcheur des réponses",
        "Chaque route envoie Cache-Control: no-store. Certains points de terminaison sont déterministes, tandis que d'autres dépendent de services en amont en direct."
      ],
      [
        "Gestion des erreurs",
        "Vérifiez l'état HTTP et le champ de code renvoyé ou la valeur error.code avant de décider de réessayer."
      ],
      [
        "Profil de déploiement",
        "Les gestionnaires s'exécutent sur Node.js et sont marqués comme dynamiques."
      ]
    ],
    "versionLabel": "Version",
    "versionSelectorLabel": "Sélectionnez la version de la documentation",
    "versionCurrent": "v1",
    "versionLatest": "Dernier",
    "versionDescription": "Documentation stable actuelle API pour la surface de route `/api/v1`.",
    "onPageLabel": "Sur cette page",
    "onPageItems": [
      "Commencez ici",
      "Itinéraires",
      "Comportement partagé",
      "Démarrage rapide"
    ],
    "open": "Ouvert"
  },
  "docsDetail": {
    "endpoint": "Point de terminaison",
    "onPage": "Sur cette page",
    "relatedPages": "Pages connexes",
    "open": "Ouvert"
  },
  "faq": {
    "eyebrow": "FAQ",
    "title": "Questions sur les demandes, les formats de réponse et le comportement en amont.",
    "description": "Réponses communes pour les équipes intégrant la surface ORB3X Utils API axée sur l'Angola.",
    "cards": [
      {
        "label": "Format de réponse",
        "value": "JSON"
      },
      {
        "label": "Politique de cache",
        "value": "no-store"
      },
      {
        "label": "Commencez par",
        "value": "Commencer"
      }
    ],
    "groups": [
      {
        "title": "Demandes",
        "items": [
          {
            "question": "Que documente ce site ?",
            "answer": "Le site documente la surface actuelle de ORB3X Utils API, y compris la validation, le téléphone, la géolocalisation, le calendrier, les finances, le salaire, le temps, les documents et l'héritage NIF, la traduction et les itinéraires d'échange."
          },
          {
            "question": "Tous les itinéraires renvoient-ils JSON ?",
            "answer": "La plupart des routes le font, mais les points de terminaison du document renvoient des fichiers PDF en cas de succès. Les réponses d'erreur utilisent toujours JSON."
          },
          {
            "question": "Quels itinéraires attendent un corps de requête ?",
            "answer": "Les points de terminaison du document et `/api/translate` attendent des corps JSON. La plupart des autres routes utilisent des paramètres de requête."
          }
        ]
      },
      {
        "title": "Mise en cache et erreurs",
        "items": [
          {
            "question": "Les réponses sont-elles mises en cache ?",
            "answer": "Non. Les gestionnaires de routes renvoient `Cache-Control: no-store` car les données proviennent de services en amont en direct."
          },
          {
            "question": "Que se passe-t-il lorsqu'un fournisseur en amont expire ?",
            "answer": "L'itinéraire renvoie un code d'erreur lié au délai d'attente afin que votre client puisse décider de réessayer ou d'afficher un état de repli."
          },
          {
            "question": "Comment les nouvelles tentatives doivent-elles être gérées ?",
            "answer": "Réessayez uniquement lorsque la réponse indique un délai d'attente en amont ou un problème de disponibilité en amont. Ne réessayez pas les erreurs de validation."
          }
        ]
      },
      {
        "title": "Comportement de l'itinéraire",
        "items": [
          {
            "question": "Quelle est l'actualité des données NIF ?",
            "answer": "L'itinéraire renvoie tout ce que le portail fiscal public angolais expose au moment de la demande."
          },
          {
            "question": "Quelles langues le parcours de traduction peut-il accepter ?",
            "answer": "Il accepte les codes de langue pris en charge par le point de terminaison de traduction sous-jacent, sous réserve des règles de validation décrites dans la documentation."
          },
          {
            "question": "La route des devises peut-elle renvoyer des totaux convertis ?",
            "answer": "Oui. Ajoutez un paramètre de requête `amount` pour recevoir à la fois `unitRates` et `convertedRates` dans la même réponse."
          }
        ]
      },
      {
        "title": "Utilisation de la sortie",
        "items": [
          {
            "question": "Dois-je stocker les données renvoyées ?",
            "answer": "Cela dépend de vos propres exigences en matière de produits. Si une réponse affecte un audit ou une décision commerciale, stockez-la avec votre propre contexte."
          },
          {
            "question": "Où dois-je regarder en premier lors du débogage ?",
            "answer": "Commencez par la référence API pour les codes d'état partagés, puis passez à la page de routage dédiée pour les détails de demande et de réponse spécifiques au point de terminaison."
          },
          {
            "question": "Quelles pages doivent rester ouvertes lors de l’intégration ?",
            "answer": "La page de démarrage, la référence API et la page d'exemples couvrent la plupart des travaux d'intégration."
          }
        ]
      }
    ],
    "ctaTitle": "Gardez les pages de référence proches lors de l'intégration.",
    "ctaDescription": "Le guide de démarrage couvre d'abord le comportement partagé, puis les pages d'itinéraire couvrent les détails de la demande et de la réponse.",
    "primaryCta": "Ouvrir pour commencer",
    "secondaryCta": "Ouvrir la référence API"
  },
  "legal": {
    "eyebrow": "Juridique",
    "lastUpdated": "Dernière mise à jour",
    "updatedOn": "22 mars 2026",
    "scope": "Portée",
    "appliesTo": "S'applique à",
    "companySite": "Site Internet de l'entreprise",
    "companySiteDescription": "Les informations sur l'éditeur et la société pour ce API sont disponibles sur le site Web officiel de ORB3X.",
    "companySiteCta": "Ouvrez orb3x.com",
    "privacy": {
      "title": "Politique de confidentialité.",
      "description": "Cette page explique quelles catégories d'informations peuvent être traitées lorsque le site ou les routes API sont utilisés.",
      "scopeValue": "Site Web et opérations API",
      "sections": [
        {
          "title": "Informations que nous traitons",
          "paragraphs": [
            "Nous traitons les informations minimales requises pour recevoir les demandes, exploiter le API, protéger le service et résoudre les problèmes. En fonction de l'itinéraire, cela peut inclure des paramètres de chemin, des charges utiles de requête, des métadonnées de réponse et des diagnostics techniques.",
            "Les exemples incluent les identifiants de recherche des contribuables, le texte des demandes de traduction, les codes de devise de base, les horodatages des demandes, la télémétrie liée à l'IP et les journaux d'applications structurés utilisés pour la sécurité et le débogage."
          ],
          "bullets": [
            "Demander du contenu soumis au API",
            "Métadonnées telles que les horodatages, les noms de routes et l'état de la réponse",
            "Signaux de réseau et de périphérique utilisés pour la sécurité, le débogage et le contrôle du débit"
          ]
        },
        {
          "title": "Comment les informations sont utilisées",
          "paragraphs": [
            "Les informations sont utilisées pour exécuter l'action demandée, surveiller la disponibilité, enquêter sur les incidents et améliorer la qualité du service."
          ],
          "bullets": [
            "Renvoie les réponses API",
            "Détecter les abus, les temps d'arrêt et les demandes mal formées",
            "Enquêter sur les demandes d'assistance et reproduire les problèmes signalés",
            "Générez des métriques internes agrégées sur l'utilisation et la fiabilité"
          ]
        },
        {
          "title": "Traitement tiers",
          "paragraphs": [
            "Certains itinéraires dépendent de fournisseurs en amont, notamment des services publics gouvernementaux et des API tierces. Lorsque ces routes sont appelées, les données de demande pertinentes sont envoyées à ces fournisseurs pour compléter la demande.",
            "Ces fournisseurs fonctionnent selon leurs propres conditions et pratiques de confidentialité. Examinez ces dépendances avant d’utiliser le service dans des flux de travail réglementés ou à haute sensibilité."
          ]
        },
        {
          "title": "Rétention et sécurité",
          "paragraphs": [
            "Les journaux opérationnels et les artefacts de support sont conservés uniquement aussi longtemps que raisonnablement nécessaire pour sécuriser le service, enquêter sur les incidents et satisfaire aux obligations légales ou contractuelles.",
            "Nous utilisons des mesures de protection administratives, techniques et organisationnelles adaptées au service, mais aucun système accessible sur Internet ne peut garantir une sécurité absolue."
          ],
          "bullets": [
            "Contrôles d'accès aux systèmes opérationnels",
            "Séparation de l'environnement pour le développement et la production",
            "Procédures de surveillance et de réponse aux incidents"
          ]
        }
      ]
    },
    "terms": {
      "title": "Conditions d'utilisation.",
      "description": "Ces conditions décrivent les conditions générales d'utilisation du site, de la documentation et des itinéraires API publiés.",
      "appliesToValue": "Site Web, documents et itinéraires API",
      "sections": [
        {
          "title": "Acceptation et portée",
          "paragraphs": [
            "En accédant ou en utilisant le site Web ou les itinéraires API, vous acceptez ces conditions ainsi que toutes conditions commerciales écrites supplémentaires pouvant s'appliquer à votre utilisation du service.",
            "Ces conditions couvrent le site Web public, la documentation et les points de terminaison API publiés. Ils ne remplacent pas automatiquement tout accord écrit distinct."
          ]
        },
        {
          "title": "Utilisation autorisée",
          "paragraphs": [
            "Vous pouvez utiliser le service pour évaluer et intégrer des flux de travail légitimes qui sont conformes à la loi applicable et n'interfèrent pas avec la disponibilité ou l'intégrité de la plateforme."
          ],
          "bullets": [
            "Ne tentez pas d'accès non autorisé, de grattage au-delà de l'utilisation prévue ou d'abus des fournisseurs en amont.",
            "N'utilisez pas le service à des fins de sélection illégale, de prise de décision discriminatoire ou d'activité trompeuse.",
            "Ne déformez pas la source ou la fiabilité des données renvoyées aux utilisateurs en aval."
          ]
        },
        {
          "title": "Comportement du service et dépendances en amont",
          "paragraphs": [
            "Le service s'appuie sur des systèmes tiers et publics en amont pour certaines réponses. La disponibilité, la latence et l'exhaustivité des données peuvent donc être affectées par ces dépendances.",
            "Nous pouvons modifier les détails de l'implémentation interne au fil du temps, à condition que le comportement de l'itinéraire publié reste matériellement utilisable pour les intégrations documentées."
          ]
        },
        {
          "title": "Résultat et responsabilité du client",
          "paragraphs": [
            "Vous êtes responsable de la manière dont vous utilisez la sortie renvoyée par le service dans vos propres produits et flux de travail.",
            "Examinez attentivement les actions critiques, en particulier lorsque les données sous-jacentes proviennent de systèmes tiers."
          ]
        }
      ]
    }
  },
  "notFound": {
    "eyebrow": "404",
    "title": "Page introuvable",
    "description": "La page que vous avez demandée n'existe pas. Utilisez l'un des liens ci-dessous pour revenir aux pages de documentation publiées.",
    "primaryCta": "Rentre chez toi",
    "secondaryCta": "Ouvrir des documents",
    "tertiaryCta": "Visitez FAQ"
  },
  "docsPages": frDocsPages
};
