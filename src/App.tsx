import { Route, BrowserRouter as Router, Routes } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Dashboard/Ecommerce";
import NotFound from "./pages/OtherPage/NotFound";
import ComingSoonPage from "./pages/Profilkes/ComingSoonPage";
import DemografiPage from "./pages/Profilkes/DemografiPage";
import PelayananKesehatanPage from "./pages/Profilkes/PelayananKesehatanPage";
import ResumePage from "./pages/Profilkes/ResumePage";
import SdmkPage from "./pages/Profilkes/SdmkPage";
import TopPenyakitPage from "./pages/Profilkes/TopPenyakitPage";

// Route Profilkes (sidebar.md). Route template TailAdmin (calendar, forms,
// tables, charts, UI elements, auth, profile, blank) dilepas 2026-11-25 —
// file-file halamannya tetap ada di disk, hanya tidak di-route lagi.
export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Overview */}
            <Route path="/demografi" element={<DemografiPage />} />
            <Route path="/resume" element={<ResumePage />} />

            {/* Pelayanan Kesehatan */}
            <Route path="/pelayanan-kesehatan" element={<PelayananKesehatanPage />} />
            <Route path="/pelayanan-kesehatan/bor" element={<PelayananKesehatanPage focusMetric="bor" />} />
            <Route path="/pelayanan-kesehatan/toi" element={<PelayananKesehatanPage focusMetric="toi" />} />
            <Route path="/pelayanan-kesehatan/alos" element={<PelayananKesehatanPage focusMetric="alos" />} />
            <Route path="/pelayanan-kesehatan/bto" element={<PelayananKesehatanPage focusMetric="bto" />} />
            <Route path="/pelayanan-kesehatan/gdr" element={<PelayananKesehatanPage focusMetric="gdr" />} />
            <Route path="/pelayanan-kesehatan/ndr" element={<PelayananKesehatanPage focusMetric="ndr" />} />
            <Route path="/pelayanan-kesehatan/top-10-penyakit" element={<TopPenyakitPage />} />

            {/* SDMK */}
            <Route path="/sdmk" element={<SdmkPage />} />

            {/* KIA — data belum dimigrasi (Batch 3) */}
            <Route path="/kia/aki" element={<ComingSoonPage title="Angka Kematian Ibu (AKI)" description="Kematian ibu hamil, bersalin, dan nifas per kecamatan (Tabel 23-25)." batch="Batch 3 (KIA)" />} />
            <Route path="/kia/k1-k6" element={<ComingSoonPage title="K1 dan K6" description="Cakupan kunjungan ibu hamil K1 dan K6 per kecamatan (Tabel 26)." batch="Batch 3 (KIA)" />} />
            <Route path="/kia/akb" element={<ComingSoonPage title="Angka Kematian Bayi (AKB)" description="Kematian neonatal, bayi, dan balita per kecamatan (Tabel 34-37)." batch="Batch 3 (KIA)" />} />
            <Route path="/kia/bblr" element={<ComingSoonPage title="Berat Bayi Lahir Rendah (BBLR)" description="BBLR dan bayi prematur per kecamatan (Tabel 38)." batch="Batch 3 (KIA)" />} />
            <Route path="/kia/gizi" element={<ComingSoonPage title="Gizi" description="Status gizi balita dan suplementasi gizi (Tabel 28, 46-49)." batch="Batch 3 (KIA)" />} />
            <Route path="/kia/imunisasi" element={<ComingSoonPage title="Imunisasi" description="Imunisasi bayi, baduta, dan anak sekolah (Tabel 27, 41-45, 51)." batch="Batch 3 (KIA)" />} />

            {/* P2P — data belum dimigrasi (Batch 4) */}
            <Route path="/p2p/diare" element={<ComingSoonPage title="Diare" description="Kasus diare per kecamatan (Tabel 59-88, P2P)." batch="Batch 4 (P2P)" />} />
            <Route path="/p2p/kusta" element={<ComingSoonPage title="Kusta" description="Kasus kusta per kecamatan (Tabel 59-88, P2P)." batch="Batch 4 (P2P)" />} />
            <Route path="/p2p/malaria" element={<ComingSoonPage title="Malaria" description="Kasus malaria per kecamatan (Tabel 59-88, P2P)." batch="Batch 4 (P2P)" />} />
            <Route path="/p2p/tbc" element={<ComingSoonPage title="TBC" description="Kasus TBC per kecamatan (Tabel 59-88, P2P)." batch="Batch 4 (P2P)" />} />
            <Route path="/p2p/hiv" element={<ComingSoonPage title="HIV" description="Kasus HIV per kecamatan (Tabel 59-88, P2P)." batch="Batch 4 (P2P)" />} />
            <Route path="/p2p/hipertensi" element={<ComingSoonPage title="Hipertensi" description="Kasus hipertensi per kecamatan (Tabel 59-88, P2P)." batch="Batch 4 (P2P)" />} />

            {/* Kesling — data belum dimigrasi (Batch 5) */}
            <Route path="/kesling/air-minum" element={<ComingSoonPage title="Pengelolaan Air Minum Rumah Tangga" description="Pengelolaan air minum rumah tangga per kecamatan (Tabel 82-88, Kesling)." batch="Batch 5 (Kesling)" />} />
            <Route path="/kesling/stbm" element={<ComingSoonPage title="STBM" description="Sanitasi Total Berbasis Masyarakat per kecamatan (Tabel 82-88, Kesling)." batch="Batch 5 (Kesling)" />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
