import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildLocalizedPageMetadata } from "@/lib/seo-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return buildLocalizedPageMetadata("about", locale, {
    path: "/about",
    absoluteTitle: true,
    ogImage: {
      url: "/roboclass.jpg",
      width: 1200,
      height: 630,
      alt: t("meta.ogAlt"),
    },
    keywords: [
      "about Robonauts",
      "robotics club Bangladesh",
      "STEM education mission",
      "robotics training center",
      "youth development Bangladesh",
      "Robofest preparation",
    ],
  });
}

export default async function AboutLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <>{children}</>;
}
