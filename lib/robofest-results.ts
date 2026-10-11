/**
 * Public Robofest Bangladesh 2026 results (team level, no student names).
 *
 * Source: RoboFest_Bangladesh_2026_Results.xlsx (national) and
 * RoboFest_Bangladesh_2026_CTG_Winners_Outreach.xlsx ("Winners - Public", Chittagong).
 * Teams without a team code or a named school are left out until verified.
 */

export type RobofestResultRegion = "National" | "Chittagong";

export type RobofestResultRow = {
  region: RobofestResultRegion;
  competition: string;
  division: string;
  place: string;
  recognition: string;
  teamCode: string;
  school: string;
  project: string;
};

export type RobofestResults = {
  /** "provisional" shows a notice that names and codes are being verified. */
  status: "provisional" | "verified";
  rows: RobofestResultRow[];
};

const EXPLORERS = "Explorers (Grades 5–8)";
const INNOVATORS = "Innovators (Grades 9–12)";

export const ROBOFEST_RESULTS_SEED: RobofestResults = {
  status: "provisional",
  rows: [
    // National — BuildAthon
    { region: "National", competition: "BuildAthon", division: EXPLORERS, place: "1st", recognition: "Elite", teamCode: "BA#015", school: "International Hope School Bangladesh", project: "" },
    { region: "National", competition: "BuildAthon", division: EXPLORERS, place: "2nd", recognition: "Elite", teamCode: "BA#017", school: "International Hope School Bangladesh", project: "" },
    { region: "National", competition: "BuildAthon", division: EXPLORERS, place: "3rd", recognition: "Cont.", teamCode: "BA#005", school: "Cantonment Public School & College, Lalmonirhat", project: "" },
    { region: "National", competition: "BuildAthon", division: EXPLORERS, place: "3rd", recognition: "Cont.", teamCode: "BA#009", school: "International Hope School Bangladesh", project: "" },
    { region: "National", competition: "BuildAthon", division: INNOVATORS, place: "1st", recognition: "Elite", teamCode: "BA#016", school: "International Hope School Bangladesh", project: "" },
    { region: "National", competition: "BuildAthon", division: INNOVATORS, place: "2nd", recognition: "Elite", teamCode: "BA#018", school: "Sristy Academic School", project: "" },
    { region: "National", competition: "BuildAthon", division: INNOVATORS, place: "3rd", recognition: "Cont.", teamCode: "BA#013", school: "International Hope School Bangladesh", project: "" },
    // National — Robo Exhibition
    { region: "National", competition: "Robo Exhibition", division: EXPLORERS, place: "1st", recognition: "Elite", teamCode: "RE#003", school: "MASCO School Kanchan", project: "" },
    { region: "National", competition: "Robo Exhibition", division: EXPLORERS, place: "2nd", recognition: "Elite", teamCode: "RE#018", school: "Manarat Dhaka Int'l School & College", project: "" },
    { region: "National", competition: "Robo Exhibition", division: EXPLORERS, place: "3rd", recognition: "Cont.", teamCode: "RE#005", school: "Manarat Dhaka Int'l School & College", project: "" },
    { region: "National", competition: "Robo Exhibition", division: INNOVATORS, place: "1st", recognition: "Elite", teamCode: "RE#019", school: "Sristy Academy School", project: "" },
    { region: "National", competition: "Robo Exhibition", division: INNOVATORS, place: "2nd", recognition: "Elite", teamCode: "RE#015", school: "International Hope School Bangladesh", project: "" },
    { region: "National", competition: "Robo Exhibition", division: INNOVATORS, place: "3rd", recognition: "Cont.", teamCode: "RE#004", school: "International Hope School Bangladesh", project: "" },
    // National — Bottle Sumo
    { region: "National", competition: "Bottle Sumo", division: EXPLORERS, place: "1st", recognition: "Elite", teamCode: "BS#014", school: "Manarat Dhaka Int'l School & College", project: "" },
    { region: "National", competition: "Bottle Sumo", division: EXPLORERS, place: "2nd", recognition: "Elite", teamCode: "BS#016", school: "Cantonment Public School & College, Lalmonirhat", project: "" },
    { region: "National", competition: "Bottle Sumo", division: EXPLORERS, place: "3rd", recognition: "Cont.", teamCode: "BS#025", school: "Manarat Dhaka Int'l School BD", project: "" },
    { region: "National", competition: "Bottle Sumo", division: EXPLORERS, place: "3rd", recognition: "Cont.", teamCode: "BS#020", school: "International Hope School BD", project: "" },
    { region: "National", competition: "Bottle Sumo", division: INNOVATORS, place: "1st", recognition: "Elite", teamCode: "BS#010", school: "International Hope School BD", project: "" },
    { region: "National", competition: "Bottle Sumo", division: INNOVATORS, place: "2nd", recognition: "Elite", teamCode: "BS#033", school: "Manarat Dhaka Int'l School", project: "" },
    { region: "National", competition: "Bottle Sumo", division: INNOVATORS, place: "3rd", recognition: "Cont.", teamCode: "BS#024", school: "Bangladesh Int'l School & College", project: "" },
    { region: "National", competition: "Bottle Sumo", division: INNOVATORS, place: "3rd", recognition: "Cont.", teamCode: "BS#019", school: "Maple Leaf International School", project: "" },
    // National — Line Following Robot
    { region: "National", competition: "Line Following Robot", division: EXPLORERS, place: "1st", recognition: "Elite", teamCode: "LF#041", school: "Manarat Dhaka Int'l School", project: "" },
    { region: "National", competition: "Line Following Robot", division: EXPLORERS, place: "2nd", recognition: "Elite", teamCode: "LF#039", school: "South Breeze", project: "" },
    { region: "National", competition: "Line Following Robot", division: INNOVATORS, place: "1st", recognition: "Elite", teamCode: "LF#011", school: "MASCO School Kanchan", project: "" },
    { region: "National", competition: "Line Following Robot", division: INNOVATORS, place: "2nd", recognition: "Elite", teamCode: "LF#052", school: "Manarat Dhaka Int'l School", project: "" },
    { region: "National", competition: "Line Following Robot", division: INNOVATORS, place: "3rd", recognition: "Elite", teamCode: "LF#007", school: "International Hope School BD", project: "" },
    // Chittagong regional
    { region: "Chittagong", competition: "BuildAthon", division: EXPLORERS, place: "1st", recognition: "Distinction", teamCode: "BA#011", school: "Cider International School", project: "Blind Assistant" },
    { region: "Chittagong", competition: "BuildAthon", division: INNOVATORS, place: "1st", recognition: "", teamCode: "BA#010", school: "Cantonment English School & College, Chattogram", project: "Krishibondhu" },
    { region: "Chittagong", competition: "BuildAthon", division: INNOVATORS, place: "2nd", recognition: "", teamCode: "BA#006", school: "Chittagong Grammar School Upper Campus", project: "Agribot" },
    { region: "Chittagong", competition: "Robo Exhibition", division: EXPLORERS, place: "1st", recognition: "", teamCode: "RE#011", school: "Cider International School", project: "Smart safety and weather response" },
    { region: "Chittagong", competition: "Robo Exhibition", division: EXPLORERS, place: "2nd", recognition: "", teamCode: "RE#012", school: "Cider International School", project: "Ronan" },
    { region: "Chittagong", competition: "Robo Exhibition", division: INNOVATORS, place: "1st", recognition: "Distinction", teamCode: "RE#013", school: "Cider International School", project: "Braille communication" },
    { region: "Chittagong", competition: "Robo Exhibition", division: INNOVATORS, place: "2nd", recognition: "", teamCode: "RE#007", school: "Presidency International School", project: "IoT Health monitoring" },
  ],
};

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Normalizes a stored `results` payload; falls back to the seed when it is missing or malformed. */
export function normalizeRobofestResults(value: unknown): RobofestResults {
  if (!value || typeof value !== "object" || !Array.isArray((value as { rows?: unknown }).rows)) {
    return { ...ROBOFEST_RESULTS_SEED, rows: [...ROBOFEST_RESULTS_SEED.rows] };
  }
  const raw = value as { status?: unknown; rows: unknown[] };
  const rows: RobofestResultRow[] = raw.rows
    .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
    .map((row): RobofestResultRow => ({
      region: asText(row.region) === "Chittagong" ? "Chittagong" : "National",
      competition: asText(row.competition),
      division: asText(row.division),
      place: asText(row.place),
      recognition: asText(row.recognition),
      teamCode: asText(row.teamCode),
      school: asText(row.school),
      project: asText(row.project),
    }))
    .filter((row) => row.competition && row.division && row.place && row.school);
  return {
    status: raw.status === "verified" ? "verified" : "provisional",
    rows,
  };
}
