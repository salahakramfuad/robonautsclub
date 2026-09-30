import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PAGE_SEO, buildPageMetadata } from "@/lib/seo-metadata";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: PAGE_SEO.about.title,
    description: PAGE_SEO.about.description,
    path: "/about",
    absoluteTitle: true,
    locale,
    ogImage: {
      url: "/roboclass.jpg",
      width: 1200,
      height: 630,
      alt: "Robonauts - About Us",
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

export default async function AboutLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <>{children}</>;
}
