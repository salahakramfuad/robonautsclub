import { Metadata } from "next";
import Feed from "@/components/Feed";
import { buildLocalizedPageMetadata } from "@/lib/seo-metadata";
import { setRequestLocale } from "next-intl/server";
import {
  getPublicCourses,
  getPublicEventsForHome,
  getPublicHomepageOrgs,
} from "./events/public-data";
import { isEventUpcoming } from "@/lib/dateUtils";
import { SITE_CONFIG } from "@/lib/site-config";
import { getFeatureFlags } from "@/lib/feature-flags";
import { getFaqItems } from "@/lib/faq";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLocalizedPageMetadata("home", locale, {
  path: "/",
  absoluteTitle: true,
  ogImage: {
    url: SITE_CONFIG.metadata.defaultImage,
    width: 407,
    height: 407,
    alt: SITE_CONFIG.metadata.defaultImageAlt,
  },
  });
}

// ISR: longer window minimizes edge recompute frequency for mostly static content
export const revalidate = 1800;

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [courses, events, homepageOrgs, flags, faqItems] = await Promise.all([
    getPublicCourses(),
    getPublicEventsForHome(),
    getPublicHomepageOrgs(),
    getFeatureFlags(),
    getFaqItems("general", locale),
  ])
  const initialUpcomingEvents = events.filter((e) => isEventUpcoming(e.date))

  return (
    <main id="main" className="flex flex-col w-full min-w-full">
      <Feed
        initialCourses={courses}
        initialUpcomingEvents={initialUpcomingEvents}
        initialPartners={homepageOrgs.partners}
        initialWorkshopSchools={homepageOrgs.schools}
        heroVideoEnabled={flags["ui.heroVideo"].enabled}
        coursesPageEnabled={flags["pages.courses"].enabled}
        faqItems={faqItems}
      />
    </main>
  );
}
