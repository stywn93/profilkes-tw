// Batch 1 (2026-11-25): API clients for Resume, Tabel 1, 6, 7, 8 and the
// population summary. Batch 2 (2026-11-25): SDMK (Tabel 13-18).
// Follows the pattern of populationApi.ts:
// validate the payload shape, throw a plain Error on a bad row.
// NOTE: base URL and year are still hardcoded (localhost:3000, 2025),
// as in the existing clients — fixing that is a separate task, out of
// Batch 1 scope (see the review 2026-11-25).

const API_BASE = "http://localhost:3000/api";
const YEAR = 2025;

export interface ResumeIndicator {
  metricCode: string;
  metricName: string;
  section: string | null;
  sectionName: string | null;
  male: number | null;
  female: number | null;
  total: number | null;
  percentage: number | null;
  unit: string | null;
  sourceReference: string | null;
  dataQualityFlag: string | null;
}

// Baris /sdmk/table: seperti ResumeIndicator, ditambah kategori & nama fasyankes.
export interface SdmkTableRow extends ResumeIndicator {
  regionType: string;
  regionName: string;
}

export interface PopulationSummary {
  totalPopulation: number | null;
  male: number | null;
  female: number | null;
  dependencyRatio: number | null;
  sexRatio: number | null;
  literacy15Plus: number | null;
  literacyMale: number | null;
  literacyFemale: number | null;
}

export interface District {
  kecamatan: string;
  luasKm2: number | null;
  desa: number | null;
  kelurahan: number | null;
  desaKelurahan: number | null;
  penduduk: number | null;
  rumahTangga: number | null;
  rataJiwaPerRumah: number | null;
  kepadatan: number | null;
}

export interface HospitalPerformance {
  hospital: string;
  tempatTidur: number | null;
  pasienKeluar: { male: number | null; female: number | null; total: number | null };
  pasienMati: { male: number | null; female: number | null; total: number | null };
  pasienMati48Jam: { male: number | null; female: number | null; total: number | null };
  gdr: { male: number | null; female: number | null; total: number | null };
  ndr: { male: number | null; female: number | null; total: number | null };
  hariPerawatan: number | null;
  lamaDirawat: number | null;
  bor: number | null;
  bto: number | null;
  toi: number | null;
  alos: number | null;
}

export interface TopDisease {
  rank: number;
  icd: string | null;
  disease: string;
  male: number | null;
  female: number | null;
  total: number | null;
  totalVisits: number | null;
}

async function fetchJson(url: string, signal: AbortSignal | undefined, label: string) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`${label} request failed (${response.status}).`);
  }
  return (await response.json()) as unknown;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export async function fetchResumeIndicators(
  signal?: AbortSignal,
): Promise<ResumeIndicator[]> {
  const payload = await fetchJson(
    `${API_BASE}/resume?year=${YEAR}`,
    signal,
    "Resume",
  );
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    throw new Error("Resume API returned an invalid data format.");
  }
  return payload.data as ResumeIndicator[];
}

async function fetchPopulationSummary(
  signal?: AbortSignal,
): Promise<PopulationSummary> {
  const payload = await fetchJson(
    `${API_BASE}/population/summary?year=${YEAR}`,
    signal,
    "Population summary",
  );
  if (!isRecord(payload)) {
    throw new Error("Population summary API returned an invalid data format.");
  }
  return payload as unknown as PopulationSummary;
}

export async function fetchDistricts(
  signal?: AbortSignal,
): Promise<{ data: District[]; total: District }> {
  const payload = await fetchJson(
    `${API_BASE}/demography/districts?year=${YEAR}`,
    signal,
    "Districts",
  );
  if (!isRecord(payload) || !Array.isArray(payload.data) || !isRecord(payload.total)) {
    throw new Error("Districts API returned an invalid data format.");
  }
  return payload as unknown as { data: District[]; total: District };
}

export async function fetchHospitalPerformance(
  signal?: AbortSignal,
): Promise<{ data: HospitalPerformance[]; total: HospitalPerformance | null }> {
  const payload = await fetchJson(
    `${API_BASE}/hospitals/performance?year=${YEAR}`,
    signal,
    "Hospital performance",
  );
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    throw new Error("Hospital performance API returned an invalid data format.");
  }
  return payload as unknown as {
    data: HospitalPerformance[];
    total: HospitalPerformance | null;
  };
}

export async function fetchTopDiseases(
  signal?: AbortSignal,
): Promise<{ data: TopDisease[]; totalPatients: number | null; totalVisits: number | null }> {
  const payload = await fetchJson(
    `${API_BASE}/diseases/top10?year=${YEAR}&type=outpatient`,
    signal,
    "Top diseases",
  );
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    throw new Error("Top diseases API returned an invalid data format.");
  }
  return payload as unknown as {
    data: TopDisease[];
    totalPatients: number | null;
    totalVisits: number | null;
  };
}

export interface SdmkSummaryMetric {
  metricCode: string;
  metricName: string;
  total: number | null;
  male: number | null;
  female: number | null;
  strTotal: number | null;
  strMale: number | null;
  strFemale: number | null;
  ratio: number | null;
  ratioUnit: string | null;
  unit: string | null;
  jumlahFlag: string | null;
  strFlag: string | null;
  ratioFlag: string | null;
}

export interface SdmkSummaryTable {
  table: string;
  title: string;
  metrics: SdmkSummaryMetric[];
}

export async function fetchSdmkSummary(
  signal?: AbortSignal,
): Promise<SdmkSummaryTable[]> {
  const payload = await fetchJson(
    `${API_BASE}/sdmk/summary?year=${YEAR}`,
    signal,
    "SDMK summary",
  );
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    throw new Error("SDMK summary API returned an invalid data format.");
  }
  return payload.data as SdmkSummaryTable[];
}

export async function fetchSdmkTable(
  table: string,
  category: string,
  signal?: AbortSignal,
): Promise<SdmkTableRow[]> {
  const payload = await fetchJson(
    `${API_BASE}/sdmk/table?year=${YEAR}&table=${encodeURIComponent(table)}&category=${encodeURIComponent(category)}`,
    signal,
    "SDMK table",
  );
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    throw new Error("SDMK table API returned an invalid data format.");
  }
  return payload.data as SdmkTableRow[];
}

export { fetchPopulationSummary };
