import PageMeta from "@/components/common/PageMeta";
import { ProfilkesSummaryCards } from "@/components/ecommerce/ProfilkesBatch1";
import {
  fetchPopulationSummary,
  type PopulationSummary,
} from "@/components/ecommerce/profilkesApi";
import {
  fetchEducationData,
  type EducationData,
} from "@/components/ecommerce/literacyEducationApi";
import { PopulationGenderPieChart } from "@/components/ecommerce/PopulationGenderChart";
import PopulationPyramidChart from "@/components/ecommerce/PopulationPyramidChart";
import {
  fetchPopulationAgeGroups,
  type PopulationAgeGroupData,
} from "@/components/ecommerce/populationApi";
import { useEffect, useState } from "react";

// Dashboard Profil Kesehatan Kabupaten Situbondo 2025 — ringkas saja:
// kartu ringkasan + piramida penduduk + gender. Detail per seksi pindah ke
// halaman masing-masing (lihat src/pages/Profilkes/): Demografi, Resume,
// Pelayanan Kesehatan, SDMK, KIA, P2P, Kesling.
export default function Ecommerce() {
  const [populationData, setPopulationData] = useState<PopulationAgeGroupData[]>([]);
  const [populationIsLoading, setPopulationIsLoading] = useState(true);
  const [populationError, setPopulationError] = useState<string | null>(null);
  const [educationData, setEducationData] = useState<EducationData[]>([]);
  const [educationIsLoading, setEducationIsLoading] = useState(true);
  const [educationError, setEducationError] = useState<string | null>(null);

  const [summary, setSummary] = useState<PopulationSummary | null>(null);
  const [summaryIsLoading, setSummaryIsLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    fetchPopulationAgeGroups(controller.signal)
      .then((data) => {
        if (isActive) {
          setPopulationData(data);
          setPopulationError(null);
        }
      })
      .catch((error: unknown) => {
        if (!isActive || (error instanceof Error && error.name === "AbortError")) {
          return;
        }
        setPopulationError(
          error instanceof Error
            ? error.message
            : "Unable to load population data.",
        );
      })
      .finally(() => {
        if (isActive) {
          setPopulationIsLoading(false);
        }
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    fetchEducationData(controller.signal)
      .then((data) => {
        if (isActive) {
          setEducationData(data);
          setEducationError(null);
        }
      })
      .catch((error: unknown) => {
        if (!isActive || (error instanceof Error && error.name === "AbortError")) {
          return;
        }
        setEducationError(
          error instanceof Error
            ? error.message
            : "Unable to load education data.",
        );
      })
      .finally(() => {
        if (isActive) {
          setEducationIsLoading(false);
        }
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;
    const isAbort = (error: unknown) =>
      !isActive || (error instanceof Error && error.name === "AbortError");
    const failMessage = (error: unknown, fallback: string) =>
      error instanceof Error ? error.message : fallback;

    fetchPopulationSummary(controller.signal)
      .then((data) => {
        if (isActive) setSummary(data);
      })
      .catch((error: unknown) => {
        if (!isAbort(error)) setSummaryError(failMessage(error, "Unable to load population summary."));
      })
      .finally(() => {
        if (isActive) setSummaryIsLoading(false);
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  return (
    <>
      <PageMeta
        title="Profil Kesehatan Kabupaten Situbondo 2025 | Dashboard"
        description="Dashboard Profil Kesehatan Kabupaten Situbondo 2025 — ringkasan penduduk, piramida penduduk, dan jenis kelamin."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <ProfilkesSummaryCards data={summary} isLoading={summaryIsLoading} error={summaryError} />

        <div className="col-span-12 xl:col-span-8">
          <PopulationPyramidChart
            data={populationData}
            isLoading={populationIsLoading}
            error={populationError}
          />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <PopulationGenderPieChart
            data={educationData}
            isLoading={educationIsLoading}
            error={educationError}
          />
        </div>
      </div>
    </>
  );
}
