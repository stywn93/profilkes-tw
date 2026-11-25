// Batch 2 (2026-11-25): SDMK — Tabel 13-18 (Seksi SDMK, Profilkes 2025).
// SdmkSection mengambil datanya sendiri (ringkasan kabupaten + tabel per
// fasyankes) supaya Ecommerce.tsx hanya perlu merender satu komponen.
// Nilai yang di-flag di seed ("perlu konfirmasi Dinkes") tampil apa adanya
// dengan badge, sesuai aturan default Batch 1.
import type { ApexOptions } from "apexcharts";
import { Fragment, useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import {
  fetchSdmkSummary,
  fetchSdmkTable,
  type SdmkSummaryTable as SdmkSummaryTableData,
  type SdmkTableRow,
} from "./profilkesApi";

interface SdmkMetricDef {
  code: string;
  name: string;
}

const SDMK_TABLES: Array<{ table: string; title: string; metrics: SdmkMetricDef[] }> = [
  {
    table: "13",
    title: "Tabel 13 — Tenaga Medis",
    metrics: [
      { code: "dokter", name: "Dokter" },
      { code: "dokter_spesialis", name: "Dokter Spesialis" },
      { code: "dokter_sub_spesialis", name: "Dokter Sub Spesialis" },
      { code: "dokter_total", name: "Total Dokter" },
      { code: "dokter_gigi", name: "Dokter Gigi" },
      { code: "dokter_gigi_spesialis", name: "Dokter Gigi Spesialis" },
      { code: "dokter_gigi_sub_spesialis", name: "Dokter Gigi Sub Spesialis" },
      { code: "dokter_gigi_total", name: "Total Dokter Gigi" },
    ],
  },
  {
    table: "14",
    title: "Tabel 14 — Tenaga Keperawatan dan Kebidanan",
    metrics: [
      { code: "keperawatan", name: "Tenaga Keperawatan" },
      { code: "kebidanan", name: "Tenaga Kebidanan" },
    ],
  },
  {
    table: "15",
    title: "Tabel 15 — Tenaga Kesmas, Kesling, dan Gizi",
    metrics: [
      { code: "kesmas", name: "Kesehatan Masyarakat" },
      { code: "kesling", name: "Kesehatan Lingkungan" },
      { code: "gizi", name: "Gizi" },
    ],
  },
  {
    table: "16",
    title: "Tabel 16 — Tenaga Kefarmasian, Psikologis Klinis, dan Kesehatan Tradisional",
    metrics: [
      { code: "kefarmasian", name: "Kefarmasian" },
      { code: "psikologis_klinis", name: "Psikologis Klinis" },
      { code: "kesehatan_tradisional", name: "Kesehatan Tradisional" },
    ],
  },
  {
    table: "17",
    title: "Tabel 17 — Tenaga Teknik Biomedika, Keterapian Fisik, dan Keteknisian Medis",
    metrics: [
      { code: "teknik_biomedika", name: "Teknik Biomedika" },
      { code: "keterapian_fisik", name: "Keterapian Fisik" },
      { code: "keteknisian_medis", name: "Keteknisian Medis" },
    ],
  },
  {
    table: "18",
    title: "Tabel 18 — Tenaga Penunjang/Pendukung Kesehatan",
    metrics: [
      { code: "penunjang_upaya_kesehatan", name: "Penunjang Upaya Kesehatan" },
      { code: "penunjang_administrasi", name: "Penunjang Administrasi, Manajemen & TI" },
      { code: "penunjang_sarana", name: "Penunjang Sarana & Prasarana" },
      { code: "penunjang_total", name: "Total Penunjang" },
    ],
  },
];

const CATEGORIES = [
  { value: "all", label: "Semua Fasyankes" },
  { value: "puskesmas", label: "Puskesmas" },
  { value: "rumah_sakit", label: "Rumah Sakit" },
  { value: "fasyankes_lain", label: "Sarana Fasyankes Lainnya" },
];

function formatNumber(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

function FlagBadge({ flag }: { flag: string | null }) {
  if (!flag) return null;
  return (
    <span className="ml-1 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
      ⚠ perlu konfirmasi
    </span>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{title}</h3>
      {subtitle ? (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      ) : null}
      <div className="mt-4 overflow-x-auto">{children}</div>
    </div>
  );
}

export function SdmkSummaryTable({
  data,
  isLoading,
  error,
}: {
  data: SdmkSummaryTableData[];
  isLoading: boolean;
  error: string | null;
}) {
  if (isLoading) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Memuat ringkasan SDMK…</p>;
  }
  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }
  if (data.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada data SDMK untuk tahun ini.</p>;
  }
  return (
    <div className="space-y-6">
      {data.map((table) => (
        <div key={table.table}>
          <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            {table.table} — {table.title}
          </h4>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400">
                <th className="py-2 pr-4 font-medium">Tenaga</th>
                <th className="py-2 pr-4 text-right font-medium">Jumlah (L / P)</th>
                <th className="py-2 pr-4 text-right font-medium">STR</th>
                <th className="py-2 text-right font-medium">Rasio / 1000 penduduk</th>
              </tr>
            </thead>
            <tbody>
              {table.metrics.map((m) => (
                <tr
                  key={m.metricCode}
                  className="border-b border-gray-100 text-gray-700 dark:border-gray-800 dark:text-gray-300"
                >
                  <td className="py-2 pr-4">{m.metricName}</td>
                  <td className="py-2 pr-4 text-right">
                    <span className="font-medium">{formatNumber(m.total)}</span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      L {formatNumber(m.male)} · P {formatNumber(m.female)}
                    </span>
                    <FlagBadge flag={m.jumlahFlag} />
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {formatNumber(m.strTotal)}
                    <FlagBadge flag={m.strFlag} />
                  </td>
                  <td className="py-2 text-right">
                    {m.ratio === null ? "—" : formatNumber(m.ratio)}
                    <FlagBadge flag={m.ratioFlag} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

interface FacilityGroup {
  section: string;
  facilities: string[];
  totalName: string | null;
}

export function SdmkFacilitiesTable({
  rows,
  table,
  isLoading,
  error,
}: {
  rows: SdmkTableRow[];
  table: string;
  isLoading: boolean;
  error: string | null;
}) {
  const def = SDMK_TABLES.find((t) => t.table === table) ?? SDMK_TABLES[0];
  const groups = useMemo<FacilityGroup[]>(() => {
    const seen = new Map<string, FacilityGroup>();
    const order: FacilityGroup[] = [];
    for (const r of rows) {
      if (r.regionType === "total") {
        const key = r.section ?? "";
        if (!seen.has(key)) {
          const g: FacilityGroup = { section: key, facilities: [], totalName: r.regionName };
          seen.set(key, g);
          order.push(g);
        } else if (seen.get(key)!.totalName === null) {
          seen.get(key)!.totalName = r.regionName;
        }
        continue;
      }
      const key = r.section ?? "";
      if (!seen.has(key)) {
        const g: FacilityGroup = { section: key, facilities: [], totalName: null };
        seen.set(key, g);
        order.push(g);
      }
      const g = seen.get(key)!;
      if (!g.facilities.includes(r.regionName)) g.facilities.push(r.regionName);
    }
    return order;
  }, [rows]);

  const cell = (facility: string, metricCode: string) => {
    const row = rows.find(
      (r) => r.regionName === facility && r.metricCode === `T${table}-${metricCode}`,
    );
    if (!row) return <span className="text-gray-400">—</span>;
    const hasSplit = row.male !== null || row.female !== null;
    return (
      <span>
        <span className="font-medium">{formatNumber(row.total)}</span>
        {hasSplit ? (
          <span className="ml-1 block text-xs text-gray-500 dark:text-gray-400">
            L {formatNumber(row.male)} · P {formatNumber(row.female)}
          </span>
        ) : null}
        <FlagBadge flag={row.dataQualityFlag} />
      </span>
    );
  };

  const totalCell = (totalName: string, metricCode: string) => {
    const row = rows.find(
      (r) => r.regionName === totalName && r.metricCode === `T${table}-${metricCode}`,
    );
    if (!row) return <span className="text-gray-400">—</span>;
    return <span className="font-semibold">{formatNumber(row.total)}</span>;
  };

  if (isLoading) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Memuat data fasyankes…</p>;
  }
  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada data fasyankes untuk pilihan ini.</p>;
  }
  return (
    <table className="w-full min-w-[720px] text-left text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <th className="py-2 pr-4 font-medium">Fasyankes</th>
          {def.metrics.map((m) => (
            <th key={m.code} className="py-2 pr-4 text-right font-medium">
              {m.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {groups.map((g) => (
          <Fragment key={g.section}>
            <tr className="bg-gray-50 dark:bg-white/[0.03]">
              <td
                colSpan={def.metrics.length + 1}
                className="py-2 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                {g.section === "SARANA LAINNYA" ? "Sarana Fasyankes Lainnya" : g.section}
              </td>
            </tr>
            {g.facilities.map((facility) => (
              <tr
                key={facility}
                className="border-b border-gray-100 text-gray-700 dark:border-gray-800 dark:text-gray-300"
              >
                <td className="py-2 pr-4">{facility}</td>
                {def.metrics.map((m) => (
                  <td key={m.code} className="py-2 pr-4 text-right">
                    {cell(facility, m.code)}
                  </td>
                ))}
              </tr>
            ))}
            {g.totalName ? (
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white/90">
                <td className="py-2 pr-4 font-semibold">{g.totalName}</td>
                {def.metrics.map((m) => (
                  <td key={m.code} className="py-2 pr-4 text-right">
                    {totalCell(g.totalName!, m.code)}
                  </td>
                ))}
              </tr>
            ) : null}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}

// Chart ringkasan: total tenaga per kategori utama (kabupaten). Diambil dari
// ringkasan yang sama dengan tabel di atas — satu bar per kategori utama,
// tanpa sub-rincian (mis. Dokter Spesialis masuk ke Total Dokter).
const HEADLINE_METRICS: Array<{ suffix: string; label: string }> = [
  { suffix: "dokter_total", label: "Dokter" },
  { suffix: "dokter_gigi_total", label: "Dokter Gigi" },
  { suffix: "keperawatan", label: "Perawat" },
  { suffix: "kebidanan", label: "Bidan" },
  { suffix: "kesmas", label: "Kesmas" },
  { suffix: "kesling", label: "Kesling" },
  { suffix: "gizi", label: "Gizi" },
  { suffix: "kefarmasian", label: "Kefarmasian" },
  { suffix: "teknik_biomedika", label: "Biomedika" },
  { suffix: "keterapian_fisik", label: "Keterapian Fisik" },
  { suffix: "keteknisian_medis", label: "Keteknisian Medis" },
  { suffix: "penunjang_total", label: "Penunjang" },
];

function SdmkHeadlineChart({ data }: { data: SdmkSummaryTableData[] }) {
  const bars = useMemo(() => {
    const all = data.flatMap((t) => t.metrics);
    return HEADLINE_METRICS.map((h) => {
      const found = all.find((m) => m.metricCode.endsWith(`-${h.suffix}`));
      return { label: h.label, total: found?.total ?? null };
    }).filter((b) => b.total !== null);
  }, [data]);

  if (bars.length === 0) return null;

  const options: ApexOptions = {
    chart: { fontFamily: "Outfit, sans-serif", type: "bar", height: 420, toolbar: { show: false } },
    colors: ["#465fff"],
    plotOptions: { bar: { horizontal: true, barHeight: "65%" } },
    dataLabels: { enabled: true },
    xaxis: { categories: bars.map((b) => b.label) },
    tooltip: {
      y: { formatter: (value: number) => `${value.toLocaleString("id-ID")} orang` },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Total Tenaga Kesehatan per Kategori
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Kabupaten Situbondo, 2025 — jumlah (L + P) per kategori utama
      </p>
      <ReactApexChart
        options={options}
        series={[{ name: "Jumlah", data: bars.map((b) => b.total ?? 0) }]}
        type="bar"
        height={420}
      />
    </div>
  );
}

export function SdmkSection() {
  const [summary, setSummary] = useState<SdmkSummaryTableData[]>([]);
  const [summaryIsLoading, setSummaryIsLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState("13");
  const [category, setCategory] = useState("all");
  const [rows, setRows] = useState<SdmkTableRow[]>([]);
  const [rowsIsLoading, setRowsIsLoading] = useState(true);
  const [rowsError, setRowsError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;
    fetchSdmkSummary(controller.signal)
      .then((data) => {
        if (isActive) setSummary(data);
      })
      .catch((error: unknown) => {
        if (isActive && !(error instanceof Error && error.name === "AbortError")) {
          setSummaryError(error instanceof Error ? error.message : "Unable to load SDMK summary.");
        }
      })
      .finally(() => {
        if (isActive) setSummaryIsLoading(false);
      });
    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;
    setRowsIsLoading(true);
    setRowsError(null);
    fetchSdmkTable(selectedTable, category, controller.signal)
      .then((data) => {
        if (isActive) setRows(data);
      })
      .catch((error: unknown) => {
        if (isActive && !(error instanceof Error && error.name === "AbortError")) {
          setRowsError(error instanceof Error ? error.message : "Unable to load SDMK table data.");
        }
      })
      .finally(() => {
        if (isActive) setRowsIsLoading(false);
      });
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [selectedTable, category]);

  const selectedDef = SDMK_TABLES.find((t) => t.table === selectedTable) ?? SDMK_TABLES[0];

  return (
    <div className="col-span-12 space-y-4 md:space-y-6">
      <SectionCard
        title="SDMK — Sumber Daya Manusia Kesehatan"
        subtitle="Jumlah tenaga kesehatan per fasyankes (Tabel 13–18, Profilkes 2025). Nilai yang ditandai ⚠ perlu konfirmasi Dinkes — tampil apa adanya sesuai sumber Excel."
      >
        <SdmkSummaryTable data={summary} isLoading={summaryIsLoading} error={summaryError} />
      </SectionCard>

      {!summaryIsLoading && !summaryError && summary.length > 0 && (
        <SdmkHeadlineChart data={summary} />
      )}

      <SectionCard title="Tenaga Kesehatan per Fasyankes" subtitle={selectedDef.title}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {SDMK_TABLES.map((t) => (
            <button
              key={t.table}
              type="button"
              onClick={() => setSelectedTable(t.table)}
              className={
                t.table === selectedTable
                  ? "rounded-full bg-brand-500 px-3 py-1.5 text-sm font-medium text-white"
                  : "rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300"
              }
            >
              Tabel {t.table}
            </button>
          ))}
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="ml-auto rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            aria-label="Kategori fasyankes"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <SdmkFacilitiesTable
          rows={rows}
          table={selectedTable}
          isLoading={rowsIsLoading}
          error={rowsError}
        />
      </SectionCard>
    </div>
  );
}
