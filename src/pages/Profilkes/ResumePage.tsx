import type { ApexOptions } from "apexcharts";
import PageMeta from "@/components/common/PageMeta";
import { ResumeIndicatorsTable } from "@/components/ecommerce/ProfilkesBatch1";
import {
  fetchResumeIndicators,
  type ResumeIndicator,
} from "@/components/ecommerce/profilkesApi";
import { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";

const SECTION_LABELS: Record<string, string> = {
  I: "I — Gambaran Umum",
  II: "II — Sarana Kesehatan",
  III: "III — SDMK",
  IV: "IV — Pembiayaan Kesehatan",
  V: "V — Kesehatan Keluarga",
  VI: "VI — Pengendalian Penyakit",
  VII: "VII — Kesehatan Lingkungan",
};

// Overview → Resume Indikator: 150 indikator Resume, Kabupaten Situbondo 2025.
export default function ResumePage() {
  const [resumeData, setResumeData] = useState<ResumeIndicator[]>([]);
  const [resumeIsLoading, setResumeIsLoading] = useState(true);
  const [resumeError, setResumeError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    fetchResumeIndicators(controller.signal)
      .then((data) => {
        if (isActive) setResumeData(data);
      })
      .catch((error: unknown) => {
        if (isActive && !(error instanceof Error && error.name === "AbortError")) {
          setResumeError(
            error instanceof Error ? error.message : "Unable to load resume indicators.",
          );
        }
      })
      .finally(() => {
        if (isActive) setResumeIsLoading(false);
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  const indicatorsPerSection = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of resumeData) {
      if (r.section === null) continue;
      counts.set(r.section, (counts.get(r.section) ?? 0) + 1);
    }
    return Object.keys(SECTION_LABELS).map((key) => ({
      label: SECTION_LABELS[key],
      count: counts.get(key) ?? 0,
    }));
  }, [resumeData]);

  const chartOptions: ApexOptions = {
    chart: { fontFamily: "Outfit, sans-serif", type: "bar", height: 320, toolbar: { show: false } },
    colors: ["#465fff"],
    plotOptions: { bar: { horizontal: true, barHeight: "65%" } },
    dataLabels: { enabled: true },
    xaxis: { categories: indicatorsPerSection.map((s) => s.label) },
    tooltip: {
      y: { formatter: (value: number) => `${value.toLocaleString("id-ID")} indikator` },
    },
  };

  return (
    <>
      <PageMeta
        title="Resume Indikator | Profil Kesehatan Kabupaten Situbondo 2025"
        description="Resume Profil Kesehatan Kabupaten Situbondo 2025 — 150 indikator, seksi I sampai VII."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {!resumeIsLoading && !resumeError && resumeData.length > 0 && (
          <div className="col-span-12">
            <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Jumlah Indikator per Seksi
              </h3>
              <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
                Resume Profil Kesehatan 2025 — {resumeData.length} indikator,
                seksi I sampai VII
              </p>
              <ReactApexChart
                options={chartOptions}
                series={[{ name: "Indikator", data: indicatorsPerSection.map((s) => s.count) }]}
                type="bar"
                height={320}
              />
            </div>
          </div>
        )}

        <div className="col-span-12">
          <ResumeIndicatorsTable
            data={resumeData}
            isLoading={resumeIsLoading}
            error={resumeError}
          />
        </div>
      </div>
    </>
  );
}
