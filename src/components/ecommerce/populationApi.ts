export interface PopulationAgeGroupData {
  ageGroup: string;
  male: number;
  female: number;
  total: number;
}

interface PopulationApiResponse {
  data: Array<{
    ageGroup: unknown;
    maleCount: unknown;
    femaleCount: unknown;
    totalCount: unknown;
  }>;
}

const populationApiUrl =
  "http://localhost:3000/api/population/age-groups?year=2025";

export async function fetchPopulationAgeGroups(
  signal?: AbortSignal,
): Promise<PopulationAgeGroupData[]> {
  const response = await fetch(populationApiUrl, { signal });

  if (!response.ok) {
    throw new Error(`Population API request failed (${response.status}).`);
  }

  const payload = (await response.json()) as PopulationApiResponse;

  if (!Array.isArray(payload.data)) {
    throw new Error("Population API returned an invalid data format.");
  }

  return payload.data.map((row) => {
    if (
      typeof row.ageGroup !== "string" ||
      typeof row.maleCount !== "number" ||
      typeof row.femaleCount !== "number" ||
      typeof row.totalCount !== "number"
    ) {
      throw new Error("Population API returned an invalid age-group row.");
    }

    return {
      ageGroup: row.ageGroup,
      male: row.maleCount,
      female: row.femaleCount,
      total: row.totalCount,
    };
  });
}
