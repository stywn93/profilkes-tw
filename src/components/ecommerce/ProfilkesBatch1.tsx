import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import { useState } from "react";
import type {
  District,
  HospitalPerformance,
  PopulationSummary,
  ResumeIndicator,
  TopDisease,
} from "./profilkesApi";

// Batch 1 (2026-11-25): dashboard components for Resume, Tabel 1, 6, 7, 8.
// Flagged values (data_quality_flag) are shown as-is with a warning mark,
// per the user's decision 2026-11-25: show as-is + flag "perlu konfirmasi Dinkes".

function fmt(value: number | null, digits = 0): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function Flag({ flag }: { flag: string | null }) {
  if (!flag) return null;
  return (
    <span
      className="ms-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
      title="Nilai dari sumber Excel meragukan — perlu konfirmasi Dinkes"
    >
      ⚠ perlu konfirmasi
    </span>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/3">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h3>
      <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
        {subtitle}
      </p>
      {children}
    </div>
  );
}

function StateMessage({
  isLoading,
  error,
  hasData,
  loadingText,
}: {
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
  loadingText: string;
}) {
  if (isLoading) {
    return (
      <p className="py-20 text-center text-theme-sm text-gray-500 dark:text-gray-400">
        {loadingText}
      </p>
    );
  }
  if (error) {
    return (
      <p className="py-20 text-center text-theme-sm text-error-500" role="alert">
        {error}
      </p>
    );
  }
  if (!hasData) {
    return (
      <p className="py-20 text-center text-theme-sm text-gray-500 dark:text-gray-400">
        Data tidak tersedia.
      </p>
    );
  }
  return null;
}

export function ProfilkesSummaryCards({
  data,
  isLoading,
  error,
}: {
  data: PopulationSummary | null;
  isLoading: boolean;
  error: string | null;
}) {
  const state = (
    <StateMessage
      isLoading={isLoading}
      error={error}
      hasData={data !== null}
      loadingText="Memuat ringkasan..."
    />
  );
  if (isLoading || error || !data) return <div className="col-span-12">{state}</div>;
  const cards = [
    {
      label: "Jumlah Penduduk",
      value: fmt(data.totalPopulation),
      sub: `L ${fmt(data.male)} · P ${fmt(data.female)} jiwa`,
    },
    {
      label: "Rasio Beban Tanggungan",
      value: fmt(data.dependencyRatio, 2),
      sub: "per 100 penduduk produktif",
    },
    {
      label: "Rasio Jenis Kelamin",
      value: fmt(data.sexRatio, 2),
      sub: "laki-laki per 100 perempuan",
    },
    {
      label: "Melek Huruf 15 Tahun ke Atas",
      value: `${fmt(data.literacy15Plus, 2)}%`,
      sub: `L ${fmt(data.literacyMale, 2)}% · P ${fmt(data.literacyFemale, 2)}%`,
    },
  ];
  return (
    <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3"
        >
          <span className="text-sm text-gray-500 dark:text-gray-400">{c.label}</span>
          <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
            {c.value}
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}

export function DistrictTable({
  data,
  total,
  isLoading,
  error,
}: {
  data: District[];
  total: District | null;
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <Card title="Penduduk per Kecamatan" subtitle="Tabel 1 — Luas wilayah, desa/kelurahan, jumlah penduduk dan kepadatan, 2025">
      <StateMessage isLoading={isLoading} error={error} hasData={data.length > 0} loadingText="Memuat data kecamatan..." />
      {!isLoading && !error && data.length > 0 && (
        <div className="custom-scrollbar mt-5 max-h-90 overflow-auto">
          <table className="w-full min-w-150 text-left text-theme-sm">
            <thead className="sticky top-0 border-b border-gray-100 bg-white text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="pb-3 font-medium">Kecamatan</th>
                <th className="pb-3 text-right font-medium">Luas (km²)</th>
                <th className="pb-3 text-right font-medium">Desa</th>
                <th className="pb-3 text-right font-medium">Kel.</th>
                <th className="pb-3 text-right font-medium">Penduduk</th>
                <th className="pb-3 text-right font-medium">Rumah Tangga</th>
                <th className="pb-3 text-right font-medium">Kepadatan /km²</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.map((d) => (
                <tr key={d.kecamatan} className="text-gray-700 dark:text-gray-300">
                  <td className="py-3 font-medium">{d.kecamatan}</td>
                  <td className="py-3 text-right">{fmt(d.luasKm2, 2)}</td>
                  <td className="py-3 text-right">{fmt(d.desa)}</td>
                  <td className="py-3 text-right">{fmt(d.kelurahan)}</td>
                  <td className="py-3 text-right">{fmt(d.penduduk)}</td>
                  <td className="py-3 text-right">{fmt(d.rumahTangga)}</td>
                  <td className="py-3 text-right">{fmt(d.kepadatan, 2)}</td>
                </tr>
              ))}
              {total && (
                <tr className="font-semibold text-gray-800 dark:text-white">
                  <td className="py-3">Kabupaten Situbondo</td>
                  <td className="py-3 text-right">{fmt(total.luasKm2, 2)}</td>
                  <td className="py-3 text-right">{fmt(total.desa)}</td>
                  <td className="py-3 text-right">{fmt(total.kelurahan)}</td>
                  <td className="py-3 text-right">{fmt(total.penduduk)}</td>
                  <td className="py-3 text-right">{fmt(total.rumahTangga)}</td>
                  <td className="py-3 text-right">{fmt(total.kepadatan, 2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export function HospitalPerformanceTable({
  data,
  total,
  isLoading,
  error,
  highlight = null,
}: {
  data: HospitalPerformance[];
  total: HospitalPerformance | null;
  isLoading: boolean;
  error: string | null;
  // Kolom metrik yang di-highlight (dipakai sub-route yankes BOR/TOI/ALOS/BTO/GDR/NDR).
  highlight?: "bor" | "bto" | "toi" | "alos" | "gdr" | "ndr" | null;
}) {
  const highlightClass = (key: string) =>
    highlight === key ? " bg-brand-50 dark:bg-brand-500/10" : "";
  return (
    <Card title="Kinerja Pelayanan Rumah Sakit" subtitle="Tabel 6 + 7 — GDR/NDR dan BOR/BTO/TOI/ALOS per rumah sakit, 2025">
      <StateMessage isLoading={isLoading} error={error} hasData={data.length > 0} loadingText="Memuat data rumah sakit..." />
      {!isLoading && !error && data.length > 0 && (
        <div className="custom-scrollbar mt-5 max-h-90 overflow-auto">
          <table className="w-full min-w-200 text-left text-theme-sm">
            <thead className="sticky top-0 border-b border-gray-100 bg-white text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="pb-3 font-medium">Rumah Sakit</th>
                <th className="pb-3 text-right font-medium">Tempat Tidur</th>
                <th className="pb-3 text-right font-medium">Pasien Keluar</th>
                <th className={`pb-3 text-right font-medium${highlightClass("bor")}`}>BOR (%)</th>
                <th className={`pb-3 text-right font-medium${highlightClass("bto")}`}>BTO</th>
                <th className={`pb-3 text-right font-medium${highlightClass("toi")}`}>TOI (hari)</th>
                <th className={`pb-3 text-right font-medium${highlightClass("alos")}`}>ALOS (hari)</th>
                <th className={`pb-3 text-right font-medium${highlightClass("gdr")}`}>GDR</th>
                <th className={`pb-3 text-right font-medium${highlightClass("ndr")}`}>NDR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.map((h) => (
                <tr key={h.hospital} className="text-gray-700 dark:text-gray-300">
                  <td className="py-3 font-medium">{h.hospital}</td>
                  <td className="py-3 text-right">{fmt(h.tempatTidur)}</td>
                  <td className="py-3 text-right">{fmt(h.pasienKeluar.total)}</td>
                  <td className={`py-3 text-right${highlightClass("bor")}`}>{fmt(h.bor, 2)}</td>
                  <td className={`py-3 text-right${highlightClass("bto")}`}>{fmt(h.bto, 2)}</td>
                  <td className={`py-3 text-right${highlightClass("toi")}`}>{fmt(h.toi, 2)}</td>
                  <td className={`py-3 text-right${highlightClass("alos")}`}>{fmt(h.alos, 2)}</td>
                  <td className={`py-3 text-right${highlightClass("gdr")}`}>{fmt(h.gdr.total, 2)}</td>
                  <td className={`py-3 text-right${highlightClass("ndr")}`}>{fmt(h.ndr.total, 2)}</td>
                </tr>
              ))}
              {total && (
                <tr className="font-semibold text-gray-800 dark:text-white">
                  <td className="py-3">Total Kabupaten</td>
                  <td className="py-3 text-right">{fmt(total.tempatTidur)}</td>
                  <td className="py-3 text-right">{fmt(total.pasienKeluar.total)}</td>
                  <td className={`py-3 text-right${highlightClass("bor")}`}>{fmt(total.bor, 2)}</td>
                  <td className={`py-3 text-right${highlightClass("bto")}`}>{fmt(total.bto, 2)}</td>
                  <td className={`py-3 text-right${highlightClass("toi")}`}>{fmt(total.toi, 2)}</td>
                  <td className={`py-3 text-right${highlightClass("alos")}`}>{fmt(total.alos, 2)}</td>
                  <td className={`py-3 text-right${highlightClass("gdr")}`}>{fmt(total.gdr.total, 2)}</td>
                  <td className={`py-3 text-right${highlightClass("ndr")}`}>{fmt(total.ndr.total, 2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export function TopDiseasesChart({
  data,
  totalPatients,
  isLoading,
  error,
}: {
  data: TopDisease[];
  totalPatients: number | null;
  isLoading: boolean;
  error: string | null;
}) {
  const options: ApexOptions = {
    chart: { fontFamily: "Outfit, sans-serif", type: "bar", height: 360, toolbar: { show: false } },
    colors: ["#465fff"],
    plotOptions: { bar: { horizontal: true, barHeight: "70%" } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.map((d) =>
        d.disease.length > 45 ? `${d.disease.slice(0, 45)}…` : d.disease,
      ),
    },
    tooltip: {
      y: { formatter: (value: number) => `${value.toLocaleString("id-ID")} pasien baru` },
    },
  };
  return (
    <Card
      title="10 Penyakit Terbanyak — Rawat Jalan"
      subtitle={`Tabel 8 — Pasien baru di rumah sakit, 2025${totalPatients !== null ? ` · Total ${fmt(totalPatients)} pasien` : ""}`}
    >
      <StateMessage isLoading={isLoading} error={error} hasData={data.length > 0} loadingText="Memuat data penyakit..." />
      {!isLoading && !error && data.length > 0 && (
        <>
          <ReactApexChart
            options={options}
            series={[{ name: "Pasien baru", data: data.map((d) => d.total ?? 0) }]}
            type="bar"
            height={360}
          />
          <div className="custom-scrollbar mt-2 max-h-60 overflow-auto">
            <table className="w-full text-left text-theme-sm">
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.map((d) => (
                  <tr key={d.rank} className="text-gray-700 dark:text-gray-300">
                    <td className="py-2 font-medium">{d.rank}. {d.disease}</td>
                    <td className="py-2 text-right text-gray-500">{d.icd ?? ""}</td>
                    <td className="py-2 text-right font-medium">{fmt(d.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}

const SECTION_LABELS: Record<string, string> = {
  I: "I — Gambaran Umum",
  II: "II — Sarana Kesehatan",
  III: "III — SDMK",
  IV: "IV — Pembiayaan Kesehatan",
  V: "V — Kesehatan Keluarga",
  VI: "VI — Pengendalian Penyakit",
  VII: "VII — Kesehatan Lingkungan",
};

export function ResumeIndicatorsTable({
  data,
  isLoading,
  error,
}: {
  data: ResumeIndicator[];
  isLoading: boolean;
  error: string | null;
}) {
  const [section, setSection] = useState<string>("all");
  const filtered = section === "all" ? data : data.filter((r) => r.section === section);
  return (
    <Card title="Resume Profil Kesehatan" subtitle="150 indikator Resume, Kabupaten Situbondo 2025 — pilih seksi untuk memfilter">
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSection("all")}
          className={`rounded-full border px-3 py-1 text-sm ${section === "all" ? "border-brand-500 bg-brand-500 text-white" : "border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300"}`}
        >
          Semua seksi
        </button>
        {Object.entries(SECTION_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            className={`rounded-full border px-3 py-1 text-sm ${section === key ? "border-brand-500 bg-brand-500 text-white" : "border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <StateMessage isLoading={isLoading} error={error} hasData={filtered.length > 0} loadingText="Memuat indikator Resume..." />
      {!isLoading && !error && filtered.length > 0 && (
        <div className="custom-scrollbar mt-5 max-h-120 overflow-auto">
          <table className="w-full min-w-150 text-left text-theme-sm">
            <thead className="sticky top-0 border-b border-gray-100 bg-white text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="pb-3 font-medium">No</th>
                <th className="pb-3 font-medium">Indikator</th>
                <th className="pb-3 text-right font-medium">L</th>
                <th className="pb-3 text-right font-medium">P</th>
                <th className="pb-3 text-right font-medium">L + P</th>
                <th className="pb-3 text-right font-medium">Satuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((r) => (
                <tr key={r.metricCode} className="text-gray-700 dark:text-gray-300">
                  <td className="py-3">{r.metricCode.replace("R-", "")}</td>
                  <td className="py-3 font-medium">
                    {r.metricName}
                    <Flag flag={r.dataQualityFlag} />
                  </td>
                  <td className="py-3 text-right">{r.male === null ? "—" : fmt(r.male, r.unit === "%" ? 2 : 0)}</td>
                  <td className="py-3 text-right">{r.female === null ? "—" : fmt(r.female, r.unit === "%" ? 2 : 0)}</td>
                  <td className="py-3 text-right">{r.total === null ? "—" : fmt(r.total, r.unit === "%" ? 2 : 0)}</td>
                  <td className="py-3 text-right">{r.unit ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
