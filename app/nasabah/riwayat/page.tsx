"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setorSampahApi, penukaranPoinApi } from "@/lib/apiClient";
import Navbar from "@/components/NavbarNasabah";
import Footer from "@/components/Footer";
import {
  History,
  Recycle,
  Gift,
  ArrowLeft,
  Loader2,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";

export default function NasabahRiwayatPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"SETOR" | "TUKAR">("SETOR");
  const [listSetor, setListSetor] = useState<any[]>([]);
  const [listTukar, setListTukar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Gagal parse data user", e);
      }
    }

    const fetchRiwayat = async () => {
      try {
        const [dataSetor, dataTukar] = await Promise.all([
          setorSampahApi.getMySetor().catch(() => []),
          penukaranPoinApi.getMyPenukaran().catch(() => []),
        ]);
        setListSetor(Array.isArray(dataSetor) ? dataSetor : []);
        setListTukar(Array.isArray(dataTukar) ? dataTukar : []);
      } catch (err) {
        console.error("Gagal mengambil riwayat", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRiwayat();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) return "-";
    return parsedDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderBadgeStatus = (status?: string) => {
    const st = (status || "").toUpperCase();
    if (st === "SELESAI") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B4F45] bg-[#D9F1EF] px-2.5 py-1 rounded-full border border-[#B7DFDA]">
          <CheckCircle2 size={12} className="text-[#00B8A9]" /> Selesai
        </span>
      );
    }
    if (st === "DITOLAK" || st === "BATAL") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B3522F] bg-[#FBEAE5] px-2.5 py-1 rounded-full border border-[#F0CFC5]">
          <XCircle size={12} /> {st === "DITOLAK" ? "Ditolak" : "Dibatalkan"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B37B2F] bg-[#FDF6E2] px-2.5 py-1 rounded-full border border-[#F7E7B6]">
        <Clock size={12} /> {st === "DIPROSES" ? "Diproses" : "Menunggu"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F8F7]">
        <div className="flex items-center gap-3 text-[#0B4F45]">
          <Loader2 size={24} className="animate-spin text-[#0A7E76]" />
          <span className="font-medium text-sm">Memuat riwayat transaksi...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8F7] font-sans flex flex-col justify-between">
      <div>
        <Navbar user={user} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#EAF6F4] p-5 rounded-2xl border border-[#B7DFDA] shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#0B4F45] flex items-center justify-center flex-shrink-0 shadow-xs">
                <History size={22} />
              </div>
              <div>
                <h1 className="font-display text-lg font-semibold text-[#0B4F45]">Riwayat Transaksi</h1>
                <p className="text-xs text-[#3E5250]">Pantau status penyetoran sampah dan penukaran poinmu</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/nasabah/dashboard")}
              className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 bg-white text-[#0B4F45] hover:bg-[#F4F8F7] rounded-xl border border-white/60 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <ArrowLeft size={14} /> Kembali
            </button>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl border border-[#EAF0EE]">
            <button
              onClick={() => setActiveTab("SETOR")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "SETOR"
                  ? "bg-[#0B4F45] text-white shadow-xs"
                  : "text-[#6B7C7A] hover:text-[#0B4F45]"
              }`}
            >
              <Recycle size={16} /> Riwayat Setor Sampah
            </button>
            <button
              onClick={() => setActiveTab("TUKAR")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "TUKAR"
                  ? "bg-[#0B4F45] text-white shadow-xs"
                  : "text-[#6B7C7A] hover:text-[#0B4F45]"
              }`}
            >
              <Gift size={16} /> Riwayat Tukar Hadiah
            </button>
          </div>

          {activeTab === "SETOR" && (
            <div className="space-y-3">
              {listSetor.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-[#EAF0EE] text-center space-y-2">
                  <FileText size={36} className="mx-auto text-[#B7C2C0]" />
                  <p className="text-xs text-[#6B7C7A]">Belum ada riwayat penyetoran sampah.</p>
                </div>
              ) : (
                listSetor.map((item, idx) => (
                  <div
                    key={item.id || item._id || idx}
                    onClick={() => router.push(`/nasabah/riwayat/setor/${item.id || item._id}`)}
                    className="bg-white p-5 rounded-2xl border border-[#EAF0EE] hover:border-[#00B8A9] transition-all cursor-pointer flex items-center justify-between shadow-xs group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0B4F45]">
                          {item.kodeTransaksi || item.id || `#SET-${idx + 1}`}
                        </span>
                        {renderBadgeStatus(item.status)}
                      </div>
                      <p className="text-xs text-[#6B7C7A]">
                        Tanggal: {formatDate(item.createdAt || item.tanggal)}
                      </p>
                      {item.catatan && (
                        <p className="text-xs text-[#1F2D2B] line-clamp-1 italic">
                          "{item.catatan}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#00B8A9]">
                          +{item.totalPoin || 0} Poin
                        </p>
                        <p className="text-[11px] text-[#6B7C7A]">
                          {item.totalBeratKg || item.beratKg || 0} Kg
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-[#6B7C7A] group-hover:text-[#0B4F45] transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "TUKAR" && (
            <div className="space-y-3">
              {listTukar.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-[#EAF0EE] text-center space-y-2">
                  <FileText size={36} className="mx-auto text-[#B7C2C0]" />
                  <p className="text-xs text-[#6B7C7A]">Belum ada riwayat penukaran poin.</p>
                </div>
              ) : (
                listTukar.map((item, idx) => (
                  <div
                    key={item.id || item._id || idx}
                    onClick={() => router.push(`/nasabah/riwayat/tukar/${item.id || item._id}`)}
                    className="bg-white p-5 rounded-2xl border border-[#EAF0EE] hover:border-[#00B8A9] transition-all cursor-pointer flex items-center justify-between shadow-xs group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#0B4F45]">
                          {item.hadiah?.namaHadiah || item.namaHadiah || "Penukaran Hadiah"}
                        </span>
                        {renderBadgeStatus(item.status)}
                      </div>
                      <p className="text-xs text-[#6B7C7A]">
                        Tanggal: {formatDate(item.createdAt || item.tanggal)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#B3522F]">
                          -{item.totalPoin || item.poinTerpakai || item.poinDigunakan || item.hadiah?.poinDibutuhkan || item.poinDibutuhkan || 0} Poin
                        </p>
                        <p className="text-[11px] text-[#6B7C7A]">
                          {item.jumlah || item.qty || 1} Pcs
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-[#6B7C7A] group-hover:text-[#0B4F45] transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}