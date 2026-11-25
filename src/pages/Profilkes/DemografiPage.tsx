import PageMeta from "@/components/common/PageMeta";
import { DistrictTable } from "@/components/ecommerce/ProfilkesBatch1";
import {
  fetchEducationData,
  type EducationData,
} from "@/components/ecommerce/literacyEducationApi";
import {
  fetchDistricts,
  type District,
} from "@/components/ecommerce/profilkesApi";
import {
  PopulationGenderPieChart,
  PopulationGenderTable,
} from "@/components/ecommerce/PopulationGenderChart";
import PopulationPyramidChart, {
  PopulationPyramidTable,
} from "@/components/ecommerce/PopulationPyramidChart";
import {
  fetchPopulationAgeGroups,
  type PopulationAgeGroupData,
} from "@/components/ecommerce/populationApi";
import { useEffect, useState } from "react";

// Overview → Demografi Penduduk: piramida penduduk, gender/pendidikan,
// dan penduduk per kecamatan (Tabel 1).
export default function DemografiPage() {
  const [populationData, setPopulationData] = useState<PopulationAgeGroupData[]>([]);
  const [populationIsLoading, setPopulationIsLoading] = useState(true);
  const [populationError, setPopulationError] = useState<string | null>(null);
  const [educationData, setEducationData] = useState<EducationData[]>([]);
  const [educationIsLoading, setEducationIsLoading] = useState(true);
  const [educationError, setEducationError] = useState<string | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtTotal, setDistrictTotal] = useState<District | null>(null);
  const [districtsIsLoading, setDistrictsIsLoading] = useState(true);
  const [districtsError, setDistrictsError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;
    const isAbort = (error: unknown) =>
      !isActive || (error instanceof Error && error.name === "AbortError");
    const failMessage = (error: unknown, fallback: string) =>
      error instanceof Error ? error.message : fallback;

    fetchPopulationAgeGroups(controller.signal)
      .then((data) => {
        if (isActive) setPopulationData(data);
      })
      .catch((error: unknown) => {
        if (!isAbort(error)) setPopulationError(failMessage(error, "Unable to load population data."));
      })
      .finally(() => {
        if (isActive) setPopulationIsLoading(false);
      });

    fetchEducationData(controller.signal)
      .then((data) => {
        if (isActive) setEducationData(data);
      })
      .catch((error: unknown) => {
        if (!isAbort(error)) setEducationError(failMessage(error, "Unable to load education data."));
      })
      .finally(() => {
        if (isActive) setEducationIsLoading(false);
      });

    fetchDistricts(controller.signal)
      .then((result) => {
        if (isActive) {
          setDistricts(result.data);
          setDistrictTotal(result.total);
        }
      })
      .catch((error: unknown) => {
        if (!isAbort(error)) setDistrictsError(failMessage(error, "Unable to load district data."));
      })
      .finally(() => {
        if (isActive) setDistrictsIsLoading(false);
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  return (
    <>
      <PageMeta
        title="Demografi Penduduk | Profil Kesehatan Kabupaten Situbondo 2025"
        description="Demografi penduduk Kabupaten Situbondo 2025 — piramida penduduk, jenis kelamin dan pendidikan, serta penduduk per kecamatan."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
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

        <div className="col-span-12 xl:col-span-6">
          <PopulationPyramidTable
            data={populationData}
            isLoading={populationIsLoading}
            error={populationError}
          />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <PopulationGenderTable
            data={educationData}
            isLoading={educationIsLoading}
            error={educationError}
          />
        </div>

        <div className="col-span-12">
          <DistrictTable
            data={districts}
            total={districtTotal}
            isLoading={districtsIsLoading}
            error={districtsError}
          />
        </div>
      </div>
    </>
  );
}
