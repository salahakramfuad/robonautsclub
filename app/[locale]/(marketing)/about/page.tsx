import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SITE_CONFIG } from "@/lib/site-config";
import {
  Trophy,
  Users,
  Award,
  Target,
  GraduationCap,
  Lightbulb,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import AboutMap from "./AboutMap";
import { Card, CardContent } from "@/components/ui/card";

const GOOGLE_MAPS_LINK = "https://maps.app.goo.gl/yhRBigbxoJNpqMbg9";

const STAT_META = [
  { icon: Users, value: "200+", labelKey: "activeMembers" as const },
  { icon: Trophy, value: "10+", labelKey: "eventsHosted" as const },
  { icon: Award, value: "10+", labelKey: "competitionAwards" as const },
  { icon: Target, value: "15+", labelKey: "projectsCompleted" as const },
];

const STAT_ICON_COLORS = [
  "text-indigo-500",
  "text-blue-500",
  "text-purple-500",
  "text-indigo-500",
];

const CORE_VALUE_META = [
  {
    titleKey: "innovationTitle" as const,
    descriptionKey: "innovationDescription" as const,
    icon: Lightbulb,
  },
  {
    titleKey: "collaborationTitle" as const,
    descriptionKey: "collaborationDescription" as const,
    icon: Users,
  },
  {
    titleKey: "empowermentTitle" as const,
    descriptionKey: "empowermentDescription" as const,
    icon: Target,
  },
];

const WHAT_WE_DO_META = [
  {
    titleKey: "workshopsTitle" as const,
    descriptionKey: "workshopsDescription" as const,
  },
  {
    titleKey: "competitionTitle" as const,
    descriptionKey: "competitionDescription" as const,
  },
  {
    titleKey: "stemTitle" as const,
    descriptionKey: "stemDescription" as const,
  },
  {
    titleKey: "pblTitle" as const,
    descriptionKey: "pblDescription" as const,
  },
  {
    titleKey: "mentorshipTitle" as const,
    descriptionKey: "mentorshipDescription" as const,
  },
  {
    titleKey: "communityTitle" as const,
    descriptionKey: "communityDescription" as const,
  },
];

const TEAM_META = [
  {
    name: "Md Shakib Hasan",
    roleKey: "roboticsInstructor" as const,
    expertiseKey: "roboticsEngineering" as const,
    icon: GraduationCap,
  },
  {
    name: "Md Naziur Rahman Nayeem",
    roleKey: "roboticsInstructor" as const,
    expertiseKey: "curriculumMentorship" as const,
    icon: GraduationCap,
  },
  {
    name: "Mohammad Salah Akram Fuad",
    roleKey: "programmingInstructor" as const,
    expertiseKey: "pythonMlArduino" as const,
    icon: Target,
  },
  {
    name: "Ayesha Ali",
    roleKey: "competitionCoordinator" as const,
    expertiseKey: "eventTeamBuilding" as const,
    icon: Trophy,
  },
  {
    name: "Rashid Islam",
    roleKey: "hardwareExpert" as const,
    expertiseKey: "circuitSensors" as const,
    icon: Award,
  },
  {
    name: "Sara Ahmed",
    roleKey: "youthProgramDirector" as const,
    expertiseKey: "educationalPsychology" as const,
    icon: Users,
  },
];

const TEAM_ICON_COLORS = [
  "text-indigo-500",
  "text-blue-500",
  "text-purple-500",
  "text-indigo-500",
  "text-blue-500",
  "text-purple-500",
];

const TEAM_BG_COLORS = [
  "bg-indigo-100",
  "bg-blue-100",
  "bg-purple-100",
  "bg-indigo-100",
  "bg-blue-100",
  "bg-purple-100",
];

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-8 sm:mb-10 md:mb-12">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <section className="relative text-white py-16 sm:py-20 md:py-24 px-4 sm:px-6 overflow-hidden">
        <Image
          src="/roboclass.jpg"
          alt={t("images.heroAlt")}
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
          quality={75}
        />
        <div className="absolute inset-0 bg-slate-900/45" aria-hidden />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-300 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm mb-4 sm:mb-6">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">
                {t("hero.badge", { name: SITE_CONFIG.name })}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 tracking-tight px-2">
              {t("hero.title")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed px-2">
              {t("hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <section className="mb-12 sm:mb-16 md:mb-20">
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900">
                  {t("whoWeAre.title")}
                </h2>
                <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                  <p>
                    {t("whoWeAre.p1", { name: SITE_CONFIG.name })}
                  </p>
                  <p>{t("whoWeAre.p2")}</p>
                </div>
              </div>

              <div className="h-64 sm:h-80 bg-linear-to-br from-indigo-400 via-blue-400 to-purple-400 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 border-gray-200 overflow-hidden">
                <Image
                  src="/pocketcinema.jpg"
                  alt={t("images.workshopAlt")}
                  priority
                  width={1000}
                  height={1000}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </section>

          <section className="mb-12 sm:mb-16 md:mb-20">
            <SectionHeader
              title={t("achievements.title")}
              subtitle={t("achievements.subtitle")}
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
              {STAT_META.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.labelKey} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6 text-center">
                      <Icon
                        className={`w-6 h-6 sm:w-8 sm:h-8 ${STAT_ICON_COLORS[index]} mx-auto mb-2 sm:mb-3`}
                      />
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-xs sm:text-sm text-gray-600">{t(`stats.${stat.labelKey}`)}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <Card className="bg-linear-to-br from-indigo-50 to-blue-50 border-indigo-100">
              <CardContent className="p-6 sm:p-8 md:p-12">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{t("impact.title")}</h3>
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">{t("impact.successStoriesTitle")}</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {t("impact.successStoriesBody")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">{t("impact.communityTitle")}</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {t("impact.communityBody")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="mb-12 sm:mb-16 md:mb-20">
            <SectionHeader
              title={t("values.title")}
              subtitle={t("values.subtitle")}
            />
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {CORE_VALUE_META.map((value) => {
                const Icon = value.icon;
                return (
                  <Card key={value.titleKey} className="bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                    <CardContent className="p-4 sm:p-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-3 sm:mb-4">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        {t(`values.${value.titleKey}`)}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        {t(`values.${value.descriptionKey}`)}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section className="mb-12 sm:mb-16 md:mb-20 bg-white py-12 sm:py-16 md:py-20 rounded-xl sm:rounded-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectionHeader
                title={t("whatWeDo.title")}
                subtitle={t("whatWeDo.subtitle")}
              />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {WHAT_WE_DO_META.map((item) => (
                  <Card key={item.titleKey} className="bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                        {t(`whatWeDo.${item.titleKey}`)}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                        {t(`whatWeDo.${item.descriptionKey}`)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-12 sm:mb-16 md:mb-20 bg-white py-12 sm:py-16 md:py-20 rounded-xl sm:rounded-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectionHeader
                title={t("team.title")}
                subtitle={t("team.subtitle")}
              />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {TEAM_META.map((member, index) => {
                  const Icon = member.icon;
                  return (
                    <Card key={member.name} className="bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                      <CardContent className="p-4 sm:p-6">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${TEAM_BG_COLORS[index]} flex items-center justify-center mb-3 sm:mb-4`}
                        >
                          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${TEAM_ICON_COLORS[index]}`} />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                        <p className={`text-xs sm:text-sm font-semibold ${TEAM_ICON_COLORS[index]} mb-2`}>
                          {t(`team.roles.${member.roleKey}`)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {t(`team.expertise.${member.expertiseKey}`)}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          <section id="contact" className="mb-12 sm:mb-16 md:mb-20 scroll-mt-24">
            <SectionHeader title={t("contact.title")} subtitle={t("contact.subtitle")} />
            <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
              <div>
                <Card className="shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                      {t("contact.detailsTitle")}
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">{t("contact.addressLabel")}</p>
                          <p className="text-gray-700">{t("contact.addressLine")}</p>
                          <a
                            href={GOOGLE_MAPS_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline mt-1 inline-block"
                          >
                            {t("contact.mapsLink")}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">{t("contact.serviceAreaLabel")}</p>
                          <p className="text-gray-700">{t("contact.serviceArea")}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">{t("contact.mobileLabel")}</p>
                          <p className="text-gray-700">{t("contact.mobile")}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MessageCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">{t("contact.whatsappLabel")}</p>
                          <p className="text-gray-700">{t("contact.whatsapp")}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">{t("contact.emailLabel")}</p>
                          <a
                            href={`mailto:${SITE_CONFIG.email}`}
                            className="text-gray-700 hover:text-indigo-600 transition-colors"
                          >
                            {SITE_CONFIG.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card className="overflow-hidden border-2 shadow-sm h-64 sm:h-80 lg:h-96 p-0">
                  <AboutMap />
                </Card>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
