import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { blogPosts } from './schema'
import { eq } from 'drizzle-orm'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const contentFr = `## La mémoire, c'est précieux

Mes parents sont des réfugiés de la guerre Khmers rouges. Ils n'ont pas d'albums photo de leur enfance — pas de photos du tout, en fait. Tout a été perdu, ou plutôt tout a été délibérément effacé. Le régime de Pol Pot a détruit les archives, les documents, les visages. Garder une photo de famille, c'était parfois risquer sa vie.

J'ai grandi en entendant des histoires. Des récits de gens qui existaient mais dont il ne reste aucune image. Ma mère me décrivait ses parents, ses frères — des silhouettes sans visage. La mémoire orale comme seule archive.

Alors quand j'ai voulu construire quelque chose pour ne pas oublier, le projet a pris une autre dimension. Pas de la nostalgie de développeur. Plutôt une évidence : **la mémoire se perd si on ne la construit pas activement**.

Aujourd'hui je vis à 9 074 km de la personne que j'aime. Paris — Phnom Penh. Six heures de décalage horaire. La distance est une forme de mémoire inversée : au lieu d'archiver le passé, elle efface le présent. Un repas partagé, un coucher de soleil, un geste du quotidien — autant de moments qui disparaissent faute d'un endroit où les déposer ensemble.

J'ai donc construit un album photo privé. Une PWA Flutter déployée sur Vercel, un bucket Google Cloud Storage, une API Nuxt serverless. Deux utilisateurs. Aucune concession sur la sécurité ni sur l'expérience.

Ce qui suit est le récit complet de cette construction : les choix techniques, les bugs, les optimisations — et les leçons que j'en ai tirées sur la gestion mémoire dans une app web multimédia moderne.

---

## Chapitre 1 : Le problème des photos entre iOS et Android

### Deux téléphones, deux écosystèmes

Lys est sur iPhone. Je suis sur Android. Ce détail anodin a dicté toute l'architecture du projet.

Une app native iOS nécessite un compte Apple Developer ($99/an) et une distribution via l'App Store. Pour une app privée à deux utilisateurs, c'est hors de question. AltStore et Sideloadly permettent l'installation sans store, mais les certificats expirent tous les 7 jours — deux fois par semaine il faudrait rebrancher l'iPhone à un ordinateur pour re-signer l'app. Inacceptable.

La solution : une **Progressive Web App (PWA)**. Depuis Safari iOS, on peut installer une PWA sur l'écran d'accueil en deux taps. Elle s'ouvre en mode standalone — sans barre de navigation Safari, en plein écran — et se comporte comme une vraie app native. Pas de store, pas de frais, pas de renouvellement.

Le problème : une PWA web et une app Android, c'est normalement deux codebases séparées. Sauf si on utilise Flutter.

### Flutter : un seul code, deux cibles

Flutter compile le même code Dart vers :
- **Android** : bytecode ARM natif (AOT compilation), packagé en APK
- **Web** : JavaScript via \`dart2js\` + rendu CanvasKit (WebAssembly)

Le résultat est une app identique sur les deux plateformes — mêmes transitions, même UI, même logique métier. Pas de "React Native Web" bricolé, pas de conditions \`if (Platform.isAndroid)\` dispersées. Un seul projet, un seul langage, deux targets.

\`\`\`
lib/
├── main.dart           ← compile vers Android ET web
└── coffre/             ← même code pour les deux
\`\`\`

L'exception : deux fonctionnalités utilisent des API web-only (\`dart:html\`) — la compression d'images et les thumbnails vidéo. Flutter propose un mécanisme d'**imports conditionnels** pour ça :

\`\`\`dart
export 'image_compressor_stub.dart'
    if (dart.library.html) 'image_compressor_web.dart';
\`\`\`

Sur web : \`dart.library.html\` est vrai → implémentation canvas réelle.
Sur Android : stub vide (pass-through). Pas de \`kIsWeb\` dispersés, pas de runtime error.

---

## Chapitre 2 : Stocker des photos sans base de données

### Le choix GCS

Pour stocker les photos et vidéos, j'ai choisi **Google Cloud Storage** — pas une base de données. Ce choix mérite une explication.

Une base de données aurait nécessité un schéma, des migrations, un ORM, et une API CRUD. Pour stocker des fichiers avec une organisation temporelle simple (par date), c'est de l'over-engineering.

GCS propose une convention de nommage qui remplace entièrement ce schéma :

\`\`\`
2026/01/13/photo_bague.jpg
2026/02/22/selfie_matin.webp
2026/02/22/video_repas.mp4
\`\`\`

Le préfixe \`YYYY/MM/DD/\` suffit pour tout naviguer :

\`\`\`
listObjects('')           → ['2025/', '2026/']       (années)
listObjects('2026/')      → ['2026/01/', '2026/02/'] (mois)
listObjects('2026/02/')   → ['2026/02/22/']          (jours)
listObjects('2026/02/22/') → [{name, size, ...}, ...]  (fichiers)
\`\`\`

Zéro schema, zéro migration, zéro DB à payer. GCS Standard europe-west1 coûte ~$0.02/GB/mois — pour un usage couple (quelques GB par an), pratiquement gratuit.

### Les fichiers spéciaux

En plus des médias, trois fichiers JSON enrichissent chaque jour :

| Fichier | Rôle |
|---------|------|
| \`note.txt\` | Note personnelle du jour — "premier repas ensemble 🥹" |
| \`meta.json\` | \`{"photo.jpg": "Chet"}\` — qui a uploadé quoi |
| \`reactions.json\` | \`{"photo.jpg": ["❤️", "😍"]}\` — réactions emoji par photo |

Ces trois fichiers sont filtrés hors de la grille d'affichage (on ne veut pas voir \`reactions.json\` comme une "photo") mais chargés séparément pour enrichir l'UI.

---

## Chapitre 3 : L'authentification — signed URLs et Google OAuth

### Pourquoi pas juste "rendre le bucket public" ?

Un bucket GCS public aurait été la solution la plus simple. Mais les photos de couple d'un album privé ne doivent pas être accessibles à n'importe qui avec l'URL.

La solution : **signed URLs v4**. Ce sont des URLs HTTP normales — n'importe quel client peut les appeler sans header spécial — mais leur sécurité repose sur une signature cryptographique HMAC-SHA256 intégrée dans les query params :

\`\`\`
https://storage.googleapis.com/chet-lys-coffre/2026/02/22/photo.jpg
  ?X-Goog-Algorithm=GOOG4-RSA-SHA256
  &X-Goog-Credential=service-account%40...
  &X-Goog-Expires=3600
  &X-Goog-Signature=a1b2c3d4...  ← forgeable uniquement avec la clé privée
\`\`\`

Le bucket reste privé. L'app demande une signed URL au backend, qui la génère avec la clé du service account. L'URL expire après 1 heure (téléchargement) ou 15 minutes (upload). Personne ne peut forger une nouvelle URL sans la clé privée.

### Le problème du SDK @google-cloud/storage

Le SDK officiel de Google ne survit pas au bundling Nitro/Rollup. Nitro (le moteur serveur de Nuxt 4) bundle toutes les dépendances en un seul fichier JavaScript — et dans ce processus, les prototypes de classe du SDK sont perdus. Les méthodes de signing deviennent inaccessibles.

**Solution** : implémenter l'algorithme v4 directement avec le module \`crypto\` natif de Node.js. C'est ~50 lignes de code, aucune dépendance externe :

\`\`\`typescript
// server/utils/gcs.ts
import crypto from 'crypto'

export function signedGetUrl(path: string): string {
  const expires = Math.floor(Date.now() / 1000) + 3600
  const canonicalRequest = [
    'GET',
    \`/\${bucket}/\${path}\`,
    queryString,
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD'
  ].join('\\n')

  const stringToSign = [
    'GOOG4-RSA-SHA256',
    datetime,
    scope,
    sha256(canonicalRequest)
  ].join('\\n')

  const signature = crypto
    .createSign('RSA-SHA256')
    .update(stringToSign)
    .sign(privateKey, 'hex')

  return \`https://storage.googleapis.com/\${bucket}/\${path}?\${params}&X-Goog-Signature=\${signature}\`
}
\`\`\`

### Le flux d'authentification côté Flutter

L'app utilise Google Sign-In (OAuth 2.0). Après connexion, un ID Token JWT (~1h de validité) est attaché à chaque requête vers le backend :

\`\`\`
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6...
\`\`\`

Le backend vérifie ce token avec \`google-auth-library\` avant chaque opération. Pour les opérations read (téléchargement), l'app reçoit une signed URL GET valable 1h. Pour les opérations write (upload), une signed URL PUT valable 15 minutes — le fichier est envoyé directement depuis le device vers GCS, sans passer par le backend (réduction des coûts et de la latence).

---

## Chapitre 4 : Partager un souvenir — le protocole Open Graph

### "Est-ce qu'on peut avoir une preview sur WhatsApp ?"

La première version de l'app partageait un lien direct vers la PWA Flutter :

\`\`\`
https://mon-app.vercel.app/?tab=coffre&y=...
\`\`\`

Quand on collait ce lien dans WhatsApp ou Messenger, aucune preview image ne s'affichait. Juste une URL texte.

Pour comprendre pourquoi, il faut comprendre comment les messageries génèrent les previews.

### Comment fonctionnent les scrapers

Quand on envoie un lien sur WhatsApp, Telegram ou Facebook, l'application envoie un **bot scraper** visiter l'URL. Ce bot lit le HTML retourné et cherche des balises **Open Graph** :

\`\`\`html
<meta property="og:image"       content="https://...photo.jpg">
<meta property="og:title"       content="Chet & Lys — 22 février 2026">
<meta property="og:description" content="Un souvenir partagé">
\`\`\`

Le problème fondamental avec une SPA Flutter Web : l'\`index.html\` servi par Vercel est **identique pour toutes les URLs**. Il contient uniquement \`<script src="main.dart.js">\` — le contenu est généré côté client après le chargement du JavaScript. Or, **les bots scrapers n'exécutent pas JavaScript**. Ils lisent uniquement le HTML brut initial.

### La solution : un preview proxy

La solution est un endpoint serveur (\`mon-backend/api/coffre/preview\`) capable de générer dynamiquement du HTML différent pour chaque photo :

\`\`\`typescript
// server/api/coffre/preview.get.ts
export default defineEventHandler(async (event) => {
  const { y, m, d, f } = getQuery(event)
  const path = \`\${y}/\${m}/\${d}/\${f}\`
  const ogImageUrl = \`/api/coffre/og-image?path=\${encodeURIComponent(path)}\`
  const flutterUrl = \`https://mon-app.vercel.app/?tab=coffre&y=...\${y}&m=\${m}&d=\${d}&f=\${f}\`

  setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  return \`<!DOCTYPE html>
<html><head>
  <meta property="og:image" content="\${ogImageUrl.replace(/&/g, '&amp;')}">
  <meta property="og:title" content="Chet & Lys — \${d} \${monthName} \${y}">
  <meta property="og:description" content="Un souvenir partagé · ការចងចាំរួម">
  <script>window.location.replace(\${JSON.stringify(flutterUrl)});</script>
</head></html>\`
})
\`\`\`

Deux comportements selon le visiteur :

| Visiteur | Comportement |
|----------|-------------|
| Bot scraper (WhatsApp, Telegram, FB) | Lit les \`og:\` tags → extrait l'image et le titre → preview |
| Vrai utilisateur (humain) | JS redirect instantané → atterrit sur la PWA à la bonne photo |

Le lien partagé depuis le viewer Flutter pointe désormais vers ce proxy. La sécurité des photos reste assurée : le bot peut accéder à la preview, mais pas au listing complet du bucket.

### Bug critique : \`&\` vs \`&amp;\` dans les attributs HTML

Après déploiement, les tests WhatsApp montraient bien la preview. Facebook Messenger, rien.

En inspectant le HTML brut retourné par l'endpoint :

\`\`\`html
<meta property="og:image" content="https://storage.googleapis.com/...?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=...">
\`\`\`

Le problème : les \`&\` dans la query string de la signed URL GCS **n'étaient pas échappés** en \`&amp;\`.

La spécification HTML exige que le caractère \`&\` dans les valeurs d'attribut soit toujours encodé en \`&amp;\`. Les parsers HTML stricts — notamment les bots scrapers de Facebook — lisent le contenu d'un attribut jusqu'au premier \`&\` non échappé et **tronquent l'URL à cet endroit**. Résultat : Facebook recevait une URL invalide (coupée avant \`X-Goog-Credential\`), obtenait une erreur 403 de GCS, et abandonnait la preview.

Une signed URL GCS contient systématiquement plusieurs \`&\` dans ses query params :

\`\`\`
?X-Goog-Algorithm=GOOG4-RSA-SHA256
&X-Goog-Credential=...      ← premier & → URL tronquée ici
&X-Goog-Date=...
&X-Goog-Expires=3600
&X-Goog-SignedHeaders=host
&X-Goog-Signature=...
\`\`\`

Fix en deux lignes :

\`\`\`typescript
const ogImageUrlHtml  = ogImageUrl.replace(/&/g, '&amp;')
const flutterUrlHtml  = flutterUrl.replace(/&/g, '&amp;')
// Variables *Html → attributs HTML
// Variables brutes → JS window.location.replace() (pas du HTML, pas d'échappement)
\`\`\`

Un détail de spec HTML vieux de 30 ans, toujours capable de casser une intégration moderne.

### Pourquoi WhatsApp voyait la preview mais pas Messenger ?

WhatsApp et Facebook Messenger sont tous deux propriété de Meta. On pourrait s'attendre à ce qu'ils partagent la même infrastructure de scraping.

Ce n'est pas le cas.

| Scraper | User-Agent | Formats og:image acceptés |
|---------|-----------|--------------------------|
| WhatsApp | \`WhatsApp/2.x\` | JPEG, PNG, **WebP** ✅ |
| Facebook Messenger | \`facebookexternalhit/1.1\` | JPEG, PNG, GIF ❌ WebP |
| Telegram | \`TelegramBot\` | JPEG, PNG ⚠️ |

WhatsApp a été racheté par Meta en 2014 mais son infrastructure est restée indépendante. Facebook Messenger utilise le scraper historique (\`facebookexternalhit/1.1\`), développé vers 2010 — époque où WebP n'existait pas.

Nos photos étaient uploadées en WebP (compression optimale via canvas côté client). WhatsApp les affichait. Messenger et Telegram les ignoraient silencieusement.

### Le proxy JPEG — \`/api/coffre/og-image\`

Solution : un second endpoint proxy qui transcode n'importe quel format source en JPEG, via \`sharp\` (Node.js) :

\`\`\`typescript
// server/api/coffre/og-image.get.ts
import sharp from 'sharp'
import { signedGetUrl } from '../../utils/gcs'

export default defineEventHandler(async (event) => {
  const { path, w } = getQuery(event)
  const width = parseInt(w) || 1200  // 1200 pour social, 300 pour thumbnails

  const gcsUrl = signedGetUrl(path)
  const response = await fetch(gcsUrl)
  const buffer = Buffer.from(await response.arrayBuffer())

  const jpeg = await sharp(buffer)
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: width <= 400 ? 80 : 85 })
    .toBuffer()

  setHeader(event, 'Content-Type', 'image/jpeg')
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
  return jpeg
})
\`\`\`

\`og:image\` dans le preview proxy pointe désormais vers ce endpoint. Tous les scrapers reçoivent un JPEG standard, quelle que soit la source (WebP, HEIC, PNG, RAW). Le paramètre \`?w=\` sera réutilisé plus tard pour les thumbnails — on verra pourquoi.

---

## Chapitre 5 : La guerre contre la mémoire

C'est ici que le projet est devenu un terrain d'expérimentation sur les limites des navigateurs mobiles.

### Bataille 1 : le crash renderer sur les gros fichiers

L'app fonctionnait parfaitement en desktop. Sur mobile Android, avec certaines photos, le viewer plein écran affichait une icône "image cassée" à la place de la photo.

Les photos en question : des JPEG bruts d'appareil photo Lumix. **~8 MB, 6000×4000 pixels.**

Le calcul est brutal :

\`\`\`
6000 × 4000 pixels × 4 octets (RGBA) = 96 MB par image
\`\`\`

CanvasKit — le moteur de rendu de Flutter Web — a un budget mémoire limité par onglet dans Chrome Android. Charger 2-3 images de cette taille simultanément (viewer + préchargement de la photo précédente et suivante) dépasse le seuil et fait crasher le renderer.

**Première correction** : paramètre \`memCacheWidth\` de \`CachedNetworkImage\` :

\`\`\`dart
// Viewer plein écran : 1920px suffit pour un écran HD
CachedNetworkImage(
  imageUrl: signedUrl,
  cacheKey: item.name,
  memCacheWidth: 1920,  // ← réduit 96 MB → ~15 MB
)
\`\`\`

\`memCacheWidth\` indique à Flutter de redimensionner l'image **au moment du décodage**, pas via CSS. L'économie est réelle. Le viewer a cessé de crasher.

### Bataille 2 : la grille toujours instable

Les thumbnails dans la grille avaient leur propre \`memCacheWidth: 300\`. Et pourtant, avec une journée de 20-30 photos, la grille crashait encore.

La raison : \`memCacheWidth\` ne réduit pas la pression mémoire **pendant le décodage**. Flutter doit quand même décoder l'image originale (8 MB, 6000×4000) avant de la réduire à 300px. Ce décodage initial consomme ~96 MB de manière temporaire, même si le résultat final n'occupe que 360 KB.

Sur une grille de 9 tuiles chargées simultanément : 9 pics de 96 MB se produisent en parallèle. Sur mobile, avec un budget mémoire Chrome limité, c'est catastrophique.

**Vraie solution** : ne jamais envoyer l'image originale sur le device pour les thumbnails. Utiliser le proxy \`og-image\` avec \`?w=300\` :

\`\`\`dart
CachedNetworkImage(
  imageUrl: '/api/coffre/og-image'
      '?path=\${Uri.encodeComponent(item.name)}&w=300',
  cacheKey: '\${item.name}__thumb',
  fit: BoxFit.cover,
)
\`\`\`

Le serveur (via \`sharp\`) reçoit le RAW 8MB, le transcode en JPEG 300px ~15KB, et renvoie ce petit fichier. Le device ne voit jamais l'original pour les thumbnails.

| Avant | Après |
|-------|-------|
| Download 8 MB → décoder 96 MB → redimensionner 300px | Download 15 KB → décoder ~270 KB |
| 9 thumbnails simultanés : pic 864 MB | 9 thumbnails simultanés : pic ~2.4 MB |

Bénéfice collatéral : compatibilité avec **tous les formats** — HEIC (iPhone), WebP, PNG, RAW. Chrome Android ne supporte pas HEIC nativement ; avant ce changement, les photos iPhone d'une certaine époque affichaient l'icône de fichier rose dans la grille.

### Bataille 3 : la saturation réseau

Avec le proxy thumbnail résolu, un nouveau bug est apparu. Sur les jours chargés (20-30 photos), certaines tuiles restaient bloquées sur le spinner de chargement.

Le problème n'était plus la mémoire. C'était la **concurrence réseau**.

Chaque tuile de la grille appelle \`initState()\` au moment où Flutter construit le widget. Avec 25 photos, 25 \`initState()\` s'exécutent simultanément → 25 appels parallèles à \`signDownload\` vers l'API backend. L'API est une serverless function sur Vercel — 25 cold starts potentiels en même temps, 25 connexions GCS simultanées.

Conséquences : timeouts, requêtes abandonnées, icônes cassées.

La solution : un **sémaphore** — un mécanisme qui limite le nombre d'opérations concurrentes à un maximum de N (ici, 3) :

\`\`\`dart
import 'dart:async'; // Completer vient de dart:async

int _activeUrlFetches = 0;
final List<Completer<void>> _urlFetchQueue = [];
static const _maxUrlFetches = 3;

Future<void> _acquireUrlSlot() async {
  if (_activeUrlFetches < _maxUrlFetches) {
    _activeUrlFetches++;
    return; // slot libre → passe directement
  }
  final c = Completer<void>();
  _urlFetchQueue.add(c);
  await c.future; // ← suspension ici
  _activeUrlFetches++;
}

void _releaseUrlSlot() {
  _activeUrlFetches--;
  if (_urlFetchQueue.isNotEmpty) {
    _urlFetchQueue.removeAt(0).complete(); // réveille le suivant
  }
}
\`\`\`

\`Completer<void>\` est la primitive Dart pour créer une \`Future\` résoluble manuellement. C'est exactement le mécanisme pour "suspendre" une coroutine dans la queue et la "réveiller" quand un slot se libère.

\`\`\`
t=0ms  Tiles [0,1,2] → acquièrent les 3 slots → démarrent signDownload
       Tiles [3..24] → entrent dans la queue, attendent leur tour

t=80ms  Tile[0] reçoit sa URL → libère slot 1 → Tile[3] démarre
t=95ms  Tile[1] reçoit sa URL → libère slot 2 → Tile[4] démarre
...     Maximum 3 requêtes en vol simultanément, débit constant
\`\`\`

Pourquoi 3 ? Une seule requête serait trop lente (chargement séquentiel). Dix, c'est retourner aux problèmes de saturation. Trois permet un pipeline efficace (pendant qu'une requête attend, les deux autres avancent) sans noyer le réseau mobile.

Une subtilité importante : après avoir attendu dans la queue, la tuile doit **re-vérifier le cache** avant de faire la requête :

\`\`\`dart
Future<String?> _getCachedUrl(String name) async {
  if (_urlCache.containsKey(name)) return _urlCache[name]; // cache hit direct
  await _acquireUrlSlot();
  try {
    if (_urlCache.containsKey(name)) return _urlCache[name]; // ← re-vérification !
    // pendant qu'on attendait dans la queue, une autre tuile a peut-être
    // déjà fetché cette URL — inutile de la fetcher une seconde fois
    final url = await signDownload(name);
    if (mounted) _urlCache[name] = url;
    return url;
  } finally {
    _releaseUrlSlot();
  }
}
\`\`\`

C'est le pattern **check-then-act** autour d'une section critique — la même logique qu'un mutex en Java.

---

## Chapitre 6 : Les détails qui font la différence

### La note overlay — sous-titres style streaming

Chaque jour peut recevoir une note textuelle. La première version ouvrait un tiroir (BottomSheet) avec un TextField. Fonctionnel, mais froid.

La nouvelle version : un tap sur la barre de note ouvre une **superposition plein écran** — fond semi-transparent, texte centré avec un fond de lecture confortable, animations fluides. Penser à ces modes "sous-titres" sur Netflix, mais pour une note personnelle.

\`\`\`dart
showGeneralDialog(
  barrierDismissible: true,
  barrierColor: Colors.black54,
  transitionBuilder: (ctx, anim, _, child) => FadeTransition(
    opacity: anim,
    child: ScaleTransition(
      scale: Tween(begin: 0.96, end: 1.0).animate(
        CurvedAnimation(parent: anim, curve: Curves.easeOutCubic)),
      child: child)),
  pageBuilder: (ctx, _, __) => _NoteOverlay(
    initialText: _note,
    onSave: _saveNote,
  ),
);
\`\`\`

La sauvegarde s'effectue dans \`dispose()\` — quelle que soit la façon dont l'overlay se ferme (tap sur le fond, bouton ✕, swipe back Android) :

\`\`\`dart
@override
void dispose() {
  widget.onSave(_ctrl.text); // ← déclenché à chaque fermeture
  _ctrl.dispose();
  super.dispose();
}
\`\`\`

Un bug subtil a été corrigé ici : \`_saveNote\` mettait à jour GCS mais **oubliait de mettre à jour \`_note\` dans le state Flutter**. La preview affichait toujours l'ancien texte jusqu'au prochain rechargement de la page.

\`\`\`dart
// ❌ Avant : seulement le spinner
Future<void> _saveNote(String text) async {
  setState(() => _noteSaving = true);
  await saveNote(year, month, day, text);
  setState(() => _noteSaving = false);
}

// ✅ Après : _note mis à jour en même temps (optimistic update)
Future<void> _saveNote(String text) async {
  setState(() { _noteSaving = true; _note = text; });
  await saveNote(year, month, day, text);
  if (mounted) setState(() => _noteSaving = false);
}
\`\`\`

### La navigation cross-day — un viewer qui franchit les jours

Le viewer plein écran est une \`PageView\` avec navigation swipe. Quand on atteint la dernière photo d'un jour, il charge automatiquement les photos du jour suivant (ou précédent). La transition est fluide — on swipe à travers les jours comme s'ils faisaient partie du même flux.

La difficulté : les jours adjacents ont aussi des \`note.txt\`, \`meta.json\` et \`reactions.json\`. Ces fichiers doivent être filtrés hors des résultats pour ne pas apparaître comme des "photos" dans le viewer.

\`\`\`dart
final filtered = result.items.where((i) =>
    !i.name.endsWith('/note.txt') &&
    !i.name.endsWith('/meta.json') &&
    !i.name.endsWith('/reactions.json')).toList();
\`\`\`

Un bug avait fait que \`_loadAdjacent()\` utilisait \`result.items\` directement sans ce filtre. Résultat : en swipant jusqu'à un jour adjacent, on tombait sur une "photo" qui était en réalité le fichier \`meta.json\` — affiché comme une icône de fichier rose au milieu du viewer.

### Le hook pre-push — ne jamais oublier de builder

Vercel ne peut pas builder Flutter. Le \`build/web\` compilé est commité dans le repo. Plusieurs fois, une modification du code Dart a été committée et déployée **sans rebuilder** — la version live ne reflétait pas les dernières modifications.

Solution : un hook git \`pre-push\` qui bloque le push si les sources Flutter ont changé sans que \`build/web\` ait été mis à jour :

\`\`\`sh
#!/bin/sh
LAST_BUILD_COMMIT=$(git log --oneline -1 --format="%H" -- build/web)
CHANGES=$(git log --oneline "\${LAST_BUILD_COMMIT}..HEAD" -- lib/ pubspec.yaml)

if [ -n "$CHANGES" ]; then
  echo "🚫 build/web désynchronisé avec les sources Flutter."
  echo "Lance : flutter build web --release && git add build/web"
  exit 1
fi
exit 0
\`\`\`

Simple, automatique, impossible à oublier.

---

## Chapitre 7 : Ce que cette app m'a appris

### La mémoire GPU n'est pas la mémoire RAM

C'est la leçon la plus surprenante. En backend Java, "mémoire" signifie heap JVM — un espace bien connu, bien instrumenté, avec GC pour récupérer l'espace.

Dans un moteur de rendu comme CanvasKit, il y a deux espaces mémoire distincts :
- **RAM** : les bytes du fichier téléchargé, les structures de données Dart
- **GPU memory (VRAM)** : l'image décodée, chargée comme texture pour le rendu

Le GC de Dart ne peut pas libérer la mémoire GPU. C'est le renderer qui gère ce cycle de vie. Sur mobile, le budget VRAM par onglet Chrome est faible (~100-200 MB). Dépasser ce budget ne provoque pas un crash propre avec un message d'erreur — ça provoque une corruption silencieuse du renderer, où certains widgets affichent \`errorWidget\` sans qu'aucune exception ne soit levée.

La solution n'est pas de gérer la mémoire plus intelligemment — c'est de **ne jamais charger les grandes images en premier lieu** pour les usages qui n'en ont pas besoin (thumbnails).

### Dart est Kotlin sans le boilerplate

En venant de Java/Kotlin, Dart est une agréable surprise. Les \`async/await\`, les \`Completer\`, les extensions, le null safety — tout ça ressemble à Kotlin mais sans les annotations Spring, sans les configurations XML, sans les 47 couches d'abstraction.

Le pattern sémaphore avec \`Completer<void>\` en est le meilleur exemple : ~20 lignes de code lisibles qui implémentent un mécanisme de concurrence non-trivial. En Java, on aurait utilisé \`Semaphore\` de \`java.util.concurrent\` — puissant mais verbeux.

### Le protocole Open Graph a 16 ans et reste incontournable

Open Graph a été créé par Facebook en 2010 pour standardiser les previews de liens. En 2026, c'est encore le standard universel. WhatsApp, Telegram, iMessage, Slack, Discord — tous lisent les mêmes balises \`og:\`.

La subtilité : les implémentations divergent. Facebook supporte JPEG/PNG/GIF (2010-era). WhatsApp supporte WebP. Telegram est instable selon la version. Le plus petit dénominateur commun est le **JPEG** — le format qui marche partout, toujours.

Un endpoint proxy qui transcode tout en JPEG est la solution la plus robuste, pas la plus élégante. Mais l'utilisateur final voit la preview sur toutes les plateformes — c'est ce qui compte.

### Le sémaphore n'est pas une optimisation, c'est un garde-fou

On pense souvent à la concurrence comme une optimisation (paralléliser pour aller plus vite). Le sémaphore dans ce projet est l'inverse : c'est une **réduction volontaire de la concurrence** pour éviter de dépasser une limite physique (réseau mobile, serverless cold starts).

Le bon nombre de requêtes simultanées n'est pas "le maximum possible". C'est "le maximum que le système en aval peut absorber sans dégrader la qualité de service". Sur réseau mobile : 3.

---

## Épilogue : un album photo qui vit

L'application tourne depuis janvier 2026. Plusieurs centaines de photos et vidéos. Des repas partagés virtuellement, des levers de soleil à 7000 km de distance, une bague photographiée sous tous les angles.

Ma grand-mère sortait son album cartonné, cherchait la bonne page à tâtons, et racontait. Ce geste avait quelque chose d'intime et de rituel que les applications photo grand public — Google Photos, iCloud — ne reproduisent pas. Elles sont faites pour des millions d'utilisateurs, optimisées pour des catalogues de milliers de photos. Pas pour deux personnes qui veulent garder trace d'un repas un mardi soir.

Construire quelque chose soi-même, c'est comprendre chaque couche. La mémoire GPU. L'algorithme HMAC-SHA256. La spec HTML sur les entités. L'histoire divergente des scrapers WhatsApp et Facebook. Ce sont des détails que personne ne devrait connaître pour utiliser une app photo — mais que quelqu'un doit connaître pour en construire une qui fonctionne bien.

Cette app est petite. Deux utilisateurs. Pas de scale, pas de SLA, pas de monitoring. Et pourtant, elle m'a appris plus sur les limites réelles des navigateurs mobiles que n'importe quel article de blog.

---

*Chetana YIN — Février 2026*
*Engineering Manager, développeur Java depuis 2008. Parfois Flutter, parfois Nuxt, toujours curieux.*`

const contentEn = `## Memory is Precious

My parents are refugees of the Khmer Rouge war. They have no childhood photo albums — no photos at all, actually. Everything was lost, or rather deliberately erased. Pol Pot's regime destroyed archives, documents, faces. Keeping a family photo was sometimes enough to risk your life.

I grew up hearing stories. Accounts of people who existed but left no image behind. My mother described her parents, her siblings — silhouettes without faces. Oral memory as the only archive.

So when I wanted to build something to keep from forgetting, the project took on a different weight. Not developer nostalgia. More of an obvious truth: **memory disappears if you don't actively build it**.

Today I live 9,074 km from the person I love. Paris — Phnom Penh. Six hours time difference. Distance is a form of inverted memory: instead of archiving the past, it erases the present. A shared meal, a sunset, a small daily gesture — moments that vanish without somewhere to deposit them together.

So I built a private photo album. A Flutter PWA deployed on Vercel, a Google Cloud Storage bucket, a Nuxt serverless API. Two users. No compromises on security or experience.

What follows is the complete story of building it: the technical choices, the bugs, the optimizations — and what I learned about memory management in a modern multimedia web app.

---

## Chapter 1: The iOS/Android Photo Problem

### Two Phones, Two Ecosystems

Lys is on iPhone. I'm on Android. This seemingly trivial detail dictated the entire project architecture.

A native iOS app requires an Apple Developer account ($99/year) and App Store distribution. For a private two-person app, that's out of the question. AltStore and Sideloadly allow installation without the store, but certificates expire every 7 days — twice a week you'd need to reconnect the iPhone to a computer to re-sign the app. Unacceptable.

The solution: a **Progressive Web App (PWA)**. From Safari on iOS, you can install a PWA to the home screen in two taps. It opens in standalone mode — no Safari navigation bar, full screen — and behaves like a native app. No store, no fees, no renewals.

The challenge: a web PWA and an Android app are normally two separate codebases. Unless you use Flutter.

### Flutter: One Codebase, Two Targets

Flutter compiles the same Dart code to:
- **Android**: native ARM bytecode (AOT compilation), packaged as APK
- **Web**: JavaScript via \`dart2js\` + CanvasKit rendering (WebAssembly)

The result is an identical app on both platforms — same transitions, same UI, same business logic. No hacky "React Native Web", no \`if (Platform.isAndroid)\` scattered everywhere. One project, one language, two targets.

Two features use web-only APIs (\`dart:html\`) — image compression and video thumbnails. Flutter provides **conditional imports** for this:

\`\`\`dart
export 'image_compressor_stub.dart'
    if (dart.library.html) 'image_compressor_web.dart';
\`\`\`

On web: \`dart.library.html\` is true → real canvas implementation.
On Android: empty stub (pass-through). No scattered \`kIsWeb\` checks, no runtime errors.

---

## Chapter 2: Storing Photos Without a Database

### Why GCS Instead of a Database

For storing photos and videos, I chose **Google Cloud Storage** — not a database. The naming convention \`YYYY/MM/DD/filename\` replaces an entire schema:

\`\`\`
listObjects('')            → ['2025/', '2026/']       (years)
listObjects('2026/')       → ['2026/01/', '2026/02/'] (months)
listObjects('2026/02/')    → ['2026/02/22/']          (days)
listObjects('2026/02/22/') → [{name, size, ...}, ...] (files)
\`\`\`

Zero schema, zero migrations, zero database costs. GCS Standard europe-west1 costs ~$0.02/GB/month.

Beyond media files, three JSON files enrich each day: \`note.txt\` (personal note), \`meta.json\` (who uploaded what), \`reactions.json\` (emoji reactions per photo).

---

## Chapter 3: Authentication — Signed URLs and Google OAuth

### Signed URLs v4

The bucket stays private. The app requests a signed URL from the backend, which generates it using the service account key. The URL expires after 1 hour (download) or 15 minutes (upload). Files go directly from device to GCS on upload — the backend never proxies bytes.

The official \`@google-cloud/storage\` SDK breaks when bundled by Nitro/Rollup (prototypes get lost during bundling). Solution: implement the v4 HMAC-SHA256 signing algorithm directly with Node.js's native \`crypto\` module. ~50 lines, zero external dependencies.

---

## Chapter 4: Sharing Memories — The Open Graph Protocol

### Why Flutter PWA Can't Have Link Previews Natively

When you send a link on WhatsApp, Telegram, or Facebook, the app sends a **scraper bot** to visit the URL. The bot reads the HTML and looks for **Open Graph** tags:

\`\`\`html
<meta property="og:image" content="https://...photo.jpg">
<meta property="og:title" content="Chet & Lys — February 22, 2026">
\`\`\`

The fundamental problem with a Flutter Web SPA: the \`index.html\` served by Vercel is **identical for all URLs** — just a \`<script src="main.dart.js">\`. Content is generated client-side after JavaScript loads. **Scraper bots don't execute JavaScript.** They only read raw initial HTML.

### The Preview Proxy

The solution: a server endpoint (\`mon-backend/api/coffre/preview\`) that generates dynamic HTML for each specific photo — including og: tags and a JS redirect for real users.

### The \`&\` vs \`&amp;\` Bug

After deployment, WhatsApp previews worked. Facebook Messenger showed nothing.

Root cause: HTML spec requires \`&\` in attribute values to be encoded as \`&amp;\`. Strict HTML parsers — including Facebook's scraper — truncate attribute values at the first unescaped \`&\`. A GCS signed URL contains multiple \`&\` in its query params. Facebook was receiving a truncated, invalid URL.

Fix: \`imageUrl.replace(/&/g, '&amp;')\` for HTML attribute values. Raw URL kept for \`window.location.replace()\` in JavaScript (which isn't HTML and doesn't need HTML escaping).

### Why WhatsApp Worked But Not Messenger

Despite both being Meta products, WhatsApp and Messenger use entirely separate scraping infrastructure:
- WhatsApp scraper: supports JPEG, PNG, **WebP** ✅
- Messenger (\`facebookexternalhit/1.1\`): JPEG, PNG, GIF only (2010-era spec) ❌ WebP

The JPEG proxy endpoint via \`sharp\` transcodes any source format (WebP, HEIC, PNG, RAW) to universally-supported JPEG before serving it. \`og:image\` now points to this proxy.

---

## Chapter 5: The Memory Wars

### Battle 1: Renderer Crash on Large Files

Raw camera JPEGs (~8 MB, 6000×4000px) decoded at full resolution consume **~96 MB** in GPU memory (6000 × 4000 × 4 bytes RGBA). CanvasKit has a limited GPU memory budget per Chrome tab on mobile. Loading 2-3 simultaneously crashes the renderer silently — \`errorWidget\` appears instead of the photo, no exception thrown.

Fix: \`memCacheWidth: 1920\` in the viewer — Flutter resizes during decoding, 96 MB → ~15 MB.

### Battle 2: Grid Still Unstable

\`memCacheWidth: 300\` on grid thumbnails didn't fix the problem. The issue: Flutter still downloads and decodes the original 8 MB file before resizing to 300px. The initial decode still spikes to 96 MB.

Real fix: never send the original to the device for thumbnails. Use the \`og-image\` proxy with \`?w=300\` — the server (via \`sharp\`) receives the 8 MB RAW, transcodes to a 300px JPEG (~15 KB), sends only that. The device decodes ~270 KB instead of 96 MB.

| Before | After |
|--------|-------|
| Download 8 MB → decode 96 MB → resize 300px | Download 15 KB → decode ~270 KB |
| 9 thumbnails: 864 MB peak | 9 thumbnails: ~2.4 MB peak |

Bonus: HEIC compatibility — Chrome Android doesn't support HEIC natively. All formats now get transcoded to JPEG server-side.

### Battle 3: Network Saturation

With 25 photos in a day, 25 \`initState()\` calls execute simultaneously → 25 parallel \`signDownload\` requests to the Vercel serverless function. Result: simultaneous cold starts, network timeouts, broken tiles.

Fix: a **semaphore** limiting concurrent \`signDownload\` requests to 3:

\`\`\`dart
import 'dart:async'; // Completer lives in dart:async

int _activeUrlFetches = 0;
final List<Completer<void>> _urlFetchQueue = [];

Future<void> _acquireUrlSlot() async {
  if (_activeUrlFetches < 3) { _activeUrlFetches++; return; }
  final c = Completer<void>();
  _urlFetchQueue.add(c);
  await c.future; // suspend here
  _activeUrlFetches++;
}
\`\`\`

\`Completer<void>\` is Dart's primitive for creating a manually-resolvable \`Future\` — the mechanism to "suspend" a coroutine in the queue and "wake it up" when a slot frees.

Why 3? One would be too slow (sequential). Ten returns to saturation problems on mobile networks. Three enables a pipeline (while one request waits for a response, two others advance) without overwhelming mobile networks or Vercel cold starts.

---

## Chapter 6: Lessons Learned

### GPU Memory Is Not RAM

The most surprising lesson. In backend Java, "memory" means JVM heap — well-known, well-instrumented, with GC to reclaim space.

In a rendering engine like CanvasKit, there are two distinct memory spaces: RAM (downloaded bytes, Dart data structures) and GPU memory/VRAM (decoded images loaded as textures). Dart's GC can't free GPU memory. Exceeding the VRAM budget per Chrome tab on mobile doesn't produce a clean error — it causes silent renderer corruption where widgets show \`errorWidget\` without any exception.

The solution isn't smarter memory management — it's **never loading large images in the first place** for use cases that don't need them (thumbnails).

### Open Graph Is 16 Years Old and Still Inescapable

Created by Facebook in 2010, it remains the universal standard in 2026. WhatsApp, Telegram, iMessage, Slack, Discord — all read the same \`og:\` tags. The subtlety: implementations diverge. The lowest common denominator is **JPEG** — the format that works everywhere, always.

A proxy that transcodes everything to JPEG isn't the most elegant solution. But the user sees previews on all platforms — that's what matters.

### The Semaphore Is a Safety Guard, Not an Optimization

We often think of concurrency as an optimization (parallelize to go faster). The semaphore here is the opposite: **voluntary reduction of concurrency** to avoid exceeding a physical limit (mobile network, serverless cold starts).

The right number of simultaneous requests isn't "the maximum possible." It's "the maximum the downstream system can absorb without degrading quality of service." On mobile networks: 3.

---

## Epilogue: A Living Photo Album

The app has been running since January 2026. Several hundred photos and videos. Meals shared virtually, sunrises from 7,000 km away, a ring photographed from every angle.

My grandmother brought out her cardboard album, found the right page by touch, and started telling stories. That gesture had something intimate and ritual that mainstream photo apps — Google Photos, iCloud — don't reproduce. They're built for millions of users, optimized for catalogs of thousands of photos. Not for two people who want to remember a meal on a Tuesday evening.

Building something yourself means understanding every layer. GPU memory. The HMAC-SHA256 algorithm. The HTML spec on entities. The divergent history of WhatsApp and Facebook scrapers. These are details no one should need to know to use a photo app — but someone must know to build one that works well.

This app is small. Two users. No scale, no SLA, no monitoring. And yet it taught me more about the real limits of mobile browsers than any blog post I've read.

---

*Chetana YIN — February 2026*
*Engineering Manager, Java developer since 2008. Sometimes Flutter, sometimes Nuxt, always curious.*`

const contentKm = `## ការចងចាំមានតម្លៃ

ឪពុកម្តាយរបស់ខ្ញុំជាជនភៀសខ្លួននៃសង្គ្រាម ខ្មែរក្រហម។ ពួកគេមិនមានអាល់ប៊ុមរូបថតនៃវ័យកុមារភាព — គ្មានរូបថតសោះ។ អ្វីៗទាំងអស់ត្រូវបានបំផ្លាញ ឬលុបចោលដោយចេតនា។ របបប៉ុលពតបំផ្លាញប័ណ្ណសារ ឯកសារ និងមុខមាត់។ ការរក្សាទុករូបថតគ្រួសារ ជួនកាលគឺគ្រោះថ្នាក់ដល់ជីវិត។

ខ្ញុំធំដឹងក្តីដោយស្តាប់រឿងរ៉ាវ។ ការនិទានអំពីមនុស្សដែលមានជីវិត ប៉ុន្តែមិនមានរូបភាពណាមួយរក្សាទុក។ ម្តាយរបស់ខ្ញុំពណ៌នាអំពីឪពុកម្តាយ និងបងប្អូនរបស់នាង — ស្រមោលដែលគ្មានមុខ។ ការចងចាំផ្ទាល់មាត់ ជាប័ណ្ណសារតែមួយគត់។

ហេតុនេះហើយ ពេលខ្ញុំចង់បង្កើតអ្វីមួយ ដើម្បីកុំភ្លេច គម្រោងបានទទួលទំហំខ្លឹមសារផ្សេង។ **ការចងចាំបាត់បង់ ប្រសិនបើយើងមិនបង្កើតវាដោយសកម្ម**។

ថ្ងៃនេះខ្ញុំរស់នៅ ៩,០៧៤ គីឡូម៉ែត្រ ពីមនុស្សដែលខ្ញុំស្រឡាញ់។ ប៉ារីស — ភ្នំពេញ។ ដូច្នេះខ្ញុំបានបង្កើតអាល់ប៊ុមរូបថតឯកជន — PWA Flutter ដែលដាក់ពង្រាយនៅ Vercel, Google Cloud Storage bucket, API Nuxt serverless។ អ្នកប្រើប្រាស់ពីរនាក់។

អត្ថបទនេះជារឿងរ៉ាវពេញលេញ៖ ជម្រើសបច្ចេកទេស bugs ការកែសម្រួល — និងអ្វីដែលខ្ញុំបានរៀនអំពីការគ្រប់គ្រងអង្គចងចាំ (memory) ក្នុង app web multimedia ទំនើប។

---

## ជំពូកទី ១: បញ្ហា iOS/Android

Lys ប្រើ iPhone។ ខ្ញុំប្រើ Android។ ព័ត៌មានលំអិតនេះបានចុះទម្ងន់ស្ថាបត្យកម្មទាំងមូល។

**ដំណោះស្រាយ**: Progressive Web App (PWA)។ ពី Safari iOS អ្នកអាចដំឡើង PWA ទៅ home screen ក្នុងពីរ taps។ Flutter compile code Dart ដូចគ្នាទៅ Android (APK) និង Web (JavaScript + CanvasKit)។ Project មួយ, ភាសាមួយ, targets ពីរ។

---

## ជំពូកទី ២: ការផ្ទុករូបថតដោយគ្មាន Database

GCS ប្រើ convention (\`YYYY/MM/DD/filename\`) ជំនួស schema database ទាំងស្រុង។ Zero schema, zero migrations, zero database costs។

---

## ជំពូកទី ៣: Authentication — Signed URLs

Bucket នៅឯកជន។ App ស្នើ signed URL ពី backend។ Signed URLs v4 ប្រើ HMAC-SHA256 — ចូលទស្សនបាន ១ ម៉ោង (download) ឬ ១៥ នាទី (upload)។ SDK \`@google-cloud/storage\` ខ្ចាប់ពេល bundle ដោយ Nitro ដូច្នេះ HMAC-SHA256 v4 ត្រូវបានអនុវត្តជាមួយ Node.js \`crypto\` module ដោយផ្ទាល់។

---

## ជំពូកទី ៤: ការចែករំលែកការចងចាំ — Open Graph Protocol

### Scrapers

ពេលផ្ញើ link នៅ WhatsApp, Telegram ឬ Facebook, app បញ្ជូន bot scraper ទៅ visit URL។ Bot អានតែ HTML ដើម — មិន execute JavaScript។ Flutter SPA (Single Page Application) ត្រឡប់ HTML ដូចគ្នាសម្រាប់ URLs ទាំងអស់ — scraper មើលស្ទើរតែទទេ។

**ដំណោះស្រាយ**: endpoint server (\`mon-backend/api/coffre/preview\`) ដែល generate HTML ថាមវន្ត ជាមួយ og:image, og:title, og:description — plus JS redirect ភ្លាមៗ សម្រាប់អ្នកប្រើប្រាស់ពិតប្រាកដ។

### Bug: \`&\` vs \`&amp;\`

Facebook Messenger មិនបង្ហាញ preview ទោះបីជា og:image ត្រឹមត្រូវ។ ហេតុ: \`&\` ក្នុង signed URL GCS មិនត្រូវបាន encode ជា \`&amp;\` ក្នុង HTML attributes។ Facebook's parser កាត់ URL នៅ \`&\` ដំបូង — GCS ទទួល URL ខ្ចោះ, 403 error, គ្មាន preview។

Fix: \`.replace(/&/g, '&amp;')\` សម្រាប់ HTML attributes, URL ដើម រក្សាទុក​ សម្រាប់ JavaScript \`window.location.replace()\`។

### ហេតុអ្វី WhatsApp ឃើញ preview ប៉ុន្តែ Messenger ទេ?

Meta ជាម្ចាស់ WhatsApp និង Messenger ប៉ុន្តែ scrapers ខុសគ្នា។ WhatsApp scraper: JPEG, PNG, WebP ✅។ Messenger (\`facebookexternalhit/1.1\`) ពី 2010: JPEG, PNG, GIF ❌ WebP។

**ដំណោះស្រាយ**: endpoint proxy \`/api/coffre/og-image\` ដែលប្រើ \`sharp\` (Node.js) transcode format ណាក៏ដោយ (WebP, HEIC, PNG, RAW) ទៅ JPEG universal។

---

## ជំពូកទី ៥: សមរភូមិប្រឆាំងអង្គចងចាំ

### សមរភូមិ ១: Renderer Crash

JPEG ពី camera Lumix (~8 MB, 6000×4000 pixels) decode ពេញ resolution = **~96 MB** GPU memory (6000 × 4000 × 4 bytes RGBA)។ CanvasKit មាន budget GPU memory ត្រឹមតែ per Chrome tab នៅ mobile Android។ Load 2-3 images ដំណាលគ្នា crash renderer — \`errorWidget\` បង្ហាញ ជំនួស image ដោយគ្មាន exception។

Fix: \`memCacheWidth: 1920\` ក្នុង viewer — Flutter resize ក្នុងពេល decode, 96 MB → ~15 MB។

### សមរភូមិ ២: Grid Unstable

\`memCacheWidth: 300\` ក្នុង thumbnails grid មិនដោះស្រាយ root cause: Flutter ត្រូវ download និង decode original 8 MB ជាមុន ហើយបន្ទាប់ resize ទៅ 300px។ Peak memory នៅដដែល ~96 MB ក្នុងពេល decode។

**ដំណោះស្រាយ**: ប្រើ proxy \`og-image?path=...&w=300\` ដោយផ្ទាល់ ជា source thumbnails grid។ Server (via \`sharp\`) ទទួល RAW 8MB, transcode ទៅ JPEG 300px (~15 KB), ផ្ញើ file តូចនោះ។ Device decode ~270 KB ជំនួស 96 MB។

| មុន | ក្រោយ |
|-----|-------|
| Download 8 MB → decode 96 MB | Download 15 KB → decode ~270 KB |
| 9 thumbnails: peak 864 MB | 9 thumbnails: peak ~2.4 MB |

Bonus: HEIC compatibility — Chrome Android មិន support HEIC ដើម → \`sharp\` transcode ក្នុង server ដោយស្វ័យប្រវត្តិ។

### សមរភូមិ ៣: Network Saturation

ជាមួយ 25 photos ក្នុងថ្ងៃ, 25 \`initState()\` execute ដំណាលគ្នា → 25 requests \`signDownload\` ដំណាលគ្នា → Vercel cold starts + network timeouts → tiles ខ្ចោះ។

**ដំណោះស្រាយ**: **Semaphore** ដែលកំណត់ concurrent \`signDownload\` requests ទៅ ៣:

\`\`\`dart
import 'dart:async'; // Completer ស្ថិតក្នុង dart:async

int _activeUrlFetches = 0;
final List<Completer<void>> _urlFetchQueue = [];

Future<void> _acquireUrlSlot() async {
  if (_activeUrlFetches < 3) { _activeUrlFetches++; return; }
  final c = Completer<void>();
  _urlFetchQueue.add(c);
  await c.future; // ← ផ្អាកនៅទីនេះ
  _activeUrlFetches++;
}
\`\`\`

\`Completer<void>\` ជា primitive Dart ដើម្បីបង្កើត Future ដែលអាចដោះស្រាយដោយដៃ — mechanism ដើម្បី "suspend" coroutine ក្នុង queue ហើយ "wake up" ពេល slot ទំ។

ហេតុអ្វីបាន ៣? ១ lent ពេក (sequential)។ ១០ ត្រឡប់ទៅ saturation។ ៣ អនុញ្ញាតឱ្យ pipeline មានប្រសិទ្ធភាព ដោយមិន overwhelm mobile network។

---

## ជំពូកទី ៦: អ្វីដែលខ្ញុំបានរៀន

**GPU Memory មិនមែន RAM**: Dart's GC មិនអាចដោះ GPU memory។ Exceed budget VRAM per Chrome tab នៅ mobile → renderer corruption ស្ងាត់ → errorWidget គ្មាន exception។ ដំណោះស្រាយ: មិនដែល load images ធំ ក្នុង use cases ដែលមិនត្រូវការ (thumbnails)។

**Open Graph ១៦ ឆ្នាំ ហើយនៅតែ essential**: WhatsApp, Telegram, iMessage, Slack — ទាំងអស់អាន og: tags ដូចគ្នា ប៉ុន្តែ implementations ខុសគ្នា (WebP support, JPEG only, etc.)។ JPEG ជា lowest common denominator — format ដែលដំណើរការគ្រប់ platform។

**Semaphore ជា Safety Guard មិនមែន Optimization**: ចំនួន requests ដំណាលគ្នាត្រឹមត្រូវ មិនមែន "maximum possible" ប៉ុន្តែ "maximum ដែល downstream system អាចទទួលបាន ដោយមិនបន្ថយ quality"។ នៅ mobile network: ៣។

---

## បញ្ចប់

App នេះ run ចាប់ពីខែមករា ២០២៦។ រូបថតនិងវីដេអូជាច្រើនរយ។ អាហារដែលចែករំលែកតាម virtual, ថ្ងៃរះ ៧,០០០ km ឆ្ងាយ, ចិញ្ចៀនដែលថតពីគ្រប់ angle។

ការបង្កើតអ្វីមួយដោយខ្លួនឯង មានន័យថាយល់ដឹងគ្រប់ layer: GPU memory, HMAC-SHA256, HTML spec, ប្រវត្តិ scrapers WhatsApp vs Facebook។

App នេះតូច — អ្នកប្រើប្រាស់ពីរ — ប៉ុន្តែវាបានបង្រៀនខ្ញុំ អំពី limits ពិតប្រាកដ នៃ mobile browsers ជាងអត្ថបទ blog ណាមួយ។

---

*Chetana YIN — កុម្ភៈ ២០២៦*
*Engineering Manager, អ្នកអភិវឌ្ឍន៍ Java ចាប់ពី ២០០៨។ ជួនកាល Flutter, ជួនកាល Nuxt, ចង់ដឹងចង់ឃើញជានិច្ច។*`

async function seedBlogCoffrePhoto() {
  console.log('📸  Seeding blog article: Coffre — app photo privée cross-platform...')

  await db.delete(blogPosts).where(eq(blogPosts.slug, 'coffre-photo-pwa-flutter-optimisation-memoire'))

  await db.insert(blogPosts).values({
    slug: 'coffre-photo-pwa-flutter-optimisation-memoire',
    titleFr: 'Construire une app photo privée cross-platform : de la mémoire humaine à la gestion mémoire GPU',
    titleEn: 'Building a private cross-platform photo app: from human memory to GPU memory management',
    titleKm: 'ការបង្កើត app រូបថតឯកជន cross-platform: ពីការចងចាំរបស់មនុស្ស រហូតដល់ GPU memory management',
    contentFr,
    contentEn,
    contentKm,
    excerptFr: "De l'album photo de ma grand-mère à une PWA Flutter optimisée pour iOS et Android : retour d'expérience complet sur les défis de la gestion mémoire GPU, du protocole Open Graph, des signed URLs GCS, et du sémaphore pour contrôler les requêtes réseau concurrentes.",
    excerptEn: "From my grandmother's photo album to an optimized Flutter PWA for iOS and Android: a complete experience report on GPU memory management challenges, the Open Graph protocol, GCS signed URLs, and semaphore-based network concurrency control.",
    excerptKm: "ពីអាល់ប៊ុមរូបថតរបស់យាយ រហូតដល់ Flutter PWA ដែលបានធ្វើ optimize សម្រាប់ iOS និង Android: របាយការណ៍បទពិសោធន៍ពេញលេញ លើ GPU memory, Open Graph protocol, GCS signed URLs, និង semaphore concurrency control។",
    tags: ['Flutter', 'PWA', 'GCS', 'Performance', 'OpenGraph', 'Mobile'],
    published: true
  })

  console.log('✅ Blog article seeded successfully!')
  process.exit(0)
}

seedBlogCoffrePhoto().catch(console.error)
