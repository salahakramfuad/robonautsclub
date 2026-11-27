import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localizePath } from "@/i18n/routing";
import { languageAlternates } from "@/lib/seo-metadata";
import { getPublicEnglishMediumSchools } from "@/app/[locale]/(marketing)/events/public-data";
import { getPublicRobofestCampusAmbassadors } from "@/lib/robofest-campus-ambassadors-db";
import {
  getActiveRobofestCategories,
  getRobofestCategoryFromContent,
  getRobofestCategoryHref,
  getRobofestCategoryImage,
  getRobofestContent,
  resolveRobofestFee,
} from "@/lib/robofest-content";
import {
  ROBOFEST_CATEGORIES,
  getRobofestRoundStartDateIso,
} from "@/lib/robofest-local";
import {
  absoluteSiteUrl,
  getBreadcrumbSchema,
  getEventSchema,
} from "@/lib/seo";
import { SITE_CONFIG } from "@/lib/site-config";
import RobofestCategoryPage from "@/components/RobofestCategoryPage";
import { isFeatureEnabled } from "@/lib/feature-flags";

// ISR: align with other marketing pages; content updates call revalidatePath/Tag
export const revalidate = 1800;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return ROBOFEST_CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "robofest.meta" });
  const content = await getRobofestContent();
  const category = getRobofestCategoryFromContent(content, slug);
  if (!category) {
    return {
      title: t("categoryNotFound"),
      robots: { index: false, follow: false },
    };
  }

  const image = getRobofestCategoryImage(category);
  const descriptionBase =
    category.about?.trim() || category.description?.trim() || category.name;
  const description = t("categoryDescription", {
    base: descriptionBase,
    site: SITE_CONFIG.name,
  });
  const title = t("categoryTitle", { name: category.name });
  const brand = "Robonauts Club";
  const ogTitle = t("categoryOgTitle", { name: category.name, brand });
  const categoryPath = getRobofestCategoryHref(category.slug);
  const localizedPath = localizePath(categoryPath, locale);

  return {
    title,
    description,
    keywords: [
      category.name,
      "Robofest Bangladesh",
      "Robofest 2026",
      "Dhaka",
      "Chittagong",
      category.skillLevel,
      category.format,
      "robotics competition Bangladesh",
      SITE_CONFIG.name,
    ].filter(Boolean),
    openGraph: {
      title: ogTitle,
      description: category.about || category.description,
      url: localizedPath,
      type: "website",
      locale: locale === "bn" ? "bn_BD" : "en_US",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: t("categoryImageAlt", { name: category.name }),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: category.description || category.about,
      images: [image],
    },
    alternates: {
      canonical: localizedPath,
      languages: languageAlternates(categoryPath),
    },
  };
}

export default async function RobofestCategoryRoute({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const content = await getRobofestContent();
  const category = getRobofestCategoryFromContent(content, slug);
  if (!category) {
    notFound();
  }

  const fee = resolveRobofestFee(content, category.name);
  const activeCategories = getActiveRobofestCategories(content);
  const activeSlugs = activeCategories.map((c) => c.slug);
  if (!activeSlugs.includes(slug)) {
    notFound();
  }

  const [schools, campusAmbassadors] = await Promise.all([
    getPublicEnglishMediumSchools(),
    getPublicRobofestCampusAmbassadors(),
  ]);
  const image = getRobofestCategoryImage(category);
  const categoryUrl = getRobofestCategoryHref(category.slug);

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Robofest Bangladesh", url: "/robofest" },
    { name: category.name, url: categoryUrl },
  ]);

  const rounds = content.rounds?.length ? content.rounds : [];
  const eventSchemas = (rounds.length > 0 ? rounds : [null]).map(
    (round, index) => {
      const city = round?.city || "Bangladesh";
      const startIso = round
        ? getRobofestRoundStartDateIso(round.city)
        : undefined;
      const cityKey = city.toLowerCase().replace(/\s+/g, "-");
      return getEventSchema({
        id: `robofest-${category.slug}-${cityKey}-${index}`,
        title: `${category.name} · ${content.headline || "Robofest Bangladesh 2026"}${
          round?.city ? ` · ${round.city}` : ""
        }`,
        description: category.about || category.description,
        date:
          startIso ||
          round?.dates ||
          content.dateLabel ||
          content.dateLines?.[0] ||
          "",
        location: city,
        venue: round?.venueLabel || content.venueLabel,
        image,
        url: absoluteSiteUrl(categoryUrl),
        price: fee.isPaid ? fee.amount : 0,
        priceCurrency: "BDT",
      });
    },
  );

  return (
    <>
      <Script
        id={`robofest-${category.slug}-breadcrumb-jsonld`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {eventSchemas.map((schema, index) => (
        <Script
          key={`robofest-${category.slug}-event-${index}`}
          id={`robofest-${category.slug}-event-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <RobofestCategoryPage
        category={category}
        content={content}
        fee={fee}
        schools={schools}
        campusAmbassadors={campusAmbassadors}
        siblingCategories={activeCategories.filter((c) => c.slug !== slug)}
        registrationPaused={!(await isFeatureEnabled("registration.robofest"))}
      />
    </>
  );
}
