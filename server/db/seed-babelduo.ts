import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { projects } from './schema'
import { eq } from 'drizzle-orm'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function seedBabelDuo() {
  console.log('🗣️  Seeding BabelDuo project...')

  await db.delete(projects).where(eq(projects.slug, 'babel-duo'))
  console.log('🗑️  Cleared existing babel-duo entry')

  await db.insert(projects).values({
    slug: 'babel-duo',
    titleFr: 'PolyGloChet',
    titleEn: 'PolyGloChet',
    titleKm: 'PolyGloChet',
    descriptionFr: `## Qu'est-ce que BabelDuo ?

BabelDuo est une application de messagerie bilingue conçue pour faciliter l'apprentissage du français et du khmer entre deux personnes distantes. Chaque message envoyé est automatiquement analysé, corrigé et traduit dans les trois langues par Gemini AI — sans interrompre la conversation.

## Correction grammaticale en temps réel

Dès que l'utilisateur commence à taper, un debounce d'une seconde déclenche une analyse Gemini :

- **Détection automatique** de la langue du message (FR, EN ou KH)
- **Suggestion de correction** affichée dans une popup inline avant l'envoi
- **Explication pédagogique** : Gemini justifie chaque modification dans la langue natale de l'auteur
- L'utilisateur peut **accepter** la correction (texte remplacé automatiquement), la **refuser** ou l'**ignorer**
- Si la phrase est correcte, Gemini répond simplement "Parfait !" avec un encouragement

## Leçons granulaires — une entrée par faute

Contrairement à une correction globale, BabelDuo décompose chaque message en **autant de leçons qu'il y a de fautes** :

- Exemple : "je veut manger du riz a la maison" → 2 leçons distinctes : "veut → veux" et "a → à"
- Chaque leçon contient : l'original, la version corrigée, et l'explication grammaticale
- Les leçons sont générées dans la **langue natale de l'auteur** (français pour Chet, khmer pour Lys)
- Une leçon n'est générée que si une vraie faute est détectée — pas de bruit inutile

## Historique des corrections (GCS)

Toutes les leçons sont persistées dans Google Cloud Storage (\`chat/lessons.json\`) au moment de l'envoi du message :

- **Indépendant de la suggestion** : les leçons sont sauvegardées qu'on accepte ou refuse la correction
- **Consultable à tout moment** via le panel 📖 dans l'application ou via la démo portfolio
- Chaque entrée conserve : l'auteur, la langue, l'original, la correction, l'explication et la date
- Ordre antichronologique (plus récent en premier)

## Traductions trilingues automatiques

Chaque message est traduit en français, anglais et khmer par Gemini dès l'envoi :

- Affichage des 3 traductions sous chaque bulle de message
- **Flag de langue** (🇫🇷 🇬🇧 🇰🇭) indiquant la langue originale du message
- Si la suggestion a déjà fourni les traductions, elles sont réutilisées — pas d'appel Gemini double
- Traduction absente pour les messages trop courts (< 2 caractères)

## Reconnaissance vocale (VAD)

L'envoi vocal repose sur une pipeline de détection d'activité vocale entièrement côté client :

- **Silero VAD v5** via ONNX Runtime Web — détection de début/fin de parole sans serveur
- Trois états visuels : ⏳ initialisation ONNX, 🔴 écoute active (pulsant), 🟢 voix détectée (pulsant)
- Segments < 0.8s filtrés (évite les bruits courts parasites)
- Audio capturé en base64 → envoyé à Gemini (\`geminiTranscribeAndTranslate\`) → texte + traductions
- Badge 🎤 affiché sur les bulles de messages vocaux

## Coffre multimédia

Les images et vidéos partagées dans le chat sont stockées dans Google Cloud Storage dans le même format que le coffre (\`YYYY/MM/DD/filename\`) :

- **Compression automatique** côté client (WebP/JPEG, max 2048px via Canvas API)
- **Signed URLs** pour upload et téléchargement sécurisé (expiration 1h, cache Map)
- Les images partagées apparaissent automatiquement dans le coffre photo — pas de synchronisation nécessaire
- Semaphore (max 3 requêtes concurrentes) pour éviter la saturation des signed URLs

## Actions sur les messages

Une barre d'actions apparaît sur sélection d'un message :

- **Copier** : copie le texte original + toutes les traductions dans le presse-papiers
- **TTS** (Text-To-Speech) : lecture à voix haute via Web Speech API en 🇫🇷 fr-FR, 🇬🇧 en-US ou 🇰🇭 km-KH
- **Supprimer** : uniquement par l'auteur du message (vérifié côté backend)

## Navigation et interface

- **Navigation historique** : boutons ← → pour consulter les messages des jours précédents
- **Double horloge** : heure de Paris (Europe/Paris) et de Phnom Penh (Asia/Phnom_Penh) sous chaque bulle
- **Polling** toutes les 8s pour les messages du jour (nouveaux messages de l'autre côté)
- **Interface bilingue** FR + Khmer dans toute l'UI
- **PWA installable** : fonctionne hors-ligne, icône sur l'écran d'accueil

## Architecture technique

- **Frontend** : SvelteKit 5 + Svelte 5 runes (\`$state\`, \`$derived\`, \`$effect\`) + TypeScript
- **Backend** : Nuxt 3 / Nitro sur Vercel (serverless)
- **Stockage** : Google Cloud Storage — messages \`chat/YYYY/MM/DD.json\`, leçons \`chat/lessons.json\`
- **AI** : Vertex AI Gemini 2.5 Flash — traduction, correction, transcription audio
- **Auth** : Google Identity Services (FedCM) — JWT vérifié stateless côté backend
- **VAD** : @ricky0123/vad-web + onnxruntime-web (Silero VAD v5)`,

    descriptionEn: `## What is BabelDuo?

BabelDuo is a bilingual messaging app designed to facilitate French and Khmer learning between two people at a distance. Every message sent is automatically analyzed, corrected and translated into three languages by Gemini AI — without interrupting the conversation.

## Real-Time Grammar Correction

As soon as the user starts typing, a one-second debounce triggers a Gemini analysis:

- **Automatic language detection** of the message (FR, EN or KH)
- **Correction suggestion** displayed in an inline popup before sending
- **Educational explanation**: Gemini justifies each change in the author's native language
- The user can **accept** the correction (text replaced automatically), **reject** it or **ignore** it
- If the sentence is correct, Gemini simply responds "Perfect!" with an encouragement

## Granular Lessons — One Entry Per Error

Unlike a global correction, BabelDuo breaks down each message into **as many lessons as there are errors**:

- Example: "je veut manger du riz a la maison" → 2 distinct lessons: "veut → veux" and "a → à"
- Each lesson contains: the original, the corrected version, and the grammatical explanation
- Lessons are generated in the **author's native language** (French for Chet, Khmer for Lys)
- A lesson is only generated when a real error is detected — no unnecessary noise

## Corrections History (GCS)

All lessons are persisted in Google Cloud Storage (\`chat/lessons.json\`) at message send time:

- **Independent of the suggestion**: lessons are saved whether you accept or reject the correction
- **Consultable at any time** via the 📖 panel in the app or through the portfolio demo
- Each entry stores: author, language, original, correction, explanation and date
- Reverse-chronological order (most recent first)

## Automatic Trilingual Translations

Every message is translated into French, English and Khmer by Gemini upon sending:

- All 3 translations displayed under each message bubble
- **Language flag** (🇫🇷 🇬🇧 🇰🇭) indicating the original language of the message
- If the suggestion already provided translations, they are reused — no double Gemini call
- Translation skipped for very short messages (< 2 characters)

## Voice Recognition (VAD)

Voice sending relies on a fully client-side voice activity detection pipeline:

- **Silero VAD v5** via ONNX Runtime Web — start/end of speech detection with no server
- Three visual states: ⏳ ONNX initializing, 🔴 active listening (pulsing), 🟢 voice detected (pulsing)
- Segments < 0.8s filtered out (avoids short background noises)
- Audio captured as base64 → sent to Gemini (\`geminiTranscribeAndTranslate\`) → text + translations
- 🎤 badge displayed on voice message bubbles

## Media Vault

Images and videos shared in chat are stored in Google Cloud Storage in the same format as the vault (\`YYYY/MM/DD/filename\`):

- **Automatic client-side compression** (WebP/JPEG, max 2048px via Canvas API)
- **Signed URLs** for secure upload and download (1h expiry, Map cache)
- Shared images appear automatically in the photo vault — no synchronization needed
- Semaphore (max 3 concurrent requests) to prevent signed URL saturation

## Message Actions

An action bar appears when a message is selected:

- **Copy**: copies the original text + all translations to clipboard
- **TTS** (Text-To-Speech): reads aloud via Web Speech API in 🇫🇷 fr-FR, 🇬🇧 en-US or 🇰🇭 km-KH
- **Delete**: only by the message author (verified server-side)

## Navigation & Interface

- **History navigation**: ← → buttons to browse previous days' messages
- **Dual clock**: Paris time (Europe/Paris) and Phnom Penh time (Asia/Phnom_Penh) under each bubble
- **Polling** every 8s for today's messages (new messages from the other side)
- **Bilingual UI** FR + Khmer throughout the entire interface
- **Installable PWA**: works offline, home screen icon

## Technical Architecture

- **Frontend**: SvelteKit 5 + Svelte 5 runes (\`$state\`, \`$derived\`, \`$effect\`) + TypeScript
- **Backend**: Nuxt 3 / Nitro on Vercel (serverless)
- **Storage**: Google Cloud Storage — messages \`chat/YYYY/MM/DD.json\`, lessons \`chat/lessons.json\`
- **AI**: Vertex AI Gemini 2.5 Flash — translation, correction, audio transcription
- **Auth**: Google Identity Services (FedCM) — stateless JWT verification server-side
- **VAD**: @ricky0123/vad-web + onnxruntime-web (Silero VAD v5)`,

    tags: ['SvelteKit', 'Svelte 5', 'Gemini AI', 'TypeScript', 'GCS', 'PWA', 'VAD', 'Web Speech'],
    demoUrl: 'https://chetana.dev/projects/babel-duo',
    githubUrl: null,
    type: 'project',
    featured: true
  })

  console.log('✅ Inserted babel-duo project')
  console.log('🎉 BabelDuo seed complete!')
}

seedBabelDuo().catch(console.error)
