export interface EducationData {
  metricCode: string;
  metricName: string;
  male: number | null;
  female: number | null;
  total: number;
  totalPercentage: number | null;
}

interface LiteracyEducationApiResponse {
  data: Array<{
    metricCode: unknown;
    metricGroup: unknown;
    metricName: unknown;
    maleCount: unknown;
    femaleCount: unknown;
    totalCount: unknown;
    totalPercentage: unknown;
  }>;
}

const literacyEducationApiUrl =
  "http://localhost:3000/api/population/literacy-education?year=2025";

function parseNumber(value: unknown, fieldName: string): number;
function parseNumber(
  value: unknown,
  fieldName: string,
  allowNull: true,
): number | null;
function parseNumber(value: unknown, fieldName: string, allowNull = false) {
  if (value === null && allowNull) {
    return null;
  }

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) {
    throw new Error(`Literacy and education API returned an invalid ${fieldName}.`);
  }

  return parsedValue;
}

export async function fetchEducationData(
  signal?: AbortSignal,
): Promise<EducationData[]> {
  const response = await fetch(literacyEducationApiUrl, { signal });

  if (!response.ok) {
    throw new Error(
      `Literacy and education API request failed (${response.status}).`,
    );
  }

  const payload = (await response.json()) as LiteracyEducationApiResponse;

  if (!Array.isArray(payload.data)) {
    throw new Error("Literacy and education API returned an invalid data format.");
  }

  return payload.data
    .filter((row) => row.metricGroup === "education")
    .map((row) => {
      if (typeof row.metricCode !== "string" || typeof row.metricName !== "string") {
        throw new Error("Literacy and education API returned an invalid metric.");
      }

      return {
        metricCode: row.metricCode,
        metricName: row.metricName,
        male: parseNumber(row.maleCount, "male count", true),
        female: parseNumber(row.femaleCount, "female count", true),
        total: parseNumber(row.totalCount, "total count"),
        totalPercentage: parseNumber(
          row.totalPercentage,
          "total percentage",
          true,
        ),
      };
    });
}
