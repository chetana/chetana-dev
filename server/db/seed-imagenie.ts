import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { projects } from './schema'
import { eq } from 'drizzle-orm'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function seedImagenie() {
  console.log('🎨  Seeding Imagenie project...')

  await db.delete(projects).where(eq(projects.slug, 'imagenie'))
  console.log('🗑️  Cleared existing imagenie entry')

  await db.insert(projects).values({
    slug: 'imagenie',
    titleFr: 'ImagiChet',
    titleEn: 'ImagiChet',
    titleKm: 'ImagiChet',
    descriptionFr: `## Qu'est-ce qu'Imagenie ?

Imagenie est un générateur d'images personnel propulsé par **Imagen 3 de Google** via Vertex AI. Contrairement aux interfaces publiques (Gemini, Google AI Studio), Imagenie tourne sur un compte GCP privé — permettant un contrôle total sur les prompts, les styles et la gestion des images générées.

## Pourquoi Vertex AI plutôt que Gemini public ?

L'API Vertex AI offre plusieurs avantages décisifs pour un usage personnel :

- **Accès direct au modèle** sans passer par une interface grand public avec ses limitations UI
- **Intégration native** avec le compte de service GCP déjà utilisé pour le stockage et l'IA
- **Flexibilité totale** : paramétrage fin de l'aspect ratio, du nombre d'images, du prompt négatif
- **Stockage GCS** : chaque image est automatiquement sauvegardée dans le bucket personnel, sans limite de rétention
- **Tarification à l'usage** : ~$0,02 par image avec le modèle Fast, pas d'abonnement

## Modèle : Imagen 3 Fast

Imagenie utilise \`imagen-3.0-fast-generate-001\`, la variante rapide et économique d'Imagen 3 :

- **Qualité remarquable** malgré la vitesse (résolution 1024×1024 en natif)
- **Génération en ~8 secondes** contre 15-20s pour le modèle full
- **Support multi-ratio** : carré (1:1), paysage (16:9), portrait (9:16)
- **Paramètre \`addWatermark: false\`** : aucun SynthID visible sur les images personnelles

## Styles prédéfinis

Chaque style enrichit automatiquement le prompt avec un suffixe optimisé :

- **Aquarelle** : *watercolor painting, soft wet brushstrokes, delicate pastel colors*
- **Cinématique** : *cinematic photography, dramatic lighting, 35mm film, shallow depth of field*
- **Manga** : *manga illustration, clean line art, black and white, Japanese anime style*
- **Illustration** : *digital illustration, vibrant colors, flat design, editorial art style*
- **Photo réaliste** : *hyperrealistic photography, 8K resolution, sharp details, professional camera*

## Architecture technique

**Backend (Nuxt 3 / Nitro)** :
- \`server/utils/imagen.ts\` — utilitaire d'appel Imagen 3 via fetch natif + service account OAuth2
- \`server/api/imagenie/generate.post.ts\` — génération + sauvegarde PNG en GCS + mise à jour galerie
- \`server/api/imagenie/gallery.get.ts\` — lecture de \`imagenie/gallery.json\`
- \`server/api/imagenie/image.get.ts\` — URL signée GCS (1h) pour affichage sécurisé
- \`server/api/imagenie/delete.delete.ts\` — suppression fichier GCS + retrait de l'index

**Stockage GCS** :
- Images : \`imagenie/YYYY/MM/DD/{id}.png\`
- Index galerie : \`imagenie/gallery.json\` (tableau prepend, plus récent en premier)
- Chaque entrée contient : id, timestamp, auteur, prompt, style, ratio, chemin GCS

**Sécurité** :
- Authentification Google (JWT via Google Identity Services)
- \`requireAuth(event)\` sur chaque endpoint
- URLs d'images signées temporaires (1h), jamais publiques directement

## Flux de génération

1. L'utilisateur saisit un prompt + sélectionne un style + choisit le ratio
2. Le frontend envoie \`POST /api/imagenie/generate\` avec le Bearer token Google
3. Le backend enrichit le prompt avec le suffixe de style, appelle Imagen 3 via Vertex AI
4. L'image PNG est sauvegardée en GCS, l'entrée est ajoutée à \`gallery.json\`
5. L'image est retournée en base64 pour un affichage immédiat sans second aller-retour
6. La galerie se recharge et affiche toutes les images via URLs signées

## Galerie et gestion

- **Affichage grid** : 3 colonnes desktop, 2 colonnes mobile
- **Modal plein écran** : clic sur une image pour l'agrandir
- **Suppression** : bouton 🗑️ sur chaque carte — supprime le fichier GCS et retire l'entrée de l'index
- **Métadonnées** : prompt original, style appliqué, date de génération, ratio`,
    descriptionEn: `## What is Imagenie?

Imagenie is a personal image generator powered by **Google's Imagen 3** via Vertex AI. Unlike public interfaces (Gemini, Google AI Studio), Imagenie runs on a private GCP account — giving complete control over prompts, styles, and generated image management.

## Why Vertex AI instead of public Gemini?

The Vertex AI API offers several key advantages for personal use:

- **Direct model access** without going through a consumer interface with its UI limitations
- **Native integration** with the GCP service account already used for storage and AI
- **Full flexibility**: fine-grained control over aspect ratio, sample count, negative prompts
- **GCS storage**: every image is automatically saved to the personal bucket with no retention limit
- **Pay-as-you-go pricing**: ~$0.02 per image with the Fast model, no subscription

## Model: Imagen 3 Fast

Imagenie uses \`imagen-3.0-fast-generate-001\`, the fast and cost-effective variant of Imagen 3:

- **Remarkable quality** despite the speed (native 1024×1024 resolution)
- **Generation in ~8 seconds** vs 15-20s for the full model
- **Multi-ratio support**: square (1:1), landscape (16:9), portrait (9:16)
- **\`addWatermark: false\` parameter**: no visible SynthID on personal images

## Preset Styles

Each style automatically enriches the prompt with an optimized suffix:

- **Watercolor**: *watercolor painting, soft wet brushstrokes, delicate pastel colors*
- **Cinematic**: *cinematic photography, dramatic lighting, 35mm film, shallow depth of field*
- **Manga**: *manga illustration, clean line art, black and white, Japanese anime style*
- **Illustration**: *digital illustration, vibrant colors, flat design, editorial art style*
- **Photorealistic**: *hyperrealistic photography, 8K resolution, sharp details, professional camera*

## Technical Architecture

**Backend (Nuxt 3 / Nitro)**:
- \`server/utils/imagen.ts\` — Imagen 3 call utility via native fetch + OAuth2 service account
- \`server/api/imagenie/generate.post.ts\` — generation + PNG save to GCS + gallery update
- \`server/api/imagenie/gallery.get.ts\` — reads \`imagenie/gallery.json\`
- \`server/api/imagenie/image.get.ts\` — signed GCS URL (1h) for secure display
- \`server/api/imagenie/delete.delete.ts\` — GCS file deletion + index removal

**GCS Storage**:
- Images: \`imagenie/YYYY/MM/DD/{id}.png\`
- Gallery index: \`imagenie/gallery.json\` (prepend array, most recent first)
- Each entry contains: id, timestamp, author, prompt, style, ratio, GCS path

**Security**:
- Google authentication (JWT via Google Identity Services)
- \`requireAuth(event)\` on every endpoint
- Temporary signed image URLs (1h), never publicly accessible directly

## Generation Flow

1. User enters a prompt + selects a style + chooses the ratio
2. Frontend sends \`POST /api/imagenie/generate\` with the Google Bearer token
3. Backend enriches the prompt with the style suffix, calls Imagen 3 via Vertex AI
4. The PNG image is saved to GCS, the entry is added to \`gallery.json\`
5. The image is returned as base64 for immediate display without a second round-trip
6. The gallery reloads and displays all images via signed URLs

## Gallery and Management

- **Grid display**: 3-column desktop, 2-column mobile
- **Full-screen modal**: click an image to enlarge
- **Deletion**: 🗑️ button on each card — deletes the GCS file and removes the index entry
- **Metadata**: original prompt, applied style, generation date, ratio`,
    tags: ['Vertex AI', 'Imagen 3', 'TypeScript', 'GCS', 'Vue.js', 'Nuxt 3'],
    demoUrl: 'https://chetana.dev/projects/imagichet',
    githubUrl: null,
    featured: true,
    sortOrder: 4,
  })

  console.log('✅ Imagenie project seeded!')
  console.log('🎉 Done!')
}

seedImagenie().catch(console.error)
