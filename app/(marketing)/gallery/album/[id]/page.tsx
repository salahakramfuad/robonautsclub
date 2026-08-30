import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { ArrowLeft, Calendar, Images, MapPin } from 'lucide-react'
import { effectiveGalleryDisplayRaw } from '@/lib/publicContentDates'
import { getBreadcrumbSchema } from '@/lib/seo'
import { buildPageMetadata } from '@/lib/seo-metadata'
import { getPublicGalleryGroupById } from '../../actions'
import ImageLightboxGallery from '@/components/ImageLightboxGallery'

export const revalidate = 1800

type Props = { params: Promise<{ id: string }> }

function formatDisplayDate(iso: string | Date | null) {
  if (iso == null) return ''
  try {
    const d = iso instanceof Date ? iso : new Date(iso)
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d)
  } catch {
    return ''
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const group = await getPublicGalleryGroupById(id)
  if (!group) {
    return { title: 'Album' }
  }

  const path = `/gallery/album/${id}`
  const cover = group.images[0]?.url

  return buildPageMetadata({
    title: `${group.title} | Robonauts Gallery`,
    description: `Photos from ${group.title} at Robonauts events and activities.`,
    path,
    absoluteTitle: true,
    ogImage: cover
      ? { url: cover, alt: group.title }
      : {
          url: '/robofest/robofest.jpg',
          width: 1200,
          height: 630,
          alt: group.title,
        },
  })
}

export default async function GalleryAlbumPage({ params }: Props) {
  const { id } = await params
  const group = await getPublicGalleryGroupById(id)
  if (!group) notFound()

  const urls = group.images.map((i) => i.url).filter(Boolean)
  const dateLine = formatDisplayDate(effectiveGalleryDisplayRaw(group))
  const albumPath = `/gallery/album/${id}`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Gallery', url: '/gallery' },
    { name: group.title, url: albumPath },
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Script
        id="gallery-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Link
          href="/gallery"
          prefetch={false}
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to gallery
        </Link>

        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Images className="w-5 h-5" />
            <span className="text-sm font-medium">Album</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{group.title}</h1>
          {dateLine ? (
            <p className="mt-2 flex items-center gap-2 text-gray-600 text-sm sm:text-base">
              <Calendar className="w-5 h-5 shrink-0 text-indigo-600" />
              {dateLine}
            </p>
          ) : null}
          {group.location ? (
            <p className="mt-2 flex items-start gap-2 text-gray-600 text-sm sm:text-base">
              <MapPin className="w-5 h-5 shrink-0 text-indigo-600 mt-0.5" />
              <span className="whitespace-pre-wrap">{group.location}</span>
            </p>
          ) : null}
          <p className="mt-2 text-sm text-gray-500">{urls.length} photo{urls.length === 1 ? '' : 's'}</p>
        </div>

        {urls.length === 0 ? (
          <p className="text-gray-500">No images in this album yet.</p>
        ) : (
          <ImageLightboxGallery images={urls} aspect="square" />
        )}
      </div>
    </div>
  )
}
