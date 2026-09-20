"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { setorSampahApi } from "@/lib/apiClient";
import Navbar from "@/components/NavbarNasabah";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  Printer,
  Loader2,
  Recycle,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

export default function DetailStrukSetorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        let detail = null;

        const res = await setorSampahApi.getDetail(id as string);
        detail = res?.data || res;

        if (!detail) {
          setErrorMsg("Data struk penimbangan tidak ditemukan.");
          return;
        }

        setData(detail);
      } catch (err: any) {
        setErrorMsg("Gagal memuat detail struk penimbangan.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F8F7]">
        <div className="flex items-center gap-3 text-[#0B4F45]">
          <Loader2 size={24} className="animate-spin text-[#0A7E76]" />
          <span className="font-medium text-sm">Memuat struk penimbangan...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="min-h-screen bg-[#F4F8F7] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto p-6 bg-white rounded-3xl border border-[#EAF0EE] text-center space-y-4 my-12">
          <AlertCircle size={36} className="mx-auto text-[#B3522F]" />
          <p className="text-xs text-[#6B7C7A]">{errorMsg || "Data tidak ditemukan"}</p>
          <button
            onClick={() => router.push("/nasabah/riwayat")}
            className="px-4 py-2 bg-[#0B4F45] text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Kembali ke Riwayat
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Helper untuk Warna Status
  const renderStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "selesai" || s === "diverifikasi") {
      return (
        <span className="inline-flex items-center gap-1 font-semibold text-xs text-[#00B8A9] bg-[#D9F1EF] px-2.5 py-1 rounded-lg border border-[#B7DFDA]">
          <CheckCircle2 size={12} /> Selesai
        </span>
      );
    }
    if (s === "ditolak") {
      return (
        <span className="inline-flex items-center gap-1 font-semibold text-xs text-[#B3522F] bg-[#FBEAE5] px-2.5 py-1 rounded-lg border border-[#F0CFC5]">
          <XCircle size={12} /> Ditolak
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
        <Clock size={12} /> Menunggu Verifikasi
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F8F7] font-sans flex flex-col justify-between">
      <div>
        <div className="print:hidden">
          <Navbar />
        </div>

        <div className="max-w-xl mx-auto px-4 pt-6 pb-12 space-y-6">
          {/* Action Buttons */}
          <div className="flex items-center justify-between print:hidden">
            <button
              onClick={() => router.push("/nasabah/riwayat")}
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 bg-white text-[#0B4F45] hover:bg-[#EAF0EE] rounded-xl border border-[#DCE7E5] transition-all cursor-pointer"
            >
              <ArrowLeft size={14} /> Kembali
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-[#00B8A9] text-white hover:bg-[#00A395] rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Printer size={14} /> Cetak Struk
            </button>
          </div>

          {/* Struk Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE7E5] shadow-xs space-y-6 relative overflow-hidden print:border-none print:shadow-none print:p-0">
            
            {/* Header Struk */}
            <div className="text-center pb-5 border-b border-dashed border-[#DCE7E5] space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#D9F1EF] text-[#0B4F45] flex items-center justify-center mx-auto">
                <Recycle size={24} />
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-[#0B4F45]">BANK SAMPAH DIGITAL</h2>
                <p className="text-[11px] text-[#6B7C7A]">Struk Bukti Penyetoran Sampah</p>
              </div>
            </div>

            {/* Info Transaksi */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[#6B7C7A] text-[11px]">No. Transaksi</p>
                <p className="font-mono font-bold text-[#0B4F45]">{data.kodeSetor || data.id}</p>
              </div>
              <div className="text-right">
                <p className="text-[#6B7C7A] text-[11px]">Tanggal</p>
                <p className="font-medium text-[#1F2D2B]">
                  {new Date(data.createdAt || data.tanggal).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-[#6B7C7A] text-[11px]">Nama Nasabah</p>
                <p className="font-medium text-[#1F2D2B]">{data.nasabah?.namaNasabah || data.namaNasabah || "-"}</p>
              </div>
              <div className="text-right">
                <p className="text-[#6B7C7A] text-[11px]">Status Struk</p>
                <div className="mt-0.5">{renderStatusBadge(data.status)}</div>
              </div>
            </div>

            {/* Rincian Penimbangan */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#0B4F45]">Rincian Item Sampah</p>
              <div className="bg-[#F4F8F7] rounded-2xl p-4 border border-[#EAF0EE] space-y-3">
                {(data.detailSetors || data.items || []).map((it: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-xs border-b border-[#EAF0EE] last:border-0 pb-2.5 last:pb-0"
                  >
                    <div>
                      <p className="font-semibold text-[#0B4F45]">
                        {it.kategoriSampah?.namaKategori || it.kategori || "Jenis Sampah"}
                      </p>
                      <p className="text-[11px] text-[#6B7C7A]">
                        Berat: {it.beratRealKg || it.beratKg || 0} Kg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#0A7E76]">
                        +{it.subtotalPoin || (it.kategoriSampah?.poinPerKg ? it.kategoriSampah.poinPerKg * (it.beratRealKg || it.beratKg) : 0)} Poin
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Catatan Nasabah / Admin */}
            {data.catatan && (
              <div className="p-3 bg-[#F4F8F7] rounded-xl text-xs text-[#6B7C7A] border border-[#EAF0EE]">
                <span className="font-semibold text-[#0B4F45]">Catatan Setoran:</span> "{data.catatan}"
              </div>
            )}

            {data.catatanAdmin && (
              <div className="p-3 bg-[#D9F1EF]/40 rounded-xl text-xs text-[#0B4F45] border border-[#C5E8E3]">
                <span className="font-semibold">Catatan Admin:</span> "{data.catatanAdmin}"
              </div>
            )}

            {/* Total Poin */}
            <div className="pt-4 border-t border-dashed border-[#DCE7E5] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#0B4F45]">Total Poin Diperoleh</span>
                <p className="text-[10px] text-[#6B7C7A]">
                  *Poin telah ditambahkan ke saldo akun nasabah
                </p>
              </div>
              <span className="font-display text-xl font-bold text-[#00B8A9]">
                +{data.totalPoin || 0} Poin
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}