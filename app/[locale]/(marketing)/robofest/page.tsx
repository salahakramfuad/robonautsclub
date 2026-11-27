import { setRequestLocale } from "next-intl/server";
import RobofestLocalRoundPage from "@/components/RobofestLocalRoundPage";

// ISR: align with other marketing pages; content updates call revalidatePath/Tag
export const revalidate = 1800;

export default async function RobofestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RobofestLocalRoundPage />;
}
