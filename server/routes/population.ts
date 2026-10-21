import { Router } from "express";
import type { RowDataPacket } from "mysql2";
import { pool } from "../db.ts";

interface PopulationAgeGroupRow extends RowDataPacket {
  id: number;
  reportYear: number;
  regionType: string;
  regionName: string;
  ageGroup: string;
  ageMin: number | null;
  ageMax: number | null;
  maleCount: number;
  femaleCount: number;
  totalCount: number;
  sexRatio: string;
  sourceReference: string | null;
}

const router = Router();

router.get("/age-groups", async (request, response) => {
  const rawYear = request.query.year;

  if (typeof rawYear !== "string" || !/^\d{4}$/.test(rawYear)) {
    response.status(400).json({
      error: "The year query parameter is required and must be a four-digit year.",
    });
    return;
  }

  const year = Number(rawYear);
  if (year < 1) {
    response.status(400).json({
      error: "The year query parameter must be a valid year.",
    });
    return;
  }

  try {
    const [rows] = await pool.query<PopulationAgeGroupRow[]>(
      `
        SELECT
          id,
          report_year AS reportYear,
          region_type AS regionType,
          region_name AS regionName,
          age_group AS ageGroup,
          age_min AS ageMin,
          age_max AS ageMax,
          male_count AS maleCount,
          female_count AS femaleCount,
          total_count AS totalCount,
          sex_ratio AS sexRatio,
          source_reference AS sourceReference
        FROM population_age_groups
        WHERE report_year = ?
        ORDER BY age_min IS NULL, age_min ASC, id ASC
      `,
      [year],
    );

    response.json({ year, data: rows });
  } catch {
    response.status(500).json({ error: "Unable to load population data." });
  }
});

export default router;
