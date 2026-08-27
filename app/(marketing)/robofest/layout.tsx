import type { Metadata } from "next";
import type { ReactNode } from "react";

const title = "Robofest Bangladesh 2026 Local Round";
const description =
  "Register for Robofest Bangladesh 2026 local rounds in Chittagong (11 Sep) and Dhaka (18 Sep). Compete in BottleSumo, BuildAthon, Line Following Bot, or Robo Exhibition—hosted by Robonauts Ltd. Path to the World Championship 2027 in South Korea.";
const ogImage = "/robofest/robofest.jpg";
const brand = "Robonauts Club";

export const metadata: Metadata = {
  title,
  description,
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
  openGraph: {
    title: `${title} | ${brand}`,
    description,
    url: "/robofest",
    type: "website",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Robofest Bangladesh 2026 Local Round",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Robofest Bangladesh 2026 | ${brand}`,
    description,
    images: [ogImage],
  },
  alternates: {
    canonical: "/robofest",
  },
};

export default function RobofestLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
