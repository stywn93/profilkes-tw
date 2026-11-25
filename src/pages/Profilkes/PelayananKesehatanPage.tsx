import type { ApexOptions } from "apexcharts";
import PageMeta from "@/components/common/PageMeta";
import {
  HospitalPerformanceTable,
  TopDiseasesChart,
} from "@/components/ecommerce/ProfilkesBatch1";
import {
  fetchHospitalPerformance,
  fetchTopDiseases,
  type HospitalPerformance,
  type TopDisease,
} from "@/components/ecommerce/profilkesApi";
import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

// Pelayanan Kesehatan: kinerja RS (Tabel 6+7) + Top 10 penyakit (Tabel 8).
// Sub-route per metrik (BOR/TOI/ALOS/BTO/GDR/NDR) menampilkan halaman yang
// sama dengan kolom metriknya di-highlight + penjelasan singkat + total kabupaten.
export type YankesMetric = "bor" | "toi" | "alos" | "bto" | "gdr" | "ndr";

const METRIC_INFO: Record<
  YankesMetric,
  {
    title: string;
    description: string;
    format: (h: HospitalPerformance) => string;
    value: (h: HospitalPerformance) => number | null;
    unit: string;
  }
> = {
  bor: {
    title: "Bed Occupancy Rate (BOR)",
    description:
      "Persentase tempat tidur rumah sakit yang terisi — menunjukkan tingkat pemanfaatan tempat tidur.",
    format: (h) => `${h.bor !== null ? h.bor.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : "—"}%`,
    value: (h) => h.bor,
    unit: "%",
  },
  toi: {
    title: "Turn Over Interval (TOI)",
    description:
      "Rata-rata hari tempat tidur kosong antara satu pasien keluar dan pasien berikutnya.",
    format: (h) => `${h.toi !== null ? h.toi.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : "—"} hari`,
    value: (h) => h.toi,
    unit: "hari",
  },
  alos: {
    title: "Average Length of Stay (ALOS)",
    description: "Rata-rata lama pasien dirawat di rumah sakit.",
    format: (h) => `${h.alos !== null ? h.alos.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : "—"} hari`,
    value: (h) => h.alos,
    unit: "hari",
  },
  bto: {
    title: "Bed Turn Over (BTO)",
    description:
      "Frekuensi pemakaian satu tempat tidur dalam satu periode — berapa kali tempat tidur dipakai pasien baru.",
    format: (h) => `${h.bto !== null ? h.bto.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : "—"} kali`,
    value: (h) => h.bto,
    unit: "kali",
  },
  gdr: {
    title: "Gross Death Rate (GDR)",
    description: "Angka kematian kasar — jumlah kematian per 1.000 pasien keluar.",
    format: (h) => `${h.gdr.total !== null ? h.gdr.total.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : "—"} per 1.000 pasien keluar`,
    value: (h) => h.gdr.total,
    unit: "per 1.000 pasien keluar",
  },
  ndr: {
    title: "Net Death Rate (NDR)",
    description:
      "Angka kematian murni — jumlah kematian setelah 48 jam perawatan per 1.000 pasien keluar.",
    format: (h) => `${h.ndr.total !== null ? h.ndr.total.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : "—"} per 1.000 pasien keluar`,
    value: (h) => h.ndr.total,
    unit: "per 1.000 pasien keluar",
  },
};

function MetricBarChart({
  metric,
  data,
}: {
  metric: YankesMetric;
  data: HospitalPerformance[];
}) {
  const info = METRIC_INFO[metric];
  const options: ApexOptions = {
    chart: { fontFamily: "Outfit, sans-serif", type: "bar", height: 320, toolbar: { show: false } },
    colors: ["#465fff"],
    plotOptions: { bar: { horizontal: true, barHeight: "70%" } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.map((h) =>
        h.hospital.length > 40 ? `${h.hospital.slice(0, 40)}…` : h.hospital,
      ),
    },
    tooltip: {
      y: {
        formatter: (value: number) =>
          `${value.toLocaleString("id-ID", { maximumFractionDigits: 2 })} ${info.unit}`,
      },
    },
  };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/3">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        {info.title} per Rumah Sakit
      </h3>
      <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
        Tabel 6 + 7, 2025
      </p>
      <ReactApexChart
        options={options}
        series={[{ name: info.title, data: data.map((h) => info.value(h) ?? 0) }]}
        type="bar"
        height={320}
      />
    </div>
  );
}

export default function PelayananKesehatanPage({
  focusMetric = null,
}: {
  focusMetric?: YankesMetric | null;
}) {
  const [hospitals, setHospitals] = useState<HospitalPerformance[]>([]);
  const [hospitalTotal, setHospitalTotal] = useState<HospitalPerformance | null>(null);
  const [hospitalsIsLoading, setHospitalsIsLoading] = useState(true);
  const [hospitalsError, setHospitalsError] = useState<string | null>(null);
  const [topDiseases, setTopDiseases] = useState<TopDisease[]>([]);
  const [topDiseasesTotal, setTopDiseasesTotal] = useState<number | null>(null);
  const [topDiseasesIsLoading, setTopDiseasesIsLoading] = useState(true);
  const [topDiseasesError, setTopDiseasesError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;
    const isAbort = (error: unknown) =>
      !isActive || (error instanceof Error && error.name === "AbortError");
    const failMessage = (error: unknown, fallback: string) =>
      error instanceof Error ? error.message : fallback;

    fetchHospitalPerformance(controller.signal)
      .then((result) => {
        if (isActive) {
          setHospitals(result.data);
          setHospitalTotal(result.total);
        }
      })
      .catch((error: unknown) => {
        if (!isAbort(error)) setHospitalsError(failMessage(error, "Unable to load hospital performance data."));
      })
      .finally(() => {
        if (isActive) setHospitalsIsLoading(false);
      });

    if (focusMetric === null) {
      fetchTopDiseases(controller.signal)
        .then((result) => {
          if (isActive) {
            setTopDiseases(result.data);
            setTopDiseasesTotal(result.totalPatients);
          }
        })
        .catch((error: unknown) => {
          if (!isAbort(error)) setTopDiseasesError(failMessage(error, "Unable to load top diseases data."));
        })
        .finally(() => {
          if (isActive) setTopDiseasesIsLoading(false);
        });
    } else {
      setTopDiseasesIsLoading(false);
    }

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [focusMetric]);

  const metric = focusMetric === null ? null : METRIC_INFO[focusMetric];
  const pageTitle = metric === null ? "Pelayanan Kesehatan" : metric.title;

  return (
    <>
      <PageMeta
        title={`${pageTitle} | Profil Kesehatan Kabupaten Situbondo 2025`}
        description="Pelayanan kesehatan rumah sakit Kabupaten Situbondo 2025 — BOR, TOI, ALOS, BTO, GDR, NDR, dan 10 penyakit terbanyak."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {metric !== null && hospitalTotal !== null && (
          <div className="col-span-12">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {metric.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {metric.description}
              </p>
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                Total Kabupaten Situbondo:{" "}
                <span className="font-semibold text-gray-800 dark:text-white">
                  {metric.format(hospitalTotal)}
                </span>
              </p>
            </div>
          </div>
        )}

        {!hospitalsIsLoading && !hospitalsError && hospitals.length > 0 && (
          <div className="col-span-12">
            <MetricBarChart metric={focusMetric ?? "bor"} data={hospitals} />
          </div>
        )}

        <div className="col-span-12">
          <HospitalPerformanceTable
            data={hospitals}
            total={hospitalTotal}
            isLoading={hospitalsIsLoading}
            error={hospitalsError}
            highlight={focusMetric}
          />
        </div>

        {focusMetric === null && (
          <div className="col-span-12">
            <TopDiseasesChart
              data={topDiseases}
              totalPatients={topDiseasesTotal}
              isLoading={topDiseasesIsLoading}
              error={topDiseasesError}
            />
          </div>
        )}
      </div>
    </>
  );
}
