import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Feed from "@/components/Feed";
import { buildPageMetadata } from "@/lib/seo-metadata";
import {
  getPublicCourses,
  getPublicEventsForHome,
  getPublicHomepageOrgs,
} from "./events/public-data";
import { isEventUpcoming } from "@/lib/dateUtils";
import { SITE_CONFIG } from "@/lib/site-config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "seo.pages.home" });
  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/",
    absoluteTitle: true,
    locale,
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

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [courses, events, homepageOrgs] = await Promise.all([
    getPublicCourses(),
    getPublicEventsForHome(),
    getPublicHomepageOrgs(),
  ])
  const initialUpcomingEvents = events.filter((e) => isEventUpcoming(e.date))

  return (
    <main id="main" className="flex flex-col w-full min-w-full">
      <Feed
        initialCourses={courses}
        initialUpcomingEvents={initialUpcomingEvents}
        initialPartners={homepageOrgs.partners}
        initialWorkshopSchools={homepageOrgs.schools}
      />
    </main>
  );
}
