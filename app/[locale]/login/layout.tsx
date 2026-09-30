import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NOINDEX_ROBOTS } from "@/lib/seo-metadata";
import { Toaster } from "@/components/ui/sonner";

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
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("login.title"),
    robots: NOINDEX_ROBOTS,
  };
}

export default async function LoginLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {children}
      <Toaster richColors closeButton position="top-right" />
    </>
  );
}
