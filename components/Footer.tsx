import { Mail, Phone } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SITE_CONFIG } from "@/lib/site-config";

const NAV_HREF_KEYS = [
  { href: "/", key: "Home" as const },
  { href: "/events", key: "Events" as const },
  { href: "/news", key: "News" as const },
  { href: "/robofest", key: "Robofest" as const },
  { href: "/gallery", key: "Gallery" as const },
  { href: "/about", key: "AboutUs" as const },
];

const SERVICE_HREFS = [
  { href: "/#programs", key: "workshops" as const },
  { href: "/#programs", key: "handsOn" as const },
  { href: "/robofest", key: "roboFair" as const },
  { href: "/events", key: "competitions" as const },
] as const;

export default async function Footer() {
  const t = await getTranslations("footer");
  const tSite = await getTranslations("site");
  const tNav = await getTranslations("nav");

  const socialLinks = [
    {
      icon: FaFacebookF,
      href: SITE_CONFIG.social.facebook,
      label: t("social.facebook"),
    },
    {
      icon: FaInstagram,
      href: SITE_CONFIG.social.instagram,
      label: t("social.instagram"),
    },
    {
      icon: FaLinkedinIn,
      href: SITE_CONFIG.social.linkedin,
      label: t("social.linkedin"),
    },
    {
      icon: FaYoutube,
      href: SITE_CONFIG.social.youtube,
      label: t("social.youtube"),
    },
    {
      icon: FaWhatsapp,
      href: SITE_CONFIG.social.whatsapp,
      label: t("social.whatsapp"),
    },
  ];

  return (
    <footer className="bg-brand-light text-brand-dar bg-sky-100">
      {/* Top accent strip */}
      <div className="h-2 w-full bg-linear-to-r from-blue-200 via-gray-200 to-red-200" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Top Section */}
        <div className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-center md:justify-between">
          {/* Brand */}
          <div className="flex items-start gap-3 sm:gap-4">
            <Image
              src={SITE_CONFIG.assets.logo}
              alt={`${SITE_CONFIG.name} Logo`}
              width={72}
              height={72}
              className="object-contain w-12 h-12 sm:w-14 sm:h-14"
              priority
            />
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-brand-blue">
                {SITE_CONFIG.name}
              </h2>
              <p className="mt-1 max-w-sm text-xs sm:text-sm text-brand-dark/70">
                {tSite("tagline")}
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer"
                className="
                  flex h-10 w-10 items-center justify-center rounded-full
                  border border-brand-blue/20
                  bg-white text-brand-blue
                  shadow-sm transition
                  hover:bg-blue-300 hover:text-white hover:border-brand-blue
                  focus:outline-none focus:ring-2 focus:ring-brand-blue/30
                "
              >
                <Icon className="text-lg" />
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className="mt-8 mb-6 h-px w-full"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(17,24,39,0.12), transparent)",
          }}
        />

        {/* Main Content */}
        <div className="grid gap-8 sm:gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Navigation */}
          <nav aria-label="Footer">
            <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold uppercase tracking-wide text-brand-blue">
              {t("quickLinks")}
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              {NAV_HREF_KEYS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="transition hover:text-brand-blue"
                  >
                    {tNav(link.key)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/about#contact"
                  prefetch={false}
                  className="transition hover:text-brand-blue"
                >
                  {tNav("Contact")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Services */}
          <div>
            <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold uppercase tracking-wide text-brand-blue">
              {t("ourServices")}
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              {SERVICE_HREFS.map((service) => (
                <li key={service.key}>
                  <Link
                    href={service.href}
                    prefetch={false}
                    className="transition hover:text-brand-blue"
                  >
                    {tSite(`services.${service.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold uppercase tracking-wide text-brand-blue">
              {t("contact")}
            </h3>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-2 transition hover:text-brand-blue"
              >
                <Mail size={16} />
                {SITE_CONFIG.email}
              </a>

              <a
                href={`tel:${SITE_CONFIG.phone}`}
                className="flex items-center gap-2 transition hover:text-brand-blue"
              >
                <Phone size={16} />
                {SITE_CONFIG.phone}
              </a>

              <p className="text-brand-dark/70">{SITE_CONFIG.location}</p>
            </div>
          </div>

          {/* Payment */}
          <div>
            <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold uppercase tracking-wide text-brand-blue">
              {t("paymentMethod")}
            </h3>
            <div
              className="inline-flex items-center gap-2.5 rounded-xl border border-[#E2136E]/20 bg-white px-3 py-2.5 shadow-sm"
              title="bKash"
            >
              <Image
                src="/bkashlogo.svg"
                alt="bKash"
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 object-contain"
              />
              <div className="leading-tight">
                <p className="text-sm font-semibold text-[#E2136E]">bKash</p>
                <p className="text-[11px] text-brand-dark/60">
                  {t("securePayments")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom linear bar */}
      <div
        className="mt-4 h-px w-full"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(17,24,39,0.12), transparent)",
        }}
      />

      {/* Bottom text row */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col gap-2 text-xs sm:text-sm text-brand-dark/80 md:flex-row md:items-center md:justify-between text-center md:text-left">
          <span>
            {t("allRightsReserved", {
              year: new Date().getFullYear(),
              name: SITE_CONFIG.name,
            })}
          </span>

          <a
            href={SITE_CONFIG.developer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-brand-blue"
          >
            {t("developedBy")}{" "}
            <span className="font-semibold">{SITE_CONFIG.developer.name}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
