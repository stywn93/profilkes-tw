import PageMeta from "@/components/common/PageMeta";

// Halaman placeholder untuk menu yang datanya belum dimigrasi (KIA Batch 3,
// P2P Batch 4, Kesling Batch 5). Menunya tetap tampil supaya struktur sidebar
// lengkap, tapi halamannya jujur: belum ada data.
export default function ComingSoonPage({
  title,
  description,
  batch,
}: {
  title: string;
  description: string;
  batch: string;
}) {
  return (
    <>
      <PageMeta
        title={`${title} | Profil Kesehatan Kabupaten Situbondo 2025`}
        description={description}
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] sm:p-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {title}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
            <p className="mt-4 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              Data belum dimigrasi — {batch}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
