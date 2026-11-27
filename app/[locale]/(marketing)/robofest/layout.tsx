import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildLocalizedPageMetadata } from "@/lib/seo-metadata";

const ogImage = "/robofest/robofest.jpg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "robofest.meta" });
  return buildLocalizedPageMetadata("robofest", locale, {
    path: "/robofest",
    absoluteTitle: true,
    ogImage: {
      url: ogImage,
      width: 1200,
      height: 630,
      alt: t("landingImageAlt"),
    },
    keywords: [
      "Robofest Bangladesh 2026",
      "Robofest local round",
      "Robofest Dhaka",
      "Robofest Chittagong",
      "BottleSumo Bangladesh",
      "BuildAthon Bangladesh",
      "Line Following Bot",
      "Robo Exhibition",
      "robotics competition Dhaka",
      "Robonauts Robofest",
      "Robofest South Korea 2027",
    ],
  });
}

export default async function RobofestLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
