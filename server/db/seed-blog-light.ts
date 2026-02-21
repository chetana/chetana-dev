import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { blogPosts } from './schema'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const contentFr = `## Introduction

Il y a des sujets dans le monde du développement qui déclenchent des guerres de religion. Tabs vs spaces. Vim vs Emacs. Et bien sûr : **dark theme vs light theme**.

Pendant près de 15 ans, j'ai été un partisan inconditionnel du dark theme. Terminal noir, IDE noir, navigateur en dark mode, même mon téléphone. Tout était sombre. C'était mon identité de développeur, forgée dès mes débuts à EPITECH vers 2008, quand j'avais 20 ans.

Et puis, vers 35 ans, j'ai basculé. Complètement. Mon IDE est en light theme. Mon terminal aussi. Mon site perso — celui que vous lisez en ce moment — vient de passer en fond clair.

Ce n'est pas un caprice. C'est une évolution naturelle, et je vais vous expliquer pourquoi.

## Le mythe du "vrai développeur" en dark mode

Soyons honnêtes : le dark theme est devenu un marqueur culturel. Dans l'imaginaire collectif, un "vrai dev" code dans le noir, avec un terminal vert sur fond noir comme dans Matrix. Les mèmes sont partout. "Light theme users are psychopaths." On rit, mais ça crée une vraie pression sociale.

Quand j'ai commencé à coder à 20 ans, en 2008, les écrans LCD étaient médiocres. Mauvais contraste, faible luminosité, angles de vue limités. Sur ces dalles, le texte clair sur fond sombre était objectivement plus lisible. Le dark theme n'était pas juste un choix esthétique — c'était une nécessité ergonomique.

Mais les écrans ont changé. Et nous aussi.

## Ce que dit la science

Commençons par les faits. Plusieurs études en ergonomie visuelle ont démontré que :

**La polarité positive (texte foncé sur fond clair) améliore la lisibilité.** Une méta-analyse de Piepenbrock et al. (2013) publiée dans *Ergonomics* a montré que les performances de lecture sont meilleures en polarité positive, surtout pour les textes longs. La raison est physiologique : en polarité positive, la pupille se contracte, ce qui augmente la profondeur de champ et réduit les aberrations optiques.

**L'astigmatisme affecte la moitié de la population.** Pour les personnes astigmates (et beaucoup ne le savent pas), le texte blanc sur fond noir crée un effet de "halation" — les lettres brillent et bavourent. Ce phénomène est quasiment absent en mode clair.

**La fatigue oculaire augmente avec l'âge.** À partir de 35-40 ans, la presbytie commence. Le cristallin perd en élasticité, l'accommodation est plus difficile. Les hauts contrastes du dark theme (blanc pur sur noir pur) deviennent fatigants. Le light theme, avec ses contrastes plus doux, est plus reposant pour les yeux vieillissants.

Je suis né le 8 août 1988. J'ai 37 ans. Mon ophtalmologue m'a confirmé ce que je sentais depuis un moment : mes yeux ont changé. La presbytie pointe son nez. Et le dark theme, que j'ai adoré pendant 15 ans, est devenu un facteur de fatigue plutôt que de confort.

## Les chiffres de l'industrie

Le sondage Stack Overflow Developer Survey a longtemps montré une domination écrasante du dark theme (~70-75% des développeurs). Mais les chiffres évoluent. Les analyses UX récentes montrent que :

- Sur mobile, les modes clairs ont un taux de lisibilité supérieur en conditions d'éclairage normal
- Les designers UX professionnels utilisent majoritairement le light theme pour le travail de jour
- Les développeurs seniors (10+ ans d'expérience) sont surreprésentés parmi les utilisateurs de light theme
- Les études de productivité ne montrent aucune différence significative entre dark et light en termes de vitesse de codage

Le dark theme reste populaire, et c'est très bien. Mais l'idée qu'il est objectivement "meilleur" ne tient pas face aux données.

## Les écrans modernes changent la donne

En 2008, quand j'ai commencé, je codais sur un moniteur TN 19 pouces. En 2026, je suis devant un écran IPS 27 pouces avec un rapport de contraste de 1000:1, une luminosité de 350 nits, et un traitement anti-reflet.

Les dalles modernes (IPS, OLED, Mini-LED) affichent un noir profond et un blanc pur sans fatigue. Le light theme sur un bon écran est incomparablement plus lisible qu'il ne l'était il y a 15 ans. L'argument technique qui justifiait le dark theme a largement disparu.

De plus, les systèmes d'exploitation modernes proposent des fonctions comme :

- **Night Shift / flux** : réduction automatique de la lumière bleue le soir
- **True Tone** : adaptation de la température couleur à l'éclairage ambiant
- **Auto-brightness** : ajustement dynamique de la luminosité

Ces technologies rendent le light theme parfaitement confortable à toute heure.

## Le parallèle avec d'autres évolutions

Ce passage du dark au light n'est pas un phénomène isolé. C'est une tendance que j'observe dans beaucoup de domaines de ma vie :

**Le café.** À 20 ans, je buvais du café noir, le plus fort possible. Double espresso, pas de sucre, pas de lait. Aujourd'hui ? Un latte oat milk, parfois un matcha. Ce n'est pas que le café noir est "mauvais" — c'est que mes goûts ont évolué vers la nuance.

**La musique.** Adolescent, j'écoutais du metal progressif, du Meshuggah, du Tool. Du complexe, du technique, du loud. Aujourd'hui, ma playlist alterne entre du jazz, de la lo-fi, et du Radiohead. L'énergie brute a cédé la place à l'atmosphère.

**Les vêtements.** Tout noir, tout le temps. Maintenant ? Du gris clair, du bleu marine, même du beige. Impensable à 25 ans.

**Le bureau.** Mon setup de 20 ans : LEDs RGB, fond d'écran sombre, ambiance gaming. Mon bureau de 37 ans : lumière naturelle, mur blanc, plante verte, minimalisme.

Le pattern est le même partout : on passe de l'intensité à la sérénité. Du maximalisme au minimalisme. Du contraste extrême à la douceur. Et ce n'est pas un signe de faiblesse — c'est un signe de maturité.

## L'argument de la productivité

Soyons pragmatiques. En tant qu'Engineering Manager, je passe mes journées à :

- Lire du code (code reviews)
- Lire des documents (specs, RFCs, post-mortems)
- Écrire des messages (Slack, email, Notion)
- Participer à des réunions (écran partagé)

Pour toutes ces activités, le light theme offre un avantage concret : **la cohérence visuelle**. Les documents sont en fond blanc. Les slides sont en fond blanc. Les emails sont en fond blanc. Quand mon IDE est aussi en fond blanc, mes yeux ne font plus de gymnastique permanente entre les modes.

Cette cohérence réduit la charge cognitive. Moins de transitions brutales, moins de fatigue, moins d'effort d'adaptation. Sur une journée de 8-10 heures d'écran, ça fait une différence mesurable.

## Le mythe de la batterie

"Le dark theme économise la batterie." C'est vrai — sur les écrans OLED. Sur un écran LCD (c'est-à-dire la majorité des moniteurs de bureau), chaque pixel consomme la même énergie quelle que soit sa couleur. L'argument batterie est pertinent sur smartphone OLED, mais pas sur votre écran de 27 pouces.

## Comment j'ai fait la transition

La transition ne s'est pas faite du jour au lendemain. Voici comment j'ai procédé :

1. **D'abord le navigateur.** J'ai désactivé le dark mode de Chrome et forcé les sites en mode standard. C'est là que j'ai réalisé que le web est conçu pour le light theme — les sites sont plus beaux, les images plus fidèles.

2. **Puis l'IDE.** J'ai essayé "GitHub Light" sur VS Code. Les premières heures sont étranges, comme porter des lunettes pour la première fois. Mais en 48 heures, c'était devenu naturel.

3. **Le terminal.** C'est le plus dur psychologiquement. Un terminal blanc, c'est comme trahir ses origines. Mais la lisibilité est tellement supérieure que je ne suis jamais revenu en arrière.

4. **Le téléphone.** Dernier bastion. Le dark mode sur iPhone, je l'avais depuis iOS 13. L'enlever m'a fait réaliser à quel point les apps sont plus belles en mode clair.

5. **Mon site perso.** La dernière étape. Passer chetana.dev en light theme, c'est un statement. C'est dire publiquement : j'ai changé, et j'assume.

## Ce n'est pas une trahison

Je ne dis pas que le dark theme est mauvais. Je dis qu'il n'est pas universel, et que changer n'est pas une faiblesse.

Le dark theme reste excellent pour :
- Le travail de nuit (vraiment de nuit, lumières éteintes)
- Les environnements très sombres
- Les personnes photosensibles
- L'esthétique de certaines applications (jeux, médias)

Mais l'ériger en standard absolu, en marqueur d'identité de développeur, c'est absurde. C'est comme dire que les vrais musiciens ne jouent que du metal, ou que les vrais amateurs de café ne boivent que de l'espresso.

## Conclusion

À 20 ans, j'ai choisi le dark theme parce que c'était ce qu'on faisait. À 37 ans, j'ai choisi le light theme parce que c'est ce qui me convient.

L'évolution n'est pas une trahison. C'est la preuve qu'on continue à écouter son corps, à questionner ses habitudes, et à faire des choix intentionnels plutôt que de suivre la convention.

Si vous êtes un développeur dark theme convaincu, c'est très bien. Restez-y. Mais si vous sentez une fatigue oculaire croissante, si vous avez passé la trentaine, si vous commencez à plisser les yeux devant votre écran — essayez. Juste une semaine. Vous pourriez être surpris.

Et si quelqu'un vous traite de "psychopath" parce que vous codez en light theme, répondez-lui simplement : **"J'ai évolué."**

---

*Chetana YIN — Février 2026*
*Engineering Manager, développeur depuis 2008, converti au light theme depuis 2024.*`

const contentEn = `## Introduction

There are topics in the software development world that trigger holy wars. Tabs vs spaces. Vim vs Emacs. And of course: **dark theme vs light theme**.

For nearly 15 years, I was an unwavering dark theme advocate. Black terminal, black IDE, dark mode browser, even my phone. Everything was dark. It was my developer identity, forged from my earliest days at EPITECH around 2008, when I was 20 years old.

And then, around 35, I switched. Completely. My IDE is light theme. My terminal too. My personal website — the one you're reading right now — just went light.

This isn't a whim. It's a natural evolution, and I'll explain why.

## The myth of the "real developer" in dark mode

Let's be honest: dark theme has become a cultural marker. In the collective imagination, a "real dev" codes in the dark, with green text on a black terminal like in The Matrix. The memes are everywhere. "Light theme users are psychopaths." We laugh, but it creates real social pressure.

When I started coding at 20, in 2008, LCD screens were mediocre. Poor contrast, low brightness, limited viewing angles. On those panels, light text on a dark background was objectively more readable. Dark theme wasn't just an aesthetic choice — it was an ergonomic necessity.

But screens have changed. And so have we.

## What science says

Let's start with the facts. Several visual ergonomics studies have demonstrated that:

**Positive polarity (dark text on light background) improves readability.** A meta-analysis by Piepenbrock et al. (2013) published in *Ergonomics* showed that reading performance is better in positive polarity, especially for long texts. The reason is physiological: in positive polarity, the pupil contracts, which increases depth of field and reduces optical aberrations.

**Astigmatism affects half the population.** For astigmatic people (and many don't know they are), white text on a black background creates a "halation" effect — letters glow and bleed. This phenomenon is virtually absent in light mode.

**Eye fatigue increases with age.** From 35-40 years old, presbyopia begins. The crystalline lens loses elasticity, accommodation becomes harder. The high contrasts of dark theme (pure white on pure black) become tiring. Light theme, with its softer contrasts, is more restful for aging eyes.

I was born on August 8, 1988. I'm 37 years old. My ophthalmologist confirmed what I'd been feeling for a while: my eyes have changed. Presbyopia is starting. And dark theme, which I loved for 15 years, has become a fatigue factor rather than a comfort.

## Industry numbers

The Stack Overflow Developer Survey has long shown overwhelming dark theme dominance (~70-75% of developers). But the numbers are evolving. Recent UX analyses show that:

- On mobile, light modes have higher readability rates under normal lighting conditions
- Professional UX designers predominantly use light theme for daytime work
- Senior developers (10+ years of experience) are overrepresented among light theme users
- Productivity studies show no significant difference between dark and light in terms of coding speed

Dark theme remains popular, and that's perfectly fine. But the idea that it's objectively "better" doesn't hold up against the data.

## Modern screens change everything

In 2008, when I started, I coded on a 19-inch TN monitor. In 2026, I'm in front of a 27-inch IPS display with a 1000:1 contrast ratio, 350 nits of brightness, and anti-glare coating.

Modern panels (IPS, OLED, Mini-LED) display deep blacks and pure whites without fatigue. Light theme on a good screen is incomparably more readable than it was 15 years ago. The technical argument that justified dark theme has largely disappeared.

Moreover, modern operating systems offer features like:

- **Night Shift / f.lux**: automatic blue light reduction in the evening
- **True Tone**: color temperature adaptation to ambient lighting
- **Auto-brightness**: dynamic brightness adjustment

These technologies make light theme perfectly comfortable at any time of day.

## Parallels with other evolutions

This dark-to-light transition isn't an isolated phenomenon. It's a trend I observe in many areas of my life:

**Coffee.** At 20, I drank black coffee, as strong as possible. Double espresso, no sugar, no milk. Today? An oat milk latte, sometimes a matcha. It's not that black coffee is "bad" — my tastes have evolved toward nuance.

**Music.** As a teenager, I listened to progressive metal — Meshuggah, Tool. Complex, technical, loud. Today, my playlist alternates between jazz, lo-fi, and Radiohead. Raw energy has given way to atmosphere.

**Clothing.** All black, all the time. Now? Light gray, navy blue, even beige. Unthinkable at 25.

**The desk setup.** My 20-year-old setup: RGB LEDs, dark wallpaper, gaming ambiance. My 37-year-old desk: natural light, white wall, green plant, minimalism.

The pattern is the same everywhere: we move from intensity to serenity. From maximalism to minimalism. From extreme contrast to softness. And it's not a sign of weakness — it's a sign of maturity.

## The productivity argument

Let's be pragmatic. As an Engineering Manager, I spend my days:

- Reading code (code reviews)
- Reading documents (specs, RFCs, post-mortems)
- Writing messages (Slack, email, Notion)
- Attending meetings (shared screens)

For all these activities, light theme offers a concrete advantage: **visual consistency**. Documents are on white backgrounds. Slides are on white backgrounds. Emails are on white backgrounds. When my IDE is also on a white background, my eyes stop doing permanent gymnastics between modes.

This consistency reduces cognitive load. Fewer harsh transitions, less fatigue, less adaptation effort. Over an 8-10 hour screen day, it makes a measurable difference.

## The battery myth

"Dark theme saves battery." That's true — on OLED screens. On an LCD screen (which is the majority of desktop monitors), every pixel consumes the same energy regardless of its color. The battery argument is relevant on an OLED smartphone, but not on your 27-inch monitor.

## How I made the transition

The transition didn't happen overnight. Here's how I proceeded:

1. **The browser first.** I disabled Chrome's dark mode and forced sites to standard mode. That's when I realized the web is designed for light theme — sites look better, images are more faithful.

2. **Then the IDE.** I tried "GitHub Light" on VS Code. The first hours are strange, like wearing glasses for the first time. But within 48 hours, it felt natural.

3. **The terminal.** This is the hardest psychologically. A white terminal feels like betraying your origins. But the readability is so superior that I never went back.

4. **The phone.** Last bastion. Dark mode on iPhone — I'd had it since iOS 13. Removing it made me realize how much better apps look in light mode.

5. **My personal site.** The final step. Switching chetana.dev to light theme is a statement. It's publicly saying: I've changed, and I own it.

## It's not a betrayal

I'm not saying dark theme is bad. I'm saying it's not universal, and changing isn't weakness.

Dark theme remains excellent for:
- Working at night (truly at night, lights off)
- Very dark environments
- Photosensitive individuals
- The aesthetics of certain applications (games, media)

But elevating it to an absolute standard, a developer identity marker, is absurd. It's like saying real musicians only play metal, or real coffee lovers only drink espresso.

## Conclusion

At 20, I chose dark theme because that's what everyone did. At 37, I chose light theme because it's what suits me.

Evolution isn't betrayal. It's proof that you keep listening to your body, questioning your habits, and making intentional choices rather than following convention.

If you're a convinced dark theme developer, that's great. Stick with it. But if you feel increasing eye fatigue, if you've passed thirty, if you're starting to squint at your screen — try it. Just for a week. You might be surprised.

And if someone calls you a "psychopath" for coding in light theme, just tell them: **"I've evolved."**

---

*Chetana YIN — February 2026*
*Engineering Manager, developer since 2008, light theme convert since 2024.*`

async function seed() {
  console.log('🌱 Seeding blog article: dark → light theme...')

  await db.insert(blogPosts).values({
    slug: 'dark-theme-light-theme-transition',
    titleFr: 'Du dark theme au light theme : pourquoi j\'ai changé après 15 ans',
    titleEn: 'From dark theme to light theme: why I switched after 15 years',
    titleKm: 'ពី dark theme ទៅ light theme៖ ហេតុអ្វីខ្ញុំផ្លាស់ប្តូរបន្ទាប់ពី ១៥ ឆ្នាំ',
    contentFr,
    contentEn,
    contentKm: `## សេចក្តីផ្តើម

មានប្រធានបទក្នុងពិភពអភិវឌ្ឍន៍កម្មវិធីដែលបង្កើតសង្គ្រាមសាសនា។ Tabs vs spaces។ Vim vs Emacs។ ហើយពិតណាស់៖ **dark theme vs light theme**។

អស់រយៈពេលជិត ១៥ ឆ្នាំ ខ្ញុំជាអ្នកគាំទ្រ dark theme មិនរំកិល។ Terminal ខ្មៅ IDE ខ្មៅ browser ក្នុង dark mode សូម្បីតែទូរស័ព្ទ។ អ្វីៗទាំងអស់ងងឹត។ វាជាអត្តសញ្ញាណអ្នកអភិវឌ្ឍន៍របស់ខ្ញុំ បង្កើតតាំងពីថ្ងៃដំបូងនៅ EPITECH ប្រមាណឆ្នាំ 2008 នៅពេលខ្ញុំមានអាយុ ២០ ឆ្នាំ។

ហើយបន្ទាប់មក ប្រមាណអាយុ ៣៥ ខ្ញុំបានផ្លាស់ប្តូរ។ ទាំងស្រុង។ IDE របស់ខ្ញុំជា light theme។ Terminal របស់ខ្ញុំក៏ដូចគ្នា។ គេហទំព័រផ្ទាល់ខ្លួនរបស់ខ្ញុំ — ដែលអ្នកកំពុងអាននៅពេលនេះ — ទើបតែផ្លាស់ប្តូរទៅពណ៌ភ្លឺ។

នេះមិនមែនជាឆន្ទៈទេ។ វាជាការវិវត្តន៍ធម្មជាតិ ហើយខ្ញុំនឹងពន្យល់ពីមូលហេតុ។

## សេចក្តីសន្និដ្ឋាន

នៅអាយុ ២០ ខ្ញុំបានជ្រើសរើស dark theme ព្រោះវាជាអ្វីដែលគ្រប់គ្នាធ្វើ។ នៅអាយុ ៣៧ ខ្ញុំបានជ្រើសរើស light theme ព្រោះវាសមស្របនឹងខ្ញុំ។

ការវិវត្តន៍មិនមែនជាការក្បត់ទេ។ វាជាភស្តុតាងថាអ្នកបន្តស្តាប់រាងកាយរបស់អ្នក សួរសំណួរពីទម្លាប់របស់អ្នក និងធ្វើការសម្រេចចិត្តដោយចេតនាជំនួសឱ្យការធ្វើតាមទម្រង់។`,
    excerptFr: 'Après 15 ans de dark theme, j\'ai basculé en light. Physiologie, science, écrans modernes et évolution personnelle : pourquoi ce n\'est pas une trahison mais une maturité.',
    excerptEn: 'After 15 years of dark theme, I switched to light. Physiology, science, modern screens and personal evolution: why it\'s not betrayal but maturity.',
    excerptKm: 'បន្ទាប់ពី ១៥ ឆ្នាំនៃ dark theme ខ្ញុំបានផ្លាស់ប្តូរទៅ light។ រូបវិទ្យា វិទ្យាសាស្ត្រ អេក្រង់ទំនើប និងការវិវត្តន៍ផ្ទាល់ខ្លួន៖ ហេតុអ្វីវាមិនមែនជាការក្បត់ ប៉ុន្តែជាភាពចាស់ទុំ។',
    tags: ['Opinion', 'Developer Life', 'UX'],
    published: true
  })

  console.log('✅ Blog article seeded successfully!')
}

seed().catch(console.error)
