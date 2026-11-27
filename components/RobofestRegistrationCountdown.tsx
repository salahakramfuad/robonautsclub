"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  BANGLADESH_TZ,
  formatRegistrationClosingLabel,
  parseRegistrationClosingInstant,
} from "@/lib/dateUtils";

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

function getRemaining(closingDate: string, now: Date): Remaining {
  const target = parseRegistrationClosingInstant(closingDate);
  if (!target) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, expired: false };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Bangla variant of `formatRegistrationClosingLabel` (same BD wall time). */
function formatClosingLabelBn(closingDate: string, bstLabel: string): string {
  const raw = closingDate.trim();
  const instant = parseRegistrationClosingInstant(raw);
  if (!instant) return raw;
  const datePart = new Intl.DateTimeFormat("bn-BD", {
    timeZone: BANGLADESH_TZ,
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(instant);
  if (!raw.includes("T")) return datePart;
  const timePart = new Intl.DateTimeFormat("bn-BD", {
    timeZone: BANGLADESH_TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(instant);
  return `${datePart} · ${timePart} ${bstLabel}`;
}

function subscribeToSecondTicks(onStoreChange: () => void) {
  const id = window.setInterval(onStoreChange, 1000);
  return () => window.clearInterval(id);
}

/** Whole seconds — stable within a tick so useSyncExternalStore won't loop. */
function getClientNowSeconds() {
  return Math.floor(Date.now() / 1000);
}

/** Stable on server + during hydration so digits don't mismatch. */
function getServerNowSeconds(): number | null {
  return null;
}

export default function RobofestRegistrationCountdown({
  closingDate,
  className,
  compact = false,
  label,
}: {
  closingDate: string;
  className?: string;
  compact?: boolean;
  /** Optional division label, e.g. "Chittagong Division". */
  label?: string;
}) {
  const t = useTranslations("robofest.countdown");
  const locale = useLocale();
  const bstLabel = t("bst");
  const nowSeconds = useSyncExternalStore(
    subscribeToSecondTicks,
    getClientNowSeconds,
    getServerNowSeconds,
  );

  const dateLabel = useMemo(
    () =>
      (locale === "bn"
        ? formatClosingLabelBn(closingDate, bstLabel)
        : formatRegistrationClosingLabel(closingDate)) || closingDate,
    [closingDate, locale, bstLabel],
  );

  const remaining = useMemo(
    () =>
      nowSeconds != null
        ? getRemaining(closingDate, new Date(nowSeconds * 1000))
        : null,
    [closingDate, nowSeconds],
  );

  const closesLabel = label
    ? t("closesWithLabel", { label })
    : t("closes");

  if (remaining?.expired) {
    return (
      <div
        className={cn(
          "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800",
          className,
        )}
      >
        {label ? t("closedWithLabel", { label }) : t("closed")}
        <span className="ml-2 font-normal text-rose-700/80">
          {t("deadlineWas", { date: dateLabel })}
        </span>
      </div>
    );
  }

  const units = [
    { label: t("days"), value: remaining ? String(remaining.days) : "—" },
    { label: t("hours"), value: remaining ? pad(remaining.hours) : "—" },
    { label: t("mins"), value: remaining ? pad(remaining.minutes) : "—" },
    { label: t("secs"), value: remaining ? pad(remaining.seconds) : "—" },
  ];

  return (
    <div
      className={cn(
        "rounded-xl border border-cyan-200/80 bg-cyan-50/80 px-4 py-3",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-2",
          compact ? "justify-between" : "justify-between sm:gap-6",
        )}
      >
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-800/80">
            {closesLabel}
          </p>
          <p className="text-sm font-semibold text-slate-900">{dateLabel}</p>
        </div>
        <div
          className="flex items-center gap-2 sm:gap-3"
          role="timer"
          aria-live="off"
        >
          {units.map((unit, index) => (
            <div key={unit.label} className="flex items-center gap-2 sm:gap-3">
              {index > 0 ? (
                <span className="text-slate-300 font-bold select-none" aria-hidden>
                  :
                </span>
              ) : null}
              <div className="text-center min-w-10">
                <div className="text-lg sm:text-xl font-bold tabular-nums text-slate-900 leading-none">
                  {unit.value}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500 mt-0.5">
                  {unit.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
