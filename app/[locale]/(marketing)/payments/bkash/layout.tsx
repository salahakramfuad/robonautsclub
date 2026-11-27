import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NOINDEX_ROBOTS } from "@/lib/seo-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "payments" });
  return {
    title: t("metaTitle"),
    robots: NOINDEX_ROBOTS,
  };
}

export default async function BkashPaymentsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
