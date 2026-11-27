'use client'

import { useEffect } from 'react'

/**
 * The root layout is shared with the (English-only) dashboard, so it renders
 * `<html lang="en">`. Sync the document language on localized pages; the
 * wrapping `<div lang>` already covers assistive tech and the initial HTML.
 */
export default function HtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    const previous = document.documentElement.lang
    document.documentElement.lang = locale
    return () => {
      document.documentElement.lang = previous
    }
  }, [locale])
  return null
}
