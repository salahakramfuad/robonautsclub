import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, Images } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { collectArticleImageUrls } from '@/lib/news-ui'
import { buildPageMetadata } from '@/lib/seo-metadata'
import { getNewsArticleBySlug } from '../../actions'
import NewsPhotosGrid from '@/components/news/NewsPhotosGrid'

export const revalidate = 1800

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getNewsArticleBySlug(slug)
  if (!article) {
    return { title: 'Photos' }
  }

  const path = `/news/${article.slug}/photos`
  const urls = collectArticleImageUrls(article)

  return buildPageMetadata({
    title: `Photos — ${article.title} | ${SITE_CONFIG.name}`,
    description: `Images from "${article.title}" at Robonauts.`,
    path,
    absoluteTitle: true,
    ogImage: urls[0]
      ? { url: urls[0], alt: article.title }
      : {
          url: '/roboclass.jpg',
          width: 1200,
          height: 630,
          alt: article.title,
        },
  })
}

export default async function NewsArticlePhotosPage({ params }: Props) {
  const { slug } = await params
  const article = await getNewsArticleBySlug(slug)
  if (!article) notFound()

  const urls = collectArticleImageUrls(article)
  if (urls.length === 0) notFound()

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50/80">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href={`/news/${article.slug}`}
          prefetch={false}
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to article
        </Link>

        <header className="mt-8 mb-8 sm:mb-10">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Images className="w-5 h-5" />
            <span className="text-sm font-medium">Photo gallery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Photos — {article.title}
          </h1>
        </header>

        <NewsPhotosGrid images={urls} />
      </div>
    </div>
  )
}
