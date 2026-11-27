import { revalidatePath } from 'next/cache'
import { routing } from '@/i18n/routing'

/**
 * Public marketing pages render under `app/[locale]`, so the ISR cache holds
 * `/en/...` and `/bn/...` entries. Revalidate every locale plus the bare path.
 */
export function revalidateLocalizedPath(path: string, type?: 'layout' | 'page') {
  const suffix = path === '/' ? '' : path
  revalidatePath(path, type)
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}${suffix}`, type)
  }
}
