import { Metadata } from "next";
import Feed from "@/components/Feed";
import JsonLdScript from "@/components/JsonLdScript";
import { PAGE_SEO, buildPageMetadata } from "@/lib/seo-metadata";
import { getFAQPageSchema } from "@/lib/seo";
import { HOME_FAQ_ITEMS } from "@/lib/home-faq";
import {
  getPublicCourses,
  getPublicEventsForHome,
  getPublicHomepageOrgs,
} from "./events/public-data";
import { isEventUpcoming } from "@/lib/dateUtils";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = buildPageMetadata({
  title: PAGE_SEO.home.title,
  description: PAGE_SEO.home.description,
  path: "/",
  absoluteTitle: true,
  ogImage: {
    url: SITE_CONFIG.metadata.defaultImage,
    width: SITE_CONFIG.metadata.defaultImageWidth,
    height: SITE_CONFIG.metadata.defaultImageHeight,
    alt: SITE_CONFIG.metadata.defaultImageAlt,
  },
});

// ISR: longer window minimizes edge recompute frequency for mostly static content
export const revalidate = 1800;

export default async function Home() {
  const [courses, events, homepageOrgs] = await Promise.all([
    getPublicCourses(),
    getPublicEventsForHome(),
    getPublicHomepageOrgs(),
  ])
  const initialUpcomingEvents = events.filter((e) => isEventUpcoming(e.date))
  const faqSchema = getFAQPageSchema(HOME_FAQ_ITEMS)

  return (
    <main id="main" className="flex flex-col w-full min-w-full">
      <JsonLdScript id="home-faq-schema" data={faqSchema} />
      <Feed
        initialCourses={courses}
        initialUpcomingEvents={initialUpcomingEvents}
        initialPartners={homepageOrgs.partners}
        initialWorkshopSchools={homepageOrgs.schools}
      />
    </main>
  );
}
