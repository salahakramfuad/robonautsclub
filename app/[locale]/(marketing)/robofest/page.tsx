import { setRequestLocale } from "next-intl/server";
import RobofestLocalRoundPage from "@/components/RobofestLocalRoundPage";

// ISR: align with other marketing pages; content updates call revalidatePath/Tag
export const revalidate = 1800;

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RobofestPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RobofestLocalRoundPage />;
}
