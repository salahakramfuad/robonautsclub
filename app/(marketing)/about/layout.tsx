import { Metadata } from "next";
import { PAGE_SEO, buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: PAGE_SEO.about.title,
  description: PAGE_SEO.about.description,
  path: "/about",
  absoluteTitle: true,
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

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
