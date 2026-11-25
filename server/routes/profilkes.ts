import { Router } from "express";
import type { RowDataPacket } from "mysql2";
import { pool } from "../db.ts";

// Batch 1 (2026-11-25): Resume + Tabel 1, 6, 7, 8 from
// Tabel_Profilkes_2025_Final.xlsx, seeded via
// database/profilkes_indicators_batch1.sql (433 rows, 2025).
// Batch 2 (2026-11-25): SDMK Tabel 13-18, seeded via
// database/profilkes_indicators_batch2.sql (1106 rows, 2025).
// Values are Excel cached values; Excel errors are NULL with
// data_quality_flag='source_error', percentages >100% are kept as-is
// with data_quality_flag='pct_over_100_needs_confirmation'.

interface IndicatorRow extends RowDataPacket {
  metricCode: string;
  metricName: string;
  section: string | null;
  sectionName: string | null;
  regionType: string;
  regionName: string;
  male: string | number | null;
  female: string | number | null;
  total: string | number | null;
  percentage: string | number | null;
  unit: string | null;
  sourceReference: string | null;
  extraCode: string | null;
  dataQualityFlag: string | null;
}

const router = Router();

function parseYear(request: { query: { year?: unknown } }): number | null {
  const rawYear = request.query.year;
  if (typeof rawYear !== "string" || !/^\d{4}$/.test(rawYear)) {
    return null;
  }
  const year = Number(rawYear);
  return year < 1 ? null : year;
}

function toNumber(value: string | number | null): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function yearError(response: { status: (code: number) => { json: (body: unknown) => void } }) {
  response.status(400).json({
    error: "The year query parameter is required and must be a four-digit year.",
  });
}

const INDICATOR_COLUMNS = `
  metric_code AS metricCode,
  metric_name AS metricName,
  section,
  section_name AS sectionName,
  region_type AS regionType,
  region_name AS regionName,
  male, female, total, percentage,
  unit,
  source_reference AS sourceReference,
  extra_code AS extraCode,
  data_quality_flag AS dataQualityFlag
`;

// GET /api/resume?year=2025&section=I
router.get("/resume", async (request, response) => {
  const year = parseYear(request);
  if (year === null) {
    yearError(response);
    return;
  }
  const section = typeof request.query.section === "string" ? request.query.section : null;
  const validSections = ["I", "II", "III", "IV", "V", "VI", "VII"];
  if (section !== null && !validSections.includes(section)) {
    response.status(400).json({ error: "The section query parameter must be one of I, II, III, IV, V, VI, VII." });
    return;
  }
  try {
    const [rows] = await pool.query<IndicatorRow[]>(
      `SELECT ${INDICATOR_COLUMNS} FROM profilkes_indicators
       WHERE report_year = ? AND source_table = 'Resume'
       ${section ? "AND section = ?" : ""}
       ORDER BY metric_code ASC`,
      section ? [year, section] : [year],
    );
    response.json({
      year,
      section,
      data: rows.map((r) => ({
        metricCode: r.metricCode,
        metricName: r.metricName,
        section: r.section,
        sectionName: r.sectionName,
        male: toNumber(r.male),
        female: toNumber(r.female),
        total: toNumber(r.total),
        percentage: toNumber(r.percentage),
        unit: r.unit,
        sourceReference: r.sourceReference,
        dataQualityFlag: r.dataQualityFlag,
      })),
    });
  } catch {
    response.status(500).json({ error: "Unable to load resume indicators." });
  }
});

// GET /api/demography/districts?year=2025
router.get("/demography/districts", async (request, response) => {
  const year = parseYear(request);
  if (year === null) {
    yearError(response);
    return;
  }
  try {
    const [rows] = await pool.query<IndicatorRow[]>(
      `SELECT ${INDICATOR_COLUMNS} FROM profilkes_indicators
       WHERE report_year = ? AND source_table = 'Tabel 1'
       ORDER BY id ASC`,
      [year],
    );
    // region_type distinguishes the kabupaten total (region_name='Situbondo',
    // region_type='kabupaten') from kecamatan Situbondo, so split them here.
    const kecamatanRows = rows.filter((r) => r.regionType === "kecamatan");
    const kabupatenRows = rows.filter((r) => r.regionType === "kabupaten");
    const districtNames: string[] = [];
    const districtMap = new Map<string, Record<string, number | null>>();
    for (const r of kecamatanRows) {
      if (!districtMap.has(r.regionName)) {
        districtMap.set(r.regionName, {});
        districtNames.push(r.regionName);
      }
      districtMap.get(r.regionName)![r.metricCode.replace("T1-", "")] = toNumber(r.total);
    }
    const totalMap: Record<string, number | null> = {};
    for (const r of kabupatenRows) {
      totalMap[r.metricCode.replace("T1-", "")] = toNumber(r.total);
    }
    const build = (name: string, map: Record<string, number | null>) => ({
      kecamatan: name,
      luasKm2: map.luas_km2 ?? null,
      desa: map.desa ?? null,
      kelurahan: map.kelurahan ?? null,
      desaKelurahan: map.desa_kelurahan ?? null,
      penduduk: map.penduduk ?? null,
      rumahTangga: map.rumah_tangga ?? null,
      rataJiwaPerRumah: map.rata_jiwa_per_rumah ?? null,
      kepadatan: map.kepadatan ?? null,
    });
    response.json({
      year,
      data: districtNames.map((n) => build(n, districtMap.get(n)!)),
      total: build("Kabupaten Situbondo", totalMap),
    });
  } catch {
    response.status(500).json({ error: "Unable to load district data." });
  }
});

// GET /api/hospitals/performance?year=2025
router.get("/hospitals/performance", async (request, response) => {
  const year = parseYear(request);
  if (year === null) {
    yearError(response);
    return;
  }
  try {
    const [rows] = await pool.query<IndicatorRow[]>(
      `SELECT ${INDICATOR_COLUMNS} FROM profilkes_indicators
       WHERE report_year = ? AND source_table IN ('Tabel 6', 'Tabel 7')
       ORDER BY id ASC`,
      [year],
    );
    const buildMap = (list: IndicatorRow[]) => {
      const map = new Map<string, Record<string, { male: number | null; female: number | null; total: number | null }>>();
      const names: string[] = [];
      for (const r of list) {
        if (!map.has(r.regionName)) {
          map.set(r.regionName, {});
          names.push(r.regionName);
        }
        map.get(r.regionName)![r.metricCode] = {
          male: toNumber(r.male),
          female: toNumber(r.female),
          total: toNumber(r.total),
        };
      }
      return { map, names };
    };
    const hospitals = buildMap(rows.filter((r) => r.regionType === "rumah_sakit"));
    const totals = buildMap(rows.filter((r) => r.regionType === "kabupaten"));
    const toHospital = (name: string, map: Map<string, Record<string, { male: number | null; female: number | null; total: number | null }>>) => {
      const v = map.get(name) ?? {};
      const pick = (code: string) => v[code]?.total ?? null;
      const pickMF = (code: string) => ({
        male: v[code]?.male ?? null,
        female: v[code]?.female ?? null,
        total: v[code]?.total ?? null,
      });
      return {
        hospital: name,
        tempatTidur: pick("T7-tempat_tidur"),
        pasienKeluar: pickMF("T6-pasien_keluar"),
        pasienMati: pickMF("T6-pasien_mati"),
        pasienMati48Jam: pickMF("T6-pasien_mati_48jam"),
        gdr: pickMF("T6-gdr"),
        ndr: pickMF("T6-ndr"),
        hariPerawatan: pick("T7-hari_perawatan"),
        lamaDirawat: pick("T7-lama_dirawat"),
        bor: pick("T7-bor"),
        bto: pick("T7-bto"),
        toi: pick("T7-toi"),
        alos: pick("T7-alos"),
      };
    };
    response.json({
      year,
      data: hospitals.names.map((n) => toHospital(n, hospitals.map)),
      total: totals.names.length > 0 ? toHospital(totals.names[0], totals.map) : null,
    });
  } catch {
    response.status(500).json({ error: "Unable to load hospital performance data." });
  }
});

// GET /api/diseases/top10?year=2025&type=outpatient
router.get("/diseases/top10", async (request, response) => {
  const year = parseYear(request);
  if (year === null) {
    yearError(response);
    return;
  }
  const type = typeof request.query.type === "string" ? request.query.type : "outpatient";
  if (type !== "outpatient") {
    response.status(400).json({ error: "Only type=outpatient is available in Batch 1." });
    return;
  }
  try {
    const [rows] = await pool.query<IndicatorRow[]>(
      `SELECT ${INDICATOR_COLUMNS} FROM profilkes_indicators
       WHERE report_year = ? AND source_table = 'Tabel 8'
       ORDER BY metric_code ASC`,
      [year],
    );
    const diseases: Array<{ rank: number; icd: string | null; disease: string; male: number | null; female: number | null; total: number | null; totalVisits: number | null }> = [];
    let totalPatients: number | null = null;
    let totalVisits: number | null = null;
    const byCode = new Map<string, IndicatorRow>();
    for (const r of rows) byCode.set(r.metricCode, r);
    for (let rank = 1; rank <= 10; rank++) {
      const code = `T8-${String(rank).padStart(2, "0")}`;
      const row = byCode.get(code);
      const visitRow = byCode.get(`${code}-kunjungan`);
      if (!row) continue;
      diseases.push({
        rank,
        icd: row.extraCode,
        disease: row.metricName,
        male: toNumber(row.male),
        female: toNumber(row.female),
        total: toNumber(row.total),
        totalVisits: visitRow ? toNumber(visitRow.total) : null,
      });
    }
    const totalRow = byCode.get("T8-TOTAL");
    const totalVisitRow = byCode.get("T8-TOTAL-kunjungan");
    if (totalRow) totalPatients = toNumber(totalRow.total);
    if (totalVisitRow) totalVisits = toNumber(totalVisitRow.total);
    response.json({ year, type, data: diseases, totalPatients, totalVisits });
  } catch {
    response.status(500).json({ error: "Unable to load top diseases data." });
  }
});

const SDMK_TABLES = [
  "Tabel 13",
  "Tabel 14",
  "Tabel 15",
  "Tabel 16",
  "Tabel 17",
  "Tabel 18",
] as const;

const SDMK_TITLES: Record<string, string> = {
  "Tabel 13": "Tenaga Medis",
  "Tabel 14": "Tenaga Keperawatan dan Kebidanan",
  "Tabel 15": "Tenaga Kesmas, Kesling, dan Gizi",
  "Tabel 16": "Tenaga Kefarmasian, Psikologis Klinis, dan Kesehatan Tradisional",
  "Tabel 17": "Tenaga Teknik Biomedika, Keterapian Fisik, dan Keteknisian Medis",
  "Tabel 18": "Tenaga Penunjang/Pendukung Kesehatan",
};

// GET /api/sdmk/summary?year=2025
// Total tingkat kabupaten per tabel & metrik: JUMLAH (total + L/P), STR,
// dan rasio per 1000 penduduk. Rasio Tabel 13 & 17 di sumber menyimpang
// dari hitungan total/704243*1000 dan di-flag di seed (lihat
// database/profilkes_indicators_batch2.sql).
router.get("/sdmk/summary", async (request, response) => {
  const year = parseYear(request);
  if (year === null) {
    yearError(response);
    return;
  }
  try {
    interface SdmkSummaryRow extends IndicatorRow {
      sourceTable: string;
    }
    const [rows] = await pool.query<SdmkSummaryRow[]>(
      `SELECT source_table AS sourceTable, ${INDICATOR_COLUMNS} FROM profilkes_indicators
       WHERE report_year = ? AND source_table IN ('Tabel 13', 'Tabel 14', 'Tabel 15', 'Tabel 16', 'Tabel 17', 'Tabel 18')
       AND region_type = 'kabupaten'
       ORDER BY source_table ASC, metric_code ASC`,
      [year],
    );
    const byTable = new Map<string, Map<string, {
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
    }>>();
    for (const r of rows) {
      const kind = r.metricCode.endsWith("-jumlah")
        ? "jumlah"
        : r.metricCode.endsWith("-str")
          ? "str"
          : r.metricCode.endsWith("-rasio")
            ? "rasio"
            : null;
      if (kind === null) continue;
      const base = r.metricCode.replace(/-(jumlah|str|rasio)$/, "");
      const sourceTable = r.sourceTable;
      if (!byTable.has(sourceTable)) byTable.set(sourceTable, new Map());
      const tableMap = byTable.get(sourceTable)!;
      if (!tableMap.has(base)) {
        tableMap.set(base, {
          metricCode: base,
          metricName: r.metricName,
          total: null,
          male: null,
          female: null,
          strTotal: null,
          strMale: null,
          strFemale: null,
          ratio: null,
          ratioUnit: null,
          unit: r.unit,
          jumlahFlag: null,
          strFlag: null,
          ratioFlag: null,
        });
      }
      const entry = tableMap.get(base)!;
      if (kind === "jumlah") {
        entry.total = toNumber(r.total);
        entry.male = toNumber(r.male);
        entry.female = toNumber(r.female);
        entry.jumlahFlag = r.dataQualityFlag;
      } else if (kind === "str") {
        entry.strTotal = toNumber(r.total);
        entry.strMale = toNumber(r.male);
        entry.strFemale = toNumber(r.female);
        entry.strFlag = r.dataQualityFlag;
      } else {
        entry.ratio = toNumber(r.total);
        entry.ratioUnit = r.unit;
        entry.ratioFlag = r.dataQualityFlag;
      }
    }
    response.json({
      year,
      data: SDMK_TABLES.filter((t) => byTable.has(t)).map((t) => ({
        table: t,
        title: SDMK_TITLES[t],
        metrics: [...byTable.get(t)!.values()],
      })),
    });
  } catch {
    response.status(500).json({ error: "Unable to load SDMK summary data." });
  }
});

// GET /api/sdmk/table?year=2025&table=13&category=all
// Baris per fasyankes untuk satu tabel SDMK, plus baris total per kategori.
// category: all | puskesmas | rumah_sakit | fasyankes_lain. Baris total
// tingkat kabupaten (region_type='kabupaten') tidak ikut — itu ada di
// /api/sdmk/summary.
router.get("/sdmk/table", async (request, response) => {
  const year = parseYear(request);
  if (year === null) {
    yearError(response);
    return;
  }
  const table = typeof request.query.table === "string" ? request.query.table : null;
  if (table === null || !["13", "14", "15", "16", "17", "18"].includes(table)) {
    response.status(400).json({ error: "The table query parameter must be one of 13, 14, 15, 16, 17, 18." });
    return;
  }
  const category = typeof request.query.category === "string" ? request.query.category : "all";
  const validCategories = ["all", "puskesmas", "rumah_sakit", "fasyankes_lain"];
  if (!validCategories.includes(category)) {
    response.status(400).json({ error: "The category query parameter must be one of all, puskesmas, rumah_sakit, fasyankes_lain." });
    return;
  }
  const sectionLabel =
    category === "puskesmas"
      ? "PUSKESMAS"
      : category === "rumah_sakit"
        ? "RUMAH SAKIT"
        : category === "fasyankes_lain"
          ? "SARANA LAINNYA"
          : null;
  try {
    const [rows] = await pool.query<IndicatorRow[]>(
      `SELECT ${INDICATOR_COLUMNS} FROM profilkes_indicators
       WHERE report_year = ? AND source_table = ? AND region_type != 'kabupaten'
       ${category === "all" ? "" : "AND (region_type = ? OR (region_type = 'total' AND section = ?))"}
       ORDER BY id ASC`,
      category === "all"
        ? [year, `Tabel ${table}`]
        : [year, `Tabel ${table}`, category, sectionLabel],
    );
    response.json({
      year,
      table,
      category,
      data: rows.map((r) => ({
        metricCode: r.metricCode,
        metricName: r.metricName,
        section: r.section,
        sectionName: r.sectionName,
        regionType: r.regionType,
        regionName: r.regionName,
        male: toNumber(r.male),
        female: toNumber(r.female),
        total: toNumber(r.total),
        percentage: toNumber(r.percentage),
        unit: r.unit,
        sourceReference: r.sourceReference,
        dataQualityFlag: r.dataQualityFlag,
      })),
    });
  } catch {
    response.status(500).json({ error: "Unable to load SDMK table data." });
  }
});

export default router;
