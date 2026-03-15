# AuditFlow.ai

AuditFlow.ai est un outil d'audit de sites web utilisant l'IA pour analyser la conception, le contenu, la performance, le SEO, l'accessibilité et la sécurité.

## Configuration

Pour augmenter les limites de l'API PageSpeed Insights (et éviter l'erreur `QUOTA_EXCEEDED`), vous devez configurer une clé API Google Cloud :

1.  Allez sur la [Google Cloud Console](https://console.cloud.google.com/).
2.  Créez ou sélectionnez un projet.
3.  Activez l'API **PageSpeed Insights**.
4.  Créez une **Clé API** (API Key).
5.  Copiez la clé.
6.  Créez un fichier `.env` à la racine du projet (basé sur `.env.example`) et ajoutez votre clé :
    `VITE_PAGESPEED_API_KEY=votre_cle_api_ici`
