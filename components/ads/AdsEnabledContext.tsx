'use client'

import { createContext, useContext, type ReactNode } from 'react'

/** Driven by the `ads.enabled` feature flag; defaults to on outside the provider. */
const AdsEnabledContext = createContext(true)

export function AdsEnabledProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  return <AdsEnabledContext.Provider value={enabled}>{children}</AdsEnabledContext.Provider>
}

export function useAdsEnabled(): boolean {
  return useContext(AdsEnabledContext)
}
