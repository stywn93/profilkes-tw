import PageMeta from "@/components/common/PageMeta";
import { TopDiseasesChart } from "@/components/ecommerce/ProfilkesBatch1";
import {
  fetchTopDiseases,
  type TopDisease,
} from "@/components/ecommerce/profilkesApi";
import { useEffect, useState } from "react";

// Pelayanan Kesehatan → Top 10 Penyakit: 10 penyakit terbanyak rawat jalan (Tabel 8).
export default function TopPenyakitPage() {
  const [topDiseases, setTopDiseases] = useState<TopDisease[]>([]);
  const [topDiseasesTotal, setTopDiseasesTotal] = useState<number | null>(null);
  const [topDiseasesIsLoading, setTopDiseasesIsLoading] = useState(true);
  const [topDiseasesError, setTopDiseasesError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    fetchTopDiseases(controller.signal)
      .then((result) => {
        if (isActive) {
          setTopDiseases(result.data);
          setTopDiseasesTotal(result.totalPatients);
        }
      })
      .catch((error: unknown) => {
        if (isActive && !(error instanceof Error && error.name === "AbortError")) {
          setTopDiseasesError(
            error instanceof Error ? error.message : "Unable to load top diseases data.",
          );
        }
      })
      .finally(() => {
        if (isActive) setTopDiseasesIsLoading(false);
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  return (
    <>
      <PageMeta
        title="Top 10 Penyakit | Profil Kesehatan Kabupaten Situbondo 2025"
        description="10 penyakit terbanyak rawat jalan di rumah sakit Kabupaten Situbondo 2025."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <TopDiseasesChart
            data={topDiseases}
            totalPatients={topDiseasesTotal}
            isLoading={topDiseasesIsLoading}
            error={topDiseasesError}
          />
        </div>
      </div>
    </>
  );
}
