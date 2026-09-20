"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { penukaranPoinApi, authApi } from "@/lib/apiClient";
import Navbar from "@/components/NavbarNasabah";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  Printer,
  Loader2,
  Gift,
  AlertCircle,
  Ticket,
} from "lucide-react";

export default function DetailNotaTukarPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Gagal parse data user dari localStorage", e);
      }
    }

    authApi
      .getMe()
      .then((res) => {
        const freshUser = res?.data || res;
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        }
      })
      .catch((e) => {
        console.error("Gagal memuat data user terbaru:", e);
      });

    const fetchNota = async () => {
      try {
        let nota = null;
        if (penukaranPoinApi.getNota) {
          const res = await penukaranPoinApi.getNota(id as string);
          nota = res?.data || res;
        } else {
          const res = await penukaranPoinApi.getMyPenukaran();
          const daftarPenukaran = Array.isArray(res) ? res : res?.data || [];
          nota = daftarPenukaran.find(
            (item: any) => String(item.id) === String(id) || String(item.kodeNota) === String(id)
          );
        }

        if (!nota) {
          setErrorMsg("Nota penukaran tidak ditemukan.");
          return;
        }

        setData(nota);
      } catch (err: any) {
        setErrorMsg("Gagal memuat nota penukaran poin.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchNota();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F8F7]">
        <div className="flex items-center gap-3 text-[#0B4F45]">
          <Loader2 size={24} className="animate-spin text-[#0A7E76]" />
          <span className="font-medium text-sm">Memuat nota penukaran...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="min-h-screen bg-[#F4F8F7] flex flex-col justify-between">
        <Navbar user={user} />
        <div className="max-w-md mx-auto p-6 bg-white rounded-3xl border border-[#EAF0EE] text-center space-y-4 my-12">
          <AlertCircle size={36} className="mx-auto text-[#B3522F]" />
          <p className="text-xs text-[#6B7C7A]">{errorMsg || "Nota tidak ditemukan"}</p>
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

  return (
    <div className="min-h-screen bg-[#F4F8F7] font-sans flex flex-col justify-between">
      <div>
        <div className="print:hidden">
          <Navbar user={user} />
        </div>

        <div className="max-w-xl mx-auto px-4 pt-6 pb-12 space-y-6">
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
              <Printer size={14} /> Cetak Nota
            </button>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE7E5] shadow-xs space-y-6 relative overflow-hidden print:border-none print:shadow-none print:p-0">
            <div className="text-center pb-5 border-b border-dashed border-[#DCE7E5] space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#D9F1EF] text-[#0B4F45] flex items-center justify-center mx-auto">
                <Gift size={24} />
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-[#0B4F45]">BANK SAMPAH DIGITAL</h2>
                <p className="text-[11px] text-[#6B7C7A]">Nota Bukti Penukaran Poin</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[#6B7C7A] text-[11px]">No. Nota</p>
                <p className="font-mono font-bold text-[#0B4F45]">{data.kodeNota || data.kodePenukaran || data.id}</p>
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
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F8F7] border border-[#EAF0EE] flex items-center justify-between">
              <div>
                <p className="text-[11px] text-[#6B7C7A]">Item Hadiah</p>
                <p className="font-bold text-sm text-[#0B4F45]">{data.hadiah?.namaHadiah || data.namaHadiah || "-"}</p>
                <p className="text-xs text-[#6B7C7A]">Jumlah: {data.jumlah || 1} pcs</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-sm text-[#B3522F]">
                  -{data.totalPoin || data.poinTerpakai || data.poinDibutuhkan || 0} Poin
                </span>
              </div>
            </div>

            {data.kodeVoucher && (
              <div className="p-4 rounded-2xl bg-[#D9F1EF] border border-[#B7DFDA] text-center space-y-1">
                <p className="text-[11px] text-[#0B4F45] font-semibold flex items-center justify-center gap-1">
                  <Ticket size={14} /> Kode Unik Pengambilan / Voucher
                </p>
                <p className="font-mono text-lg font-bold text-[#00B8A9] tracking-wider">{data.kodeVoucher}</p>
              </div>
            )}

            <div className="pt-4 border-t border-dashed border-[#DCE7E5] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0B4F45]">Status Pengambilan</span>
              <span className="font-semibold text-xs text-[#00B8A9] bg-[#D9F1EF] px-3 py-1 rounded-full border border-[#B7DFDA] capitalize">
                {(data.status || "diproses").replace(/_/g, " ")}
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