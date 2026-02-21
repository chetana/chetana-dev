import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { blogPosts } from './schema'
import { eq } from 'drizzle-orm'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const contentFr = `## Introduction

Il y a 52 jours, le 1er janvier 2026, j'ai pris une résolution. Pas une de ces grandes déclarations qu'on oublie mi-février — un truc simple, concret, mesurable : **faire des pompes tous les jours**.

Ce n'est pas la première fois que j'essaye. J'ai toujours fait du sport de manière intermittente. Mais avec le monde de la startup — les deadlines, les sprints, les soirées à debugger en prod — j'ai plusieurs fois perdu la motivation. Trois semaines d'affilée, puis plus rien pendant deux mois. Le schéma classique.

Cette fois, j'ai décidé de traiter le problème comme un développeur : avec du code, des données, et un système qui ne me laisse pas tricher.

## Le problème : la motivation ne suffit pas

La motivation, c'est un pic. Ça monte fort le 1er janvier, et ça redescend doucement vers le 20. Les études en psychologie comportementale le montrent : **la motivation intrinsèque seule ne suffit pas pour maintenir une habitude**. Il faut un système.

Duolingo l'a compris depuis longtemps. Leur mécanique de streak — cette série de jours consécutifs qu'on ne veut surtout pas casser — est un levier psychologique redoutable. Quand tu as 30 jours de streak, rater un jour te coûte émotionnellement bien plus que le simple effort de faire tes pompes.

J'ai décidé de construire le même mécanisme, mais pour mes pompes.

## Version 1 : le composant web

Le tracker est d'abord né dans mon portfolio. Un composant Vue intégré à mon site Nuxt, avec :
- Un **stepper** (+5/-5) pour ajuster le nombre de pompes
- Un **calendrier visuel** : les jours validés sont cochés en or, les jours manqués en rouge
- Un **compteur de streak** bien visible
- Des **statistiques** : total de pompes, nombre de jours, meilleur streak

Le backend est minimal : trois endpoints Nitro (stats, entries, validate) qui tapent dans une table PostgreSQL sur Neon. Pas d'authentification, pas de complexité inutile. Juste moi et mes pompes.

Ça a marché. Les 10 premiers jours, le simple fait de voir le calendrier se remplir m'a motivé. Au jour 20, je ne voulais plus casser la chaîne. Au jour 30, c'était devenu un réflexe.

## Le problème du web sur mobile

Mais au quotidien, ouvrir un navigateur, taper l'URL, attendre le chargement... c'est trop de friction. La plupart du temps, je valide mes pompes le matin au réveil ou le soir avant de dormir. Sur mon téléphone. Et l'expérience web mobile n'est pas assez fluide pour un geste qu'on répète chaque jour.

J'ai donc construit une **application Android native**.

## L'application Android

L'app est écrite en **Kotlin** avec une architecture classique MVVM :
- **Room** pour le cache local — même hors connexion, je vois mes données
- **Retrofit 2** pour la synchronisation avec le backend Nuxt
- **ViewModel + LiveData** pour un UI réactif
- **SwipeRefreshLayout** pour le pull-to-refresh

Mais le vrai game-changer, c'est le **widget**.

### Le widget qui change tout

J'ai ajouté un widget Android qui se place sur l'écran d'accueil. Il affiche le streak actuel et le statut du jour. **Chaque fois que j'allume mon téléphone, je le vois.** Impossible de l'ignorer. Impossible de se dire "je ferai ça plus tard".

Le widget se synchronise en arrière-plan via WorkManager toutes les 30 minutes. Pas besoin d'ouvrir l'app pour voir où j'en suis.

C'est cette combinaison — le streak psychologique + la visibilité permanente du widget — qui a fait tenir l'habitude pendant 52 jours sans interruption.

## L'authentification Google OAuth

Au départ, l'app était un outil personnel. Pas d'auth, pas de notion d'utilisateur. Mais j'ai voulu la rendre partageable — que d'autres personnes puissent l'utiliser avec leurs propres données.

Le choix de l'authentification a été réfléchi. Le client principal est une app Android native. Les sessions/cookies sont pensées pour le web. J'ai opté pour une approche **stateless** :

1. Android obtient un **Google ID Token** via Credential Manager
2. Le token est envoyé dans le header \`Authorization: Bearer\` à chaque requête
3. Le backend vérifie le token avec \`google-auth-library\` et upsert l'utilisateur

Pas de sessions à gérer côté serveur. Pas de cookies. Compatible avec le serverless de Vercel. Et l'expérience utilisateur est transparente : un tap sur "Se connecter avec Google" et c'est réglé.

### La migration des données existantes

Le moment délicat : j'avais déjà 52 jours de données sans notion d'utilisateur. La migration s'est faite en trois étapes :
1. Ajout de la table \`users\` et de la colonne \`userId\` (nullable) dans \`health_entries\`
2. Script de migration qui rattache toutes les entries existantes à mon compte
3. Ajout de la contrainte unique composite \`(userId, date)\`

Zéro donnée perdue. Mon streak de 52 jours est intact.

## Le light mode

Détail qui compte : j'ai passé l'application en **light mode**. Fond beige \`#F5F2EC\`, le même que mon portfolio. Si vous avez lu mon article sur l'abandon du dark theme, vous savez pourquoi. Cohérence visuelle, lisibilité, et alignement avec ma conviction que le light mode est sous-estimé.

## Les chiffres après 52 jours

- **52 jours** de streak ininterrompu
- **1 080 pompes** au total (20/jour en janvier, 25/jour depuis mi-février)
- **0 jour manqué** depuis le 1er janvier
- **Temps moyen** : moins de 2 minutes par session

Ce n'est pas un exploit sportif. 20-25 pompes par jour, c'est accessible à presque tout le monde. Mais la régularité sur 52 jours, ça c'est le résultat du système.

## Ce que j'ai appris

**La gamification fonctionne, même sur soi-même.** Je savais intellectuellement que les streaks sont un levier puissant. Le vivre au quotidien, c'est différent. Au jour 40, je me suis surpris à faire mes pompes à 23h55, malade, juste pour ne pas perdre le streak.

**La friction est l'ennemi de l'habitude.** L'app web marchait, mais c'est le widget Android qui a tout changé. Réduire le nombre de taps entre "j'y pense" et "c'est fait" est crucial.

**Over-engineering est tentant, mais inutile.** Trois endpoints, une table, un token. Pas de framework d'auth complexe, pas de Redis pour les sessions, pas de microservices. Le système le plus simple qui fonctionne.

## Conclusion

Ce projet est petit. Pas de millions d'utilisateurs, pas d'architecture distribuée complexe. Mais c'est peut-être le projet dont je suis le plus satisfait. Parce qu'il résout un vrai problème — le mien — et qu'il le résout bien.

52 jours et counting. L'objectif passera à 30 pompes en mars. Le streak continue.`

const contentEn = `## Introduction

52 days ago, on January 1st, 2026, I made a resolution. Not one of those grand declarations you forget by mid-February — something simple, concrete, measurable: **do pushups every day**.

It's not the first time I've tried. I've always done sports intermittently. But with the startup world — deadlines, sprints, late-night production debugging — I've lost motivation several times. Three weeks straight, then nothing for two months. The classic pattern.

This time, I decided to tackle the problem like a developer: with code, data, and a system that won't let me cheat.

## The Problem: Motivation Isn't Enough

Motivation is a spike. It peaks on January 1st, and slowly fades by the 20th. Behavioral psychology studies show it: **intrinsic motivation alone isn't enough to maintain a habit**. You need a system.

Duolingo figured this out long ago. Their streak mechanics — that consecutive day series you don't want to break — is a formidable psychological lever. When you have a 30-day streak, missing one day costs you emotionally far more than the simple effort of doing your pushups.

I decided to build the same mechanism, but for my pushups.

## Version 1: The Web Component

The tracker was first born in my portfolio. A Vue component integrated into my Nuxt site, with:
- A **stepper** (+5/-5) to adjust the pushup count
- A **visual calendar**: validated days checked in gold, missed days in red
- A prominent **streak counter**
- **Statistics**: total pushups, number of days, best streak

The backend is minimal: three Nitro endpoints (stats, entries, validate) hitting a PostgreSQL table on Neon. No authentication, no unnecessary complexity. Just me and my pushups.

It worked. The first 10 days, simply seeing the calendar fill up motivated me. By day 20, I didn't want to break the chain. By day 30, it was reflex.

## The Problem with Web on Mobile

But in daily use, opening a browser, typing the URL, waiting for it to load... too much friction. Most of the time, I validate my pushups in the morning when waking up or at night before sleep. On my phone. And the mobile web experience isn't smooth enough for a gesture you repeat every day.

So I built a **native Android app**.

## The Android App

The app is written in **Kotlin** with a classic MVVM architecture:
- **Room** for local caching — even offline, I see my data
- **Retrofit 2** for backend synchronization with Nuxt
- **ViewModel + LiveData** for reactive UI
- **SwipeRefreshLayout** for pull-to-refresh

But the real game-changer is the **widget**.

### The Widget That Changes Everything

I added an Android widget that sits on the home screen. It shows the current streak and today's status. **Every time I unlock my phone, I see it.** Impossible to ignore. Impossible to tell yourself "I'll do it later."

The widget syncs in the background via WorkManager every 30 minutes. No need to open the app to see where I stand.

It's this combination — the psychological streak + the permanent visibility of the widget — that sustained the habit for 52 uninterrupted days.

## Google OAuth Authentication

Initially, the app was a personal tool. No auth, no user concept. But I wanted to make it shareable — so other people could use it with their own data.

The auth choice was deliberate. The main client is a native Android app. Sessions/cookies are designed for the web. I went with a **stateless** approach:

1. Android gets a **Google ID Token** via Credential Manager
2. The token is sent in the \`Authorization: Bearer\` header with every request
3. The backend verifies the token with \`google-auth-library\` and upserts the user

No server-side sessions. No cookies. Vercel serverless compatible. And the user experience is seamless: one tap on "Sign in with Google" and you're in.

### Migrating Existing Data

The tricky moment: I already had 52 days of data with no user concept. The migration happened in three steps:
1. Add the \`users\` table and \`userId\` column (nullable) to \`health_entries\`
2. Migration script to assign all existing entries to my account
3. Add the composite unique constraint \`(userId, date)\`

Zero data lost. My 52-day streak is intact.

## Light Mode

A detail that matters: I switched the app to **light mode**. Beige background \`#F5F2EC\`, matching my portfolio. If you've read my article about abandoning dark theme, you know why. Visual consistency, readability, and alignment with my conviction that light mode is underrated.

## The Numbers After 52 Days

- **52 days** of unbroken streak
- **1,080 pushups** total (20/day in January, 25/day since mid-February)
- **0 days missed** since January 1st
- **Average time**: less than 2 minutes per session

This isn't an athletic feat. 20-25 pushups a day is accessible to almost everyone. But the consistency over 52 days — that's the system at work.

## What I Learned

**Gamification works, even on yourself.** I knew intellectually that streaks are a powerful lever. Living it daily is different. On day 40, I caught myself doing pushups at 11:55 PM, sick, just to not lose the streak.

**Friction is the enemy of habit.** The web app worked, but the Android widget changed everything. Reducing the number of taps between "I think about it" and "it's done" is crucial.

**Over-engineering is tempting but useless.** Three endpoints, one table, one token. No complex auth framework, no Redis for sessions, no microservices. The simplest system that works.

## Conclusion

This project is small. No millions of users, no complex distributed architecture. But it might be the project I'm most satisfied with. Because it solves a real problem — mine — and it solves it well.

52 days and counting. The target will go up to 30 pushups in March. The streak continues.`

async function seed() {
  await db.delete(blogPosts).where(eq(blogPosts.slug, 'daily-pushup-tracker-52-jours'))

  await db.insert(blogPosts).values({
    slug: 'daily-pushup-tracker-52-jours',
    titleFr: '52 jours de pompes : comment j\'ai gamifié ma discipline avec du code',
    titleEn: '52 days of pushups: how I gamified my discipline with code',
    titleKm: 'រាំងដៃ ៥២ ថ្ងៃ៖ របៀបដែលខ្ញុំបានប្រើ gamification លើវិន័យរបស់ខ្ញុំជាមួយកូដ',
    contentFr,
    contentEn,
    contentKm: contentEn,
    excerptFr: 'Comment un simple défi de pompes quotidiennes est devenu une application Android avec widget, Google OAuth et 52 jours de streak ininterrompu.',
    excerptEn: 'How a simple daily pushup challenge became an Android app with widget, Google OAuth and 52 days of unbroken streak.',
    excerptKm: 'របៀបដែលបញ្ហាប្រឈមរាំងដៃប្រចាំថ្ងៃបានក្លាយជាកម្មវិធី Android ជាមួយ widget, Google OAuth និង streak ៥២ ថ្ងៃ។',
    tags: ['Android', 'Kotlin', 'OAuth', 'Gamification', 'Health', 'Side Project'],
    published: true
  })
  console.log('Blog post inserted!')
}

seed().catch(console.error)
