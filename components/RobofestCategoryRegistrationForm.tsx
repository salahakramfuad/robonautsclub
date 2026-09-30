"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { computeRobofestRegistrationTotal } from "@/lib/robofest-fee";
import type { RobofestRoundContent } from "@/lib/robofest-content";
import {
  PRIVATE_CANDIDATE_OPTION,
  SCHOOL_NOT_FOUND_OPTION,
} from "@/lib/schoolDirectory";
import {
  formatCampusAmbassadorLabel,
  ROBOFEST_CAMPUS_AMBASSADOR_NOT_APPLICABLE,
  type RobofestCampusAmbassador,
} from "@/lib/robofest-campus-ambassadors";
import {
  getGradesForAgeCategory,
  ROBOFEST_AGE_CATEGORIES,
  ROBOFEST_DIVISIONS,
  type RobofestAgeCategory,
} from "@/lib/robofest-registration-options";
import {
  areAllRobofestDivisionsClosed,
  isRobofestDivisionRegistrationClosed,
} from "@/lib/robofest-deadlines";
import {
  initiateRobofestPaidCheckout,
  submitRobofestRegistration,
} from "@/app/[locale]/(marketing)/robofest/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type TeamMemberForm = {
  name: string;
  email: string;
  phone: string;
  schoolSelection: string;
  customSchool: string;
  branch: string;
  grade: string;
};

type FormState = {
  division: string;
  ageCategory: RobofestAgeCategory | "";
  teamSize: number;
  teamMembers: TeamMemberForm[];
  campusAmbassadorId: string;
};

const emptyMember = (): TeamMemberForm => ({
  name: "",
  email: "",
  phone: "",
  schoolSelection: "",
  customSchool: "",
  branch: "",
  grade: "",
});

const emptyForm = (division: string): FormState => ({
  division,
  ageCategory: "",
  teamSize: 1,
  teamMembers: [emptyMember()],
  campusAmbassadorId: "",
});

function resizeTeamMembers(
  members: TeamMemberForm[],
  size: number,
): TeamMemberForm[] {
  const next = members.slice(0, size);
  while (next.length < size) {
    next.push(emptyMember());
  }
  return next;
}

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

const GRADE_KEYS: Record<string, "grade05" | "grade06" | "grade07" | "grade08" | "grade09" | "grade10" | "grade11" | "grade12"> = {
  "Grade - 05": "grade05",
  "Grade - 06": "grade06",
  "Grade - 07": "grade07",
  "Grade - 08": "grade08",
  "Grade - 09": "grade09",
  "Grade - 10": "grade10",
  "Grade - 11": "grade11",
  "Grade - 12": "grade12",
};

function divisionTranslationKey(
  value: string,
): "divisionDhaka" | "divisionChittagong" | null {
  const normalized = value.trim().toLowerCase();
  if (normalized.startsWith("dha")) return "divisionDhaka";
  if (normalized.startsWith("chit") || normalized.includes("ctg")) {
    return "divisionChittagong";
  }
  return null;
}

export default function RobofestCategoryRegistrationForm({
  category,
  rounds,
  schools,
  campusAmbassadors,
  isPaid,
  amount,
  rulesPdf,
  globalRegistrationClosingDate = null,
}: {
  category: string;
  rounds: RobofestRoundContent[];
  schools: string[];
  campusAmbassadors: RobofestCampusAmbassador[];
  isPaid: boolean;
  amount: number;
  rulesPdf?: string;
  /** Legacy global deadline fallback for unsaved CMS docs. */
  globalRegistrationClosingDate?: string | null;
}) {
  const t = useTranslations("robofest.form");
  const tErrors = useTranslations("robofest.errors");

  const deadlineContent = useMemo(
    () => ({
      rounds,
      registrationClosingDate: globalRegistrationClosingDate,
    }),
    [rounds, globalRegistrationClosingDate],
  );

  const divisionLabel = (value: string, closed: boolean) => {
    const key = divisionTranslationKey(value);
    const base = key
      ? t(key)
      : ROBOFEST_DIVISIONS.find((d) => d.value === value)?.label ||
        `${value} Division`;
    return closed ? `${base} ${t("divisionClosedSuffix")}` : base;
  };

  const ageCategoryLabel = (value: RobofestAgeCategory) =>
    value === "explorer" ? t("ageExplorer") : t("ageInnovators");

  const gradeLabel = (grade: string) => {
    const key = GRADE_KEYS[grade];
    return key ? t(key) : grade;
  };

  const divisionOptions = useMemo(() => {
    const fromRounds = rounds
      .map((round) => {
        const match = ROBOFEST_DIVISIONS.find((d) => d.value === round.city);
        const value = match?.value ?? round.city;
        const closed = isRobofestDivisionRegistrationClosed(
          deadlineContent,
          round.city,
        );
        return {
          value,
          closed,
          label: divisionLabel(value, closed),
        };
      })
      .filter((d, i, arr) => arr.findIndex((x) => x.value === d.value) === i);
    if (fromRounds.length > 0) return fromRounds;
    return ROBOFEST_DIVISIONS.map((d) => {
      const closed = isRobofestDivisionRegistrationClosed(
        deadlineContent,
        d.value,
      );
      return {
        value: d.value,
        closed,
        label: divisionLabel(d.value, closed),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- labels depend on locale via t()
  }, [rounds, deadlineContent, t]);

  const allDivisionsClosed = useMemo(
    () => areAllRobofestDivisionsClosed(deadlineContent),
    [deadlineContent],
  );

  const firstOpenDivision =
    divisionOptions.find((d) => !d.closed)?.value ??
    divisionOptions[0]?.value ??
    "Dhaka";

  const [form, setForm] = useState<FormState>(() =>
    emptyForm(firstOpenDivision),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [teamNumber, setTeamNumber] = useState<string | null>(null);
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [rulesUnderstood, setRulesUnderstood] = useState(false);

  const selectedDivisionClosed = form.division
    ? isRobofestDivisionRegistrationClosed(deadlineContent, form.division)
    : false;

  const gradeOptions = getGradesForAgeCategory(form.ageCategory);
  const totalAmount =
    isPaid && amount > 0
      ? computeRobofestRegistrationTotal(amount, form.teamSize)
      : 0;

  const fieldId = (field: string) =>
    `robofest-${field}-${category.replace(/\s+/g, "-").toLowerCase()}`;

  const updateTeamSize = (event: ChangeEvent<HTMLSelectElement>) => {
    const size = Math.min(4, Math.max(1, Number(event.target.value) || 1));
    setForm((prev) => ({
      ...prev,
      teamSize: size,
      teamMembers: resizeTeamMembers(prev.teamMembers, size),
    }));
  };

  const updateAgeCategory = (event: ChangeEvent<HTMLSelectElement>) => {
    const ageCategory = event.target.value as RobofestAgeCategory | "";
    setForm((prev) => ({
      ...prev,
      ageCategory,
      teamMembers: prev.teamMembers.map((member) => {
        const allowed = getGradesForAgeCategory(ageCategory);
        return {
          ...member,
          grade: allowed.includes(member.grade) ? member.grade : "",
        };
      }),
    }));
  };

  const updateMember =
    (index: number, field: keyof TeamMemberForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((prev) => {
        const teamMembers = prev.teamMembers.map((member, i) =>
          i === index ? { ...member, [field]: value } : member,
        );
        return { ...prev, teamMembers };
      });
    };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setWarning("");

    if (
      !form.division ||
      isRobofestDivisionRegistrationClosed(deadlineContent, form.division)
    ) {
      setError(
        form.division
          ? tErrors("divisionClosed", { name: form.division })
          : tErrors("selectDivision"),
      );
      return;
    }

    if (!rulesUnderstood) {
      setError(tErrors("rules"));
      return;
    }

    if (isPaid && amount > 0 && !understood) {
      setError(tErrors("fee"));
      return;
    }

    setIsSubmitting(true);

    const payload = {
      category,
      name: "",
      division: form.division,
      ageCategory: form.ageCategory,
      teamSize: form.teamSize,
      teamMembers: form.teamMembers.slice(0, form.teamSize).map((m) => ({
        name: m.name,
        email: m.email,
        phone: m.phone,
        schoolSelection: m.schoolSelection,
        customSchool: m.customSchool,
        branch: m.branch,
        grade: m.grade,
      })),
      campusAmbassadorId: form.campusAmbassadorId || undefined,
    };

    try {
      if (isPaid && amount > 0) {
        const result = await initiateRobofestPaidCheckout(payload);
        if (!result.success || !result.checkoutUrl) {
          setError(result.error || tErrors("payment"));
          return;
        }
        window.location.href = result.checkoutUrl;
        return;
      }

      const result = await submitRobofestRegistration(payload);
      if (!result.success) {
        setError(result.error || tErrors("submit"));
        return;
      }

      setRegistrationId(result.registrationId ?? null);
      setTeamNumber(result.teamNumber ?? null);
      if (result.warning) setWarning(result.warning);
      setIsSubmitted(true);
      setForm(emptyForm(firstOpenDivision));
    } catch {
      setError(tErrors("retry"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (allDivisionsClosed) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t("allClosedTitle")}</AlertTitle>
        <AlertDescription>{t("allClosedBody")}</AlertDescription>
      </Alert>
    );
  }

  if (isSubmitted) {
    return (
      <Alert className="border-green-200 bg-green-50 text-green-900">
        <AlertTitle>{t("successTitle")}</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            {isPaid
              ? t("successBodyNoPdf", { name: category })
              : t("successBody", { name: category })}
          </p>
          {registrationId ? (
            <p className="font-mono text-sm font-semibold">
              {t("successId", { count: registrationId })}
            </p>
          ) : null}
          {teamNumber ? (
            <p className="font-mono text-sm font-semibold text-cyan-800">
              {t("successTeamNumber", { name: teamNumber })}
            </p>
          ) : null}
          {warning ? <p className="text-amber-800 text-sm">{warning}</p> : null}
        </AlertDescription>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => {
            setIsSubmitted(false);
            setError("");
            setWarning("");
            setRegistrationId(null);
            setTeamNumber(null);
          }}
        >
          {t("registerAnother")}
        </Button>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor={fieldId("competition")}
          className="text-sm font-medium text-gray-700"
        >
          {t("labelCompetition")}
        </label>
        <Input
          id={fieldId("competition")}
          value={category}
          readOnly
          className="bg-gray-50"
        />
      </div>

      <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 leading-relaxed">
        {t("teamNumberHint")}
      </p>

      <div className="space-y-1.5">
        <label
          htmlFor={fieldId("division")}
          className="text-sm font-medium text-gray-700"
        >
          {t("labelDivision")} <span className="text-red-500">*</span>
        </label>
        <select
          id={fieldId("division")}
          value={form.division}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, division: e.target.value }))
          }
          required
          className={selectClassName}
        >
          <option value="">{t("selectDivision")}</option>
          {divisionOptions.map((d) => (
            <option key={d.value} value={d.value} disabled={d.closed}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {selectedDivisionClosed ? (
        <Alert variant="destructive">
          <AlertTitle>{t("divisionClosedTitle")}</AlertTitle>
          <AlertDescription>
            {t("divisionClosedBody", { name: form.division })}
          </AlertDescription>
        </Alert>
      ) : null}

      {!selectedDivisionClosed ? (
      <>
      <div className="space-y-1.5">
        <label
          htmlFor={fieldId("age-category")}
          className="text-sm font-medium text-gray-700"
        >
          {t("labelAgeCategory")} <span className="text-red-500">*</span>
        </label>
        <select
          id={fieldId("age-category")}
          value={form.ageCategory}
          onChange={updateAgeCategory}
          required
          className={selectClassName}
        >
          <option value="">{t("selectCategory")}</option>
          {ROBOFEST_AGE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {ageCategoryLabel(c.value)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={fieldId("team-size")}
          className="text-sm font-medium text-gray-700"
        >
          {t("labelTeamSize")} <span className="text-red-500">*</span>
        </label>
        <select
          id={fieldId("team-size")}
          value={form.teamSize}
          onChange={updateTeamSize}
          required
          className={selectClassName}
        >
          {[1, 2, 3, 4].map((size) => (
            <option key={size} value={size}>
              {String(size).padStart(2, "0")}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {form.teamMembers.slice(0, form.teamSize).map((member, index) => (
          <fieldset
            key={`member-${index}`}
            className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/70 p-3"
          >
            <legend className="px-1 text-sm font-semibold text-gray-800">
              {t("memberLegend", {
                count: String(index + 1).padStart(2, "0"),
              })}
            </legend>

            <div className="space-y-1.5">
              <label
                htmlFor={fieldId(`member-${index}-name`)}
                className="text-sm font-medium text-gray-700"
              >
                {index === 0 ? t("memberNameLeader") : t("memberName")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                id={fieldId(`member-${index}-name`)}
                value={member.name}
                onChange={updateMember(index, "name")}
                required
                autoComplete="name"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor={fieldId(`member-${index}-email`)}
                className="text-sm font-medium text-gray-700"
              >
                {t("memberEmail")} <span className="text-red-500">*</span>
              </label>
              <Input
                id={fieldId(`member-${index}-email`)}
                type="email"
                value={member.email}
                onChange={updateMember(index, "email")}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor={fieldId(`member-${index}-phone`)}
                className="text-sm font-medium text-gray-700"
              >
                {t("memberPhone")} <span className="text-red-500">*</span>
              </label>
              <Input
                id={fieldId(`member-${index}-phone`)}
                type="tel"
                value={member.phone}
                onChange={updateMember(index, "phone")}
                placeholder="01XXXXXXXXX"
                required
                inputMode="numeric"
                autoComplete="tel"
              />
              <p className="text-xs text-gray-500">{t("memberPhoneHint")}</p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor={fieldId(`member-${index}-school`)}
                className="text-sm font-medium text-gray-700"
              >
                {t("memberInstitution")} <span className="text-red-500">*</span>
              </label>
              <select
                id={fieldId(`member-${index}-school`)}
                value={member.schoolSelection}
                onChange={updateMember(index, "schoolSelection")}
                required
                className={selectClassName}
              >
                <option value="">{t("selectInstitution")}</option>
                <option value={PRIVATE_CANDIDATE_OPTION}>
                  {t("optionPrivateCandidate")}
                </option>
                {schools.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
                <option value={SCHOOL_NOT_FOUND_OPTION}>
                  {t("optionSchoolNotFound")}
                </option>
              </select>
            </div>

            {member.schoolSelection === SCHOOL_NOT_FOUND_OPTION ? (
              <div className="space-y-1.5">
                <label
                  htmlFor={fieldId(`member-${index}-custom-school`)}
                  className="text-sm font-medium text-gray-700"
                >
                  {t("memberCustomInstitution")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  id={fieldId(`member-${index}-custom-school`)}
                  value={member.customSchool}
                  onChange={updateMember(index, "customSchool")}
                  required
                  autoComplete="organization"
                />
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label
                htmlFor={fieldId(`member-${index}-branch`)}
                className="text-sm font-medium text-gray-700"
              >
                {t("memberBranch")}{" "}
                <span className="text-gray-400 font-normal">
                  {t("memberBranchOptional")}
                </span>
              </label>
              <Input
                id={fieldId(`member-${index}-branch`)}
                value={member.branch}
                onChange={updateMember(index, "branch")}
                placeholder={t("memberBranchPlaceholder")}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor={fieldId(`member-${index}-grade`)}
                className="text-sm font-medium text-gray-700"
              >
                {t("memberGrade")} <span className="text-red-500">*</span>
              </label>
              <select
                id={fieldId(`member-${index}-grade`)}
                value={member.grade}
                onChange={updateMember(index, "grade")}
                required
                disabled={!form.ageCategory}
                className={selectClassName}
              >
                <option value="">
                  {form.ageCategory
                    ? t("selectGrade")
                    : t("selectCategoryFirst")}
                </option>
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    {gradeLabel(grade)}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>
        ))}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={fieldId("ambassador")}
          className="text-sm font-medium text-gray-700"
        >
          {t("labelAmbassador")} <span className="text-red-500">*</span>
        </label>
        <select
          id={fieldId("ambassador")}
          value={form.campusAmbassadorId}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              campusAmbassadorId: e.target.value,
            }))
          }
          required
          className={selectClassName}
        >
          <option value="">{t("selectAmbassador")}</option>
          {campusAmbassadors.map((a) => (
            <option key={a.id} value={a.id}>
              {formatCampusAmbassadorLabel(a)}
            </option>
          ))}
          <option value={ROBOFEST_CAMPUS_AMBASSADOR_NOT_APPLICABLE}>
            {t("optionAmbassadorNA")}
          </option>
        </select>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>{tErrors("couldNotSubmit")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2.5">
        <label
          htmlFor={fieldId("rules-understood")}
          className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 cursor-pointer"
        >
          <Checkbox
            id={fieldId("rules-understood")}
            checked={rulesUnderstood}
            onCheckedChange={(checked) => setRulesUnderstood(checked === true)}
            className="mt-0.5"
          />
          <span className="text-sm text-slate-700 leading-snug">
            {(() => {
              const label = t("rulesCheckbox", { name: category })
              if (!rulesPdf) return label
              const match = label.match(/^(.*)\(([^)]+)\)\.?\s*$/)
              if (!match) return label
              return (
                <>
                  {match[1]}(
                  <a
                    href={rulesPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-cyan-700 underline underline-offset-2 hover:text-cyan-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {match[2]}
                  </a>
                  ).
                </>
              )
            })()}
          </span>
        </label>

        {isPaid && amount > 0 ? (
          <label
            htmlFor={fieldId("understood")}
            className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 cursor-pointer"
          >
            <Checkbox
              id={fieldId("understood")}
              checked={understood}
              onCheckedChange={(checked) => setUnderstood(checked === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-slate-700 leading-snug">
              {t("feeCheckbox", {
                count: totalAmount,
                title: form.teamSize,
                name: amount,
              })}
            </span>
          </label>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={
          isSubmitting ||
          !rulesUnderstood ||
          (isPaid && amount > 0 && !understood)
        }
        className="w-full bg-indigo-500 text-white hover:bg-indigo-600"
      >
        {isSubmitting
          ? isPaid
            ? t("submitRedirecting")
            : t("submitSubmitting")
          : isPaid
            ? t("submitPaid", { count: totalAmount })
            : t("submitFree")}
      </Button>
      </>
      ) : null}
    </form>
  );
}
