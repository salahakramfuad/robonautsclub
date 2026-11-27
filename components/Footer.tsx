import { Mail, MapPin, Phone } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site-config";
import { LEGAL_PAGES } from "@/lib/legal";

const SOCIAL_LINKS = [
  { icon: FaFacebookF, href: SITE_CONFIG.social.facebook, label: "Facebook" },
  { icon: FaInstagram, href: SITE_CONFIG.social.instagram, label: "Instagram" },
  { icon: FaLinkedinIn, href: SITE_CONFIG.social.linkedin, label: "LinkedIn" },
  { icon: FaYoutube, href: SITE_CONFIG.social.youtube, label: "YouTube" },
  { icon: FaWhatsapp, href: SITE_CONFIG.social.whatsapp, label: "WhatsApp" },
];

const STUDENT_LINKS = [
  { title: "Courses & programs", href: "/courses" },
  { title: "Upcoming events", href: "/events" },
  { title: "Robofest", href: "/robofest" },
  { title: "Find my registration", href: "/verify-booking" },
  { title: "Contact us", href: "/contact" },
] as const;

const linkClass =
  "rounded transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";

export default function Footer() {
  return (
    <footer className="bg-[#14264a] text-slate-300">
      {/* Top accent strip — logo colours */}
      <div className="h-1 w-full bg-linear-to-r from-[#1f3a6f] via-[#d4163f] to-[#4a4c50]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
        {/* Top Section */}
        <div className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-center md:justify-between">
          {/* Brand */}
          <div className="flex items-start gap-3 sm:gap-4">
            <Image
              src={SITE_CONFIG.assets.logo}
              alt={`${SITE_CONFIG.name} Logo`}
              width={56}
              height={56}
              className="object-contain w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white p-1"
            />
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {SITE_CONFIG.name}
              </h2>
              <p className="mt-1 max-w-sm text-xs sm:text-sm text-slate-400">
                {SITE_CONFIG.tagline}
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={`${label} (opens in a new tab)`}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-indigo-500 hover:text-white hover:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <Icon className="text-lg" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 mb-8 h-px w-full bg-white/10" />

        {/* Main Content */}
        <div className="grid gap-8 sm:gap-10 sm:grid-cols-2 md:grid-cols-4">
          <nav aria-label="Footer">
            <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold uppercase tracking-wide text-indigo-300">
              Explore
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-sm">
              {SITE_CONFIG.navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} prefetch={false} className={linkClass}>
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="For students and parents">
            <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold uppercase tracking-wide text-indigo-300">
              Students & parents
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-sm">
              {STUDENT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} prefetch={false} className={linkClass}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold uppercase tracking-wide text-indigo-300">
              Contact
            </h3>
            <div className="space-y-3 text-sm">
              <a
                href={SITE_CONFIG.social.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                <FaWhatsapp className="text-base" aria-hidden />
                Chat on WhatsApp
              </a>
              <a href={`tel:${SITE_CONFIG.phone}`} className={`flex items-center gap-2 ${linkClass}`}>
                <Phone size={16} aria-hidden />
                {SITE_CONFIG.phone}
              </a>
              <a href={`mailto:${SITE_CONFIG.email}`} className={`flex items-center gap-2 break-all ${linkClass}`}>
                <Mail size={16} aria-hidden />
                {SITE_CONFIG.email}
              </a>
              <p className="flex items-start gap-2 text-slate-400">
                <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden />
                {SITE_CONFIG.location}
              </p>
            </div>
          </div>

          {/* Payment */}
          <div>
            <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold uppercase tracking-wide text-indigo-300">
              Payment method
            </h3>
            <div
              className="inline-flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 shadow-sm"
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
                <p className="text-[11px] text-slate-500">Secure online payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-white/10" />

      {/* Bottom text row */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 pb-24 md:pb-4">
        <div className="flex flex-col gap-2 text-xs sm:text-sm text-slate-400 md:flex-row md:items-center md:justify-between text-center md:text-left">
          <span>
            © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
          </span>

          <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
            <nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-4 gap-y-1">
              {LEGAL_PAGES.map((page) => (
                <Link key={page.href} href={page.href} className={linkClass}>
                  {page.title}
                </Link>
              ))}
            </nav>
            <a
              href={SITE_CONFIG.developer.url}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Developed by{" "}
              <span className="font-semibold">{SITE_CONFIG.developer.name}</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
