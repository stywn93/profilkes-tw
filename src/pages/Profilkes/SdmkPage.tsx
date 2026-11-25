import PageMeta from "@/components/common/PageMeta";
import { SdmkSection } from "@/components/ecommerce/SdmkBatch2";

// SDMK → Rangkuman Kondisi SDMK: seksi SDMK (Tabel 13-18) apa adanya.
export default function SdmkPage() {
  return (
    <>
      <PageMeta
        title="SDMK | Profil Kesehatan Kabupaten Situbondo 2025"
        description="Sumber Daya Manusia Kesehatan Kabupaten Situbondo 2025 — tenaga medis, keperawatan, kebidanan, kesmas, kesling, gizi, kefarmasian, dan penunjang."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <SdmkSection />
      </div>
    </>
  );
}
