import { defineSitemapEventHandler } from '#imports'

// AI-DEV: Passe par chetaku-rs (cache S3, TTL 24h) au lieu de taper directement
// chetana-portfolio. Avant : cache Nitro `swr:86400` en MÉMOIRE uniquement, perdu à
// chaque scale-to-zero → chaque crawl de /sitemap.xml sur un container froid réveillait
// la base. Les endpoints /blog et /projects de chetaku-rs sont déjà cachés en S3.
const API = 'https://chetaku.chetana.fr'

type BlogRaw = { slug: string; updated_at: string; created_at: string }
type ProjectRaw = { slug: string; created_at: string }

export default defineSitemapEventHandler(async () => {
  const [posts, allProjects] = await Promise.all([
    $fetch<BlogRaw[]>(`${API}/blog`),
    $fetch<ProjectRaw[]>(`${API}/projects`)
  ])

  return [
    ...posts.map(post => ({
      loc: `/blog/${post.slug}`,
      lastmod: post.updated_at || post.created_at
    })),
    ...allProjects.map(project => ({
      loc: `/projects/${project.slug}`,
      lastmod: project.created_at
    }))
  ]
})
