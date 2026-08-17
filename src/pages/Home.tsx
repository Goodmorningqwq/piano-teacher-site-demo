import { useEffect } from 'react'
import { EN_PREFIX, siteOrigin, useLang } from '@/i18n/language-context'
import { useTheme } from '@/theme/theme-context'
import { useProfile, useSettings } from '@/hooks/useContent'
import { SiteNav } from '@/components/layout/SiteNav'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Courses } from './sections/Courses'
import { Videos } from './sections/Videos'
import { Contact } from './sections/Contact'

export default function Home() {
  const { lang, text } = useLang()
  const { data: profile } = useProfile()
  const { data: settings } = useSettings()
  const { applySiteDefault } = useTheme()

  // Honour the default appearance chosen in /admin, unless this visitor
  // has already picked a theme for themselves.
  useEffect(() => {
    if (settings?.default_theme) applySiteDefault(settings.default_theme)
  }, [settings?.default_theme, applySiteDefault])

  // Drop the placeholder <title>/<meta> from index.html now that React has
  // rendered the real ones, so the document has exactly one of each.
  useEffect(() => {
    for (const node of document.querySelectorAll('head [data-static-meta]')) {
      node.remove()
    }
  }, [])

  const title = text(settings, 'seo_title') || text(profile, 'name')
  const description = text(settings, 'seo_description') || text(profile, 'tagline')

  const origin = siteOrigin()
  const zhUrl = `${origin}/`
  const enUrl = `${origin}${EN_PREFIX}`
  const canonical = lang === 'zh' ? zhUrl : enUrl

  return (
    <>
      {/* React 19 hoists these into <head> automatically. */}
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Tells Google these two URLs are the same page in two languages,
          so it indexes both and serves the right one — rather than
          treating them as duplicates and picking one. */}
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="zh-Hant" href={zhUrl} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="x-default" href={zhUrl} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={lang === 'zh' ? 'zh_HK' : 'en_HK'} />
      <meta
        property="og:locale:alternate"
        content={lang === 'zh' ? 'en_HK' : 'zh_HK'}
      />
      {settings?.hero_image_url && (
        <meta property="og:image" content={settings.hero_image_url} />
      )}
      <meta name="twitter:card" content="summary_large_image" />

      <StructuredData />

      <SiteNav />
      <main id="main">
        <Hero />
        <About />
        <Courses />
        <Videos />
        <Contact />
      </main>
      <SiteFooter />
    </>
  )
}

/**
 * Schema.org markup so search engines understand this is a local music
 * teacher — the thing that gets the site into "piano teacher near me"
 * results rather than just matching on keywords.
 */
function StructuredData() {
  const { text } = useLang()
  const { data: profile } = useProfile()
  const { data: settings } = useSettings()

  if (!profile) return null

  const data = {
    '@context': 'https://schema.org',
    '@type': 'MusicSchool',
    name: text(profile, 'name'),
    description: text(settings, 'seo_description') || text(profile, 'tagline'),
    ...(profile.email ? { email: profile.email } : {}),
    ...(profile.phone ? { telephone: profile.phone } : {}),
    ...(profile.portrait_url ? { image: profile.portrait_url } : {}),
    areaServed: 'Hong Kong',
    address: {
      '@type': 'PostalAddress',
      addressLocality: text(profile, 'address') || 'Hong Kong',
      addressCountry: 'HK',
    },
    founder: {
      '@type': 'Person',
      name: text(profile, 'name'),
      jobTitle: text(profile, 'tagline'),
    },
  }

  return (
    <script
      type="application/ld+json"
      // Content is authored by the site owner through /admin, not by visitors.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
