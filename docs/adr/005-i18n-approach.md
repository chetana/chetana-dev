# ADR 005 — Approche i18n custom (composable)

## Statut
Accepté

## Contexte
Le site doit être bilingue FR/EN, comme le site HTML actuel qui utilise un système `data-i18n` avec un objet de traductions JavaScript.

## Décision
Implémenter un composable `useI18n()` custom avec `useState` pour la locale et un dictionnaire de traductions.

## Raisons
- Simple et léger (pas de dépendance externe)
- Réutilise le concept du site actuel (toggle FR/EN)
- `useState` de Nuxt rend la locale réactive et partagée entre composants
- Pas besoin de routing par locale (/fr/..., /en/...) — un seul toggle suffit
- Les données DB sont déjà bilingues (titleFr/titleEn, etc.)

## Alternatives considérées
- **@nuxtjs/i18n** : puissant mais surdimensionné pour 2 langues, ajoute de la complexité (routing, middleware, lazy loading)
- **vue-i18n** : plus bas niveau, nécessite plus de configuration

## Conséquences
- Les traductions sont dans un seul fichier (`composables/useI18n.ts`)
- Chaque composant utilise `const { t, locale } = useI18n()`
- Les données DB (projets, blog, expériences) ont des champs `*Fr` et `*En`
- Le toggle FR/EN est instantané (pas de rechargement de page)
